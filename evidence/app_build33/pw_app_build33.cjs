/* TESTER live pass — app/index.html build 33.  Usage: node pw_app_build33.cjs A|B
   Everything is measured from the LIVE browser. Numeric re-derivations are written
   here from the spec (sheet formula), NOT copied from the page's own functions.   */
const {chromium}=require('/tmp/node_modules/playwright');
const fs=require('fs'),crypto=require('crypto'),path=require('path');
const RUN=process.argv[2]||'A';
const OUT='/home/user/Perp-Options-AMM/evidence/app_build33';
const SHOTS=path.join(OUT,'shots_'+RUN);
fs.mkdirSync(SHOTS,{recursive:true});
const md5=s=>crypto.createHash('md5').update(s).digest('hex');
const R={run:RUN,phases:{},errors:[],flags:[]};
const SAVE=()=>fs.writeFileSync(path.join(OUT,'RESULT_run'+RUN+'.json'),JSON.stringify(R,null,1));
const N=(x,d=6)=>x===null||x===undefined||!isFinite(x)?x:+(+x).toFixed(d);

(async()=>{
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1900,height:1200}});
const errs=[],cons=[];
page.on('pageerror',e=>errs.push(String(e)));
page.on('console',m=>{if(m.type()==='error')cons.push(m.text());});
page.on('dialog',async d=>{R.errors.push('DIALOG '+d.message());await d.dismiss();});
await page.goto('file:///home/user/Perp-Options-AMM/app/index.html',{waitUntil:'load'});
await page.waitForTimeout(500);

/* ── generic helpers ───────────────────────────────────────────────────── */
const txt=async sel=>page.$eval(sel,e=>e.innerText.replace(/\s+/g,' ').trim()).catch(()=>null);
const bodyHash=async()=>md5(await page.evaluate(()=>document.body.innerText));
const cvHash=async id=>page.evaluate(i=>{const c=document.getElementById(i);return c?c.toDataURL():'nocanvas';},id).then(d=>md5(d));
const cvNonBlank=async id=>page.evaluate(i=>{const c=document.getElementById(i);if(!c)return -1;
  const g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let n=0;
  for(let p=0;p<d.length;p+=4)if(d[p]|d[p+1]|d[p+2])n++;return n;},id);
const setRange=async(sel,v)=>page.evaluate(([s,val])=>{const e=document.querySelector(s);
  if(!e)return false;e.value=val;e.dispatchEvent(new Event('input',{bubbles:true}));return true;},[sel,v]);
const setNum=setRange;
const getVal=async sel=>page.evaluate(s=>{const e=document.querySelector(s);return e?e.value:null;},s=>s,).catch(()=>null);
const val=async sel=>page.evaluate(s=>{const e=document.querySelector(s);return e?e.value:null;},sel);
const click=async sel=>{const el=await page.$(sel);if(!el||!(await el.isVisible())){R.errors.push('click skipped (not visible): '+sel);return false;}await page.click(sel);await page.waitForTimeout(60);return true;};
const nav=async v=>{await page.click(`[data-nav="${v}"]`);await page.waitForTimeout(120);};
const tab=async t=>{const l=page.locator(`[data-t="${t}"]:visible`).first();await l.click({timeout:5000}).catch(e=>R.errors.push('tab click failed '+t));await page.waitForTimeout(150);};
async function snap(){return {body:await bodyHash(),cv:await cvHash('cv'),cvT:await cvHash('cvT'),cvB:await cvHash('cvB')};}
function diffSnap(a,b){return {body:a.body!==b.body,cv:a.cv!==b.cv,cvT:a.cvT!==b.cvT,cvB:a.cvB!==b.cvB};}
const shot=async(name,sel)=>{const p=path.join(SHOTS,name+'.png');
  if(sel){const el=await page.$(sel);if(el)await el.screenshot({path:p});}
  else await page.screenshot({path:p,fullPage:true});return p;};
// read all the "metric rows" in a container as label->value
const metrics=async sel=>page.evaluate(s=>{const r={};document.querySelectorAll(s+' .m').forEach(m=>{
  const sp=m.querySelector('span'),b=m.querySelector('b');if(sp&&b)r[sp.innerText.trim()]=b.innerText.trim();});return r;},sel);
const usdNum=s=>s===undefined||s===null?null:parseFloat(String(s).replace(/[$,×%\s]/g,'').replace(/−/g,'-'));

/* ══ PHASE 1 — load, id integrity against the REAL dom, nav ═════════════ */
{
const P1={};
P1.pageerrors=errs.slice();P1.consoleErrors=cons.slice();
// id integrity measured in the REAL document (not a stub)
P1.idAudit=await page.evaluate(()=>{
  const src=document.querySelector('script:not([src])').textContent;
  const read=[...new Set([...src.matchAll(/\$\('([A-Za-z0-9_-]+)'\)/g)].map(m=>m[1])
    .concat([...src.matchAll(/getElementById\('([A-Za-z0-9_-]+)'\)/g)].map(m=>m[1])))];
  const missing=read.filter(id=>document.getElementById(id)===null);
  const decl=[...document.querySelectorAll('[id]')].map(e=>e.id);
  const neverRead=decl.filter(id=>!read.includes(id));
  return {readCount:read.length,declCount:decl.length,missingInRealDom:missing,neverRead};});
// every input / button inventory
P1.inventory=await page.evaluate(()=>{
  const inv=[];
  document.querySelectorAll('input,button,[data-t],[data-nav],.badge[id],a[id]').forEach(e=>{
    const grid=e.closest('.grid');
    inv.push({tag:e.tagName.toLowerCase(),type:e.type||'',id:e.id||'',
      k:e.dataset.k||e.dataset.m||e.dataset.o||'',view:grid?grid.id:'header/footer',
      label:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,32)});});
  return inv;});
for(const v of ['transact','earn','portfolio']){await nav(v);
  P1['view_'+v]={bodyLen:(await page.evaluate(()=>document.body.innerText.length)),shot:await shot('01_view_'+v)};}
await nav('transact');await tab('bands');
P1.view_bands={bodyLen:await page.evaluate(()=>document.body.innerText.length),shot:await shot('01_view_bands'),
  gridShown:await page.evaluate(()=>getComputedStyle(document.getElementById('gridBands')).display)};
// canvases render?
await tab('earn');P1.cv_nonblank=await cvNonBlank('cv');
await tab('transact');P1.cvT_nonblank=await cvNonBlank('cvT');
await tab('bands');P1.cvB_nonblank=await cvNonBlank('cvB');
// is there a nav link for bands?
P1.navLinks=await page.$$eval('[data-nav]',a=>a.map(x=>x.dataset.nav));
P1.visibleGrids={};
for(const v of ['earn','transact','portfolio','bands']){
  if(v==='bands'){await nav('transact');await tab('bands');}else await nav(v);
  P1.visibleGrids[v]=await page.evaluate(()=>[...document.querySelectorAll('.grid')]
    .filter(g=>getComputedStyle(g).display!=='none').map(g=>g.id));}
await nav('transact');await tab('bands');
P1.bands_cvB_nonblank=await cvNonBlank('cvB');
P1.bands_shot=await shot('01_view_bands_fixed');
P1.bands_navHighlight=await page.$$eval('[data-nav]',a=>a.filter(x=>x.classList.contains('on')).map(x=>x.dataset.nav));
R.phases.P1=P1;SAVE();console.log('P1 done');
}

/* ══ PHASE 2 — build-32 controls: ORACLE/MANUAL, iv, bias, Sbar ════════ */
{
const P2={};
await nav('earn');await page.waitForTimeout(100);
const SB=()=>page.evaluate(()=>{const e=document.querySelector('input[type=range][data-k="Sbar"]');return e?+e.value:null;});
const SBnum=()=>page.evaluate(()=>{const e=document.querySelector('input[type=number][data-k="Sbar"]');return e?+e.value:null;});
const solvedTxt=()=>page.evaluate(()=>{const ms=[...document.querySelectorAll('#orcbox .m')];
  const r={};ms.forEach(m=>r[m.querySelector('span').innerText.trim()]=m.querySelector('b').innerText.trim());return r;});
const hint=()=>page.evaluate(()=>{const f=[...document.querySelectorAll('#params .fld')]
  .find(d=>d.innerText.includes('S̄'));return f?(f.querySelector('.hint')||{innerText:''}).innerText.trim():null;});
P2.mode_default=await page.evaluate(()=>({orc:getComputedStyle(document.getElementById('mdOrc')).backgroundColor,
  man:getComputedStyle(document.getElementById('mdMan')).backgroundColor,
  orcboxHtmlLen:document.getElementById('orcbox').innerHTML.length}));
P2.oracle_hint=await hint();
P2.oracle_sliders=await page.$$eval('#orcbox input[type=range]',a=>a.map(e=>({o:e.dataset.o,v:+e.value,min:e.min,max:e.max,step:e.step})));
// --- oracle vol sweep: does the CURVE move, and does the DISPLAY keep up?
P2.ivSweep=[];
for(const iv of [0.20,0.60,1.20,2.00,0.60]){
  const before=await snap();
  await setRange('#orcbox input[data-o="iv"]',iv);await page.waitForTimeout(90);
  const d=diffSnap(before,await snap());
  const row={iv,sbar_slider:await SB(),sbar_box:await SBnum(),solved:(await solvedTxt())['solved S̄'],
    quoteVol:(await solvedTxt())['you quote vol'],cvChanged:d.cv,bodyChanged:d.body,
    hfair:await txt('#q-fair'),gt:await txt('#r-gt')};
  // force a second render with NO state change (hover the canvas at a fixed point) to expose display lag
  await page.mouse.move(500,300);await page.mouse.move(600,300);await page.waitForTimeout(80);
  row.solved_after_extra_render=(await solvedTxt())['solved S̄'];
  row.sbar_slider_after=await SB();
  P2.ivSweep.push(row);}
await setRange('#orcbox input[data-o="iv"]',0.60);await page.waitForTimeout(80);
// --- bias sweep + budget/ARBABLE
P2.biasSweep=[];
for(const b of [-0.30,-0.10,-0.01,0,0.01,0.10,0.30]){
  const before=await snap();
  await setRange('#orcbox input[data-o="bias"]',b);await page.waitForTimeout(90);
  const d=diffSnap(before,await snap());const s=await solvedTxt();
  P2.biasSweep.push({bias:b,solved:s['solved S̄'],quoteVol:s['you quote vol'],
    budget:s['bias budget (from your spread)'],youAre:s['you are'],cvChanged:d.cv,bodyChanged:d.body});}
await setRange('#orcbox input[data-o="bias"]',0);await page.waitForTimeout(80);
// --- S-bar in ORACLE mode: is it driven / overwritten?
{const before=await SB();const snapB=await snap();
 await setRange('input[type=range][data-k="Sbar"]',0.25);await page.waitForTimeout(120);
 const snapA=await snap();
 const rec1={before,setTo:0.25,after_slider:await SB(),after_box:await SBnum(),
   after_solved:(await solvedTxt())['solved S̄'],cvChanged:snapA.cv!==snapB.cv};
 await page.mouse.move(500,300);await page.mouse.move(603,300);await page.waitForTimeout(100);
 rec1.after_extra_render_slider=await SB();rec1.after_extra_render_box=await SBnum();
 rec1.after_extra_render_solved=(await solvedTxt())['solved S̄'];
 rec1.cv_vs_original=(await snap()).cv===snapB.cv;
 P2.sbar_in_oracle=rec1;}
// --- MANUAL mode
await click('#mdMan');await page.waitForTimeout(120);
P2.manual_state=await page.evaluate(()=>({orcboxHtmlLen:document.getElementById('orcbox').innerHTML.length,
  man:getComputedStyle(document.getElementById('mdMan')).backgroundColor,
  orc:getComputedStyle(document.getElementById('mdOrc')).backgroundColor}));
P2.manual_hint=await hint();
P2.sbarSweepManual=[];
for(const s of [0.05,0.30,0.60,0.95,1.00,0.60]){
  const before=await snap();
  await setRange('input[type=range][data-k="Sbar"]',s);await page.waitForTimeout(90);
  const d=diffSnap(before,await snap());
  // a second render with no state change: does it stick?
  await page.mouse.move(500,300);await page.mouse.move(601,300);await page.waitForTimeout(70);
  P2.sbarSweepManual.push({set:s,slider_after:await SB(),box_after:await SBnum(),
    stuck:(await SB())===s,cvChanged:d.cv,bodyChanged:d.body,
    atm:await txt('#s-prem'),gt:await txt('#r-gt'),hs:await txt('#s-hs')});}
P2.shot_manual=await shot('02_earn_manual','#gridEarn .panel');
await click('#mdOrc');await page.waitForTimeout(120);
P2.back_to_oracle=await page.evaluate(()=>document.getElementById('orcbox').innerHTML.length>0);
P2.shot_oracle=await shot('02_earn_oracle_quoting','#gridEarn .card');
R.phases.P2=P2;SAVE();console.log('P2 done');
}

/* ══ PHASE 3 — TRANSACT ════════════════════════════════════════════════ */
{
const P3={};
await nav('transact');await page.waitForTimeout(150);
// cloud tabs BUY/SELL
{const b0=await snap();await click('#cbSell');const b1=await snap();
 P3.cloudSell={changed:diffSnap(b0,b1),style:await page.evaluate(()=>getComputedStyle(document.getElementById('cbSell')).backgroundColor)};
 await click('#cbBuy');const b2=await snap();
 P3.cloudBuy={changed:diffSnap(b1,b2),returnsToStart:b2.cvT===b0.cvT};}
// AGGREGATE / YOU
{const a0=await snap();await click('#cvMk');const a1=await snap();
 P3.viewYou={changed:diffSnap(a0,a1),nonblank:await cvNonBlank('cvT')};
 await click('#cvAgg');const a2=await snap();
 P3.viewAgg={changed:diffSnap(a1,a2),returns:a2.cvT===a0.cvT};}
// strike box -> slider and slider -> box
{await setNum('#tk',-25);await page.waitForTimeout(90);
 P3.box2slider={box:await val('#tk'),slider:await val('#tkr'),fill:await page.$eval('#tkf',e=>e.style.width),
   quote:await metrics('#tquote'),best:await metrics('#tbest')};
 await setRange('#tkr',40);await page.waitForTimeout(90);
 P3.slider2box={slider:await val('#tkr'),box:await val('#tk'),fill:await page.$eval('#tkf',e=>e.style.width),
   quote:await metrics('#tquote')};
 await setNum('#tk',12);await setRange('#tkr',12);await page.waitForTimeout(90);}
// strike per-click delta over a sweep
P3.strikeSweep=[];
for(const k of [-60,-30,-10,0,12,30,60]){
  const b=await snap();await setRange('#tkr',k);await page.waitForTimeout(80);
  const q=await metrics('#tquote'),tb=await metrics('#tbest');
  P3.strikeSweep.push({k,ask:tb['best ask'],bid:tb['best bid'],spread:q['book spread'],
    pay:q[Object.keys(q).find(x=>/you pay|you receive/.test(x))],cvT:(await snap()).cvT!==b.cvT});}
await setRange('#tkr',12);await page.waitForTimeout(80);
// size
P3.sizeSweep=[];
for(const sz of [0.1,3,10,50,150,200,3]){
  const b=await snap();await setNum('#tsz',sz);await page.waitForTimeout(80);
  const s2=await snap();
  P3.sizeSweep.push({sz,orderPay:(await metrics('#tquote'))['you pay'],
    fillRows:await page.$$eval('#tfill tbody tr',rs=>rs.map(r=>[...r.cells].map(c=>c.innerText.trim()))),
    fillLab:await txt('#tfl'),imp:(await metrics('#timp'))[`envelope vs best single, at ${sz>=10?sz.toFixed(1):sz.toFixed(1)} BTC`]||null,
    cvTchanged:s2.cvT!==b.cvT,bodyChanged:s2.body!==b.body});}
await setNum('#tsz',3);await page.waitForTimeout(80);
// BUY / SELL side buttons
{const b0=await snap();await click('#sideSell');const b1=await snap();
 P3.sideSell={changed:diffSnap(b0,b1),quote:await metrics('#tquote'),
   cls:await page.$eval('#sideSell',e=>e.className)};
 await click('#sideBuy');const b2=await snap();
 P3.sideBuy={changed:diffSnap(b1,b2),quote:await metrics('#tquote'),returns:b2.body===b0.body};}
// maker divergence dial
P3.divSweep=[];
for(const d of [0,0.01,0.05,0.15,0.5,1.0,0.15]){
  const b=await snap();await setRange('#arbr',d);await page.waitForTimeout(80);const s2=await snap();
  P3.divSweep.push({d,readout:await txt('#arbv'),fill:await page.$eval('#arbf',e=>e.style.width),
    tbest:await metrics('#tbest'),cvTchanged:s2.cvT!==b.cvT});}
// per-keypress delta on the dial
await page.focus('#arbr');
P3.divPerClick=[];
for(let i=0;i<3;i++){const b=await snap();await page.keyboard.press('ArrowRight');await page.waitForTimeout(80);
  const s2=await snap();P3.divPerClick.push({v:await val('#arbr'),readout:await txt('#arbv'),cvT:s2.cvT!==b.cvT,body:s2.body!==b.body});}
await setRange('#arbr',0.15);await page.waitForTimeout(80);
P3.shot=await shot('03_transact');
P3.shot_book=await shot('03_transact_book','#cvT');
R.phases.P3=P3;SAVE();console.log('P3 done');
}

/* ══ PHASE 4 — EARN ════════════════════════════════════════════════════ */
{
const P4={};
await nav('earn');await page.waitForTimeout(150);
const readAll=async()=>({q:await metrics('.card:nth-of-type(1)'),right:await page.evaluate(()=>{
  const r={};document.querySelectorAll('#gridEarn .m').forEach(m=>{const s=m.querySelector('span'),b=m.querySelector('b');
   if(s&&b)r[s.innerText.trim()]=b.innerText.trim();});return r;})});
// curve params both ends
P4.params=[];
const SPEC=[['Sbar',0.05,1.0],['a',0.2,3],['gam',0.3,4],['kap',-0.9,0.9],['cap',5,150],['fee',0,0.2]];
await click('#mdMan');await page.waitForTimeout(120);   // MANUAL so Sbar is free
for(const [k,mn,mx] of SPEC){
  const start=await val(`input[type=range][data-k="${k}"]`);
  const row={k,start};
  for(const v of [mn,mx]){const b=await snap();await setRange(`input[type=range][data-k="${k}"]`,v);await page.waitForTimeout(90);
    const s2=await snap();row['at_'+v]={cv:s2.cv!==b.cv,body:s2.body!==b.body,
      apr:await txt('#y-base'),hs:await txt('#s-hs'),gt:await txt('#r-gt'),prem:await txt('#s-prem'),
      boxSync:await val(`input[type=number][data-k="${k}"]`)};}
  await setRange(`input[type=range][data-k="${k}"]`,start);await page.waitForTimeout(80);
  row.restored=(await val(`input[type=range][data-k="${k}"]`))===start;
  P4.params.push(row);}
// per-click on fee with vol-indexed ON then OFF  (old FLAG-C5)
{const before=await snap();await setRange('input[type=range][data-k="fee"]',0.2);await page.waitForTimeout(90);
 const after=await snap();
 P4.fee_volIndexedOn={cvChanged:after.cv!==before.cv,bodyChanged:after.body!==before.body,
   bodyDiff:await page.evaluate(()=>document.body.innerText.length)};
 await click('#volbtn');await page.waitForTimeout(90);
 const b2=await snap();await setRange('input[type=range][data-k="fee"]',0.05);await page.waitForTimeout(90);
 const a2=await snap();
 P4.fee_volIndexedOff={cvChanged:a2.cv!==b2.cv,bodyChanged:a2.body!==b2.body,hs:await txt('#s-hs')};
 await click('#volbtn');await page.waitForTimeout(90);
 await setRange('input[type=range][data-k="fee"]',0.02);await page.waitForTimeout(80);}
await click('#mdOrc');await page.waitForTimeout(100);
// margin
{const b=await snap();await setNum('#margin',40);await page.waitForTimeout(90);const a=await snap();
 P4.margin={changed:diffSnap(b,a),notional:await txt('#notional'),lpLev:await txt('#lpLev')};
 await setNum('#margin',15);await page.waitForTimeout(80);}
// reset  + slider/box agreement
const pairs=async()=>page.evaluate(()=>{const o={};
  ['Sbar','a','gam','kap','cap','fee'].forEach(k=>{
    const r=document.querySelector(`input[type=range][data-k="${k}"]`),n=document.querySelector(`input[type=number][data-k="${k}"]`);
    o[k]={slider:r?+r.value:null,box:n?+n.value:null,agree:r&&n?(+r.value===+n.value):null};});
  return o;});
{await setRange('input[type=range][data-k="a"]',2.5);await page.waitForTimeout(80);
 const dirty=await val('input[type=range][data-k="a"]');
 await click('#reset');await page.waitForTimeout(120);
 P4.reset={dirty,after:await val('input[type=range][data-k="a"]'),
   ok:(+await val('input[type=range][data-k="a"]'))===1.2705,pairsAfterReset:await pairs()};}
P4.pairsFresh=await pairs();
// VOL-INDEXED toggle
{const b=await snap();await click('#volbtn');const a=await snap();
 P4.volToggle={changed:diffSnap(b,a),label:await txt('#volbtn'),modelab:await txt('#modelab'),
   verdict:(await txt('#verdict')||'').slice(0,60),marg:await txt('#q-marg')};
 await click('#volbtn');await page.waitForTimeout(80);}
// market sliders
P4.mkt=[];
for(const [k,lo,hi] of [['rv',0.1,1.4],['turn',0.05,3],['Q',0.5,40]]){
  const start=await val(`input[data-m="${k}"]`);const row={k,start,pts:[]};
  for(const v of [lo,hi,start]){const b=await snap();await setRange(`input[data-m="${k}"]`,v);await page.waitForTimeout(90);
    const a=await snap();row.pts.push({v,cv:a.cv!==b.cv,body:a.body!==b.body,apr:await txt('#y-base'),
      bet:await txt('#r-bet'),qlab:await txt('#qlab'),
      ladder:await page.$$eval('#ladder tbody tr',rs=>rs.map(r=>[...r.cells].map(c=>c.innerText.trim())))});}
  P4.mkt.push(row);}
// size box next to the cloud
{const b=await snap();await setNum('#qsz',25);await page.waitForTimeout(90);const a=await snap();
 P4.qsz={changed:diffSnap(b,a),hoverbar:await txt('#hoverbar')};
 await setNum('#qsz',5);await page.waitForTimeout(80);}
// BUY/SELL cloud tabs on Earn
{const b=await snap();await click('#ebSell');const a=await snap();
 P4.earnSell={changed:diffSnap(b,a),nonblank:await cvNonBlank('cv')};
 await click('#ebBuy');await page.waitForTimeout(80);}
// pointer hover across the curve  -> parity
{P4.hover=[];const box=await page.$eval('#cv',e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
 for(const fr of [0.10,0.25,0.5,0.75,0.9]){
   await page.mouse.move(box.x+box.w*fr,box.y+box.h*0.5);await page.waitForTimeout(90);
   const hb=await page.evaluate(()=>[...document.querySelectorAll('#hoverbar > div')].map(d=>d.innerText.replace(/\n/g,'|')));
   P4.hover.push({fr,cells:hb,par:await txt('#r-par')});}}
P4.shot=await shot('04_earn');
R.phases.P4=P4;SAVE();console.log('P4 done');
}

/* ══ PHASE 5 — TRADE BANDS + PORTFOLIO ═════════════════════════════════ */
{
const P5={};
await nav('transact');await tab('bands');await page.waitForTimeout(150);
P5.bands=[];
for(const [id,vals] of [['bs',[-50,10,50]],['bb',[-50,-10,50]],['bsz',[0.1,5,120]]]){
  const start=await val('#'+id);const row={id,start,pts:[]};
  for(const v of vals){const b=await snap();await setNum('#'+id,v);await page.waitForTimeout(90);const a=await snap();
    row.pts.push({v,cvB:a.cvB!==b.cvB,body:a.body!==b.body,out:await metrics('#bout'),state:await metrics('#bstate')});}
  await setNum('#'+id,start);await page.waitForTimeout(80);
  row.restored=(await val('#'+id))===start;P5.bands.push(row);}
P5.shot_bands=await shot('05_bands');
await nav('portfolio');await page.waitForTimeout(150);
P5.portfolio={rows:await page.$$eval('#ppos tbody tr',rs=>rs.map(r=>[...r.cells].map(c=>c.innerText.trim()))),
  acct:await metrics('#pacct'),carve:await metrics('#pcarve'),
  hedge:await page.$$eval('#phedge tr',rs=>rs.map(r=>[...r.cells].map(c=>c.innerText.trim()))),
  liq:await metrics('#pliq'),
  controls:await page.$$eval('#gridPortfolio input,#gridPortfolio button',e=>e.length)};
P5.shot_portfolio=await shot('05_portfolio');
R.phases.P5=P5;SAVE();console.log('P5 done');
}

/* ══ PHASE 6 — NUMERIC TRUTH, re-derived here ══════════════════════════ */
{
const P6={};
await nav('transact');await page.waitForTimeout(150);
// pull RAW STATE (data, not formulas) out of the page, then re-derive independently
const raw=await page.evaluate(()=>{
  const set=makerCurves();const st=calc();const hs=st.book.map(m=>m.h);
  const B=aggBook(set,hs);
  return {lam:LAM,S:S,pool:MKT.pool,ARBD:ARBD,mode:ORC.mode,
    makers:set.map(m=>({n:m.n,me:!!m.me,cap:m.cap,h:m.h,share:m.share,ATM:m.c.ATM,
      C:[-0.6,-0.3,-0.1,0,0.12,0.3,0.6].map(k=>m.c.CALL(k)),
      Pu:[-0.6,-0.3,-0.1,0,0.12,0.3,0.6].map(k=>m.c.PUT(k))})),
    ks:[-0.6,-0.3,-0.1,0,0.12,0.3,0.6],
    domAsk:[-0.6,-0.3,-0.1,0,0.12,0.3,0.6].map(k=>B.ask(k)),
    domBid:[-0.6,-0.3,-0.1,0,0.12,0.3,0.6].map(k=>B.bid(k))};});
P6.raw_summary={lam:raw.lam,pool:raw.pool,mode:raw.mode,makers:raw.makers.map(m=>({n:m.n,cap:m.cap,h:N(m.h,4),ATM:N(m.ATM,6)}))};
// --- 6a independent aggregate + sheet impact
function mine(raw,ki,Q,side){
  const tot=raw.makers.reduce((t,m)=>t+m.cap,0);
  const hAgg=Math.min(...raw.makers.map(m=>m.h))/1e4;
  const mid=raw.makers.reduce((t,m)=>t+(m.cap/tot)*m.C[ki],0);
  const best=side==='ask'?mid*(1+hAgg):mid*(1-hAgg);
  let inv=0;raw.makers.forEach(m=>{inv+=(0.01*m.cap)/(raw.lam*m.ATM);});
  const slope=1/inv;
  const singlePool=raw.lam*(raw.makers.reduce((t,m)=>t+(m.cap/tot)*m.ATM,0))/(0.01*tot); // arithmetic-ATM single pool
  return {tot,hAgg,mid,best,slope,landed:Q>tot?null:best+0.5*slope*Q,singlePoolSlope:singlePool,
    sheet_fraction:0.5*raw.lam*(Q/tot)/0.01*(raw.makers.reduce((t,m)=>t+(m.cap/tot)*m.ATM,0))/best};}
P6.impact=[];
for(let i=0;i<raw.ks.length;i++){
  const k=raw.ks[i];
  for(const Q of [3,25]){
    const m=mine(raw,i,Q,'ask');
    // DOM: set the controls and read the fill table
    await setRange('#tkr',k*100);await setNum('#tsz',Q);await page.waitForTimeout(100);
    const rows=await page.$$eval('#tfill tbody tr',rs=>rs.map(r=>[...r.cells].map(c=>c.innerText.trim())));
    const tb=await metrics('#tbest');const tq=await metrics('#tquote');
    const domQuote=rows.length?parseFloat(rows[0][1]):null;
    P6.impact.push({k,Q,mine_best:N(m.best),dom_bestask:usdNum(tb['best ask']),
      mine_landed:N(m.landed),dom_fillpx:domQuote,
      landed_minus_best_bps:m.landed===null?null:N((m.landed/m.best-1)*1e4,3),
      sheet_bps:N(m.sheet_fraction*1e4,3),
      order_you_pay:tq['you pay'],fill_you_pay_total:rows.reduce((t,r)=>t+(usdNum(r[4])||0),0),
      dom_fill_sum:N(rows.reduce((t,r)=>t+parseFloat(r[2]||0),0),8)});}}
await setRange('#tkr',12);await setNum('#tsz',3);await page.waitForTimeout(100);
// --- 6b crossing sweep over divergence AND strike, measured in the page from ask/bid
P6.crossing=await page.evaluate(()=>{
  const out=[];const orig=ARBD;
  for(const D of [0,0.05,0.15,0.5,1.0]){ARBD=D;
    const set=makerCurves(),st=calc(),B=aggBook(set,st.book.map(m=>m.h));
    let crossed=0,minSpr=1e9,maxSpr=-1e9,n=0;
    for(let i=0;i<=200;i++){const k=-0.6+1.2*i/200;const a=B.ask(k),b=B.bid(k);
      if(b>a)crossed++;const s=(a-b)/((a+b)/2)*1e4;minSpr=Math.min(minSpr,s);maxSpr=Math.max(maxSpr,s);n++;}
    out.push({D,crossedFrac:crossed/n,minSpreadBps:+minSpr.toFixed(4),maxSpreadBps:+maxSpr.toFixed(4)});}
  ARBD=orig;render();return out;});
// --- 6c pro-rata fills: capital shares vs displayed fills, and exact sum
P6.prorata=[];
for(const Q of [1,3,17.5,60]){
  await setNum('#tsz',Q);await page.waitForTimeout(100);
  const rows=await page.$$eval('#tfill tbody tr',rs=>rs.map(r=>[...r.cells].map(c=>c.innerText.trim())));
  const shares=await page.evaluate(()=>{const s=makerCurves();const t=s.reduce((a,m)=>a+m.cap,0);
    return s.map(m=>({n:m.n,me:!!m.me,share:m.cap/t}));});
  const yours=rows.find(r=>r[0]==='YOU'),oth=rows.find(r=>/other makers/.test(r[0]));
  P6.prorata.push({Q,rows,you_expected:N(Q*(shares.find(s=>s.me).share),4),
    you_dom:yours?parseFloat(yours[2]):null,
    oth_expected:N(Q*(1-shares.find(s=>s.me).share),4),oth_dom:oth?parseFloat(oth[2]):null,
    sum_dom:N(rows.reduce((t,r)=>t+(parseFloat(r[2])||0),0),4)});}
await setNum('#tsz',3);await page.waitForTimeout(80);
// --- 6d SELL-side sign check: is landed WORSE than best bid?
P6.sellSign=await page.evaluate(()=>{
  const set=makerCurves(),st=calc(),B=aggBook(set,st.book.map(m=>m.h));
  const out=[];
  for(const k of [-0.3,0,0.12,0.3]){
    const Ld=ladderAt(set,k,MKT.pool,'bid');
    for(const Q of [1,10,50]){const px=landedFrom(Ld,Q);
      out.push({k,Q,bestBid:+B.bid(k).toFixed(8),landed:px===null?null:+px.toFixed(8),
        receivesMoreWithSize:px!==null&&px>B.bid(k)});}}
  return out;});
// --- 6e self-mark independence: MANUAL mode, drag YOUR Sbar across its range
await nav('earn');await click('#mdMan');await page.waitForTimeout(120);
P6.selfmark=[];
for(const sb of [0.05,0.30,0.60,0.95,1.00]){
  await nav('earn');await setRange('input[type=range][data-k="Sbar"]',sb);await page.waitForTimeout(90);
  await nav('portfolio');await page.waitForTimeout(120);
  const acct=await metrics('#pacct'),liq=await metrics('#pliq');
  const rows=await page.$$eval('#ppos tbody tr',rs=>rs.map(r=>[...r.cells].map(c=>c.innerText.trim())));
  P6.selfmark.push({sbar:sb,optionsValue:acct['options value'],lev:acct['account leverage'],
    gap:liq['mark → close gap'],marks:rows.map(r=>r[3]),closes:rows.map(r=>r[4])});}
// same sweep in ORACLE mode (the manager's script's claim)
await nav('earn');await click('#mdOrc');await page.waitForTimeout(120);
P6.selfmark_oracle_bias=[];
for(const b of [-0.30,0,0.30]){
  await nav('earn');await setRange('#orcbox input[data-o="bias"]',b);await page.waitForTimeout(90);
  await nav('portfolio');await page.waitForTimeout(120);
  const acct=await metrics('#pacct');
  P6.selfmark_oracle_bias.push({bias:b,optionsValue:acct['options value']});}
await nav('earn');await setRange('#orcbox input[data-o="bias"]',0);await page.waitForTimeout(90);
// --- 6f close px == self-excluded best bid/ask, gap == spread
await nav('portfolio');await page.waitForTimeout(120);
P6.closepx=await page.evaluate(()=>{
  const st=calc(),mkrs=makerCurves();aggBook(mkrs,st.book.map(m=>m.h));
  const others=mkrs.filter(m=>!m.me);
  const pos=[{n:'BTC call',k:0.12,sz:3,side:1},{n:'BTC put',k:-0.10,sz:2,side:-1},{n:'BTC call',k:0.30,sz:1.5,side:1}];
  return pos.map(p=>{
    const cs=others.map(m=>p.side>0?m.c.CALL(p.k):m.c.PUT(p.k)),h=others.map(m=>m.h/1e4);
    const ask=Math.min(...cs.map((c,i)=>c*(1+h[i]))),bid=Math.max(...cs.map((c,i)=>c*(1-h[i])));
    const mid=0.5*(ask+bid),close=p.side>0?bid:ask;
    const includesYou=(()=>{const cs2=mkrs.map(m=>p.side>0?m.c.CALL(p.k):m.c.PUT(p.k)),h2=mkrs.map(m=>m.h/1e4);
      return {ask:Math.min(...cs2.map((c,i)=>c*(1+h2[i]))),bid:Math.max(...cs2.map((c,i)=>c*(1-h2[i])))};})();
    return {n:p.n,k:p.k,sz:p.sz,side:p.side,mid:+mid.toFixed(6),close:+close.toFixed(6),
      halfspread_units:+(mid-close).toFixed(8),gap_usd:+((mid-close)*p.sz*S*Math.abs(p.side)).toFixed(2),
      selfExcluded_differs_from_including_you:+(Math.abs(includesYou.bid-bid)+Math.abs(includesYou.ask-ask)).toFixed(8)};});});
P6.dom_gap=(await metrics('#pliq'))['mark → close gap'];
// 6g others-only book: is min-ask below max-bid (a crossed reference book)?
P6.othersBook=await page.evaluate(()=>{
  const st=calc(),mkrs=makerCurves();aggBook(mkrs,st.book.map(m=>m.h));
  const oth=mkrs.filter(m=>!m.me);
  return [0.12,-0.10,0.30].map(k=>{
    const cs=oth.map(m=>m.c.CALL(k)),h=oth.map(m=>m.h/1e4);
    const minAsk=Math.min(...cs.map((c,i)=>c*(1+h[i]))),maxBid=Math.max(...cs.map((c,i)=>c*(1-h[i])));
    return {k,minAsk:+minAsk.toFixed(6),maxBid:+maxBid.toFixed(6),crossed:maxBid>minAsk,
      crossBps:+((maxBid/minAsk-1)*1e4).toFixed(1)};});});
// 6h envelope-vs-best-single: SIGN, not magnitude
P6.envVsSingle=await page.evaluate(()=>{
  const set=makerCurves(),st=calc();aggBook(set,st.book.map(m=>m.h));
  const k=+document.getElementById('tk').value/100;
  return [0.1,3,10].map(Q=>{
    const rows=set.map(m=>({me:!!m.me,ask:m.c.CALL(k)*(1+m.h/1e4)}));
    const bestSingle=rows.reduce((a,r)=>r.ask<a.ask?r:a,rows[0]);
    const env=landedFrom(ladderAt(set,k,MKT.pool,'ask'),Q);
    return {Q,bestSingleAsk:+bestSingle.ask.toFixed(6),envelopePx:env===null?null:+env.toFixed(6),
      envelopeIsCheaper:env!==null&&env<bestSingle.ask,
      displayedBps:+(Math.abs(bestSingle.ask/env-1)*1e4).toFixed(2)};});});
// 6i does self-exclusion actually BIND at extreme own-Sbar?
await nav('earn');await click('#mdMan');await page.waitForTimeout(100);
P6.selfExclusionBinds=[];
for(const sb of [0.05,0.60,1.00]){
  await nav('earn');await setRange('input[type=range][data-k="Sbar"]',sb);await page.waitForTimeout(100);
  await nav('portfolio');await page.waitForTimeout(120);
  P6.selfExclusionBinds.push(await page.evaluate(sb=>{
    const st=calc(),mk2=makerCurves();aggBook(mk2,st.book.map(m=>m.h));
    const k=0.12,all=mk2,oth=mk2.filter(m=>!m.me);
    const f=arr=>{const cs=arr.map(m=>m.c.CALL(k)),h=arr.map(m=>m.h/1e4);
      return {minAsk:Math.min(...cs.map((c,i)=>c*(1+h[i]))),maxBid:Math.max(...cs.map((c,i)=>c*(1-h[i])))};};
    const A=f(all),O=f(oth);
    return {sbar:sb,withYou_minAsk:+A.minAsk.toFixed(6),withoutYou_minAsk:+O.minAsk.toFixed(6),
      withYou_maxBid:+A.maxBid.toFixed(6),withoutYou_maxBid:+O.maxBid.toFixed(6),
      exclusionBinds:Math.abs(A.minAsk-O.minAsk)+Math.abs(A.maxBid-O.maxBid)>1e-9};},sb));}
await nav('earn');await setRange('input[type=range][data-k="Sbar"]',0.6);await click('#mdOrc');await page.waitForTimeout(100);
R.phases.P6=P6;SAVE();console.log('P6 done');
}

/* ══ PHASE 7 — information leak ════════════════════════════════════════ */
{
const P7={leaks:[]};
const NAMES=['MM-Kappa','MM-Delta','MM-Sigma'];
const scanStates=[
  ['earn',async()=>{}],
  ['earn',async()=>{await click('#ebSell');}],
  ['earn',async()=>{await click('#ebBuy');await click('#mdMan');}],
  ['earn',async()=>{await click('#mdOrc');}],
  ['transact',async()=>{}],
  ['transact',async()=>{await click('#cvMk');}],
  ['transact',async()=>{await click('#cvAgg');await click('#cbSell');}],
  ['transact',async()=>{await click('#cbBuy');await click('#sideSell');}],
  ['transact',async()=>{await click('#sideBuy');}],
  ['bands',async()=>{}],
  ['portfolio',async()=>{}]];
for(const [view,setup] of scanStates){
  if(view==='bands'){await nav('transact');await tab('bands');}else await nav(view);
  await setup();await page.waitForTimeout(120);
  const hits=await page.evaluate(ns=>{
    const out=[];
    const walk=(root)=>{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
      while(n=w.nextNode()){const p=n.parentElement;
        if(p&&p.offsetParent!==null||p&&p.tagName==='BODY'){ns.forEach(x=>{if(n.nodeValue.includes(x))out.push('text:'+x);});}}};
    walk(document.body);
    document.querySelectorAll('[title]').forEach(e=>ns.forEach(x=>{if(e.title.includes(x))out.push('title:'+x);}));
    return out;},NAMES);
  P7.leaks.push({view,hits});}
// canvases: read the pixels? names would be drawn text — check by rendering-free scan of draw code strings
P7.canvasTextCalls=await page.evaluate(()=>{
  const src=document.querySelector('script:not([src])').textContent;
  const bad=[...src.matchAll(/fillText\(([^;]{0,80})/g)].map(m=>m[1]).filter(s=>/\.n\b|MM-/.test(s));
  return bad;});
R.phases.P7=P7;SAVE();console.log('P7 done');
}

/* ══ PHASE 8 — inert-control regression sweep ══════════════════════════ */
{
const P8={inputs:[],buttons:[]};
const views=[['earn','earn'],['transact','transact'],['bands','bands'],['portfolio','portfolio']];
for(const [v] of views){
  if(v==='bands'){await nav('transact');await tab('bands');}else await nav(v);
  await page.waitForTimeout(120);
  const inputs=await page.evaluate(v=>{
    const g=document.querySelector('.grid:not([style*="display: none"])');
    return [...g.querySelectorAll('input')].map((e,i)=>({idx:i,id:e.id,type:e.type,
      k:e.dataset.k||e.dataset.m||e.dataset.o||'',min:e.min,max:e.max,step:e.step,value:e.value,
      sel:e.id?'#'+e.id:(e.dataset.k?`input[data-k="${e.dataset.k}"][type=${e.type}]`:
        e.dataset.m?`input[data-m="${e.dataset.m}"]`:e.dataset.o?`input[data-o="${e.dataset.o}"]`:null)}));},v);
  for(const inp of inputs){
    if(!inp.sel)continue;
    const before=await snap();
    const cur=+inp.value;
    const lo=inp.min!==''?+inp.min:cur-1, hi=inp.max!==''?+inp.max:cur+1;
    const target=Math.abs(cur-lo)>Math.abs(cur-hi)?lo:hi;
    const ok=await setRange(inp.sel,target);
    await page.waitForTimeout(110);
    const after=await snap();
    P8.inputs.push({view:v,sel:inp.sel,id:inp.id,k:inp.k,from:cur,to:target,set:ok,
      cv:after.cv!==before.cv,cvT:after.cvT!==before.cvT,cvB:after.cvB!==before.cvB,body:after.body!==before.body,
      anyChange:(after.cv!==before.cv)||(after.cvT!==before.cvT)||(after.cvB!==before.cvB)||(after.body!==before.body)});
    await setRange(inp.sel,cur);await page.waitForTimeout(90);}
  const btns=await page.evaluate(()=>{
    const g=document.querySelector('.grid:not([style*="display: none"])');
    return [...g.querySelectorAll('button,.badge[id],a[id]')].map(e=>({tag:e.tagName,id:e.id,
      label:(e.innerText||'').trim().slice(0,30),
      hasHandler:!!(e.onclick||e._w)}));});
  for(const b of btns){
    if(!b.id){P8.buttons.push({view:v,...b,note:'no id — not clickable by selector; handler check only'});continue;}
    const before=await snap();
    await page.click('#'+b.id).catch(()=>{});await page.waitForTimeout(110);
    const after=await snap();
    P8.buttons.push({view:v,...b,anyChange:JSON.stringify(before)!==JSON.stringify(after)});}
}
// header buttons + footer link
P8.headerButtons=await page.evaluate(()=>[...document.querySelectorAll('header button')]
  .map(b=>({label:b.innerText.trim(),hasHandler:!!b.onclick})));
// the CTA / Create Position / Execute Band buttons (no ids)
P8.ctaButtons=await page.evaluate(()=>[...document.querySelectorAll('.cta')]
  .map(b=>({id:b.id||'(none)',label:b.innerText.trim(),hasHandler:!!b.onclick})));
R.phases.P8=P8;SAVE();console.log('P8 done');
}

/* ══ PHASE 9 — real mouse drag on a slider (re-render steals the drag?) ══ */
{
const P9={};
await nav('earn');await page.waitForTimeout(150);
const box=await page.evaluate(()=>{const e=document.querySelector('input[type=range][data-k="gam"]');
  const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,v:+e.value};});
P9.start=box.v;
await page.mouse.move(box.x+box.w*0.4,box.y+box.h/2);
await page.mouse.down();
const traj=[];
for(const fr of [0.45,0.55,0.7,0.85,0.95]){
  await page.mouse.move(box.x+box.w*fr,box.y+box.h/2);await page.waitForTimeout(70);
  traj.push({fr,v:await page.evaluate(()=>{const e=document.querySelector('input[type=range][data-k="gam"]');return e?+e.value:null;})});}
await page.mouse.up();await page.waitForTimeout(100);
P9.trajectory=traj;
P9.end=await page.evaluate(()=>+document.querySelector('input[type=range][data-k="gam"]').value);
P9.dragTracked=traj.length>1&&traj[traj.length-1].v!==traj[0].v;
await click('#reset');await page.waitForTimeout(100);
R.phases.P9=P9;SAVE();console.log('P9 done');
}


/* ══ PHASE 10 — PIXEL GEOMETRY: is the drawn cloud on the right side of the
      quote, and does the orange "at your size" curve sit on the worse side? ══ */
{
const P10={};
await nav('earn');await page.waitForTimeout(200);
P10.earnCloud=await page.evaluate(()=>{
  const cv=document.getElementById('cv'),g=cv.getContext('2d'),W=cv.width,H=cv.height;
  const d=g.getImageData(0,0,W,H).data;
  const st=calc(),L=56,R=16,T=16,Bm=32,PH=H-T-Bm-28;
  const meRow=st.book.find(m=>m.me),QmaxYou=Math.max(0.1,(meRow?meRow.share:1)*MKT.pool);
  const dFull=(QmaxYou/MKT.pool)*100*LAM*st.c.ATM;
  const cask=[];for(let i=0;i<=140;i++){const k=-0.7+1.4*i/140;cask.push(st.c.CALL(k)*(1+(st.hEff/1e4)*MAG));}
  const ymax=Math.max(...cask)+dFull*1.02;
  const X=k=>L+(k+0.7)/1.4*(W-L-R),Y=v=>T+(1-v/ymax)*PH;
  const out=[];
  for(const k of [-0.5,-0.2,0,0.2,0.5]){
    const x=Math.round(X(k));let top=null,bot=null;const segs=[];let cur=null;
    for(let y=T+46;y<T+PH;y++){const i=(y*W+x)*4;          // T+46 skips the two caption lines
      const teal=d[i+1]>40&&d[i+2]>40&&d[i+1]>d[i]+15;
      if(teal){if(top===null)top=y;bot=y;if(cur===null)cur=y;}
      else if(cur!==null){segs.push([cur,y-1]);cur=null;}}
    if(cur!==null)segs.push([cur,T+PH-1]);
    const askY=Y(st.c.CALL(k)*(1+st.hEff/1e4));
    const thick=top===null?null:((1-(top-T)/PH)*ymax)-((1-(bot-T)/PH)*ymax);
    out.push({k,segs,paintThicknessValue:thick===null?null:+thick.toFixed(5),
      expectedThickness:+(95*(0.178897/95)).toFixed(5),paintTopY:top,paintBotY:bot,askY:+askY.toFixed(1),
      askVal:+st.c.CALL(k).toFixed(5),ymax:+ymax.toFixed(4),
      paintedAboveAsk:top!==null&&top<askY-2,paintedBelowAsk:bot!==null&&bot>askY+2,
      topVal:top===null?null:+((1-(top-T)/PH)*ymax).toFixed(5),
      botVal:bot===null?null:+((1-(bot-T)/PH)*ymax).toFixed(5)});}
  return {ymax:+ymax.toFixed(4),dFull:+dFull.toFixed(5),cols:out};});
P10.shot_cloud=await shot('10_earn_cloud','#cv');
// transact: orange landed curve vs the drawn top-of-book, BUY then SELL
await nav('transact');await page.waitForTimeout(200);
await setNum('#tsz',50);await page.waitForTimeout(150);
for(const side of ['ask','bid']){
  if(side==='bid')await click('#cbSell');else await click('#cbBuy');
  await page.waitForTimeout(200);
  P10['book_'+side]=await page.evaluate(()=>{
    const cv=document.getElementById('cvT'),g=cv.getContext('2d'),W=cv.width,H=cv.height;
    const d=g.getImageData(0,0,W,H).data;
    const set=makerCurves(),st=calc(),B=aggBook(set,st.book.map(m=>m.h));
    const L=56,R=16,T=16,Bm=30,PH=H-T-Bm-28;
    const xs=[];for(let i=0;i<=140;i++)xs.push(-0.7+1.4*i/140);
    const ymax=Math.max(...xs.map(B.ask))*1.06,X=k=>L+(k+0.7)/1.4*(W-L-R),Y=v=>T+(1-v/ymax)*PH;
    const Q=+(document.getElementById('tsz').value)||3;
    const LC=landedCurve(set,MKT.pool,Q,CSIDE==='ask'?'ask':'bid');
    const rows=[];
    for(const k of [-0.3,0,0.3]){
      const x=Math.round(X(k));let orange=[];
      for(let y=T;y<T+PH;y++){for(const dx of [-1,0,1]){const i=(y*W+x+dx)*4;
        if(d[i]>190&&d[i+1]>120&&d[i+1]<215&&d[i+2]<130&&d[i]-d[i+2]>90){orange.push(y);break;}}}
      const oy=orange.length?orange.reduce((a,b)=>a+b,0)/orange.length:null;
      rows.push({k,orangePixY:oy===null?null:+oy.toFixed(1),
        landedY:+Y(LC(k)).toFixed(1),tobY:+Y(CSIDE==='ask'?B.ask(k):B.bid(k)).toFixed(1),
        landed:+LC(k).toFixed(6),tob:+(CSIDE==='ask'?B.ask(k):B.bid(k)).toFixed(6),
        landedWorseThanTob:CSIDE==='ask'?LC(k)>B.ask(k):LC(k)<B.bid(k)});}
    return {side:CSIDE,Q,ymax:+ymax.toFixed(5),rows};});
  P10['shot_book_'+side]=await shot('10_book_'+side,'#cvT');}
await click('#cbBuy');await setNum('#tsz',3);
R.phases.P10=P10;SAVE();console.log('P10 done');
}
R.pageerrors=errs;R.consoleErrors=cons;
R.fileMd5=md5(fs.readFileSync('/home/user/Perp-Options-AMM/app/index.html'));
fs.writeFileSync(path.join(OUT,'RESULT_run'+RUN+'.json'),JSON.stringify(R,null,1));
console.log('run',RUN,'done. pageerrors:',errs.length,'consoleErrors:',cons.length);
await browser.close();
})().catch(async e=>{console.error('HARNESS ERROR',e);process.exit(2);});
