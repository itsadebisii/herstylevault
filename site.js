const NAV_HTML = `<div class="site-ticker ticker">
<div class="ticker-track">
<div class="ticker-set"><span class="ticker-item">Color Analysis</span><span class="ticker-sep">✦</span><span class="ticker-item">Wardrobe Detox</span><span class="ticker-sep">✦</span><span class="ticker-item">Wardrobe Consulting</span><span class="ticker-sep">✦</span><span class="ticker-item">Personal Shopping</span><span class="ticker-sep">✦</span><span class="ticker-item">Now Booking — Limited Introductory Pricing</span><span class="ticker-sep">✦</span></div>
<div class="ticker-set" aria-hidden="true"><span class="ticker-item">Color Analysis</span><span class="ticker-sep">✦</span><span class="ticker-item">Wardrobe Detox</span><span class="ticker-sep">✦</span><span class="ticker-item">Wardrobe Consulting</span><span class="ticker-sep">✦</span><span class="ticker-item">Personal Shopping</span><span class="ticker-sep">✦</span><span class="ticker-item">Now Booking — Limited Introductory Pricing</span><span class="ticker-sep">✦</span></div>
</div>
</div>
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
