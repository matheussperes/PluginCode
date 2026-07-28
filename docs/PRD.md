# PRD — PDF Explicativo do Framework .maestro

## 1. Visão Geral

Produto: um **documento PDF único, navegável e reprodutível** que explica a estrutura, filosofia e fluxo de trabalho do framework .maestro, para qualquer pessoa que precise entendê-lo sem ler manualmente os ~15 arquivos Markdown espalhados em `.maestro/` e `docs/`.

## 2. Problema vs. Solução

### Problema
O conhecimento do framework está fragmentado em muitos arquivos `.md` (9 agentes, 4 pipelines, 2 contratos, docs de PRD/Design-System/Backlog/Lessons). Não há uma visão consolidada, navegável ou facilmente compartilhável fora do repositório Git. Onboarding de um novo operador ou colaborador exige ler tudo manualmente.

### Solução
Gerar um PDF único a partir das fontes de verdade já existentes no repositório — sem duplicar conteúdo manualmente — com:
- Capa e sumário navegável (links internos)
- Catálogo dos 9 agentes (papel, regras absolutas, proibições)
- Os 4 pipelines declarativos (sequência de convocação, gates, handoffs)
- Regras de governança (Circuit Breaker, protocolos de decline payload)
- Estrutura de diretórios da plataforma
- Guia rápido de "como iniciar um novo projeto com o framework"

## 3. Personas / Público-Alvo

- **Operador humano** que já usa o framework mas quer uma referência offline/compartilhável
- **Novo colaborador** que precisa entender a arquitetura antes de operar a esteira
- **Stakeholder não-técnico** que quer entender o "porquê" do framework (visão executiva)

## 4. Escopo do MVP

### Dentro do escopo
- 1 PDF final, gerado a partir de conteúdo Markdown já existente no repositório
- Conteúdo: Visão Geral, Filosofia, Catálogo de 9 Agentes, os 4 Pipelines, Regras de Governança, Estrutura de Diretórios, Quick-Start
- Processo de geração **repetível via script** — não é um PDF editado manualmente uma única vez; deve poder ser regenerado quando os `.md` fontes mudarem

### Fora do escopo (deste MVP)
- Tradução para outros idiomas
- Versão interativa/HTML navegável (iteração futura, se solicitado)
- Branding ilustrado/profissional — estilo limpo e funcional é suficiente
- Distribuição automática (e-mail, hospedagem) — o MVP entrega apenas o arquivo PDF gerado localmente

## 5. Requisitos Funcionais de Alto Nível

- **RF1**: Deve existir um script de build que lê os arquivos fonte (`.maestro/agents/*.md`, `.maestro/pipelines/*.md`, `.maestro/contracts/*.md`, `docs/archive/maestro-framework-bootstrap/*.md`) e gera um único arquivo PDF de saída
- **RF2**: O PDF deve ter sumário (table of contents) com links internos por seção
- **RF3**: O PDF deve seguir `docs/Design-System.md` deste projeto (tipografia, cores, margens de impressão)
- **RF4**: A geração deve ser reprodutível — rodar o script novamente a partir do mesmo conteúdo-fonte produz o mesmo PDF, sem edição manual
- **RF5**: O PDF final deve ser salvo em caminho previsível (ex: `dist/Maestro-Framework-Guide.pdf`)

## 6. Critérios de Sucesso

- PDF gerado sem erros no script de build
- Sumário/índice funcional, com links para cada seção
- Conteúdo cobre os 9 agentes e os 4 pipelines sem omissão
- Legibilidade validada (fonte, espaçamento, contraste) pelo operador

## 7. Observação Técnica do Solution Architect

Este projeto **não requer armazenamento de dados persistentes nem Supabase** — não há usuários, autenticação ou estado de aplicação a modelar (ver `.maestro/tmp/schema.sql`, marcado como N/A).

Também não é um aplicativo React/Web tradicional: os papéis de **Frontend Engineer** (React/Tailwind/Shadcn) e **Backend Engineer** (Supabase/RLS) não se encaixam diretamente na implementação. A geração do PDF é um problema de **build tooling** — um script Node/TypeScript que renderiza Markdown/HTML e exporta para PDF via Chromium (Playwright, já disponível neste ambiente).

Recomenda-se ao Maestro tratar as tasks de implementação (Pipeline Stages 2 e 3 do Backlog deste projeto) como execução genérica, sem forçar encaixe artificial em `frontend-engineer.md` ou `backend-engineer.md`. Isso é registrado explicitamente aqui para evitar que um Executor tente aplicar regras que não se aplicam a este tipo de entregável.
