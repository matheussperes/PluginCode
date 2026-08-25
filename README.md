# PluginCode — Maestro

O **Maestro** é um plugin do Claude Code que transforma uma ideia bruta em software entregue, passando por uma esteira de 18 agentes especialistas organizados em quatro squads.

Cada agente roda em janela de contexto própria, com modelo e ferramentas próprios. É isso que permite ter dezoito especialistas sem que nenhum deles fique sobrecarregado de contexto alheio.

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

## Pré-requisito: Graphify

A esteira usa um grafo de código para responder "quem depende disto?" em uma chamada, em vez de varrer o repositório com `Glob` e `Grep` a cada task. Sem ele, os executores voltam ao modo caro.

```powershell
uv tool install graphifyy   # ou: pipx install graphifyy / pip install graphifyy
graphify install            # registra a skill /graphify no Claude Code
```

O pacote no PyPI é **`graphifyy`**, com dois "y"; o executável é `graphify`. A construção do grafo (`/graphify .`) roda na sessão principal, uma vez por projeto, e a manutenção incremental (`graphify update <caminhos>`) é do Maestro, após cada merge. Os agentes apenas consultam:

```bash
graphify explain "Button"              # o que é, onde vive, quem depende
graphify path "Checkout" "PaymentAPI"  # como A alcança B
```

`/maestro-init` verifica a instalação e acrescenta `graphify-out/` ao `.gitignore` do projeto.

A manutenção é responsabilidade do **Maestro**, não dos comandos: ele confere o frescor do grafo no início de cada rodada (`find . -newer graphify-out/graph.json`) e roda o `graphify update` depois de cada merge. Isso vive no `maestro.md` de propósito — se vivesse só no `/maestro-next`, conduzir a esteira pela conversa ("aja como o Maestro") pularia a atualização e o grafo envelheceria em silêncio, que é pior que não ter grafo: os agentes consultam um mapa errado com confiança total.

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
| `/maestro-stage-close` | Fecha um Pipeline Stage com critério de lançamento — seis checagens, não só tasks mescladas |
| `/maestro-retro` | Retrospectiva com evidência ao final de um stage |
| `/maestro-visual-kit` | Gera prompts de logo, telas e criativo de lançamento para ferramentas externas de imagem. Sempre confirma antes de gerar |
| `/maestro-eject` | Copia um agente para escopo editável |

Mas você **não precisa** usar comando nenhum. O jeito normal de operar a esteira é conversar:

```
Aja como o Maestro e continue de onde paramos.
Aja como o Maestro, vamos iniciar um projeto novo.
```

O Maestro lê o estado do projeto, cruza com o que você pediu e dispara a rotina certa sozinho — init se falta estrutura, descoberta se falta PRD, próxima task se há fila, retrospectiva se um stage fechou, auditoria se você trouxe código feito fora da esteira. As rotinas são as mesmas skills da tabela acima; ele as invoca em vez de reimplementar, então digitar o comando e deixar ele decidir levam exatamente ao mesmo lugar.

Quando a leitura de estado for ambígua e a rotina for cara — descoberta, visual kit, auditoria completa — ele diz em uma linha o que entendeu antes de rodar. Rotina barata ele dispara direto. E se o que você pediu não bate com o estado (você diz "continue" mas a descoberta nunca foi auditada), ele desvia para o certo e explica por quê numa frase.

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
| `product-strategist` | sonnet + effort high | `PRD.md` e `Business-Strategy.md` (monetização, fases de crescimento, expansão, roadmap pós-MVP) |
| `interaction-architect` | sonnet | `Screen-Blueprints.md` — o mapa de telas, com descrição de layout e funcional por tela |
| `product-designer` | sonnet + effort high | `Design-System.md` — abrindo pela **Seção 0, Direção de Arte** — mais `Screen-Composition.md` em modo próprio e, sob demanda, `Image-Prompts.md` |
| `data-architect` | sonnet + effort high | `schema.sql` e `Modelo-de-Dominio.md` |
| `backlog-planner` | sonnet | `Backlog.md` |
| `spec-auditor` | sonnet + effort high | Gate de coerência cruzada, com reauditoria incremental. Poder de veto |

O `product-strategist` não escreve nada antes de fechar as lacunas: ele encerra a rodada devolvendo de 3 a 5 perguntas decisórias, e você responde na sessão principal antes da próxima convocação (subagentes não conseguem perguntar diretamente ao operador). É o que impede uma ideia vaga de virar um produto que ninguém pediu.

O `spec-auditor` é o único gate entre a descoberta e a primeira linha de código. Ele cruza os cinco documentos entre si, confere a aritmética dos exemplos numéricos, e faz a pergunta de fundo: o backlog ainda entrega a ideia original? Reprovações consecutivas têm limite de duas rodadas — a terceira para a esteira e chama o operador.

### Execução

| Agente | Modelo | Domínio |
|---|---|---|
| `frontend-engineer` | sonnet | React, Tailwind, Shadcn/UI |
| `backend-engineer` | sonnet | Supabase, Postgres, RLS, Edge Functions |
| `integration-engineer` | sonnet | APIs externas, webhooks, pagamento |
| `motor-engineer` | sonnet + effort high | Domínio e cálculo puro, sem UI e sem I/O |

### Auditoria

| Agente | Modelo | Gate | Veto |
|---|---|---|---|
| `code-auditor` | haiku | Build, lint, tipos | não |
| `security-auditor` | sonnet + effort high | Segredos, RLS, OWASP | sim |
| `qa-engineer` | sonnet | Comportamento, regressão, bordas — testes afetados por task, suíte completa no fim do stage | sim |
| `ux-auditor` | sonnet | Conformidade visual com evidência, por raio de alcance | sim |
| `art-director` | opus + effort high | Composição e identidade, por **tela** — hierarquia, ritmo, densidade, coexistência de sistemas | sim |

Os gates rodam do mais barato ao mais caro. Não faz sentido gastar auditoria visual em código que não compila.

O `ux-auditor` roda em três níveis, não binário: **completo** para tela nova ou componente compartilhado entre telas, **leve** (um breakpoint, sem os 4 estados) para ajuste isolado sem reuso, e **nenhum** para texto ou token já existente. O critério é raio de alcance — um componente compartilhado sempre recebe o gate completo, mesmo que o diff seja pequeno. Quando há mais de uma task do mesmo stage aguardando este gate, o Maestro agrupa numa única chamada, amortizando o setup fixo (subir app, autenticar, navegar).

O `art-director` é o único gate cujo objeto é a **tela inteira**, não a task. Ele entra quando todas as tasks de um mesmo Tela-alvo passaram no `ux-auditor`, e julga contra `docs/Screen-Composition.md` e a Seção 0 do Design System — nunca contra gosto: todo achado dele cita uma linha escrita ou um item da rubrica de 12 pontos, com evidência em imagem. Ele reaproveita as capturas do `ux-auditor` em vez de repagar o setup, e roda em levas de no máximo duas telas.

A divisão entre os dois é deliberada: o `ux-auditor` responde *"os valores estão certos?"*, o `art-director` responde *"isto ficou bom?"*. O que o primeiro observa e não pode vetar vai para a seção `## Encaminhado ao art-director` do veredito dele, em vez de morrer como observação.

Duas reprovações no mesmo gate e a terceira submissão ativa o **Circuit Breaker**: a esteira para e espera o operador. A contagem é por gate, não agregada.

## Onde os agentes moram — e onde não moram

O Claude Code carrega agentes de exatamente dois lugares: `.claude/agents/` no projeto e `~/.claude/agents/` no usuário. Qualquer outra pasta com arquivos de agente **não é lida por nada**.

Isso importa porque versões do Maestro anteriores à 3.4 copiavam os agentes para `.maestro/agents/` no `/maestro-init`, e essa pasta sobrevive em projetos antigos. Ela é inerte: os agentes que rodam são os do plugin. Editar um arquivo de lá não muda nem o frontmatter nem o prompt de nada — e já custou um diagnóstico inteiro, que concluiu "os agentes ejetados estão desatualizados, é essa a causa raiz" quando nenhum deles estava em uso.

`/maestro-init` e `/maestro-status` detectam a pasta e recomendam apagar.

## Uma instância de Maestro por Lote

O Maestro reenvia a conversa inteira a cada turno seu. Uma instância que atravessa o dia começa custando ~120k tokens por chamada e termina em ~300k — e esse crescimento sozinho supera todos os cortes de gate somados. É o maior item da fatura da esteira.

Por isso o escopo de uma instância é **um Lote**. Ao fechá-lo, o Maestro escreve `.maestro/state/handoff.md` e recomenda sessão nova. Trocar de instância não perde memória, porque a memória dele nunca esteve na conversa: está em `docs/Status.md`, `docs/Backlog.md`, `.maestro/state/` e no handoff — cerca de 5k tokens no total. Se algo relevante existe só na conversa e não em arquivo, isso é falha de registro, não motivo para segurar a instância viva.

O gatilho é o limite de trabalho, não uma estimativa de consumo: o agente não consegue enxergar o próprio tamanho, então pedir que ele "pare quando ficar grande" não funciona. Lote fechado é um marco objetivo.

## Comando é trabalho de script, julgamento é trabalho de agente

Antes do `code-auditor`, a camada de comando gera `.maestro/tmp/verify-<task-id>.log` com o `sha` do commit e a saída de build, lint e checagem de tipos — os três separados por `;`, nunca por `&&`, para que o executor receba todos os erros numa rodada só em vez de descobrir um por vez. O gate lê o log, confere o `sha` contra o `HEAD` (log defasado retorna `BLOQUEADO`, nunca aprovação) e varre o diff numa única chamada com alternação, classificando cada achado por padrão.

Isso tira o gate mais apertado da esteira de oito chamadas de overhead para três, e — mais importante que a economia — separa o que uma máquina faz melhor do que um modelo faz melhor. O mesmo princípio vale no `security-auditor`: um `git diff` gravado uma vez, uma varredura de segredos sobre ele, e classificação dos achados antes do veredito.

Note o que **não** foi feito: nenhum agente recebeu instrução para monitorar o próprio consumo de turnos. Um agente ocupado estimando quanto orçamento lhe resta é um agente com atenção dividida, e ele não tem como medir isso de qualquer forma. O caminho é dar menos trabalho mecânico e mais margem — não pedir autocontrole que o modelo não consegue exercer.

## Vereditos de gate — por que eles vão para arquivo

O Claude Code tem um bug conhecido ([#58109](https://github.com/anthropics/claude-code/issues/58109), fechado como *not planned*): quando a **última mensagem de um subagente termina em chamada de ferramenta**, o CLI descarta o texto final e entrega ao chamador apenas o último bloco de texto *anterior* àquela chamada. O agente conclui o trabalho inteiro e o pai recebe uma narração de meio de investigação — algo como *"Script ran without error. Let's check outputs."*.

Num orquestrador de gates isso é devastador e silencioso: a auditoria roda, o veredito se perde, e o comportamento é indistinguível de um agente que travou. O sintoma correlaciona com número de chamadas de ferramenta — quanto mais o agente usa ferramentas, maior a chance de a última mensagem terminar em `tool_use` — o que faz parecer estouro de limite de turnos quando não é.

A esteira convive com isso em três camadas:

**O arquivo é o veredito.** Todo gate grava `.maestro/tmp/verdicts/<task-id>-<gate>.md` — com `APROVADO`, `REPROVADO` ou `BLOQUEADO`, checklist e evidência — **antes** de redigir a resposta. O Maestro lê o arquivo, nunca a mensagem. Mensagem truncada com arquivo presente é sucesso.

**Ferramenta antes, resposta depois.** Oitava diretriz Ponytail, nos 17 agentes: toda escrita e todo comando acontecem antes de começar a redigir; a última mensagem é exclusivamente texto. Ataca o gatilho do bug diretamente.

**Stub antes da auditoria.** Todo gate grava o arquivo com `veredito: EM_ANDAMENTO` **antes** de investigar, e o sobrescreve no fim. Sem isso, morrer no primeiro minuto e morrer no nono produzem o mesmo sintoma para o Maestro — arquivo ausente — e recebem o mesmo tratamento errado: reconvocação do zero. Com o stub, `EM_ANDAMENTO` no disco significa que há trabalho a retomar.

**Primeiro plano nos gates, por hook.** Até a 3.7 isto era `background: false` no frontmatter dos cinco auditores — e não funcionava: o campo só tem semântica documentada para `true`, e desde a v2.1.198 subagentes rodam em background por padrão. Os gates seguiam assíncronos, expostos a [#47936](https://github.com/anthropics/claude-code/issues/47936), em que subagentes de background são encerrados externamente em 14–30% das execuções, sem gravar arquivo, e o pai recebe `status: completed`.

A partir da 3.8 quem garante isso é o hook `shape-agent-call.mjs`, que reescreve os argumentos da ferramenta `Agent` via `hookSpecificOutput.updatedInput`. O motivo de ser hook e não instrução: em investigação nesta base, o modelo **afirmou que o parâmetro `run_in_background` não existia e não o emitiu nem sob instrução direta do operador**, apesar de existir no schema da build. Argumento de ferramenta emitido pelo modelo não é canal confiável; hook é.

E uma regra que fecha o buraco: **o Maestro nunca emite o veredito de um gate no lugar dele.** Gate que falha duas vezes por motivo técnico vira `gate_indisponivel`, e a decisão de seguir sem ele é do operador — registrada no Backlog como "não executado (autorizado)", nunca como "aprovado". Falha de transporte também não conta tentativa de Circuit Breaker: esse contador mede a qualidade do trabalho, não a saúde da ferramenta.

## Maestro como agente principal

`/maestro-init` grava `.claude/settings.json` no projeto com `{ "agent": "maestro:maestro" }`. As sessões abertas naquele diretório passam a ter o Maestro como thread principal, em vez de um subagente convocado por outra sessão.

Isso importa por três motivos concretos: como agente principal ele tem `AskUserQuestion` e pergunta direto ao operador, em vez de depender de alguém repassar mensagens; as notificações dos gates chegam nele, em vez de subirem para a sessão acima; e os gates rodam a um nível de profundidade em vez de dois.

O escopo é **por projeto, nunca global**. Para uma sessão comum dentro de um projeto Maestro: `claude --agent claude`.

Até a 3.7 o Maestro tinha `disallowedTools: Edit, NotebookEdit`, e isso custava caro por um motivo não óbvio: `disallowedTools` no agente da sessão principal remove a ferramenta da **sessão inteira, subagentes inclusive**. Os quatro executores declaravam `Edit` e nunca o recebiam — toda alteração de código virava `Write` de arquivo inteiro, caro e o maior ponto de queda de uma execução. E a regra nunca protegeu nada: o Maestro sempre teve `Write`, que não é escopado por pasta.

Na 3.8 a proibição saiu do frontmatter e virou o hook `guard-write.mjs`, que bloqueia escrita em `src/`, `lib/`, `app/`, `components/`, `pages/`, `hooks/`, `styles/` e `supabase/` **vinda da thread principal**, e libera a mesma escrita quando vem de dentro de um executor. O discriminador é a presença de `agent_id` no payload do hook, que só existe quando o evento nasce dentro de um subagente. O resultado é mais estrito que antes — cobre `Write`, que estava aberto — e devolve `Edit` a quem precisa dele.

## Economia de tokens

Quatro decisões de projeto sustentam o custo da esteira, em ordem de impacto:

**Leitura cirúrgica.** Nenhum agente abre um documento inteiro. O contrato da task traz ponteiros — arquivo mais seção ou intervalo de linhas — e o executor abre exatamente aquele intervalo com `Read` usando `offset`/`limit`. O que o contrato não apontar, o agente localiza por `Grep` e lê só a vizinhança. Descoberta de dependência não usa varredura: usa o grafo.

**Modelo e esforço por papel.** Nenhum agente roda em `opus` por padrão. Onde o raciocínio é load-bearing — gates de veto, modelagem de domínio, cálculo puro, PRD, Design System — o ganho vem de `effort: high` em `sonnet`, que é mais barato que subir de modelo. Trabalho mecânico (`code-auditor`, `memory-manager`) roda em `haiku` com `effort: low`. Antes de convocar `security-auditor` ou `spec-auditor` em algo sensível, o Maestro avisa e oferece subir a sessão para `opus`.

**Fast-fail literal.** Ao reprovar num gate, os seguintes não são convocados — nem entram em contexto. Um `security-auditor` chamado depois de o build já ter quebrado audita código que vai mudar de qualquer forma.

**Diretrizes Ponytail.** Todos os 17 agentes carregam o mesmo bloco de execução enxuta no topo: zero prolixidade na resposta, operação atômica, leitura cirúrgica, YAGNI, deletar antes de adicionar, causa raiz em vez de sintoma, respeito ao domínio do contrato. Tokens de saída custam várias vezes o que custam os de entrada, e é aí que a prolixidade pesa.

Uma nota sobre `maxTurns`: ele está declarado como rede de segurança, mas **não é alavanca de economia nem causa de gate travado** — existe relato de que nem chegou a ser aplicado ([#41143](https://github.com/anthropics/claude-code/issues/41143)), e o travamento de gates desta esteira era o bug de truncamento acima, não estouro de turnos. Turno alto se resolve com task atômica e leitura focada, não com teto baixo — um executor cortado no meio custa mais que um que terminou.

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

A partir da 3.9, isso deixou de ser o fim da história. Conformidade de token nunca conseguiu barrar hierarquia confusa, ritmo irregular ou dois sistemas de botão convivendo na mesma tela — e é isso, não a cor errada, que faz um produto parecer amador. Três peças novas fecham esse vão:

- **`docs/Screen-Composition.md`** — o artefato que faltava entre a prosa dos Blueprints e os tokens do Design System: grade, regiões com propósito, hierarquia em três níveis com o mecanismo de cada um, ordem de leitura, poda e assinatura, por tela.
- **Seção 0 — Direção de Arte** — tese visual, decisão assinatura, par tipográfico justificado, viés do neutro, easing assinatura e antipadrões nomeados, escritos **antes** de qualquer token. Fecha com o teste de identidade: cubra a logo — alguém do setor reconhece que é este produto?
- **`art-director`** — o gate que julga a tela inteira contra os dois documentos acima, com poder de veto e critério escrito.

O autor e o juiz continuam separados: o `product-designer` escreve a composição, o `art-director` julga contra ela. É isso que impede o gate novo de virar veto por capricho — a mesma lógica do par `frontend-engineer` / `ux-auditor`.

O squad visual (`product-designer`, `interaction-architect`, `ux-auditor`) carrega ainda os **princípios Impeccable**: referência nomeada antes de adjetivo, hierarquia por espaçamento e peso antes de cor e caixa, alinhamento óptico em vez de geométrico, ritmo de espaçamento consistente entre telas, um objetivo primário por tela, e uma passada adversarial contra "cara de template genérico de IA" antes de entregar. Achado de acabamento sem token correspondente violado não é veto do `ux-auditor` — mas também não morre mais ali: ele é encaminhado ao `art-director`, que tem a régua escrita para julgá-lo.

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

## Protocolo de fechamento de rodada

Toda rodada — task mesclada ou stage encerrado — fecha pela mesma sequência, definida no `maestro.md` e válida em qualquer caminho de entrada: merge, `graphify update`, sincronização de docs pelo `memory-manager`, retrospectiva se encerrou stage, commit e push, e a pergunta do Obsidian. Os comandos `/maestro-next` e `/maestro-retro` apontam para esse protocolo em vez de reimplementá-lo, para que os dois caminhos nunca divirjam.

## Registro no Obsidian

Ao final de cada rodada — uma task concluída em `/maestro-next`, um stage encerrado em `/maestro-retro` — o comando pergunta se você quer salvar aprendizados, decisões e histórico no seu cofre do Obsidian. A pergunta acontece na **sessão principal**, nunca dentro de um subagente: subagentes não têm a ferramenta `AskUserQuestion` e não conseguem perguntar nada ao operador.

Respondendo "sim", a nota é criada pelas skills do plugin [`obsidian`](https://claude.com/plugins) — `obsidian:obsidian-markdown` para o formato (frontmatter, tags, wikilinks, callouts) e `obsidian:obsidian-cli` para localizar o cofre e gravar. O custo só é pago quando você responde sim; não há overhead por task recusada.

Se o plugin `obsidian` não estiver instalado, o comando cai para gravação manual em `obsidian.vaultPathFallback` do `.maestro/config.json`, ou entrega a nota em `.maestro/tmp/obsidian/` para você mover:

```json
"obsidian": { "askOnRoundEnd": true, "useObsidianPlugin": true, "vaultPathFallback": null, "notesSubfolder": "Maestro" }
```

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

O plugin instala quatro hooks. Todos falham abertos: se o script quebrar, a ação passa.

- **`guard-bash.mjs`** (`PreToolUse` em `Bash`) — bloqueia `git push --force`, `git reset --hard`, `rm -rf`, `DROP TABLE` e afins, com a alternativa segura na mensagem
- **`guard-write.mjs`** (`PreToolUse` em `Edit|Write|MultiEdit|NotebookEdit`) — bloqueia escrita em código de aplicação vinda da thread principal, liberando executores. Desligável por projeto em `guards.blockMainThreadAppWrites`
- **`shape-agent-call.mjs`** (`PreToolUse` em `Agent`) — força `run_in_background: false` nos gates listados em `gates.foreground` e atribui um `name` determinístico `<agente>-<task-id>`, que é o endereço usado para retomar um agente parado via `SendMessage`
- **`log-agent.mjs`** (`SubagentStart` e `SubagentStop`) — correlaciona início e fim por `agent_id` e grava `.maestro/logs/agents.jsonl` com turnos, contagem de ferramentas, tipo do último bloco e `stop_reason`

O registro é o que torna as falhas mensuráveis em vez de anedóticas. `ultimo_bloco: "tool_use"` (campo `saida_perdida`) marca a saída descartada pelo CLI; `stop_reason: null` marca encerramento externo; turnos perto do `maxTurns` marcam estouro de teto. Os três produziam o mesmo sintoma e exigiam correções diferentes.

A versão anterior lia `agent_type` no `SubagentStop` e o campo vinha sempre vazio, o que jogava todo evento num arquivo de descarte — `agent_type` é entregue no `SubagentStart`.

## 3.9.1 — nove propostas promovidas

Nove propostas que aguardavam decisão em `.maestro/proposals/` de um projeto real viraram regra do framework. Todas são checklist ou protocolo; nenhuma muda a mecânica da esteira:

| Onde | O que passou a valer |
|---|---|
| `maestro` | Investiga o estado real do código antes de escrever contrato de escopo múltiplo |
| `maestro` | Confirma commits próprios na branch antes de merge e delete |
| `maestro` | Executor morto por limite de gasto é substituído por outro executor — o Maestro nunca termina o código |
| `backend-engineer` | Falha ao aplicar migration é bloqueio a reportar; nunca rodar comando que imprime segredo |
| `security-auditor` | RLS de linha não protege coluna: coluna de autorização exige `GRANT` por coluna, achado bloqueante |
| `security-auditor` | Normalização de string desalinhada do parser do sink real (`trim` vs WHATWG) é bypass |
| `memory-manager` | Status mora em duas localizações; as duas são tocadas no mesmo commit |
| Contrato | Procurar lógica de domínio equivalente em `lib/` antes de escrever a sua |
| Contrato | Posse de ID recebido do cliente confirmada antes de qualquer escrita |

Junto veio uma **decisão registrada, não uma lacuna**: este framework não mantém camada de teste automatizado de interação de componente. Bug de interação — diálogo com seletor, corrida de efeitos, transbordo de layout — é responsabilidade exclusiva da auditoria ao vivo. O `qa-engineer` passa a nomear a lacuna no veredito quando a task tem essa superfície, e o `art-director` passa a **interagir de verdade** com a tela, não só capturá-la parada.

## Migração para a 3.9

A 3.9 acrescenta a doutrina de padrão de entrega e o gate de composição. O que muda em um projeto existente:

```jsonc
// .maestro/config.json — schemaVersion 5
"deliveryStandard": "release",          // rascunho | release | vitrine
"screenLevels": { "/login": "vitrine" },// eleva telas específicas, nunca rebaixa
"docs": { "composition": "docs/Screen-Composition.md", /* ... */ },
"conventions": {
  "legacyPatterns": [],                 // padrões que este projeto declarou obsoletos
  "maxUiFileLines": 400
},
"gates": { "artDirectorEnabled": true, "maxScreensPerArtAudit": 2 }
```

Passos, na ordem: preencher `legacyPatterns` com os padrões antigos que ainda vivem no projeto; rodar `node scripts/scan-legacy.mjs` para ver o tamanho da dívida; convocar o `product-designer` para escrever a Seção 0 e a Composição das telas existentes; só então ligar o `art-director`. Ligar o gate antes de existir Composição só produz `BLOQUEADO`.

O bloco `docs` também corrige uma falha silenciosa: agentes que citavam `docs/Screen-Blueprints.md` por nome fixo auditavam o vazio em projetos que tinham renomeado o arquivo.

## Migração para a 3.8

Projeto novo não precisa de nada: `/maestro-init` já grava o `config.json` no `schemaVersion 4`.

Projeto que já existe continua funcionando sem tocar em nada — os hooks caem nos padrões embutidos, que são iguais ao template. Rodar `/maestro-init` de novo é seguro (ele nunca sobrescreve arquivo existente) e passa a avisar quais chaves faltam. Para ajustar a política por projeto, acrescente ao `.maestro/config.json`:

```json
{
  "schemaVersion": 4,
  "gates": {
    "foreground": ["code-auditor", "security-auditor", "qa-engineer", "spec-auditor", "memory-manager"]
  },
  "guards": {
    "blockMainThreadAppWrites": true,
    "appPaths": ["src", "lib", "app", "components", "pages", "hooks", "styles", "supabase"]
  }
}
```

Ajuste `appPaths` se o seu repositório guarda código fora dessas pastas, e ponha `blockMainThreadAppWrites: false` se a sessão principal daquele repositório **não** for o Maestro — senão a guarda vai bloquear suas próprias edições.

`ux-auditor` fica de fora de `gates.foreground` de propósito: é o único gate longo, e nove minutos de sessão bloqueada custam mais que o risco, que já está coberto pelo stub de veredito e pela retomada.

## Limitação conhecida

Agentes vindos de plugin ignoram três campos de frontmatter, por segurança: `permissionMode`, `hooks` e `mcpServers`. Todos os outros funcionam, e `tools`, `disallowedTools` e `model` cobrem a maior parte dos casos.

Se precisar de um desses três num agente específico, use `/maestro-eject <agente>`, que copia o arquivo para `.claude/agents/` ou `~/.claude/agents/`, onde os campos voltam a valer.

**Ejeção é empréstimo, não mudança de sede.** A cópia congela na versão do dia e para de receber correção do plugin — e nada avisa quando ela fica para trás, então o projeto passa a rodar com bugs já resolvidos no núcleo. Mudar prompt, `tools`, `model`, `effort` ou `maxTurns` **não** exige ejeção: isso tudo funciona vindo do plugin. Para testar uma alteração antes de publicar, use `claude --plugin-dir <caminho>`, que lê do disco sem cache nem cópia.

O comando registra o motivo e a condição de reversão no cabeçalho da cópia, e o `/maestro-status` compara a versão de cada agente ejetado com a do plugin e reporta drift. Desfazer é apagar o arquivo — mas confira antes se a cópia tem alteração que valha levar para o plugin: `diff .claude/agents/<nome>.md "${CLAUDE_PLUGIN_ROOT}/agents/<nome>.md"`.

## Estrutura do repositório

```text
PluginCode/
├── .claude-plugin/marketplace.json    # catálogo local
├── plugins/maestro/
│   ├── .claude-plugin/plugin.json
│   ├── agents/                        # 18 subagents
│   ├── commands/                      # 9 slash commands
│   ├── doctrine/Padrao-de-Entrega.md  # nível de acabamento exigido
│   ├── hooks/hooks.json
│   ├── scripts/
│   └── templates/project/             # ponto de partida de cada projeto
├── docs/                              # documentação do próprio PluginCode
└── tools/pdf-guide/                   # gerador do guia em PDF
```
