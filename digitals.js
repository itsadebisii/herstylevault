/* ===== Vault Digitals catalog =====
   To add a digital: add one object to DIGITALS. The Vault Digitals shop grid and each
   product page (digital.html#your-slug) build themselves from this list. No HTML edits.

   Fields
     slug         unique, lowercase, hyphens (becomes digital.html#slug)        REQUIRED
     name         product title                                                  REQUIRED
     category     'reports' | 'guides'  (drives filter tabs, eyebrow, cover tone)
     status       'live' (default) | 'coming-soon' (card shows a badge, no link, no buy button)
                  | 'hidden' (kept in this file but not shown anywhere)
     coverImage   optional 4:5 image path. Without it, a styled editorial cover is generated.
     coverTone    optional 'stone' (Cool Stone) | 'noir' (Bordeaux Noir). Default: reports=stone, guides=noir
     coverSub     optional small line printed on the generated cover
     price, priceNote, short (keep to ~2 lines), headline (may use <em>), lead
     soonNote, soonCta  optional, for status 'coming-soon': a line shown instead of the price, and a {label, href} button (e.g. mailto)
     includes[]   What's Inside bullets
     steps[]      How It Works: [title, text] pairs (2 to 4 work best)
     trust[]      Why It's Different: [title, text] pairs;  trustTitle optional heading (may use <em>)
     faqs[]       [question, answer] pairs
     previews[]   optional Sneak Peek pages, portrait ~4:5: {src, alt, locked}. Shown after the cover in the flipper.
     cta          {label, href}      meta  'Instant delivery · One-time payment' (split on ' · ')
   Anything optional can be left out and its section simply won't render. */
var DIGITALS = [
  {
    slug: 'signature-style-report',
    name: 'Signature Style Report',
    category: 'reports', status: 'live',
    coverSub: 'Color · Shape · Style',
    price: '$40', priceNote: 'one-time',
    previews: [
      {src:'images/digitals/report-persona.jpg', alt:'Sample report page: your style persona, 3-piece formula and color palette'},
      {src:'images/digitals/report-color.jpg', alt:'Sample report page: your color type and accessory color guide'},
      {src:'images/digitals/report-body.jpg', alt:'Sample report page: body shape and styling goal'},
      {src:'images/digitals/report-locked.jpg', alt:'Locked report page: silhouettes, shopping links and fabric guide', locked:true}
    ], /* sneak peek pages (portrait, sample client). Slide 1 is always the cover. */
    short: "23 quick questions and an optional photo give you a custom style blueprint: your color season, body shape, and what to wear.",
    headline: 'Find your <em>colors</em> and your <em>shape</em> in about 3 minutes',
    lead: "The Signature Style Report is a custom digital style blueprint built from my professional styling method, the same one I use with real clients. No appointment, no waiting.",
    includes: ['Your color season, identified from 12 seasons', 'Your body shape, identified from 5 shapes', 'Your palette and the colors to avoid', 'Your style persona, so your wardrobe sounds like you', 'Styling rules for your shape, written for your answers'],
    steps: [
      ['Answer 23 Questions', "About your natural coloring and body, with visual examples for the trickier ones, so nothing's a guess."],
      ['Add a Photo', "Optional, but it sharpens your color and shape read. Skip it if you'd rather not."],
      ['Get Your Report', 'Built from your answers in under a minute: your color season, body shape, and exactly what to wear.']
    ],
    trustTitle: 'Not a generic <em>quiz result</em>',
    trust: [
      ['Real styling data, not guesses', 'Your color season and body shape are identified using the same tested color and body-shape system HerStyleVault uses with in-person clients: 12 color seasons, 5 body shapes, real palettes and real styling rules.'],
      ['Written for you, not templated', 'A personalized digital report explaining exactly how your specific answers point to your result, including resolving any answers that seem to contradict each other, the way a real stylist would.']
    ],
    faqs: [
      ['How long does it take?', 'About 3 minutes for the quiz itself. Your report generates in under a minute after checkout.'],
      ['Do I need to upload a photo?', "No, it's optional. It sharpens the read on your color and shape, but the report works from your answers alone if you'd rather skip it."],
      ['Is this the same as booking a session?', 'No, this is a self-serve digital product for anyone, anywhere. If you want hands-on styling help, book a free consultation instead.'],
      ['What does it cost?', '$40, one-time. No subscription, no hidden extras.']
    ],
    cta: { label: 'Start Your Analysis', href: 'color-style-analysis.html' },
    meta: 'Instant results · One-time payment · No account needed'
  },
  {
    slug: 'wardrobe-detox-guide',
    name: 'The Wardrobe Detox Guide',
    category: 'guides', status: 'coming-soon', /* switch to 'live' once each option below has its price and Stripe link */
    coverSub: 'Closet · Declutter · Reset',
    price: '', /* leave blank: each option below carries its own price */
    soonNote: 'Coming soon. Choose the one-page Checklist or the full Guidebook.',
    soonCta: { label: 'Be the First to Know', href: 'mailto:hello@herstylevault.com?subject=Wardrobe%20Detox%20Guide%20updates' },
    previews: [],
    short: 'Declutter your closet your way: a one-page Checklist or the full Guidebook.',
    headline: 'Declutter your closet, <em>your way</em>',
    lead: 'The Wardrobe Detox Guide is HerStyleVault’s method for clearing your closet efficiently, in two versions: a one-page Checklist when you want the quick reset, or the full Guidebook when you want every tip and trick.',
    /* options = the tiers. Each can carry: label, badge, price, priceNote, soonNote, includes[], cta {label, href}. Anything left out falls back to the product's own field. */
    options: [
      {
        label: 'Checklist', badge: 'One page',
        price: '', /* e.g. '$9' */
        soonNote: 'Coming soon. Included with The Vault Edit and The Full Reveal.',
        includes: ['A one-page checklist you can print or use on your phone', 'The steps in order, so you always know what comes next', 'A digital file that is yours to keep and reuse every season'],
        cta: { label: 'Get the Checklist', href: 'STRIPE_LINK_HERE' }
      },
      {
        label: 'Guidebook', badge: 'Full method',
        price: '', /* e.g. '$29' */
        soonNote: 'Coming soon. Included with The Full Reveal. Vault Edit clients get a discount.',
        includes: ['A clear, step-by-step method for decluttering your closet efficiently', 'Tips and tricks you can reuse anytime', 'The one-page Checklist included', 'A digital guidebook that is yours to keep'],
        cta: { label: 'Get the Guidebook', href: 'STRIPE_LINK_HERE' }
      }
    ],
    includes: ['A clear method for decluttering your closet efficiently', 'Tips and tricks you can reuse anytime'],
    steps: [
      ['Choose your version', 'The one-page Checklist or the full Guidebook.'],
      ['Check out once', 'No subscription. Your file is available to download right away.'],
      ['Detox at your pace', 'Work through your closet whenever suits you.']
    ],
    faqs: [
      ['What is the difference between the Checklist and the Guidebook?', 'The Checklist is the one-page quick version. The Guidebook is the full method, with the reasoning, tips and tricks behind each step, and it includes the Checklist.'],
      ['Is this included with a package?', 'Yes. The Full Reveal includes the Guidebook and the Checklist. The Vault Edit includes the Checklist, plus a discount on the Guidebook.'],
      ['Is this the same as The Wardrobe Detox service?', 'No. The service is in person, where I declutter and reorganize your closet with you. The Guide is the do-it-yourself version.'],
      ['Is it a physical product?', 'No. It is a digital file, delivered instantly, for your personal use only.']
    ],
    cta: { label: 'Get The Wardrobe Detox Guide', href: 'STRIPE_LINK_HERE' },
    meta: 'Instant access · One-time payment'
  }
];

/* ---------- Catalog helpers ---------- */
var DIGITAL_CATEGORIES = {
  reports: { label: 'Style Reports', eyebrow: 'Style Report' },
  guides:  { label: 'Guides',        eyebrow: 'Guide' }
};
function digitalCat(p){ return DIGITAL_CATEGORIES[p.category] || { label: 'Digital', eyebrow: 'Digital' }; }
function digitalSoon(p){ return p.status === 'coming-soon'; }
/* everything that should appear on the site (live + coming soon); legacy live:false and status:'hidden' are skipped */
function visibleDigitals(){ return DIGITALS.filter(function(d){ return d.live !== false && d.status !== 'hidden'; }); }
var liveDigitals = visibleDigitals; /* older name, kept so nothing breaks */
function digitalAttr(t){ return String(t == null ? '' : t).replace(/<[^>]*>/g,'').replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

/* 4:5 cover: the product's own coverImage, or a generated editorial mockup (hairline frame, Cormorant type) */
function digitalCover(p){
  if (p.coverImage) return '<div class="vd-cover has-img"><img src="' + digitalAttr(p.coverImage) + '" alt="' + digitalAttr(p.name) + ' cover" loading="lazy"></div>';
  var tone = p.coverTone || (p.category === 'guides' ? 'noir' : 'stone');
  return '<div class="vd-cover tone-' + (tone === 'noir' ? 'noir' : 'stone') + '" role="img" aria-label="' + digitalAttr(p.name) + ' cover">' +
    '<span class="vc-eyebrow">' + digitalCat(p).eyebrow + '</span>' +
    '<span class="vc-mid"><strong class="vc-title">' + p.name + '</strong><i class="vc-rule"></i>' + (p.coverSub ? '<span class="vc-sub">' + p.coverSub + '</span>' : '') + '</span>' +
    '<span class="vc-brand">HerStyleVault</span></div>';
}

/* shop-grid card: cover, category eyebrow, title, 2-line description, price, CTA or Coming Soon */
function digitalCard(p){
  var soon = digitalSoon(p);
  var inner = '<div class="vd-media">' + digitalCover(p) + '</div><div class="vd-body">' +
    '<p class="vd-eyebrow">' + digitalCat(p).eyebrow + '</p><h3 class="card-title">' + p.name + '</h3>' +
    '<p class="vd-desc">' + (p.short || '') + '</p>' +
    '<div class="vd-foot">' + (p.price ? '<span class="price">' + p.price + (p.priceNote ? ' <span>' + p.priceNote + '</span>' : '') + '</span>' : '<span></span>') +
    (soon ? '<span class="vd-badge">Coming Soon · See details →</span>' : '<span class="vd-cta">View Details →</span>') + '</div></div>';
  return '<a class="vd-card' + (soon ? ' is-soon' : '') + '" href="digital.html#' + p.slug + '">' + inner + '</a>';
}

/* compact card for "More From Vault Digitals": small cover, title, price, hover "Discover" */
function digitalMini(p){
  var soon = digitalSoon(p);
  var inner = '<div class="vd-thumb">' + digitalCover(p) + '<span class="vd-hover" aria-hidden="true">Discover</span></div>' +
    '<div class="vd-mini-body"><p class="vd-eyebrow">' + digitalCat(p).eyebrow + '</p><h3 class="card-title">' + p.name + '</h3>' +
    '<p class="vd-mini-meta">' + (p.price ? '<span class="price">' + p.price + '</span>' : '') + (soon ? '<span class="vd-badge">Coming Soon</span>' : '<span class="vd-go">Discover \u2192</span>') + '</p></div>';
  return '<a class="vd-mini' + (soon ? ' is-soon' : '') + '" href="digital.html#' + p.slug + '">' + inner + '</a>';
}

/* "See more" appears only when a card description is cut off by the 2-line limit */
function digitalMore(root){
  Array.prototype.forEach.call((root || document).querySelectorAll('.vd-desc'), function(p){
    if (p.getAttribute('data-more')) return;
    if (p.scrollHeight <= p.clientHeight + 1) return;
    p.setAttribute('data-more', '1');
    var b = document.createElement('span'); b.className = 'vd-more'; b.setAttribute('role', 'button'); b.tabIndex = 0; b.textContent = 'See more';
    function t(e){ e.preventDefault(); e.stopPropagation(); var open = p.classList.toggle('open'); b.textContent = open ? 'See less' : 'See more'; }
    b.addEventListener('click', t);
    b.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') t(e); });
    p.parentNode.insertBefore(b, p.nextSibling);
  });
}
