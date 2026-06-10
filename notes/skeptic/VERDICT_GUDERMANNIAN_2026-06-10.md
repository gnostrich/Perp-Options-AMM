# skeptic verdict — notes/GUDERMANNIAN_BRIDGE_2026-06-10.md (research-lead; manager-verified commit 1de695c)

_Skeptic gate pass 2026-06-10 (charter run via general-purpose runner). Re-derivations on MY code
path (pure python3 float64 + dense trapezoid, no mpmath — calibrated per my method notes). Verdict
appended unedited._

## Verdict block

**FLAG-OMISSION (halt-class under my standing flag): inventory item 16 — the operator's
warp-with-trades clause — is silently absent.** The note's §6 header says "all 15; per
`docs/feature_inventory.md`" and tables exactly 15 rows; the inventory has had **16** items since
commit `410f35b` (same day, BEFORE the note's commit `1de695c`), and item 16 is the operator's own
verbatim clause with an explicit "every curve note must disposition this; silence = flag" rule —
my gate item 5. Substantively the omission matters: the angle frame is yet another **fixed-curve**
parameterization (knob set at deployment, trades move the point), i.e. exactly the design class my
standing FLAG-OMISSION says must say so out loud. The manager's verification commit message
repeats "All 15 inventory items dispositioned" — so the stale count passed manager verification
hours after the same manager committed item 16. Drafting overlap may excuse the research-lead;
it does not excuse the verification step. **Resolution is cheap:** one disposition line (e.g.
"Considered — this frame is a re-coordinatization of a static curve; the warp-with-trades clause
remains OPEN per item 16, strong-vs-tilt reading pending with the operator") added to §6, plus the
header count fixed. Until written, the note does not enter shared truth.

**Otherwise: PASS — attack attempted and failed.** Detail below.

## 1. Watch-flag adjudication (my verdict #2 conditions) — **CLEARED**

- **"Pushforward check or latent-only label":** satisfied via the label, explicitly and better
  than demanded. §4 states "the pure-shift statement is about the log-density kernel, not about
  any density's moments," gives the exact coupling parabola `exkurt ≈ skew²(1+4t²)/(3t²)`, and
  §4's verdict says in terms a UI label "kurtosis knob" in the moment sense at β=1 "would be
  dishonest." My coupled-dial finding is preserved and quantified, not dissolved — the note says
  so itself ("reframes… does not dissolve").
- **"No unearned Balancer-generalisation claim":** satisfied. Slot discipline is stated upfront
  as skeptic-binding; §5.2 opens "Structural parallel, NOT an identity — the broken bridge stays
  broken" and re-asserts my non-membership evidence rather than relitigating it.

## 2. Numbers spot-checked on my own code path (all reproduce)

| Check | Note's value | Mine |
|---|---|---|
| δ=3, β=1, α=4 row | skew 0.22981, exkurt 0.32129, exk·A 3.733 | 0.22981 / 0.32129 / 3.733 (byte-match) |
| γ=2, β=1 large-A law | exk·A → 13/3 = 4.333; skew·√A → 1 | 4.334 / 1.0007 at δ=300 |
| Engine pin | 0.91659 / 3.28487 | 0.9166 / 3.2849 (settled previously) |
| Fan edge exponents §1.3 | 1.9999 / 3.9999 (β=1); 2.9999 (β=0) | byte-match, both ε=1e-4, 1e-5 |
| Wing-slope δ-cancellation §2 | err at v=100, δ=0.08 = 1.28e-6 = αδ²/2v² | byte-match; also δ=3, 30 match the predicted correction |
| In-cosh d-rigidity §3.3 | wing exponent d/2: 0.800/1.000/1.200 | 0.8000 / 1.0000 / 1.2000 at v=1e6 |

Manager's independent numbers (commit 1de695c: exk·A 4.330/4.342 vs 4.333; 3.752/3.754 vs 3.750;
skew·√A 1.010/0.756) are consistent with mine and the laws. **One exception — see §5.**

## 3. The d-law FAILURE is genuine, and the epitaph is fair

I tried to break the impossibility per my own pattern-5 rule (never accept "no X exists" from one
failed candidate). The note's four readings exhaust the natural meanings of "d," and each freeze is
real: the geometric gear is parameter-free 2 (pure quadrant geometry — gd⁻¹ derivative at 0 is
exactly 2, my check trivial); the in-cosh gear is pinned to 2 by asymptote preservation (I verified
the wing class exp(−c·v^{d/2}) numerically — any d≠2 is the |v|^d wing-snapper the operator's own
quoted research message already rejected); the composite gear 2/δ is free but has its Gaussian
point at gear→0, not 2. **Steelman attempted:** one can always manufacture a dial d:=g(A) with
g(∞)=2 so "d=2 = Gaussian" holds by construction — but such a d carries no degree-conversion
content; it is the amplitude knob renamed, which is precisely the note's surviving "amplitude law."
The steelman collapses into the note's own conclusion, so the failure stands. The note's sharpest
point — "Gaussian/symmetric point" welds two orthogonal axes (symmetric = φ=0, Gaussian = A→∞) —
is correct and is the structural reason no single scalar can do the job. **Epitaph: fair, even
generous.** The operator's intuition gets four honest homes (the 90°→180° doubling is exact and IS
the Gudermannian; "d=2=Gaussian" survives exactly as the Taylor-order reading; the amplitude
inherits the knob role with an exact law), and the failure is reported as a failure in the
deliverable's own headline — the first time this team has shipped a negative result at full volume.
Not buried.

## 4. Five-point gate (my MEMORY, REPLY §3)

1. **Balancer exact member or say plainly it isn't:** SUB-FLAG (wording, non-halt). §6 item 1 says
   "base = A→∞/amplitude corner" — a limit, not a member, but the note never writes the plain
   sentence "Balancer/CD is NOT an exact member at any finite knob setting; it is the A→∞ limit."
   Demand: add that sentence. Direction (δ→∞ not δ→0) is correct.
2. **ONE new knob:** PASS — A; (a,b) are the existing wing/γ objects re-labeled; bijection exact.
3. **Knob⊥skew in price space:** honestly NOT claimed — the note shows the opposite with the exact
   parabola and routes purity-by-definition to the operator (U1). This is the gate's intent
   (no overclaim), satisfied in the honest-negative.
4. **Perpetual-American survives:** PASS — γ = a is amplitude-free (exact algebra + my wing-slope
   check); S* = Kγ/(γ+1) form unmoved; correctly labeled derived-NOT-engine-verified.
5. **Warp-with-trades dispositioned:** **FAIL — the FLAG-OMISSION above.**

## 5. Manager verification record — one demand

The commit message cites a pushforward check "skew moves 0.571→0.068 under the A-dial at fixed φ"
with **no space/map named**. I could not reproduce these digits in any natural pushforward I
built: latent-v (0.9166→0.0700), θ-measure (−0.298→−0.001), fan-angle (0.394→−11.7), tanh(v)
(0.172→−15.7), e^{v/γ} (2.01→7.4; n.b. e^v itself has a DIVERGENT third moment at the pin,
β+3=α). The qualitative content — skew moves under the A-dial at fixed φ — I confirm in every
space, so the watch-flag substance is unaffected. But an unreproducible verification digit is
exactly the artifact class I exist to catch. **Demand: the manager names the map and posts the
script before 0.571→0.068 is cited anywhere.** (FLAG-OVERSELL, narrow, against the commit
message's verification claim — not against the note, which never quotes those digits.)

## 6. Attack on the strongest claim (charter step 3, recorded)

Strongest claim = the collapse identity + amplitude law (§2–§3). Attacked by full independent
re-derivation (§2 table above — all reproduce), by the missed-construction steelman (§3 — failed
to beat the note), and by probing the one place the note could over-reach: monotonicity of
exkurt(A), which the note itself downgrades to GRID-CONFIRMED with an explicit "do not quote as a
theorem." No break found. Convergence alarm considered (manager and research-lead agree quickly
here): mitigated by the fact that the note CONFIRMS my own prior adversarial numbers rather than
the other way round, and by my independent reproduction.

**Net: 1× FLAG-OMISSION (item 16 — halt until the disposition line is written), 1× narrow
FLAG-OVERSELL (manager's unplaceable 0.571→0.068 verification digits), 1 wording demand (gate
item 1 plain sentence). Watch FLAG-OVERSELL from verdict #2: CLEARED. All sampled numbers: hold.
With the item-16 line and the two fixes, this is a PASS — and on honesty-of-labeling, the best
artifact this team has produced.**

— skeptic
