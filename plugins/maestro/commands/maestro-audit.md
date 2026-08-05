---
description: Roda os gates de auditoria em uma task ja implementada, sem passar pela execucao
argument-hint: [task-id, ou vazio para a branch atual]
---

Rode os gates de auditoria sobre o trabalho já implementado em **$ARGUMENTS**. Se nada foi informado, use a branch atual e descubra o task-id pelo nome dela.

Use este comando quando o código já existe e você quer só a validação: trabalho feito fora da esteira, correção manual, ou uma segunda opinião antes do merge.

## Sequência

Delegue em ordem, parando no primeiro que reprovar:

1. **code-auditor** — build, lint, tipos
2. **security-auditor** — segredos, RLS, OWASP na diferença da branch
3. **qa-engineer** — comportamento, regressão, casos de borda
4. **ux-auditor** — apenas se houver mudança visual na diferença

Antes de convocar o primeiro gate, prepare o ambiente: `mkdir -p .maestro/tmp/verdicts` e garanta que as dependências estão instaladas (`[ -d node_modules ] || npm ci || npm install`). Gate não é o lugar de descobrir que falta `npm install`.

Cada gate grava seu veredito em `.maestro/tmp/verdicts/<task-id>-<gate>.md`. **Leia o arquivo, não a mensagem de retorno** — um subagente cuja última mensagem termina em chamada de ferramenta tem o texto final descartado pelo CLI, e o que chega parece um agente travado. Arquivo ausente significa gate não executado (reconvoque uma vez, sem contar tentativa); ausente de novo é `gate_indisponivel`, que vai ao operador. Você não emite o veredito no lugar do gate.

**Fast-fail é literal**: ao reprovar num gate, não convoque os seguintes. Um `security-auditor` ou `qa-engineer` convocado depois de o build já ter quebrado gasta contexto para auditar código que vai mudar de qualquer forma. Devolva ao executor e recomece a sequência do início quando ele re-submeter.

Antes de convocar o **security-auditor**, se a diferença tocar autenticação, política de RLS, pagamento, dado pessoal sensível ou segredo de integração, avise o operador de que ele roda em `sonnet` com `effort: high` e ofereça subir o modelo da sessão para `opus` antes de seguir.

Se não existir contrato em `.maestro/state/contracts/<task-id>.md`, avise os auditores de que estão trabalhando sem contrato: eles validarão contra os documentos de descoberta e contra a própria diferença, e o qa-engineer não terá critérios de aceitação para conferir. Registre essa limitação no relatório final.

## Escopo

Os auditores avaliam **a diferença contra a branch principal**, não o repositório inteiro. Problema grave preexistente entra como observação separada, para o operador decidir se abre uma task — não reprova o trabalho atual.

## Fechamento

Consolide num relatório único:

```
## Auditoria — <task-id>

**code-auditor**: aprovado | reprovado
**security-auditor**: aprovado | reprovado | <n> achados
**qa-engineer**: aprovado | reprovado | <n> achados
**ux-auditor**: aprovado | reprovado | não aplicável

**Veredicto**: liberado para merge | correções necessárias | gate indisponível

**Vereditos lidos**: <caminhos em .maestro/tmp/verdicts/>
**Payloads gerados**: <lista de caminhos>
**Gates não executados**: <lista, se houver — nunca contados como aprovados>
**Observações fora do escopo**: <n>
```

Não faça merge. Este comando audita; a decisão de merge é do operador ou do `/maestro-next`.
