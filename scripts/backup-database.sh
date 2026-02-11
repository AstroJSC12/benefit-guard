#!/bin/bash
#
# BenefitGuard Database Backup Script
# Creates a compressed pg_dump of the Neon PostgreSQL database.
#
# Usage:
#   ./scripts/backup-database.sh
#
# Output:
#   backups/benefitguard_YYYY-MM-DD_HHMMSS.sql.gz
#
# Requires:
#   - pg_dump (comes with PostgreSQL or can be installed via: brew install libpq)
#   - DATABASE_URL set in .env
#

set -euo pipefail

# Add Homebrew libpq to PATH (keg-only, not symlinked by default)
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/benefitguard_${TIMESTAMP}.sql.gz"

# Load DATABASE_URL from .env
if [ -f "$PROJECT_DIR/.env" ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' "$PROJECT_DIR/.env" | cut -d'"' -f2)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not found. Set it in .env or as an environment variable."
  exit 1
fi

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)..."
echo "Output: $BACKUP_FILE"

# Run pg_dump and compress
pg_dump "$DATABASE_URL" --no-owner --no-acl --clean --if-exists | gzip > "$BACKUP_FILE"

# Verify the backup file exists and has content
FILESIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat --format=%s "$BACKUP_FILE" 2>/dev/null)
if [ "$FILESIZE" -lt 100 ]; then
  echo "WARNING: Backup file is suspiciously small ($FILESIZE bytes). Check for errors."
  exit 1
fi

echo "Backup complete: $BACKUP_FILE ($(echo "scale=1; $FILESIZE/1024" | bc) KB)"

# Clean up old backups (keep last 30)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/benefitguard_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
if [ "$BACKUP_COUNT" -gt 30 ]; then
  REMOVE_COUNT=$((BACKUP_COUNT - 30))
  echo "Removing $REMOVE_COUNT old backup(s) (keeping last 30)..."
  ls -1t "$BACKUP_DIR"/benefitguard_*.sql.gz | tail -n "$REMOVE_COUNT" | xargs rm -f
fi

echo "Done. Total backups: $(ls -1 "$BACKUP_DIR"/benefitguard_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')"
