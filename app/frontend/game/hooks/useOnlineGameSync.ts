"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { syncGameState } from "@/app/components/chess_game/reducer/actions/game";

const CHESS_NAMESPACE = "/chess";

const getChessUrl = () => {
  if (typeof window === "undefined") {
    return CHESS_NAMESPACE;
  }

  return `${window.location.origin}${CHESS_NAMESPACE}`;
};

type UseOnlineGameSyncParams = {
  appState: {
    movesList: string[];
    status: string;
    turn: "w" | "b";
  } & Record<string, unknown>;
  dispatch: (action: unknown) => void;
  gameId: string | null;
  playerId: string | null;
  playerToken: string | null;
  username: string | null;
};

export function useOnlineGameSync({ appState, dispatch, gameId, playerId, playerToken, username }: UseOnlineGameSyncParams) {
  const socketRef = useRef<Socket | null>(null);
  const hasHydratedFromServerRef = useRef(false);
  const suppressNextSyncRef = useRef(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);

  useEffect(() => {
    if (!gameId || !playerId || !playerToken || !username) {
      return;
    }

    const socket = io(getChessUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
      query: { gameId, playerId, playerToken, username },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-game", { gameId, playerId, playerToken, username });
    });

    socket.on("game-state", (payload) => {
      if (payload?.playerColor === "w" || payload?.playerColor === "b") {
        setPlayerColor(payload.playerColor);
      }

      if (!payload?.boardState) {
        return;
      }

      hasHydratedFromServerRef.current = true;
      suppressNextSyncRef.current = true;
      dispatch(syncGameState(payload.boardState));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      hasHydratedFromServerRef.current = false;
      suppressNextSyncRef.current = false;
      setPlayerColor(null);
    };
  }, [dispatch, gameId, playerId, playerToken, username]);

  useEffect(() => {
    if (!gameId || !playerId || !playerToken || !username || !socketRef.current?.connected || !hasHydratedFromServerRef.current) {
      return;
    }

    if (suppressNextSyncRef.current) {
      suppressNextSyncRef.current = false;
      return;
    }

    socketRef.current.emit("sync-game-state", {
      boardState: appState,
      gameId,
      playerId,
      playerToken,
      username,
    });
  }, [appState.movesList.length, appState.status, appState.turn, gameId, playerId, playerToken, username]);

  const resignGame = () => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit("resign-game", {
      gameId,
      playerId,
      playerToken,
    });
  };

  return {
    isOnlineGame: Boolean(gameId && playerId && playerToken && username),
    playerColor,
    resignGame,
  };
}
