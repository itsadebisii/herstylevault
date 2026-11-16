var HSV_ICON_BASE = '<svg viewBox="0 0 24 24" width="SIZE" height="SIZE" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">';
var HSV_ICONS = {
  hanger: '<circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none"/><path d="M12 6.4V9M12 9 3.6 16c-.9.8-.3 1.5.6 1.5h15.6c.9 0 1.5-.7.6-1.5L12 9Z"/>',
  bag: '<path d="M5.2 9h13.6l1 11.5H4.2L5.2 9Z"/><path d="M8.6 9V7.2a3.4 3.4 0 0 1 6.8 0V9"/>',
  dress: '<path d="M9.2 3 8.4 9 4.8 21h14.4L15.6 9l-.8-6"/><path d="M8.4 9h7.2M9.2 3c.8 1.4 1.8 2 2.8 2s2-.6 2.8-2"/>',
  shades: '<path d="M2.8 9.4h18.4"/><path d="M4.4 9.4c.2 3.6 1.6 5.6 3.8 5.6 2.1 0 3.4-1.7 3.6-5.6"/><path d="M12.2 9.4c.2 3.9 1.5 5.6 3.6 5.6 2.2 0 3.6-2 3.8-5.6"/>'
};
function hsvIcon(name, size){ return HSV_ICON_BASE.replace(/SIZE/g, size || 14) + HSV_ICONS[name] + '</svg>'; }
var TICKER_ITEMS = ['Color Analysis','Wardrobe Detox','Wardrobe Consulting','Personal Shopping','Now Booking — Limited Introductory Pricing'];
var TICKER_MARKS = ['hanger','bag','dress','shades','hanger'];
function tickerSet(hidden){
  return '<div class="ticker-set"' + (hidden ? ' aria-hidden="true"' : '') + '>' + TICKER_ITEMS.map(function(t,i){ return '<span class="ticker-item">' + t + '</span><span class="ticker-sep">' + hsvIcon(TICKER_MARKS[i], 15) + '</span>'; }).join('') + '</div>';
}
var TICKER_HTML = '<div class="site-ticker ticker"><div class="ticker-track">' + tickerSet(false) + tickerSet(true) + '</div></div>';

const NAV_HTML = `${TICKER_HTML}
<div class="nav-inner">
<a class="wordmark" href="index.html">HerStyleVault</a>
<ul class="nav-links" id="navLinks">
<li class="has-dropdown"><a class="dd-label" href="packages.html">Services</a><div class="dropdown">
<a href="what-to-expect.html">What to Expect</a>
<a href="services.html">À La Carte Services</a>
<a href="packages.html">Private Styling Packages</a>
</div></li>
<li><a href="lookbook.html">Lookbook</a></li>
<li><a href="vault-digitals.html">Vault Digitals</a></li>
<li><a href="locations.html">Locations</a></li>
<li><a href="about.html">About</a></li>
<li class="has-dropdown"><a class="dd-label" href="faq.html">FAQ &amp; Policies</a><div class="dropdown">
<a href="how-it-works.html">How It Works</a>
<a href="faq.html">FAQ</a>
<a href="policies.html">Policies</a>
</div></li>
</ul>
<div class="nav-right">
<button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>
<a class="btn btn-primary" href="book.html">Book Free Consult</a>
</div>
</div>`;

const FOOTER_HTML = `<div class="wrap">
<div class="footer-top">
<div>
<div class="footer-word">HerStyleVault</div>
<p class="footer-tagline">Personal styling for the woman ready to show up as her most elevated self.</p>
<div class="footer-icons">${hsvIcon("hanger",18)}${hsvIcon("bag",18)}${hsvIcon("dress",18)}${hsvIcon("shades",18)}</div>
</div>
<div class="footer-col">
<h5>Styling &amp; Digitals</h5>
<ul>
<li><a href="packages.html">Private Styling Packages</a></li>
<li><a href="services.html">À La Carte Services</a></li>
<li><a href="vault-digitals.html">Vault Digitals</a></li>
<li><a href="lookbook.html">Lookbook</a></li>
</ul>
</div>
<div class="footer-col">
<h5>Studio &amp; Policies</h5>
<ul>
<li><a href="about.html">About</a></li>
<li><a href="locations.html">Locations</a></li>
<li><a href="how-it-works.html">How It Works</a></li>
<li><a href="faq.html">FAQ</a></li>
<li><a href="policies.html">Policies</a></li>
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
