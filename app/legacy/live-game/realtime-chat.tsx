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

const MAX_MESSAGES = 100;

// Formats ISO timestamps to a short local time for chat bubbles.
const formatTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

// Creates a local system-style message for join/leave/name-change notifications.
const toSystemMessage = (text: string): ChatMessage => ({
  id: `system-${crypto.randomUUID()}`,
  username: "system",
  text,
  sentAt: new Date().toISOString(),
  system: true,
});

// Reads the stored username from localStorage, with a safe server-side fallback.
const getInitialUsername = () => {
  if (typeof window === "undefined") {
    return "player";
  }

  return window.localStorage.getItem("ft:username")?.slice(0, 24) ?? "player";
};

// Main realtime chat UI that manages socket state, message flow, and form actions.
export default function RealtimeChat() {
  const [username, setUsername] = useState(getInitialUsername);
  const usernameRef = useRef(username);
  const socketRef = useRef<Socket | null>(null);
  const [draft, setDraft] = useState("");
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">(
    "connecting",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Keeps socket identity in sync whenever the local username changes.
  useEffect(() => {
    usernameRef.current = username;
    window.localStorage.setItem("ft:username", username);

    if (socketRef.current?.connected) {
      socketRef.current.emit("set-name", { username });
    }
  }, [username]);

  // Initializes socket listeners once and cleans up the connection on unmount.
  useEffect(() => {
    const socket = io({
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
    });

    socketRef.current = socket;

    // Adds a new message while keeping the list capped for UI performance.
    const appendMessage = (incomingMessage: ChatMessage) => {
      setMessages((previous) => [...previous, incomingMessage].slice(-MAX_MESSAGES));
    };

    socket.on("connect", () => {
      setStatus("connected");
      setError("");
      socket.emit("set-name", { username: usernameRef.current });
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setStatus("disconnected");
      setError("Connection interrupted. Trying to reconnect...");
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

    socket.on("peer-joined", (payload: { username: string }) => {
      appendMessage(toSystemMessage(`${payload.username} joined.`));
    });

    socket.on("peer-left", (payload: { username: string }) => {
      appendMessage(toSystemMessage(`${payload.username} left.`));
    });

    socket.on("name-updated", (payload: { previousName: string; currentName: string }) => {
      appendMessage(
        toSystemMessage(`${payload.previousName} is now ${payload.currentName}.`),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Enables the send action only when connected, non-empty, and not awaiting ack.
  const canSend = useMemo(() => {
    return status === "connected" && draft.trim().length > 0 && !isSending;
  }, [draft, isSending, status]);

  // Sends the current draft through the socket and handles delivery acknowledgement.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const messageText = draft.trim();

    if (!messageText || !socketRef.current) {
      return;
    }

    setIsSending(true);
    setError("");

    socketRef.current.emit("chat-message", { text: messageText }, (ack: AckPayload) => {
      setIsSending(false);

      if (!ack?.ok) {
        setError(ack?.error ?? "Failed to send message.");
        return;
      }

      setDraft("");
    });
  };

  return (
    <section className="w-full space-y-4 rounded-2xl border border-black/10 bg-background p-5 dark:border-white/15">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Your name</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value.slice(0, 24))}
            className="w-full rounded-md border border-black/10 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/15"
            placeholder="player"
            maxLength={24}
          />
        </label>
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`rounded-full px-3 py-1 font-medium ${
              status === "connected"
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                : status === "connecting"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
            }`}
          >
            {status}
          </span>
          <span className="text-foreground/80">{connectedUsers} online</span>
          {status !== "connected" && (
            <button
              type="button"
              onClick={() => socketRef.current?.connect()}
              className="rounded-md border border-black/10 px-3 py-1 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              reconnect
            </button>
          )}
        </div>
      </div>

      <div className="h-80 space-y-2 overflow-y-auto rounded-lg border border-black/10 bg-background p-3 dark:border-white/15">
        {messages.length === 0 && (
          <p className="text-sm text-foreground/70">No messages yet. Start the conversation.</p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-md px-3 py-2 text-sm ${
              message.system
                ? "border border-dashed border-black/10 text-foreground/70 dark:border-white/15"
                : "border border-black/10 dark:border-white/15"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <strong className="font-semibold">{message.username}</strong>
              <span className="text-xs text-foreground/70">{formatTime(message.sentAt)}</span>
            </div>
            <p className="mt-1 break-words">{message.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="flex-1 rounded-md border border-black/10 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/15"
          placeholder="Type a message"
          maxLength={500}
          disabled={status !== "connected"}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-md border border-black/10 px-4 py-2 font-medium hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
        >
          send
        </button>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
    </section>
  );
}
