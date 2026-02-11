---
description: Sync and review the current state of the ClickUp personal project before starting work
---

# ClickUp Project Sync & Review

Use this workflow at the start of any session where we'll be working on ClickUp tasks.

## Steps

// turbo
1. Read the daily summary file to get current project state:
```
cat /Users/jeffcoy/Projects/BenefitGuard/benefit-guard/docs/clickup-daily-summary.md
```

2. If the summary is stale (more than 4 hours old), re-sync from ClickUp:
```
/Users/jeffcoy/Projects/BenefitGuard/benefit-guard/.venv/bin/python3 /Users/jeffcoy/Projects/BenefitGuard/benefit-guard/scripts/sync_clickup_state.py
```
This will ALSO auto-sort any tasks in the "To Sort" list before snapshotting.
Then re-read the summary.

// turbo
3. Check the sort log to see if any brain-dump tasks were auto-processed:
```
tail -5 /Users/jeffcoy/Projects/BenefitGuard/benefit-guard/logs/sort-inbox.log 2>/dev/null
```

4. Review what's due soonest and what has the highest priority. Suggest what to tackle.

## To Sort — Brain Dump Inbox

The project has a "📥 To Sort" list (ID: 901710871860) where I quickly dump task ideas.

**How it works:**
- I add rough task ideas to "📥 To Sort" in ClickUp
- Every 4 hours (or on manual sync), `sort_inbox_tasks.py` runs automatically
- GPT-4o rewrites the task name, writes a description, picks the right list, sets priority, and creates subtasks
- Sort log: `logs/sort-inbox.log`

**To run inbox sort manually:**
```
/Users/jeffcoy/Projects/BenefitGuard/benefit-guard/.venv/bin/python3 /Users/jeffcoy/Projects/BenefitGuard/benefit-guard/scripts/sort_inbox_tasks.py
```

**To sync state without sorting:**
```
/Users/jeffcoy/Projects/BenefitGuard/benefit-guard/.venv/bin/python3 /Users/jeffcoy/Projects/BenefitGuard/benefit-guard/scripts/sync_clickup_state.py --skip-sort
```

## ClickUp Project Structure

| List | ID | Phase |
|------|----|-------|
| Infrastructure & Security | 901710848941 | Phase 1 |
| Legal Requirements | 901710848951 | Phase 2 |
| User Experience | 901710848954 | Phase 3 |
| Feature Development | 901710848962 | Phase 4 |
| Performance Optimization | 901710848967 | Phase 5 |
| Billing & Revenue | 901710848972 | Phase 6 |
| Growth | 901710848978 | Phase 7 |
| Advanced Development | 901710848981 | Phase 8 |
| 🏁 Milestones | 901710848991 | — |
| 📥 To Sort | 901710871860 | Inbox |
