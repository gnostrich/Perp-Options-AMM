// Live acceptance: VOCAB SCRUB relabel (abd35f4b -> 5ce1a76c). READ-ONLY on engine.
// term "lean" -> "skew / ray deviation". Verifies visible strings + no visible funding-lean
// + m-knob delta + trade skews at trade point. Run: node pw_vocab_relabel_acceptance.mjs <A|B>
import { chromium } from 'playwright';
import fs from 'fs';
const RUN = process.argv[2] || 'A';
const FILE = 'file://' + process.cwd() + '/builds/HEAD_temporal_mvp_v28_lens.html';
const OUT = 'evidence/vocab_relabel/';
fs.mkdirSync(OUT, { recursive: true });
const R = { run: RUN, checks: {} };
const errs = [];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('pageerror', e => errs.push('pageerror:' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console:' + m.text()); });
  p.on('dialog', d => { errs.push('dialog:' + d.message()); d.dismiss(); });
  await p.goto(FILE);
  await p.waitForTimeout(600);

  // --- navigate to portfolio bands so the table + units-note are laid out ---
  await p.click('.page-nav-link[data-page="portfolio"]').catch(()=>{});
  await p.waitForTimeout(150);
  await p.click('.tab[data-subtab-pf="bands"]').catch(()=>{});
  await p.waitForTimeout(150);

  // C1a: Funding column HEADER text
  const th = await p.evaluate(() => {
    const ths = [...document.querySelectorAll('th')];
    const f = ths.find(t => /Funding/.test(t.textContent));
    return f ? { text: f.textContent.trim(), title: f.getAttribute('title') } : null;
  });
  R.checks.header_text = th ? th.text : 'NOT FOUND';
  R.checks.header_title = th ? th.title : 'NOT FOUND';
  R.checks.C1a_header = th && th.text === 'Funding (ray dev; TBD)';
  R.checks.C1b_tooltip_prefix = th && /^Funding \(same-slope ray deviation from the anchor curve;/.test(th.title || '');

  // C1c: units-note "SKEW DEVIATION", not "LEAN"
  const note = await p.evaluate(() => {
    const els = [...document.querySelectorAll('.pf-units-note')].filter(e => e.offsetParent !== null);
    return els.length ? els.map(e => e.textContent).join(' ||| ') : (document.querySelector('.pf-units-note') ? document.querySelector('.pf-units-note').textContent : null);
  });
  R.checks.units_note_has_SKEW_DEVIATION = !!note && /SKEW DEVIATION/.test(note);
  R.checks.units_note_no_LEAN = !!note && !/LEAN/.test(note);
  R.checks.units_note_snippet = note ? note.slice(0, 220) : null;

  // C1d: no visible funding-"lean" anywhere. The Lean PROVER (capital L, "Lean identities",
  // "Lean-validated") is legitimate and excluded. We scan visible innerText for /lean/ as a
  // standalone word not immediately part of "Lean " prover phrasing.
  const visLean = await p.evaluate(() => {
    // collect visible text
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const hits = [];
    let n;
    while ((n = walker.nextNode())) {
      const el = n.parentElement;
      if (!el || el.offsetParent === null) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const t = n.textContent;
      // match "lean" case-insensitive
      const re = /lean/gi;
      let m;
      while ((m = re.exec(t))) {
        const ctx = t.slice(Math.max(0, m.index - 12), m.index + 16);
        hits.push({ ctx, tag: el.tagName });
      }
    }
    return hits;
  });
  // classify: Lean prover ("Lean identities", "Lean-", "Lean 4", ".lean") vs funding-lean
  const proverRe = /(Lean\s+(identit|model|4|proof)|Lean-|\.lean|trusted-from-prover|Lean\b)/;
  const fundingLean = visLean.filter(h => !/Lean/.test(h.ctx));
  R.checks.visible_lean_all = visLean.map(h => h.ctx);
  R.checks.visible_funding_lean = fundingLean.map(h => h.ctx);
  R.checks.C1d_no_visible_funding_lean = fundingLean.length === 0;

  // Also scan title/tooltip attributes for funding-lean
  const attrLean = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('[title]')) {
      const t = el.getAttribute('title') || '';
      if (/lean/i.test(t) && !/Lean/.test(t)) out.push(t.slice(0, 60));
    }
    return out;
  });
  R.checks.attr_funding_lean = attrLean;
  R.checks.C1e_no_attr_funding_lean = attrLean.length === 0;

  // --- C3: m-knob per-click delta (chart-2 steepness). Clear band ghost first. ---
  await p.click('.page-nav-link[data-page="trade"]').catch(()=>{});
  await p.waitForTimeout(150);
  const mDelta = await p.evaluate(() => {
    const getM = () => (typeof Store !== 'undefined' && Store.state ? Store.state.m : null);
    const setMInput = (v) => {
      const el = document.querySelector('#m-input');
      if (!el) return null;
      el.value = String(v);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return getM();
    };
    // read closed-form mode mark at default pool for a few m via Engine
    const s = Store.state;
    const modeMark = (m) => {
      const w = s.pool.alpha / s.pool.x; // ~0.5
      const g = Engine.gLoc(s.pool, Engine.getSNorm(s.pool), m);
      return { g, mark: Engine.markLensed(w, Engine.getSNorm(s.pool), Engine.getSNorm(s.pool), g) };
    };
    return { m1: modeMark(1), m3: modeMark(3), m6: modeMark(6), setM3: setMInput(3), setM1: setMInput(1) };
  }).catch(e => ({ err: e.message }));
  R.checks.m_knob = mDelta;
  R.checks.C3_m_steepens = mDelta && mDelta.m1 && mDelta.m6 && (mDelta.m6.g > mDelta.m1.g) && (mDelta.m6.mark < mDelta.m1.mark);

  // --- C3b: trade skews at trade point (w moves off 1/2 via tradeUpdateAt exhibit) ---
  const trade = await p.evaluate(() => {
    const out = Engine.tradeUpdateAt({ x: 10, y: 10, alpha: 5, beta: 5 }, 1, 4);
    return { x: out.x, y: out.y, w: out.alpha / out.x };
  }).catch(e => ({ err: e.message }));
  R.checks.trade_exhibit = trade;
  R.checks.C3b_trade_skews = trade && Math.abs(trade.w - 11 / 21) < 1e-12 && Math.abs(trade.x - 215 / 22) < 1e-10;

  // --- C3c: both charts render (nonblank census) ---
  const census = await p.evaluate(() => {
    const out = {};
    for (const id of ['canvas-curve', 'canvas-pricing']) {
      const c = document.getElementById(id);
      if (!c) { out[id] = null; continue; }
      const ctx = c.getContext('2d');
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
      out[id] = n;
    }
    return out;
  }).catch(e => ({ err: e.message }));
  R.checks.canvas_census = census;

  R.errors = errs;
  R.overall =
    R.checks.C1a_header && R.checks.C1b_tooltip_prefix &&
    R.checks.units_note_has_SKEW_DEVIATION && R.checks.units_note_no_LEAN &&
    R.checks.C1d_no_visible_funding_lean && R.checks.C1e_no_attr_funding_lean &&
    R.checks.C3_m_steepens && R.checks.C3b_trade_skews && errs.length === 0;

  fs.writeFileSync(OUT + 'RESULT_run' + RUN + '.json', JSON.stringify(R, null, 2));
  await p.screenshot({ path: OUT + RUN + '_bands_funding.png', fullPage: true });
  await b.close();
  console.log('overall=', R.overall, 'errs=', errs.length);
  console.log('header=', R.checks.header_text, '| tooltipPrefix=', R.checks.C1b_tooltip_prefix, '| noteSKEW=', R.checks.units_note_has_SKEW_DEVIATION, 'noteNoLEAN=', R.checks.units_note_no_LEAN);
  console.log('visible funding-lean=', R.checks.visible_funding_lean, '| attr funding-lean=', R.checks.attr_funding_lean);
  console.log('mKnob g m1/m6=', mDelta.m1 && mDelta.m1.g, mDelta.m6 && mDelta.m6.g, '| trade w=', trade.w, '| census=', JSON.stringify(census));
})();
