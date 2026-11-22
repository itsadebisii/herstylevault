var HSV_ICON_BASE = '<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">';
var HSV_ICONS = {
  hanger: '<circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none"/><path d="M12 6.4V9M12 9 3.6 16c-.9.8-.3 1.5.6 1.5h15.6c.9 0 1.5-.7.6-1.5L12 9Z"/>',
  bag: '<path d="M5.2 9h13.6l1 11.5H4.2L5.2 9Z"/><path d="M8.6 9V7.2a3.4 3.4 0 0 1 6.8 0V9"/>'
};
function hsvIcon(name, size){ return HSV_ICON_BASE.replace(/SIZE/g, size || 14) + HSV_ICONS[name] + '</svg>'; }
var TICKER_ITEMS = ['Color Analysis','Wardrobe Detox','Wardrobe Consulting','Personal Shopping','Now Booking'];
var TICKER_MARKS = ['hanger','bag','hanger','bag','hanger'];
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
<li><a href="lookbook.html">Lookbook</a></li>
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
<li><a href="lookbook.html">Lookbook</a></li>
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
window.addEventListener('message', function(event){
  var data = event && event.data;
  if (!data || data.event !== 'Tally.FormSubmitted' || !data.payload) return;
  var next = { GxY5bk: 'https://calendly.com/herstylevault/book-session', yPeEjp: 'https://calendly.com/herstylevault/free-consultation' }[data.payload.formId];
  if (!next) return;
  if (window.Tally && Tally.closePopup) Tally.closePopup(data.payload.formId);
  setTimeout(function(){ window.openCalendlyPopup(null, next); }, 350);
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
    reveal:   {n:'The Full Reveal', p:'$725', u:'package-full-reveal.html', t:'5 in-person sessions: a closet audit, three shopping trips and 10 outfits, plus the full Wardrobe Detox Bundle and a try-on reveal.'},
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
      ['About $225', {set:['budget','low'], rec:true}], ['About $400', {set:['budget','mid'], rec:true}], ['$725, the full experience', {set:['budget','high'], rec:true}]]},
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
