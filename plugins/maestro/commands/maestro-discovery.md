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

Leia `.maestro/tmp/Spec-Decline-Payload.md` e reconvoque **apenas os agentes nomeados como responsáveis** em cada achado bloqueante. Não refaça a descoberta inteira.

Depois da correção, rode o spec-auditor novamente. Após duas reprovações consecutivas, pare e traga ao operador — o problema provavelmente está na ideia original, não na execução dos agentes.

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
