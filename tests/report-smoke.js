/* Report smoke test. Run:  npm i -D playwright  (once), then  node tests/report-smoke.js
   Builds the report for several different clients (and an old-format saved report) in a real browser and fails if
   anything throws, a page overflows, or the page count changes. It calls the real report function with the preview-test flag. */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const handler = require(path.join(root, 'netlify/functions/generate-report.js')).handler;
const base = { jewelry: 'gold', sun: 'tan', veins: 'green', depth: 'caramel', contrast: 'mediumHigh', chroma: 'bright', comp: 'warm', wash: 'cool', fit: 'both', styleGrav: 'waist', dressSep: 'both', shoulderHip: 'equal', waistDef: 'barelyDefined', bustHip: 'roughlyEqual', height: 'average', proportion: 'longLegs', showOff: ['waist', 'legs'], quiet: ['none'], feel: ['confident', 'feminine'], worksBest: ['work', 'dates', 'photos'], guideFirst: ['colors', 'formulas'], pq1: 'heels', pq2: 'waist', pq3: 'occasion', budget: 'mid' };
const profiles = {
  'warm 18-24 no extras': Object.assign({}, base, { ageBracket: '18-24' }),
  'cool petite 35-44 formal': Object.assign({}, base, { ageBracket: '35-44', jewelry: 'silver', veins: 'blue', depth: 'fair', contrast: 'high', comp: 'cool', wash: 'warm', shoulderHip: 'shouldersMuchWider', bustHip: 'bustSlightlyLarger', height: 'petite', proportion: 'longTorso', quiet: ['hips', 'midsection'], worksBest: ['work', 'travel', 'special'], dressCode: 'formal', climate: 'cold', temp: 'cold', comfortFab: ['itchy', 'clingy'], budget: 'invest' }),
  'separates only (no dresses)': Object.assign({}, base, { ageBracket: '35-44', dressSep: 'separates', styleGrav: 'fitted' }),
  'alt baddie, warm 18-24': Object.assign({}, base, { ageBracket: '18-24', pq1: 'alt', pq2: 'edge', pq3: 'mono', feel: ['edgy', 'confident'] }),
  'dark romance, cool 45+': Object.assign({}, base, { ageBracket: '45+', jewelry: 'silver', veins: 'blue', depth: 'fair', contrast: 'high', comp: 'cool', wash: 'warm', pq1: 'allblack', pq2: 'edge', pq3: 'mono' }),
  '45+ with every extra': Object.assign({}, base, { ageBracket: '45+', dressCode: 'businessCasual', climate: 'warm', heel: 'flats', goal: 'trip', goalDate: 'May', sizeTop: 'L', sizeBottom: '12', sizeShoe: '8', shopHabits: ['store', 'resale'], hairType: ['curly', 'varies'], hairLen: 'long', inspo: 'Michelle Obama', pq1: 'other', pq1Other: 'Dress and flats' })
};
/* Pretend to be Claude with the longest answers the rules allow, to prove the pages still fit. */
const realFetch = global.fetch;
function mockClaude() {
  process.env.ANTHROPIC_API_KEY = 'test';
  global.fetch = async (url, opt) => {
    if (!String(url).includes('api.anthropic.com')) return realFetch(url, opt);
    const text = JSON.parse(opt.body).messages[0].content[0].text;
    const list = JSON.parse(text.split('(copy the text exactly):')[1].split('\n')[1]);
    const w = (n) => Array.from({ length: n }, (_, i) => 'word' + i).join(' ');
    const body = { narrative: 'Your coloring points one way. ' + w(158), silhouettes: list.slice(0, 3).map((t) => ({ text: t, reason: 'Gives shape. ' + w(22) })), avoidText: 'Skip ' + w(43) };
    return { ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text: JSON.stringify(body) }], stop_reason: 'end_turn' }) };
  };
}
function unmockClaude() { global.fetch = realFetch; delete process.env.ANTHROPIC_API_KEY; }
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/^\//, '') || 'index.html'); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); });
(async () => {
  await new Promise(res => server.listen(8199, res));
  const browser = await chromium.launch(); let bad = 0;
  const run = async (name, answers, strip, tier = 'signature', expectPages = 21) => {
    const ctx = await browser.newContext({ viewport: { width: 900, height: 1200 } }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    await page.route('**/generate-report', async r => { const res = await handler({ httpMethod: 'POST', headers: { host: 'deploy-preview-1--herstylevault.netlify.app' }, body: r.request().postData() }); let body = res.body; if (strip) { const j = JSON.parse(body); ['depthKey', 'directions', 'life', 'stores', 'contrastLevel', 'chromaKey', 'styleGrav', 'dressSep'].forEach(k => delete j[k]); body = JSON.stringify(j); } r.fulfill({ status: res.statusCode, contentType: 'application/json', body }); });
    await page.route('**/fonts.*/**', r => r.abort());
    await page.addInitScript(([a, tr]) => localStorage.setItem('hsv_analysis_data', JSON.stringify({ name: 'Test', email: 't@example.com', tier: tr, answers: a })), [answers, tier]);
    await page.goto('http://localhost:8199/analysis-results.html?session_id=preview-test&preview=1&tier=' + tier);
    try { await page.waitForSelector('.pdf-page', { timeout: 30000 }); } catch (e) { errs.push('report did not render'); }
    await page.waitForTimeout(800);
    const info = await page.evaluate(() => ({ pages: document.querySelectorAll('.pdf-page').length, tall: [...document.querySelectorAll('.hx-page')].filter(e => e.scrollHeight > 915).length }));
    if (errs.length || info.tall || info.pages !== expectPages) { bad++; console.log('FAIL', name, JSON.stringify(info), errs.slice(0, 2)); } else console.log('ok  ', name, info.pages + ' pages');
    await ctx.close();
  };
  for (const [n, a] of Object.entries(profiles)) await run(n, a, false);
  await run('old-format saved report', profiles['warm 18-24 no extras'], true);
  /* the two shorter reports: only the pages and questions that belong to them */
  const colorOnly = Object.assign({}, profiles['cool petite 35-44 formal']);
  ['fit','styleGrav','dressSep','shoulderHip','waistDef','bustHip','height','proportion','showOff','quiet','pq1','pq2','pq3','budget'].forEach(k => delete colorOnly[k]);
  await run('starter report (colors only)', colorOnly, false, 'starter', 10);
  const noPersona = Object.assign({}, profiles['45+ with every extra']); ['pq1','pq2','pq3','guideFirst','fit','styleGrav'].forEach(k => delete noPersona[k]);
  await run('blueprint report', noPersona, false, 'blueprint', 15);
  mockClaude();
  await run('longest AI text, 45+', profiles['45+ with every extra'], false);
  await run('longest AI text, petite 35-44', profiles['cool petite 35-44 formal'], false);
  unmockClaude();
  await browser.close(); server.close(); process.exit(bad ? 1 : 0);
})();
