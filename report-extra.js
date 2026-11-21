/* Extra report pages: color wheel with the client's face, palette across the shade range, "put your colors to work",
   hair/makeup/nails, "dress your shape", outfit formulas and patterns.
   Everything is built from the finished report object (palette, shape, shade, quiz directions). No photo is ever stored:
   a photo is only drawn when it is still in memory right after the quiz, otherwise a monogram sits in the middle. */
(function () {
  'use strict';
  function E(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var SKINS = [['porcelain', 'Porcelain', '#f7e1d3'], ['ivory', 'Ivory', '#f3d6c0'], ['fair', 'Fair', '#f0cdb0'], ['light', 'Light', '#e8c29d'], ['beige', 'Beige', '#deb38a'], ['sand', 'Sand', '#d6a97c'], ['medium', 'Medium', '#cc9d6e'], ['olive', 'Olive', '#bb985f'], ['honey', 'Honey', '#b4844e'], ['tan', 'Tan', '#a9713f'], ['caramel', 'Caramel', '#94603a'], ['bronze', 'Bronze', '#85532f'], ['brown', 'Brown', '#78492a'], ['deep', 'Deep', '#5c3b23'], ['rich', 'Rich', '#3d2314']];
  function mixc(h, t, toward) { var c = [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }), w = toward === 'w' ? 255 : 0; return '#' + c.map(function (v) { return ('0' + Math.round(v + (w - v) * t).toString(16)).slice(-2); }).join(''); }
  function tune(i, c) { if (i < 7) return mixc(c, (7 - i) / 7 * 0.16, 'w'); if (i > 7) return mixc(c, (i - 7) / 7 * 0.22, 'k'); return c; }
  function sector(cx, cy, r0, r1, a0, a1) { function p(r, a) { a = a * Math.PI / 180; return [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)]; } var A = p(r1, a0), B = p(r1, a1), C = p(r0, a1), D = p(r0, a0); return 'M' + A.join(' ') + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + B.join(' ') + ' L' + C.join(' ') + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + D.join(' ') + ' Z'; }
  function ringSvg(cx, cy, rings, sep) { var s = ''; rings.forEach(function (rg) { var n = rg.cols.length; rg.cols.forEach(function (c, i) { s += '<path d="' + sector(cx, cy, rg.r0, rg.r1, -90 + i * 360 / n, -90 + (i + 1) * 360 / n) + '" fill="' + E(c) + '" stroke="#F7F5F0" stroke-width="' + sep + '" stroke-linejoin="round"/>'; }); }); return s; }
  function pal(r) {
    var pick = function (a, n) { return (a || []).slice(0, n).map(function (c) { return { n: c.n, h: c.h }; }); };
    var neu = pick(r.neutrals, 4), sig = pick(r.signature, 6), acc = pick(r.accents, 3);
    var fb = { n: 'Camel', h: '#C9A882' };
    while (neu.length < 4) neu.push(fb); while (sig.length < 6) sig.push(sig[0] || { n: 'Rose', h: '#C45A7A' }); while (acc.length < 3) acc.push(acc[0] || fb);
    return { neu: neu, sig: sig, acc: acc };
  }
  function chip(c) { return '<i class="hx-dot" style="background:' + E(c.h) + ';' + (/^#f[a-f0-9]{5}$/i.test(c.h) ? 'box-shadow:inset 0 0 0 1px #cfc8be;' : '') + '"></i>'; }
  function head(title, sub) { return '<h1 class="pdf-h1" style="margin-top:0;font-size:2.1rem;">' + title + '</h1>' + (sub ? '<p class="hx-sub">' + sub + '</p>' : ''); }
  function label(t, first) { return '<p class="pdf-section-label"' + (first ? ' style="margin-top:0;"' : '') + '>' + t + '</p>'; }
  function seasonFamily(key) {
    var k = String(key || '');
    var warm = /spring|autumn/i.test(k), soft = /soft|light/i.test(k);
    return (warm ? 'warm' : 'cool') + (soft ? 'Soft' : 'Vivid');
  }

  /* ---------- 1. wheel with face (goes at the bottom of the color type page) ---------- */
  function wheelHtml(r) {
    var P = pal(r), s = ringSvg(190, 190, [{ r0: 78, r1: 114, cols: P.neu.map(function (c) { return c.h; }) }, { r0: 118, r1: 158, cols: P.sig.map(function (c) { return c.h; }) }, { r0: 162, r1: 186, cols: P.acc.map(function (c) { return c.h; }) }], 3);
    var photo = r.__photo ? 'background-image:url(' + r.__photo + ');background-size:cover;background-position:50% 22%;' : '';
    var mono = r.__photo ? '' : '<span>' + E(String(r.clientName || 'You').charAt(0).toUpperCase()) + '</span>';
    return label('Your face, at the center of your colors')
      + '<div class="hx-wheel"><svg viewBox="0 0 380 380" width="330" height="330">' + s + '</svg><div class="hx-face" style="' + photo + '">' + mono + '</div></div>'
      + '<div class="hx-wleg"><span><i style="background:#C9A882"></i>Neutrals, closest to you</span><span><i style="background:' + E(P.sig[0].h) + '"></i>Signature colors</span><span><i style="background:' + E(P.acc[0].h) + '"></i>Accents</span></div>'
      + '<p class="hx-cap">Your ' + E(String(r.seasonLabel || '').replace(/\s*✦/, '')) + ' palette, arranged as rings around you.</p>';
  }

  /* ---------- 2. palette across the shade range ---------- */
  function shadesBlock(r) {
    var P = pal(r), my = -1; SKINS.forEach(function (s, i) { if (s[0] === r.depthKey) my = i; });
    var grid = SKINS.map(function (sk, i) {
      var N = P.neu.map(function (c) { return /^#f[a-f0-9]{5}$/i.test(c.h) ? c.h : tune(i, c.h); }), S = P.sig.map(function (c) { return tune(i, c.h); }), A = P.acc.map(function (c) { return tune(i, c.h); });
      var svg = '<svg viewBox="-8 -8 236 236">' + ringSvg(110, 110, [{ r0: 46, r1: 68, cols: N }, { r0: 71, r1: 94, cols: S }, { r0: 97, r1: 108, cols: A }], 2.4) + '<circle cx="110" cy="110" r="40" fill="#F7F5F0"/><circle cx="110" cy="110" r="36" fill="' + sk[2] + '"/>' + (i === my ? '<circle cx="110" cy="110" r="116" fill="none" stroke="#7A1321" stroke-width="3.5"/>' : '') + '</svg>';
      return '<div class="hx-mw' + (i === my ? ' me' : '') + '">' + svg + '<span>' + sk[1] + (i === my ? ' &middot; you' : '') + '</span></div>';
    }).join('');
    var mine = my > -1 ? SKINS[my][1] : '';
    var how = [['Inner ring', '<b>Neutrals.</b> The foundation, closest to your face. Use these as the base of every outfit.'], ['Middle ring', '<b>Signature colors.</b> Your statement colors. Wear them in tops, dresses and scarves near your face.'], ['Outer ring', '<b>Accents.</b> Finishing touches like metals, belts, shoes and small pieces that tie a look together.']];
    var mean = [['Your shade', mine ? '<b>' + E(mine) + '.</b> Your colors are tuned to hold their own against your skin.' : 'Your colors are tuned to your coloring.'], ['Your wheel', my > -1 ? 'Use the outlined wheel as your shopping reference. Every color on it is already matched to you.' : 'Use these wheels as your shopping reference.'], ['Next page', 'See how to put these colors into outfits: the 60-30-10 rule, color stories and where each color goes.']];
    var box = function (a) { return '<div class="hx-box"><h6>' + a[0] + '</h6><p>' + a[1] + '</p></div>'; };
    return { key: 'shades', label: 'Palette By Shade', html: '<div class="hx-page">' + head('Your palette across the <em>shade range</em>', 'The same palette, tuned lighter or richer for each skin shade.' + (my > -1 ? ' Yours is marked.' : '')) + '<div class="hx-minis">' + grid + '</div>' + label('How to read your wheel') + '<div class="hx-3">' + how.map(box).join('') + '</div>' + label('What this means for you') + '<div class="hx-3">' + mean.map(box).join('') + '</div></div>' };
  }

  /* ---------- 3. put your colors to work ---------- */
  function rsq(a, b, c) { return '<div class="hx-rsq" style="background:' + E(a.h) + '"><div style="background:' + E(b.h) + '"><div style="background:' + E(c.h) + '"></div></div></div>'; }
  function workBlock(r) {
    var P = pal(r), N = P.neu, S = P.sig, A = P.acc;
    var base = N[1] || N[0];
    var stories = [['Clean + bold', [N[0], S[0], N[2]]], ['Polished', [N[3], S[3], A[0]]], ['Fresh', [N[1], S[1], A[1]]], ['Casual', [N[2], S[5], N[0]]]];
    var st = stories.map(function (s) { var c = s[1]; return '<div class="hx-st">' + rsq(c[0], c[1], c[2]) + '<h6>' + s[0] + '</h6><p><b>Base</b> ' + E(c[0].n) + '<br><b>Main</b> ' + E(c[1].n) + '<br><b>Pop</b> ' + E(c[2].n) + '</p></div>'; }).join('');
    var where = [['Near your face', S.slice(0, 3), 'Signature colors: tops, scarves, earrings'], ['Away from your face', N.slice(0, 3), 'Neutrals: trousers, skirts, coats'], ['Finishing touches', A, 'Accents: shoes, bags, belts, metals']];
    var wh = where.map(function (w) { return '<div class="hx-box"><h6>' + w[0] + '</h6><div>' + w[1].map(chip).join('') + '</div><p>' + w[2] + '</p></div>'; }).join('');
    var chk = ['Is there one signature color near my face?', 'Are my neutrals on the bottom half?', 'Did I add one accent, like a bag, shoes or gold?', 'Is every color from my wheel?'].map(function (t, i) { return '<div class="hx-chk"><b>' + (i + 1) + '</b><p>' + t + '</p></div>'; }).join('');
    return { key: 'work', label: 'Wearing Your Colors', html: '<div class="hx-page">' + head('Put your colors to <em>work</em>', 'Three simple rules turn your palette into outfits you can build without thinking.')
      + label('01 / The 60-30-10 outfit rule', true) + '<div class="hx-r6"><div style="flex:6;background:' + E(base.h) + '"><b>60%</b><span>Base</span><small>Your power neutrals</small></div><div style="flex:3;background:' + E(S[0].h) + '"><b>30%</b><span>Main</span><small>A signature color</small></div><div style="flex:1;background:' + E(A[0].h) + '"><b>10%</b></div></div><div class="hx-r6n"><span>Base: trousers, skirt, jacket</span><span>Main: top or dress</span><span>Pop: bag, shoes, jewelry</span></div>'
      + label('02 / Color stories to wear') + '<div class="hx-4">' + st + '</div>' + label('03 / Where each color goes') + '<div class="hx-3">' + wh + '</div>' + label('04 / Before you leave the house') + '<div class="hx-2">' + chk + '</div></div>' };
  }

  /* ---------- 4. hair, makeup & nails ---------- */
  var BEAUTY = {
    warmVivid: { Lips: [['Poppy red', '#D6392B'], ['Coral', '#F2543D'], ['Warm brick', '#A7432E']], Blush: [['Peach', '#F2A88B'], ['Apricot', '#F0A26C'], ['Warm rose', '#E08A7A']], Eyes: [['Bronze', '#B07A3A'], ['Copper', '#B5651D'], ['Olive', '#7A7A3A']], Nails: [['Coral', '#F2543D'], ['Terracotta', '#C56A47'], ['Warm nude', '#D9A98A']], Hair: [['Golden brown', '#8B5A2B'], ['Copper', '#B5651D'], ['Chestnut', '#6B3E23']], Skip: 'icy pinks, blue-reds and gray-toned shades' },
    warmSoft: { Lips: [['Peach nude', '#E9A78F'], ['Soft coral', '#E87D6B'], ['Warm rose', '#C26B6B']], Blush: [['Soft peach', '#F0B8A0'], ['Apricot', '#EBB08A'], ['Rosy beige', '#D9A58F']], Eyes: [['Champagne', '#E3CBA0'], ['Soft olive', '#8E8A4F'], ['Warm taupe', '#A08670']], Nails: [['Peachy nude', '#E8B49B'], ['Soft terracotta', '#C9856A'], ['Sheer coral', '#F0A090']], Hair: [['Honey', '#B98A4C'], ['Soft caramel', '#A8703A'], ['Warm light brown', '#8B6240']], Skip: 'stark black, icy tones and neon shades' },
    coolVivid: { Lips: [['True red', '#C8102E'], ['Fuchsia', '#D2127E'], ['Deep berry', '#8A1538']], Blush: [['Cool rose', '#E58AA0'], ['Berry pink', '#D0577E'], ['Plum rose', '#B44B6D']], Eyes: [['Charcoal', '#3B3B3F'], ['Navy', '#1F2A5A'], ['Cool plum', '#5B2A5E']], Nails: [['Cherry', '#B0102B'], ['Berry', '#7A1642'], ['Icy nude', '#E6C9C7']], Hair: [['Espresso', '#3B2A22'], ['Blue-black', '#1E1B24'], ['Cool dark brown', '#4A3830']], Skip: 'orange-based, golden and earthy shades' },
    coolSoft: { Lips: [['Rose', '#C8647F'], ['Raspberry', '#B03A6A'], ['Soft mauve', '#A8697B']], Blush: [['Powder rose', '#E8A6B4'], ['Cool pink', '#DE8CA3'], ['Dusty rose', '#C9808C']], Eyes: [['Soft taupe', '#9A8A8A'], ['Slate blue', '#6A7E9C'], ['Mauve', '#8F6F86']], Nails: [['Pink mauve', '#C58C9A'], ['Soft raspberry', '#B96A8A'], ['Milky nude', '#E3CFCB']], Hair: [['Ash brown', '#7A6A60'], ['Cool blonde', '#C9B89A'], ['Soft mushroom', '#8A7A72']], Skip: 'orange-based shades and harsh, stark contrast' }
  };
  function beautyBlock(r) {
    var B = BEAUTY[seasonFamily(r.seasonKey)];
    var order = ['Lips', 'Blush', 'Eyes', 'Nails', 'Hair'];
    var cards = order.map(function (k) { return '<div class="hx-box"><h6>' + (k === 'Hair' ? 'Hair tones' : k) + '</h6>' + B[k].map(function (c) { return '<div class="hx-bt"><i style="background:' + c[1] + '"></i><span>' + c[0] + '</span></div>'; }).join('') + '</div>'; }).join('');
    cards += '<div class="hx-box"><h6>Metal tone</h6><p>' + E(r.metal) + '</p><h6 style="margin-top:10px">Skip</h6><p>' + E(B.Skip) + '.</p></div>';
    return { key: 'beauty', label: 'Hair, Makeup & Nails', html: '<div class="hx-page">' + head('Hair, makeup &amp; <em>nails</em>', 'The same coloring that guides your clothes also guides your beauty shopping.') + '<div class="hx-3b">' + cards + '</div>' + label('How to choose') + '<div class="hx-3"><div class="hx-box"><h6>Match the undertone</h6><p>Your list is already matched to your coloring. Start there.</p></div><div class="hx-box"><h6>Test in daylight</h6><p>Swatch on your jawline near a window. The right shade looks natural, not heavy.</p></div><div class="hx-box"><h6>Change one thing</h6><p>Start with lip color. It is the fastest way to bring your palette to your face.</p></div></div>' + '<div class="hx-tip">Screenshot this page and show it at the beauty counter or to your hair colorist. Shades are a starting point; texture and finish change how a color looks on you.</div></div>' };
  }

  /* ---------- 5. dress your shape ---------- */
  function G(k, col) {
    var f = col, w = '#fff';
    var s = {
      puff: '<ellipse cx="22" cy="40" rx="20" ry="17" fill="' + f + '"/><ellipse cx="98" cy="40" rx="20" ry="17" fill="' + f + '"/><path d="M34 34 Q60 52 86 34 L90 118 Q60 130 30 118 Z" fill="' + f + '"/><path d="M42 36 Q60 56 78 36" fill="none" stroke="' + w + '" stroke-opacity=".5" stroke-width="3"/>',
      bardot: '<path d="M10 44 Q60 26 110 44 L100 108 Q60 122 20 108 Z" fill="' + f + '"/><path d="M12 46 Q60 30 108 46" fill="none" stroke="' + w + '" stroke-opacity=".45" stroke-width="4"/>',
      halter: '<path d="M40 8 L60 56 L80 8 L84 56 Q100 84 90 122 Q60 136 30 122 Q20 84 36 56 Z" fill="' + f + '"/><path d="M44 74 Q60 84 76 74 M40 92 Q60 102 80 92 M38 108 Q60 118 82 108" fill="none" stroke="' + w + '" stroke-opacity=".4" stroke-width="2.5"/>',
      wrap: '<path d="M38 20 L60 66 L82 20 L102 34 L106 120 L88 120 L86 70 L60 124 L34 70 L32 120 L14 120 L18 34 Z" fill="' + f + '"/><path d="M60 66 L86 70 L96 110" fill="none" stroke="' + w + '" stroke-opacity=".5" stroke-width="3"/>',
      peplum: '<path d="M40 16 Q60 28 80 16 L86 68 L108 116 Q60 134 12 116 L34 68 Z" fill="' + f + '"/><path d="M34 68 Q60 80 86 68" fill="none" stroke="' + w + '" stroke-opacity=".45" stroke-width="3"/>',
      corset: '<path d="M28 36 Q40 20 52 36 Q60 44 68 36 Q80 20 92 36 L90 100 Q60 114 30 100 Z" fill="' + f + '"/><path d="M46 44 L46 106 M60 48 L60 110 M74 44 L74 106" stroke="' + w + '" stroke-opacity=".4" stroke-width="2.5"/>',
      askirt: '<path d="M38 14 L82 14 L108 124 Q60 138 12 124 Z" fill="' + f + '"/><path d="M44 28 L30 128 M60 28 L60 132 M76 28 L90 128" stroke="' + w + '" stroke-opacity=".4" stroke-width="2.5"/><rect x="38" y="14" width="44" height="12" fill="#000" fill-opacity=".15"/>',
      wide: '<path d="M34 8 L86 8 L100 142 L66 142 L60 60 L54 142 L20 142 Z" fill="' + f + '"/><rect x="34" y="8" width="52" height="10" fill="#000" fill-opacity=".18"/><path d="M60 60 L60 8" stroke="' + w + '" stroke-opacity=".5" stroke-width="2"/>',
      trouser: '<path d="M34 8 L86 8 L94 142 L66 142 L60 54 L54 142 L26 142 Z" fill="' + f + '"/><rect x="34" y="8" width="52" height="16" fill="#000" fill-opacity=".2"/><path d="M60 24 L60 54" stroke="' + w + '" stroke-opacity=".5" stroke-width="2"/>',
      flare: '<path d="M42 10 L52 40 Q60 46 68 40 L78 10 L84 12 L82 60 L112 142 Q60 154 8 142 L38 60 L36 12 Z" fill="' + f + '"/><path d="M38 60 Q60 70 82 60" fill="none" stroke="' + w + '" stroke-opacity=".45" stroke-width="3"/>',
      aline: '<path d="M44 10 L76 10 L80 50 L108 146 Q60 156 12 146 L40 50 Z" fill="' + f + '"/><path d="M44 10 Q60 30 76 10" fill="none" stroke="' + w + '" stroke-opacity=".45" stroke-width="3"/>',
      ruffle: '<path d="M44 10 L76 10 L80 44 L96 146 Q60 156 24 146 L40 44 Z" fill="' + f + '"/><path d="M34 70 Q47 80 60 70 Q73 80 86 70 M28 100 Q44 112 60 100 Q76 112 92 100 M22 128 Q41 142 60 128 Q79 142 98 128" fill="none" stroke="' + w + '" stroke-opacity=".45" stroke-width="3"/>'
    }[k] || '';
    return '<svg viewBox="0 0 120 150" class="hx-gm">' + s + '</svg>';
  }
  var NAMES = { puff: 'Puff sleeve', bardot: 'Off-shoulder', halter: 'Gathered halter', wrap: 'Wrap top', peplum: 'Peplum', corset: 'Corset', askirt: 'A-line or pleated skirt', wide: 'Wide-leg jeans', trouser: 'Trousers', flare: 'Fit and flare', aline: 'A-line', ruffle: 'Ruffle' };
  var DRESS_ROWS = {
    rectangle: { sub: 'Add volume where you want it, and define your waistline.', rows: [['Tops', 'Add volume at the shoulder and bust', ['puff', 'bardot', 'halter']], ['Tops', 'Define the waistline', ['wrap', 'peplum', 'corset']], ['Bottoms', 'Add volume at the lower part', ['askirt', 'wide', 'trouser']], ['Dresses', 'Define the waist and add volume at the shoulders or hips', ['flare', 'aline', 'ruffle']]] },
    hourglass: { sub: 'Follow your curves and keep your waist in view.', rows: [['Tops', 'Follow your curves at the bust and waist', ['wrap', 'corset', 'halter']], ['Tops', 'Fitted shapes that mark the waist', ['peplum', 'bardot']], ['Bottoms', 'Mark the waist and skim the hips', ['trouser', 'askirt']], ['Dresses', 'Wrap and belted shapes that follow your waist', ['flare', 'aline']]] },
    pear: { sub: 'Add interest on top and keep the lower half clean.', rows: [['Tops', 'Add volume and interest at the shoulders and bust', ['puff', 'bardot', 'halter']], ['Tops', 'Fitted at the waist, simple at the hip', ['wrap', 'corset']], ['Bottoms', 'Clean A-line and straight shapes', ['askirt', 'trouser']], ['Dresses', 'Fit-and-flare shapes balance a fuller hip', ['flare', 'aline']]] },
    apple: { sub: 'Draw the eye up and let fabric flow over the middle.', rows: [['Tops', 'Open necklines and soft volume on top', ['wrap', 'halter', 'puff']], ['Tops', 'Draw the eye up and out to the shoulders', ['wrap', 'bardot']], ['Bottoms', 'Comfortable, mid-rise shapes that skim', ['wide', 'trouser', 'askirt']], ['Dresses', 'Shapes that flow from under the bust', ['aline', 'flare', 'ruffle']]] },
    inverted: { sub: 'Soften the shoulders and add volume at the hips.', rows: [['Tops', 'Simple, open necklines soften the shoulders', ['wrap', 'halter']], ['Tops', 'Add volume at the hip with a flared hem', ['peplum', 'corset']], ['Bottoms', 'Volume at the lower half balances your shoulders', ['wide', 'askirt', 'trouser']], ['Dresses', 'Flowing skirts add balance', ['aline', 'flare', 'ruffle']]] }
  };
  var FIT_NOTES = [['Mind the rise', 'Very high-waisted pants can look compressing if your legs are longer than your torso, or if you are petite. Try a mid or mid-high rise and see how it feels.'], ['Flares, with care', 'Flares can echo a straight waistline. Pair them with a fitted, belted or peplum top so your waist still reads.'], ['Height and torso matter', 'This is a starting point. Your height and torso length change how every cut sits, so trust the mirror over the rule.']];
  function dressBlock(r) {
    var key = DRESS_ROWS[r.bodyShapeKey] ? r.bodyShapeKey : 'rectangle', D = DRESS_ROWS[key], P = pal(r);
    var cols = [P.sig[0], P.neu[1], P.sig[2], P.neu[2], P.sig[4], P.neu[3], P.sig[1], P.acc[1], P.sig[3], P.neu[0], P.sig[5], P.acc[2]].map(function (c) { return c.h; });
    var n = 0;
    var fig = typeof croquisSVG === 'function' ? croquisSVG(key, { sw: 1.4 }) : '';
    var shapeWord = (typeof SHAPE_WORD !== 'undefined' && SHAPE_WORD[key]) ? SHAPE_WORD[key] : key;
    var rows = D.rows.map(function (row) {
      var items = row[2].map(function (k) { var g = G(k, cols[n++ % cols.length]); return '<div class="hx-gi">' + g + '<span>' + NAMES[k] + '</span></div>'; }).join('');
      return '<div class="hx-grow"><div class="hx-fig">' + fig + '</div><div class="hx-gb"><h5>' + row[0] + '</h5><div class="hx-gis">' + items + '</div><p>' + row[1] + '</p></div></div>';
    }).join('');
    var notes = FIT_NOTES.map(function (a) { return '<div class="hx-box"><h6>' + a[0] + '</h6><p>' + a[1] + '</p></div>'; }).join('');
    return { key: 'dress', label: 'Dress Your Shape', html: '<div class="hx-page">' + head('Dress your <em>shape</em>', E(String(shapeWord)) + ': ' + D.sub.charAt(0).toLowerCase() + D.sub.slice(1)) + rows + label('Fit notes') + '<div class="hx-3">' + notes + '</div></div>' };
  }

  /* ---------- 6. outfit formulas for where outfits should work best ---------- */
  var OCC = {
    everyday: ['Everyday', 'sun', ['Pick one formula and repeat it with different colors.', 'Keep shoes comfortable and the bag structured.', 'Add one bright accent so it never looks plain.']],
    work: ['Work &amp; professional', 'brief', ['Choose structured fabrics and a tailored fit.', 'Let neutrals lead, with one signature color near your face.', 'Keep jewelry in your metal tone.']],
    dates: ['Dates &amp; events', 'wine', ['Wear your most flattering color closest to your face.', 'Pick one statement piece, then keep the rest simple.', 'A heel or a dressy flat finishes the outfit.']],
    travel: ['Travel', 'case', ['Pack a three-color capsule from your neutrals.', 'Choose wrinkle-resistant knits and fabrics.', 'One signature scarf or top adds color to every outfit.']],
    photos: ['Photos &amp; social', 'camera', ['Wear signature colors near your face.', 'Solid colors read better on camera than busy prints.', 'Keep your avoid colors out of photos.']],
    special: ['Special occasions', 'ribbon', ['Choose a rich signature color for the main piece.', 'Keep accessories to one statement.', 'Try the whole outfit on a week early.']]
  };
  var OCC_ICON = {
    sun: '<circle cx="60" cy="66" r="18" fill="#F7E4DD"/><path d="M60 30 V38 M60 94 V102 M24 66 H32 M88 66 H96 M34 40 L40 46 M80 86 L86 92 M86 40 L80 46 M40 86 L34 92"/>',
    brief: '<rect x="22" y="48" width="76" height="52" rx="6" fill="#F7E4DD"/><path d="M46 48 V38 H74 V48 M22 70 H98"/><rect x="54" y="66" width="12" height="10"/>',
    wine: '<path d="M42 28 H78 C80 56 72 70 60 72 C48 70 40 56 42 28 Z" fill="#F7E4DD"/><path d="M60 72 V108 M44 110 H76"/>',
    case: '<rect x="28" y="44" width="64" height="62" rx="8" fill="#F7E4DD"/><path d="M48 44 V34 H72 V44 M44 56 V94 M76 56 V94"/>',
    camera: '<rect x="20" y="46" width="80" height="54" rx="8" fill="#F7E4DD"/><circle cx="60" cy="73" r="15"/><path d="M42 46 L48 36 H72 L78 46"/>',
    ribbon: '<circle cx="60" cy="52" r="22" fill="#F7E4DD"/><path d="M48 70 L40 108 L60 96 L80 108 L72 70"/>'
  };
  function formulasBlock(r) {
    var P = pal(r), d = (r.directions && r.directions.worksBest && r.directions.worksBest.length) ? r.directions.worksBest : ['everyday', 'work', 'dates'];
    var key = DRESS_ROWS[r.bodyShapeKey] ? r.bodyShapeKey : 'rectangle', D = DRESS_ROWS[key];
    var top = NAMES[D.rows[1][2][0]] || 'Wrap top', bot = NAMES[D.rows[2][2][0]] || 'Trousers', dr = NAMES[D.rows[3][2][0]] || 'A-line';
    var combos = [[P.neu[1], P.sig[0], P.acc[0]], [P.neu[3], P.sig[2], P.acc[0]], [P.neu[0], P.sig[1], P.acc[1]]];
    var cards = d.slice(0, 3).map(function (k, i) {
      var o = OCC[k]; if (!o) return ''; var c = combos[i % 3];
      var ico = '<svg viewBox="0 0 120 150" fill="#FAF9F6" stroke="#181716" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" width="46" height="58">' + OCC_ICON[o[1]] + '</svg>';
      return '<div class="hx-occ"><div class="hx-occh">' + ico + '<h4>' + o[0] + '</h4></div>'
        + '<div class="hx-fm"><span>' + chip(c[0]) + '<b>Base</b>' + E(c[0].n) + '</span><span>' + chip(c[1]) + '<b>Main</b>' + E(c[1].n) + '</span><span>' + chip(c[2]) + '<b>Pop</b>' + E(c[2].n) + '</span></div>'
        + '<div class="hx-fg"><div>' + G(D.rows[1][2][0], c[1].h) + '<span>' + E(top) + '</span></div><div>' + G(D.rows[2][2][0], c[0].h) + '<span>' + E(bot) + '</span></div><div>' + G(D.rows[3][2][0], c[1].h) + '<span>' + E(dr) + ' dress</span></div></div>'
        + '<p class="hx-try"><b>Try:</b> ' + E(top) + ' + ' + E(bot) + ', or ' + E(dr) + ' dress.</p>'
        + '<ul>' + o[2].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>';
    }).join('');
    return { key: 'formulas', label: 'Outfit Formulas', html: '<div class="hx-page">' + head('Outfit <em>formulas</em>', 'You asked for outfits that work best in these places. Build each one from your own colors.') + cards + '<div class="hx-tip">Want these built into real outfits from your closet? That is what a styling session is for. Try Style-11 for a free outfit idea any time.</div></div>' };
  }

  /* ---------- 7. patterns ---------- */
  function patternsBlock(r) {
    var P = pal(r), N = P.neu, S = P.sig, A = P.acc;
    var navy = N[3].h, cream = N[0].h, camel = N[2].h;
    var scale = r.height === 'petite' ? 'small to medium scale' : r.height === 'tall' ? 'medium to large scale' : 'any scale you like';
    var leo = (function () { var s = '', xs = [[20, 20], [62, 14], [104, 24], [40, 52], [86, 58], [14, 80], [58, 90], [112, 92], [30, 120], [90, 124]]; xs.forEach(function (p) { s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="13" ry="10" fill="' + E(A[2].h) + '" transform="rotate(' + ((p[0] * 7) % 60) + ' ' + p[0] + ' ' + p[1] + ')"/><path d="M' + (p[0] - 12) + ' ' + p[1] + ' Q' + p[0] + ' ' + (p[1] - 16) + ' ' + (p[0] + 12) + ' ' + (p[1] - 4) + '" stroke="#2b2220" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M' + (p[0] - 8) + ' ' + (p[1] + 8) + ' Q' + (p[0] + 4) + ' ' + (p[1] + 14) + ' ' + (p[0] + 12) + ' ' + (p[1] + 4) + '" stroke="#2b2220" stroke-width="3.5" fill="none" stroke-linecap="round"/>'; }); return '<svg viewBox="0 0 130 140" preserveAspectRatio="xMidYMid slice"><rect width="130" height="140" fill="' + E(camel) + '"/>' + s + '</svg>'; })();
    var flo = (function () { var s = '', xs = [[18, 18], [56, 30], [94, 16], [30, 58], [72, 66], [108, 54], [16, 100], [56, 108], [96, 100], [36, 130], [80, 134]]; xs.forEach(function (p, i) { var c = S[i % 6].h; s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><circle r="9" cx="0" cy="-8" fill="' + E(c) + '"/><circle r="9" cx="8" cy="0" fill="' + E(c) + '"/><circle r="9" cx="0" cy="8" fill="' + E(c) + '"/><circle r="9" cx="-8" cy="0" fill="' + E(c) + '"/><circle r="4" fill="' + E(A[0].h) + '"/></g>'; }); return '<svg viewBox="0 0 130 140" preserveAspectRatio="xMidYMid slice"><rect width="130" height="140" fill="' + E(cream) + '"/>' + s + '</svg>'; })();
    var tiles = [
      ['Breton stripe', navy + ' + ' + cream, 'repeating-linear-gradient(0deg,' + E(navy) + ' 0 10px,' + E(cream) + ' 10px 22px)', 'Classic and easy. Great for tops, knits and scarves.'],
      ['Gingham', E(S[0].n) + ' + ' + E(N[0].n), 'linear-gradient(90deg,' + E(S[0].h) + '66 50%,transparent 50%),linear-gradient(0deg,' + E(S[0].h) + '66 50%,transparent 50%),' + E(cream) + ';background-size:22px 22px', 'Fresh and friendly. Keep the rest of the outfit solid.'],
      ['Polka dot', E(N[3].n) + ' + ' + E(N[0].n), 'radial-gradient(circle,' + E(cream) + ' 5px,transparent 6px) 0 0/22px 22px,' + E(navy), 'Timeless. Works as a dress, blouse or scarf.'],
      ['Leopard', E(N[2].n) + ' + ' + E(A[2].n), '', 'A neutral that goes with everything. Let it be the only pattern.', leo],
      ['Plaid', E(S[2].n) + ' + ' + E(N[1].n), 'repeating-linear-gradient(90deg,' + E(S[2].h) + 'aa 0 8px,transparent 8px 28px),repeating-linear-gradient(0deg,' + E(N[1].h) + 'aa 0 8px,transparent 8px 28px),' + E(N[0].h), 'Structured and polished. Choose a plaid from your colors.'],
      ['Ditsy floral', 'Your signature colors', '', 'Soft and feminine. Pick one with colors from your wheel.', flo]
    ];
    var tl = tiles.map(function (t) { return '<div class="hx-pt"><div class="hx-pc" style="' + (t[2] ? 'background:' + t[2] + ';' : '') + '">' + (t[4] || '') + '</div><h5>' + t[0] + '</h5><small>' + t[1] + '</small><p>' + t[3] + '</p></div>'; }).join('');
    return { key: 'patterns', label: 'Patterns', html: '<div class="hx-page">' + head('Patterns you <em>can wear</em>', 'Keep the colors inside your wheel and any pattern will look intentional.') + '<div class="hx-pgrid">' + tl + '</div><div class="hx-tip" style="margin-top:14px">Scale tip: choose ' + scale + '. One pattern per outfit. Let it be the star and keep everything else solid.</div></div>' };
  }

  function guidanceExtra(r) {
    var P = pal(r);
    var tips = [['Closest to you', P.sig[0], 'Wear ' + E(P.sig[0].n) + ' or ' + E(P.sig[1].n) + ' as a top or scarf'], ['Your best neutral', P.neu[3], E(P.neu[3].n) + ' for blazers and bags'], ['Your finishing metal', P.acc[0], E(String(r.metal || '').split(/\s[\u2014-]\s|\u2014/)[0]) + ' in your jewelry']];
    var t = tips.map(function (x) { return '<div class="hx-box hx-tipc"><h6>' + x[0] + '</h6><div>' + chip(x[1]) + '<span>' + x[2] + '</span></div></div>'; }).join('');
    var rules = ['Wear your brightest color closest to your face.', 'Keep neutrals low, on bottoms and bags. Put color on top.', 'When in doubt, add your metal tone.'].map(function (x, i) { return '<div class="hx-chk"><b>' + (i + 1) + '</b><p>' + x + '</p></div>'; }).join('');
    return label('Wear it near your face') + '<div class="hx-3">' + t + '</div>' + label('Three quick rules') + '<div class="hx-1">' + rules + '</div><div class="hx-goal"><h6>Your color goal</h6><p>Wear clear color close to your face and let your neutrals do the quiet work.</p></div>';
  }

  /* ---------- "you asked for" list for the closing page ---------- */
  var ASKED = { colors: 'Your palette and how to wear it', cuts: 'Silhouettes & Shopping', formulas: 'Outfit Formulas', shopping: 'Silhouettes & Shopping', avoid: 'Accessories & Avoid', tips: 'Wearing Your Colors' };
  function askedHtml(r) {
    var g = (r.directions && r.directions.guideFirst) || []; if (!g.length) return '';
    var seen = {}, out = []; g.forEach(function (k) { var t = ASKED[k]; if (t && !seen[t]) { seen[t] = 1; out.push(t); } });
    return '<div class="hx-asked"><b>You asked us to start with</b> ' + out.join(' &middot; ') + '. Look for those pages first.</div>';
  }

  var CSS = '.hx-page{min-height:880px;}.hx-1{display:grid;gap:6px;}.hx-goal{margin-top:14px;background:#4E0B14;color:#fff;border-radius:3px;padding:12px 18px;}.hx-goal h6{margin:0 0 4px;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:#E8D8D2;}.hx-goal p{margin:0;font-family:"Cormorant Garamond",serif;font-style:italic;font-size:1.15rem;}.hx-tipc div{display:flex;align-items:center;gap:6px;font-size:0.72rem;line-height:1.35;color:#3F3C38;}.hx-fg{display:flex;gap:10px;margin:6px 0 2px;}.hx-fg>div{flex:1;text-align:center;}.hx-fg svg{width:100%;height:54px;display:block;}.hx-fg span{display:block;font-size:0.6rem;color:#3F3C38;}.hx-sub{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:1.05rem;color:#7A1321;margin:0 0 0.5rem;}'
    + '.hx-box{background:#ECE8E2;border-radius:12px;padding:0.75rem 0.95rem;}.hx-box h6{margin:0 0 5px;font-size:0.56rem;letter-spacing:0.18em;text-transform:uppercase;color:#7A1321;font-weight:600;}.hx-box p{margin:0;font-size:0.74rem;line-height:1.55;color:#3F3C38;}.hx-box p b{font-weight:600;}'
    + '.hx-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}.hx-3b{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}.hx-2{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;}.hx-4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}'
    + '.hx-dot{display:inline-block;width:18px;height:18px;border-radius:50%;margin-right:6px;vertical-align:middle;}'
    + '.hx-wheel{position:relative;width:330px;height:330px;margin:4px auto 0;}.hx-wheel svg{display:block;}.hx-face{position:absolute;left:50%;top:50%;width:132px;height:132px;margin:-66px 0 0 -66px;border-radius:50%;background:#E7C9B3;box-shadow:0 0 0 4px #F7F5F0,0 0 0 5.5px #B8923A;display:flex;align-items:center;justify-content:center;overflow:hidden;}.hx-face span{font-family:"Cormorant Garamond",serif;font-size:3.2rem;color:#7A1321;}'
    + '.hx-wleg{display:flex;justify-content:center;gap:18px;font-size:0.62rem;color:#4a4541;margin-top:2px;}.hx-wleg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;}.hx-cap{text-align:center;font-family:"Cormorant Garamond",serif;font-style:italic;font-size:0.98rem;color:#4a4541;margin:4px 0 0;}'
    + '.hx-minis{display:grid;grid-template-columns:repeat(5,1fr);gap:16px 8px;margin-top:6px;}.hx-mw{text-align:center;}.hx-mw svg{width:100%;height:auto;display:block;}.hx-mw span{display:block;margin-top:2px;font-size:0.62rem;color:#4a4541;}.hx-mw.me span{color:#7A1321;font-weight:700;}'
    + '.hx-r6{display:flex;height:80px;border-radius:8px;overflow:hidden;}.hx-r6>div{color:#fff;padding:10px 14px;display:flex;flex-direction:column;justify-content:center;}.hx-r6 b{font-family:"Cormorant Garamond",serif;font-size:1.6rem;font-weight:600;line-height:1;}.hx-r6 span{font-size:0.62rem;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;}.hx-r6 small{font-size:0.62rem;opacity:.9;}.hx-r6>div:last-child{padding:8px;align-items:center;}.hx-r6>div:last-child b{font-size:1.1rem;}'
    + '.hx-r6n{display:flex;justify-content:space-between;font-size:0.62rem;color:#4a4541;margin-top:5px;}'
    + '.hx-st{text-align:center;}.hx-rsq{width:92px;height:92px;margin:0 auto;padding:12px;box-sizing:border-box;box-shadow:0 0 0 3px #fff,0 4px 8px -4px rgba(0,0,0,.3);}.hx-rsq>div{width:100%;height:100%;padding:14px;box-sizing:border-box;}.hx-rsq>div>div{width:100%;height:100%;}.hx-st h6{margin:12px 0 3px;font-size:0.56rem;letter-spacing:0.16em;text-transform:uppercase;color:#7A1321;}.hx-st p{margin:0;font-size:0.66rem;line-height:1.5;color:#3F3C38;}.hx-st p b{color:#7A1321;font-size:0.54rem;letter-spacing:0.1em;text-transform:uppercase;margin-right:4px;}'
    + '.hx-chk{background:#ECE8E2;border-radius:99px;padding:7px 12px;display:flex;align-items:center;gap:9px;}.hx-chk b{flex:0 0 20px;height:20px;border-radius:50%;background:#7A1321;color:#fff;display:grid;place-items:center;font-size:0.62rem;}.hx-chk p{margin:0;font-size:0.68rem;line-height:1.3;color:#3F3C38;}'
    + '.hx-3b .hx-box{padding:0.95rem 1.1rem;}.hx-bt{display:flex;align-items:center;gap:10px;margin:9px 0;font-size:0.82rem;color:#3F3C38;}.hx-bt i{width:30px;height:30px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1);flex:0 0 30px;}'
    + '.hx-tip{margin-top:16px;background:#7A1321;color:#fff;padding:11px 16px;border-radius:3px;text-align:center;font-size:0.7rem;line-height:1.5;letter-spacing:0.02em;}'
    + '.hx-grow{display:flex;gap:14px;align-items:center;margin:0 0 8px;}.hx-fig{flex:0 0 66px;width:66px;height:116px;background:#F7E4DD;border:1px solid rgba(122,19,33,.3);border-radius:4px;padding:3px;box-sizing:border-box;}.hx-fig svg{width:100%;height:100%;display:block;}.hx-gb{flex:1;}.hx-gb h5{margin:0;font-family:"Cormorant Garamond",serif;font-size:1.25rem;font-weight:600;}.hx-gis{display:flex;gap:10px;}.hx-gi{flex:1;text-align:center;}.hx-gm{width:100%;height:92px;display:block;margin:0 auto;}.hx-gi span{display:block;font-size:0.66rem;color:#3F3C38;margin-top:1px;}.hx-gb p{margin:3px 0 0;font-size:0.66rem;font-weight:600;color:#7A1321;}'
    + '.hx-occ{background:#ECE8E2;border-radius:14px;padding:10px 16px;margin:0 0 8px;}.hx-occh{display:flex;align-items:center;gap:12px;}.hx-occh h4{margin:0;font-family:"Cormorant Garamond",serif;font-size:1.4rem;font-weight:600;}.hx-fm{display:flex;gap:14px;margin:6px 0 4px;font-size:0.7rem;color:#3F3C38;}.hx-fm b{font-size:0.54rem;letter-spacing:0.12em;text-transform:uppercase;color:#7A1321;margin-right:5px;}.hx-try{margin:2px 0 4px;font-size:0.72rem;color:#3F3C38;}.hx-try b{color:#7A1321;}.hx-occ ul{margin:0;padding-left:18px;font-size:0.7rem;line-height:1.5;color:#3F3C38;}'
    + '.hx-pgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px 12px;}.hx-pc{height:130px;border-radius:8px;overflow:hidden;box-shadow:0 0 0 3px #fff,0 4px 8px -4px rgba(0,0,0,.3);}.hx-pc svg{width:100%;height:100%;display:block;}.hx-pt h5{margin:10px 0 0;font-family:"Cormorant Garamond",serif;font-size:1.1rem;font-weight:600;}.hx-pt small{display:block;font-size:0.54rem;letter-spacing:0.12em;text-transform:uppercase;color:#7A1321;font-weight:600;}.hx-pt p{margin:3px 0 0;font-size:0.7rem;line-height:1.45;color:#3F3C38;}'
    + '.hx-asked{margin:14px auto 0;max-width:520px;background:#fff;border:1px solid #E3D8D2;border-radius:10px;padding:10px 16px;font-size:0.74rem;line-height:1.5;color:#3F3C38;text-align:center;}.hx-asked b{color:#7A1321;}';

  function ensureCss() { if (document.getElementById('hx-css')) return; var s = document.createElement('style'); s.id = 'hx-css'; s.textContent = CSS; document.head.appendChild(s); }
  ensureCss();
  window.HX = { guidanceExtra: guidanceExtra, wheelHtml: wheelHtml, shades: shadesBlock, work: workBlock, beauty: beautyBlock, dress: dressBlock, formulas: formulasBlock, patterns: patternsBlock, asked: askedHtml };
})();
