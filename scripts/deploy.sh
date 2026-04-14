#!/bin/bash
# Full deploy: run migrations → build → commit → push → vercel
set -e
eval "$(/opt/homebrew/bin/brew shellenv)"

MSG="${1:-update}"

# Run any new SQL migrations
for f in supabase/migrations/*.sql; do
  echo "→ Running migration: $f"
  supabase db query --linked -f "$f" --workdir /Users/gavintaylor/nasm-study-app 2>&1 || echo "  (already applied or skipped)"
done

# Run any seed files
for f in supabase/seed-*.sql; do
  if [ -f "$f" ]; then
    echo "→ Running seed: $f"
    supabase db query --linked -f "$f" --workdir /Users/gavintaylor/nasm-study-app 2>&1 || echo "  (already applied or skipped)"
  fi
done

echo "→ Building..."
npm run build

echo "→ Committing..."
git add -A
git commit -m "$MSG

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" || echo "Nothing to commit"

echo "→ Pushing..."
git push

echo "→ Deploying to Vercel..."
vercel --prod --yes

echo "✓ All done!"
