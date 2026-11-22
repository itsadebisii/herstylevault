var HSV_ICON_BASE = '<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">';
var HSV_ICONS = {
  hanger: '<circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none"/><path d="M12 6.4V9M12 9 3.6 16c-.9.8-.3 1.5.6 1.5h15.6c.9 0 1.5-.7.6-1.5L12 9Z"/>',
  bag: '<path d="M5.2 9h13.6l1 11.5H4.2L5.2 9Z"/><path d="M8.6 9V7.2a3.4 3.4 0 0 1 6.8 0V9"/>'
};
function hsvIcon(name, size){ return HSV_ICON_BASE.replace(/SIZE/g, size || 14) + HSV_ICONS[name] + '</svg>'; }
var TICKER_ITEMS = ['Color Analysis','Wardrobe Detox','One-Time Services, No Subscriptions','Wardrobe Consulting','Personal Shopping','Now Booking'];
var TICKER_MARKS = ['hanger','bag','hanger','bag','hanger','bag'];
function tickerSet(hidden){
  return '<div class="ticker-set"' + (hidden ? ' aria-hidden="true"' : '') + '>' + TICKER_ITEMS.map(function(t,i){ return '<span class="ticker-item">' + t + '</span><span class="ticker-sep">' + hsvIcon(TICKER_MARKS[i], 15) + '</span>'; }).join('') + '</div>';
}
var TICKER_HTML = '<div class="site-ticker ticker"><div class="ticker-track">' + tickerSet(false) + tickerSet(true) + '</div></div>';

const NAV_HTML = `${TICKER_HTML}
<div class="nav-inner">
<a class="wordmark" href="index.html" aria-label="HerStyleVault home"><img class="wm-icon" src="images/brand/icon-header.png" alt="" width="58" height="33"><span class="wm-text"><span class="wm-her">Her</span>StyleVault</span></a>
<ul class="nav-links" id="navLinks">
<li class="has-dropdown"><a class="dd-label" href="book.html">Book</a><div class="dropdown">
<a href="book.html">Book a Consultation</a>
<a href="packages.html">Private Styling Packages</a>
<a href="services.html">À La Carte Services</a>
</div></li>
<li><a href="her-style-suite.html">Her Style Suite</a></li>
<li><a href="vault-digitals.html">Vault Digitals</a></li>
<li><a href="locations.html">Locations</a></li>
<li><a href="about.html">About</a></li>
<li><a href="contact.html">Contact</a></li>
<li class="has-dropdown"><a class="dd-label" href="faq.html">FAQ</a><div class="dropdown">
<a href="faq.html">FAQ</a>
<a href="how-it-works.html">How It Works</a>
</div></li>
</ul>
<div class="nav-right">
<button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>
<a class="btn btn-primary" href="book.html">Book Now</a>
</div>
</div>`;

const FOOTER_HTML = `<div class="wrap">
<div class="footer-top">
<div>
<div class="footer-word">HerStyleVault</div>
<p class="footer-tagline">Personal styling for women who want to feel like themselves in their clothes.</p>
<div class="footer-icons">${hsvIcon("hanger",18)}${hsvIcon("bag",18)}</div>
</div>
<div class="footer-col">
<p class="fh">Styling &amp; Digitals</p>
<ul>
<li><a href="shop.html">Shop All</a></li>
<li><a href="packages.html">Private Styling Packages</a></li>
<li><a href="services.html">À La Carte Services</a></li>
<li><a href="vault-digitals.html">Vault Digitals</a></li>
<li><a href="her-style-suite.html">Her Style Suite</a></li>
</ul>
</div>
<div class="footer-col">
<p class="fh">Studio</p>
<ul>
<li><a href="about.html">About</a></li>
<li><a href="locations.html">Locations</a></li>
<li><a href="how-it-works.html">How It Works</a></li>
<li><a href="faq.html">FAQ</a></li>
<li><a href="policies.html">Terms &amp; Privacy</a></li>
<li><a href="contact.html">Contact</a></li>
</ul>
</div>
</div>
<div class="footer-connect"><a href="mailto:hello@herstylevault.com">hello@herstylevault.com</a><a href="https://instagram.com/herstylevault.official" target="_blank" rel="noopener">Instagram</a><a href="https://tally.so/r/Np8azj" target="_blank" rel="noopener">Leave a Testimonial</a></div>
<p class="footer-privacy"><strong>Your privacy matters.</strong> Your session details, personal information, and photos are never shared publicly without your explicit written permission.</p>
<div class="footer-bottom">
<div class="footer-locs"><span>Greater Boston</span><span>Northern MA</span><span>Southern NH</span><span>Virtual Nationwide</span></div>
<span class="footer-copy">© 2026 HerStyleVault</span>
</div>
</div>`;

function renderNav(){ document.querySelectorAll('.nav-mount').forEach(function(el){ el.outerHTML = NAV_HTML; }); }
function renderFooter(){ document.querySelectorAll('.footer-mount').forEach(function(el){ el.outerHTML = FOOTER_HTML; }); }

function initNavToggle(){
  var btn = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if(!btn || !links) return;
  btn.addEventListener('click', function(){ links.classList.toggle('open'); });
  var dropdownItems = links.querySelectorAll('.has-dropdown');
  dropdownItems.forEach(function(item){
    var label = item.querySelector('.dd-label');
    label.addEventListener('click', function(e){
      e.preventDefault();
      var willOpen = !item.classList.contains('open');
      dropdownItems.forEach(function(other){ if(other !== item) other.classList.remove('open'); });
      item.classList.toggle('open', willOpen);
    });
  });
  document.addEventListener('click', function(e){
    if(!links.contains(e.target)) dropdownItems.forEach(function(item){ item.classList.remove('open'); });
  });
}

function initAccordions(selector){
  document.querySelectorAll(selector).forEach(function(item){
    var head = item.querySelector('[data-acc-toggle]');
    if(!head || head.dataset.bound) return;
    head.dataset.bound = '1';
    head.addEventListener('click', function(){ item.classList.toggle('open'); });
  });
}

document.addEventListener('DOMContentLoaded', function(){
  renderNav();
  renderFooter();
  initNavToggle();
  initAccordions('.acc-item');
  initAccordions('.expect-card');
  initAccordions('.policy-item');
});

window.openCalendlyPopup = function(e, url){
  if (e && e.preventDefault) e.preventDefault();
  if (window.Calendly && Calendly.initPopupWidget) { Calendly.initPopupWidget({ url: url }); }
  else { window.location.href = url; }
  return false;
};
/* Calendly's pop-up script is only on the Book page, so load it on demand when a form is submitted elsewhere. */
function hsvWithCalendly(cb){
  if (window.Calendly && Calendly.initPopupWidget) { cb(); return; }
  var done = false; function go(){ if (!done) { done = true; cb(); } }
  try {
    if (!document.getElementById('hsvCalCss')) { var l = document.createElement('link'); l.id = 'hsvCalCss'; l.rel = 'stylesheet'; l.href = 'https://assets.calendly.com/assets/external/widget.css'; document.head.appendChild(l); }
    var sc = document.createElement('script'); sc.src = 'https://assets.calendly.com/assets/external/widget.js'; sc.async = true; sc.onload = go; sc.onerror = go; document.head.appendChild(sc);
    setTimeout(go, 4000);
  } catch (e) { go(); }
}
window.addEventListener('message', function(event){
  var data = event && event.data;
  if (!data || data.event !== 'Tally.FormSubmitted' || !data.payload) return;
  var next = { GxY5bk: 'https://calendly.com/herstylevault/book-session', yPeEjp: 'https://calendly.com/herstylevault/free-consultation' }[data.payload.formId];
  if (!next) return;
  if (window.Tally && Tally.closePopup) Tally.closePopup(data.payload.formId);
  var fm = document.getElementById('hsvFormModal'); if (fm) { fm.remove(); document.body.style.overflow = ''; }
  hsvWithCalendly(function(){ setTimeout(function(){ window.openCalendlyPopup(null, next); }, 350); });
});

/* Paste each Tally form ID (the part after tally.so/r/) to turn a service button into your pop-up form.
   Until an ID is added, the button opens an email to hello@herstylevault.com. */
var SERVICE_FORMS = { occasion: 'BEpEg1', ensemble: 'Z9O9yV', mini: '7XKXza', detox: 'aO4OPX' };
function applyBookButtons(){
  document.querySelectorAll('.book-btn').forEach(function(b){
    var id = SERVICE_FORMS[b.dataset.form];
    if (id) { b.href = 'https://tally.so/r/' + id; b.setAttribute('data-tally-open', id); b.setAttribute('data-tally-layout', 'modal'); b.setAttribute('data-tally-width', '700'); b.textContent = 'Book ' + b.dataset.service; }
    else { b.textContent = 'Request ' + b.dataset.service; }
  });
}


/* Service "Book" buttons open the Tally form as a pop-up on the same page, like the package forms on the Book page.
   (Capture phase, so it also works for buttons that were drawn after the page loaded.)
   If Tally's own pop-up script isn't available (blocked, slow, or an ad blocker), we open the same form inside our own pop-up instead of leaving the page. */
function hsvFormModal(id, hidden){
  var old = document.getElementById('hsvFormModal'); if (old) old.remove();
  var q = ['hideTitle=1', 'transparentBackground=1', 'alignLeft=1'];
  Object.keys(hidden || {}).forEach(function(k){ if (hidden[k]) q.push(encodeURIComponent(k) + '=' + encodeURIComponent(hidden[k])); });
  var m = document.createElement('div'); m.id = 'hsvFormModal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = '<div class="fm-panel"><button type="button" class="fm-x" aria-label="Close">\u00d7</button>' +
    '<iframe title="Booking form" src="https://tally.so/embed/' + id + '?' + q.join('&') + '"></iframe>' +
    '<p class="fm-alt">Trouble loading? <a href="https://tally.so/r/' + id + '" target="_blank" rel="noopener">Open the form in a new tab</a></p></div>';
  function close(){ m.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', esc); }
  function esc(e){ if (e.key === 'Escape') close(); }
  m.addEventListener('click', function(e){ if (e.target === m || e.target.classList.contains('fm-x')) close(); });
  document.addEventListener('keydown', esc);
  document.body.appendChild(m); document.body.style.overflow = 'hidden';
}
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('.book-btn[data-tally-open]');
  if (!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  var id = b.getAttribute('data-tally-open');
  var hidden = { service: b.getAttribute('data-service') || '' };
  if (b.getAttribute('data-tier')) hidden.tier = b.getAttribute('data-tier');
  if (window.Tally && Tally.openPopup) Tally.openPopup(id, { layout: 'modal', width: parseInt(b.getAttribute('data-tally-width') || '700', 10), hiddenFields: hidden });
  else hsvFormModal(id, hidden);
}, true);

/* Package "Book" / "Get Started" buttons ask one quick question first (new, returning, or already in a package), then open the right thing.
   "Book Your Free Consultation" buttons go straight to the consultation form. Services skip all of this: they are paid upfront and open their own form above. */
function hsvOpenForm(id, hidden){
  if (window.Tally && Tally.openPopup) Tally.openPopup(id, { layout: 'modal', width: 700, hiddenFields: hidden || {} });
  else hsvFormModal(id, hidden || {});
}
function hsvChooser(){
  var old = document.getElementById('hsvChooser'); if (old) old.remove();
  var m = document.createElement('div'); m.id = 'hsvChooser'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'hsvChT');
  m.innerHTML = '<div class="ch-panel"><button type="button" class="ch-x" aria-label="Close">\u00d7</button>' +
    '<p class="ch-k">Quick question</p><h2 id="hsvChT" tabindex="-1">Have you worked with HerStyleVault before?</h2>' +
    '<button type="button" class="ch-opt" data-go="new"><b>I\u2019m new here</b><span>Start with a free 30-minute consultation. No commitment.</span></button>' +
    '<button type="button" class="ch-opt" data-go="returning"><b>I\u2019m a returning client</b><span>Starting a new package. A short form first, then you book.</span></button>' +
    '<button type="button" class="ch-opt" data-go="active"><b>I\u2019m already in a package</b><span>Book your next session on the calendar.</span></button></div>';
  function close(){ m.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', esc); }
  function esc(e){ if (e.key === 'Escape') close(); }
  m.addEventListener('click', function(e){
    if (e.target === m || e.target.classList.contains('ch-x')) { close(); return; }
    var o = e.target.closest && e.target.closest('.ch-opt'); if (!o) return;
    var go = o.getAttribute('data-go'); close();
    if (go === 'new') hsvOpenForm('yPeEjp', { source: 'package button' });
    else if (go === 'returning') hsvOpenForm('GxY5bk', { source: 'package button' });
    else { var u = 'https://calendly.com/herstylevault/book-a-session'; hsvWithCalendly(function(){ window.openCalendlyPopup(null, u); }); }
  });
  document.addEventListener('keydown', esc);
  document.body.appendChild(m); document.body.style.overflow = 'hidden';
  var t = m.querySelector('h2'); if (t) t.focus();
}
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('a[data-consult]');
  if (!b || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (b.getAttribute('data-consult') === 'choose') hsvChooser();
  else hsvOpenForm('yPeEjp', { source: (b.textContent || '').trim().slice(0, 60) });
}, true);

/* ===== Style-11 =====
   Opens as a pop-up from anywhere. Its files load the first time someone asks for it (or hovers/touches a Style-11 link). */
var S11_V = '20261122k', s11Loading = null;
function loadStyle11(){
  if (window.Style11) return Promise.resolve();
  if (s11Loading) return s11Loading;
  s11Loading = new Promise(function(resolve, reject){
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'style-11.css?v=' + S11_V; document.head.appendChild(l);
    function add(src, next){ var t = document.createElement('script'); t.src = src + '?v=' + S11_V; t.onload = next; t.onerror = reject; document.head.appendChild(t); }
    add('style-11-looks.js', function(){ add('style-11-keys.js', function(){ add('style-11.js', resolve); }); });
  });
  s11Loading.catch(function(){ s11Loading = null; });
  return s11Loading;
}
window.openStyle11 = function(look){
  loadStyle11().then(function(){ Style11.open({look: look || null}); }).catch(function(){ window.location.href = 'style11.html'; });
};
document.addEventListener('click', function(e){
  var t = e.target.closest ? e.target.closest('[data-style11]') : null;
  if (!t || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  var nl = document.getElementById('navLinks'); if (nl) nl.classList.remove('open');
  if (t.classList.contains('lbk-s11')) t.classList.add('seen');
  if (t.closest('#s11Toast')) { try { localStorage.setItem('hsv_s11_toast', String(Date.now())); } catch (x) {} }
  var tt = document.getElementById('s11Toast'); if (tt) tt.remove();
  window.openStyle11();
});
['pointerenter', 'focusin', 'touchstart'].forEach(function(ev){
  document.addEventListener(ev, function(e){ if (e.target.closest && e.target.closest('[data-style11]')) loadStyle11().catch(function(){}); }, {passive: true});
});
document.addEventListener('DOMContentLoaded', function(){
  var h = window.location.hash || '', m = /^#look-(.+)$/.exec(h);
  if (m) window.openStyle11(m[1]); else if (h === '#style-11') window.openStyle11();
});

/* Home page only: a small, quiet notification slides in at the bottom left after a few seconds, then tucks itself away.
   It never covers content, is easy to dismiss, and stays away for a week once dismissed or used. */
(function(){
  if (!/^\/(index\.html)?$/.test(location.pathname)) return;
  var KEY = 'hsv_s11_toast', WEEK = 7 * 864e5;
  if (/[?&]toast=1\b/.test(location.search)) { try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch (e) {} }
  try { var last = +localStorage.getItem(KEY) || 0; if (last && Date.now() - last < WEEK) return; if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var css = '#s11Toast{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:max(16px,calc(env(safe-area-inset-bottom,0px) + 16px));z-index:880;width:min(330px,calc(100vw - 28px));display:flex;align-items:stretch;background:rgba(255,253,251,.96);border:1px solid rgba(139,18,38,.28);border-radius:16px;box-shadow:0 10px 30px rgba(60,20,20,.22);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transform:translateY(24px);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .35s;}'
    + '#s11Toast.in{transform:none;opacity:1;}#s11Toast.out{transform:translateY(24px);opacity:0;}'
    + '#s11Toast .t-main{flex:1;display:flex;align-items:center;gap:11px;min-width:0;padding:11px 8px 11px 12px;border:0;background:none;text-align:left;cursor:pointer;font-family:var(--font-body,sans-serif);color:#2A1814;}'
    + '#s11Toast .t-ico{flex:none;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:#fff;border:1px solid rgba(139,18,38,.25);position:relative;}#s11Toast .t-ico img{width:26px;height:auto;display:block;}'
    + '#s11Toast .t-ico i{position:absolute;top:-6px;right:-6px;min-width:17px;height:17px;padding:0 4px;box-sizing:border-box;border-radius:99px;background:#8B1226;color:#fff;font:700 10px/17px var(--font-body,sans-serif);font-style:normal;text-align:center;box-shadow:0 0 0 2px #fff;}'
    + '#s11Toast .t-txt{display:flex;flex-direction:column;min-width:0;}#s11Toast .t-top{font:600 11px/1.2 var(--font-body,sans-serif);color:#7A5A56;letter-spacing:.02em;}#s11Toast .t-top b{color:#2A1814;font-weight:600;}'
    + '#s11Toast .t-msg{margin-top:2px;font:500 14px/1.3 var(--font-body,sans-serif);color:#2A1814;}#s11Toast .t-tap{margin-top:1px;font:600 11.5px/1.2 var(--font-body,sans-serif);color:#8B1226;}'
    + '#s11Toast .t-x{flex:none;align-self:flex-start;width:32px;height:32px;margin:4px 4px 0 0;border:0;border-radius:50%;background:none;color:#7A5A56;font-size:20px;line-height:1;cursor:pointer;}#s11Toast .t-x:hover{background:#F7E4DD;}'
    + '#s11Toast .t-main:focus-visible,#s11Toast .t-x:focus-visible{outline:2px solid #8B1226;outline-offset:2px;}'
    + '@media (max-width:620px){#s11Toast{bottom:max(68px,calc(env(safe-area-inset-bottom,0px) + 68px));}}'
    + '@media (prefers-reduced-motion:reduce){#s11Toast{transition:opacity .2s;transform:none;}#s11Toast.out{transform:none;}}';
  function busy(){ return !!document.querySelector('#hsvChooser,#hsvFormModal,#s11Modal,#lookBox') || (document.getElementById('hsvHelper') && !document.getElementById('hsvHelper').hidden); }
  function show(){
    if (document.getElementById('s11Toast')) return;
    if (busy()) { setTimeout(show, 4000); return; }
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var t = document.createElement('div'); t.id = 's11Toast'; t.setAttribute('role', 'status');
    t.innerHTML = '<button type="button" class="t-main" data-style11 aria-label="New message from HerStyleVault: Outfit emergency? Style-11 finds you a look. Tap to open.">' +
      '<span class="t-ico"><img src="images/brand/icon-header.png" alt="" width="58" height="33"><i aria-hidden="true">1</i></span>' +
      '<span class="t-txt"><span class="t-top"><b>HerStyleVault</b> &middot; now</span><span class="t-msg">Outfit emergency? 🚨 Style-11 finds you a look.</span><span class="t-tap">Tap to open</span></span></button>' +
      '<button type="button" class="t-x" aria-label="Dismiss">×</button>';
    document.body.appendChild(t);
    var timer = null;
    function hide(remember){
      clearTimeout(timer); t.classList.remove('in'); t.classList.add('out');
      try { sessionStorage.setItem(KEY, '1'); if (remember) localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
      setTimeout(function(){ if (t.parentNode) t.remove(); }, 500);
    }
    function arm(){ clearTimeout(timer); timer = setTimeout(function(){ hide(false); }, 20000); }
    t.querySelector('.t-x').addEventListener('click', function(){ hide(true); });
    t.addEventListener('mouseenter', function(){ clearTimeout(timer); });
    t.addEventListener('mouseleave', arm);
    t.addEventListener('focusin', function(){ clearTimeout(timer); });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ t.classList.add('in'); }); });
    arm();
  }
  window.addEventListener('load', function(){ setTimeout(show, 4000); });
})();

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function hsvScrollTop(){ var h = location.hash.replace('#',''); if (!h || !document.getElementById(h)) window.scrollTo(0, 0); }
window.addEventListener('load', function(){ hsvScrollTop(); setTimeout(hsvScrollTop, 120); });

/* ===== "Not sure where to start?" helper: a short pick-one guide that recommends a package, service or digital ===== */
(function(){
  var skip = /(analysis-results|color-style-analysis|guide-download)/.test(location.pathname);
  if (skip || window.__hsvHelper) return; window.__hsvHelper = true;
  var R = {
    unlock:   {n:'The Unlock', p:'$225', u:'package-unlock.html', t:'3 sessions and 5 complete outfits. A great place to start: you learn your colors and shape and leave with a plan.'},
    vault:    {n:'The Vault Edit', p:'$400', u:'package-vault-edit.html', t:'4 sessions and 7 outfits, plus the Wardrobe Detox Checklist. Our most popular package.'},
    reveal:   {n:'The Full Reveal', p:'$950', u:'package-full-reveal.html', t:'5 in-person sessions: a closet audit, three shopping trips and 10 outfits, plus the full Wardrobe Detox Bundle and a try-on reveal.'},
    occasion: {n:'Occasion Edit', p:'From $55', u:'service-occasion-edit.html', t:'Outfits for one event or trip, built around your style and emailed to you as a finished PDF.'},
    ensemble: {n:'The Ensemble', p:'From $95 per person', u:'service-ensemble.html', t:'Everyone in your group gets their own outfits, pulled around one shared vibe.'},
    mini:     {n:'The Mini Collection', p:'From $240', u:'service-mini-collection.html', t:'A small set of new pieces that all mix and match, sourced for you with shopping links.'},
    detox:    {n:'The Wardrobe Detox', p:'From $225', u:'service-wardrobe-detox.html', t:'I come to you and we declutter and reorganize your closet in one visit (near Boston and Southern NH).'},
    guide:    {n:'The Wardrobe Detox Guide', p:'$28.99', u:'digital-wardrobe-detox-bundle.html', t:'An 11-page PDF with the step-by-step method to reset your closet on your own, today.'},
    report:   {n:'Signature Style Report', p:'$40', u:'digital-signature-style-report.html', t:'Your color season, body shape and style persona in one custom report, ready in minutes.'},
    consult:  {n:'A free consultation', p:'Free', u:'book.html', t:'A free 30-minute call for first-time clients. We talk it through and I recommend what fits.'}
  };
  var A = {};
  function recommend(a){
    var k = a.budget === 'low' ? 'unlock' : a.budget === 'mid' ? 'vault' : 'reveal', note = '';
    if (k === 'reveal' && a.where === 'virtual') { k = 'vault'; note = 'The Full Reveal is in person only, so The Vault Edit is the best fit for virtual sessions.'; }
    else if (k === 'reveal') note = 'The Full Reveal is in person (near Boston and Southern NH) and includes three shopping trips with you.';
    else if (k === 'unlock' && a.focus === 'own') note = 'The Unlock builds your 5 outfits from the pieces you already own.';
    else if (k === 'vault' && a.focus === 'own') note = 'The Vault Edit includes the Wardrobe Detox Checklist to help you clear your closet.';
    if (k !== 'reveal' && a.where !== 'virtual' && a.focus !== 'own') note = (note ? note + ' ' : '') + 'Want a shopping trip with me? You can add one in person for $100.';
    return {k: k, note: note};
  }
  window.__hsvRec = recommend; window.__hsvR = R;
  var Q = {
    start: {q:'What do you need help with?', o:[
      ['Outfits for an event or trip', {r:'occasion'}], ['Outfits for a group trip or event', {r:'ensemble'}],
      ['A full style overhaul', {next:'where'}], ['A few new pieces that all work together', {r:'mini'}],
      ['Declutter and organize my closet', {next:'closet'}], ['Find my colors and body shape', {r:'report'}],
      ['I am not sure', {r:'consult'}]]},
    where: {q:'Do you want to meet in person or virtually?', o:[
      ['In person', {set:['where','person'], next:'focus'}], ['Virtual', {set:['where','virtual'], next:'focus'}], ['Either is fine', {set:['where','either'], next:'focus'}]]},
    focus: {q:'What should we focus on?', o:[
      ['Outfits from what I already own', {set:['focus','own'], next:'budget'}], ['Shopping for new pieces', {set:['focus','shop'], next:'budget'}], ['Both', {set:['focus','both'], next:'budget'}]]},
    budget: {q:'What feels right for your budget?', o:[
      ['About $225', {set:['budget','low'], rec:true}], ['About $400', {set:['budget','mid'], rec:true}], ['$950, the full experience', {set:['budget','high'], rec:true}]]},
    closet: {q:'How would you like to do it?', o:[
      ['In person, with you helping', {r:'detox'}], ['On my own, with a guide', {r:'guide'}]]}
  };
  var css = '#hsvHelperBtn{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:900;border:0;border-radius:999px;background:#7A1321;color:#FAF9F6;font:500 14px/1 var(--font-body,sans-serif);padding:14px 20px;cursor:pointer;}'
    + '#hsvHelperBtn:hover{background:#4E0B14;}@media (max-width:620px){#hsvHelperBtn{font-size:13px;padding:11px 16px;}}#hsvHelperBtn:focus-visible,#hsvHelper button:focus-visible,#hsvHelper a:focus-visible{outline:2px solid #181716;outline-offset:2px;}'
    + '#hsvHelper{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(72px,calc(env(safe-area-inset-bottom,0px) + 72px));z-index:901;width:min(360px,calc(100vw - 32px));max-height:calc(100vh - 110px);overflow:auto;background:#FAF9F6;color:#181716;border:1px solid #DCD8D0;border-radius:8px;padding:20px 20px 18px;font-family:var(--font-body,sans-serif);}'
    + '#hsvHelper[hidden]{display:none;}#hsvHelper h2{font:500 22px/1.2 var(--font-display,serif);margin:0 28px 4px 0;}#hsvHelper .hh-sub{font-size:13px;color:#6B6862;margin:0 0 14px;}'
    + '#hsvHelper .hh-x{position:absolute;top:10px;right:12px;border:0;background:none;font-size:24px;line-height:1;cursor:pointer;color:#6B6862;}'
    + '#hsvHelper .hh-o{display:block;width:100%;text-align:left;margin:0 0 8px;padding:12px 14px;border:1px solid #DCD8D0;border-radius:6px;background:#fff;font:400 14px/1.35 var(--font-body,sans-serif);color:#181716;cursor:pointer;}'
    + '#hsvHelper .hh-o:hover{border-color:#7A1321;background:#F7F0EE;}#hsvHelper .hh-res{background:#EFECE6;border-radius:6px;padding:14px;margin:0 0 12px;}'
    + '#hsvHelper .hh-res b{font:500 22px/1.2 var(--font-display,serif);display:block;}#hsvHelper .hh-res i{font-style:normal;color:#7A1321;font-weight:600;font-size:14px;}#hsvHelper .hh-res p{font-size:14px;line-height:1.5;margin:6px 0 0;}'
    + '#hsvHelper .hh-go{display:inline-block;background:#7A1321;color:#FAF9F6;text-decoration:none;border-radius:4px;padding:11px 16px;font-size:14px;font-weight:500;margin:0 8px 8px 0;}#hsvHelper .hh-link{font-size:13px;color:#6B6862;background:none;border:0;text-decoration:underline;cursor:pointer;padding:4px 0;font-family:inherit;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function lbl(){ return window.innerWidth <= 620 ? 'Help me choose' : 'Not sure where to start?'; }
  var btn = document.createElement('button'); btn.id = 'hsvHelperBtn'; btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = lbl();
  var box = document.createElement('div'); box.id = 'hsvHelper'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Help me choose');
  document.body.appendChild(box); document.body.appendChild(btn);
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function show(key){
    var s = Q[key];
    box.innerHTML = '<button type="button" class="hh-x" aria-label="Close">×</button><h2>' + esc(s.q) + '</h2><p class="hh-sub">Pick one. No wrong answers.</p>' + s.o.map(function(o, i){ return '<button type="button" class="hh-o" data-i="' + i + '">' + esc(o[0]) + '</button>'; }).join('');
    Array.prototype.forEach.call(box.querySelectorAll('.hh-o'), function(b){ b.addEventListener('click', function(){ var a = s.o[+b.getAttribute('data-i')][1]; if (a.set) A[a.set[0]] = a.set[1]; if (a.rec) { var rr = recommend(A); result(rr.k, rr.note); } else if (a.next) show(a.next); else result(a.r); }); });
    wire();
  }
  function result(k, note){
    var r = R[k], pk = /^(unlock|vault|reveal)$/.test(k);
    box.innerHTML = '<button type="button" class="hh-x" aria-label="Close">×</button><h2>I would start here</h2><p class="hh-sub">A good fit for what you told me.</p>'
      + '<div class="hh-res"><b>' + esc(r.n) + '</b><i>' + esc(r.p) + '</i><p>' + esc(r.t) + '</p>' + (note ? '<p>' + esc(note) + '</p>' : '') + '</div>'
      + '<a class="hh-go" href="' + r.u + '">' + (k === 'consult' ? 'Book a free call' : 'See details') + '</a>'
      + (pk ? '<a class="hh-go" style="background:#fff;color:#7A1321;border:1px solid #7A1321;" href="book.html">Book a free call first</a>' : '')
      + '<br><button type="button" class="hh-link" data-restart>Start over</button>';
    box.querySelector('[data-restart]').addEventListener('click', function(){ A = {}; show('start'); });
    wire();
  }
  function wire(){ box.querySelector('.hh-x').addEventListener('click', close); }
  function open(){ A = {}; show('start'); box.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.textContent = 'Close'; }
  function close(){ box.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.textContent = lbl(); }
  btn.addEventListener('click', function(){ if (box.hidden) open(); else close(); });
  /* keep the first screen calm: the button appears once the visitor has scrolled a little */
  function reveal(){ btn.style.display = (window.scrollY > 500 || !box.hidden) ? '' : 'none'; }
  btn.style.display = 'none'; window.addEventListener('scroll', reveal, {passive:true}); reveal();
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !box.hidden) { close(); btn.focus(); } });
})();

/* Card descriptions are cut off after 2 lines. When one is cut off, tapping the text opens the rest (tap again to close).
   There is no label: the ellipsis is the only hint. Safe to call again after cards are drawn. */
window.hsvTapMore = function(root){
  Array.prototype.forEach.call((root || document).querySelectorAll('.vd-desc'), function(p){
    if (p.getAttribute('data-more')) return;
    if (p.scrollHeight <= p.clientHeight + 1) return;
    p.setAttribute('data-more', '1');
    p.classList.add('vd-tap'); p.setAttribute('role', 'button'); p.tabIndex = 0; p.setAttribute('aria-expanded', 'false');
    function t(e){ e.preventDefault(); var open = p.classList.toggle('open'); p.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    p.addEventListener('click', t);
    p.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') t(e); });
  });
};
(function(){
  var tm; function again(){ clearTimeout(tm); tm = setTimeout(function(){ window.hsvTapMore(document); }, 150); }
  window.addEventListener('resize', again);
  window.addEventListener('load', again);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
})();
