## Passo 1 — Prepare o Ambiente

No projeto consumidor, rode `maestro/core/scripts/bootstrap.sh` para garantir que `node`/`npm` estão disponíveis e que as devDependencies necessárias (`@supabase/supabase-js`, `typescript`, `ts-node`, `dotenv`) estão instaladas.

## Passo 2 — Descreva a Ideia Bruta

Diga ao Maestro que você quer iniciar o Pipeline 01 (Discovery) e descreva o MVP em 1-2 frases. Não é necessário formatar nada — o Solution Architect faz as perguntas necessárias se algo estiver incompleto.

## Passo 3 — Aprove o Discovery

O Solution Architect produz `docs/PRD.md`, `docs/Design-System.md`, `.maestro/tmp/schema.sql` e `docs/Backlog.md`. O Maestro apresenta um resumo e pergunta explicitamente se você aprova antes de avançar — nada é implementado sem essa aprovação.

## Passo 4 — Desenvolvimento por Task

Para cada micro-task do Backlog, o Maestro cria uma branch efêmera (`feature/<task-id>`) e convoca o Executor certo: Backend Engineer para dados/API, Frontend Engineer para interface.

## Passo 5 — Gates de Qualidade

Antes de qualquer merge, a task passa por até três fiscalizadores: Code Auditor (build/lint), Security Auditor (secrets/RLS/OWASP) e UX Auditor (validação visual, usando `maestro/core/scripts/seed-qa-user.ts` para autenticar um usuário de teste no Supabase quando a tela exige login). Qualquer um dos três pode vetar.

## Passo 6 — Circuit Breaker

Se a mesma task falhar a mesma validação duas vezes, a esteira para e o Maestro pede sua orientação diretamente — nada avança sem uma decisão sua.

## Passo 7 — Retrospectiva

Após o merge, o Memory Manager atualiza `Backlog.md`/`Status.md` automaticamente. Ao final de cada sprint, o Improvement Agent registra aprendizados em `docs/Lessons-Learned.md` e cria uma proposta local com `maestro/core/scripts/sync-lessons.sh` para revisão humana.
