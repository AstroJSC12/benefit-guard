# BenefitGuard — Development Log

> **Project**: BenefitGuard — Personal AI co-pilot for navigating US healthcare benefits  
> **Developer**: Jeff Coy (architect) + Cascade AI (implementation)  
> **Started**: January 2026  
> **Last Updated**: February 8, 2026

---

## How to Read This Log

This document tracks every major feature, bug fix, and architectural decision made during the build of BenefitGuard. It's organized chronologically by development phase. Each entry includes what was built, where the code lives, and any key decisions or lessons learned.

---

## Phase 1 — Foundation & Core Infrastructure

**Timeframe**: Late January – Early February 2026

### 1.1 Project Setup

- Initialized **Next.js 15** (App Router) with TypeScript, Tailwind CSS, and shadcn/ui
- Set up **PostgreSQL** with **Prisma ORM** and **pgvector** extension for vector embeddings
- Configured **NextAuth.js** with credentials provider for authentication
- Created onboarding flow: account creation → zip code/state → document upload → confirmation
- Product spec finalized in `BENEFITGUARD_SPEC.md`

**Key files**:
- `prisma/schema.prisma` — Database schema (users, conversations, messages, documents, chunks, KB entries)
- `src/lib/auth.ts` — NextAuth configuration
- `src/lib/db.ts` — Prisma client singleton
- `src/app/auth/` — Sign-in and sign-up pages
- `src/app/onboarding/` — Onboarding wizard

### 1.2 Document Processing Pipeline

- Built PDF upload and text extraction using `pdf-parse`
- Implemented text chunking with overlap for better retrieval
- Embedded chunks using OpenAI `text-embedding-ada-002` and stored in pgvector
- Supports: SBC, EOB, denial letters, medical bills, formularies

**Key files**:
- `src/lib/documents.ts` — PDF processing, chunking, and embedding pipeline
- `src/app/api/documents/` — Upload, list, and processing API routes
- `src/app/dashboard/documents/` — Document management UI with PDF viewer

### 1.3 Chat Interface & RAG Pipeline

- Built streaming chat interface with conversation history
- Implemented two-tier RAG retrieval:
  - **User documents**: Personal uploaded document chunks matched by cosine similarity
  - **Centralized KB**: Federal/state law entries filtered by user's state
- Query embedding → vector search → context construction → GPT-4o streaming response
- Conversation persistence with auto-titling after first message

**Key files**:
- `src/lib/rag.ts` — RAG retrieval pipeline (dual-source: user docs + KB)
- `src/lib/openai.ts` — OpenAI client, system prompt, and chat completion
- `src/app/api/chat/route.ts` — Streaming chat API endpoint
- `src/app/api/conversations/` — Conversation CRUD
- `src/components/chat/` — Chat UI components (message list, input, sidebar)

### 1.4 Voice Access (Twilio)

- Integrated Twilio Voice webhook for phone-based AI interaction
- Audio → Whisper STT → RAG pipeline → TTS → streamed back to caller
- Users can link their phone number in settings for personalized responses

**Key files**:
- `src/app/api/voice/` — Twilio webhook handler
- `src/app/api/transcribe/` — Audio transcription endpoint

### 1.5 Basic Provider Lookup

- Initial mock data implementation for provider search by zip code
- UI with provider cards showing name, address, phone, type
- Types: urgent care, hospital, clinic, pharmacy, dentist

**Key files**:
- `src/lib/providers.ts` — Provider search (initially mock, later upgraded)
- `src/app/api/providers/route.ts` — Provider API endpoint
- `src/components/providers/provider-list.tsx` — Provider list UI
- `src/app/dashboard/providers/` — Providers page

---

## Phase 2 — Knowledge Base & Bot Quality

**Timeframe**: Early February 2026

### 2.1 Centralized Knowledge Base (33 Entries)

Built a comprehensive, seed-able knowledge base covering six categories:

| Category | Count | Examples |
|----------|-------|---------|
| **Federal Law** | 12 | No Surprises Act (4 focused entries: emergency, balance billing, good faith estimates, IDR), ACA (2: protections + preventive services), HIPAA, ERISA, Mental Health Parity, COBRA, Newborns'/Mothers' Act, WHCRA |
| **Consumer Guide** | 8 | SBC reading, EOB reading, claim appeals, medical bills, ER vs urgent care, prescription/formularies, special enrollment, coordination of benefits |
| **Insurance Terms** | 2 | Core glossary, plan types (HMO/PPO/EPO/POS) |
| **Call Script** | 3 | Denied claim script, surprise bill dispute script, prior authorization script |
| **State Law** | 8 | CA, NY, TX, FL, IL, PA, OH, GA |

**Technical details**:
- KB data defined in `prisma/kb-data.ts` with deterministic slug IDs
- Seed runner in `prisma/seed.ts` — idempotent (clears all KB entries, then re-inserts)
- `sourceUrl` uses **Text Fragment syntax** (`#:~:text=`) to deep-link to relevant sections on .gov sites
- Run with: `npx --yes tsx prisma/seed.ts`

**Key files**:
- `prisma/kb-data.ts` — All 33 knowledge base entries
- `prisma/seed.ts` — Idempotent seed script

### 2.2 RAG Pipeline Enhancements

- Added `sourceUrl` field to `RetrievedChunk` type for citation pass-through
- `retrieveKnowledgeBase()` now selects and returns `sourceUrl`
- `buildContextPrompt()` includes `[Official Source](url)` links for KB entries
- Added **similarity threshold** (0.72) to filter out low-relevance KB entries — prevents wasting tokens on unrelated nearest-neighbor results
- Added KB entry debug logging to chat route for better observability

**Key files**:
- `src/lib/rag.ts` — Updated retrieval with sourceUrl and similarity floor
- `src/types/index.ts` — `RetrievedChunk` type with `sourceUrl?: string`

### 2.3 Bot Answer Quality Overhaul

Rewrote the entire GPT-4o system prompt to fix fundamental answer quality issues:

- **Before**: Hedging, deflecting to "call your insurer," verbose walls of text, no citations
- **After**: Confident direct answers, concise formatting with bold numbers and bullet points, always cites View Source links from RAG pipeline

Changes:
- Lowered temperature from default to **0.3** for more consistent, factual responses
- Added SBC interpretation expertise to system prompt
- Enforced concise formatting rules (2–4 paragraphs max, bold key numbers)
- Instructed model to only use internal `[View Source](/dashboard/documents/...)` links from RAG context — not external URLs pulled from raw document text

**Key decision**: The bot was generating external Aetna URLs it found in the SBC text instead of using the internal document viewer links provided by the RAG pipeline. Fixed by adding explicit system prompt instructions.

### 2.4 Bot Test Questions

Created `BOT_TEST_QUESTIONS.md` with **24 questions** across 3 difficulty levels:

- **L1 (6 questions)**: Basic retrieval — copays, deductibles, OOP max
- **L2 (8 questions)**: Interpretation & cross-reference — hospital cost calculations, multi-document queries
- **L3 (10 questions)**: Edge cases & stress tests — excluded services, medical advice boundaries, emotional users

Includes a scoring rubric checking: accuracy, conciseness, citations, confidence, plain language, and no unnecessary deflection.

---

## Phase 3 — Provider Lookup: Full Build

**Timeframe**: Early–Mid February 2026

### 3.1 Google Places API Integration

Replaced mock data with live Google Places API (New) for real provider search:

- **Geocoding**: `geocodeZip()` for zip codes, `geocodeAddress()` for full street addresses — both use Places Text Search (no separate Geocoding API needed)
- **Search strategy**:
  - Hospital/Clinic/Pharmacy/Dentist → `searchNearby` with valid place types
  - Urgent Care → `searchText` (no valid Nearby Search type exists for urgent care)
  - "All" filter → parallel `searchNearby` + `searchText`, deduped by place ID
- **Distance**: Haversine formula for distance calculations from search center
- **Caching**: Geocode results cached for 1 hour
- **Fallback**: Mock data still returned when `GOOGLE_PLACES_API_KEY` is not configured

**Key files**:
- `src/lib/providers.ts` — Full hybrid search strategy

### 3.2 NPPES NPI Registry Integration

Built enrichment layer using the free government NPPES API (no key needed):

- Every provider returned from Google Places gets enriched with their official **10-digit NPI** and **taxonomy classification**
- 24-hour cache to avoid redundant lookups
- 3-concurrent batch lookups, non-blocking (doesn't slow down initial results)

**Key files**:
- `src/lib/nppes.ts` — NPPES API client with caching and batch processing

### 3.3 Insurer Detection & Network Status

- Built insurer detection by scanning uploaded SBC document text for keyword matches
- Supports **12 major US insurers**: Aetna, BCBS, Cigna, UnitedHealthcare, Humana, Kaiser, Anthem, Molina, Centene, WellCare, Ambetter, Oscar
- Each insurer has a mapped deep-link to their provider finder website
- **"Check Network Status"** button appears on each expanded provider card when an insurer is detected — opens the insurer's provider directory directly

**Key files**:
- `src/lib/insurer-directories.ts` — 12 insurer definitions with provider finder URLs
- `src/app/api/user/insurer/route.ts` — Scans user documents to detect insurer

### 3.4 Provider List UI Enhancements

Built out a full-featured provider search experience:

- **Sort controls**: Sort by distance or rating, with a clear/reset option (click active sort to deselect)
- **Open Now filter**: Toggle to show only currently-open locations, with contextual empty state
- **Expandable cards**: "More/Less" chevron reveals:
  - Business hours (today highlighted in bold)
  - Website link
  - NPI number and taxonomy
  - "Check Network Status" deep-link button
- **Address-based search**: Input accepts zip code OR full street address (widened input field)
- **Directions dropdown**: Choose between **Google Maps** or **Apple Maps** routing — uses lat/lng coordinates when available for accurate routing
- **Result count with context**: Shows "X providers near [location]" with active filter indicators

**Key files**:
- `src/components/providers/provider-list.tsx` — Full provider list UI

### 3.5 Provider Type Updates

Extended the `Provider` type to support all new data:

- `npi`, `taxonomy` — from NPPES
- `weekdayHours` — business hours from Google Places
- `websiteUrl` — provider website
- `latitude`, `longitude` — coordinates for directions and distance
- `googleMapsUri` — direct Google Maps link

**Key files**:
- `src/types/index.ts` — Extended Provider interface

### 3.6 Future: Phase 2 Provider Plan

> **Planned**: CMS Transparency in Coverage data ingestion for in-network/out-of-network badges directly on provider cards (no manual insurer directory lookup needed).

---

## Phase 4 — UI/UX Polish & Keyboard Shortcuts

**Timeframe**: Mid February 2026

### 4.1 Keyboard Shortcuts System

Built a complete keyboard shortcuts framework:

- **Central registry** in `src/lib/keyboard-shortcuts.ts` with Mac/Win key detection
- **Global provider** wrapping the dashboard layout
- **Legend overlay** triggered by pressing `?`
- **ShortcutTooltip component** with 0.5s hover delay for discoverability

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts legend |
| `N` | New chat |
| `⌘K` | Search chats |
| `/` | Focus chat input |
| `Esc` | Close overlay/modal |
| `⌘1–5` | Navigate sidebar sections |
| `⌘B` | Toggle sidebar |
| `⌘.` | Toggle theme |
| `⌘,` | Open settings |
| `⌘⇧C` | Copy last response |
| `⌘⇧⌫` | Delete chat |
| `⌘⇧M` | Voice input |
| `=` / `-` | Zoom in/out PDF viewer |

Custom events (`bg:new-chat`, `bg:focus-search`, `bg:toggle-sidebar`, `bg:focus-input`) bridge the keyboard shortcuts provider to sidebar and chat components.

**Key files**:
- `src/lib/keyboard-shortcuts.ts` — Shortcut definitions and registry
- `src/components/keyboard-shortcuts-provider.tsx` — Global event listener
- `src/components/keyboard-shortcuts-overlay.tsx` — `?` key legend overlay
- `src/components/ui/shortcut-tooltip.tsx` — Hover tooltip with shortcut hints

### 4.2 Top Header Bar

Created `DashboardHeader` component:

- Dynamic page title and description on the left (changes per route)
- Help button + user avatar with initials on the right
- Header height (`h-14`) aligns with sidebar brand for a continuous border line across full width

**Key files**:
- `src/components/dashboard-header.tsx` — Dashboard header component

### 4.3 Sidebar Polish

- Restructured brand header to match header height alignment
- Added better spacing between sections
- Moved "New Chat" button to its own section
- Improved bottom nav padding
- Bottom nav order matches `⌘1–5`: Home → Chat → Find Providers → My Documents → Settings
- Chat history section is collapsible

### 4.4 Warm Color Palette

Shifted the entire CSS variable system from cool blue to warm sand/cream:

- **Before**: oklch hue ~250 (cool blue/indigo) — felt sterile and clinical
- **After**: oklch hue ~75 (warm sand/cream) — feels welcoming and approachable
- Updated: backgrounds, borders, cards, muted surfaces, gradient backgrounds in chat area, warm tints on header and input areas

**Key files**:
- `src/app/globals.css` — CSS custom properties (oklch color system)

### 4.5 Welcome Screen Shield Icon

Replaced the generic Bot icon with the BenefitGuard shield icon on the "Welcome to BenefitGuard" chat landing page — reinforces brand identity.

### 4.6 Auto-Focus Chat Input

Pressing `N` for new chat now automatically focuses the text input box via a custom `bg:focus-input` event dispatched after navigation. Small but important UX improvement — users can start typing immediately.

### 4.7 PDF Viewer Zoom Shortcuts

Added `=` and `-` keys to zoom in/out on the PDF viewer (both My Documents page and Source Overlay). Includes input-field detection so they don't fire while the user is typing in a text field.

---

## Bug Fixes

### BF-001: View Source Links Generating External URLs

**Symptom**: Bot responses contained external Aetna URLs instead of internal document viewer links.  
**Root cause**: GPT-4o was pulling URLs from the raw SBC text content instead of using the `[View Source](/dashboard/documents/...)` links provided by the RAG pipeline context.  
**Fix**: Added explicit system prompt instructions telling the model to only use the internal View Source links provided in the context block.

### BF-002: Disappearing Sidebar Chats

**Symptom**: Last 4 chats disappeared from sidebar, then reappeared after page refresh.  
**Root cause**: Multiple issues compounding:
1. Stale cached data — `fetch('/api/conversations')` had no cache control
2. Missing re-fetch on navigation — sidebar only fetched on mount, never refreshed
3. Keyboard shortcut `useEffect` had no dependency array — re-registered listeners on every render

**Fix**:
- Added `cache: "no-store"` to conversation fetch calls
- Added re-fetch on `pathname` change
- Fixed the keyboard shortcut `useEffect` dependency array

### BF-003: ⌘B Sidebar Toggle Not Working

**Symptom**: Pressing `⌘B` didn't toggle the sidebar visibility.  
**Root cause**: `dispatchEvent()` was called inside `setSidebarVisible`'s state updater function — a side effect inside a pure function. In React 18 strict mode (default in Next.js), state updaters run twice during development, causing the event to fire twice and toggle the sidebar back to its original state.  
**Fix**: Moved event dispatch outside the state updater. Used a `useRef` to track sidebar visibility (avoids stale closure issues), then dispatch the custom event with the correct new value after the state update.

**Lesson learned**: Never put side effects (DOM events, API calls, logging) inside React state updater functions. They must be pure — given the same input, return the same output with no side effects.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Color system** | oklch in CSS custom properties | Perceptually uniform color space, easy to shift entire palette by changing hue value |
| **Keyboard shortcuts** | Central registry + custom events | Decouples shortcut definitions from component implementations; components listen for events without knowing about keyboard handling |
| **Provider search** | Google Places API (New) | Real data with ratings, hours, photos; REST API with field masking for cost control |
| **NPI enrichment** | NPPES API (non-blocking) | Free government API, no key needed; enriches after initial results so it doesn't slow down the primary search |
| **Insurer detection** | Document text keyword matching | Simple, effective for MVP; scans uploaded SBC text for insurer name mentions |
| **KB seeding** | Idempotent clear-and-reinsert | Safe to run repeatedly; deterministic slug IDs ensure consistency |
| **Source URLs** | Text Fragment syntax | Deep-links directly to relevant sections on .gov sites, not just the homepage |
| **RAG similarity floor** | 0.72 threshold | Prevents low-relevance KB entries from wasting tokens and confusing the model |
| **System prompt style** | Confident, concise, citation-heavy | Matches the "knowledgeable friend" persona from the spec; avoids hedging when data is available |
| **Sidebar state** | useRef for keyboard toggle | Avoids stale closures and strict-mode double-invocation issues |

---

## Current Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 15 (App Router), TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, oklch color system |
| **Database** | PostgreSQL + Prisma ORM + pgvector |
| **LLM** | OpenAI GPT-4o (temperature 0.3) |
| **Embeddings** | OpenAI text-embedding-ada-002 |
| **Auth** | NextAuth.js (credentials) |
| **Provider Search** | Google Places API (New) + NPPES NPI Registry |
| **Voice** | Twilio Voice + Whisper STT |
| **Insurer Detection** | Keyword matching against 12 major US insurers |

---

## File Reference

### Core Libraries (`src/lib/`)

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth configuration |
| `db.ts` | Prisma client singleton |
| `documents.ts` | PDF processing, chunking, embedding |
| `insurer-directories.ts` | 12 insurer definitions + provider finder URLs |
| `keyboard-shortcuts.ts` | Central shortcut registry with Mac/Win detection |
| `nppes.ts` | NPPES NPI Registry API client (24hr cache) |
| `openai.ts` | OpenAI client, system prompt, chat completion |
| `providers.ts` | Google Places hybrid search + geocoding + mock fallback |
| `rag.ts` | Two-tier RAG retrieval (user docs + KB) |
| `utils.ts` | Shared utilities |

### API Routes (`src/app/api/`)

| Route | Purpose |
|-------|---------|
| `auth/` | Authentication endpoints |
| `chat/` | Streaming chat with RAG |
| `conversations/` | Conversation CRUD |
| `cron/` | Scheduled jobs |
| `dashboard/` | Dashboard data |
| `documents/` | Document upload and processing |
| `providers/` | Provider search |
| `transcribe/` | Audio transcription |
| `user/` | User profile + insurer detection |
| `voice/` | Twilio webhook |

### Key Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `dashboard-header.tsx` | Top header bar with dynamic title |
| `dashboard-home.tsx` | Dashboard home page content |
| `keyboard-shortcuts-provider.tsx` | Global keyboard event listener |
| `keyboard-shortcuts-overlay.tsx` | `?` key legend overlay |
| `chat/` | Chat UI (messages, input, sidebar) |
| `documents/` | Document management UI |
| `providers/provider-list.tsx` | Full-featured provider search UI |
| `ui/shortcut-tooltip.tsx` | Hover tooltip with shortcut hints |

---

## What's Next

### Planned Features
- [ ] CMS Transparency in Coverage data — in-network/out-of-network badges on provider cards
- [ ] Full 50-state law coverage (currently 8 states)
- [ ] Cron job for automated .gov source updates
- [ ] SMS access channel
- [ ] Mobile app (PWA or native)
- [ ] OCR for scanned documents
- [ ] Family member management
- [ ] Multi-language support

### Session: Feb 8, 2026 — Afternoon (PDF Viewer, Keyboard Shortcuts, UX Polish)

- **Custom PDF viewer** — Replaced browser iframe with a fully custom `react-pdf`-based viewer (`pdf-viewer.tsx`) with toolbar (page nav, zoom, download, print), warm stone-gradient background, and floating page shadows
- **PDF search with match cycling** — Search bar shows match count ("3 of 15"), Enter/Shift+Enter cycles forward/backward through matches, focused match highlighted in orange vs all matches in yellow, auto-scrolls to each match
- **"Find in PDF" button** — Added to the source overlay excerpt panel; extracts the first 5 meaningful words from the referenced chunk and auto-populates the PDF viewer's search bar so users can instantly locate the cited section
- **Excerpt formatting overhaul** — Replaced complex regex-based SBC table parser with a simpler line-splitting approach: splits on bullet characters (•), dashes, and SBC section headers; highlights dollar amounts in blue, "not covered" in red, "no charge" in green; dims metadata like page numbers
- **Keyboard shortcuts system** — Built central registry (`keyboard-shortcuts.ts`), global provider wrapping dashboard layout, legend overlay (? key), and `ShortcutTooltip` component with 0.5s hover delay on sidebar buttons
- **Expanded shortcuts** — Added ⌘1–5 navigation (matching sidebar order), ⌘B (toggle sidebar), ⌘. (toggle theme), ⌘⇧C (copy last response), ⌘⇧⌫ (delete chat), ⌘⇧M (voice input), and +/- zoom in PDF viewer
- **Sidebar redesign** — Collapsible "Chat History" section, brand header linking to home, bottom nav reordered to match ⌘1–5 (Home, Chat, Providers, Documents, Settings), sidebar toggle via ⌘B
- **Settings page scroll fix** — Added `h-full overflow-y-auto pb-12` to settings and providers pages so content scrolls properly within the dashboard layout
- **Visual warmth pass** — Shifted global color palette from cool blue-gray (hue 250) to warm cream/tan (hue 75); added gradient backgrounds to PDF viewer, chat area, toolbar, and document view header; deeper page shadows with subtle ring borders
- **System prompt & RAG improvements** — Rewrote system prompt for more confident, concise responses; added MIN_SIMILARITY threshold (0.72) to filter irrelevant chunks; switched to GPT-4o with lower temperature (0.3); added [Official Source] links for knowledge base citations

### Phase 5: Network Status Badges (Feb 8, 2026)
- **In-network/out-of-network badges** — Added network status badges to provider cards: green "In-Network" (ShieldCheck), red "Out-of-Network" (ShieldX), amber "Verify" button (ShieldQuestion) for unverified providers
- **Verify & Cache system** — New `NetworkStatus` Prisma model stores verified NPI + insurer combinations with `@@unique([npi, insurerId])` constraint; user-verified statuses are cached in the database and shared across all users with the same insurer
- **Network status API** — New `/api/providers/network-status` endpoint: GET for batch NPI lookup against a specific insurer, POST for user verification (upsert pattern)
- **Verification overlay** — Modal dialog with 2-step flow: (1) opens insurer's provider directory in new tab, (2) user confirms in-network or out-of-network; cached result immediately updates the badge
- **Expanded card updates** — Provider cards show verified status with "Update" option; unverified providers show "Verify Network Status" button; all providers get a badge regardless of NPI availability
- **Architecture decision** — Chose "Verify & Cache" approach over CMS Transparency in Coverage (TIC) data because TIC MRF files are terabytes per insurer; data-source-agnostic design allows future upgrade to Turquoise Health API or TIC pipeline without changing the UI or database schema
- **Badge fix (Feb 8)** — Initially badges only showed on providers with NPI (~5% match rate from NPPES). Fixed to show on ALL cards when insurer is detected, using `place:ID` as fallback key for providers without NPI
- **Vercel deploy fix (Feb 8)** — `prisma.config.ts` used `env("DATABASE_URL")` which throws when the var is missing during `npm install`. Switched to `process.env.DATABASE_URL ?? ""` so `prisma generate` succeeds at build time

### Phase 6: OCR for Scanned Documents (Feb 8, 2026)
- **Scanned PDF detection** — `isLikelyScanned()` checks if pdf-parse extracted < 50 chars of text; if so, the document is likely a scanned image rather than text-based PDF
- **OCR pipeline** — New `src/lib/ocr.ts`: converts PDF pages to images via `pdf-to-img` (pdfjs-dist + canvas rendering at 2x scale), then runs Tesseract.js OCR on each page image
- **Seamless integration** — OCR runs automatically in the existing `processDocument()` pipeline; no user action needed. If pdf-parse fails to extract text, OCR kicks in transparently
- **Error handling** — Descriptive messages for OCR failures: low scan quality, unreadable text, individual page failures don't kill the whole document
- **Dependencies** — `tesseract.js` (Google's Tesseract OCR engine ported to JS, no API key needed), `pdf-to-img` (pdfjs-dist page renderer), `canvas` (node-canvas for server-side rendering)
- **Architecture note** — Tesseract.js downloads English language data (~4MB) on first use; all processing is local, no external API calls

### Known Items to Watch
- KB retrieval returns top 5 by similarity — monitor for redundancy with related entries (e.g., multiple No Surprises Act entries)
- Context window cost — up to 13 doc chunks + 5 KB entries per query; manageable with GPT-4o's 128K window but worth monitoring
- `updatedAt` on conversations doesn't refresh when new messages are sent (only on direct record updates) — could affect sidebar ordering
- OCR processing time — Tesseract can take 5-30s per page; large scanned documents may be slow. Monitor for timeouts on Vercel serverless (10s Hobby / 60s Pro)
- Vercel env vars — DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, OPENAI_API_KEY, GOOGLE_PLACES_API_KEY must all be set in Vercel project settings for deployment to work

---

## Phase 10: Codex Integration & Rate Limiting (Feb 11, 2026)

### Codex PR Review & Integration
Reviewed and merged 4 Codex-generated PRs (avg score 8.4/10):

**CI/CD Pipeline (8/10)** — `.github/workflows/ci.yml`
- GitHub Actions workflow: lint + typecheck on all pushes, build on PRs to main
- Node 22, npm ci, Prisma generate, dummy env vars for CI build
- Added test step after integrating vitest

**User Settings Page (9/10)** — Best Codex PR
- `src/app/dashboard/settings/page.tsx` — 3-tab settings (Profile, Notifications, Account)
- `src/app/api/user/profile/route.ts` — PATCH with zip/phone validation
- `src/app/api/user/account/route.ts` — DELETE with session cleanup
- `src/app/api/user/export/route.ts` — Full user data export as JSON
- `src/components/ui/switch.tsx` — Toggle component for notification preferences

**Admin Dashboard with Metrics (9/10)**
- `src/lib/admin.ts` — Shared `isAdminEmail()` helper (adopted by existing usage route)
- `src/app/api/admin/metrics/route.ts` — User counts, conversations, messages, most active users
- `src/app/api/admin/system/route.ts` — DB health, Node/Prisma versions, uptime
- `src/app/dashboard/admin/layout.tsx` — Server-side 403 gate for non-admin users
- `src/app/dashboard/admin/page.tsx` — Stat cards, recent users table, system health panel
- Admin nav link in sidebar (only visible to admin users via `isAdmin` prop)

**Test Suite with Vitest (7.5/10)**
- `vitest.config.ts` — Node environment, globals, path aliases
- `src/__tests__/helpers/` — Reusable mock-session and mock-prisma helpers
- 8 test files covering chat, transcribe, providers, network-status, upload, admin/usage, rag, api-usage
- Added `npm test` and `npm run test:watch` scripts
- Required manual conflict resolution for `api-usage.ts` exports and `rag.ts` testables

### Rate Limiting & Abuse Prevention
- **Core library**: `src/lib/rate-limit.ts` — Sliding window rate limiter
  - In-memory store with LRU eviction (10K key cap) and periodic cleanup
  - Tiered rate limits: chat (20/min), transcription (10/min), voice (10/min), embedding (30/min), default (60/min)
  - Standardized 429 responses with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
  - `applyRateLimit()` one-liner for route handlers
  - `getRateLimitKey()` — prefers userId, falls back to IP via `x-forwarded-for` / `x-real-ip`
  - Documented upgrade path to Upstash Redis for production distributed rate limiting

- **Route integration**: Applied to 4 API routes:
  - `/api/chat` — "chat" tier (20 req/min, most expensive OpenAI calls)
  - `/api/transcribe` — "transcription" tier (10 req/min, Whisper API)
  - `/api/voice/twilio` — "voice" tier (10 req/min, by IP since no auth)
  - `/api/documents/upload` — "default" tier (60 req/min)

- **Tests**: `src/__tests__/lib/rate-limit.test.ts` — 11 tests covering:
  - Allow/block behavior, tier independence, key independence
  - Remaining count tracking, reset timestamps
  - Key extraction (userId vs IP headers vs fallback)
  - 429 response format with proper headers

### Key Files Modified/Created
- `.github/workflows/ci.yml` (created, then updated with test step)
- `src/lib/rate-limit.ts` (created)
- `src/lib/admin.ts` (created by Codex)
- `src/app/dashboard/settings/page.tsx` (replaced placeholder)
- `src/app/api/user/{profile,account,export}/route.ts` (created by Codex)
- `src/app/api/admin/{metrics,system}/route.ts` (created by Codex)
- `src/app/dashboard/admin/{layout,page}.tsx` (created by Codex)
- `src/components/ui/switch.tsx` (created by Codex)
- `src/lib/api-usage.ts` (exported `MODEL_PRICING` and `estimateCost` for tests)
- `src/lib/rag.ts` (added `__testables` export for test access)
- `src/app/api/{chat,transcribe,voice/twilio,documents/upload}/route.ts` (added rate limiting)
- `vitest.config.ts`, `src/__tests__/` (test infrastructure)
- `tsconfig.json` (excluded `src/__tests__` from main compilation)
- `package.json` (added vitest, test scripts)

---

*This log is continuously updated as development progresses.*
