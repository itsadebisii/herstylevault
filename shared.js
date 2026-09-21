const NAV_HTML = `<a class="nav-logo" href="index.html"><svg class="nav-logo-mark" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="50" fill="none" stroke="#4e1d27" stroke-width="1.6"/><line x1="75" y1="19" x2="75" y2="27" stroke="#4e1d27" stroke-width="1.7"/><line x1="75" y1="123" x2="75" y2="131" stroke="#4e1d27" stroke-width="1.7"/><line x1="19" y1="75" x2="27" y2="75" stroke="#4e1d27" stroke-width="1.7"/><line x1="123" y1="75" x2="131" y2="75" stroke="#4e1d27" stroke-width="1.7"/><circle cx="75" cy="36" r="4.4" fill="#4e1d27"/><line x1="75" y1="40.4" x2="75" y2="50" stroke="#4e1d27" stroke-width="2.3" stroke-linecap="round"/><path d="M75 50 L44 76 Q38 80 44 83 L106 83 Q112 80 106 76 Z" fill="none" stroke="#4e1d27" stroke-width="2.3" stroke-linejoin="round"/></svg>HerStyleVault</a>
<div class="nav-right">
<button class="nav-menu-toggle" onclick="toggleNavMenu(event)" aria-label="Menu">☰</button>
<ul class="nav-links" id="navLinks">
<li><a href="how-it-works.html">How It Works</a></li>
<li><a href="packages.html">Packages</a></li>
<li><a href="add-ons.html">Add-Ons</a></li>
<li><a href="vault-exclusives.html" style="color:var(--deep-rose);">Vault Exclusives</a></li>
<li><a href="vault-digitals.html" style="color:var(--deep-rose);">Vault Digitals</a></li>
<li><a href="locations.html">Locations</a></li>
<li><a href="about.html">About</a></li>
<li><a href="faq.html">FAQ</a></li>
<li><a href="what-to-expect.html">What to Expect</a></li>
<li><a href="policies.html">Policies</a></li>
</ul>
<div class="book-now-wrap">
<button class="nav-cta" onclick="toggleBookDropdown(event)">Book Now</button>
<ul class="book-dropdown" id="bookDropdown">
<li><a href="https://tally.so/r/yPeEjp" data-tally-open="yPeEjp" data-tally-layout="modal" data-tally-width="700">First-Time Client</a></li>
<li><a href="https://tally.so/r/GxY5bk" data-tally-open="GxY5bk" data-tally-layout="modal" data-tally-width="700">Returning — New Package</a></li>
<li><a href="https://calendly.com/herstylevault/book-a-session" onclick="return openCalendlyPopup(event,'https://calendly.com/herstylevault/book-a-session')">Returning — Continuing Package</a></li>
<li><a href="https://tally.so/r/yPeEjp" data-tally-open="yPeEjp" data-tally-layout="modal" data-tally-width="700" style="color:var(--mauve);font-style:italic;">Not Sure? Free Consultation</a></li>
</ul>
</div>
</div>`;

const FOOTER_HTML = `<footer>
<div class="footer-brand"><svg class="footer-brand-mark" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="50" fill="none" stroke="#e4d2a5" stroke-width="1.6"/><line x1="75" y1="19" x2="75" y2="27" stroke="#e4d2a5" stroke-width="1.7"/><line x1="75" y1="123" x2="75" y2="131" stroke="#e4d2a5" stroke-width="1.7"/><line x1="19" y1="75" x2="27" y2="75" stroke="#e4d2a5" stroke-width="1.7"/><line x1="123" y1="75" x2="131" y2="75" stroke="#e4d2a5" stroke-width="1.7"/><circle cx="75" cy="36" r="4.4" fill="#e4d2a5"/><line x1="75" y1="40.4" x2="75" y2="50" stroke="#e4d2a5" stroke-width="2.3" stroke-linecap="round"/><path d="M75 50 L44 76 Q38 80 44 83 L106 83 Q112 80 106 76 Z" fill="none" stroke="#e4d2a5" stroke-width="2.3" stroke-linejoin="round"/></svg>HerStyleVault</div>
<p class="footer-tagline">Personal styling for the woman ready to show up as her most elevated self. Northern MA, Greater Boston, Southern NH & virtually nationwide.</p>
<div class="footer-nav">
<a href="index.html">Home</a><span>✦</span><a href="packages.html">Packages</a><span>✦</span><a href="vault-exclusives.html">Vault Exclusives</a><span>✦</span><a href="vault-digitals.html">Vault Digitals</a><span>✦</span><a href="about.html">About</a><span>✦</span><a href="policies.html">Policies</a>
</div>
<div class="footer-connect">
<a href="mailto:hello@herstylevault.com">hello@herstylevault.com</a><a href="https://instagram.com/herstylevault.official" target="_blank">Instagram</a><a href="https://tally.so/r/Np8azj" target="_blank">Leave a Testimonial</a>
</div>
<div class="footer-bottom"><span class="footer-copy">© 2026 HerStyleVault. All rights reserved.</span></div>
</footer>`;

function renderNav() { document.querySelectorAll('.nav-mount').forEach(function(el) { el.outerHTML = NAV_HTML; }); }
function renderFooters() { document.querySelectorAll('.footer-mount').forEach(function(el) { el.outerHTML = FOOTER_HTML; }); }

function scrollToId(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}
function toggleNavMenu(e) { e.stopPropagation(); const bd = document.getElementById('bookDropdown'); if (bd) bd.classList.remove('open'); document.getElementById('navLinks').classList.toggle('open'); }
function toggleBookDropdown(e) { e.stopPropagation(); const nl = document.getElementById('navLinks'); if (nl) nl.classList.remove('open'); document.getElementById('bookDropdown').classList.toggle('open'); }
document.addEventListener('click', function(e) {
  const nav = document.getElementById('navLinks');
  const toggle = document.querySelector('.nav-menu-toggle');
  const bookDd = document.getElementById('bookDropdown');
  const bookBtn = document.querySelector('.nav-cta');
  if (nav && toggle) {
    if (nav.classList.contains('open') && (e.target.tagName === 'A' || (!nav.contains(e.target) && !toggle.contains(e.target)))) { nav.classList.remove('open'); }
  }
  if (bookDd && bookBtn) {
    if (bookDd.classList.contains('open') && (e.target.tagName === 'A' || (!bookDd.contains(e.target) && !bookBtn.contains(e.target)))) { bookDd.classList.remove('open'); }
  }
});
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}
function toggleExpectPackage(el) {
  el.parentElement.classList.toggle('open');
}
function togglePolicyReveal(el) {
  el.classList.toggle('open');
}
function initPolicyReveal() {
  var cards = document.querySelectorAll('.policy-section[data-reveal]');
  if (!cards.length) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    cards.forEach(function(el) {
      el.addEventListener('mousemove', function(e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'translate(' + (x * 6).toFixed(1) + 'px, ' + (y * 6).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function() { el.style.transform = ''; });
    });
  }
  function openPolicyById(id) {
    var el = document.getElementById(id);
    if (el && el.hasAttribute('data-reveal')) el.classList.add('open');
  }
  document.querySelectorAll('.policy-jumpnav a').forEach(function(a) {
    a.addEventListener('click', function() {
      openPolicyById(a.getAttribute('href').replace('#', ''));
    });
  });
  if (window.location.hash) openPolicyById(window.location.hash.replace('#', ''));
}
function observeReveals() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  reveals.forEach(el => observer.observe(el));
}
window.openCalendlyPopup = function(e, url) {
  if (e && e.preventDefault) e.preventDefault();
  if (window.Calendly && Calendly.initPopupWidget) { Calendly.initPopupWidget({ url: url }); }
  else { window.location.href = url; }
  return false;
};
window.addEventListener('message', function(event) {
  if (!event || !event.data) return;
  var data = event.data;
  if (data.event === 'Tally.FormSubmitted' && data.payload) {
    if (data.payload.formId === 'GxY5bk') {
      if (window.Tally && Tally.closePopup) Tally.closePopup('GxY5bk');
      setTimeout(function() { window.openCalendlyPopup(null, 'https://calendly.com/herstylevault/book-session'); }, 350);
    } else if (data.payload.formId === 'yPeEjp') {
      if (window.Tally && Tally.closePopup) Tally.closePopup('yPeEjp');
      setTimeout(function() { window.openCalendlyPopup(null, 'https://calendly.com/herstylevault/free-consultation'); }, 350);
    }
  }
});
function initAboutCarousel() {
  var root = document.querySelector('.about-carousel');
  if (!root) return;
  var slides = root.querySelectorAll('.about-carousel-slide');
  var dots = root.querySelectorAll('.about-carousel-dot');
  var i = 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || slides.length < 2) return;
  setInterval(function() {
    root.classList.add('transitioning');
    setTimeout(function() {
      slides[i].classList.remove('active');
      dots[i].classList.remove('active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
      dots[i].classList.add('active');
      root.classList.remove('transitioning');
    }, 400);
  }, 3000);
}

renderNav();
renderFooters();
observeReveals();
initAboutCarousel();
initPolicyReveal();
