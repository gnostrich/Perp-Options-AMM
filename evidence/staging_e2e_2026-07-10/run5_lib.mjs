// run5_lib.mjs — shared launcher for real-MetaMask (dappwright) + proxy + Xvfb Chromium.
// Seed is read from /tmp only, never logged.
import { chromium } from 'playwright-core';
import { getWallet } from '@tenkeylabs/dappwright';
import fs from 'fs';

export const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
export const EXT = '/tmp/mm_ext';
export const EXT_ID = 'gadekpdjmpjjnnemgnhkbjgnjpdaakgh';
export const PROXY = 'http://127.0.0.1:37531';
export const APP = 'https://app-staging.temporal.exchange/';

export async function launchWithMM(userDataDir) {
  const ctx = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    executablePath: CHROME,
    viewport: { width: 1400, height: 950 },
    ignoreHTTPSErrors: false,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--disable-extensions-except=${EXT}`,
      `--load-extension=${EXT}`,
      `--proxy-server=${PROXY}`,
      '--proxy-bypass-list=<-loopback>',
      '--ssl-version-max=tls1.2',
      '--disable-features=DisableLoadExtensionCommandLineSwitch',
    ],
  });
  return ctx;
}

// Wait for MetaMask to expose its onboarding/home page, then attach dappwright wallet helper.
export async function getMMWallet(ctx, timeout = 45000) {
  const home = `chrome-extension://${EXT_ID}/home.html`;
  const t0 = Date.now();
  // MetaMask opens an onboarding tab automatically on install (MV3 may take a moment).
  let page = null;
  while (Date.now() - t0 < timeout) {
    for (const p of ctx.pages()) {
      if (p.url().startsWith(`chrome-extension://${EXT_ID}`)) { page = p; break; }
    }
    if (page) break;
    // also poll service workers to confirm the extension booted
    await new Promise(r => setTimeout(r, 500));
  }
  if (!page) {
    // force-open the home page
    page = await ctx.newPage();
    await page.goto(home, { waitUntil: 'domcontentloaded' });
  }
  const wallet = await getWallet('metamask', ctx);
  return { wallet, page };
}

export function readSeed() {
  // never returned to logs; used only to drive MetaMask import
  return fs.readFileSync('/tmp/run5_mm_seed.txt', 'utf8').trim();
}
