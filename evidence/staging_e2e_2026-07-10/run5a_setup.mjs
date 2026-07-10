// run5a_setup.mjs — validate real MetaMask loads + onboarding import completes.
import { launchWithMM, getMMWallet, readSeed, EXT_ID } from './run5_lib.mjs';

const OUT = process.cwd();
const log = (...a) => console.log(...a);

const ctx = await launchWithMM('/tmp/run5_profile_setup');
log('context launched');

// give the extension a moment to register its service worker
await new Promise(r => setTimeout(r, 4000));
log('serviceWorkers:', ctx.serviceWorkers().map(w => w.url()).slice(0, 3));
log('pages:', ctx.pages().map(p => p.url()).slice(0, 5));

let wallet, page;
try {
  ({ wallet, page } = await getMMWallet(ctx));
  log('MM page url:', page.url());
} catch (e) {
  log('getMMWallet ERR:', e.message);
  await ctx.close();
  process.exit(1);
}

await page.screenshot({ path: `${OUT}/run5a_01_mm_onboarding.png` }).catch(()=>{});

try {
  const seed = readSeed();
  await wallet.setup({ seed, password: 'Testpass123!', showTestNets: true });
  log('SETUP OK');
} catch (e) {
  log('SETUP ERR:', e.message);
  await page.screenshot({ path: `${OUT}/run5a_02_setup_err.png` }).catch(()=>{});
}

await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}/run5a_03_after_setup.png` }).catch(()=>{});

// read the connected address from the extension UI if possible
try {
  const home = `chrome-extension://${EXT_ID}/home.html`;
  await page.goto(home, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUT}/run5a_04_mm_home.png` }).catch(()=>{});
} catch (e) { log('home nav err', e.message); }

await ctx.close();
log('done');
