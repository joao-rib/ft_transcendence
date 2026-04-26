import crypto from "node:crypto";

const CHESS_NAMESPACE = "/chess";
const MATCHMAKING_NAMESPACE = "/matchmaking";
const WHITE_WIN_STATUS = "White wins";
const BLACK_WIN_STATUS = "Black wins";

const chessGames = new Map();
const waitingPlayers = [];

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
    createdAt: new Date().toISOString(),
  };

  chessGames.set(gameId, game);
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

export function registerMatchmakingNamespace(io) {
  const matchmakingNamespace = io.of(MATCHMAKING_NAMESPACE);

  matchmakingNamespace.on("connection", (socket) => {
    socket.on("join-queue", (payload) => {
      removeWaitingPlayer(socket.id);

      const username = sanitizeUsername(payload?.username, `Player-${socket.id.slice(0, 4)}`);
      socket.data.username = username;
      socket.data.playerId = socket.id;

      const waitingOpponent = waitingPlayers.shift();

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
  const chessNamespace = io.of(CHESS_NAMESPACE);
  const playerConnections = new Map(); // Track player connections by playerToken

  chessNamespace.on("connection", (socket) => {
    // Try to get from auth first (new method), fallback to query (old method)
    const gameId = socket.handshake.auth?.gameId || (typeof socket.handshake.query.gameId === "string" ? socket.handshake.query.gameId : "");
    const playerId = socket.handshake.auth?.playerId || (typeof socket.handshake.query.playerId === "string" ? socket.handshake.query.playerId : "");
    const playerToken = socket.handshake.auth?.playerToken || (typeof socket.handshake.query.playerToken === "string" ? socket.handshake.query.playerToken : "");
    const username = sanitizeUsername(socket.handshake.auth?.username || socket.handshake.query.username, `Player-${socket.id.slice(0, 4)}`);

    console.log("[Chess] New connection", { socketId: socket.id, gameId, playerId, playerToken, username });

    // If this player already has a connection, disconnect the old one
    if (playerToken && playerConnections.has(playerToken)) {
      const oldSocketId = playerConnections.get(playerToken);
      const oldSocket = chessNamespace.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect();
      }
    }

    // Store this connection
    if (playerToken) {
      playerConnections.set(playerToken, socket.id);
    }

    socket.data.gameId = gameId;
    socket.data.playerId = playerId;
    socket.data.playerToken = playerToken;
    socket.data.username = username;
    socket.data.playerColor = null;

    socket.on("join-game", () => {
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

      socket.data.playerColor = resolvedPlayer.color;
      socket.join(gameId);
      socket.emit("game-state", serializeGameForPlayer(game, resolvedPlayer.color));
      chessNamespace.to(gameId).emit("player-joined", {
        players: [game.whitePlayer.name, game.blackPlayer.name],
      });
    });

    socket.on("sync-game-state", (payload, acknowledge) => {
      const game = chessGames.get(gameId);

      if (!game || !socket.data.playerColor) {
        acknowledge?.({ ok: false, error: "Invalid game session." });
        return;
      }

      const currentTurn = game.boardState.turn;
      if (currentTurn !== socket.data.playerColor) {
        acknowledge?.({ ok: false, error: "Not your turn." });
        return;
      }

      const expectedNextTurn = currentTurn === "w" ? "b" : "w";
      if (payload?.boardState?.turn !== expectedNextTurn) {
        acknowledge?.({ ok: false, error: "Invalid turn transition." });
        return;
      }

      game.boardState = {
        ...payload?.boardState,
        candidateMoves: [],
      };

      chessNamespace.to(gameId).emit("game-state", serializeGame(game));
      acknowledge?.({ ok: true });
    });

    socket.on("resign-game", () => {
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

      chessNamespace.to(gameId).emit("game-state", serializeGame(game));
    });

    socket.on("disconnect", () => {
      // Clean up the player connection mapping
      if (playerToken) {
        playerConnections.delete(playerToken);
      }
    });
  });

  return chessNamespace;
}
