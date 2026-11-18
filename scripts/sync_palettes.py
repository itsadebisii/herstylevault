#!/usr/bin/env python3
"""Apply data/palettes.master.json (the single source of truth for the 12 color palettes) to:
     - netlify/functions/lib/knowledge.js   (the Signature report generator)
     - each stylist tool's index.html        (colorData + arch swatch images)
   Usage: python3 scripts/sync_palettes.py <tool-index.html> [<tool-index.html> ...]
   Run with no arguments to update only knowledge.js.
   To change a color: edit data/palettes.master.json, then re-run this script and commit each repo."""
import json, re, sys, io, base64, os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = json.load(open(os.path.join(ROOT, 'data', 'palettes.master.json')))

RENAMES = [('Grass Green','Kelly Green'),('Lemon Yellow','Butter Yellow'),('Pumpkin','Terracotta'),('Mustard','Honey Gold'),
           ('Powder Blue-Gray','Slate Blue'),('Taupe Rose','Rosewood'),('Bright Periwinkle','Cobalt Blue'),('Hot Pink','Magenta'),
           ('Deep Fuchsia','Deep Orchid'),('Fuchsia','Orchid'),('Pewter','Smoked Gray')]

def js_arr(items):
    return '[' + ','.join("{n:'%s',h:'%s'}" % (x['n'].replace("'", "\\'"), x['h'].lower()) for x in items) + ']'

def arch_png(hexcolor):
    """160x176 arch swatch with a 4px warm-taupe (#CDBBA8) border, same look as the existing swatches."""
    S = 4; W, H = 160 * S, 176 * S
    def arch(inset, fill):
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        x0, x1, y0, y1 = inset, W - inset, inset, H - inset
        r = (x1 - x0) // 2
        d.rectangle([x0, y0 + r, x1 - 1, y1 - 1], fill=fill)
        d.pieslice([x0, y0, x1 - 1, y0 + 2 * r], 180, 360, fill=fill)
        return im
    base = arch(0, (0xCD, 0xBB, 0xA8, 255))
    h = hexcolor.lstrip('#'); rgb = tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    inner = arch(4 * S, rgb + (255,))
    base.alpha_composite(inner)
    out = base.resize((160, 176), Image.LANCZOS)
    buf = io.BytesIO(); out.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()

def mask(text):
    """Hide the `avoid:` and `metal:` strings so color words inside them (e.g. 'bright fuchsia', 'pewter') are left as written."""
    saved = []
    def keep(m):
        saved.append(m.group(0)); return '\u0000%d\u0000' % (len(saved) - 1)
    text = re.sub(r"(?:avoid|metal):\s*'(?:[^'\\]|\\.)*'", keep, text)
    return text, saved

def unmask(text, saved):
    return re.sub('\u0000(\\d+)\u0000', lambda m: saved[int(m.group(1))], text)

def rename_names(text):
    for a, b in RENAMES:
        text = text.replace(a, b)
        text = text.replace(a.lower(), b.lower())
    return text

def patch_colordata(src):
    masked, saved = mask(src)
    masked = rename_names(masked)
    src = unmask(masked, saved)
    lines = src.split('\n'); n = 0
    for i, line in enumerate(lines):
        m = re.match(r"^(\s*)(\w+):\s*\{", line)
        if not m or m.group(2) not in MASTER or 'neutrals:' not in line: continue
        p = MASTER[m.group(2)]
        for g in ('neutrals', 'signature', 'accents'):
            line = re.sub(r"%s:\s*\[.*?\](?=\s*,\s*\w+:)" % g, '%s:%s' % (g, js_arr(p[g])), line, count=1)
        line = re.sub(r"avoidSwatches:\s*\[.*?\]\s*,\s*", '', line)
        line = re.sub(r"(avoid:\s*'(?:[^'\\]|\\.)*')", lambda mm: mm.group(1) + ',avoidSwatches:' + js_arr(p['avoidSwatches']), line, count=1)
        lines[i] = line; n += 1
    return '\n'.join(lines), n

def patch_swatches(src):
    key = 'const SWATCH_SHAPES='
    i = src.find(key)
    if i < 0: return src, 0
    start = i + len(key); depth = 0; j = start
    while True:
        c = src[j]
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: break
        j += 1
    out = {}; cache = {}
    for season, p in MASTER.items():
        out[season] = {}
        for g in ('neutrals', 'signature', 'accents'):
            for c in p[g]:
                if c['n'] in out[season] and cache.get((season, c['n'])) != c['h']:
                    raise SystemExit('duplicate color name with a different hex in %s: %s' % (season, c['n']))
                cache[(season, c['n'])] = c['h']
                out[season][c['n']] = arch_png(c['h'])
    return src[:start] + json.dumps(out, separators=(',', ':')) + src[j + 1:], sum(len(v) for v in out.values())

def main(paths):
    kj = os.path.join(ROOT, 'netlify', 'functions', 'lib', 'knowledge.js')
    s = open(kj).read(); s, n = patch_colordata(s); open(kj, 'w').write(s)
    print('knowledge.js: %d season blocks updated' % n)
    for p in paths:
        s = open(p).read(); s, n = patch_colordata(s); s, sw = patch_swatches(s); open(p, 'w').write(s)
        print('%s: %d season blocks, %d swatch images' % (p, n, sw))

if __name__ == '__main__':
    main(sys.argv[1:])
