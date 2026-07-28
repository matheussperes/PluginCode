# PRD Mestre do Framework .maestro

## 1. Visão Geral e Filosofia do Produto

O .maestro Framework é uma plataforma de engenharia de software baseada em agentes e orientada por arquivos (File-System Based). Ele transforma o Claude Code em uma linha de produção ágil, separando estritamente os papéis de quem constrói (Executores) de quem valida (Fiscalizadores/Auditores).

## 2. Problema vs. Solução

### Problema Atual no Claude Code
- **Código Frankenstein**: Modificações desordenadas que misturam arquiteturas e quebram módulos
- **Interfaces Feias / Pobre UX**: Componentes brutos, desalinhados e fluxos confusos
- **Estouro de Tokens & Sessões Longas**: Reenvio de históricos massivos e PRDs gigantes
- **Uso Ineficiente de Modelos Caros**: Usar Opus/Fable para criar funções simples
- **Perda de Estado na Troca de Sessão**: Ter que pedir Base.md e Status.md

### Solução do Framework .maestro
- **Isolamento via Git**: Toda task roda em uma branch efêmera e só faz merge após aprovação total
- **UX Auditor Multimodal**: O agente sobe a aplicação local, tira screenshots, testa cliques e reprova layouts fora do Design-System
- **Contexto Mínimo via Contratos**: Agentes leem apenas resumos e payloads específicos
- **Model Routing Tagging**: Cada task no Backlog vem com a indicação do modelo ideal
- **Memory Manager**: Agente silencioso de documentação que atualiza o estado

## 3. Catálogo de Agentes

### Agentes de Estratégia e Planejamento
- **Maestro**: Tech Lead, PO e Scrum Master. Decide qual especialista convocar
- **Solution Architect**: Desenha a arquitetura do MVP

### Agentes Executores (Builders)
- **Frontend Engineer**: Constrói interfaces em React com Tailwind e Shadcn/UI
- **Backend Engineer**: Constrói tabelas, schemas, políticas de RLS no Supabase

### Agentes Fiscalizadores (Auditores / Quality Gates)
- **Code Auditor**: Roda comandos estáticos (lint, tsc)
- **UX Auditor**: Executa testes visuais da aplicação

### Agente de Memória e Retrospectiva
- **Memory Manager**: Atualiza Status.md e Backlog.md
- **Improvement Agent**: Analisa falhas e grava lições aprendidas

## 4. Estrutura de Diretórios

```
.maestro/
├── agents/           # Definições dos agentes especializados
├── contracts/        # Templates de troca de estado
├── scripts/          # Scripts de automação
├── pipelines/        # Definições dos pipelines
└── tmp/              # Arquivos temporários (gitignore)

docs/
├── PRD.md            # Este arquivo
├── Design-System.md  # Especificações de design
├── Backlog.md        # Lista de tasks
├── Status.md         # Estado atual do projeto
└── Lessons-Learned.md # Lições aprendidas
```

## 5. Regras de Governança e Circuit Breaker

### Protocolo de Veto do UX Auditor
O UX Auditor tem poder de circuit breaker para reprovar implementações que violem o Design-System.

### Regra de 2 Tentativas
1. Tentativa 1: Frontend lê `UX-Decline-Payload.md` e ajusta
2. Tentativa 2: Frontend tenta novamente
3. Se falhar na Tentativa 2: Pausa e solicita orientação humana
