#!/usr/bin/env node

/**
 * Registro objetivo de execucao de agentes.
 *
 * Roda como hook SubagentStop e acrescenta uma linha em
 * .maestro/logs/agents.jsonl do projeto atual.
 *
 * Existe para que o improvement-agent tenha dado real na retrospectiva
 * em vez de reconstruir o historico a partir da memoria da sessao.
 *
 * Falha aberta por design: se nao houver .maestro, ou se qualquer coisa
 * der errado, o hook sai em silencio sem interromper a esteira.
 */

import fs from "node:fs";
import path from "node:path";

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

function raizDoProjeto() {
  const declarada = process.env.CLAUDE_PROJECT_DIR;
  if (declarada && fs.existsSync(path.join(declarada, ".maestro"))) {
    return declarada;
  }

  let atual = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    if (fs.existsSync(path.join(atual, ".maestro"))) return atual;
    const acima = path.dirname(atual);
    if (acima === atual) break;
    atual = acima;
  }
  return null;
}

async function principal() {
  const bruto = await ler();
  if (!bruto.trim()) return;

  let entrada;
  try {
    entrada = JSON.parse(bruto);
  } catch {
    return;
  }

  const raiz = raizDoProjeto();
  if (!raiz) return;

  const registro = {
    ts: new Date().toISOString(),
    agente: entrada?.agent_type ?? null,
    sessao: entrada?.session_id ?? null,
    turnos: entrada?.num_turns ?? null,
    duracao_ms: entrada?.duration_ms ?? null,
    encerrado_por_limite: entrada?.stop_hook_active ?? null
  };

  if (!registro.agente) return;

  const destino = path.join(raiz, ".maestro", "logs");
  fs.mkdirSync(destino, { recursive: true });
  fs.appendFileSync(path.join(destino, "agents.jsonl"), JSON.stringify(registro) + "\n", "utf8");
}

principal().catch(() => {});
