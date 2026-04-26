"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type ChatMessage = {
  id: string;
  username: string;
  text: string;
  sentAt: string;
  system?: boolean;
};

type SyncStatePayload = {
  connectedUsers: number;
  recentMessages: ChatMessage[];
};

type AckPayload = {
  ok: boolean;
  error?: string;
};

const MAX_MESSAGES = 50;

const formatTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const getInitialUsername = () => {
  if (typeof window === "undefined") {
    return "player";
  }
  return window.localStorage.getItem("ft:username")?.slice(0, 24) ?? "player";
};

interface CompactChatProps {
  maxHeight?: string;
  initialUsername?: string;
}

export default function CompactChat({ maxHeight = "max-h-96", initialUsername }: CompactChatProps) {
  const [username, setUsername] = useState(initialUsername ?? getInitialUsername);
  const usernameRef = useRef(username);
  const socketRef = useRef<Socket | null>(null);
  const [draft, setDraft] = useState("");
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" >(
    "connecting"
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    usernameRef.current = username;
    window.localStorage.setItem("ft:username", username);

    if (socketRef.current?.connected) {
      socketRef.current.emit("set-name", { username });
    }
  }, [username]);

  useEffect(() => {
    const socket = io({
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
    });

    socketRef.current = socket;

    const appendMessage = (incomingMessage: ChatMessage) => {
      setMessages((previous) => [...previous, incomingMessage].slice(-MAX_MESSAGES));
    };

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit("set-name", { username: usernameRef.current });
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setStatus("disconnected");
    });

    socket.on("sync-state", (payload: SyncStatePayload) => {
      setConnectedUsers(payload.connectedUsers ?? 0);
      setMessages((payload.recentMessages ?? []).slice(-MAX_MESSAGES));
    });

    socket.on("presence", (payload: { connectedUsers: number }) => {
      setConnectedUsers(payload.connectedUsers ?? 0);
    });

    socket.on("chat-message", (payload: ChatMessage) => {
      appendMessage(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const canSend = useMemo(() => {
    return status === "connected" && draft.trim().length > 0 && !isSending;
  }, [draft, isSending, status]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const messageText = draft.trim();

    if (!messageText || !socketRef.current) {
      return;
    }

    setIsSending(true);

    socketRef.current.emit("chat-message", { text: messageText }, (ack: AckPayload) => {
      setIsSending(false);

      if (!ack?.ok) {
        return;
      }

      setDraft("");
    });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-black/10 bg-background dark:border-white/15 overflow-hidden">
      <div className="border-b border-black/10 bg-background/50 px-4 py-2 dark:border-white/15">
        <h3 className="font-semibold text-xs">Global Players</h3>
        <p className="text-xs text-foreground/70">{connectedUsers} online</p>
      </div>

      <div className={`${maxHeight} space-y-1 overflow-y-auto p-2`}>
        {messages.length === 0 && (
          <p className="text-xs text-foreground/70 p-1">No messages yet.</p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="rounded px-2 py-1 text-xs bg-gray-50 dark:bg-white/5">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-xs font-semibold">{message.username}</strong>
              <span className="text-xs text-foreground/60">{formatTime(message.sentAt)}</span>
            </div>
            {message.text && <p className="mt-1 break-words text-xs">{message.text}</p>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-black/10 dark:border-white/15 p-2 space-y-1">
        <div className="flex gap-1">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="flex-1 rounded px-2 py-1 text-xs border border-black/10 bg-background outline-none focus:ring-1 focus:ring-foreground/20 dark:border-white/15"
            placeholder="Say hi..."
            maxLength={200}
            disabled={status !== "connected"}
          />
          <button
            type="submit"
            disabled={!canSend}
            className="rounded px-2 py-1 text-xs font-medium border border-black/10 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
          >
            send
          </button>
        </div>
      </form>
    </div>
  );
}
