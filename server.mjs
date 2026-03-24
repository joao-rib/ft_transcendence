import http from "node:http";
import crypto from "node:crypto";
import next from "next";
import { Server } from "socket.io";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

const RECENT_MESSAGE_LIMIT = 50;
const recentMessages = [];

// Normalizes client-provided text by type-checking, trimming, and length-limiting.
const trimText = (value, maxLength = 500) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

// Stores a message in rolling history and evicts the oldest item past the limit.
const pushRecentMessage = (message) => {
  recentMessages.push(message);

  if (recentMessages.length > RECENT_MESSAGE_LIMIT) {
    recentMessages.shift();
  }
};

// Boots Next.js + Socket.IO server and wires realtime chat events.
app
  .prepare()
  .then(() => {
    const httpServer = http.createServer((req, res) => handle(req, res));

    const io = new Server(httpServer, {
      transports: ["websocket", "polling"],
      cors: {
        origin: true,
        credentials: true,
      },
    });

    let connectedUsers = 0;

    // Handles lifecycle and chat events for each connected socket.
    io.on("connection", (socket) => {
      connectedUsers += 1;
      socket.data.username = `player-${socket.id.slice(0, 6)}`;

      socket.emit("sync-state", {
        connectedUsers,
        recentMessages,
      });

      io.emit("presence", { connectedUsers });
      socket.broadcast.emit("peer-joined", {
        username: socket.data.username,
        connectedUsers,
      });

      // Updates the socket display name if the client submits a valid new one.
      socket.on("set-name", (payload) => {
        const parsedName = trimText(payload?.username, 24);

        if (!parsedName || parsedName === socket.data.username) {
          return;
        }

        const previousName = socket.data.username;
        socket.data.username = parsedName;

        io.emit("name-updated", {
          previousName,
          currentName: parsedName,
        });
      });

      // Validates incoming text, broadcasts it, and replies with an ack status.
      socket.on("chat-message", (payload, acknowledge) => {
        const text = trimText(payload?.text, 500);

        if (!text) {
          if (typeof acknowledge === "function") {
            acknowledge({ ok: false, error: "Empty message." });
          }

          return;
        }

        const message = {
          id: crypto.randomUUID(),
          username: socket.data.username,
          text,
          sentAt: new Date().toISOString(),
        };

        pushRecentMessage(message);
        io.emit("chat-message", message);

        if (typeof acknowledge === "function") {
          acknowledge({ ok: true });
        }
      });

      // Decrements presence count and notifies peers when a socket disconnects.
      socket.on("disconnect", () => {
        connectedUsers = Math.max(0, connectedUsers - 1);
        io.emit("presence", { connectedUsers });
        io.emit("peer-left", {
          username: socket.data.username,
          connectedUsers,
        });
      });
    });

    // Closes socket and HTTP servers gracefully during process termination.
    const gracefulShutdown = () => {
      io.close(() => {
        httpServer.close(() => process.exit(0));
      });

      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);

    // Starts the internal HTTPS server (TLS is terminated by Nginx at :443).
    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`> Internal app server ready on https://0.0.0.0:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
