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
 *
 * DIAGNOSTICO TEMPORARIO (ver .maestro/proposals — investigacao de gates
 * que estouram sem veredito): em pelo menos um ambiente observado, os campos
 * turnos/duracao_ms/encerrado_por_limite abaixo vem sempre null, porque este
 * script assume o formato de payload do hook SubagentStop do Claude Code CLI
 * puro, e nem todo harness expoe os mesmos campos. Por isso o registro agora
 * inclui `payload_bruto` (o JSON inteiro recebido do hook) e, quando nem
 * `agent_type` vier preenchido, o evento cai em agents-sem-agente.jsonl em vez
 * de ser descartado. Isso deixa o dado real disponivel na proxima ocorrencia
 * de estouro, sem precisar reproduzir o problema de proposito. Depois que o
 * formato real for confirmado, remova `payload_bruto` e o arquivo secundario,
 * e ajuste a extracao de campos para o nome correto.
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

  const destino = path.join(raiz, ".maestro", "logs");
  fs.mkdirSync(destino, { recursive: true });

  const registro = {
    ts: new Date().toISOString(),
    agente: entrada?.agent_type ?? null,
    sessao: entrada?.session_id ?? null,
    turnos: entrada?.num_turns ?? null,
    duracao_ms: entrada?.duration_ms ?? null,
    encerrado_por_limite: entrada?.stop_hook_active ?? null,
    payload_bruto: entrada ?? null
  };

  if (registro.agente) {
    fs.appendFileSync(path.join(destino, "agents.jsonl"), JSON.stringify(registro) + "\n", "utf8");
    return;
  }

  // agent_type tambem pode vir vazio neste ambiente — nao descarte o evento,
  // grave em separado para nao perder o dado so porque um campo esperado faltou.
  fs.appendFileSync(path.join(destino, "agents-sem-agente.jsonl"), JSON.stringify(registro) + "\n", "utf8");
}

principal().catch(() => {});
