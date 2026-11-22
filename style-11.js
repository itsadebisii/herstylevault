/* Style-11: the outfit shuffle.
   Flow: lock-screen notification -> chat -> a short brief -> Roll, Spin or Pick (tailored to the brief) -> a shoppable flat lay.
   Looks live in style-11-looks.js. Mount anywhere with Style11.mount(element); Style11.open() opens the pop-up.
   Optional settings (set before this file loads):
     window.STYLE11_PAY_URL       Stripe link for the day pass
     window.STYLE11_WAITLIST_URL  Google Apps Script URL that receives waitlist emails
     window.STYLE11_FREE_ROLLS    free rolls per day (default 3) */
(function(){
  var LOOKS = window.STYLE11_LOOKS || [];
  var FREE_ROLLS = window.STYLE11_FREE_ROLLS || 3;
  var RKEY = 'hsv_s11_rolls', SKEY = 'hsv_s11_saved';
  var ICON = 'images/brand/icon-header.png';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noHover = window.matchMedia && matchMedia('(hover: none)').matches;

  /* ---------- the brief ---------- */
  var OCC = [{k:'dinner',t:'Dinner'},{k:'date',t:'Date night'},{k:'brunch',t:'Brunch'},{k:'shower',t:'Baby shower'},{k:'wedding',t:'Wedding guest'},{k:'birthday',t:'Birthday'},{k:'nightout',t:'Night out'},{k:'dayout',t:'Day out'}];
  var T_EVE = [['Early evening','evening'],['Night','night']], T_DAY = [['Morning','morning'],['Afternoon','afternoon']];
  var TIMES = {dinner:T_EVE, date:T_EVE, brunch:T_DAY, shower:T_DAY, wedding:[['Afternoon','afternoon'],['Evening','evening']], birthday:[['Afternoon','afternoon'],['Evening','evening'],['Night','night']], nightout:[['Night','night']], dayout:T_DAY};
  var LOOKING = [{k:'whole',t:'The whole outfit'},{k:'dress',t:'A dress'},{k:'shoes',t:'Shoes'},{k:'accessories',t:'Bag and jewelry'},{k:'separates',t:'Top and bottom'}];
  var TYPES = {dress:['dress'], shoes:['shoes'], accessories:['bag','jewelry'], separates:['top','bottom']};
  var VIBES = [{k:'polished',t:'Polished'},{k:'romantic',t:'Romantic'},{k:'bold',t:'Bold'},{k:'easy',t:'Easy'}];
  var WX = [{k:'cold',t:'Cold',q:'winter'},{k:'mild',t:'Mild',q:'fall'},{k:'warm',t:'Warm',q:'summer'}];
  var AGES = [{k:'u25',t:'Under 25',q:''},{k:'25',t:'25 to 34',q:'women 25-34'},{k:'35',t:'35 to 44',q:'women 35-44'},{k:'45',t:'45 and over',q:'women over 45'},{k:'na',t:'Prefer not to say',q:''}];
  var STEPS = [
    {key:'occ', title:'What are you dressing for?', list: function(){ return OCC; }},
    {key:'time', title:'What time of day?', list: function(b){ return (TIMES[b.occ] || []).map(function(t){ return {k:t[1], t:t[0]}; }); }},
    {key:'looking', title:'What are you looking for?', list: function(){ return LOOKING; }},
    {key:'vibe', title:'What is the vibe?', list: function(){ return VIBES; }},
    {key:'wx', title:'How is the weather?', list: function(){ return WX; }},
    {key:'age', title:'Your age range?', note:'Only used to tailor your ideas. Never stored.', list: function(){ return AGES; }}
  ];

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function by(list, k){ return list.filter(function(x){ return x.k === k; })[0]; }
  function star(a){ return a ? '*' : ''; }
  function rand(list){ return list[Math.floor(Math.random() * list.length)]; }
  function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function today(){ var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  /* ---------- rolls (3 free a day, kept in this browser) ---------- */
  function rolls(){
    var r = {date:today(), used:0, bonus:0};
    try { var s = JSON.parse(localStorage.getItem(RKEY) || 'null'); if (s && s.date === today()) r = s; } catch (e) {}
    return r;
  }
  function saveRolls(r){ try { localStorage.setItem(RKEY, JSON.stringify(r)); } catch (e) {} }
  function rollsLeft(){ var r = rolls(); return Math.max(0, FREE_ROLLS + (r.bonus || 0) - r.used); }
  function useRoll(){ var r = rolls(); if (FREE_ROLLS + (r.bonus || 0) - r.used <= 0) return false; r.used += 1; saveRolls(r); return true; }
  function addBonus(n){ var r = rolls(); r.bonus = (r.bonus || 0) + n; saveRolls(r); }

  /* ---------- saved looks ---------- */
  function savedList(){ try { var s = JSON.parse(localStorage.getItem(SKEY) || '[]'); return Array.isArray(s) ? s : []; } catch (e) { return []; } }
  function setSaved(a){ try { localStorage.setItem(SKEY, JSON.stringify(a)); } catch (e) {} }

  /* ---------- matching ---------- */
  function hasType(look, types){ return look.pieces.some(function(p){ return types.indexOf(p.type) > -1; }); }
  function score(look, b){
    var t = look.tags, s = 0;
    if (t.occ.indexOf(b.occ) > -1) s += 5;
    if (t.time.indexOf(b.time) > -1) s += 3;
    if (b.looking && b.looking !== 'whole') { if (hasType(look, TYPES[b.looking])) s += 3; } else s += 1.5;
    if (t.vibe.indexOf(b.vibe) > -1) s += 2;
    if (t.wx.indexOf(b.wx) > -1) s += 1;
    return s;
  }
  function ranked(b){ return LOOKS.map(function(l){ return {look:l, s:score(l, b)}; }).sort(function(x, y){ return y.s - x.s; }); }

  /* ---------- Pinterest search from the brief ---------- */
  function pinUrl(b){
    if (!b || !b.occ) return 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent('outfit ideas');
    var look = {shoes:'shoes', dress:'dress', accessories:'bag and jewelry', separates:'top and pants'}[b.looking] || '';
    var night = (b.time === 'evening' || b.time === 'night') ? 'night' : '';
    var q = [by(VIBES, b.vibe).t, by(OCC, b.occ).t, night, 'outfit', look, by(WX, b.wx).q, (by(AGES, b.age) || {}).q].filter(Boolean).join(' ').toLowerCase();
    return 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(q);
  }

  /* ---------- chat (intro) ---------- */
  function chatHtml(){
    return '<div class="s9-phone" role="img" aria-label="A text conversation. A client writes: Help, I’m stressed, I need an outfit for dinner this weekend. Style-11 please. The stylist replies: I got you girl lala. What are we doing this weekend? What are your vibes?">' +
      '<div class="s9-notch" aria-hidden="true"></div>' +
      '<div class="s9-status" aria-hidden="true"><span>9:41</span><span class="s9-sig"><i></i><i></i><i></i><i></i><em></em></span></div>' +
      '<div class="s9-bar" aria-hidden="true"><span class="s9-back">‹</span><span class="s9-av"><img src="' + ICON + '" alt="" width="58" height="33"></span><span class="s9-who">HerStyleVault</span></div>' +
      '<div class="s9-chat" aria-hidden="true"><p class="s9-time"><b>Friday</b> 4:47 PM</p>' +
      '<div style="--d:0.4s" class="s11-pop s9-row them"><p class="b them">HELP I’m stressed 🥲 I need an outfit for dinner this weekend</p></div>' +
      '<div style="--d:1.2s" class="s11-pop s9-row them"><p class="b them tail">Style-11 please 🚨<span class="s9-react">❤️</span></p></div>' +
      '<div style="--d:2.1s" class="s11-pop s9-row me"><p class="b me">I got you girl lala 🫶🏾</p></div>' +
      '<div style="--d:2.9s" class="s11-pop s9-row me"><p class="b me tail">What are we doing this weekend? What are your vibes??</p></div>' +
      '<p class="s9-deliv s11-pop" style="--d:3.3s">Delivered</p>' +
      '<div style="--d:3.7s" class="s11-pop s9-row them"><p class="b them typing tail"><i></i><i></i><i></i></p></div></div>' +
      '<div class="s9-input" aria-hidden="true"><span class="s9-plus">+</span><span class="s9-field">Message</span></div></div>';
  }

  /* ---------- icons ---------- */
  var IC = {
    roll: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>',
    spin: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.2" opacity=".7"/></svg>',
    pick: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.2a1.5 1.5 0 0 1 3 0V11m0-.6a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a5 5 0 0 1-4-2L4.2 15.7a1.5 1.5 0 0 1 2.4-1.8L9 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
  };

  function mount(root, opts){
    opts = opts || {};
    var hl = opts.heading || 2, modal = !!opts.modal;
    var st = {screen:'ring', step:0, brief:{occ:null,time:null,looking:null,vibe:null,wx:null,age:null}, method:'roll', busy:false, seen:[], wrot:0, result:null, fromBrief:false, strip:[], picks:null};
    root.classList.add('s11-root');
    root.innerHTML = '<div class="s11-view"></div><p class="s9-toast" role="status" aria-live="polite"></p>';
    var view = root.querySelector('.s11-view'), toast = root.querySelector('.s9-toast');

    function say(msg){ toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function(){ toast.classList.remove('on'); }, 2400); }
    function focusTitle(){ var t = view.querySelector('[data-title]'); if (t) t.focus({preventScroll:true}); }
    function go(screen){ st.screen = screen; render(true); }
    function briefDone(){ var b = st.brief; return !!(b.occ && b.time && b.looking && b.vibe && b.wx && b.age); }
    function briefChips(){
      var b = st.brief, tl = (TIMES[b.occ] || []).filter(function(t){ return t[1] === b.time; })[0];
      return [by(OCC, b.occ).t, tl ? tl[0] : '', by(LOOKING, b.looking).t, by(VIBES, b.vibe).t, by(WX, b.wx).t].filter(Boolean);
    }

    /* ---------- screens ---------- */
    function renderRing(){
      var d = new Date(), date = '', clock = '';
      try { date = d.toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'}); clock = d.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'}).replace(/\s?[AP]M$/i, ''); } catch (e) { date = 'Friday'; clock = '4:47'; }
      return '<div class="s9-hero s11-ring"><h' + hl + ' class="s11-vh" data-title tabindex="-1">Style-11</h' + hl + '>' +
        '<div class="s9-phone s11-lockphone"><div class="s9-notch" aria-hidden="true"></div>' +
        '<div class="s11-lock"><div class="s11-lock-top" aria-hidden="true">' +
        '<svg class="s11-padlock" viewBox="0 0 24 24" width="18" height="18" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M7 10V7a5 5 0 0 1 10 0v3"/><rect x="5" y="10" width="14" height="10" rx="2.5" fill="currentColor"/></svg>' +
        '<p class="s11-date">' + esc(date) + '</p><p class="s11-clock">' + esc(clock) + '</p></div>' +
        '<button type="button" class="s11-notif" data-act="answer" aria-label="New message from HerStyleVault: Style-11, outfit emergency. Tap to open.">' +
        '<span class="ni" aria-hidden="true"><img src="' + ICON + '" alt="" width="58" height="33"><b>1</b></span>' +
        '<span class="nb"><span class="nt"><strong>HerStyleVault</strong><i>now</i></span>' +
        '<span class="nm">Style-11 <span aria-hidden="true">🚨</span> Outfit emergency?</span><span class="nm nm2">Tap to open.</span></span></button>' +
        '<div class="s11-lock-bot" aria-hidden="true"><span class="lb"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 2h6l-1 5h-4zM8 9h8v3l-2 2v7a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-7l-2-2z"/></svg></span><span class="lb"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 4l-1.5 2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2.5L15 4zm3 4.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg></span></div>' +
        '<i class="s11-home" aria-hidden="true"></i></div></div></div>';
    }
    function renderIntro(){
      return '<div class="s9-hero s11-intro"><p class="s9-psst">Style-11, what’s your outfit emergency?</p>' +
        '<h' + hl + ' class="s9-title" data-title tabindex="-1"><span class="h1-kw">Style-11 outfit shuffle</span><span aria-hidden="true">Style-<em>11</em></span></h' + hl + '>' +
        '<p class="s9-sub">Nothing to wear? Roll for it.</p>' + chatHtml() +
        '<div class="s11-slot"><button type="button" class="s11-skip" data-act="ff" aria-label="Skip to the end of the text messages">Skip</button><button type="button" class="lbk-btn s9-start s11-pop" style="--d:3.4s" data-act="start">Help me out</button></div></div>';
    }
    function renderBrief(){
      var s = STEPS[st.step], b = st.brief, list = s.list(b), total = STEPS.length;
      var dots = STEPS.map(function(x, i){ return '<i class="' + (i < st.step ? 'done' : (i === st.step ? 'cur' : '')) + '"></i>'; }).join('');
      var cols = list.length === 3 ? ' three' : (list.length > 4 ? '' : ' few');
      var opts = list.map(function(o){
        var on = b[s.key] === o.k;
        return '<button type="button" class="s9-opt s11-opt' + (on ? ' on' : '') + '" data-v="' + esc(o.k) + '" aria-pressed="' + on + '"><span class="t">' + esc(o.t) + '</span></button>';
      }).join('');
      return '<section class="s9-quiz s11-brief-card"><p class="s11-kicker">Your brief</p><div class="s9-prog" aria-hidden="true">' + dots + '</div>' +
        '<p class="s9-qn">Step ' + (st.step + 1) + ' of ' + total + '</p>' +
        '<div class="s9-step in"><h2 class="s11-q" id="s11q" data-title tabindex="-1">' + s.title + '</h2>' + (s.note ? '<p class="s11-note">' + s.note + '</p>' : '') +
        '<div class="s9-opts' + cols + '" role="group" aria-labelledby="s11q">' + opts + '</div></div>' +
        '<button type="button" class="s9-back-btn" data-act="back">‹ Back</button></section>';
    }
    function meterHtml(){
      var left = rollsLeft(), pips = '';
      for (var i = 0; i < FREE_ROLLS + (rolls().bonus || 0); i++) pips += '<i class="' + (i < left ? 'on' : '') + '"></i>';
      return '<div class="s11-meter" role="status"><span>Rolls today</span><span class="pips" aria-hidden="true">' + pips + '</span><b>' + left + ' left</b></div>';
    }
    function howText(){
      return {roll:'Tap the dice. We shuffle your matches and land on one.', spin:'Spin the wheel. It lands on one of your matches.', pick:'Tap the piece you would grab first. We reveal the full look.'}[st.method];
    }
    function methodsHtml(){
      var M = [['roll','Roll'],['spin','Spin'],['pick','Pick']];
      return '<div class="s9-methods" role="group" aria-label="How do you want to play?">' + M.map(function(m){
        return '<button type="button" class="s9-m' + (st.method === m[0] ? ' on' : '') + '" data-method="' + m[0] + '" aria-pressed="' + (st.method === m[0]) + '">' + IC[m[0]] + ' ' + m[1] + '</button>';
      }).join('') + '</div>';
    }
    /* the wheel: one slice per look that matches the brief */
    function polar(r, ang){ var t = (ang - 90) * Math.PI / 180; return [r * Math.cos(t), r * Math.sin(t)]; }
    function wheelHtml(){
      var n = st.strip.length || 1, seg = 360 / n, fills = ['#8B1226','#FBE9E4','#C99A2E','#F4B3BB','#6E0F1E','#FFF8F3'], inks = ['#FCF3EE','#2A1814','#2A1814','#2A1814','#FCF3EE','#2A1814'], s = '', lights = '', i;
      st.strip.forEach(function(l, k){
        var a0 = k * seg, a1 = a0 + seg, p0 = polar(104, a0), p1 = polar(104, a1), big = seg > 180 ? 1 : 0, mid = a0 + seg / 2;
        var words = String(l.short || l.title).split(' '), half = Math.ceil(words.length / 2), l1 = words.slice(0, half).join(' '), l2 = words.slice(half).join(' ');
        s += '<path d="M0 0 L' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A104 104 0 ' + big + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' Z" fill="' + fills[k % fills.length] + '" stroke="#fff" stroke-width="1.5"/>' +
          '<g transform="rotate(' + mid + ')"><g' + ((mid > 90 && mid < 270) ? ' transform="rotate(180 0 -62)"' : '') + ' fill="' + inks[k % inks.length] + '" font-family="Cormorant Garamond, Georgia, serif" font-weight="600" text-anchor="middle"><text y="' + (l2 ? '-69' : '-62') + '" font-size="14">' + esc(l1) + '</text>' + (l2 ? '<text y="-54" font-size="14">' + esc(l2) + '</text>' : '') + '</g></g>';
      });
      for (i = 0; i < 24; i++) { var q = polar(118, i * 15); lights += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="2.2" fill="' + (i % 2 ? '#F4B3BB' : '#fff') + '"/>'; }
      return '<div class="s9-wheelwrap"><span class="s9-ptr" aria-hidden="true"></span><svg class="s9-wheel" viewBox="-126 -126 252 252" aria-hidden="true" focusable="false">' +
        '<circle r="124" fill="#4E0B14"/><circle r="122" fill="none" stroke="#C99A2E" stroke-width="2"/>' + lights +
        '<circle r="108" fill="#fff"/><g id="wheelG" style="transform-origin:0 0;transform:rotate(' + st.wrot + 'deg)">' + s + '</g>' +
        '<circle r="27" fill="#fff" stroke="#C99A2E" stroke-width="2.5"/><circle r="22" fill="none" stroke="#8B1226" stroke-width="1"/><image href="' + ICON + '" x="-16" y="-9" width="32" height="18"/></svg></div>';
    }
    function pieceCrop(look, p){
      var l = p.box[0], t = p.box[1], w = p.box[2], h = p.box[3], bw = w * 9, bh = h * 11.25, mx = Math.max(bw, bh), k = 0.8 / mx;
      var iw = 900 * k * 100, ih = 1125 * k * 100, left = 50 - (l + w / 2) * 9 * k * 100, top = 50 - (t + h / 2) * 11.25 * k * 100;
      return '<img src="' + esc(look.art) + '" alt="" style="width:' + iw.toFixed(1) + 'cqw;height:' + ih.toFixed(1) + 'cqw;left:' + left.toFixed(1) + 'cqw;top:' + top.toFixed(1) + 'cqw">';
    }
    function pickHtml(){
      if (!st.picks) dealPicks();
      return '<p class="s11-pickq">Which would you grab first?</p><div class="s11-picks">' + st.picks.map(function(c, i){
        return '<button type="button" class="s11-pick' + (c.chosen ? ' chosen' : '') + (c.dim ? ' dim' : '') + '" data-pick="' + i + '" aria-label="' + esc(c.piece.name) + '"><span class="crop">' + pieceCrop(c.look, c.piece) + '</span><span class="cap">' + esc(c.piece.name) + '</span></button>';
      }).join('') + '</div>';
    }
    function stageHtml(){
      if (st.method === 'spin') { if (!st.strip.length) dealStrip(); return wheelHtml() + '<button type="button" class="lbk-btn s9-rollbtn" data-act="spin">Spin the wheel</button>'; }
      if (st.method === 'pick') return pickHtml();
      var faces = [1,2,3,4,5,6].map(function(n){ return '<span class="f f' + n + '"><img src="' + ICON + '" alt="" width="58" height="33"></span>'; }).join('');
      var sparks = [0,1,2,3,4,5,6,7].map(function(n){ return '<b style="--a:' + (n * 45) + 'deg"></b>'; }).join('');
      return '<div class="s9-stage" data-act="roll"><div class="s9-cube">' + faces + '</div><i class="s9-shadow"></i><span class="s9-sparks">' + sparks + '</span></div>' +
        '<div class="s11-shuf" id="shuf" aria-hidden="true"><span class="ph"><img src="' + ICON + '" alt="" width="58" height="33"></span></div>' +
        '<button type="button" class="lbk-btn s9-rollbtn" data-act="roll">Roll the dice</button>';
    }
    function renderPlay(){
      var left = rollsLeft(), n = savedList().length;
      return '<section class="s9-quiz s9-play"><h2 class="s9-h2" data-title tabindex="-1">find your look</h2>' +
        '<div class="s11-brief"><p class="s11-chips">' + briefChips().map(function(c){ return '<span>' + esc(c) + '</span>'; }).join('') + '</p><button type="button" class="link-btn" data-act="edit">Edit answers</button>' +
        (n ? '<button type="button" class="link-btn" data-act="saved">Saved (' + n + ')</button>' : '') + '</div>' +
        meterHtml() + methodsHtml() + '<p class="s11-how">' + howText() + '</p>' +
        (left ? stageHtml() : '<div class="s11-out"><p>You have used today’s rolls.</p><button type="button" class="lbk-btn s9-rollbtn" data-act="locked">Get more rolls</button></div>') +
        '<button type="button" class="s9-back-btn" data-act="back">‹ Back</button><p class="s9-hint" role="status" aria-live="polite"></p></section>';
    }
    function renderLocked(){
      var wl = '';
      return '<section class="s9-quiz s11-locked"><p class="s11-kicker">Today’s rolls are used</p><h2 class="s9-h2" data-title tabindex="-1">Keep rolling</h2>' +
        '<p class="s9-rsub">You have used your ' + FREE_ROLLS + ' free rolls today.</p>' +
        '<div class="s11-offers">' +
        (window.STYLE11_PAY_URL ? '<div class="s11-offer feat"><span class="tag">Quick</span><h3>Day pass</h3><p class="price">$3</p><p>Unlimited rolls, spins and picks for 24 hours.</p><button type="button" class="lbk-btn" data-act="pay">Get the day pass</button></div>' : '') +
        '<div class="s11-offer"><span class="tag">Free</span><h3>Earn 3 more rolls</h3><p>Take a look at my packages, then come back for 3 more.</p><a class="lbk-btn ghost" href="packages.html" target="_blank" rel="noopener" data-act="earn">See the packages</a></div>' +
        (window.STYLE11_WAITLIST_URL ? '<div class="s11-offer"><span class="tag">Coming soon</span><h3>Membership waitlist</h3><p>Unlimited rolls, new flat lays first and member-only looks. Join the waitlist and you are enrolled the day it opens.</p>' +
        '<form class="s11-wl" id="wl" novalidate><label class="s11-vh" for="wlEmail">Email</label><input id="wlEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required><button type="submit" class="lbk-btn ghost">Join the waitlist</button></form><p class="s9-hint" id="wlMsg" role="status" aria-live="polite"></p></div>' : '') +
        '</div><p class="s11-fine">Or come back tomorrow for ' + FREE_ROLLS + ' more free rolls.</p>' +
        '<button type="button" class="s9-back-btn" data-act="toplay">‹ Back</button></section>';
    }
    function hotspots(look, flagTypes){
      return look.pieces.map(function(p){
        var l = p.box[0], t = p.box[1], w = p.box[2], h = p.box[3];
        var px = w >= 100 ? 0 : l / (100 - w) * 100, py = h >= 100 ? 0 : t / (100 - h) * 100;
        var cx = l + w / 2, al = cx < 30 ? ' al-l' : (cx > 70 ? ' al-r' : '');
        var flag = flagTypes && flagTypes.indexOf(p.type) > -1 ? ' flag' : '';
        return '<a class="hs' + al + flag + '" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer' + (p.affiliate ? ' sponsored' : '') + '" style="left:' + l + '%;top:' + t + '%;width:' + w + '%;height:' + h + '%;background-image:url(' + esc(look.art) + ');background-size:' + (10000 / w) + '% ' + (10000 / h) + '%;background-position:' + px + '% ' + py + '%" aria-label="Get this piece: ' + esc(p.name) + (p.affiliate ? ' (affiliate link)' : '') + ', opens in a new tab"><span class="tg">Get this piece' + star(p.affiliate) + '<small>' + esc(p.name) + '</small></span></a>';
      }).join('');
    }
    function renderResult(r){
      var l = r.look, b = st.brief, flagTypes = (st.fromBrief && b.looking && b.looking !== 'whole') ? TYPES[b.looking] : null;
      var anyAff = l.pieces.some(function(p){ return p.affiliate; }) || (l.outfit && l.outfit.affiliate);
      var saved = savedList().indexOf(l.slug) > -1;
      var focusPiece = flagTypes ? l.pieces.filter(function(p){ return flagTypes.indexOf(p.type) > -1; })[0] : null;
      var focusLabel = (b.looking === 'shoes') ? 'Your shoes' : (b.looking === 'dress' ? 'Your dress' : (b.looking === 'accessories' ? 'Your accessories' : 'Your pieces'));
      var tags = st.fromBrief ? '<p class="s9-tagsline">' + [by(OCC, b.occ).t, by(VIBES, b.vibe).t, by(WX, b.wx).t].map(esc).join(' &middot; ') + '</p>' : '';
      var match = st.fromBrief ? '<p class="s9-match">' + (r.s >= 8 ? 'Matched to your brief' : 'Closest look for now. More coming soon.') + '</p>' : '';
      var all = (l.outfit ? '<li class="whole"><span>The whole look</span><a href="' + esc(l.outfit.url) + '" target="_blank" rel="noopener noreferrer' + (l.outfit.affiliate ? ' sponsored' : '') + '">Get it' + star(l.outfit.affiliate) + '</a></li>' : '') +
        l.pieces.map(function(p){ return '<li><span>' + esc(p.name) + '</span><a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer' + (p.affiliate ? ' sponsored' : '') + '">Get it' + star(p.affiliate) + '</a></li>'; }).join('');
      var credit = l.credit ? '<p class="s9-credit">' + (l.credit.url ? '<a href="' + esc(l.credit.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.credit.text) + '</a>' : esc(l.credit.text)) + '</p>' : '';
      var left = rollsLeft();
      return '<section class="s9-result"><div class="s9-card-in">' +
        '<button type="button" class="s11-heart" data-act="save" aria-pressed="' + saved + '" aria-label="' + (saved ? 'Remove from saved looks' : 'Save this look') + '">' + IC.heart + '</button>' +
        '<p class="s9-rk">Your Style-11 pick</p>' + match +
        (l.wearing ? '<p class="s9-wear"><img src="' + ICON + '" alt="" width="58" height="33"> I’m wearing this</p>' : '') +
        '<div class="s9-board"><img src="' + esc(l.art) + '" alt="' + esc(l.alt) + '">' + hotspots(l, flagTypes) + '</div>' +
        '<p class="s9-boardhint">' + (noHover ? 'Tap a piece to shop it.' : 'Hover a piece to shop it.') + '</p>' + credit +
        (focusPiece ? '<a class="s11-focus" href="' + esc(focusPiece.url) + '" target="_blank" rel="noopener noreferrer' + (focusPiece.affiliate ? ' sponsored' : '') + '"><small>' + focusLabel + '</small><strong>' + esc(focusPiece.name) + '</strong><span>Get this piece' + star(focusPiece.affiliate) + ' &rarr;</span></a>' : '') +
        '<h3 data-title tabindex="-1">' + esc(l.title) + '</h3>' + tags +
        '<span class="lbk-dots" aria-hidden="true">' + (l.colors || []).map(function(c){ return '<b style="background:' + c[1] + '"></b>'; }).join('') + '</span>' +
        (l.outfit ? '<a class="lbk-btn s9-whole" href="' + esc(l.outfit.url) + '" target="_blank" rel="noopener noreferrer' + (l.outfit.affiliate ? ' sponsored' : '') + '">Get the whole look' + star(l.outfit.affiliate) + '</a>' : '') +
        '<button type="button" class="lbk-btn ghost s9-allbtn" data-act="links" aria-expanded="false" aria-controls="s11links">Get all the links</button>' +
        '<ul class="s9-links" id="s11links" hidden>' + all + '</ul>' +
        (anyAff ? '<p class="s9-aff">* Affiliate link: I may earn a small commission at no extra cost to you. Not every link is an affiliate link.</p>' : '') +
        '<p class="s9-handle">@herstylevault.official</p></div>' +
        '<div class="s9-acts">' + (st.fromBrief ? '<button type="button" class="lbk-btn s9-again" data-act="again">' + (left ? 'Play again (' + left + ' left)' : 'Get more rolls') + '</button>' : '<button type="button" class="lbk-btn s9-again" data-act="restart">Find my own look</button>') +
        '<button type="button" class="lbk-btn ghost" data-act="copy">Copy link to this look</button>' +
        '<a class="lbk-btn ghost" href="' + pinUrl(st.fromBrief ? b : null) + '" target="_blank" rel="noopener noreferrer">More ideas on Pinterest</a>' +
        '<a class="s9-down" href="services.html"' + (modal ? ' target="_top"' : '') + '>Want it styled just for you? See my services</a></div></section>';
    }
    function renderSaved(){
      var ids = savedList(), items = ids.map(function(id){ return LOOKS.filter(function(l){ return l.slug === id; })[0]; }).filter(Boolean);
      return '<section class="s9-quiz"><p class="s11-kicker">Saved looks</p><h2 class="s9-h2" data-title tabindex="-1">Your saved looks</h2>' +
        (items.length ? '<ul class="s11-savedlist">' + items.map(function(l){ return '<li><button type="button" data-open="' + esc(l.slug) + '"><img src="' + esc(l.art) + '" alt="" loading="lazy"><span><strong>' + esc(l.title) + '</strong><small>Open look</small></span></button></li>'; }).join('') + '</ul>' : '<p class="s9-rsub">Nothing saved yet. Tap the heart on a look to keep it.</p>') +
        '<button type="button" class="s9-back-btn" data-act="toplay">‹ Back</button></section>';
    }
    function render(focus){
      var s = st.screen;
      if (s === 'ring') view.innerHTML = renderRing();
      else if (s === 'intro') view.innerHTML = renderIntro();
      else if (s === 'brief') view.innerHTML = renderBrief();
      else if (s === 'play') view.innerHTML = renderPlay();
      else if (s === 'locked') view.innerHTML = renderLocked();
      else if (s === 'saved') view.innerHTML = renderSaved();
      else if (s === 'result') view.innerHTML = renderResult(st.result);
      if (focus) focusTitle();
      if (modal) { var body = root.closest('.s11-body'); if (body && s !== 'result') body.scrollTop = 0; }
    }

    /* ---------- choosing a look ---------- */
    function candidates(){ return ranked(st.brief).slice(0, 6); }
    function choose(pool){
      var fresh = pool.filter(function(r){ return st.seen.indexOf(r.look.slug) < 0; });
      if (!fresh.length) { st.seen = []; fresh = pool; }
      var top = fresh[0].s, tier = fresh.filter(function(r){ return r.s >= top - 1.5; });
      var c = rand(tier); st.seen.push(c.look.slug); return c;
    }
    function dealStrip(){ st.strip = shuffle(candidates().map(function(r){ return r.look; })); }
    function dealPicks(){
      var pool = candidates().slice(0, 3), want = st.brief.looking && st.brief.looking !== 'whole' ? TYPES[st.brief.looking] : null;
      st.picks = shuffle(pool).map(function(r){
        var ps = r.look.pieces, p = (want && ps.filter(function(x){ return want.indexOf(x.type) > -1; })[0]) || ps.slice().sort(function(a, b){ return b.box[2] * b.box[3] - a.box[2] * a.box[3]; })[0];
        return {look:r.look, s:r.s, piece:p, chosen:false, dim:false};
      });
    }

    /* ---------- reveal ---------- */
    function reveal(c){
      st.result = {look:c.look, s:c.s}; st.fromBrief = true; st.busy = false; go('result');
      var board = view.querySelector('.s9-board'), card = view.querySelector('.s9-card-in');
      if (board && !reduce) {
        var n = board.querySelectorAll('.hs').length;
        Array.prototype.forEach.call(board.querySelectorAll('.hs'), function(h, i){ h.style.setProperty('--i', i); });
        board.style.setProperty('--n', n); board.classList.add('dropin');
        setTimeout(function(){ board.classList.remove('dropin'); }, n * 160 + 1300);
        confetti(card);
      }
      try { root.scrollIntoView({block:'nearest'}); } catch (e) {}
    }
    function confetti(host){
      if (reduce || !host) return;
      var cols = ['#8B1226','#C99A2E','#F4B3BB','#FBE9E4'], out = '';
      for (var i = 0; i < 22; i++) {
        var ang = Math.random() * Math.PI * 2, d = 90 + Math.random() * 120;
        out += '<b style="--dx:' + Math.round(Math.cos(ang) * d) + 'px;--dy:' + Math.round(Math.sin(ang) * d - 40) + 'px;--r:' + Math.round(Math.random() * 540 - 270) + 'deg;color:' + cols[i % cols.length] + ';font-size:' + (9 + Math.round(Math.random() * 11)) + 'px">' + (i % 3 ? '♥' : '✦') + '</b>';
      }
      var c = document.createElement('div'); c.className = 's9-confetti'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = out; host.appendChild(c);
      setTimeout(function(){ if (c.parentNode) c.parentNode.removeChild(c); }, 1600);
    }
    function lockButtons(on){ Array.prototype.forEach.call(view.querySelectorAll('.s9-rollbtn,.s9-m'), function(b){ b.disabled = on; }); }
    function refreshMeter(){ var m = view.querySelector('.s11-meter'); if (m) m.outerHTML = meterHtml(); }

    /* ---------- the three games ---------- */
    function roll(){
      if (st.busy) return;
      if (!useRoll()) { go('locked'); return; }
      st.busy = true; refreshMeter();
      var pool = candidates(), win = choose(pool), cube = view.querySelector('.s9-cube'), stage = view.querySelector('.s9-stage'), shuf = view.querySelector('#shuf');
      if (!cube || reduce) { reveal(win); return; }
      lockButtons(true);
      cube.classList.remove('tumble'); stage.classList.remove('pop'); void cube.offsetWidth; cube.classList.add('tumble');
      setTimeout(function(){ stage.classList.add('pop'); }, 1250);
      var imgs = pool.map(function(r){ return r.look; }), k = 0;
      shuf.classList.add('go');
      var iv = setInterval(function(){ var l = imgs[k++ % imgs.length]; shuf.innerHTML = '<img src="' + esc(l.art) + '" alt="">'; }, 95);
      setTimeout(function(){ clearInterval(iv); shuf.classList.remove('go'); shuf.innerHTML = '<img src="' + esc(win.look.art) + '" alt="">'; shuf.classList.add('land'); }, 1300);
      setTimeout(function(){ reveal(win); }, 1900);
    }
    function spin(){
      if (st.busy) return;
      if (!useRoll()) { go('locked'); return; }
      st.busy = true; refreshMeter();
      var pool = candidates(), win = choose(pool), g = view.querySelector('#wheelG'), n = st.strip.length || 1, idx = 0;
      st.strip.forEach(function(l, i){ if (l.slug === win.look.slug) idx = i; });
      var seg = 360 / n, center = idx * seg + seg / 2, cur = ((st.wrot % 360) + 360) % 360, jitter = (Math.random() - .5) * seg * .5;
      st.wrot += 360 * 5 + ((((360 - center - cur + jitter) % 360) + 360) % 360);
      if (!g || reduce) { reveal(win); return; }
      lockButtons(true);
      g.style.transition = 'transform 3.6s cubic-bezier(.12,.65,.1,1)'; g.style.transform = 'rotate(' + st.wrot + 'deg)';
      setTimeout(function(){ reveal(win); }, 4100);
    }
    function dealPicksFresh(){ st.picks = null; dealPicks(); }
    function pickPiece(i){
      if (st.busy || !st.picks || st.picks.some(function(c){ return c.chosen; })) return;
      if (!useRoll()) { go('locked'); return; }
      st.busy = true; refreshMeter();
      var els = view.querySelectorAll('.s11-pick');
      st.picks.forEach(function(c, n){ if (n === i) { c.chosen = true; els[n].classList.add('chosen'); } else { c.dim = true; els[n].classList.add('dim'); } });
      var c = st.picks[i], win = {look:c.look, s:c.s};
      st.seen.push(c.look.slug);
      setTimeout(function(){ st.picks = null; reveal(win); }, reduce ? 0 : 1100);
    }

    /* ---------- events ---------- */
    root.addEventListener('click', function(e){
      var hs = e.target.closest('.hs');
      Array.prototype.forEach.call(root.querySelectorAll('.hs.active'), function(x){ if (x !== hs) x.classList.remove('active'); });
      if (hs && noHover && !hs.classList.contains('active')) { e.preventDefault(); hs.classList.add('active'); return; }
      var mb = e.target.closest('[data-method]'); if (mb) { if (!st.busy) { st.method = mb.getAttribute('data-method'); go('play'); } return; }
      var pk = e.target.closest('[data-pick]'); if (pk) { pickPiece(+pk.getAttribute('data-pick')); return; }
      var op = e.target.closest('[data-open]'); if (op) { var l = LOOKS.filter(function(x){ return x.slug === op.getAttribute('data-open'); })[0]; if (l) { st.result = {look:l, s:0}; st.fromBrief = briefDone(); go('result'); } return; }
      var opt = e.target.closest('.s11-opt');
      if (opt) {
        var s = STEPS[st.step], v = opt.getAttribute('data-v');
        if (s.key === 'occ' && st.brief.occ !== v) st.brief.time = null;
        st.brief[s.key] = v; st.seen = []; st.strip = []; st.picks = null;
        Array.prototype.forEach.call(view.querySelectorAll('.s11-opt'), function(x){ x.classList.toggle('on', x === opt); x.setAttribute('aria-pressed', x === opt); });
        setTimeout(function(){
          st.step++;
          if (STEPS[st.step] && STEPS[st.step].key === 'time') { var tl = STEPS[st.step].list(st.brief); if (tl.length === 1) { st.brief.time = tl[0].k; st.step++; } }
          if (st.step >= STEPS.length) go('play'); else go('brief');
        }, reduce ? 0 : 240);
        return;
      }
      var act = e.target.closest('[data-act]'); if (!act) return;
      var what = act.getAttribute('data-act');
      if (what === 'ff') { var ig = view.querySelector('.s11-intro'); if (ig) { ig.classList.add('done'); var sb = ig.querySelector('.s9-start'); if (sb) sb.focus({preventScroll:true}); } }
      else if (what === 'answer') go('intro');
      else if (what === 'start') { st.step = 0; go(briefDone() ? 'play' : 'brief'); }
      else if (what === 'back') {
        if (st.screen === 'brief') { if (st.step > 0) { st.step--; if (STEPS[st.step].key === 'time' && (TIMES[st.brief.occ] || []).length === 1) st.step--; go('brief'); } else go('intro'); }
        else if (st.screen === 'play') { st.step = STEPS.length - 1; go('brief'); }
        else go('intro');
      }
      else if (what === 'toplay') go('play');
      else if (what === 'edit') { st.step = 0; go('brief'); }
      else if (what === 'saved') go('saved');
      else if (what === 'roll') roll();
      else if (what === 'spin') spin();
      else if (what === 'locked') go('locked');
      else if (what === 'again') { if (rollsLeft()) { st.picks = null; go('play'); } else go('locked'); }
      else if (what === 'restart') { st.brief = {occ:null,time:null,looking:null,vibe:null,wx:null,age:null}; st.seen = []; st.strip = []; st.picks = null; st.step = 0; go('brief'); }
      else if (what === 'save') {
        var a = savedList(), id = st.result.look.slug, i = a.indexOf(id);
        if (i > -1) { a.splice(i, 1); say('Removed from saved looks'); } else { a.push(id); say('Saved. Find it under Saved looks.'); }
        setSaved(a); act.setAttribute('aria-pressed', i < 0); act.setAttribute('aria-label', i < 0 ? 'Remove from saved looks' : 'Save this look');
      }
      else if (what === 'links') { var ul = view.querySelector('#s11links'), open = ul.hidden; ul.hidden = !open; act.setAttribute('aria-expanded', open); act.textContent = open ? 'Hide the links' : 'Get all the links'; }
      else if (what === 'copy') {
        var url = new URL('style11.html#look-' + st.result.look.slug, location.href).href;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function(){ say('Link copied'); }, function(){ say(url); }); else say(url);
      }
      else if (what === 'pay') {
        if (window.STYLE11_PAY_URL) window.open(window.STYLE11_PAY_URL, '_blank', 'noopener'); else say('Preview: your Stripe link goes here');
      }
      else if (what === 'earn') { addBonus(3); say('3 more rolls added. Come back after you look around.'); }
    });
    root.addEventListener('submit', function(e){
      if (e.target.id !== 'wl') return; e.preventDefault();
      var email = view.querySelector('#wlEmail').value.trim(), msg = view.querySelector('#wlMsg');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = 'Please enter a valid email address.'; return; }
      if (window.STYLE11_WAITLIST_URL) { try { fetch(window.STYLE11_WAITLIST_URL, {method:'POST', mode:'no-cors', keepalive:true, body:JSON.stringify({stage:'style11-waitlist', email:email, createdAt:new Date().toISOString()})}).catch(function(){}); } catch (x) {} }
      msg.textContent = 'You are on the list. We will email you the day membership opens.';
      view.querySelector('#wl').reset();
    });

    /* open a look straight from a shared link: style-11.html#look-champagne-nights */
    var m = (opts.hash !== false) && /^#look-(.+)$/.exec(location.hash || '');
    var direct = m && LOOKS.filter(function(l){ return l.slug === m[1]; })[0];
    if (direct) { st.result = {look:direct, s:0}; st.fromBrief = false; st.screen = 'result'; }
    render(false);
    return {root: root};
  }

  /* ---------- pop-up ---------- */
  var openEl = null, lastFocus = null;
  function open(){
    if (openEl) return;
    lastFocus = document.activeElement;
    var m = document.createElement('div');
    m.className = 's11-modal'; m.id = 's11Modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Style-11 outfit shuffle');
    m.innerHTML = '<div class="s11-dlg"><button type="button" class="s11-x" aria-label="Close">×</button><div class="s11-body s9-wall"></div></div>';
    document.body.appendChild(m); openEl = m;
    document.documentElement.style.overflow = 'hidden';
    mount(m.querySelector('.s11-body'), {modal:true, heading:2, hash:false});
    m.addEventListener('click', function(e){ if (e.target === m || e.target.closest('.s11-x')) close(); });
    document.addEventListener('keydown', onKey);
    m.querySelector('.s11-x').focus();
  }
  function close(){
    if (!openEl) return;
    document.removeEventListener('keydown', onKey);
    openEl.parentNode.removeChild(openEl); openEl = null;
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }
  function onKey(e){
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab' || !openEl) return;
    var f = openEl.querySelectorAll('a[href], button:not([disabled]), input, [tabindex="0"]');
    var list = Array.prototype.filter.call(f, function(x){ return x.offsetParent !== null && !x.hidden; });
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && (document.activeElement === first || !openEl.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  window.Style11 = {mount: mount, open: open, close: close};
})();
