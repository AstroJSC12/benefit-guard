/**
 * TiC (Transparency in Coverage) Pipeline
 *
 * Downloads Aetna's machine-readable files (MRFs) and extracts in-network
 * provider NPIs for a specific plan. Stores results in the NetworkStatus
 * table so provider cards show accurate in-network/out-of-network badges.
 *
 * How it works:
 * 1. Fetches the Aetna Fully Insured table of contents (index) JSON
 * 2. Finds all MRF file URLs for the target plan (by HIOS ID)
 * 3. Stream-downloads each gzipped MRF file
 * 4. Stream-parses the JSON to extract NPIs from provider_references
 *    (the provider_references section comes FIRST in Aetna's files,
 *     before the massive in_network rates array, so we can stop early)
 * 5. Filters to providers in the target network (e.g. "Open Access Elect Choice")
 * 6. Batch-upserts NPIs into NetworkStatus with source="tic_data"
 *
 * Usage:
 *   npx tsx scripts/tic-pipeline.ts [--dry-run] [--limit N] [--file-limit N]
 *
 * Options:
 *   --dry-run      Extract NPIs but don't write to database
 *   --limit N      Stop after extracting N unique NPIs (for testing)
 *   --file-limit N Only process the first N MRF files (default: all)
 */

import https from "node:https";
import { createGunzip } from "node:zlib";
import { pipeline as streamPipeline, Readable, Transform } from "node:stream";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parser: createParser } = require("stream-json");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { streamArray: createStreamArray } = require("stream-json/streamers/StreamArray");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { pick: createPick } = require("stream-json/filters/Pick");

const pipelineAsync = promisify(streamPipeline);

// ── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  // Aetna Fully Insured table of contents URL pattern
  // Date is always the 5th of the current month
  indexUrlTemplate:
    "https://mrf.healthsparq.com/aetnacvs-egress.nophi.kyruushsq.com/prd/mrf/AETNACVS_I/ALICFI/{date}/tableOfContents/{date}_Aetna-Life-Insurance-Company_index.json.gz",

  // HIOS plan ID for Aetna Open Access Elect Choice (New York)
  targetPlanId: "17210NY009",

  // Network name to filter provider_references by
  // Providers in this network are in-network for the user's EPO plan
  targetNetworkNames: [
    "Open Access Elect Choice",
    "Aetna Open Access Elect Choice",
  ],

  // Insurer ID matching our insurer-directories.ts
  insurerId: "aetna",

  // Batch size for database upserts
  dbBatchSize: 500,

  // Request timeout in ms (per file download)
  requestTimeoutMs: 300_000, // 5 minutes to start receiving data

  // TLS: skip certificate validation for healthsparq CDN
  rejectUnauthorized: false,
};

// ── CLI argument parsing ───────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const NPI_LIMIT = getArgValue("--limit");
const FILE_LIMIT = getArgValue("--file-limit");

function getArgValue(flag: string): number | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  const val = parseInt(args[idx + 1], 10);
  return isNaN(val) ? null : val;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function log(msg: string) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${msg}`);
}

function getCurrentIndexDate(): string {
  const now = new Date();
  // Use the 5th of the current month
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-05`;
}

function httpsGet(url: string): Promise<Readable> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { rejectUnauthorized: CONFIG.rejectUnauthorized, timeout: CONFIG.requestTimeoutMs },
      (res) => {
        if (res.statusCode === 200) {
          resolve(res);
        } else if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirect
          httpsGet(res.headers.location).then(resolve, reject);
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

// ── Step 1: Fetch and parse the Table of Contents index ────────────────────

interface ReportingPlan {
  plan_name: string;
  plan_id: string;
  plan_id_type: string;
  plan_sponsor_name?: string;
}

interface ReportingStructure {
  reporting_plans: ReportingPlan[];
  in_network_files: { description: string; location: string }[];
}

interface ToCIndex {
  reporting_entity_name: string;
  reporting_structure: ReportingStructure[];
}

async function fetchIndex(): Promise<ToCIndex> {
  const date = getCurrentIndexDate();
  const url = CONFIG.indexUrlTemplate.replace(/{date}/g, date);
  log(`Fetching index: ${url}`);

  const stream = await httpsGet(url);
  const gunzip = createGunzip();

  const chunks: Buffer[] = [];
  await pipelineAsync(
    stream,
    gunzip,
    new Transform({
      transform(chunk, _enc, cb) {
        chunks.push(chunk);
        cb();
      },
    })
  );

  const json = Buffer.concat(chunks).toString("utf-8");
  const index: ToCIndex = JSON.parse(json);
  log(`Index loaded: ${index.reporting_entity_name} — ${index.reporting_structure.length} reporting structures`);
  return index;
}

// ── Step 2: Find MRF file URLs for the target plan ─────────────────────────

function findPlanFileUrls(index: ToCIndex): string[] {
  const urls = new Set<string>();

  for (const entry of index.reporting_structure) {
    const matchesPlan = entry.reporting_plans.some(
      (p) => p.plan_id === CONFIG.targetPlanId
    );
    if (matchesPlan) {
      for (const file of entry.in_network_files) {
        urls.add(file.location);
      }
    }
  }

  return Array.from(urls).sort();
}

// ── Step 3: Stream-parse one MRF file to extract NPIs ─────────────────────

/**
 * Streams an MRF file and extracts NPIs from provider_references entries
 * that belong to the target network.
 *
 * The MRF JSON structure (simplified):
 * {
 *   "provider_references": [
 *     {
 *       "provider_group_id": 12345,
 *       "provider_groups": [
 *         { "npi": [1234567890, ...], "tin": {...} }
 *       ],
 *       "network_name": ["Open Access Elect Choice", ...]
 *     },
 *     ...
 *   ],
 *   "in_network": [ ...massive rates data... ]
 * }
 *
 * We use stream-json to parse only the provider_references array items,
 * then stop when we hit in_network (no need to process rate data).
 */
async function extractNpisFromFile(
  url: string,
  existingNpis: Set<string>
): Promise<Set<string>> {
  const npis = new Set(existingNpis);
  const filename = url.split("/").pop() || url;
  log(`Downloading: ${filename}`);

  const stream = await httpsGet(url);
  const gunzip = createGunzip();

  let processed = 0;
  let matched = 0;
  let stopped = false;

  function stopParsing(reason: string) {
    if (stopped) return;
    stopped = true;
    log(`  ${reason}`);
    log(`  Result: ${processed.toLocaleString()} provider refs, ${matched.toLocaleString()} matched, ${npis.size.toLocaleString()} unique NPIs`);
    stream.destroy();
  }

  return new Promise((resolve, reject) => {
    const jsonParser = createParser();
    const pickProviders = createPick({ filter: "provider_references" });
    const arrayStream = createStreamArray();

    // KEY OPTIMIZATION: Monitor raw parser tokens for "in_network" key.
    // Since provider_references comes FIRST in Aetna's MRF files, once
    // we see the "in_network" key, all provider data has been extracted.
    // We abort immediately to avoid streaming through the multi-GB rates section.
    jsonParser.on("data", (token: { name: string; value?: string }) => {
      if (
        !stopped &&
        token.name === "keyValue" &&
        token.value === "in_network"
      ) {
        stopParsing("Reached in_network section — provider_references complete, stopping early");
        resolve(npis);
      }
    });

    // Connect the pipeline: HTTP → gunzip → JSON parser → pick provider_references → stream array items
    stream.pipe(gunzip).pipe(jsonParser).pipe(pickProviders).pipe(arrayStream);

    arrayStream.on("data", (data: { key: number; value: ProviderReference }) => {
      if (stopped) return;
      processed++;

      const ref = data.value;

      // Check if this provider reference belongs to our target network
      const inTargetNetwork = ref.network_name?.some((name: string) =>
        CONFIG.targetNetworkNames.some(
          (target) => name.toLowerCase().includes(target.toLowerCase())
        )
      );

      if (inTargetNetwork) {
        matched++;
        // Extract all NPIs from all provider groups
        for (const group of ref.provider_groups || []) {
          for (const npi of group.npi || []) {
            if (npi && npi !== 0) {
              npis.add(String(npi));
            }
          }
        }
      }

      // Progress logging every 10,000 entries
      if (processed % 10000 === 0) {
        log(`  ...processed ${processed.toLocaleString()} provider refs, ${matched.toLocaleString()} matched, ${npis.size.toLocaleString()} unique NPIs`);
      }

      // Stop early if NPI limit reached
      if (NPI_LIMIT && npis.size >= NPI_LIMIT) {
        stopParsing(`NPI limit (${NPI_LIMIT}) reached`);
        resolve(npis);
      }
    });

    arrayStream.on("end", () => {
      if (!stopped) {
        log(`  Finished: ${processed.toLocaleString()} provider refs, ${matched.toLocaleString()} matched, ${npis.size.toLocaleString()} unique NPIs`);
        resolve(npis);
      }
    });

    arrayStream.on("error", (err: Error) => {
      if (stopped || err.message.includes("remature")) {
        resolve(npis);
      } else {
        log(`  Error parsing: ${err.message}`);
        reject(err);
      }
    });

    // Handle errors at each pipeline stage — premature close is expected when we abort
    const handleErr = (err: Error) => {
      if (stopped || err.message.includes("remature") || err.message.includes("aborted") || err.message.includes("ABORT")) {
        resolve(npis);
      } else {
        reject(err);
      }
    };
    stream.on("error", handleErr);
    gunzip.on("error", handleErr);
    jsonParser.on("error", handleErr);
  });
}

interface ProviderReference {
  provider_group_id: number;
  provider_groups: { npi: number[]; tin: { type: string; value: string } }[];
  network_name: string[];
}

// ── Step 4: Batch upsert NPIs into NetworkStatus ──────────────────────────

async function upsertNpis(npis: Set<string>): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const npiArray = Array.from(npis);
    log(`Upserting ${npiArray.length.toLocaleString()} NPIs into NetworkStatus...`);

    let inserted = 0;

    for (let i = 0; i < npiArray.length; i += CONFIG.dbBatchSize) {
      const batch = npiArray.slice(i, i + CONFIG.dbBatchSize);

      // Build a single bulk upsert query using VALUES + ON CONFLICT
      // This is dramatically faster than individual upserts (1 query per batch vs 500)
      const values = batch
        .map(
          (npi, idx) =>
            `(gen_random_uuid(), $${idx * 2 + 1}, $${idx * 2 + 2}, 'in_network', 'tic_data', NOW(), NOW())`
        )
        .join(",\n");

      const params = batch.flatMap((npi) => [npi, CONFIG.insurerId]);

      await prisma.$executeRawUnsafe(
        `INSERT INTO "NetworkStatus" (id, npi, "insurerId", status, source, "createdAt", "updatedAt")
         VALUES ${values}
         ON CONFLICT (npi, "insurerId") DO UPDATE SET
           status = 'in_network',
           source = 'tic_data',
           "updatedAt" = NOW()`,
        ...params
      );

      inserted += batch.length;

      if (inserted % 5000 === 0 || inserted === npiArray.length) {
        log(`  ...upserted ${inserted.toLocaleString()} / ${npiArray.length.toLocaleString()}`);
      }
    }

    log(`Database upsert complete: ${npiArray.length.toLocaleString()} NPIs`);
  } finally {
    await prisma.$disconnect();
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  log("=== BenefitGuard TiC Pipeline ===");
  log(`Plan: Aetna Open Access Elect Choice (${CONFIG.targetPlanId})`);
  log(`Network filter: ${CONFIG.targetNetworkNames.join(", ")}`);
  if (DRY_RUN) log("Mode: DRY RUN (no database writes)");
  if (NPI_LIMIT) log(`NPI limit: ${NPI_LIMIT}`);
  if (FILE_LIMIT) log(`File limit: ${FILE_LIMIT}`);
  log("");

  // Step 1: Fetch index
  const index = await fetchIndex();

  // Step 2: Find plan files
  const fileUrls = findPlanFileUrls(index);
  log(`Found ${fileUrls.length} MRF files for plan ${CONFIG.targetPlanId}`);

  if (fileUrls.length === 0) {
    log("ERROR: No files found for target plan. Check plan ID.");
    process.exit(1);
  }

  // Step 3: Process files and extract NPIs
  const filesToProcess = FILE_LIMIT ? fileUrls.slice(0, FILE_LIMIT) : fileUrls;
  log(`Processing ${filesToProcess.length} files...\n`);

  let allNpis = new Set<string>();

  for (let i = 0; i < filesToProcess.length; i++) {
    const url = filesToProcess[i];
    log(`[${i + 1}/${filesToProcess.length}] Processing file...`);

    try {
      allNpis = await extractNpisFromFile(url, allNpis);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  WARN: Failed to process file, skipping: ${msg}`);
    }

    // Check NPI limit
    if (NPI_LIMIT && allNpis.size >= NPI_LIMIT) {
      log(`\nReached NPI limit of ${NPI_LIMIT}, stopping file processing`);
      break;
    }

    log("");
  }

  log(`\n=== Extraction Complete ===`);
  log(`Total unique NPIs: ${allNpis.size.toLocaleString()}`);
  log(`Files processed: ${filesToProcess.length}`);

  // Step 4: Write to database
  if (!DRY_RUN && allNpis.size > 0) {
    await upsertNpis(allNpis);
  } else if (DRY_RUN) {
    log("Dry run — skipping database writes");
    // Print a sample of NPIs
    const sample = Array.from(allNpis).slice(0, 20);
    log(`Sample NPIs: ${sample.join(", ")}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`\nDone in ${elapsed}s`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
