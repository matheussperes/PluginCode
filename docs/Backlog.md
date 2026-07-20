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

### Task 1.3: Agent Definitions (parcial — restante coberto no Stage 2)
- **Status**: ⏳ Em Progresso
- **Modelo Recomendado**: Sonnet
- **Descrição**: Criar definições de agentes em `.maestro/agents/`
- **Arquivos**: 
  - `maestro.md` ✅
  - `frontend-engineer.md` ✅
  - `ux-auditor.md` ✅
  - `solution-architect.md` ⏱️
  - `backend-engineer.md` ⏱️
  - `code-auditor.md` ⏱️
  - `memory-manager.md` ⏱️

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

## Pipeline Stage 3: Agentes Restantes e Automação (⏱️ Futuro)

### Task 3.1: Solution Architect Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Opus

### Task 3.2: Backend Engineer Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Opus

### Task 3.3: Code Auditor Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Sonnet

### Task 3.4: Memory Manager Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Haiku

---

## Legenda de Status
- ✅ Completo
- ⏳ Em Progresso
- ⏱️ Planejado
- 🔴 Bloqueado
