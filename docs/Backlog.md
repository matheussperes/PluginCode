# Backlog de Features - Framework .maestro

## Pipeline Stage 1: Fundação (🔵 Em Progresso)

### Task 1.1: Inicialização da Estrutura de Diretórios `.maestro`
- **Status**: ✅ Completo
- **Modelo Recomendado**: Haiku
- **Descrição**: Preparar o repositório template com a estrutura oculta de governança
- **Arquivos**: `.maestro/` + subpastas, `docs/`, `.gitignore`
- **Critérios**: Executar `tree .maestro docs` e validar hierarquia

### Task 1.2: Templates de Contratos de Troca de Estado
- **Status**: ✅ Completo
- **Modelo Recomendado**: Haiku
- **Descrição**: Criar arquivos de modelo para comunicação entre agentes
- **Arquivos**: 
  - `.maestro/contracts/UX-Decline-Payload-Template.md`
  - `.maestro/contracts/Task-Execution-Contract.md`
- **Critérios**: Arquivos com campos obrigatórios definidos

### Task 1.3: Agent Definitions
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Criar definições de agentes em `.maestro/agents/`
- **Arquivos**: 
  - `maestro.md` ✅
  - `frontend-engineer.md` ✅
  - `ux-auditor.md` ✅
  - `code-auditor.md` ✅
  - `memory-manager.md` ✅
  - `improvement-agent.md` ✅
  - `solution-architect.md` ✅ (formalizado como Task 4.1A)
  - `backend-engineer.md` ✅ (formalizado como Task 4.1B)

### Task 1.4: Design-System.md e refinamento do Backlog
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Estabelecer visual identity e padrões de componentes
- **Critérios**: Design-System.md com guia de cores, tipografia, espaçamento

---

## Pipeline Stage 2: Prompts de Sistema dos Agentes (Especialistas) (✅ Completo)

### Task 2.1: Agente Maestro e Orquestrador Git
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Prompt de sistema do Maestro — nunca programa, lê Backlog.md, recomenda comando CLI exato, gerencia branches Git efêmeras
- **Arquivos**: `.maestro/agents/maestro.md`
- **Critérios**: Arquivo criado e validado

### Task 2.2: Agente Executor Frontend (React / Tailwind / Shadcn)
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Prompt estrito forçando React + Tailwind + Shadcn/UI, leitura obrigatória do Design-System.md, proibição de CSS arbitrário
- **Arquivos**: `.maestro/agents/frontend-engineer.md`
- **Critérios**: Prompt de sistema testado e gravado

### Task 2.3: Agente Fiscalizador de UX e Script de Seed do Supabase
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet (Com Visão)
- **Descrição**: Script TypeScript de seed do usuário `qa_automation_user@maestro.local` via SDK do Supabase + prompt do UX Auditor com poder de veto e geração de `UX-Decline-Payload.md`
- **Arquivos**: 
  - `.maestro/scripts/seed-qa-user.ts`
  - `.maestro/agents/ux-auditor.md`
- **Critérios**: Script funcional e prompt pronto para interromper a esteira em divergência visual

---

## Pipeline Stage 3: Esteira de Qualidade e Retrospectiva (✅ Completo)

### Task 3.1: Agentes Code Auditor e Memory Manager
- **Status**: ✅ Completo
- **Modelo Recomendado**: Haiku
- **Descrição**: `code-auditor.md` roda `npm run build` e `npm run lint`, retorna apenas erros de compilação sem análise prolixa. `memory-manager.md` lê o resultado da sprint, atualiza status em `Backlog.md` e posição atual em `Status.md`
- **Arquivos**: 
  - `.maestro/agents/code-auditor.md`
  - `.maestro/agents/memory-manager.md`
- **Critérios**: Prompts criados e capazes de rodar checagens sem gastar tokens com análises prolixas

### Task 3.2: Agente de Retrospectiva e Sincronizador de Aprendizados
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: `improvement-agent.md` analisa histórico da sprint (vetos de UX, erros de build) e registra em `Lessons-Learned.md`. `sync-lessons.sh` faz commit/push do arquivo de volta ao repositório template
- **Arquivos**: 
  - `.maestro/agents/improvement-agent.md`
  - `.maestro/scripts/sync-lessons.sh`
- **Critérios**: Agente e script de sincronização prontos e testados (detecção de diff validada; commit/push executado apenas quando há alteração real)

---

## Pipeline Stage 4: Discovery e Planejamento (✅ Completo)

### Task 4.1A: Agente Solution Architect
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet / Opus
- **Descrição**: Agente responsável pelo Discovery (Fase 1) e Planejamento (Fase 2) — transforma ideias brutas em `docs/PRD.md`, `docs/Design-System.md`, especificação do schema inicial do Supabase e divisão de micro-sprints em `docs/Backlog.md`. Nunca programa nem cria arquivos de código de aplicação
- **Arquivos**: `.maestro/agents/solution-architect.md`
- **Critérios**: Arquivo criado com modelo recomendado [Model: Sonnet / Opus]

### Task 4.1B: Agente Backend Engineer (Supabase Specialist)
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Especialista em banco de dados, RLS e Edge Functions. Escreve migrations SQL limpas e retrocompatíveis; toda tabela criada tem `ENABLE ROW LEVEL SECURITY` obrigatório e políticas de RLS explícitas; implementa Edge Functions em TypeScript e integrações de API; lê apenas requisitos de backend em `docs/PRD.md` e no contrato da task
- **Arquivos**: `.maestro/agents/backend-engineer.md`
- **Critérios**: Arquivo criado com modelo recomendado [Model: Sonnet]

### Task 4.1C: Agente Security Auditor
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Fiscalizador de segurança, OWASP e vazamento de dados, com poder de Circuit Breaker. Varre código em busca de secrets hardcoded; valida RLS habilitado em todas as tabelas do Supabase; audita rotas e Edge Functions contra OWASP Top 10 (Broken Access Control, Injection, Sensitive Data Exposure, Security Misconfiguration, Insufficient Logging); em caso de falha, gera `.maestro/tmp/Security-Decline-Payload.md` e aciona o Circuit Breaker de 2 tentativas
- **Arquivos**: `.maestro/agents/security-auditor.md`
- **Critérios**: Arquivo criado com modelo recomendado [Model: Sonnet]

### Task 4.2: Script de Bootstrap de Dependências do Framework
- **Status**: ✅ Completo
- **Modelo Recomendado**: Haiku
- **Descrição**: Script Bash que garante que o ambiente local possui as ferramentas para rodar os scripts TypeScript do `.maestro` (ex: `seed-qa-user.ts`). Verifica `node`/`npm` instalados; cria `package.json` via `npm init -y` se ausente; instala como `devDependencies` as ausentes entre `@supabase/supabase-js`, `typescript`, `ts-node`, `dotenv`; exibe confirmação final
- **Arquivos**: `.maestro/scripts/bootstrap.sh`
- **Critérios**: Script criado, marcado como executável (`chmod +x`) e testado via terminal — validado em dois cenários: (1) sem `package.json`, cria e instala todas as dependências; (2) com dependências já presentes, detecta e não reinstala nada

---

## Pipeline Stage 5: Documentação Declarativa dos Pipelines (✅ Completo)

### Task 5.1: Pipeline 01 — Discovery & Planning
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Fluxo declarativo que instrui o Maestro a convocar o Solution Architect a partir de uma ideia bruta, produzindo `docs/PRD.md`, `docs/Design-System.md`, schema SQL inicial em `.maestro/tmp/schema.sql` e `docs/Backlog.md` fatiado em micro-tasks. Gate de saída: aprovação explícita do operador antes de avançar para Development
- **Arquivos**: `.maestro/pipelines/01-discovery.md`
- **Critérios**: Arquivo criado com a sequência de comandos e artefatos esperados

### Task 5.2: Pipeline 02 — Development
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Fluxo declarativo que instrui o Maestro a ler a próxima micro-task do Backlog, criar a branch efêmera (`git checkout -b feature/<task-id>`), preencher o `Task-Execution-Contract.md`, e rotear para `backend-engineer.md` (banco/API) e/ou `frontend-engineer.md` (interface, lendo Design-System.md). Saída: código alterado e compilando localmente
- **Arquivos**: `.maestro/pipelines/02-development.md`
- **Critérios**: Arquivo criado com a ordem e regras de branching

### Task 5.3: Pipeline 03 — Quality & Audit Gates
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Fluxo declarativo com a sequência exata de fiscalização — Code Auditor (build/lint) → Security Auditor (secrets/RLS, gera `Security-Decline-Payload.md`) → UX Auditor (seed QA + servidor local + visão, gera `UX-Decline-Payload.md`). Circuit Breaker de no máximo 2 tentativas por gate antes de travar a esteira. Aprovação nos 3 gates autoriza `git checkout main && git merge feature/<task-id>`
- **Arquivos**: `.maestro/pipelines/03-quality.md`
- **Critérios**: Arquivo criado com a ordem e regras dos gatilhos de veto

### Task 5.4: Pipeline 04 — Retrospective & Sync
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Fluxo declarativo que instrui o Maestro a convocar o Memory Manager após toda task (marca conclusão em Backlog.md, atualiza Status.md) e o Improvement Agent ao final de Sprint/Stage (registra aprendizados em Lessons-Learned.md), seguido da execução de `sync-lessons.sh` para sincronizar com o repositório base
- **Arquivos**: `.maestro/pipelines/04-retrospective.md`
- **Critérios**: Arquivo criado e validado

---

## Legenda de Status
- ✅ Completo
- ⏳ Em Progresso
- ⏱️ Planejado
- 🔴 Bloqueado
