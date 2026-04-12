---
description: Convert markdown files to PDF on Desktop. Use when creating markdown files that the user also wants as PDFs.
---

# /pdf — Markdown to PDF

When this workflow is invoked alongside a task that creates markdown files:

1. **Create the markdown files** as requested by the user. Track every `.md` file path you create.

2. **After all markdown files are created**, convert them to PDF by running the conversion script. Pass every markdown file you just created as arguments in a single command:

// turbo
```bash
node scripts/md-to-pdf.mjs <file1.md> <file2.md> ...
```

Run this from the `benefit-guard` project root (`/Users/jeffcoy/Projects/BenefitGuard/benefit-guard`).

The script:
- Converts each markdown file to a styled PDF
- Saves PDFs to `~/Desktop` by default (override with `--out <dir>`)
- Uses GitHub-style formatting (clean typography, code blocks, tables)
- Runs entirely locally — **zero API/token cost**

3. **Report** which PDFs were created on the Desktop.

## Example

If the user says: "Create a research brief and competitor analysis /pdf"

You would:
1. Create `research-brief.md` and `competitor-analysis.md`
2. Run: `node scripts/md-to-pdf.mjs "AI Team/research-brief.md" "AI Team/competitor-analysis.md"`
3. Confirm: "Created research-brief.pdf and competitor-analysis.pdf on your Desktop."

## Notes

- The `md-to-pdf` npm package must be installed (`npm install --save-dev md-to-pdf`).
- First run downloads Chromium (~170MB) via Puppeteer — subsequent runs are instant.
- Works with any `.md` file in the repo, not just newly created ones. You can also run it manually:
  ```bash
  node scripts/md-to-pdf.mjs path/to/any-file.md
  ```
