// ─────────────────────────────────────────────────────────────────────────────
// Cliente HTTP centralizado
//
// Explicação leiga: este ficheiro é como um "atendente" que trata de TODAS as
// chamadas à API REST. Qualquer componente do site que precise de dados do
// servidor passa por aqui. Assim, se o endereço da API mudar, só alteramos
// numa sítio, e não em 50 ficheiros diferentes.
// ─────────────────────────────────────────────────────────────────────────────

/** URL base da API — definida no .env como NEXT_PUBLIC_API_URL */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost/api';

/**
 * Classe de erro personalizada.
 * Contém o código HTTP (ex.: 401, 404, 500) e a mensagem de erro do servidor.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Faz uma chamada HTTP, inclui automaticamente o token JWT se existir,
 * e devolve os dados já parseados como JSON.
 *
 * @param path  - Caminho relativo, ex.: '/auth/login'
 * @param init  - Opções do fetch (method, body, headers, etc.)
 * @returns     - Dados do servidor parseados como o tipo T
 * @throws ApiError se o servidor responder com erro (status >= 400)
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Lê o token JWT guardado no browser (sessionStorage para maior segurança)
  const token =
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('access_token')
      : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  // Se a resposta for erro, lança ApiError com o código e a mensagem
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? message;
    } catch {
      // se o corpo não for JSON, mantém a mensagem genérica
    }
    throw new ApiError(response.status, message);
  }

  // Respostas 204 (No Content) não têm corpo
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}

// ─── Métodos de conveniência ──────────────────────────────────────────────────

export const apiClient = {
  /** GET /path */
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },

  /** POST /path com body JSON */
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /** PATCH /path com body JSON */
  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  /** DELETE /path */
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },
};
