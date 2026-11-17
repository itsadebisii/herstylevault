/* ===== Vault Digitals catalog =====
   To add a digital: add one object to DIGITALS. The Vault Digitals page and each
   product page (digital.html#your-slug) build themselves from this list. */
var DIGITALS = [
  {
    slug: 'signature-style-report',
    name: 'Signature Style Report',
    tag: 'Digital · Instant',
    price: '$40', priceNote: 'one-time',
    previews: [{src:'images/digitals/report-1.jpg', alt:'Sample report page: signature colors'}, {src:'images/digitals/report-2.jpg', alt:'Sample report page: color analysis'}, {src:'images/digitals/report-3-blur.jpg', alt:'Locked report page: body analysis', locked:true}], /* sneak peek pages (sample client) */
    short: "16 quick questions, an optional photo, and a custom-curated digital style blueprint built from Adebisi's professional styling method — your color season, body shape, and what to wear.",
    headline: 'Find your <em>colors</em> and your <em>shape</em> — in about 3 minutes',
    lead: "The Signature Style Report is a custom-curated digital style blueprint, built from Adebisi's professional styling method — the same knowledge HerStyleVault uses with real clients. No appointment, no waiting.",
    includes: ['Your color season, identified from 12 seasons', 'Your body shape, identified from 5 shapes', 'Your palette and the colors to avoid', 'Styling rules for your shape, written for your answers'],
    steps: [
      ['Answer 16 Questions', "About your natural coloring and body — with visual examples for the trickier ones, so nothing's a guess."],
      ['Add a Photo', "Optional, but it sharpens your color and shape read. Skip it if you'd rather not."],
      ['Get Your Report', 'Built from your answers in under a minute — your color season, body shape, and exactly what to wear.']
    ],
    trust: [
      ['Real styling data, not guesses', 'Your color season and body shape are identified using the same tested color and body-shape system HerStyleVault uses with in-person clients — 12 color seasons, 5 body shapes, real palettes and real styling rules.'],
      ['Written for you, not templated', 'A personalized digital report explaining exactly how your specific answers point to your result — including resolving any answers that seem to contradict each other, the way a real stylist would.']
    ],
    faqs: [
      ['How long does it take?', 'About 3 minutes for the quiz itself. Your report generates in under a minute after checkout.'],
      ['Do I need to upload a photo?', "No — it's optional. It sharpens the read on your color and shape, but the report works from your answers alone if you'd rather skip it."],
      ['Is this the same as booking a session?', 'No — this is a self-serve digital product for anyone, anywhere. If you want hands-on styling help, book a free consultation instead.'],
      ['What does it cost?', '$40, one-time. No subscription, no hidden extras.']
    ],
    cta: { label: 'Start Your Analysis — $40', href: 'color-style-analysis.html' },
    meta: 'Instant results · One-time payment · No account needed'
  },
  {
    live: false, /* set to true (or delete this line) once the Stripe link is in */
    slug: 'wardrobe-detox-guide',
    name: 'The Wardrobe Detox Guide',
    tag: 'Digital · Guide',
    price: '$19.99', priceNote: 'one-time',
    previews: [],
    short: 'Tips and tricks to declutter your closet efficiently, yours to keep and reuse anytime.',
    headline: 'Declutter your closet, <em>efficiently</em>',
    lead: 'The Wardrobe Detox Guide is HerStyleVault’s tips-and-tricks method for decluttering your closet, written so you can use it again every season.',
    includes: ['A clear method for decluttering your closet efficiently', 'Tips and tricks you can reuse anytime', 'A digital guide that is yours to keep'],
    steps: [
      ['Purchase', 'Check out once. No subscription.'],
      ['Download', 'Your guide is available to download right away.'],
      ['Detox at your pace', 'Work through your closet whenever suits you.']
    ],
    faqs: [
      ['Is this included with a package?', 'Yes. Full digital access is included with The Vault Edit and The Full Reveal.'],
      ['Is this the same as The Wardrobe Detox service?', 'No. The service is in person, where I declutter and reorganize your closet with you. The guide is the do-it-yourself version.'],
      ['Is it a physical product?', 'No. It is a digital guide, delivered instantly.']
    ],
    cta: { label: 'Get The Wardrobe Detox Guide — $19.99', href: 'STRIPE_LINK_HERE' },
    meta: 'Instant access · One-time payment'
  }
];

function liveDigitals(){ return DIGITALS.filter(function(d){ return d.live !== false; }); }

function digitalCard(p){
  return '<div class="vd-card"><div class="vd-tag">' + p.tag + '</div><h3 class="card-title">' + p.name + '</h3>' +
    '<p style="font-size:14px;color:var(--ink-soft);line-height:1.7;margin:0;">' + p.short + '</p>' +
    '<div class="price">' + p.price + ' <span>' + p.priceNote + '</span></div>' +
    '<a class="btn btn-secondary" href="digital.html#' + p.slug + '" style="align-self:flex-start;">Learn More →</a></div>';
}
