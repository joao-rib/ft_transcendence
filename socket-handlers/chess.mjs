import crypto from "node:crypto";

const CHESS_NAMESPACE = "/chess";
const MATCHMAKING_NAMESPACE = "/matchmaking";
const WHITE_WIN_STATUS = "White wins";
const BLACK_WIN_STATUS = "Black wins";

const chessGames = new Map();
const waitingPlayers = [];

const createInitialBoardState = () => ({
  position: [["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"], ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""], ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"], ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"]],
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

const createGame = ({ gameId, whitePlayer, blackPlayer }) => {
  const game = {
    gameId,
    whitePlayer,
    blackPlayer,
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
      createGame({
        gameId,
        whitePlayer: {
          id: waitingOpponent.socketId,
          name: waitingOpponent.username,
        },
        blackPlayer: {
          id: socket.id,
          name: username,
        },
      });

      opponentSocket.emit("match-found", {
        gameId,
        playerId: waitingOpponent.socketId,
        username: waitingOpponent.username,
        opponent: username,
        color: "w",
      });

      socket.emit("match-found", {
        gameId,
        playerId: socket.id,
        username,
        opponent: waitingOpponent.username,
        color: "b",
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

  chessNamespace.on("connection", (socket) => {
    const gameId = typeof socket.handshake.query.gameId === "string" ? socket.handshake.query.gameId : "";
    const playerId = typeof socket.handshake.query.playerId === "string" ? socket.handshake.query.playerId : socket.id;
    const username = sanitizeUsername(socket.handshake.query.username, `Player-${socket.id.slice(0, 4)}`);

    socket.data.gameId = gameId;
    socket.data.playerId = playerId;
    socket.data.username = username;

    socket.on("join-game", () => {
      const game = chessGames.get(gameId);

      if (!game) {
        socket.emit("game-error", { error: "Game not found." });
        return;
      }

      socket.join(gameId);
      socket.emit("game-state", serializeGame(game));
      chessNamespace.to(gameId).emit("player-joined", {
        players: [game.whitePlayer.name, game.blackPlayer.name],
      });
    });

    socket.on("sync-game-state", (payload, acknowledge) => {
      const game = chessGames.get(gameId);

      if (!game) {
        acknowledge?.({ ok: false, error: "Game not found." });
        return;
      }

      const currentPlayerId = game.boardState.turn === "w" ? game.whitePlayer.id : game.blackPlayer.id;
      if (currentPlayerId !== playerId) {
        acknowledge?.({ ok: false, error: "Not your turn." });
        return;
      }

      game.boardState = {
        ...payload?.boardState,
        candidateMoves: [],
      };

      socket.to(gameId).emit("game-state", serializeGame(game));
      acknowledge?.({ ok: true });
    });

    socket.on("resign-game", () => {
      const game = chessGames.get(gameId);

      if (!game) {
        return;
      }

      game.boardState = {
        ...game.boardState,
        status: playerId === game.whitePlayer.id ? BLACK_WIN_STATUS : WHITE_WIN_STATUS,
        candidateMoves: [],
      };

      chessNamespace.to(gameId).emit("game-state", serializeGame(game));
    });
  });

  return chessNamespace;
}
