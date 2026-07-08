# DERIVE — funding weight CORRECTION: OTM-only lean profile (operator entry 458)
_research-lead run 2026-07-08; measured vs REAL engine (vm-extract of the HEAD engine block,
`engine/builds/HEAD_temporal_mvp_v28_lens.html` L1594–2339, blocks = update-1 funding build `bb2f8230`).
No web / git / engine-edit / Aristotle. Harness: scratchpad `funding_probe.js` + `funding_confirm.js`._

## The correction the operator ordered (entry 458, verbatim frame)
Shipped update-1 `fundingPerStrike` weights by **EXTRINSIC = markLensed − intrinsic**. Measured, the
extrinsic weight **PEAKS AT THE MONEY** (put ext(ATM)=0.1481, the max of the whole profile) and is
**nonzero into the near-ITM sliver** (put ext>0 for mode<θ<seam S*=1.5·mode) → it funds exactly the
strikes the operator does not want funded. Target shape instead:

> **Funding lives ONLY out-of-the-money; ZERO at the money AND ZERO in-the-money; fading smoothly to
> zero at the ATM edge.** It is the CURVE'S LEAN/DEVIATION at the strike (zero at the anchor, grows
> where the curve is leaned), restricted to OTM.

So the per-strike **magnitude weight** must be `0 @ATM · 0 ∀ITM · >0 OTM · →0 at the ATM edge`.

---

## 1. OTM/ITM direction per wing — pinned with numbers
Engine coords: `mode = getSNorm(state)` (ATM point), `strike_theta = θ` (strike ray), BOTH in the single
reciprocal sNorm coordinate (MUST-APPLY-1). Funding evaluates each strike at spot = mode. With a
symmetric probe pool `{x:10,y:10,α:5,β:5}` ⇒ **mode = 1**, w=½, γ=1; knob m=2 ⇒ g_loc = m·γ = **2**.

Intrinsic parity in funding (sNorm←mode, θ←strike): put `max(0,1−mode/θ)`, call `max(0,1−θ/mode)`.
Therefore **`intr>0` ⟺ ITM** exactly, for BOTH wings:

| wing | OTM | ATM | ITM | `intr>0` selects |
|---|---|---|---|---|
| **put**  | θ < mode (θ<1) | θ = mode | θ > mode (θ>1) | ITM (θ>mode) |
| **call** | θ > mode (θ>1) | θ = mode | θ < mode (θ<1) | ITM (θ<mode) |

**Key lever for the splice:** `intr` (already computed in the shipped code) is the exact ITM indicator.
`intr>0 ? 0 : W` gates funding to OTM∪{ATM} for free; the ATM point self-zeroes because the deviation
is 0 there. No new `isOTM` call needed.

## 2. Candidate weights W(θ) — measured profiles (put wing, mode=1, g=2)
All ≥0 magnitudes. `ext` = shipped (for contrast). ρ_otm = (put) θ/mode / (call) mode/θ, <1 in OTM.

| θ | region | ext (SHIPPED) | (a) \|ln(θ/m)\| | (b) \|ln\|·mark | (c) 1−ρ_otmᵍ |
|---|---|---|---|---|---|
| 0.05 | OTM deep | 0.00037 | 2.9957 | 0.00111 | 0.9975 |
| 0.25 | OTM | 0.00926 | 1.3863 | 0.01284 | 0.9375 |
| 0.50 | OTM | 0.03704 | 0.6931 | 0.02567 | 0.7500 |
| 0.667| OTM | 0.06591 | 0.4050 | 0.02669 | 0.5551 |
| 0.90 | OTM | 0.12000 | 0.1054 | 0.01264 | 0.1900 |
| 0.95 | OTM edge | 0.13370 | 0.0513 | 0.00686 | 0.0975 |
| **1.00** | **ATM** | **0.14815** | **0** | **0** | **0** |
| 1.05 | ITM | 0.11571 | 0 (gated) | 0 | 0 |
| 1.50 | ITM (seam) | 0.00000 | 0 | 0 | 0 |
| 3.00 | ITM deep | 0.00000 | 0 | 0 | 0 |

Call wing mirrors exactly (OTM = θ>1). Target-hit check `0/0/positive/0`:

| candidate | @ATM | ∀ITM | OTM | monotone in OTM | ATM-edge smoothness | deep-OTM |
|---|---|---|---|---|---|---|
| ext (shipped) | 0.148 ✗ | 0 near-ITM✗ | + | rises to ATM (wrong way) | — | fades |
| **(a) \|ln(θ/m)\|** | 0 ✓ | 0 ✓ | + ✓ | ✓ ↑ | C0 corner (slope→∓1) | **UNBOUNDED ↑** |
| **(b) \|ln\|·mark** | 0 ✓ | 0 ✓ | + ✓ | ✗ (single lobe, turns over) | C0 corner | **bounded, FADES →0** |
| **(c) 1−ρ_otmᵍ** | 0 ✓ | 0 ✓ | + ✓ | ✓ ↑ | C0 corner (slope∓g) | **bounded, →1 PLATEAU** |
| (a″) ln²  | 0 ✓ | 0 ✓ | + ✓ | ✓ ↑ | **C1 (zero slope)** | unbounded ↑ |
| (a″)·mark = ln²·mark | 0 ✓ | 0 ✓ | + ✓ | ✗ lobe | **C1** | bounded, fades |

All natural candidates satisfy the hard target (0 ATM / 0 ITM / positive OTM / no hump straddling
ATM / no seam). They differ ONLY on the two free axes the operator left open: (i) deep-OTM shape,
(ii) C0-corner vs C1 at the ATM edge.

**On (ii) smoothness:** every closed form that reads the deviation *linearly* (|ln|, moneyness−1,
1−ρᵍ) has value→0 at ATM but a **nonzero slope corner** there (C0). This is NOT a seam and NOT a hump
— the value fades continuously to zero — so it meets "fading smoothly to zero, no seam, no hump." A
literally C1 (zero-slope) edge requires a *squared* deviation (ln²), which is otherwise identical in
shape. Recommend not paying the ln² complexity unless the operator specifically wants zero-slope tangency.

## 3. Sign mechanism — UNCHANGED, and it must be
Shipped: `f = κ·(±g)·N·weight·(S−1)/S·dt`. Sign lives entirely in **`±g·(S−1)/S`** (±g = fixed wing
identity, gamma=+g call / −g put; `(S−1)/S` = the GLOBAL pool-anchor gap, S = poolMark/oracle, one scalar
for all strikes, zeroes at the w=½ deploy anchor S→1). The weight is a **nonnegative magnitude**.

- Swapping ext → any W≥0 **does not touch the sign** — verified against the real fn at S=1.25:
  put funding stays **negative** (−sign(S−1)), call **positive**, for every OTM strike; ITM/ATM = 0.
- **Per-strike "zero at ATM" is delivered by the WEIGHT, not the sign.** The engine's only per-strike
  magnitude factor was the mark/extrinsic, which peaks at ATM — that is exactly why shipped funding is
  NOT zero at a strike's ATM (it zeroes only at the *global* pool anchor S=1). Achieving the operator's
  per-strike zero-at-ATM **requires adding a per-strike deviation weight** with W(mode)=0. This is the
  whole fix. The `(S−1)/S` global sign/zero and the ±g scaling (kurtosis knob m re-scales the rate,
  entries 232/233) both **stay** and stay consistent (magnitude ≥0 can't flip them).

## 4. Proposed splice (for the intern) — minimal, sign untouched
Replace the extrinsic-weight block in `fundingPerStrike` (HEAD L2316–2326). Keep `intr` (reuse as the
ITM gate), drop `ext`. **PRIMARY = candidate (c)** — bounded, monotone-growing into OTM (best fit for
"grows where the curve is leaned"), closed-form from the smooth-paste geometry, no extra markLensed call:

```js
    const intr = (wing === 'call') ? Math.max(0, 1 - strike_theta / mode)
                                   : Math.max(0, 1 - mode / strike_theta);
    // OTM-ONLY LEAN weight (UPDATE 1 CORRECTION, operator entry 458): 0 @ATM, 0 ∀ITM,
    // positive OTM, monotone-growing into OTM, bounded (→1 deep OTM). ρ_otm<1 OTM, =1 ATM.
    const rhoOTM = (wing === 'call') ? mode / strike_theta : strike_theta / mode;
    const W = (intr > 0) ? 0 : (1 - Math.pow(rhoOTM, g));   // replaces `ext`; ITM(intr>0)→0
    const gamma = (wing === 'call') ? +g : -g;              // ±g_loc SIGN UNCHANGED
    if (S <= 0) return 0;
    return kappa * gamma * N * W * (S - 1) / S * dt;         // (S−1)/S, κ, N, dt UNCHANGED
```

Alternative one-line swaps for the sub-decision in §5 (same surrounding code):
- **(b) bounded fading lobe:** `const W = (intr > 0) ? 0 : Math.abs(Math.log(strike_theta / mode)) * mk;`
- **(a) unbounded monotone:** `const W = (intr > 0) ? 0 : Math.abs(Math.log(strike_theta / mode));`

**Measured PROPOSED profile (candidate c, full fn, S=1.25, κ=N=dt=1, g=2)** — proves the target:

| θ | region | f (put) | f (call) |
|---|---|---|---|
| 0.05 | put OTM / call ITM | −0.399 | 0 |
| 0.50 | put OTM / call ITM | −0.300 | 0 |
| 0.90 | put OTM / call ITM | −0.076 | 0 |
| **1.00** | **ATM** | **0** | **0** |
| 1.10 | put ITM / call OTM | 0 | +0.069 |
| 2.00 | put ITM / call OTM | 0 | +0.300 |
| 3.00 | put ITM / call OTM | 0 | +0.356 |

Put OTM lobe grows monotonically toward the cap |gamma·(S−1)/S| = 0.4 and plateaus; call mirrors +;
ATM and ITM are hard zero on both wings; sign is the shipped ±g·(S−1)/S. **Target reproduced.**

## 5. Deep-OTM behaviour — THE ONE OPERATOR SUB-DECISION (flag, not a research call)
The target pins only the ATM edge (→0). Deep-OTM is a genuine product choice:
- **(c) bounded monotone plateau** `1−ρ_otmᵍ` — funding keeps growing as the strike goes further OTM
  and saturates at a cap. **Best literal fit for "grows where the curve is leaned."** *Recommended.*
- **(a) unbounded monotone** `|ln(θ/mode)|` — same "grows where leaned" but **unbounded**: a far-OTM,
  near-worthless strike accrues ever-larger funding. Economically odd; not recommended.
- **(b) bounded fading lobe** `|ln|·mark` — a single hump inside OTM that fades back to ~0 deep OTM.
  This **contradicts "grows where leaned"** (it shrinks deep OTM) but is the most self-limiting.

Recommendation: **(c)** — it is the only candidate that is simultaneously bounded, monotone-growing
into OTM, exactly 0 at ATM and ∀ITM, and expressible as a one-liner from the existing lens geometry.
Operator picks between (c) grows-and-caps vs (b) fades-deep-OTM; (a) only if unbounded is truly wanted.

## Verdict / acceptance
Operator target (0 ATM · 0 ITM · positive OTM · smooth ATM edge) is **reproducible numerically** — all
three candidates hit it; (c) recommended. No candidate needs a seam or a sign change; the shipped
±g·(S−1)/S sign stays and stays correct. The fix is a **magnitude-weight swap only** (ext → deviation),
one block in `fundingPerStrike`. **closeBand untouched** (close mechanics unaffected, per entry 458).
Open sub-decision = deep-OTM bounded-plateau (c) vs fading-lobe (b) vs unbounded (a) — operator-tier.
Secondary flag: C0 corner vs C1 (ln²) at the ATM edge — recommend accepting C0 (still "fades smoothly").
