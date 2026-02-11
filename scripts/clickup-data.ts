/**
 * BenefitGuard ClickUp Project Data
 * All phases, lists, and tasks for the production rollout plan.
 */

export interface Task {
  name: string;
  description: string;
  priority: 1 | 2 | 3 | 4; // 1=urgent, 2=high, 3=normal, 4=low
  due_days: number; // days from Feb 10, 2026
  time_estimate_hrs: number;
  tags: string[];
}

export interface Phase {
  folder: string;
  list: string;
  tasks: Task[];
}

export const phases: Phase[] = [
  // PHASE 1: PRODUCTION INFRASTRUCTURE (Feb 10 – Mar 3)
  {
    folder: "Phase 1: Production Infrastructure",
    list: "Infrastructure & Security",
    tasks: [
      {
        name: "OAuth Login (Google + Apple)",
        description: "Replace credentials-only auth with OAuth providers. Google Sign-In + Apple Sign-In with email/password as fallback.\n\nWhy: Most users won't create a new password. OAuth reduces signup friction by 60-80%.\n\nApproach: Add Google/Apple providers to NextAuth.js in src/lib/auth.ts. Google OAuth via Cloud Console. Apple requires Developer account ($99/yr).\n\nDone when: Users can sign up/in with Google and Apple. Existing users can link OAuth. Profile shows OAuth avatar.",
        priority: 2, due_days: 10, time_estimate_hrs: 8, tags: ["auth", "critical-path"],
      },
      {
        name: "Email Verification + Password Reset",
        description: "Add email verification on signup and forgot-password flow.\n\nWhy: Without email verification, fake accounts. Without password reset, locked-out users = uninstalls.\n\nApproach: Integrate Resend ($0 for 100 emails/day). Verification email with signed token on signup. Reset link with 1hr expiration.\n\nDone when: New users get verification email. Unverified users see prompt. Forgot password works end-to-end.",
        priority: 2, due_days: 12, time_estimate_hrs: 8, tags: ["auth", "critical-path"],
      },
      {
        name: "Rate Limiting & Abuse Prevention",
        description: "Add rate limiting on all API routes, especially chat (OpenAI calls), document upload, and provider search.\n\nWhy: Without this, one bad actor can drain your OpenAI credits in minutes. #1 cost risk.\n\nApproach: Upstash Redis + @upstash/ratelimit (serverless-friendly). Chat: 30 msg/hr. Uploads: 10/day. Provider search: 60/hr. Return 429 with friendly UI message.\n\nDone when: All limits enforced per-user. UI shows friendly rate limit message.",
        priority: 1, due_days: 7, time_estimate_hrs: 6, tags: ["security", "critical-path", "cost-control"],
      },
      {
        name: "Error Monitoring (Sentry)",
        description: "Integrate Sentry for real-time error tracking and alerting in production.\n\nWhy: With thousands of users, errors happen silently. Without Sentry, you're flying blind.\n\nApproach: Install @sentry/nextjs. Free tier: 5K events/month. Configure client + server + edge configs. Email alerts on new error types. Upload source maps.\n\nDone when: Client + server errors captured. Email alerts firing. Source maps readable. No PII sent to Sentry.",
        priority: 2, due_days: 8, time_estimate_hrs: 4, tags: ["observability", "critical-path"],
      },
      {
        name: "CI/CD Pipeline (GitHub Actions)",
        description: "Automated build, lint, type-check, and deploy on every push to main.\n\nWhy: Manual deploys are error-prone. CI/CD prevents shipping broken code.\n\nApproach: .github/workflows/ci.yml. Steps: checkout → install → type-check → lint → build → deploy to Vercel. Preview deploys on PRs. Branch protection requiring CI pass.\n\nDone when: Push to main triggers build. Type/lint errors block deploy. Preview deploys on PRs. Build < 3 min.",
        priority: 3, due_days: 14, time_estimate_hrs: 4, tags: ["devops"],
      },
      {
        name: "Environment Management (Staging + Production)",
        description: "Separate staging and production environments with independent databases and API keys.\n\nWhy: You're developing against production data. One bad migration could corrupt user data or burn API credits.\n\nApproach: Neon database branching (instant, free). Vercel preview deployments as staging. Separate .env for each environment. Never commit secrets.\n\nDone when: Staging environment exists. Uses separate DB. No secrets in codebase. Can test before promoting to prod.",
        priority: 2, due_days: 10, time_estimate_hrs: 4, tags: ["devops", "critical-path"],
      },
      {
        name: "Database Backups & Recovery",
        description: "Configure automated daily backups with tested restore procedures.\n\nWhy: Databases fail, migrations go wrong, bugs corrupt data. Without backups, data loss is permanent. Non-negotiable.\n\nApproach: Neon has built-in PITR (point-in-time recovery). Verify it's enabled. Test a restore. Document the procedure.\n\nDone when: PITR enabled and verified. Tested restoring from past point. Procedure documented.",
        priority: 1, due_days: 5, time_estimate_hrs: 3, tags: ["database", "critical-path"],
      },
      {
        name: "Security Headers & Hardening",
        description: "Add CSP, CORS, HSTS, and OWASP protections. Input sanitization. Rotate NEXTAUTH_SECRET.\n\nWhy: Without security headers, vulnerable to XSS, clickjacking. Low-effort, high-impact.\n\nApproach: Headers in next.config.ts or middleware (CSP, X-Frame-Options, HSTS, etc.). Sanitize inputs. Rotate NEXTAUTH_SECRET to real 32+ char secret in production.\n\nDone when: Score A+ on securityheaders.com. Real NEXTAUTH_SECRET in prod. No sensitive data in client bundles.",
        priority: 2, due_days: 14, time_estimate_hrs: 4, tags: ["security"],
      },
      {
        name: "OpenAI Cost Monitoring & Alerts",
        description: "Set up real-time cost tracking for OpenAI API usage with budget alerts.\n\nWhy: GPT-4o at scale could be $300-600/month with 1000 users. Need visibility BEFORE the bill.\n\nApproach: OpenAI Dashboard usage limits + email alerts at $50/$100/$200. Log token usage per chat request. Track daily/weekly costs. Hard monthly cap as safety net.\n\nDone when: Alerts configured. Token usage logged per request. Hard cap set. Per-user tracking exists.",
        priority: 2, due_days: 7, time_estimate_hrs: 4, tags: ["cost-control", "observability"],
      },
      {
        name: "Custom Domain & SSL",
        description: "Configure custom domain (benefitguard.app or similar) with SSL.\n\nWhy: Users won't trust a healthcare app on .vercel.app. Required for OAuth, email deliverability, and SEO.\n\nApproach: Purchase domain. Add to Vercel (auto-provisions SSL). Update NEXTAUTH_URL + OAuth redirect URIs. www redirect.\n\nDone when: Custom domain live with HTTPS. OAuth works. www redirect configured.",
        priority: 3, due_days: 14, time_estimate_hrs: 2, tags: ["devops"],
      },
    ],
  },

  // PHASE 2: LEGAL & COMPLIANCE (Feb 17 – Mar 3)
  {
    folder: "Phase 2: Legal & Compliance",
    list: "Legal Requirements",
    tasks: [
      {
        name: "Terms of Service",
        description: "Draft and publish ToS that users must accept to use BenefitGuard.\n\nWhy: Legally required before accepting users. Liability protection.\n\nApproach: Use Termly.io or TermsFeed ($15-50/mo). Cover: service description, not medical/legal advice, limitations of liability, data handling, termination. Checkbox on signup. Store acceptance timestamp. Consider lawyer review ($200-500).\n\nDone when: ToS at /terms. Signup requires acceptance. Timestamp stored. Link in footer.",
        priority: 1, due_days: 14, time_estimate_hrs: 6, tags: ["legal", "critical-path"],
      },
      {
        name: "Privacy Policy",
        description: "Comprehensive Privacy Policy covering data collection, storage, sharing, and user rights.\n\nWhy: Legally required (CCPA). Essential for user trust with healthcare data.\n\nApproach: Same legal template service. Cover: what data collected, how used, OpenAI processing disclosure, data retention, user rights (access/deletion), cookies. CCPA compliance.\n\nDone when: Privacy Policy at /privacy. CCPA compliant. Discloses OpenAI processing. Linked in footer + signup.",
        priority: 1, due_days: 14, time_estimate_hrs: 6, tags: ["legal", "critical-path"],
      },
      {
        name: "Medical & Legal Disclaimers",
        description: "Add clear disclaimers throughout app that BenefitGuard does not provide medical or legal advice.\n\nWhy: Primary liability shield. If a user makes a decision based on AI output and something goes wrong, you need this.\n\nApproach: First-use disclaimer with acknowledgment. Persistent subtle disclaimer in chat footer. In onboarding, landing page, and ToS.\n\nDone when: First-use acknowledgment. Persistent chat disclaimer. System prompt maintains framing.",
        priority: 2, due_days: 16, time_estimate_hrs: 3, tags: ["legal"],
      },
      {
        name: "User Data Deletion (Right to Delete)",
        description: "Allow users to delete their account and all associated data.\n\nWhy: Required by CCPA. Builds trust for healthcare-adjacent data.\n\nApproach: 'Delete My Account' in Settings. Confirmation dialog. Cascade delete all records. Confirmation email. Log for audit trail. Optional: 30-day soft delete for recovery.\n\nDone when: Delete option in Settings. All data removed. Confirmation email sent. Audit trail logged.",
        priority: 2, due_days: 18, time_estimate_hrs: 6, tags: ["legal", "privacy"],
      },
      {
        name: "Encryption at Rest Audit",
        description: "Verify and document that all user data is encrypted at rest.\n\nWhy: HIPAA-adjacent posture. Insurance documents contain sensitive PII.\n\nApproach: Verify Neon encryption (AES-256 by default). Document encryption method + key management. Review Vercel env var security. Decide on app-level encryption needs.\n\nDone when: DB encryption confirmed. Security posture documented. Decision on app-level encryption made.",
        priority: 3, due_days: 18, time_estimate_hrs: 3, tags: ["security", "compliance"],
      },
      {
        name: "Cookie Consent Banner",
        description: "Cookie consent banner for state privacy law compliance.\n\nWhy: CCPA and other state laws require disclosure. Trust signal for users.\n\nApproach: Simple bottom banner with Accept + Learn More. Store preference in localStorage. Link to Privacy Policy. Only set non-essential cookies after consent.\n\nDone when: Banner on first visit. Consent stored. Non-essential cookies gated. Doesn't reappear after acceptance.",
        priority: 4, due_days: 20, time_estimate_hrs: 3, tags: ["legal", "privacy"],
      },
    ],
  },

  // PHASE 3: UX & ONBOARDING POLISH (Mar 3 – Mar 17)
  {
    folder: "Phase 3: UX & Onboarding Polish",
    list: "User Experience",
    tasks: [
      {
        name: "Landing Page / Marketing Site",
        description: "Public-facing landing page explaining BenefitGuard's value prop, features, and driving signups.\n\nWhy: First impression. #1 conversion tool. Essential for SEO.\n\nApproach: Root page (/) for unauth users. Sections: Hero + CTA, Features (3-4 key capabilities), How It Works, Pricing (future), Footer. Warm teal/cream palette. Mobile-first.\n\nDone when: Landing page at root. Clear value prop. Feature highlights. CTA → signup. Fully responsive.",
        priority: 2, due_days: 25, time_estimate_hrs: 10, tags: ["marketing", "ux"],
      },
      {
        name: "Transactional Email System (Resend)",
        description: "Integrate email service for verification, password reset, welcome, and notifications.\n\nWhy: Email is the backbone of user communication. Required for auth flows.\n\nApproach: Resend (free: 100 emails/day). React Email templates. Types: verification, reset, welcome. SPF/DKIM for deliverability.\n\nDone when: Verification + reset + welcome emails work. Sending domain configured. Emails render on mobile.",
        priority: 2, due_days: 24, time_estimate_hrs: 6, tags: ["email", "auth"],
      },
      {
        name: "Mobile Responsiveness Audit",
        description: "Systematic audit and fix of all screens for mobile/tablet viewports.\n\nWhy: Core use case is emergencies on phones. If chat/providers don't work on mobile, users leave.\n\nApproach: Test at 375px, 390px, 768px, 1024px. Key screens: landing, auth, onboarding, chat, providers, documents, settings. Fix with Tailwind responsive classes. Test real device.\n\nDone when: All screens work at all breakpoints. No horizontal scroll. Touch targets ≥ 44px.",
        priority: 2, due_days: 28, time_estimate_hrs: 8, tags: ["ux", "mobile"],
      },
      {
        name: "Loading States & Error Handling",
        description: "Skeleton screens, loading spinners, and friendly error messages across all features.\n\nWhy: Blank screens = users think app is broken. Silent errors destroy trust in healthcare context.\n\nApproach: Skeleton screens for chat/providers/documents. React error boundaries. Specific error messages. Retry logic with backoff. Empty states. Chat timeout message at 30s.\n\nDone when: Skeletons on all data pages. Error boundary catches crashes. Retry buttons. Empty states for new users.",
        priority: 3, due_days: 30, time_estimate_hrs: 8, tags: ["ux"],
      },
      {
        name: "Accessibility Audit (WCAG 2.1 AA)",
        description: "Audit and fix for WCAG 2.1 AA accessibility compliance.\n\nWhy: Healthcare apps must be usable by everyone including elderly/disabled users. ADA lawsuit risk.\n\nApproach: axe-core audit on every page. Keyboard navigation test. Screen reader (VoiceOver). Color contrast 4.5:1. Focus indicators. ARIA labels.\n\nDone when: 0 critical/serious axe-core violations. Full keyboard nav. Screen reader works. Contrast passes.",
        priority: 2, due_days: 32, time_estimate_hrs: 8, tags: ["accessibility", "ux"],
      },
      {
        name: "Guided Onboarding Tour",
        description: "First-time user experience walking through key features after signup.\n\nWhy: BenefitGuard has many features. New users need guidance to get value quickly.\n\nApproach: Tooltip-based tour after first login. Steps: (1) Upload docs, (2) Chat, (3) Find providers, (4) Settings. Skip option. Store completion flag. Use driver.js or react-joyride.\n\nDone when: Tour triggers on first visit. 4-5 steps. Skip available. Doesn't retrigger. Works on mobile.",
        priority: 3, due_days: 33, time_estimate_hrs: 6, tags: ["ux", "onboarding"],
      },
      {
        name: "Document Upload UX Improvements",
        description: "Drag-and-drop, progress bars, file validation, multi-file upload.\n\nWhy: Document upload is the most critical onboarding step. Must feel effortless.\n\nApproach: Drag-and-drop zone. File type/size validation. Real upload progress bar. Processing steps visible. Multi-file support. Success confirmation with extracted info.\n\nDone when: Drag-and-drop works. Validation with clear messages. Progress visible. Multi-file. Success preview.",
        priority: 3, due_days: 34, time_estimate_hrs: 6, tags: ["ux", "documents"],
      },
    ],
  },

  // PHASE 4: CORE FEATURE COMPLETION (Mar 17 – Apr 7)
  {
    folder: "Phase 4: Core Feature Completion",
    list: "Feature Development",
    tasks: [
      {
        name: "50-State Law Coverage",
        description: "Expand KB from 8 states to all 50 + DC.\n\nWhy: Users in other states get generic federal-only guidance. State laws vary dramatically.\n\nApproach: Research state-by-state from NAIC + state DOI sites. Each state covers: balance billing, external review, surprise billing, complaint process. Add to prisma/kb-data.ts. Batch by region. ~1-2 hrs/state with AI help.\n\nDone when: All 50 + DC have KB entries. sourceUrl links verified. Seed tested. RAG filters by state.",
        priority: 2, due_days: 42, time_estimate_hrs: 24, tags: ["knowledge-base", "content"],
      },
      {
        name: "Bill Analysis Tool",
        description: "Upload a medical bill, get plain-language breakdown of charges and action items.\n\nWhy: Medical bills are #2 pain point. Users get cryptic codes and inflated amounts.\n\nApproach: New doc type 'Medical Bill'. Extract charges/amounts/codes. GPT-4o analyzes: explain charges, flag unusual amounts, cross-reference plan. Generate action items.\n\nDone when: User uploads bill → gets plain-language analysis. Flags unusual charges. References coverage. Works with OCR.",
        priority: 2, due_days: 46, time_estimate_hrs: 12, tags: ["feature", "documents"],
      },
      {
        name: "Claim Denial Appeal Assistant",
        description: "Step-by-step flow for appealing denied claims with templated appeal letters.\n\nWhy: ~50% of appealed claims are approved. Most people don't know they can appeal. Potentially the highest-impact feature.\n\nApproach: Guided flow: upload denial letter → AI extracts reason + deadline → explain rights with law citations → generate personalized appeal letter. Internal vs external review guidance.\n\nDone when: Upload denial → analysis. Reason + deadline extracted. Appeal letter generated. Deadline tracking.",
        priority: 2, due_days: 49, time_estimate_hrs: 14, tags: ["feature", "high-impact"],
      },
      {
        name: "Cost Estimator",
        description: "'How much will X cost me?' — estimate OOP cost based on user's plan.\n\nWhy: Most common healthcare question. SBC has the info but it's buried in dense tables.\n\nApproach: Parse SBC for deductible/copay/coinsurance/OOP max. User inputs procedure. Apply deductible → copay/coinsurance → cap at OOP max. Show range, not single number. Clear disclaimer.\n\nDone when: User asks about procedure cost → gets estimate. Uses actual plan data. Shows breakdown. Clear disclaimer.",
        priority: 3, due_days: 50, time_estimate_hrs: 10, tags: ["feature"],
      },
      {
        name: "Family Member Management",
        description: "Add family members (spouse, children) covered under the same plan.\n\nWhy: Many users manage healthcare for their whole family. Without this, they'd need separate accounts.\n\nApproach: Family Members section in Settings. Fields: name, relationship, DOB. Chat can reference members by name. Same plan coverage applies.\n\nDone when: Add/edit/remove family members. Chat references them. Provider search works in family context.",
        priority: 3, due_days: 52, time_estimate_hrs: 8, tags: ["feature"],
      },
      {
        name: "Auto-Detect Document Type",
        description: "Automatically classify uploads as SBC, EOB, denial letter, bill, or formulary.\n\nWhy: Users don't always know what doc type they have. Auto-detection ensures proper processing.\n\nApproach: Analyze first page for signals (keywords per type). Keyword scoring first (fast), GPT-4o-mini fallback if uncertain. Show detected type with option to correct.\n\nDone when: Auto-detects 5 doc types. Shows confidence. User can correct. Different types trigger appropriate processing.",
        priority: 3, due_days: 53, time_estimate_hrs: 6, tags: ["feature", "documents"],
      },
      {
        name: "Knowledge Base Auto-Update Cron Job",
        description: "Scheduled job checking .gov sources for law changes.\n\nWhy: Laws change. Stale legal info is worse than no info.\n\nApproach: Vercel Cron weekly. Check source URLs for content changes (hash/last-modified). Flag changes for human review (don't auto-update legal content). Email admin on changes detected.\n\nDone when: Cron runs weekly. Detects page changes. Sends email alerts. Tracks last-verified date. Admin can trigger manually.",
        priority: 3, due_days: 55, time_estimate_hrs: 8, tags: ["knowledge-base", "automation"],
      },
    ],
  },

  // PHASE 5: SCALE & PERFORMANCE (Apr 7 – Apr 21)
  {
    folder: "Phase 5: Scale & Performance",
    list: "Performance Optimization",
    tasks: [
      {
        name: "Caching Layer (Upstash Redis)",
        description: "Add Redis caching for sessions, API responses, geocode results, common queries.\n\nWhy: Every page load hits DB. With 1000+ users, latency adds up. Redis reduces DB load 50-70%.\n\nApproach: Upstash Redis (serverless, works with Vercel). Cache: sessions, provider results (1hr), geocode (persistent), KB entries (24hr).\n\nDone when: Redis configured. Provider/geocode/KB cached. Hit/miss ratio logged. Speed improvement noticeable.",
        priority: 3, due_days: 60, time_estimate_hrs: 6, tags: ["performance", "infrastructure"],
      },
      {
        name: "OpenAI Cost Optimization",
        description: "Smart model selection, prompt caching, response caching for common questions.\n\nWhy: OpenAI is #1 operational cost. GPT-4o costs 10x more than GPT-4o-mini. Not every question needs the full model.\n\nApproach: GPT-4o-mini for simple queries, GPT-4o for complex. Query classifier. Response caching (same plan + same question = cached). Context trimming. Token budget tracking.\n\nDone when: Simple → mini, complex → 4o. Response caching working. 30-50% cost reduction.",
        priority: 2, due_days: 62, time_estimate_hrs: 10, tags: ["cost-control", "performance"],
      },
      {
        name: "Background Job Queue",
        description: "Move document processing, TiC pipeline, email to async background jobs.\n\nWhy: Document upload blocks API request. Large PDFs/OCR timeout on Vercel's 10s limit.\n\nApproach: Inngest (serverless job queue, great Vercel integration, free 25K events/mo). Document processing → background. TiC pipeline monthly schedule. Emails queued.\n\nDone when: Doc processing runs in background. Progress updates shown. No timeouts. TiC schedulable. Failed jobs retry.",
        priority: 3, due_days: 63, time_estimate_hrs: 8, tags: ["performance", "infrastructure"],
      },
      {
        name: "Multi-Insurer TiC Data Pipeline",
        description: "Expand TiC pipeline from Aetna to BCBS, Cigna, UHC, Humana.\n\nWhy: Adding these covers majority of commercially insured Americans. Data advantage.\n\nApproach: Each insurer publishes MRFs in slightly different formats. Research URL patterns per insurer. Adapt parser. Start with UHC (well-structured). Monthly cron for all.\n\nDone when: UHC + Cigna + 1 BCBS affiliate + Humana pipelines working. Monthly scheduled refresh.",
        priority: 2, due_days: 67, time_estimate_hrs: 16, tags: ["data-pipeline", "feature"],
      },
      {
        name: "Database Optimization & Indexing",
        description: "Analyze slow queries, add indexes, optimize for scale.\n\nWhy: Schema designed for one user. Unindexed queries on large tables will crawl with thousands of users.\n\nApproach: Prisma query logging. Indexes on chunks, messages, networkStatus. Fix n+1 patterns. Connection pooling (Neon PgBouncer). pgvector IVFFlat/HNSW index.\n\nDone when: Slow queries identified + fixed. Key indexes added. Vector search optimized. No query > 500ms.",
        priority: 3, due_days: 68, time_estimate_hrs: 6, tags: ["database", "performance"],
      },
      {
        name: "CDN & Asset Optimization",
        description: "Optimize images, fonts, JS bundles for faster page loads.\n\nWhy: Every 100ms of load time reduces conversion ~1%. Emergency users need instant access.\n\nApproach: Next.js Image component. Font subsetting with next/font. Bundle analysis. Code splitting for heavy components. Long cache headers.\n\nDone when: Lighthouse ≥ 90. No bundle > 200KB gzipped. Lazy loading for heavy components. Page load < 2s on 3G.",
        priority: 4, due_days: 69, time_estimate_hrs: 4, tags: ["performance"],
      },
    ],
  },

  // PHASE 6: MONETIZATION (Apr 21 – May 5)
  {
    folder: "Phase 6: Monetization",
    list: "Billing & Revenue",
    tasks: [
      {
        name: "Stripe Integration & Subscription Billing",
        description: "Integrate Stripe for subscription billing with free and paid tiers.\n\nWhy: This is how BenefitGuard becomes sustainable. Stripe handles payments, invoices, tax, PCI compliance.\n\nApproach: stripe + @stripe/stripe-js packages. Products/prices in Stripe. Webhook for subscription events. Subscription status on User model. Stripe Customer Portal for self-service. Stripe Checkout for PCI compliance.\n\nDone when: Checkout works e2e. Webhooks handle lifecycle. User model tracks status. Customer portal accessible.",
        priority: 2, due_days: 75, time_estimate_hrs: 12, tags: ["monetization", "billing"],
      },
      {
        name: "Pricing Tier Design & Implementation",
        description: "Design and implement free/paid tiers with feature gating.\n\nWhy: Free tier for adoption, paid for revenue. Balance usefulness vs upgrade motivation.\n\nSuggested tiers:\n- Free: 10 msgs/day, 2 docs, provider search, basic KB\n- Pro ($9.99/mo): Unlimited chat + docs, bill analysis, appeal assistant, cost estimator\n- Family ($14.99/mo): Pro + family members (up to 5)\n\n14-day free Pro trial for new users.\n\nDone when: Tiers in Stripe. Limits enforced. Premium features gated. Trial working. Pricing page exists.",
        priority: 2, due_days: 77, time_estimate_hrs: 10, tags: ["monetization", "product"],
      },
      {
        name: "Usage Tracking & Limits",
        description: "Track per-user usage and enforce tier limits.\n\nWhy: Need visibility into usage for pricing decisions + cost management.\n\nApproach: Usage table: userId, metric, count, period. Increment on action, check against tier. Dashboard widget showing usage. Admin aggregate view.\n\nDone when: Usage tracked (msgs, uploads, searches). Free limits enforced. User sees usage. Admin sees aggregates.",
        priority: 3, due_days: 79, time_estimate_hrs: 8, tags: ["monetization", "analytics"],
      },
      {
        name: "Admin Dashboard",
        description: "Simple admin dashboard for monitoring users, revenue, usage, system health.\n\nWhy: Need business visibility. How many signups? Conversion rate? Errors? OpenAI cost?\n\nApproach: Protected /dashboard/admin route. Metrics: users, active users, signups, conversion. Revenue: MRR, transactions, churn. Usage + system health. Simple charts (recharts).\n\nDone when: Admin-only route. User/revenue/usage/health metrics displayed. Auto-refresh.",
        priority: 3, due_days: 82, time_estimate_hrs: 10, tags: ["admin", "monetization"],
      },
      {
        name: "Upgrade Prompts & Paywall UX",
        description: "Tasteful upgrade prompts when free users hit limits or try premium features.\n\nWhy: Free → paid conversion is your revenue. But aggressive paywalls drive users away.\n\nApproach: Soft warnings near limit. Hard limit modal with free vs Pro comparison. Premium features visible but grayed + 'Pro' badge. In-chat subtle prompt. Track conversion per prompt.\n\nDone when: Soft + hard limits with CTAs. Features visible but gated. One-click upgrade. Conversion tracked.",
        priority: 4, due_days: 83, time_estimate_hrs: 6, tags: ["monetization", "ux"],
      },
    ],
  },

  // PHASE 7: GROWTH & ENGAGEMENT (May 5 – May 19)
  {
    folder: "Phase 7: Growth & Engagement",
    list: "Growth",
    tasks: [
      {
        name: "Analytics Integration (PostHog)",
        description: "Product analytics for user behavior, feature adoption, conversion funnels.\n\nWhy: Can't improve what you don't measure. Data-driven decisions >>> guessing.\n\nApproach: PostHog (free: 1M events/mo). Track: signup, doc_uploaded, chat_sent, provider_searched, upgrade_clicked. Funnels: signup → activation → retention → revenue. Session replay.\n\nDone when: PostHog tracking events. Funnel defined. Session replay enabled. Dashboard showing key metrics. No PII in events.",
        priority: 2, due_days: 88, time_estimate_hrs: 6, tags: ["analytics", "growth"],
      },
      {
        name: "Feedback System (Response Rating)",
        description: "Thumbs up/down on AI responses with optional text feedback.\n\nWhy: Primary quality signal. Need to know when responses are bad and why.\n\nApproach: Small 👍/👎 after each AI message. On 👎: expand text field (Inaccurate / Unclear / Not helpful / Other). Store in feedback table. Weekly report of negative feedback for prompt/KB improvement.\n\nDone when: Rating buttons on responses. Feedback stored. Admin can review. Weekly summary.",
        priority: 2, due_days: 90, time_estimate_hrs: 6, tags: ["quality", "growth"],
      },
      {
        name: "Push Notifications (PWA)",
        description: "PWA push notifications for reminders and updates.\n\nWhy: Re-engagement. Remind users about appeal deadlines, new features, weekly health tips.\n\nApproach: Web Push API via service worker. Opt-in prompt. Types: appeal deadline reminder, new feature announcement, weekly tip. Respect user preferences.\n\nDone when: Push permission prompt. Notifications delivered. User can manage preferences. Types: deadline, feature, tip.",
        priority: 3, due_days: 92, time_estimate_hrs: 6, tags: ["engagement", "pwa"],
      },
      {
        name: "Referral System",
        description: "Invite friends to BenefitGuard with referral rewards.\n\nWhy: Word-of-mouth is the most cost-effective growth channel. Healthcare is personal — people trust recommendations.\n\nApproach: Unique referral link per user. Reward: 1 free month of Pro for both referrer and referee. Track referrals in DB. Share via link, email, or social.\n\nDone when: Referral link generated. Reward applied on signup. Tracking in place. Share options work.",
        priority: 4, due_days: 94, time_estimate_hrs: 8, tags: ["growth"],
      },
      {
        name: "Blog / SEO Content",
        description: "SEO-optimized articles about healthcare rights driving organic traffic.\n\nWhy: Long-term growth. People searching 'how to appeal insurance denial' should find BenefitGuard.\n\nApproach: Blog section at /blog. Initial articles: 'How to Read Your SBC', 'What to Do When a Claim is Denied', 'Your Rights Under the No Surprises Act', 'ER vs Urgent Care'. MDX or CMS.\n\nDone when: Blog route exists. 5+ articles published. SEO meta tags. Indexed by Google.",
        priority: 3, due_days: 96, time_estimate_hrs: 10, tags: ["marketing", "seo"],
      },
      {
        name: "Social Proof (Testimonials)",
        description: "Collect and display user testimonials and success stories.\n\nWhy: Trust signal. Healthcare users need reassurance from real people.\n\nApproach: After positive feedback (thumbs up), prompt for testimonial. Display on landing page. Optional: case studies ('How BenefitGuard saved me $3,000').\n\nDone when: Testimonial collection flow. Display on landing page. 3+ testimonials. With user consent.",
        priority: 4, due_days: 98, time_estimate_hrs: 4, tags: ["marketing", "growth"],
      },
    ],
  },

  // PHASE 8: ADVANCED FEATURES (May 19+)
  {
    folder: "Phase 8: Advanced Features",
    list: "Advanced Development",
    tasks: [
      {
        name: "Spanish Language Support",
        description: "Full Spanish translation of the app and AI responses.\n\nWhy: ~41M native Spanish speakers in the US. Biggest non-English healthcare population. Huge underserved market.\n\nApproach: i18n framework (next-intl). Translate all UI strings. Spanish system prompt variant. KB entries in Spanish (can use AI translation + human review). Language selector in settings.\n\nDone when: Full UI in Spanish. AI responds in Spanish when selected. KB available in Spanish. Language selector works.",
        priority: 3, due_days: 105, time_estimate_hrs: 16, tags: ["i18n", "feature"],
      },
      {
        name: "SMS Access Channel",
        description: "Text-based interaction via Twilio SMS.\n\nWhy: Not everyone has a smartphone or data. SMS works on any phone. Good for quick questions.\n\nApproach: Twilio SMS webhook. Parse incoming SMS → RAG pipeline → text response. Link phone number to user account. Character limits (160 chars) → concise responses.\n\nDone when: Users can text a number and get responses. Phone linked to account. Responses concise for SMS.",
        priority: 3, due_days: 110, time_estimate_hrs: 8, tags: ["channel", "feature"],
      },
      {
        name: "Voice Bot Improvements",
        description: "Better TTS, multi-turn conversation memory, and improved voice UX.\n\nWhy: Voice is critical for accessibility (elderly, vision-impaired, hands-busy). Current voice is basic.\n\nApproach: Upgrade TTS to ElevenLabs or OpenAI TTS (more natural). Add conversation memory across calls. Better error handling for noisy environments. Consider: Vapi or Retell for managed voice AI.\n\nDone when: Natural-sounding TTS. Conversation continues across calls. Better noise handling.",
        priority: 4, due_days: 115, time_estimate_hrs: 10, tags: ["voice", "feature"],
      },
      {
        name: "Insurance Card Scanning",
        description: "OCR insurance cards to auto-populate profile (member ID, group number, insurer).\n\nWhy: Faster onboarding. Users can snap a photo instead of typing info manually.\n\nApproach: Camera capture or photo upload → OCR (Tesseract.js already integrated) → extract: member name, member ID, group number, insurer name, plan name. Pre-populate profile.\n\nDone when: User can photograph/upload card. Key fields extracted. Profile auto-populated. Works front + back of card.",
        priority: 3, due_days: 120, time_estimate_hrs: 8, tags: ["feature", "onboarding"],
      },
      {
        name: "Provider Reviews & Notes",
        description: "User-generated reviews and personal notes on providers.\n\nWhy: Personal notes help users track their healthcare journey. Community reviews help others find good providers.\n\nApproach: Per-provider notes (private) and reviews (public). Star rating + text review. Moderation for public reviews. Surface in provider cards.\n\nDone when: Users can add private notes. Optional public reviews. Reviews shown on provider cards. Basic moderation.",
        priority: 4, due_days: 125, time_estimate_hrs: 8, tags: ["feature", "community"],
      },
      {
        name: "Chat Sharing & Export",
        description: "Share a conversation via link or export as PDF for records/advocacy.\n\nWhy: Users may need to share BenefitGuard's analysis with family, advocates, or even in disputes.\n\nApproach: Generate shareable link (read-only, expiring). Export to PDF with branding. Strip any PII option. Share via email/copy link.\n\nDone when: Share link generated. PDF export works. Expiring links. PII stripping option.",
        priority: 4, due_days: 130, time_estimate_hrs: 6, tags: ["feature"],
      },
    ],
  },
];
