#!/usr/bin/env bash
set -euo pipefail

# deploy_render.sh
# Uso: preencha as variáveis abaixo ou exporte-as no ambiente e rode:
#   RENDER_API_KEY=... RENDER_SERVICE_ID=... MONGO_URI=... JWT_SECRET=... ./deploy_render.sh

API_BASE="https://api.render.com/v1"

RENDER_API_KEY="${RENDER_API_KEY:-}"
RENDER_SERVICE_ID="${RENDER_SERVICE_ID:-}"
MONGO_URI="${MONGO_URI:-}"
MONGO_DB_NAME="${MONGO_DB_NAME:-bustrack}"
JWT_SECRET="${JWT_SECRET:-}"

err() { echo "ERROR: $*" >&2; exit 1; }

[ -n "$RENDER_API_KEY" ] || err "Defina RENDER_API_KEY (export RENDER_API_KEY=...)"
[ -n "$RENDER_SERVICE_ID" ] || err "Defina RENDER_SERVICE_ID (export RENDER_SERVICE_ID=...)"
[ -n "$MONGO_URI" ] || err "Defina MONGO_URI (export MONGO_URI=...)"
[ -n "$JWT_SECRET" ] || err "Defina JWT_SECRET (export JWT_SECRET=...)"

AUTH_HDR=( -H "Authorization: Bearer ${RENDER_API_KEY}" -H "Content-Type: application/json" )

create_env_var() {
  local key="$1"; shift
  local value="$1"; shift
  echo "-> Criando/atualizando env var: $key"
  curl -sS "${AUTH_HDR[@]}" -X POST "${API_BASE}/services/${RENDER_SERVICE_ID}/env-vars" \
    -d "{\"key\":\"${key}\",\"value\":\"$(echo "$value" | jq -Rs .)\",\"secure\":true}" \
    | jq -C . || true
}

echo "Configuração de variáveis de ambiente no serviço Render: ${RENDER_SERVICE_ID}"

create_env_var "MONGO_URI" "$MONGO_URI"
create_env_var "MONGO_DB_NAME" "$MONGO_DB_NAME"
create_env_var "JWT_SECRET" "$JWT_SECRET"

echo "Acionando deploy no serviço Render..."
DEPLOY_RESP=$(curl -sS "${AUTH_HDR[@]}" -X POST "${API_BASE}/services/${RENDER_SERVICE_ID}/deploys" -d '{}') || true
echo "$DEPLOY_RESP" | jq -C . || echo "$DEPLOY_RESP"

echo "Pronto. Acesse o painel do Render para acompanhar o build e logs do deploy."
