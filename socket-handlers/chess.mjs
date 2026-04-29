import crypto from "node:crypto";
import { trimText } from "./utils.mjs";

const CHESS_NAMESPACE = "/chess";
const MATCHMAKING_NAMESPACE = "/matchmaking";
const WHITE_WIN_STATUS = "White wins";
const BLACK_WIN_STATUS = "Black wins";
const DRAW_STATUSES = new Set([
  "Game draws due to stalemate",
  "Game draws due to insufficient material",
]);
const SCORE_DELTA = 7;
const CHAT_MESSAGE_LIMIT = 50;
const DISCONNECT_FORFEIT_TIMEOUT_MS = 60_000;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: adapter });

const chessGames = new Map();
const waitingPlayers = [];
const activeGameSessionsByUsername = new Map();
const disconnectForfeitTimersByToken = new Map();

const createInitialBoardState = () => ({
  position: [[["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"], ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"], ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"]]],
  turn: "w",
  candidateMoves: [],
  movesList: [],
  promotionSquare: null,
  status: "Ongoing",
  castleDirection: {
    w: "both",
    b: "both",
  },
});

const sanitizeUsername = (rawUsername, fallbackValue) => {
  if (typeof rawUsername !== "string") {
    return fallbackValue;
  }

  const normalizedUsername = rawUsername.trim().slice(0, 24);
  return normalizedUsername || fallbackValue;
};

const serializeGame = (game) => ({
  gameId: game.gameId,
  whitePlayer: game.whitePlayer.name,
  blackPlayer: game.blackPlayer.name,
  boardState: game.boardState,
});

const serializeGameForPlayer = (game, playerColor) => ({
  ...serializeGame(game),
  playerColor,
});

const isFinishedStatus = (status) => {
  return status === WHITE_WIN_STATUS || status === BLACK_WIN_STATUS || DRAW_STATUSES.has(status);
};

const clearDisconnectForfeitTimer = (playerToken) => {
  if (!playerToken) {
    return;
  }

  const existingTimer = disconnectForfeitTimersByToken.get(playerToken);
  if (existingTimer) {
    clearTimeout(existingTimer);
    disconnectForfeitTimersByToken.delete(playerToken);
  }
};

const buildActiveSession = (game, color) => {
  const player = color === "w" ? game.whitePlayer : game.blackPlayer;

  return {
    gameId: game.gameId,
    playerId: player.id || player.token,
    playerToken: player.token,
    username: player.name,
  };
};

const syncActiveGameSessions = (game) => {
  if (!game) {
    return;
  }

  if (isFinishedStatus(game.boardState?.status)) {
    activeGameSessionsByUsername.delete(game.whitePlayer.name);
    activeGameSessionsByUsername.delete(game.blackPlayer.name);
    clearDisconnectForfeitTimer(game.whitePlayer.token);
    clearDisconnectForfeitTimer(game.blackPlayer.token);
    return;
  }

  activeGameSessionsByUsername.set(game.whitePlayer.name, buildActiveSession(game, "w"));
  activeGameSessionsByUsername.set(game.blackPlayer.name, buildActiveSession(game, "b"));
};

const createGame = ({ gameId, whitePlayer, blackPlayer }) => {
  const game = {
    gameId,
    whitePlayer: {
      ...whitePlayer,
      // Use token as stable identifier, not socket id
      id: whitePlayer.token,
    },
    blackPlayer: {
      ...blackPlayer,
      // Use token as stable identifier, not socket id
      id: blackPlayer.token,
    },
    boardState: createInitialBoardState(),
    chatMessages: [],
    resultPersisted: false,
    createdAt: new Date().toISOString(),
  };

  chessGames.set(gameId, game);
  syncActiveGameSessions(game);
  return game;
};

const removeWaitingPlayer = (socketId) => {
  const waitingPlayerIndex = waitingPlayers.findIndex((entry) => entry.socketId === socketId);

  if (waitingPlayerIndex >= 0) {
    waitingPlayers.splice(waitingPlayerIndex, 1);
  }
};

const resolvePlayerFromGame = (game, playerId, playerToken) => {
  if (!game || !playerId || !playerToken) {
    return null;
  }

  // Use playerToken as the stable identifier
  if (game.whitePlayer.token === playerToken) {
    return { color: "w", player: game.whitePlayer };
  }

  if (game.blackPlayer.token === playerToken) {
    return { color: "b", player: game.blackPlayer };
  }

  return null;
};

const calculateLoserRating = (currentRating) => {
  return Math.max(0, currentRating - SCORE_DELTA);
};

const pushGameChatMessage = (game, message) => {
  game.chatMessages.push(message);

  if (game.chatMessages.length > CHAT_MESSAGE_LIMIT) {
    game.chatMessages.shift();
  }
};

const getConnectedPlayersInGame = (chessNamespace, gameRoomId) => {
  const room = chessNamespace.adapter.rooms.get(gameRoomId);
  return Math.min(2, room ? room.size : 0);
};

const persistGameResult = async (game) => {
  if (!game || game.resultPersisted) {
    return;
  }

  const status = game.boardState?.status;
  if (!isFinishedStatus(status)) {
    return;
  }

  if (DRAW_STATUSES.has(status)) {
    game.resultPersisted = true;
    return;
  }

  const winnerUsername = status === WHITE_WIN_STATUS ? game.whitePlayer.name : game.blackPlayer.name;
  const loserUsername = status === WHITE_WIN_STATUS ? game.blackPlayer.name : game.whitePlayer.name;

  try {
    await prisma.$transaction(async (tx) => {
      const accounts = await tx.account.findMany({
        where: {
          username: { in: [winnerUsername, loserUsername] },
        },
        select: {
          id: true,
          username: true,
          score: {
            select: {
              rating: true,
              wins: true,
              losses: true,
            },
          },
        },
      });

      const winner = accounts.find((account) => account.username === winnerUsername);
      const loser = accounts.find((account) => account.username === loserUsername);

      if (!winner || !loser) {
        throw new Error("Winner or loser account not found while persisting game result.");
      }

      const winnerRating = (winner.score?.rating ?? 0) + SCORE_DELTA;
      const winnerWins = (winner.score?.wins ?? 0) + 1;
      const winnerLosses = winner.score?.losses ?? 0;

      const loserRating = calculateLoserRating(loser.score?.rating ?? 0);
      const loserWins = loser.score?.wins ?? 0;
      const loserLosses = (loser.score?.losses ?? 0) + 1;

      await tx.score.upsert({
        where: { accountId: winner.id },
        create: {
          accountId: winner.id,
          rating: winnerRating,
          wins: winnerWins,
          losses: winnerLosses,
        },
        update: {
          rating: winnerRating,
          wins: winnerWins,
          losses: winnerLosses,
        },
      });

      await tx.score.upsert({
        where: { accountId: loser.id },
        create: {
          accountId: loser.id,
          rating: loserRating,
          wins: loserWins,
          losses: loserLosses,
        },
        update: {
          rating: loserRating,
          wins: loserWins,
          losses: loserLosses,
        },
      });
    });

    game.resultPersisted = true;
  } catch (error) {
    console.error("[Chess] Failed to persist game result:", error);
  }
};

const popWaitingOpponent = (matchmakingNamespace) => {
  while (waitingPlayers.length > 0) {
    const candidate = waitingPlayers.shift();

    if (!candidate) {
      return null;
    }

    if (activeGameSessionsByUsername.has(candidate.username)) {
      continue;
    }

    const opponentSocket = matchmakingNamespace.sockets.get(candidate.socketId);
    if (!opponentSocket?.connected) {
      continue;
    }

    return candidate;
  }

  return null;
};

const startDisconnectForfeitTimer = ({ chessNamespace, game, disconnectedColor }) => {
  if (!game || !disconnectedColor || isFinishedStatus(game.boardState?.status)) {
    return;
  }

  const disconnectedPlayer = disconnectedColor === "w" ? game.whitePlayer : game.blackPlayer;
  const winnerStatus = disconnectedColor === "w" ? BLACK_WIN_STATUS : WHITE_WIN_STATUS;

  clearDisconnectForfeitTimer(disconnectedPlayer.token);

  const timer = setTimeout(async () => {
    disconnectForfeitTimersByToken.delete(disconnectedPlayer.token);

    if (isFinishedStatus(game.boardState?.status)) {
      return;
    }

    game.boardState = {
      ...game.boardState,
      status: winnerStatus,
      candidateMoves: [],
    };

    syncActiveGameSessions(game);
    chessNamespace.to(game.gameId).emit("game-state", serializeGame(game));
    chessNamespace.to(game.gameId).emit("game-ended-by-timeout", {
      loser: disconnectedPlayer.name,
      timeoutMs: DISCONNECT_FORFEIT_TIMEOUT_MS,
    });

    await persistGameResult(game);
  }, DISCONNECT_FORFEIT_TIMEOUT_MS);

  disconnectForfeitTimersByToken.set(disconnectedPlayer.token, timer);
};

export function registerMatchmakingNamespace(io) {
  const matchmakingNamespace = io.of(MATCHMAKING_NAMESPACE);

  matchmakingNamespace.on("connection", (socket) => {
    socket.on("join-queue", (payload) => {
      removeWaitingPlayer(socket.id);

      const username = sanitizeUsername(payload?.username, `Player-${socket.id.slice(0, 4)}`);
      socket.data.username = username;
      socket.data.playerId = socket.id;

      const activeSession = activeGameSessionsByUsername.get(username);
      if (activeSession) {
        socket.emit("active-game", activeSession);
        return;
      }

      const waitingOpponent = popWaitingOpponent(matchmakingNamespace);

      if (!waitingOpponent) {
        waitingPlayers.push({
          socketId: socket.id,
          username,
        });

        socket.emit("queue-joined", {
          username,
        });
        return;
      }

      const opponentSocket = matchmakingNamespace.sockets.get(waitingOpponent.socketId);

      if (!opponentSocket?.connected) {
        socket.emit("queue-joined", { username });
        waitingPlayers.push({ socketId: socket.id, username });
        return;
      }

      const gameId = crypto.randomUUID();
      const whiteToken = crypto.randomUUID();
      const blackToken = crypto.randomUUID();

      createGame({
        gameId,
        whitePlayer: {
          id: waitingOpponent.socketId,
          name: waitingOpponent.username,
          token: whiteToken,
        },
        blackPlayer: {
          id: socket.id,
          name: username,
          token: blackToken,
        },
      });

      opponentSocket.emit("match-found", {
        gameId,
        playerId: waitingOpponent.socketId,
        playerToken: whiteToken,
        username: waitingOpponent.username,
        opponent: username,
      });

      socket.emit("match-found", {
        gameId,
        playerId: socket.id,
        playerToken: blackToken,
        username,
        opponent: waitingOpponent.username,
      });
    });

    socket.on("cancel-queue", () => {
      removeWaitingPlayer(socket.id);
    });

    socket.on("disconnect", () => {
      removeWaitingPlayer(socket.id);
    });
  });

  return matchmakingNamespace;
}

export function registerChessNamespace(io) {
  const chessGames = new Map();
  const chessNamespace = io.of("/chess");

  const initializeGame = (gameId, player1, player2) => {
    const game = {
      gameId,
      status: "playing",
      whitePlayer: player1,
      blackPlayer: player2,
      currentTurn: "white",
      moves: [],
      fen: INITIAL_FEN,
      createdAt: new Date(),
      messages: [],
    };

    chessGames.set(gameId, game);
    return game;
  };

  const getOrCreateGame = (gameId, username) => {
    if (chessGames.has(gameId)) {
      return chessGames.get(gameId);
    }

    return initializeGame(gameId, username, "waiting-opponent");
  };

  chessNamespace.on("connection", (socket) => {
    const gameId = socket.handshake.query.gameId;
    const username = socket.handshake.query.username || `player-${socket.id.slice(0, 6)}`;

    socket.data.username = username;
    socket.data.gameId = gameId;

    socket.on("join-game", () => {
<<<<<<< HEAD
      const game = getOrCreateGame(gameId, username);

      if (game.blackPlayer === "waiting-opponent") {
        game.blackPlayer = username;
        game.status = "playing";
      }

=======
      console.log("[Chess] Received join-game from", socket.id, "with gameId:", gameId);

      // Validate that we have required parameters
      if (!gameId || !playerId || !playerToken) {
        socket.emit("game-error", { error: "Missing required game parameters." });
        return;
      }

      const game = chessGames.get(gameId);
      const resolvedPlayer = resolvePlayerFromGame(game, playerId, playerToken);

      if (!game || !resolvedPlayer) {
        socket.emit("game-error", { error: "Invalid game session." });
        return;
      }

      clearDisconnectForfeitTimer(resolvedPlayer.player.token);
      syncActiveGameSessions(game);

      socket.data.playerColor = resolvedPlayer.color;
>>>>>>> main
      socket.join(gameId);

      chessNamespace.to(gameId).emit("game-state", game);
      chessNamespace.to(gameId).emit("player-joined", {
        username,
        players: [game.whitePlayer, game.blackPlayer].filter((player) => player !== "waiting-opponent"),
      });
    });

    socket.on("make-move", (payload, acknowledge) => {
      const { from, to } = payload;
      const game = chessGames.get(gameId);

      if (!game) {
        if (typeof acknowledge === "function") {
          acknowledge({ ok: false, error: "Game not found" });
        }
        return;
      }

      const isWhiteTurn = game.currentTurn === "white";
      const isPlayerWhite = game.whitePlayer === username;

      if (isWhiteTurn !== isPlayerWhite) {
        if (typeof acknowledge === "function") {
          acknowledge({ ok: false, error: "Not your turn" });
        }
        return;
      }

      const move = {
        from,
        to,
        timestamp: new Date().toISOString(),
      };

      game.moves.push(move);
      game.currentTurn = isWhiteTurn ? "black" : "white";

      chessNamespace.to(gameId).emit("move-executed", move);

      if (typeof acknowledge === "function") {
        acknowledge({ ok: true });
      }
    });

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

    socket.on("resign-game", () => {
      const game = chessGames.get(gameId);

      if (!game) return;

      const winner = game.whitePlayer === username ? game.blackPlayer : game.whitePlayer;
      game.status = "finished";

<<<<<<< HEAD
      chessNamespace.to(gameId).emit("game-finished", {
        winner,
        reason: `${username} resigned`,
      });
    });

    socket.on("disconnect", () => {
      const game = chessGames.get(gameId);
      const players = chessNamespace.adapter.rooms.get(gameId)
        ? Array.from(chessNamespace.adapter.rooms.get(gameId))
        : [];
=======
      const expectedNextTurn = currentTurn === "w" ? "b" : "w";
      if (payload?.boardState?.turn !== expectedNextTurn) {
        acknowledge?.({ ok: false, error: "Invalid turn transition." });
        return;
      }

      game.boardState = {
        ...payload?.boardState,
        candidateMoves: [],
      };

      syncActiveGameSessions(game);
      chessNamespace.to(gameId).emit("game-state", serializeGame(game));

      if (isFinishedStatus(game.boardState.status)) {
        await persistGameResult(game);
      }

      acknowledge?.({ ok: true });
    });

    socket.on("resign-game", async () => {
      // Mark the game as finished and announce the winner when a player resigns.
      const game = chessGames.get(gameId);

      if (!game || !socket.data.playerColor) {
        return;
      }

      game.boardState = {
        ...game.boardState,
        status: socket.data.playerColor === "w" ? BLACK_WIN_STATUS : WHITE_WIN_STATUS,
        candidateMoves: [],
      };

      syncActiveGameSessions(game);
      chessNamespace.to(gameId).emit("game-state", serializeGame(game));

      await persistGameResult(game);
    });

    socket.on("disconnect", () => {
      // Ignore stale disconnects from sockets replaced during reconnect.
      if (!playerToken || playerConnections.get(playerToken) !== socket.id) {
        return;
      }

      playerConnections.delete(playerToken);

      const game = chessGames.get(gameId);
      const resolvedPlayer = resolvePlayerFromGame(game, playerId || "reconnect", playerToken);

      if (game && resolvedPlayer && !isFinishedStatus(game.boardState?.status)) {
        startDisconnectForfeitTimer({
          chessNamespace,
          game,
          disconnectedColor: resolvedPlayer.color,
        });
      }
>>>>>>> main

      if (game) {
        chessNamespace.to(gameId).emit("player-left", {
          username,
          players: players.map((socketId) => {
            const sock = chessNamespace.sockets.get(socketId);
            return sock?.data.username || "unknown";
          }),
        });
      }
    });
  });

  return chessNamespace;
}
