# SKEPTIC VERDICT — GLOBAL_SKEW_goalseek_2026-06-11 (verdict #24)

_Artifact: `notes/research/GLOBAL_SKEW_goalseek_2026-06-11.md` (research-lead, operator entries 55/56).
Mandatory pre-relay pass. Re-derived on a FRESH code path `/tmp/sk_skew55.py` (pure python3; NOT a
rerun of the note's `/tmp/skew55.py`). Verbatim channel: entry 55 in the note matches
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` entry 55 exactly — HELD. Paper checked
at L33/35/39/43/51 (live read, not memory)._

## Verdict block

**1× FLAG-WRONG (narrow, §1 uniqueness sentence) + 1× FLAG-OVERSELL (the σ≡φ "verification") +
1× FLAG-OMISSION (soft — no inventory disposition section) + the NET CONCLUSION SURVIVES MY ATTACK:
no weight-free third option; the goal-seek mechanic works, is monotone, and is path A with the same
divergence and ~1.4× cap. The conclusion stands on the map-independent legs (Q2 impossibility + Q4
divergence), NOT on the broken §1 uniqueness leg.**

---

## FLAG-WRONG (narrow): "the ONLY asymptote-preserving single global scalar is a horizontal shift" (§1)

The note claims (§1, italicized "unique"): *"This is the unique single global scalar that is
asymptote-preserving: a level/amplitude knob would move the wing values; a pure shift does not."*
**False as mathematics.** Counter-derivation (`/tmp/sk_skew55.py` §C), three asymptote-preserving
non-shift single scalars:
1. **Width rescale** `u → u/s` about the elbow (= the τ knob): wings → γ₊, γ₋ exactly for any s>0
   (computed: 1.8009/3.1991 at u=∓40, s=2; limits exact). Excluded ONLY by the operator's entry-14
   ruling 3 ("kurtosis … isn't / doesn't have to be changed by trades") — a **RULING-based exclusion,
   not math**, and the note never cites it.
2. **Asymmetric width** (one scalar, e.g. κ_eff=κ·e^{s·tanh u}): wings frozen (1.8006/3.1999), and
   it is genuinely NOT a translation (best shift-fit deviation 0.0836). It is skew-flavored, so it is
   excluded by NEITHER the ruling NOR the word "skew". It just doesn't rescue anything (see Q2/Q4).
3. **The note's own §3 steelman** (odd additive bump s·tanh(κu)/cosh²(κu)): asymptote-preserving,
   not a shift — §3 tests a member of the class §1 says doesn't exist. **Internal inconsistency.**
The brentq-no-root result for the amplitude-skew is a **sampled failure, not a proof** — and nothing
load-bearing rests on it.

**Why the verdict still survives:** the two legs that carry Q5 are map-independent — the Q2
impossibility (below) holds for ANY single- or multi-scalar memoryless σ, and the Q4 divergence holds
for ANY frozen-wing map (settled in my #19/#20). The honest repaired chain: *the shift is the canonical
pure-recenter choice consistent with τ-static; asymptote preservation alone does NOT force it; no
member of the class escapes Q2 or Q4.* The "single scalar" restriction itself comes from the
operator's words ("global skew as **a** knob", entry 55; "the skew knob", entry 53) — reading-grounded,
and immaterial: the impossibility is dimension-independent.

## FLAG-OVERSELL: the σ≡φ identity sold as a load-bearing verified result (headline (i))

The note labels `γ_loc(u;σ) ≡ γ_loc(u−σ;0)` "**(load-bearing)** `[numeric, resid 0.0]`". The family
is **DEFINED** in §1 as `γ₋+(γ₊−γ₋)S(κ(u−σ))` — the identity is a tautology of that definition
(rfl-class; my grid resid 0.000e+00 of course). The resid-0.0 is not evidence; the load-bearing step
is the §1 uniqueness sentence, which is the broken one. Two precision defects folded in:
- **σ≡φ is an identity of the translation ACTION, not of the curve family.** A √-blend in γ-space is
  NOT the (W) √-blend in w-space pushed through γ=w/(1−w): at matched wings the profiles differ by up
  to 0.199 (`/tmp/sk_skew55.py` §J). Same single DOF, same storage need, same OPEN rebase/funding
  lemmas attach — but if anyone later builds "the σ family" as written in §1, it is NOT byte-identical
  to the (W) field. Name the slot (pattern #4 discipline).
- **The note's "slope" is not the operator's "slope."** Operator/paper: slope = the curve slope = the
  PRICE (paper L35 verbatim: "Price is the slope at that point"; entry 31/42 usage). The note silently
  redefines slope := d ln p/du (price elasticity in u). The elegant exactness "σ₁ = u_R1−u_R0, resid
  0.0" is an artifact of that choice (d ln p/du is a pure function of u−σ; the price is not). Under
  the operator's slope=price reading, restoration is **range-limited and fails outright beyond
  du ≈ ln(γ_loc(u0)/γ₋)** (≈0.33 from ATM at the note's params; my §F: du=1.0 needs γ_loc=0.92 ∉
  (1.8,3.2)) — and still needs the pre-trade u₀. **Conclusion unchanged under both readings; the
  exact-restoration story is reading-dependent and must not be relayed as "your mechanic, verified
  exactly."**

## Q2 impossibility — ENDORSED, with the scope stated honestly (this is the result that matters)

I attacked it and it held; I strengthen it with an explicit **two-history witness** (map- and
dimension-independent): histories starting at u_R0=0.0 and u_R0=−0.5 both land at the same current
reserves u_R1=0.3 but need σ=+0.30 vs σ=+0.80 — same (x,y), different required σ ⇒ **no function
F(x,y) of current reserves serves both.** (`/tmp/sk_skew55.py` §E; note's residual table 0.218/0.051/
0.000/0.102/0.241 reproduced byte-level.)

**Is it information-theoretic or definitional?** Definitional-once-stated ("a function of the present
cannot encode the past") — the real content is that **every live reading of the operator's goal-seek
target references the pre-trade state.** I checked the readings against the verbatim record:
- Note's reading (restore pre-trade slope at the moved point): pre-referencing.
- Paper L39's actual rule ("the slope of that post-trade point is brought to the **pre-trade reserves
  point**"): pre-referencing.
- The conservation/v27 rule (w* = 1−β/y′, β = y₀(1−w₀)): pre-referencing. (NB: the actual path-A
  trade is THIS rule, not slope-restoration — the note's §3 "path-A goal-seek" is a simplified variant;
  the σ₁ VALUE differs by rule, the history-requirement does not.)
- Manager's proposed "post-state / executed-price" reading: for a memoryless field there is no
  goal-seek left — the curve at every instant is fully determined by current reserves, which **IS fork
  B by definition** (the note says exactly this in §6). Not an escape; a relabel.
- Arb/oracle-anchored σ: memoryless, but then trades don't drive the knob at all — violates the
  operator's entry-16 ruling ("its w that the trade changes … and that warps it"). Not live.
**So: no scope flag.** The impossibility holds on every A-flavored reading; the only weight-free
reading is B, which the note names and the operator parked (entries 38/40, "we're sticking to A").
The upgrade from my #23 "couldn't find one" to "structurally impossible" is **legitimate** — with the
label "definitional once the target is pinned", not "deep theorem".

## Q3 monotone — VERIFIED PASS, and strengthened

Min d ln p/du = 1.0000 over (σ,u) grid, reproduced. Stronger analytic fact the note missed: the min
is **σ-INVARIANT** (translation) — the σ knob can never break monotonicity for ANY base profile that
is itself monotone, so the PASS is **not an up-skew-sampling artifact**. A down-skew base CAN violate
(my example γ-gap=−1.4, κ=5 ⇒ min=−0.400, arb) — but at σ=0 already, i.e. the base's defect, not the
knob's; the note's scoping ("bites only under a forced down-skew, which a translation cannot
produce") is correct.

## Q4 divergence — VERIFIED, third independent confirmation

Gearing 1/γ_loc′ at u=0..5: 1.43/4.04/15.97/45.18/100.13/189.39 — byte-match. Wing law u³ exact
(coefficient → 1/0.7: 1.4310 at u=30 vs 1.4286 asymptote). Same beast as my #19 (ln K)³ and #20
map-independence; the ~1.4× cap matches my #19 boundary (|Δφ|≤τ up to K≈1.35·mp0 at the gate pool).
"Same divergence, new clothes" — correct.

## Q5 "collapses to A" — honest at the MECHANISM level; fix the relay framing

"Path-A renamed" is the right summary of the mechanism (one translation DOF, stored, same divergence,
same cap; no operational daylight on storage/rebase/funding — the same OPEN lemmas attach, the note's
Honest carry says so). The only daylight is profile-level (γ-blend vs w-blend, above — name it, don't
merge it). **But the dispatch framing "the operator's mechanic ruled dead-on-arrival" is wrong-tone
AND wrong-content:** the mechanic is ALIVE — it works, it is monotone, and it is the A-warp the
operator already chose (entry 38) and is being built. What died is only the entry-53 hope that it
could be **weight-free** ("maybe dont even need weights then idk"). Confirmation-plus-one-loss, not
death.

## FLAG-OMISSION (soft): no feature-inventory disposition section

The note is squarely in-scope (curve/trade mechanics) and carries **no per-item disposition at all**
(inventory rule: every item, no silent absences). Prose substantively covers #16 (central), #2, #3
(τ static honored — σ is the only mover), #6, and #5/#9 via the OPEN warp∘rebase/φ-funding lemmas in
Honest carry. Silently absent with substance: **#4 carry** (a σ-shift moves p(u)=γ_loc·e^u at fixed
reserves — same carry interaction as φ, ruled inheritance in my #10, should be SAID), **#8 strike
registration** (the ~1.4× cap IS strike-range policy), and **#10/#12** — THE-gotcha-adjacent, and this
note actually commits the adjacent offense (slope vocabulary, above). One table fixes it; the omission
is formal, but this is exactly the note class (adjudicating the operator's own proposal) where the
discipline must not slip.

## Standing checks

- **Unrequested-elegant-theorem check: PASS.** Unlike the polar note (#23), the headline here answers
  the operator's question head-on (entry 55 point 2). The impossibility upgrade is responsive to my
  own #23 gap, not manufactured.
- **Provenance labels:** [analytic]/[numeric] honest EXCEPT the "(load-bearing) resid 0.0" tautology
  (flagged) and "Script transcribed at the end" — the end section is a prose SUMMARY, not the code;
  /tmp is ephemeral, so the durable artifact carries formulas only. (Everything reproduced from
  formulas on my fresh path, so reproducibility held in practice — note-quality, not a flag.)
- **Honest carry:** good — no build, no Lean pin ("premature to pin" is right), fork stays
  operator-tier.
- **Convergence alarm: LOW-MODERATE.** The note agrees with and upgrades MY #23 finding — so I
  attacked the upgrade independently (it held) and the headline derivation (it broke, pattern #1:
  the italicized-confident sentence was the false one). Manager should note: the broken leg is the one
  a quick read would quote.

## D-RULING (entry-44 response-type gate) — what reaches the operator

Plain English, slope = price (his vocabulary), ~4 sentences + the fork line. Suggested shape (manager
may word it, content is binding):
1. Asymptote point taken — everything below is for maps that keep both wings exact power-laws.
2. **Yes — you can local-slope-goal-seek with one global skew knob; it works and prices stay
   arbitrage-clean.** That knob turns out to be the same dial the warp already turns (shifting the
   elbow center): it IS the A mechanic you picked and we're building — not a new third mechanic.
3. The one thing it cannot deliver is "maybe don't even need weights": to put the slope back, the
   knob must remember where the pool was before the trade, and a remembered number is exactly the
   stored quantity the weight was providing. Truly memory-free pricing exists only in the B flavor
   (same slippage per notional, strike-blind) you parked.
4. The far-OTM blow-up and the ~1.4× strike cap are unchanged.
**Which readings died / survive:** ALIVE — the goal-seek mechanic itself (= A, chosen, in build).
DEAD — only its weight-free version (under every reading where the target is the pre-trade slope).
SURVIVES SEPARATELY — the memoryless variant, as B and only B.
**Do NOT relay:** "dead-on-arrival", "path-A renamed" as a dismissal, the σ/φ greek, the resid-0.0
exactness, or the §1 uniqueness sentence (broken).

---
_Attack documented: §1 uniqueness broken (3 counterexamples, one the note's own); Q2 attacked via
reading-enumeration against verbatim entries 31/38/39/53/55 + paper L35/39 and via the two-history
witness — held; Q3 attacked via down-skew base — held as scoped; Q4 re-derived — held. Script:
`/tmp/sk_skew55.py` (fresh path; all note digits byte-reproduced)._
