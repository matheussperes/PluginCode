---
description: Copia um agente do plugin para o projeto ou para o usuario, liberando permissionMode, hooks e mcpServers no frontmatter
argument-hint: <nome-do-agente> [projeto|usuario]
---

Copie o agente **$ARGUMENTS** do plugin Maestro para um escopo editável.

## Por que este comando existe

Agentes que vêm de plugin **ignoram** três campos de frontmatter, por segurança: `permissionMode`, `hooks` e `mcpServers`. Todos os outros campos funcionam normalmente, e `tools`, `disallowedTools` e `model` cobrem a maior parte das necessidades.

Quando você precisar de um desses três campos em um agente específico, ejete-o. Ele passa a ser um agente comum, com precedência sobre a versão do plugin.

## O plugin é a raiz — ejeção é empréstimo, não mudança de sede

**Ejetar é temporário por definição.** A cópia ejetada congela na versão do dia e para de receber correção do plugin, e nada avisa quando ela fica para trás — o projeto simplesmente roda com bugs já resolvidos no núcleo compartilhado. Toda alteração que valha a pena manter pertence ao plugin, não à cópia.

Antes de ejetar, confirme que é mesmo necessário. Só três campos justificam:

| Você precisa de | Ejetar resolve? |
|---|---|
| `permissionMode`, `hooks` ou `mcpServers` no frontmatter | Sim — plugin ignora esses três |
| Mudar prompt, `tools`, `model`, `effort`, `maxTurns` | **Não** — tudo isso funciona vindo do plugin. Altere no plugin e bumpe a versão |
| Testar uma alteração antes de mandar pro plugin | **Não** — use `claude --plugin-dir <caminho-do-plugin>`, que lê do disco sem cache nem cópia |
| Um ajuste só deste projeto | **Não** — isso é `.maestro/config.json` ou o contrato da task, não uma cópia de agente |

Se o pedido cair em qualquer linha com "Não", **não ejete**: diga qual é o caminho certo e pare.

## Passos

1. Pergunte **por que** a ejeção é necessária e qual dos três campos vai ser usado. Sem uma resposta que caia na primeira linha da tabela, pare aqui.

2. Se o escopo não foi informado, pergunte: **projeto** (`.claude/agents/`, vale só neste repositório e pode ser versionado) ou **usuário** (`~/.claude/agents/`, vale em todos os seus projetos).

3. Confirme que o agente existe em `${CLAUDE_PLUGIN_ROOT}/agents/<nome>.md`. Se não existir, liste os disponíveis e pare.

4. Copie o arquivo para o destino escolhido, preservando o conteúdo integralmente.

5. Adicione ao topo do corpo do agente, logo após o frontmatter, um comentário de procedência **com o motivo**:

   ```
   <!-- Ejetado do plugin maestro v<versão> em <data>.
        Motivo: <campo destravado e para quê>.
        Desfazer quando: <condição concreta que encerra a necessidade>.
        Esta cópia tem precedência sobre a do plugin e NÃO recebe atualizações dele. -->
   ```

   O campo "Desfazer quando" não é decorativo: sem ele, ninguém sabe se a cópia ainda faz sentido seis meses depois.

6. Registre a ejeção em `.maestro/proposals/` como candidata a virar mudança de plugin, se o que você precisa puder ser generalizado.

7. Informe ao operador o que ele destravou, mostre um exemplo aplicável, e repita o aviso abaixo.

## Aviso obrigatório

Diga isto ao operador, sem rodeios:

> Esta cópia **não recebe mais atualizações do plugin**. Quando o Maestro for corrigido, este agente continua na versão de hoje. Desfaça a ejeção assim que a necessidade acabar, e rode `/maestro-status` periodicamente — ele detecta cópias ejetadas desatualizadas.

## Reverter — faça isso assim que puder

Apagar o arquivo ejetado devolve a precedência ao plugin na próxima sessão. Nada mais é necessário.

```bash
rm .claude/agents/<nome>.md        # escopo de projeto
rm ~/.claude/agents/<nome>.md      # escopo de usuário
```

Antes de apagar, compare a cópia com a versão atual do plugin: se houver alteração que valha a pena, leve para o plugin primeiro (com bump de versão) e só então apague. Alteração perdida por reversão apressada é pior que a ejeção.

```bash
diff .claude/agents/<nome>.md "${CLAUDE_PLUGIN_ROOT}/agents/<nome>.md"
```

## Nota sobre permissionMode

Antes de ejetar por causa de `permissionMode`, verifique se ele faria efeito: quando a sessão principal roda em `acceptEdits`, `bypassPermissions` ou modo automático, o `permissionMode` do subagent é ignorado de qualquer forma. Nesse caso, ejetar não resolve nada — o caminho é `permissions.allow` e `permissions.deny` no `.claude/settings.json` do projeto, ou uma allowlist de `tools` mais estreita no próprio agente.
