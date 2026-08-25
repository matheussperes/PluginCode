---
description: Roda a retrospectiva do stage encerrado e registra aprendizados com evidencia
argument-hint: [numero do stage, ou vazio para o ultimo concluido]
---

Rode a retrospectiva do Pipeline Stage **$ARGUMENTS**. Se nada foi informado, identifique o último stage concluído em `docs/Status.md`.

> Normalmente você não chama este comando diretamente: `/maestro-stage-close` o executa como último passo, depois de verificar os seis critérios de lançamento. Chamar a retro sozinha encerra o stage no papel sem ter conferido composição, dívida de acabamento e coexistência de padrões — que é exatamente o hábito que o stage-close existe para quebrar. Use direto apenas quando quiser a retrospectiva de um stage já fechado.

Delegue ao **improvement-agent**, que vai coletar dados objetivos de:

- `.maestro/logs/agents.jsonl` — registro de execução dos agentes
- `.maestro/state/*.json` — status finais e contagem de tentativas
- `.maestro/tmp/*-Decline-Payload.md` — vetos do período, incluindo `Art-Decline-Payload.md`
- `.maestro/tmp/verdicts/tela-*-art.md` — vereditos de composição por tela
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
**Composição**: <telas aprovadas de primeira / telas que exigiram rodada de acabamento>
**Padrões identificados**: <n>
**Entradas em Lessons-Learned.md**: <n>

**Propostas de melhoria do framework**: <n>
<uma linha por proposta, com o caminho do arquivo>
```

Se houver propostas, liste-as e pergunte se o operador quer revisá-las agora. Não as aplique ao plugin por conta própria.

## Encerramento de Rodada

Feche pelo **Protocolo de Fechamento de Rodada** do `maestro.md`, incluindo a pergunta do Obsidian — que aqui registra a retrospectiva do stage, não uma task isolada.
