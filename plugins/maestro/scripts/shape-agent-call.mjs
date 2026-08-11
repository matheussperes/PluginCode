#!/usr/bin/env node

/**
 * Normalizador de chamadas da ferramenta Agent.
 *
 * Roda como hook PreToolUse na ferramenta Agent e reescreve os argumentos
 * antes da execucao, via hookSpecificOutput.updatedInput.
 *
 * Existe porque o modelo nao e um canal confiavel para argumentos de
 * ferramenta. Em investigacao registrada (build 2.1.226) o modelo afirmou
 * que a ferramenta Agent nao tinha o parametro `run_in_background`, e nao o
 * emitiu nem sob instrucao direta do operador — apesar de o parametro existir
 * no schema. Instrucao em linguagem natural nao garante emissao de argumento;
 * hook garante.
 *
 * O que este hook forca:
 *
 * 1. `run_in_background: false` nos gates listados em
 *    `.maestro/config.json` → `gates.foreground`. Subagentes em background
 *    sao mortos externamente em 14-30% das execucoes (anthropics/claude-code
 *    #47936) e o pai recebe status "completed" sem o arquivo de veredito.
 *    Gates sao curtos e a saida deles nao e recuperavel — vao para foreground.
 *    Executores e ux-auditor continuam em background por decisao de projeto:
 *    sao longos, e o trabalho deles esta protegido por git e pelo stub de
 *    veredito.
 *
 * 2. `name` deterministico quando ausente, no formato `<gate>-<task-id>`.
 *    E o que torna a retomada por SendMessage possivel: o Maestro sabe o nome
 *    sem precisar te-lo emitido, porque a convencao esta documentada no
 *    agente e garantida aqui.
 *
 * Falha aberta por design: qualquer erro libera a chamada sem alteracao.
 * Um hook quebrado nunca deve travar a esteira.
 *
 * IMPORTANTE: este e o unico hook que pode devolver updatedInput para a
 * ferramenta Agent. Quando varios hooks reescrevem o input da mesma
 * ferramenta, o ultimo a terminar vence e a ordem e nao-deterministica.
 */

import fs from "node:fs";
import path from "node:path";

const GATES_FOREGROUND_PADRAO = [
  "code-auditor",
  "security-auditor",
  "qa-engineer",
  "spec-auditor",
  "memory-manager"
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

/** "maestro:code-auditor" e "code-auditor" sao o mesmo agente para efeito de politica. */
function tipoCurto(subagentType) {
  if (typeof subagentType !== "string") return "";
  const partes = subagentType.split(":");
  return partes[partes.length - 1].trim().toLowerCase();
}

/**
 * Extrai o task-id do texto da delegacao. Cobre os formatos que o Backlog usa:
 * 2.1, 2.1-dedup, 2.8-2.11-back, 2.7-2.11-front, 5.10b.
 */
function taskId(...textos) {
  const padrao = /\b(\d+\.\d+[a-z]?(?:\s*[-–]\s*\d+\.\d+[a-z]?)?(?:-(?:back|front|dedup|motor|web|mobile))?)\b/i;
  for (const texto of textos) {
    if (typeof texto !== "string") continue;
    const achado = texto.match(padrao);
    if (achado) return achado[1].replace(/\s*[-–]\s*/g, "-").toLowerCase();
  }
  return null;
}

function sanitizar(valor) {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function nomeDeterministico(curto, entrada) {
  const id = taskId(entrada?.description, entrada?.prompt);
  const base = id ? `${curto}-${id}` : `${curto}-${sanitizar(entrada?.description ?? "sem-descricao")}`;
  return sanitizar(base) || curto;
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

  if (evento?.tool_name !== "Agent") return;

  const entrada = evento?.tool_input;
  if (!entrada || typeof entrada !== "object") return;

  const raiz = raizDoProjeto(evento?.cwd);
  const conf = config(raiz);
  const foreground = Array.isArray(conf?.gates?.foreground)
    ? conf.gates.foreground.map((g) => tipoCurto(g))
    : GATES_FOREGROUND_PADRAO;

  const curto = tipoCurto(entrada.subagent_type);
  if (!curto) return;

  const atualizado = { ...entrada };
  let mudou = false;

  // 1. Gates rodam de forma sincrona. Nao mexe em executores nem no ux-auditor.
  if (foreground.includes(curto) && atualizado.run_in_background !== false) {
    atualizado.run_in_background = false;
    mudou = true;
  }

  // 2. Nome enderecavel, para permitir retomada por SendMessage.
  if (!atualizado.name || typeof atualizado.name !== "string" || !atualizado.name.trim()) {
    atualizado.name = nomeDeterministico(curto, entrada);
    mudou = true;
  }

  if (!mudou) return;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        updatedInput: atualizado
      }
    }) + "\n"
  );
}

principal().catch(() => {});
