"use client";

import { useEffect, useRef } from "react";
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
  username: string | null;
};

export function useOnlineGameSync({ appState, dispatch, gameId, playerId, username }: UseOnlineGameSyncParams) {
  const socketRef = useRef<Socket | null>(null);
  const hasHydratedFromServerRef = useRef(false);
  const suppressNextSyncRef = useRef(false);

  useEffect(() => {
    if (!gameId || !playerId || !username) {
      return;
    }

    const socket = io(getChessUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
      query: { gameId, playerId, username },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-game", { gameId, playerId, username });
    });

    socket.on("game-state", (payload) => {
      hasHydratedFromServerRef.current = true;
      suppressNextSyncRef.current = true;
      dispatch(syncGameState(payload.boardState));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      hasHydratedFromServerRef.current = false;
      suppressNextSyncRef.current = false;
    };
  }, [dispatch, gameId, playerId, username]);

  useEffect(() => {
    if (!gameId || !playerId || !username || !socketRef.current?.connected || !hasHydratedFromServerRef.current) {
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
      username,
    });
  }, [appState.movesList.length, appState.status, appState.turn, gameId, playerId, username]);

  const resignGame = () => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit("resign-game", {
      gameId,
      playerId,
    });
  };

  return {
    isOnlineGame: Boolean(gameId && playerId && username),
    resignGame,
  };
}
