function goTo(url) {
window.location.href = url;
}
function toggleNavMenu(e) { e.stopPropagation(); document.getElementById('bookDropdown').classList.remove('open'); document.getElementById('navLinks').classList.toggle('open'); }
function toggleBookDropdown(e) { e.stopPropagation(); document.getElementById('navLinks').classList.remove('open'); document.getElementById('bookDropdown').classList.toggle('open'); }
document.addEventListener('click', function(e) { const nav = document.getElementById('navLinks'); const toggle = document.querySelector('.nav-menu-toggle'); const bookDd = document.getElementById('bookDropdown'); const bookBtn = document.querySelector('.nav-cta'); if (nav && toggle) { if (nav.classList.contains('open') && (e.target.tagName === 'A' || (!nav.contains(e.target) && !toggle.contains(e.target)))) { nav.classList.remove('open'); } } if (bookDd && bookBtn) { if (bookDd.classList.contains('open') && (e.target.tagName === 'A' || (!bookDd.contains(e.target) && !bookBtn.contains(e.target)))) { bookDd.classList.remove('open'); } } });
function toggleFaq(el) {
const item = el.parentElement;
const isOpen = item.classList.contains('open');
document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
if (!isOpen) item.classList.add('open');
}
function observeReveals() {
const reveals = document.querySelectorAll('.reveal:not(.visible)');
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.08 });
reveals.forEach(el => observer.observe(el));
}
window.openCalendlyPopup = function(e, url) { if (e && e.preventDefault) e.preventDefault(); if (window.Calendly && Calendly.initPopupWidget) { Calendly.initPopupWidget({ url: url }); } else { window.location.href = url; } return false; };
window.addEventListener('message', function(event) {
if (!event || !event.data) return;
var data = event.data;
if (data.event === 'Tally.FormSubmitted' && data.payload) {
if (data.payload.formId === 'GxY5bk') {
if (window.Tally && Tally.closePopup) Tally.closePopup('GxY5bk');
setTimeout(function () { window.openCalendlyPopup(null, 'https://calendly.com/herstylevault/book-session'); }, 350);
} else if (data.payload.formId === 'yPeEjp') {
if (window.Tally && Tally.closePopup) Tally.closePopup('yPeEjp');
setTimeout(function () { window.openCalendlyPopup(null, 'https://calendly.com/herstylevault/free-consultation'); }, 350);
}
}
});
observeReveals();
