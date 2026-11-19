"""Injects the new-report look into a stylist tool (single index.html).
Usage: python3 apply_kit.py /path/to/tool/index.html
Re-running is safe: the kit is replaced, not duplicated."""
import re, sys, io, base64
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
src = (REPO / 'analysis-results.html').read_text()
know = (REPO / 'netlify/functions/lib/knowledge.js').read_text()

# 1) the report engine (from the Signature Report page)
a = src.index('function esc(s){')
b = src.index('function buildPages(r){')
engine = src[a:b]
assert engine.count('  return L;\n}') == 1
engine = engine.replace('  return L;\n}', "  return L.filter(b=>b.key!=='silh'&&b.key!=='fab');\n}")
old_g = """'<h1 class="pdf-h1" style="margin-top:0;">Accessories &amp; <em>Avoid</em></h1><p class="pdf-section-label" style="margin-top:0;">Accessory Color Guide</p><div class="pdf-box">'+esc(r.accessory)+'</div><div class="pdf-two">"""
assert engine.count(old_g) == 1
engine = engine.replace(old_g, """'<h1 class="pdf-h1" style="margin-top:0;">Colors to <em>Avoid</em></h1><div class="pdf-two">""")
head_old = "Signature Style Report \\u00b7 '+esc((REPORT&&REPORT.clientName)||'HerStyleVault')+'"
assert engine.count(head_old) == 1
engine = engine.replace(head_old, "'+(window.HSV_HEAD||'Style Analysis')+' \\u00b7 HerStyleVault")

# 2) bullets and color profile (same wording as the Signature Report)
k1 = know.index('function cap1(t)')
k2 = know.index('const SEASON_FAMILY')
knowl = know[k1:k2]

# 3) cover art with the "Vault Digitals" label removed (the tool puts its own label there)
im = Image.open(REPO / 'images/report-cover-bg.jpg').convert('RGB')
W, H = im.size
# paint the old label out with a clean strip of paper taken from the top margin (keeps the paper texture)
x0, x1 = int(W * 0.12), int(W * 0.88)
y0, hh = int(H * 0.030), int(H * 0.042)
im.paste(im.crop((x0, 0, x1, hh)), (x0, y0))
buf = io.BytesIO(); im.save(buf, 'JPEG', quality=82, optimize=True)
cover = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

glue = (HERE / 'glue.js').read_text()
glue = glue.replace('/*__ENGINE__*/', engine).replace('/*__KNOW__*/', knowl).replace('__COVER__', cover)

# 4) the report's PDF styles (+ cover label)
c1 = src.index('.pdf-page{width:816px')
c2 = src.index('.pdf-credit{')
c2 = src.index('\n', c2)
css = src[c1:c2] + "\n.pdf-cover-label{position:absolute;left:0;right:0;top:36px;text-align:center;font-size:0.82rem;letter-spacing:0.3em;text-transform:uppercase;color:#3F3C38;}\n.pdf-closing .pdf-more-top{margin-top:1.4rem;}\n.pdf-list li{background:#ECE8E2;border:none;border-radius:16px;padding:0.4rem 1rem 0.4rem 2.2rem;margin:0 0 6px;position:relative;font-size:0.78rem;line-height:1.45;color:#3F3C38;}\n.pdf-list li::before{content:'';position:absolute;left:0.95rem;top:0.82rem;width:8px;height:8px;border-radius:50%;background:#7A1321;}\n"

p = Path(sys.argv[1])
h = p.read_text()
h = re.sub(r'<style id="hsv-kit-css">.*?</style>\n?', '', h, flags=re.S)
h = re.sub(r'<script id="hsv-kit">.*?</script>\n?', '', h, flags=re.S)
assert h.count('</head>') == 1
h = h.replace('</head>', '<style id="hsv-kit-css">\n' + css + '\n</style>\n</head>')
i = h.rindex('</body>')
h = h[:i] + '<script id="hsv-kit">\n' + glue + '\n</script>\n' + h[i:]
call_old, call_new = 'const pagesHtml=buildPdfPages();', 'const pagesHtml=await buildPdfPagesNew();'
if call_old in h:
    h = h.replace(call_old, call_new)
assert call_new in h, 'export call not found'
p.write_text(h)
print('kit applied to', p, '| css', len(css), 'js', len(glue))
