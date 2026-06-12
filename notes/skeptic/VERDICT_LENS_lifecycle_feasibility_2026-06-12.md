# SKEPTIC VERDICT — LENS lifecycle / transact-goal-seek feasibility (verdict #36)

_Artifact: `notes/research/LENS_lifecycle_transact_goalseek_FEASIBILITY_2026-06-12.md`
(research-lead, operator entry 117). Mandatory adversarial pass before the NO reaches the operator.
Re-derived on a fresh path (`/tmp/sk117*.js`), engine primitives transcribed from HEAD v28
`HEAD_temporal_mvp_v28_lens.html` L1601–1666 (gLoc / lensU / markLensed / tradeUpdate). Verbatim
channel: entries 113–117 read live from `history/operator/2026-06-10_kurtosis-curve-family-brief.md`
L846–882 — HELD, no FLAG-PROCESS._

---

## VERDICT: **REFUTE (partial) — the headline NO is OVERSOLD.**

**1× FLAG-OVERSELL (the headline impossibility) + 1× FLAG-WRONG (construal-I direction claim) +
1× FLAG-OMISSION (no inventory disposition).** The note's narrow claim is true; its headline answer
to the operator is not. Specifics:

- **What is TRUE (survives my attack):** if "transact AT the far point" is read literally as *move
  the live reserves to the strike ray and read steepness from the live mode there*, then yes —
  arrival makes that ray the mode, `g_loc → 0`, and the steepness vanishes. The counterexample
  reproduces byte-level (K=2×, τ=0.3, γ=1.5: **1.376597 from spot → 0.000000 at the ray**;
  `/tmp/sk117.js`). The forward θ_eff map (Part B) reproduces (bounded, |u_eff|≤|u_K|; `/tmp/sk117d.js`).
  These are correct.

- **What is OVERSOLD (the operator-facing headline):** the note concludes the operator "IS missing
  this" and that strike-dependent execution "genuinely requires the weighted curve / a stored field."
  **That is false for the operator's actual entry-113 ask.** Entry 113 (verbatim): *"the goal seek is
  going to see a steeper slope far out… which means more slippage per dollar… since the trade for AMM
  bookkeeping purposes is a **simple swap**."* The operator did **not** ask to move the live mode to
  the far point. He asked whether a **simple swap** slips **more per dollar** on a far-OTM option.
  That is constructible **on the existing live-mode lens, with no stored reference, no φ, no field.**

## THE CONSTRUCTION THE TEAM MISSED (premium-notional leverage)

The note measured the wrong quantity. Verdict #35 (and this note) measured the **mark %-move** of an
option and found it largest at ATM, falling OTM. But the operator's "slippage per **dollar**" has a
denominator the note dropped: a far-OTM option has a **tiny premium-mark**, so $1 of premium buys a
**large notional** `N = D / mark(K)`, which moves the pool **more**. In the smooth-paste continuation
regime (where every strike I checked sits at the live ATM mode), `markLensed = c·sNorm` is linear, so:

| quantity | law | direction |
|---|---|---|
| pool %-move per swap | strike-blind (plain Balancer) | flat |
| option mark %-move per swap | `1/(g+1)`-ish, peaks ATM | **falls OTM** (verdict #35) |
| **slippage per premium-$** | `= 1/(mode·mark(K))` | **RISES monotonically OTM** |

Numbers (τ=0.3, γ=1.5, live ATM mode; `/tmp/sk117e.js`, `/tmp/sk117g.js`):

| strike | premium-mark | slip-per-premium-$ (∝ 1/mark) |
|---|---|---|
| 1.1× | 0.369 | 2.71 |
| 1.5× | 0.146 | 6.85 |
| 2× | 0.099 | 10.08 |
| 3× | 0.064 | 15.70 |
| 4× | 0.047 | 21.14 |

**The operator's entry-113 intuition is CORRECT** under the natural trader metric (% slippage on the
premium paid), for a **simple swap at spot on the lens that is already in HEAD**. No mode move, no
stored mode, no weight field. This is exactly the leg-sizing the operator pinned in entries 115/116
("the **premium** value determines the amount of the bought leg", "proceeds from sold leg… isn't used
to calculate the bought leg, but the premium"): the premium IS the denominator, and the
premium-leverage `1/mark(K)` is what makes far-OTM slip more per dollar. **Single-basis holds** — one
swap, one strike K that both sizes (`N=D/mark(K)`) and settles (`mark(K)`); no θ_eff second sizing
strike, so the note's O5 two-strike hazard never arises (`/tmp/sk117g.js`).

## FLAG-WRONG: construal-I "gives the OPPOSITE direction"

The note's construal-I table (line 108) asserts sizing `dy` from the premium gives *"MORE slippage
near ATM, LESS OTM"* — the opposite of entry-113. That is the **mark %-move** metric, not slippage
per premium-dollar. The actual `dy` per premium-$ is `1/mark(K)`, which **GROWS toward OTM** (1.9 at
1.05× → 21 at 4×; `/tmp/sk117d.js`, the note's own steelman script direction). Bigger `dy` = more pool
impact = more slippage on the same premium. Construal-I delivers entry-113's direction; the note
declared it "wrong direction" by silently switching to the mark-%-move numerator. This is the
verdict-#35 metric-confusion (mark-move vs premium-slippage) recurring — and here it flipped the
operator-facing answer from YES to NO.

## The scalar-vs-field distinction (the question that decides "dead vs one more knob")

Even setting the premium-leverage point aside, the note's *"stored reference mode IS the (W) φ"* is an
**overstatement**, and the distinction matters:

- **(W) φ:** updated **every trade** (`φ′=ln(y′/x′)−z`, verdict #12), history-dependent, a stored
  state variable **per position** → a genuine field/DOF.
- **A fixed deploy-time reference** `m_ref`: set **once**, never updated by trades, **one global
  scalar** → NOT a field, NOT φ, no per-position history.

A fixed-scalar reference **does** give strike-dependent, bounded (≤γ), arrival-surviving steepness
(`/tmp/sk117.js`: K=1.5→g=1.21, K=4→g=1.47, all invariant to where the live mode goes). So the note's
"any stored reference = the weight field" collapses two different objects (pattern #4: construction-slot
conflation). The honest statement: a *per-position, per-trade-updated* stored mode = φ (the demoted
field); a *single global static* reference is a cheap scalar knob, not the field. **The note's
equivalence is only exact for the per-position case, which the operator's simple-swap ask does not
even require.**

(Caveat I owe the operator, not a defeater: a fixed reference *de-centers the lens* — after the price
moves, the kurtosis elbow no longer tracks ATM (`/tmp/sk117b.js`: live mode 1.5, fixed-ref ATM g=1.21
not 0). So the fixed-reference route trades the live-ATM-rounding property for arrival-survival. The
premium-leverage construction above avoids this entirely by keeping the live-mode lens.)

## Does it reduce to GLOBAL-SKEW #24? — NO, not for entry-113.

#24's impossibility is specifically about **restoring a PRE-TRADE slope target** — that is
history-dependent (two histories → same reserves → different required σ; the two-history witness).
Entry-113 asks for a **static strike-dependent steepness on a simple swap** — *no history, no
restoration target*. The premium-leverage construction references **only current reserves** (live mode,
live mark) — it is memoryless, so the #24 two-history witness does not bind it. The note inherits #24's
"requires stored history" conclusion and applies it to a question that has no history requirement. The
equivalence is asserted, not earned, for the entry-113 reading.

(#24 DOES still bind the *other* reading — "goal-seek to restore the pre-trade slope at the moved
point" — which is construal-II, the inverse-solve. That reading is genuinely a stored-history mechanic
and genuinely the regression hazard. The note is right about construal-II; it is wrong to present
construal-II as the operator's only available reading.)

## Construal enumeration (#4) — is there a IV?

The note's I/II/III is incomplete. The missed construal is **(IV): simple swap at spot, bought leg
sized by premium, settle on the same strike.** It is forward, bounded, single-basis, memoryless,
field-free, and delivers entry-113's rising-slippage-OTM (the table above). The note's I/II/III all
assume the sizing or the slope-read must move off the live mode or off the live strike; IV does
neither. The enumeration was not complete, and the missing member is the one that answers the operator.

## O1–O7 reproductions

Reproduced and SOUND where checked: counterexample (O-headline), Part B forward θ_eff (bounded,
shrinks to mode), construal-I dy=prem$/mark (note's own numbers — but mis-labeled direction, above),
O5 single-basis (the two-strike hazard is real for a θ_eff-sizing build, but does NOT arise for
construal IV). I did not find an O-row that is numerically wrong; the defect is in the **framing**
(which metric = "slippage", which reading = the operator's), not the arithmetic. The manager's
independent reproduction of the counterexample (1.3766 → 0.000000) is correct as far as it goes — but
it verifies the literal-arrival reading, not the operator's simple-swap reading, so "manager
independently reproduced" does not validate the headline NO.

## FLAG-OMISSION (soft): no feature-inventory disposition section

The note is squarely in-scope (curve/trade/settlement mechanics) and carries Part A touchpoints but
**no per-inventory-item disposition**. Substantively present: #1/#2/#3 (static τ)/#6/#7 (S*)/#10 (the
core)/#11 (settlement)/#13 (O4 solvency)/#16 (central). Silently absent: **#8 strike registration**
(the θ_eff / strike-cap question is strike policy), **#12 THE gotcha** (price-coordinate vs slope —
and the note's mark-%-vs-premium-slippage confusion is a sibling of it), **#4 carry**, **#14 Esscher**.
One table fixes it. Formal, not ship-gating — but this is decision-support feeding an operator
yes/no, exactly the class where a dropped item flips the answer.

---

## What reaches the operator (entry-44 / entry-71 response-type gate)

Plain English, his vocabulary (slope = the curve slope = price), tabular for the technical core:

1. **You are NOT missing something fundamental — your entry-113 intuition is right.** A simple swap
   DOES slip more per dollar on a far-OTM option, on the lens already in the build. Reason: a far-OTM
   option has a small premium, so a fixed dollar amount buys a large position, which moves the pool
   more — as a % of the premium you paid, slippage rises the further out you go.
2. **No new machinery, no weights, no stored field needed for that.** It is the existing simple swap
   with the bought leg sized by the premium (entries 115/116) — exactly as you described.
3. **The ONE thing that is genuinely impossible** is the *other* reading: "move the pool to the far
   point and still read the far-out steepness there." Arriving makes that point the new center, where
   the slope is flat by design. That specific maneuver — and only that one — needs a remembered
   reference, which is the weight field you set aside. Your simple-swap reading does not need it.
4. The far-OTM blow-up / strike cap concerns belong only to the inverse "goal-seek to a target slope"
   build, not to the simple swap.

| reading | needs stored field? | delivers "more slip/$ OTM"? |
|---|---|---|
| simple swap, premium-sized (your entry-113/116) | **no** | **yes** |
| move pool to far point, read steepness there | yes (or lens de-centers) | n/a (slope→0 on arrival) |
| goal-seek pool to restore a target slope | yes (history) | inverse-solve, the regression hazard |

**Verdict-gating instruction to the manager:** do **NOT** relay the note's headline ("impossible /
you are missing this / requires the weighted curve") to the operator — it answers the literal-arrival
reading, not the simple-swap reading the operator actually wrote. Relay the YES above for entry-113,
with the one genuine NO scoped to the move-the-pool-there maneuver only.

---
_Attack documented: counterexample reproduced (1.376597→0); fixed-reference candidate constructed and
shown arrival-surviving but lens-de-centering; premium-leverage construction (IV) derived independently
(slip-per-$ = 1/(mode·mark(K)), rising OTM, single-basis, memoryless); construal-I direction re-derived
and the note's "opposite" label broken; #24 equivalence shown to bind construal-II but NOT entry-113;
inventory recounted. Scripts: `/tmp/sk117.js` … `/tmp/sk117g.js` (fresh path; counterexample &
Part B map byte-reproduced)._
