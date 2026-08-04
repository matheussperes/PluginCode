# Comandos — Maestro

## Manutenção do plugin (rodar em `D:\Github\PluginCode`)

| Comando | Quando usar |
|---|---|
| `git push` | Depois de qualquer commit no framework |
| `claude plugin marketplace update plugincode` | Sincroniza o catálogo com a versão nova do `plugin.json` |
| `claude plugin update maestro` | Atualiza o plugin instalado para a versão do catálogo. Pede restart |
| `claude plugin list` | Confere a versão instalada |
| `claude plugin validate .` | Valida marketplace e manifesto antes de commitar |

Sequência completa após alterar o framework:

```powershell
cd D:\Github\PluginCode
git push
claude plugin marketplace update plugincode
claude plugin update maestro
```

Reinicie o Claude Code depois do `update`.

## Uso em um projeto (rodar dentro do projeto)

| Comando | Quando usar |
|---|---|
| `/maestro-init` | Uma vez por projeto, para criar `.maestro/`, `docs/` e o `CLAUDE.md`. Aditivo — nunca sobrescreve o que já existe |
| `/maestro-discovery` | Projeto novo, mudança de escopo relevante, ou ativação de uma plataforma nova (ex: ligar mobile num projeto que já é web) |
| `/maestro-next` | Executa a próxima task do `Backlog.md`, do contrato aos gates |
| `/maestro-status` | Estado real do projeto, cruzado com o git |
| `/maestro-audit [task-id]` | Audita trabalho **já implementado**, mesmo sem contrato de task — ideal para código feito fora da esteira ou correção manual |
| `/maestro-retro` | Retrospectiva com evidência ao final de um stage |
| `/maestro-visual-kit` | Gera prompts de logo, telas e criativo de lançamento. Sempre confirma antes de gerar |
| `/maestro-eject <agente>` | Copia um agente para escopo editável, quando precisar de `hooks`/`mcpServers`/`permissionMode` |

Ou, sem comando nenhum:

```
Aja como o Maestro. Quero criar uma tela de dashboard...
```

## Projeto na v1 (prosa + @menção), quase pronto

1. Finalize com o processo atual — não troque de esteira no fim do projeto
2. `/maestro-init` — seguro, só adiciona o que falta
3. `/maestro-audit` — segunda opinião com os gates da v3.3, mesmo sem contrato formal
