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
| `/maestro-visual-kit` | Gera prompts de logo, telas e criativo de lançamento para ferramentas externas de imagem. Sempre confirma antes de gerar |
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
| `product-strategist` | opus | `PRD.md` e `Business-Strategy.md` (monetização, fases de crescimento, expansão, roadmap pós-MVP) |
| `interaction-architect` | sonnet | `Screen-Blueprints.md` — o mapa de telas, com descrição de layout e funcional por tela |
| `product-designer` | sonnet | `Design-System.md` (tokens, elevação, motion premium) e, sob demanda, `Image-Prompts.md` |
| `data-architect` | opus | `schema.sql` e `Modelo-de-Dominio.md` |
| `backlog-planner` | sonnet | `Backlog.md` |
| `spec-auditor` | opus | Gate de coerência cruzada, com reauditoria incremental. Poder de veto |

O `product-strategist` não escreve nada antes de fechar as lacunas: ele devolve de 3 a 5 perguntas decisórias ao operador e espera. É o que impede uma ideia vaga de virar um produto que ninguém pediu.

O `spec-auditor` é o único gate entre a descoberta e a primeira linha de código. Ele cruza os cinco documentos entre si, confere a aritmética dos exemplos numéricos, e faz a pergunta de fundo: o backlog ainda entrega a ideia original? Reprovações consecutivas têm limite de duas rodadas — a terceira para a esteira e chama o operador.

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
| `qa-engineer` | sonnet | Comportamento, regressão, bordas — testes afetados por task, suíte completa no fim do stage | sim |
| `ux-auditor` | sonnet | Validação visual com evidência, por raio de alcance | sim |

Os gates rodam do mais barato ao mais caro. Não faz sentido gastar auditoria visual em código que não compila.

O `ux-auditor` roda em três níveis, não binário: **completo** para tela nova ou componente compartilhado entre telas, **leve** (um breakpoint, sem os 4 estados) para ajuste isolado sem reuso, e **nenhum** para texto ou token já existente. O critério é raio de alcance — um componente compartilhado sempre recebe o gate completo, mesmo que o diff seja pequeno. Quando há mais de uma task do mesmo stage aguardando este gate, o Maestro agrupa numa única chamada, amortizando o setup fixo (subir app, autenticar, navegar).

Duas reprovações no mesmo gate e a terceira submissão ativa o **Circuit Breaker**: a esteira para e espera o operador. A contagem é por gate, não agregada.

## Territórios

| Caminho | Natureza | Quem escreve |
|---|---|---|
| Diretório do plugin | Núcleo compartilhado | Ninguém, durante uma execução |
| `docs/` do projeto | Especificação daquele projeto | Descoberta e memory-manager |
| `.maestro/` do projeto | Estado efêmero daquela esteira | Maestro e agentes |
| Código de aplicação | Implementação | Somente a execução |

Nada que muda por projeto vive no plugin. É isso que permite dez projetos usarem o mesmo Maestro sem contaminar uns aos outros.

## Acabamento premium

O `product-designer` define, e o `frontend-engineer` executa, um padrão de acabamento comparável a produtos como Linear, Vercel e Stripe: sistema de elevação em camadas (nunca `shadow-lg` genérico), tipografia com tracking e altura de linha refinados, motion system declarado por plataforma (Framer Motion na web, Moti no mobile — nunca Framer Motion em Expo, que não roda em React Native), e loading de conteúdo real sempre como skeleton com shimmer, nunca spinner central.

O `ux-auditor` audita esses itens como token — compara contra o que o Design System especificou, nunca contra uma noção subjetiva de "parece premium o bastante". Isso mantém o padrão de qualidade sem reabrir ciclo de veto por gosto.

## Visual Kit

`/maestro-visual-kit` gera `docs/Image-Prompts.md`: prompts de texto para logo, telas-chave e criativo de lançamento, prontos para colar em ChatGPT, Gemini ou ferramenta equivalente. Sempre pede confirmação antes de gerar, mesmo quando oferecido automaticamente ao final da descoberta.

Depois de gerar e aprovar as imagens externamente, salve-as em `docs/visual-reference/{logo,screens,marketing}/`. O `ux-auditor` passa a comparar a tela construída com a referência aprovada — só como observação de direção (paleta, hierarquia, tom), nunca como critério de veto. O que aprova ou reprova continua sendo exclusivamente `Design-System.md` e `Screen-Blueprints.md`.

## Web e Mobile

O padrão comum é começar só na web e portar para mobile depois. Isso é declarado em `.maestro/config.json`:

```json
"platforms": { "web": "ativo", "mobile": "nao_iniciado" }
```

Cor, tipografia, espaçamento e elevação em `Design-System.md` são valores, não código — servem para as duas plataformas sem retrabalho. O que muda por plataforma é a biblioteca que implementa esses valores: Shadcn/UI e Framer Motion na web, uma biblioteca de componentes declarada (nunca Shadcn, que é web-only) e Moti no mobile.

Quando chegar a hora de portar, mude `mobile` para `"ativo"` e rode `/maestro-discovery` de novo. O Maestro reconhece que é ativação de plataforma, não projeto novo, e convoca só o `product-designer` (declara Moti e a biblioteca mobile) e o `backlog-planner` (cria as tasks de portagem, uma por tela já existente). PRD, mapa de telas, schema e regras de domínio não são refeitos — só a camada de frontend é reconstruída para o novo cliente.

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
