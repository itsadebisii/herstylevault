const {
  getSeason,
  getPremiumBucket,
  SEASON_FAMILY,
  archetypesBySeasonFamily,
  proportionTips,
  colorData,
  premiumColorData,
  bodyData
} = require('./lib/knowledge');

const ANTHROPIC_MODEL = 'claude-opus-5';

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

  const { sessionId, name, answers, freeText, photoBase64, photoMediaType } = payload;

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing sessionId' }) };
  }
  if (!answers || !answers.shape) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing quiz answers' }) };
  }

  // --- Step 1: verify payment server-side, every time. Never trust the client. ---
  // STRIPE_SECRET_KEY_TEST, when set, always wins — lets us safely test with
  // Stripe test-mode data without ever touching the live key. Delete it (or
  // leave it unset) and this automatically falls back to the live key.
  const stripeKey = process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured (missing STRIPE_SECRET_KEY)' }) };
  }

  let session;
  try {
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

  if (session.payment_status !== 'paid') {
    return { statusCode: 402, body: JSON.stringify({ error: 'Payment not completed' }) };
  }

  // --- Step 2: compute the factual season/shape data from the classifier. ---
  const { key: seasonKey, axes } = getSeason(answers);
  const colorFacts = colorData[seasonKey];
  const premiumFacts = premiumColorData[getPremiumBucket(axes)];
  const bodyFacts = bodyData[answers.shape];

  if (!colorFacts || !bodyFacts) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Could not classify answers — missing or invalid fields' }) };
  }

  const family = SEASON_FAMILY[seasonKey];
  const archetype = (archetypesBySeasonFamily[family] || {})[answers.shape] || 'That Girl';
  const proportionNote = (answers.height && answers.proportion && proportionTips[answers.height])
    ? proportionTips[answers.height][answers.proportion]
    : null;

  const clientName = (name || 'there').trim();

  // --- Step 3: ask Claude to write the personalized narrative, grounded in the facts above. ---
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured (missing ANTHROPIC_API_KEY)' }) };
  }

  const systemPrompt = `You are writing a personalized color and body style report for HerStyleVault, a personal styling business. You are given the client's quiz answers and FIXED, ALREADY-DETERMINED facts about their color season and body shape — these facts came from a tested classification system, not from you, and must not be contradicted or second-guessed. Your job is ONLY to:
1. Write a warm, specific "Why This Is You" narrative (120-180 words) that walks through the client's actual answers and shows how they add up to the given season and shape — the way a real stylist would explain their reasoning, including calling out and resolving any answers that seem to point in different directions.
2. Pick exactly 3 items from the provided silhouette list that best fit this specific client, each with a one-sentence personalized reason tied to their actual answers (not generic).
3. Write one combined "step back from" sentence merging the color-avoid and body-avoid facts into natural, specific advice.

Rules:
- Never invent colors, hex codes, or styling facts beyond what is provided — use only the given season and body data as ground truth.
- Never assume the client is light-skinned, thin, or any specific body size. Do not use language that implies a "default" skin tone or body type. Speak to this specific person based on their specific answers.
- If a photo is provided, you may reference visible details (skin undertone, hair color, general silhouette) to strengthen the narrative, but do not comment on weight, age, or make assumptions unrelated to color/style analysis.
- Tone: warm, confident, personal — like a stylist who really looked at their answers, not a horoscope.
- Respond with ONLY a JSON object, no other text, matching exactly this shape:
{"narrative": "...", "silhouettes": [{"text": "...", "reason": "..."}, {"text": "...", "reason": "..."}, {"text": "...", "reason": "..."}], "avoidText": "..."}`;

  const userContent = [];
  userContent.push({
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

Available silhouette options to choose 3 from (pick the 3 that best fit this client's specific answers):
${JSON.stringify(bodyFacts.sils)}

Color avoid facts: ${colorFacts.avoid}
Body avoid facts: ${JSON.stringify(bodyFacts.avd)}

Style archetype name to weave in naturally if it fits: "${archetype}"`
  });

  if (photoBase64 && photoMediaType) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: photoMediaType, data: photoBase64 }
    });
  }

  let aiJson;
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      })
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error('Claude API error:', errText);
      return { statusCode: 502, body: JSON.stringify({ error: 'Report generation failed, please try again' }) };
    }

    const claudeData = await claudeRes.json();
    const rawText = (claudeData.content || []).map((b) => b.text || '').join('');
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in model response');
    aiJson = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Report generation error:', e);
    return { statusCode: 502, body: JSON.stringify({ error: 'Report generation failed, please try again' }) };
  }

  // --- Step 4: merge AI narrative with fixed factual data and return. ---
  const report = {
    clientName,
    seasonKey,
    seasonLabel: colorFacts.label,
    seasonDesc: colorFacts.desc,
    metal: colorFacts.metal,
    neutrals: colorFacts.neutrals,
    signature: colorFacts.signature,
    colorAvoid: colorFacts.avoid,
    bodyShapeKey: answers.shape,
    bodyShapeLabel: bodyFacts.shape,
    bodyShapeDesc: bodyFacts.desc,
    bodyGoal: bodyFacts.goal,
    archetype,
    narrative: aiJson.narrative,
    silhouettes: aiJson.silhouettes,
    avoidText: aiJson.avoidText
  };

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(report)
  };
};
