# PluginCode — Maestro

O **Maestro** é um plugin do Claude Code que transforma uma ideia bruta em software entregue, passando por uma esteira de 17 agentes especialistas organizados em quatro squads.

Cada agente roda em janela de contexto própria, com modelo e ferramentas próprios. É isso que permite ter dezessete especialistas sem que nenhum deles fique sobrecarregado de contexto alheio.

## Instalação

Registre este repositório como marketplace local, uma vez só:

```powershell
claude plugin marketplace add D:\Github\PluginCode
claude plugin install maestro@plugincode
```

A partir daí os agentes e comandos ficam disponíveis em **todos os seus projetos**. Não há symlink, não há submodule e não há pasta para copiar.

Para atualizar depois de mexer no framework:

```powershell
git -C D:\Github\PluginCode pull
claude plugin marketplace update plugincode
```

## Uso em um projeto

Uma vez por projeto:

```
/maestro-init
```

Isso cria `.maestro/`, `docs/` e o `CLAUDE.md` de integração. É idempotente: rodar de novo não sobrescreve nada.

No dia a dia:

| Comando | O que faz |
|---|---|
| `/maestro-discovery` | Descoberta completa, do briefing ao backlog auditado |
| `/maestro-next` | Executa a próxima task, do contrato aos gates |
| `/maestro-status` | Estado real do projeto, cruzado com o git |
| `/maestro-audit` | Audita trabalho já implementado |
| `/maestro-retro` | Retrospectiva com evidência ao final de um stage |
| `/maestro-eject` | Copia um agente para escopo editável |

Ou simplesmente, dentro do projeto:

```
Aja como o Maestro. Quero criar uma tela de dashboard...
```

## Os quatro squads

### Governança

| Agente | Modelo | Papel |
|---|---|---|
| `maestro` | herda | Orquestra a esteira, decide e delega. Nunca escreve código |
| `memory-manager` | haiku | Sincroniza Backlog e Status. Silencioso |
| `improvement-agent` | sonnet | Retrospectiva com evidência, nunca com opinião |

### Descoberta

| Agente | Modelo | Artefato |
|---|---|---|
| `product-strategist` | opus | `PRD.md` e `Business-Strategy.md` |
| `interaction-architect` | sonnet | `Screen-Blueprints.md` |
| `product-designer` | sonnet | `Design-System.md` |
| `data-architect` | opus | `schema.sql` e `Modelo-de-Dominio.md` |
| `backlog-planner` | sonnet | `Backlog.md` |
| `spec-auditor` | opus | Gate de coerência cruzada. Poder de veto |

O `product-strategist` não escreve nada antes de fechar as lacunas: ele devolve de 3 a 5 perguntas decisórias ao operador e espera. É o que impede uma ideia vaga de virar um produto que ninguém pediu.

O `spec-auditor` é o único gate entre a descoberta e a primeira linha de código. Ele cruza os cinco documentos entre si, confere a aritmética dos exemplos numéricos, e faz a pergunta de fundo: o backlog ainda entrega a ideia original?

### Execução

| Agente | Modelo | Domínio |
|---|---|---|
| `frontend-engineer` | sonnet | React, Tailwind, Shadcn/UI |
| `backend-engineer` | sonnet | Supabase, Postgres, RLS, Edge Functions |
| `integration-engineer` | sonnet | APIs externas, webhooks, pagamento |
| `motor-engineer` | opus | Domínio e cálculo puro, sem UI e sem I/O |

### Auditoria

| Agente | Modelo | Gate | Veto |
|---|---|---|---|
| `code-auditor` | haiku | Build, lint, tipos | não |
| `security-auditor` | opus | Segredos, RLS, OWASP | sim |
| `qa-engineer` | sonnet | Comportamento, regressão, bordas | sim |
| `ux-auditor` | sonnet | Validação visual com evidência | sim |

Os gates rodam do mais barato ao mais caro. Não faz sentido gastar auditoria visual em código que não compila.

Duas reprovações no mesmo gate e a terceira submissão ativa o **Circuit Breaker**: a esteira para e espera o operador. A contagem é por gate, não agregada.

## Territórios

| Caminho | Natureza | Quem escreve |
|---|---|---|
| Diretório do plugin | Núcleo compartilhado | Ninguém, durante uma execução |
| `docs/` do projeto | Especificação daquele projeto | Descoberta e memory-manager |
| `.maestro/` do projeto | Estado efêmero daquela esteira | Maestro e agentes |
| Código de aplicação | Implementação | Somente a execução |

Nada que muda por projeto vive no plugin. É isso que permite dez projetos usarem o mesmo Maestro sem contaminar uns aos outros.

## Melhoria do framework

```
projeto gera uma lição
        ↓
fica em docs/Lessons-Learned.md daquele projeto
        ↓
improvement-agent identifica um padrão reutilizável
        ↓
cria proposta em .maestro/proposals/
        ↓
você aprova
        ↓
alteração entra no plugin e a versão é bumpada
```

Nenhum agente altera o framework sozinho. Uma peculiaridade de um projeto nunca contamina os outros por acidente.

## Hooks

O plugin instala dois hooks:

- **Guarda de comandos destrutivos** — bloqueia `git push --force`, `git reset --hard`, `rm -rf`, `DROP TABLE` e afins, com a alternativa segura na mensagem. Falha aberta: se o hook quebrar, o comando passa
- **Registro de execução** — grava cada agente encerrado em `.maestro/logs/agents.jsonl`, dando ao `improvement-agent` dado real em vez de memória de sessão

## Limitação conhecida

Agentes vindos de plugin ignoram três campos de frontmatter, por segurança: `permissionMode`, `hooks` e `mcpServers`. Todos os outros funcionam, e `tools`, `disallowedTools` e `model` cobrem a maior parte dos casos.

Se precisar de um desses três num agente específico, use `/maestro-eject <agente>`, que copia o arquivo para `.claude/agents/` ou `~/.claude/agents/`, onde os campos voltam a valer. A cópia deixa de receber atualizações do plugin.

## Estrutura do repositório

```text
PluginCode/
├── .claude-plugin/marketplace.json    # catálogo local
├── plugins/maestro/
│   ├── .claude-plugin/plugin.json
│   ├── agents/                        # 17 subagents
│   ├── commands/                      # 7 slash commands
│   ├── hooks/hooks.json
│   ├── scripts/
│   └── templates/project/             # ponto de partida de cada projeto
├── docs/                              # documentação do próprio PluginCode
└── tools/pdf-guide/                   # gerador do guia em PDF
```
