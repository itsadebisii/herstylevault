"""One-time SEO pass for the hand-written pages: titles, descriptions, H1 keyword line, image alt text,
LocalBusiness / ProfessionalService schema, noindex on templates. Safe to re-run."""
import re, json, html, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

META = {
 'index.html': (None, "Personal stylist serving Boston, Northern MA, Southern NH and virtually nationwide. Color analysis, closet edits and outfit building. Book a free call."),
 'about.html': (None, "Meet Adebisi, the Boston-area personal stylist behind HerStyleVault. Learn her approach to color, body shape and building outfits that fit your real life."),
 'book.html': ("Book a Personal Stylist | HerStyleVault", "Book a free personal styling consultation or a returning-client session with HerStyleVault. In person near Boston and Southern NH, or virtual anywhere."),
 'faq.html': ("Personal Styling FAQ: Pricing & Sessions | HerStyleVault", "Answers about personal styling packages, pricing, virtual and in-person sessions, travel, deposits and what is included with HerStyleVault. Read first."),
 'how-it-works.html': ("How Personal Styling Works | HerStyleVault", "See how HerStyleVault works: a free consultation, outfit-building sessions in person or virtual, and a finished style guide with a shopping list."),
 'lookbook.html': ("Personal Styling Lookbook | HerStyleVault", "Browse sample HerStyleVault Edit boards: complete outfits for real occasions, built around color and body shape by a Boston and Southern NH stylist."),
 'policies.html': ("Booking, Cancellation & Refund Policies | HerStyleVault", "HerStyleVault policies: deposits, payment, cancellations, rescheduling, refunds, travel fees, digital products and privacy. Please read before you book."),
 'vault-digitals.html': ("Vault Digitals: Style Reports & Guides | HerStyleVault", "Shop Vault Digitals: the Signature Style Report, Wardrobe Detox Bundle, plus a fashion and cocktail coloring book. Self-serve styling."),
 'what-to-expect.html': ("What to Expect: Personal Styling Packages | HerStyleVault", "What to expect from a HerStyleVault styling package: every session, how to prepare and what you take home. The Unlock, The Vault Edit and The Full Reveal."),
 'what-to-expect-services.html': ("What to Expect: À La Carte Styling Services | HerStyleVault", "How à la carte styling works: pick Occasion Edit, The Ensemble or Mini Collection and get a finished PDF by email, or book an in-person Wardrobe Detox."),
 'packages.html': (None, "Compare The Unlock, The Vault Edit and The Full Reveal: private personal styling packages from $225 with outfit builds, shopping lists and a style guide."),
 'services.html': (None, "À la carte personal styling: Occasion Edit, The Ensemble, Mini Collection and Wardrobe Detox. Pay upfront, send your inspo and get your outfits by email."),
 'shop.html': (None, "Shop HerStyleVault: private styling packages from $225, à la carte services, and Vault Digitals like the Signature Style Report. Start where it suits you."),
 'locations.html': (None, "Personal stylist in Boston, Northern MA and Southern NH, plus virtual styling nationwide. See travel areas and fees and how to book a free consultation."),
 'offer.html': (None, "Personal styling packages and services from HerStyleVault: what is included, how it works and pricing for each. In person near Boston or virtual."),
 'color-style-analysis.html': ("Start Your Signature Style Report Quiz | HerStyleVault", "Answer 23 quick questions about your coloring and body to get your personalized Signature Style Report with your color season and body shape."),
}
# the line that goes inside the page's H1 (replaces the small label above it)
H1KW = {
 'index.html': "Personal Stylist in Boston, MA &amp; Southern NH",
 'faq.html': "Personal Styling FAQ",
 'how-it-works.html': "How Personal Styling Works",
 'lookbook.html': "Personal Styling Lookbook",
 'policies.html': "Styling Booking Policies",
 'vault-digitals.html': "Style Reports, Guides &amp; Digitals",
 'services.html': "À La Carte Personal Styling Services",
 'shop.html': "Personal Styling Packages, Services &amp; Digitals",
 'book.html': "Book a Personal Stylist",
 'what-to-expect.html': "What to Expect: Styling Packages",
 'what-to-expect-services.html': "What to Expect: À La Carte Services",
}
ALT = {
 'images/digitals/report-page-2.jpg': "Signature Style Report sample page: style persona, signature formula and color palette",
 'images/digitals/report-page-4.jpg': "Signature Style Report sample page: body shape, why it fits you and your styling goal",
}
SITE = 'https://herstylevault.com'
SOCIAL = ["https://instagram.com/herstylevault.official", "https://pinterest.com/HerStyleVault"]
BUSINESS = {
 "@context": "https://schema.org",
 "@type": ["ProfessionalService", "LocalBusiness"],
 "@id": SITE + "/#business",
 "name": "HerStyleVault",
 "description": "Personal stylist and wardrobe consultant for women in Boston, Northern MA and Southern NH, with virtual styling nationwide. Color analysis, body shape styling, outfit building and closet edits.",
 "url": SITE, "email": "hello@herstylevault.com",
 "image": SITE + "/images/Hero_Closet.jpg",
 "priceRange": "$28.99-$725",
 "founder": {"@type": "Person", "name": "Adebisi"},
 "address": {"@type": "PostalAddress", "addressRegion": "MA", "addressCountry": "US"},
 "areaServed": [
   {"@type": "AdministrativeArea", "name": "Greater Boston, MA"},
   {"@type": "AdministrativeArea", "name": "Northern Massachusetts"},
   {"@type": "AdministrativeArea", "name": "Southern New Hampshire"},
   {"@type": "Country", "name": "United States", "description": "Virtual styling available nationwide"}],
 "serviceType": ["Personal styling", "Color analysis", "Body shape styling", "Wardrobe consulting", "Closet declutter and organization", "Outfit building"],
 "knowsAbout": ["Personal styling", "Seasonal color analysis", "Capsule wardrobes", "Wardrobe declutter"],
 "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Styling packages and services", "itemListElement": [
   {"@type": "Offer", "name": "The Unlock (3 sessions, 5 outfit builds)", "price": "225", "priceCurrency": "USD", "url": SITE + "/packages.html"},
   {"@type": "Offer", "name": "The Vault Edit (4 sessions, 7 outfit builds)", "price": "400", "priceCurrency": "USD", "url": SITE + "/packages.html"},
   {"@type": "Offer", "name": "The Full Reveal (5 sessions, 10 outfit builds, in person)", "price": "725", "priceCurrency": "USD", "url": SITE + "/packages.html"},
   {"@type": "Offer", "name": "Signature Style Report", "price": "40", "priceCurrency": "USD", "url": SITE + "/digital-signature-style-report.html"}]},
 "sameAs": SOCIAL,
}
def esc(s): return html.escape(s, quote=True)
def put_ld(h, obj):
    block = '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + '</script>'
    h2 = re.sub(r'<script type="application/ld\+json">\s*\{[^<]*?"@type":\s*"LocalBusiness"[\s\S]*?</script>', block, h, count=1)
    if h2 == h and '"ProfessionalService"' not in h:
        h2 = h.replace('</head>', block + '\n</head>', 1)
    return h2
for f in sorted(os.listdir('.')):
    if not f.endswith('.html'): continue
    h = open(f, encoding='utf8').read(); o = h
    if f in META:
        t, d = META[f]
        if t:
            h = re.sub(r'<title>.*?</title>', '<title>' + esc(t) + '</title>', h, count=1, flags=re.S)
            h = re.sub(r'(<meta property="og:title" content=")[^"]*(")', r'\g<1>' + esc(t) + r'\2', h, count=1)
        if re.search(r'<meta name="description"', h):
            h = re.sub(r'(<meta name="description" content=")[^"]*(")', r'\g<1>' + esc(d) + r'\2', h, count=1)
        else:
            h = h.replace('</title>', '</title>\n<meta name="description" content="' + esc(d) + '">', 1)
        h = re.sub(r'(<meta property="og:description" content=")[^"]*(")', r'\g<1>' + esc(d) + r'\2', h, count=1)
    if f in H1KW:
        pat = re.compile(r'<p class="eyebrow( center)?">.*?</p>\s*<h1 class="page-title( center)?">(.*?)</h1>', re.S)
        m = pat.search(h)
        if m:
            h = pat.sub(lambda m: '<h1 class="page-title' + (m.group(2) or '') + '"><span class="h1-kw">' + H1KW[f] + '</span>' + m.group(3) + '</h1>', h, count=1)
        else:
            print('H1 pattern not found:', f)
    for src, alt in ALT.items():
        h = h.replace('src="%s" alt=""' % src, 'src="%s" alt="%s"' % (src, esc(alt)))
    if f in ('index.html', 'locations.html'):
        ld = dict(BUSINESS)
        if f == 'locations.html':
            ld['description'] = "Personal stylist serving Greater Boston, Northern Massachusetts and Southern New Hampshire in person, and clients anywhere in the US virtually. Free first consultation."
        h = put_ld(h, ld)
    if f in ('digital.html', 'offer.html') and 'name="robots"' not in h:
        h = h.replace('</title>', '</title>\n<meta name="robots" content="noindex, follow">', 1)
    if h != o:
        open(f, 'w', encoding='utf8').write(h); print('updated', f)
# theme.css: the keyword line inside each H1
css = open('theme.css', encoding='utf8').read()
if '.h1-kw' not in css:
    css += "\n/* keyword line inside the page H1 (styled like the small label it replaced) */\nh1.page-title .h1-kw{display:block;font-family:var(--font-body);font-weight:500;font-size:11px;line-height:1.4;text-transform:uppercase;letter-spacing:0.15em;color:var(--accent);margin:0 0 0.9rem;}\n"
    open('theme.css', 'w', encoding='utf8').write(css); print('updated theme.css')
