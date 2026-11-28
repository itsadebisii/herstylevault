/* Runs on every Netlify build. Puts the file's own fingerprint in the script link, so phones and browsers
   always load the newest report-extra.js and never an old copy that does not match the page. Never fails the build. */
const fs = require('fs'), crypto = require('crypto'), path = require('path');
try {
  const root = path.join(__dirname, '..');
  const hash = (f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(root, f))).digest('hex').slice(0, 8);
  const pairs = [['analysis-results.html', 'report-extra.js'], ['her-style-suite.html', 'lookbook.js'], ['her-style-suite.html', 'theme.css']];
  pairs.forEach(([html, js]) => {
    const p = path.join(root, html); if (!fs.existsSync(p) || !fs.existsSync(path.join(root, js))) return;
    const s = fs.readFileSync(p, 'utf8'), v = hash(js);
    const out = s.replace(new RegExp(js.replace('.', '\\.') + '\\?v=[A-Za-z0-9]*', 'g'), js + '?v=' + v);
    if (out !== s) fs.writeFileSync(p, out);
    console.log('stamped', html, js, v);
  });
} catch (e) { console.log('stamp skipped:', e.message); }
process.exit(0);
