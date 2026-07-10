import { launchWithMM, EXT_ID } from './run5_lib.mjs';
import { unlockMM } from './run5_connect_lib.mjs';
const OUT=process.cwd();
const ctx=await launchWithMM('/tmp/run5_profile_main');
await new Promise(r=>setTimeout(r,3500));
const mm=await unlockMM(ctx,'Testpass123!');
await mm.waitForTimeout(2000);
async function vis(sel,kind='testid',to=400){try{const l=kind==='testid'?mm.getByTestId(sel):kind==='role'?mm.getByRole('button',{name:sel}):mm.getByText(sel);return(await l.first().isVisible({timeout:to}))?l.first():null;}catch{return null;}}
const log=[];
for(let i=0;i<22;i++){
  await mm.waitForTimeout(600);
  const url=mm.url();
  let acted=null,el;
  for(const t of ['metametrics-i-agree','onboarding-complete-done','pin-extension-next','pin-extension-done','popover-close']){ el=await vis(t); if(el){await el.click().catch(()=>{});acted=t;break;} }
  if(!acted){ el=await vis(/Maybe later/i,'role')||await vis(/Maybe later/i,'text')||await vis(/Not now/i,'role')||await vis(/Got it/i,'role')||await vis(/Done/i,'role')||await vis(/Continue/i,'role'); if(el){await el.click().catch(()=>{});acted='role';} }
  const line=`i=${i} url=${url.split('#')[1]||''} acted=${acted||'none'}`; log.push(line); console.log(line);
  if(!/\/onboarding\//.test(mm.url()) && i>0){ log.push('EXITED ONBOARDING url='+(mm.url().split('#')[1]||'')); break; }
  if(!acted && i>8){ log.push('stalled'); break; }
}
console.log(log.join('\n'));
await mm.waitForTimeout(2000);
console.log('final url:', mm.url());
await mm.screenshot({path:`${OUT}/run5i_mm_final.png`});
// confirm home reached: look for account UI
const homeSig = await vis('account-menu-icon')||await vis('eth-overview__primary-currency')||await vis('multichain-token-list-item')||await vis('account-overview__asset-tab');
console.log('HOME reached:', !!homeSig);
await ctx.close();
console.log('done');
