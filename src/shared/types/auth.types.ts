// ─────────────────────────────────────────────────────────────────────────────
// Tipos de autenticação
// Estes tipos definem o "contrato" entre o frontend e o backend:
// o que se envia e o que se recebe em cada chamada de API de auth.
// Qualquer colega que altere a API REST deve actualizar estes tipos também.
// ─────────────────────────────────────────────────────────────────────────────

/** Dados enviados ao fazer login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Resposta do servidor ao fazer login com sucesso */
export interface LoginResponse {
  accessToken: string;   // Token JWT para incluir nos headers das próximas chamadas
  user: UserProfile;
}

/** Dados enviados ao criar uma nova conta */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** Perfil de utilizador (o que o servidor devolve) */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;    // Imagem de perfil (opcional)
  wins: number;
  losses: number;
  createdAt: string;     // Data de criação no formato ISO 8601
}
