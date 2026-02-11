#!/usr/bin/env python3
"""
BenefitGuard — ClickUp State Sync Script

Fetches full project state from ClickUp API and saves:
  - docs/clickup-project-state.json  (full state dump)
  - docs/clickup-daily-summary.md    (compact markdown summary)

Optionally runs inbox sort first (if sort_inbox_tasks module is available).

Usage:
  python3 scripts/sync_clickup_state.py [--skip-sort]

Requires: CLICKUP_API_KEY in .env
"""

import json
import os
import sys
import time
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

CLICKUP_API_KEY = os.getenv("CLICKUP_API_KEY", "")
BASE_URL = "https://api.clickup.com/api/v2"
SPACE_ID = "90174101415"
WORKSPACE_ID = "9017067210"

DOCS_DIR = PROJECT_ROOT / "docs"
LOGS_DIR = PROJECT_ROOT / "logs"
STATE_FILE = DOCS_DIR / "clickup-project-state.json"
SUMMARY_FILE = DOCS_DIR / "clickup-daily-summary.md"

PRIORITY_MAP = {1: "Urgent", 2: "High", 3: "Normal", 4: "Low"}

# ── API helpers ───────────────────────────────────────────────────────────────

session = requests.Session()
session.headers.update({
    "Authorization": CLICKUP_API_KEY,
    "Content-Type": "application/json",
})


def api_get(path: str, params: dict | None = None, retries: int = 3) -> dict:
    """GET from ClickUp API with retry on 429 rate limit."""
    url = f"{BASE_URL}{path}"
    for attempt in range(retries):
        resp = session.get(url, params=params)
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 429:
            wait = 2 ** attempt + 1
            print(f"  ⏳ Rate limited, waiting {wait}s...")
            time.sleep(wait)
            continue
        resp.raise_for_status()
    raise RuntimeError(f"Failed after {retries} retries: {url}")


# ── Data fetching ─────────────────────────────────────────────────────────────

def fetch_folders() -> list[dict]:
    """Fetch all folders in the space."""
    data = api_get(f"/space/{SPACE_ID}/folder", {"archived": "false"})
    return data.get("folders", [])


def fetch_folderless_lists() -> list[dict]:
    """Fetch lists not inside any folder (e.g., Milestones, To Sort)."""
    data = api_get(f"/space/{SPACE_ID}/list", {"archived": "false"})
    return data.get("lists", [])


def fetch_tasks_for_list(list_id: str) -> list[dict]:
    """Fetch all tasks (including closed) for a list. Handles pagination."""
    all_tasks = []
    page = 0
    while True:
        data = api_get(f"/list/{list_id}/task", {
            "include_closed": "true",
            "subtasks": "true",
            "page": str(page),
        })
        tasks = data.get("tasks", [])
        if not tasks:
            break
        all_tasks.extend(tasks)
        # ClickUp returns up to 100 tasks per page
        if len(tasks) < 100:
            break
        page += 1
        time.sleep(0.3)  # gentle rate limit respect
    return all_tasks


def build_full_state() -> dict:
    """Build the complete project state dictionary."""
    print("📦 Fetching project state from ClickUp...")

    folders = fetch_folders()
    folderless_lists = fetch_folderless_lists()

    all_lists = []
    total_tasks = 0
    total_subtasks = 0
    total_completed = 0
    total_subtasks_completed = 0

    # Process folders
    for folder in folders:
        folder_name = folder["name"]
        for lst in folder.get("lists", []):
            list_id = lst["id"]
            list_name = lst["name"]
            print(f"  📋 {folder_name} / {list_name}...")
            tasks = fetch_tasks_for_list(list_id)

            # Separate top-level tasks from subtasks
            top_level = []
            subtask_map = {}  # parent_id -> list of subtasks
            for t in tasks:
                parent = t.get("parent")
                if parent:
                    subtask_map.setdefault(parent, []).append(t)
                    total_subtasks += 1
                    if t.get("status", {}).get("type") == "closed":
                        total_subtasks_completed += 1
                else:
                    top_level.append(t)
                    total_tasks += 1
                    if t.get("status", {}).get("type") == "closed":
                        total_completed += 1

            # Attach subtasks to their parents
            for t in top_level:
                t["_subtasks"] = subtask_map.get(t["id"], [])

            all_lists.append({
                "list_id": list_id,
                "list_name": list_name,
                "folder_name": folder_name,
                "folder_id": folder["id"],
                "tasks": top_level,
            })

    # Process folderless lists
    for lst in folderless_lists:
        list_id = lst["id"]
        list_name = lst["name"]
        print(f"  📋 (folderless) {list_name}...")
        tasks = fetch_tasks_for_list(list_id)

        top_level = []
        subtask_map = {}
        for t in tasks:
            parent = t.get("parent")
            if parent:
                subtask_map.setdefault(parent, []).append(t)
                total_subtasks += 1
                if t.get("status", {}).get("type") == "closed":
                    total_subtasks_completed += 1
            else:
                top_level.append(t)
                total_tasks += 1
                if t.get("status", {}).get("type") == "closed":
                    total_completed += 1

        for t in top_level:
            t["_subtasks"] = subtask_map.get(t["id"], [])

        all_lists.append({
            "list_id": list_id,
            "list_name": list_name,
            "folder_name": None,
            "folder_id": None,
            "tasks": top_level,
        })

    state = {
        "synced_at": datetime.now(timezone.utc).isoformat(),
        "workspace_id": WORKSPACE_ID,
        "space_id": SPACE_ID,
        "space_name": "BenefitGuard",
        "stats": {
            "total_tasks": total_tasks,
            "completed_tasks": total_completed,
            "total_subtasks": total_subtasks,
            "completed_subtasks": total_subtasks_completed,
            "total_lists": len(all_lists),
        },
        "lists": all_lists,
    }

    print(f"  ✅ {total_tasks} tasks, {total_subtasks} subtasks across {len(all_lists)} lists")
    return state


# ── File writing ──────────────────────────────────────────────────────────────

def save_json(state: dict):
    """Save full state to JSON."""
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2, default=str)
    print(f"  💾 Saved {STATE_FILE.relative_to(PROJECT_ROOT)}")


def format_date(epoch_ms) -> str:
    """Convert ClickUp epoch ms to YYYY-MM-DD."""
    if not epoch_ms:
        return ""
    try:
        dt = datetime.fromtimestamp(int(epoch_ms) / 1000, tz=timezone.utc)
        return dt.strftime("%Y-%m-%d")
    except (ValueError, TypeError, OSError):
        return ""


def task_priority_label(task: dict) -> str:
    """Get priority label from task."""
    p = task.get("priority")
    if p and isinstance(p, dict):
        return PRIORITY_MAP.get(int(p.get("id", 3)), "Normal")
    return "Normal"


def save_summary(state: dict):
    """Generate and save compact markdown summary."""
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    stats = state["stats"]
    synced = state["synced_at"]

    lines = []
    lines.append("# BenefitGuard: Project Status\n")
    lines.append(f"**Last synced:** {synced}")
    lines.append(f"**Space ID:** {state['space_id']}")
    lines.append(f"**Workspace:** Jeff C's Workspace ({state['workspace_id']})")
    lines.append(f"**ClickUp:** https://app.clickup.com/{state['workspace_id']}/v/l/li/{state['space_id']}\n")

    lines.append("## Overview")
    lines.append(f"- **Tasks:** {stats['total_tasks']} ({stats['completed_tasks']} completed)")
    lines.append(f"- **Subtasks:** {stats['total_subtasks']} ({stats['completed_subtasks']} completed)")
    lines.append(f"- **Lists:** {stats['total_lists']}\n")

    lines.append("## Lists\n")

    # Collect upcoming deadlines
    upcoming = []
    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(days=30)

    for lst_data in state["lists"]:
        list_name = lst_data["list_name"]
        folder_name = lst_data["folder_name"]
        tasks = lst_data["tasks"]

        completed = sum(1 for t in tasks if t.get("status", {}).get("type") == "closed")
        total = len(tasks)

        header = f"### {list_name}"
        if folder_name:
            header = f"### {folder_name} → {list_name}"
        lines.append(header)
        lines.append(f"{completed}/{total} tasks done\n")

        for t in tasks:
            is_done = t.get("status", {}).get("type") == "closed"
            icon = "✅" if is_done else "⬜"
            name = t.get("name", "Untitled")
            priority = task_priority_label(t)
            start = format_date(t.get("start_date"))
            due = format_date(t.get("due_date"))
            subtasks = t.get("_subtasks", [])
            sub_done = sum(1 for s in subtasks if s.get("status", {}).get("type") == "closed")
            sub_total = len(subtasks)

            # Date string
            date_str = ""
            if start and due:
                date_str = f" [{start} → {due}]"
            elif due:
                date_str = f" [due {due}]"
            elif start:
                date_str = f" [start {start}]"

            # Subtask count
            sub_str = ""
            if sub_total > 0:
                sub_str = f" [{sub_done}/{sub_total} subtasks]"

            # Time estimate
            time_est = t.get("time_estimate")
            time_str = ""
            if time_est:
                hrs = int(time_est) / 3_600_000
                if hrs >= 1:
                    time_str = f" ~{hrs:.0f}h"

            lines.append(f"- {icon} **{name}**{date_str} (Priority: {priority}){sub_str}{time_str}")

            # Collect upcoming deadlines
            if not is_done and t.get("due_date"):
                try:
                    due_dt = datetime.fromtimestamp(int(t["due_date"]) / 1000, tz=timezone.utc)
                    if due_dt <= cutoff:
                        upcoming.append({
                            "due": format_date(t["due_date"]),
                            "due_dt": due_dt,
                            "name": name,
                            "list": list_name,
                            "priority": priority,
                        })
                except (ValueError, TypeError, OSError):
                    pass

        lines.append("")

    # Upcoming deadlines table
    if upcoming:
        upcoming.sort(key=lambda x: x["due_dt"])
        lines.append("## Upcoming Deadlines (Next 30 Days)\n")
        lines.append("| Due | Task | List | Priority |")
        lines.append("|-----|------|------|----------|")
        for item in upcoming:
            lines.append(f"| {item['due']} | {item['name']} | {item['list']} | {item['priority']} |")
        lines.append("")

    summary_text = "\n".join(lines)
    with open(SUMMARY_FILE, "w") as f:
        f.write(summary_text)
    print(f"  💾 Saved {SUMMARY_FILE.relative_to(PROJECT_ROOT)}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Sync ClickUp project state")
    parser.add_argument("--skip-sort", action="store_true",
                        help="Skip running inbox sort before syncing")
    args = parser.parse_args()

    if not CLICKUP_API_KEY:
        print("❌ CLICKUP_API_KEY not found in .env")
        sys.exit(1)

    # Step 1: Run inbox sort (unless skipped)
    if not args.skip_sort:
        try:
            sort_script = PROJECT_ROOT / "scripts" / "sort_inbox_tasks.py"
            if sort_script.exists():
                print("📥 Running inbox sort first...\n")
                # Import and run the sort module
                sys.path.insert(0, str(PROJECT_ROOT / "scripts"))
                from sort_inbox_tasks import run_sort
                run_sort()
                print()
            else:
                print("ℹ️  sort_inbox_tasks.py not found, skipping inbox sort.\n")
        except ImportError:
            print("ℹ️  sort_inbox_tasks module not available, skipping.\n")
        except Exception as e:
            print(f"⚠️  Inbox sort failed: {e}\n")

    # Step 2: Fetch and save state
    state = build_full_state()
    save_json(state)
    save_summary(state)

    print(f"\n✅ Sync complete at {state['synced_at']}")


if __name__ == "__main__":
    main()
