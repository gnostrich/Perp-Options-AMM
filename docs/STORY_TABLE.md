# THE STORY TABLE — the whole system, one table (operator protocol, entry 312)
_Reprint IN FULL on every change — never a diff. Operator's geometry (entries 304/307/308/311).
Edition 10, 2026-07-02 (§3.2 committed; row 4 wording aligned to the shipped mark)._

| # | Station | The geometry (operator language) | Recent change | Status |
|---|---------|----------------------------------|---------------|--------|
| 1 | **The pool curve** | THE object: one curve in (asset, cash), leaning by `w`, level `k`. Its slope is the price. Everything else is rays on it or shadows of it. | none — byte-identical throughout | 🔒 unchanged |
| 2 | **Trades bend the curve** | A trade re-leans the curve itself (updates `w`), conservation applied at the trade's own point; `k` is a readout. | paper now displays the explicit update formula | 🔒 unchanged (engine) |
| 3 | **Strikes are rays** | Every strike = a ray from the origin; the pool's centre = the mode ray. One curve + a fan of rays = the whole book. | none | 🔒 unchanged |
| 4 | **The mark (value)** | ONE ray on ONE curve: the moneyness is your ray's read against the pool's ray; the mark = the smooth-pasted value built on it (waiting arm = a power of the read × the seam constant; exercised arm = parity), 0→1, =1 only at full exercise. Nothing compared to the anchor. | §3.2 now defines it this way (the retired capped-ratio read renders nowhere) | ✅ aligned |
| 5 | **The steepness dial `m`** | One number set from vol at creation, never moved by trades; multiplies steepness at every ray equally. MORE volatile asset ⇒ LOWER m (fatter wings). | vol DIRECTION corrected in paper (entry 289); app caption fix in the build under test | 🔧 caption in-test |
| 6 | **Rebase (housekeeping)** | Re-zoom the whole picture — curve + every ray together by one factor `r` — so the pool's centre stays lined up with the outside price. No ray gains/loses; trades & rebases commute (proven). Bounds drift piling into funding deviation. | none | 🔒 unchanged |
| 7 | **The seam (waiting vs cashing in)** | The payoff line is the TANGENT to the waiting curve — curve, then straight tail, no kink. You step off at the seam ray. | ⭐ THE FIX: old tail was curved & misplaced (seam $44, value could dip below payoff). Now: straight tangent tail, seam $66.67 = the paper, value ≥ payoff everywhere (theorem + gate + measured 4dp) | ✅ FIXED & live (on main) |
| 8 | **Settlement (stepping off)** | Exercise = holder's right, never forced. ITM close = walking the straight tail: no bend ⇒ no slippage toll, cash at parity from your slice. OTM open/close = walking the curved part, paying the bend's toll. One rule everywhere. | amounts now right (reads the fixed curve); mechanics untouched | ✅ correct |
| 9 | **Funding (rent)** | SAME ray on TWO curves: pool vs anchor, like ray to like ray; the slope DEVIATION is what funding is a factor of. Crowded pays contrarian; zero on-anchor. **ITM (entry 313): parity has ZERO warp-sensitivity to the pool's lean ⇒ the natural like-ray funding ITM is exactly ZERO — the operator's instinct, validated.** Any ITM charge would be a DIFFERENT species (perp-equivalence policy, not curve geometry). | CLOSED for our scope (entry 320): perp-layer funding = EXTERNAL to paper+HTML. OTM like-ray funding built & correct; ITM option funding naturally zero by geometry (status-quo charge stands, no build); the CTO note exists for whenever the external layer wants it | ✅ closed (in-scope) |
| 10 | **The vault (who pays)** | One curve prices everyone but can't be everybody's vault: your ITM win is paid from your own carved slice (frozen at open). Solvency of the whole = CONDITIONAL on the funding port (theorem: a bounded curve cannot warehouse convex obligations). | none — honest and open as ever | 🔒 unchanged / conditional |
| 11 | **The shadows (charts)** | Value-vs-price pictures = projections of the ray reads, never the object. Chart-2: both wings through the seam into ITM, CROSSING at the money (the X), with a %→$ toggle (same water, two rulers). | chart-2 rewired to true value + X wings + %→$ toggle + markers-on-curve; tent retired; dash-legibility fixed; acceptance PASS + re-check 17/17 | ✅ LIVE |
| 12 | **The paper** | Tells this story; was RIGHT on the seam all along. | crisped, vol-direction, explicit trade formula, Merton fine print, anonymized; worked table now = what the app computes, verified | ✅ shipped (submission with operator) |

**Parked / open:** paper pass in skeptic gate → then Fig-2 stale-clause fix (entry 325-A, focused gate) →
lab review · paper page-pruning (operator, later) · **payoff-chart consistency** (still reads the v24
saturating mark, entry 325-B — part-2 with the symmetry study) · **supplement refresh-or-retire**
(pre-fix content, entry 325-C) · American-draft stale stat (entry 325-D, next touch) · **325-F (entry 336):** chart unit label says "%" but axis quotes fractions (0.25 not 25%) — label/units mismatch, part-2 display ·
**QUEUED (entry 324): tx-symmetry study** — ideal = everything off the (extended) curve, ONE tx logic for
open AND close, no separate settlement path; study whether the two-case close collapses into a single
"walk the extended curve" primitive (reverse-trade OTM / parity-cash ITM automatically), slippage
semantics both ways, escrow interaction, no-free-money invariants · dictionary corrections ongoing. **Snell: OUT OF PICTURE by ruling (entry 318)** — the standard is
American-CONSISTENCY (met, fully: theorem+gate+measured), not optimality.
