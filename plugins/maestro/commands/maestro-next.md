---
description: Executa a proxima task do backlog, do contrato ate a aprovacao nos gates
argument-hint: [task-id, ou vazio para a proxima planejada]
---

Execute a próxima task da esteira. Se um task-id foi informado em **$ARGUMENTS**, use-o; caso contrário, selecione a próxima task com status `⏱️ Planejado` em `docs/Backlog.md`, respeitando as dependências declaradas.

Aja como o **maestro**: você coordena, não implementa.

## 1. Preparação

- Leia `docs/Status.md` e `docs/Backlog.md`
- Se não houver task planejada disponível, reporte isso e pare — o Backlog está vazio ou aguardando nova descoberta
- Se a task selecionada depender de outra ainda não concluída, escolha outra ou reporte o bloqueio
- Crie a branch efêmera: `git checkout -b feature/<task-id>`, sempre a partir da branch principal atualizada

## 2. Contrato

Copie `.maestro/contracts/Task-Execution-Contract.md` para `.maestro/state/contracts/<task-id>.md` e preencha a cópia com os dados da task: metadados, descrição, critérios de aceitação, arquivos impactados e as **referências de seção específicas** dos documentos de descoberta.

Este contrato preenchido é o único contexto que o executor recebe. Não passe o PRD completo nem o histórico da sessão.

## 3. Execução

Delegue ao executor indicado no Backlog:

```
Interface, componente, tela           → frontend-engineer
Tabela, RLS, Edge Function, migration → backend-engineer
API externa, webhook, SDK             → integration-engineer
Cálculo puro, regra de domínio        → motor-engineer
```

Se a task exigir mais de um executor, ela não era atômica: execute sequencialmente na mesma branch, dados antes de interface, e registre isso para a retrospectiva.

## 4. Gates de qualidade

Em ordem, parando no primeiro que reprovar:

1. **code-auditor** — build, lint, tipos. Reprovação volta direto ao executor, sem payload formal
2. **security-auditor** — segredos, RLS, OWASP. Reprovação gera payload
3. **qa-engineer** — comportamento, regressão, casos de borda. Reprovação gera payload
4. **ux-auditor** — apenas se a task tiver mudança visual. Reprovação gera payload

Em cada reprovação, devolva ao executor responsável com o payload. A contagem de tentativas é **por gate**: duas falhas no mesmo gate e a terceira submissão ativa o Circuit Breaker, que para a esteira e aguarda o operador.

## 5. Merge e fechamento

Com todos os gates aplicáveis aprovados:

```bash
git checkout <branch-principal>
git merge --no-ff feature/<task-id>
git branch -d feature/<task-id>
```

Em seguida delegue ao **memory-manager** para sincronizar `docs/Backlog.md` e `docs/Status.md`.

Se esta task encerrou um Pipeline Stage, delegue também ao **improvement-agent** para a retrospectiva.

## Fechamento

Reporte ao operador o resultado da task, quantas rodadas de correção foram necessárias em cada gate, e qual é a próxima task disponível.
