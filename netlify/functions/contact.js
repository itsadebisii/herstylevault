// Sends a message from the Contact page to hello@herstylevault.com.
// POST /.netlify/functions/contact   { name, email, topic, message, website, t }  -> { ok: true }
// GET  /.netlify/functions/contact?health=1                                         -> { ok: true|false } (is email set up?)
//
// Safety rules:
//  - A hidden "website" field must stay empty (bots fill it in) and the form must have been open for a few seconds.
//  - Name, email, topic and message are checked and length-limited.
//  - Best-effort limit of 5 messages per hour per visitor on a warm server.
//  - The reply-to is the visitor, so answering the email goes straight to them.
// Needs the same Netlify env var as send-report: RESEND_API_KEY (and optionally REPORT_FROM_EMAIL).

const TO = process.env.CONTACT_TO_EMAIL || 'hello@herstylevault.com';
const FROM = process.env.REPORT_FROM_EMAIL || 'HerStyleVault <reports@herstylevault.com>';
const TOPICS = ['Booking or packages', 'À la carte services', 'My Signature Style Report', 'Digital products', 'My existing booking', 'Collaborations and press', 'Something else'];
const seen = new Map();

const json = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const oneLine = (s, n) => String(s || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

// If the message came from a report page with an order reference, check it against Stripe so you can see at a glance
// that the person really paid. The reference is only looked up, never shown to the visitor.
async function checkOrder(ref) {
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,120}$/.test(ref || '')) return null;
  const key = process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;
  if (!key) return { line: 'Order check: could not verify (Stripe is not set up here). Reference: ' + ref, paid: false };
  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(ref), { headers: { Authorization: 'Bearer ' + key } });
    if (!r.ok) return { line: 'Order check: not found in Stripe. Reference: ' + ref, paid: false };
    const s = await r.json();
    const paid = s.payment_status === 'paid' || (s.status === 'complete' && s.amount_total === 0 && s.payment_status === 'no_payment_required');
    const who = (s.customer_details && s.customer_details.email) || s.customer_email || 'unknown email';
    const amt = typeof s.amount_total === 'number' ? '$' + (s.amount_total / 100).toFixed(2) : 'unknown amount';
    return { line: 'Order check: ' + (paid ? 'PAID' : 'NOT PAID') + ', ' + amt + ', paid by ' + who + '. Reference: ' + ref, paid };
  } catch (e) { return { line: 'Order check: could not verify right now. Reference: ' + ref, paid: false }; }
}

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  if (event.httpMethod === 'GET') {
    if (qs.health) return json(200, { ok: !!process.env.RESEND_API_KEY });
    return json(405, { error: 'method' });
  }
  if (event.httpMethod !== 'POST') return json(405, { error: 'method' });
  if (!process.env.RESEND_API_KEY) return json(503, { ok: false, error: 'email_not_configured' });

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { ok: false, error: 'bad_json' }); }

  // Bots: a filled hidden field, or a form submitted within 3 seconds of opening. Answer "ok" so they do not retry.
  if (String(b.website || '').trim() || !(Number(b.t) >= 3000)) return json(200, { ok: true });

  const name = oneLine(b.name, 80);
  const email = oneLine(b.email, 120);
  const topic = TOPICS.indexOf(b.topic) > -1 ? b.topic : 'Something else';
  const message = String(b.message || '').replace(/\r/g, '').trim().slice(0, 2000);
  if (!name) return json(400, { ok: false, error: 'name' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return json(400, { ok: false, error: 'email' });
  if (message.length < 5) return json(400, { ok: false, error: 'message' });

  const ip = String((event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'])) || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (seen.get(ip) || []).filter((x) => now - x < 3600000);
  if (recent.length >= 5) return json(429, { ok: false, error: 'too_many' });
  recent.push(now); seen.set(ip, recent);

  const order = await checkOrder(String(b.ref || '').trim());
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: topic + ': message from ' + name + (order ? (order.paid ? ' [PAID]' : ' [CHECK ORDER]') : ''),
        text: 'From: ' + name + ' <' + email + '>\nTopic: ' + topic + (order ? '\n' + order.line : '') + '\n\n' + message,
        html: '<div style="font-family:Arial,Helvetica,sans-serif;color:#181716;line-height:1.6">' +
          '<p><strong>From:</strong> ' + esc(name) + ' &lt;' + esc(email) + '&gt;<br><strong>Topic:</strong> ' + esc(topic) + (order ? '<br><strong>' + esc(order.line) + '</strong>' : '') + '</p>' +
          '<p style="white-space:pre-wrap">' + esc(message) + '</p>' +
          '<p style="color:#777;font-size:12px">Sent from the Contact page. Reply to this email to answer them.</p></div>'
      })
    });
    if (!r.ok) return json(502, { ok: false, error: 'send_failed' });
    return json(200, { ok: true });
  } catch (e) {
    return json(500, { ok: false, error: 'server' });
  }
};
