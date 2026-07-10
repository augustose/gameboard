#!/usr/bin/env bash
#
# deploy.sh — Interactive build & deploy helper for El Turix Scoreboard
#
# Builds the Vite app and deploys to Firebase Hosting (beta or production),
# then opens the corresponding URL in your browser to test.
#
# Usage:
#   ./deploy.sh            # interactive menu
#   ./deploy.sh beta       # build + deploy to beta + open
#   ./deploy.sh prod       # build + deploy to production (asks to confirm) + open
#   ./deploy.sh build      # build only
#
set -euo pipefail

# --- Config (from .firebaserc / firebase.json) -------------------------------
BETA_URL="https://iturix--beta-4y99s7ys.web.app"
PROD_URL="https://iturix.web.app"
FIREBASE_PROJECT="el-turix-score-2025"

# --- Pretty output -----------------------------------------------------------
BOLD="$(tput bold 2>/dev/null || true)"
DIM="$(tput dim 2>/dev/null || true)"
GREEN="$(tput setaf 2 2>/dev/null || true)"
YELLOW="$(tput setaf 3 2>/dev/null || true)"
BLUE="$(tput setaf 4 2>/dev/null || true)"
RED="$(tput setaf 1 2>/dev/null || true)"
RESET="$(tput sgr0 2>/dev/null || true)"

say()  { echo "${BLUE}${BOLD}▶${RESET} $*"; }
ok()   { echo "${GREEN}✔${RESET} $*"; }
warn() { echo "${YELLOW}⚠${RESET}  $*"; }
err()  { echo "${RED}✗${RESET} $*" >&2; }

# Always run from the project root (the dir this script lives in).
cd "$(dirname "$0")"

# --- Cross-platform "open in browser" ----------------------------------------
open_url() {
  local url="$1"
  say "Opening ${BOLD}${url}${RESET}"
  if command -v open >/dev/null 2>&1; then
    open "$url"                     # macOS
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 # Linux
  else
    warn "Couldn't auto-open a browser. Visit: $url"
  fi
}

# --- Preflight checks --------------------------------------------------------
preflight() {
  if ! command -v firebase >/dev/null 2>&1; then
    err "Firebase CLI not found. Install it with:  npm i -g firebase-tools"
    exit 1
  fi
  # Warn (don't block) if there are uncommitted changes — you might be shipping WIP.
  if [[ -n "$(git status --porcelain 2>/dev/null || true)" ]]; then
    warn "Working tree has uncommitted changes — you may be deploying un-committed work."
  fi
  local branch commit
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  commit="$(git rev-parse --short HEAD 2>/dev/null || echo '?')"
  echo "${DIM}   project : ${FIREBASE_PROJECT}${RESET}"
  echo "${DIM}   branch  : ${branch} @ ${commit}${RESET}"
}

# --- Steps -------------------------------------------------------------------
build() {
  say "Building (npm run build) — regenerates dist/ …"
  npm run build
  ok "Build complete → dist/"
}

deploy_beta() {
  build
  say "Deploying to ${BOLD}BETA${RESET} preview channel …"
  # Beta is a Firebase Hosting *preview channel* (temporary URL), not a separate
  # site/target — so it uses `hosting:channel:deploy`, not `deploy --only hosting:beta`.
  local out url
  out="$(firebase hosting:channel:deploy beta --expires 30d 2>&1)"
  echo "$out"
  # Parse the channel URL from the command output; fall back to the known beta URL.
  url="$(printf '%s\n' "$out" | grep -oE 'https://[a-z0-9.-]+--beta[a-z0-9.-]*\.web\.app' | head -1)"
  [[ -z "$url" ]] && url="$BETA_URL"
  ok "Deployed to beta channel."
  open_url "$url"
}

deploy_prod() {
  build
  echo
  warn "You are about to deploy to ${BOLD}PRODUCTION${RESET}: ${PROD_URL}"
  read -r -p "   Type 'yes' to continue: " confirm
  if [[ "$confirm" != "yes" ]]; then
    warn "Production deploy cancelled."
    return
  fi
  say "Deploying to ${BOLD}PRODUCTION${RESET} …"
  firebase deploy --only hosting:main
  ok "Deployed to production."
  open_url "$PROD_URL"
}

# beta first, then (after you confirm it looks good) production
deploy_beta_then_prod() {
  deploy_beta
  echo
  read -r -p "   Beta looks good — promote to PRODUCTION now? [y/N] " go
  if [[ "$go" =~ ^[Yy]$ ]]; then
    deploy_prod
  else
    warn "Stopped after beta. Run again and pick production when ready."
  fi
}

# --- Menu --------------------------------------------------------------------
menu() {
  echo
  echo "${BOLD}El Turix — Build & Deploy${RESET}"
  preflight
  echo
  echo "  ${BOLD}1${RESET}) Build + deploy to ${GREEN}beta${RESET}      (test URL)"
  echo "  ${BOLD}2${RESET}) Build + deploy to ${YELLOW}production${RESET} (iturix.web.app)"
  echo "  ${BOLD}3${RESET}) Beta first, then promote to production"
  echo "  ${BOLD}4${RESET}) Build only (no deploy)"
  echo "  ${BOLD}q${RESET}) Quit"
  echo
  read -r -p "Choose [1-4/q]: " choice
  case "$choice" in
    1) deploy_beta ;;
    2) deploy_prod ;;
    3) deploy_beta_then_prod ;;
    4) build ;;
    q|Q) echo "Bye 👋"; exit 0 ;;
    *) err "Invalid choice: $choice"; exit 1 ;;
  esac
}

# --- Entry point -------------------------------------------------------------
case "${1:-}" in
  beta)  preflight; deploy_beta ;;
  prod|production) preflight; deploy_prod ;;
  build) preflight; build ;;
  "")    menu ;;
  *)     err "Unknown argument: $1"; echo "Usage: ./deploy.sh [beta|prod|build]"; exit 1 ;;
esac
