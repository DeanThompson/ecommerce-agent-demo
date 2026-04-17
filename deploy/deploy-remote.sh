#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${1:-your-server-host}"
REMOTE_DIR="${2:-~/apps/ecommerce-agent}"

if [ ! -f ".env" ]; then
  echo "Error: .env not found in current directory." >&2
  exit 1
fi

if [ ! -f "data/ecommerce.duckdb" ]; then
  echo "Error: data/ecommerce.duckdb not found." >&2
  exit 1
fi

echo "Copying .env to ${REMOTE_HOST}:${REMOTE_DIR}/.env ..."
scp .env "${REMOTE_HOST}:${REMOTE_DIR}/.env"

echo "Copying database to ${REMOTE_HOST}:${REMOTE_DIR}/data/ecommerce.duckdb ..."
scp data/ecommerce.duckdb "${REMOTE_HOST}:${REMOTE_DIR}/data/ecommerce.duckdb"

echo "Ensuring session directory exists on ${REMOTE_HOST} ..."
ssh "${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}/data/sessions"

echo "Deploying on ${REMOTE_HOST} ..."
ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && git pull && docker compose up -d --build"

echo "Done."
