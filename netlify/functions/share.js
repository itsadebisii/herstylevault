// Lets the owner of a report replace their share link. The old link stops working at once.
// POST /.netlify/functions/share  { sessionId, email }  -> { shareToken }   (email must be the one used at checkout)
const { SESSION_RE, normEmail, emailHash, openStore, read, rotateShare, safeEqual } = require('./lib/report-store');

const json = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) });
const tries = new Map();
const MAX_TRIES = 6, WINDOW_MS = 15 * 60 * 1000;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'bad_json' }); }
  const sessionId = String(body.sessionId || ''), email = normEmail(body.email);
  if (!SESSION_RE.test(sessionId)) return json(400, { error: 'bad_session' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return json(400, { error: 'bad_email' });
  const t = tries.get(sessionId);
  if (t && Date.now() - t.first < WINDOW_MS && t.n >= MAX_TRIES) return json(429, { error: 'too_many' });
  const store = openStore(event);
  if (!store) return json(503, { error: 'unavailable' });
  const doc = await read(store, sessionId);
  if (!doc) return json(404, { error: 'not_found' });
  if (!safeEqual(doc.emailHash, emailHash(sessionId, email))) {
    const now = Date.now(), cur = t && now - t.first < WINDOW_MS ? t : { n: 0, first: now };
    cur.n += 1; tries.set(sessionId, cur);
    return json(403, { error: 'wrong_email' });
  }
  tries.delete(sessionId);
  try { return json(200, { shareToken: await rotateShare(store, sessionId, doc) }); } catch (e) { return json(500, { error: 'server' }); }
};
