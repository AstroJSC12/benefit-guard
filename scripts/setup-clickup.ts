/**
 * BenefitGuard — ClickUp Project Setup Script
 * 
 * Creates the full project management structure in ClickUp:
 *   Space → Folders (phases) → Lists → Tasks
 * 
 * Run: npx tsx scripts/setup-clickup.ts
 */

import "dotenv/config";
import { phases } from "./clickup-data.js";

const API_KEY = process.env.CLICKUP_API_KEY!;
const WORKSPACE_ID = "9017067210"; // Jeff C's Workspace
const BASE_URL = "https://api.clickup.com/api/v2";

const headers = {
  Authorization: API_KEY,
  "Content-Type": "application/json",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function api(method: string, path: string, body?: unknown): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickUp API ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

function dueDate(daysFromNow: number): number {
  const d = new Date("2026-02-10T09:00:00-05:00");
  d.setDate(d.getDate() + daysFromNow);
  return d.getTime();
}

function hrsToMs(h: number): number {
  return h * 3_600_000;
}

// Sleep to respect ClickUp rate limits (100 req/min)
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Setting up BenefitGuard project in ClickUp...\n");

  // 1. Create Space
  console.log("📦 Creating Space: BenefitGuard...");
  const space = await api("POST", `/team/${WORKSPACE_ID}/space`, {
    name: "BenefitGuard",
    multiple_assignees: true,
    features: {
      due_dates: { enabled: true, start_date: true },
      time_tracking: { enabled: true },
      priorities: {
        enabled: true,
        priorities: [
          { color: "#f50000", id: "1", orderindex: "1", priority: "urgent" },
          { color: "#f8ae00", id: "2", orderindex: "2", priority: "high" },
          { color: "#6fddff", id: "3", orderindex: "3", priority: "normal" },
          { color: "#d8d8d8", id: "4", orderindex: "4", priority: "low" },
        ],
      },
      tags: { enabled: true },
    },
  });
  console.log(`   ✅ Space created (ID: ${space.id})\n`);
  await sleep(500);

  // Track created IDs for summary
  const summary: { folder: string; list: string; taskCount: number }[] = [];

  // 2. For each phase, create Folder → List → Tasks
  for (const phase of phases) {
    console.log(`📁 Creating Folder: ${phase.folder}...`);
    const folder = await api("POST", `/space/${space.id}/folder`, {
      name: phase.folder,
    });
    console.log(`   ✅ Folder created (ID: ${folder.id})`);
    await sleep(400);

    console.log(`   📋 Creating List: ${phase.list}...`);
    const list = await api("POST", `/folder/${folder.id}/list`, {
      name: phase.list,
    });
    console.log(`   ✅ List created (ID: ${list.id})`);
    await sleep(400);

    let taskCount = 0;
    for (const task of phase.tasks) {
      console.log(`      📝 Creating Task: ${task.name}...`);
      await api("POST", `/list/${list.id}/task`, {
        name: task.name,
        description: task.description,
        priority: task.priority,
        due_date: dueDate(task.due_days),
        due_date_time: false,
        time_estimate: hrsToMs(task.time_estimate_hrs),
        status: "to do",
        tags: task.tags,
      });
      taskCount++;
      // Rate limit: ~100 req/min, so 650ms between requests is safe
      await sleep(650);
    }

    summary.push({ folder: phase.folder, list: phase.list, taskCount });
    console.log(`   ✅ ${taskCount} tasks created\n`);
  }

  // 3. Create milestone tasks at Space level (folderless list)
  console.log("🏁 Creating Milestones list...");
  const milestoneList = await api("POST", `/space/${space.id}/list`, {
    name: "🏁 Milestones",
  });
  await sleep(400);

  const milestones = [
    { name: "🔒 Production Infrastructure Complete", due_days: 21, desc: "Phase 1 + 2 done. All security, legal, and infrastructure requirements met. App is safe to accept real users." },
    { name: "✨ Public Beta Launch", due_days: 42, desc: "Phases 1-3 complete. Landing page live, onboarding polished, mobile-responsive, accessible. Start accepting beta users." },
    { name: "🧩 Feature-Complete Release", due_days: 56, desc: "Phase 4 done. All core features built: 50-state laws, bill analysis, appeal assistant, cost estimator." },
    { name: "⚡ Performance-Optimized", due_days: 70, desc: "Phase 5 done. Caching, cost optimization, background jobs, multi-insurer TiC. Ready for thousands of users." },
    { name: "💰 Monetization Live", due_days: 84, desc: "Phase 6 done. Stripe billing, pricing tiers, admin dashboard. BenefitGuard is a business." },
    { name: "📈 Growth Engine Running", due_days: 98, desc: "Phase 7 done. Analytics, feedback, referrals, blog. Organic and viral growth channels active." },
  ];

  for (const m of milestones) {
    console.log(`   🏁 ${m.name}...`);
    await api("POST", `/list/${milestoneList.id}/task`, {
      name: m.name,
      description: m.desc,
      priority: 2, // high
      due_date: dueDate(m.due_days),
      due_date_time: false,
      status: "to do",
      tags: ["milestone"],
    });
    await sleep(650);
  }
  console.log(`   ✅ ${milestones.length} milestones created\n`);

  // Summary
  console.log("═══════════════════════════════════════════════════");
  console.log("✅ BenefitGuard ClickUp project setup complete!\n");
  console.log("📊 Summary:");
  let totalTasks = 0;
  for (const s of summary) {
    console.log(`   ${s.folder}: ${s.taskCount} tasks`);
    totalTasks += s.taskCount;
  }
  console.log(`   🏁 Milestones: ${milestones.length}`);
  console.log(`\n   Total: ${totalTasks + milestones.length} items created`);
  console.log(`   Space: BenefitGuard (ID: ${space.id})`);
  console.log("\n🔗 Open ClickUp to view your project!");
  console.log("═══════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
