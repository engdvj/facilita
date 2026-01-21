#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Facilita V2 - One-shot secure deploy/operate script (Linux / Ubuntu)
#
# Usage:
#   ./facilita.sh                  # init (if needed) + up (default)
#   ./facilita.sh up               # build + start (uses secure overrides)
#   ./facilita.sh down             # stop stack
#   ./facilita.sh restart          # restart stack
#   ./facilita.sh status           # show container status
#   ./facilita.sh logs [service]   # follow logs (all or a single service)
#   ./facilita.sh clean            # DANGEROUS: remove containers+volumes+images (asks confirm)
#   ./facilita.sh print-secrets    # show how to retrieve secrets (does not print everything)
#
# What it does for security:
#   - Creates .env (from .env.production/.env.example if present) if missing
#   - Replaces known insecure defaults (postgres password, JWT secrets, superadmin password)
#   - Generates cryptographically strong, URL-safe secrets (avoids breaking DATABASE_URL)
#   - Sets restrictive permissions on .env (chmod 600)
#   - Generates compose.secure.yml to bind DB/Redis/App ports ONLY to 127.0.0.1
#     (so only Nginx is reachable from the LAN)
# -----------------------------------------------------------------------------

set -Eeuo pipefail
IFS=$'\n\t'
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env"
SECURE_COMPOSE_FILE="compose.secure.yml"

# Find compose file (support common names)
COMPOSE_FILE=""
for f in docker-compose.yml docker-compose.yaml compose.yml compose.yaml; do
  if [[ -f "$f" ]]; then
    COMPOSE_FILE="$f"
    break
  fi
done

die() { echo "ERROR: $*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

rand_hex() {
  local bytes="${1:-32}"
  if have openssl; then
    openssl rand -hex "$bytes"
  elif have python3; then
    python3 - <<PY
import secrets
print(secrets.token_hex($bytes))
PY
  else
    die "Need 'openssl' or 'python3' to generate secrets. Install one of them and retry."
  fi
}

# URL-safe random string (A-Za-z0-9_-), deterministic length.
rand_urlsafe() {
  local length="${1:-32}"
  if have python3; then
    python3 - <<PY
import secrets, string
alphabet = string.ascii_letters + string.digits + "-_"
print("".join(secrets.choice(alphabet) for _ in range($length)))
PY
  elif have openssl; then
    # Over-generate and filter to URL-safe characters, then cut to length
    LC_ALL=C tr -dc 'A-Za-z0-9_-' </dev/urandom | head -c "$length" || true
    echo
  else
    die "Need 'python3' or 'openssl' to generate secrets. Install one of them and retry."
  fi
}

# Read KEY from .env (first match)
get_env() {
  local key="$1"
  [[ -f "$ENV_FILE" ]] || return 0
  # shellcheck disable=SC2002
  sed -n "s/^${key}=//p" "$ENV_FILE" | head -n 1 || true
}

# Set/replace KEY=VALUE in .env, removing duplicates.
set_env() {
  local key="$1"
  local val="$2"
  [[ -f "$ENV_FILE" ]] || : > "$ENV_FILE"
  local tmp
  tmp="$(mktemp)"
  awk -v k="$key" -v v="$val" '
    BEGIN { found=0 }
    {
      if ($0 ~ "^"k"=") {
        if (!found) { print k"="v; found=1 }
        next
      }
      print
    }
    END { if (!found) print k"="v }
  ' "$ENV_FILE" > "$tmp"
  mv "$tmp" "$ENV_FILE"
}

ensure_gitignore() {
  # Avoid accidental commit of .env in server clones
  if [[ -f ".gitignore" ]]; then
    if ! grep -qxF ".env" .gitignore; then
      echo ".env" >> .gitignore
    fi
  fi
}

detect_primary_ip() {
  # Best-effort (works on most Ubuntu servers)
  local ip=""
  ip="$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}' || true)"
  if [[ -z "$ip" ]]; then
    ip="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
  fi
  echo "$ip"
}

ensure_dirs() {
  mkdir -p backend/uploads/images \
           backend/uploads/documents \
           backend/backups/auto \
           backend/backups/tmp
}

ensure_secure_compose() {
  # Bind sensitive service ports only to loopback.
  # This does NOT affect container-to-container networking; it only prevents LAN exposure.
  cat > "$SECURE_COMPOSE_FILE" <<'YAML'
services:
  postgres:
    ports:
      - "127.0.0.1:5432:5432"
  redis:
    ports:
      - "127.0.0.1:6379:6379"
  backend:
    ports:
      - "127.0.0.1:3001:3001"
  frontend:
    ports:
      - "127.0.0.1:3000:3000"
YAML
}

ensure_env_secure() {
  local template=""
  if [[ ! -f "$ENV_FILE" ]]; then
    if [[ -f ".env.production" ]]; then
      template=".env.production"
    elif [[ -f ".env.example" ]]; then
      template=".env.example"
    fi

    if [[ -n "$template" ]]; then
      cp "$template" "$ENV_FILE"
    else
      : > "$ENV_FILE"
    fi
  fi

  chmod 600 "$ENV_FILE" || true

  # Only generate/replace known insecure defaults; do NOT rotate values if user already set them.
  local ip nginx_port
  ip="$(detect_primary_ip)"
  nginx_port="$(get_env NGINX_PORT)"
  [[ -n "$nginx_port" ]] || nginx_port="80"

  # Postgres: keep POSTGRES_USER=postgres (your compose healthcheck uses -U postgres).
  if [[ -z "$(get_env POSTGRES_USER)" ]]; then
    set_env POSTGRES_USER "postgres"
  fi
  if [[ -z "$(get_env POSTGRES_DB)" ]]; then
    set_env POSTGRES_DB "facilita_v2"
  fi
  local pg_pwd
  pg_pwd="$(get_env POSTGRES_PASSWORD)"
  if [[ -z "$pg_pwd" || "$pg_pwd" == "postgres" ]]; then
    # Use URL-safe password because it is embedded in DATABASE_URL without URL-encoding.
    set_env POSTGRES_PASSWORD "$(rand_hex 24)"
    export _FACILITA_PG_PWD_GENERATED=1
  fi

  # JWT secrets
  local jwt_access jwt_refresh
  jwt_access="$(get_env JWT_ACCESS_SECRET)"
  jwt_refresh="$(get_env JWT_REFRESH_SECRET)"
  if [[ -z "$jwt_access" || "$jwt_access" == "facilita-jwt-access-secret-change-me" ]]; then
    set_env JWT_ACCESS_SECRET "$(rand_hex 32)"
    export _FACILITA_JWT_GENERATED=1
  fi
  if [[ -z "$jwt_refresh" || "$jwt_refresh" == "facilita-jwt-refresh-secret-change-me" ]]; then
    set_env JWT_REFRESH_SECRET "$(rand_hex 32)"
    export _FACILITA_JWT_GENERATED=1
  fi

  # Expiry defaults (safe to set if missing)
  [[ -n "$(get_env JWT_ACCESS_EXPIRES_IN)" ]] || set_env JWT_ACCESS_EXPIRES_IN "15m"
  [[ -n "$(get_env JWT_REFRESH_EXPIRES_IN)" ]] || set_env JWT_REFRESH_EXPIRES_IN "7d"

  # Superadmin defaults (WARNING: do not change after first successful bootstrap unless your app supports rotation)
  [[ -n "$(get_env SUPERADMIN_EMAIL)" ]] || set_env SUPERADMIN_EMAIL "superadmin@facilita.local"
  [[ -n "$(get_env SUPERADMIN_NAME)" ]]  || set_env SUPERADMIN_NAME  "Super Admin"

  local admin_pwd
  admin_pwd="$(get_env SUPERADMIN_PASSWORD)"
  if [[ -z "$admin_pwd" || "$admin_pwd" == "ChangeMe123!" ]]; then
    # URL-safe + includes digits/letters, avoids characters that can break shells/URLs.
    set_env SUPERADMIN_PASSWORD "$(rand_urlsafe 28)A1"
    export _FACILITA_ADMIN_PWD_GENERATED=1
  fi

  # CORS: prefer same-origin; set to VM IP if available.
  local cors
  cors="$(get_env CORS_ORIGIN)"
  if [[ -z "$cors" || "$cors" == "*" ]]; then
    if [[ -n "$ip" ]]; then
      set_env CORS_ORIGIN "http://${ip}:${nginx_port}"
    else
      set_env CORS_ORIGIN "http://localhost:${nginx_port}"
    fi
  fi

  # Cookies (default false unless you configure HTTPS)
  [[ -n "$(get_env COOKIE_SECURE)" ]] || set_env COOKIE_SECURE "false"
  # Ensure the key exists (can stay blank)
  if ! grep -qE '^COOKIE_DOMAIN=' "$ENV_FILE"; then
    set_env COOKIE_DOMAIN ""
  fi

  # Frontend
  [[ -n "$(get_env NEXT_PUBLIC_API_URL)" ]] || set_env NEXT_PUBLIC_API_URL "/api"
  [[ -n "$(get_env NGINX_PORT)" ]] || set_env NGINX_PORT "80"

  ensure_gitignore
}

compose() {
  have docker || die "docker not found. Install Docker Engine + Docker Compose plugin, then retry."
  # Use --env-file explicitly to avoid surprises.
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" -f "$SECURE_COMPOSE_FILE" "$@"
}

print_access_info() {
  local ip port
  ip="$(detect_primary_ip)"
  port="$(get_env NGINX_PORT)"
  [[ -n "$port" ]] || port="80"

  echo
  echo "Stack status:"
  compose ps || true

  echo
  if [[ -n "$ip" ]]; then
    echo "Access (LAN):  http://${ip}:${port}/"
  fi
  echo "Access (local): http://localhost:${port}/"

  # Print key credentials ONLY when freshly generated
  if [[ "${_FACILITA_ADMIN_PWD_GENERATED:-0}" == "1" ]]; then
    echo
    echo "Superadmin credentials (generated now):"
    echo "  Email:    $(get_env SUPERADMIN_EMAIL)"
    echo "  Password: $(get_env SUPERADMIN_PASSWORD)"
    echo "Store this securely. It is saved in ${ENV_FILE}."
  fi

  if [[ "${_FACILITA_PG_PWD_GENERATED:-0}" == "1" ]]; then
    echo
    echo "Postgres password was generated and saved in ${ENV_FILE}."
    echo "Do NOT change POSTGRES_PASSWORD after the database volume is initialized unless you rotate it inside Postgres as well."
  fi

  if [[ "${_FACILITA_JWT_GENERATED:-0}" == "1" ]]; then
    echo
    echo "JWT secrets were generated and saved in ${ENV_FILE}."
  fi
}

usage() {
  cat <<EOF
Usage: $0 [action]

Actions:
  up              Init (if needed) + build + start services (default)
  down            Stop services
  restart         Restart services
  logs [service]  Follow logs (optional service)
  status          Show status
  clean           Remove containers, volumes, and images (DANGEROUS)
  print-secrets   Show commands to view saved secrets

Notes:
  - This script creates/updates .env ONLY to replace known insecure defaults.
  - It generates compose.secure.yml to bind internal ports to 127.0.0.1.
EOF
}

main() {
  [[ -n "$COMPOSE_FILE" ]] || die "No compose file found (docker-compose.yml / compose.yml). Run this from the repo root."

  local action="${1:-up}"
  case "$action" in
    up)
      ensure_dirs
      ensure_env_secure
      ensure_secure_compose
      echo "Starting services..."
      compose up -d --build
      print_access_info
      ;;
    down)
      ensure_env_secure
      ensure_secure_compose
      compose down
      ;;
    restart)
      ensure_env_secure
      ensure_secure_compose
      compose down
      compose up -d --build
      print_access_info
      ;;
    logs)
      ensure_env_secure
      ensure_secure_compose
      compose logs -f "${2:-}"
      ;;
    status)
      ensure_env_secure
      ensure_secure_compose
      compose ps
      ;;
    clean)
      ensure_env_secure
      ensure_secure_compose
      echo "WARNING: This will remove containers, volumes, and images for this project."
      read -r -p "Are you sure? (y/N) " reply
      if [[ "$reply" =~ ^[Yy]$ ]]; then
        compose down -v --rmi all
        echo "Cleanup complete."
      else
        echo "Cancelled."
      fi
      ;;
    print-secrets)
      ensure_env_secure
      chmod 600 "$ENV_FILE" || true
      echo "Secrets are stored in: ${ENV_FILE}"
      echo
      echo "Show superadmin:"
      echo "  grep -E '^SUPERADMIN_(EMAIL|PASSWORD)=' ${ENV_FILE}"
      echo
      echo "Show Postgres password:"
      echo "  grep -E '^POSTGRES_PASSWORD=' ${ENV_FILE}"
      echo
      echo "Show JWT secrets:"
      echo "  grep -E '^JWT_(ACCESS|REFRESH)_SECRET=' ${ENV_FILE}"
      ;;
    -h|--help|help)
      usage
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
