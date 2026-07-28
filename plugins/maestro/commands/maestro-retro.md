---
description: Roda a retrospectiva do stage encerrado e registra aprendizados com evidencia
argument-hint: [numero do stage, ou vazio para o ultimo concluido]
---

Rode a retrospectiva do Pipeline Stage **$ARGUMENTS**. Se nada foi informado, identifique o último stage concluído em `docs/Status.md`.

Delegue ao **improvement-agent**, que vai coletar dados objetivos de:

- `.maestro/logs/agents.jsonl` — registro de execução dos agentes
- `.maestro/state/*.json` — status finais e contagem de tentativas
- `.maestro/tmp/*-Decline-Payload.md` — vetos do período
- `docs/Backlog.md` e `docs/Status.md`
- `git log` do período

Ele grava as entradas em `docs/Lessons-Learned.md` e, quando um aprendizado for reutilizável em qualquer projeto, cria também uma proposta em `.maestro/proposals/`.

## Regras

- Uma reprovação isolada não é aprendizado. Só padrão recorrente entra
- Toda entrada aponta a evidência: task específica, contagem, payload
- A causa apontada é estrutural — documento ambíguo, contrato incompleto, regra não escrita — não "falta de atenção do executor"
- **Nada é alterado no framework compartilhado.** Proposta é proposta; a promoção ao plugin exige decisão humana

## Fechamento

Reporte ao operador:

```
## Retrospectiva — Stage <n>

**Métricas**: <tasks concluídas, vetos por gate, circuit breakers>
**Padrões identificados**: <n>
**Entradas em Lessons-Learned.md**: <n>

**Propostas de melhoria do framework**: <n>
<uma linha por proposta, com o caminho do arquivo>
```

Se houver propostas, liste-as e pergunte se o operador quer revisá-las agora. Não as aplique ao plugin por conta própria.
