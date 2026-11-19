"""Share-preview tags (the picture, title and text that show when a link is texted or posted).
Every public page gets its own 1200x630 card from images/share/ plus Open Graph and Twitter tags.
Run after build_product_pages.js:  python3 scripts/seo_share.py   (safe to re-run)"""
import re, html, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SITE = 'https://herstylevault.com'
CARD = {'index.html': 'home', 'about.html': 'about', 'book.html': 'book', 'packages.html': 'packages', 'services.html': 'services',
        'shop.html': 'shop', 'vault-digitals.html': 'vault-digitals', 'lookbook.html': 'lookbook', 'locations.html': 'locations',
        'faq.html': 'faq', 'how-it-works.html': 'how-it-works', 'what-to-expect.html': 'what-to-expect',
        'what-to-expect-services.html': 'what-to-expect-services', 'policies.html': 'policies',
        'digital-signature-style-report.html': 'digital-signature-style-report',
        'digital-wardrobe-detox-series.html': 'digital-wardrobe-detox-series',
        'digital-coloring-book.html': 'digital-coloring-book'}
for f, card in CARD.items():
    h = open(f, encoding='utf8').read(); o = h
    title = re.search(r'<title>(.*?)</title>', h, re.S).group(1).strip()
    desc = re.search(r'<meta name="description" content="(.*?)"', h).group(1)
    img = '%s/images/share/%s.jpg' % (SITE, card)
    alt = html.escape(re.sub(r'^HerStyleVault \| ', '', re.sub(r'\s*\|\s*HerStyleVault$', '', html.unescape(title))) + ' | HerStyleVault', quote=True)
    for pat in (r'<meta property="og:image[^>]*>\n?', r'<meta name="twitter:[^>]*>\n?', r'<meta property="og:site_name"[^>]*>\n?'):
        h = re.sub(pat, '', h)
    tags = ('<meta property="og:image" content="%s">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            '<meta property="og:image:alt" content="%s">\n<meta property="og:site_name" content="HerStyleVault">\n'
            '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="%s">\n'
            '<meta name="twitter:description" content="%s">\n<meta name="twitter:image" content="%s">\n') % (img, alt, html.escape(html.unescape(title), quote=True), desc, img)
    m = re.search(r'<meta property="og:url"[^>]*>\n?', h)
    h = h[:m.end()] + tags + h[m.end():] if m else h.replace('</head>', tags + '</head>', 1)
    if h != o:
        open(f, 'w', encoding='utf8').write(h); print('share tags:', f)
