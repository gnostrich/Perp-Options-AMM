# VERDICT — CURVE_FAMILY_derivation_2026-06-10.md (skeptic, 2026-06-10)

Artifact: `notes/research/CURVE_FAMILY_derivation_2026-06-10.md` (research-lead).
Audited against the verbatim operator brief, `docs/feature_inventory.md` #1–#16, prior verdicts
(KURTOSIS_KNOB, GUDERMANNIAN). Attack attempted on the central claim (the §2 settlement gate);
all numerics independently reproduced or broken below.

---

## FLAG-OVERSELL — §2.3 magnitude table is a heuristic linearization of an ansatz inconsistent with the note's own γ_loc definition; it OVERSTATES the obstruction

The §2.3 table (γ′=0.01 ⇒ S*=87.35, +16%) reproduces byte-level on my path (87.349, 96.146,
97.955) — the *arithmetic* is faithful. But it solves the wrong object. The note writes the
continuation as the literal function `V(S)=c·S^(−γ(S))` and differentiates it, picking up the
`−γ′·ln S` term: smooth-paste BC `(K−S*)·(γ₀/S* + γ′·ln S*) = 1`. That `+γ′ ln S` term is the
entire source of the +16% blow-up.

It contradicts the note's OWN §2.2 definition. §2.2 defines `γ_loc(u)=w/(1−w)` as the **local
pricing exponent** — i.e. the local log-log slope of value, `d log V/d log S = −γ_loc(S)`. A value
defined that way has `V′(S)=V·(−γ_loc(S)/S)` with **no `γ′ ln S` term**. The two definitions
(local log-log slope vs literal exponent-of-S) coincide only when `γ′=0`. Under the note's own
§2.2 definition the smooth-pasting boundary is the clean fixed point

> **S* = K·γ_loc(S*)/(γ_loc(S*)+1)**

— a 1-D root, still closed-form-shaped in the local exponent (I solved it: γ′ at the boundary does
not enter; for w_mid=0.7, Δw=0.2 the honest S* ranges ~60–66 across τ, not 87–98). The +16%
"not robust to a varying exponent" diagnostic is an artifact of a slope expression that is
inconsistent with how the pricing law / γ_loc is defined three lines earlier. **The obstruction is
overstated.** (This is exactly blind-spot pattern #1: the table's confident magnitude is the part
that broke; the reproduced digits were reproducible precisely because the *arithmetic* was honest —
the *model* was not.)

## FLAG-OVERSELL — §2.5 path-2 ("generalized closed-form free boundary — open, plausibly yes") UNDERSELLS the steelman that rescues closed form

Smooth-pasting is a **local** condition at S*; it only involves V(S*) and V′(S*). If value is
locally a power with exponent γ_loc(S) through the elbow (the §2.2 pricing-law reading), the forced
boundary `S*=K·γ_loc(S*)/(γ_loc(S*)+1)` is immediate and the seam-C¹ algebra re-instantiates with
`γ := γ_loc(S*)` — the same shape as the Lean `Sstar_forced` relation, which is already an implicit
fixed point. The note files this as "an open analytic question, plausibly yes given §1.1's
elementary integral." That undersells: the boundary relation is not open — it is immediate under the
note's own exponent definition. **The genuinely open question — which the note never cleanly poses —
is narrower: does value remain LOCALLY a single power with exponent γ_loc THROUGH the elbow, or only
piecewise?** If locally-a-power holds, closed form survives (gate clears, not "fails as inherited").
If it does not, there is a real obstruction — but it is the failure of local-power, NOT the +16%
`γ′ ln S` blow-up the note advertises. The note jumped to the literal-ansatz slope instead of posing
the one question that actually decides the gate.

## Net effect on the §2.5 / Flag-2 VERDICT ("rebuild gate NOT cleared")

The headline verdict — "survives on frozen wings; fails-as-inherited in the elbow; gate NOT
cleared" — is **directionally defensible but rests on the wrong evidence.** "Survives on the frozen
wings" is correct and I confirm it (wings are exact CD monomials, γ_loc=γ_± constant — verified
below). "Fails-as-inherited in the elbow" is true in the trivial sense that γ_loc≠γ_wing at an elbow
strike, so the *number* S*=Kγ_wing/(γ_wing+1) is wrong there — but that is a re-evaluation of the
SAME closed form at the local exponent, NOT a loss of the closed form. The note's quantitative
support for "the closed form breaks" (the +16% table) is the FLAG-OVERSELL above. So the gate's true
status is: **OPEN on a sharper question than the note states** (local-power-through-the-elbow), not
"blocked by a magnitude-16% obstruction." The operator should not be told the closed form is
demonstrably fragile (it isn't, by the note's own definitions); the operator should be told one
specific analytic question is unresolved.

## PASS (with attack documented) — §1 curve/lens/wing claims

Independently reproduced:
- §1.1 invariant constancy: log F std 3.1e-13 / ptp 8.8e-13 on RK4 frontiers for all three param
  sets — matches the note's 1.4e-13 to method precision. The √-kernel first integral is genuine.
- §1.2 cosh/√ identity: `√(τ²+u²)=τ·cosh(asinh(u/τ))` and `u/√=tanh(asinh(u/τ))` to 5e-14 over
  10⁵ random (τ,u). It is an exact bijective change of variable ⇒ **the cosh form carries ZERO new
  DOF** — the §1.2/§1.4 "lens, not new content" claim is HONEST, and §1.3a honestly flags the
  Δw-vs-τ two-handle caveat (the "one knob" oversell I was told to watch for is pre-empted by the
  note itself). The standing trig flag is genuinely honored: cosh earns its place only as the
  operator's coordinate, no Gudermannian "d" smuggled.
- §1.3c wing-freeze: w→w₊/w₋ regardless of τ (err O(τ²/u²)); wing exponents τ-independent. Confirmed.

## §0 + creep-back check — CLEAN

§0 does NOT re-assert the τ≡δ identity, "no invariant exists," or invariances-by-carry. §1 derives
(W) on its own terms and explicitly disclaims the GH bridge. §0 disclaims "survive by carry."
Convergence-alarm: this is the team's most honest artifact to date AND it lands a "gate NOT cleared"
verdict against the team's own rebuild momentum — that self-adversarial direction lowers, not raises,
my suspicion. No overturned claim creeps back.

## Inventory dispositions (§4) — two softened-from-escalation labels

- **#9 Funding** is marked **OPEN** with "the w=½ anchor is not canonical for a warp family." Funding
  is a LOCKED contract (#9, CLAUDE.md §4). A statement that a locked contract's anchor does not
  survive the curve swap is **escalation-tier (Changed)**, softened to "OPEN/not-worked." Same milder
  case for **#4 carry** ("identification is NOT clean") and **#5 rebase** ("anchor ambiguous when w is
  a field"): these are honest non-transfer flags, but a locked-architecture element failing to carry
  is operator-tier news, not a research to-do. Not a FLAG on its own (the note does surface them and
  routes them to the operator in §5/§6), but the manager must escalate #4/#5/#9 as "locked contract
  does not transfer — operator decision," not file them as ordinary open derivation targets.
- #1/#2/#3/#6/#7/#13/#14/#16 dispositions are present and honest; #16 is correctly OPEN/UNIMPLEMENTED
  with the paper Trade-Formula→φ map flagged as not-worked (no creep into "done"). #6 "Considered
  (partial)" is correct. #13 solvency correctly Excluded-with-caveat (τ re-prices the B1 floor). No
  silent absences — all 16 present.

## Existence-vs-survival separation — CLEAN

The note keeps "a closed form meeting the geometry exists" (§1.1, witnessed, reproduced) strictly
separate from "the contracts survive on it" (§2, gated, NOT cleared). No blur. The yardstick is
respected: it rejects "can't be done" via the explicit invariant and never lets existence stand in
for contract-survival.

---

## MOST IMPORTANT FINDING
The §2.3 +16% settlement table — the quantitative spine of the operator's hard-gate verdict —
solves a literal `S^(−γ(S))` ansatz whose slope (`−γ/S − γ′ ln S`) contradicts the note's own §2.2
definition of γ_loc as the local log-log slope; under the consistent definition the smooth-pasting
boundary stays the closed-form fixed point `S*=K·γ_loc(S*)/(γ_loc(S*)+1)`, so the obstruction is
OVERSTATED and the real open question is the narrower "is value locally a single power through the
elbow," which the note never poses.
