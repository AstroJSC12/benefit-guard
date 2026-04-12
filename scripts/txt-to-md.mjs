#!/usr/bin/env node

/**
 * Converts podcast transcript .txt files to formatted Markdown.
 * Extracts title and date from filename, merges single-line utterances into paragraphs.
 *
 * Usage:
 *   node scripts/txt-to-md.mjs <file1.txt> [file2.txt ...] [--out <dir>]
 *
 * If --out is not specified, .md files are written alongside the .txt files.
 */

import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
let outDir = null;
const files = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out" && args[i + 1]) {
    outDir = path.resolve(args[++i]);
  } else {
    files.push(args[i]);
  }
}

if (files.length === 0) {
  console.error("Usage: node scripts/txt-to-md.mjs <file1.txt> [file2.txt ...] [--out <dir>]");
  process.exit(1);
}

/**
 * Parse title and date from filename like:
 * "Some Title - 2026-02-06T09-00-00Z.txt"
 * "Some Title 2026-02-14 01_24_23.txt"
 */
function parseFilename(filename) {
  const base = filename.replace(/\.txt$/i, "");

  // Try pattern: "Title - YYYY-MM-DDThh-mm-ssZ"
  let match = base.match(/^(.+?)\s*-\s*(\d{4}-\d{2}-\d{2})T[\d-]+Z(?:\s.*)?$/);
  if (match) {
    return { title: match[1].trim(), date: match[2] };
  }

  // Try pattern: "Title YYYY-MM-DD hh_mm_ss"
  match = base.match(/^(.+?)\s+(\d{4}-\d{2}-\d{2})\s+[\d_]+$/);
  if (match) {
    return { title: match[1].trim(), date: match[2] };
  }

  // Fallback: use whole basename as title
  return { title: base, date: null };
}

/**
 * Merge single-line utterances into flowing paragraphs.
 * Groups consecutive non-empty lines, separated by blank lines, into paragraphs.
 */
function formatTranscript(raw) {
  const lines = raw.split("\n");
  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    } else {
      current.push(trimmed);
    }
  }
  if (current.length > 0) {
    paragraphs.push(current.join(" "));
  }

  return paragraphs.join("\n\n");
}

const created = [];

for (const filePath of files) {
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    continue;
  }

  const filename = path.basename(absPath);
  const { title, date } = parseFilename(filename);

  const raw = fs.readFileSync(absPath, "utf-8");
  const body = formatTranscript(raw);

  let md = `# ${title}\n\n`;
  if (date) {
    md += `**Date:** ${date}\n\n`;
  }
  md += `---\n\n${body}\n`;

  const dest = outDir
    ? path.join(outDir, filename.replace(/\.txt$/i, ".md"))
    : absPath.replace(/\.txt$/i, ".md");

  fs.writeFileSync(dest, md, "utf-8");
  console.log(`✓ ${dest}`);
  created.push(dest);
}

if (created.length === 0) {
  process.exit(1);
}
