"""Adds ?v=<short hash> to the css/js files each page loads, so phones fetch the new file right after an update
instead of showing an old cached look. Run after every change to theme.css, site.js, offers.js or digitals.js (build_all.sh does this)."""
import re, glob, hashlib, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
files = ['theme.css', 'site.js', 'offers.js', 'offers-art.js', 'digitals.js', 'arrows.js']
ver = {f: hashlib.md5(open(f, 'rb').read()).hexdigest()[:8] for f in files if os.path.exists(f)}
n = 0
for page in glob.glob('*.html'):
    if page in ('offer.html', 'digital.html'): continue  # templates: the page builders add the versions to the pages they make
    h = open(page, encoding='utf8').read(); o = h
    for f, v in ver.items():
        h = re.sub(r'((?:src|href)=")%s(\?v=[0-9a-f]+)?(")' % re.escape(f), r'\g<1>%s?v=%s\3' % (f, v), h)
    if h != o:
        open(page, 'w', encoding='utf8').write(h); n += 1
print('asset versions set on', n, 'pages', ver)
