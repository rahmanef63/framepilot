#!/bin/sh
# backup-convex.sh — take a point-in-time snapshot of the Convex deployment
# (users + saved projects + analytics) to a local zip OUTSIDE the repo.
#
# The export contains user data (emails) — NEVER commit it. It writes to
# ~/backups/framepilot/ by default; override with $BACKUP_DIR.
#
# Reads CONVEX_DEPLOY_KEY from .env.local WITHOUT `source` (the key can contain a
# `|` that breaks shell sourcing) — grep + sed the value instead.
#
# Cron suggestion (daily 03:00, keep it off the app host if you can):
#   0 3 * * *  cd /path/to/framepilot && sh scripts/backup-convex.sh
#
# Convex Cloud also keeps its own dashboard snapshot-exports (Settings → Backup);
# this is a belt-and-suspenders local copy.

set -eu

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/framepilot}"
mkdir -p "$BACKUP_DIR"

KEY=$(grep -E '^CONVEX_DEPLOY_KEY=' "$REPO_ROOT/.env.local" | sed 's/^CONVEX_DEPLOY_KEY=//; s/^["'"'"']//; s/["'"'"']$//')
if [ -z "$KEY" ]; then
  echo "backup-convex: CONVEX_DEPLOY_KEY not found in .env.local" >&2
  exit 1
fi

OUT="$BACKUP_DIR/framepilot-convex-$(date +%Y%m%d-%H%M%S).zip"
echo "backup-convex: exporting to $OUT"
CONVEX_DEPLOY_KEY="$KEY" npx --prefix "$REPO_ROOT" convex export --path "$OUT"
echo "backup-convex: done."
