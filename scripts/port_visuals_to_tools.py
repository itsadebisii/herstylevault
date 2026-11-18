#!/usr/bin/env python3
"""Give the three stylist tools the same visual question cards as the Signature quiz.
   Reads the shared art, palettes and age-bracketed persona wording from color-style-analysis.html and injects a
   controller (between HSV-VISUAL-CARDS markers) into each tool's index.html. Safe to re-run.
   Usage: python3 scripts/port_visuals_to_tools.py <tool-index.html> [...]"""
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
quiz = open(os.path.join(ROOT, 'color-style-analysis.html')).read()

def grab(start, end):
    a = quiz.index(start); b = quiz.index(end, a)
    return quiz[a:b]

ART_ICONS = re.search(r'const ART_ICONS = \{.*?\};\n', quiz, re.S).group(0)
VEINS = grab('function veinsSvg', '\nconst SHAPE_SVGS') if '\nconst SHAPE_SVGS' in quiz[quiz.index('function veinsSvg'):] else re.search(r'function veinsSvg.*?\n}\n', quiz, re.S).group(0)
VEINS = re.search(r'function veinsSvg.*?\n}\n', quiz, re.S).group(0)
PERSONA = grab('const PERSONA_OPTS = {', 'function personaOptions')
ART = grab('const CAR = {};', 'const VISUAL = {')
CSS = re.search(r'\.vc\{text-align:center.*?\.vc-vein svg\{[^}]*\}\n', quiz, re.S).group(0)

CONTROLLER = r'''
const VCARD_KEYMAP = { style: 'styleGrav', dress: 'dressSep' };
const VCARD_VISUAL = {
  jewelry: v => artMetal(v),
  veins: 'veins',
  comp: v => v === 'unsure' ? artSw([]).replace('</div>', QMARK + '</div>') : (v === 'all' ? artSw(['#e07a3f', '#4f6fb3', '#d98ab0', '#5f7a3a']) : artSw(COMP_SW[v])),
  wash: v => artSw(WASH_SW[v]),
  depth: 'depth', contrast: 'contrast',
  chroma: v => artSw(CHROMA_SW[v]),
  styleGrav: v => artIcons(STYLE_ART[v] || []),
  dressSep: v => artIcons(SEP_ART[v] || []),
  shoulderHip: v => artCroq(SH_MAP[v] || ['hourglass', 0]),
  waistDef: v => artCroq(WD_MAP[v] || ['hourglass', 0]),
  bustHip: v => artCroq(BH_MAP[v] || ['hourglass', 0]),
  proportion: v => artProportion(v),
  pq1: v => artIcons(PQ1_ART[v] || []),
  pq2: v => artIcons(PQ2_ART[v] || []),
  pq3: v => artIcons(PQ3_ART[v] || [])
};
const VCARD_STATE = {};
function vcStore(card) { return card.closest('#sec-color') ? CA : BA; }
function vcAge() { return ['18-24', '25-34', '35-44', '45+'].indexOf(BA.ageBracket) > -1 ? BA.ageBracket : '25-34'; }
function vcGroup() { return CAR._group || ((CA.depth === 'fair' || CA.depth === 'medium') ? 'light' : (CA.depth ? 'deep' : 'light')); }
function vcItems(card, key, vk) {
  const btns = [...card.querySelectorAll('.qopts .qopt')].map(b => ({ b, val: ((b.getAttribute('onclick') || '').match(/'\w+','([^']+)'\)/) || [])[1], label: b.textContent.trim() }));
  const v = VCARD_VISUAL[vk];
  if (vk === 'depth') return btns.map(x => { const d = DEPTH_ITEMS.find(o => o.value === x.val) || DEPTH_ITEMS[0]; return { value: x.val, btn: x.b, label: x.label, art: '<div class="vc-sw">' + ARCH(d.hex).replace('class="vc-arch"', 'class="vc-arch vc-arch-xl"') + '</div>' }; });
  if (vk === 'contrast') return btns.map(x => { const set = CONTRAST_SETS[vcGroup()].items.find(o => o.value === x.val); return { value: x.val, btn: x.b, label: set ? set.label : x.label, art: set ? '<div class="vc-sw vc-sw-demo">' + set.colors.map(ARCH).join('') + '</div>' : '' }; });
  if (vk === 'veins') { const g = VEIN_SETS[vcGroup()]; return btns.map(x => ({ value: x.val, btn: x.b, label: VEIN_LABELS[x.val] || x.label, art: '<div class="vc-vein">' + veinsSvg(g.bg, g.strokes[x.val] || g.strokes.both) + '</div>' })); }
  return btns.map(x => {
    let label = x.label;
    if (PERSONA_OPTS[key] && PERSONA_OPTS[key][x.val]) { label = PERSONA_OPTS[key][x.val].labels[vcAge()]; x.b.textContent = label; }
    return { value: x.val, btn: x.b, label, art: v(x.val) };
  });
}
function vcRender(card) {
  const key = card.dataset.vcKey, vk = card.dataset.vcVisual, host = card.querySelector('.vc-host');
  const items = vcItems(card, key, vk), cur = vcStore(card)[key];
  let i = VCARD_STATE[key]; if (i == null || i >= items.length) i = Math.max(0, items.findIndex(x => x.value === cur));
  VCARD_STATE[key] = i;
  const it = items[i], sel = cur === it.value;
  const grouped = vk === 'veins' || vk === 'contrast';
  const toggle = grouped ? '<div class="vc-group">' + ['light', 'deep'].map(g => '<button type="button" class="vc-gbtn ' + (vcGroup() === g ? 'on' : '') + '" data-group="' + g + '">' + (g === 'deep' ? 'Deeper skin tones' : 'Lighter skin tones') + '</button>').join('') + '</div>' : '';
  host.innerHTML = toggle + '<div class="vc-frame"><button type="button" class="vc-arrow" data-dir="-1" aria-label="Previous option">←</button><div class="vc-art" data-cycle="1" role="button" tabindex="0">' + it.art + '</div><button type="button" class="vc-arrow" data-dir="1" aria-label="Next option">→</button></div>'
    + '<p class="vc-count">' + (i + 1) + ' / ' + items.length + '</p><p class="vc-desc">' + it.label + '</p>'
    + '<button type="button" class="vc-pick ' + (sel ? 'on' : '') + '" data-pick="' + it.value + '">' + (sel ? 'Selected ✓' : 'This is me') + '</button>';
  host._items = items;
}
function vcRecomputeWeight() {
  const all = BA.weightAll || []; if (!all.length) return;
  let pick = all[0];
  try { if (BA.shoulderHip && BA.waistDef && BA.bustHip) { const shape = computeBodyShape(BA); const hit = all.find(w => bodyMarkerMatch(shape, { weight: w, fit: BA.fit }).weight); if (hit) pick = hit; } } catch (e) {}
  BA.weight = pick;
}
function vcBuildWeight(card) {
  card.classList.add('vc-card');
  const btns = [...card.querySelectorAll('.qopts .qopt')];
  const wrap = document.createElement('div'); wrap.className = 'vc-multi';
  wrap.innerHTML = '<p class="vc-multi-hint">Choose all that apply</p>' + btns.map(b => { const val = (b.getAttribute('onclick').match(/'\w+','([^']+)'\)/) || [])[1]; return '<button type="button" class="vc-mbtn" data-val="' + val + '">' + b.textContent.trim() + '</button>'; }).join('');
  card.querySelector('.qopts').style.display = 'none'; card.appendChild(wrap);
  wrap.addEventListener('click', e => {
    const m = e.target.closest('.vc-mbtn'); if (!m) return;
    let cur = (BA.weightAll || []).slice(); const v = m.dataset.val, at = cur.indexOf(v);
    if (at > -1) cur.splice(at, 1); else if (v === 'evenly') cur = ['evenly']; else { cur = cur.filter(x => x !== 'evenly'); cur.push(v); }
    BA.weightAll = cur; vcRecomputeWeight();
    wrap.querySelectorAll('.vc-mbtn').forEach(b => b.classList.toggle('on', cur.indexOf(b.dataset.val) > -1));
    btns.forEach(b => { const val = (b.getAttribute('onclick').match(/'\w+','([^']+)'\)/) || [])[1]; b.classList.toggle('sel', cur.indexOf(val) > -1); });
    if (!cur.length) delete BA.weight;
  });
}
function vcInit() {
  if (document.body.dataset.vcDone) return; document.body.dataset.vcDone = '1';
  document.querySelectorAll('.qcard').forEach(card => {
    const first = card.querySelector('.qopts .qopt'); if (!first) return;
    const key = ((first.getAttribute('onclick') || '').match(/sel\(this,'(\w+)'/) || [])[1]; if (!key) return;
    if (key === 'weight') { vcBuildWeight(card); return; }
    const vk = VCARD_KEYMAP[key] || key; if (!VCARD_VISUAL[vk]) return;
    card.classList.add('vc-card'); card.dataset.vcKey = key; card.dataset.vcVisual = vk;
    card.querySelector('.qopts').style.display = 'none';
    const host = document.createElement('div'); host.className = 'vc vc-host'; card.appendChild(host);
    host.addEventListener('click', e => {
      const items = host._items || [], n = items.length;
      const dir = e.target.closest('[data-dir]'), art = e.target.closest('.vc-art'), pick = e.target.closest('[data-pick]'), grp = e.target.closest('[data-group]');
      if (dir) { VCARD_STATE[key] = (VCARD_STATE[key] + parseInt(dir.dataset.dir, 10) + n) % n; vcRender(card); }
      else if (pick) { const it = items.find(x => x.value === pick.dataset.pick); if (it) { it.btn.click(); vcRefreshAll(); } }
      else if (grp) { CAR._group = grp.dataset.group; vcRender(card); }
      else if (art) { VCARD_STATE[key] = (VCARD_STATE[key] + 1) % n; vcRender(card); }
    });
    let x0 = null;
    host.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    host.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) { const n = (host._items || []).length; VCARD_STATE[key] = (VCARD_STATE[key] + (dx < 0 ? 1 : n - 1)) % n; vcRender(card); } });
    vcRender(card);
  });
}
function vcRefreshAll() { document.querySelectorAll('.vc-card[data-vc-key]').forEach(vcRender); }
(function () {
  const _sel = window.sel;
  if (typeof _sel === 'function') window.sel = function (b, k, v) { _sel(b, k, v); vcRecomputeWeight(); setTimeout(vcRefreshAll, 0); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vcInit); else vcInit();
})();
'''

TOOLCSS = CSS + '''
.vc-card .vc{max-width:520px;margin:0.6rem auto 0.2rem;}
.vc-card .vc-art{height:280px;}
.vc-multi{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;}
.vc-multi-hint{flex-basis:100%;font-size:0.62rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-light);}
.vc-mbtn{padding:0.4rem 1rem;border:1px solid rgba(201,160,154,0.3);font-size:0.72rem;color:var(--text-mid);cursor:pointer;background:var(--cream);font-family:'Plus Jakarta Sans',sans-serif;}
.vc-mbtn.on{background:var(--pkg);color:#fff;border-color:var(--pkg);}
'''
# the quiz css uses var(--font-display/--font-body/--bg/--surface/--ink...) -> give the tools fallbacks
TOOLCSS = TOOLCSS.replace('var(--font-display)', "'Cormorant Garamond',serif").replace('var(--font-body)', "'Plus Jakarta Sans',sans-serif")

BLOCK = ('\n<!-- HSV-VISUAL-CARDS:start -->\n<style>' + TOOLCSS + '</style>\n<script>\n' + ART_ICONS + VEINS + PERSONA + ART + CONTROLLER + '</script>\n<!-- HSV-VISUAL-CARDS:end -->\n')

def patch(path):
    s = open(path).read()
    s = re.sub(r'\n<!-- HSV-VISUAL-CARDS:start -->.*?<!-- HSV-VISUAL-CARDS:end -->\n', '\n', s, flags=re.S)
    i = s.rindex('</body>')
    s = s[:i] + BLOCK + s[i:]
    open(path, 'w').write(s)
    print('patched', path)

for p in sys.argv[1:]:
    patch(p)

# ---------------------------------------------------------------------------------------------------------
# Results updates shared with the Signature report: avoid swatches in the "Colors to Avoid" card and the
# 45+ "soft, light-reflecting shades near the face" tip (screen + PDF). Package-specific content is untouched.
RESULTS_BLOCK = r'''
<!-- HSV-RESULTS:start -->
<style>
.pdf-avsw{display:flex;gap:10px;margin:0.4rem 0 0.9rem;}.pdf-avsw div{text-align:center;flex:1;}.pdf-avsw i{display:block;width:30px;height:30px;border-radius:50%;margin:0 auto 4px;border:1px solid #CDBBA8;}.pdf-avsw span{display:block;font-size:0.6rem;line-height:1.2;color:#3F3C38;}.pdf-avsw em{display:block;font-style:normal;font-size:0.54rem;color:#8A8378;}
.pdf-tip{margin:0.8rem 0 0;padding:0.7rem 1rem;border-left:3px solid #7A1321;background:#EFECE6;font-size:0.78rem;line-height:1.6;color:#3F3C38;}
.av-sw{display:flex;gap:10px;margin-top:0.7rem;flex-wrap:wrap;}.av-sw div{text-align:center;width:64px;}.av-sw i{display:block;width:28px;height:28px;border-radius:50%;margin:0 auto 3px;border:1px solid #CDBBA8;}.av-sw span{display:block;font-size:0.58rem;line-height:1.2;color:var(--text-mid);}.av-sw em{display:block;font-style:normal;font-size:0.52rem;color:var(--text-light);}
.av-tip{margin-top:0.8rem;padding:0.7rem 1rem;border-left:3px solid var(--pkg);background:rgba(122,19,33,0.05);font-size:0.72rem;line-height:1.6;color:var(--text-mid);}
</style>
<script>
function hsvAvoidSwatches(d, pdf) {
  const sw = (d && d.avoidSwatches) || []; if (!sw.length) return '';
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return '<div class="' + (pdf ? 'pdf-avsw' : 'av-sw') + '">' + sw.slice(0, 4).map(c => '<div><i style="background:' + c.h + '"></i><span>' + esc(c.n) + '</span><em>' + String(c.h).toUpperCase() + '</em></div>').join('') + '</div>';
}
function hsvMatureTip(pdf) {
  if (typeof BA === 'undefined' || BA.ageBracket !== '45+') return '';
  return '<div class="' + (pdf ? 'pdf-tip' : 'av-tip') + '"><strong>Near your face:</strong> choose softer, light-reflecting shades, like champagne, pearl or a soft version of the signature colors. They bounce light back onto the skin and keep the face bright.</div>';
}
function hsvScreenAvoid(d) {
  const el = document.getElementById('avoid-r'); if (!el) return;
  const box = el.parentElement; box.querySelectorAll('.av-sw,.av-tip').forEach(n => n.remove());
  box.insertAdjacentHTML('beforeend', hsvAvoidSwatches(d, false) + hsvMatureTip(false));
}
</script>
<!-- HSV-RESULTS:end -->
'''

def patch_results(path):
    s = open(path).read()
    s = re.sub(r'\n<!-- HSV-RESULTS:start -->.*?<!-- HSV-RESULTS:end -->\n', '\n', s, flags=re.S)
    # screen
    s = s.replace("document.getElementById('avoid-r').textContent=d.avoid;", "document.getElementById('avoid-r').textContent=d.avoid;if(typeof hsvScreenAvoid==='function')hsvScreenAvoid(d);") if 'hsvScreenAvoid(d)' not in s else s
    # pdf: swatches + tip right after the Colors to Avoid box
    a = '<p class="pdf-section-label">Colors to Avoid</p><div class="pdf-box">${pdfEsc(d.avoid)}</div>'
    b = a + '${hsvAvoidSwatches(d,true)}${hsvMatureTip(true)}'
    if 'hsvAvoidSwatches(d,true)' not in s:
        assert s.count(a) == 1, (path, s.count(a)); s = s.replace(a, b)
    i = s.rindex('</body>')
    s = s[:i] + RESULTS_BLOCK + s[i:]
    open(path, 'w').write(s)
    print('results patched', path)

for p in sys.argv[1:]:
    patch_results(p)
