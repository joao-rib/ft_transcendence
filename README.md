# Transcendence

## Instruções para feat/branches

Exemplo: Adicionar novas configs em backend

1. Entrar na branch base
<br>&nbsp;&nbsp;git checkout **backend**
1. Não esquecer de atualizar tudo
<br>&nbsp;&nbsp;git pull
1. Criar nova branch, localmente
<br>&nbsp;&nbsp;git checkout -b **feat/addednewconfigs**
1. Trabalhar em alterações desejadas dentro da nova branch
<br>&nbsp;&nbsp;*Alterar código, fazer vários commits, etc.*
1. Criar nova branch, remotamente
<br>&nbsp;&nbsp;git push -u origin **feat/addednewconfigs**
1. Reentrar na branch principal
<br>&nbsp;&nbsp;git checkout **backend**
1. Fazer merge localmente
<br>&nbsp;&nbsp;git merge **feat/addednewconfigs**
1. Resolver potenciais conflitos
<br>&nbsp;&nbsp;VSCode, vim, github, etc.
1. Fazer merge remotamente
<br>&nbsp;&nbsp;Criar pull request, pedir aprovação

Após aprovação do pull request, a nova branch é apagada remotamente de forma automática (se necessário, restaurá-la é possível).
Localmente, a nova branch ainda aparece. Para apagar a sua informação, entrar numa branch existente (ex.: backend) e efectuar os seguintes comandos:

1. git pull
1. git fetch --prune
1. git branch -d **feat/addednewconfigs**
<br>&nbsp;&nbsp;(se não deixar, tentar -D em vez de -d)

### cherry-picking

Para fazer merge apenas de commits específicas, usa-se o comando **git cherry-pick**

1. Obter hashes dos vários commits feitos numa branch específica
<br>&nbsp;&nbsp;git log --oneline **outrabranch**
1. Usar o(s) hash(es) obtidos para passar apenas as alterações desejadas
<br>&nbsp;&nbsp;&nbsp;&nbsp;2.1. Apenas um commit
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;git cherry-pick **commit-hash**
<br>&nbsp;&nbsp;&nbsp;&nbsp;2.2. Vários commits
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;git cherry-pick **commit-hash-1** **commit-hash-2** ... **commit-hash-N**
<br>&nbsp;&nbsp;&nbsp;&nbsp;2.3. Apenas um merge-commit
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;git cherry-pick -m 1 **commit-hash**
<br>&nbsp;&nbsp;&nbsp;&nbsp;2.4. Vários merge-commits