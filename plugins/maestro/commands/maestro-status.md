---
description: Mostra o estado real do projeto na esteira, cruzando os documentos com o git
---

Apresente o estado atual do projeto na esteira Maestro.

Leia, sem delegar a subagent — isto é leitura barata:

- `docs/Status.md`
- `docs/Backlog.md`
- `.maestro/state/*.json`, se existirem
- `.maestro/tmp/*-Decline-Payload.md`, se existirem
- `git status` e `git branch` para conhecer a branch atual e o trabalho em andamento

Se `.maestro/` não existir, informe que o projeto ainda não foi inicializado e indique `/maestro-init`.

## Formato

```
## Estado do Projeto

**Fase**: descoberta | execução | bloqueado
**Branch atual**: <nome>

**Descoberta**
<lista dos artefatos, marcando presente ou ausente:
PRD, Business-Strategy, Screen-Blueprints, Design-System, schema.sql,
Modelo-de-Dominio, Backlog>

**Backlog**
Concluídas <n> | Em progresso <n> | Planejadas <n> | Bloqueadas <n>

**Task em andamento**
<task-id, executor, gate atual, tentativas — ou "nenhuma">

**Bloqueadores**
<lista objetiva, ou "nenhum">

**Divergências**
<quando o git contradisser os documentos>

**Próximo passo sugerido**
<comando concreto>
```

## Divergências

Compare o que os documentos afirmam com o que o git mostra. Reporte quando encontrar:

- Task marcada como concluída no Backlog sem merge correspondente no histórico
- Branch de feature existente para uma task marcada como planejada
- Payload de reprovação em `.maestro/tmp/` para uma task marcada como aprovada
- Mudanças não commitadas na branch de uma task em andamento

Você **não corrige** nenhuma divergência aqui. Aponte e sugira a ação — corrigir estado é do memory-manager, sob decisão do Maestro.
