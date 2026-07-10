import { launchWithMM, EXT_ID } from './run5_lib.mjs';
import { unlockMM } from './run5_connect_lib.mjs';
const OUT=process.cwd();
const ctx=await launchWithMM('/tmp/run5_profile_main');
await new Promise(r=>setTimeout(r,3500));
const mm=await unlockMM(ctx,'Testpass123!');
await mm.waitForTimeout(2500);
console.log('mm url:', mm.url());
await mm.screenshot({path:`${OUT}/run5h_mm_stuck.png`});
// dump all buttons + their testids
try{
  const btns=mm.getByRole('button'); const n=await btns.count();
  const out=[];
  for(let k=0;k<Math.min(n,25);k++){ const b=btns.nth(k); const txt=(await b.innerText().catch(()=>'')).replace(/\s+/g,' ').trim(); const tid=await b.getAttribute('data-testid').catch(()=>null); out.push(`${tid||'-'}::${txt.slice(0,30)}`); }
  console.log('BUTTONS('+n+'):'); out.forEach(o=>console.log('  ',o));
}catch(e){console.log('btn err',e.message);}
// also dump checkboxes/inputs testids
try{
  const cbs=mm.locator('input[type=checkbox]'); const n=await cbs.count();
  const out=[]; for(let k=0;k<Math.min(n,10);k++){ out.push(await cbs.nth(k).getAttribute('data-testid').catch(()=>'-')); }
  console.log('CHECKBOXES:', JSON.stringify(out));
}catch{}
await ctx.close();
console.log('done');
