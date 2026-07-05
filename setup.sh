#!/usr/bin/env bash
# =============================================================
# Health Concierge — Setup Script (Linux / macOS)
# =============================================================
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
# =============================================================

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

print_banner() {
  echo ""
  echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════╗${RESET}"
  echo -e "${CYAN}${BOLD}║   🏥  Health Concierge — Project Setup       ║${RESET}"
  echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════╝${RESET}"
  echo ""
}

print_step() {
  echo -e "${CYAN}${BOLD}▶ $1${RESET}"
}

print_ok() {
  echo -e "${GREEN}  ✔ $1${RESET}"
}

print_warn() {
  echo -e "${YELLOW}  ⚠ $1${RESET}"
}

print_error() {
  echo -e "${RED}  ✘ $1${RESET}"
}

# ─────────────────────────────────────────────────────────────
# Step 1: Check prerequisites
# ─────────────────────────────────────────────────────────────
print_banner
print_step "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  print_error "Docker is not installed. Please install Docker Desktop from https://www.docker.com/get-started"
  exit 1
fi
print_ok "Docker found: $(docker --version)"

if ! docker compose version &> /dev/null; then
  print_error "Docker Compose (v2) is not available. Please update Docker Desktop."
  exit 1
fi
print_ok "Docker Compose found: $(docker compose version)"

# ─────────────────────────────────────────────────────────────
# Step 2: Create .env from .env.example
# ─────────────────────────────────────────────────────────────
print_step "Setting up environment file..."

if [ -f ".env" ]; then
  print_warn ".env already exists. Skipping copy."
else
  if [ -f ".env.example" ]; then
    cp .env.example .env
    print_ok "Created .env from .env.example"
  else
    print_error ".env.example not found. Cannot create .env."
    exit 1
  fi
fi

# ─────────────────────────────────────────────────────────────
# Step 3: Prompt for missing secrets
# ─────────────────────────────────────────────────────────────
print_step "Configuring secrets..."
echo ""

source_env() {
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
}
source_env

prompt_if_missing() {
  local key="$1"
  local desc="$2"
  local current_val="${!key}"

  if [ -z "$current_val" ] || [[ "$current_val" == *"your-"* ]] || [[ "$current_val" == *"xxxx"* ]]; then
    echo -e "${YELLOW}  ${desc}${RESET}"
    read -rp "  Enter $key: " new_val
    if [ -n "$new_val" ]; then
      # Update the value in .env
      if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${new_val}|" .env
      else
        echo "${key}=${new_val}" >> .env
      fi
      print_ok "${key} updated."
    else
      print_warn "${key} left unchanged. The app may not work correctly."
    fi
  else
    print_ok "${key} is already configured."
  fi
  echo ""
}

prompt_if_missing "NVIDIA_API_KEY" "NVIDIA NIM API Key (get from https://build.nvidia.com):"
prompt_if_missing "JWT_SECRET"     "JWT Secret (any long random string, min 32 chars):"
prompt_if_missing "MAIL_USERNAME"  "Gmail address for sending caregiver invites:"
prompt_if_missing "MAIL_PASSWORD"  "Gmail App Password (16-char code from Google Account → Security → App Passwords):"

# ─────────────────────────────────────────────────────────────
# Step 4: Create data directories
# ─────────────────────────────────────────────────────────────
print_step "Creating data directories..."
mkdir -p data/orchestrator data/calendar data/pharmacy data/notify data/records
print_ok "Data directories ready."

# ─────────────────────────────────────────────────────────────
# Step 5: Build and start services
# ─────────────────────────────────────────────────────────────
print_step "Building Docker images (this may take a few minutes)..."
docker compose build

print_step "Starting all services..."
docker compose up -d

# ─────────────────────────────────────────────────────────────
# Step 6: Health check
# ─────────────────────────────────────────────────────────────
print_step "Waiting for services to become healthy..."
sleep 15

echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  🎉 Health Concierge is up and running!  ${RESET}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${RESET}"
echo ""
echo -e "  🌐 Frontend   →  ${CYAN}http://localhost:3000${RESET}"
echo -e "  ⚙️  Backend    →  ${CYAN}http://localhost:8080${RESET}"
echo -e "  📅 Calendar   →  ${CYAN}http://localhost:8081${RESET}"
echo -e "  💊 Pharmacy   →  ${CYAN}http://localhost:8082${RESET}"
echo -e "  📧 Notify     →  ${CYAN}http://localhost:8083${RESET}"
echo -e "  📋 Records    →  ${CYAN}http://localhost:8084${RESET}"
echo ""
echo -e "  Run ${YELLOW}docker compose logs -f${RESET} to tail all logs."
echo -e "  Run ${YELLOW}docker compose down${RESET} to stop all services."
echo ""
