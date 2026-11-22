const {
  getSeason,
  SEASON_FAMILY,
  archetypesBySeasonFamily,
  colorData,
  seasonExtras,
  bodyData,
  joinList,
  buildColorNarrative,
  buildColorBullets,
  buildBodyBullets,
  seasonProfile,
  buildBodyNarrative,
  proportionTipFor,
  computeBodyShape,
  computeIntensity,
  computePersona,
  buildShopLinks,
  shopTier,
  isMatureAge
} = require('./lib/knowledge');

const reportStore = require('./lib/report-store');

const ANTHROPIC_MODEL = 'claude-opus-5';
const AI_TIMEOUT_MS = 20000;

// Phrases that make a report sound machine-written, plus any echo of the quiz wording.
// Anything the model returns that matches is thrown away and replaced by the template version.
const BANNED = /absolutely|stunning|\bicon\b|iconic|icon energy|unforgettable|elevate|game[- ]?changer|you selected|you chose|you picked|you told us|you said|based on (your|what you)|fabulous|gorgeous|obsessed|slay|bestie|queen|journey|embrace your|unlock your|chef's kiss|look no further|level up|stand out from the crowd|it's not (just )?[a-z ]+, it's/i;

const wordCount = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).length;
const lcFirst = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);
const cap = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
const COLOR_WORDS = /\b(black|white|navy|gr[ae]y|pastels?|neon|orange|burgundy|beige|camel|taupe|mauve|fuchsia|pink|red|blue|green|yellow|purple|brown|gold|silver|cream|ivory|rust|olive|teal|coral|peach|lavender|colors?)\b/i;
const stripEnd = (t) => String(t || '').trim().replace(/[.\s]+$/, '');

const SYSTEM_PROMPT = `You are writing the personal section of a HerStyleVault Style Analysis. HerStyleVault is a personal styling business run by its founder in Boston, and this report is written as if the founder sat down and studied this one client.

You are given the client's quiz answers and FIXED facts about her color season and body shape. The facts were produced by a tested classification system and are final. You never change them, add to them, or argue with them.

Write ONLY these three things:
1. "narrative": 110 to 160 words, plain text, no bullets, two short paragraphs at most. Explain why this color type (her season) belongs to this woman, covering her coloring only. Do not mention her body shape, proportions or fit; a separate page covers that. Explain it the way a stylist would: by drawing a conclusion from the whole picture, not by reading her answers back to her. Name at most two small, specific details from her answers, woven in naturally (for example the metal she reaches for, or where she feels most confident), never as a list.
2. "silhouettes": exactly 3 items copied EXACTLY, word for word, from the provided silhouette list. Each has a "reason": one sentence, 12 to 28 words, tied to something specific about her (a quiz answer, her height, her proportions, her free-text note).
3. "avoidText": one sentence, 15 to 45 words, naming the silhouettes, cuts and styles for her shape to step back from, based only on the body-avoid facts. Do not mention any colors; a separate card covers colors.

VOICE
- Never name the stylist or any person. If you need to refer to who is speaking, say nothing or use "HerStyleVault".
- Warm, grounded, editorial and sure of itself. Plain words, concrete nouns, sentences of varied length. A stylist speaking to one person, not a brand speaking to an audience.
- Second person ("you"). No hype, no flattery, no exclamation marks.
- Use at most one em dash in the whole narrative. Prefer commas and full stops.

NEVER WRITE
- Hype or filler words: absolutely, stunning, gorgeous, iconic, icon energy, unforgettable, elevate, game-changer, fabulous, obsessed, slay, queen, journey, "unlock your", "embrace your", "look no further", "level up".
- Echoes of the quiz: "You selected", "You chose", "You told us", "You said", "Based on your answers". Do not recite answers in the order she gave them.
- The "it's not X, it's Y" construction, or three-item lists of adjectives used as decoration.
- Horoscope language. You are explaining a result, not predicting one.

CONFLICTING ANSWERS
- If some of her answers point a different way from the result, do not apologize or hedge. Say plainly which signals carry the most weight (the metals that flatter her and the colors that wash her out, for color; her overall shoulder-to-hip and waist proportions, for shape) and move on with confidence.
- Never call a quiz answer a "classic marker" of the shape unless it genuinely is one for that shape. Where weight sits and which pieces fit off the rack vary by person, so treat them as secondary to proportion.

FACTS AND SAFETY
- Never invent colors, hex codes, shade names, brands, measurements or styling rules. Use only the season and body data you are given.
- Never assume her skin tone, body size, age or income. Do not describe her body in terms of weight.
- If a photo is provided, you may mention visible color details (hair, skin undertone, contrast) to support the color reasoning. Do not comment on weight or age.
- Respect any free-text note from her and answer it if it matters to the silhouettes or the avoid advice.

OUTPUT
Return ONLY a JSON object, no other text, in exactly this shape:
{"narrative": "...", "silhouettes": [{"text": "...", "reason": "..."}, {"text": "...", "reason": "..."}, {"text": "...", "reason": "..."}], "avoidText": "..."}`;

// ---------- Deterministic fallback ----------
// Used when the AI call fails, times out, or returns something that fails validation.
// Everything here is built from the fixed facts, so it cannot contradict the report.

function fallbackNarrative(answers, axes, colorFacts, bodyFacts) {
  // Color analysis only. Body-shape reasoning lives on its own page (bodyNarrative).
  return buildColorNarrative(answers, axes, colorFacts);
}

function silhouetteReasons(sil, answers, bodyFacts) {
  // Returns candidate reasons, most specific first. The caller picks the first one not already used.
  const s = sil.toLowerCase();
  const grav = ({ bodyskim: 'fitted', cropped: 'waist' })[answers.styleGrav] || answers.styleGrav;
  const height = answers.height;
  const goal = lcFirst(stripEnd(bodyFacts.goal));
  const out = [];
  if (grav === 'flowy' && /flow|a-line|maxi|wrap|fit and flare/.test(s)) out.push('You lean toward pieces with movement, and this one gives that ease a clear shape that suits your proportions.');
  if (grav === 'fitted' && /fit|structured|wrap|belt|corset|bodycon|pencil/.test(s)) out.push('You like clothes that fit with intention, and this silhouette gives you structure exactly where it helps.');
  if (grav === 'waist' && /waist|belt|wrap|fit and flare|peplum|corset/.test(s)) out.push('You reach for anything that defines the waist, and this silhouette does that in a way that works for your shape.');
  if (answers.dressSep === 'dresses' && /dress/.test(s)) out.push('Dresses work well on you, so a silhouette already built to flatter your shape saves you the guesswork.');
  if (answers.dressSep === 'separates' && /trouser|pant|skirt|top|jean/.test(s)) out.push('Separates work better on you, and this is a piece you can adjust and restyle one item at a time.');
  if (height === 'petite' && /maxi|wide leg|volume/.test(s)) out.push('On a petite frame, keep the proportions clean and the hem or rise sharp, and this silhouette holds up well.');
  if (height === 'tall' && /maxi|wide leg|longline|volume/.test(s)) out.push('Your height carries length and volume easily, which makes this a natural fit.');
  if (answers.conf && /waist|belt|wrap|fit and flare|peplum|corset|empire/.test(s) && answers.conf === 'waist') out.push('You feel most confident in your waist, and this silhouette keeps it in view.');
  out.push('It supports your styling goal: ' + goal + '.');
  out.push('It works with your proportions and keeps the attention where you want it.');
  out.push('It is one of the most dependable cuts for your shape and easy to repeat in different fabrics.');
  return out;
}

function fallbackSilhouettes(answers, bodyFacts) {
  const list = (bodyFacts.sils || []).slice();
  // prefer silhouettes that match her stated preference, then fill in order
  const grav = ({ bodyskim: 'fitted', cropped: 'waist' })[answers.styleGrav] || answers.styleGrav;
  const prefers = (s) => {
    const t = s.toLowerCase();
    if (grav === 'flowy') return /flow|a-line|maxi|wrap/.test(t) ? 1 : 0;
    if (grav === 'fitted') return /fit|structured|wrap|belt|corset|bodycon|pencil/.test(t) ? 1 : 0;
    if (grav === 'waist') return /waist|belt|wrap|fit and flare|peplum|corset/.test(t) ? 1 : 0;
    if (answers.dressSep === 'dresses') return /dress/.test(t) ? 1 : 0;
    if (answers.dressSep === 'separates') return /trouser|pant|skirt|top|jean/.test(t) ? 1 : 0;
    return 0;
  };
  const ranked = list.map((s, idx) => ({ s, idx, p: prefers(s) })).sort((a, b) => b.p - a.p || a.idx - b.idx).slice(0, 3);
  const used = new Set();
  return ranked.map((r) => {
    const reason = silhouetteReasons(r.s, answers, bodyFacts).find((x) => !used.has(x));
    used.add(reason);
    return { text: r.s, reason };
  });
}

function fallbackAvoid(colorFacts, bodyFacts) {
  // Silhouettes and cuts only. Colors to avoid have their own card with swatches.
  const shapeBits = (bodyFacts.avd || []).slice(0, 3).map((x) => lcFirst(stripEnd(x)));
  return shapeBits.length ? 'Skip ' + joinList(shapeBits) + '.' : 'Skip anything boxy or shapeless that hides your proportions.';
}

// ---------- Validation of the AI response ----------

function cleanSilhouettes(ai, bodyFacts) {
  if (!Array.isArray(ai) || ai.length !== 3) return null;
  const list = bodyFacts.sils || [];
  const norm = (t) => String(t || '').trim().toLowerCase();
  const out = [];
  for (const item of ai) {
    if (!item || typeof item.text !== 'string' || typeof item.reason !== 'string') return null;
    const match = list.find((s) => norm(s) === norm(item.text)) || list.find((s) => norm(item.text).startsWith(norm(s)) || norm(s).startsWith(norm(item.text)));
    if (!match) return null;
    const w = wordCount(item.reason);
    if (w < 6 || w > 45 || BANNED.test(item.reason)) return null;
    out.push({ text: match, reason: item.reason.trim() });
  }
  if (new Set(out.map((o) => o.text)).size !== 3) return null;
  return out;
}

function cleanNarrative(t) {
  if (typeof t !== 'string') return null;
  const w = wordCount(t);
  if (w < 80 || w > 230 || BANNED.test(t)) return null;
  const emDashes = (t.match(/—/g) || []).length;
  if (emDashes > 2) return null;
  return t.trim();
}

function cleanAvoid(t) {
  if (typeof t !== 'string') return null;
  const w = wordCount(t);
  if (w < 8 || w > 80 || BANNED.test(t) || COLOR_WORDS.test(t)) return null;
  return t.trim();
}

async function askClaude(anthropicKey, userContent) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }]
      }),
      signal: controller.signal
    });
    if (!res.ok) {
      console.error('Claude API error:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const rawText = (data.content || []).map((b) => b.text || '').join('');
    const m = rawText.match(/\{[\s\S]*\}/);
    if (!m) return null;
    return JSON.parse(m[0]);
  } catch (e) {
    console.error('Report generation error:', e && e.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const DEPTH_KEYS = ['porcelain','ivory','fair','light','beige','sand','medium','olive','honey','tan','caramel','bronze','brown','deep','rich'];
const DIRECTION_OPTS = {
  showOff: ['arms','shoulders','neckline','back','waist','legs','other'],
  quiet: ['arms','shoulders','neckline','back','midsection','hips','legs','none'],
  feel: ['confident','elegant','comfy','trend','expressive','feminine'],
  worksBest: ['everyday','work','dates','travel','photos','special'],
  guideFirst: ['colors','cuts','formulas','shopping','avoid','tips']
};
/* Only known option values are kept, so nothing typed by a client ever reaches the report. */
function cleanDirections(answers) {
  const out = {};
  Object.keys(DIRECTION_OPTS).forEach(k => {
    const v = Array.isArray(answers[k]) ? answers[k] : [];
    out[k] = v.filter(x => DIRECTION_OPTS[k].indexOf(x) > -1).slice(0, 3);
  });
  return out;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { sessionId, name, returningClient, answers, freeText, photoBase64, photoMediaType } = payload;

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing sessionId' }) };
  }
  if (!answers || (!answers.shape && !(answers.shoulderHip && answers.waistDef && answers.bustHip))) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing quiz answers' }) };
  }

  // Preview test: only honored on Netlify deploy-preview / branch-deploy hosts (never herstylevault.com), so the new report can be tested without paying. Nothing is saved.
  const hostHdr = String((event.headers && (event.headers['x-forwarded-host'] || event.headers.host)) || '');
  const previewTest = !!payload.previewTest && /--herstylevault\.netlify\.app$/i.test(hostHdr);
  ['pq1Other', 'pq2Other', 'pq3Other'].forEach((k) => { if (answers[k] != null) answers[k] = String(answers[k]).replace(/[^A-Za-z0-9 ,.'&-]/g, '').slice(0, 90); });

  // --- Step 1: verify payment server-side, every time. Never trust the client. ---
  // STRIPE_SECRET_KEY_TEST, when set, always wins — lets us safely test with
  // Stripe test-mode data without ever touching the live key. Delete it (or
  // leave it unset) and this automatically falls back to the live key.
  const stripeKey = process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey && !previewTest) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured (missing STRIPE_SECRET_KEY)' }) };
  }

  let session = {};
  if (!previewTest) try {
    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${stripeKey}` }
    });
    if (!stripeRes.ok) {
      return { statusCode: 402, body: JSON.stringify({ error: 'Could not verify payment' }) };
    }
    session = await stripeRes.json();
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Payment verification failed' }) };
  }

  // A 100%-off code (e.g. a free report for a client) completes with a $0 total and status 'no_payment_required'; that counts as settled.
  const settled = previewTest || session.payment_status === 'paid' || (session.status === 'complete' && session.amount_total === 0 && session.payment_status === 'no_payment_required');
  if (!settled) {
    return { statusCode: 402, body: JSON.stringify({ error: 'Payment not completed' }) };
  }

  // --- Step 2: compute the factual season/shape data from the classifier. ---
  // --- Saved reports: the same checkout always gets the same report, and we never pay for the AI twice. ---
  const payerEmail = (session.customer_details && session.customer_details.email) || session.customer_email || '';
  const answersFingerprint = reportStore.answersHash(answers); // taken before the code below adds fields to answers
  const store = reportStore.openStore(event);
  const existing = previewTest ? null : await reportStore.read(store, sessionId);
  if (existing) {
    // Only hand it back to someone who also holds the original quiz answers (the person who took the quiz).
    // Anyone else opens it through the email check on the saved-report page.
    if (existing.answersHash === answersFingerprint) {
      return { statusCode: 200, headers: { 'content-type': 'application/json', 'x-hsv-saved': '1' }, body: JSON.stringify(Object.assign({}, existing.report, { shareToken: existing.shareToken || null })) };
    }
    return { statusCode: 409, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'already_generated' }) };
  }

  // Shape comes from the three proportion answers; older quiz sessions that self-selected a shape still work.
  if (answers.shoulderHip && answers.waistDef && answers.bustHip) { answers.shape = computeBodyShape(answers); }
  answers.intensity = answers.shape ? computeIntensity(answers.shape, answers) : 'plain';
  const { key: seasonKey, axes } = getSeason(answers);
  const colorFacts = colorData[seasonKey];
  const extras = seasonExtras[seasonKey];
  const bodyFacts = bodyData[answers.shape];

  if (!colorFacts || !bodyFacts) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Could not classify answers — missing or invalid fields' }) };
  }

  const family = SEASON_FAMILY[seasonKey];
  const archetype = (archetypesBySeasonFamily[family] || {})[answers.shape] || 'That Girl';
  const proportionNote = proportionTipFor(answers.shape, answers.height, answers.proportion) || null;

  const clientName = (name || 'there').trim();

  // --- Step 3: build the deterministic version first. It is always available. ---
  const fallback = {
    narrative: fallbackNarrative(answers, axes, colorFacts, bodyFacts),
    silhouettes: fallbackSilhouettes(answers, bodyFacts),
    avoidText: fallbackAvoid(colorFacts, bodyFacts)
  };

  // --- Step 4: ask Claude for the personal wording, grounded in the facts above. ---
  // If the key is missing, the call fails, or the answer does not pass validation, the
  // matching template field is used so a paid client always gets a complete report.
  let ai = null;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    const userContent = [{
      type: 'text',
      text: `Client name: ${clientName}

QUIZ ANSWERS:
${JSON.stringify(answers, null, 2)}

FREE-TEXT NOTE FROM CLIENT: ${freeText || '(none provided)'}

DETERMINED COLOR SEASON: ${colorFacts.label}
Season description: ${colorFacts.desc}
Undertone axis: ${axes.undertone}, depth: ${axes.value}, chroma: ${axes.chroma}

DETERMINED BODY SHAPE: ${bodyFacts.shape}
Shape description: ${bodyFacts.desc}
Styling goal: ${bodyFacts.goal}
${proportionNote ? `Proportion note: ${proportionNote}` : ''}

Available silhouette options to choose 3 from (copy the text exactly):
${JSON.stringify(bodyFacts.sils)}

Body avoid facts: ${JSON.stringify(bodyFacts.avd)}`
    }];
    if (photoBase64 && photoMediaType) {
      userContent.push({ type: 'image', source: { type: 'base64', media_type: photoMediaType, data: photoBase64 } });
    }
    ai = await askClaude(anthropicKey, userContent);
  }

  const narrative = cleanNarrative(ai && ai.narrative);
  const silhouettes = cleanSilhouettes(ai && ai.silhouettes, bodyFacts);
  const avoidText = cleanAvoid(ai && ai.avoidText);

  // --- Step 5: merge with fixed factual data and return. ---
  const report = {
    clientName,
    isReturning: !!returningClient,
    seasonKey,
    seasonLabel: colorFacts.label,
    seasonDesc: colorFacts.desc,
    metal: colorFacts.metal,
    neutrals: colorFacts.neutrals,
    signature: colorFacts.signature,
    accents: colorFacts.accents,
    colorAvoid: colorFacts.avoid,
    avoidSwatches: colorFacts.avoidSwatches || [],
    extras,
    bodyShapeKey: answers.shape,
    intensity: answers.intensity,
    bodyNarrative: buildBodyNarrative(answers, bodyFacts),
    whyColor: buildColorBullets(answers, axes, colorFacts),
    whyBody: buildBodyBullets(answers, bodyFacts),
    colorProfile: seasonProfile(seasonKey),
    height: answers.height || 'average',
    proportion: answers.proportion || 'balanced',
    accessory: colorFacts.accessory,
    bodyGuide: { tops: bodyFacts.tops || bodyFacts.necks || [], bots: bodyFacts.bots || [], acc: bodyFacts.acc || [], avd: bodyFacts.avd || [], fabGood: bodyFacts.fabGood, fabAvoid: bodyFacts.fabAvoid },
    bodyShapeLabel: bodyFacts.shape,
    bodyShapeDesc: bodyFacts.desc,
    bodyGoal: bodyFacts.goal,
    shopKeywords: bodyFacts.shopKeywords,
    shopLinks: buildShopLinks(answers, (colorFacts.signature || []).slice(0,6), bodyFacts.shopKeywords, colorFacts.neutrals, answers.shape),
    shopTier: shopTier(answers),
    ageBracket: answers.ageBracket || '',
    depthKey: DEPTH_KEYS.indexOf(answers.depth) > -1 ? answers.depth : '',
    directions: cleanDirections(answers),
    contrastLevel: ['high','mediumHigh','medium','mediumLow','low'].indexOf(answers.contrast) > -1 ? answers.contrast : '',
    chromaKey: axes.chroma || '',
    styleGrav: ['flowy','fitted','waist','oversized','layered','cropped','bodyskim','sets','mix'].indexOf(answers.styleGrav) > -1 ? answers.styleGrav : '',
    dressSep: ['dresses','separates','both'].indexOf(answers.dressSep) > -1 ? answers.dressSep : '',
    matureAge: isMatureAge(answers),
    archetype,
    personaAnswered: !!(answers.ageBracket && answers.pq1 && answers.pq2 && answers.pq3),
    persona: (answers.ageBracket && answers.pq1 && answers.pq2 && answers.pq3) ? computePersona(answers) : null,
    narrative: narrative || fallback.narrative,
    silhouettes: silhouettes || fallback.silhouettes,
    avoidText: avoidText || fallback.avoidText,
    generatedBy: {
      narrative: narrative ? 'ai' : 'template',
      silhouettes: silhouettes ? 'ai' : 'template',
      avoidText: avoidText ? 'ai' : 'template'
    }
  };

  // Keep a private copy (never the photo) so the link works on any device. A failed save never blocks the client's report.
  const saved = payerEmail ? await reportStore.save(store, sessionId, report, payerEmail, answersFingerprint) : false;

  return {
    statusCode: 200,
    headers: Object.assign({ 'content-type': 'application/json' }, saved ? { 'x-hsv-saved': '1' } : {}),
    body: JSON.stringify(saved ? Object.assign({}, report, { shareToken: saved }) : report)
  };
};
