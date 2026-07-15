#!/usr/bin/env bash
# =============================================================
# Health Concierge — Database Reset Script (Linux / macOS)
# =============================================================
# Stops all services, deletes all SQLite database files, and
# restarts services so tables are auto-created fresh.
#
# Usage:
#   chmod +x db-reset.sh
#   ./db-reset.sh
#
# WARNING: This permanently deletes ALL application data.
#          There is no undo. Back up the data/ folder first
#          if you need to preserve anything.
# =============================================================

set -e

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

echo ""
echo -e "${RED}${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${RED}${BOLD}║    ⚠  Health Concierge — Database Reset      ║${RESET}"
echo -e "${RED}${BOLD}║    ALL DATA WILL BE PERMANENTLY DELETED       ║${RESET}"
echo -e "${RED}${BOLD}╚══════════════════════════════════════════════╝${RESET}"
echo ""
read -rp "  Type YES to confirm reset: " confirm

if [ "$confirm" != "YES" ]; then
  echo -e "${YELLOW}  ⚠ Reset cancelled. No changes were made.${RESET}"
  exit 0
fi

echo ""

# ── Step 1: Stop all running services ──────────────────────
echo -e "${CYAN}${BOLD}▶ Stopping all Docker services...${RESET}"
docker compose stop
echo -e "${GREEN}  ✔ All services stopped.${RESET}"

# ── Step 2: Delete database files ──────────────────────────
echo -e "${CYAN}${BOLD}▶ Deleting database files...${RESET}"

db_files=(
  "data/orchestrator/health_concierge.db"
  "data/pharmacy/pharmacy.db"
  "data/calendar/calendar.db"
  "data/records/records.db"
  "data/notify/notify.db"
)

for f in "${db_files[@]}"; do
  if [ -f "$f" ]; then
    rm -f "$f"
    echo -e "${GREEN}  ✔ Deleted: $f${RESET}"
  else
    echo -e "${YELLOW}  ⚠ Not found (skipped): $f${RESET}"
  fi
done

# ── Step 3: Restart services (tables auto-created on boot) ─
echo -e "${CYAN}${BOLD}▶ Starting services (tables will be auto-created)...${RESET}"
docker compose up -d

echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  ✔ Database reset complete. Fresh start!     ${RESET}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════${RESET}"
echo ""
echo -e "  🌐 Frontend  →  ${CYAN}http://localhost:3000${RESET}"
echo -e "  ⚙️  Backend   →  ${CYAN}http://localhost:8080${RESET}"
echo ""
echo -e "  ${YELLOW}Register a new account at http://localhost:3000/register${RESET}"
echo ""
