# UPDATE-2 — consolidated spec (everything deferred from update-1, in one place)
_Manager, 2026-07-07 (operator entry 463). Single source of truth for "the next update".
Supersedes the scattered TBDs across FIX_close_b_receipt_charge_PARKED / DEFENSE_TAKESTOCK /
SPEC_funding_sameslope / DESIGN_itm_close_and_funding. Nothing here is built; each item states
what's DESIGNED, what's OPEN, and the decision needed to un-park it._

## Where we are (shipped, HEAD `abd35f4b`)
- Update-1 close: one sell-back path every leg, no seam, non-extractable. DONE.
- Funding = the same-slope lean DEVIATION (input), zero@ATM/ITM/balanced-pool, locked. DONE.
- Parked below: the funding RATE formula, the pool-safety charge-back, multi-party hardening.

## Workstream 1 — FUNDING RATE FORMULA (smallest; completes funding)
The deviation (the "premium") is shipped. This maps it to a rate via a capped premium→rate
formula (Hyperliquid-style; the same-slope angles are the mark/oracle proxy).
**OPEN DECISIONS (operator):**
- **D1 formula shape.** Proposal: `rate = clamp( κ · (±sign) · dev , ±cap )`, or an HL-style
  premium(+interest) form. → NEED the specific mapping.
- **D2 (F1) oracle coupling. ✅ ANSWERED (operator entry 476, 2026-07-08): "same purpose as with
  perps."** Funding is a **tether / imbalance-correction**, identical in purpose to a perp's funding.
  Proxy (entry-476 D1): **pool-curve ray angle = "mark", anchor-curve ray angle = "oracle"**; the
  same-slope ray deviation IS the mark-vs-oracle gap, so **no separate external-oracle coupling term**
  — the anchor plays the oracle role. This **CONFIRMS the shipped deviation direction** (more skew ⇒
  larger deviation ⇒ more funding pulling the crowded side back); a vol-risk-premium reading (which
  would invert the direction) is **ruled out**. No engine change.
- **D3 (F2) m-scaling.** m enters the deviation (via c) already; also via the ±g sign (=±mγ)?
  → single-m or m². (Operator D3 leans single-m via the deviation; shipped placeholder is m² — strip
  or let the formula resolve it.)
- **D4 (F3) cap.** deep-OTM ray deviation grows logarithmically; the formula's cap bounds it. → cap
  value: fixed knob (new control — R3) or derived? 
Gate: the FS.2b anti-regression lock (zero on balanced pool) MUST survive the formula wrapping —
do not soften it when an interest term is added.

## Workstream 2 — POOL-SAFETY CHARGE-BACK (the "exploit patch"; needed before multi-party)
Design: `specs/FIX_close_b_receipt_charge_PARKED_2026-07-03.md` + `notes/research/DEFENSE_TAKESTOCK_vs_dynamic_amms_2026-07-03.md`.
**What:** at close, compute the round-trip footprint via the counterfactual receipt
(V[receipt-undo] − V[live close], entry-liquidity + rebase scaled), charge it at settlement; pool-value
floor. Neutralizes the bounded ~$29 self-drain → pool round-trips exactly → restores the no-free-money
guarantee (the retired CM6-v2). **Framing (corrected):** the leak was RETRACTED (non-extractable) — this
is a MULTI-PARTY nicety, harmless in the single-user sim, NOT an urgent exploit patch.
**OPEN DECISIONS (operator):**
- **D5 charge routing.** pool-credit (simplest; measured to hold P-CYCLE) vs a penalty-funded sink
  (only sound at κ>1) — see DEFENSE_TAKESTOCK part 4.
- **D6 variant.** R-A (full unwind) vs R-D (paid-persistence) vs plain charge-back — from FLAG-CURVE;
  since the leak retracted, plain charge-back likely suffices.

## Workstream 3 — MULTI-PARTY DEFENSE HARDENING (largest; for the CTO backend, stageable)
From DEFENSE_TAKESTOCK (parts 2–4). For when it goes multi-party; irrelevant to the single-user sim.
- EMA-banded read-γ (smooths marks/funding reads; the perp mark-smoothing analog).
- Per-window w-rate-limit (price-band/OI-limit analog).
- Funding clamp (ties to D4's cap).
- LP-side: resize-invariant receipt (the entry-liquidity scaling, already in the charge design);
  no-lag LP-equity marking; open-time snapshot for charge credit.
Priority: SHOULD (vs workstream 1/2 = MUST-before-multi-party). Calibration numbers (window N, rate,
cap, κ) are product decisions.

## Also-parked (separate, smaller)
- Funding CASH TRANSFER (part-2): the rate is metered/shown; actually move cash between clubs (FLAG-C).
- Read-smoothing (EMA) — same as workstream-3 EMA.

## Proposed sequencing (operator confirms)
1. **Funding formula** (WS1) — completes funding; deviation's already in; needs D1–D4.
2. **Charge-back** (WS2) — the safety; needs D5–D6; before any multi-party ship.
3. **Hardening** (WS3) — multi-party defense set; stageable; calibration.

## The decisions to un-park (all operator-tier)
D1 formula shape · D2 oracle coupling · D3 m-scaling · D4 cap · D5 charge routing · D6 charge variant.
Rule on WS1's D1–D4 and I can build the funding formula immediately (WS2/WS3 follow).
