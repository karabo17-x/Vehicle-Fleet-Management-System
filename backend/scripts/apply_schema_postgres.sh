#!/usr/bin/env bash
# Apply the repository's Postgres schema to a running Postgres instance.
# Usage: ./apply_schema_postgres.sh <psql_connection_string>
# Example: ./apply_schema_postgres.sh "postgresql://vfms_user:vfms_pass@localhost:5432/vfms"

set -euo pipefail

CONN=${1:-}
if [ -z "$CONN" ]; then
  echo "Usage: $0 <psql_connection_string>"
  echo "Example: $0 postgresql://vfms_user:vfms_pass@localhost:5432/vfms"
  exit 2
fi

# Wait for the DB to be ready
echo "Waiting for Postgres to be ready..."
until psql "$CONN" -c 'select 1' >/dev/null 2>&1; do
  sleep 1
done

echo "Applying schema from backend/db/schema.sql"
psql "$CONN" -f backend/db/schema.sql

echo "Schema applied."
