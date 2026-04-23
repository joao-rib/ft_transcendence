import crypto from "node:crypto";
import { trimText } from "./utils.mjs";

const RECENT_MESSAGE_LIMIT = 50;

/**
 * Registers the public realtime chat namespace.
 *
 * This handler:
 * 1. Tracks connected users and recent messages.
 * 2. Supports username changes and chat delivery acknowledgements.
 * 3. Keeps the in-memory message list bounded.
 */
export function registerRealtimeChat(io) {
  const recentMessages = [];
  let connectedUsers = 0;

  // Keep only the most recent messages in memory.
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

    // Broadcast current presence and notify other clients about the join.
    io.emit("presence", { connectedUsers });
    socket.broadcast.emit("peer-joined", {
      username: socket.data.username,
      connectedUsers,
    });

    socket.on("set-name", (payload) => {
      // Normalize the requested name before applying it.
      const parsedName = trimText(payload?.username, 24);

      if (!parsedName || parsedName === socket.data.username) {
        return;
      }

      const previousName = socket.data.username;
      socket.data.username = parsedName;

      // Broadcast the name change to every connected client.
      io.emit("name-updated", {
        previousName,
        currentName: parsedName,
      });
    });

    socket.on("chat-message", (payload, acknowledge) => {
      // Validate the text before creating and broadcasting the message.
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

      // Let the sender know the message was accepted.
      if (typeof acknowledge === "function") {
        acknowledge({ ok: true });
      }
    });

    socket.on("disconnect", () => {
      // Update presence counters when a socket leaves.
      connectedUsers = Math.max(0, connectedUsers - 1);
      io.emit("presence", { connectedUsers });
      io.emit("peer-left", {
        username: socket.data.username,
        connectedUsers,
      });
    });
  });
}
