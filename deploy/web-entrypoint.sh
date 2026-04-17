#!/bin/sh
set -eu

if [ -z "${BASIC_AUTH_USER:-}" ] || [ -z "${BASIC_AUTH_PASSWORD:-}" ]; then
  echo "BASIC_AUTH_USER and BASIC_AUTH_PASSWORD are required." >&2
  exit 1
fi

printf '%s:%s\n' "$BASIC_AUTH_USER" "$(openssl passwd -apr1 "$BASIC_AUTH_PASSWORD")" \
  > /etc/nginx/.htpasswd

exec nginx -g 'daemon off;'
