// run5_onboard.mjs — resilient MetaMask onboarding state-machine (version-agnostic).
// seed read from /tmp, never logged. Exports onboard(ctx, page).
import { readSeed } from './run5_lib.mjs';

const PW = 'Testpass123!';

async function present(page, sel, kind = 'testid') {
  try {
    const loc = kind === 'testid' ? page.getByTestId(sel)
      : kind === 'role-btn' ? page.getByRole('button', { name: sel })
      : kind === 'text' ? page.getByText(sel)
      : page.locator(sel);
    return (await loc.first().isVisible({ timeout: 300 })) ? loc.first() : null;
  } catch { return null; }
}

export async function onboard(page, outPrefix) {
  const seed = readSeed();
  const words = seed.split(/\s+/);
  let srpEntered = false, pwEntered = false, postPw = 0;
  const log = [];
  for (let i = 0; i < 50; i++) {
    await page.waitForTimeout(400);
    let acted = null;
    let el;

    // 1. terms checkbox on welcome
    el = await present(page, 'onboarding-terms-checkbox');
    if (el) { await el.click().catch(()=>{}); acted = 'terms-checkbox'; }

    // 2. import existing wallet buttons
    if (!acted) for (const t of ['btn-import-existing-wallet', 'onboarding-import-wallet', 'onboarding-create-wallet-import']) {
      el = await present(page, t); if (el) { await el.click().catch(()=>{}); acted = t; break; }
    }

    // 3. metametrics opt-out / agree (testid + text variants)
    if (!acted) for (const t of ['metametrics-no-thanks', 'onboarding-metametrics-no-thanks', 'metametrics-i-agree']) {
      el = await present(page, t); if (el) { await el.click().catch(()=>{}); acted = t; break; }
    }
    if (!acted && !srpEntered) { el = await present(page, /No thanks/i, 'role-btn') || await present(page, /I agree/i, 'role-btn'); if (el) { await el.click().catch(()=>{}); acted = 'metametrics-text'; } }

    // 4. recovery phrase entry opener (testid + text)
    if (!acted && !srpEntered) for (const t of ['btn-import-recovery-phrase', 'import-srp-import-button-open']) {
      el = await present(page, t); if (el) { await el.click().catch(()=>{}); acted = t; break; }
    }
    if (!acted && !srpEntered) {
      el = await present(page, /Import using Secret Recovery Phrase/i, 'role-btn')
        || await present(page, /Import using Secret Recovery Phrase/i, 'text');
      if (el) { await el.click().catch(()=>{}); acted = 'srp-open-text'; }
    }

    // Acknowledge modal
    if (!acted && !srpEntered) { el = await present(page, 'Acknowledge', 'role-btn'); if (el) { await el.click().catch(()=>{}); acted = 'acknowledge'; } }

    // 5. SRP input variants
    if (!acted && !srpEntered) {
      const w0 = await present(page, 'import-srp__srp-word-0') || await present(page, 'srp-input-import__srp-word-0');
      if (w0) {
        for (let k = 0; k < words.length; k++) {
          let wi = page.getByTestId('import-srp__srp-word-' + k);
          if (!(await wi.count())) wi = page.getByTestId('srp-input-import__srp-word-' + k);
          if (await wi.count()) await wi.first().fill(words[k]).catch(()=>{});
        }
        srpEntered = true; acted = 'srp-12word';
      }
      if (!acted) for (const t of ['secret-input', 'srp-input-import__srp-note']) {
        el = await present(page, t);
        if (el) {
          await el.click().catch(()=>{});
          await el.fill('').catch(()=>{});
          await el.pressSequentially(seed, { delay: 12 }).catch(async () => { await el.fill(seed).catch(()=>{}); });
          await page.keyboard.press('Space').catch(()=>{});
          srpEntered = true; acted = 'srp-single:' + t; break;
        }
      }
    }
    // 6. confirm SRP
    if (!acted && srpEntered && !pwEntered) {
      for (const t of ['import-srp-confirm', 'btn-import-wallet']) {
        el = await present(page, t); if (el) { await el.click().catch(()=>{}); acted = 'srp-confirm:' + t; break; }
      }
      if (!acted) { el = await present(page, /Continue/i, 'role-btn') || await present(page, /Confirm/i, 'role-btn'); if (el) { await el.click().catch(()=>{}); acted = 'srp-confirm-text'; } }
    }

    // 7. password
    if (!acted && !pwEntered) {
      const pnew = await present(page, 'create-password-new-input') || await present(page, 'setPassword');
      if (pnew) {
        await pnew.fill(PW).catch(()=>{});
        const pconf = await present(page, 'create-password-confirm-input') || await present(page, 'setPasswordVerify');
        if (pconf) await pconf.fill(PW).catch(()=>{});
        const terms = await present(page, 'create-password-terms') || await present(page, 'terms-and-privacy-policy');
        if (terms) await terms.click().catch(()=>{});
        const submit = await present(page, 'create-password-submit') || await present(page, 'btn-password-continue') || await present(page, 'create-password-wallet');
        if (submit) await submit.click().catch(()=>{});
        pwEntered = true; acted = 'password-set';
      }
    }

    // 8. completion / pin / biometrics popovers
    if (!acted) for (const t of ['onboarding-complete-done', 'pin-extension-next', 'pin-extension-done', 'popover-close']) {
      el = await present(page, t); if (el) { await el.click().catch(()=>{}); acted = 'complete:' + t; break; }
    }
    if (!acted && pwEntered) {
      el = await present(page, /Maybe later/i, 'role-btn') || await present(page, /Maybe later/i, 'text')
        || await present(page, /Not now/i, 'role-btn') || await present(page, /Remind me later/i, 'role-btn')
        || await present(page, /Done/i, 'role-btn') || await present(page, /Got it/i, 'role-btn') || await present(page, /Next/i, 'role-btn');
      if (el) { await el.click().catch(()=>{}); acted = 'complete-role'; }
    }

    log.push(`i=${i} acted=${acted || 'none'} url=${page.url().split('#')[1]||''}`);

    // real home signals only (logo/header present on popovers too, so exclude them)
    const home = await present(page, 'account-menu-icon') || await present(page, 'eth-overview__primary-currency')
      || await present(page, 'multichain-token-list-item') || await present(page, 'account-overview__asset-tab');
    if (pwEntered) postPw++;
    if (home && pwEntered) { log.push('HOME REACHED'); break; }
    if (pwEntered && (postPw > 4 || (!acted && postPw > 2))) { log.push('post-password done'); break; }
    if (!acted && i > 26) { log.push('stalled'); break; }
  }
  return { srpEntered, pwEntered, log };
}
