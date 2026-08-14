# Where the gaps are, and the way around (manager synthesis, 2026-08-14)

Status after the loop build + the Lean cementing pass. **BRAINSTORM / non-core.**
Legend: **[YOU]** = operator decision · **[ME]** = I can just do it · **[PROVER]** = Aristotle/Lean.

## A. The one that actually blocks the product
**G-SMILE / L1 — per-LP steepness vs the single lens is a STRUCTURAL incompatibility.**
A mixture of distinct lenses is strictly log-**convex** in log-strike; a single lens is log-**affine**.
So if LPs pick their own steepness the book has a **smile**, and the single-`m` lens cannot represent it —
for **no** `c`, **no** `g`. Verified numerically (mixture 2nd-difference of log-level `−0.124/+0.031/+0.026`
vs single-lens `≈0`).

### ✅ RECOMMENDED WAY AROUND — let LPs differ in **TRANSPORT**, not in **LEVEL**
The maps already contain the exact knob: `common_transport_is_necessary` /
`shares_vary_if_transport_differs` — fill shares are strike-invariant **iff** LPs share a transport.
So:
- **LEVEL (the price curve) stays COMMON** = the engine's single-`m` lens → **no smile, engine unchanged**.
- **TRANSPORT `τᵢ` is the LP's own choice** → fill shares **vary by strike** → each LP ends up with a
  genuinely **different inventory/exposure profile**, which is what the feedback actually asked for.

**Tested (3 LPs, distinct transports, identical level):**
| | shares across u=−0.6…+0.6 | spread |
|---|---|---|
| LP-A | 71.8 / 45.3 / 9.8 / 45.3 / 71.8 % | **62.0 pp** |
| LP-B | 21.6 / 24.8 / 9.8 / 24.8 / 21.6 % | 15.0 pp |
| LP-C | 6.5 / 29.9 / 80.3 / 29.9 / 6.5 % | **73.8 pp** |
(vs **0.0 pp** under a common transport) — and the **aggregate level = the common curve to 0.00e+00**, i.e.
**no smile**. Both halves hold simultaneously.

**Trade-off to state plainly:** LPs get to choose *where in the strike range they take inventory*
(depth/spread/concentration), **not** a different *price view*. If a different price view per LP is a
must-have, that is the multi-lens/smile reopen — a curve/invariant change with large blast radius. **[YOU]**

## B. Real but small — I can close these
| # | gap | way around | who |
|---|---|---|---|
| G1 | **Stage 7 readback has no Lean.** `Exposure` is cited by the maps' README and my map; it doesn't exist. | write the ~10 lines (`exposure = NetPerp + Σ Δ q`, and that the transporting Δ is the reading-back Δ) → Aristotle | **[ME]+[PROVER]** |
| G7 | **Loop closure is an identity in Δ** — residual 0 at `hedge_ratio=1` for *any* Δ (even Δ≡42). | make Δ *derived* and add a perturbation test: bump Δ off the true `−∂V/∂lnS` and require the residual to move. (v2/v3's Δ **is** already the true derivative, err ≤4e-11 — this is about the *test*, not the value.) | **[ME]** |
| seam | **Coordinate seam** — Stage 3 prices in log-moneyness, the maps' parity anchor `C−P=−k` is linear moneyness (22.9% apart at u=0.5). | one-liner: restate Stage 3 as `(1+k)^(∓g)` **or** restate parity in `u`. Harmless today (no call/put pair formed). | **[ME]** |
| L5 | γ is a static input, so the seam doesn't move *within* a scenario. | wire `γ = w/(1−w)` and let `w` move on trades. | **[ME]** |
| G5 | "arb-free" oversold — it's **butterfly-only**. | already de-cited in the map; optionally add vertical + price-bound legs (`C ≥ intrinsic`, `C ≤ S`) as new conjectures. | **[ME]+[PROVER]** |

## C. Needs your call
| # | gap | the decision |
|---|---|---|
| **L2** | **Funding rate law** (update-2) — sets the carry magnitude in every LP economics number. | pick the rate mapping (HL-style capped premium→rate) — D1/D3/D4 in the update-2 spec. |
| **L6** | **Liquidation / negative cash-out.** Derived payout shows a sold-put + long-sliver pairing drives cash-out **negative past the carve** (−$83k at S=$80k; −$452k at $60k on $200k carve equity). A carve is **not** automatically self-collateralising. | which pairings are allowed, and what happens when the carve is exhausted. |
| **G6** | **No LP fairness theorem.** The book averages levels but takes the **tightest** spread; nothing proves an LP isn't systematically adversely selected by the mix. Sharpened by the workbook's **refraction** finding (one LP's β move re-prices every other LP's APR). | do you want per-LP fairness *proved* (new conjecture) or just *disclosed* in the product? |
| **L3** | Close/settlement semantics (the old A14 seam history). | unchanged, still yours. |

## D. Known-open, low priority
G4 (Stage 1 issues depth+spread only — the LEVEL is never derived from the perp book; wording fixed) ·
G8 (`walk_equiv` is the interior case; real books are segmented) · G9 (`depth_unbounded`) ·
G11 (nothing wired to the engine — by design, this is a sim).

## What I'd do next, in order
1. **[YOU]** rule on **A** (transport-not-level, or reopen for a smile) — everything per-LP hangs off it.
2. **[ME]** close G1 + G7 + seam + L5 (all small, all mine).
3. **[YOU]** L6 pairing/liquidation rule — this is the one with real money consequences.
4. **[PROVER]** G6 fairness conjecture + the arb legs, once A is ruled.
5. **[YOU]** L2 funding law, which unlocks calibrated (rather than illustrative) economics.
