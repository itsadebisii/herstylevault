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
     eyebrow      optional small label above the title instead of the category (e.g. 'Wardrobe Detox Bundle')
     coverImage   optional 4:5 image path. Without it, a styled editorial cover is generated.
     coverTone    optional 'stone' (Cool Stone) | 'noir' (Bordeaux Noir). Default: reports=stone, guides=noir
     coverSub     optional small line printed on the generated cover
     price, priceNote, short (keep to ~2 lines), headline (may use <em>), lead
     soonNote, soonCta  optional, for status 'coming-soon': a line shown instead of the price, and a {label, href} button (e.g. mailto)
     pick         true = the page opens with no option chosen (shows a "choose one" state). chooseOnPage: the shop card's chooser links to the page with that option picked.
     options[]    optional tiers on one product page (tiers on one page). Each can override: label, badge, price, priceNote, soonNote, includes, cta,
                  and its own cover: coverName, coverSub, coverTone, coverImage. The cover changes when the visitor picks an option.
     includes[]   What's Inside bullets
     steps[]      How It Works: [title, text] pairs (2 to 4 work best)
     trust[]      Why It's Different: [title, text] pairs;  trustTitle optional heading (may use <em>)
     faqs[]       [question, answer] pairs
     previews[]   optional Sneak Peek pages, portrait ~4:5: {src, alt, locked}. Shown after the cover in the flipper.
     cta          {label, href}      meta  'Instant delivery · One-time payment' (split on ' · ')
   Anything optional can be left out and its section simply won't render. */
/* The three style reports read their prices, names and links from tiers.js (load it before this file). */
function HSV_TIERS_T(k){ return (typeof HSV_TIERS !== 'undefined') ? HSV_TIERS.get(k) : { blurb: '' }; }
function HSV_TIERS_LIVE(k){ return (typeof HSV_TIERS !== 'undefined') ? HSV_TIERS.live(k) : false; }
function HSV_TIERS_MONEY(k){ return (typeof HSV_TIERS !== 'undefined') ? HSV_TIERS.money(k) : ''; }
var DIGITALS = [
  {
    slug: 'signature-style-report',
    seoName: 'Personal Style Report', seoTitle: 'Personal Style Reports: Color, Body Shape & Style | HerStyleVault', seoDesc: 'Choose your personal style report: a 10-page color report ({$starter}), a 15-page color and body shape report with a closet plan ({$blueprint}), or the full 21-page Signature Style Report ({$signature}). Your color season, palette, outfit formulas and live shop links, built from your answers.',
    name: 'Personal Style Reports',
    eyebrow: 'Style Reports',
    category: 'reports', status: 'live',
    pick: true, /* the page opens with no report chosen. Picking one swaps in that report's cover, sample pages, price and details. */
    coverName: 'Your Style Report', coverSub: 'Choose yours below',
    coverImage: 'images/digitals/report-cover-choose.jpg', /* the three covers together, shown before a report is picked */
    cardCover: 'images/digitals/report-cover-choose.jpg',
    buyLabel: 'Choose Your Report',
    chooseOnPage: true, /* the shop card's "which one?" list opens the details page with that report picked, instead of going straight to checkout */
    short: "A personal style report built from your answers: your color season on a wheel around your face, and, in the bigger ones, your body shape, outfit formulas and live shop links. Choose from three.",
    headline: 'Your style report, <em>built around you</em>',
    lead: "Pick the report that fits what you need. All three start with your color season and a palette arranged around your face. The bigger ones add your body shape, a closet plan and your style persona. Choose one below to see what is inside, the sample pages and the price.",
    faqs: [
      ['Which report should I choose?', 'The Starter (10 pages, 12 questions) is color only: your season, palette, shades to avoid, hair, makeup and nail tones, and outfit formulas. The Blueprint (15 pages, 20 questions) adds your body shape, what to wear for it, a starter capsule and a closet audit. The Signature (21 pages, 26 questions) is everything, with your style persona, fabrics and patterns, outfit recipes and a shopping and fit guide.'],
      ['Is this the same as booking a session?', 'No. These are self-serve digital reports for anyone, anywhere. If you want hands-on styling help, book a free consultation instead.'],
      ['How do I get my report?', 'It opens on screen as soon as it is ready, and one tap sends the PDF to the email you checked out with.']
    ],
    options: [
      {
        key: 'starter', label: 'Starter', badge: '10 pages', blurb: HSV_TIERS_T('starter').blurb,
        name: 'Starter Style Report', seoName: 'Starter Style Report',
        status: HSV_TIERS_LIVE('starter') ? '' : 'coming-soon', soonNote: 'Opens very soon.',
        coverImage: 'images/digitals/report-cover-starter.jpg',
        price: HSV_TIERS_MONEY('starter'), priceNote: 'one-time',
        headline: 'Your <em>colors</em>, and outfit ideas to start with',
        lead: "A 10-page color report built from 12 quick questions and an optional photo. You get your color season and a palette arranged around your face, the shades to avoid, how to wear your colors, hair, makeup and nail tones, and outfit formulas for the occasions you choose. It is the report that is included with The Unlock package.",
        previews: [
          {src:'images/digitals/preview-starter-1.jpg', alt:'Sample report page: your palette of power neutrals, signature colors and accents, with your metal tone'},
          {src:'images/digitals/preview-starter-2.jpg', alt:'Sample report page: your color type, your coloring at a glance, and your face at the center of a color wheel built from your palette'},
          {src:'images/digitals/preview-starter-3.jpg', alt:'Sample report page: your palette tuned across ten skin shades, with your own shade marked'},
          {src:'images/digitals/preview-starter-4-locked.jpg', alt:'Blurred report page: hair, makeup and nail shades for your coloring', locked:true},
          {src:'images/digitals/preview-starter-5-locked.jpg', alt:'Blurred report page: outfit formulas for the occasions you choose', locked:true}
        ],
        includes: [
          'Your color season, picked from 12 seasons, and why it is yours',
          'Your palette: 4 power neutrals, 6 signature colors, your metal tone and accent colors, shown on a color wheel with your photo at the center',
          'Your palette tuned across the skin-shade range, with your shade marked',
          'How to put your colors to work: the 60-30-10 rule, color stories to wear and where each color goes',
          'Hair, makeup and nail shades for your coloring',
          'The colors to avoid, shown as swatches, plus your accessory colors',
          'Outfit formulas in your colors for the occasions you choose',
          'A table of contents with tap-to-jump page links',
          'This is the report that is included in The Unlock package',
          'A {$starter} credit toward any 1:1 package when you book within 12 months'
        ],
        steps: [
          ['Answer 12 Questions', 'About your natural coloring, with visual examples for the trickier ones, plus where you want your outfits to work. Plan on about five minutes.'],
          ['Add a Photo', "Optional. Your photo sits in the center of your color wheel and helps us read your coloring. Skip it if you'd rather not, and a monogram takes its place."],
          ['Get Your Report', 'Built from your answers in under a minute, then yours to read on screen. One tap emails you the PDF.']
        ],
        faqs: [
          ['What is in the Starter Style Report?', 'Ten pages, all about color: your season, your palette on a wheel, your palette across skin shades, how to wear your colors, hair, makeup and nail shades, the colors to avoid, and outfit formulas in your colors. It does not cover body shape.'],
          ['How long does it take?', 'About five minutes for 12 questions. Your report is built right after.'],
          ['Do I need to upload a photo?', "No, it's optional. It sharpens the read on your color, but the report works from your answers alone."],
          ['Is this included with a package?', 'Yes. The Starter Style Report is the report that comes with The Unlock package. If you book The Unlock, you receive it as part of it, and your {$starter} is credited toward your package if you booked within 12 months.'],
          ['What if I want body shape too?', 'Choose the Blueprint or the Signature report. They add your body shape and what to wear for it.'],
          ['What does it cost?', '{$starter}, one-time. No subscription, no hidden extras. If you book a 1:1 package within 12 months, the {$starter} comes off your final payment.']
        ],
        finePrint: 'Personalized recommendations based on your answers and optional photo, not an in-person color analysis.',
        cta: { label: 'Start Your Analysis', href: 'color-style-analysis.html?tier=starter' },
        meta: 'Instant results · One-time payment · No account needed'
      },
      {
        key: 'blueprint', label: 'Blueprint', badge: '15 pages', blurb: HSV_TIERS_T('blueprint').blurb,
        name: 'Blueprint Style Report', seoName: 'Blueprint Style Report',
        status: HSV_TIERS_LIVE('blueprint') ? '' : 'coming-soon', soonNote: 'Opens very soon.',
        coverImage: 'images/digitals/report-cover-blueprint.jpg',
        price: HSV_TIERS_MONEY('blueprint'), priceNote: 'one-time',
        headline: 'Your <em>colors</em>, your <em>shape</em> and a plan for your closet',
        lead: "A 15-page report built from 20 quick questions and an optional photo. You get your color season and palette, your body shape and what to wear for it, outfit formulas, a 12-piece starter capsule with shop links, and a closet audit checklist so you know what to keep, tailor and replace. It is the report that is included with The Vault Edit package.",
        previews: [
          {src:'images/digitals/preview-blueprint-1.jpg', alt:'Sample report page: your color type, your coloring at a glance, and your face at the center of a color wheel built from your palette'},
          {src:'images/digitals/preview-blueprint-2.jpg', alt:'Sample report page: your palette tuned across ten skin shades, with your own shade marked'},
          {src:'images/digitals/preview-blueprint-3.jpg', alt:'Sample report page: your body shape, why it fits you and your styling goal'},
          {src:'images/digitals/preview-blueprint-4.jpg', alt:'Sample report page: dress your shape, with tops, bottoms and dresses picked for your shape'},
          {src:'images/digitals/preview-blueprint-5-locked.jpg', alt:'Blurred report page: outfit formulas for the occasions you chose', locked:true},
          {src:'images/digitals/preview-blueprint-6-locked.jpg', alt:'Blurred report page: your starter capsule of 12 pieces with shop links', locked:true},
          {src:'images/digitals/preview-blueprint-7-locked.jpg', alt:'Blurred report page: your closet audit checklist', locked:true}
        ],
        includes: [
          'Your color season, picked from 12 seasons, and why it is yours',
          'Your palette: 4 power neutrals, 6 signature colors, your metal tone and accent colors, shown on a color wheel with your photo at the center',
          'Your palette tuned across the skin-shade range, with your shade marked',
          'How to put your colors to work: the 60-30-10 rule, color stories to wear and where each color goes',
          'Hair, makeup and nail shades for your coloring',
          'The colors to avoid, shown as swatches',
          'Your body shape, picked from 5 shapes, with your styling goal',
          'Dress Your Shape: tops, bottoms and dresses for your shape, with fit notes for your height and proportions',
          'Silhouettes and shopping, plus a fabric guide, with live store links matched to your price range',
          'Outfit formulas for the occasions you choose',
          'A starter capsule wardrobe: 12 pieces to buy first, in your colors, with shop links',
          'A closet audit checklist: what to keep, tailor and replace',
          'A table of contents with tap-to-jump page links',
          'This is the report that is included in The Vault Edit package',
          'A {$blueprint} credit toward any 1:1 package when you book within 12 months'
        ],
        steps: [
          ['Answer 20 Questions', 'About your natural coloring and your body, with visual examples for the trickier ones, plus where you want your outfits to work. Plan on about eight minutes.'],
          ['Add a Photo', "Optional. Your photo sits in the center of your color wheel and helps us read your coloring. Skip it if you'd rather not, and a monogram takes its place."],
          ['Get Your Report', 'Built from your answers in under a minute, then yours to read on screen. One tap emails you the PDF.']
        ],
        faqs: [
          ['What is in the Blueprint Style Report?', 'Fifteen pages: your color season and palette, your body shape and what to wear for it, silhouettes and shopping, outfit formulas, a 12-piece starter capsule and a closet audit checklist.'],
          ['How long does it take?', 'About eight minutes for 20 questions. Your report is built right after.'],
          ['Do I need to upload a photo?', "No, it's optional. It sharpens the read on your color and shape, but the report works from your answers alone."],
          ['Is this included with a package?', 'Yes. The Blueprint Style Report is the report that comes with The Vault Edit package. If you book The Vault Edit, you receive it as part of it, and your {$blueprint} is credited toward your package if you booked within 12 months.'],
          ['What is the difference from the Signature report?', 'The Signature report adds your style persona, fabrics and patterns, six outfit recipes, a shopping and fit guide and a Bring-to-your-session page, and asks a few optional questions about your life.'],
          ['What does it cost?', '{$blueprint}, one-time. No subscription, no hidden extras. If you book a 1:1 package within 12 months, the {$blueprint} comes off your final payment.']
        ],
        finePrint: 'Personalized recommendations based on your answers and optional photo, not an in-person color analysis.',
        cta: { label: 'Start Your Analysis', href: 'color-style-analysis.html?tier=blueprint' },
        meta: 'Instant results · One-time payment · No account needed'
      },
      {
        key: 'signature', label: 'Signature', badge: '21 pages', blurb: HSV_TIERS_T('signature').blurb,
        name: 'Signature Style Report', seoName: 'Signature Style Report',
        status: HSV_TIERS_LIVE('signature') ? '' : 'coming-soon', soonNote: 'Opens very soon.',
        coverImage: 'images/digitals/report-cover.jpg',
        price: HSV_TIERS_MONEY('signature'), priceNote: 'one-time',
        headline: 'Your <em>colors</em>, your <em>shape</em> and exactly what to wear, all in one detailed report',
        lead: "A 21-page personal style report built from your answers and your photo, using the same method I use with real clients. You get your color season and a palette arranged around your face, your body shape and what to wear for it, your style persona, outfit formulas, a 12-piece starter capsule with live shop links, six complete outfit recipes, fabrics and patterns picked for you, and a closet audit. It is the report that is included with The Full Reveal package.",
        previews: [
          {src:'images/digitals/preview-signature-1.jpg', alt:'Sample report page: your style at a glance, with your color season, body shape and style persona'},
          {src:'images/digitals/preview-signature-2.jpg', alt:'Sample report page: your style persona, 3-piece formula and full color palette'},
          {src:'images/digitals/preview-signature-3.jpg', alt:'Sample report page: your color type, your coloring at a glance, and your face at the center of a color wheel built from your palette'},
          {src:'images/digitals/preview-signature-4.jpg', alt:'Sample report page: your palette tuned across ten skin shades, with your own shade marked'},
          {src:'images/digitals/preview-signature-5.jpg', alt:'Sample report page: put your colors to work, with the 60-30-10 rule and color stories'},
          {src:'images/digitals/preview-signature-6.jpg', alt:'Sample report page: hair, makeup and nail shades for your coloring'},
          {src:'images/digitals/preview-signature-7.jpg', alt:'Sample report page: your body shape, why it fits you and your styling goal'},
          {src:'images/digitals/preview-signature-8.jpg', alt:'Sample report page: dress your shape, with tops, bottoms and dresses picked for your shape'},
          {src:'images/digitals/preview-signature-9.jpg', alt:'Sample report page: patterns you can wear, picked from your colors and your style'},
          {src:'images/digitals/preview-signature-10-locked.jpg', alt:'Blurred report page: your starter capsule of 12 pieces with shop links', locked:true},
          {src:'images/digitals/preview-signature-11-locked.jpg', alt:'Blurred report page: six complete outfit recipes', locked:true},
          {src:'images/digitals/preview-signature-12-locked.jpg', alt:'Blurred report page: your closet audit checklist', locked:true}
        ], /* sneak peek pages (portrait, sample client). Slide 1 is always the cover. */
        includes: [
          'Your color season, picked from 12 seasons, and why it is yours',
          'Your palette: 4 power neutrals, 6 signature colors, your metal tone and accent colors, shown on a color wheel with your photo at the center',
          'Your palette tuned across the skin-shade range, with your shade marked',
          'How to put your colors to work: the 60-30-10 rule, color stories to wear and where each color goes',
          'Outfit searches on Pinterest in your colors',
          'Hair, makeup and nail shades for your coloring',
          'The colors to avoid, shown as swatches',
          'Your body shape, picked from 5 shapes, with your styling goal',
          'Dress Your Shape: tops, bottoms and dresses for your shape, with fit notes for your height and proportions',
          'Your style persona, with a 3-piece signature formula and a rule you are allowed to break',
          'Outfit formulas for the occasions you chose',
          'A one-page style cheat sheet you can screenshot',
          'A starter capsule wardrobe: 12 pieces to buy first, in your colors, with shop links',
          'Six complete outfit recipes for the occasions you chose',
          'A shopping and fit guide, plus a closet audit checklist',
          'A Bring-to-your-session page with your style snapshot',
          'Fabrics and patterns picked from your answers, plus an accessory styling guide',
          'Live store links for your colors and cuts, matched to your price range',
          'A table of contents with tap-to-jump page links',
          'This is the same report that is included in The Full Reveal package',
          'A {$signature} credit toward any 1:1 package when you book within 12 months'
        ],
        steps: [
          ['Answer 26 Questions', "About your natural coloring and body, with visual examples for the trickier ones, so nothing's a guess. A few optional questions about your life, like work, climate and comfort, make it fit even better."],
          ['Add a Photo', "Optional. Your photo sits in the center of your color wheel and helps us read your coloring. Skip it if you'd rather not, and a monogram takes its place."],
          ['Get Your Report', 'Built from your answers in under a minute: your color season, body shape, and exactly what to wear. Read it on screen, and we email you the PDF.']
        ],
        trustTitle: 'Not a generic <em>quiz result</em>',
        trust: [
          ['Real styling data, not guesses', 'Your color season and body shape are identified using the same tested color and body-shape system HerStyleVault uses with in-person clients: 12 color seasons, 5 body shapes, real palettes and real styling rules.'],
          ['Written for you, not templated', 'A personalized digital report explaining exactly how your specific answers point to your result, including resolving any answers that seem to contradict each other, the way a real stylist would.']
        ],
        faqs: [
          ['How do I get my report?', 'It opens on screen as soon as it is ready, and one tap sends the PDF to the email you checked out with, so you can keep it.'],
          ['How long does it take?', 'You answer the quiz at your own pace. Your full 21-page report is built for you right after, and it is yours to keep.'],
          ['Do I need to upload a photo?', "No, it's optional. It sharpens the read on your color and shape, but the report works from your answers alone if you'd rather skip it."],
          ['Is this the same report as The Full Reveal?', 'Yes. The Signature Style Report is the same report that comes with The Full Reveal package. If you book The Full Reveal, you receive this report as part of it, and your {$signature} is credited toward your package if you booked within 12 months.'],
          ['Is this the same as booking a session?', 'No, this is a self-serve digital product for anyone, anywhere. If you want hands-on styling help, book a free consultation instead.'],
          ['What does it cost?', '{$signature}, one-time. No subscription, no hidden extras. If you book a 1:1 package within 12 months, the {$signature} comes off your final payment.']
        ],
        finePrint: 'Personalized recommendations based on your answers and optional photo, not an in-person color analysis.',
        cta: { label: 'Start Your Analysis', href: 'color-style-analysis.html?tier=signature' },
        meta: 'Instant results · One-time payment · No account needed'
      }
    ],
    steps: [
      ['Choose your report', 'The Starter, the Blueprint or the Signature.'],
      ['Answer the questions', 'Visual examples for the trickier ones, so nothing is a guess.'],
      ['Get your report', 'Built for you in under a minute, then emailed as a PDF.']
    ],
    finePrint: 'Personalized recommendations based on your answers and optional photo, not an in-person color analysis.',
    meta: 'Instant results · One-time payment · No account needed'
  },
  {
    slug: 'wardrobe-detox-bundle',
    seoName: 'The Wardrobe Detox Bundle', seoTitle: 'Wardrobe Detox Bundle: Guide & Checklist | HerStyleVault', seoDesc: 'Declutter your closet with the 11-page Wardrobe Detox Guide for $28.99. A calm, zone-by-zone method you can start today. One-page Checklist coming soon.',
    name: 'The Wardrobe Detox Bundle',
    eyebrow: 'Wardrobe Detox Bundle',
    cardCover: 'images/digitals/detox-bundle-cover.jpg', /* the cover shown on the shop cards before someone clicks in; the details page shows each option's own cover */
    category: 'guides', status: 'live',
    buyLabel: 'Buy Now', /* the card button; it opens a small "which one?" chooser built from options below */
    soonCta: { label: 'Be the First to Know', href: 'contact.html?topic=Digital%20products&note=Please%20let%20me%20know%20when%20the%20Wardrobe%20Detox%20Bundle%20updates%20are%20ready.' },
    short: 'Declutter your closet your way: the 11-page Guide for the full reset, or the one-page Checklist for a quick one.',
    headline: 'Reset your closet, <em>one zone at a time</em>',
    lead: 'The Wardrobe Detox Bundle is the calm, step-by-step method I use to clear a closet without the overwhelm. Choose the 11-page Guide for the full zone-by-zone reset, or the one-page Checklist when you want the quick version.',
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
          ['Is this included with a package?', 'The Full Reveal includes the whole Wardrobe Detox Bundle, the Guide and the Checklist. The Vault Edit includes the Checklist.'],
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
      ['Is this included with a package?', 'The Full Reveal includes the whole Wardrobe Detox Bundle, the Guide and the Checklist. The Vault Edit includes the Checklist.'],
      ['Is this the same as The Wardrobe Detox service?', 'No. The service is in person, where I declutter and reorganize your closet with you. The Bundle is the do-it-yourself version.'],
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
    soonCta: { label: 'Be the First to Know', href: 'contact.html?topic=Digital%20products&note=Please%20let%20me%20know%20when%20the%20coloring%20book%20is%20ready.' },
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

/* fill the {$starter} / {$blueprint} / {$signature} price tokens used in the report text */
(function fill(o){
  if (typeof o === 'string' || o == null || typeof HSV_TIERS === 'undefined') return;
  Object.keys(o).forEach(function(k){
    var v = o[k];
    if (typeof v === 'string') o[k] = v.replace(/\{\$(starter|blueprint|signature)\}/g, function(m, t){ return HSV_TIERS.money(t); });
    else if (v && typeof v === 'object') fill(v);
  });
})(DIGITALS);

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
  var cover = '<a class="vd-media" href="' + url + '" aria-label="Details: ' + digitalAttr(p.name) + '">' + digitalCover(p.pick ? p : (p.cardCover ? { coverImage: p.cardCover, name: p.name, category: p.category } : (opts ? v0 : p))) + '</a>';
  var prices = '', buy;
  if (opts) {
    buy = '<button type="button" class="btn btn-primary vd-buy" data-vd-choose aria-expanded="false">' + (p.buyLabel || 'Buy Now') + '</button>' +
      '<div class="vd-choose" hidden><p class="vd-choose-lab">Which one?</p>' + opts.map(function(o, i){
        var v = digitalView(p, i), nm = digitalAttr(v.name || o.label);
        var tiny = (p.chooseOnPage && o.blurb) ? '<small>' + digitalAttr(o.blurb) + '</small>' : '';
        return (digitalSoon(v) && !p.chooseOnPage)
          ? '<span class="vd-opt is-soon"><b>' + nm + '</b><i>' + (v.price ? v.price + ' \u00b7 ' : '') + 'Coming soon</i></span>'
          : '<a class="vd-opt" href="' + (p.chooseOnPage ? url + '?opt=' + o.key : v.cta.href) + '"><b>' + nm + '</b><i>' + (v.price || '') + ' \u2192</i>' + tiny + '</a>';
      }).join('') + '</div>';
  } else {
    var soon = digitalSoon(p);
    prices = p.price ? '<p class="vd-prices"><span class="price">' + p.price + (p.priceNote ? ' <small>' + p.priceNote + '</small>' : '') + '</span></p>' : '';
    buy = soon ? '<span class="btn btn-primary is-disabled" aria-disabled="true">Coming Soon</span>'
               : '<a class="btn btn-primary vd-buy" href="' + (p.cta && p.cta.href) + '">' + (p.buyLabel || (p.cta && p.cta.label) || 'Buy Now') + '</a>';
  }
  return '<div class="vd-card">' + cover + '<div class="vd-body"><div class="vd-toprow"><p class="vd-eyebrow">' + (p.eyebrow || digitalCat(p).eyebrow) + '</p><a class="vd-peek" href="' + url + '">See more <i aria-hidden="true">\u2192</i></a></div>' +
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

/* Cut-off descriptions open when tapped (shared helper in site.js, no label) */
function digitalMore(root){ if (window.hsvTapMore) window.hsvTapMore(root); }
