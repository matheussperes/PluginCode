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

Depois de rodar, reporte ao operador:

- O que foi criado e o que foi preservado
- Se `CLAUDE.md` já existia, avise que a seção de integração do Maestro precisa ser adicionada manualmente e mostre o trecho de `${CLAUDE_PLUGIN_ROOT}/templates/project/CLAUDE.md`
- Se o projeto tem convenções próprias de caminho de código, sugira preencher a seção `conventions` do `.maestro/config.json`, que é o que orienta o motor-engineer e os executores

Termine indicando o próximo passo: `/maestro-discovery` para um projeto novo, ou `/maestro-status` para um projeto já em andamento.
