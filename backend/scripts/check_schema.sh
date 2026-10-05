#!/usr/bin/env bash
# Simple verification script that prints row counts for key tables.
# Usage: ./check_schema.sh <psql_connection_string>

set -euo pipefail
CONN=${1:-}
if [ -z "$CONN" ]; then
  echo "Usage: $0 <psql_connection_string>"
  exit 2
fi

echo "Checking tables in target database..."
psql "$CONN" -c "\dt public.*"
psql "$CONN" -c "SELECT 'drivers', count(*) FROM drivers;"
psql "$CONN" -c "SELECT 'vehicles', count(*) FROM vehicles;"
psql "$CONN" -c "SELECT 'assignments', count(*) FROM assignments;"
psql "$CONN" -c "SELECT 'maintenance_records', count(*) FROM maintenance_records;"
psql "$CONN" -c "SELECT 'audit_logs', count(*) FROM audit_logs;"

echo "Done."
