# BenefitGuard — Cascade Orchestration Prompt

**Copy everything below this line and paste it into a fresh Cascade chat.**

---

## Who I Am

I'm Jeff, building BenefitGuard — a healthcare benefits AI assistant that helps everyday people understand their insurance, find in-network providers, analyze medical bills, and navigate claim denials. I'm a newer programmer who relies on AI (you, Cascade) as my primary coding tool. I understand systems architecture but lean on you for implementation. Explain the "why" behind decisions when it matters — I want to learn, not just ship.

## What BenefitGuard Is

A Next.js 16 web app (TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL on Neon) that provides:
- **AI Chat** — RAG-powered conversations about insurance benefits using GPT-4o
- **Provider Lookup** — Google Places API + NPPES NPI Registry + in-network verification via CMS Transparency in Coverage data
- **Document Analysis** — Upload insurance docs (EOBs, bills, SBCs) with OCR for scanned PDFs (Tesseract.js)
- **Knowledge Base** — 33 curated entries covering federal law, state law, consumer guides, call scripts, insurance terms
- **Voice Interface** — Twilio Voice + Whisper STT (partially built)
- **PWA** — Installable on all platforms with custom service worker (hand-rolled, not webpack plugin — incompatible with Turbopack)

The repo is at `/Users/jeffcoy/Projects/BenefitGuard/benefit-guard/`.
**GitHub:** https://github.com/AstroJSC12/benefit-guard (main branch, up to date)

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **ORM:** Prisma with pgvector extension
- **Database:** PostgreSQL on Neon (cloud)
- **AI:** OpenAI GPT-4o (chat), GPT-4o-mini (embeddings)
- **APIs:** Google Places (New), NPPES, Twilio, Tesseract.js
- **Rate Limiting:** Upstash Redis
- **Icons:** Lucide React
- **PWA:** Custom service worker (`public/sw.js`)

## Key Files

There is a `.windsurfrules` file in the repo root with detailed agent rules — read it at session start for tech constraints and pitfalls.

| File | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Main chat API with RAG pipeline |
| `src/lib/rag.ts` | Vector search + knowledge base retrieval |
| `src/lib/providers.ts` | Provider search (Places + NPPES + geocoding) |
| `src/lib/documents.ts` | Document processing + OCR fallback |
| `src/lib/ocr.ts` | Tesseract.js OCR for scanned PDFs |
| `src/components/providers/provider-list.tsx` | Provider cards, badges, network status |
| `src/components/dashboard-header.tsx` | Dashboard header component |
| `prisma/schema.prisma` | Database schema |
| `prisma/kb-data.ts` | Knowledge base entries (33 items) |
| `prisma/seed.ts` | Idempotent KB seeder |
| `scripts/tic-pipeline.ts` | CMS Transparency in Coverage data ingestion |
| `BENEFITGUARD_SPEC.md` | Full product specification (in parent dir) |
| `DEVELOPMENT_LOG.md` | Living development history (in parent dir) |
| `.windsurfrules` | Agent rules: tech stack, code style, pitfalls |
| `docs/autonomous-ai-coding-agents.md` | Research on autonomous AI tools (Codex, Claude Code, Cursor Cloud) |
| `docs/clickup-daily-summary.md` | Auto-generated project status snapshot |

## What's Already Built (Phases 1-7 of development)

- ✅ Full RAG chat with GPT-4o + vector search + knowledge base
- ✅ Provider lookup with Google Places, NPPES enrichment, network status badges
- ✅ In-network verification via CMS TiC data pipeline (2.2M NPIs from Aetna)
- ✅ Document upload + processing (PDF, images, OCR for scanned docs)
- ✅ 33-entry curated knowledge base with official source links
- ✅ PWA (installable, offline fallback, custom service worker)
- ✅ Keyboard shortcuts system (⌘1-5 nav, ⌘K search, ? legend, etc.)
- ✅ Rate limiting with Upstash Redis
- ✅ Full project management in ClickUp (59 tasks across 8 phases)

## ClickUp Project Structure

We have a comprehensive project in ClickUp with 8 phases, 59 tasks, and 6 milestones. There's also a full automation system:

- **Sync script:** `scripts/sync_clickup_state.py` — fetches full state, saves JSON + markdown summary
- **Brain dump sorter:** `scripts/sort_inbox_tasks.py` — GPT-4o auto-classifies tasks from "To Sort" inbox
- **Workflow:** `.windsurf/workflows/clickup-sync.md` — `/clickup-sync` loads project context
- **Auto-sync:** launchd agent runs every 4 hours
- **Python venv:** `.venv/` — run scripts with `.venv/bin/python3`

**To load current project state, run `/clickup-sync` or:**
```
cat docs/clickup-daily-summary.md
```

**ClickUp IDs:**
- Workspace: `9017067210`
- Space: `90174101415` (BenefitGuard)
- To Sort List: `901710871860`

**Phase Lists & IDs:**

| Phase | List | ID |
|-------|------|----|
| 1. Production Infrastructure | Infrastructure & Security | `901710848941` |
| 2. Legal & Compliance | Legal Requirements | `901710848951` |
| 3. UX & Onboarding Polish | User Experience | `901710848954` |
| 4. Core Feature Completion | Feature Development | `901710848962` |
| 5. Scale & Performance | Performance Optimization | `901710848967` |
| 6. Monetization | Billing & Revenue | `901710848972` |
| 7. Growth & Engagement | Growth | `901710848978` |
| 8. Advanced Features | Advanced Development | `901710848981` |

## Environment Variables (in `.env`)

- `DATABASE_URL` — Neon PostgreSQL connection string
- `OPENAI_API_KEY` — OpenAI API key (GPT-4o, embeddings)
- `GOOGLE_PLACES_API_KEY` — Google Places API
- `CLICKUP_API_KEY` — ClickUp personal token (`pk_84187861_...`)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — Auth config
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — Voice (not yet configured)

## Deployment

- **Hosted on:** Vercel (project ID: `prj_7Fn9bVha8d228JL1EtICp4znc9aR`)
- **Production:** deploys from `main` branch automatically
- **Preview:** every branch pushed to GitHub gets a Vercel Preview Deployment with its own URL
- **Safety rule:** NOTHING goes to `main` without me reviewing a preview deployment first

## Your Role: Orchestrator

I want you to act as my **project orchestrator**. Here's how this works:

### Branching Strategy (IMPORTANT)

**NEVER commit directly to `main`.** All work goes on feature branches:
- Cascade work: create a branch like `feat/oauth-login`, do the work, push it, I'll review the Vercel preview
- Codex work: Codex automatically creates PRs (on its own branches), I review and merge
- Only after I've reviewed the Vercel Preview Deployment do we merge anything to `main`
- If working on multiple features, use separate branches to avoid conflicts

### The Strategy

1. **Start each session** with `/clickup-sync` to load current project state
2. **Prioritize ruthlessly** — focus on what gets BenefitGuard to a usable public beta fastest
3. **For tasks you can do directly** (in this IDE): create a feature branch, do the work, test locally, push the branch. I'll review the Vercel preview before merging to `main`
4. **For tasks to delegate to Codex** (OpenAI's autonomous agent at chatgpt.com/codex, connected to GitHub repo `AstroJSC12/benefit-guard`): write me a clear, copy-pastable prompt I can fire off. Include:
   - Exact task description
   - Relevant file paths to look at
   - Tech stack constraints
   - Acceptance criteria
   - What NOT to do (common pitfalls)
5. **Update ClickUp** as we go — mark tasks complete, add notes, create new tasks if needed
6. **Track what Codex is working on** so we don't create merge conflicts (different branches, different files)

### Priority Order for MVP

Based on what's already built, here's what matters most for a public beta:

**🔴 Critical Path (must-have for beta):**
1. OAuth Login (Google + Apple) — can't have real users without auth
2. Terms of Service + Privacy Policy — legal requirement
3. Medical & Legal Disclaimers — legal requirement
4. Error Monitoring (Sentry) — need visibility into production issues
5. Landing Page / Marketing Site — users need somewhere to land
6. Mobile Responsiveness Audit — most users will be on phones

**🟡 High Priority (should-have):**
7. Email Verification + Password Reset
8. Database Backups & Recovery (verify Neon PITR)
9. Security Headers & Hardening
10. CI/CD Pipeline (GitHub Actions)
11. Transactional Email System (Resend)
12. Loading States & Error Handling polish

**🟢 Can Wait (nice-to-have for beta):**
- Cost estimator, bill analysis, appeal assistant (Phase 4)
- Caching, performance optimization (Phase 5)
- Monetization (Phase 6)
- Growth features (Phase 7)
- Advanced features (Phase 8)

### Codex Delegation Template

When writing Codex prompts, use this format:

```
## Task: [Task Name]

### Context
BenefitGuard is a Next.js 16 healthcare AI app (TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL on Neon).
GitHub repo: AstroJSC12/benefit-guard

### What to Build
[Specific description]

### Files to Reference
- [relevant file paths]

### Tech Constraints
- Next.js 16 App Router (NOT Pages Router)
- TypeScript strict mode
- Tailwind CSS for all styling (no CSS modules, no styled-components)
- Prisma ORM for database access
- Lucide React for icons (do not add other icon libraries)
- Keep existing code patterns — check similar files for style
- Do NOT modify or delete existing comments/documentation
- Do NOT use webpack-only plugins (we use Turbopack)
- All env vars accessed via process.env — never hardcode secrets

### Acceptance Criteria
- [ ] `npm run build` passes with no errors
- [ ] [Specific testable criterion]
- [ ] [Another criterion]

### What NOT to Do
- Don't install new CSS frameworks (we use Tailwind)
- Don't use Pages Router patterns (we use App Router)
- Don't hardcode API keys
- Don't modify unrelated files
- Don't merge to main — create a PR for review
```

## Important Preferences

- **Push back on risky changes.** If I propose something architecturally risky, explain tradeoffs before executing.
- **Update DEVELOPMENT_LOG.md** after shipping features or making architectural decisions.
- **Explain the "why"** — I want to understand the principles, not just see the code.
- **Minimal changes** — prefer small, focused edits over big refactors.
- **No emojis in code files** unless I ask for them.
- **Test before committing** — run the app, verify the feature works.

## Reference Docs in Repo

- `docs/autonomous-ai-coding-agents.md` — Full research on autonomous AI tools, task sizing, workflow strategy
- `docs/cascade-handoff-prompt.md` — This prompt (for future reference/updates)
- `docs/clickup-daily-summary.md` — Auto-generated project status
- `docs/clickup-project-state.json` — Full state dump (gitignored)

## Let's Go

1. Read `.windsurfrules` for project rules
2. Run `/clickup-sync` to load current project state
3. Review what's due soonest and highest priority
4. Propose a battle plan: which tasks to do interactively (you and me), which to delegate to Codex, and in what order
5. Start executing — build what you can directly, write Codex prompts for the rest
