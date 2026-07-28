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

console.log("\nPreencha a secao 'conventions' de .maestro/config.json com os caminhos");
console.log("e scripts reais deste repositorio. E o que evita os executores deduzirem.");
console.log("\nProximo passo: /maestro-discovery para projeto novo, ou /maestro-status.");
