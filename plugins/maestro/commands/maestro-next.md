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
- **Prepare o ambiente antes de qualquer agente entrar.** Isto é trabalho de comando, não de gate — um auditor gastando metade da execução descobrindo que faltam dependências é custo puro:

```bash
mkdir -p .maestro/tmp/verdicts
# se estiver usando worktree separado, instale as dependencias nele agora
[ -d node_modules ] || npm ci || npm install
```

  Rode os scripts de checagem uma vez aqui e guarde a saída. O `code-auditor` audita o resultado; ele não deveria ser quem descobre que o `npm install` faltava.

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
3. **qa-engineer** — comportamento, regressão, casos de borda. Rode só os testes afetados pela task; a suíte completa entra apenas no gate de fim de stage. Reprovação gera payload
4. **ux-auditor** — pelo nível de Impacto Visual do contrato (Completo, Leve ou Nenhum). Reprovação gera payload

### O veredito está no arquivo, não na mensagem

Depois de cada gate, leia `.maestro/tmp/verdicts/<task-id>-<gate>.md`. **Não decida pelo texto que o agente devolveu.** Por um bug conhecido do CLI, um subagente cuja última mensagem termina em chamada de ferramenta tem o texto final descartado, e o que chega até você é a narração anterior — algo como *"Script ran without error. Let's check outputs."*, que parece um agente travado quando na verdade a auditoria terminou.

```
arquivo com APROVADO    → siga, mesmo que a mensagem tenha voltado truncada
arquivo com REPROVADO   → devolva ao executor com o payload. Conta tentativa
arquivo com BLOQUEADO   → o gate não conseguiu auditar. NÃO conta tentativa. Destrave e reconvoque
arquivo ausente         → gate não executado. NÃO conta tentativa. Reconvoque uma vez
ausente de novo         → gate_indisponivel: pare e leve ao operador. Você não emite o veredito no lugar dele
```

Em cada reprovação, devolva ao executor responsável com o payload. A contagem de tentativas é **por gate**: duas falhas no mesmo gate e a terceira submissão ativa o Circuit Breaker, que para a esteira e aguarda o operador. Falha de transporte ou de ambiente nunca entra nessa contagem — ela mede a qualidade do trabalho, não a saúde da ferramenta.

### Não delegue o ux-auditor task por task

Antes de convocá-lo, verifique em `docs/Backlog.md` se há outras tasks do mesmo Pipeline Stage que já passaram em code-auditor e security-auditor e estão aguardando ux-auditor. Se houver, acumule e delegue todas numa única chamada — o setup do gate (subir app, autenticar, navegar) é o custo fixo mais caro dele, e se paga uma vez por leva, não por task.

Isso significa que esta task pode ficar "aguardando ux-auditor em lote" por um momento, em vez de ir direto ao gate. Registre esse estado em `.maestro/state/<task-id>.json` para não perder o rastro de quais tasks estão na fila.

## 5. Merge e fechamento

Com todos os gates aplicáveis aprovados:

```bash
git checkout <branch-principal>
git merge --no-ff feature/<task-id>
git branch -d feature/<task-id>
```

Atualize o grafo de código com os caminhos que a task tocou — incremental, nunca reconstrução total:

```bash
graphify update <caminhos alterados> --no-cluster
```

Rode isso **você**, na camada de comando. O `memory-manager` não tem a ferramenta `Bash` e não pode executá-lo.

Em seguida delegue ao **memory-manager** para sincronizar `docs/Backlog.md` e `docs/Status.md`.

Se esta task encerrou um Pipeline Stage, delegue também ao **improvement-agent** para a retrospectiva.

## Fechamento

Reporte ao operador o resultado da task, quantas rodadas de correção foram necessárias em cada gate, e qual é a próxima task disponível.

Em seguida, faça a **pergunta de encerramento do Obsidian** (Seção "Encerramento de Rodada" abaixo).

## Encerramento de Rodada — Obsidian

Esta pergunta é feita **aqui, na sessão principal** — nunca por um subagente. Subagentes não têm a ferramenta `AskUserQuestion` e não conseguem perguntar nada ao operador.

Ao concluir a task, exiba:

```
Rodada concluída — Task <task-id>

Salvar aprendizados, decisões e histórico desta rodada no seu cofre do Obsidian? (Sim / Não)
```

**Não** → encerre sem escrever nada.

**Sim** → não grave o arquivo à mão. Use as skills do plugin `obsidian`, que já conhecem o cofre e as convenções dele:

1. `obsidian:obsidian-markdown` — formato da nota: frontmatter, tags, wikilinks e callouts no padrão do Obsidian
2. `obsidian:obsidian-cli` — localizar o cofre e criar a nota nele

Conteúdo da nota:

- Identificação da task: id, título, stage, executor, branch
- Decisões tomadas durante a execução, e por quê
- Vetos recebidos por gate e como cada um foi resolvido
- Arquivos alterados
- Entradas novas em `docs/Lessons-Learned.md`
- Wikilinks para as tasks dependentes e para a nota do stage, quando existirem

**Fallback**, apenas se o plugin `obsidian` não estiver instalado: grave em `obsidian.vaultPath` do `.maestro/config.json`; se estiver vazio, entregue em `.maestro/tmp/obsidian/<task-id>.md` e avise o operador para mover.

Não pergunte duas vezes na mesma rodada, e não pergunte quando a task foi bloqueada por Circuit Breaker — nesse caso o encerramento é a orientação ao operador, não o registro.
