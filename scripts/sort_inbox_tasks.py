#!/usr/bin/env python3
"""
BenefitGuard — ClickUp Brain Dump Auto-Sorter

Monitors the "To Sort" inbox list, uses GPT-4o to classify and rewrite
each task, then moves it to the correct list.

Usage:
  python3 scripts/sort_inbox_tasks.py

Requires: CLICKUP_API_KEY and OPENAI_API_KEY in .env
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

CLICKUP_API_KEY = os.getenv("CLICKUP_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
BASE_URL = "https://api.clickup.com/api/v2"
OPENAI_URL = "https://api.openai.com/v1/chat/completions"
SPACE_ID = "90174101415"
TO_SORT_LIST_ID = "901710871860"

DOCS_DIR = PROJECT_ROOT / "docs"
LOGS_DIR = PROJECT_ROOT / "logs"
STATE_FILE = DOCS_DIR / "clickup-project-state.json"
SUMMARY_FILE = DOCS_DIR / "clickup-daily-summary.md"
SORT_LOG = LOGS_DIR / "sort-inbox.log"

# List name -> List ID mapping (all lists in the BenefitGuard space)
LIST_MAP = {
    "Infrastructure & Security": "901710848941",
    "Legal Requirements": "901710848951",
    "User Experience": "901710848954",
    "Feature Development": "901710848962",
    "Performance Optimization": "901710848967",
    "Billing & Revenue": "901710848972",
    "Growth": "901710848978",
    "Advanced Development": "901710848981",
    "🏁 Milestones": "901710848991",
    "📥 To Sort": TO_SORT_LIST_ID,
}

# Descriptions for the LLM prompt
LIST_DESCRIPTIONS = {
    "Infrastructure & Security": "Production infrastructure: OAuth, rate limiting, CI/CD, error monitoring, security headers, database backups, environment management, cost monitoring. Phase 1 tasks.",
    "Legal Requirements": "Legal and compliance: Terms of Service, Privacy Policy, disclaimers, data deletion, encryption audits, cookie consent. Phase 2 tasks.",
    "User Experience": "UX and onboarding polish: landing page, email system, mobile responsiveness, loading states, accessibility, guided tours, document upload UX. Phase 3 tasks.",
    "Feature Development": "Core feature completion: 50-state law coverage, bill analysis, claim denial assistant, cost estimator, family management, document type detection, KB cron jobs. Phase 4 tasks.",
    "Performance Optimization": "Scale and performance: Redis caching, OpenAI cost optimization, background job queues, multi-insurer TiC pipeline, database indexing, CDN optimization. Phase 5 tasks.",
    "Billing & Revenue": "Monetization: Stripe integration, pricing tiers, usage tracking, admin dashboard, upgrade prompts. Phase 6 tasks.",
    "Growth": "Growth and engagement: analytics (PostHog), feedback system, push notifications, referral system, blog/SEO, testimonials. Phase 7 tasks.",
    "Advanced Development": "Advanced/future features: Spanish language support, SMS channel, voice improvements, insurance card scanning, provider reviews, chat sharing. Phase 8 tasks.",
    "🏁 Milestones": "Major project milestones and phase completion gates. Only for milestone-type items, not regular tasks.",
}

# ── API helpers ───────────────────────────────────────────────────────────────

cu_session = requests.Session()
cu_session.headers.update({
    "Authorization": CLICKUP_API_KEY,
    "Content-Type": "application/json",
})


def cu_get(path: str, params: dict | None = None, retries: int = 3) -> dict:
    """GET from ClickUp API with retry on 429."""
    url = f"{BASE_URL}{path}"
    for attempt in range(retries):
        resp = cu_session.get(url, params=params)
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 429:
            wait = 2 ** attempt + 1
            print(f"  ⏳ Rate limited, waiting {wait}s...")
            time.sleep(wait)
            continue
        resp.raise_for_status()
    raise RuntimeError(f"Failed after {retries} retries: GET {path}")


def cu_put(path: str, body: dict, retries: int = 3) -> dict:
    """PUT to ClickUp API with retry on 429."""
    url = f"{BASE_URL}{path}"
    for attempt in range(retries):
        resp = cu_session.put(url, json=body)
        if resp.status_code in (200, 201):
            return resp.json()
        if resp.status_code == 429:
            wait = 2 ** attempt + 1
            print(f"  ⏳ Rate limited, waiting {wait}s...")
            time.sleep(wait)
            continue
        resp.raise_for_status()
    raise RuntimeError(f"Failed after {retries} retries: PUT {path}")


def cu_post(path: str, body: dict, retries: int = 3) -> dict:
    """POST to ClickUp API with retry on 429."""
    url = f"{BASE_URL}{path}"
    for attempt in range(retries):
        resp = cu_session.post(url, json=body)
        if resp.status_code in (200, 201):
            return resp.json()
        if resp.status_code == 429:
            wait = 2 ** attempt + 1
            print(f"  ⏳ Rate limited, waiting {wait}s...")
            time.sleep(wait)
            continue
        resp.raise_for_status()
    raise RuntimeError(f"Failed after {retries} retries: POST {path}")


def cu_delete(path: str, retries: int = 3):
    """DELETE from ClickUp API with retry on 429."""
    url = f"{BASE_URL}{path}"
    for attempt in range(retries):
        resp = cu_session.delete(url)
        if resp.status_code in (200, 204):
            return
        if resp.status_code == 429:
            wait = 2 ** attempt + 1
            print(f"  ⏳ Rate limited, waiting {wait}s...")
            time.sleep(wait)
            continue
        resp.raise_for_status()
    raise RuntimeError(f"Failed after {retries} retries: DELETE {path}")


# ── Task name lookup ──────────────────────────────────────────────────────────

def build_task_lookup() -> dict[str, str]:
    """Build a task name → task ID lookup from the state JSON."""
    lookup = {}
    if not STATE_FILE.exists():
        return lookup
    try:
        with open(STATE_FILE) as f:
            state = json.load(f)
        for lst in state.get("lists", []):
            for task in lst.get("tasks", []):
                name = task.get("name", "").strip()
                if name:
                    lookup[name.lower()] = task["id"]
                # Also index subtasks
                for sub in task.get("_subtasks", []):
                    sub_name = sub.get("name", "").strip()
                    if sub_name:
                        lookup[sub_name.lower()] = sub["id"]
    except (json.JSONDecodeError, KeyError):
        pass
    return lookup


# ── LLM classification ───────────────────────────────────────────────────────

def build_system_prompt(summary_text: str, existing_tasks: list[str]) -> str:
    """Build the system prompt for GPT-4o task classification."""
    list_descriptions = "\n".join(
        f'- **{name}**: {desc}' for name, desc in LIST_DESCRIPTIONS.items()
    )

    existing_str = "\n".join(f"- {t}" for t in existing_tasks[:80])

    return f"""You are a project management assistant for BenefitGuard, a healthcare benefits AI app.

Your job is to take a rough brain-dump task idea and:
1. Rewrite it as a clear, professional task name (Title Case)
2. Write a useful description (2-4 short paragraphs for a new top-level task, 1-2 sentences for a subtask)
3. Classify it into the correct list
4. Set appropriate priority and dates
5. Suggest subtasks if helpful
6. Decide if it should be a SUBTASK of an existing task instead of a new top-level task

## Available Lists (pick one):
{list_descriptions}

## Existing Tasks in the Project:
{existing_str}

## Rules:
- If the brain dump clearly relates to an existing task (e.g., "add tests for rate limiting" → subtask of "Rate Limiting & Abuse Prevention"), set add_as_subtask=true and parent_task_name to the EXACT name of the existing task.
- If it's a new independent item, set add_as_subtask=false and parent_task_name=null.
- Priority: 1=Urgent (blocking/critical), 2=High (important, do soon), 3=Normal (standard work), 4=Low (nice-to-have)
- Dates: use epoch milliseconds or null. Only set dates if the task has a natural deadline.
- Subtasks: suggest 2-5 concrete sub-steps for complex tasks. Leave empty for simple tasks or subtasks.
- Keep descriptions concise and actionable. No fluff.

## Output Format:
Return ONLY valid JSON (no markdown fencing, no explanation):
{{
  "refined_name": "Clear Professional Task Name in Title Case",
  "description": "Task description...",
  "target_list": "Exact list name from the list above",
  "priority": 3,
  "start_date": null,
  "due_date": null,
  "subtasks": ["Subtask 1", "Subtask 2"],
  "add_as_subtask": false,
  "parent_task_name": null,
  "reasoning": "Brief explanation of classification"
}}"""


def classify_task(task_name: str, task_desc: str, system_prompt: str) -> dict | None:
    """Send task to GPT-4o for classification. Returns parsed JSON or None."""
    user_content = f"Brain dump task:\nName: {task_name}"
    if task_desc:
        user_content += f"\nDescription: {task_desc}"

    try:
        resp = requests.post(
            OPENAI_URL,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o",
                "temperature": 0.3,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
            },
            timeout=30,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]

        # Strip markdown fencing if present
        content = content.strip()
        content = re.sub(r'^```(?:json)?\s*', '', content)
        content = re.sub(r'\s*```$', '', content)

        return json.loads(content)
    except (requests.RequestException, json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"    ⚠️  LLM classification failed: {e}")
        return None


# ── Task operations ───────────────────────────────────────────────────────────

def update_task(task_id: str, updates: dict) -> dict:
    """Update a task's fields (name, description, priority, dates — NOT list)."""
    return cu_put(f"/task/{task_id}", updates)


def move_task_to_list(task_id: str, target_list_id: str, task_data: dict) -> str:
    """Move a task by recreating it in the target list and deleting the original.

    ClickUp free plan doesn't support the Tasks-in-Multiple-Lists ClickApp,
    so there's no direct move endpoint. We recreate + delete instead.

    Returns the new task ID.
    """
    # Build the new task payload from the already-updated task data
    body: dict = {
        "name": task_data.get("name", "Untitled"),
        "description": task_data.get("description", ""),
        "status": "to do",
    }
    if task_data.get("priority"):
        body["priority"] = task_data["priority"]
    if task_data.get("due_date"):
        body["due_date"] = task_data["due_date"]
        body["due_date_time"] = False
    if task_data.get("start_date"):
        body["start_date"] = task_data["start_date"]
        body["start_date_time"] = False
    if task_data.get("time_estimate"):
        body["time_estimate"] = task_data["time_estimate"]
    if task_data.get("parent"):
        body["parent"] = task_data["parent"]
    # Preserve tags
    tags = task_data.get("tags", [])
    if tags:
        body["tags"] = [t["name"] if isinstance(t, dict) else t for t in tags]

    new_task = cu_post(f"/list/{target_list_id}/task", body)
    time.sleep(0.5)
    cu_delete(f"/task/{task_id}")
    return new_task["id"]


def create_subtask(parent_id: str, list_id: str, name: str) -> dict:
    """Create a subtask under a parent task in the same list."""
    return cu_post(f"/list/{list_id}/task", {
        "name": name,
        "parent": parent_id,
        "status": "to do",
    })


def get_task_list_id(task_id: str) -> str:
    """Get the list ID that a task belongs to."""
    data = cu_get(f"/task/{task_id}")
    return data.get("list", {}).get("id", "")


# ── Logging ───────────────────────────────────────────────────────────────────

def log_sort(entry: dict):
    """Append a JSON log line."""
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    with open(SORT_LOG, "a") as f:
        f.write(json.dumps(entry, default=str) + "\n")


# ── Main sort logic ──────────────────────────────────────────────────────────

def run_sort():
    """Main entry point for the inbox sort. Called by sync script or standalone."""
    if not CLICKUP_API_KEY:
        print("❌ CLICKUP_API_KEY not found in .env")
        return
    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY not found in .env")
        return

    # 1. Fetch tasks from To Sort
    print("📥 Fetching tasks from 📥 To Sort...")
    data = cu_get(f"/list/{TO_SORT_LIST_ID}/task", {"include_closed": "false"})
    inbox_tasks = data.get("tasks", [])

    if not inbox_tasks:
        print("  ✅ Inbox is empty — nothing to sort.")
        return

    print(f"  Found {len(inbox_tasks)} task(s) to sort.\n")

    # 2. Load project summary for LLM context
    summary_text = ""
    if SUMMARY_FILE.exists():
        summary_text = SUMMARY_FILE.read_text()

    # 3. Build task name → ID lookup
    task_lookup = build_task_lookup()
    existing_task_names = list(
        name for name in (
            k.title() for k in task_lookup.keys()
        )
    )

    # Actually, let's get the real names from the state file
    existing_task_names_real = []
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE) as f:
                state = json.load(f)
            for lst in state.get("lists", []):
                for task in lst.get("tasks", []):
                    existing_task_names_real.append(task.get("name", ""))
        except (json.JSONDecodeError, KeyError):
            pass

    # 4. Build system prompt
    system_prompt = build_system_prompt(
        summary_text,
        existing_task_names_real or existing_task_names,
    )

    # 5. Process each task
    sorted_count = 0
    failed_count = 0
    run_log = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tasks_found": len(inbox_tasks),
        "results": [],
    }

    for task in inbox_tasks:
        task_id = task["id"]
        task_name = task.get("name", "Untitled")
        task_desc = task.get("description", "") or ""

        print(f"  🔄 Processing: \"{task_name}\"")

        # 5a. Classify with GPT-4o
        classification = classify_task(task_name, task_desc, system_prompt)
        if not classification:
            print(f"    ❌ Failed to classify, skipping.")
            failed_count += 1
            run_log["results"].append({
                "task_id": task_id,
                "original_name": task_name,
                "status": "failed",
                "error": "LLM classification failed",
            })
            continue

        refined_name = classification.get("refined_name", task_name)
        description = classification.get("description", "")
        target_list = classification.get("target_list", "")
        priority = classification.get("priority", 3)
        start_date = classification.get("start_date")
        due_date = classification.get("due_date")
        subtask_names = classification.get("subtasks", [])
        add_as_subtask = classification.get("add_as_subtask", False)
        parent_task_name = classification.get("parent_task_name")
        reasoning = classification.get("reasoning", "")

        print(f"    → \"{refined_name}\" → {target_list} (Priority: {priority})")
        if add_as_subtask and parent_task_name:
            print(f"    → As subtask of: \"{parent_task_name}\"")
        if reasoning:
            print(f"    → Reason: {reasoning}")

        # 5b. Resolve target list ID
        target_list_id = LIST_MAP.get(target_list)
        if not target_list_id:
            print(f"    ⚠️  Unknown list \"{target_list}\", defaulting to Feature Development")
            target_list = "Feature Development"
            target_list_id = LIST_MAP["Feature Development"]

        # 5c. Build the refined task data for the recreate-and-delete move
        task_data = {
            "name": refined_name,
            "description": description,
            "priority": priority,
        }
        if start_date:
            task_data["start_date"] = start_date
        if due_date:
            task_data["due_date"] = due_date

        # 5d. Handle subtask-of-existing vs new top-level
        became_subtask = False
        new_task_id = task_id  # tracks the ID after potential recreate

        if add_as_subtask and parent_task_name:
            # Find parent task ID
            parent_id = task_lookup.get(parent_task_name.lower())
            if parent_id:
                try:
                    # Find which list the parent lives in
                    parent_list_id = get_task_list_id(parent_id)
                    time.sleep(0.3)
                    # Recreate as subtask of parent in parent's list
                    task_data["parent"] = parent_id
                    new_task_id = move_task_to_list(task_id, parent_list_id, task_data)
                    print(f"    ✅ Added as subtask of \"{parent_task_name}\"")
                    became_subtask = True
                except Exception as e:
                    print(f"    ⚠️  Failed to set parent, moving to list instead: {e}")
                    task_data.pop("parent", None)
                    try:
                        new_task_id = move_task_to_list(task_id, target_list_id, task_data)
                        print(f"    ✅ Moved to {target_list} (fallback)")
                    except Exception as e2:
                        print(f"    ❌ Move also failed: {e2}")
            else:
                print(f"    ⚠️  Parent \"{parent_task_name}\" not found, creating as top-level")
                try:
                    new_task_id = move_task_to_list(task_id, target_list_id, task_data)
                    print(f"    ✅ Moved to {target_list}")
                except Exception as e:
                    print(f"    ❌ Move failed: {e}")
        else:
            # Move to target list
            if target_list_id != TO_SORT_LIST_ID:
                try:
                    new_task_id = move_task_to_list(task_id, target_list_id, task_data)
                    print(f"    ✅ Moved to {target_list}")
                except Exception as e:
                    print(f"    ❌ Move failed: {e}")
            else:
                # Just update in place if staying in To Sort (shouldn't happen)
                try:
                    update_task(task_id, task_data)
                except Exception as e:
                    print(f"    ⚠️  Failed to update task: {e}")

        # 5e. Create subtasks if suggested (only for top-level tasks;
        #     ClickUp does not allow sub-subtasks)
        if subtask_names and not became_subtask:
            for sub_name in subtask_names:
                try:
                    create_subtask(new_task_id, target_list_id, sub_name)
                    print(f"    📎 Created subtask: {sub_name}")
                    time.sleep(0.5)
                except Exception as e:
                    print(f"    ⚠️  Failed to create subtask \"{sub_name}\": {e}")
        elif subtask_names and became_subtask:
            print(f"    ℹ️  Skipping {len(subtask_names)} suggested subtasks (ClickUp forbids sub-subtasks)")

        sorted_count += 1
        run_log["results"].append({
            "task_id": task_id,
            "original_name": task_name,
            "refined_name": refined_name,
            "target_list": target_list,
            "priority": priority,
            "add_as_subtask": add_as_subtask,
            "parent_task_name": parent_task_name,
            "subtasks_created": len(subtask_names),
            "reasoning": reasoning,
            "status": "sorted",
        })
        print()

    # 6. Log results
    run_log["tasks_sorted"] = sorted_count
    run_log["tasks_failed"] = failed_count
    log_sort(run_log)

    print(f"📊 Sort complete: {sorted_count} sorted, {failed_count} failed")
    print(f"📝 Log: {SORT_LOG.relative_to(PROJECT_ROOT)}")


# ── CLI entry point ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    run_sort()
