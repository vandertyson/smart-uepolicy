#!/bin/bash

# Reinitialize database schema (useful for development)
# Usage: bash scripts/migrate-db.sh

echo "📊 Applying database schema..."

DB_FILE=".db/smart-uepolicy.db"

if [ ! -f "$DB_FILE" ]; then
	echo "❌ Database not found at $DB_FILE"
	echo "Run: bash scripts/init-db.sh"
	exit 1
fi

sqlite3 "$DB_FILE" < schema/ursp.sql

echo ""
echo "✅ Database schema applied!"
echo ""
echo "Ready to start development:"
echo "npm run dev"
