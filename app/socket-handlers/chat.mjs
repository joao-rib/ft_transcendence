import crypto from "node:crypto";
import { trimText } from "./utils.mjs";

const RECENT_MESSAGE_LIMIT = 50;

export function registerRealtimeChat(io) {
  const recentMessages = [];
  let connectedUsers = 0;

  const pushRecentMessage = (message) => {
    recentMessages.push(message);

    if (recentMessages.length > RECENT_MESSAGE_LIMIT) {
      recentMessages.shift();
    }
  };

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

    socket.on("disconnect", () => {
      connectedUsers = Math.max(0, connectedUsers - 1);
      io.emit("presence", { connectedUsers });
      io.emit("peer-left", {
        username: socket.data.username,
        connectedUsers,
      });
    });
  });
}
