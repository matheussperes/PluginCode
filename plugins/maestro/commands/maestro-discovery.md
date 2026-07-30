---
description: Roda a fase de descoberta completa, do briefing bruto ate o backlog auditado
argument-hint: [descricao da ideia, ou vazio para retomar]
---

Conduza a fase de descoberta do projeto para: **$ARGUMENTS**

Se nada foi passado, leia `docs/PRD.md` e os demais artefatos para descobrir em que ponto a descoberta parou e retome dali.

Antes de qualquer coisa, verifique se `.maestro/` e `docs/` existem. Se não existirem, pare e instrua o operador a rodar `/maestro-init` primeiro.

## Sequência

Delegue a cada especialista **em ordem**, um de cada vez, usando a ferramenta Agent. Cada um lê os artefatos do anterior — por isso a ordem importa e por isso não devem rodar em paralelo.

1. **product-strategist** — entrevista o operador até fechar as lacunas, então produz `docs/PRD.md` e `docs/Business-Strategy.md`

   Este agente faz perguntas ao operador. **Pare e traga as perguntas para o operador responder.** Não responda por ele e não deduza. Só siga adiante quando as respostas estiverem dadas.

2. **interaction-architect** — produz `docs/Screen-Blueprints.md`
3. **product-designer** — produz `docs/Design-System.md`
4. **data-architect** — produz `.maestro/tmp/schema.sql` e, quando o projeto tiver cálculo real, `docs/Modelo-de-Dominio.md`
5. **backlog-planner** — produz `docs/Backlog.md`
6. **spec-auditor** — valida a coerência cruzada de tudo e tem poder de veto

## Se o spec-auditor reprovar

Leia `.maestro/tmp/Spec-Decline-Payload.md` e vá direto para a tabela **Agrupamento para correção**.

### Despache uma correção por linha da tabela, não por achado

Cada linha reúne todos os achados que caem no mesmo documento e no mesmo agente. Delegue **uma vez por linha**, passando todos os achados daquela linha de uma só vez.

```
Errado: 3 achados no Backlog → 3 subagentes, cada um relendo o Backlog
Certo:  3 achados no Backlog → 1 subagente corrigindo os 3 na mesma leitura
```

A releitura do documento é o custo dominante de uma correção, não a edição. Três subagentes para o mesmo arquivo pagam a leitura três vezes e entregam o mesmo resultado.

Na delegação, passe apenas os achados e as seções citadas — não mande o agente reler a descoberta inteira para corrigir uma inconsistência localizada.

### Reconvoque só quem foi nomeado

Não refaça a descoberta. Se nenhum achado é do `product-designer`, ele não é chamado.

### Rode o spec-auditor de novo

Ele vai detectar sozinho que existe payload e entrar em modo incremental, lendo apenas as seções corrigidas em vez dos cinco documentos.

### Limite de duas rodadas

Se ele reprovar na segunda rodada, **pare a esteira** e traga ao operador. Não existe terceira rodada automática.

Duas reprovações seguidas quase nunca são falha de execução dos agentes — indicam decisão pendente no PRD ou ambiguidade na ideia original. Continuar o ciclo auditar-corrigir-auditar é o padrão de gasto mais caro que a esteira produz, e a decisão de seguir é sua, não do Maestro.

## Gate de saída

Com a aprovação do spec-auditor, apresente ao operador o resumo dos artefatos e pergunte diretamente:

```
Descoberta concluída e auditada.

- PRD: <escopo do MVP em uma linha>
- Estratégia: <modelo de monetização em uma linha>
- Blueprints: <n> telas, <n> fluxos críticos
- Design System: paleta, tipografia, <n> componentes, UX Writing
- Dados: <n> tabelas, <n> políticas de RLS
- Domínio: <n> regras com exemplos trabalhados (ou: não se aplica)
- Backlog: <n> tasks em <n> stages

Aprovar e liberar a execução?
```

Não avance para a execução sem confirmação explícita. Se o operador pedir ajustes, reconvoque apenas os agentes afetados.

## Após a aprovação: ofereça o Visual Kit

Com a descoberta aprovada, antes de encerrar, pergunte:

```
Quer que eu já gere os prompts de identidade visual do projeto —
logo, telas-chave e criativo de lançamento? (sim/não)
```

Se sim, invoque `/maestro-visual-kit`, que por sua vez confirma novamente antes de gerar qualquer coisa — a pergunta aqui é sobre iniciar o fluxo, a confirmação de lá é sobre efetivamente escrever o arquivo. Se não, apenas mencione que o comando fica disponível para rodar a qualquer momento.

Isso não bloqueia a liberação da execução: o operador pode responder não ao Visual Kit e sim à execução, e a esteira segue normalmente.
