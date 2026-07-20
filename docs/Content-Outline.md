# Outline de Conteúdo — Guia PDF do Framework .maestro

**Task**: 2.1 — Inventário e Outline do Conteúdo-Fonte  
**Status**: Aguardando aprovação do operador

Este documento define a ordem final de capítulos/seções do PDF e mapeia cada seção ao(s) arquivo(s) fonte que a alimentam. Nenhum conteúdo é duplicado manualmente aqui — a Task 3.1 (script de build) lerá os arquivos fonte listados e os injetará no template da Task 2.2.

## Capa
- Título, subtítulo, versão, data de geração (gerado pelo script de build, sem fonte Markdown própria)

## Sumário
- Gerado automaticamente a partir dos headings de cada capítulo (sem fonte própria)

## Capítulo 1 — Visão Geral e Filosofia
**Fonte**: `docs/archive/maestro-framework-bootstrap/PRD.md` (Seções 1 e 2)
- Visão geral e filosofia do produto
- Problema vs. Solução (Código Frankenstein, UX pobre, estouro de tokens, uso ineficiente de modelos, perda de estado)

## Capítulo 2 — Estrutura de Diretórios da Plataforma
**Fonte**: `docs/archive/maestro-framework-bootstrap/PRD.md` (Seção 4)
- Árvore completa de `.maestro/` e `docs/`

## Capítulo 3 — Catálogo de Agentes
**Fonte primária**: `docs/archive/maestro-framework-bootstrap/PRD.md` (Seção 3, catálogo)  
**Fonte detalhada**: um `.maestro/agents/*.md` por subseção, na ordem abaixo (agrupados por categoria, refletindo o diagrama de arquitetura do PRD original):

1. **Orquestrador** — `maestro.md`
2. **Estratégia e Planejamento** — `solution-architect.md`
3. **Executores (Builders)**
   - `frontend-engineer.md`
   - `backend-engineer.md`
4. **Fiscalizadores (Auditores / Quality Gates)**
   - `code-auditor.md`
   - `security-auditor.md`
   - `ux-auditor.md`
5. **Memória e Retrospectiva**
   - `memory-manager.md`
   - `improvement-agent.md`

Para cada agente: nome, papel em 1 linha, regras absolutas/proibições (destacadas como callout de Regra Absoluta), poder de veto quando aplicável.

## Capítulo 4 — Pipelines Declarativos
**Fonte**: um `.maestro/pipelines/*.md` por subseção, na ordem de execução real:

1. `01-discovery.md` — Discovery & Planning (com o gate de aprovação humana)
2. `02-development.md` — Development (branch efêmera + roteamento por tipo de task)
3. `03-quality.md` — Quality & Audit Gates (os 3 gates + Circuit Breaker)
4. `04-retrospective.md` — Retrospective & Sync (Memory Manager + Improvement Agent)

Incluir um diagrama de fluxo simples conectando as 4 fases (produzido na Task 3.1, a partir da notação ASCII já presente nesses arquivos).

## Capítulo 5 — Contratos de Troca de Estado
**Fonte**: `.maestro/contracts/*.md`
- `Task-Execution-Contract.md` — contrato de entrada do Executor
- `UX-Decline-Payload-Template.md` — payload de reprovação do UX Auditor (mencionar também o `Security-Decline-Payload.md`, que segue estrutura análoga definida em `security-auditor.md`, embora não tenha arquivo de template próprio em `contracts/`)

## Capítulo 6 — Governança e Circuit Breaker
**Fonte**: `docs/archive/maestro-framework-bootstrap/PRD.md` (Seção 5) + detalhes de protocolo em `security-auditor.md` e `ux-auditor.md`
- Protocolo de Veto (UX e Security Auditor)
- Regra de 2 Tentativas e ativação do Circuit Breaker
- Contagem de tentativas por gate, não agregada (conforme `03-quality.md`)

## Capítulo 7 — Guia Rápido: Como Iniciar um Novo Projeto
**Fonte**: síntese original (não copiada de um único arquivo), referenciando o fluxo real de `01-discovery.md` e os scripts `bootstrap.sh`/`seed-qa-user.ts`
- Passo a passo: da ideia bruta até o primeiro merge aprovado

## Apêndice — Histórico da Construção do Framework
**Fonte**: `docs/archive/maestro-framework-bootstrap/Backlog.md` e `Status.md`
- Nota breve para quem quiser ver como o próprio .maestro foi construído (Pipeline Stages 1-5), sem reproduzir o conteúdo completo — apenas um resumo e referência ao repositório

---

## Verificação de Completude
- [x] 9 agentes mapeados (Capítulo 3)
- [x] 4 pipelines mapeados (Capítulo 4)
- [x] 2 contratos mapeados (Capítulo 5)
- [x] Conteúdo de filosofia/visão geral mapeado (Capítulo 1)
- [x] Estrutura de diretórios mapeada (Capítulo 2)
- [x] Governança mapeada (Capítulo 6)
- [x] Nenhuma fonte órfã — todo arquivo em `.maestro/agents/`, `.maestro/pipelines/`, `.maestro/contracts/` e `docs/archive/maestro-framework-bootstrap/` tem uma seção de destino
