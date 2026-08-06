---
description: Mostra o estado real do projeto na esteira, cruzando os documentos com o git
---

Apresente o estado atual do projeto na esteira Maestro.

Leia, sem delegar a subagent — isto é leitura barata:

- `.maestro/state/handoff.md`, se existir
- `docs/Status.md`
- `docs/Backlog.md`
- `.maestro/state/*.json`, se existirem
- `.maestro/tmp/verdicts/*.md` e `.maestro/tmp/*-Decline-Payload.md`, se existirem
- `git status` e `git branch` para conhecer a branch atual e o trabalho em andamento

## Checagem de agentes ejetados

Agentes ejetados têm precedência sobre os do plugin e **não recebem atualizações**. Um agente ejetado numa versão antiga faz o projeto rodar com correções que já existem no plugin mas nunca chegaram nele — e nada avisa.

O Claude Code carrega agentes de **exatamente dois lugares**. Qualquer outra pasta com arquivos de agente não é lida por nada:

```bash
ls .claude/agents/*.md ~/.claude/agents/*.md 2>/dev/null
```

### Pasta legada `.maestro/agents/`

Versões do Maestro anteriores à 3.4 copiavam os agentes para `.maestro/agents/` no `/maestro-init`. **Essa pasta nunca foi lida pelo Claude Code** — os agentes que rodam são os do plugin, sempre foram.

```bash
ls .maestro/agents/*.md 2>/dev/null
```

Se existir, reporte como **artefato morto, não como ejeção**:

```
Pasta legada .maestro/agents/ com <n> arquivos.
Não é lida pelo Claude Code — os agentes em execução são os do plugin.
Risco: ler esses arquivos como se fossem os ativos leva a diagnóstico errado.
Ação: apagar a pasta.
```

Isso não é hipotético: um diagnóstico inteiro já concluiu "os agentes ejetados estão desatualizados, é essa a causa" quando nada ali estava em uso. Editar um arquivo dessa pasta não tem efeito nenhum — nem os campos de frontmatter, nem o corpo do prompt.

Para cada arquivo encontrado cujo nome corresponda a um agente do Maestro, leia o comentário de procedência no topo (`<!-- Ejetado do plugin maestro v<versão> ... -->`) e compare com a versão em `.maestro/config.json` → `framework.version`.

Reporte na seção **Divergências**:

```
Agente ejetado desatualizado: <nome> (ejetado da v<x>, plugin está na v<y>)
  Motivo declarado da ejeção: <do comentário, ou "não registrado">
  Ação: apagar a cópia para voltar ao plugin, ou reejetar da versão atual
```

Se a cópia ejetada for idêntica à do plugin exceto pelo comentário de procedência, diga isso — ejeção sem alteração é só drift esperando acontecer, e apagar é sempre a decisão certa.

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
