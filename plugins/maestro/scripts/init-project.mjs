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

for (const diretorio of ["tmp", "cache", "logs", "state", "proposals", "state/contracts", "tmp/screenshots", "tmp/verdicts"]) {
  fs.mkdirSync(path.join(raizDoProjeto, ".maestro", diretorio), { recursive: true });
}

console.log(`Criados: ${criados.length}`);
for (const item of criados) console.log(`  + ${item}`);

if (preservados.length > 0) {
  console.log(`\nPreservados: ${preservados.length}`);
  for (const item of preservados) console.log(`  = ${item}`);
}

// ---------------------------------------------------------------------------
// Migracao de config.json — nunca sobrescreve, so aponta o que falta.
// A partir do schemaVersion 4 os hooks leem `gates.foreground` e `guards`.
// A partir do 5 a esteira le `deliveryStandard`, `docs` e `conventions.legacyPatterns`:
// sem `deliveryStandard` os agentes assumem `release`; sem `docs` eles caem nos
// nomes padrao de arquivo, que e exatamente como um projeto passa a auditar o
// vazio quando renomeia um documento de descoberta.
// Sem essas chaves eles caem no padrao embutido, que e o mesmo — entao a
// migracao e opcional, e serve para o projeto conseguir ajustar a politica.
// ---------------------------------------------------------------------------

const SCHEMA_ESPERADO = 5;
const caminhoConfig = path.join(raizDoProjeto, ".maestro", "config.json");

if (preservados.includes(path.join(".maestro", "config.json")) || fs.existsSync(caminhoConfig)) {
  try {
    const atual = JSON.parse(fs.readFileSync(caminhoConfig, "utf8"));
    const versao = Number(atual?.schemaVersion ?? 0);
    const faltando = [];
    if (!Array.isArray(atual?.gates?.foreground)) faltando.push("gates.foreground");
    if (typeof atual?.guards !== "object" || atual.guards === null) faltando.push("guards");
    if (typeof atual?.deliveryStandard !== "string") faltando.push("deliveryStandard");
    if (typeof atual?.docs !== "object" || atual.docs === null) faltando.push("docs");
    if (!Array.isArray(atual?.conventions?.legacyPatterns)) faltando.push("conventions.legacyPatterns");
    if (!Number.isFinite(atual?.conventions?.maxUiFileLines)) faltando.push("conventions.maxUiFileLines");

    if (versao < SCHEMA_ESPERADO || faltando.length > 0) {
      console.log(`\nconfig.json esta no schemaVersion ${versao || "ausente"} (esperado ${SCHEMA_ESPERADO}).`);
      console.log("Nada foi alterado. Os hooks funcionam com os padroes embutidos, mas");
      console.log("para ajustar a politica por projeto acrescente ao .maestro/config.json:");
      console.log(`  faltando: ${faltando.join(", ") || "nenhuma chave, so a versao"}`);
      console.log(`\nModelo completo em: ${path.join(raizDosTemplates, ".maestro", "config.json")}`);
    }
  } catch (erro) {
    console.log(`\n  ! Nao foi possivel checar .maestro/config.json: ${erro.message}`);
  }
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
