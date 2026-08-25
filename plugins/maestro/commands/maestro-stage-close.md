---
description: Fecha um Pipeline Stage com criterio de lancamento, nao apenas com tasks mescladas
argument-hint: [numero do stage, ou vazio para o stage corrente]
---

Feche o Pipeline Stage informado em **$ARGUMENTS**, ou o stage corrente segundo `docs/Status.md`.

Aja como o **maestro**: você coordena e verifica, não implementa e não emite veredito de gate.

> Um stage encerrado é uma promessa: aquilo está pronto. Fechar com task mesclada
> e teste verde, mas com a tela ainda amadora e a dívida de acabamento arquivada,
> é a forma mais cara de mentir para si mesmo — porque o custo só aparece semanas
> depois, em retrofit.

## 1. Pré-condições

- Todas as tasks do stage com status `✅ Concluído` no `docs/Backlog.md`
- Nenhuma task do stage em `.maestro/state/` com gate pendente
- Branch principal atualizada, sem branch `feature/*` do stage viva

Se qualquer uma falhar, reporte o que falta e **pare**. Este comando não fecha stage pela metade.

## 2. Os seis critérios

Verifique na ordem. O primeiro que falhar interrompe o fechamento.

### 2.1 Tasks mescladas

Confirme por `git log` que cada task do stage tem merge na branch principal. Task aprovada em todos os gates e não mesclada é estado inconsistente: resolva antes de seguir.

### 2.2 Suíte completa verde

```bash
npm run test   # ou o script que o projeto realmente tem — leia package.json
```

A suíte **completa**, não os testes afetados. Durante o stage o `qa-engineer` roda só o subconjunto da task; o custo da suíte inteira se paga uma vez, aqui.

### 2.3 Diretor de Arte aprovado em cada tela tocada

Levante as telas que o stage tocou — pelos caminhos dos diffs e pelo campo **Tela-alvo** dos contratos. Para cada uma, leia `.maestro/tmp/verdicts/tela-<slug>-art.md`.

```
APROVADO em todas as telas          → siga
REPROVADO em alguma                 → as correções viram tasks de acabamento NESTE stage.
                                      O stage não fecha. Não arquive o achado
BLOQUEADO                           → destrave o impedimento e reconvoque. Não conta tentativa
Arquivo ausente para alguma tela    → o gate não rodou. Convoque o art-director agora,
                                      respeitando o teto de duas telas por convocação
```

Convoque em levas de no máximo duas telas. Você **não** emite este veredito no lugar dele, em nenhuma circunstância — vale aqui a mesma regra da Seção 4c do `maestro.md`.

### 2.4 Coexistência de padrões igual a zero

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/scan-legacy.mjs" <caminhos das telas do stage>
```

O script lê `legacyPatterns` do `.maestro/config.json` e devolve a contagem por arquivo.

```
0 ocorrências                → siga
> 0 nos caminhos do stage    → task de erradicação NESTE stage. O stage não fecha
> 0 fora do stage            → registre o número no relatório de fechamento como
                               dívida conhecida e datada. Não bloqueia este stage
legacyPatterns vazio         → nada a verificar. Registre isso explicitamente:
                               ausência de lista não é ausência de dívida
```

### 2.5 Zero dívida de acabamento arquivada em silêncio

Compare as seções de "Gaps … sem task própria ainda" do `docs/Backlog.md` com o estado delas na abertura do stage.

**Nenhum item novo originado neste stage pode permanecer ali.** Para cada um, exatamente duas saídas:

1. Vira **task de acabamento neste stage** — e o stage não fecha até ela fechar
2. Vira **recusa explícita do operador**, registrada no Backlog como
   `aceito lançar com isto — <motivo> — <data> — autorizado por <operador>`

Pergunte ao operador, item a item, listando o achado e o custo estimado da correção. Se estiver rodando como subagente e não tiver `AskUserQuestion`, devolva a lista como parte da sua resposta e deixe a sessão principal conduzir. **Nunca simule a decisão do operador**, e nunca use o silêncio como aprovação.

### 2.6 Teto de arquivo de UI respeitado

```bash
find <caminhos de UI do stage> -name "*.tsx" -o -name "*.jsx" | xargs wc -l | sort -rn | head -20
```

Arquivo acima de `maxUiFileLines` (`.maestro/config.json`) é task de decomposição neste stage. Um arquivo que passou do teto não é um arquivo grande: é uma tela que ninguém consegue auditar visualmente, e a próxima task nele vai custar o dobro.

## 3. Fechamento

Com os seis critérios verdes, na ordem:

1. **Retrospectiva** — delegue ao `improvement-agent`
2. **Documentação** — delegue ao `memory-manager` para sincronizar `docs/Status.md` e `docs/Backlog.md`, marcando o stage como encerrado e registrando as recusas explícitas do critério 2.5
3. **Grafo** — `graphify update <caminhos do stage> --no-cluster`
4. **Commit e push** da branch principal
5. **Pergunta do Obsidian**, conforme o `maestro.md`
6. **Handoff**, se o stage fechou o Lote

## 4. Relatório de fechamento

```
## Stage <n> — ENCERRADO

**Tasks**: <n> mescladas
**Suíte**: <n> testes, <resultado>
**Telas auditadas**: <lista> — art-director APROVADO
**scan-legacy**: <n> nas telas do stage | <n> no restante do projeto (dívida datada)
**Arquivos de UI acima do teto**: <n>
**Dívida de acabamento**: <n> viraram task | <n> recusadas explicitamente pelo operador

**Recusas registradas**
<uma linha cada: achado — motivo — data>

Próximo stage: <n+1> — <primeira task sugerida>
```

Se algum critério foi dispensado por decisão do operador, diga **qual e por quê** no relatório. Um stage fechado com critério dispensado em silêncio é exatamente o defeito que este comando existe para impedir.
