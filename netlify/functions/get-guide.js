// Delivers The Wardrobe Detox Guide PDF after a paid Stripe Checkout.
// GET /.netlify/functions/get-guide?session_id=cs_...           -> the PDF (attachment)
// GET /.netlify/functions/get-guide?session_id=cs_...&check=1   -> { ok: true } if the purchase is valid
// Needs Netlify env vars: STRIPE_SECRET_KEY (already used by the report) and GUIDE_KEY (decrypts assets/guide.enc).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GUIDE_PRICE_CENTS = parseInt(process.env.GUIDE_PRICE_CENTS || '2899', 10);
const FILENAME = 'The-Wardrobe-Detox-Guide-HerStyleVault.pdf';

const json = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) });

async function verifyPurchase(sessionId) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { ok: false, code: 500, error: 'not_configured' };
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId || '')) return { ok: false, code: 400, error: 'bad_session' };
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId) + '?expand[]=line_items', {
    headers: { Authorization: 'Bearer ' + secret }
  });
  if (!r.ok) return { ok: false, code: 404, error: 'not_found' };
  const s = await r.json();
  // 'no_payment_required' is what Stripe reports when a 100%-off code covers the whole order (your test purchases, or a copy you give away).
  // It only counts once checkout is complete.
  const settled = s.payment_status === 'paid' || (s.payment_status === 'no_payment_required' && s.status === 'complete');
  if (!settled) return { ok: false, code: 402, error: 'not_paid' };
  const items = (s.line_items && s.line_items.data) || [];
  // The $40 Signature Style Report also uses Stripe, so make sure this purchase is really the guide.
  const isGuide = items.some((li) => li.price && li.price.unit_amount === GUIDE_PRICE_CENTS && li.price.currency === 'usd');
  if (!isGuide) return { ok: false, code: 403, error: 'wrong_product' };
  return { ok: true };
}

function readGuide() {
  const key = process.env.GUIDE_KEY;
  if (!key) throw new Error('GUIDE_KEY missing');
  const candidates = [
    path.join(process.env.LAMBDA_TASK_ROOT || '', 'netlify/functions/assets/guide.enc'),
    path.join(__dirname, 'assets/guide.enc'),
    path.join(process.cwd(), 'netlify/functions/assets/guide.enc')
  ];
  const file = candidates.find((f) => f && fs.existsSync(f));
  if (!file) throw new Error('guide.enc not found');
  const buf = fs.readFileSync(file);
  const iv = buf.subarray(0, 12), tag = buf.subarray(12, 28), data = buf.subarray(28);
  const d = crypto.createDecipheriv('aes-256-gcm', crypto.scryptSync(key, 'hsv-guide-v1', 32), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'method' });
  const qs = event.queryStringParameters || {};
  // Setup check you can open in a browser: /.netlify/functions/get-guide?health=1  (shows only ok / what is missing, never the file)
  if (qs.health) {
    const out = { stripeKey: !!process.env.STRIPE_SECRET_KEY, guideKey: !!process.env.GUIDE_KEY, guide: 'unknown' };
    try { const pdf = readGuide(); out.guide = pdf.subarray(0, 4).toString() === '%PDF' ? 'ok' : 'bad'; } catch (e) { out.guide = String(e.message || 'error').slice(0, 40); }
    out.ok = out.stripeKey && out.guideKey && out.guide === 'ok';
    return json(out.ok ? 200 : 500, out);
  }
  try {
    const v = await verifyPurchase(qs.session_id);
    if (!v.ok) return json(v.code, { ok: false, error: v.error });
    if (qs.check) return json(200, { ok: true });
    const pdf = readGuide();
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'application/octet-stream', // forces a real download in Safari instead of opening a web page
        'Content-Disposition': 'attachment; filename="' + FILENAME + '"; filename*=UTF-8\'\'' + FILENAME,
        // not "no-store": Safari (especially on iPhone) can show the PDF but fail to save it when no-store is set
        'Cache-Control': 'private, max-age=0, must-revalidate',
        'X-Robots-Tag': 'noindex'
      },
      body: pdf.toString('base64')
    };
  } catch (e) {
    return json(500, { ok: false, error: 'server' });
  }
};
