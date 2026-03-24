// ─────────────────────────────────────────────────────────────────────────────
// Cliente WebSocket centralizado
//
// Explicação leiga: WebSocket é uma "linha telefónica" que fica aberta entre
// o browser e o servidor. Ao contrário do HTTP (que é "liga, pede, desliga"),
// o WebSocket permite que o servidor envie mensagens ao browser a qualquer
// momento — essencial para o jogo em tempo real e o chat.
//
// Este ficheiro gere uma única ligação partilhada por toda a aplicação.
// ─────────────────────────────────────────────────────────────────────────────

/** URL do WebSocket — definida no .env como NEXT_PUBLIC_WS_URL */
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'wss://localhost/ws';

type EventCallback = (data: unknown) => void;

class WsClient {
  private socket: WebSocket | null = null;
  /** Mapa de "nome do evento" → lista de funções a chamar quando chega */
  private listeners: Map<string, EventCallback[]> = new Map();
  /** Fila de mensagens para enviar quando a ligação ainda não estava pronta */
  private queue: string[] = [];

  /** Abre a ligação WebSocket. Deve ser chamado uma vez ao iniciar a sessão. */
  connect(token: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return; // já ligado

    // Passa o token JWT na URL para o servidor validar quem está a ligar
    this.socket = new WebSocket(`${WS_URL}?token=${token}`);

    this.socket.onopen = () => {
      console.info('[WS] Ligado ao servidor');
      // Envia mensagens que ficaram na fila durante a ligação
      this.queue.forEach((msg) => this.socket!.send(msg));
      this.queue = [];
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const { event: eventName, data } = JSON.parse(event.data as string) as {
          event: string;
          data: unknown;
        };
        this.emit(eventName, data);
      } catch {
        console.warn('[WS] Mensagem inválida recebida:', event.data);
      }
    };

    this.socket.onclose = () => {
      console.info('[WS] Ligação encerrada');
    };

    this.socket.onerror = (err) => {
      console.error('[WS] Erro:', err);
    };
  }

  /** Fecha a ligação WebSocket. Chama ao fazer logout. */
  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.listeners.clear();
  }

  /**
   * Envia um evento ao servidor.
   * @param eventName - Nome do evento, ex.: 'game:move'
   * @param data      - Dados a enviar (serão convertidos para JSON)
   */
  send(eventName: string, data: unknown): void {
    const message = JSON.stringify({ event: eventName, data });
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      // Guarda na fila para enviar quando a ligação abrir
      this.queue.push(message);
    }
  }

  /**
   * Regista uma função para ser chamada quando um evento chegar.
   * @param eventName - Ex.: 'game:state'
   * @param callback  - Função a executar com os dados do evento
   */
  on(eventName: string, callback: EventCallback): void {
    const existing = this.listeners.get(eventName) ?? [];
    this.listeners.set(eventName, [...existing, callback]);
  }

  /**
   * Remove um listener registado anteriormente.
   * IMPORTANTE: chamar isto quando o componente React for destruído
   * (useEffect cleanup) para evitar memory leaks.
   */
  off(eventName: string, callback: EventCallback): void {
    const existing = this.listeners.get(eventName) ?? [];
    this.listeners.set(
      eventName,
      existing.filter((cb) => cb !== callback),
    );
  }

  /** Chama internamente todos os listeners de um evento */
  private emit(eventName: string, data: unknown): void {
    const callbacks = this.listeners.get(eventName) ?? [];
    callbacks.forEach((cb) => cb(data));
  }
}

// Instância única partilhada por toda a aplicação (Singleton)
export const wsClient = new WsClient();
