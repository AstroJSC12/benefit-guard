#!/usr/bin/env python3
"""
BenefitGuard — Comprehensive ClickUp Update (April 11, 2026)

Marks completed tasks, re-baselines due dates, and adds new tasks
based on actual development progress through April 2026.
"""

import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

API_KEY = os.getenv("CLICKUP_API_KEY", "")
BASE = "https://api.clickup.com/api/v2"

session = requests.Session()
session.headers.update({
    "Authorization": API_KEY,
    "Content-Type": "application/json",
})


def api_put(path, data, retries=3):
    for attempt in range(retries):
        resp = session.put(f"{BASE}{path}", json=data)
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 429:
            time.sleep(2 ** attempt + 1)
            continue
        print(f"  ❌ PUT {path} → {resp.status_code}: {resp.text[:200]}")
        resp.raise_for_status()
    raise RuntimeError(f"Failed after {retries} retries")


def api_post(path, data, retries=3):
    for attempt in range(retries):
        resp = session.post(f"{BASE}{path}", json=data)
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 429:
            time.sleep(2 ** attempt + 1)
            continue
        print(f"  ❌ POST {path} → {resp.status_code}: {resp.text[:200]}")
        resp.raise_for_status()
    raise RuntimeError(f"Failed after {retries} retries")


def ms(date_str):
    """Convert 'YYYY-MM-DD' to epoch milliseconds."""
    from datetime import datetime, timezone
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    return int(dt.timestamp() * 1000)


def close_task(task_id, name):
    """Mark a task as complete."""
    print(f"  ✅ Closing: {name}")
    api_put(f"/task/{task_id}", {"status": "complete"})
    time.sleep(0.3)


def update_due(task_id, name, new_date):
    """Update a task's due date."""
    print(f"  📅 {name} → due {new_date}")
    api_put(f"/task/{task_id}", {"due_date": ms(new_date)})
    time.sleep(0.3)


def create_task(list_id, name, description="", priority=3, due_date=None, time_estimate_hrs=None):
    """Create a new task in a list."""
    data = {
        "name": name,
        "description": description,
        "priority": priority,
    }
    if due_date:
        data["due_date"] = ms(due_date)
    if time_estimate_hrs:
        data["time_estimate"] = time_estimate_hrs * 3600000  # ms
    print(f"  ➕ Creating: {name} (in list {list_id})")
    result = api_post(f"/list/{list_id}/task", data)
    time.sleep(0.3)
    return result


# ── List IDs ──────────────────────────────────────────────────────────────────
INFRA = "901710848941"
LEGAL = "901710848951"
UX = "901710848954"
FEATURES = "901710848962"
PERF = "901710848967"
BILLING = "901710848972"
GROWTH = "901710848978"
ADVANCED = "901710848981"
MILESTONES = "901710848991"

# ══════════════════════════════════════════════════════════════════════════════
# 1. MARK COMPLETED TASKS
# ══════════════════════════════════════════════════════════════════════════════
print("\n═══ MARKING COMPLETED TASKS ═══\n")

# Phase 1: Infrastructure
close_task("86dzr3qum", "Custom Domain & SSL")  # benefit-guard.jeffcoy.net live on Vercel

# Phase 3: UX
close_task("86dzr3qvn", "Landing Page / Marketing Site")  # Built and polished, live at /
close_task("86dzr3qw3", "Loading States & Error Handling")  # Built into all components
close_task("86dzr3qvz", "Mobile Responsiveness Audit")  # Done during UX polish

# Phase 7: Growth
close_task("86dzr3r16", "Blog / SEO Content")  # 8 articles, sitemap, RSS — deployed tonight

# Milestones
close_task("86dzr3r2v", "🔒 Production Infrastructure Complete")  # All infra tasks done

# ══════════════════════════════════════════════════════════════════════════════
# 2. RE-BASELINE DUE DATES (shift everything to realistic schedule)
# ══════════════════════════════════════════════════════════════════════════════
print("\n═══ UPDATING DUE DATES ═══\n")

# Phase 1: Remaining infra
update_due("86dzr3qu3", "Environment Management (Staging + Production)", "2026-05-09")
update_due("86dzr3qrn", "Email Verification + Password Reset", "2026-05-02")

# Phase 2: Legal
update_due("86dzr3qvc", "Cookie Consent Banner", "2026-06-06")
update_due("86dzr3qv8", "Encryption at Rest Audit", "2026-05-16")
update_due("86dzr3qv2", "User Data Deletion (Right to Delete)", "2026-05-16")

# Phase 3: UX (remaining)
update_due("86dzr3qwq", "Document Upload UX Improvements", "2026-05-23")
update_due("86dzr3qwg", "Guided Onboarding Tour", "2026-05-30")
update_due("86dzr3qw7", "Accessibility Audit (WCAG 2.1 AA)", "2026-06-06")
update_due("86dzr3qvt", "Transactional Email System (Resend)", "2026-04-25")  # High priority for drip

# Phase 4: Features
update_due("86dzr3qx5", "50-State Law Coverage", "2026-05-09")
update_due("86dzr3qxb", "Bill Analysis Tool", "2026-05-16")
update_due("86dzr3qxj", "Claim Denial Appeal Assistant", "2026-05-23")
update_due("86dzr3qxr", "Cost Estimator", "2026-06-06")
update_due("86dzr3qxv", "Family Member Management", "2026-06-13")
update_due("86dzr3qy1", "Auto-Detect Document Type", "2026-05-30")
update_due("86dzr3qyb", "Knowledge Base Auto-Update Cron Job", "2026-06-06")

# Phase 5: Performance
update_due("86dzr3qyk", "Caching Layer (Upstash Redis)", "2026-05-23")
update_due("86dzr3qyr", "OpenAI Cost Optimization", "2026-05-30")
update_due("86dzr3qyu", "Background Job Queue", "2026-06-06")
update_due("86dzr3qyy", "Multi-Insurer TiC Data Pipeline", "2026-06-13")
update_due("86dzr3qz2", "Database Optimization & Indexing", "2026-06-13")
update_due("86dzr3qz4", "CDN & Asset Optimization", "2026-06-20")

# Phase 6: Billing
update_due("86dzr3qzc", "Stripe Integration & Subscription Billing", "2026-06-20")
update_due("86dzr3qzp", "Pricing Tier Design & Implementation", "2026-06-27")
update_due("86dzr3qzz", "Usage Tracking & Limits", "2026-06-27")
update_due("86dzr3r05", "Upgrade Prompts & Paywall UX", "2026-07-04")

# Phase 7: Growth (remaining)
update_due("86dzr3r0h", "Analytics Integration (PostHog)", "2026-04-25")  # Should be soon
update_due("86dzr3r0m", "Feedback System (Response Rating)", "2026-05-02")
update_due("86dzr3r0r", "Push Notifications (PWA)", "2026-07-11")
update_due("86dzr3r10", "Referral System", "2026-07-18")
update_due("86dzr3r19", "Social Proof (Testimonials)", "2026-07-25")

# Phase 8: Advanced
update_due("86dzr3r1k", "Spanish Language Support", "2026-08-01")
update_due("86dzr3r1x", "SMS Access Channel", "2026-07-25")
update_due("86dzr3r24", "Voice Bot Improvements", "2026-08-08")
update_due("86dzr3r2a", "Insurance Card Scanning", "2026-08-15")
update_due("86dzr3r2e", "Provider Reviews & Notes", "2026-08-22")
update_due("86dzr3r2m", "Chat Sharing & Export", "2026-08-29")

# Milestones
update_due("86dzr3r2z", "✨ Public Beta Launch", "2026-05-12")
update_due("86dzr3r35", "🧩 Feature-Complete Release", "2026-06-15")
update_due("86dzr3r3c", "⚡ Performance-Optimized", "2026-06-22")
update_due("86dzr3r3p", "💰 Monetization Live", "2026-07-06")
update_due("86dzr3r3v", "📈 Growth Engine Running", "2026-07-20")

# ══════════════════════════════════════════════════════════════════════════════
# 3. CREATE NEW TASKS
# ══════════════════════════════════════════════════════════════════════════════
print("\n═══ CREATING NEW TASKS ═══\n")

# Growth — immediate SEO follow-ups
create_task(
    GROWTH,
    "Google Search Console Setup & Sitemap Submission",
    description="Set up Google Search Console for benefit-guard.jeffcoy.net. Submit sitemap.xml. Verify ownership. Monitor indexing of 8 blog articles.",
    priority=1,  # Urgent
    due_date="2026-04-14",
    time_estimate_hrs=1,
)

create_task(
    GROWTH,
    "Email Drip/Nurture Sequence (Post-Quiz)",
    description="Build automated email drip sequence for quiz completions. Per Marketing Automation Analysis: write once, every new subscriber gets the same experience. Use ConvertKit or Resend. Sequence: welcome → insurance tip → BenefitGuard value prop → offer.",
    priority=2,  # High
    due_date="2026-05-02",
    time_estimate_hrs=8,
)

create_task(
    GROWTH,
    "SEO: State-Specific Appeal Articles (5 More States)",
    description="Write appeal guide articles for FL, IL, PA, OH, GA — matching the NY/CA/TX articles already published. KB state law data exists for all 5. Target: 'how to appeal insurance denial [state]' long-tail keywords.",
    priority=3,  # Normal
    due_date="2026-04-25",
    time_estimate_hrs=6,
)

create_task(
    GROWTH,
    "Quora Content Syndication",
    description="Per Marketing Automation Analysis: repurpose blog article content as Quora answers. Quora is link-friendly, answers rank in Google, and reusable answer templates are acceptable. Target 10-15 high-traffic questions.",
    priority=3,  # Normal
    due_date="2026-05-09",
    time_estimate_hrs=4,
)

# Features — quiz lead magnet (referenced in all blog CTAs)
create_task(
    FEATURES,
    "Quiz Lead Magnet Implementation",
    description="Build the 'Is Your Insurance Screwing You?' interactive quiz at /quiz. Currently a placeholder page. Per MVT Strategy Card: quiz validates product demand and captures emails. 50 sign-ups in 30 days = validated. Needs: multi-step form, scoring logic, email capture, results page with personalized action plan.",
    priority=2,  # High
    due_date="2026-04-25",
    time_estimate_hrs=12,
)

print("\n═══ UPDATE COMPLETE ═══")
print("Run sync_clickup_state.py to refresh the local summary.")
