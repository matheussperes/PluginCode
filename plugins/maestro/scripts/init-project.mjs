#!/usr/bin/env node

/**
 * Inicializador de projeto do Maestro.
 *
 * Cria a estrutura de estado e documentacao que a esteira precisa,
 * a partir dos templates do plugin.
 *
 * Idempotente por design: cria apenas o que falta e nunca sobrescreve
 * um arquivo existente. Pode ser rodado quantas vezes for preciso.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const raizDoPlugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raizDosTemplates = path.join(raizDoPlugin, "templates", "project");
const raizDoProjeto = process.cwd();

const criados = [];
const preservados = [];

function copiarAusentes(origem, destino) {
  for (const item of fs.readdirSync(origem, { withFileTypes: true })) {
    const caminhoOrigem = path.join(origem, item.name);
    const caminhoDestino = path.join(destino, item.name);

    if (item.isDirectory()) {
      fs.mkdirSync(caminhoDestino, { recursive: true });
      copiarAusentes(caminhoOrigem, caminhoDestino);
      continue;
    }

    const relativo = path.relative(raizDoProjeto, caminhoDestino);
    if (fs.existsSync(caminhoDestino)) {
      preservados.push(relativo);
    } else {
      fs.copyFileSync(caminhoOrigem, caminhoDestino);
      criados.push(relativo);
    }
  }
}

if (!fs.existsSync(raizDosTemplates)) {
  console.error(`Templates nao encontrados em ${raizDosTemplates}`);
  process.exit(1);
}

copiarAusentes(raizDosTemplates, raizDoProjeto);

for (const diretorio of ["tmp", "cache", "logs", "state", "proposals", "state/contracts", "tmp/screenshots"]) {
  fs.mkdirSync(path.join(raizDoProjeto, ".maestro", diretorio), { recursive: true });
}

console.log(`Criados: ${criados.length}`);
for (const item of criados) console.log(`  + ${item}`);

if (preservados.length > 0) {
  console.log(`\nPreservados: ${preservados.length}`);
  for (const item of preservados) console.log(`  = ${item}`);
}

const claudeMd = path.join(raizDoProjeto, "CLAUDE.md");
const claudeMdPreservado = preservados.includes("CLAUDE.md");

console.log("\nProjeto preparado.");
console.log("  Nucleo compartilhado: plugin maestro (somente leitura)");
console.log("  Estado deste projeto: .maestro/");
console.log("  Documentacao deste projeto: docs/");

if (claudeMdPreservado) {
  console.log("\nAtencao: CLAUDE.md ja existia e foi preservado.");
  console.log("Adicione manualmente a secao de integracao do Maestro. O modelo esta em:");
  console.log(`  ${path.join(raizDosTemplates, "CLAUDE.md")}`);
} else if (fs.existsSync(claudeMd)) {
  console.log("\nCLAUDE.md criado com a integracao do Maestro.");
}

// ---------------------------------------------------------------------------
// Grafo de codigo (Graphify) — pre-requisito da esteira.
// Executores e auditores consultam o grafo em vez de varrer o repositorio.
// ---------------------------------------------------------------------------

function graphifyDisponivel() {
  try {
    execFileSync("graphify", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const gitignore = path.join(raizDoProjeto, ".gitignore");
const linhaIgnore = "graphify-out/";
try {
  const atual = fs.existsSync(gitignore) ? fs.readFileSync(gitignore, "utf8") : "";
  if (!atual.split(/\r?\n/).some((l) => l.trim() === linhaIgnore)) {
    const prefixo = atual.length > 0 && !atual.endsWith("\n") ? "\n" : "";
    fs.appendFileSync(gitignore, `${prefixo}\n# Grafo de codigo derivado (Graphify)\n${linhaIgnore}\n`);
    console.log("\n  + .gitignore: graphify-out/ adicionado");
  }
} catch (erro) {
  console.log(`\n  ! Nao foi possivel atualizar .gitignore: ${erro.message}`);
}

console.log("\nGrafo de codigo (Graphify):");
if (graphifyDisponivel()) {
  const grafoExiste = fs.existsSync(path.join(raizDoProjeto, "graphify-out", "graph.json"));
  console.log("  Instalado.");
  console.log(
    grafoExiste
      ? "  Grafo ja existe. Use 'graphify update <caminhos>' apos cada merge."
      : "  Grafo ainda nao construido. Rode '/graphify .' na sessao principal."
  );
} else {
  console.log("  NAO INSTALADO — a esteira depende dele.");
  console.log("  Instale com um destes:");
  console.log("    uv tool install graphifyy");
  console.log("    pipx install graphifyy");
  console.log("    pip install graphifyy");
  console.log("  Depois: graphify install    (registra a skill /graphify)");
  console.log("  E entao: /graphify .        (constroi o grafo, na sessao principal)");
}

console.log("\nPreencha a secao 'conventions' de .maestro/config.json com os caminhos");
console.log("e scripts reais deste repositorio. E o que evita os executores deduzirem.");
console.log("\nProximo passo: /maestro-discovery para projeto novo, ou /maestro-status.");
