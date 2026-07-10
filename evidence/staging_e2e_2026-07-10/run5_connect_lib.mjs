// robust MetaMask connect approval for MV3 (slow popup render).
import { EXT_ID } from './run5_lib.mjs';

export async function unlockMM(ctx, PW) {
  let mm = ctx.pages().find(p => p.url().startsWith(`chrome-extension://${EXT_ID}`)) || await ctx.newPage();
  await mm.goto(`chrome-extension://${EXT_ID}/home.html`, { waitUntil: 'domcontentloaded' }).catch(()=>{});
  await mm.waitForTimeout(2000);
  const vis = async (sel, kind='testid', to=600) => { try { const l = kind==='testid'?mm.getByTestId(sel):kind==='role'?mm.getByRole('button',{name:sel}):mm.locator(sel); return (await l.first().isVisible({timeout:to}))?l.first():null; } catch { return null; } };
  const pf = await vis('unlock-password') || await vis('#password','css') || await vis('unlock-with-password');
  if (pf) { await pf.fill(PW); const ub = await vis('unlock-submit') || await vis(/^Unlock$/i,'role'); if (ub) await ub.click().catch(()=>{}); }
  await mm.waitForTimeout(2500);
  for (const nm of [/Maybe later/i,/Not now/i,/Got it/i,/Done/i]) { const b = await vis(nm,'role',500); if (b) { await b.click().catch(()=>{}); break; } }
  return mm;
}

// clicks whichever connect/confirm/next button is visible on a MM notification popup.
export async function approveOnce(pg) {
  const testids = ['confirm-btn','page-container-footer-next','confirm-footer-button','confirmation-submit-button','connect-button','confirm-network-switch-button','confirm-network-approve-button','submit-add-network','signature-request-scroll-button'];
  for (const t of testids) {
    try { const b = pg.getByTestId(t).first(); if (await b.isVisible({ timeout: 250 })) { await b.click().catch(()=>{}); return t; } } catch {}
  }
  for (const nm of [/^Connect$/i,/^Next$/i,/^Confirm$/i,/^Approve$/i,/^Sign$/i,/^Switch network$/i,/^Confirm connection$/i,/^Got it$/i]) {
    try { const b = pg.getByRole('button', { name: nm }).first(); if (await b.isVisible({ timeout: 200 })) { await b.click().catch(()=>{}); return nm.source; } } catch {}
  }
  return null;
}

// Poll for live notification popups and approve, for up to `budgetMs`.
// Returns array of click tags performed.
export async function drainPopups(ctx, budgetMs = 22000) {
  const tags = [];
  const t0 = Date.now();
  while (Date.now() - t0 < budgetMs) {
    const live = ctx.pages().filter(p => !p.isClosed() && p.url().startsWith(`chrome-extension://${EXT_ID}`));
    for (const pg of live) {
      const tag = await approveOnce(pg).catch(()=>null);
      if (tag) { tags.push(tag); await pg.waitForTimeout(700); }
    }
    await new Promise(r => setTimeout(r, 400));
    // stop early if we've made at least 1 click and no popup remains for 2 cycles
    if (tags.length && ctx.pages().filter(p => !p.isClosed() && p.url().startsWith(`chrome-extension://${EXT_ID}`)).length === 0) {
      // small grace for a follow-up popup (network switch)
      await new Promise(r => setTimeout(r, 1200));
      if (ctx.pages().filter(p => !p.isClosed() && p.url().startsWith(`chrome-extension://${EXT_ID}`)).length === 0) break;
    }
  }
  return tags;
}
