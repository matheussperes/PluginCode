# Backlog de Features - Framework .maestro

## Pipeline Stage 1: Fundação (🔵 Em Progresso)

### Task 1.1: Inicialização da Estrutura de Diretórios `.maestro`
- **Status**: ✅ Completo
- **Modelo Recomendado**: Haiku
- **Descrição**: Preparar o repositório template com a estrutura oculta de governança
- **Arquivos**: `.maestro/` + subpastas, `docs/`, `.gitignore`
- **Critérios**: Executar `tree .maestro docs` e validar hierarquia

### Task 1.2: Templates de Contratos de Troca de Estado
- **Status**: ⏳ Em Progresso
- **Modelo Recomendado**: Haiku
- **Descrição**: Criar arquivos de modelo para comunicação entre agentes
- **Arquivos**: 
  - `.maestro/contracts/UX-Decline-Payload-Template.md`
  - `.maestro/contracts/Task-Execution-Contract.md`
- **Critérios**: Arquivos com campos obrigatórios definidos

### Task 1.3: Agent Definitions
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Sonnet
- **Descrição**: Criar definições de agentes em `.maestro/agents/`
- **Arquivos**: 
  - `maestro.md`
  - `solution-architect.md`
  - `frontend-engineer.md`
  - `backend-engineer.md`
  - `code-auditor.md`
  - `ux-auditor.md`
  - `memory-manager.md`

### Task 1.4: Design-System.md e refinamento do Backlog
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Sonnet
- **Descrição**: Estabelecer visual identity e padrões de componentes
- **Critérios**: Design-System.md com guia de cores, tipografia, espaçamento

---

## Pipeline Stage 2: Orquestração e CLI (⏱️ Futuro)

### Task 2.1: Maestro CLI Principal
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Opus
- **Descrição**: Implementar CLI do maestro com commands como `init`, `start-task`, `review`, `approve`

### Task 2.2: Scripts de Inicialização
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Haiku
- **Descrição**: Scripts de seed, migrations, e setup

---

## Pipeline Stage 3: Executores (⏱️ Futuro)

### Task 3.1: Frontend Engineer Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Opus
- **Descrição**: Agente especialista em React/Next.js/Expo

### Task 3.2: Backend Engineer Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Opus
- **Descrição**: Agente especialista em Supabase/TypeScript

### Task 3.3: Code Auditor Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Sonnet
- **Descrição**: Executa linting e type checking

### Task 3.4: UX Auditor Agent
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Opus (Vision)
- **Descrição**: Testa interface via screenshots e validação visual

---

## Legenda de Status
- ✅ Completo
- ⏳ Em Progresso
- ⏱️ Planejado
- 🔴 Bloqueado
