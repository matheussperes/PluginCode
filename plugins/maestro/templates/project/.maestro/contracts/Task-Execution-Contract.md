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
- **Tela-alvo**: <nome — rota> <!-- obrigatorio em toda task de UI; sai do indice de Screen-Composition -->
- **Nível de Acabamento**: release | vitrine <!-- de config.deliveryStandard/screenLevels; elevavel, nunca rebaixavel -->
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
<!-- Nunca peca ao executor uma confirmacao que a ferramenta dele nao consegue produzir
     (ex.: "migration aplicada no projeto real, confirmada sem erro" para um agente
     Bash-only num sandbox que bloqueia escrita em banco). Ou o Maestro confirma antes
     que o caminho existe, ou a aplicacao real vira passo do Maestro/operador apos os
     gates. Contrato impossivel empurra o executor a contornar — foi assim que chaves
     do Supabase acabaram impressas num transcript. -->

- **Design System**: `docs/Design-System.md` (linhas <a>–<b> | seção `<nome>`) + Seção 0 (Direção de Arte)
- **Composição de Tela**: `docs/Screen-Composition.md` (seção `<tela>` — lida INTEIRA, é a régua do art-director)
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
- [ ] **art-director** — gate de TELA, não desta task. Marcado quando esta é a última
      task pendente do Tela-alvo, ou quando esta é a task terminal de composição

<!--
Impacto Visual — criterio e raio de alcance, nao tamanho do diff:
Completo = tela nova, layout inteiro, ou componente usado em 2+ telas
Leve     = ajuste especifico de uma tela, sem reuso
Nenhum   = texto ou token existente, sem mudanca estrutural
-->

## 5. Checagem do Executor Antes de Reportar Pronto

- [ ] Composição da tela seguida: regiões, hierarquia em 3 níveis, ordem de leitura
- [ ] `scan-legacy` retorna 0 nos caminhos da tela (Regra do Raio da Tela)
- [ ] Nenhum arquivo de UI tocado acima de `conventions.maxUiFileLines`
- [ ] Os quatro estados no mesmo nível de acabamento, quando aplicável
- [ ] **Reaproveitamento antes de escrever lógica de domínio nova**: procurei em `lib/` por função equivalente já existente para outra tela do mesmo domínio. Se existia inline num componente, extraí para módulo compartilhado ANTES de duplicar
- [ ] **Posse de ID**: toda escrita que referencia um ID de entidade recebido do cliente é precedida de confirmação explícita de que o ID pertence ao tenant do usuário autenticado, replicando o padrão de qualquer função irmã do mesmo módulo
- [ ] Lint e checagem de tipos sem erros
- [ ] Testes existentes sem regressão
- [ ] Sem segredo versionado, sem `console.log`, sem código de depuração
- [ ] Commits referenciando o task-id, push em `feature/<task-id>`

## 6. Protocolo de Veto

Cada gate grava seu veredito em `.maestro/tmp/verdicts/<task-id>-<gate>.md`. **O arquivo é o veredito** — a mensagem de retorno do agente pode chegar truncada por limitação do CLI, e nesse caso o arquivo continua válido. Arquivo ausente = gate não executado, nunca aprovado por omissão.

Reprovação gera payload em `.maestro/tmp/<Security|QA|UX|Art>-Decline-Payload.md`. O executor lê o payload, corrige **apenas o apontado** e re-submete — sem refatoração colateral.

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
  "gates_indisponiveis": [],
  "blockers": [],
  "last_update": ""
}
```

---

Nenhum achado de acabamento deste ciclo pode ser arquivado como "candidato a task futura": ou vira task no stage corrente, ou vira recusa datada do operador (`maestro.md` Seção 4e).

**Versão**: 4.0
