/* ===== Vault Digitals catalog =====
   To add a digital: add one object to DIGITALS. The Vault Digitals shop grid and each
   product page (digital-your-slug.html) build themselves from this list. No HTML edits.

   Fields
     slug         unique, lowercase, hyphens (becomes digital-slug.html)        REQUIRED
     name         product title                                                  REQUIRED
     category     'reports' | 'guides' | 'windown'  (drives filter tabs, eyebrow, cover tone)
     status       'live' (default) | 'coming-soon' (card shows a badge, no link, no buy button)
                  | 'hidden' (kept in this file but not shown anywhere)
     cardCover    optional cover image used on the shop cards only (the details page keeps each option's own cover)
     eyebrow      optional small label above the title instead of the category (e.g. 'Wardrobe Detox Series')
     coverImage   optional 4:5 image path. Without it, a styled editorial cover is generated.
     coverTone    optional 'stone' (Cool Stone) | 'noir' (Bordeaux Noir). Default: reports=stone, guides=noir
     coverSub     optional small line printed on the generated cover
     price, priceNote, short (keep to ~2 lines), headline (may use <em>), lead
     soonNote, soonCta  optional, for status 'coming-soon': a line shown instead of the price, and a {label, href} button (e.g. mailto)
     options[]    optional tiers on one product page (tiers on one page). Each can override: label, badge, price, priceNote, soonNote, includes, cta,
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
    seoName: 'Signature Style Report', seoTitle: 'Signature Style Report: Color & Body Shape | HerStyleVault', seoDesc: 'Get your color season, body shape and signature style in one custom Signature Style Report. Answer 23 questions, add a photo and get your PDF by email.',
    name: 'Signature Style Report',
    category: 'reports', status: 'live',
    coverSub: 'Color · Shape · Style',
    price: '$40', priceNote: 'one-time',
    coverImage: 'images/digitals/report-cover.jpg',
    previews: [
      {src:'images/digitals/report-page-2.jpg', alt:'Sample report page: your style persona, 3-piece formula and full color palette'},
      {src:'images/digitals/report-page-4.jpg', alt:'Sample report page: your body shape, why it fits you and your styling goal'},
      {src:'images/digitals/report-b3.jpg', alt:'Blurred report page: your color type and accessory guide', locked:true},
      {src:'images/digitals/report-b5.jpg', alt:'Blurred report page: silhouettes, shopping links and fabrics', locked:true}
    ], /* sneak peek pages (portrait, sample client). Slide 1 is always the cover. */
    short: "23 quick questions and an optional photo give you a custom style blueprint: your color season, body shape, and what to wear.",
    headline: 'Find your <em>colors</em> and your <em>shape</em> in about 5 minutes',
    lead: "The Signature Style Report is a custom digital style blueprint built from my professional styling method, the same one I use with real clients. No appointment, no waiting.",
    includes: [
      'Your color season, picked from 12 seasons, and why it is yours',
      'Your palette: 4 power neutrals, 6 signature colors, your metal tone and accent colors',
      'The colors to avoid, shown as swatches',
      'Your body shape, picked from 5 shapes, with your styling goal',
      'The silhouettes, bottoms and necklines that flatter you, plus what to step back from',
      'Your style persona, with a 3-piece signature formula and a rule you are allowed to break',
      'The best fabrics for you, and an accessory styling guide',
      'Live store links for your colors and cuts, matched to your price range',
      'A $40 credit toward any 1:1 package when you book within 45 days'
    ],
    steps: [
      ['Answer 23 Questions', "About your natural coloring and body, with visual examples for the trickier ones, so nothing's a guess."],
      ['Add a Photo', "Optional, but it sharpens your color and shape read. Skip it if you'd rather not."],
      ['Get Your Report', 'Built from your answers in under a minute: your color season, body shape, and exactly what to wear. Read it on screen, and we email you the PDF.']
    ],
    trustTitle: 'Not a generic <em>quiz result</em>',
    trust: [
      ['Real styling data, not guesses', 'Your color season and body shape are identified using the same tested color and body-shape system HerStyleVault uses with in-person clients: 12 color seasons, 5 body shapes, real palettes and real styling rules.'],
      ['Written for you, not templated', 'A personalized digital report explaining exactly how your specific answers point to your result, including resolving any answers that seem to contradict each other, the way a real stylist would.']
    ],
    faqs: [
      ['How do I get my report?', 'It opens on screen as soon as it is ready, and one tap sends the PDF to the email you checked out with, so you can keep it.'],
      ['How long does it take?', 'About 5 minutes for the quiz itself. Your report generates in under a minute after checkout.'],
      ['Do I need to upload a photo?', "No, it's optional. It sharpens the read on your color and shape, but the report works from your answers alone if you'd rather skip it."],
      ['Is this the same as booking a session?', 'No, this is a self-serve digital product for anyone, anywhere. If you want hands-on styling help, book a free consultation instead.'],
      ['What does it cost?', '$40, one-time. No subscription, no hidden extras. If you book a 1:1 package within 45 days, the $40 comes off your final payment.']
    ],
    buyLabel: 'Start Style Analysis',
    cta: { label: 'Start Your Analysis', href: 'color-style-analysis.html' },
    meta: 'Instant results · One-time payment · No account needed'
  },
  {
    slug: 'wardrobe-detox-series',
    seoName: 'Wardrobe Detox Guide & Checklist', seoTitle: 'Wardrobe Detox Guide & Checklist | HerStyleVault', seoDesc: 'Declutter your closet with the 11-page Wardrobe Detox Guide for $28.99. A calm, zone-by-zone method you can start today. One-page Checklist coming soon.',
    name: 'The Wardrobe Detox Series',
    eyebrow: 'Wardrobe Detox Series',
    cardCover: 'images/digitals/detox-series-cover.jpg', /* the cover shown on the shop cards before someone clicks in; the details page shows each option's own cover */
    category: 'guides', status: 'live',
    buyLabel: 'Reset My Closet', /* the card button; it opens a small "which one?" chooser built from options below */
    soonCta: { label: 'Be the First to Know', href: 'mailto:hello@herstylevault.com?subject=Wardrobe%20Detox%20Series%20updates' },
    short: 'Declutter your closet your way: the 11-page Guide for the full reset, or the one-page Checklist for a quick one.',
    headline: 'Reset your closet, <em>one zone at a time</em>',
    lead: 'The Wardrobe Detox Series is the calm, step-by-step method I use to clear a closet without the overwhelm. Choose the 11-page Guide for the full zone-by-zone reset, or the one-page Checklist when you want the quick version.',
    /* options = the tiers. Each one carries its own name, cover, sneak-peek pages, price and Stripe link.
       Status 'coming-soon' (or a link that is still STRIPE_LINK_HERE) keeps that option from being bought. */
    options: [
      {
        key: 'guide', label: 'Guide', badge: '11 pages',
        name: 'The Wardrobe Detox Guide',
        headline: 'Reset your closet, <em>one zone at a time</em>',
        lead: 'The Wardrobe Detox Guide is the calm, step-by-step method I use to clear a closet without the overwhelm. Work through your closet, drawers, shoes and purses one zone at a time, with checklists to tick off as you go.',
        coverImage: 'images/digitals/detox-guide-cover.jpg',
        previews: [
          {src:'images/digitals/detox-guide-p5.jpg', alt:'Sample guide page: the Closet Reset visual guide to grouping by category and color flow'},
          {src:'images/digitals/detox-guide-p4.jpg', alt:'Sample guide page: the Closet Reset Checklist and HerStyleVault favorite hangers'},
          {src:'images/digitals/detox-guide-p9.jpg', alt:'Sample guide page: the Wardrobe Gap Builder, a printable list of missing pieces'},
          {src:'images/digitals/detox-guide-b8.jpg', alt:'Blurred guide page: the Selling Workflow and platform cheat sheet', locked:true},
          {src:'images/digitals/detox-guide-b2.jpg', alt:'Blurred guide page: How It Works', locked:true}
        ], /* sneak peek pages; slide 1 is always the cover */
        price: '$28.99', priceNote: 'one-time',
        steps: [
          ['Check out once', 'No account and no subscription.'],
          ['Download right away', 'Your 11-page PDF is ready the moment you pay. It works on your phone, tablet or computer, and prints cleanly.'],
          ['Work at your pace', 'Do every zone in one day, or take one zone a day. About 45 minutes per zone, or a full afternoon for everything.']
        ],
        faqs: [
          ['What is in the Guide?', 'Eleven pages: the zone-by-zone method for your closet, drawers, shoes and purses, the Keep, Sell, Donate system, the Golden Rule for letting go, the Closet Reset Checklist and visual guide, the Flat-Roll Method, hanger and storage picks, a selling workflow, a Wardrobe Gap Builder and habits to keep it clutter-free.'],
          ['How long does it take?', 'About 45 minutes per zone, or a full afternoon to do everything. You can spread it over several days.'],
          ['How do I get it?', 'Right after you pay, you land on a page with a download button. Keep that page’s link and you can download it again anytime. If you ever lose it, email me.'],
          ['What format is it?', 'A PDF. Use it on your phone or tablet, or print it and tick the checklists off by hand.'],
          ['Do I need to buy anything?', 'No. The hanger and storage picks are optional suggestions.'],
          ['Is this included with a package?', 'The Full Reveal includes the whole Wardrobe Detox Series, the Guide and the Checklist. The Vault Edit includes the Checklist.'],
          ['Is this the same as The Wardrobe Detox service?', 'No. The service is in person, where I declutter and reorganize your closet with you. The Guide is the do-it-yourself version.'],
          ['What is the difference between the Guide and the Checklist?', 'The Guide teaches the whole method, with the reasoning, storage picks and a selling plan. The Checklist is a single page you tick off while you work.'],
          ['Can I get a refund?', 'Digital products are final sale because they arrive instantly. If the file won’t open, email me and I’ll fix it.']
        ],
        includes: [
          'A zone-by-zone method for your closet, drawers, shoes and purses',
          'The Keep, Sell, Donate system, with a bag labeling guide and a three-question quick check',
          'HerStyleVault’s Golden Rule for letting go, so you stop second-guessing',
          'The Closet Reset Checklist and a visual guide to grouping by category and color',
          'The Flat-Roll Method for drawers you can see into at a glance',
          'Simple fixes for floor clutter: shoe, bag and doorway drop-zone systems',
          'Hanger and storage picks I actually recommend, with links',
          'A selling workflow and platform cheat sheet for what you’re ready to let go',
          'A printable Wardrobe Gap Builder, so you only shop for what completes your outfits',
          'Simple weekly and yearly habits to keep it clutter-free'
        ],
        /* After you create the $28.99 Payment Link in Stripe, paste it below in place of STRIPE_LINK_HERE.
           In Stripe, set the Payment Link to redirect after payment to:
           https://herstylevault.com/guide-download.html?session_id={CHECKOUT_SESSION_ID} */
        cta: { label: 'Buy the Guide', href: 'https://buy.stripe.com/dRmcN6fAh3uq3rCaWZ7kc01' },
        meta: 'Instant PDF download · One-time payment · 11 pages'
      },
      {
        key: 'checklist', label: 'Checklist', badge: '1 page',
        name: 'The Wardrobe Detox Checklist',
        headline: 'Detox your closet, <em>in one sitting</em>',
        lead: 'The Wardrobe Detox Checklist is one page you print and tick off while you work: three zones, the Keep, Sell, Donate check, and a scoreboard for your wins. Use it on its own, or right alongside the Guide.',
        status: 'coming-soon',
        coverSub: 'Quick · Printable · Reset', coverTone: 'stone',
        previews: [], /* add a blurred sneak peek here later: {src:'images/digitals/…jpg', alt:'…', locked:true} */
        soonNote: 'Coming soon: the one-page Checklist for a quick reset.',
        steps: [
          ['Check out once', 'No account and no subscription.'],
          ['Download and print', 'Your one-page PDF is ready the moment you pay. Print it on regular letter paper, or use it on your phone or tablet.'],
          ['Tick it off as you go', 'Work through the three zones, use the Keep, Sell, Donate check, and fill in your scoreboard as you finish.']
        ],
        faqs: [
          ['What is the Checklist?', 'One page you print and tick off while you work: three zones with the key steps for each, the Keep, Sell, Donate quick check, a scoreboard for what you keep, sell and donate, and a short list for the pieces you are missing.'],
          ['Do I need the Guide too?', 'No. The Checklist works on its own. If you want the full method, with the reasoning, storage picks and a selling plan, the Guide goes deeper.'],
          ['How long does it take?', 'It is built for one sitting. Plan on about 45 minutes per zone, or a full afternoon to do all three.'],
          ['Can I use it more than once?', 'Yes. Print as many copies as you like for yourself and reset your closet again every season.'],
          ['How do I get it?', 'Right after you pay, you land on a page with a download button. Keep that page’s link and you can download it again anytime. If you ever lose it, email me.'],
          ['Is this included with a package?', 'Yes. The Vault Edit and The Full Reveal both include the Checklist, and The Full Reveal includes the Guide too. You can also buy the Checklist on its own.'],
          ['Is this the same as The Wardrobe Detox service?', 'No. The service is in person, where I declutter and reorganize your closet with you. The Checklist is the do-it-yourself version.'],
          ['Can I get a refund?', 'Digital products are final sale because they arrive instantly. If the file won’t open, email me and I’ll fix it.']
        ],
        includes: ['One printable page you tick off as you go', 'Three zones with the key steps for each, in order', 'The Keep, Sell, Donate quick check', 'A scoreboard for what you keep, sell and donate', 'A short list for the pieces you are missing, so you only buy what completes your outfits', 'Works on its own or right alongside the Guide'],
        cta: { label: 'Buy the Checklist', href: 'STRIPE_LINK_HERE' },
        meta: 'Instant PDF download · One-time payment · 1 page'
      }
    ],
    steps: [
      ['Choose your version', 'The 11-page Guide or the one-page Checklist.'],
      ['Check out once', 'No account and no subscription. Your PDF is ready the moment you pay.'],
      ['Work at your pace', 'Do every zone in one day, or take one zone a day. About 45 minutes per zone, or a full afternoon for everything.']
    ],
    faqs: [
      ['What is the difference between the Guide and the Checklist?', 'The Guide is the full 11-page method with the reasoning, checklists, storage picks and a selling plan. The Checklist is the one-page quick version.'],
      ['How do I get it?', 'Right after you pay, you land on a page with a download button. Keep that page’s link and you can download it again anytime. If you ever lose it, email me.'],
      ['What format is it?', 'A PDF. Use it on your phone or tablet, or print it and tick the checklists off by hand.'],
      ['Do I need to buy anything?', 'No. The hanger and storage picks are optional suggestions.'],
      ['Is this included with a package?', 'The Full Reveal includes the whole Wardrobe Detox Series, the Guide and the Checklist. The Vault Edit includes the Checklist.'],
      ['Is this the same as The Wardrobe Detox service?', 'No. The service is in person, where I declutter and reorganize your closet with you. The Series is the do-it-yourself version.'],
      ['Can I get a refund?', 'Digital products are final sale because they arrive instantly. If the file won’t open, email me and I’ll fix it.']
    ],
    meta: 'Instant PDF download · One-time payment'
  }
  ,{
    slug: 'coloring-book',
    seoName: 'The HerStyleVault Fashion & Cocktail Coloring Book', seoTitle: 'Fashion & Cocktail Coloring Book | HerStyleVault', seoDesc: 'A 48-page fashion and cocktail coloring book for slow evenings: seven classic drinks, style illustrations and cocktail lore. Digital or paper, coming soon.',
    name: 'The HerStyleVault Coloring Book',
    eyebrow: 'Wind Down · Edition 001',
    category: 'windown', status: 'coming-soon', coverTone: 'stone',
    soonNote: 'Coming soon',
    soonCta: { label: 'Be the First to Know', href: 'mailto:hello@herstylevault.com?subject=Coloring%20Book%20updates' },
    coverImage: 'images/digitals/coloring-book-cover.jpg',
    previews: [
      {src:'images/digitals/cb-olive-martini.jpg', alt:'Sample coloring page: The Olive Martini scene'},
      {src:'images/digitals/cb-heels.jpg', alt:'Sample coloring page: a pair of statement heels'},
      {src:'images/digitals/cb-margarita.jpg', alt:'Sample coloring page: The Margarita scene'},
      {src:'images/digitals/cb-handbag.jpg', alt:'Sample coloring page: a handbag with an olive martini'},
      {src:'images/digitals/cb-b1.jpg', alt:'Blurred coloring page from the book', locked:true},
      {src:'images/digitals/cb-b2.jpg', alt:'Blurred coloring page from the book', locked:true}
    ],
    short: 'A 48-page cocktail and fashion coloring book for slow evenings: seven classic drinks, style illustrations and fun cocktail lore.',
    headline: 'Pour a drink, grab your markers, <em>romanticize your night in</em>',
    lead: 'A chic escape where classic cocktail culture meets high-fashion aesthetics. Each chapter pairs an iconic drink with curated style illustrations and a little cocktail history, made for slow evenings and creative self-care.',
    includes: [
      '48 pages of hand-drawn illustrations to color',
      'Seven chapters, one classic cocktail each: Olive Martini, Mai Tai, Margarita, Gin & Tonic, Strawberry Daiquiri, Mojito and Tequila Cosmo',
      'Cocktail scenes, plus heels, handbags, jewelry and accessories to color',
      'An origin story page for every drink, with fun cocktail lore',
      'A PDF you can print or color on a tablet'
    ],
    steps: [
      ['Get your PDF', 'Your coloring book is ready to download as soon as you check out.'],
      ['Print it or open it on a tablet', 'Whichever way you like to color.'],
      ['Pour a drink and color', 'Take it slow, one chapter at a time. Share your pages and tag @herstylevault.official.']
    ],
    faqs: [
      ['When is it available?', 'Soon. Email me and I will let you know the moment it is ready.'],
      ['Do I have to print it?', 'No. It is a PDF, so you can print it at home or color it on a tablet.'],
      ['Is it for personal use?', 'Yes. It is for personal use only, not for resale, reproduction or distribution.'],
      ['Will there be more editions?', 'This is Edition 001. Ask me to keep you posted on what comes next.']
    ],
    buyLabel: 'Choose Your Copy',
    options: [
      {
        key: 'digital', label: 'Digital', name: 'Coloring Book: Digital PDF', badge: 'PDF \u00b7 48 pages', price: '$14.99', priceNote: 'one-time',
        status: 'coming-soon', soonNote: 'Coming soon',
        cta: { label: 'Coming Soon', href: 'STRIPE_LINK_HERE' },
        meta: 'Instant delivery \u00b7 One-time payment'
      },
      {
        key: 'paper', label: 'Paper Copy', name: 'Coloring Book: Paper Copy', badge: 'Softcover', price: '$29.99', priceNote: 'free US shipping',
        coverImage: 'images/digitals/coloring-book-paperback.jpg', coverName: 'Paper copy mockup',
        status: 'coming-soon', soonNote: 'Coming soon',
        headline: 'Pour a drink, grab your markers, <em>and hold it in your hands</em>',
        lead: 'The same 48-page cocktail and fashion coloring book as a softcover paper copy, printed and shipped to your door. A cozy treat for yourself, or a gift for a friend who loves a slow evening.',
        includes: [
          'The full 48-page coloring book, printed as a softcover paper copy',
          'Seven chapters, one classic cocktail each, with an origin story for every drink',
          'Cocktail scenes, plus heels, handbags, jewelry and accessories to color',
          'Shipped to your door'
        ],
        steps: [
          ['Order your copy', 'Pick the paper copy and check out.'],
          ['We print and ship it', 'Your book is printed and mailed to you. Delivery details will be shared when ordering opens.'],
          ['Pour a drink and color', 'Take it slow, one chapter at a time. Share your pages and tag @herstylevault.official.']
        ],
        faqs: [
          ['When can I order the paper copy?', 'Soon. Email me and I will let you know the moment it is ready.'],
          ['What is the difference between the paper copy and the hard copy?', 'The paper copy is a softcover book. The hard copy is a hardcover with a sturdier, longer-lasting cover. The pages inside are the same.'],
          ['Where will it ship?', 'Shipping details, including where it ships and how long it takes, will be shared when ordering opens.'],
          ['Is it a good gift?', 'Yes. It is a fun, cozy gift for anyone who likes cocktails, fashion or a slow night in.'],
          ['Is it only for personal use?', 'Yes. It is for personal use only, not for resale, reproduction or distribution.']
        ],
        cta: { label: 'Coming Soon', href: 'STRIPE_LINK_HERE' },
        meta: 'Printed and shipped to you'
      },
      {
        key: 'hard', label: 'Hard Copy', name: 'Coloring Book: Hard Copy', badge: 'Hardcover', price: '$44.99', priceNote: 'free US shipping',
        coverImage: 'images/digitals/coloring-book-hardback.jpg', coverName: 'Hard copy mockup',
        status: 'coming-soon', soonNote: 'Coming soon',
        headline: 'Pour a drink, grab your markers, <em>and keep it forever</em>',
        lead: 'The same 48-page cocktail and fashion coloring book as a sturdy hardcover, printed and shipped to your door. A keepsake to color, display and give as a gift.',
        includes: [
          'The full 48-page coloring book, printed as a hardcover',
          'A sturdier, longer-lasting cover than the paper copy',
          'Seven chapters, one classic cocktail each, with an origin story for every drink',
          'Cocktail scenes, plus heels, handbags, jewelry and accessories to color',
          'Shipped to your door'
        ],
        steps: [
          ['Order your copy', 'Pick the hard copy and check out.'],
          ['We print and ship it', 'Your book is printed and mailed to you. Delivery details will be shared when ordering opens.'],
          ['Pour a drink and color', 'Take it slow, one chapter at a time. Share your pages and tag @herstylevault.official.']
        ],
        faqs: [
          ['When can I order the hard copy?', 'Soon. Email me and I will let you know the moment it is ready.'],
          ['What is the difference between the paper copy and the hard copy?', 'The paper copy is a softcover book. The hard copy is a hardcover with a sturdier, longer-lasting cover. The pages inside are the same.'],
          ['Where will it ship?', 'Shipping details, including where it ships and how long it takes, will be shared when ordering opens.'],
          ['Is it only for personal use?', 'Yes. It is for personal use only, not for resale, reproduction or distribution.']
        ],
        cta: { label: 'Coming Soon', href: 'STRIPE_LINK_HERE' },
        meta: 'Printed and shipped to you'
      },
      {
        key: 'bundle', label: 'Digital + Paper', name: 'Coloring Book: Digital + Paper Copy', badge: 'Best value', price: '$34.99', priceNote: 'free US shipping',
        coverImage: 'images/digitals/coloring-book-paperback.jpg', coverName: 'Paper copy mockup',
        status: 'coming-soon', soonNote: 'Coming soon',
        headline: 'Start coloring today, <em>and get the book in the mail</em>',
        lead: 'Get the digital PDF to start coloring right away, plus the softcover paper copy shipped to your door. You save $10 compared with buying both.',
        includes: [
          'The digital PDF, ready to use as soon as you check out',
          'The softcover paper copy, printed and shipped to you',
          'The same 48 pages in both: seven cocktail chapters with an origin story for every drink',
          'Cocktail scenes, plus heels, handbags, jewelry and accessories to color'
        ],
        steps: [
          ['Order the bundle', 'Pick Digital + Paper and check out.'],
          ['Start coloring right away', 'Your PDF is ready to download as soon as you check out, so you can start while your book is on its way.'],
          ['Your paper copy arrives', 'Your book is printed and mailed to you. Delivery details will be shared when ordering opens.']
        ],
        faqs: [
          ['When can I order the bundle?', 'Soon. Email me and I will let you know the moment it is ready.'],
          ['Do I get the PDF right away?', 'Yes. The digital PDF is ready as soon as you check out. The paper copy ships separately.'],
          ['How much do I save?', 'The bundle is $34.99. Buying the digital PDF ($14.99) and the paper copy ($29.99) separately is $44.98, so you save about $10.'],
          ['Is it only for personal use?', 'Yes. It is for personal use only, not for resale, reproduction or distribution.']
        ],
        cta: { label: 'Coming Soon', href: 'STRIPE_LINK_HERE' },
        meta: 'PDF instantly, book shipped to you'
      }
    ],
    cta: { label: 'Coming Soon', href: 'STRIPE_LINK_HERE' },
    meta: 'Instant delivery · One-time payment'
  }
];

/* ---------- Catalog helpers ---------- */
var DIGITAL_CATEGORIES = {
  reports: { label: 'Style Reports', eyebrow: 'Style Report' },
  guides:  { label: 'Guides',        eyebrow: 'Guide' },
  windown: { label: 'Wind Down',     eyebrow: 'Wind Down' }
};
/* each product has its own page (digital-<slug>.html) so it can be found and shared; run scripts/build_product_pages.js after editing this file */
function digitalUrl(p){ return 'digital-' + p.slug + '.html'; }
function digitalCat(p){ return DIGITAL_CATEGORIES[p.category] || { label: 'Digital', eyebrow: 'Digital' }; }
function digitalSoon(p){ return p.status === 'coming-soon' || !!(p.cta && /STRIPE_LINK_HERE/.test(p.cta.href || '')); }
/* a product merged with one of its options (price, cover, previews, link and status of that option) */
function digitalView(p, i){
  var v = {}, o = (p.options && p.options[i || 0]) || {};
  Object.keys(p).forEach(function(k){ v[k] = p[k]; });
  Object.keys(o).forEach(function(k){ if (o[k] !== '' && o[k] != null) v[k] = o[k]; });
  if (p.options && !o.status) v.status = p.status;
  return v;
}
/* everything that should appear on the site (live + coming soon); legacy live:false and status:'hidden' are skipped */
function visibleDigitals(){ return DIGITALS.filter(function(d){ return d.live !== false && d.status !== 'hidden'; }); }
var liveDigitals = visibleDigitals; /* older name, kept so nothing breaks */
function digitalAttr(t){ return String(t == null ? '' : t).replace(/<[^>]*>/g,'').replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

/* 4:5 cover: the product's own coverImage, or a generated editorial mockup (hairline frame, Cormorant type) */
function digitalCover(p, first){
  if (p.coverImage) return '<div class="vd-cover has-img"><img src="' + digitalAttr(p.coverImage) + '" alt="' + digitalAttr(p.coverName || p.name) + ' cover" ' + (first ? 'fetchpriority="high"' : 'loading="lazy"') + '></div>';
  var tone = p.coverTone || (p.category === 'guides' ? 'noir' : 'stone');
  return '<div class="vd-cover tone-' + (tone === 'noir' ? 'noir' : 'stone') + '" role="img" aria-label="' + digitalAttr(p.coverName || p.name) + ' cover">' +
    '<span class="vc-eyebrow">' + digitalCat(p).eyebrow + '</span>' +
    '<span class="vc-mid"><strong class="vc-title">' + (p.coverName || p.name) + '</strong><i class="vc-rule"></i>' + (p.coverSub ? '<span class="vc-sub">' + p.coverSub + '</span>' : '') + '</span>' +
    '<span class="vc-brand">HerStyleVault</span></div>';
}

/* shop-grid card: cover (opens the details page), title, short text, prices, a buy button and a small Details link.
   A product with options shows one button that opens a "which one?" chooser. */
function digitalCard(p){
  var url = digitalUrl(p), opts = p.options, v0 = digitalView(p, 0);
  var cover = '<a class="vd-media" href="' + url + '" aria-label="Details: ' + digitalAttr(p.name) + '">' + digitalCover(p.cardCover ? { coverImage: p.cardCover, name: p.name, category: p.category } : (opts ? v0 : p)) + '</a>';
  var prices = '', buy;
  if (opts) {
    buy = '<button type="button" class="btn btn-primary vd-buy" data-vd-choose aria-expanded="false">' + (p.buyLabel || 'Buy Now') + '</button>' +
      '<div class="vd-choose" hidden><p class="vd-choose-lab">Which one?</p>' + opts.map(function(o, i){
        var v = digitalView(p, i), nm = digitalAttr(v.name || o.label);
        return digitalSoon(v)
          ? '<span class="vd-opt is-soon"><b>' + nm + '</b><i>' + (v.price ? v.price + ' \u00b7 ' : '') + 'Coming soon</i></span>'
          : '<a class="vd-opt" href="' + v.cta.href + '"><b>' + nm + '</b><i>' + (v.price || '') + ' \u2192</i></a>';
      }).join('') + '</div>';
  } else {
    var soon = digitalSoon(p);
    prices = p.price ? '<p class="vd-prices"><span class="price">' + p.price + (p.priceNote ? ' <small>' + p.priceNote + '</small>' : '') + '</span></p>' : '';
    buy = soon ? '<span class="btn btn-primary is-disabled" aria-disabled="true">Coming Soon</span>'
               : '<a class="btn btn-primary vd-buy" href="' + (p.cta && p.cta.href) + '">' + (p.buyLabel || (p.cta && p.cta.label) || 'Buy Now') + '</a>';
  }
  return '<div class="vd-card">' + cover + '<div class="vd-body"><div class="vd-toprow"><p class="vd-eyebrow">' + (p.eyebrow || digitalCat(p).eyebrow) + '</p><a class="vd-peek" href="' + url + '">Details <i aria-hidden="true">\u2192</i></a></div>' +
    '<h3 class="card-title">' + p.name + '</h3><p class="vd-desc">' + (p.short || '') + '</p>' + prices +
    '<div class="vd-actions">' + buy + '</div></div></div>';
}
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-vd-choose]'); if (!b) return;
  var panel = b.parentNode.querySelector('.vd-choose'); if (!panel) return;
  var open = panel.hasAttribute('hidden'); if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
  b.setAttribute('aria-expanded', open ? 'true' : 'false');
});

/* compact card for "More From Vault Digitals": small cover, title, price, hover "Discover" */
function digitalMini(p){
  var soon = p.options ? digitalSoon(digitalView(p, 0)) && digitalSoon(digitalView(p, 1)) : digitalSoon(p);
  var inner = '<div class="vd-thumb">' + digitalCover(p.cardCover ? { coverImage: p.cardCover, name: p.name, category: p.category } : (p.options ? digitalView(p, 0) : p)) + '<span class="vd-hover" aria-hidden="true">Discover</span></div>' +
    '<div class="vd-mini-body"><p class="vd-eyebrow">' + (p.eyebrow || digitalCat(p).eyebrow) + '</p><h3 class="card-title">' + p.name + '</h3>' +
    '<p class="vd-mini-meta">' + (digitalView(p, 0).price ? '<span class="price">' + digitalView(p, 0).price + '</span>' : '') + (soon ? '<span class="vd-badge">Coming Soon</span>' : '<span class="vd-go">Discover \u2192</span>') + '</p></div>';
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
