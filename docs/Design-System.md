# Design System — PDF Explicativo do Framework .maestro

**Versão**: 1.0.0  
**Escopo**: Aplica-se **apenas** ao PDF gerado por este projeto. Não substitui nem se aplica ao Design System de qualquer aplicação web futura construída com o framework — esse será recriado pelo Solution Architect quando (e se) um projeto de app web for iniciado.

## 1. Formato de Página

- **Tamanho**: A4 (210 × 297mm)
- **Margens**: 25mm topo/base, 20mm laterais
- **Orientação**: Retrato

## 2. Paleta de Cores

Reaproveitada do framework original (`docs/archive/maestro-framework-bootstrap/Design-System.md`) para manter consistência visual entre os artefatos do .maestro:

- **Primary** (títulos, links internos do PDF): `#0052CC`
- **Secondary** (destaques secundários): `#6B21A8`
- **Success** (callouts de dica/boa prática): `#22C55E`
- **Warning** (callouts de atenção): `#F59E0B`
- **Danger** (callouts de Regra Absoluta/Proibição): `#EF4444`
- **Neutros**: `#1F2937` (texto principal), `#6B7280` (texto secundário), `#E5E7EB` (bordas/divisores), `#FFFFFF` (fundo)

## 3. Tipografia

- **Títulos e corpo**: Inter (ou fonte sans-serif equivalente do sistema)
- **Código/monoespaçado**: Fira Code ou Menlo

| Elemento | Tamanho | Peso | Line-height |
|---|---|---|---|
| Título de Capa | 32pt | 700 | 1.2 |
| H1 (seção principal) | 24pt | 700 | 1.2 |
| H2 (subseção, ex: nome do agente) | 18pt | 600 | 1.3 |
| H3 | 14pt | 600 | 1.3 |
| Corpo | 11pt | 400 | 1.4 |
| Código | 10pt | 400 | 1.4 |
| Rodapé/Legenda | 9pt | 400 | 1.3 |

## 4. Componentes do Documento

### Capa
Título, subtítulo, versão do documento, data de geração.

### Sumário
Gerado automaticamente a partir dos headings do conteúdo consolidado, com links internos clicáveis.

### Cabeçalho de Agente
Para cada um dos 9 agentes: nome, arquivo fonte (`.maestro/agents/<nome>.md`), papel em 1 linha, badge textual "⚠️ Poder de Veto" quando aplicável (Security Auditor, UX Auditor).

### Bloco de Código
Fundo levemente cinza (`#F3F4F6`), borda 1px `#E5E7EB`, fonte monoespaçada, respeitando quebras de linha do Markdown fonte.

### Callout de Regra Absoluta / Proibição
Borda esquerda 4px na cor Danger (`#EF4444`), fundo `#FEF2F2`, ícone "🔴" no início do bloco.

### Callout de Dica / Boa Prática
Borda esquerda 4px na cor Success (`#22C55E`), fundo `#F0FDF4`, ícone "💡" no início do bloco.

### Diagrama de Fluxo de Pipeline
Caixas conectadas por setas, cores neutras (`#6B7280` para bordas, `#1F2937` para texto), fonte 10pt — reaproveitar a notação ASCII já usada nos próprios arquivos de pipeline (`.maestro/pipelines/*.md`) e renderizar como imagem/diagrama simples, não texto solto.

### Rodapé
Número de página + "Framework .maestro — Guia de Referência" em todas as páginas exceto a capa.

## 5. Regras de Aplicação

- Nenhuma cor fora desta paleta deve ser usada nos callouts ou diagramas
- Todo bloco de código deve preservar a formatação original do Markdown fonte, sem reformatação manual
- O sumário deve refletir exatamente a ordem definida no outline de conteúdo (Task 2.1 do Backlog deste projeto)
