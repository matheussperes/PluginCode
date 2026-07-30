---
description: Gera prompts de imagem (logo, telas-chave, criativo de lancamento) para o operador usar em ferramentas externas de geracao de imagem. Sempre confirma antes de gerar qualquer coisa.
argument-hint: [vazio]
---

Prepare os prompts de identidade visual do projeto. Este comando **nunca gera a imagem em si** — gera o texto de prompt que o operador cola no ChatGPT, Gemini, Midjourney ou ferramenta equivalente, fora da esteira.

## 1. Verifique se a base existe

Leia `docs/PRD.md`, `docs/Business-Strategy.md`, `docs/Design-System.md` e `docs/Screen-Blueprints.md`.

Se algum estiver ausente, explique qual falta e pare — este comando depende da descoberta estar completa e aprovada pelo `spec-auditor`. Não gere prompt a partir de especificação parcial.

## 2. Identifique o momento do projeto

- **Projeto recém-aprovado na descoberta**, sem código de aplicação ainda: prompts vêm inteiramente dos documentos.
- **Projeto já em andamento**, com `src/`, `app/`, `pages/` ou `components/` não vazios: informe isso ao operador e pergunte se quer que os prompts considerem também o que já foi construído, não só o que foi planejado — um projeto em andamento pode ter divergido do plano original.
- **`docs/Image-Prompts.md` já existe**: pergunte se o operador quer regenerar (sobrescrevendo) ou só revisar o que já está lá. Não sobrescreva sem confirmação.

## 3. Confirme antes de gerar — sempre

Não gere nada sem esta confirmação explícita, mesmo quando este comando for sugerido automaticamente logo após a aprovação da descoberta:

```
Quer que eu gere agora os prompts de identidade visual do projeto —
logo, telas-chave e criativo de lançamento?

Isso não gera as imagens. Gera o texto de prompt que você cola na
ferramenta de geração de imagem de sua preferência. (sim/não)
```

Se a resposta for não, pare sem delegar nada.

## 4. Delegue ao product-designer

Convoque o `product-designer` em Modo Visual Kit, informando:

- Se é projeto novo (só os documentos) ou em andamento (documentos + inspecionar código existente)
- Que a saída é `docs/Image-Prompts.md`

## 5. Oriente o próximo passo

Ao final, explique o fluxo ao operador:

```
Prompts gerados em docs/Image-Prompts.md.

Próximo passo:
1. Copie cada prompt para a ferramenta de imagem de sua escolha
2. Gere, escolha e aprove a versão que representa bem o produto
3. Salve o arquivo aprovado no caminho indicado em cada prompt,
   dentro de docs/visual-reference/

A partir daí, o ux-auditor compara automaticamente as telas construídas
com essas referências quando existirem — como observação qualitativa de
direção (paleta, hierarquia, tom), nunca como critério de veto. O que
aprova ou reprova uma task continua sendo docs/Design-System.md e
docs/Screen-Blueprints.md.
```
