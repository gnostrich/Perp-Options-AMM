import { launchWithMM, EXT_ID } from './run5_lib.mjs';
import { onboard } from './run5_onboard.mjs';
const OUT = process.cwd();
const ctx = await launchWithMM('/tmp/run5_profile_ob');
await new Promise(r => setTimeout(r, 4000));
console.log('SW:', ctx.serviceWorkers().map(w=>w.url()));
// find or open the MM onboarding page
let page = ctx.pages().find(p => p.url().startsWith(`chrome-extension://${EXT_ID}`));
if (!page) { page = await ctx.newPage(); }
await page.goto(`chrome-extension://${EXT_ID}/home.html`, { waitUntil: 'domcontentloaded' }).catch(e=>console.log('goto',e.message));
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/run5b_00_welcome.png` });
const res = await onboard(page, 'run5b');
console.log('ONBOARD RESULT:', JSON.stringify(res, null, 1));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/run5b_99_after.png` });
// try read address
try {
  await page.getByTestId('account-menu-icon').click({ timeout: 4000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/run5b_98_accountmenu.png` });
} catch(e){ console.log('acct menu err', e.message); }
await ctx.close();
console.log('done');
