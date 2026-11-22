/* Style-11: the outfit shuffle.
   Flow: lock-screen notification -> chat -> a short brief -> Roll, Spin or Pick (tailored to the brief) -> a shoppable flat lay.
   Looks live in style-11-looks.js. Mount anywhere with Style11.mount(element); Style11.open() opens the pop-up.
   Optional settings (set before this file loads):
     window.STYLE11_PAY_URL       Stripe link for the day pass
     window.STYLE11_WAITLIST_URL  Google Apps Script URL that receives waitlist emails
     window.STYLE11_FREE_ROLLS    free rolls per day (default 3)
     window.STYLE11_KEYS          Suite Keys (style-11-keys.js): a valid key unlocks unlimited rolls and the bonus modes on that device */
(function(){
  var LOOKS = window.STYLE11_LOOKS || [];
  var FREE_ROLLS = window.STYLE11_FREE_ROLLS || 3;
  var RKEY = 'hsv_s11_rolls', SKEY = 'hsv_s11_saved', CKEY = 'hsv_s11_key', EARN = 3;
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
  function normKey(x){ return String(x || '').trim().toUpperCase().replace(/\s+/g, ''); }
  function keyList(){ return (window.STYLE11_KEYS || []).map(normKey); }
  /* a key only counts while it is still on the list, so turning one off works everywhere */
  function isClient(){ try { var k = normKey(localStorage.getItem(CKEY)); return !!k && keyList().indexOf(k) > -1; } catch (e) { return false; } }
  function tryKey(raw){
    var k = normKey(raw); if (k && k.indexOf('SUITE-') !== 0) k = 'SUITE-' + k.replace(/^SUITE-?/, '');
    if (!k || keyList().indexOf(k) < 0) return false;
    try { localStorage.setItem(CKEY, k); } catch (e) {} return true;
  }
  function canEarn(){ return (rolls().bonus || 0) < EARN; }
  function rollsLeft(){ if (isClient()) return 99; var r = rolls(); return Math.max(0, FREE_ROLLS + (r.bonus || 0) - r.used); }
  function useRoll(){ if (isClient()) return true; var r = rolls(); if (FREE_ROLLS + (r.bonus || 0) - r.used <= 0) return false; r.used += 1; saveRolls(r); return true; }
  function addBonus(n){ var r = rolls(); if ((r.bonus || 0) >= EARN) return false; r.bonus = (r.bonus || 0) + n; saveRolls(r); return true; }

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

  /* ---------- sounds (synthesized in the browser: no audio files) ---------- */
  var AC = null, SNDKEY = 'hsv_s11_sound';
  function soundOn(){ try { return localStorage.getItem(SNDKEY) !== '0'; } catch (e) { return true; } }
  function ac(){
    if (!AC) { try { var C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); } catch (e) {} }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
    return AC;
  }
  function note(f, t, d, g, type){
    var o = AC.createOscillator(), o2 = AC.createOscillator(), v = AC.createGain(), v2 = AC.createGain();
    o.type = type || 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2.76; v2.gain.value = .16;
    o.connect(v); o2.connect(v2); v2.connect(v); v.connect(AC.destination);
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(g, t + .012); v.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.start(t); o2.start(t); o.stop(t + d + .05); o2.stop(t + d + .05);
  }
  /* a bright three-note notification chime */
  function chime(){
    if (!soundOn()) return; var c = ac(); if (!c || c.state !== 'running') return; var t = c.currentTime + .03;
    note(1174.66, t, .9, .2); note(1567.98, t + .13, .9, .18); note(1318.51, t + .27, 1.2, .18);
  }
  /* soft message sounds: a pop for a message that arrives, a swoosh for one that is sent */
  function blip(sent){
    if (!soundOn()) return; var c = ac(); if (!c || c.state !== 'running') return; var t = c.currentTime + .02;
    var o = c.createOscillator(), v = c.createGain(); o.type = sent ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(sent ? 520 : 880, t); o.frequency.exponentialRampToValueAtTime(sent ? 980 : 1240, t + .09);
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(sent ? .07 : .09, t + .01); v.gain.exponentialRampToValueAtTime(.0001, t + (sent ? .16 : .12));
    o.connect(v); v.connect(c.destination); o.start(t); o.stop(t + .2);
  }
  var SNDI = {on: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16zM10 20.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>', off: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16zM10 20.5a2 2 0 0 0 4 0M4 4l16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'};

  /* ---------- chat (intro) ---------- */
  function chatHtml(){
    return '<div class="s9-phone" role="img" aria-label="A text conversation. A client writes: Help, I’m stressed, I need an outfit for dinner this weekend. Style-11 please. The stylist replies: I got you girlala. What are we doing this weekend? What are your vibes?">' +
      '<div class="s9-notch" aria-hidden="true"></div>' +
      '<div class="s9-status" aria-hidden="true"><span>9:41</span><span class="s9-sig"><i></i><i></i><i></i><i></i><em></em></span></div>' +
      '<div class="s9-bar" aria-hidden="true"><span class="s9-back">‹</span><span class="s9-av"><img src="' + ICON + '" alt="" width="58" height="33"></span><span class="s9-who">HerStyleVault</span></div>' +
      '<div class="s9-chat" aria-hidden="true"><p class="s9-time"><b>Friday</b> 4:47 PM</p>' +
      '<div style="--d:0.4s" class="s11-pop s9-row them"><p class="b them">HELP I’m stressed 🥲 I need an outfit for dinner this weekend</p></div>' +
      '<div style="--d:1.2s" class="s11-pop s9-row them"><p class="b them tail">Style-11 please 🚨<span class="s9-react">❤️</span></p></div>' +
      '<div style="--d:2.1s" class="s11-pop s9-row me"><p class="b me">I got you girlala 🫶🏾</p></div>' +
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
    scratch: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 15c2-4 3-4 5 0s3 3 5-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gift: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="3.5" y="9" width="17" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 9v11M3.5 13h17M12 9C9 9 7.5 7.6 8.2 6.3S11 5.2 12 9zm0 0c3 0 4.5-1.4 3.8-2.7S13 5.2 12 9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="9.5" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
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
    /* the "Help me out" button is an iPhone-style notification banner that drops in after the texts */
    function bannerHtml(){
      return '<button type="button" class="s11-banner" style="--d:3.6s" data-act="start" aria-label="New message from HerStyleVault: Style-11. Need a look? Tap to get yours.">' +
        '<span class="bn-ic"><img src="' + ICON + '" alt="" width="58" height="33"></span>' +
        '<span class="bn-tx"><span class="bn-top"><b>HERSTYLEVAULT</b><i>now</i></span><span class="bn-t">Style-11 \uD83D\uDEA8</span><span class="bn-m">Need a look? Tap to get yours.</span></span></button>';
    }
    function clearCues(){ (st.cues || []).forEach(clearTimeout); st.cues = []; }
    function startCues(){
      clearCues();
      [[400, false], [1200, false], [2100, true], [2900, true]].forEach(function(c){ st.cues.push(setTimeout(function(){ blip(c[1]); }, c[0])); });
      st.cues.push(setTimeout(chime, 3650));
    }
    function renderIntro(){
      return '<div class="s9-hero s11-intro"><p class="s9-psst">Style-11, what’s your outfit emergency?</p>' +
        '<h' + hl + ' class="s9-title" data-title tabindex="-1"><span class="h1-kw">Style-11 outfit shuffle</span><span aria-hidden="true">Style-<em>11</em></span></h' + hl + '>' +
        '<p class="s9-sub">Nothing to wear? Roll for it.</p>' +
        '<button type="button" class="s11-skip" data-act="ff" aria-label="Skip to the end of the text messages">Skip</button>' +
        '<button type="button" class="s11-snd" data-act="snd" aria-pressed="' + soundOn() + '" aria-label="Sound ' + (soundOn() ? 'on' : 'off') + '">' + (soundOn() ? SNDI.on : SNDI.off) + '</button>' +
        '<div class="s11-phonewrap">' + chatHtml() + bannerHtml() + '</div>' +
        '<button type="button" class="link-btn s11-howlink" data-act="how">How it works</button></div>';
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
        '<button type="button" class="s9-back-btn" data-act="back">‹ Back</button> <button type="button" class="link-btn" data-act="how">How it works</button></section>';
    }
    function meterHtml(){
      var left = rollsLeft(), pips = '';
      if (isClient()) return '<div class="s11-meter" role="status"><span>Suite Key</span><b>Unlimited rolls</b></div>';
      for (var i = 0; i < FREE_ROLLS + (rolls().bonus || 0); i++) pips += '<i class="' + (i < left ? 'on' : '') + '"></i>';
      return '<div class="s11-meter" role="status"><span>Rolls today</span><span class="pips" aria-hidden="true">' + pips + '</span><b>' + left + ' left</b></div>';
    }
    function howText(){
      return {roll:'Tap the dice. We shuffle your matches and land on one.', spin:'Spin the wheel. It lands on one of your matches.', pick:'Tap the piece you would grab first. We reveal the full look.', scratch:'Scratch the foil with your finger or mouse to uncover your look.', gift:'Tap the gift to open it and see what is inside.'}[st.method];
    }
    function methodsHtml(){
      var M = [['roll','Roll'],['spin','Spin'],['pick','Pick']];
      return '<div class="s9-methods" role="group" aria-label="How do you want to play?">' + M.map(function(m){
        return '<button type="button" class="s9-m' + (st.method === m[0] ? ' on' : '') + '" data-method="' + m[0] + '" aria-pressed="' + (st.method === m[0]) + '">' + IC[m[0]] + ' ' + m[1] + '</button>';
      }).join('') + '</div>' + bonusHtml();
    }
    /* Suite Key bonus modes: open for key holders, shown locked for everyone else */
    function bonusHtml(){
      var B = [['scratch','Scratch to reveal'],['gift','Gift box']], has = isClient();
      return '<div class="s9-methods s11-bonus" role="group" aria-label="Suite Key bonus modes">' + B.map(function(m){
        if (has) return '<button type="button" class="s9-m' + (st.method === m[0] ? ' on' : '') + '" data-method="' + m[0] + '" aria-pressed="' + (st.method === m[0]) + '">' + IC[m[0]] + ' ' + m[1] + '</button>';
        return '<button type="button" class="s9-m locked" data-act="key" aria-label="' + m[1] + ', a bonus mode. Enter a Suite Key to unlock.">' + IC.lock + ' ' + m[1] + '</button>';
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
    function scratchHtml(){
      var key = JSON.stringify(st.brief);
      if (!st.sWin || st.sKey !== key) { st.sWin = choose(candidates()); st.sKey = key; }
      return '<div class="s11-scratch" id="scr"><img src="' + esc(st.sWin.look.art) + '" alt="" draggable="false"><canvas id="scrC" role="img" aria-label="Scratch card. Drag across it to scratch and uncover your look."></canvas><span class="s11-scr-hint" id="scrHint">Scratch here</span></div>' +
        '<button type="button" class="link-btn s11-scr-skip" data-act="scrall">Or reveal it for me</button>';
    }
    function giftHtml(){
      return '<button type="button" class="s11-gift" id="gift" data-act="gift" aria-label="Tap to open the gift"><svg class="g-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><defs><linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8213D"/><stop offset=".55" stop-color="#8A1427"/><stop offset="1" stop-color="#5E0C1A"/></linearGradient><linearGradient id="gSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E0F20"/><stop offset="1" stop-color="#430812"/></linearGradient><linearGradient id="gLidF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C52A47"/><stop offset="1" stop-color="#8E1629"/></linearGradient><linearGradient id="gLidT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E0506A"/><stop offset="1" stop-color="#B01E39"/></linearGradient><linearGradient id="gLidS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7C1325"/><stop offset="1" stop-color="#4E0A15"/></linearGradient><linearGradient id="gRib" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9C6E14"/><stop offset=".3" stop-color="#F3D67F"/><stop offset=".55" stop-color="#C99A2E"/><stop offset="1" stop-color="#8E6410"/></linearGradient><linearGradient id="gRibT" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#C99A2E"/><stop offset=".5" stop-color="#F6DE8E"/><stop offset="1" stop-color="#B98A22"/></linearGradient><linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C0206"/><stop offset="1" stop-color="#4A0914"/></linearGradient><linearGradient id="gSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient><radialGradient id="gShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2A0A0F" stop-opacity=".45"/><stop offset="1" stop-color="#2A0A0F" stop-opacity="0"/></radialGradient><radialGradient id="gBowG" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#F8E39A"/><stop offset=".6" stop-color="#D2A537"/><stop offset="1" stop-color="#9A6F17"/></radialGradient></defs><ellipse cx="104" cy="184" rx="86" ry="10" fill="url(#gShadow)"/><polygon points="28,98 150,98 172,86 50,86" fill="url(#gIn)"/><rect x="28" y="98" width="122" height="80" rx="2" fill="url(#gBody)"/><polygon points="150,98 172,86 172,166 150,178" fill="url(#gSide)"/><rect x="28" y="98" width="122" height="80" rx="2" fill="url(#gSheen)"/><rect x="79" y="98" width="20" height="80" fill="url(#gRib)"/><rect x="79" y="98" width="2.2" height="80" fill="#fff" opacity=".28"/><circle cx="89" cy="138" r="18.5" fill="#FBF1E6" stroke="#C99A2E" stroke-width="2.2"/><circle cx="89" cy="138" r="15" fill="none" stroke="#C99A2E" stroke-width=".8" opacity=".7"/><image class="g-hanger" href="images/brand/icon-header.png" x="73" y="128.9" width="32" height="18.2"/><g class="g-lidg"><rect x="22" y="72" width="134" height="26" rx="2.5" fill="url(#gLidF)"/><polygon points="156,72 178,60 178,86 156,98" fill="url(#gLidS)"/><polygon points="22,72 156,72 178,60 44,60" fill="url(#gLidT)"/><polygon points="22,72 156,72 178,60 44,60" fill="url(#gSheen)"/><rect x="79" y="72" width="20" height="26" fill="url(#gRib)"/><polygon points="79,72 99,72 121,60 101,60" fill="url(#gRibT)"/><rect x="22" y="96" width="134" height="2" fill="#4A0914" opacity=".35"/><path d="M100 61 C78 26 48 34 60 56 C67 69 90 67 100 61Z" fill="url(#gBowG)" stroke="#8A5F10" stroke-width="1.2"/><path d="M100 61 C122 26 152 34 140 56 C133 69 110 67 100 61Z" fill="url(#gBowG)" stroke="#8A5F10" stroke-width="1.2"/><path d="M92 56 C80 40 66 42 68 52" fill="none" stroke="#FBEBB0" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="M108 56 C120 40 134 42 132 52" fill="none" stroke="#FBEBB0" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="M97 64 L84 86 L92 84 L96 92 L103 66Z" fill="#C99A2E" stroke="#8A5F10" stroke-width="1"/><path d="M103 64 L118 84 L110 83 L108 91 L99 66Z" fill="#B98A22" stroke="#8A5F10" stroke-width="1"/><ellipse cx="100" cy="61" rx="9.5" ry="7.5" fill="url(#gBowG)" stroke="#8A5F10" stroke-width="1.2"/></g></svg><span class="g-spk"><b></b><b></b><b></b><b></b><b></b><b></b></span></button>' +
        '<button type="button" class="lbk-btn s9-rollbtn" data-act="gift">Open the gift</button>';
    }
    function stageHtml(){
      if (st.method === 'scratch' && isClient()) return scratchHtml();
      if (st.method === 'gift' && isClient()) return giftHtml();
      if (st.method === 'spin') { if (!st.strip.length) dealStrip(); return wheelHtml() + '<button type="button" class="lbk-btn s9-rollbtn" data-act="spin">Spin the wheel</button>'; }
      if (st.method === 'pick') return pickHtml();
      var faces = [1,2,3,4,5,6].map(function(n){ return '<span class="f f' + n + '"><img src="' + ICON + '" alt="" width="58" height="33"></span>'; }).join('');
      var sparks = [0,1,2,3,4,5,6,7].map(function(n){ return '<b style="--a:' + (n * 45) + 'deg"></b>'; }).join('');
      return '<div class="s9-stage" data-act="roll"><div class="s9-cube">' + faces + '</div><i class="s9-shadow"></i><span class="s9-sparks">' + sparks + '</span></div>' +
        '<div class="s11-shuf" id="shuf" aria-hidden="true"><span class="ph"><img src="' + ICON + '" alt="" width="58" height="33"></span></div>' +
        '<button type="button" class="lbk-btn s9-rollbtn" data-act="roll">Roll the dice</button>';
    }
    function renderPlay(){
      if ((st.method === 'scratch' || st.method === 'gift') && !isClient()) st.method = 'roll';
      var left = rollsLeft(), n = savedList().length;
      return '<section class="s9-quiz s9-play"><h2 class="s9-h2" data-title tabindex="-1">find your look</h2>' +
        '<div class="s11-brief"><p class="s11-chips">' + briefChips().map(function(c){ return '<span>' + esc(c) + '</span>'; }).join('') + '</p><button type="button" class="link-btn" data-act="edit">Edit answers</button>' +
        (n ? '<button type="button" class="link-btn" data-act="saved">Saved (' + n + ')</button>' : '') + '</div>' +
        meterHtml() + (isClient() ? '' : '<button type="button" class="link-btn s11-keylink" data-act="key">Have a Suite Key?</button>') + methodsHtml() + '<p class="s11-how">' + howText() + '</p>' +
        (left ? stageHtml() : '<div class="s11-out"><p>You have used today’s rolls.</p><button type="button" class="lbk-btn s9-rollbtn" data-act="locked">Get more rolls</button></div>') +
        '<button type="button" class="s9-back-btn" data-act="back">‹ Back</button> <button type="button" class="link-btn" data-act="how">How it works</button><p class="s9-hint" role="status" aria-live="polite"></p></section>';
    }
    function renderKey(){
      return '<section class="s9-quiz s11-keyscr"><p class="s11-kicker">Suite Key</p><h2 class="s9-h2" data-title tabindex="-1">Have a Suite Key?</h2>' +
        '<p class="s9-rsub">Your key came with your style guide. It unlocks unlimited rolls and two bonus modes: Scratch to reveal and Gift box.</p>' +
        '<form class="s11-wl s11-keyform" id="cc" novalidate><label class="s11-vh" for="ccCode">Suite Key</label><input id="ccCode" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="SUITE-XXXX" required><button type="submit" class="lbk-btn">Unlock</button></form>' +
        '<p class="s9-hint" id="ccMsg" role="status" aria-live="polite"></p>' +
        '<p class="s11-fine">No key yet? One comes with every package. <a href="packages.html" target="_blank" rel="noopener">See the packages</a></p>' +
        '<button type="button" class="s9-back-btn" data-act="keyback">\u2039 Back</button></section>';
    }
    function renderLocked(){
      var total = FREE_ROLLS + EARN, back = '<button type="button" class="s9-back-btn" data-act="toplay">‹ Back</button></section>';
      var wlCard = !window.STYLE11_WAITLIST_URL ? '' : '<div class="s11-offer"><span class="tag">Coming soon</span><h3>Membership waitlist</h3><p>Unlimited rolls, new flat lays first and member-only looks. Join the waitlist and you are enrolled the day it opens.</p>' +
        '<form class="s11-wl" id="wl" novalidate><label class="s11-vh" for="wlEmail">Email</label><input id="wlEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required><button type="submit" class="lbk-btn ghost">Join the waitlist</button></form><p class="s9-hint" id="wlMsg" role="status" aria-live="polite"></p></div>';
      if (!canEarn()) {
        /* all rolls used (free + earned): the only way forward is a package */
        return '<section class="s9-quiz s11-locked"><p class="s11-kicker">All ' + total + ' rolls used</p><h2 class="s9-h2" data-title tabindex="-1">Want more rolls?</h2>' +
          '<p class="s9-rsub">You have used all ' + total + ' of today’s free rolls. Book a package to keep going.</p>' +
          '<div class="s11-offers">' +
          '<div class="s11-offer feat"><span class="tag">Best way to unlock</span><h3>Book a package</h3><p>Every package unlocks more Style-11 rolls, plus you get me styling you for real.</p><a class="lbk-btn" href="packages.html" data-act="book">See the packages</a></div>' +
          (keyList().length ? '<div class="s11-offer"><span class="tag">Already booked?</span><h3>Enter your Suite Key</h3><p>Your key came with your style guide.</p>' +
          '<form class="s11-wl" id="cc" novalidate><label class="s11-vh" for="ccCode">Client code</label><input id="ccCode" type="text" autocomplete="off" autocapitalize="characters" placeholder="SUITE-XXXX" required><button type="submit" class="lbk-btn ghost">Unlock my rolls</button></form><p class="s9-hint" id="ccMsg" role="status" aria-live="polite"></p></div>' : '') +
          wlCard +
          '</div><p class="s11-fine">Free rolls reset tomorrow.</p>' + back;
      }
      return '<section class="s9-quiz s11-locked"><p class="s11-kicker">Today’s rolls are used</p><h2 class="s9-h2" data-title tabindex="-1">Keep rolling</h2>' +
        '<p class="s9-rsub">You have used your ' + FREE_ROLLS + ' free rolls today.</p>' +
        '<div class="s11-offers">' +
        (window.STYLE11_PAY_URL ? '<div class="s11-offer feat"><span class="tag">Quick</span><h3>Day pass</h3><p class="price">$3</p><p>Unlimited rolls, spins and picks for 24 hours.</p><button type="button" class="lbk-btn" data-act="pay">Get the day pass</button></div>' : '') +
        '<div class="s11-offer"><span class="tag">Free, once a day</span><h3>Earn ' + EARN + ' more rolls</h3><p>Take a look at my packages, then come back for ' + EARN + ' more.</p><a class="lbk-btn ghost" href="packages.html" target="_blank" rel="noopener" data-act="earn">See the packages</a></div>' +
        wlCard +
        '</div><p class="s11-fine">Or come back tomorrow for ' + FREE_ROLLS + ' more free rolls.</p>' + back;
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
        '<div class="s9-board pre"><img src="' + esc(l.art) + '" alt="' + esc(l.alt) + '">' + hotspots(l, flagTypes) + '</div>' +
        '<p class="s9-boardhint"><svg class="bh-ic" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><span>' + (noHover ? 'Tap any piece to shop it' : 'Hover any piece to shop it') + '</span></p>' + credit +
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
    function renderHow(){
      return '<section class="s9-quiz s11-how-card"><p class="s11-kicker">How it works</p><h2 class="s9-h2" data-title tabindex="-1">Three quick steps</h2>' +
        '<div class="s9-card s11-howtiles"><ol class="s9-tiles">' +
        '<li><b>1</b><strong>Tell me the plan</strong><span>Six quick questions: the occasion, the time, what you need, your vibe, the weather and your age range.</span></li>' +
        '<li><b>2</b><strong>Roll, spin or pick</strong><span>Tap the dice, spin the wheel, or pick the piece you would grab first. Each one lands on a look matched to your answers.</span></li>' +
        '<li><b>3</b><strong>Shop it</strong><span>Tap any piece to get it, or get the whole look in one tap. Save the ones you love with the heart.</span></li></ol>' +
        '<details><summary>Good to know</summary><ul class="s9-tiles two">' +
        '<li><strong>' + FREE_ROLLS + ' free rolls a day</strong><span>Look at the packages for ' + EARN + ' more. Your rolls reset every day.</span></li>' +
        '<li><strong>Have a Suite Key?</strong><span>Every package comes with one. It unlocks unlimited rolls plus two bonus modes: Scratch to reveal and Gift box.</span></li>' +
        '<li><strong>Always fresh</strong><span>New looks and links are added all the time.</span></li>' +
        '<li><strong>Sizing</strong><span>Every shop sizes differently, so check each size chart.</span></li>' +
        '<li><strong>Affiliate links*</strong><span>Some links may earn me a small commission, at no cost to you.</span></li>' +
        '<li><strong>Free and private</strong><span>No sign-up. Your answers and saved looks stay on your device.</span></li></ul></details></div>' +
        '<button type="button" class="s9-back-btn" data-act="backhow">‹ Back</button></section>';
    }
    function renderSaved(){
      var ids = savedList(), items = ids.map(function(id){ return LOOKS.filter(function(l){ return l.slug === id; })[0]; }).filter(Boolean);
      return '<section class="s9-quiz"><p class="s11-kicker">Saved looks</p><h2 class="s9-h2" data-title tabindex="-1">Your saved looks</h2>' +
        (items.length ? '<ul class="s11-savedlist">' + items.map(function(l){ return '<li><button type="button" data-open="' + esc(l.slug) + '"><img src="' + esc(l.art) + '" alt="" loading="lazy"><span><strong>' + esc(l.title) + '</strong><small>Open look</small></span></button></li>'; }).join('') + '</ul>' : '<p class="s9-rsub">Nothing saved yet. Tap the heart on a look to keep it.</p>') +
        '<button type="button" class="s9-back-btn" data-act="toplay">‹ Back</button></section>';
    }
    function render(focus){
      var s = st.screen;
      if (s !== 'intro') clearCues();
      if (s === 'ring') view.innerHTML = renderRing();
      else if (s === 'intro') { view.innerHTML = renderIntro(); startCues(); }
      else if (s === 'brief') view.innerHTML = renderBrief();
      else if (s === 'play') view.innerHTML = renderPlay();
      else if (s === 'locked') view.innerHTML = renderLocked();
      else if (s === 'key') view.innerHTML = renderKey();
      else if (s === 'saved') view.innerHTML = renderSaved();
      else if (s === 'how') view.innerHTML = renderHow();
      else if (s === 'result') view.innerHTML = renderResult(st.result);
      if (s === 'result') { clearTimeout(st.spreadT); st.spreadT = setTimeout(spreadTags, reduce ? 80 : (view.querySelectorAll('.hs').length * 160 + 1500)); }
      if (s === 'play' && st.method === 'scratch' && isClient()) initScratch();
      if (focus) focusTitle();
      if (modal) { var body = root.closest('.s11-body'); if (body && s !== 'result') body.scrollTop = 0; }
    }

    /* keep the "Get this piece" tags from stacking on each other: nudge any that overlap */
    function spreadTags(){
      var board = view.querySelector('.s9-board.pre'); if (!board) return;
      var br = board.getBoundingClientRect(), items = [];
      Array.prototype.forEach.call(board.querySelectorAll('.hs'), function(h){ h.style.removeProperty('--dy'); });
      Array.prototype.forEach.call(board.querySelectorAll('.hs:not(.tapped)'), function(h){
        var t = h.querySelector('.tg'); if (!t || getComputedStyle(t).display === 'none') return;
        var r = t.getBoundingClientRect(); items.push({h:h, top:r.top, bottom:r.bottom, left:r.left, right:r.right});
      });
      items.sort(function(a, b){ return a.top - b.top; });
      var placed = [];
      items.forEach(function(it){
        var dy = 0, tries = 0, hit;
        do {
          hit = null;
          for (var k = 0; k < placed.length; k++) { var p = placed[k];
            if (it.left < p.right + 4 && p.left < it.right + 4 && it.top + dy < p.bottom + 4 && p.top < it.bottom + dy + 4) { hit = p; break; } }
          if (hit) dy = hit.bottom + 5 - it.top;
        } while (hit && ++tries < 10);
        if (it.bottom + dy > br.bottom - 4) dy = Math.min(dy, br.bottom - 4 - it.bottom);
        if (it.top + dy < br.top + 4) dy = br.top + 4 - it.top;
        it.h.style.setProperty('--dy', Math.round(dy) + 'px');
        placed.push({left:it.left, right:it.right, top:it.top + dy, bottom:it.bottom + dy});
      });
    }
    window.addEventListener('resize', function(){ clearTimeout(st.spreadT); st.spreadT = setTimeout(spreadTags, 150); });

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
    /* ---------- bonus modes (Suite Key) ---------- */
    function initScratch(){
      var c = view.querySelector('#scrC'), box = view.querySelector('#scr'); if (!c || !box) return;
      var w = Math.round(box.clientWidth), h = Math.round(box.clientHeight), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h) { setTimeout(initScratch, 60); return; }
      c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
      var x = c.getContext('2d'); x.scale(dpr, dpr);
      var g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#9A1830'); g.addColorStop(.5, '#6E0F20'); g.addColorStop(1, '#8B1226');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,.13)';
      for (var yy = 14, r = 0; yy < h; yy += 26, r++) for (var xx = (r % 2) * 13 + 8; xx < w; xx += 26) { x.beginPath(); x.arc(xx, yy, 5, 0, 6.2832); x.fill(); }
      x.strokeStyle = 'rgba(201,154,46,.9)'; x.lineWidth = 3; x.strokeRect(6, 6, w - 12, h - 12);
      var down = false, done = false, started = false;
      function pos(e){ var b = c.getBoundingClientRect(); return [(e.clientX - b.left) * (w / b.width), (e.clientY - b.top) * (h / b.height)]; }
      function scratchAt(e){
        var p = pos(e); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.beginPath(); x.arc(p[0], p[1], Math.max(20, w * .075), 0, 6.2832); x.fill(); x.globalCompositeOperation = 'source-over';
        if (!started) { started = true; var hint = view.querySelector('#scrHint'); if (hint) hint.classList.add('off'); }
      }
      function cleared(){
        var d = x.getImageData(0, 0, c.width, c.height).data, n = 0, t = 0, step = 16 * 4 * Math.max(1, Math.round(dpr));
        for (var i = 3; i < d.length; i += step) { t++; if (d[i] < 40) n++; }
        return n / t;
      }
      function finish(){
        if (done) return; done = true; c.classList.add('gone');
        var win = st.sWin; st.sWin = null; setTimeout(function(){ if (win) reveal(win); }, reduce ? 0 : 420);
      }
      c.addEventListener('pointerdown', function(e){ if (done) return; down = true; try { c.setPointerCapture(e.pointerId); } catch (x2) {} scratchAt(e); e.preventDefault(); });
      c.addEventListener('pointermove', function(e){ if (!down || done) return; scratchAt(e); });
      function up(){ if (!down) return; down = false; if (!done && cleared() > .5) finish(); }
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      st.scratchFinish = finish;
    }
    function gift(){
      if (st.busy) return;
      if (!useRoll()) { go('locked'); return; }
      st.busy = true; refreshMeter();
      var win = choose(candidates()), el = view.querySelector('#gift');
      if (!el || reduce) { reveal(win); return; }
      lockButtons(true); el.classList.add('open');
      setTimeout(function(){ reveal(win); }, 1250);
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
    root.addEventListener('mouseover', function(e){ var h = e.target.closest ? e.target.closest('.hs') : null; if (h) { h.classList.add('tapped'); var bd = h.closest('.s9-board'); if (bd) bd.classList.add('learned'); } });
    root.addEventListener('click', function(e){
      ac();
      var hs = e.target.closest('.hs');
      if (hs) { hs.classList.add('tapped'); var bd = hs.closest('.s9-board'); if (bd) bd.classList.add('learned'); }
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
      if (what === 'ff') { var ig = view.querySelector('.s11-intro'); if (ig) { clearCues(); chime(); ig.classList.add('done'); var sb = ig.querySelector('.s9-start'); if (sb) sb.focus({preventScroll:true}); } }
      else if (what === 'snd') { var on = !soundOn(); try { localStorage.setItem(SNDKEY, on ? '1' : '0'); } catch (x) {} act.setAttribute('aria-pressed', on); act.setAttribute('aria-label', 'Sound ' + (on ? 'on' : 'off')); act.innerHTML = on ? SNDI.on : SNDI.off; if (on) chime(); }
      else if (what === 'answer') go('intro');
      else if (what === 'start') { st.step = 0; go(briefDone() ? 'play' : 'brief'); }
      else if (what === 'back') {
        if (st.screen === 'brief') { if (st.step > 0) { st.step--; if (STEPS[st.step].key === 'time' && (TIMES[st.brief.occ] || []).length === 1) st.step--; go('brief'); } else go('intro'); }
        else if (st.screen === 'play') { st.step = STEPS.length - 1; go('brief'); }
        else go('intro');
      }
      else if (what === 'toplay') go('play');
      else if (what === 'how') { st.from = st.screen; go('how'); }
      else if (what === 'backhow') go(st.from || 'intro');
      else if (what === 'edit') { st.step = 0; go('brief'); }
      else if (what === 'saved') go('saved');
      else if (what === 'roll') roll();
      else if (what === 'spin') spin();
      else if (what === 'gift') gift();
      else if (what === 'key') { st.keyFrom = st.screen; go('key'); }
      else if (what === 'keyback') go(st.keyFrom === 'locked' ? 'locked' : 'play');
      else if (what === 'scrall') { if (st.scratchFinish) st.scratchFinish(); else if (st.sWin) { var sw = st.sWin; st.sWin = null; reveal(sw); } }
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
        var url = new URL('index.html#look-' + st.result.look.slug, location.href).href;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function(){ say('Link copied'); }, function(){ say(url); }); else say(url);
      }
      else if (what === 'pay') {
        if (window.STYLE11_PAY_URL) window.open(window.STYLE11_PAY_URL, '_blank', 'noopener'); else say('Preview: your Stripe link goes here');
      }
      else if (what === 'earn') { if (addBonus(EARN)) { say(EARN + ' more rolls added. Come back after you look around.'); setTimeout(function(){ st.picks = null; go('play'); }, 500); } }
    });
    root.addEventListener('submit', function(e){
      if (e.target.id === 'cc') {
        e.preventDefault();
        var cm = view.querySelector('#ccMsg');
        if (tryKey(view.querySelector('#ccCode').value)) { cm.textContent = 'Suite Key accepted. Unlimited rolls and bonus modes unlocked!'; setTimeout(function(){ st.picks = null; st.method = 'roll'; go('play'); }, 900); }
        else cm.textContent = 'That key did not work. Check it and try again, or reach out and I will help.';
        return;
      }
      if (e.target.id !== 'wl') return; e.preventDefault();
      var email = view.querySelector('#wlEmail').value.trim(), msg = view.querySelector('#wlMsg');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = 'Please enter a valid email address.'; return; }
      if (window.STYLE11_WAITLIST_URL) { try { fetch(window.STYLE11_WAITLIST_URL, {method:'POST', mode:'no-cors', keepalive:true, body:JSON.stringify({stage:'style11-waitlist', email:email, createdAt:new Date().toISOString()})}).catch(function(){}); } catch (x) {} }
      msg.textContent = 'You are on the list. We will email you the day membership opens.';
      view.querySelector('#wl').reset();
    });

    /* open a look straight from a shared link: style-11.html#look-champagne-nights */
    var direct = opts.look && LOOKS.filter(function(l){ return l.slug === opts.look; })[0];
    if (direct) { st.result = {look:direct, s:0}; st.fromBrief = false; st.screen = 'result'; }
    render(false);
    return {root: root};
  }

  /* ---------- pop-up ---------- */
  var openEl = null, lastFocus = null;
  function open(o){
    if (openEl) return;
    lastFocus = document.activeElement;
    var m = document.createElement('div');
    m.className = 's11-modal'; m.id = 's11Modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Style-11 outfit shuffle');
    m.innerHTML = '<div class="s11-dlg"><button type="button" class="s11-x" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button><div class="s11-body s9-wall"></div></div>';
    document.body.appendChild(m); openEl = m;
    document.documentElement.style.overflow = 'hidden';
    mount(m.querySelector('.s11-body'), {modal:true, heading:2, look:(o && o.look) || null});
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
