# Redirecionamento pós-login/signup para Lobby

## Objetivo
Garantir que, após autenticação com sucesso (login ou criação de conta), o usuário seja enviado para a página de lobby em vez de voltar para a página inicial.

## Contexto funcional
Fluxo esperado:
1. Usuário faz login ou signup.
2. Dados de autenticação são validados/persistidos.
3. Sessão é criada com NextAuth.
4. Usuário é redirecionado para `/game/lobby`.

## Problemas encontrados
### 1) Redirecionamento para home (`/`) pelo NextAuth
Na configuração do NextAuth havia:

```ts
pages: {
  signIn: "/",
  error: "/",
}
```

Isso forçava navegação para a página inicial e competia com o redirecionamento manual do frontend.

### 2) Erro de runtime ao fazer login/signup
No console apareceu:

```text
TypeError: Cannot read properties of null (reading 'reset')
```

Causa: o modal era fechado antes e o formulário saía do DOM; depois disso o código tentava executar `e.currentTarget.reset()`.

Analogia C/C++:
- É como usar um ponteiro para memória já liberada (use-after-free).
- O elemento existia quando o evento começou, mas já não existia mais no momento do `reset()`.

## Alterações implementadas
###[app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)
1. Removida a configuração `pages` do NextAuth.
2. Mantida a configuração de sessão JWT e callbacks.

Resultado:
- O NextAuth não força mais retorno para `/` após autenticação.

###[app/frontend/hooks/useHomePageController.ts](app/frontend/hooks/useHomePageController.ts)
1. Adicionado `useRouter`:

```ts
import { useRouter } from "next/navigation";
const router = useRouter();
```

2. No `handleLogin`:
- Mantido `signIn(..., { redirect: false })`.
- Após sucesso, chamado `router.push("/game/lobby")`.
- Fechamento do modal ocorre após iniciar o redirecionamento.
- Removido `e.currentTarget.reset()` para evitar erro com elemento desmontado.

3. No `handleSignup`:
- Mantido fluxo: `registerUser` -> `signIn` automático.
- Após sucesso, chamado `router.push("/game/lobby")`.
- Fechamento do modal ocorre após iniciar o redirecionamento.
- Removido `e.currentTarget.reset()` pelo mesmo motivo.

4. Adicionados logs de debug temporários para rastrear o fluxo.

## Fluxo antes vs depois
Antes:
1. Auth bem-sucedida.
2. Modal fechava.
3. NextAuth/home e erro de `reset()` impediam navegação correta.

Depois:
1. Auth bem-sucedida.
2. `router.push("/game/lobby")` é executado.
3. Modal fecha sem erro de DOM.
4. Usuário vai para lobby.

## Como validar manualmente
1. Subir stack:

```bash
make up
```

2. Testar signup:
- Criar conta com email novo.
- Confirmar redirecionamento para `/game/lobby`.

3. Testar login:
- Entrar com conta existente.
- Confirmar redirecionamento para `/game/lobby`.

4. Se falhar, abrir console do browser e observar logs iniciando por:
- `[handleLogin] ...`
- `[handleSignup] ...`

## Observação
A mensagem `GET https://localhost/rules?... 404` é independente deste fluxo de auth/redirecionamento.

## Aprendizado principal
Em interfaces reativas, a ordem das operações importa.
- Primeiro dispare navegação/efeito principal.
- Depois feche/desmonte UI.
- Evite acessar elementos que podem já ter sido desmontados.
