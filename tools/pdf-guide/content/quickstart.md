## Passo 1 — Instale o Plugin

Registre o repositório como marketplace local, uma vez só na máquina:

```
claude plugin marketplace add D:\Github\PluginCode
claude plugin install maestro@plugincode
```

A partir daí os 17 agentes e os 7 comandos ficam disponíveis em todos os seus projetos. Não há pasta para copiar nem symlink para criar.

## Passo 2 — Prepare o Projeto

Dentro do projeto, rode `/maestro-init` uma vez. Ele cria `.maestro/` para o estado da esteira, `docs/` para a especificação e o `CLAUDE.md` de integração. É idempotente: rodar de novo não sobrescreve nada.

Preencha a seção `conventions` de `.maestro/config.json` com os caminhos e scripts reais do repositório — é o que evita os executores deduzirem.

## Passo 3 — Descreva a Ideia Bruta

Rode `/maestro-discovery` e descreva o MVP em uma ou duas frases. Não é necessário formatar nada.

O Product Strategist não escreve nenhum artefato antes de fechar as lacunas: ele devolve de 3 a 5 perguntas decisórias e espera a sua resposta. É o que impede uma ideia vaga de virar um produto que ninguém pediu.

## Passo 4 — Aprove a Descoberta

Cinco especialistas produzem, em sequência, o PRD e a estratégia de negócio, os blueprints de tela, o design system, o schema de dados com o modelo de domínio, e o backlog fatiado.

O Spec Auditor então cruza os cinco documentos entre si, confere a aritmética dos exemplos numéricos e responde à pergunta de fundo: o backlog ainda entrega a ideia original? Ele tem poder de veto. Só depois da aprovação dele o Maestro apresenta o resumo e pede a sua liberação — nada é implementado sem ela.

## Passo 5 — Desenvolvimento por Task

Rode `/maestro-next`. Para cada micro-task, o Maestro cria uma branch efêmera `feature/<task-id>`, preenche o contrato de execução e convoca o executor certo: Backend Engineer para dados e API, Frontend Engineer para interface, Integration Engineer para serviço externo, Motor Engineer para cálculo de domínio.

O executor recebe apenas o contrato preenchido — nunca o PRD completo nem o histórico da sessão.

## Passo 6 — Gates de Qualidade

Antes de qualquer merge, a task passa pelos gates em ordem, do mais barato ao mais caro:

1. **Code Auditor** — build, lint e tipos
2. **Security Auditor** — segredos, RLS e OWASP na diferença da branch
3. **QA Engineer** — comportamento, regressão e casos de borda
4. **UX Auditor** — validação visual com evidência, apenas se houver mudança de tela

Os três últimos têm poder de veto e geram um payload estruturado de reprovação em `.maestro/tmp/`.

## Passo 7 — Circuit Breaker

Duas reprovações da mesma task no mesmo gate: a terceira submissão para a esteira e o Maestro pede a sua orientação. A contagem é por gate, não agregada — aprovação prévia em segurança não zera o contador de UX.

## Passo 8 — Retrospectiva

Após o merge, o Memory Manager sincroniza `Backlog.md` e `Status.md` automaticamente. Ao final de cada stage, `/maestro-retro` aciona o Improvement Agent, que extrai padrões do registro objetivo em `.maestro/logs/agents.jsonl` e dos payloads de veto.

Quando um aprendizado é reutilizável em qualquer projeto, ele vira uma proposta em `.maestro/proposals/`. Nenhum agente altera o framework por conta própria — a promoção ao plugin exige a sua decisão.
