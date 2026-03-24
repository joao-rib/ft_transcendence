// ─────────────────────────────────────────────────────────────────────────────
// Tipos do jogo de cartas
// Define o estado da partida, movimentos e eventos WebSocket.
// O colega do backend deve usar estes mesmos nomes de eventos e campos.
// ─────────────────────────────────────────────────────────────────────────────

/** Possíveis estados de uma partida */
export type GameStatus = 'waiting' | 'in_progress' | 'finished';

/** Informação básica de uma partida */
export interface GameRoom {
  id: string;
  status: GameStatus;
  players: GamePlayer[];
  createdAt: string;
}

/** Jogador dentro de uma partida */
export interface GamePlayer {
  userId: number;
  username: string;
  score: number;
  isReady: boolean;
}

/** Uma carta do jogo */
export interface Card {
  id: string;
  name: string;
  value: number;          // Ou qualquer atributo relevante para a lógica do jogo
  imageUrl?: string;
}

/** Estado completo do jogo num dado momento (enviado pelo WebSocket) */
export interface GameState {
  roomId: string;
  status: GameStatus;
  currentTurn: number;    // userId de quem joga agora
  players: GamePlayer[];
  deck: Card[];           // Baralho restante
  playedCards: Card[];    // Cartas já jogadas
  round: number;
}

// ─── Eventos WebSocket do Jogo ───────────────────────────────────────────────
// Estes são os "nomes dos eventos" que o backend emite e o frontend escuta.
// Convenção: "domínio:ação"

export type GameEventName =
  | 'game:state'       // Backend enviou o estado actualizado do jogo
  | 'game:move'        // Um jogador jogou uma carta
  | 'game:start'       // A partida começou
  | 'game:end'         // A partida terminou
  | 'game:error';      // Ocorreu um erro no jogo

/** Payload enviado quando um jogador joga uma carta */
export interface GameMovePayload {
  roomId: string;
  cardId: string;
}

/** Payload recebido quando o jogo termina */
export interface GameEndPayload {
  roomId: string;
  winnerId: number;
  scores: Record<number, number>; // { userId: pontuação }
}
