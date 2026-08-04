# Task Execution Contract — Modelo

<!--
MODELO. O Maestro copia para .maestro/state/contracts/<task-id>.md e preenche a copia.
Nunca preencha este arquivo.

Regras de preenchimento (nao copiar para a copia preenchida):
- Contexto e ponteiro, nunca transcricao. Aponte arquivo + secao ou intervalo de linhas.
- O executor recebe so este contrato. Nunca o PRD completo, nunca o historico da sessao.
- Marque apenas os gates que se aplicam.
- Remova estes comentarios HTML da copia preenchida.
-->

## 1. Identificação

- **Task ID**: <task-id>
- **Título**: <titulo>
- **Pipeline Stage**: <stage>
- **Status**: Nova | Em Progresso | Em Revisão | Bloqueada
- **Prioridade**: Crítica | Alta | Normal | Baixa
- **Executor**: frontend-engineer | backend-engineer | integration-engineer | motor-engineer
- **Plataforma**: web | mobile <!-- obrigatorio quando o executor e frontend-engineer -->
- **Modelo**: padrão do agente | <override> — <justificativa em uma linha>
- **Branch**: `feature/<task-id>`
- **Depende de**: <task-ids | nenhuma>

## 2. Requisitos

**Descrição**
<3 a 5 frases objetivas. Sem narrativa de contexto.>

**Critérios de aceitação** <!-- verificaveis por observacao, nao por opiniao -->

- [ ] <criterio_1>
- [ ] <criterio_2>

**Arquivos previstos** <!-- previsao, nao contrato fechado -->

- `<caminho>` [novo | modificado]

## 3. Contexto Mínimo — Ponteiros

<!-- Intervalo de linhas sempre que possivel: o executor abre com Read offset/limit. -->

- **Design System**: `docs/Design-System.md` (linhas <a>–<b> | seção `<nome>`)
- **Blueprint**: `docs/Screen-Blueprints.md` (tela `<nome>`, linhas <a>–<b>)
- **Domínio**: `docs/Modelo-de-Dominio.md` (regra `<nome>`, linhas <a>–<b>)
- **Schema**: `.maestro/tmp/schema.sql` (tabelas `<lista>`)
- **PRD**: RF-<n>
- **Grafo**: `graphify explain "<simbolo-alvo>"` antes de alterar módulo compartilhado
- **Convenções**: `.maestro/config.json` → `conventions`
- **Dados de exemplo**: <inline curto, ou caminho do fixture>

## 4. Gates Aplicáveis

- [ ] **code-auditor**
- [ ] **security-auditor**
- [ ] **qa-engineer**
- [ ] **ux-auditor** — Impacto Visual: Completo | Leve | Nenhum

<!--
Impacto Visual — criterio e raio de alcance, nao tamanho do diff:
Completo = tela nova, layout inteiro, ou componente usado em 2+ telas
Leve     = ajuste especifico de uma tela, sem reuso
Nenhum   = texto ou token existente, sem mudanca estrutural
-->

## 5. Checagem do Executor Antes de Reportar Pronto

- [ ] Lint e checagem de tipos sem erros
- [ ] Testes existentes sem regressão
- [ ] Sem segredo versionado, sem `console.log`, sem código de depuração
- [ ] Commits referenciando o task-id, push em `feature/<task-id>`

## 6. Protocolo de Veto

Reprovação gera payload em `.maestro/tmp/<Security|QA|UX>-Decline-Payload.md`. O executor lê o payload, corrige **apenas o apontado** e re-submete — sem refatoração colateral.

Duas reprovações no mesmo gate: a terceira submissão ativa o Circuit Breaker. Contagem por gate, não agregada. O `code-auditor` é exceção — erro de build, lint ou tipo é autoexplicativo, não gera payload e não conta tentativas.

Se a task revelar lacuna de produto ou de arquitetura, o executor **para e reporta**. Não inventa.

## 7. Estado

`.maestro/state/<task-id>.json`:

```json
{
  "task_id": "",
  "status": "in_progress",
  "current_gate": "code_review",
  "executor": "",
  "attempts": { "security": 0, "qa": 0, "ux": 0 },
  "blockers": [],
  "last_update": ""
}
```

---

**Versão**: 3.0
