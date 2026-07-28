# Backlog

Produzido pelo agente `backlog-planner` ao final da descoberta e mantido pelo `memory-manager`.

## Legenda de status

| Símbolo | Significado |
|---|---|
| ⏱️ Planejado | Pronto para execução |
| ⏳ Em Progresso | Branch efêmera aberta |
| ✅ Completo | Aprovado em todos os gates e mesclado |
| 🔴 Bloqueado | Circuit Breaker ativado ou dependência não resolvida |

## Formato de task

```markdown
### Task <stage>.<n> — <título>

- **Status**: ⏱️ Planejado
- **Executor**: frontend-engineer | backend-engineer | integration-engineer | motor-engineer
- **Modelo Recomendado**: padrão do agente, ou override com justificativa
- **Depende de**: <task-ids, ou nenhuma>
- **Referências**: <seções específicas dos documentos>

**Descrição**
<3-5 frases objetivas>

**Critérios de aceitação**
- [ ] <verificável por observação>
```

---

_Backlog vazio. Rode `/maestro-discovery` para gerá-lo._

## Rastreabilidade

| Requisito do PRD | Tasks que o entregam |
|---|---|
| — | — |
