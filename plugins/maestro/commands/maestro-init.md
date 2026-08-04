---
description: Prepara o projeto atual para usar a esteira Maestro, criando .maestro, docs e a integracao no CLAUDE.md
---

Prepare o diretório de trabalho atual para usar a esteira Maestro.

Rode o inicializador:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/init-project.mjs"
```

Se o comando falhar porque o Node não está disponível, crie a estrutura manualmente a partir dos arquivos em `${CLAUDE_PLUGIN_ROOT}/templates/project/`, copiando apenas o que ainda não existir.

A estrutura resultante é:

```text
.maestro/
├── contracts/     # modelos de contrato deste projeto
├── tmp/           # payloads de auditoria, screenshots, schema de referência
├── state/         # status e contratos preenchidos por task
├── cache/
├── logs/          # registro objetivo de execução, usado na retrospectiva
├── proposals/     # propostas de melhoria do framework, aguardando decisão humana
└── config.json
docs/
├── Backlog.md
├── Status.md
└── Lessons-Learned.md
CLAUDE.md
```

O inicializador é seguro para repetir: cria apenas o que falta e nunca sobrescreve documento existente.

## Grafo de Código (Graphify) — pré-requisito da esteira

A esteira depende do grafo do Graphify para consulta de dependências. Sem ele, os executores voltam a varrer o repositório com `Glob`/`Grep`, que é exatamente o custo que a esteira existe para evitar.

Verifique a instalação:

```bash
graphify --version
```

Se o comando não existir, instale (nesta ordem de preferência) e reporte qual funcionou:

```bash
uv tool install graphifyy || pipx install graphifyy || pip install graphifyy
graphify install
```

O pacote no PyPI é **`graphifyy`**, com dois "y"; o executável é `graphify`.

Com o Graphify disponível, construa o grafo inicial do projeto **na sessão principal**:

```
/graphify .
```

Isso gera `graphify-out/GRAPH_REPORT.md` (relatório de arquitetura), `graphify-out/graph.json` (grafo consultável) e `graphify-out/graph.html` (visualização). Acrescente `graphify-out/` ao `.gitignore` do projeto — o grafo é derivado, não versionado.

Se o projeto ainda não tem código (projeto novo indo para `/maestro-discovery`), pule a construção: ela acontece no fim da descoberta, quando houver o que mapear. Registre isso no relatório final em vez de tentar construir um grafo vazio.

Se o Graphify não puder ser instalado neste ambiente, **pare e reporte ao operador** antes de seguir. Não inicialize a esteira em modo degradado sem que ele saiba.

Depois de rodar, reporte ao operador:

- O que foi criado e o que foi preservado
- Se `CLAUDE.md` já existia, avise que a seção de integração do Maestro precisa ser adicionada manualmente e mostre o trecho de `${CLAUDE_PLUGIN_ROOT}/templates/project/CLAUDE.md`
- Se o projeto tem convenções próprias de caminho de código, sugira preencher a seção `conventions` do `.maestro/config.json`, que é o que orienta o motor-engineer e os executores

Termine indicando o próximo passo: `/maestro-discovery` para um projeto novo, ou `/maestro-status` para um projeto já em andamento.
