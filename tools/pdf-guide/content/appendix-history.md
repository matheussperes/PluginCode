O framework .maestro descrito neste guia foi ele próprio construído seguindo seus próprios princípios, em 5 Pipeline Stages:

- **Stage 1** — Fundação do sistema de arquivos (`.maestro/`, `docs/`) e templates de contratos de troca de estado.
- **Stage 2** — Prompts de sistema dos primeiros agentes especialistas (Maestro, Frontend Engineer, UX Auditor) e o script de seed do Supabase.
- **Stage 3** — Esteira de qualidade e retrospectiva (Code Auditor, Memory Manager, Improvement Agent, script de sincronização de aprendizados).
- **Stage 4** — Agentes de Discovery e execução restantes (Solution Architect, Backend Engineer, Security Auditor) e o script de bootstrap de dependências.
- **Stage 5** — Os 4 documentos de pipeline declarativo que conectam todos os agentes em um fluxo executável.

Os artefatos originais dessa fase — PRD, Design System, Backlog e Status do próprio framework — foram preservados em `docs/archive/maestro-framework-bootstrap/` para consulta, e não são reproduzidos aqui na íntegra.

## Evolução posterior

**v2 — separação de territórios.** A pasta `.maestro/` na raiz acumulava dois papéis incompatíveis: núcleo compartilhado e estado de execução. Com vários projetos apontando para o mesmo framework, todos escreveriam nos mesmos arquivos temporários. O núcleo foi isolado do estado, que passou a viver em `.maestro/` de cada projeto.

**v3 — plugin e squads.** Duas mudanças estruturais.

A primeira é de distribuição: o framework virou um plugin nativo do Claude Code. Antes, os agentes eram documentos em prosa lidos na mesma conversa — nove personas de um único ator, dividindo uma janela de contexto. Agora cada um é um subagent real, com contexto próprio, modelo próprio e ferramentas restritas. A regra "o Maestro nunca escreve código" deixou de ser uma promessa no prompt e virou uma restrição efetiva.

A segunda é de composição. O Solution Architect concentrava PRD, design system, modelo de dados e backlog — quatro especialidades num contexto só, o que produzia versões superficiais de todas. Ele foi dividido em cinco especialistas sequenciais, com um novo gate de coerência cruzada entre eles, o Spec Auditor. O squad de execução ganhou Integration Engineer e Motor Engineer; o de auditoria, o QA Engineer.
