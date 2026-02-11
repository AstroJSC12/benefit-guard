# Database Backup & Recovery Procedures

> **Database**: PostgreSQL on Neon (cloud)  
> **Plan**: Free (as of Feb 2026)  
> **Connection**: `DATABASE_URL` in `.env`  
> **Last verified**: February 11, 2026

---

## Current Backup Coverage

### Neon Built-in: Point-in-Time Recovery (PITR)

Neon automatically maintains a write-ahead log (WAL) that enables instant restore:

| Feature | Free Plan | Launch Plan ($19/mo) | Scale Plan ($69/mo) |
|---------|-----------|---------------------|---------------------|
| **PITR available** | Yes | Yes | Yes |
| **Restore window** | 6 hours | Up to 7 days | Up to 30 days |
| **Change history cap** | 1 GB | Unlimited ($0.20/GB-mo) | Unlimited ($0.20/GB-mo) |
| **Configuration needed** | None (automatic) | Configurable | Configurable |

**How it works**: Neon continuously records every write operation (INSERT, UPDATE, DELETE) as WAL entries. You can "rewind" your database to any point within the restore window.

**Free plan limitation**: The 6-hour window means if a data loss event happens overnight, you may not be able to recover. For production with real users, upgrading to the Launch plan ($19/mo) for 7-day PITR is strongly recommended.

### Supplemental: Manual pg_dump Backups

To cover the gap in the Free plan's 6-hour PITR window, we have a manual backup script that creates full SQL dumps. These can be stored locally or in cloud storage.

**Script**: `scripts/backup-database.sh`  
**Output**: `backups/benefitguard_YYYY-MM-DD_HHMMSS.sql.gz`

---

## How to Restore

### Option 1: Neon PITR (Instant Restore)

Best for: Accidental data deletion, bad migration, or corruption within the last 6 hours.

1. Go to **[console.neon.tech](https://console.neon.tech)**
2. Select the **BenefitGuard** project
3. Go to **Branches** → select your branch (usually `main`)
4. Click **Restore** → choose **Restore to a point in time**
5. Pick the timestamp you want to restore to
6. Confirm — Neon will rewind the branch to that exact moment

**Important**: This restores IN PLACE — it overwrites the current state. If you want to inspect before restoring, use **Time Travel Assist** to run read-only queries against a historical point first.

### Option 2: Restore from pg_dump Backup

Best for: Recovery beyond the 6-hour PITR window, or migrating to a different database.

```bash
# Decompress and restore to the same database
gunzip -c backups/benefitguard_2026-02-11_143000.sql.gz | psql "$DATABASE_URL"

# Or restore to a fresh Neon branch (safer — inspect before switching)
# 1. Create a new branch in Neon console
# 2. Get the new branch's connection string
# 3. Restore to it:
gunzip -c backups/benefitguard_2026-02-11_143000.sql.gz | psql "NEW_BRANCH_URL"
```

### Option 3: Neon Branching (Inspect Before Restore)

Best for: When you want to check the historical state before committing to a restore.

1. In Neon console, create a **new branch** from a point in time
2. Connect to the branch and run queries to verify the data looks correct
3. If satisfied, either:
   - Use this branch as your new production branch, OR
   - Export from this branch and import to your main branch

---

## Backup Script Usage

### Manual Backup

```bash
# Run from project root
./scripts/backup-database.sh

# Output: backups/benefitguard_2026-02-11_143000.sql.gz
```

### Automated Backups (Recommended)

Set up a launchd agent (macOS) to run daily backups:

```bash
# The backup script is already set up. To automate:
# 1. Copy the launchd plist (see below)
# 2. Load it: launchctl load ~/Library/LaunchAgents/com.benefitguard.db-backup.plist
```

---

## What Gets Backed Up

| Data | Included in PITR | Included in pg_dump |
|------|-----------------|-------------------|
| User accounts | Yes | Yes |
| Chat conversations & messages | Yes | Yes |
| Uploaded documents (metadata + raw text) | Yes | Yes |
| Document chunks + embeddings | Yes | Yes |
| Knowledge base entries | Yes | Yes (can also re-seed) |
| Network status (TiC data + user verifications) | Yes | Yes |
| File binary data (Bytes fields) | Yes | Yes |

**Note**: The knowledge base can always be regenerated from `prisma/seed.ts`. The TiC pipeline data can be re-ingested from `scripts/tic-pipeline.ts`. User data (accounts, conversations, documents) is the irreplaceable data.

---

## Recommendations for Production

1. **Upgrade to Neon Launch plan ($19/mo)** before public beta — 7-day PITR is essential for real users
2. **Run daily pg_dump backups** as defense-in-depth (belt and suspenders)
3. **Store backups offsite** — consider uploading to S3, Google Cloud Storage, or even a private GitHub repo
4. **Test the restore procedure** at least once before launch — don't wait for an emergency
5. **Monitor database size** — Free plan caps at 0.5 GB storage; the TiC data (2.2M NPIs) may push close to this limit

---

## Emergency Contacts

- **Neon Support**: https://neon.tech/docs/introduction/support
- **Neon Status Page**: https://neonstatus.com
- **Neon Community**: https://community.neon.tech
