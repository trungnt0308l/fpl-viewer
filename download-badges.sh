#!/bin/bash
# Download all Premier League team badges for self-hosting
# Team codes from FPL API 2024/25 season

mkdir -p badges

# All 20 PL team codes
CODES=(1 2 3 4 6 7 8 11 13 14 17 20 21 25 31 34 36 39 43 45 49 54 57 58 80 90 91 94 102)

echo "Downloading Premier League badges..."
for code in "${CODES[@]}"; do
  url="https://resources.premierleague.com/premierleague/badges/t${code}.png"
  echo "  Downloading t${code}.png..."
  curl -sS -o "badges/t${code}.png" "$url"
done

echo ""
echo "Done! Badges saved to ./badges/"
echo "Upload to your R2 bucket:"
echo "  npx wrangler r2 object put fpl-viewer/badges/t\${code}.png --file badges/t\${code}.png"
echo "Or bulk upload:"
echo "  for f in badges/*.png; do npx wrangler r2 object put \"fpl-viewer/\$f\" --file \"\$f\"; done"
