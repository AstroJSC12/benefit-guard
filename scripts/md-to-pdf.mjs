#!/usr/bin/env node

/**
 * Converts one or more Markdown files to PDF and saves them to ~/Desktop.
 *
 * Usage:
 *   node scripts/md-to-pdf.mjs path/to/file1.md path/to/file2.md
 *
 * Options:
 *   --out <dir>   Override output directory (default: ~/Desktop)
 */

import { mdToPdf } from "md-to-pdf";
import path from "path";
import os from "os";
import { existsSync } from "fs";

// Parse args
const args = process.argv.slice(2);
let outDir = path.join(os.homedir(), "Desktop");
const files = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out" && args[i + 1]) {
    outDir = path.resolve(args[++i]);
  } else {
    files.push(args[i]);
  }
}

if (files.length === 0) {
  console.error("Usage: node scripts/md-to-pdf.mjs <file1.md> [file2.md ...] [--out <dir>]");
  process.exit(1);
}

const pdfOptions = {
  launch_options: { headless: true, args: ["--no-sandbox"] },
  pdf_options: {
    format: "Letter",
    margin: { top: "30mm", bottom: "30mm", left: "20mm", right: "20mm" },
    printBackground: true,
  },
  css: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #24292e;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 1.8em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.4em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h3 { font-size: 1.15em; }
    code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #dfe2e5; padding: 0 1em; color: #6a737d; margin: 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
    th { background: #f6f8fa; font-weight: 600; }
    img { max-width: 100%; }
    a { color: #0366d6; text-decoration: none; }
    hr { border: none; border-top: 1px solid #eaecef; }
  `,
};

let exitCode = 0;

for (const filePath of files) {
  const absPath = path.resolve(filePath);

  if (!existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    exitCode = 1;
    continue;
  }

  const pdfName = path.basename(absPath, path.extname(absPath)) + ".pdf";
  const dest = path.join(outDir, pdfName);

  try {
    await mdToPdf({ path: absPath }, { ...pdfOptions, dest });
    console.log(`✓ ${dest}`);
  } catch (err) {
    console.error(`✗ ${absPath}: ${err.message}`);
    exitCode = 1;
  }
}

process.exit(exitCode);
