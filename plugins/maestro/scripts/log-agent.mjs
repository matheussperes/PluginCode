#!/usr/bin/env node

/**
 * Registro objetivo de execucao de agentes.
 *
 * Roda como hook em SubagentStart e SubagentStop e mantem dois arquivos
 * em .maestro/logs/ do projeto atual:
 *
 *   agents-start.jsonl   uma linha por subagente iniciado
 *   agents.jsonl         uma linha por subagente encerrado, ja correlacionada
 *
 * Existe para que o improvement-agent tenha dado real na retrospectiva, e
 * para medir a taxa de encerramento precoce em vez de estima-la.
 *
 * Por que dois eventos. A versao anterior lia `agent_type` no SubagentStop
 * e o campo vinha sempre vazio, o que jogava todo evento num arquivo de
 * descarte. `agent_type` e entregue no SubagentStart, nao no Stop. A
 * correlacao entre os dois e feita por `agent_id`.
 *
 * O que interessa medir, e de onde vem:
 *
 *   ultimo_bloco === "tool_use"   o texto final do agente foi descartado pelo
 *                                 CLI antes de chegar ao chamador
 *                                 (anthropics/claude-code #58109)
 *   stop_reason ausente/null      encerramento externo, nao escolha do agente
 *                                 (anthropics/claude-code #47936)
 *   turnos proximo do maxTurns    o agente parou no teto, nao por ter terminado
 *
 * Falha aberta por design: sem .maestro, ou com qualquer erro, sai em
 * silencio sem interromper a esteira.
 */

import fs from "node:fs";
import path from "node:path";

const LIMITE_LINHAS_TRANSCRIPT = 4000;

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

function anexar(destino, arquivo, registro) {
  fs.mkdirSync(destino, { recursive: true });
  fs.appendFileSync(path.join(destino, arquivo), JSON.stringify(registro) + "\n", "utf8");
}

/**
 * Le o transcript do subagente e extrai o que o payload do hook nao entrega:
 * quantos turnos de assistente houve, qual foi o tipo do ultimo bloco emitido
 * e qual stop_reason o modelo devolveu na ultima mensagem.
 */
function lerTranscript(caminho) {
  const vazio = { turnos: null, ultimo_bloco: null, stop_reason: null, ferramentas: null };
  if (typeof caminho !== "string" || !caminho.trim() || !fs.existsSync(caminho)) return vazio;

  let linhas;
  try {
    linhas = fs.readFileSync(caminho, "utf8").split(/\r?\n/).filter((l) => l.trim());
  } catch {
    return vazio;
  }

  if (linhas.length > LIMITE_LINHAS_TRANSCRIPT) {
    linhas = linhas.slice(-LIMITE_LINHAS_TRANSCRIPT);
  }

  let turnos = 0;
  let ferramentas = 0;
  let ultima = null;

  for (const linha of linhas) {
    let registro;
    try {
      registro = JSON.parse(linha);
    } catch {
      continue;
    }
    const mensagem = registro?.message ?? registro;
    if (mensagem?.role !== "assistant") continue;
    turnos += 1;
    ultima = mensagem;
    if (Array.isArray(mensagem?.content)) {
      ferramentas += mensagem.content.filter((b) => b?.type === "tool_use").length;
    }
  }

  let ultimoBloco = null;
  if (Array.isArray(ultima?.content) && ultima.content.length > 0) {
    ultimoBloco = ultima.content[ultima.content.length - 1]?.type ?? null;
  } else if (typeof ultima?.content === "string") {
    ultimoBloco = "text";
  }

  return {
    turnos: turnos || null,
    ultimo_bloco: ultimoBloco,
    stop_reason: ultima?.stop_reason ?? null,
    ferramentas: ferramentas || null
  };
}

/** Procura de tras para frente o Start correspondente, para recuperar agent_type. */
function tipoDoStart(destino, agentId) {
  if (!agentId) return null;
  const arquivo = path.join(destino, "agents-start.jsonl");
  if (!fs.existsSync(arquivo)) return null;
  try {
    const linhas = fs.readFileSync(arquivo, "utf8").split(/\r?\n/).filter((l) => l.trim());
    for (let i = linhas.length - 1; i >= 0; i -= 1) {
      const registro = JSON.parse(linhas[i]);
      if (registro?.agent_id === agentId) return registro?.agente ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

async function principal() {
  const bruto = await ler();
  if (!bruto.trim()) return;

  let evento;
  try {
    evento = JSON.parse(bruto);
  } catch {
    return;
  }

  const raiz = raizDoProjeto(evento?.cwd);
  if (!raiz) return;

  const destino = path.join(raiz, ".maestro", "logs");
  const agora = new Date().toISOString();
  const nomeDoEvento = evento?.hook_event_name ?? null;

  if (nomeDoEvento === "SubagentStart") {
    anexar(destino, "agents-start.jsonl", {
      ts: agora,
      evento: "start",
      agent_id: evento?.agent_id ?? null,
      agente: evento?.agent_type ?? null,
      sessao: evento?.session_id ?? null,
      cwd: evento?.cwd ?? null
    });
    return;
  }

  // Qualquer outro evento registrado aqui e tratado como encerramento.
  const agentId = evento?.agent_id ?? null;
  const transcript = lerTranscript(evento?.transcript_path);

  anexar(destino, "agents.jsonl", {
    ts: agora,
    evento: "stop",
    agent_id: agentId,
    agente: evento?.agent_type ?? tipoDoStart(destino, agentId),
    sessao: evento?.session_id ?? null,
    turnos: transcript.turnos,
    ferramentas: transcript.ferramentas,
    ultimo_bloco: transcript.ultimo_bloco,
    stop_reason: transcript.stop_reason,
    // true quando o texto final foi descartado pelo CLI (#58109) ou quando o
    // agente foi encerrado externamente no meio de uma chamada (#47936).
    saida_perdida: transcript.ultimo_bloco === "tool_use",
    stop_hook_active: evento?.stop_hook_active ?? null
  });
}

principal().catch(() => {});
