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

### Task 1.3: Agent Definitions (parcial — restante coberto nos Stages 2 e 3)
- **Status**: ⏳ Em Progresso
- **Modelo Recomendado**: Sonnet
- **Descrição**: Criar definições de agentes em `.maestro/agents/`
- **Arquivos**: 
  - `maestro.md` ✅
  - `frontend-engineer.md` ✅
  - `ux-auditor.md` ✅
  - `code-auditor.md` ✅
  - `memory-manager.md` ✅
  - `improvement-agent.md` ✅
  - `solution-architect.md` ⏱️ (sem stage definido ainda)
  - `backend-engineer.md` ⏱️ (sem stage definido ainda)

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

## Pendências Sem Stage Definido

### Solution Architect Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Opus
- **Descrição**: Desenha arquitetura do MVP, estrutura do banco no Supabase e gera o Design-System.md (aguardando task numerada em um próximo Pipeline Stage)

### Backend Engineer Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Opus
- **Descrição**: Constrói tabelas, schemas, políticas de RLS no Supabase e Edge Functions (aguardando task numerada em um próximo Pipeline Stage)

---

## Legenda de Status
- ✅ Completo
- ⏳ Em Progresso
- ⏱️ Planejado
- 🔴 Bloqueado
