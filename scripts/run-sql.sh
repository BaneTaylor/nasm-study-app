#!/bin/bash
# Run SQL file against remote Supabase database
# Usage: ./scripts/run-sql.sh <sql-file>
set -e
eval "$(/opt/homebrew/bin/brew shellenv)"

FILE="${1:?Usage: ./scripts/run-sql.sh <sql-file>}"
echo "→ Running $FILE against remote database..."
supabase db query --linked -f "$FILE" --workdir /Users/gavintaylor/nasm-study-app
echo "✓ Done!"
