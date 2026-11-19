/* ===== Package and service detail pages =====
   Each offer below gets its own page at offer.html#slug. Edit the words here and the page updates. */
var OFFERS = [
  {
    slug: 'the-unlock', kind: 'package', name: 'The Unlock', tag: 'Private Styling Package',
    from: '$225', fromNote: '/ package', meta: '3 sessions + free first-time consultation',
    short: '3 sessions, 5 complete outfit builds',
    headline: 'Find your style identity, <em>unlocked</em>',
    lead: 'Strip it back, find your style identity, and build five complete outfits around you.',
    includes: ['5 complete outfit builds', 'Color & body analysis', 'Personal style profile', 'Personalized shopping list with links', 'Your style guide, delivered 1–2 weeks after your final session'],
    steps: [
      ['Free consultation (first-time clients)', 'Fill out the intake form and book your free 30-minute call on Google Meet or Zoom. No commitment.'],
      ['Three sessions', 'Up to 1 hour each, in person or virtual. We review your analysis and first 3 outfits, then your revised looks plus outfits 4 and 5, then sign off on everything.'],
      ['Your style guide', 'Delivered 1–2 weeks after your final session.']
    ],
    faqs: [
      ['Is it virtual or in person?', 'Either. Virtual sessions use Google Meet or Zoom. In person means we meet face to face and I can work with the pieces you own to build your outfits. A full closet audit and three shopping trips are part of The Full Reveal, and one guided shopping trip can be added to The Unlock or The Vault Edit. Travel is free within 1 hour of Boston or Southern NH, and $25 per in-person session for 1 to 2.5 hours.'],
      ['Do I need a lot of clothes?', 'Not at all. Whether you have a full closet or just a few pieces, I work with what you have and identify exactly what is missing.'],
      ['Can you include pieces I already own?', 'Yes. Before your first outfit session, send photos of 10 to 15 pieces you love or want worked into your outfits. I build with them wherever they fit and tell you what is missing. A full closet audit is part of The Full Reveal, and The Wardrobe Detox is available as a separate in-person service.'],
      ['How long does it take?', 'Your first session sits at least 1 week after you book, sessions are at least 1 week apart, and everything wraps within 60 days of your deposit.'],
      ['Can I add a shopping trip?', 'Yes, in person only. One Guided Shopping Trip is available as an add-on for $100 (up to 2 hours). Shop retail, thrift or a mix, tied to your shopping list and budget. Travel fees apply. Three shopping trips are included in The Full Reveal.'],
      ['Do I buy the pieces myself?', 'Yes. You get a shopping list with links and you purchase the pieces yourself.']
    ],
    cta: { label: 'Get Started', href: 'book.html' }, ctaNote: 'Every first-time client begins with a free consultation. No commitment.'
  },
  {
    slug: 'the-vault-edit', kind: 'package', name: 'The Vault Edit', tag: 'Private Styling Package · Most Popular',
    from: '$400', fromNote: '/ package', meta: '4 sessions + free first-time consultation',
    short: '4 sessions, 7 complete outfit builds',
    headline: 'Build a wardrobe with <em>purpose</em>',
    lead: 'Seven complete outfit builds, a personalized shopping list, and everything you need to keep your closet working for you.',
    includes: ['7 complete outfit builds', 'The Wardrobe Detox Guide (11-page PDF)', 'Personalized shopping list with links', 'Your style guide PDF, delivered 1–2 weeks after your final session'],
    steps: [
      ['Free consultation (first-time clients)', 'Fill out the intake form and book your free 30-minute call on Google Meet or Zoom. No commitment.'],
      ['Four sessions', 'In person or virtual. Session 1 is up to 2 hours: your analysis and first 3 outfits. Then up to 1 hour each: revised looks plus new outfits, and a final recap and sign-off.'],
      ['Your style guide', 'Delivered 1–2 weeks after your final session.']
    ],
    faqs: [
      ['Is it virtual or in person?', 'Either. Virtual sessions use Google Meet or Zoom. In person means we meet face to face and I can work with the pieces you own to build your outfits. A full closet audit and three shopping trips are part of The Full Reveal, and one guided shopping trip can be added to The Unlock or The Vault Edit. Travel is free within 1 hour of Boston or Southern NH, and $25 per in-person session for 1 to 2.5 hours.'],
      ['Can you include pieces I already own?', 'Yes. Before your first outfit session, send photos of 10 to 15 pieces you love or want worked into your outfits. I build with them wherever they fit and tell you what is missing. A full closet audit is part of The Full Reveal, and The Wardrobe Detox is available as a separate in-person service.'],
      ['Can I add a shopping trip?', 'Yes, in person only. One Guided Shopping Trip is available as an add-on for $100 (up to 2 hours). Shop retail, thrift or a mix, tied to your shopping list and budget. Travel fees apply. Three shopping trips are included in The Full Reveal.'],
      ['Do I buy the pieces myself?', 'Yes. You get a shopping list with links and you purchase the pieces yourself.'],
      ['What is The Wardrobe Detox Guide?', 'My step-by-step method for decluttering your closet, as an 11-page PDF you keep. It is included with this package.']
    ],
    cta: { label: 'Get Started', href: 'book.html' }, ctaNote: 'Every first-time client begins with a free consultation. No commitment.'
  },
  {
    slug: 'the-full-reveal', kind: 'package', name: 'The Full Reveal', tag: 'Private Styling Package · Premium',
    from: '$725', fromNote: '/ package', meta: '5 sessions + free first-time consultation',
    short: '5 sessions, 10 outfits, in-person shopping trips',
    headline: 'The full overhaul, <em>in person</em>',
    lead: 'A closet audit, three real shopping trips together, and ten complete outfit builds, ending in a try-on reveal of every final look.',
    includes: ['10 complete outfit builds', 'Full closet audit, done in person', 'Three in-person shopping trips', 'The Wardrobe Detox Guide (11-page PDF)', 'Follow-up check-in call included', 'Your style guide PDF, delivered 1–2 weeks after your final session', 'Before and after photos and short video, part of this package'],
    steps: [
      ['Free consultation (first-time clients)', 'Fill out the intake form and book your free 30-minute call on Google Meet or Zoom. No commitment.'],
      ['Five sessions', 'Session 1 (up to 2 hours): the breakdown, closet audit and planning. Sessions 2 to 4 (up to 2–3 hours each): in-person shopping trips. Session 5 (up to 1 hour): The Reveal, trying on every final look together.'],
      ['Your style guide', 'Delivered 1–2 weeks after your final session.']
    ],
    faqs: [
      ['Who pays for the clothes?', 'You do. You pay each retailer directly at checkout. I never charge or hold payment on your behalf.'],
      ['Why are photos and video required?', 'Before and after photos and short video document your progress and help build your style guide. Using them for marketing is always optional and separate.'],
      ['Is it in person?', 'Yes, every session is in person: the closet audit, the shopping trips and The Reveal. Travel is free within 1 hour of Boston or Southern NH, and $25 per in-person session for 1 to 2.5 hours.']
    ],
    cta: { label: 'Get Started', href: 'book.html' }, ctaNote: 'Every first-time client begins with a free consultation. No commitment.'
  },
  {
    slug: 'occasion-edit', kind: 'service', name: 'Occasion Edit', tag: 'À La Carte Service', formKey: 'occasion',
    from: '$55', fromNote: 'starting at', meta: 'Delivered by email as a PDF',
    short: 'One event, every detail handled',
    headline: 'One event, <em>every detail</em> handled',
    lead: "Tell me what it's for and walk in knowing exactly what to wear.",
    tiers: [
      ['Quick Fit', '$55', '1 outfit · 3-5 day turnaround', 'One occasion, one look, fast.'],
      ['Standard', '$160', '4 outfits · 2 week lead time', 'One occasion, fully covered.'],
      ['Max', '$260', '7 outfits · 2 week lead time', 'Juggling more than one occasion at once, such as a trip or a few events back to back.']
    ],
    includes: ['Complete outfits built for your occasion, size and budget', 'A shopping list with links to every piece', 'Delivered by email as a finished PDF'],
    steps: [
      ['Choose your tier', 'Pick the number of outfits you need.'],
      ['Fill out the form and pay', 'Tell me about the occasion, your sizes and your inspiration. Full payment is due before work begins.'],
      ['Receive your PDF', 'Your outfits arrive by email within the lead time for your tier.']
    ],
    faqs: [
      ['Do I need a consultation or a package?', 'No. Services book directly, for new and returning clients.'],
      ['Can it cover more than one occasion?', 'Yes. Tell me everything coming up on the form. The Max tier is built for it.'],
      ['Do I buy the pieces myself?', 'Yes, from the links I send. I never purchase on your behalf.']
    ]
  },
  {
    slug: 'the-ensemble', kind: 'service', name: 'The Ensemble', tag: 'À La Carte Service', formKey: 'ensemble',
    from: '$95', fromNote: 'per person, starting at', meta: 'Delivered by email as a PDF',
    short: 'Getting dressed together, without the group-chat chaos',
    headline: 'Getting dressed together, <em>without the chaos</em>',
    lead: 'Everyone gets their own fit, pulled around one shared vibe.',
    tiers: [
      ['Per Person', '$110', 'per person · 2 week lead time', 'A trip, a shoot, a group event: everyone styled individually.'],
      ['3+ People', '$95', 'per person · 2 week lead time', 'Group rate for 3 or more.']
    ],
    includes: ['A look for each person, built around one shared vibe', 'A shopping list with links to every piece', 'Delivered by email as a finished PDF'],
    steps: [
      ['Tell me about your group', 'Fill out the form with the occasion and each person’s sizes and preferences.'],
      ['Pay once', 'One person books and pays for the whole group, before work begins.'],
      ['Receive your PDF', 'Everyone’s looks arrive by email within 2 weeks.']
    ],
    faqs: [
      ['How many people can I include?', 'The form takes up to 8 people.'],
      ['Do we need a consultation?', 'No. The Ensemble books directly.'],
      ['Do we buy the pieces ourselves?', 'Yes, from the links I send. I never purchase on your behalf.']
    ]
  },
  {
    slug: 'the-mini-collection', kind: 'service', name: 'The Mini Collection', tag: 'À La Carte Service', formKey: 'mini',
    from: '$240', fromNote: 'starting at', meta: 'Delivered by email as a PDF',
    short: 'A handful of pieces that do the work of a full closet',
    headline: 'A handful of pieces, <em>a full closet</em>',
    lead: "Everything mixes, nothing's wasted.",
    tiers: [
      ['Standard', '$240', '6-8 pieces · 3 week lead time', 'A tight, mix-and-match collection, fully sourced and built around you. Every piece new.'],
      ['Max', '$380', '10-12 pieces · 4 week lead time', 'A more complete collection with more combinations. Every piece newly sourced for you.']
    ],
    includes: ['Every piece newly sourced for you and built to mix and match', 'A shopping list with links to every piece', 'Delivered by email as a finished PDF'],
    steps: [
      ['Choose your tier', 'Pick the number of pieces.'],
      ['Fill out the form and pay', 'Tell me where you will wear it, your colors, sizes and budget. Full payment is due before work begins.'],
      ['Receive your PDF', 'Your collection arrives by email within the lead time for your tier.']
    ],
    faqs: [
      ['Does it use clothes I already own?', 'No. Every piece is new. To work with your existing closet, see The Wardrobe Detox or a Private Styling Package.'],
      ['Do I need a consultation or a package?', 'No. Services book directly.'],
      ['Do I buy the pieces myself?', 'Yes, from the links I send. I never purchase on your behalf.']
    ]
  },
  {
    slug: 'the-wardrobe-detox', kind: 'service', name: 'The Wardrobe Detox', tag: 'À La Carte Service · In Person', formKey: 'detox',
    from: '$225', fromNote: 'starting at', meta: 'In person · book 1 week ahead',
    short: 'A full declutter and reorganize, done in one sitting',
    headline: "Let's see what you're <em>working with</em>",
    lead: 'A full declutter and reorganize of your closet, done in person in one sitting.',
    tiers: [
      ['Half Day', '$225', 'up to 3 hours · in person · book 1 week ahead', 'A focused closet, done in one visit.'],
      ['Full Day', '$450', 'up to 6 hours · in person · book 1 week ahead', 'A bigger closet or a full wardrobe overhaul.']
    ],
    includes: ['A full declutter and reorganize of your closet', 'Done in person, in one sitting', 'Booked directly: no consultation or package needed'],
    steps: [
      ['Choose your day', 'Half day or full day.'],
      ['Fill out the form and pay', 'Tell me about your closet and pick three dates at least 1 week out. Full payment is due before the visit.'],
      ['We detox your closet', 'I come to you and we work through it together.']
    ],
    faqs: [
      ['Where is it available?', 'In person, free of travel fees within 1 hour of Boston or Southern NH. A $25 travel fee applies for 1 to 2.5 hours. Farther than that, email me first.'],
      ['Is this the same as The Wardrobe Detox Guide?', 'No. The service is in person with me. The Guide is the do-it-yourself version, and it is included with The Vault Edit and The Full Reveal.'],
      ['How far ahead should I book?', 'At least 1 week ahead.']
    ]
  }
];
