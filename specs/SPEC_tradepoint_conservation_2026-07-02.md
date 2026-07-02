# SPEC — TRADE-POINT CONSERVATION (engine coordinates, splice-ready) — 2026-07-02

_Author: research-lead (read-only on the engine; every number below measured in a Node vm sandbox
against the REAL HEAD engine, harnesses `verify_tradepoint.js` / `verify_close_variants.js` /
`verify_frozen_arc.js`, session scratchpad). Operator order: entry 339 ("and 2 is a flatout
regression repeated muktiple times (should be trade point....) to be fixed in html"); standing
rulings entries 14/16 (2026-06-10) + feature-inventory #16; ground truth = the paper's Trade
Formula, `paper/wine2026/temporal_wine2026_v2.tex` Eq. (2) + §2.3 exhibit (w′=11/21). Starting
point = STORY audit FLAG-A (`notes/research/STORY_COMPLETENESS_AUDIT_2026-07-02.md` row 5).
This spec is for the intern's build. **R6 skeptic scope-gate + itemized operator go come AFTER
this spec; nobody splices from this document alone.** File-safety gate, splice recipe, revert-twin
copy, single-engine-writer all apply as usual._

HEAD at spec time: `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `9fdde1de…`).

---

## 0. What is being fixed (one paragraph)

The paper's Trade Formula applies the conservation law **at the trade's own point T = ray∩curve**
with the LOCAL offsets α_T = x_T·w, β_T = y_T·(1−w), and reads the new lean off the displaced
trade point: w′ = α_T/(x_T+Δx). The shipped engine applies the same closed form **at the reserve
point with the pool's GLOBAL α,β — which it preserves** (`tradeUpdate` returns
`alpha: s.alpha, beta: s.beta`); the strike enters only the cash sizing dy = N·K_tx. On the
paper's own exhibit — (x,y,w) = (10,10,½), θ=4, Δy=+1 — the engine gives w′ = 6/11 ≈ 0.5455
(measured) where the paper gives w′ = 11/21 ≈ 0.5238. This build makes the engine execute the
paper's law. The paper already tells the trade-point story; **no paper change is required by this
fix** (the paper's engine-parity disclosure is a separate FLAG-A adjudication).

---

## 1. The algorithm (engine coordinates, exact)

### 1.1 State and coordinates
Engine pool state `s = {x, y, alpha, beta}`; lean `w = getW(s) = alpha/x` (derived);
`mode = getSNorm(s) = (1−w)/w`. Strike rays live in the sNorm coordinate (θ = K/oracle). The
pool swap lands at the **frozen tx-ray** `theta_tx = mode·(chosen/mode)^m` (entries 229/231,
unchanged).

**PIN-1 (which ray T sits on): T sits at θ_tx.** The pool transaction IS the financing swap, and
the financing swap is at θ_tx (settlement stays at the chosen strike — two-strike semantics,
unchanged). So the conservation law anchors at the tx-ray. At m=1, θ_tx = chosen, and at
chosen = mode (ATM) the law reduces to the spot law. _(Operator confirm-at-go item; see FLAG-4.)_

**PIN-2 (strike→ray registration; the moneyness ratio ρ).** The single scalar the law needs is
the **moneyness ratio**

```
ρ = theta_tx / mode ,   mode = getSNorm(state)  — the SAME mode_tx read the tx-map itself uses
                                                   (HEAD L1821), same basis, same line of code.
```

In reserve space the strike's ray slope is θ_res = (y/x)·ρ, and the trade point on the CURRENT
curve x^w·y^(1−w) = k is closed-form (derivation: reserve point is on the curve, so
x = k·θ_spot^(w−1) with θ_spot = y/x; dividing out, k never needs computing):

```
x_T = x · ρ^(w−1)        y_T = y · ρ^w        (ρ = 1 ⇒ T = the reserve point exactly)
```

Exhibit check: (10,10,w=½), ρ=4 ⇒ T = (5,20) — the paper's T exactly. _(The alternative
price-basis registration ρ_p = θ_tx/(poolMark/oracle) coincides with PIN-2 on a symmetric or
freshly-arbed pool and diverges on a leaned one — see FLAG-1.)_

### 1.2 The trade law (paper Eq. (2), transcribed)
Given `s`, cash leg `dy`, ratio `ρ`:

```
w   = alpha/x
x_T = x·ρ^(w−1)          y_T = y·ρ^w
α_T = w·x_T              β_T = (1−w)·y_T                      (local offsets AT T)
admissible:  y_T + dy > β_T                                    (paper's domain condition)
Δx  = − α_T·β_T·dy / ((y_T − β_T)·(y_T + dy − β_T))            (translated-CP flow AT T)
x′  = x + Δx             y′ = y + dy                           (flows drawn from ACTUAL reserves)
w′  = α_T / (x_T + Δx)                                         (lean read at displaced T)
α′  = x′·w′              β′ = y′·(1−w′)                        (global offsets — they MOVE, by design)
```

This is the entry-16 ruling made precise: **w is what the trade changes; x and y also change to
stay faithful to actual reserves** (x′,y′ are the real reserve flows); the global offsets α,β are
re-derived from (x′,y′,w′) — the paper says out loud that off-the-money trades "genuinely change
the global offsets α,β by design". The paper fully determines the global update — there is no
silent invention here: x′,y′ from "flows drawn from the pool's actual reserves", w′ explicit in
Eq. (2), α′,β′ from the definitions α = xw, β = y(1−w). Identity check (verified to 4.4e-16 on a
112-case grid): the single w′ conserves BOTH local pairs, (x_T+Δx)·w′ = α_T AND
(y_T+dy)·(1−w′) = β_T.

**Exhibit reproduction (exact rationals, machine-verified with BigInt fractions):**
(x,y,w) = (10,10,1/2), ρ = 4, dy = +1 ⇒ x_T = 5, y_T = 20, α_T = 5/2, β_T = 10,
Δx = −25/110 = **−5/22**, x′ = **215/22**, y′ = **11**, w′ = (5/2)/(105/22) = 55/105 = **11/21**.
Float implementation matches the rationals to ≤1e-15. The naive global recompute α/x′ = 22/43 is
NOT produced. Today's engine on the same trade: w′ = 6/11 = 0.545454… (the regression).

### 1.3 Special cases (proved + measured)
- **ρ = 1 reduces EXACTLY to the shipped `tradeUpdate`** (algebra: at ρ=1, T=(x,y), α_T=α, β_T=β,
  and w′ = α/(x+Δx) with α′ = α, β′ = β by the conserved shifted product). Measured: rel ≤ 2.7e-16
  over a w×dy grid. **Spot trades are unchanged.**
- **`arbitrageToOracle` is a spot trade** (its dy executes at the reserve point) — it stays on the
  old closed form, byte-identical; its equilibrium solve (x_eq = α+√(αβ/oracle)) remains exactly
  valid because spot trades still preserve global α,β.
- **`rebase` commutes with the law at fixed moneyness ρ, exactly** (algebra: rebase scales x,α by
  r, leaves w, y_T, β_T fixed, scales x_T, α_T, Δx by r; measured rel ≤ 5.5e-16):
  `rebase(trade_T(s,dy,ρ), r) == trade_T(rebase(s,r), dy, ρ)`. At fixed DOLLAR strike the two
  orderings now genuinely differ (the strike's moneyness moved with the oracle — economically
  correct; probe Δw′ = 1.6e-4). See §4 delta 7 and the Lean queue (§6).

### 1.4 The close: FROZEN-ARC reversal (pinned; evidence below)
Exactness of the pool round-trip does NOT survive a live re-anchored reversal. Measured on 9
cases (both wings, both cash directions, toy + BTC-scale + leaned pools), residual =
x_final − x_0 with y restored exactly:

| close registration at the frozen strike | residual sign | verdict |
|---|---|---|
| (a) live sNorm-mode: ρ_c = θ_tx/mode_live | **pool LOSES x in all 9** (e.g. −2.8e-2 on the exhibit; −6.2 on a deep-put round trip) | **free money — rejected** |
| (b) frozen reserve-ray: ρ_c = θ_res/(y′/x′) | pool GAINS in all 9 (trader overcharged; basis also alien to the engine's stack) | rejected |
| (c) frozen ρ: ρ_c = ρ_open | pool LOSES in all 9 (smaller) | rejected |
| (d) **frozen arc** (below) | **0.0 in all 9 — machine-exact, x AND w** | **PINNED** |

No uniform live rule exists: the zero-residual exponent κ in ρ_c = ρ·(mode₀/mode₁)^κ varies by
case (−0.306 exhibit vs −0.038 BTC-scale; no zero at all on the deep-put case). So exact
round-trip forces the arc freeze.

**The frozen-arc close** is the trade-point law applied at the frozen DISPLACED trade point
T′ = (x_T+Δx, y_T+dy) with the frozen local pair (α_T, β_T) — which collapses algebraically to
"apply the exact inverse flows and remove your own lean increment" (the natural extension of the
existing frozen-K_tx doctrine, R-218 / skeptic $1395: freeze the arc, not just the strike):

```
at open, each leg stores   arc = { dxA: x′−x,  dyA: dy,  dwA: w′−w,  oOpen: oracle_at_open }
at close (rr = oracle_now / arc.oOpen — rebase scales x-amounts by r, composed = rr):
    x″ = x_live − arc.dxA·rr      y″ = y_live − arc.dyA      w″ = w_live − arc.dwA
    α″ = x″·w″                     β″ = y″·(1−w″)
    guards: x″>0, y″>0, 0<w″<1 — HONEST REJECT otherwise (same class as today's singular-close).
```

Verified: (i) immediate round-trip restores (x,y,w) to machine zero, all 9 cases; (ii)
open → rebase(r) → close restores EXACTLY to rebase(s₀,r), rel ≤ 1.8e-16 (the frame-adjusted
restore — the old law has this property and it is preserved); (iii) with an intervening trade,
the closing trader's own two flow-pairs net EXACTLY zero (no leak by construction) and the pool's
w keeps everyone else's moves (w″ = w_live − own dwA); (iv) two legs' closes commute (flows and
increments are additive). dy_close = −arc.dyA equals today's −(open dy) at the frozen K_tx
identically, so the dollar-frozen reversal doctrine is unchanged — it just now carries the x-flow
and the w-increment too. _(The intervening-trade semantics "undo your own increment" is
engine-doctrine, not paper-derived — see FLAG-2/FLAG-3.)_

### 1.5 Depth guard moves to the trade point
The cash-out singularity is now y_T → β_T, not y → β. Local cash depth at T:
`y_T − β_T = w·y_T = w·y·ρ^w` (identity verified ≤1.7e-16). Guard becomes

```
if (dy < 0):  reject when  N·K_tx ≥ DEPTH_FRAC · (w·y·ρ^w)      (DEPTH_FRAC = 0.90 unchanged)
```

Capacity re-scales by ρ^w: put-side rays (ρ<1) are genuinely THINNER (at ρ=0.25, w=½: half the
old depth), call-side deeper (ρ=4: double). Geometrically faithful — the put corner is x-rich and
y-poor. The guard message must print the trade-point depth. The admissibility condition
y_T+dy > β_T is implied by the guard for cash-out and checked in the law itself for all inputs.

---

## 2. Code changes (exact, splice-ready)

All edits via the on-disk Python splice recipe (`engine/recipe_html_blob_editing.md` +
`engine/splices/SPLICE_METHOD.md`); `assert txt.count(old)==1` per anchor; blob md5s unchanged;
copy HEAD → `engine/builds/temporal_mvp_v28_lens_reservepoint.html` FIRST (the revert twin).

**One function or two? Two.** `tradeUpdate` (HEAD L1701–1709) is KEPT BYTE-IDENTICAL as the spot
law (callers: `arbitrageToOracle` L1730 — unchanged; legacy-band close fallback §2.4). The new
law is a NEW function `tradeUpdateAt(s, dy, rho)` — the trade-point generalization; grep-clean,
gate-detectable, and the (P)/(P-num) byte-identity gates on the spot trio stay green.

### 2.1 ADD `tradeUpdateAt` (insert after `tradeUpdate`, before `rebase` L1711)
```js
  // Identity IV′ — TRADE-POINT conservation law (paper Eq. 2; operator entries
  // 14/16/339; inventory #16 anchoring fix). rho = theta_tx/mode — the strike's
  // moneyness ratio (rho=1 ⇒ spot ⇒ reduces EXACTLY to tradeUpdate). The
  // conservation law is applied AT the trade point T = ray∩curve with the LOCAL
  // pair α_T,β_T; flows are drawn from the ACTUAL reserves; the new lean is read
  // at the displaced trade point. Global α,β genuinely move (by design — paper
  // §2.3). Exhibit: (10,10,½), rho=4, dy=+1 ⇒ Δx=−5/22, w′=11/21.
  function tradeUpdateAt(s, dy, rho) {
    if (!(rho > 0) || !isFinite(rho)) return null;         // NaN-loud registration
    const w  = s.alpha / s.x;
    const xT = s.x * Math.pow(rho, w - 1);                  // T on the CURRENT curve
    const yT = s.y * Math.pow(rho, w);
    const aT = w * xT;                                      // α_T (local offsets AT T)
    const bT = (1 - w) * yT;                                // β_T
    const yTn = yT + dy;
    if (!(yTn > bT)) return null;                           // admissible domain (Eq. 2)
    const denom = (yT - bT) * (yTn - bT);
    if (Math.abs(denom) < 1e-12) return null;
    const dx = -aT * bT * dy / denom;                       // translated-CP flow AT T
    const x_new = s.x + dx, y_new = s.y + dy;               // ACTUAL reserves move
    if (!isFinite(x_new) || !isFinite(y_new) || x_new <= 0 || y_new <= 0) return null;
    const w_new = aT / (xT + dx);                           // lean at displaced T
    if (!(w_new > 0 && w_new < 1)) return null;
    return { x: x_new, y: y_new, alpha: x_new * w_new, beta: y_new * (1 - w_new) };
  }

  // Frozen-arc close (R-218 extended: freeze the ARC, not just the strike). arc =
  // {dxA, dyA, dwA, oOpen} captured at open; rr = oracle_now/arc.oOpen (rebase
  // scales x-amounts). Exact inverse of the leg's own open flows + lean increment;
  // machine-exact round trip; intervening trades' moves are kept. Honest reject
  // on infeasible.
  function revertArc(s, arc, rr) {
    if (!arc || !isFinite(arc.dxA) || !isFinite(arc.dyA) || !isFinite(arc.dwA)) return null;
    const r = (isFinite(rr) && rr > 0) ? rr : 1;
    const w_live = s.alpha / s.x;
    const x2 = s.x - arc.dxA * r, y2 = s.y - arc.dyA, w2 = w_live - arc.dwA;
    if (!(x2 > 0 && y2 > 0 && w2 > 0 && w2 < 1)) return null;
    return { x: x2, y: y2, alpha: x2 * w2, beta: y2 * (1 - w2) };
  }
```

### 2.2 `executeLeg` (HEAD L1821–1844)
After the existing tx-map block (`theta_tx` L1824, `K_tx` L1825):
- `const rho_tx = Math.exp(u_tx);` — exactly `theta_tx/mode_tx`, no new read (PIN-2).
- **Depth guard** (anchor block L1833–1839): replace `const depth = state.y - state.beta;` with
  the trade-point depth `const w0 = state.alpha / state.x;`
  `const depth = w0 * state.y * Math.pow(rho_tx, w0);` and update the reject string to say
  "pool cash depth at the tx-ray".
- **The swap** (anchor L1840, count==1: `const post = tradeUpdate(state, dy);`) →
  `const post = tradeUpdateAt(state, dy, rho_tx);`.
- **Return object** (L1842–1844): add the arc —
  `arc: { dxA: post.x - state.x, dyA: dy, dwA: (post.alpha/post.x) - (state.alpha/state.x), oOpen: fx }`
  (plus keep everything already returned).

### 2.3 `openBand` leg storage (anchors L2607 / L2613, the `K_tx:` lines)
Store `arc: result.leg1.arc` on `sold` and `arc: result.leg2.arc` on `bought`, beside `K_tx`.

### 2.4 `closeBand` (L2093–2107 + the four `tradeUpdate(s, dyRev…)` calls L2167/2181/2191/2197)
- Keep the Ksold/Kbought derivation (legacy fallback needs it). Add per-leg:
  `const rrArc = (band.sold.arc && band.sold.arc.oOpen > 0) ? oForK / band.sold.arc.oOpen : 1;`
  (same for bought).
- Each OTM-leg reversal becomes: **if the leg carries an arc**, `revertArc(s, leg.arc, rrArc)`;
  **else** (legacy band opened pre-build) fall back to today's `tradeUpdate(s, dyRev…)` —
  today's exact behavior for old saved bands, loud-ish comment, no new leak vector (FLAG-5).
  Honest reject ("close infeasible (arc reversal)") when revertArc returns null.
- The ITM settled leg is unchanged (no AMM transaction — its arc is simply never reversed;
  the carve/L0 payout path is untouched).

### 2.5 Engine export (anchor L2295 `tradeUpdate, rebase, arbitrageToOracle,`)
Add `tradeUpdateAt, revertArc,` to the export list.

### 2.6 Draw layer — `framePool` (L3611–3617) + `drawPricing` (L3641–3648)
Today the continuous-warp animation replays the NET band cash through the spot law and hard-snaps
the final frame to `previewPool` — under the new law the intermediate frames would ride the wrong
(fixed-α,β) path and jump at the end. Minimal faithful fix (draw-only): animate **per-leg,
sequentially** — `framePool` takes the preview's leg list `[{dy, rho}]`; for sFrac ∈ [0,½] apply
`tradeUpdateAt(prePool, dy1·(2s), rho1)`, for (½,1] apply leg1 in full then
`tradeUpdateAt(·, dy2·(2s−1), rho2)`; s=1 lands on the true preview pool by construction. If leg
data is unavailable, degrade to a static draw of `previewPool` (never animate a wrong path). The
preview dry-run already produces the legs; thread `{dy: legN.dy, rho: legN.theta_tx/mode-at-leg}`
(or return `rho_tx` from executeLeg alongside `theta_tx`).

### 2.7 Comments that must move with the code (the CTO ports from these)
- L1592 prod-mapping block: add `tradeUpdateAt → transact/amm_update.go` (it, not tradeUpdate,
  is now the live trade path); note revertArc → the close path.
- L1619–1642 lens header: the claim "never touches the pool" stays true of the LENS; add one line
  that the POOL trade law is now trade-point-anchored (entry 339 build).
- L2082–2097 close-reversal comment: rewrite for the frozen ARC (K_tx line stays; add dxA/dwA).
- `lens_selfcheck.js` header L12 "Pool fns byte-identical to v24" → "spot fns byte-identical;
  live trade path = trade-point law (CM8-v2)".

**NOT changed:** `tradeUpdate` (byte-identical), `arbitrageToOracle`, `rebase`, `gLoc`,
`markLensed`, `legPrice`, tx-map/θ_tx/K_tx freeze, N_buy sizing formula, `liquidity` (isotropic
resize — orthogonal, still w-invariant), funding, carve/club/L0, fees, guards other than depth,
settlement marks. dy sizing (N·K_tx) unchanged — the fix changes only what a given dy DOES to
the pool.

---

## 3. Gates (retirements, replacements, survivors) + tester protocol

### 3.1 lens_selfcheck.js
- **(P)/(P-num) SURVIVE** as written (they test the spot trio byte/numeric identity — still true).
- **CM8 → CM8-v2** (the old CM8's intent "no curve change in the pool" is now FALSE by design —
  the pool gained a law; a green stale CM8 would lie):
  1. spot trio (`tradeUpdate`/`arbitrageToOracle`/`rebase`) byte-identical to v24 (kept);
  2. `tradeUpdateAt` present; **the 11/21 exhibit as a HARD case**: state (10,10,½), ρ=4, dy=+1 ⇒
     |w′−11/21| ≤ 1e-15, |x′−215/22| ≤ 1e-13, y′==11; and NOT the naive 22/43;
  3. ρ=1 reduction ≡ `tradeUpdate` on a w×dy grid (rel ≤1e-12);
  4. local-pair conservation at T: (x_T+Δx)w′=α_T ∧ (y_T+dy)(1−w′)=β_T on a grid (rel ≤1e-12);
  5. routing: `executeLeg` source contains `tradeUpdateAt(state, dy` and does NOT contain
     `tradeUpdate(state, dy)` (negative control: the old HEAD fails exactly this).
- **CM6 → CM6-v2** (frozen-ARC round trip):
  1. band open→close reserves restore ≤1e-9 (existing cases, now through revertArc);
  2. single-leg open + revertArc restores (x,y,w) ≤1e-12;
  3. open → rebase(r) → close == rebase(s₀,r) (rel ≤1e-9), r ∈ {0.8, 1.25};
  4. **negative control**: a live sNorm-re-registered reversal on the exhibit leaves
     |x-residual| > 1e-3 (proves the arc is load-bearing, catches a future "simplification");
  5. no-free-money: Σ(own dy flows) == 0 and Σ(own dx flows) == 0 exactly, including with one
     intervening spot trade.
- **CM5, CM7 SURVIVE** (θ_tx map + polarity untouched). **CM1–CM4, CM9–CM11 SURVIVE** (lens/mark
  layer untouched). **L4 SURVIVES** (arb stays lens-free AND trade-point-free — spot).
- **a16_atm_gate: all 5 SURVIVE** unchanged (mark layer only).
- **monolith_consistency.js** lines (2) "Casimirs conserved" and (7) gamma_affine read
  `E.tradeUpdate` directly — they stay green but their labels must be re-scoped "SPOT law" (the
  LIVE trade path no longer conserves α,β — that is the fix, not a break). Report-only edit.

### 3.2 Tester acceptance (live, per standing skeptic smoke-pass rule)
1. vm-probe the exported `Engine.tradeUpdateAt` exhibit (11/21) [HARD].
2. Band open/close sweeps both wings, OTM and ITM-settle paths: reserves restore exactly on
   full-OTM close; ITM path pays through the unchanged carve/L0 pipe.
3. Preview w-ledger readout matches a hand tradeUpdateAt prediction at 4dp; per-click deltas for
   every control; direction swaps.
4. NEW negative-space check: after an off-ATM trade, α and β VISIBLY move (today they never do)
   and chart-1's curve re-anchors; ATM trade ⇒ α,β steady (ρ=1).
5. Depth guard: a deep put-side cash-out leg rejects with the trade-point depth number (tighter
   than the old y−β guard at the same strike).
6. m=1 vs m=2: trade lands further out AND re-leans by the trade-point amounts (CM7 co-move
   still monotone).
7. Full 17/17 UI smoke; DIFF_LEDGER entry keyed to inventory #16 (anchoring gap → CLOSED-in-build,
   pending operator go).

---

## 4. Behavioral deltas — the operator disclosure list (all measured)

1. **Every off-ATM trade re-leans w differently.** Exhibit: old w′ 0.5455 → new 0.5238. BTC-scale
   band legs: Δw′ ~1e-3…1e-4 per leg (table §5). Call-side trades now move the lean LESS,
   put-side MORE (local depth scales ×ρ^w).
2. **α and β now move on off-ATM trades** (today: provably never). The curve genuinely
   re-anchors; γ = w/(1−w), g_loc = m·γ, seams S* = K·g/(g+1), and the funding exponent all
   breathe along a DIFFERENT trajectory after trades. Chart-1 and the preview stepper visibly
   change.
3. **Reserve x-flows differ materially at far strikes** (exhibit |Δx|: 0.833 → 0.227). The
   slippage readouts (% = Δ(w/(1−w)) ratio; $ = |Δy|−p₀|Δx|) re-price per leg accordingly.
4. **Depth guard capacity re-scales by ρ^w**: put-wing cash-out legs reject earlier (at m=2 the
   put θ_tx sits far down — noticeably tighter); call-wing legs get more room.
5. **Close still round-trips the pool EXACTLY** — now via the frozen arc stored on the leg.
   Legacy saved bands (no arc) close via today's path (labelled fallback).
6. **Rebase**: exact commutation with trading holds at fixed moneyness (proved + measured);
   at a fixed DOLLAR strike the order now matters slightly (probe Δw′ = 1.6e-4) — economically
   correct (the strike's moneyness moved with the oracle).
7. **N_buy sizing shifts slightly** (the bought leg prices on a differently-leaned post-leg1
   pool).
8. **The paper's §2.3 exhibit becomes engine-true** — story-audit FLAG-A's engine side closes;
   STORY_TABLE row 2's "🔒 unchanged (engine)" becomes honest; inventory #16's "anchoring-OPEN"
   label retires ON OPERATOR GO (manager/skeptic own the label flips).

## 5. Verification table (old engine vs new spec — measured, harness `verify_tradepoint.js`, 12/12 + 3/3 checks green)

| case | state (x,y,w) | ρ | dy | OLD w′ / x′ / y′ | NEW w′ / x′ / y′ | Δw′ |
|---|---|---|---|---|---|---|
| C1 exhibit, call-side cash-in | (10, 10, .5) | 4 | +1 | 0.54545455 / 9.1666667 / 11 | **0.52380952 (=11/21) / 9.7727273 (=215/22) / 11** | −2.17e-2 |
| C2 call-side cash-out | (10, 10, .5) | 4 | −1 | 0.44444444 / 11.250000 / 9 | 0.47368421 / 10.277778 / 9 | +2.92e-2 |
| C3 put-side cash-in | (10, 10, .5) | 0.25 | +1 | 0.54545455 / 9.1666667 / 11 | 0.58333333 / 7.1428571 / 11 | +3.79e-2 |
| C4 put-side cash-out | (10, 10, .5) | 0.25 | −1 | 0.44444444 / 11.250000 / 9 | 0.37500000 / 16.666667 / 9 | −6.94e-2 |
| C5 ATM ρ=1 (spot reduction) | (10, 10, .5) | 1 | +1 | 0.54545455 / 9.1666667 / 11 | identical (Δ=0 exactly) | 0 |
| C6 BTC sell call, chosen 1.3, m=2 | (10, 8e5, .5) | 1.69 | +6760 | 0.50418960 / 9.9169043 / 806760 | 0.50322901 / 9.9506417 / 806760 | −9.61e-4 |
| C7 BTC sell put, chosen 0.8, m=2 | (10, 8e5, .5) | 0.64 | −2560 | 0.49839486 / 10.032206 / 797440 | 0.49799197 / 10.050403 / 797440 | −4.03e-4 |
| C8 leaned pool, call cash-in | (10, 8e5, .6) | 2 | +8000 | 0.60396040 / 9.9344262 / 808000 | 0.60262172 / 9.9670292 / 808000 | −1.34e-3 |
| C9 leaned pool, put cash-out | (10, 8e5, .6) | 0.5 | −8000 | 0.59595960 / 10.067797 / 792000 | 0.59384382 / 10.136789 / 792000 | −2.12e-3 |

Round-trip (frozen arc): x/w residuals 0.0 machine-exact on all 9 R-cases; rebase-interleaved
restore rel ≤1.8e-16; live-reversal negative control residual −2.78e-2 (the leak the arc closes).

## 6. FLAGs — operator-tier underdeterminations (pinned, not silently invented)

- **FLAG-1 (registration basis).** The paper under-determines strike→ray registration on a LEANED
  pool. Pinned: ρ = θ_tx/getSNorm(state) — the same single-basis mode read the tx-map uses on the
  adjacent line. Alternative: price-basis (poolMark/oracle, as executeBand's OTM checks use).
  They coincide on symmetric/freshly-arbed pools; diverge with lean. Operator may re-pin.
- **FLAG-2 (close semantics).** Pinned: frozen-arc exact reversal — forced by the measured leak
  table (§1.4): EVERY live re-registration leaks pool x in some direction, and no uniform exact
  live rule exists. Alternative (live-law close with a signed, disclosed residual) requires
  accepting a trader-favorable leak or the (b)-overcharge. Operator confirm.
- **FLAG-3 (intervening trades).** "Undo your own flows + your own lean increment"
  (w″ = w_live − dwA) is engine-doctrine, not paper text. Deterministic, order-independent
  across legs, exactly flow-neutral; can honestly reject on extreme paths. Operator confirm.
- **FLAG-4 (T at θ_tx).** Pinned per two-strike semantics (the pool transaction IS the financing
  swap at the frozen tx-ray; settlement stays at chosen). Confirm at go.
- **FLAG-5 (legacy bands).** Pre-build saved bands carry no arc — pinned fallback = today's close
  path. Alternative: refuse to close legacy bands.
- **Lean/theory consequence (manager visibility, not operator-tier):** `trade_conserves`
  (Casimir α,β conservation), TrajectoryDomain L1, and the EngineBridge L7 `tradeUpdate`
  transcription now describe the SPOT law only — INDEX re-scoping needed; NEW Aristotle
  obligations queued (not this slice, no-Aristotle order): trade-point local-pair conservation +
  w′ identity; ρ=1 reduction; fixed-ρ rebase commutation; frozen-arc exactness; PH re-derivation
  of internal passivity for the trade-point law (R_psd at T).

## 7. Scope honesty
Read-only on the engine; no splice performed; no Aristotle; no git. All numbers from Node vm
sandboxes over the extracted HEAD engine scripts plus the spec-law implementation transcribed in
§2.1 verbatim. The paper is NOT edited by this build (its Trade Formula is the ground truth; its
engine-parity sentence is FLAG-A's separate adjudication).
