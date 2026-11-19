/* Builds one real page per package and service (package-*.html, service-*.html) from offer.html + offers.js,
   so each offer has its own link, its own title and description for Google, a share image,
   Service data for search results, and readable text in the HTML (H1, intro, what's included, FAQs and
   links to the other offers) before any script runs.
   Run after you edit offers.js:
       node scripts/build_offer_pages.js && python3 scripts/seo_share.py                      */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const SITE = 'https://herstylevault.com';
const ctx = { window: {}, document: { addEventListener() {} } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'offers.js'), 'utf8') + '\nthis.__O = OFFERS; this.__url = offerUrl;', ctx);
const tpl = fs.readFileSync(path.join(root, 'offer.html'), 'utf8');
const plain = (t) => String(t || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const attr = (t) => plain(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const money = (t) => String(t || '').replace(/[^0-9.]/g, '');
const today = new Date().toISOString().slice(0, 10);
const SEO = {
  'the-unlock': ['The Unlock: 3-Session Styling Package | HerStyleVault', 'The Unlock is a 3-session personal styling package with a color and body analysis, 5 outfit builds and a shopping list. $225, in person or virtual.'],
  'the-vault-edit': ['The Vault Edit: 4-Session Styling Package | HerStyleVault', 'The Vault Edit is a 4-session personal styling package with 7 outfit builds, a shopping list and the Wardrobe Detox Guide. $400, in person or virtual.'],
  'the-full-reveal': ['The Full Reveal: In-Person Styling Package | HerStyleVault', 'The Full Reveal is a 5-session in-person styling package: closet audit, 3 shopping trips and 10 outfit builds near Boston and Southern NH. $725.'],
  'occasion-edit': ['Occasion Edit: Outfits for Your Event | HerStyleVault', 'Occasion Edit gives you 1 to 7 complete outfits for a wedding, trip or event, built around your style and emailed as a finished PDF. From $55.'],
  'the-ensemble': ['The Ensemble: Group Styling Service | HerStyleVault', 'The Ensemble styles a group for one trip or event: everyone gets their own outfits around one shared vibe, delivered as a PDF. From $95 per person.'],
  'the-mini-collection': ['The Mini Collection: Capsule Wardrobe | HerStyleVault', 'The Mini Collection is a custom capsule of 6 to 12 new pieces that mix and match, sourced for you and sent as a PDF with shopping links. From $240.'],
  'the-wardrobe-detox': ['The Wardrobe Detox: Closet Declutter | HerStyleVault', 'The Wardrobe Detox is an in-person closet declutter and reorganization near Boston and Southern NH, half day or full day, in one visit. From $225.']
};
const urls = [];
ctx.__O.forEach((o) => {
  const file = ctx.__url(o), url = SITE + '/' + file;
  const [title, desc] = SEO[o.slug] || [plain(o.name) + ' | HerStyleVault', plain(o.lead)];
  const img = SITE + '/images/share/' + file.replace(/\.html$/, '') + '.jpg';
  const isSvc = o.kind === 'service';
  const prices = (o.tiers && o.tiers.length ? o.tiers.map((t) => money(t[1])) : [money(o.from)]).filter(Boolean).map(parseFloat);
  const offers = (o.tiers && o.tiers.length ? o.tiers : [[plain(o.name), o.from]]).map((t) => ({
    '@type': 'Offer', name: plain(o.name) + (o.tiers && o.tiers.length ? ' (' + plain(t[0]) + ')' : ''), price: money(t[1]), priceCurrency: 'USD', url,
    availability: 'https://schema.org/InStock' }));
  const ld = { '@context': 'https://schema.org', '@type': 'Service', name: plain(o.name), serviceType: isSvc ? 'Personal styling service' : 'Personal styling package',
    description: plain(o.lead), url, image: img, provider: { '@id': SITE + '/#business' },
    areaServed: [{ '@type': 'AdministrativeArea', name: 'Greater Boston, MA' }, { '@type': 'AdministrativeArea', name: 'Northern Massachusetts' }, { '@type': 'AdministrativeArea', name: 'Southern New Hampshire' }, { '@type': 'Country', name: 'United States', description: 'Virtual' }] };
  ld.offers = offers.length === 1 ? offers[0] : { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: Math.min.apply(null, prices).toFixed(2), highPrice: Math.max.apply(null, prices).toFixed(2), offerCount: offers.length, offers };
  const listUrl = isSvc ? 'services.html' : 'packages.html', listName = isSvc ? 'À La Carte Services' : 'Private Styling Packages';
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: listName, item: SITE + '/' + listUrl },
    { '@type': 'ListItem', position: 3, name: plain(o.name), item: url }] };
  const faqLd = o.faqs && o.faqs.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: o.faqs.map((f) => ({ '@type': 'Question', name: plain(f[0]), acceptedAnswer: { '@type': 'Answer', text: plain(f[1]) } })) } : null;
  const li = (a) => (a || []).map((x) => '<li>' + x + '</li>').join('');
  const nameH = plain(o.name).replace(/&/g, '&amp;');
  const others = ctx.__O.filter((x) => x !== o && x.kind === o.kind);
  const stat = '<section class="band wrap offer-hero tone-' + (o.tone || 'cream') + '" style="padding-bottom:clamp(2rem,4vw,3rem);">' +
    '<p class="crumb"><a href="' + listUrl + '">' + listName.replace('À', '&Agrave;') + '</a> / ' + nameH + '</p>' +
    '<h1 class="page-title"><span class="h1-kw">' + nameH + ': ' + plain(o.tag).replace(/&/g, '&amp;') + '</span>' + o.headline + '</h1>' +
    '<p class="sub">' + o.lead + '</p>' +
    '<p class="price">' + (isSvc ? 'From ' : '') + o.from + ' <small>' + (o.fromNote || '') + '</small></p>' +
    '<h2>What’s included</h2><ul>' + li(o.includes) + '</ul>' +
    '<h2>How it works</h2><ol>' + (o.steps || []).map((s) => '<li><b>' + s[0] + '.</b> ' + s[1] + '</li>').join('') + '</ol>' +
    '<h2>Good to know</h2>' + (o.faqs || []).map((f) => '<p><b>' + f[0] + '</b><br>' + f[1] + '</p>').join('') +
    '</section><section class="band stone dg-more wrap"><h2>You may also like</h2><ul>' +
    others.map((x) => '<li><a href="' + ctx.__url(x) + '">' + plain(x.name) + '</a></li>').join('') +
    '</ul><p><a href="' + listUrl + '">See all</a></p></section>';
  const ldTags = [ld, crumbs].concat(faqLd ? [faqLd] : []).map((j) => '<script type="application/ld+json">' + JSON.stringify(j) + '</script>').join('\n');
  const h = tpl
    .replace(/<meta name="robots" content="noindex, follow">\n?/, '')
    .replace(/<title>.*?<\/title>/, '<title>' + attr(title) + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + attr(desc) + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + attr(title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + attr(desc) + '">')
    .replace(/<meta property="og:image" content="[^"]*">/, '<meta property="og:image" content="' + img + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + url + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">')
    .replace('</head>', (o.coverImage ? '<link rel="preload" as="image" href="' + o.coverImage + '" fetchpriority="high">\n' : '') + ldTags + '\n</head>')
    .replace('<main id="offerMain"></main>', '<main id="offerMain">' + stat + '</main>')
    .replace('<script src="offers.js"></script>', '<script>window.HSV_SLUG = ' + JSON.stringify(o.slug) + ';</script>\n<script src="offers.js"></script>');
  fs.writeFileSync(path.join(root, file), h);
  urls.push(url);
  console.log('wrote', file, '| title', title.length, '| desc', desc.length);
});
/* sitemap: offer pages are rewritten each run */
let sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
sm = sm.replace(/\s*<url>\s*<loc>https:\/\/herstylevault\.com\/(package|service)-[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
const add = urls.map((u) => '\n  <url>\n    <loc>' + u + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>').join('');
sm = sm.replace('</urlset>', add + '\n</urlset>');
fs.writeFileSync(path.join(root, 'sitemap.xml'), sm);
