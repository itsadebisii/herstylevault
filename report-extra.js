/* Extra report pages: color wheel with the client's face, palette across the shade range, "put your colors to work",
   hair/makeup/nails, "dress your shape", outfit formulas and patterns.
   Everything is built from the finished report object (palette, shape, shade, quiz directions). No photo is ever stored:
   a photo is only drawn when it is still in memory right after the quiz, otherwise a monogram sits in the middle. */
(function () {
  'use strict';
  function E(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var SKINS = [['porcelain', 'Porcelain', '#f7e1d3'], ['ivory', 'Ivory', '#f3d6c0'], ['fair', 'Fair', '#f0cdb0'], ['light', 'Light', '#e8c29d'], ['beige', 'Beige', '#deb38a'], ['sand', 'Sand', '#d6a97c'], ['medium', 'Medium', '#cc9d6e'], ['olive', 'Olive', '#bb985f'], ['honey', 'Honey', '#b4844e'], ['tan', 'Tan', '#a9713f'], ['caramel', 'Caramel', '#94603a'], ['bronze', 'Bronze', '#85532f'], ['brown', 'Brown', '#78492a'], ['deep', 'Deep', '#5c3b23'], ['rich', 'Deep rich', '#3d2314']];
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
  var OCCN = { everyday: 'everyday', work: 'work', dates: 'dates and events', travel: 'travel', photos: 'photos and social', special: 'special occasions' };
  var SHOWN = { arms: 'sleeveless or short sleeves', shoulders: 'off-the-shoulder, halter or square necklines', neckline: 'V-necks, scoops and open collars', back: 'open-back or low-back details', waist: 'belts and defined waists', legs: 'mini or midi hems, slits and fitted bottoms' };
  var QUIETN = { arms: 'elbow or three-quarter sleeves and light layers', shoulders: 'set-in sleeves and V-necklines', neckline: 'higher necklines, scarves or open layers', back: 'closed backs and longer layers', midsection: 'empire seams, straight cuts and fabrics that skim', hips: 'A-line and straight cuts, with darker colors below and detail on top', legs: 'midi and maxi lengths and wide-leg trousers' };
  var ZN = { arms: 'your arms', shoulders: 'your shoulders', neckline: 'your neckline', back: 'your back', waist: 'your waist', legs: 'your legs', midsection: 'your midsection', hips: 'your hips and thighs' };
  function listW(a) { a = a.filter(Boolean); return a.length < 2 ? (a[0] || '') : a.length === 2 ? a[0] + ' and ' + a[1] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function shapeName(r) { return String(r.bodyShapeLabel || 'body').toLowerCase().replace(/\s*shape$/, '').trim() || 'body'; }
  function dirs(r) { var d = r.directions || {}; return { show: (d.showOff || []).filter(function (x) { return SHOWN[x]; }), quiet: (d.quiet || []).filter(function (x) { return QUIETN[x]; }), feel: d.feel || [], works: d.worksBest || [], first: d.guideFirst || [] }; }
  function lumH(h) { var c = [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function satH(h) { var c = [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); return Math.max.apply(null, c) - Math.min.apply(null, c); }
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
    return { key: 'shades', label: 'Palette By Shade', html: '<div class="hx-page">' + head('Your palette across the <em>shade range</em>', 'The same palette, tuned lighter or richer for each skin shade.' + (my > -1 ? ' You chose ' + SKINS[my][1] + ', so yours is marked.' : '')) + '<div class="hx-minis">' + grid + '</div>' + label('How to read your wheel') + '<div class="hx-3">' + how.map(box).join('') + '</div>' + label('What this means for you') + '<div class="hx-3">' + mean.map(box).join('') + '</div></div>' };
  }

  /* ---------- 3. put your colors to work ---------- */
  function rsq(a, b, c) { return '<div class="hx-rsq" style="background:' + E(a.h) + '"><div style="background:' + E(b.h) + '"><div style="background:' + E(c.h) + '"></div></div></div>'; }
  function workBlock(r) {
    var P = pal(r), N = P.neu, S = P.sig, A = P.acc, D = dirs(r);
    var base = N[1] || N[0];
    /* the main color follows how she wants to feel */
    var f0 = D.feel[0], main = S[0], mainWhy = '';
    var by = function (fn) { return S.slice().sort(fn)[0]; };
    if (f0 === 'confident' || f0 === 'expressive' || f0 === 'trend') { main = by(function (x, y) { return satH(y.h) - satH(x.h); }); mainWhy = 'your most vivid color, since you want to ' + ({ confident: 'feel confident', expressive: 'be expressive', trend: 'feel on-trend' })[f0]; }
    else if (f0 === 'elegant') { main = by(function (x, y) { return lumH(x.h) - lumH(y.h); }); mainWhy = 'your deepest color, since you want to feel elegant'; }
    else if (f0 === 'comfy' || f0 === 'feminine') { main = by(function (x, y) { return lumH(y.h) - lumH(x.h); }); mainWhy = 'your softest color, since you want to feel ' + (f0 === 'comfy' ? 'comfortable' : 'feminine'); }
    var STORY = { dates: 'Clean + bold', special: 'Clean + bold', work: 'Polished', photos: 'Fresh', everyday: 'Casual', travel: 'Casual' };
    var stories = [['Clean + bold', [N[0], main, N[2]]], ['Polished', [N[3], S[3], A[0]]], ['Fresh', [N[1], S[1], A[1]]], ['Casual', [N[2], S[5], N[0]]]];
    var forOcc = {}; D.works.forEach(function (w) { var nm = STORY[w]; if (nm) (forOcc[nm] = forOcc[nm] || []).push(OCCN[w]); });
    stories.sort(function (x, y) { return (forOcc[y[0]] ? 1 : 0) - (forOcc[x[0]] ? 1 : 0); });
    var pin = function (q) { var u = 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent('trending ' + q + ' for women'); return '<a class="hx-pin" href="' + u + '" target="_blank" rel="noopener" data-href="' + u + '">See outfits on Pinterest</a>'; };
    var st = stories.map(function (s2) { var c = s2[1], fo = forOcc[s2[0]]; var occW = fo ? String(fo[0]).split(' and ')[0] + ' ' : ''; return '<div class="hx-st">' + rsq(c[0], c[1], c[2]) + '<h6>' + s2[0] + '</h6>' + (fo ? '<p style="color:#7A1321;font-style:italic;margin-bottom:2px">For ' + E(listW(fo)) + '</p>' : '') + '<p><b>Base</b> ' + E(c[0].n) + '<br><b>Main</b> ' + E(c[1].n) + '<br><b>Pop</b> ' + E(c[2].n) + '</p>' + pin(String(c[1].n).toLowerCase() + ' and ' + String(c[0].n).toLowerCase() + ' ' + occW + 'outfit ideas') + '</div>'; }).join('');
    var nearT = 'Signature colors: tops, scarves, earrings' + (D.show.some(function (z) { return z === 'shoulders' || z === 'neckline' || z === 'arms'; }) ? ', which also frames the upper body you like to show' : '');
    var awayT = (D.quiet.indexOf('hips') > -1 || D.quiet.indexOf('midsection') > -1) ? 'Neutrals on your lower half keep attention where you want it' : 'Neutrals: trousers, skirts, coats';
    var finT = D.show.indexOf('waist') > -1 ? 'Accents: a belt in an accent color shows off your waist' : D.show.indexOf('legs') > -1 ? 'Accents: shoes in an accent color draw the eye to your legs' : 'Accents: shoes, bags, belts, metals';
    var where = [['Near your face', S.slice(0, 3), nearT], ['Away from your face', N.slice(0, 3), awayT], ['Finishing touches', A, finT]];
    var wh = where.map(function (w) { return '<div class="hx-box"><h6>' + w[0] + '</h6><div>' + w[1].map(chip).join('') + '</div><p>' + w[2] + '</p></div>'; }).join('');
    var chk = ['Is there one signature color near my face?', (D.quiet.indexOf('hips') > -1 || D.quiet.indexOf('midsection') > -1) ? 'Are my neutrals on my lower half?' : 'Are my neutrals on the bottom half?', 'Did I add one accent, like a bag, shoes or gold?', 'Is every color from my wheel?'].map(function (t, i) { return '<div class="hx-chk"><b>' + (i + 1) + '</b><p>' + t + '</p></div>'; }).join('');
    var sub = 'Three simple rules turn your palette into outfits you can build without thinking.' + (D.works.length ? ' Your color stories lead with ' + E(listW(D.works.slice(0, 3).map(function (w) { return OCCN[w]; }))) + '.' : '');
    return { key: 'work', label: 'Wearing Your Colors', html: '<div class="hx-page">' + head('Put your colors to <em>work</em>', sub)
      + label('01 / The 60-30-10 outfit rule', true) + '<div class="hx-r6"><div style="flex:6;background:' + E(base.h) + '"><b>60%</b><span>Base</span><small>Your power neutrals</small></div><div style="flex:3;background:' + E(main.h) + '"><b>30%</b><span>Main</span><small>' + E(main.n) + '</small></div><div style="flex:1;background:' + E(A[0].h) + '"><b>10%</b></div></div><div class="hx-r6n"><span>Base: trousers, skirt, jacket</span><span>Main: top or dress</span><span>Pop: bag, shoes, jewelry</span></div>' + (mainWhy ? '<p class="hx-sub" style="margin:6px 0 0;font-size:0.9rem">Your main color is ' + E(main.n) + ', ' + E(mainWhy) + '.</p>' : '')
      + label('02 / Color stories to wear') + '<div class="hx-4">' + st + '</div>' + label('03 / Where each color goes') + '<div class="hx-3">' + wh + '</div>' + label('04 / Before you leave the house') + '<div class="hx-2">' + chk + '</div><div class="hx-box hx-moreideas"><h6>Want more outfit ideas?</h6><p>Browse outfits in your whole color season: ' + pin(String(r.seasonLabel || 'color palette').replace(/\s*\u2726/, '').toLowerCase() + ' color palette outfits') + '</p></div></div>' };
  }

  /* ---------- 4. hair, makeup & nails ---------- */
  var BEAUTY = {
    warmVivid: { Lips: [['Poppy red', '#D6392B'], ['Coral', '#F2543D'], ['Warm brick', '#A7432E']], Blush: [['Peach', '#F2A88B'], ['Apricot', '#F0A26C'], ['Warm rose', '#E08A7A']], Eyes: [['Bronze', '#B07A3A'], ['Copper', '#B5651D'], ['Olive', '#7A7A3A']], Nails: [['Coral', '#F2543D'], ['Terracotta', '#C56A47'], ['Warm nude', '#D9A98A']], Hair: [['Golden brown', '#8B5A2B'], ['Copper', '#B5651D'], ['Chestnut', '#6B3E23']], Skip: 'icy pinks, blue-reds and gray-toned shades' },
    warmSoft: { Lips: [['Peach nude', '#E9A78F'], ['Soft coral', '#E87D6B'], ['Warm rose', '#C26B6B']], Blush: [['Soft peach', '#F0B8A0'], ['Apricot', '#EBB08A'], ['Rosy beige', '#D9A58F']], Eyes: [['Champagne', '#E3CBA0'], ['Soft olive', '#8E8A4F'], ['Warm taupe', '#A08670']], Nails: [['Peachy nude', '#E8B49B'], ['Soft terracotta', '#C9856A'], ['Sheer coral', '#F0A090']], Hair: [['Honey', '#B98A4C'], ['Soft caramel', '#A8703A'], ['Warm light brown', '#8B6240']], Skip: 'stark black, icy tones and neon shades' },
    coolVivid: { Lips: [['True red', '#C8102E'], ['Fuchsia', '#D2127E'], ['Deep berry', '#8A1538']], Blush: [['Cool rose', '#E58AA0'], ['Berry pink', '#D0577E'], ['Plum rose', '#B44B6D']], Eyes: [['Charcoal', '#3B3B3F'], ['Navy', '#1F2A5A'], ['Cool plum', '#5B2A5E']], Nails: [['Cherry', '#B0102B'], ['Berry', '#7A1642'], ['Icy nude', '#E6C9C7']], Hair: [['Espresso', '#3B2A22'], ['Blue-black', '#1E1B24'], ['Cool dark brown', '#4A3830']], Skip: 'orange-based, golden and earthy shades' },
    coolSoft: { Lips: [['Rose', '#C8647F'], ['Raspberry', '#B03A6A'], ['Soft mauve', '#A8697B']], Blush: [['Powder rose', '#E8A6B4'], ['Cool pink', '#DE8CA3'], ['Dusty rose', '#C9808C']], Eyes: [['Soft taupe', '#9A8A8A'], ['Slate blue', '#6A7E9C'], ['Mauve', '#8F6F86']], Nails: [['Pink mauve', '#C58C9A'], ['Soft raspberry', '#B96A8A'], ['Milky nude', '#E3CFCB']], Hair: [['Ash brown', '#7A6A60'], ['Cool blonde', '#C9B89A'], ['Soft mushroom', '#8A7A72']], Skip: 'orange-based shades and harsh, stark contrast' }
  };
  function mixTo(a, b, t) { var f = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }, x = f(a), y = f(b); return '#' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0'); }).join(''); }
  function pEye(id, cx, cy, w, iris, lash, lid, flip) {
    var d = flip ? -1 : 1, x0 = cx - w, x1 = cx + w, top = 'M' + x0 + ' ' + cy + ' Q' + cx + ' ' + (cy - w * 0.95) + ' ' + x1 + ' ' + cy, shape = top + ' Q' + cx + ' ' + (cy + w * 0.62) + ' ' + x0 + ' ' + cy + 'Z', outer = flip ? x0 : x1;
    return '<clipPath id="' + id + '"><path d="' + shape + '"/></clipPath>'
      + '<path d="M' + (x0 - 1) + ' ' + (cy - 2.5) + ' Q' + cx + ' ' + (cy - w * 1.3) + ' ' + (x1 + 1) + ' ' + (cy - 2.5) + ' Q' + cx + ' ' + (cy - w * 0.9) + ' ' + (x0 - 1) + ' ' + (cy - 2.5) + 'Z" fill="' + lid + '" opacity=".85"/>'
      + '<path d="' + shape + '" fill="#fff"/><g clip-path="url(#' + id + ')"><circle cx="' + cx + '" cy="' + (cy - 0.6) + '" r="' + (w * 0.56).toFixed(1) + '" fill="' + iris + '"/><circle cx="' + cx + '" cy="' + (cy - 0.6) + '" r="' + (w * 0.26).toFixed(1) + '" fill="#120c0a"/><circle cx="' + (cx + w * 0.2) + '" cy="' + (cy - w * 0.28) + '" r="' + (w * 0.12).toFixed(1) + '" fill="#fff"/></g>'
      + '<path d="' + top + '" fill="none" stroke="' + lash + '" stroke-width="3.2" stroke-linecap="round"/><path d="M' + outer + ' ' + cy + ' L' + (outer + d * 6) + ' ' + (cy - 4.2) + '" stroke="' + lash + '" stroke-width="2.6" stroke-linecap="round"/>';
  }
  function portrait(o, tex) {
    var hair = o.hair, skin = o.skin, shade = mixTo(skin, tex === 'wave' ? '#000000' : '#a05a40', tex === 'wave' ? 0.2 : 0.24), top = '#e9dfcf', brow = mixTo(hair, '#000000', 0.35), shine = mixTo(hair, '#ffffff', 0.34), lash = '#171212';
    var back = tex === 'wave' ? 'M48 112 C44 52 70 24 100 24 C130 24 156 52 152 112 C154 140 150 170 160 200 Q148 214 132 204 Q116 214 100 204 Q84 214 68 204 Q52 214 40 200 C50 170 46 140 48 112Z' : 'M48 112 C44 52 70 24 100 24 C130 24 156 52 152 112 C154 146 150 172 158 194 Q100 204 42 194 C50 172 46 146 48 112Z';
    return '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="' + back + '" fill="' + hair + '"/><rect x="85" y="150" width="30" height="40" fill="' + shade + '"/><path d="M14 240 C14 204 46 192 84 186 L116 186 C154 192 186 204 186 240Z" fill="' + top + '"/><path d="M84 186 Q100 210 116 186Z" fill="' + shade + '"/>'
      + '<ellipse cx="61" cy="118" rx="6" ry="8" fill="' + mixTo(skin, '#000000', 0.1) + '"/><ellipse cx="139" cy="118" rx="6" ry="8" fill="' + mixTo(skin, '#000000', 0.1) + '"/>'
      + '<path d="M63 104 C63 76 80 62 100 62 C120 62 137 76 137 104 C137 140 121 166 100 166 C79 166 63 140 63 104Z" fill="' + skin + '"/>'
      + '<path d="M58 112 C54 70 74 44 100 44 C126 44 146 70 142 112 C138 90 126 72 100 64 C74 72 62 90 58 112Z" fill="' + hair + '"/>'
      + '<path d="M72 60 Q84 50 100 50 M128 60 Q118 50 106 50" stroke="' + shine + '" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>'
      + '<ellipse cx="77" cy="136" rx="10" ry="7" fill="' + o.blush + '" opacity=".6"/><ellipse cx="123" cy="136" rx="10" ry="7" fill="' + o.blush + '" opacity=".6"/>'
      + '<path d="M70 102 Q82 94 95 100 M105 100 Q118 94 130 102" stroke="' + brow + '" stroke-width="2.8" fill="none" stroke-linecap="round"/>'
      + pEye('pbl', 81, 116, 13, o.eye, lash, o.lid, true) + pEye('pbr', 119, 116, 13, o.eye, lash, o.lid, false)
      + '<path d="M97.5 126 Q95 134 97 138 Q100 141 103 138" stroke="' + shade + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
      + '<path d="M87 148 Q93 143 100 145 Q107 143 113 148 Q100 151 87 148Z" fill="' + mixTo(o.lip, '#000000', 0.18) + '"/><path d="M87 148 Q100 151 113 148 Q108 158 100 159 Q92 158 87 148Z" fill="' + o.lip + '"/></svg>';
  }
  var EYEC = { light: { high: '#4d7fae', mediumHigh: '#6b8f6a', medium: '#7a6a45', mediumLow: '#8a8f6e', low: '#a9b7a0' }, deep: { high: '#7fa07a', mediumHigh: '#8a6b2f', medium: '#5a3d22', mediumLow: '#3a2418', low: '#1d120c' } };
  var CONW = { high: 'high', mediumHigh: 'medium-high', medium: 'medium', mediumLow: 'medium-low', low: 'low' };
  function beautyFace(r) {
    var B = BEAUTY[seasonFamily(r.seasonKey)], di = -1; SKINS.forEach(function (x, i) { if (x[0] === r.depthKey) di = i; });
    var skin = di > -1 ? SKINS[di][2] : '#d9a877', shadeName = di > -1 ? SKINS[di][1] : '', grp = di > 7 ? 'deep' : 'light', con = r.contrastLevel || 'medium';
    var ht = (r.life && r.life.hairType) || [], wavy = ht.indexOf('curly') > -1 || ht.indexOf('coily') > -1 || grp === 'deep';
    var o = { skin: skin, hair: B.Hair[0][1], eye: (EYEC[grp] || EYEC.light)[con] || '#7a6a45', lid: B.Eyes[0][1], blush: B.Blush[0][1], lip: B.Lips[0][1] };
    var lg = [['Hair tone', B.Hair[0]], ['Eye shadow', B.Eyes[0]], ['Blush', B.Blush[0]], ['Lips', B.Lips[0]]].map(function (x) { return '<div><i style="background:' + x[1][1] + '"></i><span><b>' + x[0] + '</b>' + E(x[1][0]) + '</span></div>'; }).join('');
    var cap = (r.contrastLevel ? 'Your hair, skin and eyes have <b>' + CONW[con] + ' contrast</b>. ' : '') + 'Here is how your shades look together' + (shadeName ? ' on the <b>' + E(shadeName) + '</b> skin shade you chose' : '') + '.';
    return '<div class="hx-bface"><div class="hx-bsvg">' + portrait(o, wavy ? 'wave' : 'straight') + '</div><div class="hx-blg"><h6>Your shades, together</h6><p>' + cap + '</p>' + lg + '</div></div>';
  }
  function beautyPersona(r) {
    var v = (r.persona && r.persona.vibe) || '', n = (r.persona && r.persona.name) || '', f = dirs(r).feel;
    var T = { tailored: 'Polished and groomed: defined brows, a clean base and a satin lip.', luxury: 'Quiet and expensive: glowy skin, a soft neutral lip and neat, shiny hair.', sleek: 'Clean skin with one sharp feature: a deep lip or a crisp liner.', feminine: 'Soft and romantic: rosy cheeks, a glossy lip and soft waves or smooth hair.', casual: 'Skin first: a light base, tinted lip balm and easy, natural hair.', bold: 'Pick one statement feature, like a vivid lip or graphic liner, and keep the rest simple.', classic: 'Classic and balanced: groomed brows, a definite lip in your shades and neat hair.', sporty: 'Fresh and low-maintenance: tinted SPF, clear or tinted gloss and hair that stays put.' };
    var t = T[v] || 'Start with your shades and keep the rest simple.';
    if (f.indexOf('confident') > -1 || f.indexOf('expressive') > -1) t += ' You want to feel confident, so do not be afraid to go one shade bolder.';
    else if (f.indexOf('comfy') > -1) t += ' You want to feel comfortable, so choose lightweight formulas.';
    return (n ? E(n) + ': ' : '') + E(t);
  }
  function beautyContrast(r) {
    var con = r.contrastLevel || '', hiC = con === 'high' || con === 'mediumHigh', loC = con === 'low' || con === 'mediumLow', ch = r.chromaKey || '';
    if (hiC) return 'Your hair, skin and eyes contrast clearly, so a defined lip or eye holds up on you.';
    if (loC) return 'Your coloring blends softly, so choose sheer or satin finishes over very sharp, dark definition.';
    if (ch === 'bright') return 'Your coloring is clear and vivid, so a bright lip is the fastest way to bring your palette to your face.';
    return 'Start with lip color. It is the fastest way to bring your palette to your face.';
  }
  function hairNotes(r) {
    var L = r.life || {}, hts = Array.isArray(L.hairType) ? L.hairType : (L.hairType ? [L.hairType] : []); if (!hts.length && !L.hairLen) return '';
    var T = { straight: 'Straight hair shows off a clean cut and shine. Keep the ends neat and add a light smoothing serum.', wavy: 'Wavy hair loves a light mousse or cream to define the waves. Skip heavy products that weigh them down.', curly: 'Curly hair loves moisture. Use a leave-in and a gentle definer, and keep a shape that stays balanced around your face.', coily: 'Coily hair thrives on moisture. Use a water-based leave-in sealed with a light oil or butter. Twist-outs, braid-outs and puffs show off your texture, and a satin bonnet protects it at night.', varies: 'You switch your hair up a lot, so the hair tones above work for any style. Pick the shade you want to wear next, and keep a gloss or color-depositing mask for in-between looks.', protective: 'Protective styles give your hair a rest. Keep your scalp moisturized and your edges gentle, and add color or accessories in your shades to tie the look to your palette.', wig: 'Wigs and extensions let you try your hair tones with no commitment. Choose a lace color that matches your skin and a shade from your hair tones.' };
    var N = { short: 'Short hair puts your face and earrings in focus, so a bold earring in your metal tone works well.', medium: 'Medium length is flexible, and layers add movement.', long: 'Long hair looks best with fresh ends and a little face-framing.' };
    return '<div class="hx-box" style="margin-top:10px"><h6>For your hair</h6><p>' + E(hts.slice(0, 2).map(function (h) { return T[h]; }).concat([N[L.hairLen]]).filter(Boolean).join(' ')) + '</p></div>';
  }
  function beautyBlock(r) {
    var B = BEAUTY[seasonFamily(r.seasonKey)];
    var order = ['Lips', 'Blush', 'Eyes', 'Nails', 'Hair'];
    var cards = order.map(function (k) { return '<div class="hx-box"><h6>' + (k === 'Hair' ? 'Hair tones' : k) + '</h6>' + B[k].map(function (c) { return '<div class="hx-bt"><i style="background:' + c[1] + '"></i><span>' + c[0] + '</span></div>'; }).join('') + '</div>'; }).join('');
    cards += '<div class="hx-box"><h6>Metal tone</h6><p>' + E(r.metal) + '</p><h6 style="margin-top:10px">Skip</h6><p>' + E(B.Skip) + '.</p></div>';
    return { key: 'beauty', label: 'Hair, Makeup & Nails', html: '<div class="hx-page">' + head('Hair, makeup &amp; <em>nails</em>', 'The same coloring that guides your clothes also guides your beauty shopping.') + beautyFace(r) + '<div class="hx-3b">' + cards + '</div>' + label('How to choose') + '<div class="hx-3"><div class="hx-box"><h6>For your style</h6><p>' + beautyPersona(r) + '</p></div><div class="hx-box"><h6>Test in daylight</h6><p>Swatch on your jawline near a window. The right shade looks natural, not heavy.</p></div><div class="hx-box"><h6>For your contrast</h6><p>' + beautyContrast(r) + '</p></div></div>' + hairNotes(r) + '<div class="hx-tip">Screenshot this page and show it at the beauty counter or to your hair colorist. Shades are a starting point; texture and finish change how a color looks on you.</div></div>' };
  }

  /* ---------- 5. dress your shape ---------- */
  function G(k, col) {
    var f = col, w = '#fff';
    var s = {
      puff: '<ellipse cx="22" cy="40" rx="20" ry="17" fill="' + f + '"/><ellipse cx="98" cy="40" rx="20" ry="17" fill="' + f + '"/><path d="M34 34 Q60 52 86 34 L90 118 Q60 130 30 118 Z" fill="' + f + '"/><path d="M42 36 Q60 56 78 36" fill="none" stroke="' + w + '" stroke-opacity=".5" stroke-width="3"/>',
      bardot: '<path d="M10 44 Q60 26 110 44 L100 108 Q60 122 20 108 Z" fill="' + f + '"/><path d="M12 46 Q60 30 108 46" fill="none" stroke="' + w + '" stroke-opacity=".45" stroke-width="4"/>',
      halter: '<path d="M40 8 L60 56 L80 8 L84 56 Q100 84 90 122 Q60 136 30 122 Q20 84 36 56 Z" fill="' + f + '"/><path d="M44 74 Q60 84 76 74 M40 92 Q60 102 80 92 M38 108 Q60 118 82 108" fill="none" stroke="' + w + '" stroke-opacity=".4" stroke-width="2.5"/>',
      bag: '<path d="M30 52 L90 52 L100 126 Q60 138 20 126 Z" fill="' + f + '"/><path d="M40 52 C40 14 80 14 80 52" fill="none" stroke="' + f + '" stroke-width="7" stroke-linecap="round"/><path d="M30 52 L90 52" stroke="' + w + '" stroke-opacity=".45" stroke-width="3"/><rect x="54" y="62" width="12" height="10" rx="2" fill="' + w + '" fill-opacity=".6"/>',
      shoe: '<path d="M26 14 L62 14 L62 76 Q76 86 100 96 Q114 102 108 116 L24 116 Z" fill="' + f + '"/><path d="M24 116 L24 134 L46 134 L46 116" fill="' + f + '"/><path d="M62 76 Q40 70 26 60" fill="none" stroke="' + w + '" stroke-opacity=".45" stroke-width="2.6"/>',
      coat: '<path d="M36 8 L52 8 L60 24 L68 8 L84 8 L112 34 L108 148 L66 150 L66 44 L60 34 L54 44 L54 150 L12 148 L8 34 Z" fill="' + f + '"/><path d="M54 44 L60 34 L66 44 M12 92 L108 92" fill="none" stroke="' + w + '" stroke-opacity=".5" stroke-width="2.6"/><circle cx="60" cy="68" r="2.4" fill="' + w + '" fill-opacity=".7"/>',
      blouse: '<path d="M36 12 L50 12 L60 24 L70 12 L84 12 L110 36 L102 86 L88 82 L86 126 Q60 134 34 126 L32 82 L18 86 L10 36 Z" fill="' + f + '"/><path d="M60 24 L60 128 M50 12 L60 24 L54 36 L42 22 Z M70 12 L60 24 L66 36 L78 22 Z" fill="none" stroke="' + w + '" stroke-opacity=".55" stroke-width="2.6" stroke-linejoin="round"/><circle cx="64" cy="58" r="1.8" fill="' + w + '" fill-opacity=".7"/><circle cx="64" cy="82" r="1.8" fill="' + w + '" fill-opacity=".7"/><circle cx="64" cy="106" r="1.8" fill="' + w + '" fill-opacity=".7"/>',
      blazer: '<path d="M34 10 L48 10 L60 46 L72 10 L86 10 L110 34 L106 134 L72 138 L72 72 L60 54 L48 72 L48 138 L14 134 L10 34 Z" fill="' + f + '"/><path d="M48 10 L60 46 L72 10 M48 72 L60 54 L72 72" fill="none" stroke="' + w + '" stroke-opacity=".55" stroke-width="2.6" stroke-linejoin="round"/><circle cx="66" cy="100" r="2.2" fill="' + w + '" fill-opacity=".7"/>',
      pencil: '<path d="M36 10 L84 10 L88 22 L86 130 Q60 140 34 130 L32 22 Z" fill="' + f + '"/><rect x="36" y="10" width="48" height="12" fill="#000" fill-opacity=".18"/><path d="M60 104 L60 132" stroke="' + w + '" stroke-opacity=".55" stroke-width="2.4"/>',
      sheath: '<path d="M42 8 L52 8 Q60 22 68 8 L78 8 L84 34 L80 72 L86 142 Q60 152 34 142 L40 72 L36 34 Z" fill="' + f + '"/><path d="M40 72 Q60 78 80 72" fill="none" stroke="' + w + '" stroke-opacity=".5" stroke-width="3"/>',
      vneck: '<path d="M36 14 L50 14 L60 42 L70 14 L84 14 L110 38 L98 58 L86 50 L86 126 Q60 132 34 126 L34 50 L22 58 L10 38 Z" fill="' + f + '"/><path d="M50 14 L60 42 L70 14" fill="none" stroke="' + w + '" stroke-opacity=".55" stroke-width="3"/>',
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
  var NAMES = { puff: 'Puff sleeve', bardot: 'Off-shoulder', halter: 'Gathered halter', vneck: 'V-neck top', blouse: 'Button-up blouse', blazer: 'Tailored blazer', pencil: 'Pencil skirt', sheath: 'Sheath', bag: 'Bag', shoe: 'Shoes', coat: 'Coat', wrap: 'Wrap top', peplum: 'Peplum', corset: 'Corset', askirt: 'A-line or pleated skirt', wide: 'Wide-leg jeans', trouser: 'Trousers', flare: 'Fit and flare', aline: 'A-line', ruffle: 'Ruffle' };
  var DRESS_ROWS = {
    rectangle: { sub: 'Create curves: add some fullness up top and show your waist.', rows: [['Tops that add fullness up top', 'Gives your shoulders and bust more shape', ['puff', 'bardot', 'halter']], ['Tops that show your waist', 'Nips in at the waist so you get a waistline', ['vneck', 'peplum', 'corset']], ['Bottoms with some fullness', 'Adds shape to your lower half', ['askirt', 'wide', 'trouser']], ['Dresses that show your waist', 'Nip in at the waist and flare out below', ['flare', 'aline', 'ruffle']]] },
    hourglass: { sub: 'Follow your natural curves and keep your waist in view.', rows: [['Tops that follow your curves', 'Fit close at the bust and waist', ['vneck', 'corset', 'halter']], ['Tops that mark your waist', 'Fitted at the waist, or a shape that nips in', ['peplum', 'bardot']], ['Bottoms that skim your hips', 'Show your waist and skim over the hips', ['trouser', 'askirt']], ['Dresses that follow your waist', 'Belted or fitted at the waist', ['flare', 'aline']]] },
    pear: { sub: 'Add interest on top and keep your lower half simple.', rows: [['Tops that add interest up top', 'Detail at the shoulders and bust draws the eye up', ['puff', 'bardot', 'halter']], ['Tops that nip in at the waist', 'Fitted at the waist and simple at the hip', ['vneck', 'corset']], ['Simple, clean bottoms', 'A-line and straight shapes with no extra detail at the hip', ['askirt', 'trouser']], ['Dresses that flare out', 'Flare out from the waist to balance fuller hips', ['flare', 'aline']]] },
    apple: { sub: 'Draw the eye up and let fabric fall softly over your middle.', rows: [['Tops with open, soft necklines', 'Open necklines and soft, flowing fabric', ['vneck', 'halter']], ['Tops that draw the eye up', 'Detail at the shoulders keeps attention up high', ['puff', 'bardot']], ['Comfortable bottoms that skim', 'Mid-rise shapes that skim over the middle', ['wide', 'trouser', 'askirt']], ['Dresses that flow from the bust', 'Fall from just under the bust and skim over the middle', ['aline', 'flare', 'ruffle']]] },
    inverted: { sub: 'Soften your shoulders and add some fullness lower down.', rows: [['Tops with soft, open necklines', 'Simple, open necklines soften broad shoulders', ['vneck', 'halter']], ['Tops that flare at the hem', 'A flared hem adds fullness at the hips', ['peplum', 'corset']], ['Bottoms with fullness', 'Adds fullness below to balance your shoulders', ['wide', 'askirt', 'trouser']], ['Dresses with a flowing skirt', 'A flowing skirt adds balance', ['aline', 'flare', 'ruffle']]] }
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
      var pq = [vibeWord(r), String(NAMES[row[2][0]] || row[0]).toLowerCase(), row[0].toLowerCase().indexOf('dress') > -1 ? 'dress' : '', 'outfits', String(r.bodyShapeLabel || '').toLowerCase().replace(/\s*shape$/, '') + ' body'].filter(Boolean).join(' ');
      var pu = pinUrl(pq);
      return '<div class="hx-grow"><div class="hx-fig">' + fig + '</div><div class="hx-gb"><h5>' + row[0] + '</h5><div class="hx-gis">' + items + '</div><p>' + row[1] + ' <a class="hx-pin" style="display:inline;margin-left:6px" href="' + E(pu) + '" target="_blank" rel="noopener" data-href="' + E(pu) + '">Pinterest ideas</a></p></div></div>';
    }).join('');
    var Dd = dirs(r);
    var HT = { petite: 'As a petite frame, keep rises and hems sharp and use one-color columns to lengthen.', tall: 'At your height, longline pieces, maxi lengths and wide legs carry well.', average: 'At an average height most lengths work, so choose by the proportion that flatters you.' };
    var PR = { longTorso: 'Your longer torso likes a high-rise bottom and a slightly shorter top, with a belt at your natural waist.', longLegs: 'Your longer legs carry midi and maxi lengths, lower rises and wide legs.', balanced: 'Your balanced proportions make rise and hem flexible, so dress for the occasion.' };
    var showT = Dd.show.length ? 'You like to show off ' + listW(Dd.show.map(function (z) { return ZN[z]; })) + '. Look for ' + listW(Dd.show.map(function (z) { return SHOWN[z]; })) + '.' : FIT_NOTES[1][1];
    var quietT = Dd.quiet.length ? 'You prefer less attention on ' + listW(Dd.quiet.map(function (z) { return ZN[z]; })) + '. Try ' + listW(Dd.quiet.map(function (z) { return QUIETN[z]; })) + '.' : 'You said you love it all, so you can wear any of these cuts. Pick by mood and occasion.';
    var notes = [['Your height and proportions', (HT[r.height] || HT.average) + ' ' + (PR[r.proportion] || PR.balanced)], [Dd.show.length ? 'What you like to show' : FIT_NOTES[1][0], showT], ['What you prefer quieter', quietT]].map(function (a) { return '<div class="hx-box"><h6>' + a[0] + '</h6><p>' + a[1] + '</p></div>'; }).join('');
    return { key: 'dress', label: 'Dress Your Shape', html: '<div class="hx-page">' + head('Dress your <em>shape</em>', E(String(shapeWord)) + ': ' + D.sub.charAt(0).toLowerCase() + D.sub.slice(1)) + rows + label('Fit notes, from your answers') + '<div class="hx-3">' + notes + '</div></div>' };
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
  /* Picks a different top, bottom and dress for each occasion from the pieces that suit her shape,
     leaning on the occasion, her style persona, how she likes to dress, and what she likes to show or keep quiet. */
  function pickGarments(r, D, occs) {
    var uniq = function (a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); };
    var avail = { top: uniq(D.rows[0][2].concat(D.rows[1][2])).concat(['blouse']), bot: D.rows[2][2].slice(), dr: D.rows[3][2].slice() };
    if (r.bodyShapeKey === 'hourglass' || r.bodyShapeKey === 'rectangle') { avail.bot.push('pencil'); avail.dr.push('sheath'); }
    var OP = { work: { top: ['blouse', 'peplum', 'vneck'], bot: ['trouser', 'pencil', 'askirt'], dr: ['sheath', 'aline', 'flare'] }, dates: { top: ['corset', 'halter', 'bardot', 'vneck'], bot: ['askirt', 'trouser'], dr: ['flare', 'ruffle', 'aline'] }, photos: { top: ['puff', 'bardot', 'halter', 'vneck'], bot: ['wide', 'askirt'], dr: ['ruffle', 'flare'] }, travel: { top: ['vneck', 'puff', 'peplum'], bot: ['wide', 'trouser'], dr: ['aline', 'flare'] }, everyday: { top: ['vneck', 'puff', 'blouse', 'peplum', 'bardot'], bot: ['wide', 'trouser', 'askirt'], dr: ['aline', 'flare'] }, special: { top: ['corset', 'halter', 'bardot', 'peplum'], bot: ['askirt', 'trouser'], dr: ['flare', 'ruffle', 'aline'] } };
    var VP = { tailored: { top: ['peplum', 'vneck'], bot: ['trouser'], dr: ['aline'] }, classic: { top: ['peplum', 'vneck'], bot: ['trouser', 'askirt'], dr: ['aline', 'flare'] }, feminine: { top: ['vneck', 'bardot'], bot: ['askirt'], dr: ['ruffle', 'flare'] }, bold: { top: ['halter', 'corset', 'bardot'], bot: ['wide'], dr: ['flare', 'ruffle'] }, casual: { top: ['puff', 'vneck'], bot: ['wide'], dr: ['aline'] }, sleek: { top: ['corset', 'halter'], bot: ['trouser'], dr: ['aline'] }, luxury: { top: ['vneck', 'bardot'], bot: ['trouser'], dr: ['aline'] }, sporty: { top: ['vneck', 'puff'], bot: ['wide'], dr: ['aline'] } };
    var GP = { flowy: { top: ['vneck', 'bardot'], bot: ['askirt', 'wide'], dr: ['aline', 'flare', 'ruffle'] }, fitted: { top: ['peplum', 'corset'], bot: ['trouser'], dr: ['flare'] }, waist: { top: ['corset', 'vneck', 'peplum'], bot: ['askirt'], dr: ['flare'] }, oversized: { top: ['puff'], bot: ['wide'], dr: ['aline'] }, bodyskim: { top: ['corset', 'vneck'], bot: ['trouser'], dr: ['flare'] }, cropped: { top: ['corset', 'halter'], bot: ['trouser', 'wide'], dr: [] }, layered: { top: ['vneck', 'puff'], bot: ['trouser'], dr: ['aline'] } };
    var SP = { shoulders: { top: ['bardot', 'halter'] }, neckline: { top: ['halter', 'vneck'] }, arms: { top: ['halter'] }, back: { top: ['halter'] }, waist: { top: ['corset', 'peplum', 'vneck'], dr: ['flare'] }, legs: { bot: ['askirt'], dr: ['flare', 'aline'] } };
    var Dd = dirs(r), vibe = (r.persona && r.persona.vibe) || '', used = { top: {}, bot: {}, dr: {} };
    var quietMid = Dd.quiet.indexOf('midsection') > -1, quietUp = Dd.quiet.indexOf('arms') > -1 || Dd.quiet.indexOf('shoulders') > -1;
    return occs.map(function (occ) {
      var out = {};
      ['top', 'bot', 'dr'].forEach(function (cat) {
        var best = null, bs = -99;
        /* work must read professional: only polished pieces are allowed there, whatever else she likes */
        var WL = { work: { top: ['blouse', 'peplum'], bot: ['trouser', 'pencil'], dr: ['sheath', 'aline'] } };
        var dcode = (r.life && r.life.dressCode) || '';
        if (dcode === 'businessCasual') WL = { work: { top: ['blouse', 'peplum', 'vneck'], bot: ['trouser', 'pencil', 'askirt'], dr: ['sheath', 'aline', 'flare'] } };
        else if (dcode === 'creative') WL = {};
        else if (dcode === 'remote') WL = { work: { top: ['blouse', 'vneck', 'puff', 'bardot', 'peplum'], bot: ['wide', 'trouser', 'askirt', 'pencil'], dr: ['aline', 'flare', 'sheath'] } };
        var pool = avail[cat];
        if (WL[occ]) { var f = pool.filter(function (x) { return WL[occ][cat].indexOf(x) > -1; }); if (f.length) pool = f; }
        pool.forEach(function (g, gi) {
          var sc = 0, op = (OP[occ] || OP.everyday)[cat], ix = op.indexOf(g);
          sc += ix > -1 ? (op.length - ix) * 1.2 : 0;
          if ((VP[vibe] && VP[vibe][cat] || []).indexOf(g) > -1) sc += 1.6;
          if ((GP[r.styleGrav] && GP[r.styleGrav][cat] || []).indexOf(g) > -1) sc += 1;
          Dd.show.forEach(function (z) { if ((SP[z] && SP[z][cat] || []).indexOf(g) > -1) sc += 0.8; });
          if (quietMid && g === 'corset') sc -= 1.5;
          if (quietUp && (g === 'halter' || g === 'bardot')) sc -= 1;
          sc -= 2.6 * (used[cat][g] || 0);
          sc -= gi * 0.01;
          if (sc > bs) { bs = sc; best = g; }
        });
        used[cat][best] = (used[cat][best] || 0) + 1; out[cat] = best;
      });
      return out;
    });
  }
  function formulasBlock(r) {
    var P = pal(r), d = (r.directions && r.directions.worksBest && r.directions.worksBest.length) ? r.directions.worksBest : ['everyday', 'work', 'dates'];
    var pers = r.persona || null, dsep = r.dressSep || '', sgrav = r.styleGrav || '';
    var key = DRESS_ROWS[r.bodyShapeKey] ? r.bodyShapeKey : 'rectangle', D = DRESS_ROWS[key];
    var picks = pickGarments(r, D, d.slice(0, 3));
    var combos = [[P.neu[1], P.sig[0], P.acc[0]], [P.neu[3], P.sig[2], P.acc[0]], [P.neu[0], P.sig[1], P.acc[1]]];
    var cards = d.slice(0, 3).map(function (k, i) {
      var o = OCC[k]; if (!o) return ''; var c = combos[i % 3], pk = picks[i];
      var top = NAMES[pk.top] || 'V-neck top', bot = NAMES[pk.bot] || 'Trousers', dr = NAMES[pk.dr] || 'A-line';
      var ico = '<svg viewBox="0 0 120 150" fill="#FAF9F6" stroke="#181716" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" width="46" height="58">' + OCC_ICON[o[1]] + '</svg>';
      return '<div class="hx-occ"><div class="hx-occh">' + ico + '<h4>' + o[0] + '</h4></div>'
        + '<div class="hx-fm"><span>' + chip(c[0]) + '<b>Base</b>' + E(c[0].n) + '</span><span>' + chip(c[1]) + '<b>Main</b>' + E(c[1].n) + '</span><span>' + chip(c[2]) + '<b>Pop</b>' + E(c[2].n) + '</span></div>'
        + '<div class="hx-fg"><div>' + G(pk.top, c[1].h) + '<span>' + E(top) + '</span></div><div>' + G(pk.bot, c[0].h) + '<span>' + E(bot) + '</span></div><div>' + G(pk.dr, c[1].h) + '<span>' + E(dr) + ' dress</span></div>' + (k === 'work' ? '<div>' + G('blazer', c[0].h) + '<span>Tailored blazer</span></div>' : '') + '</div>'
        + '<p class="hx-try"><b>Try:</b> ' + (dsep === 'dresses' ? E(dr) + ' dress first, or ' + E(top) + ' + ' + E(bot) + '.' : sgrav === 'sets' ? 'a matching ' + E(top) + ' + ' + E(bot) + ' set, or ' + E(dr) + ' dress.' : E(top) + ' + ' + E(bot) + ', or ' + E(dr) + ' dress.') + (k === 'work' ? ' Add a tailored blazer on top.' : '') + '</p>'
        + '<ul>' + o[2].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>';
    }).join('');
    return { key: 'formulas', label: 'Outfit Formulas', html: '<div class="hx-page">' + head('Outfit <em>formulas</em>', 'You asked for outfits that work best for ' + E(listW(d.slice(0, 3).map(function (w) { return OCCN[w]; }))) + '. Build each one from your own colors' + (dsep === 'dresses' ? ', and lead with dresses since they work best on you.' : dsep === 'separates' ? ', and lead with separates since they work best on you.' : '.')) + cards + '<div class="hx-tip" style="margin-top:8px;text-align:left">' + (pers && pers.formula ? '<b>Your ' + E(pers.name) + ' formula:</b> ' + E(pers.formula.join(' + ')) + '. ' : '') + 'Want these built into real outfits from your closet? That is what a styling session is for. Try Style-11 for a free outfit idea any time.</div></div>' };
  }

  /* ---------- 7. patterns (chosen from the client's own answers) ---------- */
  var PAT_IMG = 'images/report/patterns/';
  function patternsBlock(r) {
    var P = pal(r), N = P.neu, S = P.sig, A = P.acc, d = r.directions || {}, so = d.showOff || [], q = d.quiet || [], feel = d.feel || [];
    var vibe = (r.persona && r.persona.vibe) || '', pname = (r.persona && r.persona.name) || '', season = r.seasonLabel || '';
    var warm = /spring|autumn/i.test(r.seasonKey || ''), con = r.contrastLevel || '', chr = r.chromaKey || '';
    var hi = con === 'high' || con === 'mediumHigh', lo = con === 'low' || con === 'mediumLow';
    var lum = function (h) { var c = [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; };
    var byL = N.slice().sort(function (a, b) { return lum(a.h) - lum(b.h); }), darkN = byL[0], lightN = byL[byL.length - 1];
    var navy = darkN.h, cream = lum(lightN.h) >= 0.62 ? lightN.h : '#F3EDE3', creamN = lum(lightN.h) >= 0.62 ? lightN.n : 'Cream';
    var flo = (function () { var s2 = '', xs = [[18, 18], [56, 30], [94, 16], [30, 58], [72, 66], [108, 54], [16, 100], [56, 108], [96, 100], [36, 130], [80, 134]]; xs.forEach(function (p2, i) { var c = S[i % 6].h; s2 += '<g transform="translate(' + p2[0] + ' ' + p2[1] + ')"><circle r="9" cx="0" cy="-8" fill="' + E(c) + '"/><circle r="9" cx="8" cy="0" fill="' + E(c) + '"/><circle r="9" cx="0" cy="8" fill="' + E(c) + '"/><circle r="9" cx="-8" cy="0" fill="' + E(c) + '"/><circle r="4" fill="' + E(A[0].h) + '"/></g>'; }); return '<svg viewBox="0 0 130 140" preserveAspectRatio="xMidYMid slice"><rect width="130" height="140" fill="' + E(cream) + '"/>' + s2 + '</svg>'; })();
    var img = function (f) { return '<img src="' + PAT_IMG + f + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block">'; };
    /* id, name, colors, line, css background, art html, personas it suits, warm (1 warm, -1 cool), contrast (1 higher, -1 softer), chroma */
    var LIB = [
      ['zebra', 'Zebra', 'Charcoal + white', 'Use it as an accent: a bag, scarf or shoe with solid neutrals.', '', img('zebra.jpg'), ['bold', 'sleek', 'tailored'], -1, 1, 'bright'],
      ['leopard', 'Leopard', 'Camel + cognac', 'Pairs with ' + E(S[2].n) + '. Let it be the only pattern in the outfit.', '', img('leopard.jpg'), ['bold', 'luxury', 'casual'], 1, 0, ''],
      ['crocred', 'Croc emboss, red', 'Cherry red', 'A texture, not a print. Perfect for bags, belts and shoes.', '', img('croc-red.jpg'), ['luxury', 'sleek', 'tailored'], 0, 1, 'bright'],
      ['tortoise', 'Tortoise', 'Antique gold + cognac', 'Warm and glossy. Ideal for sunglasses, hair clips and buttons.', '', img('tortoise.jpg'), ['luxury', 'feminine', 'classic'], 1, -1, 'blended'],
      ['crocog', 'Croc emboss, cognac', 'Cognac leather + camel', 'The warm version of croc. Beautiful on boots, belts and bags.', '', img('croc-cognac.jpg'), ['luxury', 'classic', 'tailored'], 1, -1, 'blended'],
      ['polka', 'Polka dot', warm ? 'Brown + cream' : 'Navy + white', 'Timeless. Works as a dress, blouse or scarf.', '', img(warm ? 'polka-warm.jpg' : 'polka-cool.jpg'), ['classic', 'feminine', 'tailored'], 0, 1, 'bright'],
      ['stripe', 'Breton stripe', warm ? 'Rust + cream' : 'Navy + white', 'Classic and easy. Great for tops, knits and scarves.', '', img(warm ? 'stripe-warm.jpg' : 'stripe-cool.jpg'), ['casual', 'sporty', 'classic'], 0, 1, ''],
      ['gingham', 'Gingham', 'Blue + white', 'Fresh and friendly. Keep the rest of the outfit solid.', '', img('gingham.jpg'), ['feminine', 'casual', 'sporty'], -1, 0, 'bright'],
      ['plaid', 'Plaid', warm ? 'Olive + rust' : 'Navy + gray', 'Structured and polished. Choose one in your colors.', '', img(warm ? 'plaid-warm.jpg' : 'plaid-cool.jpg'), ['tailored', 'classic', 'luxury', 'sporty', 'casual'], 0, 0, 'blended'],
      ['floral', 'Ditsy floral', 'Blue + cream', 'Soft and feminine. Small flowers close together read as a quiet pattern.', '', img('floral-ditsy.jpg'), ['feminine', 'casual'], -1, -1, ''],
      ['hound', 'Houndstooth', 'Black + white', 'A classic for blazers, skirts and coats. Wear it with solid black or white.', '', img('houndstooth.jpg'), ['tailored', 'classic', 'sleek'], 0, 1, 'bright'],
      ['pinstripe', 'Pinstripe', 'Navy + white', 'Sharp and professional. Best in a suit, blazer or trouser.', '', img('pinstripe.jpg'), ['tailored', 'sleek', 'classic'], 0, 1, ''],
      ['snake', 'Snake print', 'Tan + brown', 'A neutral that acts like a print. Great on boots, bags and blouses.', '', img('snake.jpg'), ['bold', 'luxury', 'casual'], 1, 0, 'blended'],
      ['bigfloral', 'Large floral', 'Burgundy + blush', 'Big flowers make a statement. Wear on a dress or skirt and keep the top simple.', '', img('floral-large.jpg'), ['feminine', 'bold', 'luxury'], 1, 0, 'blended'],
      ['watercolor', 'Watercolor print', 'Rose + dusty blue', 'Soft edges and blended color. Pretty on a scarf, blouse or flowy dress.', '', img('watercolor.jpg'), ['feminine', 'casual', 'luxury'], 0, -1, 'blended'],
      ['paisley', 'Paisley', 'Rust + deep red', 'Rich and vintage. Try it as a scarf, blouse or lining.', '', img('paisley.jpg'), ['luxury', 'classic', 'casual'], 1, 0, 'blended']
    ];
    var FEEL = { expressive: ['leopard', 'zebra', 'floral', 'crocred', 'paisley', 'bigfloral', 'snake'], trend: ['leopard', 'zebra', 'crocred', 'tortoise', 'snake', 'watercolor'], elegant: ['crocog', 'tortoise', 'polka', 'crocred', 'paisley', 'hound'], comfy: ['stripe', 'gingham', 'plaid'], feminine: ['floral', 'gingham', 'polka', 'tortoise', 'bigfloral', 'watercolor'], confident: ['leopard', 'zebra', 'crocred', 'snake', 'hound', 'pinstripe'] };
    var FEELW = { expressive: 'express yourself', trend: 'feel stylish and on-trend', elegant: 'feel elegant', comfy: 'feel comfortable', feminine: 'feel feminine', confident: 'feel confident' };
    var scored = LIB.map(function (t, i) {
      var parts = [], vi = t[6].indexOf(vibe);
      if (vi > -1) parts.push([vi < 2 ? 3 : 2, pname ? 'Matches your ' + pname + ' style.' : 'Matches your style direction.']);
      if (t[7] !== 0) parts.push([t[7] === (warm ? 1 : -1) ? 1.2 : -1, warm ? 'Warm tones like this sit well with your ' + season + ' coloring.' : 'Crisp, cooler tones like this suit your ' + season + ' coloring.']);
      if (con && t[8] !== 0) parts.push([(t[8] === 1 && hi) || (t[8] === -1 && lo) ? 1.1 : ((t[8] === 1 && lo) || (t[8] === -1 && hi) ? -1 : 0), hi ? 'Your higher-contrast coloring can carry a bold print.' : 'Your softer, lower-contrast coloring suits a tonal pattern like this.']);
      if (chr && t[9]) parts.push([t[9] === 'blended' ? (chr === 'bright' ? -1 : 1) : (t[9] === chr ? 1 : (chr === 'blended' ? 0 : -1)), chr === 'bright' ? 'Clear, vivid patterns match your bright coloring.' : 'Soft, muted patterns match your blended coloring.']);
      feel.forEach(function (f) { if ((FEEL[f] || []).indexOf(t[0]) > -1) parts.push([1, 'You want to ' + FEELW[f] + ', and this pattern helps with that.']); });
      var total = 0, best = [0, 'A dependable pattern that works with your palette.']; parts.forEach(function (x) { total += x[0]; if (x[0] > best[0]) best = x; });
      return { t: t, total: total, why: best[1], i: i };
    }).sort(function (a, b) { return b.total - a.total || a.i - b.i; }).slice(0, 6);
    var tl = scored.map(function (o) { var t = o.t; return '<div class="hx-pt"><div class="hx-pc" style="' + (t[4] ? 'background:' + t[4] + ';' : '') + '">' + (t[5] || '') + '</div><h5>' + t[1] + '</h5><small>' + t[2] + '</small><p>' + t[3] + '</p><p class="hx-why">' + E(o.why) + '</p></div>'; }).join('');
    var scale = r.height === 'petite' ? 'small to medium scale prints, so the pattern is not bigger than you' : r.height === 'tall' ? 'medium to large scale prints, which suit your height' : 'any scale you like';
    var tips = [];
    var quietLow = q.indexOf('midsection') > -1 || q.indexOf('hips') > -1, quietLegs = q.indexOf('legs') > -1;
    if (quietLow) tips.push('You prefer less attention on your midsection or hips, so keep prints on your top half, a scarf or a bag, and wear a solid below.');
    else if (quietLegs) tips.push('You prefer less attention on your legs, so keep prints above the waist and wear solid bottoms.');
    else if (so.indexOf('legs') > -1) tips.push('You like to show off your legs, so try a printed midi skirt or a patterned wide-leg pant.');
    if (so.indexOf('waist') > -1 && !quietLow) tips.push('You like to show your waist, so wear a printed dress with a belt to keep it in focus.');
    if (['shoulders', 'neckline', 'arms', 'back'].some(function (x) { return so.indexOf(x) > -1; })) tips.push('You like to show off your upper body, so put the print in a top, a scarf or a detail near the neckline.');
    tips.push('Scale: choose ' + scale + '.');
    var tipHtml = '<div class="hx-box" style="margin-top:12px"><h6>Where to wear prints, for you</h6><ul class="hx-ul">' + tips.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul></div>';
    var sub = 'Picked for your ' + E(season || 'coloring') + (pname ? ' and your ' + E(pname) + ' style' : '') + '. Keep the colors inside your wheel and any pattern will look intentional.';
    return { key: 'patterns', label: 'Patterns', html: '<div class="hx-page">' + head('Patterns you <em>can wear</em>', sub) + '<div class="hx-pgrid">' + tl + '</div>' + tipHtml + '<div class="hx-tip" style="margin-top:10px">One pattern per outfit. Let it be the star and keep everything else solid.</div></div>' };
  }

  /* real fabric photos, tinted to the client's own colors (denim and leather stay natural) */
  var FABP = { crepe: ['crepe.jpg', 'n1'], ponte: ['ponte.jpg', 'n3'], denim: ['denim.jpg', null], wool: ['wool.jpg', 'n2'], knit: ['knit.jpg', 's2'], linen: ['linen.jpg', 'n0'], leather: ['leather.jpg', null], jersey: ['jersey.jpg', 'n2'], boucle: ['boucle.jpg', 'n0'], poplin: ['poplin.jpg', 'n0'] };
  function tintImage(im, hex) {
    var w = 480, h = 320, c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h), px = d.data, n = px.length / 4, sum = 0, i;
    for (i = 0; i < px.length; i += 4) sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    var mean = sum / n / 255 || 0.5, rgb = [1, 3, 5].map(function (k) { return parseInt(hex.substr(k, 2), 16); });
    for (i = 0; i < px.length; i += 4) {
      var l = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255, v = Math.max(0, Math.min(1, 0.55 + (l - mean) * 1.15));
      for (var k = 0; k < 3; k++) px[i + k] = v < 0.55 ? rgb[k] * (v / 0.55) : rgb[k] + (255 - rgb[k]) * ((v - 0.55) / 0.45) * 0.55;
    }
    x.putImageData(d, 0, 0); return c.toDataURL('image/jpeg', 0.86);
  }
  function prep(r) {
    var P = pal(r), pick = { n0: P.neu[0], n1: P.neu[1], n2: P.neu[2], n3: P.neu[3], s2: P.sig[2] }; r.__fab = {};
    return Promise.all(Object.keys(FABP).map(function (id) {
      return new Promise(function (res) {
        var im = new Image();
        im.onload = function () { try { r.__fab[id] = FABP[id][1] ? tintImage(im, pick[FABP[id][1]].h) : 'images/report/fabrics/' + FABP[id][0]; } catch (e) {} res(); };
        im.onerror = function () { res(); };
        im.src = 'images/report/fabrics/' + FABP[id][0];
      });
    }));
  }
  /* ---------- 8. fabrics (chosen from the client's answers; swatches are drawn placeholders until real photos are added) ---------- */
  function fabricsBlock(r) {
    var P = pal(r), N = P.neu, S = P.sig, A = P.acc, D = dirs(r), good = String((r.bodyGuide && r.bodyGuide.fabGood) || ''), bad = String((r.bodyGuide && r.bodyGuide.fabAvoid) || '');
    var vibe = (r.persona && r.persona.vibe) || '', pname = (r.persona && r.persona.name) || '', season = r.seasonLabel || '';
    var heavy = /autumn|winter/i.test(r.seasonKey || ''), ch = r.chromaKey || '', tier = (r.shopTier && r.shopTier.key) || '';
    var invest = tier === 'invest', budget = tier === 'budget';
    var sh = function (c) { return E(c.h); };
    var tex = {
      satin: function () { return 'background:linear-gradient(115deg,' + sh(S[0]) + ' 0%,' + E(mixc(S[0].h, 0.45, 'w')) + ' 38%,' + sh(S[0]) + ' 55%,' + E(mixc(S[0].h, 0.3, 'k')) + ' 100%)'; },
      crepe: function () { return 'background:radial-gradient(' + E(mixc(N[1].h, 0.12, 'w')) + ' 1px,transparent 1.5px) 0 0/5px 5px,' + sh(N[1]); },
      ponte: function () { return 'background:repeating-linear-gradient(45deg,' + sh(N[3]) + ' 0 2px,' + E(mixc(N[3].h, 0.12, 'w')) + ' 2px 4px)'; },
      denim: function () { return 'background:repeating-linear-gradient(60deg,#2c4a78 0 2px,#3a5c8f 2px 4px)'; },
      wool: function () { return 'background:radial-gradient(' + E(mixc(N[2].h, 0.35, 'w')) + ' 1px,transparent 1.5px) 0 0/6px 6px,radial-gradient(' + E(mixc(N[2].h, 0.3, 'k')) + ' 1px,transparent 1.5px) 3px 3px/6px 6px,' + sh(N[2]); },
      knit: function () { return 'background:repeating-linear-gradient(90deg,' + sh(S[2]) + ' 0 5px,' + E(mixc(S[2].h, 0.22, 'k')) + ' 5px 7px)'; },
      linen: function () { return 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.35) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(0,0,0,.07) 0 1px,transparent 1px 5px),' + E(mixc(N[0].h, 0.15, 'k')); },
      leather: function () { return 'background:linear-gradient(120deg,' + sh(N[3]) + ',' + E(mixc(N[3].h, 0.25, 'w')) + ' 45%,' + sh(N[3]) + ' 70%)'; },
      velvet: function () { return 'background:radial-gradient(circle at 30% 30%,' + E(mixc(S[3].h, 0.3, 'w')) + ',' + sh(S[3]) + ' 55%,' + E(mixc(S[3].h, 0.35, 'k')) + ')'; },
      chiffon: function () { return 'background:repeating-linear-gradient(100deg,' + E(mixc(S[1].h, 0.35, 'w')) + ' 0 14px,' + E(mixc(S[1].h, 0.55, 'w')) + ' 14px 26px)'; },
      jersey: function () { return 'background:repeating-linear-gradient(90deg,' + sh(N[2]) + ' 0 3px,' + E(mixc(N[2].h, 0.12, 'k')) + ' 3px 4px)'; },
      boucle: function () { return 'background:radial-gradient(circle,' + E(mixc(N[0].h, 0.2, 'k')) + ' 2px,transparent 3px) 0 0/9px 9px,radial-gradient(circle,rgba(255,255,255,.7) 2px,transparent 3px) 4px 4px/9px 9px,' + sh(N[0]); },
      poplin: function () { return 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 1px,transparent 1px 3px),' + E(mixc(N[0].h, 0.04, 'k')); }
    };
    /* id, name, line, personas, occasions, season weight (1 heavier, -1 lighter), chroma, regex words in the shape's good / avoid lists, price lean */
    var LIB = [
      ['satin', 'Satin and silk', 'A fluid sheen that dresses an outfit up. Best for tops, slip skirts and dresses.', ['feminine', 'luxury', 'sleek'], ['dates', 'special'], -1, 'bright', /satin|silk|sleek|shiny/i, 'invest'],
      ['crepe', 'Crepe', 'A matte, fluid fabric that skims the body and holds a line.', ['tailored', 'classic', 'luxury'], ['work', 'dates'], 0, 'blended', /crepe|fluid|drap/i, ''],
      ['ponte', 'Ponte', 'A thick, stretchy knit with structure. Comfortable, polished and wrinkle-resistant.', ['tailored', 'classic', 'casual'], ['work', 'travel', 'everyday'], 0, '', /ponte|structured/i, 'budget'],
      ['denim', 'Denim', 'Sturdy and easy. Choose a dark wash or a weight that holds its shape.', ['casual', 'sporty', 'bold'], ['everyday', 'travel'], 0, '', /denim|cotton/i, 'budget'],
      ['wool', 'Wool blends', 'Rich and substantial. Beautiful in coats, blazers and trousers. Choose a soft blend if wool feels itchy.', ['luxury', 'tailored', 'classic'], ['work'], 1, 'soft', /wool|structured/i, 'invest'],
      ['knit', 'Soft knits and cashmere', 'Cozy, refined and easy to layer.', ['luxury', 'casual', 'feminine'], ['everyday', 'travel'], 1, 'soft', /knit|cashmere/i, 'invest'],
      ['linen', 'Linen and cotton-linen', 'Breathable and relaxed. Best for warm days and easy shapes.', ['casual', 'classic'], ['everyday'], -1, 'soft', /linen|cotton/i, ''],
      ['leather', 'Leather and faux leather', 'Sharp and grown-up. A jacket, skirt or boot changes any outfit.', ['sleek', 'bold', 'luxury'], ['dates', 'special'], 1, 'bright', /leather/i, ''],
      ['velvet', 'Velvet', 'Deep and rich. A strong choice for evenings and special occasions.', ['bold', 'luxury', 'feminine'], ['special', 'dates'], 1, 'bright', /velvet/i, ''],
      ['chiffon', 'Chiffon and georgette', 'Light and airy. Beautiful in tops, blouses and flowing skirts.', ['feminine', 'classic'], ['dates', 'special'], -1, 'soft', /chiffon|georgette|flow|drap/i, ''],
      ['jersey', 'Stretch jersey', 'Soft and comfortable. Works best in a thicker weight that does not cling.', ['casual', 'sporty'], ['everyday', 'travel'], 0, '', /jersey|stretch/i, 'budget'],
      ['boucle', 'Bouclé and tweed', 'Textured and polished. A jacket or skirt in this fabric looks expensive.', ['luxury', 'classic', 'feminine'], ['work', 'special'], 1, 'soft', /textur|tweed|boucl/i, 'invest'],
      ['poplin', 'Cotton poplin', 'Crisp and clean. Perfect for shirts, shirt-dresses and structured pieces.', ['tailored', 'classic', 'casual'], ['work', 'everyday'], -1, 'bright', /cotton|poplin|structured/i, 'budget']
    ];
    var L0 = r.life || {};
    var LF = { cold: L0.climate === 'cold', hot: L0.climate === 'warm', runsHot: L0.temp === 'hot', runsCold: L0.temp === 'cold', avoid: (L0.comfortFab || []).filter(function (x) { return x !== 'none'; }), formal: L0.dressCode === 'formal' };
    var CLIM_HOT = { linen: 2, poplin: 1.5, chiffon: 1.5, satin: 1, jersey: 0.5, wool: -3, velvet: -3, knit: -2, boucle: -2, leather: -1 };
    var CLIM_COLD = { wool: 2, knit: 2, velvet: 1.5, boucle: 1.5, leather: 1, ponte: 1, linen: -2, chiffon: -1 };
    var AVOID_MAP = { itchy: { wool: -6, boucle: -2 }, clingy: { jersey: -3, satin: -2, knit: -1 }, stiff: { denim: -2, leather: -2, ponte: -1, poplin: -1, boucle: -1 }, sheer: { chiffon: -4 }, shiny: { satin: -4, leather: -2, velvet: -1 } };
    var clingy = D.quiet.indexOf('midsection') > -1 || D.quiet.indexOf('hips') > -1;
    var CLING = { satin: 1, jersey: 1, knit: 0.5 };
    var scored = LIB.map(function (f, i) {
      var parts = [], pi = f[3].indexOf(vibe);
      if (pi > -1) parts.push([pi < 2 ? 3 : 2, pname ? 'Matches your ' + pname + ' style.' : 'Matches your style direction.']);
      if (f[7].test(good)) parts.push([2.5, 'It is on the best-fabrics list for your ' + shapeName(r) + ' shape.']);
      var worksHit = f[4].filter(function (o) { return D.works.indexOf(o) > -1; });
      if (worksHit.length) parts.push([1.5 * worksHit.length, 'Works well for ' + listW(worksHit.map(function (o) { return OCCN[o]; })) + ', which you asked for.']);
      if (f[6] && ch) parts.push([f[6] === ch ? 1 : (f[6] === 'blended' || ch === 'blended' ? 0 : -1), ch === 'bright' ? 'Crisp or sheen fabrics match your clear coloring.' : 'Matte, soft-textured fabrics match your blended coloring.']);
      if (invest && f[8] === 'invest') parts.push([1, 'Suits the investment range you chose.']);
      if (budget && f[8] === 'budget') parts.push([1, 'Easy to find at the everyday price range you chose.']);
      var id = f[0], adj = 0, hard = false;
      if (LF.cold && CLIM_COLD[id] > 0) parts.push([CLIM_COLD[id], 'You said your winters are long and cold, and this fabric keeps you warm.']);
      if (LF.hot && CLIM_HOT[id] > 0) parts.push([CLIM_HOT[id], 'You said it is warm where you live, and this fabric is breathable.']);
      if (LF.cold && CLIM_COLD[id] < 0) adj += CLIM_COLD[id];
      if (LF.hot && CLIM_HOT[id] < 0) adj += CLIM_HOT[id];
      if (LF.runsHot) adj += (CLIM_HOT[id] || 0) * 0.5;
      if (LF.runsCold) adj += (CLIM_COLD[id] || 0) * 0.5;
      LF.avoid.forEach(function (a) { var v = (AVOID_MAP[a] || {})[id] || 0; adj += v; if (v <= -4) hard = true; });
      if (LF.formal && ['wool', 'crepe', 'poplin', 'boucle'].indexOf(id) > -1) parts.push([1, 'A polished fabric for your formal work dress code.']);
      var total = 0, best = [0, 'A dependable fabric that works with your palette.']; parts.forEach(function (x) { total += x[0]; if (x[0] > best[0]) best = x; });
      total += adj - (hard ? 50 : 0);
      if (bad && f[7].test(bad) && !f[7].test(good)) total -= 4;
      if (clingy && CLING[f[0]]) { total -= 2 * CLING[f[0]]; }
      return { f: f, total: total, why: best[1], i: i };
    }).sort(function (a2, b2) { return b2.total - a2.total || a2.i - b2.i; }).slice(0, 6);
    var tiles = scored.map(function (o) { var f = o.f; return '<div class="hx-pt"><div class="hx-pc" style="' + ((r.__fab && r.__fab[f[0]]) ? 'background:url(' + r.__fab[f[0]] + ') center/cover' : tex[f[0]]()) + '"></div><h5>' + f[1] + '</h5><p>' + f[2] + '</p><p class="hx-why">' + E(o.why) + '</p></div>'; }).join('');
    var avoid = [];
    if (bad) avoid.push(bad.replace(/\.\s*$/, ''));
    if (clingy) avoid.push('You prefer less attention on your midsection or hips, so skip thin, clingy fabrics there and choose ones that skim or hold their shape.');
    if (D.show.indexOf('waist') > -1) avoid.push('You like to show your waist, so avoid stiff boxy fabrics that hide it.');
    if (ch === 'soft') avoid.push('Very glossy, high-shine fabrics can fight your soft coloring.');
    if (LF.avoid.length) avoid.push('You told us you avoid ' + listW(LF.avoid.map(function (a) { return ({ itchy: 'itchy fabrics', clingy: 'clingy fabrics', stiff: 'stiff fabrics', sheer: 'sheer fabrics', shiny: 'shiny fabrics' })[a]; })) + ', so we left them out of your picks.');
    var avoidHtml = '<div class="hx-box" style="margin-top:12px"><h6>Fabrics to skip or use carefully, for you</h6><ul class="hx-ul">' + avoid.map(function (x) { return '<li>' + E(x) + (/[.!?]$/.test(x) ? '' : '.') + '</li>'; }).join('') + '</ul></div>';
    var sub = 'Picked for your ' + E(shapeName(r)) + ' shape' + (pname ? ', your ' + E(pname) + ' style' : '') + (D.works.length ? ' and ' + E(listW(D.works.slice(0, 3).map(function (w) { return OCCN[w]; }))) : '') + '. Touch a fabric before you buy it, since weight and finish matter more than the name.';
    return { key: 'fabrics', label: 'Fabrics', html: '<div class="hx-page">' + head('Fabrics that <em>work for you</em>', sub) + '<div class="hx-pgrid">' + tiles + '</div>' + avoidHtml + '</div>' };
  }

  /* ---------- new pages: at a glance, capsule, outfit recipes, shopping & fit guide, closet audit, session ---------- */
  function shopLink(r, name, color, kind, idx) {
    var st = r.stores && r.stores.list; if (!st || !st.length) return '';
    var pool = st.filter(function (x) { return !x.mode || (x.mode === 'bag' && kind === 'bag') || (x.mode === 'denim' && kind === 'jeans'); });
    if (!pool.length) return '';
    var x = pool[idx % pool.length];
    var q = ((x.mode === 'bag' ? color + ' leather bag' : x.mode === 'denim' ? color + ' denim jacket' : color + ' ' + name).trim().toLowerCase()) + ' women';
    var url = x.url + encodeURIComponent(q).replace(/%20/g, '+');
    return '<a class="hx-sl" href="' + E(url) + '" target="_blank" rel="noopener" data-href="' + E(url) + '">' + E(x.name) + '</a>';
  }
  function ruleStrings(r) {
    var G0 = dirs(r), con = r.contrastLevel || '', hiC = con === 'high' || con === 'mediumHigh', loC = con === 'low' || con === 'mediumLow';
    return [
      hiC ? 'Pair a bold color with a deep neutral. Your contrast carries it.' : loC ? 'Stay in one color family and keep contrast gentle.' : 'Wear your brightest color closest to your face.',
      (G0.quiet.indexOf('hips') > -1 || G0.quiet.indexOf('midsection') > -1) ? 'Neutrals on your lower half, color on top.' : G0.show.indexOf('legs') > -1 ? 'Let one color come down to your legs.' : 'Keep neutrals low and color on top.',
      'Finish with your metal tone: ' + String(r.metal || '').split(/\s[—-]\s|—/)[0] + '.'
    ];
  }
  var GOAL_TXT = { event: 'a wedding or special event', job: 'a new job or interview', change: 'a big life change', trip: 'a trip or vacation' };
  var GOAL_SEARCH = { event: 'wedding guest outfits', job: 'interview outfits', change: 'new chapter outfits', trip: 'vacation outfits' };
  function pinUrl(q) { return 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent('trending ' + q + (/\bwomen\b/i.test(q) ? '' : ' for women')); }
  var VIBEW = { feminine: 'feminine', luxury: 'elevated', sleek: 'sleek', tailored: 'tailored', casual: 'casual chic', bold: 'statement', classic: 'classic', sporty: 'athleisure' };
  function vibeWord(r) { return (r.persona && VIBEW[r.persona.vibe]) || ''; }

  function glanceBlock(r) {
    var P = pal(r), L = r.life || {}, pers = r.persona || null, season = String(r.seasonLabel || '').replace(/\s*✦/, '');
    var arch = function (c) { return '<span class="hx-ar"><i style="background:' + E(c.h) + '"></i><b>' + E(c.n) + '</b></span>'; };
    var avoid = (r.avoidSwatches || []).slice(0, 4);
    var rl = ruleStrings(r).map(function (x, i) { return '<div class="hx-chk"><b>' + (i + 1) + '</b><p>' + E(x) + '</p></div>'; }).join('');
    var nextBox;
    if (L.goal && L.goal !== 'none' && GOAL_TXT[L.goal]) { var u = pinUrl(String(P.sig[0].n).toLowerCase() + ' ' + GOAL_SEARCH[L.goal]); nextBox = '<div class="hx-box"><h6>Your next up</h6><p>You told us about ' + E(GOAL_TXT[L.goal]) + (L.goalDate ? ' on ' + E(L.goalDate) : '') + '. Build it from your signature colors. <a class="hx-pin" href="' + E(u) + '" target="_blank" rel="noopener" data-href="' + E(u) + '">See ideas on Pinterest</a></p></div>'; }
    else nextBox = '<div class="hx-box"><h6>Start here</h6><p>Begin with the pieces marked <b>Start here</b> in your starter capsule. They work with everything else.</p></div>';
    return { key: 'glance', label: 'Your Style at a Glance', html: '<div class="hx-page hx-lg">' + head('Your style <em>at a glance</em>', 'Your whole report on one page. Screenshot it and keep it on your phone.')
      + '<div class="hx-3"><div class="hx-box"><h6>Color season</h6><p><b>' + E(season) + '</b><br>' + E(String(r.metal || '').split(/\s[—-]\s|—/)[0]) + '</p></div><div class="hx-box"><h6>Body shape</h6><p><b>' + E(r.bodyShapeLabel || '') + '</b><br>' + E(r.bodyGoal || '') + '</p></div><div class="hx-box"><h6>Style persona</h6><p><b>' + E(pers ? pers.name : '') + '</b><br>' + E(pers && pers.formula ? pers.formula.join(' + ') : '') + '</p></div></div>'
      + label('Your colors') + '<div class="hx-box"><h6>Power neutrals</h6><div class="hx-ars">' + P.neu.map(arch).join('') + '</div><h6 style="margin-top:10px">Signature colors</h6><div class="hx-ars">' + P.sig.map(arch).join('') + '</div><h6 style="margin-top:10px">Accents</h6><div class="hx-ars">' + P.acc.map(arch).join('') + '</div></div>'
      + (avoid.length ? label('Colors to avoid near your face') + '<div class="hx-box"><div class="hx-ars">' + avoid.map(arch).join('') + '</div></div>' : '')
      + label('Your three rules') + '<div class="hx-1">' + rl + '</div>'
      + '<div class="hx-2" style="margin-top:12px">' + nextBox + '<div class="hx-box"><h6>Wear near your face</h6><p>' + E(P.sig[0].n) + ' or ' + E(P.sig[1].n) + ' as a top, scarf or earrings, closest to your face.</p></div>' + '</div></div>' };
  }

  function capsulePieces(r) {
    var P = pal(r), N = P.neu, S = P.sig, A = P.acc, L = r.life || {};
    var key = DRESS_ROWS[r.bodyShapeKey] ? r.bodyShapeKey : 'rectangle', D = DRESS_ROWS[key];
    var tops = D.rows[0][2].concat(D.rows[1][2]).filter(function (g, i, a) { return a.indexOf(g) === i && g !== 'vneck'; });
    var pro = key === 'hourglass' || key === 'rectangle';
    var skirt = pro && L.dressCode === 'formal' ? 'pencil' : (D.rows[2][2].indexOf('askirt') > -1 ? 'askirt' : 'trouser');
    var dr = D.rows[3][2], dress1 = pro ? 'sheath' : dr[0], dress2 = dr.filter(function (g) { return g !== dress1; })[0] || 'flare';
    var statement = pickGarments(r, D, ['dates'])[0].top;
    var lightN = N.slice().sort(function (a, b) { return lumH(b.h) - lumH(a.h); })[0];
    var heelN = { flats: 'Flats or loafers', low: 'Low block heel', mid: 'Mid heel', high: 'Statement heel' }[L.heel] || 'Shoes you can walk in';
    var cold = L.climate === 'cold' || L.climate === 'mixed', coatN = cold ? 'Long coat' : 'Light trench or jacket';
    var out = [
      { k: 'blazer', n: 'Tailored blazer', c: N[3], start: true },
      { k: 'trouser', n: 'Tailored trousers', c: N[1], start: true },
      { k: 'blouse', n: 'Button-up blouse', c: lightN, start: true },
      { k: 'vneck', n: 'V-neck top', c: S[0], start: true },
      { k: statement, n: NAMES[statement] || 'Statement top', c: S[2] },
      { k: skirt, n: NAMES[skirt] || 'Skirt', c: N[3] },
      { k: 'trouser', n: 'Dark jeans', c: N[2], kind: 'jeans' },
      { k: dress1, n: (NAMES[dress1] || 'A-line') + ' dress for work', c: S[3], dressy: false },
      { k: dress2, n: (NAMES[dress2] || 'Fit and flare') + ' dress for dates', c: S[1], start: L.goal === 'event' },
      { k: 'coat', n: coatN, c: N[2] },
      { k: 'bag', n: 'Structured bag', c: A[0], kind: 'bag' },
      { k: 'shoe', n: heelN, c: N[3], kind: 'shoe' }
    ];
    return out;
  }
  function capsuleBlock(r) {
    var pcs = capsulePieces(r), L = r.life || {};
    var tiles = pcs.map(function (p, i) {
      var link = shopLink(r, p.n.replace(/ for (work|dates)$/, '').replace(/^Dark /, ''), p.c.n, p.kind || '', i);
      return '<div class="hx-cp">' + (p.start ? '<em>Start here</em>' : '') + G(p.k, p.c.h) + '<h6>' + E(p.n) + '</h6><small>' + E(p.c.n) + '</small>' + (link ? '<div class="hx-sls">' + link + '</div>' : '') + '</div>';
    }).join('');
    var sec = (L.shopHabits || []).some(function (x) { return x === 'secondhand' || x === 'resale'; }) && r.stores && r.stores.secondhand ? '<div class="hx-box" style="margin-top:10px"><h6>You shop secondhand, so look here too</h6><p>' + r.stores.secondhand.map(function (x, i) { var q = String(pcs[i * 4].c.n + ' ' + (i === 2 ? 'bag' : pcs[i * 4].n)).toLowerCase() + ' women'; var u = x.url + encodeURIComponent(q).replace(/%20/g, '+'); return '<a class="hx-sl" href="' + E(u) + '" target="_blank" rel="noopener" data-href="' + E(u) + '">' + E(x.name) + '</a>'; }).join(' ') + '</p></div>' : '';
    var sub = '12 pieces to buy first, in your colors and for your ' + E(shapeName(r)) + ' shape' + (L.dressCode === 'formal' ? ', with a formal work wardrobe in mind' : '') + '. Budget per piece: ' + E((r.shopTier && r.shopTier.label) || 'Mid-range ($75–$200)') + '.';
    return { key: 'capsule', label: 'Starter Capsule', html: '<div class="hx-page">' + head('Your starter <em>capsule</em>', sub) + '<div class="hx-cap4">' + tiles + '</div>' + sec + '<div class="hx-tip" style="margin-top:12px">Every piece should work with at least three others. Buy the Start here pieces first, then fill in the rest over a few months.</div></div>' };
  }

  function recipesBlock(r) {
    var P = pal(r), N = P.neu, S = P.sig, A = P.acc, L = r.life || {}, D0 = dirs(r);
    var key = DRESS_ROWS[r.bodyShapeKey] ? r.bodyShapeKey : 'rectangle', D = DRESS_ROWS[key];
    var oc = (D0.works.length ? D0.works : ['everyday', 'work', 'dates']).slice(0, 3); while (oc.length < 3) { var extra = ['everyday', 'work', 'dates', 'photos'].filter(function (x) { return oc.indexOf(x) < 0; })[0]; oc.push(extra); }
    var picks = pickGarments(r, D, [oc[0], oc[0], oc[1], oc[1], oc[2], oc[2]]);
    var combos = [[N[1], S[0], A[0]], [N[3], S[2], A[0]], [N[0], S[1], A[1]], [N[2], S[3], A[0]], [N[3], S[4], A[2]], [N[1], S[5], A[1]]];
    var cold = L.climate === 'cold', layerK = cold ? 'coat' : 'blazer', layerN = cold ? 'Coat' : 'Tailored blazer';
    var heelN = { flats: 'Flats', low: 'Low block heel', mid: 'Mid heel', high: 'Statement heel' }[L.heel] || 'Shoes';
    var cards = picks.map(function (pk, i) {
      var c = combos[i], o = OCC[oc[Math.floor(i / 2)]] || OCC.everyday, a = i % 2 === 0;
      var items = a ? [[pk.top, c[1], NAMES[pk.top]], [pk.bot, c[0], NAMES[pk.bot]], ['shoe', c[2], heelN]] : [[pk.dr, c[1], (NAMES[pk.dr] || 'A-line') + ' dress'], [layerK, c[0], layerN], ['bag', c[2], 'Bag']];
      var fg = items.map(function (it) { return '<div>' + G(it[0], it[1].h) + '<span>' + E(it[2]) + '<br><i>' + E(it[1].n) + '</i></span></div>'; }).join('');
      var l1 = shopLink(r, items[0][2], items[0][1].n, '', i), l2 = shopLink(r, items[1][2], items[1][1].n, items[1][0] === 'bag' ? 'bag' : '', i + 1);
      return '<div class="hx-rc"><h5>' + o[0] + ' look ' + (a ? 1 : 2) + '</h5><div class="hx-rfg">' + fg + '</div><div class="hx-rls">Shop: ' + l1 + ' ' + l2 + '</div></div>';
    }).join('');
    return { key: 'recipes', label: 'Outfit Recipes', html: '<div class="hx-page">' + head('Outfit <em>recipes</em>', 'Six complete outfits for ' + E(listW(oc.map(function (w) { return OCCN[w]; }))) + ', built from your colors. Each one is a starting point to remix.') + '<div class="hx-rgrid">' + cards + '</div><div class="hx-tip" style="margin-top:12px">Want these styled from your own closet? Try Style-11 for a free outfit idea any time, or book a session.</div></div>' };
  }

  var SHAPE_FIT = {
    rectangle: ['Check that the waist is defined, with a belt or a fitted seam, so the outfit is not boxy.', 'Look for fullness at the shoulders and bust, or at the hips, to build shape.', 'Sit down in it. Nothing should pull at the waist.', 'Tailor the waist of jackets and dresses for definition.'],
    hourglass: ['Buy for your largest measurement, bust or hips, and tailor the waist.', 'Skip boxy cuts that hide your waist.', 'Check that stretchy fabrics follow you without clinging.', 'Belts and seams should sit at your natural waist.'],
    pear: ['Buy bottoms for your hips and tailor the waist.', 'Check that pockets lie flat at the hip.', 'Look for interest and structure on top.', 'Choose bottoms with a clean line and a little stretch.'],
    apple: ['Try mid-rise bottoms. Nothing should dig in at the waist.', 'Check that tops skim and do not cling at the middle.', 'Look for V-necks and open necklines.', 'Choose fabrics with some structure so they fall away from the body.'],
    inverted: ['Buy tops for your shoulders and bottoms for your hips.', 'Check that the shoulder seam sits at your shoulder point.', 'Look for volume or detail at the hem.', 'Avoid shoulder pads and heavy shoulder details.']
  };
  function fitGuideBlock(r) {
    var L = r.life || {}, key = SHAPE_FIT[r.bodyShapeKey] ? r.bodyShapeKey : 'rectangle', tier = (r.shopTier && r.shopTier.key) || 'mid';
    var alt = [];
    if (r.height === 'petite') alt.push('Hemming trousers, skirts and sleeves is the best money you can spend on a petite frame.');
    if (r.height === 'tall') alt.push('Check sleeve and trouser length first. Tall sizes or a let-down hem can fix both.');
    if (r.proportion === 'longTorso') alt.push('With a longer torso, check that tops are long enough and that the rise sits at your natural waist.');
    if (r.proportion === 'longLegs') alt.push('With longer legs, check the inseam before anything else, since many trousers run short.');
    alt.push('A good tailor can fix a waist, hem or sleeve for far less than a new piece costs.');
    var sizes = L.sizes && (L.sizes.top || L.sizes.bottom || L.sizes.shoe) ? '<p>Your usual sizes: ' + [L.sizes.top && 'tops ' + E(L.sizes.top), L.sizes.bottom && 'bottoms ' + E(L.sizes.bottom), L.sizes.shoe && 'shoes ' + E(L.sizes.shoe)].filter(Boolean).join(', ') + '. Sizes change from brand to brand, so check the measurements.</p>' : '';
    var BUD = { budget: 'At the everyday level, spend on fit, not labels. A tailored $40 pair beats an untailored $120 pair. Buy your most-worn pieces in the best fabric you can afford.', mid: 'In the mid range, buy fewer, better pieces. Spend on outerwear, trousers and shoes, and save on trend items.', invest: 'At the investment level, buy a few pieces that last for years: outerwear, a tailored blazer and one statement piece. Always check the cost per wear.' };
    var HAB = { store: 'In stores: take your phone with your palette and three rules, and try each piece with the shoes you will wear.', online: 'Online: check the fabric content and the return policy, and read the measurements, not just the size.', secondhand: 'Secondhand: search by fabric and measurements. Check seams, pilling and smell, and tailor after you buy.', resale: 'Designer resale: look for authentication, check the condition notes, and compare to the retail price.' };
    var habs = (L.shopHabits || []).map(function (h) { return HAB[h]; }).filter(Boolean);
    var stores = r.stores && r.stores.list ? r.stores.list.slice(0, 8).map(function (x) { return '<span class="hx-sp">' + E(x.name) + '</span>'; }).join('') : '';
    var bx = function (t, body) { return '<div class="hx-box"><h6>' + t + '</h6>' + body + '</div>'; };
    var ul = function (a) { return '<ul class="hx-ul">' + a.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul>'; };
    return { key: 'fitguide', label: 'Shopping & Fit Guide', html: '<div class="hx-page">' + head('Shopping &amp; <em>fit guide</em>', 'How to try things on, what to tailor and how to spend, for your ' + E(shapeName(r)) + ' shape.')
      + '<div class="hx-2">' + bx('Try-on checklist for your shape', ul(SHAPE_FIT[key])) + bx('Alterations worth paying for', ul(alt)) + '</div>'
      + '<div class="hx-2" style="margin-top:10px">' + bx('Reading size charts', '<p>Measure your bust, waist, hips and inseam once and save them on your phone. Compare them to each brand’s chart, since a size 8 at one store can be a 12 at another.</p>' + sizes) + bx('Spending, for your budget', '<p>' + E(BUD[tier] || BUD.mid) + '</p>') + '</div>'
      + '<div class="hx-2" style="margin-top:10px">' + bx('The five-minute fit test', ul(['Raise both arms. Nothing should pull or ride up.', 'Sit, then stand. Check the waist, rise and hem.', 'Walk a few steps and bend over. Check for gaps and pulling.', 'Look at the back in a mirror, in daylight if you can.'])) + bx('Before you buy', ul(['Does it work with at least three things you own?', 'Do you have a place to wear it this month?', 'Is it in your colors and your shape rules?', 'Can you care for it the way it needs?'])) + '</div>'
      + (habs.length ? '<div style="margin-top:10px">' + bx('How you like to shop', ul(habs)) + '</div>' : '')
      + (stores ? '<div style="margin-top:10px">' + bx('Stores tailored to you', '<div class="hx-sps">' + stores + '</div>') + '</div>' : '')
      + '</div>' };
  }

  function auditBlock(r) {
    var P = pal(r), L = r.life || {}, pers = r.persona || null, key = DRESS_ROWS[r.bodyShapeKey] ? r.bodyShapeKey : 'rectangle', D = DRESS_ROWS[key];
    var avoid = (r.avoidSwatches || []).slice(0, 4), wheel = P.neu.slice(0, 3).concat(P.sig.slice(0, 4));
    var dots = function (a) { return '<span class="hx-dots">' + a.map(function (c) { return '<i style="background:' + E(c.h) + '" title="' + E(c.n) + '"></i>'; }).join('') + '</span>'; };
    var keep = ['It uses a color from your wheel ' + dots(wheel), 'It follows your shape rules: ' + E(D.rows[1][1].toLowerCase()) + '.', pers ? 'It fits your ' + E(pers.name) + ' style.' : 'It feels like you.', 'You have worn it in the last year.', 'It is comfortable' + (L.comfortFab && L.comfortFab.length && L.comfortFab.indexOf('none') < 0 ? ', with none of the fabrics you avoid.' : '.')];
    var tailor = ['The color and fabric are right, but the length is not. Hem it.', 'It fits your hips or your bust, but not your waist.', 'The sleeves or the trouser length are off.', 'You love the piece but it looks tired. Try pressing, dyeing or new buttons.'];
    var go = ['It is one of your avoid colors near your face ' + dots(avoid), 'It does not fit and cannot be tailored.', 'You have not worn it in a year and do not miss it.', L.comfortFab && L.comfortFab.indexOf('itchy') > -1 ? 'It is itchy or scratchy.' : 'It is uncomfortable to wear.'];
    var col = function (t, a) { return '<div class="hx-box"><h6>' + t + '</h6>' + a.map(function (x) { return '<p class="hx-ck"><span></span><span>' + x + '</span></p>'; }).join('') + '</div>'; };
    return { key: 'audit', label: 'Closet Audit Checklist', html: '<div class="hx-page">' + head('Closet audit <em>checklist</em>', 'Do this before you shop. Hold each piece up and ask these questions.')
      + col('Keep it if…', keep) + '<div class="hx-2" style="margin-top:10px">' + col('Tailor it if…', tailor) + col('Let it go if…', go) + '</div>'
      + '<div class="hx-3" style="margin-top:10px"><div class="hx-box"><h6>Closet math</h6><p>Aim for about 60% neutrals, 30% signature colors and 10% accents.</p></div><div class="hx-box"><h6>Fill the gaps</h6><p>Compare what you keep to your starter capsule and note what is missing.</p></div><div class="hx-box"><h6>For your session</h6><p>Photograph your keeps, your tailor pile and your gaps, and bring them to your stylist.</p></div></div><div class="hx-3" style="margin-top:10px"><div class="hx-box hx-tally"><h6>Keep</h6><p>How many? ____</p></div><div class="hx-box hx-tally"><h6>Tailor</h6><p>How many? ____</p></div><div class="hx-box hx-tally"><h6>Let go</h6><p>How many? ____</p></div></div></div>' };
  }

  function sessionBlock(r) {
    var P = pal(r), L = r.life || {}, pers = r.persona || null, season = String(r.seasonLabel || '').replace(/\s*✦/, '');
    var DC = { formal: 'Business formal', businessCasual: 'Business casual', creative: 'Creative or casual workplace', remote: 'Works from home or on video calls', none: 'No work dress code' };
    var CL = { warm: 'Warm most of the year', mixed: 'Four seasons, mild winters', cold: 'Long, cold winters', varies: 'Changes a lot or travels often' };
    var HT = { straight: 'Straight', wavy: 'Wavy', curly: 'Curly', coily: 'Coily', protective: 'Protective styles', wig: 'Wigs or extensions', varies: 'Switches it up a lot' };
    var rows = [['Color season', season + ' (' + String(r.metal || '').split(/\s[—-]\s|—/)[0] + ')'], ['Body shape', r.bodyShapeLabel || ''], ['Style persona', pers ? pers.name : ''], ['Budget', (r.shopTier && r.shopTier.label) || '']];
    if (L.dressCode) rows.push(['Work dress code', DC[L.dressCode]]);
    if (L.climate) rows.push(['Climate', CL[L.climate] + (L.temp === 'hot' ? ', runs hot' : L.temp === 'cold' ? ', runs cold' : '')]);
    if (L.heel) rows.push(['Heel height', { flats: 'Flats only', low: 'Up to 2 inches', mid: 'Up to 3 inches', high: 'Any height' }[L.heel]]);
    var hts2 = Array.isArray(L.hairType) ? L.hairType : (L.hairType ? [L.hairType] : []);
    if (hts2.length) rows.push(['Hair', hts2.map(function (h) { return HT[h] || h; }).join(', ') + (L.hairLen ? ', ' + L.hairLen : '')]);
    if (L.sizes && (L.sizes.top || L.sizes.bottom || L.sizes.shoe)) rows.push(['Sizes', [L.sizes.top && 'tops ' + L.sizes.top, L.sizes.bottom && 'bottoms ' + L.sizes.bottom, L.sizes.shoe && 'shoes ' + L.sizes.shoe].filter(Boolean).join(', ')]);
    if (L.goal && L.goal !== 'none') rows.push(['Coming up', GOAL_TXT[L.goal] + (L.goalDate ? ', ' + L.goalDate : '')]);
    if (L.comfortFab && L.comfortFab.length && L.comfortFab.indexOf('none') < 0) rows.push(['Avoids', L.comfortFab.join(', ')]);
    if (L.inspo) rows.push(['Inspiration', L.inspo]);
    if (L.words) { if (L.words.go) rows.push(['Go-to outfit', L.words.go]); if (L.words.sold) rows.push(['What sells her', L.words.sold]); if (L.words.start) rows.push(['Starts outfits with', L.words.start]); }
    var tbl = '<div class="hx-snap">' + rows.map(function (x) { return '<div><b>' + E(x[0]) + '</b><span>' + E(x[1]) + '</span></div>'; }).join('') + '</div>';
    var qs = ['Which three pieces from my capsule should I buy first?', 'What should I tailor, and what should I let go?', 'How do I wear my signature colors without looking too matchy?', pers ? 'How do I keep my ' + pers.name + ' style while building a ' + (L.dressCode === 'formal' ? 'formal work wardrobe?' : 'wardrobe I can wear every day?') : 'How do I build a wardrobe I can wear every day?', 'Which stores and price points should I focus on?'];
    if (L.goal && L.goal !== 'none') qs.push('Can we plan my outfit for ' + GOAL_TXT[L.goal] + (L.goalDate ? ' on ' + L.goalDate : '') + '?');
    var ul = function (a) { return '<ul class="hx-ul">' + a.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul>'; };
    var bring = ['Photos of your closet by zone: tops, bottoms, dresses, outerwear, shoes, bags and accessories.', 'A full-length photo in natural light: front, side and back.', 'Three favorite outfits and three pieces you never wear.', 'This report, saved on your phone.'];
    return { key: 'session', label: 'Bring to Your Session', html: '<div class="hx-page">' + head('Bring this to your <em>session</em>', 'Your style snapshot, the questions to ask and what to photograph. It saves your stylist hours.')
      + label('Your style snapshot', true) + tbl + '<div class="hx-2" style="margin-top:12px"><div class="hx-box"><h6>Questions to ask your stylist</h6>' + ul(qs) + '</div><div class="hx-box"><h6>What to bring or photograph</h6>' + ul(bring) + '</div></div>'
      + '<div class="hx-2" style="margin-top:12px"><div class="hx-box hx-lines"><h6>My top three goals</h6><p>1. ______________________________</p><p>2. ______________________________</p><p>3. ______________________________</p></div><div class="hx-box hx-lines"><h6>Notes</h6><p>______________________________</p><p>______________________________</p><p>______________________________</p></div></div>'
      + '<div class="hx-tip" style="margin-top:12px">Ready to turn this into outfits? Your $40 is credited toward any 1:1 package. <a class="hx-pin" style="color:#fff" href="https://herstylevault.com/book.html" target="_blank" rel="noopener" data-href="https://herstylevault.com/book.html">Book a free consultation</a></div></div>' };
  }

  function guidanceExtra(r) {
    var P = pal(r);
    var tips = [['Closest to you', P.sig[0], 'Wear ' + E(P.sig[0].n) + ' or ' + E(P.sig[1].n) + ' as a top or scarf'], ['Your best neutral', P.neu[3], E(P.neu[3].n) + ' for blazers and bags'], ['Your finishing metal', P.acc[0], E(String(r.metal || '').split(/\s[\u2014-]\s|\u2014/)[0]) + ' in your jewelry']];
    var t = tips.map(function (x) { return '<div class="hx-box hx-tipc"><h6>' + x[0] + '</h6><div>' + chip(x[1]) + '<span>' + x[2] + '</span></div></div>'; }).join('');
    var G0 = dirs(r), con = r.contrastLevel || '', hiC = con === 'high' || con === 'mediumHigh', loC = con === 'low' || con === 'mediumLow';
    var r1 = hiC ? 'Your higher-contrast coloring carries color blocking, so pair a bold color with a deep neutral.' : loC ? 'Your softer coloring looks best blended, so stay within one color family and keep contrast gentle.' : 'Wear your brightest color closest to your face.';
    var r2 = (G0.quiet.indexOf('hips') > -1 || G0.quiet.indexOf('midsection') > -1) ? 'Keep neutrals on your lower half and put color on top, so attention stays where you want it.' : G0.show.indexOf('legs') > -1 ? 'Let one color come down to your legs, like a skirt or shoes, to show them off.' : 'Keep neutrals low, on bottoms and bags. Put color on top.';
    var r3 = 'When in doubt, add your metal tone: ' + E(String(r.metal || '').split(/\\s[\\u2014-]\\s|\\u2014/)[0]) + '.';
    var rules = [r1, r2, r3].map(function (x, i) { return '<div class="hx-chk"><b>' + (i + 1) + '</b><p>' + x + '</p></div>'; }).join('');
    var goal = r.chromaKey === 'bright' ? 'Wear clear, saturated color close to your face and let your neutrals do the quiet work.' : r.chromaKey === 'soft' ? 'Wear soft, blended color close to your face and let your neutrals do the quiet work.' : 'Wear clear color close to your face and let your neutrals do the quiet work.';
    var pf = (r.persona && r.persona.formula) || [], acc = [];
    if (pf[2]) acc.push('Your ' + E(r.persona.name) + ' finishing touch: ' + E(pf[2]) + '.');
    if (G0.show.indexOf('neckline') > -1 || G0.show.indexOf('shoulders') > -1) acc.push('You like to show your neckline and shoulders, so choose earrings and necklaces that frame them.');
    if (G0.show.indexOf('waist') > -1) acc.push('You like to show your waist, so a belt in your accent color earns its place.');
    if (G0.show.indexOf('legs') > -1) acc.push('You like to show your legs, so a statement shoe is a good place to spend.');
    if (G0.quiet.indexOf('arms') > -1) acc.push('You prefer less attention on your arms, so keep bracelets and cuffs light and let a scarf or earrings lead.');
    var accHtml = acc.length ? label('Accessories, for you') + '<div class="hx-box"><ul class="hx-ul">' + acc.slice(0, 3).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' : '';
    return label('Wear it near your face') + '<div class="hx-3">' + t + '</div>' + label('Three quick rules') + '<div class="hx-1">' + rules + '</div>' + accHtml + '<div class="hx-goal"><h6>Your color goal</h6><p>' + goal + '</p></div>';
  }

  var CSS = '.hx-bface{display:flex;gap:18px;align-items:center;background:#ECE8E2;border-radius:16px;padding:8px 18px;margin:0 0 10px}.hx-bsvg{flex:0 0 118px}.hx-bsvg svg{width:118px;height:auto;display:block}.hx-blg{flex:1}.hx-blg h6{margin:0 0 3px;font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:#7A1321;font-weight:600}.hx-blg p{margin:0 0 7px;font-size:0.76rem;line-height:1.5;color:#3F3C38}.hx-blg>div{display:inline-flex;align-items:center;gap:7px;width:48%;margin:2px 0;font-size:0.7rem;color:#3F3C38}.hx-blg i{display:block;flex:0 0 22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}.hx-blg span b{display:block;font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;color:#7A1321}.hx-moreideas{margin-top:12px}.hx-moreideas .hx-pin{display:inline;margin-left:4px;font-size:0.66rem}.hx-ars{display:flex;flex-wrap:wrap;gap:6px 12px}.hx-ar{display:inline-flex;align-items:center;gap:6px;font-size:0.68rem;color:#3F3C38}.hx-ar i{display:block;width:20px;height:26px;border-radius:10px 10px 3px 3px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}.hx-ar b{font-weight:500}.hx-cap4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.hx-cp{position:relative;text-align:center;background:#ECE8E2;border-radius:14px;padding:12px 6px 10px}.hx-cp svg{width:100%;height:88px;display:block}.hx-cp h6{margin:4px 0 0;font-size:0.66rem;font-weight:600;color:#181716;line-height:1.25}.hx-cp small{display:block;font-size:0.58rem;color:#6B6862}.hx-cp em{position:absolute;top:6px;left:6px;font-style:normal;font-size:0.46rem;letter-spacing:0.1em;text-transform:uppercase;background:#7A1321;color:#fff;border-radius:99px;padding:2px 6px}.hx-sls{margin-top:3px}.hx-sl{display:inline-block;font-size:0.6rem;letter-spacing:0.06em;text-transform:uppercase;color:#7A1321;text-decoration:underline;font-weight:600;margin:0 3px 0 0}.hx-rgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hx-rc{background:#ECE8E2;border-radius:14px;padding:14px 14px}.hx-rc h5{margin:0 0 4px;font-family:"Cormorant Garamond",serif;font-size:1.1rem;font-weight:600}.hx-rfg{display:flex;gap:6px}.hx-rfg>div{flex:1;text-align:center}.hx-rfg svg{width:100%;height:92px;display:block}.hx-rfg span{display:block;font-size:0.64rem;color:#3F3C38;line-height:1.3}.hx-rfg i{font-style:normal;color:#6B6862}.hx-rls{margin-top:8px;font-size:0.62rem;color:#6B6862}.hx-tally p{font-size:0.9rem!important;letter-spacing:0.1em}.hx-lines p{font-size:0.8rem!important;margin:10px 0 0!important;color:#6B6862!important}.hx-lg .hx-box p{font-size:0.86rem}.hx-lg .hx-ar{font-size:0.82rem}.hx-lg .hx-ar i{width:26px;height:34px;border-radius:13px 13px 4px 4px}.hx-lg .hx-box{padding:0.95rem 1.2rem}.hx-lg .hx-chk p{font-size:0.82rem}.hx-lg .hx-chk{padding:10px 14px}.hx-ck{font-size:0.8rem}.hx-sps{display:flex;flex-wrap:wrap;gap:6px}.hx-sp{border:1px solid #DCD8D0;border-radius:99px;padding:3px 10px;font-size:0.66rem;color:#7A1321;background:#fff}.hx-ck{display:flex;gap:8px;align-items:flex-start;margin:0 0 5px!important}.hx-ck>span:first-child{flex:0 0 11px;height:11px;border:1.4px solid #7A1321;border-radius:2px;margin-top:3px}.hx-dots{display:inline-flex;gap:3px;vertical-align:middle;margin-left:4px}.hx-dots i{display:block;width:12px;height:12px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}.hx-snap{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px}.hx-snap>div{display:flex;gap:8px;border-bottom:1px solid #DCD8D0;padding:7px 0;font-size:0.78rem;color:#3F3C38}.hx-snap b{flex:0 0 92px;font-size:0.56rem;letter-spacing:0.12em;text-transform:uppercase;color:#7A1321;font-weight:600;padding-top:2px}.hx-pin{display:block;margin-top:5px;font-size:0.6rem;display:block;margin-top:5px;font-size:0.6rem;letter-spacing:0.08em;text-transform:uppercase;color:#7A1321;text-decoration:underline;font-weight:600;}.hx-pinrow{margin:6px 0 0;font-size:0.68rem;color:#3F3C38;}.hx-pinrow .hx-pin{display:inline;font-size:0.62rem;margin:0 0 0 4px;}.hx-page{min-height:880px;}.hx-1{display:grid;gap:6px;}.hx-goal{margin-top:14px;background:#4E0B14;color:#fff;border-radius:3px;padding:12px 18px;}.hx-goal h6{margin:0 0 4px;font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:#E8D8D2;}.hx-goal p{margin:0;font-family:"Cormorant Garamond",serif;font-style:italic;font-size:1.15rem;}.hx-tipc div{display:flex;align-items:center;gap:6px;font-size:0.72rem;line-height:1.35;color:#3F3C38;}.hx-fg{display:flex;gap:10px;margin:6px 0 2px;}.hx-fg>div{flex:1;text-align:center;}.hx-fg svg{width:100%;height:46px;display:block;}.hx-fg span{display:block;font-size:0.6rem;color:#3F3C38;}.hx-sub{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:1.05rem;color:#7A1321;margin:0 0 0.5rem;}'
    + '.hx-box{background:#ECE8E2;border-radius:12px;padding:0.75rem 0.95rem;}.hx-box h6{margin:0 0 5px;font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:#7A1321;font-weight:600;}.hx-box p{margin:0;font-size:0.74rem;line-height:1.55;color:#3F3C38;}.hx-box p b{font-weight:600;}'
    + '.hx-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}.hx-3b{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}.hx-2{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;}.hx-4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}'
    + '.hx-dot{display:inline-block;width:18px;height:18px;border-radius:50%;margin-right:6px;vertical-align:middle;}'
    + '.hx-wheel{position:relative;width:330px;height:330px;margin:4px auto 0;}.hx-wheel svg{display:block;}.hx-face{position:absolute;left:50%;top:50%;width:132px;height:132px;margin:-66px 0 0 -66px;border-radius:50%;background:#E7C9B3;box-shadow:0 0 0 4px #F7F5F0,0 0 0 5.5px #B8923A;display:flex;align-items:center;justify-content:center;overflow:hidden;}.hx-face span{font-family:"Cormorant Garamond",serif;font-size:3.2rem;color:#7A1321;}'
    + '.hx-wleg{display:flex;justify-content:center;gap:18px;font-size:0.62rem;color:#4a4541;margin-top:2px;}.hx-wleg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;}.hx-cap{text-align:center;font-family:"Cormorant Garamond",serif;font-style:italic;font-size:0.98rem;color:#4a4541;margin:4px 0 0;}'
    + '.hx-minis{display:grid;grid-template-columns:repeat(5,1fr);gap:16px 8px;margin-top:6px;}.hx-mw{text-align:center;}.hx-mw svg{width:100%;height:auto;display:block;}.hx-mw span{display:block;margin-top:2px;font-size:0.62rem;color:#4a4541;}.hx-mw.me span{color:#7A1321;font-weight:700;}'
    + '.hx-r6{display:flex;height:80px;border-radius:8px;overflow:hidden;}.hx-r6>div{color:#fff;padding:10px 14px;display:flex;flex-direction:column;justify-content:center;}.hx-r6 b{font-family:"Cormorant Garamond",serif;font-size:1.6rem;font-weight:600;line-height:1;}.hx-r6 span{font-size:0.62rem;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;}.hx-r6 small{font-size:0.62rem;opacity:.9;}.hx-r6>div:last-child{padding:8px;align-items:center;}.hx-r6>div:last-child b{font-size:1.1rem;}'
    + '.hx-r6n{display:flex;justify-content:space-between;font-size:0.62rem;color:#4a4541;margin-top:5px;}'
    + '.hx-st{text-align:center;}.hx-rsq{width:92px;height:92px;margin:0 auto;padding:12px;box-sizing:border-box;box-shadow:0 0 0 3px #fff,0 4px 8px -4px rgba(0,0,0,.3);}.hx-rsq>div{width:100%;height:100%;padding:14px;box-sizing:border-box;}.hx-rsq>div>div{width:100%;height:100%;}.hx-st h6{margin:12px 0 3px;font-size:0.56rem;letter-spacing:0.16em;text-transform:uppercase;color:#7A1321;}.hx-st p{margin:0;font-size:0.66rem;line-height:1.5;color:#3F3C38;}.hx-st p b{color:#7A1321;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;margin-right:4px;}'
    + '.hx-chk{background:#ECE8E2;border-radius:99px;padding:7px 12px;display:flex;align-items:center;gap:9px;}.hx-chk b{flex:0 0 20px;height:20px;border-radius:50%;background:#7A1321;color:#fff;display:grid;place-items:center;font-size:0.62rem;}.hx-chk p{margin:0;font-size:0.68rem;line-height:1.3;color:#3F3C38;}'
    + '.hx-3b .hx-box{padding:0.75rem 1rem;}.hx-bt{display:flex;align-items:center;gap:10px;margin:5px 0;font-size:0.8rem;color:#3F3C38;}.hx-bt i{width:25px;height:25px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1);flex:0 0 25px;}'
    + '.hx-tip{margin-top:16px;background:#7A1321;color:#fff;padding:11px 16px;border-radius:3px;text-align:center;font-size:0.7rem;line-height:1.5;letter-spacing:0.02em;}'
    + '.hx-grow{display:flex;gap:14px;align-items:center;margin:0 0 8px;}.hx-fig{flex:0 0 66px;width:66px;height:116px;background:#F7E4DD;border:1px solid rgba(122,19,33,.3);border-radius:4px;padding:3px;box-sizing:border-box;}.hx-fig svg{width:100%;height:100%;display:block;}.hx-gb{flex:1;}.hx-gb h5{margin:0;font-family:"Cormorant Garamond",serif;font-size:1.25rem;font-weight:600;}.hx-gis{display:flex;gap:10px;}.hx-gi{flex:1;text-align:center;}.hx-gm{width:100%;height:92px;display:block;margin:0 auto;}.hx-gi span{display:block;font-size:0.66rem;color:#3F3C38;margin-top:1px;}.hx-gb p{margin:3px 0 0;font-size:0.66rem;font-weight:600;color:#7A1321;}'
    + '.hx-occ{background:#ECE8E2;border-radius:14px;padding:8px 16px;margin:0 0 6px;}.hx-occh{display:flex;align-items:center;gap:12px;}.hx-occh h4{margin:0;font-family:"Cormorant Garamond",serif;font-size:1.4rem;font-weight:600;}.hx-fm{display:flex;gap:14px;margin:6px 0 4px;font-size:0.7rem;color:#3F3C38;}.hx-fm b{font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:#7A1321;margin-right:5px;}.hx-try{margin:2px 0 4px;font-size:0.72rem;color:#3F3C38;}.hx-try b{color:#7A1321;}.hx-occ ul{margin:0;padding-left:18px;font-size:0.7rem;line-height:1.5;color:#3F3C38;}'
    + '.hx-pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px;}.hx-why{color:#7A1321!important;font-style:italic;font-size:0.64rem!important;}.hx-ul{margin:0;padding-left:16px;font-size:0.78rem;line-height:1.55;color:#3F3C38;}.hx-pc{height:122px;border-radius:8px;overflow:hidden;box-shadow:0 0 0 3px #fff,0 4px 8px -4px rgba(0,0,0,.3);}.hx-pc svg{width:100%;height:100%;display:block;}.hx-pt h5{margin:10px 0 0;font-family:"Cormorant Garamond",serif;font-size:1.1rem;font-weight:600;}.hx-pt small{display:block;font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:#7A1321;font-weight:600;}.hx-pt p{margin:3px 0 0;font-size:0.7rem;line-height:1.45;color:#3F3C38;}'
    + '';

  function ensureCss() { if (document.getElementById('hx-css')) return; var s = document.createElement('style'); s.id = 'hx-css'; s.textContent = CSS; document.head.appendChild(s); }
  ensureCss();
  window.HX = { prep: prep, glance: glanceBlock, capsule: capsuleBlock, recipes: recipesBlock, fitguide: fitGuideBlock, audit: auditBlock, session: sessionBlock, fabrics: fabricsBlock, guidanceExtra: guidanceExtra, wheelHtml: wheelHtml, shades: shadesBlock, work: workBlock, beauty: beautyBlock, dress: dressBlock, formulas: formulasBlock, patterns: patternsBlock };
})();
