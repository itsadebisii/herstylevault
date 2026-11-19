/* Builds one real page per Vault Digital (digital-<slug>.html) from digital.html + digitals.js,
   so each product has its own link, its own title and description for Google, a share image,
   and Product data for search results. Run after you add or edit anything in digitals.js:
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
const urls = [];
ctx.__D.filter((d) => d.live !== false && d.status !== 'hidden').forEach((p) => {
  const file = 'digital-' + p.slug + '.html', url = SITE + '/' + file;
  const title = plain(p.name) + ' | HerStyleVault';
  const desc = plain(p.short || p.lead);
  const v0 = ctx.__view(p, 0);
  const img = SITE + '/' + (v0.coverImage || 'images/Hero_Closet.jpg');
  const priceNum = String(v0.price || '').replace(/[^0-9.]/g, '');
  const soon = ctx.__soon(v0);
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: plain(p.name), description: plain(p.lead || p.short), image: img, brand: { '@type': 'Brand', name: 'HerStyleVault' }, url };
  if (priceNum) ld.offers = { '@type': 'Offer', price: priceNum, priceCurrency: 'USD', url, availability: soon ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock' };
  let h = tpl
    .replace(/<title>.*?<\/title>/, '<title>' + attr(title) + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + attr(desc) + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + attr(title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + attr(desc) + '">')
    .replace(/<meta property="og:image" content="[^"]*">/, '<meta property="og:image" content="' + img + '">')
    .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + url + '">')
    .replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">')
    .replace('</head>', '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>\n</head>')
    .replace('<script src="digitals.js"></script>', '<script>window.HSV_SLUG = ' + JSON.stringify(p.slug) + ';</script>\n<script src="digitals.js"></script>');
  fs.writeFileSync(path.join(root, file), h);
  urls.push(url);
  console.log('wrote', file);
});
/* keep sitemap.xml in step */
let sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
sm = sm.replace(/\s*<url>\s*<loc>https:\/\/herstylevault\.com\/digital-[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
const add = urls.map((u) => '\n  <url>\n    <loc>' + u + '</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>').join('');
sm = sm.replace('</urlset>', add + '\n</urlset>');
fs.writeFileSync(path.join(root, 'sitemap.xml'), sm);
