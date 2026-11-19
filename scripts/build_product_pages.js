/* Builds one real page per Vault Digital (digital-<slug>.html) from digital.html + digitals.js,
   so each product has its own link, its own title and description for Google, a share image,
   Product data for search results, and real text in the HTML (H1, intro, what's inside, FAQs and
   "You may also like" links) that Google can read before any script runs.
   Run after you add or edit anything in digitals.js:
       node scripts/build_product_pages.js                                                    */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const SITE = 'https://herstylevault.com';
const ctx = { window: {}, document: { addEventListener() {} } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'digitals.js'), 'utf8') + '\nthis.__D = DIGITALS; this.__soon = digitalSoon; this.__view = digitalView;', ctx);
const tpl = fs.readFileSync(path.join(root, 'digital.html'), 'utf8');
const plain = (t) => String(t || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const attr = (t) => plain(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const money = (t) => String(t || '').replace(/[^0-9.]/g, '');
const today = new Date().toISOString().slice(0, 10);
const items = ctx.__D.filter((d) => d.live !== false && d.status !== 'hidden');
const urls = [];
items.forEach((p) => {
  const file = 'digital-' + p.slug + '.html', url = SITE + '/' + file;
  const title = p.seoTitle || (plain(p.name) + ' | HerStyleVault');
  const desc = plain(p.seoDesc || p.short || p.lead);
  const v0 = ctx.__view(p, 0);
  const img = SITE + '/' + (p.cardCover || v0.coverImage || 'images/Hero_Closet.jpg');
  const name = plain(p.seoName || p.name), nameH = name.replace(/&/g, '&amp;');

  /* Product data: one offer per priced, buyable option; a price range when there are several */
  const opts = (p.options && p.options.length ? p.options : [null]).map((o, i) => ({ o, v: ctx.__view(p, i) }));
  const offers = opts.filter((x) => money(x.v.price)).map((x) => ({
    '@type': 'Offer', name: plain(x.v.name || p.name), price: money(x.v.price), priceCurrency: 'USD', url,
    availability: ctx.__soon(x.v) ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', name: 'HerStyleVault' }
  }));
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name, description: plain(p.lead || p.short), image: [img], brand: { '@type': 'Brand', name: 'HerStyleVault' }, url, category: plain(p.category || 'Digital product') };
  if (offers.length === 1) ld.offers = offers[0];
  else if (offers.length > 1) {
    const prices = offers.map((x) => parseFloat(x.price));
    ld.offers = { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: Math.min.apply(null, prices).toFixed(2), highPrice: Math.max.apply(null, prices).toFixed(2), offerCount: offers.length, offers };
  }
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Vault Digitals', item: SITE + '/vault-digitals.html' },
    { '@type': 'ListItem', position: 3, name, item: url }] };

  /* readable HTML for search engines (the page's script swaps this for the interactive version) */
  const others = items.filter((d) => d !== p);
  const li = (a) => (a || []).map((x) => '<li>' + x + '</li>').join('');
  const stat = '<section class="band wrap" style="padding-bottom:clamp(2rem,4vw,3rem);">' +
    '<p class="crumb"><a href="vault-digitals.html">Vault Digitals</a> / ' + name + '</p>' +
    '<h1 class="page-title"><span class="h1-kw">' + name + '</span>' + (v0.headline || p.name) + '</h1>' +
    (v0.lead ? '<p class="sub">' + v0.lead + '</p>' : '') +
    (v0.price ? '<p class="price">' + v0.price + (v0.priceNote ? ' <small>' + v0.priceNote + '</small>' : '') + '</p>' : '') +
    (v0.includes && v0.includes.length ? '<h2>What’s inside</h2><ul>' + li(v0.includes) + '</ul>' : '') +
    (v0.faqs && v0.faqs.length ? '<h2>Questions</h2>' + v0.faqs.map((f) => '<p><b>' + f[0] + '</b><br>' + f[1] + '</p>').join('') : '') +
    '</section>' +
    '<section class="band stone dg-more wrap"><h2>You may also like</h2><ul>' +
    others.map((d) => '<li><a href="digital-' + d.slug + '.html">' + plain(d.seoName || d.name) + '</a></li>').join('') +
    '</ul></section>';

  let h = tpl
    .replace(/<meta name="robots" content="noindex, follow">\n?/, '')
    .replace(/<title>.*?<\/title>/, '<title>' + attr(title) + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + attr(desc) + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + attr(title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + attr(desc) + '">')
    .replace(/<meta property="og:image" content="[^"]*">/, '<meta property="og:image" content="' + img + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + url + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">')
    .replace('</head>', (v0.coverImage ? '<link rel="preload" as="image" href="' + v0.coverImage + '" fetchpriority="high">\n' : '') + '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>\n<script type="application/ld+json">' + JSON.stringify(crumbs) + '</script>\n</head>')
    .replace('<main id="digitalMain"></main>', '<main id="digitalMain">' + stat + '</main>')
    .replace('<script src="digitals.js"></script>', '<script>window.HSV_SLUG = ' + JSON.stringify(p.slug) + ';</script>\n<script src="digitals.js"></script>');
  fs.writeFileSync(path.join(root, file), h);
  urls.push(url);
  console.log('wrote', file, '| title', title.length, '| desc', desc.length);
});
/* keep sitemap.xml in step: product pages are rewritten, every page gets a lastmod date */
let sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
sm = sm.replace(/\s*<url>\s*<loc>https:\/\/herstylevault\.com\/digital-[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
const add = urls.map((u) => '\n  <url>\n    <loc>' + u + '</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>').join('');
sm = sm.replace('</urlset>', add + '\n</urlset>');
sm = sm.replace(/\s*<lastmod>[^<]*<\/lastmod>/g, '').replace(/(<loc>[^<]*<\/loc>)/g, '$1\n    <lastmod>' + today + '</lastmod>');
fs.writeFileSync(path.join(root, 'sitemap.xml'), sm);
