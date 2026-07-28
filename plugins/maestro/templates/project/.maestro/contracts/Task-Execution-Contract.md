# Task Execution Contract — Modelo

> Este é o modelo. Para cada task, o Maestro copia este arquivo para `.maestro/state/contracts/<task-id>.md` e preenche **somente a cópia**. Nunca preencha este arquivo.

**Propósito**: contrato de entrada entre o Maestro e o executor. Garante que o executor recebe contexto suficiente sem receber o projeto inteiro.

---

## 1. Identificação

- **Task ID**:
- **Título**:
- **Pipeline Stage**:
- **Status**: Nova | Em Progresso | Em Revisão | Bloqueada
- **Prioridade**: Crítica | Alta | Normal | Baixa
- **Executor**: frontend-engineer | backend-engineer | integration-engineer | motor-engineer
- **Modelo**: padrão do agente, ou override com justificativa
- **Branch**: `feature/<task-id>`
- **Depende de**:

---

## 2. Requisitos

### Descrição

```
3 a 5 frases objetivas sobre o que precisa ser feito.
Específico, sem narrativa de contexto.
```

### Critérios de aceitação

Cada critério é verificável por observação, não por opinião.

- [ ]
- [ ]
- [ ]

### Arquivos previstos

```
caminho/do/arquivo    [novo | modificado]
```

Lista prevista, não contrato fechado. Se o trabalho exigir tocar outro arquivo, o executor toca e reporta.

---

## 3. Contexto Mínimo

Aponte **seções específicas**, nunca documentos inteiros. Isso é o que mantém o executor barato e preciso.

- **Design System**: `docs/Design-System.md#<seção>`
- **Blueprint da tela**: `docs/Screen-Blueprints.md#<tela>`
- **Modelo de domínio**: `docs/Modelo-de-Dominio.md#<regra>`
- **Schema de referência**: `.maestro/tmp/schema.sql`, tabelas `<lista>`
- **Requisito do PRD**: RF-<n>

### Restrições técnicas

Convenções deste projeto que o executor precisa respeitar. Consulte `.maestro/config.json`.

### Dados de exemplo

```json
{}
```

---

## 4. Gates Aplicáveis

Marque os que se aplicam a esta task. O Maestro decide com base na natureza do trabalho.

- [ ] **code-auditor** — sempre
- [ ] **security-auditor** — sempre
- [ ] **qa-engineer** — sempre, com escopo condicional
- [ ] **ux-auditor** — apenas se houver mudança visual

### Checagem do executor antes de reportar pronto

- [ ] Lint sem erros
- [ ] Checagem de tipos sem erros
- [ ] Testes existentes sem regressão
- [ ] Sem segredo em código versionado
- [ ] Sem `console.log` ou código de depuração
- [ ] Commits claros referenciando o task-id
- [ ] Push na branch efêmera, nunca na principal

---

## 5. Protocolo de Veto

Reprovação em security, QA ou UX gera payload em `.maestro/tmp/`:

- `Security-Decline-Payload.md`
- `QA-Decline-Payload.md`
- `UX-Decline-Payload.md`

O executor lê o payload, corrige **apenas o apontado** e re-submete. Sem refatoração colateral.

Duas reprovações no mesmo gate: a terceira submissão ativa o Circuit Breaker e para a esteira. A contagem é por gate, não agregada.

O code-auditor é a exceção: erro de build, lint ou tipo é autoexplicativo, não gera payload e não conta tentativas.

---

## 6. Estado

O Maestro mantém `.maestro/state/<task-id>.json`:

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

## Notas

1. **Contexto limpo**: o executor recebe apenas este contrato. Nunca o PRD completo, nunca o histórico da sessão.
2. **Lacuna de especificação**: se a task revelar que falta uma decisão de produto ou arquitetura, o executor para e reporta. Não inventa.
3. **Escopo**: o executor entrega o que o contrato pede. Melhoria adjacente que ele identificar vira observação no relatório, não código.

---

**Versão**: 2.0
