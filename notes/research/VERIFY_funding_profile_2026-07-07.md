# VERIFY — funding profile OTM→ATM→ITM (operator entries 438–447)
_research-lead run 2026-07-07; measured vs real engine (vm-extract HEAD, engine blocks = `0e0a0062`);
no web/Aristotle/git/engine edits. Manager persisted. Harness scratchpad/funding/ (gitignored)._

## Shipped formula (verbatim, HTML L2349-2357 `fundingPerStrike`)
```js
S    = poolMark(state,oracle,oracle_initial)/oracle;   // = getMP_raw/oracle_initial (oracle CANCELS)
mode = getSNorm(state);
g    = gLoc(...);                 // m·γ
m    = markLensed(wing,θ,mode,g); // same-RAY mark at the strike's own θ
gamma= (wing==='call')?+g:-g;     // ±g_loc — FIXED by wing identity
return kappa*gamma*N*m*(S-1)/S*dt;
```
poolMark = getMP_raw·(oracle/oi), getMP_raw = w·y/((1−w)·x); ray θ=K/oracle.

## Decomposition
f = κ·(±g)·N·mark·(S−1)/S·dt. PUT: gamma=−g FIXED. ⇒ **sign(f_put) = −sign(S−1)**; **|f| ∝ g·mark·|(S−1)/S|**.
- SIGN driver = pool term (S−1) — NOT wing (fixed const), NOT strike/moneyness.
- MAGNITUDE driver = mark (same-ray strike value).
- S = getMP_raw/oi — **live oracle CANCELS**; S is a pool-state scalar, same for every strike, does
  NOT move when you drag spot on a frozen pool.

## Sweep, frozen pool (w=½, S=1.125 held), fixed put K=80000
| spot/K | mark | extrinsic | fund(full mark) | fund(extrinsic) |
|---|---|---|---|---|
| 3.0 OTM | 0.0165 | 0.0165 | −7.3e-5 | −7.3e-5 |
| 1.0 ATM | 0.1481 | **0.1481** | −6.6e-4 | **−6.6e-4** |
| 0.667 seam | 0.3333 | 0.0000 | −1.5e-3 | **0.0** |
| 0.25 ITM | 0.7500 | 0.0000 | −3.3e-3 | 0.0 |
- **full mark:** sign FIXED (no inversion), magnitude MONOTONE ↑ OTM→ITM, saturates κ·g·(S−1)/S —
  funds the full intrinsic FOREVER into deep ITM (never fades).
- **extrinsic base:** CLEAN SINGLE HUMP peaking at ATM, →0 deep OTM AND exactly 0 past the seam
  θ*=1.5 (extrinsic≡0 ITM). Fades to zero BOTH ways.

## Which geometry ships (ask 4)
Shipped = [same-RAY mark at strike θ] × [GLOBAL pool-anchor gap (S−1), one scalar all strikes]. Does
NOT implement entry-386/443 same-slope per-strike read. Code comment (L2346-8): zeroes at the ANCHOR
(S→1), NOT at ATM. Modeling entry-386 same-slope literally REPRODUCES the operator's "sus" shape
(sign inverts at mode, |f| dips to 0 at ATM then rises both ways, blows up deep ITM) — adopting it
would ADD the suspicious inversion, not remove it.

## Realistic drag+arb flow (UI: move oracle → Run Arbitrage → accrue)
After arb getMP_raw→oracle ⇒ S=oracle/oi tracks spot. Fresh pool oi=80000:
| spot | S | fund(full,K=80000) | fund(full,K=100000) |
|---|---|---|---|
| 120000 | 1.50 | −1.25e-3 | −2.15e-3 |
| 80000=oi | 1.00 | **0.0** | **0.0** |
| 40000 | 0.50 | +8.98e-3 | +1.23e-2 |
- Sign DOES invert — but at spot = **DEPLOY PRICE (oi)/pool anchor**, NOT the put's ATM (coincide only
  if K=deploy). Full-mark magnitude NON-MONOTONE (zero at anchor, rising both ways). This is what SHIPS.

## Reconciliation of the manager's two contradictory reads
"sign-fixed-by-identity" right that ±g wing sign is fixed; "inverts-at-mode" right that the arb flow HAS
an inversion — but it's a POOL-ANCHOR event, not per-leg-mode. Both conflated the fixed wing sign with
the (S−1) sign that flips at the anchor. Contradiction dissolves under (frozen vs arb)×(same-ray vs same-slope).

## VERDICT vs operator smell test
| candidate | profile | verdict |
|---|---|---|
| full mark, frozen, same-ray | sign fixed, monotone ↑, saturates | sensible sign, but funds full intrinsic forever |
| **extrinsic, frozen, same-ray** | sign fixed, **single hump @ATM →0 both ways** | **the clean one** |
| full mark, arb-each-step (SHIPS) | sign flips at deploy anchor, NON-MONOTONE | operator's "sus" shape — and it's what ships |
| any base, entry-386 same-slope | zero-at-ATM-then-rise, ITM blow-up | structurally sus |

## BOTTOM LINE (operator)
1. Sign invert as put crosses ATM? Frozen pool: NO (fixed by pool term). Realistic arb flow: YES but the
   flip is at the DEPLOY PRICE/anchor, not the put's ATM. The per-leg mode-inversion of entries 443/444
   is NOT in the shipped engine — it's the entry-386 same-slope view, which the engine does not compute.
2. Non-monotone funding is REAL and is what ships (arb flow). Operator's suspicion correct.
3. Clean monotone-magnitude, sensibly-signed profile = **extrinsic base, frozen-pool same-ray** (single
   hump @ATM, →0 deep both ways). Operator's entry-444 "extrinsic keeps rising as we cross" is CONTRA the
   numbers — extrinsic is a hump that fades to 0 into ITM (0 past the seam), not a monotone rise.

## Operator-tier design choices exposed
(a) Funding sign/zero key off the pool anchor=deploy price (shipped) or per-leg moneyness/ATM? Different
   points unless struck at deploy. (b) full-mark vs extrinsic base — extrinsic removes the funds-full-
   intrinsic-forever ITM tail, gives the clean hump. (c) entry-386 same-slope is NOT shipped; adopting it
   ADDS the sus inversion. (d) On an EQUILIBRIUM pool a pure spot move ⇒ ZERO funding (oracle cancels);
   funding responds only to pool disequilibrium (skew/arb), not directly to spot.
