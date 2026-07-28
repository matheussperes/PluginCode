---
description: Copia um agente do plugin para o projeto ou para o usuario, liberando permissionMode, hooks e mcpServers no frontmatter
argument-hint: <nome-do-agente> [projeto|usuario]
---

Copie o agente **$ARGUMENTS** do plugin Maestro para um escopo editável.

## Por que este comando existe

Agentes que vêm de plugin **ignoram** três campos de frontmatter, por segurança: `permissionMode`, `hooks` e `mcpServers`. Todos os outros campos funcionam normalmente, e `tools`, `disallowedTools` e `model` cobrem a maior parte das necessidades.

Quando você precisar de um desses três campos em um agente específico, ejete-o. Ele passa a ser um agente comum, com precedência sobre a versão do plugin.

## Passos

1. Se o escopo não foi informado, pergunte: **projeto** (`.claude/agents/`, vale só neste repositório e pode ser versionado) ou **usuário** (`~/.claude/agents/`, vale em todos os seus projetos).

2. Confirme que o agente existe em `${CLAUDE_PLUGIN_ROOT}/agents/<nome>.md`. Se não existir, liste os disponíveis e pare.

3. Copie o arquivo para o destino escolhido, preservando o conteúdo integralmente.

4. Adicione ao topo do corpo do agente, logo após o frontmatter, um comentário de procedência:

   ```
   <!-- Ejetado do plugin maestro v<versão> em <data>. Esta cópia tem precedência sobre a do plugin. -->
   ```

5. Informe ao operador quais campos ele acabou de destravar e mostre um exemplo aplicável ao agente ejetado.

## Aviso obrigatório

Diga isto ao operador, sem rodeios:

> Esta cópia **não recebe mais atualizações do plugin**. Quando o Maestro for atualizado, este agente continua na versão de hoje até você ejetá-lo de novo ou apagar a cópia.

## Reverter

Para voltar a usar a versão do plugin, basta apagar o arquivo ejetado. A precedência volta automaticamente para o plugin na próxima sessão.

## Nota sobre permissionMode

Antes de ejetar por causa de `permissionMode`, verifique se ele faria efeito: quando a sessão principal roda em `acceptEdits`, `bypassPermissions` ou modo automático, o `permissionMode` do subagent é ignorado de qualquer forma. Nesse caso, ejetar não resolve nada — o caminho é `permissions.allow` e `permissions.deny` no `.claude/settings.json` do projeto, ou uma allowlist de `tools` mais estreita no próprio agente.
