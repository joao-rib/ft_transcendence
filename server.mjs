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

    // Chess Game Namespace
    const chessGames = new Map(); // Stores active games by gameId

    const chessNamespace = io.of("/chess");

    // Initialize a new chess game
    const initializeGame = (gameId, player1, player2) => {
      const game = {
        gameId,
        status: "playing", // "waiting" | "playing" | "finished"
        whitePlayer: player1,
        blackPlayer: player2,
        currentTurn: "white",
        moves: [],
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Initial FEN
        createdAt: new Date(),
        messages: [],
      };
      chessGames.set(gameId, game);
      return game;
    };

    // Get or create game room
    const getOrCreateGame = (gameId, username) => {
      if (chessGames.has(gameId)) {
        return chessGames.get(gameId);
      }
      // Create new game if it doesn't exist
      return initializeGame(gameId, username, `waiting-opponent`);
    };

    chessNamespace.on("connection", (socket) => {
      const gameId = socket.handshake.query.gameId;
      const username = socket.handshake.query.username || `player-${socket.id.slice(0, 6)}`;

      socket.data.username = username;
      socket.data.gameId = gameId;

      socket.on("join-game", (payload) => {
        const game = getOrCreateGame(gameId, username);
        
        // Update game if this is the second player
        if (game.blackPlayer === "waiting-opponent") {
          game.blackPlayer = username;
          game.status = "playing";
        }

        socket.join(gameId);

        // Get list of players in this game
        const players = chessNamespace.adapter.rooms.get(gameId)
          ? Array.from(chessNamespace.adapter.rooms.get(gameId))
          : [];

        // Notify all clients in the game
        chessNamespace.to(gameId).emit("game-state", game);
        chessNamespace.to(gameId).emit("player-joined", {
          username,
          players: [game.whitePlayer, game.blackPlayer].filter(p => p !== "waiting-opponent"),
        });
      });

      // Handle chess moves
      socket.on("make-move", (payload, acknowledge) => {
        const { from, to } = payload;
        const game = chessGames.get(gameId);

        if (!game) {
          if (typeof acknowledge === "function") {
            acknowledge({ ok: false, error: "Game not found" });
          }
          return;
        }

        // Basic validation: check if it's the player's turn
        const isWhiteTurn = game.currentTurn === "white";
        const isPlayerWhite = game.whitePlayer === username;

        if (isWhiteTurn !== isPlayerWhite) {
          if (typeof acknowledge === "function") {
            acknowledge({ ok: false, error: "Not your turn" });
          }
          return;
        }

        // In a real implementation, you'd validate the move with chess.js
        // For now, we'll accept it as valid
        const move = {
          from,
          to,
          timestamp: new Date().toISOString(),
        };

        game.moves.push(move);
        game.currentTurn = isWhiteTurn ? "black" : "white";

        // Broadcast the move to all players in the game
        chessNamespace.to(gameId).emit("move-executed", move);

        if (typeof acknowledge === "function") {
          acknowledge({ ok: true });
        }
      });

      // Handle in-game chat
      socket.on("game-chat-message", (payload, acknowledge) => {
        const text = trimText(payload?.text, 200);
        const game = chessGames.get(gameId);

        if (!game) {
          if (typeof acknowledge === "function") {
            acknowledge({ ok: false, error: "Game not found" });
          }
          return;
        }

        if (!text) {
          if (typeof acknowledge === "function") {
            acknowledge({ ok: false, error: "Empty message" });
          }
          return;
        }

        const message = {
          id: crypto.randomUUID(),
          gameId,
          username,
          text,
          sentAt: new Date().toISOString(),
        };

        game.messages.push(message);
        chessNamespace.to(gameId).emit("game-chat-message", message);

        if (typeof acknowledge === "function") {
          acknowledge({ ok: true });
        }
      });

      // Handle resign
      socket.on("resign-game", (payload) => {
        const game = chessGames.get(gameId);

        if (!game) return;

        const winner = game.whitePlayer === username ? game.blackPlayer : game.whitePlayer;
        game.status = "finished";

        chessNamespace.to(gameId).emit("game-finished", {
          winner,
          reason: `${username} resigned`,
        });
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        const game = chessGames.get(gameId);
        const players = chessNamespace.adapter.rooms.get(gameId)
          ? Array.from(chessNamespace.adapter.rooms.get(gameId))
          : [];

        if (game) {
          chessNamespace.to(gameId).emit("player-left", {
            username,
            players: players.map(socketId => {
              const sock = chessNamespace.sockets.get(socketId);
              return sock?.data.username || "unknown";
            }),
          });
        }
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
