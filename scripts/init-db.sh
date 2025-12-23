#!/bin/bash

# Initialize local SQLite database for development
# This creates a .db file that can be used with D1 locally

echo "🗄️  Creating local SQLite database..."

# Check if sqlite3 is available
if ! command -v sqlite3 &> /dev/null; then
	echo "❌ sqlite3 is not installed"
	echo "Please install: apt-get install sqlite3"
	exit 1
fi

# Create database directory
mkdir -p .db

# Create database file
DB_FILE=".db/smart-uepolicy.db"

if [ -f "$DB_FILE" ]; then
	echo "Database already exists at $DB_FILE"
	read -p "Overwrite? (y/n) " -n 1 -r
	echo
	if [[ ! $REPLY =~ ^[Yy]$ ]]; then
		exit 1
	fi
fi

# Initialize database with schema
sqlite3 "$DB_FILE" < schema/ursp.sql

echo "✅ Database created at $DB_FILE"
echo ""
echo "To use with wrangler during development:"
echo "export WRANGLER_D1_LOCAL_DB_FILE=$DB_FILE"
echo "npm run dev"
