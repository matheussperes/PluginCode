# Backlog de Features — PDF Explicativo do Framework .maestro

## Pipeline Stage 1: Discovery & Planning (✅ Completo)

### Task 1.1: Discovery do Projeto
- **Status**: ✅ Completo
- **Modelo Recomendado**: Sonnet
- **Descrição**: Solution Architect transforma a ideia bruta ("um PDF explicando a estrutura do framework") em `docs/PRD.md`, `docs/Design-System.md` (versão documento/impressão), schema de referência (`N/A` — sem dados persistentes) e este Backlog fatiado
- **Arquivos**: `docs/PRD.md`, `docs/Design-System.md`, `.maestro/tmp/schema.sql`, `docs/Backlog.md`
- **Critérios**: Artefatos produzidos e aprovados pelo operador (Gate de Saída do `01-discovery.md`)

---

## Pipeline Stage 2: Extração e Estruturação de Conteúdo (⏱️ Planejado)

### Task 2.1: Inventário e Outline do Conteúdo-Fonte
- **Status**: ✅ Completo
- **Modelo Recomendado**: Haiku
- **Descrição**: Listar e organizar, em ordem lógica de leitura, todos os arquivos fonte que o PDF vai consolidar (9 agentes, 4 pipelines, 2 contratos, docs arquivados do meta-build em `docs/archive/maestro-framework-bootstrap/`), definindo o outline final de capítulos/seções do PDF
- **Arquivos**: `docs/Content-Outline.md`
- **Critérios**: Outline aprovado, sem lacunas — todo agente/pipeline/contrato tem uma seção mapeada

### Task 2.2: Template HTML/CSS do Documento
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Sonnet
- **Descrição**: Criar o template HTML+CSS que define capa, sumário, cabeçalhos de seção, blocos de código e callouts, seguindo `docs/Design-System.md` (versão print). **Nota**: esta task não é "Frontend Engineer" no sentido de React/Shadcn — é HTML/CSS estático para renderização a PDF (ver Observação Técnica em `docs/PRD.md`)
- **Critérios**: Template renderiza corretamente no Chromium local, visualmente conforme `docs/Design-System.md`

---

## Pipeline Stage 3: Geração do PDF (⏱️ Planejado)

### Task 3.1: Script de Build (Markdown → HTML → PDF)
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Sonnet
- **Descrição**: Script Node/TypeScript que lê os arquivos fonte do outline (Task 2.1), injeta no template (Task 2.2), e usa Playwright/Chromium (já disponível no ambiente) para exportar o HTML final como PDF em `dist/Maestro-Framework-Guide.pdf`
- **Arquivos**: script de build (caminho a definir na task, ex: `scripts/build-pdf.ts`)
- **Critérios**: Rodar o script gera um PDF válido, com sumário navegável e todas as seções do outline presentes

### Task 3.2: Revisão de Conteúdo e Diagramas
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Sonnet
- **Descrição**: Revisar o PDF gerado quanto a completude (todos os 9 agentes e 4 pipelines cobertos), legibilidade, e presença de um diagrama de fluxo entre os pipelines
- **Critérios**: Checklist de completude 100% e diagrama de fluxo presente e legível

---

## Pipeline Stage 4: Validação e Entrega (⏱️ Planejado)

### Task 4.1: Validação Final e Aprovação do Operador
- **Status**: ⏱️ Planejado
- **Modelo Recomendado**: Haiku
- **Descrição**: Apresentar o PDF final ao operador para aprovação e registrar a conclusão em `docs/Status.md`
- **Critérios**: Aprovação explícita do operador registrada

---

## Legenda de Status
- ✅ Completo
- ⏳ Em Progresso
- ⏱️ Planejado
- 🔴 Bloqueado
