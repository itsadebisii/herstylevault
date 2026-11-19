#!/bin/sh
# Rebuild every generated page and refresh versions. Run from the repo root after editing offers.js, digitals.js, theme.css or site.js.
set -e
node scripts/build_offer_pages.js
node scripts/build_product_pages.js
python3 scripts/seo_share.py
python3 scripts/bump_assets.py
