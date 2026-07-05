# =============================================================
# Health Concierge — Setup Script (Windows PowerShell)
# =============================================================
# Usage (from project root in PowerShell):
#   .\setup.ps1
#
# If you get an execution policy error, run:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# =============================================================

$ErrorActionPreference = "Stop"

function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   🏥  Health Concierge — Project Setup       ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step($msg)  { Write-Host "▶ $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "  ✔ $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "  ✘ $msg" -ForegroundColor Red }

# ─────────────────────────────────────────────────────────────
# Step 1: Check prerequisites
# ─────────────────────────────────────────────────────────────
Write-Banner
Write-Step "Checking prerequisites..."

$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Err "Docker is not installed. Please install Docker Desktop from https://www.docker.com/get-started"
    exit 1
}
$dockerVersion = docker --version
Write-Ok "Docker found: $dockerVersion"

$composeCheck = docker compose version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker Compose (v2) is not available. Please update Docker Desktop."
    exit 1
}
Write-Ok "Docker Compose found: $composeCheck"

# ─────────────────────────────────────────────────────────────
# Step 2: Create .env from .env.example
# ─────────────────────────────────────────────────────────────
Write-Step "Setting up environment file..."

if (Test-Path ".env") {
    Write-Warn ".env already exists. Skipping copy."
} elseif (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Ok "Created .env from .env.example"
} else {
    Write-Err ".env.example not found. Cannot create .env."
    exit 1
}

# ─────────────────────────────────────────────────────────────
# Step 3: Read and prompt for missing secrets
# ─────────────────────────────────────────────────────────────
Write-Step "Configuring secrets..."
Write-Host ""

# Parse .env into a hashtable
$envVars = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        $envVars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}

function Prompt-IfMissing($key, $desc) {
    $val = $envVars[$key]
    if (-not $val -or $val -like "*your-*" -or $val -like "*xxxx*") {
        Write-Host "  $desc" -ForegroundColor Yellow
        $newVal = Read-Host "  Enter $key"
        if ($newVal) {
            # Update in .env
            $content = Get-Content ".env"
            $updated = $content | ForEach-Object {
                if ($_ -match "^${key}=") { "${key}=${newVal}" } else { $_ }
            }
            $updated | Set-Content ".env"
            Write-Ok "$key updated."
        } else {
            Write-Warn "$key left unchanged. The app may not work correctly."
        }
    } else {
        Write-Ok "$key is already configured."
    }
    Write-Host ""
}

Prompt-IfMissing "NVIDIA_API_KEY" "NVIDIA NIM API Key (get from https://build.nvidia.com):"
Prompt-IfMissing "JWT_SECRET"     "JWT Secret (any long random string, min 32 chars):"
Prompt-IfMissing "MAIL_USERNAME"  "Gmail address for sending caregiver invites:"
Prompt-IfMissing "MAIL_PASSWORD"  "Gmail App Password (16-char code — Google Account → Security → App Passwords):"

# ─────────────────────────────────────────────────────────────
# Step 4: Create data directories
# ─────────────────────────────────────────────────────────────
Write-Step "Creating data directories..."
@("data\orchestrator", "data\calendar", "data\pharmacy", "data\notify", "data\records") | ForEach-Object {
    New-Item -ItemType Directory -Path $_ -Force | Out-Null
}
Write-Ok "Data directories ready."

# ─────────────────────────────────────────────────────────────
# Step 5: Build and start services
# ─────────────────────────────────────────────────────────────
Write-Step "Building Docker images (this may take a few minutes)..."
docker compose build
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker build failed. Check the error above."
    exit 1
}

Write-Step "Starting all services..."
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Err "docker compose up failed. Check the error above."
    exit 1
}

# ─────────────────────────────────────────────────────────────
# Step 6: Done!
# ─────────────────────────────────────────────────────────────
Write-Host ""
Start-Sleep -Seconds 8

Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🎉 Health Concierge is up and running!  " -ForegroundColor Green
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Frontend   →  " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "  ⚙️  Backend    →  " -NoNewline; Write-Host "http://localhost:8080" -ForegroundColor Cyan
Write-Host "  📅 Calendar   →  " -NoNewline; Write-Host "http://localhost:8081" -ForegroundColor Cyan
Write-Host "  💊 Pharmacy   →  " -NoNewline; Write-Host "http://localhost:8082" -ForegroundColor Cyan
Write-Host "  📧 Notify     →  " -NoNewline; Write-Host "http://localhost:8083" -ForegroundColor Cyan
Write-Host "  📋 Records    →  " -NoNewline; Write-Host "http://localhost:8084" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Run " -NoNewline; Write-Host "docker compose logs -f" -ForegroundColor Yellow -NoNewline; Write-Host " to tail all logs."
Write-Host "  Run " -NoNewline; Write-Host "docker compose down" -ForegroundColor Yellow -NoNewline; Write-Host " to stop all services."
Write-Host ""
