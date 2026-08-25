#!/usr/bin/env node

/**
 * Varredura de coexistencia de padroes.
 *
 * Le `legacyPatterns` de `.maestro/config.json` — a lista de padroes que o
 * projeto declarou oficialmente obsoletos — e conta quantas vezes cada um
 * ainda aparece nos caminhos informados.
 *
 * Existe porque "duas geracoes de design convivendo na mesma tela" e a causa
 * raiz mais comum de interface poluida, e ate agora era uma impressao. Aqui
 * ela vira um inteiro, e um inteiro pode ser criterio de gate.
 *
 * Uso:
 *   node scan-legacy.mjs                        # projeto inteiro
 *   node scan-legacy.mjs app/modulo components  # so estes caminhos
 *   node scan-legacy.mjs --json app/modulo      # saida para outro programa
 *
 * Saida: relatorio por arquivo e total. Codigo de saida 1 quando o total e
 * maior que zero, para permitir uso direto em script de gate.
 */

import fs from "node:fs";
import path from "node:path";

const EXTENSOES = new Set([
  ".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs",
  ".css", ".scss", ".sass", ".less",
  ".html", ".vue", ".svelte", ".astro"
]);

const IGNORAR = new Set([
  "node_modules", ".git", ".next", "dist", "build", "out",
  "coverage", ".turbo", ".vercel", "graphify-out", ".maestro"
]);

function raizDoProjeto(inicio) {
  let atual = path.resolve(inicio);
  for (let i = 0; i < 8; i += 1) {
    if (fs.existsSync(path.join(atual, ".maestro"))) return atual;
    const acima = path.dirname(atual);
    if (acima === atual) break;
    atual = acima;
  }
  return null;
}

function lerPadroes(raiz) {
  try {
    const conf = JSON.parse(fs.readFileSync(path.join(raiz, ".maestro", "config.json"), "utf8"));
    const lista = conf?.conventions?.legacyPatterns ?? conf?.legacyPatterns;
    return Array.isArray(lista) ? lista.filter((p) => typeof p === "string" && p.trim()) : [];
  } catch {
    return [];
  }
}

function* arquivos(alvo) {
  let stat;
  try {
    stat = fs.statSync(alvo);
  } catch {
    return;
  }
  if (stat.isFile()) {
    if (EXTENSOES.has(path.extname(alvo))) yield alvo;
    return;
  }
  if (!stat.isDirectory()) return;
  for (const entrada of fs.readdirSync(alvo, { withFileTypes: true })) {
    if (IGNORAR.has(entrada.name)) continue;
    yield* arquivos(path.join(alvo, entrada.name));
  }
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const alvos = args.filter((a) => !a.startsWith("--"));

  const raiz = raizDoProjeto(alvos[0] ?? process.cwd());
  if (!raiz) {
    console.error("scan-legacy: nenhum .maestro/ encontrado acima do caminho informado.");
    process.exit(2);
  }

  const padroes = lerPadroes(raiz);
  if (padroes.length === 0) {
    const aviso = "scan-legacy: legacyPatterns vazio em .maestro/config.json — nada a verificar. Ausencia de lista nao e ausencia de divida.";
    if (json) console.log(JSON.stringify({ padroes: [], total: 0, arquivos: [], aviso }, null, 2));
    else console.log(aviso);
    process.exit(0);
  }

  const caminhos = alvos.length > 0 ? alvos : [raiz];
  const porArquivo = [];
  let total = 0;

  for (const alvo of caminhos) {
    for (const arquivo of arquivos(path.resolve(alvo))) {
      let texto;
      try {
        texto = fs.readFileSync(arquivo, "utf8");
      } catch {
        continue;
      }
      const achados = [];
      for (const padrao of padroes) {
        let n = 0;
        let i = texto.indexOf(padrao);
        while (i !== -1) {
          n += 1;
          i = texto.indexOf(padrao, i + padrao.length);
        }
        if (n > 0) achados.push({ padrao, ocorrencias: n });
      }
      if (achados.length > 0) {
        const soma = achados.reduce((a, b) => a + b.ocorrencias, 0);
        total += soma;
        porArquivo.push({
          arquivo: path.relative(raiz, arquivo).split(path.sep).join("/"),
          total: soma,
          achados
        });
      }
    }
  }

  porArquivo.sort((a, b) => b.total - a.total);

  if (json) {
    console.log(JSON.stringify({ padroes, total, arquivos: porArquivo }, null, 2));
  } else if (total === 0) {
    console.log(`scan-legacy: 0 ocorrencias em ${caminhos.length} caminho(s). Limpo.`);
  } else {
    console.log(`scan-legacy: ${total} ocorrencia(s) de padrao legado em ${porArquivo.length} arquivo(s).\n`);
    for (const item of porArquivo) {
      const detalhe = item.achados.map((a) => `${a.padrao} x${a.ocorrencias}`).join(", ");
      console.log(`  ${String(item.total).padStart(4)}  ${item.arquivo}`);
      console.log(`        ${detalhe}`);
    }
    console.log(`\n  ${String(total).padStart(4)}  TOTAL`);
  }

  process.exit(total > 0 ? 1 : 0);
}

main();
