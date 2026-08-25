#!/usr/bin/env node

/**
 * Guarda de comandos destrutivos do Maestro.
 *
 * Roda como hook PreToolUse na ferramenta Bash. Bloqueia comandos que
 * destroem trabalho sem possibilidade de recuperacao e comandos que
 * escrevem na branch principal sem passar pelos gates da esteira.
 *
 * Falha aberta por design: qualquer erro inesperado aqui libera o comando.
 * Um hook quebrado nunca deve travar a esteira inteira.
 */

const BLOQUEADOS = [
  {
    padrao: /\bgit\s+push\b[^\n]*(--force\b|--force-with-lease\b|\s-f\b)/,
    motivo: "git push forcado reescreve historico remoto e pode apagar trabalho de outra branch",
    alternativa: "Peca confirmacao explicita ao operador antes de forcar o push."
  },
  {
    padrao: /\bgit\s+reset\s+--hard\b/,
    motivo: "git reset --hard descarta alteracoes nao commitadas de forma irrecuperavel",
    alternativa: "Use 'git stash' para guardar o trabalho, ou 'git restore <arquivo>' para reverter arquivos especificos."
  },
  {
    padrao: /\bgit\s+clean\b[^\n]*-[a-z]*[fd]/,
    motivo: "git clean remove arquivos nao rastreados de forma irrecuperavel",
    alternativa: "Rode 'git clean -n' primeiro para ver o que seria removido."
  },
  {
    padrao: /\bgit\s+checkout\b[^\n]*\s--\s+\./,
    motivo: "descarta todas as alteracoes locais do diretorio de uma vez",
    alternativa: "Reverta arquivo por arquivo com 'git restore <arquivo>'."
  },
  {
    padrao: /\bgit\s+branch\b[^\n]*\s-D\b/,
    motivo: "-D apaga a branch mesmo sem merge, perdendo os commits dela",
    alternativa: "Use '-d', que recusa apagar branch com trabalho nao mesclado."
  },
  {
    padrao: /\brm\s+(-[a-zA-Z]*\s+)*-[a-zA-Z]*r[a-zA-Z]*f|\brm\s+(-[a-zA-Z]*\s+)*-[a-zA-Z]*f[a-zA-Z]*r/,
    motivo: "rm -rf remove diretorios inteiros sem confirmacao",
    alternativa: "Remova caminhos especificos, ou peca confirmacao ao operador."
  },
  {
    padrao: /\bsupabase\s+db\s+reset\b/,
    motivo: "reseta o banco local e apaga todos os dados de desenvolvimento",
    alternativa: "Confirme com o operador; considere aplicar apenas a migration nova."
  },
  {
    padrao: /\bDROP\s+(TABLE|DATABASE|SCHEMA)\b/i,
    motivo: "remove estrutura e dados de forma irreversivel",
    alternativa: "Migration destrutiva precisa de caminho de transicao documentado no contrato da task."
  }
];

function ler() {
  return new Promise((resolve) => {
    let dados = "";
    const limite = setTimeout(() => resolve(dados), 2000);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (parte) => {
      dados += parte;
    });
    process.stdin.on("end", () => {
      clearTimeout(limite);
      resolve(dados);
    });
    process.stdin.on("error", () => {
      clearTimeout(limite);
      resolve(dados);
    });
  });
}

function liberar() {
  process.exit(0);
}

function bloquear(motivo, alternativa) {
  const mensagem = [
    "Bloqueado pela guarda do Maestro.",
    "",
    `Motivo: ${motivo}`,
    `Alternativa: ${alternativa}`,
    "",
    "Se este comando for realmente necessario, peca confirmacao explicita ao operador antes de tentar de novo."
  ].join("\n");

  process.stderr.write(mensagem + "\n");
  process.exit(2);
}

async function principal() {
  const bruto = await ler();
  if (!bruto.trim()) liberar();

  let comando = "";
  try {
    const entrada = JSON.parse(bruto);
    comando = entrada?.tool_input?.command ?? "";
  } catch {
    liberar();
  }

  if (typeof comando !== "string" || !comando.trim()) liberar();

  for (const regra of BLOQUEADOS) {
    if (regra.padrao.test(comando)) {
      bloquear(regra.motivo, regra.alternativa);
    }
  }

  liberar();
}

principal().catch(liberar);
