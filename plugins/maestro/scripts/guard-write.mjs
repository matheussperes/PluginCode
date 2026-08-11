#!/usr/bin/env node

/**
 * Guarda de territorio do Maestro.
 *
 * Roda como hook PreToolUse em Edit, Write, MultiEdit e NotebookEdit.
 * Bloqueia escrita em codigo de aplicacao vinda da thread principal —
 * que, num projeto inicializado pelo /maestro-init, e o proprio Maestro.
 *
 * Como ele sabe quem esta chamando: o payload do hook traz `agent_id` e
 * `agent_type` somente quando o evento dispara dentro de um subagente. A
 * chamada que sai da conversa principal nao tem `agent_id`. A ausencia e o
 * discriminador. Nao existe `parent_agent_id`, entao nao da para saber quem
 * criou um subagente — mas nao e essa a pergunta aqui.
 *
 * Por que isto substitui `disallowedTools: Edit` no frontmatter do Maestro:
 *
 * - `disallowedTools` no agente da sessao principal remove a ferramenta da
 *   sessao inteira, subagentes inclusive. Os quatro executores declaravam
 *   `Edit` e nunca o recebiam, e toda alteracao virava `Write` de arquivo
 *   inteiro — caro, e o maior ponto de queda de uma execucao.
 * - Ao mesmo tempo, aquela regra nunca protegeu nada de verdade: o Maestro
 *   sempre teve `Write`, que nao e escopado por pasta. O caminho cirurgico
 *   estava fechado e o caminho nuclear, aberto.
 *
 * Este hook inverte as duas coisas: devolve `Edit` aos executores e fecha
 * `Write` para a thread principal.
 *
 * Falha aberta por design: qualquer erro inesperado libera a escrita.
 *
 * Desligavel por projeto em `.maestro/config.json`:
 *   { "guards": { "blockMainThreadAppWrites": false } }
 * Desligue quando a sessao principal deste repositorio nao for o Maestro.
 */

import fs from "node:fs";
import path from "node:path";

const FERRAMENTAS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);

const CAMINHOS_DE_APLICACAO_PADRAO = [
  "src",
  "lib",
  "app",
  "components",
  "pages",
  "hooks",
  "styles",
  "supabase"
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

function raizDoProjeto(cwdDoHook) {
  const candidatos = [process.env.CLAUDE_PROJECT_DIR, cwdDoHook, process.cwd()].filter(Boolean);
  for (const inicio of candidatos) {
    let atual = path.resolve(inicio);
    for (let i = 0; i < 8; i += 1) {
      if (fs.existsSync(path.join(atual, ".maestro"))) return atual;
      const acima = path.dirname(atual);
      if (acima === atual) break;
      atual = acima;
    }
  }
  return null;
}

function config(raiz) {
  if (!raiz) return {};
  try {
    return JSON.parse(fs.readFileSync(path.join(raiz, ".maestro", "config.json"), "utf8"));
  } catch {
    return {};
  }
}

function caminhoAlvo(entrada) {
  return entrada?.file_path ?? entrada?.notebook_path ?? entrada?.path ?? null;
}

/**
 * Devolve o primeiro segmento do caminho relativo a raiz do projeto.
 * Normaliza separador para funcionar igual em Windows e POSIX.
 *
 * Um caminho fora da raiz (worktree irmao, por exemplo) devolve null e
 * portanto passa: worktree de executor nao e territorio desta guarda.
 */
function segmentoRaiz(raiz, alvo) {
  const absoluto = path.resolve(raiz, alvo);
  const relativo = path.relative(raiz, absoluto);
  if (!relativo || relativo.startsWith("..") || path.isAbsolute(relativo)) return null;
  return relativo.split(/[\\/]+/)[0].toLowerCase();
}

function liberar() {
  process.exit(0);
}

function bloquear(alvo, segmento) {
  const razao = [
    `Bloqueado pela guarda de territorio do Maestro: escrita em '${segmento}/' vinda da thread principal.`,
    "",
    `Arquivo: ${alvo}`,
    "",
    "Codigo de aplicacao e territorio exclusivo do squad de Execucao. Delegue ao",
    "executor certo (frontend-engineer, backend-engineer, motor-engineer ou",
    "integration-engineer) com o contrato preenchido, em vez de corrigir aqui.",
    "",
    "Se a correcao for pequena e a task ja estiver fechada, isso e uma task nova,",
    "nao um ajuste de bastidor — e o Backlog precisa registra-la.",
    "",
    "Voce continua livre para escrever em .maestro/ e para delegar a docs/."
  ].join("\n");

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: razao
      }
    }) + "\n"
  );
  process.exit(0);
}

async function principal() {
  const bruto = await ler();
  if (!bruto.trim()) liberar();

  let evento;
  try {
    evento = JSON.parse(bruto);
  } catch {
    liberar();
  }

  if (!FERRAMENTAS.has(evento?.tool_name)) liberar();

  // Presenca de agent_id significa que o evento nasceu dentro de um subagente,
  // isto e, num executor. Executor escreve codigo — e para isso que ele existe.
  if (evento?.agent_id) liberar();

  const alvo = caminhoAlvo(evento?.tool_input);
  if (typeof alvo !== "string" || !alvo.trim()) liberar();

  const raiz = raizDoProjeto(evento?.cwd);
  if (!raiz) liberar();

  const conf = config(raiz);
  if (conf?.guards?.blockMainThreadAppWrites === false) liberar();

  const caminhos = Array.isArray(conf?.guards?.appPaths) && conf.guards.appPaths.length > 0
    ? conf.guards.appPaths.map((c) => String(c).toLowerCase())
    : CAMINHOS_DE_APLICACAO_PADRAO;

  const segmento = segmentoRaiz(raiz, alvo);
  if (!segmento) liberar();

  if (caminhos.includes(segmento)) bloquear(alvo, segmento);

  liberar();
}

principal().catch(liberar);
