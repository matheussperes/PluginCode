/**
 * build-pdf.ts
 *
 * Lê os arquivos fonte listados em docs/Content-Outline.md, injeta o
 * conteúdo convertido para HTML no template de tools/pdf-guide/template.html
 * e exporta o resultado como PDF via Chromium (Playwright), seguindo
 * docs/Design-System.md.
 *
 * Uso:
 *   npx ts-node tools/pdf-guide/build-pdf.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { marked } from "marked";
import { chromium } from "playwright";

const ROOT = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(ROOT, "dist");
const OUT_FILE = path.join(OUT_DIR, "Maestro-Framework-Guide.pdf");
const TEMPLATE_PATH = path.join(__dirname, "template.html");
const STYLES_PATH = path.join(__dirname, "styles.css");
const CHROMIUM_PATH = "/opt/pw-browsers/chromium";

const ARCHIVED_PRD = "docs/archive/maestro-framework-bootstrap/PRD.md";

const PLUGIN = "plugins/maestro";

const AGENTS = [
  // Squad de Governança
  { file: `${PLUGIN}/agents/maestro.md`, name: "Maestro", role: "Governança — orquestrador da esteira", veto: false },
  { file: `${PLUGIN}/agents/memory-manager.md`, name: "Memory Manager", role: "Governança — sincroniza Backlog e Status", veto: false },
  { file: `${PLUGIN}/agents/improvement-agent.md`, name: "Improvement Agent", role: "Governança — retrospectiva e Lessons-Learned", veto: false },

  // Squad de Descoberta
  { file: `${PLUGIN}/agents/product-strategist.md`, name: "Product Strategist", role: "Descoberta — entrevista, PRD e estratégia de negócio", veto: false },
  { file: `${PLUGIN}/agents/interaction-architect.md`, name: "Interaction Architect", role: "Descoberta — telas, rotas e fluxos", veto: false },
  { file: `${PLUGIN}/agents/product-designer.md`, name: "Product Designer", role: "Descoberta — Design System, UX Writing e movimento", veto: false },
  { file: `${PLUGIN}/agents/data-architect.md`, name: "Data Architect", role: "Descoberta — schema, RLS e modelo de domínio", veto: false },
  { file: `${PLUGIN}/agents/backlog-planner.md`, name: "Backlog Planner", role: "Descoberta — fatiamento em micro-tasks", veto: false },
  { file: `${PLUGIN}/agents/spec-auditor.md`, name: "Spec Auditor", role: "Descoberta — gate de coerência cruzada", veto: true },

  // Squad de Execução
  { file: `${PLUGIN}/agents/frontend-engineer.md`, name: "Frontend Engineer", role: "Execução — React, Tailwind e Shadcn/UI", veto: false },
  { file: `${PLUGIN}/agents/backend-engineer.md`, name: "Backend Engineer", role: "Execução — Supabase, RLS e Edge Functions", veto: false },
  { file: `${PLUGIN}/agents/integration-engineer.md`, name: "Integration Engineer", role: "Execução — APIs externas e webhooks", veto: false },
  { file: `${PLUGIN}/agents/motor-engineer.md`, name: "Motor Engineer", role: "Execução — domínio e cálculo puro", veto: false },

  // Squad de Auditoria
  { file: `${PLUGIN}/agents/code-auditor.md`, name: "Code Auditor", role: "Auditoria — build, lint e tipos", veto: false },
  { file: `${PLUGIN}/agents/security-auditor.md`, name: "Security Auditor", role: "Auditoria — segredos, RLS e OWASP", veto: true },
  { file: `${PLUGIN}/agents/qa-engineer.md`, name: "QA Engineer", role: "Auditoria — comportamento e regressão", veto: true },
  { file: `${PLUGIN}/agents/ux-auditor.md`, name: "UX Auditor", role: "Auditoria — validação visual com evidência", veto: true },
];

const PIPELINES = [
  `${PLUGIN}/commands/maestro-init.md`,
  `${PLUGIN}/commands/maestro-discovery.md`,
  `${PLUGIN}/commands/maestro-next.md`,
  `${PLUGIN}/commands/maestro-audit.md`,
  `${PLUGIN}/commands/maestro-retro.md`,
];

const CONTRACTS = [
  `${PLUGIN}/templates/project/.maestro/contracts/Task-Execution-Contract.md`,
];

function readMd(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

function mdToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

/** Demota headings (h1->h2, h2->h3, ...) para não competir com o H1 do capítulo. */
function demoteHeadings(html: string, shift: number): string {
  return html.replace(/<(\/?)h([1-4])((?:\s[^>]*)?)>/g, (_match, close, level, attrs) => {
    const newLevel = Math.min(6, Number(level) + shift);
    return `<${close}h${newLevel}${close ? "" : attrs}>`;
  });
}

/** Mantém apenas as seções "## " cujo título casa com algum dos regexes dados. */
function extractSections(markdown: string, headingMatchers: RegExp[]): string {
  const lines = markdown.split("\n");
  const keep: string[] = [];
  let keeping = false;
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      keeping = headingMatchers.some((re) => re.test(line));
    }
    if (keeping) keep.push(line);
  }
  return keep.join("\n");
}

/** Envolve o parágrafo seguinte a um heading de Regra Absoluta/Dica em um callout. */
function injectCallouts(html: string): string {
  html = html.replace(
    /(<h[2-6][^>]*>(?:(?!<\/h[2-6]>)[\s\S])*(?:Regra Absoluta|Proibi(?:ções|do))(?:(?!<\/h[2-6]>)[\s\S])*<\/h[2-6]>)\s*(<p>[\s\S]*?<\/p>)/gi,
    '$1<div class="callout callout-danger">🔴 $2</div>'
  );
  html = html.replace(
    /(<h[2-6][^>]*>(?:(?!<\/h[2-6]>)[\s\S])*(?:Dica|Boa Prática)(?:(?!<\/h[2-6]>)[\s\S])*<\/h[2-6]>)\s*(<p>[\s\S]*?<\/p>)/gi,
    '$1<div class="callout callout-success">💡 $2</div>'
  );
  return html;
}

/** Troca <pre><code> por .pipeline-diagram quando o bloco contém setas de fluxo. */
function markPipelineDiagrams(html: string): string {
  return html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, inner: string) => {
    if (/→|->|[│▼┌└├]/.test(inner)) {
      return `<div class="pipeline-diagram">${inner}</div>`;
    }
    return match;
  });
}

function chapterHeading(title: string, id: string): string {
  return `<h1 id="${id}">${title}</h1>`;
}

function buildChapter1(): string {
  const extracted = extractSections(readMd(ARCHIVED_PRD), [/^##\s+1\./, /^##\s+2\./]);
  return chapterHeading("Capítulo 1 — Visão Geral e Filosofia", "cap-1") + demoteHeadings(mdToHtml(extracted), 1);
}

function buildChapter2(): string {
  const extracted = extractSections(readMd(ARCHIVED_PRD), [/^##\s+4\./]);
  return chapterHeading("Capítulo 2 — Estrutura de Diretórios da Plataforma", "cap-2") + demoteHeadings(mdToHtml(extracted), 1);
}

function buildChapter3(): string {
  let html = chapterHeading("Capítulo 3 — Catálogo de Agentes", "cap-3");
  for (const agent of AGENTS) {
    const body = demoteHeadings(mdToHtml(readMd(agent.file)), 1);
    const badge = agent.veto ? '<span class="badge-veto">Poder de Veto</span>' : "";
    html += `<div class="agent-header"><h2>${agent.name}</h2><span class="agent-role">${agent.role}</span>${badge}</div>${body}`;
  }
  return injectCallouts(html);
}

const OVERALL_PIPELINE_FLOW = `01-discovery.md   →   02-development.md   →   03-quality.md   →   04-retrospective.md
   (Discovery)          (Development)          (Quality)          (Retrospective)
        ▲                                                                │
        └───────────────────────── próxima task ────────────────────────┘`;

function buildChapter4(): string {
  let html = chapterHeading("Capítulo 4 — Pipelines Declarativos", "cap-4");
  html += `<p>As quatro fases abaixo são conectadas por handoffs explícitos: cada pipeline termina indicando qual o próximo, formando um ciclo que se repete task a task.</p>`;
  html += `<div class="pipeline-diagram">${OVERALL_PIPELINE_FLOW}</div>`;
  for (const file of PIPELINES) {
    html += markPipelineDiagrams(demoteHeadings(mdToHtml(readMd(file)), 1));
  }
  return html;
}

function buildChapter5(): string {
  let html = chapterHeading("Capítulo 5 — Contratos de Troca de Estado", "cap-5");
  for (const file of CONTRACTS) {
    html += demoteHeadings(mdToHtml(readMd(file)), 1);
  }
  return html;
}

function buildChapter6(): string {
  const extracted = extractSections(readMd(ARCHIVED_PRD), [/^##\s+5\./]);
  let html = chapterHeading("Capítulo 6 — Governança e Circuit Breaker", "cap-6");
  html += injectCallouts(demoteHeadings(mdToHtml(extracted), 1));
  html += "<p>Ver também, no Capítulo 3, os protocolos completos de veto em <strong>Security Auditor</strong> e <strong>UX Auditor</strong>.</p>";
  return html;
}

function buildChapter7(): string {
  const body = demoteHeadings(mdToHtml(readMd("tools/pdf-guide/content/quickstart.md")), 1);
  return chapterHeading("Capítulo 7 — Guia Rápido: Como Iniciar um Novo Projeto", "cap-7") + body;
}

function buildAppendix(): string {
  const body = demoteHeadings(mdToHtml(readMd("tools/pdf-guide/content/appendix-history.md")), 1);
  return chapterHeading("Apêndice — Histórico da Construção do Framework", "apendice") + body;
}

function buildToc(entries: Array<{ id: string; title: string }>): string {
  const items = entries.map((e) => `<li><a href="#${e.id}">${e.title}</a></li>`).join("\n");
  return `<ul>${items}</ul>`;
}

async function main() {
  const chapters = [
    { id: "cap-1", title: "Capítulo 1 — Visão Geral e Filosofia", html: buildChapter1() },
    { id: "cap-2", title: "Capítulo 2 — Estrutura de Diretórios da Plataforma", html: buildChapter2() },
    { id: "cap-3", title: "Capítulo 3 — Catálogo de Agentes", html: buildChapter3() },
    { id: "cap-4", title: "Capítulo 4 — Pipelines Declarativos", html: buildChapter4() },
    { id: "cap-5", title: "Capítulo 5 — Contratos de Troca de Estado", html: buildChapter5() },
    { id: "cap-6", title: "Capítulo 6 — Governança e Circuit Breaker", html: buildChapter6() },
    { id: "cap-7", title: "Capítulo 7 — Guia Rápido: Como Iniciar um Novo Projeto", html: buildChapter7() },
    { id: "apendice", title: "Apêndice — Histórico da Construção do Framework", html: buildAppendix() },
  ];

  const toc = buildToc(chapters.map((c) => ({ id: c.id, title: c.title })));
  const content = chapters.map((c) => c.html).join("\n");

  const version = "1.0.0";
  const date = new Date().toISOString().slice(0, 10);
  const stylesHref = `file://${STYLES_PATH.replace(/\\/g, "/")}`;

  let html = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  html = html
    .replaceAll('href="styles.css"', `href="${stylesHref}"`)
    .replaceAll("{{TITLE}}", "Guia de Referência — Framework .maestro")
    .replaceAll("{{SUBTITLE}}", "Estrutura, Agentes e Pipelines")
    .replaceAll("{{VERSION}}", version)
    .replaceAll("{{DATE}}", date)
    .replaceAll("{{TOC}}", toc)
    .replaceAll("{{CONTENT}}", content);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const buildHtmlPath = path.join(OUT_DIR, "_build.html");
  fs.writeFileSync(buildHtmlPath, html, "utf-8");

  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${buildHtmlPath}`, { waitUntil: "load" });
    await page.pdf({
      path: OUT_FILE,
      preferCSSPageSize: true,
      printBackground: true,
      margin: { top: "25mm", bottom: "25mm", left: "20mm", right: "20mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="width:100%;font-size:9px;color:#6B7280;text-align:center;">Framework .maestro — Guia de Referência &nbsp;•&nbsp; Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
    });
  } finally {
    await browser.close();
  }

  fs.rmSync(buildHtmlPath, { force: true });
  console.log(`✅ PDF gerado em ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("[build-pdf] Erro:", err);
  process.exit(1);
});
