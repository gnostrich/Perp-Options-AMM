// Focused probe: open a band then close immediately; dissect raw_net sign + magnitude.
// Compares marks at open-state vs post-open (closing) state to attribute the residual to
// pool slippage and determine pool-favourability.
import { chromium } from 'playwright';
import path from 'path';
const BUILD = path.resolve('builds/temporal_mvp_v28_lens_S2.html');
const url = 'file://' + BUILD;
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({viewport:{width:1400,height:900}})).newPage();
  const dialogs=[]; page.on('dialog', async d=>{dialogs.push(d.message()); await d.dismiss();});
  await page.goto(url,{waitUntil:'networkidle'}); await page.waitForTimeout(400);

  // add perp (long), open a band, then dissect
  await page.click('.tab[data-subtab="perps"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.selectOption('#perp-side','long').catch(()=>{});
  await page.fill('#perp-notional','40000'); await page.fill('#perp-margin','4000');
  await page.click('#btn-add-perp'); await page.waitForTimeout(180);

  await page.click('.tab[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(120);
  await page.fill('#sold-inner','84000'); await page.fill('#sold-outer','');
  await page.fill('#bought-inner','76000'); await page.fill('#bought-outer','');
  await page.fill('#band-notional','0.05'); await page.dispatchEvent('#band-notional','input');
  await page.waitForTimeout(250);

  const pre = await page.evaluate(()=>{ const p=Store.state.pool; return {x:p.x,y:p.y,alpha:p.alpha,beta:p.beta}; });
  await page.click('#btn-execute'); await page.waitForTimeout(300);
  const open = await page.evaluate(()=>{
    const band = [...Store.state.bands].reverse().find(b=>b.status==='open');
    const p=Store.state.pool;
    return { band: band ? { id:band.id, sold_wing:band.sold_wing, bought_wing:band.bought_wing,
              soldN:band.sold.N, boughtN:band.bought.N, soldV:band.sold.V_at_open, boughtV:band.bought.V_at_open,
              slippage:band.entry.slippage } : null,
             poolAfterOpen:{x:p.x,y:p.y,alpha:p.alpha,beta:p.beta} };
  });
  const close = await page.evaluate(()=>{
    const band = [...Store.state.bands].reverse().find(b=>b.status==='open');
    if(!band) return {none:true};
    const r = Store.closeBand(band.id);
    return { ok:r.ok, X:r.X, Y:r.Y, raw_net:r.raw_net, L0:r.L0, trader_payout:r.trader_payout,
             slippageOpen: band.entry?.slippage };
  });
  console.log('PRE pool:', JSON.stringify(pre));
  console.log('OPEN:', JSON.stringify(open, null, 0));
  console.log('CLOSE:', JSON.stringify(close, null, 0));
  console.log('raw_net sign:', close.raw_net > 0 ? 'POSITIVE (Y>X, bought-leg richer)' : 'NEGATIVE/zero');
  console.log('open slippage (fraction):', open.band?.slippage);
  // interpretation: at open, soldV (premium received) and boughtV (premium paid). On close,
  // X = sold-leg settle value, Y = bought-leg settle value at the moved pool.
  console.log('soldV@open:', open.band?.soldV, ' X@close:', close.X, ' Δ:', (close.X - open.band?.soldV));
  console.log('boughtV@open:', open.band?.boughtV, ' Y@close:', close.Y, ' Δ:', (close.Y - open.band?.boughtV));
  await b.close();
})().catch(e=>{console.error('ERR',e);process.exit(2);});
