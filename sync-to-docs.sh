#!/bin/bash
# Sync public folder to docs folder for GitHub Pages deployment
# Excludes CNAME file to preserve custom domain configuration

rsync -av --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'CNAME' \
  public/ docs/

echo "✓ Synced public/ to docs/ (CNAME preserved)"
