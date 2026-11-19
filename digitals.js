/* ===== Vault Digitals catalog =====
   To add a digital: add one object to DIGITALS. The Vault Digitals shop grid and each
   product page (digital-your-slug.html) build themselves from this list. No HTML edits.

   Fields
     slug         unique, lowercase, hyphens (becomes digital-slug.html)        REQUIRED
     name         product title                                                  REQUIRED
     category     'reports' | 'guides'  (drives filter tabs, eyebrow, cover tone)
     status       'live' (default) | 'coming-soon' (card shows a badge, no link, no buy button)
                  | 'hidden' (kept in this file but not shown anywhere)
     coverImage   optional 4:5 image path. Without it, a styled editorial cover is generated.
     coverTone    optional 'stone' (Cool Stone) | 'noir' (Bordeaux Noir). Default: reports=stone, guides=noir
     coverSub     optional small line printed on the generated cover
     price, priceNote, short (keep to ~2 lines), headline (may use <em>), lead
     soonNote, soonCta  optional, for status 'coming-soon': a line shown instead of the price, and a {label, href} button (e.g. mailto)
     options[]    optional tiers on one product page (e.g. Checklist / Guidebook). Each can override: label, badge, price, priceNote, soonNote, includes, cta,
                  and its own cover: coverName, coverSub, coverTone, coverImage. The cover changes when the visitor picks an option.
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
    coverImage: 'images/digitals/report-cover.jpg',
    previews: [
      {src:'images/digitals/report-page-2.jpg', alt:'Sample report page: your style persona, 3-piece formula and full color palette'},
      {src:'images/digitals/report-page-4.jpg', alt:'Sample report page: your body shape, why it fits you and your styling goal'}
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
    category: 'guides', status: 'live', /* the Buy button turns on once cta.href is your real Stripe link (see below) */
    coverImage: 'images/digitals/detox-guide-cover.jpg',
    coverSub: 'Closet · Declutter · Reset',
    price: '$28.99', priceNote: 'one-time',
    soonNote: 'Coming soon.',
    soonCta: { label: 'Be the First to Know', href: 'mailto:hello@herstylevault.com?subject=Wardrobe%20Detox%20Guide%20updates' },
    previews: [
      {src:'images/digitals/detox-guide-p4.jpg', alt:'Sample guide page: the Closet Reset Checklist and HerStyleVault favorite hangers'},
      {src:'images/digitals/detox-guide-p5.jpg', alt:'Sample guide page: the Closet Reset visual guide to grouping by category and color flow'},
      {src:'images/digitals/detox-guide-p9.jpg', alt:'Sample guide page: the Wardrobe Gap Builder, a printable list of missing pieces'}
    ], /* sneak peek pages; slide 1 is always the cover */
    short: 'An 11-page, zone-by-zone closet reset: sort, store, sell and keep it clear, without the overwhelm.',
    headline: 'Reset your closet, <em>one zone at a time</em>',
    lead: 'The Wardrobe Detox Guide is the calm, step-by-step method I use to clear a closet without the overwhelm. Work through your closet, dressers, shoes and purses one zone at a time, with checklists to tick off as you go.',
    includes: [
      'A zone-by-zone method for your closet, dressers, shoes and purses',
      'The Keep, Sell, Donate system, with a bag labeling guide and a three-question quick check',
      'HerStyleVault’s Golden Rule for letting go, so you stop second-guessing',
      'The Closet Reset Checklist and a visual guide to grouping by category and color',
      'The Flat-Roll Method for drawers you can see into at a glance',
      'Hanger and storage picks I actually recommend',
      'A selling workflow and platform cheat sheet for what you’re ready to let go',
      'A printable Wardrobe Gap Builder, so you only shop for what completes your outfits',
      'Simple weekly and yearly habits to keep it clutter-free'
    ],
    steps: [
      ['Check out once', 'No account and no subscription.'],
      ['Download right away', 'Your PDF is ready the moment you pay. It works on your phone, tablet or computer, and prints cleanly.'],
      ['Work at your pace', 'Do every zone in one day, or take one zone a day. About 45 minutes per zone, or a full afternoon for everything.']
    ],
    faqs: [
      ['How do I get it?', 'Right after you pay, you land on a page with a download button. Keep that page’s link and you can download it again anytime. If you ever lose it, email me.'],
      ['What format is it?', 'An 11-page PDF. Use it on your phone or tablet, or print it and tick the checklists off by hand.'],
      ['Do I need to buy anything?', 'No. The hanger and storage picks are optional suggestions.'],
      ['Is this included with a package?', 'Yes. The Vault Edit and The Full Reveal both include The Wardrobe Detox Guide.'],
      ['Is this the same as The Wardrobe Detox service?', 'No. The service is in person, where I declutter and reorganize your closet with you. The Guide is the do-it-yourself version.'],
      ['Can I get a refund?', 'Digital products are final sale because they arrive instantly. If the file won’t open, email me and I’ll fix it.']
    ],
    /* After you create the $28.99 Payment Link in Stripe, paste it below in place of STRIPE_LINK_HERE.
       In Stripe, set the Payment Link to redirect after payment to:
       https://herstylevault.com/guide-download.html?session_id={CHECKOUT_SESSION_ID} */
    cta: { label: 'Get The Wardrobe Detox Guide', href: 'STRIPE_LINK_HERE' },
    meta: 'Instant PDF download · One-time payment · 11 pages'
  }
];

/* ---------- Catalog helpers ---------- */
var DIGITAL_CATEGORIES = {
  reports: { label: 'Style Reports', eyebrow: 'Style Report' },
  guides:  { label: 'Guides',        eyebrow: 'Guide' }
};
/* each product has its own page (digital-<slug>.html) so it can be found and shared; run scripts/build_product_pages.js after editing this file */
function digitalUrl(p){ return 'digital-' + p.slug + '.html'; }
function digitalCat(p){ return DIGITAL_CATEGORIES[p.category] || { label: 'Digital', eyebrow: 'Digital' }; }
function digitalSoon(p){ return p.status === 'coming-soon' || !!(p.cta && /STRIPE_LINK_HERE/.test(p.cta.href || '')); }
/* everything that should appear on the site (live + coming soon); legacy live:false and status:'hidden' are skipped */
function visibleDigitals(){ return DIGITALS.filter(function(d){ return d.live !== false && d.status !== 'hidden'; }); }
var liveDigitals = visibleDigitals; /* older name, kept so nothing breaks */
function digitalAttr(t){ return String(t == null ? '' : t).replace(/<[^>]*>/g,'').replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

/* 4:5 cover: the product's own coverImage, or a generated editorial mockup (hairline frame, Cormorant type) */
function digitalCover(p){
  if (p.coverImage) return '<div class="vd-cover has-img"><img src="' + digitalAttr(p.coverImage) + '" alt="' + digitalAttr(p.coverName || p.name) + ' cover" loading="lazy"></div>';
  var tone = p.coverTone || (p.category === 'guides' ? 'noir' : 'stone');
  return '<div class="vd-cover tone-' + (tone === 'noir' ? 'noir' : 'stone') + '" role="img" aria-label="' + digitalAttr(p.coverName || p.name) + ' cover">' +
    '<span class="vc-eyebrow">' + digitalCat(p).eyebrow + '</span>' +
    '<span class="vc-mid"><strong class="vc-title">' + (p.coverName || p.name) + '</strong><i class="vc-rule"></i>' + (p.coverSub ? '<span class="vc-sub">' + p.coverSub + '</span>' : '') + '</span>' +
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
  return '<a class="vd-card' + (soon ? ' is-soon' : '') + '" href="' + digitalUrl(p) + '">' + inner + '</a>';
}

/* compact card for "More From Vault Digitals": small cover, title, price, hover "Discover" */
function digitalMini(p){
  var soon = digitalSoon(p);
  var inner = '<div class="vd-thumb">' + digitalCover(p) + '<span class="vd-hover" aria-hidden="true">Discover</span></div>' +
    '<div class="vd-mini-body"><p class="vd-eyebrow">' + digitalCat(p).eyebrow + '</p><h3 class="card-title">' + p.name + '</h3>' +
    '<p class="vd-mini-meta">' + (p.price ? '<span class="price">' + p.price + '</span>' : '') + (soon ? '<span class="vd-badge">Coming Soon</span>' : '<span class="vd-go">Discover \u2192</span>') + '</p></div>';
  return '<a class="vd-mini' + (soon ? ' is-soon' : '') + '" href="' + digitalUrl(p) + '">' + inner + '</a>';
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
