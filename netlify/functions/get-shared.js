// Opens a report someone chose to share.
// POST /.netlify/functions/get-shared  { token }  -> { report }   (the public version: first name only, no age, never the photo or email)
// The token is a long random string that only the report's owner has, so a shared link works for whoever they send it to.
const { openStore, readShared, publicView } = require('./lib/report-store');

const json = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'bad_json' }); }
  const store = openStore(event);
  if (!store) return json(503, { error: 'unavailable' });
  const doc = await readShared(store, String(body.token || ''));
  if (!doc) return json(404, { error: 'not_found' });
  return json(200, { report: publicView(doc.report) });
};
