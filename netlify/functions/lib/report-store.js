// Saved Signature Style Reports.
// The finished report (never the photo) is kept privately so a client can reopen it on any device.
// It is stored under their Stripe checkout session id, and only opens for the email they paid with.
// Needs no setup on Netlify: Netlify Blobs is built in. If Blobs is not available (for example, running locally),
// every call here quietly does nothing and the report still works the old way.
const crypto = require('crypto');

const SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]+$/;
const KEEP_DAYS = 365;

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const normEmail = (e) => String(e || '').trim().toLowerCase();
const emailHash = (sessionId, email) => sha('email|' + sessionId + '|' + normEmail(email));
const answersHash = (answers) => sha('answers|' + JSON.stringify(answers || {}));

function openStore(event) {
  try {
    const blobs = require('@netlify/blobs');
    if (event && event.blobs && blobs.connectLambda) blobs.connectLambda(event);
    return blobs.getStore('reports');
  } catch (e) {
    return null;
  }
}

async function save(store, sessionId, report, email, fingerprint) {
  if (!store || !SESSION_RE.test(sessionId || '')) return false;
  try {
    await store.setJSON('report/' + sessionId, {
      report,
      emailHash: emailHash(sessionId, email),
      answersHash: fingerprint,
      createdAt: Date.now()
    });
    return true;
  } catch (e) {
    return false;
  }
}

async function read(store, sessionId) {
  if (!store || !SESSION_RE.test(sessionId || '')) return null;
  try {
    const doc = await store.get('report/' + sessionId, { type: 'json' });
    if (!doc || !doc.report) return null;
    if (Date.now() - (doc.createdAt || 0) > KEEP_DAYS * 86400000) {
      try { await store.delete('report/' + sessionId); } catch (e) {}
      return null;
    }
    return doc;
  } catch (e) {
    return null;
  }
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = { SESSION_RE, KEEP_DAYS, normEmail, emailHash, answersHash, openStore, save, read, safeEqual };
