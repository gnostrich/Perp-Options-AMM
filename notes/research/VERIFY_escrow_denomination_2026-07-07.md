# VERIFY — escrow-unit denomination (operator entries 436/437)
_research-lead run 2026-07-07; measured vs real engine (vm-extract from HEAD, engine blocks identical
to `0e0a0062`); no web/Aristotle/git/engine edits. Manager persisted (research-lead output-constraint).
Harnesses `scratchpad/escrow/` (gitignored). g=m·γ=2 test exponent._

## Model under test
Value in ESCROW UNITS (= one full perp) referenced at ATM/mode; position = claim on N escrow units;
close exchanges escrow units vs the ATM reference; ledger tracks units remaining. Consistent across
wings + OTM/ITM traverse + rebase?

## 1 — the escrow unit per wing
- PUT intrinsic arm: mark = 1−sNorm/θ = (K−S)/K = intrinsic/**K** (measured mark·K = K−S exact).
- CALL intrinsic arm: mark = 1−θ/sNorm = (S−K)/S = intrinsic/**S** (measured mark·oracle = S−K exact).
- ⇒ escrow unit is NOT the same dollar object per wing (put cash-like/K, call asset-like/S); they
  COINCIDE at ATM (K=S=oracle) — exactly where the model defines the unit. mark∈(0,1), sup=1 (full
  exercise, never exceeds — solvency ceiling). ATM mark = 0.1481 both wings.

## 2 — deep-ITM crux, reconciled
1 escrow unit converts to NEITHER K nor S — it converts to **`carvedEquityAtClosure`** (one carved-perp
equity in USD), UNIFORM both wings (`closeBand` L2317: trader_payout = L0·raw_net·carvedEquity,
raw_net = Y−X in escrow units). Engine NEVER pays classical dollar intrinsic N·(K−S). At ATM the unit
is defined (K=S=oracle) so put/call full-exercise = one perp = one consistent anchor; off-ATM the mark
STRUCTURE differs per wing but the dollar conversion is uniform ⇒ internally consistent, no leak —
PROVIDED payout is intended as normalized-escrow, not classical intrinsic (→ escalation 1).

## 3 — call/put symmetry
Reflection EXACT: markLensed('put',θ,sNorm) = markLensed('call',θ,θ²/sNorm) to 1e-17. Matched reflected
pairs carry EQUAL escrow marks while classical dollar intrinsics diverge (put K−S unbounded, call S−K
bounded by S). Escrow denomination makes wings SYMMETRIC (design goal C3). CONSISTENT.

## 4 — traverse OTM/ITM
- Escrow MARKS clean through ρ=1 (dX=3e-7 at flip; pure functions of state, path-independent). ✅
- BUT the shipped TWO-CASE CLOSE PROTOCOL has a real VALUE SEAM: at the branch flip (both-live →
  put-settled-to-cash) raw_net JUMPS +1.18e-2 = **45.4% of |raw_net|**, all on the live/OTM leg Y —
  the call leg priced at a DIFFERENT pool state across the branch (post-put-reversal vs un-moved pool).
  Value-layer twin of the directionality finding (swap clean, reported VALUE not clean under (a)).
  PROTOCOL defect, orthogonal to denomination; close-(b) dissolves it (~180× smaller, parked-spec MR2).

## 5 — rebase
Escrow-unit COUNT N gauge-invariant under rebase (measured r∈[0.5,1.5]). Rebase-alone keeps w=½ ⇒
sNorm invariant; mark reprices purely via θ=K/oracle = honest moneyness P&L. Rebase+arb re-marks via ρ,
still honest. Reference moving under a static claim = correct REPRICING, NOT a leak. ✅

## BOTTOM LINE
Denomination CONSISTENT across wings (reflection-exact/symmetric), traverse (marks continuous/path-indep),
rebase (count-invariant/honest reprice). Two residuals, neither a denomination bug:
- **(i) PROTOCOL:** 45%-of-raw_net value seam at the two-case close branch flip (live/OTM leg). close-(b) fix.
- **(ii) DENOMINATION CHOICE (operator-tier):** escrow→dollar pays uniform carvedEquity, NOT per-wing
  classical intrinsic (×K put / ×S call). This is what makes wings symmetric; flip side — a deep-ITM put
  is NOT paid classical K−S. OPERATOR CONFIRM: symmetric-escrow payout (as built) or classical intrinsic?

## Escalations (operator-tier)
1. Deep-ITM payout denomination: symmetric-escrow (as built) vs classical per-wing dollar intrinsic. CHOICE.
2. The 45% two-case close value seam = shipped-(a) protocol property; close-(b) is its fix (reinforces parked sequencing).
