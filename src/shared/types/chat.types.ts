// ─────────────────────────────────────────────────────────────────────────────
// Tipos do chat
// ─────────────────────────────────────────────────────────────────────────────

/** Uma mensagem de chat */
export interface ChatMessage {
  id: string;
  roomId: string;       // ID da sala de jogo ou canal de chat global
  senderId: number;
  senderUsername: string;
  content: string;
  sentAt: string;       // ISO 8601
}

/** Payload para enviar uma mensagem pelo WebSocket */
export interface SendMessagePayload {
  roomId: string;
  content: string;
}

export type ChatEventName =
  | 'chat:message'     // Nova mensagem recebida
  | 'chat:history'     // Histórico de mensagens ao entrar numa sala
  | 'chat:join'        // Utilizador entrou na sala
  | 'chat:leave';      // Utilizador saiu da sala
