# Instruções do Projeto

## Esteira Maestro

Este projeto usa a esteira de agentes do plugin **Maestro**.

Quando o operador disser "aja como o Maestro", ou pedir o próximo passo do projeto, delegue ao agente `maestro:maestro`. Ele lê o estado, decide qual especialista deve agir e coordena a esteira.

### Comandos

| Comando | Quando usar |
|---|---|
| `/maestro-init` | Uma vez por projeto, para criar a estrutura |
| `/maestro-discovery` | Projeto novo ou mudança de escopo relevante |
| `/maestro-next` | Executar a próxima task do backlog |
| `/maestro-status` | Ver o estado real, cruzado com o git |
| `/maestro-audit` | Auditar trabalho já implementado |
| `/maestro-stage-close` | Fechar um Pipeline Stage com critério de lançamento (seis checagens) |
| `/maestro-retro` | Retrospectiva ao final de um stage — normalmente chamada pelo stage-close |
| `/maestro-visual-kit` | Gerar prompts de logo, telas e criativo de lançamento para ferramentas externas de imagem |

### Padrão de entrega

`.maestro/config.json` declara `deliveryStandard` — o nível de acabamento exigido deste projeto — e `screenLevels`, que eleva telas específicas. **Acabamento não é escopo extra: é requisito.** Escopo encolhe em funcionalidade, nunca em acabamento; e nenhum defeito de acabamento é arquivado como "task futura" sem uma recusa datada do operador.

A doutrina completa está em `doctrine/Padrao-de-Entrega.md`, na raiz do plugin.

### Gates de qualidade visual

| Gate | Pergunta que ele responde | Contra o quê |
|---|---|---|
| `ux-auditor` | Os valores estão certos? | `docs/Design-System.md` |
| `art-director` | Isto ficou bom? | `docs/Screen-Composition.md` + Seção 0 do Design System |

O `ux-auditor` é gate de **task**; o `art-director` é gate de **tela** e roda depois dele, em levas de no máximo duas telas. O que o `ux-auditor` observa e não pode vetar não morre: vai para a seção `## Encaminhado ao art-director` do veredito dele.

### Territórios

| Caminho | Natureza | Quem escreve |
|---|---|---|
| `docs/` | Especificação deste projeto | Squad de descoberta e memory-manager |
| `.maestro/` | Estado efêmero desta esteira | Maestro e agentes |
| Código de aplicação | Implementação | Somente o squad de execução |

Regras que valem sempre:

- Estado de execução nunca sai de `.maestro/` — não escreva estado no diretório do plugin
- Lição aprendida fica primeiro neste projeto. Se for reutilizável, vira proposta em `.maestro/proposals/` e aguarda decisão humana antes de alterar o framework
- Executor recebe o contrato preenchido da task, não o PRD completo
- Nenhum agente lê documento inteiro. O contrato aponta arquivo e intervalo de linhas; o resto se localiza com `Grep`
- Descoberta de dependência é consulta ao grafo (`graphify explain`), nunca varredura com `Glob`/`Grep` em vários arquivos

### Grafo de código

Este projeto usa o **Graphify** como pré-requisito da esteira. O grafo vive em `graphify-out/` (ignorado pelo git) e é o que substitui a varredura de repositório pelos executores.

| Operação | Onde roda |
|---|---|
| Construir (`/graphify .`) | Sessão principal, uma vez, em `/maestro-init` ou ao fim de `/maestro-discovery` |
| Atualizar (`graphify update <caminhos>`) | Camada de comando, após cada merge em `/maestro-next` |
| Consultar (`graphify explain` / `path` / `query`) | Executores e auditores, durante a task |

Se `graphify-out/` não existir, o agente para e reporta em vez de cair em varredura ampla.

### Vereditos de gate

Todo gate grava `.maestro/tmp/verdicts/<task-id>-<gate>.md` **antes** de responder, e o Maestro lê o arquivo em vez da mensagem de retorno. Isso contorna um bug do CLI que descarta o texto final de um subagente quando a última mensagem dele termina em chamada de ferramenta — o gate conclui a auditoria e o chamador recebe só a narração do meio.

| Situação | Leitura correta |
|---|---|
| Arquivo com `APROVADO` | Gate aprovado, mesmo com a mensagem truncada |
| Arquivo com `REPROVADO` | Volta ao executor, conta tentativa |
| Arquivo com `BLOQUEADO` | Gate não conseguiu auditar, não conta tentativa |
| Arquivo ausente | Gate não executado — nunca aprovado por omissão |

O veredito do `art-director` é por tela ou por stage: `.maestro/tmp/verdicts/tela-<slug>-art.md` e `stage-<n>-art.md`.

O Maestro **não emite veredito de gate no lugar dele**. Se um gate falhar duas vezes por motivo técnico, o estado é `gate_indisponivel` e a decisão de seguir é do operador, registrada no Backlog como "não executado (autorizado)" — nunca como "aprovado".

### Encerramento de rodada

Ao concluir uma task ou encerrar um stage, o comando pergunta se os aprendizados e o histórico devem ir para o cofre do Obsidian. Respondendo sim, a nota é criada pelas skills `obsidian:obsidian-markdown` (formato) e `obsidian:obsidian-cli` (gravação no cofre), do plugin `obsidian`. Sem esse plugin, o comando cai para `obsidian.vaultPathFallback` do `.maestro/config.json`, ou entrega a nota em `.maestro/tmp/obsidian/`.

A pergunta é feita na sessão principal — subagentes não conseguem perguntar nada ao operador.

### Maestro como agente principal

`.claude/settings.json` declara `"agent": "maestro:maestro"`, o que faz o Maestro ser a thread principal das sessões abertas aqui — ele ganha `AskUserQuestion` para falar direto com você, recebe as notificações dos próprios gates, e os gates rodam um nível acima de profundidade. O escopo é deste projeto apenas.

Para uma sessão normal, sem a esteira: `claude --agent claude`.

### Convenções deste projeto

Preencha a seção `conventions` do `.maestro/config.json` para que os executores sigam os caminhos e scripts reais deste repositório, em vez de deduzir.

O campo `platforms` declara quais clientes o projeto tem hoje (`"ativo"`) e quais ainda não começou (`"nao_iniciado"`). A maioria dos projetos começa só com `web: "ativo"` e `mobile: "nao_iniciado"` — quando chegar a hora de portar para mobile, mude `mobile` para `"ativo"` e rode `/maestro-discovery` novamente. O Maestro detecta que é ativação de plataforma, não projeto novo, e convoca só o `product-designer` (para declarar Moti e a biblioteca de componentes mobile) e o `backlog-planner` (para criar as tasks de portagem) — PRD, Blueprints, schema e regras de domínio já existentes não são refeitos.

---

<!-- Adicione abaixo as instruções específicas do seu projeto -->
