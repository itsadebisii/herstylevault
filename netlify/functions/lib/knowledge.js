// Color-season and body-shape knowledge base, ported from HerStyleVault's
// internal analysis tools. Used to ground the AI report generator with
// factual, tested styling data instead of letting the model invent it.

function computeColorAxes(a){
  // Undertone: the metals that flatter you and the colors that wash you out are the most reliable self-reports,
  // so they carry the most weight. Vein color and sun reaction vary the most from person to person, so they carry the least.
  let warmScore=0,coolScore=0;
  if(a.jewelry==='gold')warmScore+=3;
  if(a.jewelry==='silver')coolScore+=3;
  if(a.jewelry==='both'){warmScore++;coolScore++;}
  if(a.wash==='cool')warmScore+=2;
  if(a.wash==='pale')warmScore+=1;
  if(a.wash==='warm')coolScore+=2;
  if(a.comp==='warm')warmScore+=2;
  if(a.comp==='cool')coolScore+=2;
  if(a.sun==='tan')warmScore+=1;
  if(a.sun==='burn')coolScore+=1;
  if(a.veins==='green')warmScore+=1;
  if(a.veins==='blue')coolScore+=1;
  const net=warmScore-coolScore;
  const undertone=net>=3?'warm':net<=-3?'cool':'neutral';
  const depthScore={porcelain:0,ivory:0,fair:0,light:0,beige:1,sand:1,medium:1,olive:1,honey:2,tan:2,caramel:2,bronze:3,brown:3,deep:3,rich:3}[a.depth]??1;
  const value=depthScore===0?'light':depthScore>=2?'deep':'medium';
  let chromaScore=0;
  if(a.chroma==='bright')chromaScore+=2;if(a.chroma==='muted')chromaScore-=2;
  if(a.contrast==='high')chromaScore+=1;if(a.contrast==='low')chromaScore-=1;
  const chroma=chromaScore>=1?'bright':chromaScore<=-1?'soft':'blended';
  return{undertone,value,chroma};
}

const SEASON_TABLE = {
  warm: { bright: { light: 'lightSpring', medium: 'trueSpring', deep: 'brightSpring' }, soft: { light: 'softAutumn', medium: 'trueAutumn', deep: 'deepAutumn' }, blended: { light: 'lightSpring', medium: 'trueAutumn', deep: 'deepAutumn' } },
  cool: { bright: { light: 'brightWinter', medium: 'trueWinter', deep: 'deepWinter' }, soft: { light: 'lightSummer', medium: 'trueSummer', deep: 'softSummer' }, blended: { light: 'lightSummer', medium: 'trueSummer', deep: 'deepWinter' } },
  neutral: { bright: { light: 'brightSpring', medium: 'brightSpring', deep: 'brightWinter' }, soft: { light: 'softSummer', medium: 'softSummer', deep: 'softAutumn' }, blended: { light: 'softSummer', medium: 'softAutumn', deep: 'softAutumn' } }
};

function getSeason(a) {
  const axes = computeColorAxes(a);
  return { key: SEASON_TABLE[axes.undertone][axes.chroma][axes.value], axes };
}

function colorSignals(a){
  // Each quiz answer, tagged with the undertone direction it points to, in the order we trust them.
  const T={
    jewelry:{gold:['warm','gold jewelry looks best on you'],silver:['cool','silver jewelry looks best on you'],both:['neutral','both gold and silver look good on you']},
    wash:{cool:['warm','cool tones wash you out'],pale:['warm','very pale, icy colors wash you out'],warm:['cool','warm tones wash you out']},
    comp:{warm:['warm','your compliments come in warm colors'],cool:['cool','your compliments come in cool colors'],neutral:['neutral','your compliments come in soft neutrals']},
    sun:{tan:['warm','you tan easily rather than burn'],burn:['cool','you burn rather than tan'],both:['neutral','you tan and then burn']},
    veins:{green:['warm','your veins read green'],blue:['cool','your veins read blue or purple'],both:['neutral','your veins are a mix of blue and green']}
  };
  const out=[];
  ['jewelry','wash','comp','sun','veins'].forEach(k=>{const e=(T[k]||{})[a[k]];if(e)out.push({k,dir:e[0],text:e[1]});});
  // If she chose her own colors, say so in her own words.
  if(a.compCustom){
    const FAV_NAMES={rust:'rust',terracotta:'terracotta',coral:'coral',peach:'peach',orange:'orange',goldenyellow:'golden yellow',mustard:'mustard',warmred:'warm red',camel:'camel',brown:'brown',olive:'olive',forest:'forest green',navy:'navy',royal:'royal blue',sky:'sky blue',icy:'icy blue',teal:'teal',emerald:'emerald',mint:'mint',lavender:'lavender',purple:'purple',plum:'plum',berry:'berry',fuchsia:'fuchsia',pink:'pink',black:'black',charcoal:'charcoal',gray:'gray',white:'white',cream:'cream',taupe:'taupe',sage:'sage',burgundy:'burgundy'};
    const names=(Array.isArray(a.favColors)?a.favColors:[]).map(x=>FAV_NAMES[x]).filter(Boolean).slice(0,4);
    const other=String(a.favOther||'').replace(/[^A-Za-z ,'-]/g,'').trim().slice(0,40).toLowerCase();
    if(other)names.push(other);
    const e=out.find(o=>o.k==='comp');
    if(names.length){const text='you get compliments in '+joinList(names);if(e){e.text=text;const i=out.indexOf(e);if(i>0){out.splice(i,1);out.unshift(e);}}else out.push({k:'comp',dir:'neutral',text});}
  }
  return out;
}
function joinList(arr){return arr.length<2?(arr[0]||''):arr.length===2?arr[0]+' and '+arr[1]:arr.slice(0,-1).join(', ')+', and '+arr[arr.length-1];}
function bodyMarkerMatch(shape,a){
  // Which of the client's own answers are genuine classic markers for the shape we computed.
  const M={apple:{weight:['belly'],fit:['bottoms']},pear:{weight:['hips'],fit:['tops']},inverted:{weight:['upper'],fit:['bottoms']},hourglass:{weight:['hips','evenly'],fit:['both']},rectangle:{weight:['evenly'],fit:['both']}}[shape]||{weight:[],fit:[]};
  // weight can be several choices (or a single string from older sessions); only the ones that really mark this shape count
  const picked=[].concat(a.weight||[]);
  const hits=picked.filter(w=>M.weight.indexOf(w)>-1);
  return{weight:hits.length>0,weightHits:hits,fit:M.fit.indexOf(a.fit)>-1};
}
function buildColorNarrative(a,axes,season){
  const sig=colorSignals(a);const u=axes.undertone;
  const chromaText={bright:'you come alive in bright, saturated colors',muted:'you look best in soft, muted colors',both:'you responded well to both bright and muted colors'}[a.chroma]||'';
  const contrastText={high:'there is noticeable contrast between your hair, skin and eyes',low:'your hair, skin and eyes blend softly into one another',medium:'your coloring has a balanced, moderate level of contrast'}[a.contrast]||'';
  const undertoneWord=u==='neutral'?'a true in-between (neutral) undertone':`a clearly ${u} undertone`;
  let out='';
  if(u==='neutral'){
    const lean=sig.filter(s=>s.dir!=='neutral').slice(0,3).map(s=>s.text);
    out=lean.length>=2?`Your answers pull in both directions (${joinList(lean)}), which is exactly how ${undertoneWord} shows up.`:`Your answers sit in the middle between warm and cool, which is how ${undertoneWord} shows up.`;
  }else{
    const support=sig.filter(s=>s.dir===u).slice(0,3).map(s=>s.text);
    const against=sig.filter(s=>s.dir!=='neutral'&&s.dir!==u).map(s=>s.text);
    if(support.length>=2)out=`${support[0].charAt(0).toUpperCase()+support[0].slice(1)}${support.length>2?', ':' and '}${joinList(support.slice(1))}, so your skin reads ${undertoneWord}.`;
    else if(support.length===1)out=`${support[0].charAt(0).toUpperCase()+support[0].slice(1)}, and weighed against the rest of your answers, your skin reads ${undertoneWord}.`;
    else out=`Weighing all of your answers together, your skin reads ${undertoneWord}.`;
    if(against.length)out+=` A couple of signals pointed the other way (${joinList(against.slice(0,2))}). That is common, because vein color and sun reaction are the least reliable parts of a quiz, so more weight goes to the metals and colors you know flatter you.`;
  }
  const extra=[contrastText?`that ${contrastText}`:'',chromaText?`that ${chromaText}`:''].filter(Boolean);
  out+=extra.length?` Add ${joinList(extra)}, and the full picture points to one specific color type: ${String(season.label).replace(/\s*✦/,'')}.`:` The full picture points to one specific color type: ${String(season.label).replace(/\s*✦/,'')}.`;
  return out;
}
function buildBodyNarrative(a,shapeData){
  const fitText={tops:'tops fit you better than bottoms',bottoms:'bottoms fit you better than tops',both:'both tops and bottoms fit you well',neither:"neither tops nor bottoms fit great off the rack right now"}[a.fit]||'';
  const weightWords={belly:'your belly/midsection',hips:'your hips and thighs',upper:'your upper body and arms'};
  const confText={shoulders:'your shoulders and collarbone',waist:'your waist',legs:'your legs',bust:'your bust',overall:'your overall silhouette'}[a.conf]||'your best features';
  const shapeName=(shapeData.shape||'').replace(/^[^A-Za-z]+/,'');
  const key=shapeName.toLowerCase().split(' ')[0];
  const art=(/^[AEIOUaeiou]/.test(shapeName)||/^hour/i.test(shapeName))?'an':'a';
  const m=bodyMarkerMatch(key,a);
  const wHits=m.weightHits||[];
  const weightText=wHits.indexOf('evenly')>-1&&wHits.length===1?'you carry weight evenly all over':wHits.length?'you notice weight first in '+joinList(wHits.map(w=>weightWords[w]||w)):'';
  let out;
  if(m.fit&&m.weight&&fitText&&weightText){
    out=`${fitText.charAt(0).toUpperCase()+fitText.slice(1)}, and ${weightText} — both classic markers of ${art} ${shapeName}.`;
  }else if((m.fit&&fitText)||(m.weight&&weightText)){
    const t=m.fit&&fitText?fitText:weightText;
    out=`${t.charAt(0).toUpperCase()+t.slice(1)}, which is a classic marker of ${art} ${shapeName}. Fit and where weight lands vary from person to person, so your shoulder-to-hip balance and waist definition decide the rest, and they point the same way.`;
  }else{
    out=`Shape comes from your overall proportions, not from which pieces fit off the rack or where weight lands first, since those vary a lot from person to person. Your shoulder-to-hip balance, waist definition and bust-to-hip proportion point to ${art} ${shapeName}, and that is what the recommendations below are built around.`;
  }
  out+=` You feel most confident in ${confText}, so every recommendation below is built to keep highlighting that.`;
  const tip=proportionTipFor(key,a.height,a.proportion);if(tip){out+=` One more thing that's specific to you: ${tip.charAt(0).toLowerCase()+tip.slice(1)}`;}
  return out;
}


/* ---- short "Why this is you" bubbles + coloring profile (used by the Signature Style Report PDF) ---- */
function cap1(t){return t?t.charAt(0).toUpperCase()+t.slice(1):t;}
function buildColorBullets(a,axes,season){
  const sig=colorSignals(a),u=axes.undertone,items=[];let note='';
  if(u==='neutral'){
    items.push('Your answers pull both ways, which is how a true in-between undertone shows up');
  }else{
    const support=sig.filter(s=>s.dir===u).slice(0,2).map(s=>cap1(s.text));
    const against=sig.filter(s=>s.dir!=='neutral'&&s.dir!==u);
    if(support.length)support.forEach(t=>items.push(t));else items.push('Weighing all your answers together, your skin reads '+u);
    if(against.length)note='A couple of quiz answers leaned the other way. That is normal, so the metals and colors you know flatter you count most.';
  }
  const contrast={high:'Your hair, skin and eyes have clear contrast',low:'Your hair, skin and eyes blend softly together',medium:'Your coloring has a balanced, medium contrast'}[a.contrast];
  const chroma={bright:'You come alive in bright, saturated colors',muted:'You look best in soft, muted colors',both:'Bright and muted colors both work on you'}[a.chroma];
  if(contrast)items.push(contrast);if(chroma)items.push(chroma);
  // Her own chosen colors always get a line, so the answer clearly shows up in her report.
  if(a.compCustom){const c=colorSignals(a).find(s=>s.k==='comp');if(c&&/compliments in/.test(c.text)&&!items.some(i=>/compliments in/i.test(i)))items.unshift(cap1(c.text));}
  return{items:items.slice(0,4),note};
}
function buildBodyBullets(a,shapeData){
  const fitText={tops:'Tops fit you better than bottoms',bottoms:'Bottoms fit you better than tops',both:'Both tops and bottoms fit you well'}[a.fit]||'';
  const weightWords={belly:'your midsection',hips:'your hips and thighs',upper:'your upper body and arms'};
  const confText={shoulders:'your shoulders and collarbone',waist:'your waist',legs:'your legs',bust:'your bust',overall:'your overall silhouette'}[a.conf]||'your best features';
  const shapeName=(shapeData.shape||'').replace(/^[^A-Za-z]+/,'');
  const key=shapeName.toLowerCase().split(' ')[0];
  const art=(/^[AEIOUaeiou]/.test(shapeName)||/^hour/i.test(shapeName))?'an':'a';
  const m=bodyMarkerMatch(key,a),wHits=m.weightHits||[],items=[];
  if(m.fit&&fitText)items.push(fitText);
  if(m.weight&&wHits.length)items.push(wHits.indexOf('evenly')>-1&&wHits.length===1?'You carry weight evenly all over':'You notice weight first in '+joinList(wHits.map(w=>weightWords[w]||w)));
  items.push('Your shoulder-to-hip balance and waist definition point to '+art+' '+shapeName);
  items.push('You feel most confident in '+confText+', so every pick keeps it in view');
  const tip=proportionTipFor(key,a.height,a.proportion);
  return{items:items.slice(0,4),note:tip?"Specific to you: "+tip.charAt(0).toLowerCase()+tip.slice(1):''};
}
/* where each season sits on four scales, 0 to 1 (general 12-season guide): [cool-warm, light-deep, soft-clear contrast, muted-bright] */
const SEASON_PROFILE={lightSpring:[.75,.2,.3,.6],trueSpring:[.9,.45,.55,.8],brightSpring:[.7,.5,.8,.95],lightSummer:[.25,.2,.3,.35],trueSummer:[.1,.45,.45,.4],softSummer:[.3,.45,.3,.15],softAutumn:[.7,.5,.3,.15],trueAutumn:[.9,.65,.5,.35],deepAutumn:[.8,.9,.65,.45],brightWinter:[.3,.6,.85,.95],trueWinter:[.1,.75,.8,.75],deepWinter:[.2,.92,.75,.65]};
function seasonProfile(key){
  const p=SEASON_PROFILE[key];if(!p)return null;
  return[{label:'Undertone',a:'Cool',b:'Warm',pos:p[0]},{label:'Depth',a:'Light',b:'Deep',pos:p[1]},{label:'Contrast',a:'Soft',b:'Strong',pos:p[2]},{label:'Intensity',a:'Muted',b:'Bright',pos:p[3]}];
}

const SEASON_FAMILY = { lightSpring: 'spring', trueSpring: 'spring', brightSpring: 'spring', lightSummer: 'summer', trueSummer: 'summer', softSummer: 'summer', softAutumn: 'autumn', trueAutumn: 'autumn', deepAutumn: 'autumn', brightWinter: 'winter', trueWinter: 'winter', deepWinter: 'winter' };

const archetypesBySeasonFamily = {
  spring: { apple: 'Soft and Unbothered', pear: "She's Just Built Different", hourglass: 'The It Girl', rectangle: 'The Vibe Curator', inverted: 'Boss Energy' },
  summer: { apple: 'Confident and Clean', pear: 'Quietly Iconic', hourglass: 'Sleek and Stunning', rectangle: 'The Minimalist', inverted: 'Cool Girl Season' },
  autumn: { apple: 'Chic on Her Terms', pear: "Soft but Make it Chef's Kiss", hourglass: 'Timeless and That Girl', rectangle: "She Don't Miss", inverted: 'Strong and Stunning' },
  winter: { apple: 'Bold and Beautiful', pear: 'Rich Girl Energy', hourglass: 'Unapologetically Her', rectangle: 'The Statement', inverted: 'Powerful and Polished' }
};

const proportionTips = {
  petite: { longTorso: "Keep hemlines above the knee and reach for high-rise bottoms — this shortens the torso visually and lengthens the leg line, which matters most on a petite frame.", longLegs: "You can wear longer hemlines and midi lengths beautifully — the main thing to watch is oversized volume, which can overwhelm a petite frame fast.", balanced: "Most standard hem lengths will already work for you — a good tailor taking things in to your exact height is the single highest-impact thing you can do." },
  average: { longTorso: "High-rise bottoms and slightly cropped tops help balance a longer torso — a belt sitting right at your natural waist does a lot of the work here.", longLegs: "Midi and maxi lengths are especially flattering on you — you can wear proportions a lot of people can't pull off.", balanced: "You can wear nearly any hem length or rise comfortably — dress to the occasion rather than to the proportion." },
  tall: { longTorso: "Look for tops with a little extra body length and high-rise bottoms so the waistline doesn't sit too low on you.", longLegs: "Maxi lengths, wide-leg trousers and longline blazers all read intentional and elegant rather than overwhelming on your frame.", balanced: "Nearly every silhouette reads elongated and put-together on your frame — this is a genuine advantage, lean into it." }
};
// Height and proportion advice, adjusted where the general tip would clash with a shape's own guidance.
const proportionOverrides={
  apple:{
    petite:{longTorso:"Keep hemlines at or just above the knee and reach for smooth, contoured-waist bottoms — this shortens the torso visually and lengthens the leg line, which matters most on a petite frame."},
    average:{longTorso:"Contoured-waist bottoms and tops that end at the hip help balance a longer torso, and an open blazer or a long necklace adds a vertical line that does a lot of the work here."},
    tall:{longTorso:"Look for tops with a little extra body length and contoured-waist bottoms so the waistline doesn't sit too low on you."}
  },
  inverted:{
    tall:{longLegs:"Maxi lengths, wide-leg trousers and longline cardigans all read intentional and elegant rather than overwhelming on your frame."}
  }
};
function proportionTipFor(shapeKey,height,proportion){
  const o=proportionOverrides[shapeKey]&&proportionOverrides[shapeKey][height]&&proportionOverrides[shapeKey][height][proportion];
  if(o)return o;
  return(proportionTips[height]&&proportionTips[height][proportion])||'';
}


const colorData = {
  lightSpring: { undertone: 'Light Spring', label: 'Light Spring', desc: 'A warm undertone with light, delicate coloring. You glow in warm colors kept light and clear — not deep, not muted.', metal: 'Light Gold / Champagne — brighter gold reads better than antique or deep gold', neutrals:[{n:'Ivory',h:'#f5efe0'},{n:'Camel',h:'#d4b896'},{n:'Light Warm Gray',h:'#c9c0b3'},{n:'Soft Peach Beige',h:'#e8d4bc'}], signature:[{n:'Peach',h:'#f4a97f'},{n:'Coral',h:'#ef8354'},{n:'Light Aqua',h:'#8fd3c8'},{n:'Warm Yellow',h:'#f2c14e'},{n:'Apple Green',h:'#9bc25c'},{n:'Light Turquoise',h:'#6fc7c0'}], accents:[{n:'Champagne Gold',h:'#d9c48a'},{n:'Soft Pink Nude',h:'#f1c4bd'},{n:'Honey Tan',h:'#c99a6a'}], accessory: 'Bags — camel, ivory, light tan. Shoes — warm nude, light tan, coral. Jewelry — light/champagne gold always. Belts — light tan leather.', patterns: ['Light warm florals and watercolor prints', 'Small-to-medium scale prints in warm, clear colors', 'Soft tropical or botanical prints', 'Avoid heavy, dark, or busy large-scale prints'], avoid: 'Black, deep burgundy, icy pastels, and gray — all too heavy or cool for this light warm palette.',avoidSwatches:[{n:'Black',h:'#141414'},{n:'Deep Burgundy',h:'#5e1526'},{n:'Icy Lilac',h:'#d9d8f0'},{n:'Cool Gray',h:'#8e959c'}] },
  trueSpring: { undertone: 'True Spring', label: 'True Spring', desc: 'A classic warm undertone with clear, medium-depth coloring. You thrive in vivid, golden-based warm colors.', metal: 'Gold — bright, warm gold is the most flattering metal', neutrals:[{n:'Camel',h:'#c8a882'},{n:'Warm Ivory',h:'#f2ead8'},{n:'Golden Brown',h:'#8a6240'},{n:'Warm Khaki',h:'#b9a978'}], signature:[{n:'Coral',h:'#f2704b'},{n:'Golden Yellow',h:'#f0b429'},{n:'Kelly Green',h:'#6fae44'},{n:'Turquoise',h:'#29a89a'},{n:'Warm Red',h:'#e0472b'},{n:'Tangerine',h:'#f2884b'}], accents:[{n:'Warm Gold',h:'#d4a94c'},{n:'Cognac',h:'#a65a2e'},{n:'Peach Nude',h:'#e9a787'}], accessory: 'Bags — camel, cognac, warm brown. Shoes — warm-toned nude, tan, coral. Jewelry — gold always. Belts — cognac leather.', patterns: ['Bold warm florals and tropical prints', 'Medium-to-large scale prints', 'Tortoiseshell and warm animal prints'], avoid: 'Black, icy pastels, cool gray, mauve, and silver-based tones.',avoidSwatches:[{n:'Black',h:'#141414'},{n:'Icy Lavender',h:'#dcd9f0'},{n:'Cool Gray',h:'#9aa0a6'},{n:'Dusty Mauve',h:'#a98995'}] },
  brightSpring: { undertone: 'Bright Spring', label: 'Bright Spring', desc: 'Vivid, high-clarity coloring that sits between spring warmth and winter brightness. You glow in saturated, clean colors — never muted or dusty.', metal: 'Gold or Bright Silver — either works as long as it is bright, not antiqued', neutrals:[{n:'Bright White',h:'#fbfbfb'},{n:'Warm Charcoal',h:'#3f3a38'},{n:'Camel',h:'#c9a882'},{n:'True Navy',h:'#223350'}], signature:[{n:'Magenta',h:'#ec1f6a'},{n:'Turquoise',h:'#14b8a6'},{n:'Bright Coral',h:'#f2543d'},{n:'Butter Yellow',h:'#f2d13f'},{n:'Kelly Green',h:'#55b02e'},{n:'Cobalt Blue',h:'#4d6fe0'}], accents:[{n:'Antique Gold',h:'#b8923a'},{n:'Cherry Red',h:'#c9283a'},{n:'Cognac Leather',h:'#a85f2b'}], accessory: 'Bags — bright white, camel, true navy, statement color. Shoes — white, bright color, warm nude. Jewelry — bright gold or bright silver. Belts — camel or navy.', patterns: ['Bold graphic prints and color-blocking', 'High-contrast patterns', 'Clean geometric prints'], avoid: 'Muted or dusty tones, beige-on-beige, and anything pastel-soft or washed out.',avoidSwatches:[{n:'Dusty Taupe',h:'#a89c90'},{n:'Soft Greige',h:'#d0c8bc'},{n:'Washed Pink',h:'#e8d5d8'},{n:'Faded Sage',h:'#a9b5a2'}] },
  lightSummer: { undertone: 'Light Summer', label: 'Light Summer', desc: 'A cool undertone with a delicate, airy quality. You are flattered by soft, light cool colors — never deep or vivid ones.', metal: 'Silver or Rose Gold — soft, light metals only', neutrals:[{n:'Soft White',h:'#f4f2ee'},{n:'Light Gray',h:'#b9bdc4'},{n:'Slate Blue',h:'#a9b8c4'},{n:'Taupe',h:'#b7ada3'}], signature:[{n:'Powder Pink',h:'#eab8bf'},{n:'Periwinkle',h:'#9aa8d8'},{n:'Soft Lavender',h:'#b6a3cf'},{n:'Soft Aqua',h:'#9fcfd0'},{n:'Dusty Rose',h:'#c98fa0'},{n:'Sky Blue',h:'#a7cbe0'}], accents:[{n:'Pearl Silver',h:'#d0d3d8'},{n:'Brushed Rose Gold',h:'#a67b74'},{n:'Berry Sheer',h:'#b9607d'}], accessory: 'Bags — soft gray, blush, soft white. Shoes — cool nude, soft gray, blush. Jewelry — silver or soft rose gold. Belts — soft taupe or gray.', patterns: ['Soft watercolor florals', 'Delicate small-scale prints', 'Low-contrast tone-on-tone patterns'], avoid: 'Black, orange, mustard, and deep rich tones — all too heavy for this light cool palette.',avoidSwatches:[{n:'Black',h:'#141414'},{n:'Orange',h:'#e8762b'},{n:'Mustard Yellow',h:'#c99a2e'},{n:'Deep Chocolate',h:'#3a2418'}] },
  trueSummer: { undertone: 'True Summer', label: 'True Summer', desc: 'A classic cool undertone with soft, muted, medium-depth coloring. You are flattered by dusty, blue-based colors rather than warm or high-contrast ones.', metal: 'Silver — the most flattering metal for this palette', neutrals:[{n:'Cool Gray',h:'#9aa0a6'},{n:'Navy',h:'#33465e'},{n:'Soft White',h:'#f0f0ee'},{n:'Rosewood',h:'#baa3a0'}], signature:[{n:'Dusty Rose',h:'#c98a91'},{n:'Soft Burgundy',h:'#8f4a56'},{n:'Lavender',h:'#9c88c4'},{n:'Powder Blue',h:'#9bb8d3'},{n:'Sage',h:'#93a68c'},{n:'Mauve',h:'#a97c8a'}], accents:[{n:'Polished Silver',h:'#c3c6cb'},{n:'Black Plum',h:'#5e2a4a'},{n:'Warm Taupe Suede',h:'#7a6f66'}], accessory: 'Bags — navy, gray, soft rose. Shoes — cool-toned nude, navy, gray. Jewelry — silver always. Belts — navy or gray.', patterns: ['Soft muted florals', 'Tone-on-tone patterns', 'Gentle geometric prints'], avoid: 'Orange, warm gold, black, and bright neon — too warm or too harsh.',avoidSwatches:[{n:'Orange',h:'#e8762b'},{n:'Warm Gold',h:'#c9a24a'},{n:'Black',h:'#141414'},{n:'Neon Lime',h:'#b6f03c'}] },
  softSummer: { undertone: 'Soft Summer', label: 'Soft Summer', desc: 'A cool-neutral undertone with a soft, muted quality. You glow in dusty, blended colors — best avoiding both very bright and very warm tones.', metal: 'Silver or Pewter — brushed, not shiny', neutrals:[{n:'Taupe',h:'#a99e93'},{n:'Soft Gray',h:'#9b9691'},{n:'Dusty Navy',h:'#3e4a5c'},{n:'Greige',h:'#b0a89c'}], signature:[{n:'Dusty Teal',h:'#5b8a86'},{n:'Mauve',h:'#9a6b73'},{n:'Soft Plum',h:'#77566e'},{n:'Muted Rose',h:'#bd8b8f'},{n:'Sage Green',h:'#8a9a7e'},{n:'Slate Blue',h:'#6e7f96'}], accents:[{n:'Smoked Gray',h:'#9a9a9a'},{n:'Deep Raspberry',h:'#8c2f55'},{n:'Espresso Taupe',h:'#5f5650'}], accessory: 'Bags — taupe, dusty navy, greige. Shoes — muted rose, taupe, gray. Jewelry — brushed silver or smoked gray. Belts — taupe leather.', patterns: ['Muted tone-on-tone prints', 'Soft blended florals'], avoid: 'Bright neon, pure black, orange, and high-contrast color blocking.',avoidSwatches:[{n:'Neon Pink',h:'#ff2d95'},{n:'Pure Black',h:'#0a0a0a'},{n:'Orange',h:'#e8762b'},{n:'Electric Blue',h:'#0f4cff'}] },
  softAutumn: { undertone: 'Soft Autumn', label: 'Soft Autumn', desc: 'A warm-neutral undertone with a soft, muted quality. You are flattered by dusty earthy colors — never bright or icy ones.', metal: 'Soft Gold or Bronze — brushed, matte finishes', neutrals:[{n:'Warm Taupe',h:'#a68f74'},{n:'Soft Camel',h:'#c2a480'},{n:'Warm Gray',h:'#948575'},{n:'Mushroom',h:'#b4a690'}], signature:[{n:'Sage Green',h:'#8a9a6b'},{n:'Dusty Coral',h:'#c98a6b'},{n:'Warm Olive',h:'#7d7a4a'},{n:'Soft Rust',h:'#b56a4a'},{n:'Muted Gold',h:'#b99a55'},{n:'Terracotta',h:'#b96a4e'}], accents:[{n:'Brushed Gold',h:'#d0b77a'},{n:'Warm Brick',h:'#a4473a'},{n:'Deep Olive Suede',h:'#5e5a38'}], accessory: 'Bags — camel, olive, warm taupe. Shoes — warm muted nude, camel, olive. Jewelry — bronze or soft gold. Belts — camel or olive leather.', patterns: ['Muted botanical prints', 'Soft plaid', 'Tone-on-tone earthy prints'], avoid: 'Icy pastels, pure black, bright fuchsia, and stark white.',avoidSwatches:[{n:'Icy Lilac',h:'#d4d8f0'},{n:'Pure Black',h:'#0a0a0a'},{n:'Bright Magenta',h:'#d4087a'},{n:'Stark White',h:'#ffffff'}] },
  trueAutumn: { undertone: 'True Autumn', label: 'True Autumn', desc: 'A classic warm undertone with rich, earthy, medium-to-deep coloring. You thrive in warm, grounded colors with real depth.', metal: 'Gold or Bronze — richer, warmer golds especially', neutrals:[{n:'Camel',h:'#b98a55'},{n:'Chocolate Brown',h:'#5c3d24'},{n:'Warm Olive',h:'#6e6b3f'},{n:'Cream',h:'#ede0c8'}], signature:[{n:'Rust',h:'#b5541f'},{n:'Honey Gold',h:'#c99a2e'},{n:'Forest Green',h:'#3f6b3f'},{n:'Terracotta',h:'#d1732a'},{n:'Warm Brown',h:'#7a4a2a'},{n:'Teal',h:'#2f6b63'}], accents:[{n:'Antique Gold',h:'#c9a05a'},{n:'Oxblood Lip',h:'#6b1f1c'},{n:'Saddle Leather',h:'#9a6b3a'}], accessory: 'Bags — cognac, chocolate brown, olive. Shoes — warm-toned nude, cognac, brown. Jewelry — gold or bronze. Belts — cognac leather.', patterns: ['Rich botanical and animal prints', 'Plaid', 'Medium-to-large scale warm prints'], avoid: 'Icy pastels, black, cool gray, bubblegum pink, and silver.',avoidSwatches:[{n:'Icy Blue',h:'#d6e6f0'},{n:'Black',h:'#141414'},{n:'Cool Gray',h:'#9aa0a6'},{n:'Bubblegum Pink',h:'#f5a3c7'}] },
  deepAutumn: { undertone: 'Deep Autumn', label: 'Deep Autumn', desc: 'A warm undertone with deep, rich coloring. You are flattered by deep, saturated warm colors that match your natural depth — never pale or icy ones.', metal: 'Gold or Copper — deep, rich tones', neutrals:[{n:'Chocolate Brown',h:'#4a3220'},{n:'Deep Olive',h:'#4f4f2c'},{n:'Espresso',h:'#3a2a1e'},{n:'Warm Charcoal',h:'#3c332c'}], signature:[{n:'Deep Rust',h:'#9c3f1e'},{n:'Burnt Orange',h:'#b5541f'},{n:'Deep Teal',h:'#1f5c56'},{n:'Bronze',h:'#8a5a2e'},{n:'Deep Gold',h:'#b5892e'},{n:'Burgundy',h:'#6e2430'}], accents:[{n:'Aged Gold',h:'#c4a35a'},{n:'Deep Rose Brown',h:'#8a5a58'},{n:'Olive Suede',h:'#6a6a48'}], accessory: 'Bags — espresso, dark brown, deep jewel tone. Shoes — cognac, dark brown, bold color. Jewelry — gold or copper. Belts — dark brown leather.', patterns: ['Rich deep botanical prints', 'High-contrast warm patterns', 'Animal print'], avoid: 'Pale pastels, icy tones, silver, and light gray — all too pale for this deep warm palette.',avoidSwatches:[{n:'Icy Blue',h:'#d6e6f2'},{n:'Silver',h:'#c0c0c0'},{n:'Light Gray',h:'#d3d3d3'},{n:'Pale Pink',h:'#f2d6dc'}] },
  brightWinter: { undertone: 'Bright Winter', label: 'Bright Winter', desc: 'A cool-neutral undertone with vivid, high-clarity coloring. You come alive in saturated jewel tones and high-contrast combinations.', metal: 'Silver or White Gold — bright, clean metals', neutrals:[{n:'Bright White',h:'#fafafa'},{n:'True Black',h:'#191919'},{n:'Charcoal',h:'#322f2e'},{n:'Icy Gray',h:'#cfd3d6'}], signature:[{n:'Orchid',h:'#d4087a'},{n:'Emerald',h:'#0e8a5e'},{n:'True Red',h:'#d21f2c'},{n:'Royal Blue',h:'#1e4fd6'},{n:'Magenta',h:'#ec1f6a'},{n:'Ice Blue',h:'#7fd1e0'}], accents:[{n:'Platinum',h:'#d4d7db'},{n:'Raspberry Lip',h:'#b5124f'},{n:'Gunmetal',h:'#5f6670'}], accessory: 'Bags — black, white, jewel tone. Shoes — black, white, bold color. Jewelry — silver. Belts — black leather.', patterns: ['Bold high-contrast prints', 'Color-blocking', 'Graphic prints'], avoid: 'Muted earth tones, orange, warm camel, and dusty pastels.',avoidSwatches:[{n:'Dusty Camel',h:'#b79b7a'},{n:'Burnt Orange',h:'#c9622a'},{n:'Muted Khaki',h:'#a89f7f'},{n:'Dusty Rose',h:'#c9a3a0'}] },
  trueWinter: { undertone: 'True Winter', label: 'True Winter', desc: 'A classic cool undertone with deep, clear coloring. You are flattered by icy or jewel-toned colors with strong, cool clarity.', metal: 'Silver or Platinum — the coolest, brightest metals', neutrals:[{n:'True Black',h:'#171717'},{n:'Pure White',h:'#fbfbfb'},{n:'Charcoal',h:'#2e2e2e'},{n:'Navy',h:'#16233b'}], signature:[{n:'Emerald',h:'#0d7a52'},{n:'Sapphire',h:'#164fa3'},{n:'True Red',h:'#c8102e'},{n:'Royal Purple',h:'#4b1e78'},{n:'Icy Pink',h:'#e6a6c7'},{n:'Orchid',h:'#c2126b'}], accents:[{n:'Platinum',h:'#cfd2d6'},{n:'Plum Lip',h:'#7a1f5c'},{n:'Gunmetal',h:'#596070'}], accessory: 'Bags — black, navy, jewel tone. Shoes — black, navy, white. Jewelry — silver or platinum. Belts — black leather.', patterns: ['High-contrast graphic prints', 'Black-and-white', 'Bold color-blocking'], avoid: 'Warm earth tones, orange, mustard, camel, and muted/dusty colors.',avoidSwatches:[{n:'Camel',h:'#b98a55'},{n:'Orange',h:'#e8762b'},{n:'Mustard Yellow',h:'#c99a2e'},{n:'Dusty Sage',h:'#a3af9a'}] },
  deepWinter: { undertone: 'Deep Winter', label: 'Deep Winter', desc: 'A cool undertone with deep, rich coloring. You are flattered by deep saturated colors with cool undertones — never muted or pastel shades.', metal: 'Silver or Platinum — deep jewel tones with cool metals', neutrals:[{n:'True Black',h:'#141414'},{n:'Deep Charcoal',h:'#2a2a2a'},{n:'Pure White',h:'#f7f7f7'},{n:'Deep Navy',h:'#101c33'}], signature:[{n:'Deep Burgundy',h:'#5e1526'},{n:'Forest Green',h:'#123d2a'},{n:'Sapphire',h:'#123a7a'},{n:'Deep Purple',h:'#3a1450'},{n:'True Red',h:'#b3122a'},{n:'Deep Orchid',h:'#8a0f52'}], accents:[{n:'Platinum',h:'#c9ccd1'},{n:'Cool Rose Lip',h:'#c25a86'},{n:'Gunmetal',h:'#4a5160'}], accessory: 'Bags — black, deep jewel tone. Shoes — black, deep color. Jewelry — silver or platinum. Belts — black leather.', patterns: ['Bold deep-toned prints', 'High-contrast prints'], avoid: 'Pastels, muted earth tones, orange, and light beige.',avoidSwatches:[{n:'Pastel Lilac',h:'#d9cce8'},{n:'Muted Olive',h:'#8a8a5c'},{n:'Orange',h:'#e8762b'},{n:'Light Beige',h:'#e0d3bd'}] }
};

// Season-specific extended color guidance. One block per season, written to the palette in colorData.
// Fields: seasonal (4), occasion (4), makeup (5), hair (5), foundation (string), makeupRefs, hairRefs.
const pinQ = q => 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(q);
const seasonExtras = {
  lightSpring: {
    seasonal: [
      'Spring — your home season. Peach, warm yellow, apple green and light aqua in fresh, airy fabrics',
      'Summer — light coral, light turquoise and ivory linen. Keep everything sunny and light',
      'Autumn — camel and warm ivory as the base, with peach or apple green near your face so the heavier tones never weigh you down',
      'Winter — ivory knits and a soft camel coat, with a coral or aqua scarf for color. Skip black and charcoal'
    ],
    occasion: [
      'Casual everyday — ivory or soft peach beige with one light coral or aqua piece',
      'Work — light warm gray or camel trousers, an ivory blouse and a peach accent',
      'Evening out — coral or light turquoise in a soft fabric with champagne gold jewelry',
      'Special events — warm yellow, peach or apple green in a simple shape with champagne gold. Keep the palette light and clear'
    ],
    makeup: [
      'Lip colors — peach, light coral, warm pink and soft apricot, sheer to medium coverage',
      'Eye colors — champagne, soft gold, warm taupe and light bronze, with a touch of aqua liner for color',
      'Blush — peach, apricot, light coral and warm pink, kept sheer and glowy',
      'Brows and mascara — soft warm brown rather than harsh black, or brown mascara',
      'Skip — deep berry, brick, burgundy and heavy matte finishes. They sit on top of this coloring instead of with it'
    ],
    hair: [
      'Base — light to medium golden brown, warm honey blonde or soft strawberry',
      'Highlights — honey, soft gold and butter blonde, blended close to the root',
      'Color to try — a light strawberry blonde or golden brown melt, kept soft and low in contrast',
      'Skip — ash or icy platinum, jet black and deep burgundy',
      'Going gray — warm silver or champagne blonde blends better than a stark cool gray'
    ],
    foundation: 'Choose depth first, then undertone. Light Spring skin leans warm and clear, so look for shades labeled warm, golden, peach or yellow-beige, and be careful with anything pink or gray. At every depth the rule holds: on fair skin a light peach or golden beige, on medium skin a honey or golden beige, on deeper skin a golden or warm bronze shade that keeps its brightness. Swatch three shades along the jaw and check them in daylight. The right one disappears.',
    makeupRefs: [{ l: 'Light Spring Makeup Inspo', u: pinQ('Light Spring lip colors') }],
    hairRefs: [{ l: 'Light Spring Hair Inspo', u: pinQ('Light Spring hair color') }]
  },
  trueSpring: {
    seasonal: [
      'Spring — your home season. Coral, golden yellow, kelly green and turquoise at full strength',
      'Summer — warm red, tangerine and turquoise with warm ivory. Let the color do the work',
      'Autumn — camel, golden brown and warm khaki as the base, with a coral or kelly green piece to keep it fresh',
      'Winter — golden brown, warm ivory and a warm red coat or scarf. Skip black and icy tones'
    ],
    occasion: [
      'Casual everyday — camel or warm ivory with one coral or turquoise piece',
      'Work — golden brown or warm khaki trousers, warm ivory blouse and a kelly green accent',
      'Evening out — warm red or tangerine with gold jewelry',
      'Special events — turquoise or golden yellow in a clean silhouette with warm gold accessories'
    ],
    makeup: [
      'Lip colors — coral, warm red, tangerine, peachy pink and warm nude',
      'Eye colors — gold, warm brown, bronze, olive and turquoise liner for a pop',
      'Blush — peach, coral and warm apricot with a golden finish',
      'Brows and mascara — golden or warm brown. Black mascara is fine when you want more definition',
      'Skip — blue-based berry, mauve and cool pink, which turn gray on warm skin'
    ],
    hair: [
      'Base — golden brown, warm chestnut or golden blonde',
      'Highlights — honey, golden blonde and warm caramel',
      'Color to try — copper gloss or a warm strawberry blonde, which suit this clear warm coloring',
      'Skip — ash, platinum and blue-black',
      'Going gray — warm silver or champagne tones sit better than a cool steel gray'
    ],
    foundation: 'Choose depth first, then undertone. True Spring skin is warm and clear, so look for shades labeled warm, golden, yellow-beige or peach and avoid anything pink or ashy. At every depth the rule holds: on fair skin a golden beige, on medium skin a warm honey or sand, on deeper skin a golden caramel or warm bronze that stays bright. Test along the jaw in daylight and walk to a window before deciding.',
    makeupRefs: [{ l: 'True Spring Makeup Inspo', u: pinQ('True Spring lip colors') }],
    hairRefs: [{ l: 'True Spring Hair Inspo', u: pinQ('True Spring hair color') }]
  },
  brightSpring: {
    seasonal: [
      'Spring — your home season. Hot pink, bright coral, butter yellow and kelly green, clean and saturated',
      'Summer — turquoise, cobalt blue and bright white. High contrast looks right on you',
      'Autumn — true navy and warm charcoal as the base, with bright coral or kelly green as the accent',
      'Winter — bright white, true navy and a magenta or turquoise piece. Skip anything dusty or muted'
    ],
    occasion: [
      'Casual everyday — bright white or true navy with one magenta or turquoise piece',
      'Work — warm charcoal or true navy tailoring, a bright white shirt and one bright accent',
      'Evening out — bright coral, magenta or turquoise with gold or bright silver jewelry',
      'Special events — a single saturated color head to toe, or a high-contrast pair like navy and lemon'
    ],
    makeup: [
      'Lip colors — bright coral, magenta, warm red and clear poppy, with a glossy or satin finish',
      'Eye colors — bright navy or turquoise liner, warm brown with a gold shimmer, clear green',
      'Blush — bright coral, warm pink and clear peach, applied with a light hand',
      'Brows and mascara — dark brown to black, since you can handle strong definition',
      'Skip — dusty rose, mauve, taupe and flat matte nudes. They look faded against your clarity'
    ],
    hair: [
      'Base — dark brown, deep chestnut or a rich warm black with shine',
      'Highlights — golden caramel or bright copper in a few clean pieces',
      'Color to try — a vivid copper or glossy dark brown, since clarity matters more than lightness',
      'Skip — ash, mushroom and washed-out beige blonde',
      'Going gray — a bright silver that is kept shiny and clean, not yellowed or dull'
    ],
    foundation: 'Choose depth first, then undertone. Bright Spring sits between warm and cool, so look for shades labeled neutral-warm or golden-neutral that keep your skin looking clear, and skip anything that looks gray or heavy. At every depth the rule holds: on fair skin a light neutral-warm beige, on medium skin a clean golden or neutral beige, on deeper skin a warm or neutral shade with enough luminosity that the color does not go flat. Test along the jaw in daylight and choose the shade that makes your skin look brightest.',
    makeupRefs: [{ l: 'Bright Spring Makeup Inspo', u: pinQ('Bright Spring lip colors') }],
    hairRefs: [{ l: 'Bright Spring Hair Inspo', u: pinQ('Bright Spring hair color') }]
  },
  lightSummer: {
    seasonal: [
      'Spring — powder pink, soft aqua and sky blue in light fabrics',
      'Summer — your home season. Periwinkle, soft lavender, dusty rose and soft white together',
      'Autumn — taupe and slate blue as the base, with dusty rose near the face. Leave the rust and honey gold behind',
      'Winter — light gray, soft white and a lavender or sky blue scarf. Skip black'
    ],
    occasion: [
      'Casual everyday — soft white or light gray with one powder pink or sky blue piece',
      'Work — slate blue or taupe tailoring with a soft white blouse and a lavender accent',
      'Evening out — periwinkle or dusty rose in a soft fabric with silver or rose gold jewelry',
      'Special events — soft lavender, powder pink or sky blue in a simple silhouette with delicate silver'
    ],
    makeup: [
      'Lip colors — powder pink, rose, soft berry and a pink-toned nude, sheer to medium',
      'Eye colors — soft taupe, dove gray, light mauve and a pale lavender wash',
      'Blush — soft pink, rose and cool peach, applied lightly',
      'Brows and mascara — soft brown or brown-gray rather than black',
      'Skip — heavy dark liner, orange-based lipstick and deep brick. They overwhelm light, cool coloring'
    ],
    hair: [
      'Base — light to medium ash brown or a soft cool blonde',
      'Highlights — ash blonde, soft beige blonde and light pearl tones, blended',
      'Color to try — a soft rosy brown or a cool beige blonde with gentle dimension',
      'Skip — golden brassy blonde, copper and jet black',
      'Going gray — soft silver and pearl blend with your coloring well'
    ],
    foundation: 'Choose depth first, then undertone. Light Summer skin leans cool and delicate, so look for shades labeled cool, pink-beige or rosy neutral and avoid anything golden or orange. At every depth the rule holds: on fair skin a pink or rosy beige, on medium skin a cool or neutral-cool beige, on deeper skin a neutral-cool shade that does not turn ashy. Swatch along the jaw in daylight. A shade that makes your skin look fresher instead of warmer is the one.',
    makeupRefs: [{ l: 'Light Summer Makeup Inspo', u: pinQ('Light Summer lip colors') }],
    hairRefs: [{ l: 'Light Summer Hair Inspo', u: pinQ('Light Summer hair color') }]
  },
  trueSummer: {
    seasonal: [
      'Spring — powder blue, soft lavender and dusty rose in light, easy fabrics',
      'Summer — your home season. Dusty rose, powder blue, sage and mauve at ease together',
      'Autumn — cool gray, navy and rosewood as the base, with soft burgundy as the deeper accent. Skip warm oranges',
      'Winter — navy, cool gray and soft white, with a soft plum or lavender scarf. Softer than black'
    ],
    occasion: [
      'Casual everyday — cool gray or soft white with one dusty rose or powder blue piece',
      'Work — navy or cool gray tailoring, a soft white blouse and a mauve accent',
      'Evening out — soft burgundy, soft plum or dusty rose with silver jewelry',
      'Special events — lavender, sage or soft burgundy in a clean silhouette with silver or rose gold'
    ],
    makeup: [
      'Lip colors — dusty rose, soft raspberry, mauve and a cool pink nude',
      'Eye colors — soft gray, taupe-rose, heather and muted plum',
      'Blush — soft rose and cool pink with a satin finish',
      'Brows and mascara — soft brown or brown-black. Stark black is usually too harsh',
      'Skip — orange and brick lip colors, warm bronzers and neon shades'
    ],
    hair: [
      'Base — ash brown, cool medium brown or a soft ash blonde',
      'Highlights — ash, soft beige and cool champagne, kept low in contrast',
      'Color to try — a cool rose brown or a soft mushroom blonde',
      'Skip — golden, copper and red-brown tones',
      'Going gray — a soft silver or pearl gray is a natural match for this coloring'
    ],
    foundation: 'Choose depth first, then undertone. True Summer skin leans cool with a soft, even finish, so look for shades labeled cool, rosy or pink-beige and avoid anything golden or orange. At every depth the rule holds: on fair skin a rosy beige, on medium skin a cool or neutral-cool beige, on deeper skin a neutral-cool or rosy shade that avoids a gray cast. Check shades along the jaw in daylight and keep the one that matches your neck.',
    makeupRefs: [{ l: 'True Summer Makeup Inspo', u: pinQ('True Summer lip colors') }],
    hairRefs: [{ l: 'True Summer Hair Inspo', u: pinQ('True Summer hair color') }]
  },
  softSummer: {
    seasonal: [
      'Spring — muted rose, sage green and soft lavender in light layers',
      'Summer — your home season. Dusty teal, mauve, slate blue and muted rose in blended combinations',
      'Autumn — taupe, greige and dusty navy as the base, with soft plum as the richer accent',
      'Winter — soft gray and dusty navy with a plum or slate blue accent. Keep it blended, not stark'
    ],
    occasion: [
      'Casual everyday — taupe or greige with one muted rose or sage piece',
      'Work — dusty navy or soft gray tailoring, a soft white blouse and a slate blue accent',
      'Evening out — soft plum, mauve or dusty teal with silver or smoked gray jewelry',
      'Special events — a tonal outfit in slate blue, muted rose or soft plum with brushed metal'
    ],
    makeup: [
      'Lip colors — muted rose, mauve, soft berry and a dusty pink nude',
      'Eye colors — taupe, soft gray-brown, heather and muted plum, smudged rather than sharp',
      'Blush — muted rose and soft mauve in a skin-like finish',
      'Brows and mascara — soft brown or brown-gray, softly defined',
      'Skip — neon shades, orange and brick, and hard black liner'
    ],
    hair: [
      'Base — ash brown, mushroom brown or soft blended blonde',
      'Highlights — ash, beige and soft taupe, kept close to the base for a blended look',
      'Color to try — a soft rose brown or a mushroom tone with little contrast',
      'Skip — golden brassy blonde, vivid copper and stark black',
      'Going gray — soft silver blends beautifully with this coloring, and you can grow it out without much contrast'
    ],
    foundation: 'Choose depth first, then undertone. Soft Summer skin sits between cool and warm, so look for shades labeled neutral or neutral-cool with a soft, muted finish and avoid anything strongly golden or strongly pink. At every depth the rule holds: on fair skin a neutral beige with a hint of rose, on medium skin a neutral or soft beige, on deeper skin a neutral shade that does not look ashy or too warm. Swatch along the jaw in daylight and walk to a window.',
    makeupRefs: [{ l: 'Soft Summer Makeup Inspo', u: pinQ('Soft Summer lip colors') }],
    hairRefs: [{ l: 'Soft Summer Hair Inspo', u: pinQ('Soft Summer hair color') }]
  },
  softAutumn: {
    seasonal: [
      'Spring — sage green, dusty coral and soft peach in light, easy fabrics',
      'Summer — warm olive, muted gold and dusty coral with warm ivory. Keep the tones soft',
      'Autumn — your home season. Terracotta, soft rust, warm olive and soft camel layered together',
      'Winter — warm taupe, mushroom and warm gray with a soft rust or deep sage accent. Skip stark black and white'
    ],
    occasion: [
      'Casual everyday — soft camel or warm taupe with one sage or dusty coral piece',
      'Work — warm gray or mushroom tailoring, a cream blouse and an olive accent',
      'Evening out — terracotta, soft rust or warm olive with soft gold or bronze jewelry',
      'Special events — muted gold, sage or dusty coral in a soft fabric with brushed metal'
    ],
    makeup: [
      'Lip colors — dusty coral, soft terracotta, warm rose and a warm nude',
      'Eye colors — soft bronze, olive, warm taupe and muted gold',
      'Blush — soft peach, warm rose and dusty coral with a satin finish',
      'Brows and mascara — soft warm brown, softly defined',
      'Skip — bright orchid, icy pink and stark black liner'
    ],
    hair: [
      'Base — soft warm brown, light chestnut or a golden-brown blend',
      'Highlights — soft caramel, golden beige and muted honey, blended',
      'Color to try — a soft copper-brown melt or a warm toffee tone',
      'Skip — ash and platinum, jet black and high-contrast streaks',
      'Going gray — warm silver or champagne gray blends with this coloring'
    ],
    foundation: 'Choose depth first, then undertone. Soft Autumn skin leans warm-neutral and muted, so look for shades labeled warm-neutral, soft golden or neutral beige and avoid anything strongly pink or strongly orange. At every depth the rule holds: on fair skin a soft golden beige, on medium skin a warm sand or soft honey, on deeper skin a warm-neutral caramel or bronze with a soft finish. Test along the jaw in daylight and choose the shade that blends into your neck.',
    makeupRefs: [{ l: 'Soft Autumn Makeup Inspo', u: pinQ('Soft Autumn lip colors') }],
    hairRefs: [{ l: 'Soft Autumn Hair Inspo', u: pinQ('Soft Autumn hair color') }]
  },
  trueAutumn: {
    seasonal: [
      'Spring — warm cream, camel and a coral or teal piece. Keep the base earthy',
      'Summer — warm olive, honey gold and terracotta in light, breathable fabrics',
      'Autumn — your home season. Rust, honey gold, forest green, terracotta and warm brown all work together',
      'Winter — chocolate brown, warm olive and cream, with a rust or forest green coat. Skip black'
    ],
    occasion: [
      'Casual everyday — camel or cream with one rust, honey gold or teal piece',
      'Work — chocolate brown or warm olive tailoring, a cream blouse and a honey gold accent',
      'Evening out — rust, forest green or terracotta with gold or bronze jewelry',
      'Special events — forest green or teal with warm gold, or an all-rust outfit with copper accents'
    ],
    makeup: [
      'Lip colors — terracotta, brick, warm brown-red and a warm coral nude',
      'Eye colors — bronze, copper, olive, warm brown and deep teal liner',
      'Blush — warm peach, terracotta and soft brick',
      'Brows and mascara — warm brown or dark brown rather than blue-black',
      'Skip — cool pink, blue-red and silver-toned shimmer'
    ],
    hair: [
      'Base — warm chestnut, rich auburn-brown or golden brown',
      'Highlights — caramel, copper and warm honey',
      'Color to try — copper, auburn or a chestnut gloss',
      'Skip — ash, platinum and blue-black',
      'Going gray — warm silver or golden gray, with a gloss to keep it from yellowing'
    ],
    foundation: 'Choose depth first, then undertone. True Autumn skin is warm and rich, so look for shades labeled warm, golden or olive-golden and avoid anything pink or gray. At every depth the rule holds: on fair skin a golden beige, on medium skin a warm honey or golden olive, on deeper skin a warm caramel or golden bronze. Swatch along the jaw and check in daylight. Olive skin may need a shade with a slight green-gold cast to look natural.',
    makeupRefs: [{ l: 'True Autumn Makeup Inspo', u: pinQ('True Autumn lip colors') }],
    hairRefs: [{ l: 'True Autumn Hair Inspo', u: pinQ('True Autumn hair color') }]
  },
  deepAutumn: {
    seasonal: [
      'Spring — warm cream and deep teal with a burnt orange accent. Even your light looks should have depth',
      'Summer — deep olive, bronze and burnt orange in light fabrics, with warm cream',
      'Autumn — your home season. Deep rust, burnt orange, deep teal, bronze and burgundy',
      'Winter — chocolate brown, espresso and warm charcoal with deep gold and burgundy accents'
    ],
    occasion: [
      'Casual everyday — chocolate brown or deep olive with one burnt orange or teal piece',
      'Work — espresso or warm charcoal tailoring, a cream blouse and a deep rust accent',
      'Evening out — burgundy, deep teal or deep rust with gold or copper jewelry',
      'Special events — deep teal, burgundy or bronze in a rich fabric with deep gold accents'
    ],
    makeup: [
      'Lip colors — deep terracotta, brick, warm brown-red, burgundy and a rich warm nude',
      'Eye colors — bronze, copper, deep olive, chocolate brown and a deep teal liner',
      'Blush — warm rust, deep peach and terracotta',
      'Brows and mascara — dark brown to black-brown with a defined line',
      'Skip — pale pastel lip colors, icy shimmer and cool pink, which disappear on deep warm coloring'
    ],
    hair: [
      'Base — deep chocolate, espresso or rich dark chestnut',
      'Highlights — deep caramel, copper and auburn, kept rich and dimensional',
      'Color to try — a burgundy-brown gloss, deep copper or mahogany',
      'Skip — ash, platinum and pale blonde',
      'Going gray — a warm silver or charcoal gray, glossed to keep it rich'
    ],
    foundation: 'Choose depth first, then undertone. Deep Autumn skin is warm and rich, so look for shades labeled warm, golden, or olive-golden with enough depth in the range and avoid anything gray or ashy. At every depth the rule holds: on lighter skin a golden beige or warm sand, on medium skin a warm caramel or golden olive, on deeper skin a rich golden brown or warm mahogany. Swatch along the jaw and check in daylight, because lighting changes deep shades more than any others.',
    makeupRefs: [{ l: 'Deep Autumn Makeup Inspo', u: pinQ('Deep Autumn lip colors') }],
    hairRefs: [{ l: 'Deep Autumn Hair Inspo', u: pinQ('Deep Autumn hair color') }]
  },
  brightWinter: {
    seasonal: [
      'Spring — magenta, ice blue and bright white, kept clean and crisp',
      'Summer — royal blue, orchid and bright white. Strong contrast, never washed out',
      'Autumn — charcoal and true black as the base, with emerald or true red as the accent. Skip earthy browns',
      'Winter — your home season. True black, bright white, emerald, true red and royal blue'
    ],
    occasion: [
      'Casual everyday — bright white or true black with one orchid or royal blue piece',
      'Work — charcoal or true black tailoring, a bright white shirt and a true red accent',
      'Evening out — emerald, orchid or true red with silver or white gold jewelry',
      'Special events — royal blue, magenta or emerald in a sharp silhouette, with high contrast between pieces'
    ],
    makeup: [
      'Lip colors — true red, magenta, orchid and a clear berry, with a satin or glossy finish',
      'Eye colors — charcoal, navy, icy silver, emerald and a crisp black liner',
      'Blush — clear pink, cool coral and a bright rose, applied lightly',
      'Brows and mascara — dark brown to black, with a defined line',
      'Skip — muted taupe, dusty rose and warm bronze, which flatten your clarity'
    ],
    hair: [
      'Base — dark brown, espresso or rich blue-black with shine',
      'Highlights — a few cool, clean pieces. Ash brown or deep plum tones work well',
      'Color to try — a glossy black-cherry or a deep cool brown',
      'Skip — golden blonde, copper and warm caramel',
      'Going gray — a bright, clean silver or white, kept shiny and not yellowed'
    ],
    foundation: 'Choose depth first, then undertone. Bright Winter skin is clear with a cool-neutral lean, so look for shades labeled neutral-cool, rosy neutral or cool beige and avoid anything golden or muddy. At every depth the rule holds: on fair skin a clean porcelain or rosy beige, on medium skin a neutral-cool beige, on deeper skin a neutral or cool-leaning brown with a clean finish and no gray cast. Check along the jaw in daylight and choose the one that keeps your skin looking clear.',
    makeupRefs: [{ l: 'Bright Winter Makeup Inspo', u: pinQ('Bright Winter lip colors') }],
    hairRefs: [{ l: 'Bright Winter Hair Inspo', u: pinQ('Bright Winter hair color') }]
  },
  trueWinter: {
    seasonal: [
      'Spring — icy pink, ice blue and pure white, clean and cold',
      'Summer — royal purple, orchid and pure white. High contrast, never muted',
      'Autumn — charcoal and navy as the base, with emerald or sapphire as the accent. Skip warm browns',
      'Winter — your home season. True black, pure white, sapphire, emerald and true red'
    ],
    occasion: [
      'Casual everyday — pure white or navy with one sapphire or icy pink piece',
      'Work — true black, charcoal or navy tailoring, a pure white shirt and a true red accent',
      'Evening out — emerald, royal purple or sapphire with silver or platinum jewelry',
      'Special events — true red, sapphire or emerald in a sharp, clean silhouette with silver accents'
    ],
    makeup: [
      'Lip colors — true red, blue-red, cool berry, orchid and a cool pink',
      'Eye colors — charcoal, silver, navy, plum and a crisp black liner',
      'Blush — cool pink, rose and a clear berry',
      'Brows and mascara — dark brown to black with clean definition',
      'Skip — orange, golden bronze and warm peach'
    ],
    hair: [
      'Base — dark brown, espresso or blue-black',
      'Highlights — cool, subtle ash pieces, or none. Contrast looks natural on you',
      'Color to try — a deep cool brown, black-cherry or blue-black gloss',
      'Skip — golden blonde, honey and copper',
      'Going gray — silver or white gray is among the best matches for this coloring'
    ],
    foundation: 'Choose depth first, then undertone. True Winter skin leans cool and clear, so look for shades labeled cool, rosy, pink-beige or blue-toned and avoid anything golden or orange. At every depth the rule holds: on fair skin a porcelain or pink-beige, on medium skin a cool or neutral-cool beige, on deeper skin a cool-leaning brown or rich blue-toned shade that does not turn ashy. Swatch along the jaw and check in daylight.',
    makeupRefs: [{ l: 'True Winter Makeup Inspo', u: pinQ('True Winter lip colors') }],
    hairRefs: [{ l: 'True Winter Hair Inspo', u: pinQ('True Winter hair color') }]
  },
  deepWinter: {
    seasonal: [
      'Spring — pure white with deep emerald or sapphire. Keep it crisp and keep it deep',
      'Summer — pure white, deep orchid and sapphire. Choose bold over pastel',
      'Autumn — deep navy and deep charcoal as the base, with forest green or deep burgundy as the accent',
      'Winter — your home season. True black, pure white, deep burgundy, forest green and sapphire'
    ],
    occasion: [
      'Casual everyday — pure white or deep navy with one sapphire or deep orchid piece',
      'Work — true black or deep charcoal tailoring, a pure white shirt and a deep burgundy accent',
      'Evening out — deep purple, sapphire or true red with silver or platinum jewelry',
      'Special events — forest green, deep burgundy or deep purple in a rich fabric with silver accents'
    ],
    makeup: [
      'Lip colors — deep berry, burgundy, blue-red, plum and a deep cool rose',
      'Eye colors — charcoal, deep plum, navy, silver and a defined black liner',
      'Blush — deep rose, berry and cool plum-pink',
      'Brows and mascara — dark brown to black with a defined line',
      'Skip — orange, terracotta, golden bronze and pale pastel lip colors'
    ],
    hair: [
      'Base — deep espresso, dark brown or blue-black',
      'Highlights — cool, deep dimension. Plum, black-cherry or dark ash tones if you want it',
      'Color to try — a black-cherry or deep burgundy-brown gloss',
      'Skip — golden blonde, honey, copper and auburn',
      'Going gray — silver or white against deep hair is striking, and a cool gloss keeps it crisp'
    ],
    foundation: 'Choose depth first, then undertone. Deep Winter skin leans cool or neutral-cool with real depth, so look for shades labeled cool, neutral-cool, rich blue-toned or deep rosy and avoid anything that reads golden, orange or ashy. At every depth the rule holds: on lighter skin a cool or rosy beige, on medium skin a neutral-cool tan or cool olive, on deeper skin a rich cool or blue-toned brown. Swatch along the jaw and check in daylight, since lighting changes deep shades more than any others.',
    makeupRefs: [{ l: 'Deep Winter Makeup Inspo', u: pinQ('Deep Winter lip colors') }],
    hairRefs: [{ l: 'Deep Winter Hair Inspo', u: pinQ('Deep Winter hair color') }]
  }
};


const bodyData = {
  apple: { shape: 'Apple Shape', desc: 'Weight carried in the midsection with slimmer legs and less defined waist.', goal: 'Create the illusion of a defined waist while drawing attention to beautiful legs and neckline.', sils: ['A-line dresses and skirts', 'Empire waist styles', 'Shirt dresses worn open or with a soft sash below the bust', 'Fit and flare silhouettes', 'Maxi dresses with a defined waistline'], tops: ['V-necks and deep scoop necks', 'Off shoulder styles', 'Flowy tops that skim the body', 'Structured blazers worn open', 'Empire-waist blouses'], bots: ['Wide leg trousers in dark colors', 'Straight leg pants in dark colors', 'A-line midi skirts', 'Flowy maxi skirts'], acc: ['Statement earrings', 'Long necklaces', 'Simple belts worn just under the bust', 'Heels'], avd: ['Tight fitted tops that cling around the midsection', 'Cropped tops that end at the belly', 'Belts cinched at the natural waist', 'Bodycon dresses'], fabGood: 'Structured woven fabrics — cotton, linen and ponte. Flowy chiffon and georgette for tops.', fabAvoid: 'Clingy jersey and spandex around the midsection. Satin and silk that highlight the midsection.', shopKeywords: 'belted shirt dress, A-line dress, empire waist, flowy top, V-neck blouse, wide leg pants, midi A-line skirt' },
  pear: { shape: 'Pear Shape', desc: 'Narrower shoulders and bust with fuller hips and thighs. Beautifully defined waist.', goal: 'Balance the silhouette by drawing attention to the upper body and highlighting the defined waist.', sils: ['A-line skirts and dresses', 'Peplum tops that nip in at the waist', 'Fit and flare dresses', 'High waisted wide leg trousers'], tops: ['Boat necks and wide scoop necks', 'Off shoulder and cold shoulder tops', 'Bold prints and bright colors on top', 'Statement collars', 'Puff sleeves'], bots: ['Wide leg trousers in dark solid colors', 'A-line skirts in any length', 'Flowy midi skirts', 'Dark wash straight leg jeans'], acc: ['Statement necklaces and earrings', 'Bold scarves or statement collars', 'Belts at natural waist'], avd: ['Clingy fabrics on hips and thighs', 'Horizontal stripes on the bottom half', 'Pencil skirts and bodycon', 'Skinny jeans with fitted tops'], fabGood: 'Structured fabrics on bottom — denim, ponte, thick cotton. Flowy and textured fabrics on top.', fabAvoid: 'Clingy jersey on hips and thighs. Satin or shiny fabrics below the waist.', shopKeywords: 'A-line dress, peplum top, wide leg trousers, off shoulder top, bold print blouse, puff sleeve top' },
  hourglass: { shape: 'Hourglass Shape', desc: 'Balanced bust and hips with a beautifully defined waist. Almost every silhouette works.', goal: 'Celebrate and highlight natural curves and defined waist.', sils: ['Bodycon dresses', 'Fit and flare dresses', 'Belted styles in any silhouette', 'Pencil skirts with a fitted top'], tops: ['Corset-inspired tops', 'V-necks that follow the body naturally', 'Fitted and tailored tops', 'Button down shirts tied at the waist'], bots: ['High waisted everything', 'Pencil skirts and midi skirts', 'Wide leg and straight leg trousers'], acc: ['Belts, worn whenever possible', 'Statement jewelry in any style'], avd: ['Boxy oversized shapes that hide the waist', 'Drop waist styles', 'Shapeless shift dresses'], fabGood: 'Almost everything works — stretchy fabrics that follow curves, structured wovens, draped fabrics.', fabAvoid: 'Very stiff boxy fabrics that fight the curves.', shopKeywords: 'bodycon dress, fitted dress, belted dress, high waisted jeans, pencil skirt, fit and flare, tailored blazer' },
  rectangle: { shape: 'Rectangle Shape', desc: 'Measurements are similar throughout. Athletic build with less defined waist.', goal: 'Create curves and waist definition through silhouette, layering and strategic details.', sils: ['Peplum tops and dresses', 'Belted styles', 'Fit and flare dresses', 'Corset-style tops and dresses'], tops: ['Peplum tops', 'Ruffles and embellishments', 'Crop tops with high waisted bottoms', 'Strategic layering — blazers and jackets'], bots: ['Full and A-line skirts', 'Wide leg trousers with a fitted belted top', 'Pleated skirts'], acc: ['Wide belts at the natural waist', 'Statement earrings and necklaces', 'Layered jewelry'], avd: ['Straight shift dresses with no shape', 'Boxy silhouettes with no definition', 'Dropped waist styles'], fabGood: 'Structured fabrics that add shape — ponte, thick cotton, denim. Fabrics with texture.', fabAvoid: 'Very soft drapey fabrics with no structure.', shopKeywords: 'peplum top, peplum dress, belted dress, fit and flare dress, corset top, ruffled skirt, A-line skirt' },
  inverted: { shape: 'Inverted Triangle Shape', desc: 'Broader shoulders and fuller bust with narrower hips.', goal: 'Balance the strong upper body by drawing attention downward and adding volume to hips and legs.', sils: ['Wide leg trousers with a simple top', 'A-line and flared skirts', 'Fit and flare dresses', 'Maxi skirts with volume'], tops: ['V-necks and scoop necks', 'Simple halter necks', 'Dark solid colors on top', 'Simple fitted tees with statement bottoms'], bots: ['Bold prints and bright colors on bottom', 'Wide leg and flared trousers', 'Full and A-line skirts'], acc: ['Long pendant necklaces', 'Hip bags and belt bags', 'Ankle boots and statement shoes'], avd: ['Boat necks and very wide necklines', 'Shoulder pads and puff sleeves', 'Strapless styles that emphasize shoulders'], fabGood: 'Flowy fabrics on the bottom — chiffon, georgette, flared denim. Simple structured fabrics on top.', fabAvoid: 'Stiff structured fabrics on top that add shoulder width.', shopKeywords: 'wide leg pants, flared trousers, A-line skirt, tiered skirt, bold print skirt, V-neck top' }
};

/* Body shape and intensity from the three proportion answers (same rules as the stylist tools). */
function computeBodyShape(a){
  const score={apple:0,pear:0,hourglass:0,rectangle:0,inverted:0};
  // Pear is only possible when the hips really are wider than the shoulders.
  const hipsWider=['hipsSlightlyWider','hipsMuchWider','hipsWiderShouldersFull'].indexOf(a.shoulderHip)>-1;
  if(a.shoulderHip==='shouldersMuchWider')score.inverted+=2;
  if(a.shoulderHip==='shouldersSlightlyWider')score.inverted+=2;
  if(a.shoulderHip==='hipsMuchWider')score.pear+=2;
  if(a.shoulderHip==='hipsSlightlyWider')score.pear+=2;
  if(a.shoulderHip==='hipsWiderShouldersFull')score.pear+=1;
  if(a.shoulderHip==='equal'){score.hourglass+=2;score.rectangle+=2;}
  if(a.waistDef==='veryDefined'){score.hourglass+=2;score.inverted+=1;if(hipsWider)score.pear+=1;}
  if(a.waistDef==='slightlyDefined'){score.inverted+=1;score.rectangle+=1;if(hipsWider)score.pear+=1;}
  if(a.waistDef==='barelyDefined')score.rectangle+=2;
  if(a.waistDef==='fullMidsection')score.apple+=3;
  if(a.bustHip==='bustMuchLarger'){score.apple+=1;score.inverted+=1;}
  if(a.bustHip==='bustSlightlyLarger'){score.apple+=1;score.inverted+=1;}
  if(a.bustHip==='hipsMuchLarger')score.pear+=2;
  if(a.bustHip==='hipsSlightlyLarger')score.pear+=2;
  if(a.bustHip==='roughlyEqual'){score.hourglass+=2;score.rectangle+=2;}
  if(a.bustHip==='fullBoth'){score.hourglass+=1;score.apple+=1;}
  if(!hipsWider)score.pear=-1;
  let best='hourglass',bestScore=-1;
  const order=['hourglass','pear','inverted','apple','rectangle'];
  order.forEach(k=>{if(score[k]>bestScore){bestScore=score[k];best=k;}});
  return best;
}

function computeIntensity(shape,a){
  if(shape==='pear'||shape==='hourglass'){
    if(a.waistDef==='veryDefined')return 'defined';
    if(a.waistDef==='slightlyDefined')return 'soft';
    return 'plain';
  }
  if(shape==='inverted'){
    if(a.shoulderHip==='shouldersMuchWider')return 'defined';
    if(a.shoulderHip==='shouldersSlightlyWider')return 'soft';
    return 'plain';
  }
  if(shape==='apple'){
    if(a.waistDef==='fullMidsection')return 'defined';
    if(a.waistDef==='barelyDefined')return 'plain';
    return 'soft';
  }
  if(shape==='rectangle'){
    const closeCount=(a.shoulderHip==='equal'?1:0)+(a.bustHip==='roughlyEqual'?1:0);
    return closeCount===2?'defined':'soft';
  }
  return 'plain';
}

/* ----- Age-aware Style Persona (shared wording with the quiz and the stylist tools) ----- */
/* ===== Style Persona (age-aware) =====
   Inputs on the answers object: ageBracket ('18-24'|'25-34'|'35-44'|'45+'), pq1, pq2, pq3.
   Output: { vibe, name, tagline, formula:[a,b,c], rule, fabricNote } */
const PERSONA_VIBES = ['luxury','tailored','sleek','feminine','casual','bold','classic','sporty'];
const PERSONA_TABLE = {
  luxury:   { young:{name:'Rich Auntie in Training',tagline:'Never underdressed, always smells expensive, and already owns a trench coat you swear by.'},
              mature:{name:'Certified Rich Auntie',tagline:'Never underdressed, always has the best coat in the room, and knows your tailor by first name.'},
              formula:['Structured Trench or Blazer','Monochrome Knit Base','Pointed Toe & Gold Hardware'],
              rule:'Permission granted to skip the logo. Quality shows in the cut and the fabric, so one great coat does more than three trendy pieces.' },
  tailored: { young:{name:'Boardroom Baddie',tagline:"You look like you're running a Fortune 500 meeting even when you're just picking up an iced matcha."},
              mature:{name:'Corner Office Chic',tagline:'You make a sharp blazer and tailored trousers look completely effortless, and you always mean business.'},
              formula:['Sharp Tailored Blazer','Straight-Leg Trouser','Pointed Flat or Loafer'],
              rule:"Permission granted to soften the blazer. Pair it with a silk top or a relaxed trouser, because sharp doesn't have to mean stiff." },
  sleek:    { young:{name:'The Black Cat',tagline:'Sleek, magnetic, and effortlessly cool: you favor sharp silhouettes, dark neutrals, and pieces that speak without trying too hard.'},
              mature:{name:'The Black Cat',tagline:'Sleek, magnetic, and effortlessly cool: you favor sharp silhouettes, dark neutrals, and pieces that speak without trying too hard.'},
              formula:['Sharp-Shouldered Outerwear','Sleek Column Silhouette','Architectural Bag & Dark Lenses'],
              rule:'Permission granted to add one color. All-dark works because of contrast in texture, so a single rich accent from your palette keeps it from reading flat.' },
  feminine: { young:{name:'Coquette Couture',tagline:'You love flattering waistlines, soft textures, and dainty gold details that make everyday dressing feel special.'},
              mature:{name:'Soft Power',tagline:'You gravitate toward fluid fabrics, sculpted silhouettes, and romantic details with a refined, grown-woman finish.'},
              formula:['Fluid Midi or Soft Knit','Defined Waist','Dainty Gold Jewelry'],
              rule:'Permission granted to skip the ruffle. Romantic can be a clean line and a soft fabric, and one delicate detail is enough.' },
  casual:   { young:{name:'Denim Darling',tagline:'You make everyday jeans, a sleek tank, and the right bag look like a full styling session.'},
              mature:{name:'Modern Muse',tagline:'You master relaxed luxury: great tailoring, soft knits, and clean lines that never look overdone.'},
              formulaYoung:['Great-Fitting Straight Denim','Elevated Crisp Tank or Tee','Intentional Belt & Leather Tote'],
              formulaMature:['Relaxed Tailored Trouser','Soft Knit Layer','Clean Leather Loafer'],
              rule:'Permission granted to dress up the denim. Casual-chic comes from one polished element, so a sharp shoe or a structured bag finishes the look.' },
  bold:     { young:{name:'Dress Code: Extra',tagline:'You were never meant to blend into the background. You own dramatic sleeves, bold prints, and statement heels with zero apologies.'},
              mature:{name:'The Showstopper',tagline:'You dress to be remembered, embracing rich color, sculptural silhouettes, and standout pieces with complete confidence.'},
              formula:['One Statement Piece: Sleeve, Print or Cut','Clean Neutral Base','Statement Heel or Bag'],
              rule:"Permission granted to ignore 'less is more.' Your coloring and presence carry bold proportions, so when everyone else plays it safe in beige, you're meant to wear the color and the sleeve." },
  classic:  { young:{name:'Chic & Coordinated',tagline:'You love a crisp matching set, a structured handbag, and polished pieces that take you straight from daytime plans to dinner.'},
              mature:{name:'Polished Society',tagline:'You love a crisp matching set, structured leather, and classic silhouettes with a modern twist.'},
              formula:['Crisp Matching Set','Structured Bag','Polished Flat or Heel'],
              rule:'Permission granted to break up the set. Wear the blazer with jeans and the trousers with a tee, because matching is a starting point, not a rule.' },
  sporty:   { young:{name:'Pilates Princess',tagline:'You live in matching sets, sleek sunglasses, and clean sneakers, and you always look put-together on the go.'},
              mature:{name:'Off-Duty Luxe',tagline:'You elevate everyday comfort with sleek matching sets, structured outerwear, and crisp sneakers.'},
              formula:['Sleek Matching Set','Structured Outerwear','Crisp Sneaker & Sleek Sunglasses'],
              rule:'Permission granted to wear the sneaker with something structured. Athleisure looks luxe when one piece is tailored.' }
};
const PERSONA_FABRIC = { tailored:'Structured wovens', feminine:'Fluid silk and jersey', luxury:'Luxe knits and wool', casual:'Breathable cotton and denim', bold:'Sculptural and textured fabrics' };
const PQ1_VIBE = { blazer:'tailored', casual:'casual', feminine:'feminine', allblack:'sleek', bold:'bold', set:'classic', sporty:'sporty' };
const PQ2_VIBE = { tailored:'tailored', drape:'feminine', quality:'luxury', effortless:'casual', drama:'bold' };
function computePersona(a){
  a = a || {};
  const score = {}; PERSONA_VIBES.forEach(v => score[v] = 0);
  const v1 = PQ1_VIBE[a.pq1], v2 = PQ2_VIBE[a.pq2];
  if (v1) score[v1] += 2;
  if (v2) score[v2] += 2;
  // Q3: monochrome -> sleek; matching set -> classic; outerwear -> luxury, or sporty when her default move is the athleisure set;
  // one standout piece -> bold when either earlier answer was bold, otherwise casual
  if (a.pq3 === 'mono') score.sleek += 1;
  else if (a.pq3 === 'set') score.classic += 1;
  else if (a.pq3 === 'outerwear') score[v1 === 'sporty' ? 'sporty' : 'luxury'] += 1;
  else if (a.pq3 === 'standout') score[(v1 === 'bold' || v2 === 'bold') ? 'bold' : 'casual'] += 1;
  let best = null;
  const order = [v1, v2].concat(PERSONA_VIBES); // ties: default move first, then what sold her, then list order
  order.forEach(v => { if (v && (best === null || score[v] > score[best])) best = v; });
  if (!best) best = 'tailored';
  const t = PERSONA_TABLE[best];
  const mature = a.ageBracket === '35-44' || a.ageBracket === '45+';
  const who = mature ? t.mature : t.young;
  const formula = best === 'casual' ? (mature ? t.formulaMature : t.formulaYoung) : t.formula;
  return { vibe: best, name: who.name, tagline: who.tagline, formula: formula.slice(), rule: t.rule, fabricNote: PERSONA_FABRIC[best] || '' };
}



/* ---------- Shopping links: stores by age bracket and price comfort ----------
   Every store carries wide size ranges. Each chip in the report opens a live search at one of these.
   NOTE: search URL formats are set by the retailers and can change. Open /shop-link-test (preview) or click
   each store once after any change. Stores avoided on purpose: Zara, Lululemon, SSENSE, Net-a-Porter,
   Farfetch, Everlane, Eloquii (their search links are unreliable). */
const S = {
  oldnavy: ['Old Navy', 'https://oldnavy.gap.com/browse/search.do?searchText='],
  asos: ['ASOS', 'https://www.asos.com/us/search/?q='],
  target: ['Target', 'https://www.target.com/s?searchTerm='],
  hm: ['H&M', 'https://www2.hm.com/en_us/search-results.html?q='],
  abercrombie: ['Abercrombie', 'https://www.abercrombie.com/shop/us/search?searchTerm='],
  aritzia: ['Aritzia', 'https://www.aritzia.com/us/en/search?q='],
  madewell: ['Madewell', 'https://www.madewell.com/search?q='],
  mango: ['Mango', 'https://shop.mango.com/us/en/search?kw='],
  reformation: ['Reformation', 'https://www.thereformation.com/search?q='],
  nordstrom: ['Nordstrom', 'https://www.nordstrom.com/sr?keyword='],
  saks: ['Saks Fifth Avenue', 'https://www.saksfifthavenue.com/search?q='],
  anthropologie: ['Anthropologie', 'https://www.anthropologie.com/search?q='],
  quince: ['Quince', 'https://www.quince.com/search?q='],
  gap: ['Gap', 'https://www.gap.com/browse/search.do?searchText='],
  uniqlo: ['Uniqlo', 'https://www.uniqlo.com/us/en/search?q='],
  bananarepublic: ['Banana Republic', 'https://bananarepublic.gap.com/browse/search.do?searchText='],
  jcrew: ['J.Crew', 'https://www.jcrew.com/r/search?N=0&Nloc=en&Ntrm='],
  mmlafleur: ['MM.LaFleur', 'https://mmlafleur.com/search?q='],
  loft: ['LOFT', 'https://www.loft.com/search?q='],
  anntaylor: ['Ann Taylor', 'https://www.anntaylor.com/search?q='],
  boden: ['Boden', 'https://www.bodenusa.com/en-us/search?q='],
  universalstandard: ['Universal Standard', 'https://www.universalstandard.com/search?q='],
  landsend: ["Lands' End", 'https://www.landsend.com/search?q='],
  jjill: ['J.Jill', 'https://www.jjill.com/search?q='],
  talbots: ['Talbots', 'https://www.talbots.com/search?q='],
  chicos: ["Chico's", 'https://www.chicos.com/store/search/?q='],
  eileenfisher: ['Eileen Fisher', 'https://www.eileenfisher.com/search?q=']
};
const STORE_DIR = {
  '18-24': { budget: ['oldnavy','asos','target','hm'], mid: ['abercrombie','aritzia','madewell','mango'], invest: ['reformation','nordstrom','saks','anthropologie'] },
  '25-34': { budget: ['quince','gap','mango','uniqlo'], mid: ['madewell','bananarepublic','abercrombie','jcrew'], invest: ['nordstrom','reformation','mmlafleur','saks'] },
  '35-44': { budget: ['quince','loft','gap','oldnavy'], mid: ['jcrew','bananarepublic','anntaylor','boden'], invest: ['nordstrom','universalstandard','mmlafleur','saks'] },
  '45+':   { budget: ['quince','landsend','loft','jjill'], mid: ['talbots','chicos','jcrew','bananarepublic'], invest: ['nordstrom','eileenfisher','universalstandard','saks'] }
};
/* ---------- Age-tailored color + cut pairings for the shopping links ----------
   18-34: trend-forward cuts and shades (the shape's own shopKeywords, e.g. corset top, apple green).
   35+:   classic, elevated cuts, and trendier color names are swapped for classic ones (apple green -> sage). */
const SHOP_CUTS_CLASSIC = {
  apple: 'wrap dress, belted shirt dress, A-line dress, silk blouse, V-neck knit top, wide leg trousers, tailored blazer',
  pear: 'A-line dress, tailored blazer, silk blouse, wide leg trousers, structured shoulder top, wrap top',
  hourglass: 'wrap dress, tailored blazer, silk blouse, high waisted trousers, pencil skirt, belted dress, fit and flare dress',
  rectangle: 'peplum top, wrap dress, belted dress, tailored blazer, silk blouse, A-line skirt, fit and flare dress',
  inverted: 'wide leg trousers, A-line skirt, V-neck top, flared trousers, tiered midi skirt, soft draped blouse'
};
const CLASSIC_COLOR_ALIAS = { 'Apple Green': 'Sage', 'Butter Yellow': 'Champagne', 'Kelly Green': 'Emerald', 'Magenta': 'Raspberry', 'Orchid': 'Plum', 'Cobalt Blue': 'Sapphire', 'Light Turquoise': 'Soft Teal', 'Light Aqua': 'Soft Aqua', 'Warm Yellow': 'Honey' };
const SHOP_TIERS = {
  budget: { key: 'budget', label: 'Everyday ($25–$75)' },
  mid: { key: 'mid', label: 'Mid-range ($75–$200)' },
  invest: { key: 'invest', label: 'Investment ($200+)' }
};
function shopTier(a){ return SHOP_TIERS[a && a.budget] || SHOP_TIERS.mid; }
function isMatureAge(a){ return !!a && (a.ageBracket === '35-44' || a.ageBracket === '45+'); }
function buildShopLinks(a, signature, keywords, neutrals, shapeKey){
  const age = STORE_DIR[a && a.ageBracket] ? a.ageBracket : '25-34';
  const tier = shopTier(a).key;
  const stores = STORE_DIR[age][tier].map(k => S[k]);
  const mature = isMatureAge(a);
  const cutSrc = mature && SHOP_CUTS_CLASSIC[shapeKey] ? SHOP_CUTS_CLASSIC[shapeKey] : keywords;
  const kws = String(cutSrc || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 6);
  const sig = (signature && signature.length) ? signature.slice() : [{ n: '' }];
  let colors;
  if (mature) {
    // classic color names, with a couple of neutrals mixed in (camel silk blouse, ivory tailored blazer)
    const neu = (neutrals || []).slice(0, 3);
    colors = [];
    for (let i = 0; i < kws.length; i++) {
      const c = (i % 2 === 1 && neu.length) ? neu[Math.floor(i / 2) % neu.length] : sig[Math.floor((i + 1) / 2) % sig.length];
      colors.push(CLASSIC_COLOR_ALIAS[c.n] || c.n);
    }
  } else {
    colors = kws.map((k, i) => sig[i % sig.length].n);
  }
  return kws.map((k, i) => {
    const q = (colors[i] + ' ' + k).trim();
    const st = stores[i % stores.length];
    return { q, store: st[0], url: st[1] + encodeURIComponent(q).replace(/%20/g, '+') };
  });
}

module.exports = {
  buildShopLinks,
  shopTier,
  isMatureAge,
  STORE_DIR,
  STORES: S,
  computePersona,
  computeBodyShape,
  computeIntensity,
  computeColorAxes,
  getSeason,
  SEASON_FAMILY,
  archetypesBySeasonFamily,
  proportionTips,
  colorData,
  seasonExtras,
  colorSignals,
  joinList,
  bodyMarkerMatch,
  buildColorNarrative,
  buildColorBullets,
  buildBodyBullets,
  seasonProfile,
  buildBodyNarrative,
  proportionTipFor,
  bodyData
};
