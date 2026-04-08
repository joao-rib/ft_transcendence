"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type GameMove = {
  from: string;
  to: string;
  timestamp: string;
};

export type GameState = {
  gameId: string;
  status: "waiting" | "playing" | "finished";
  whitePlayer: string;
  blackPlayer: string;
  currentTurn: "white" | "black";
  moves: GameMove[];
  fen: string; // Forsyth-Edwards Notation para o estado do tabuleiro
};

export type GameMessage = {
  id: string;
  gameId: string;
  username: string;
  text: string;
  sentAt: string;
};

type AckPayload = {
  ok: boolean;
  error?: string;
};

const CHESS_NAMESPACE = "/chess";

export function useChessSocket(gameId: string | null, username: string) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">(
    "connecting"
  );
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [gameMessages, setGameMessages] = useState<GameMessage[]>([]);

  useEffect(() => {
    if (!gameId) return;

    // Force WSS in HTTPS, WS in HTTP (for secure communication)
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const socketUrl = isSecure 
      ? `wss://${window.location.host}${CHESS_NAMESPACE}`
      : `ws://${window.location.host}${CHESS_NAMESPACE}`;

    const socket = io(socketUrl, {
      // In HTTPS: only websocket (secure). In HTTP: allow fallback to polling for dev
      transports: isSecure ? ["websocket"] : ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
      query: { gameId, username },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      setError("");
      socket.emit("join-game", { gameId, username });
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setStatus("disconnected");
      setError("Connection interrupted. Trying to reconnect...");
    });

    // Recebe o estado inicial do jogo
    socket.on("game-state", (state: GameState) => {
      setGameState(state);
    });

    // Recebe atualização quando um jogador entra
    socket.on("player-joined", (payload: { username: string; players: string[] }) => {
      setPlayers(payload.players ?? []);
    });

    // Recebe atualização quando um jogador sai
    socket.on("player-left", (payload: { username: string; players: string[] }) => {
      setPlayers(payload.players ?? []);
    });

    // Recebe um movimento válido do adversário
    socket.on("move-executed", (move: GameMove) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          moves: [...prev.moves, move],
          currentTurn: prev.currentTurn === "white" ? "black" : "white",
        };
      });
    });

    // Recebe mensagens de chat do jogo
    socket.on("game-chat-message", (message: GameMessage) => {
      setGameMessages((prev) => [...prev, message].slice(-50)); // Manter últimas 50
    });

    // Notificação quando o jogo termina
    socket.on("game-finished", (payload: { winner: string; reason: string }) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "finished",
        };
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gameId, username]);

  const makeMove = (from: string, to: string, callback?: (ack: AckPayload) => void) => {
    if (!socketRef.current?.connected) {
      setError("Not connected to game server");
      return;
    }

    socketRef.current.emit(
      "make-move",
      {
        from,
        to,
        gameId,
      },
      (ack: AckPayload) => {
        if (!ack?.ok) {
          setError(ack?.error ?? "Invalid move");
        }
        callback?.(ack);
      }
    );
  };

  const sendGameMessage = (text: string, callback?: (ack: AckPayload) => void) => {
    if (!socketRef.current?.connected) {
      setError("Not connected to game server");
      return;
    }

    socketRef.current.emit(
      "game-chat-message",
      {
        gameId,
        text,
      },
      (ack: AckPayload) => {
        if (!ack?.ok) {
          setError(ack?.error ?? "Failed to send message");
        }
        callback?.(ack);
      }
    );
  };

  const resignFromGame = () => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("resign-game", { gameId });
  };

  return {
    status,
    gameState,
    error,
    players,
    gameMessages,
    makeMove,
    sendGameMessage,
    resignFromGame,
    socket: socketRef.current,
  };
}
