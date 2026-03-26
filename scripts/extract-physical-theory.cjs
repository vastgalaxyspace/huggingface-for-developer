const fs = require("fs");
const path = require("path");

const inputPath = path.join(process.cwd(), "public/content/physical-hardware-theory.html");
const outputPath = path.join(process.cwd(), "src/data/physicalHardwareTheory.js");

const html = fs.readFileSync(inputPath, "utf8");

function stripTags(s) {
  return s
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function findBalancedDiv(src, openIndex) {
  const tagRe = /<\/?div\b[^>]*>/g;
  tagRe.lastIndex = openIndex;
  let depth = 0;
  let started = false;
  for (;;) {
    const m = tagRe.exec(src);
    if (!m) return -1;
    const tag = m[0];
    if (tag.startsWith("<div")) {
      depth += 1;
      started = true;
    } else if (tag.startsWith("</div")) {
      depth -= 1;
      if (started && depth === 0) return tagRe.lastIndex;
    }
  }
}

function parseParagraphs(sectionHtml) {
  const paras = [...sectionHtml.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => stripTags(m[1]));
  if (paras.length) return paras;
  const text = stripTags(sectionHtml);
  return text ? [text] : [];
}

function parseList(sectionHtml) {
  const items = [];
  const itemRe = /<div class="list-item">/g;
  for (;;) {
    const m = itemRe.exec(sectionHtml);
    if (!m) break;
    const end = findBalancedDiv(sectionHtml, m.index);
    const itemHtml = sectionHtml.slice(m.index, end);
    items.push(stripTags(itemHtml));
    itemRe.lastIndex = end;
  }
  return items.filter(Boolean);
}

function parseCompare(sectionHtml) {
  const cols = [];
  const colRe = /<div class="compare-col"[^>]*>/g;
  for (;;) {
    const m = colRe.exec(sectionHtml);
    if (!m) break;
    const end = findBalancedDiv(sectionHtml, m.index);
    const colHtml = sectionHtml.slice(m.index, end);
    const label = stripTags((colHtml.match(/<div class="compare-label"[^>]*>([\s\S]*?)<\/div>/) || ["", ""])[1]);
    const items = [...colHtml.matchAll(/<div class="compare-item">([\s\S]*?)<\/div>/g)]
      .map((it) => stripTags(it[1]))
      .filter(Boolean);
    cols.push({ label, items });
    colRe.lastIndex = end;
  }
  return cols;
}

function parseFormula(sectionHtml) {
  const subMatch = sectionHtml.match(/<div class="formula-sub">([\s\S]*?)<\/div>/);
  const sub = subMatch ? stripTags(subMatch[1]) : "";
  const main = stripTags(sectionHtml.replace(/<div class="formula-sub">[\s\S]*?<\/div>/, ""));
  return { main, sub };
}

function parseKvGrid(sectionHtml) {
  const kvs = [];
  const kvRe = /<div class="kv">/g;
  for (;;) {
    const m = kvRe.exec(sectionHtml);
    if (!m) break;
    const end = findBalancedDiv(sectionHtml, m.index);
    const kvHtml = sectionHtml.slice(m.index, end);
    const key = stripTags((kvHtml.match(/<div class="kv-key">([\s\S]*?)<\/div>/) || ["", ""])[1]);
    const value = stripTags((kvHtml.match(/<div class="kv-val">([\s\S]*?)<\/div>/) || ["", ""])[1]);
    kvs.push({ key, value });
    kvRe.lastIndex = end;
  }
  return kvs.filter((kv) => kv.key || kv.value);
}

function parseTags(sectionHtml) {
  return [...sectionHtml.matchAll(/<div class="tag">([\s\S]*?)<\/div>/g)].map((m) => stripTags(m[1])).filter(Boolean);
}

function parseTable(sectionHtml) {
  const headers = [...sectionHtml.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => stripTags(m[1]));
  const rows = [];
  const tbodyMatch = sectionHtml.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if (tbodyMatch) {
    for (const tr of tbodyMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
      const cells = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => stripTags(m[1]));
      if (cells.length) rows.push(cells);
    }
  }
  return { headers, rows };
}

function parseBlock(blockHtml) {
  const title = stripTags((blockHtml.match(/<div class="block-title">([\s\S]*?)<\/div>/) || ["", ""])[1]);
  const sections = [];
  const known = new Set(["block-content", "list", "compare", "formula-box", "kv-grid", "tag-row", "table-wrap"]);

  let cursor = blockHtml.indexOf("</div>");
  cursor = cursor >= 0 ? cursor + 6 : 0;

  while (cursor < blockHtml.length) {
    const sub = blockHtml.slice(cursor);
    const m = sub.match(/<div class="([^"]+)"[^>]*>/);
    if (!m) break;
    const abs = cursor + m.index;
    const className = m[1].split(" ")[0];
    if (!known.has(className)) {
      cursor = abs + 1;
      continue;
    }

    const end = findBalancedDiv(blockHtml, abs);
    if (end === -1) break;
    const secHtml = blockHtml.slice(abs, end);

    if (className === "block-content") {
      sections.push({ type: "content", paragraphs: parseParagraphs(secHtml) });
    } else if (className === "list") {
      sections.push({ type: "list", items: parseList(secHtml) });
    } else if (className === "compare") {
      sections.push({ type: "compare", columns: parseCompare(secHtml) });
    } else if (className === "formula-box") {
      sections.push({ type: "formula", ...parseFormula(secHtml) });
    } else if (className === "kv-grid") {
      sections.push({ type: "kv", items: parseKvGrid(secHtml) });
    } else if (className === "tag-row") {
      sections.push({ type: "tags", items: parseTags(secHtml) });
    } else if (className === "table-wrap") {
      sections.push({ type: "table", ...parseTable(secHtml) });
    }

    cursor = end;
  }

  return { title, sections };
}

function parseTopic(topicHtml, id, toneClass) {
  const title = stripTags((topicHtml.match(/<span class="topic-title">([\s\S]*?)<\/span>/) || ["", ""])[1]);
  const topicBodyStart = topicHtml.indexOf('<div class="topic-body">');
  const bodyEnd = findBalancedDiv(topicHtml, topicBodyStart);
  const body = topicHtml.slice(topicBodyStart, bodyEnd);

  const blocks = [];
  const blockRe = /<div class="block">/g;
  for (;;) {
    const m = blockRe.exec(body);
    if (!m) break;
    const end = findBalancedDiv(body, m.index);
    const blockHtml = body.slice(m.index, end);
    blocks.push(parseBlock(blockHtml));
    blockRe.lastIndex = end;
  }

  return { id, title, toneClass, blocks };
}

const starts = [...html.matchAll(/<div id="topic-(\d+)" class="topic ([^"]+)">/g)]
  .map((m) => ({ id: m[1], toneClass: m[2], index: m.index }));

const topics = starts.map((s) => {
  const end = findBalancedDiv(html, s.index);
  const topicHtml = html.slice(s.index, end);
  return parseTopic(topicHtml, s.id, s.toneClass);
});

const out = `export const PHYSICAL_HARDWARE_THEORY = ${JSON.stringify(topics, null, 2)};\n`;
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, out, "utf8");

console.log(`topics: ${topics.length}`);
console.log(`blocks: ${topics.reduce((n, t) => n + t.blocks.length, 0)}`);
console.log(`lists: ${topics.reduce((n, t) => n + t.blocks.reduce((m, b) => m + b.sections.filter((s) => s.type === 'list').length, 0), 0)}`);
