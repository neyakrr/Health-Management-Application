# =============================================================
# Health Concierge — Database Reset Script (Windows PowerShell)
# =============================================================
# Stops all services, deletes all SQLite database files, and
# restarts services so tables are auto-created fresh.
#
# Usage:
#   .\db-reset.ps1
#
# WARNING: This permanently deletes ALL application data.
#          There is no undo. Back up the data\ folder first
#          if you need to preserve anything.
# =============================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg)  { Write-Host "▶ $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "  ✔ $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "  ⚠ $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║    ⚠  Health Concierge — Database Reset      ║" -ForegroundColor Red
Write-Host "║    ALL DATA WILL BE PERMANENTLY DELETED       ║" -ForegroundColor Red
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "  Type YES to confirm reset"
if ($confirm -ne "YES") {
    Write-Warn "Reset cancelled. No changes were made."
    exit 0
}

Write-Host ""

# ── Step 1: Stop all running services ──────────────────────
Write-Step "Stopping all Docker services..."
docker compose stop
Write-Ok "All services stopped."

# ── Step 2: Delete database files ──────────────────────────
Write-Step "Deleting database files..."

$dbFiles = @(
    "data\orchestrator\health_concierge.db",
    "data\pharmacy\pharmacy.db",
    "data\calendar\calendar.db",
    "data\records\records.db",
    "data\notify\notify.db"
)

foreach ($file in $dbFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Ok "Deleted: $file"
    } else {
        Write-Warn "Not found (skipped): $file"
    }
}

# ── Step 3: Restart services (tables auto-created on boot) ─
Write-Step "Starting services (tables will be auto-created)..."
docker compose up -d

Write-Host ""
Write-Host "══════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✔ Database reset complete. Fresh start!     " -ForegroundColor Green
Write-Host "══════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Frontend  →  " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "  ⚙️  Backend   →  " -NoNewline; Write-Host "http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Register a new account at http://localhost:3000/register" -ForegroundColor Yellow
Write-Host ""
