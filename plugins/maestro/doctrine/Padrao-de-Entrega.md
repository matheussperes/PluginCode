# Padrão de Entrega — doutrina da esteira

> Documento de doutrina. Vale para **todos** os agentes, acima de qualquer regra
> específica de agente e abaixo apenas de uma instrução direta do operador.
> Leia inteiro uma vez, na primeira task de um projeto novo.

## 1. O problema que esta doutrina resolve

Uma esteira que fatia trabalho em micro-tasks e valida cada uma contra tokens
produz, ao final, um produto onde **cada peça está conforme e o conjunto está
amador**. Isso não é falha de execução: é o que acontece quando o sistema tem
uma definição precisa de *o quê* entregar e nenhuma de *em que nível*.

Na ausência de um padrão declarado, o padrão real vira o mínimo que passa nos
gates. Esta doutrina declara o padrão.

## 2. Os três níveis

O projeto declara o seu nível em `.maestro/config.json` → `deliveryStandard`.
Toda task herda esse nível. Telas específicas podem ser elevadas — nunca
rebaixadas — pelo mapa `screenLevels` do mesmo arquivo.

### `rascunho`

Prova de conceito descartável, feita para responder uma pergunta técnica e ser
jogada fora. Sem gate visual, sem `art-director`, sem exigência de composição.

**Uso legítimo**: validar que uma biblioteca funciona, medir performance de uma
abordagem, testar uma hipótese de cálculo. **Uso ilegítimo**: qualquer coisa que
um usuário vai ver. Código em `rascunho` não é promovido a produto por decisão
de executor — ele é reescrito por uma task própria, no nível do projeto.

### `release` — o padrão

Pronto para um cliente pagante usar sem que ninguém precise pedir desculpa. É o
piso de qualquer produto real. Exige, cumulativamente:

- Composição da tela aprovada pelo `art-director` contra `docs/Screen-Composition.md`
- **Um único sistema** de título, botão, campo e card por tela — zero coexistência
  de padrão legado com padrão atual
- Os quatro estados (loading, vazio, erro, preenchido) no **mesmo** nível de
  acabamento, não o caso feliz caprichado e o resto improvisado
- Conformidade integral com `docs/Design-System.md`, incluindo elevação em
  camadas, tracking, motion e skeleton com shimmer
- Acessibilidade: foco visível, contraste AA verificado, ordem de tabulação
- Nenhum defeito de acabamento adiado para "task futura" sem recusa datada do
  operador

### `vitrine`

A tela **vende**. Além de tudo do `release`:

- Um **momento visual próprio** — a tela tem uma ideia, não apenas tokens bem
  aplicados
- Sequência de entrada orquestrada, não elementos aparecendo por acaso
- Tratamento deliberado de imagem, ilustração ou desenho, quando o produto os tem
- Copy revisada como **texto de venda**, não como rótulo de interface
- Verificação em breakpoint extra e em captura ampliada: nada "quase alinhado"

`vitrine` é caro e só se justifica onde a tela é material de venda. Em tela densa
de operação, o tratamento de vitrine costuma atrapalhar o uso — elevar tudo é
tão errado quanto não elevar nada.

## 3. Regras que valem em qualquer nível acima de `rascunho`

**Acabamento não é escopo extra.** YAGNI governa funcionalidade, abstração e
configuração. Nunca acabamento. Acabamento especificado no Design System ou na
Composição de Tela é requisito: cortá-lo é entregar menos do que o contrato pede,
não simplificar com bom senso.

**Escopo encolhe em funcionalidade, nunca em acabamento.** Se a rodada não cabe,
entregue **uma tela a menos, inteira** — jamais a mesma tela pela metade. É
proibido criar ou aceitar task cuja descrição contenha "versão simples de",
"básico por enquanto", "sem X por ora, evolui depois".

**Dívida de acabamento não existe sem data e dono.** Nenhum achado de acabamento
pode ser arquivado como "candidato a task futura". Ou vira task no stage
corrente, ou vira uma recusa explícita do operador, registrada com data e motivo:
`aceito lançar com isto — <motivo> — <data>`. As duas saídas são legítimas; o
silêncio não é.

**A unidade de aprovação visual é a tela, não a task.** Uma tela composta por
oito tasks conformes ainda pode ser uma colagem. Por isso toda tela tem uma task
terminal de composição e acabamento, e um veredito de `art-director`.

## 4. Ambição visual — o que se espera do Design System

Um Design System correto e sem personalidade produz um produto correto e sem
personalidade. Evitar feiura não produz beleza.

Por isso `docs/Design-System.md` abre obrigatoriamente com a **Seção 0 — Direção
de Arte**, escrita **antes** de qualquer token, contendo tese visual, decisão
assinatura, pares tipográficos justificados, neutro com viés de matiz declarado,
assinatura de movimento e antipadrões nomeados. A especificação completa está em
`agents/product-designer.md`.

O teste que a Seção 0 precisa passar: **cubra a logo de uma captura do produto.
Alguém do setor reconhece que é este produto, ou poderia ser qualquer SaaS?** Se
for a segunda, a direção de arte falhou, e ela volta antes de virar token.

## 5. Quem cobra o quê

| Nível de verificação | Quem | Contra o quê |
|---|---|---|
| Token, estado, acessibilidade | `ux-auditor` | `docs/Design-System.md` |
| Composição, hierarquia, identidade | `art-director` | `docs/Screen-Composition.md` + Seção 0 |
| Coexistência de padrão legado | `scan-legacy.mjs` + `code-auditor` | `config.legacyPatterns` |
| Tamanho de arquivo de UI | `code-auditor` | `config.maxUiFileLines` |
| Dívida sem data | `maestro-stage-close` | Seções "Gaps" do Backlog |

Nenhum desses papéis substitui o outro, e nenhum agente emite o veredito de
outro.

---

**Versão**: 1.0 — parte do plugin `maestro` a partir da 3.9.0
