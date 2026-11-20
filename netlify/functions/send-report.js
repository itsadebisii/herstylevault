// Emails a client their finished Signature Style Report PDF.
// POST /.netlify/functions/send-report   { sessionId, pdf: "<base64 of the PDF>" }  -> { ok: true, to: "j***@gmail.com" }
// GET  /.netlify/functions/send-report?health=1                                      -> { ok: true|false } (is email set up?)
//
// Safety rules:
//  - The Stripe checkout session must be paid (checked here, every time).
//  - The email only ever goes to the address on that Stripe session, never to an address the browser supplies.
//  - The attachment must really be a PDF and under 4.5 MB.
// Needs Netlify env vars: RESEND_API_KEY (from resend.com) and, optionally, REPORT_FROM_EMAIL
// (default: "HerStyleVault <reports@herstylevault.com>"; that domain must be verified in Resend).

const MAX_PDF_BYTES = 4.5 * 1024 * 1024;
const FROM = process.env.REPORT_FROM_EMAIL || 'HerStyleVault <reports@herstylevault.com>';
const sentCount = new Map(); // best-effort limit per warm server: 3 emails per checkout session

const json = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) });

function mask(email) {
  const [u, d] = String(email).split('@');
  const dom = (d || '').split('.');
  return (u || '').slice(0, 1) + '***@' + (dom[0] || '').slice(0, 1) + '***.' + dom.slice(1).join('.');
}

async function payerEmail(sessionId) {
  const key = process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;
  if (!key) return { ok: false, code: 500, error: 'not_configured' };
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId || '')) return { ok: false, code: 400, error: 'bad_session' };
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), { headers: { Authorization: 'Bearer ' + key } });
  if (!r.ok) return { ok: false, code: 404, error: 'not_found' };
  const s = await r.json();
  // A 100%-off code completes with a $0 total and status 'no_payment_required'; that counts as settled.
  const settled = s.payment_status === 'paid' || (s.status === 'complete' && s.amount_total === 0 && s.payment_status === 'no_payment_required');
  if (!settled) return { ok: false, code: 402, error: 'not_paid' };
  const email = (s.customer_details && s.customer_details.email) || s.customer_email || '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, code: 400, error: 'no_email' };
  const first = String((s.customer_details && s.customer_details.name) || '').trim().split(/\s+/)[0].replace(/[^A-Za-z'\u00C0-\u024F-]/g, '').slice(0, 30);
  return { ok: true, email, first };
}

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  if (event.httpMethod === 'GET') {
    if (qs.health) return json(200, { ok: !!process.env.RESEND_API_KEY });
    return json(405, { error: 'method' });
  }
  if (event.httpMethod !== 'POST') return json(405, { error: 'method' });
  if (!process.env.RESEND_API_KEY) return json(503, { ok: false, error: 'email_not_configured' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { ok: false, error: 'bad_json' }); }
  const sessionId = body.sessionId;
  const pdf = Buffer.from(String(body.pdf || ''), 'base64');
  if (!pdf.length || pdf.length > MAX_PDF_BYTES || pdf.subarray(0, 5).toString() !== '%PDF-') return json(400, { ok: false, error: 'bad_pdf' });

  try {
    const who = await payerEmail(sessionId);
    if (!who.ok) return json(who.code, { ok: false, error: who.error });
    const n = (sentCount.get(sessionId) || 0) + 1;
    if (n > 3) return json(429, { ok: false, error: 'too_many' });
    sentCount.set(sessionId, n);

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [who.email],
        reply_to: 'hello@herstylevault.com',
        subject: 'Your Signature Style Report is here',
        text: 'Hi ' + (who.first || 'there') + ',\n\nThank you for taking the quiz. Your Signature Style Report is attached as a PDF.\n\n- Save it to your phone or computer so you always have it. We do not keep a copy, so this email is your copy.\n- Take it shopping. The links in your report open live searches at stores in your price range.\n- Thinking about booking a styling session? Keep this PDF and bring it to your consultation, so we can start from it.\n\nYour $40 credit toward a 1:1 package is explained on the last page of your report.\n\nWant help turning your report into real outfits? Book a free consultation: https://herstylevault.com/book.html\n\nSee our seasonal lookbooks: https://herstylevault.com/lookbook.html\n\nQuestions? Just reply to this email.\n\nWith love,\nHerStyleVault',
        html: '<div style="font-family:Arial,Helvetica,sans-serif;color:#181716;max-width:520px;margin:0 auto;padding:24px;line-height:1.6">' +
          '<p style="font-family:Georgia,serif;font-size:26px;margin:0 0 16px">HerStyleVault</p>' +
          '<p>Hi ' + (who.first || 'there') + ',</p>' +
          '<p>Thank you for taking the quiz. Your Signature Style Report is attached as a PDF.</p>' +
          '<ul style="padding-left:18px">' +
          '<li style="margin-bottom:8px"><strong>Save it</strong> to your phone or computer so you always have it. We do not keep a copy, so this email is your copy.</li>' +
          '<li style="margin-bottom:8px"><strong>Take it shopping.</strong> The links in your report open live searches at stores in your price range.</li>' +
          '<li style="margin-bottom:8px"><strong>Thinking about booking a styling session?</strong> Keep this PDF and bring it to your consultation, so we can start from it.</li></ul>' +
          '<p>Your $40 credit toward a 1:1 package is explained on the last page of your report.</p>' +
          '<p style="margin:20px 0 8px">Want help turning your report into real outfits?</p>' +
          '<p style="margin:0 0 24px"><a href="https://herstylevault.com/book.html" style="display:inline-block;background:#7A1321;color:#ffffff;padding:12px 22px;border-radius:4px;text-decoration:none;font-weight:600">Book a free consultation</a></p>' +
          '<a href="https://herstylevault.com/lookbook.html" style="text-decoration:none"><img src="https://herstylevault.com/images/share/lookbook.jpg" width="472" alt="HerStyleVault seasonal lookbooks" style="display:block;width:100%;max-width:472px;height:auto;border-radius:4px;border:0"></a>' +
          '<p style="margin:12px 0 24px"><a href="https://herstylevault.com/lookbook.html" style="display:inline-block;border:1px solid #7A1321;color:#7A1321;padding:11px 22px;border-radius:4px;text-decoration:none;font-weight:600">Check out our seasonal lookbooks</a></p>' +
          '<p>Questions? Just reply to this email.</p>' +
          '<p>With love,<br><strong>HerStyleVault</strong></p></div>',
        attachments: [{ filename: 'Signature-Style-Report-HerStyleVault.pdf', content: pdf.toString('base64') }]
      })
    });
    if (!r.ok) return json(502, { ok: false, error: 'send_failed' });
    return json(200, { ok: true, to: mask(who.email) });
  } catch (e) {
    return json(500, { ok: false, error: 'server' });
  }
};
