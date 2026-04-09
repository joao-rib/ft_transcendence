import http from "node:http";
import next from "next";
import { Server } from "socket.io";
import { registerRealtimeChat } from "./socket-handlers/chat.mjs";
import { registerChessNamespace } from "./socket-handlers/chess.mjs";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

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
    registerRealtimeChat(io);
    registerChessNamespace(io);

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
