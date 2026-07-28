# Lessons Learned - Framework .maestro

**Propósito**: Documentar aprendizados, falhas e melhorias iterativas do projeto.

## Template de Lição Aprendida

```markdown
### [Data] - [Título da Lição]
**Contexto**: Quando/Onde aconteceu  
**O que deu errado**: Descrição do problema  
**Por que aconteceu**: Causa raiz  
**O que mudamos**: Ação tomada  
**Resultado**: Impacto medido  
**Aplicação Futura**: Como aplicar esse learning
```

---

## Lições do Pipeline Stage 1 (Fundação)

> Seção será preenchida conforme o projeto progride durante a implementação do framework.

### Padrões Observados
- Agentes especializados têm melhor performance que agentes genéricos
- Contratos de troca de estado reduzem significativamente retrabalho
- Circuit Breaker do UX Auditor previne regressões

### Próximas Iterações
- Monitorar eficiência de tokens por agente
- Medir tempo de conclusão de tasks
- Coletar feedback de usuários sobre UX do framework

---

## Lições do Projeto: PDF Explicativo do Framework .maestro

### 2026-07-20 - Gates formais (Code/Security/UX Auditor) não cobrem projetos fora do molde React+Supabase
**Contexto**: Projeto de 4 Pipeline Stages (Discovery → Extração de Conteúdo → Geração do PDF → Validação), entregando um script de build (Markdown → HTML → PDF via Playwright/Chromium), sem aplicação React nem backend Supabase.
**O que deu errado**: Nenhum dos 3 fiscalizadores formais (Code Auditor, Security Auditor, UX Auditor) foi invocado em nenhuma das 3 tasks de implementação (2.2, 3.1, 3.2) — não havia `npm run lint`/`build` tradicional, nem tabelas Supabase, nem uma tela de app para o UX Auditor navegar. A verificação de qualidade da Task 3.1 ficou restrita a contagens estruturais via regex (número de agentes, badges, callouts), que **passaram integralmente** mesmo com 3 bugs reais presentes no PDF gerado (capa com placeholder não substituído, diagramas ASCII sem `white-space: pre` colapsando, diagrama de fluxo geral ausente).
**Por que aconteceu**: O framework .maestro foi desenhado assumindo que todo Executor entrega uma aplicação web (React/Tailwind/Shadcn) ou dados (Supabase/RLS), com fiscalizadores especializados para cada caso. Não existe, no catálogo atual de 9 agentes, um papel formal para validar entregáveis de *build tooling*/documento (HTML→PDF, scripts de geração), então a verificação foi improvisada ad-hoc (renderização manual via Chromium headless + inspeção de screenshot) em vez de seguir um gate padronizado e repetível.
**O que mudamos**: Task 3.2 passou a exigir explicitamente inspeção visual real (screenshot renderizado, não apenas contagem estrutural) antes de considerar uma task de renderização "completa". Isso encontrou e corrigiu os 3 bugs que a checagem estrutural da Task 3.1 não pegou.
**Resultado**: 3 bugs reais corrigidos antes da entrega final (capa quebrada, diagramas ilegíveis, gap de conteúdo). Sem essa etapa adicional, o PDF teria sido aprovado com a capa mostrando `{{TITLE}}` literalmente.
**Aplicação Futura**: Ao planejar um próximo projeto que produza HTML/PDF/documento (não uma app React/Supabase), o Solution Architect deve registrar explicitamente no PRD que os gates formais não se aplicam e definir um critério de validação visual obrigatório (renderização + screenshot) como substituto do Code/Security/UX Auditor — e não assumir que "sem gate = sem risco de bug".

---

## Índice de Lições por Tema

### Arquitetura
- [Em breve] Estrutura de Branches Efêmeras

### Performance
- [Em breve] Otimização de Contexto

### UX & Design
- [Em breve] Princípios de Validação Visual

### Documentação
- [Em breve] Padrão de Documentação

### Quality Gates
- 2026-07-20 — Gates formais não cobrem projetos fora do molde React+Supabase (ver seção "Lições do Projeto: PDF Explicativo do Framework .maestro")

---

**Última atualização**: 2026-07-20  
**Próxima revisão**: Ao iniciar o próximo projeto/épico neste repositório
