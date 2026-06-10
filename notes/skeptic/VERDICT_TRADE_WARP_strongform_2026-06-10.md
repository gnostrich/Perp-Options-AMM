# VERDICT — TRADE_WARP strong-form note (skeptic verdict #12, SPEED posture)

_Artifact: `notes/research/TRADE_WARP_strongform_2026-06-10.md` (research-lead) + manager audit
`evidence/manager_audit_TRADE_WARP_2026-06-10.md`. Mandatory §2.1 pass resolving standing #16
FLAG-OMISSION (live since verdicts #2/#3/#11). All numbers re-derived independently in pure python3
float64 (`/tmp/skeptic_warp{,2,3,4,5}.py`), HEAD code-read at line 1719–1754. Read-only._

## Headline: GREEN-TO-RESUME-BUILD. #16 FLAG-OMISSION CLEARS.

The note delivers a genuine curve warp, not a relabeled point-slide, and it is the FIRST artifact
in the team's history that does so. The acceptance clause the operator signed ("trades warp the
curve, not a dot sliding") is **met** — and I can show it sharply, not just assert it.

## The decisive test (TEST B) — why this is a real warp and R-simple was not

I ran the counterfactual the note's prose implies but doesn't tabulate. At the SAME post-trade
reserves point `(x',y')`, with `u'=0.29923`:
- **strong-form** local weight `w(u'; φ')` = **0.697171** (φ moved to −0.0648)
- **R-simple** local weight `w(u'; 0)`  = **0.690620** (φ frozen, point slides on fixed field)
- **wstar demanded by α/β conservation** = **0.697171**

The strong form's weight equals what α,β-conservation FORCES (`w*=1−β/y'`) to machine zero;
R-simple's does NOT (off by 6.6e-3). So R-simple is not merely the "weak reading" — **it actually
violates the paper's α/β conservation law that defines the trade.** The strong form is the only one
of the two that is conservation-consistent. That retroactively justifies replacing R-simple in v27
rather than merely preferring it on aesthetics. (TEST A independently confirms the curve moves at
points away from the reserves point: the ATM `u=0` weight shifts +2.1e-2 on a single trade — the
whole pricing curve reshapes, the hallmark of a warp.)

**#16 disposition:** CLEARS. The strong-form map (§3) is a defined, conservation-consistent,
field-center warp. The clause-failure I carried in verdicts #2/#3/#11 no longer holds. The note's
inventory line #16 ("Changed/DEFINED") is honest.

## Independently re-derived (all hold)

| Claim | My result | tag-honesty |
|---|---|---|
| Step-4 field consistency `w(u';φ')==w*` | `d=0.0` for all dy | exact ✓ |
| trajectory hyperbola `(x'−α)(y'−β)=αβ` | resid 0–1.4e-14 | matches mgr 2.8e-17 ✓ |
| φ-solve closed-form == independent root-find | diff ≤5.8e-16 | goal-seek equivalence ✓ |
| tangency at MOVED-φ post-trade point | pricing==traj slope, diff 8.9e-16 | (note only showed φ=0; I extended — holds) |
| wings frozen under φ-shift | w(±∞;φ)=0.52/0.72 exact ∀φ | exact ✓ |
| round-trip +dy/−dy | returns to 3.6e-16 | ✓ |
| path-independence (0.1 vs 0.05+0.05) | diff 0.0 | ✓ |
| wing cap dy∈(−3.798,+2.060) | reproduced | ✓ |
| BUILD_SPEC R-simple-mischaracterizes-Balancer correction | Balancer w 0.55→0.585 under a trade | correction RIGHT ✓ |

## FLAGS

**FLAG-OVERSELL (narrow, non-blocking) — the warp4 "Balancer to 1e-13 at τ≥5" headline.**
The note's consistency-battery row "Reduces to plain Balancer (τ→∞): dx matches Balancer closed-form
to 1e-13 at τ≥5" reads like a convergence result; it is a near-tautology. A single (W) trade step
IS a Balancer trade with `w` frozen at the live local weight (Step 3 is `x'=α/w*` on the identical
hyperbola), so it matches Balancer-at-the-local-weight to machine zero at ANY τ, not because τ=5 is
"close to ∞." The GENUINE τ→∞ limit — (W) vs Balancer-at-`w_mid` — converges only as ~1/τ²
(my TEST F: diff 6.6e-3 at τ=5, 3.3e-5 at τ=1000), nowhere near 1e-13 at τ=5. The note tags it
`[numeric]` so it is not dressed as a theorem, and the manager's framing ("τ→∞ recovers Balancer
✓") is the correct reading. But the specific "1e-13 at τ≥5" digit measures a different (trivial)
identity than the one the row label advertises. Not ship-gating; a label-precision note for the
record so it is not later cited as "Balancer convergence is essentially exact by τ=5."

**FLAG (honest-and-correctly-flagged, recorded not held) — the two open lemmas are correctly
labelled and correctly NOT-blockers.** (a) warp∘rebase commute and (b) φ=0 anchor/funding-under-
moved-φ are both `[needs-Aristotle]`/`[needs-numeric]`, operator-tier, and the note does NOT dress
either as done. I confirm: the note defines no strong-form rebase operation, so trade-rebase-commute
is genuinely untestable here, not dodged — the note is right to flag it as the next target rather
than claim it. This is the correct honesty posture; no flag against the labelling. The standing
caveat for the build: v27 must NOT silently implement a rebase on the `(x,y,φ)` state and imply it
commutes — that op is undefined until lemma (a) lands.

## The other checks (all clean)

2. **R-simple correction is RIGHT, not over-corrected.** TEST E confirms plain Balancer's pricing
   curve `w` moves under a trade (0.55→0.585), so the BUILD_SPEC's "R-simple = point slides on a
   FIXED field" did mischaracterize even Balancer. The note's corrected claim — conserved object is
   the trajectory hyperbola, pricing curve always reshapes — is exactly right and not the opposite
   overclaim. It does NOT claim Balancer "warps as much as (W)"; it claims the kinematic structure
   is the same (reshape forced by conservation), which is true.

3. **Frozen-wing cap honestly flagged, not buried.** Stated as §(v), tabulated, given the explicit
   bound `y'∈(β/(1−w_−),β/(1−w_+))`, called "the one genuine obstruction," and the manager
   independently exercised the rejection (dy=0.5 → w*=0.815>w_+ REJECTED). The note correctly frames
   it as the expected consequence of frozen wings, not a defect, and routes the
   reject/split/clamp choice to operator/calibration tier. No spin.

5. **Discarded-variant diagnosis is FAIR, not scapegoating.** Verified against HEAD code (line 1729):
   `tradeUpdate` returns `{...s, x_new, y_new}` with all shape params untouched, reading off fixed GH
   tables. The "kernel-in-SCORE ⇒ no scalar weight to move" diagnosis is the same fact as my own
   manager-verified verdict #1 (kernel-in-SCORE(GH) ≠ kernel-in-WEIGHT((W))). It correctly credits
   GH as faithful-reserves-on-fixed-curve, not "broken" — accurate, blame-free.

## Inventory disposition audit (re-counted myself — all 16 present, no "all 15" creep)
#1 Balancer base, #2 warp, #3 τ, #4 carry, #5 rebase (partial, flagged), #6 value-law, #7 ITM (N-A),
#8 strike reg, #9 funding, #10 slippage (N-A), #11 dollar pipe (N-A), #12 gotcha, #13 solvency (N-A),
#14 Esscher, #15 file-safety (N-A), #16 warp (DEFINED). All dispositioned. #4/#5/#9 carry-pass
caveats (verdict #10) correctly inherited as flags, not silently dropped. #16 is the deliverable.
Pattern-#6 (newest-item-falls-out) CLEAN this pass.

## Convergence-alarm: LOW.
Manager and research-lead agree, but the note is self-adversarial (it volunteers the wing cap as
its "one genuine obstruction" and lists what is NOT proven), and the manager actually re-ran the
rejection and the trajectory identity rather than narrating. Every digit I sampled reproduced. The
agreement is earned. The one place momentum could have hidden something — "is φ-moving really a
warp" — I attacked directly (TEST A/B) and it held, sharper than the note argued it.

## Most important line
**This is the first artifact that actually builds the operator's signed clause — and R-simple was
not merely weaker, it was conservation-INCONSISTENT, so dropping it is correct.** GREEN to drop the
strong-form map into v27 with the `w*∈(w_−,w_+)` guard; re-verify post-build with the tester (the
warp4 "1e-13" row is a near-tautology, not a τ→∞ convergence proof — don't cite it as the latter);
the two open lemmas are honestly deferred, not blockers, but v27 must not implement an undefined
`(x,y,φ)` rebase and imply it commutes.

## Verbatim channel: HELD.
Acceptance clause "trades warp the curve, not a dot sliding" matches my verdict #11 record
(`history/operator/2026-06-10_kurtosis-curve-family-brief.md` entry 1). No FLAG-PROCESS.
