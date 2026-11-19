/* HerStyleVault stylist-tool report kit: gives the tools' client PDF the same look as the Signature Style Report.
   Generated into each tool by tools-kit/apply_kit.py. Do not hand-edit inside the tool files. */
const HSVK=(function(){
/*__ENGINE__*/
return{layoutPages,prepCroq,pdfPage,pdfFoot,esc,coverNameSize,getLayout:()=>LAYOUT,makeBlocks};
})();
/*__KNOW__*/
window.HSV_HEAD=(typeof PKG_NAME!=='undefined'?PKG_NAME+' ':'')+'Style Analysis';
const HSV_COVER_BG='__COVER__';
function pdfFoot(label){
  const h=String(label||'').replace(/\s[—–-]\s/g,' · ');
  return '<div class="pdf-head">'+pdfEsc(h)+' · HerStyleVault</div><div class="pdf-foot"><span>For personal use only · © '+new Date().getFullYear()+' HerStyleVault</span></div>';
}
const _hsvOldBuild=buildPdfPages;
function hsvToReport(){
  const name=(document.getElementById('cn-color').value||document.getElementById('cn-body').value||'Client').trim()||'Client';
  const g=getSeason(CA),sk=g.key,axes=g.axes,d=colorData[sk],shape=BA.shape,bd=bodyData[shape];
  const lc=t=>t?t.charAt(0).toLowerCase()+t.slice(1):t,se=t=>String(t||'').replace(/[.\s]+$/,'');
  const head=t=>String(t||'').split(/\s[\u2014\u2013-]\s/)[0];
  const avd=(bd.avd||[]).slice(0,3).map(x=>lc(se(head(x))));
  const grav=BA.styleGrav;
  const pref=s=>{const t=String(s).toLowerCase();
    if(grav==='flowy')return /flow|a-line|maxi|wrap/.test(t)?1:0;
    if(grav==='fitted')return /fit|structured|wrap|belt|corset|bodycon|pencil/.test(t)?1:0;
    if(grav==='waist')return /waist|belt|wrap|fit and flare|peplum|corset/.test(t)?1:0;
    if(BA.dressSep==='dresses')return /dress/.test(t)?1:0;
    if(BA.dressSep==='separates')return /trouser|pant|skirt|top|jean/.test(t)?1:0;return 0;};
  const sils=(bd.sils||[]).map((s,i)=>({s,i,p:pref(s)})).sort((a,b)=>b.p-a.p||a.i-b.i).slice(0,3).map(x=>({text:head(x.s),reason:''}));
  const pa=typeof personaAnswered==='function'&&personaAnswered();
  return{clientName:name,seasonKey:sk,seasonLabel:d.label||d.undertone,seasonDesc:d.desc,metal:d.metal,neutrals:d.neutrals,signature:d.signature,accents:d.accents||[],
    colorAvoid:d.avoid,avoidSwatches:d.avoidSwatches||[],avoidText:avd.length?'Skip '+joinList(avd)+'.':'Skip anything boxy or shapeless that hides your proportions.',
    whyColor:buildColorBullets(CA,axes,d),whyBody:buildBodyBullets(BA,bd),colorProfile:seasonProfile(sk),
    height:BA.height||'average',proportion:BA.proportion||'balanced',intensity:BA.intensity,bodyShapeKey:shape,
    bodyShapeDesc:intensityDesc(shape,BA.intensity),bodyGoal:bd.goal,
    bodyGuide:{tops:bd.tops||bd.necks||[],bots:bd.bots||[],acc:bd.acc||[],avd:bd.avd||[],fabGood:bd.fabGood,fabAvoid:bd.fabAvoid},
    silhouettes:sils,ageBracket:BA.ageBracket||'',personaAnswered:pa,persona:pa?computePersona(BA):null};
}
async function buildPdfPagesNew(){
  const old=_hsvOldBuild();
  const r=hsvToReport();
  await HSVK.prepCroq(r);await HSVK.layoutPages(r);
  const blocks=HSVK.makeBlocks(r),by={};blocks.forEach(b=>{by[b.key]=b;});
  const core=HSVK.getLayout().map(keys=>{const bs=keys.map(k=>by[k]);
    return HSVK.pdfPage('',bs.map((b,i)=>'<div class="'+(i?'pdf-blk-n':'')+'">'+b.html+'</div>').join('')+HSVK.pdfFoot());});
  const keep=old.filter(h=>!/pdf-cover|pdf-closing|pdf-persona-name|pdf-colorband|pdf-bodyrow/.test(h)).map(h=>h.replace('<h1 class="pdf-h1">Your <em>Palette</em></h1>','<h1 class="pdf-h1">Palette <em>Pin-spiration</em></h1>'));
  const cover=HSVK.pdfPage('pdf-cover2','<img class="pdf-cover-bg" src="'+HSV_COVER_BG+'" alt=""><div class="pdf-cover-label">'+pdfEsc(typeof PKG_NAME!=='undefined'?PKG_NAME+' · Style Analysis':'Style Analysis')+'</div><div class="pdf-cover-name" style="font-size:'+HSVK.coverNameSize(r.clientName)+'px">'+pdfEsc(r.clientName)+'</div>');
  const closing=HSVK.pdfPage('pdf-closing','<div class="pdf-logo">HerStyleVault</div><p style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:1.35rem;color:#7A1321;max-width:560px;margin:1.2rem 0 0.4rem;line-height:1.6;">Thank you for trusting us with your style journey. This analysis is yours to keep and revisit. Every piece was chosen with you in mind.</p>'
    +'<p style="font-size:0.9rem;color:#3F3C38;margin-top:1rem;">With love,<br><strong>HerStyleVault</strong></p>'
    +'<p class="pdf-more-top">Ready for your next step?</p><a class="pdf-pill" data-href="https://herstylevault.com/shop.html" href="https://herstylevault.com/shop.html" target="_blank" rel="noopener"><span>Explore What Else We Offer</span><i><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg></i></a>');
  return[cover].concat(core,keep,[closing]);
}
