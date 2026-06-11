# SKEPTIC VERDICT — POLAR density first-principles note (research-lead, entry 54)

_skeptic, 2026-06-11. Artifact under review: `notes/research/POLAR_density_first_principles_2026-06-11.md`.
Mandatory pre-relay pass. READ-ONLY; re-derived independently in `/tmp/skeptic_polar{,2,3,4}.py`
(transcribed below). Manager's re-derivation `/tmp/mgr_polar_check.js` and the research-lead's
`/tmp/polar53{,b,c,d}.py` reproduced. This is decision-support, HEAD untouched (`928cde1c`)._

---

## ONE-BREATH VERDICT

The note's **HEADLINE is FLAG-WRONG as stated**: "kurtosis ⊥ skew, the one thing (W) structurally
CANNOT do" is sold without disclosing that the construction which actually delivers it **drives the
ATM value-law exponent below 1 and negative, and makes the price curve non-monotone (arbitrageable)
across most of the advertised knob range.** The note defends arb-sanity with a *different*
construction than the one that produces the headline, and never runs the lock-checks on the headline
construction. Both of the manager's two flagged items are confirmed and they are the *same* hole.
Secondary: the L2-orthogonality is a parity tautology (correctly flagged by the manager), the
"contains (W)" claim is true-but-near-vacuous, and the §5.2 inventory table softens two locked
contracts. The well-posedness (a), the weight-free-only-under-B crux (c), and the
transcendental-vs-algebraic (d) findings survive attack and are sound.

---

## FLAG-WRONG #1 — the headline "kurtosis-at-zero-skew, which (W) cannot do" buries a γ>1 lock violation

**The hole.** The note runs TWO incompatible constructions of the kurtosis knob and quietly swaps
between them:

- **Construction A** (note §2 line 84 base term, §3.3 monotonicity table, §4 containment):
  `γ_loc(u) = γ₋ + (γ₊−γ₋)·½(1+tanh κu)`. Here κ is the *sharpness of the blend*. γ_loc stays
  bounded in (γ₋, γ₊), always > 1 if γ₋ > 1, always monotone. **But at γ₋=γ₊ (zero wing gap) the
  blend is constant ⇒ κ is INERT** — exactly (W)'s weld. Construction A *cannot* deliver
  kurtosis-at-zero-skew.
- **Construction B** (note §2.1 + §7 headline + manager script block (D) `glocSym = 2.5 − κ·sech²(u)`):
  an *additive even bump*. ATM value `= lvl − κ`. This is the ONLY construction that produces the
  headline numbers ("peak −1.25 → −12.5") and the symmetric-leptokurtic smile.

**The evidence** (`/tmp/skeptic_polar2.py`, reproduced exactly):
```
Construction B, lvl=2.5:  kappa=0.5 -> ATM gamma_loc=+2.00 (OK)
                          kappa=1.25-> ATM gamma_loc=+1.25 (OK)
                          kappa=2.0 -> ATM gamma_loc=+0.50 (VIOLATES 0<gamma<1)
                          kappa=5.0 -> ATM gamma_loc=-2.50 (NEGATIVE EXPONENT)
                          kappa=12.5-> ATM gamma_loc=-10.0 (NEGATIVE EXPONENT)
```
γ_loc IS the value-law exponent (note §1.2 defines it as such; CLAUDE.md item 6 / inventory #6 lock
`value ∝ S^(−γ), γ∈(1,4)` binds on it everywhere it is the pricing exponent, not only on the wings).
The note's own headline range (κ up to the "−12.5" figure) is **entirely outside** the γ>1 lock. A
lock-respecting window exists but is THIN — `/tmp/skeptic_polar4.py`: only κ ≲ 1.3 keeps ATM γ_loc>1,
and the depth is additionally hard-capped by the γ<4 ceiling on `lvl=(γ₋+γ₊)/2` (κ < lvl−1 < 3). The
note advertises the broken part of the range and never states the bound.

**Steelman (strongest case FOR the note).** "γ_loc is the *depth-potential* slope, a separate object
from the value-law exponent; the lock only binds on the actual traded strikes / the wings, and far-OTM
value still → 0 because γ₊ > 1 (note §5.1)." This is the note's escape hatch and it is *exactly* the
object-conflation that sinks it: note §1.2 explicitly EQUATES them — *"γ_loc(u) := −d ln(value)/d ln S
= (the slope field) = d(ln depth-potential)/du"* — three-way identity in one line. You cannot both
(i) define γ_loc as the value-law exponent to get Reading-A settlement `S*=Kγ_loc/(γ_loc+1)` for free
(note §5.2 ITM row), and (ii) treat the same γ_loc as a free depth-potential that may dip below 1 at
ATM to get the kurtosis headline. If γ_loc < 1 at ATM, the ATM smooth-paste boundary
`S*=Kγ_loc/(γ_loc+1)` is built from an exponent the lock forbids, and at γ_loc ≤ 0 the value law
`value ∝ S^(−γ_loc)` is *increasing* in S at ATM — not a put value at all. The steelman dies on the
note's own §1.2 identity. (Construction A respects the lock but is inert at zero skew, so it cannot
rescue the headline either.)

**Net:** "kurtosis ⊥ skew that (W) cannot do" is true only for an object that violates the γ>1 lock
across the advertised range. The honest claim is: *neither (W) nor the polar object delivers a
lock-respecting kurtosis-at-zero-skew of meaningful depth* — (W) because τ is inert at Δw=0
(confirmed, `/tmp/skeptic_polar3.py`: w≡w_mid ∀τ), the polar object because the only construction that
breaks the weld also breaks γ>1 outside a thin κ≲1.3 band the note never bounds.

---

## FLAG-WRONG #2 — "kurtosis κ alone never breaks monotonicity" is a Construction-A result mis-applied to the headline

**The hole.** Note §3.3 reports `min(γ_loc+γ_loc′) = +1.8` for κ up to 20 at skew=0, concluding
"kurtosis κ alone never breaks monotonicity." That table is computed on **Construction A** (the blend,
where γ_loc ≥ γ₋ = 1.8 dominates the sum). The kurtosis-at-zero-skew **headline** is **Construction B**.
On B, monotonicity breaks at the *same* κ where γ>1 breaks:

`/tmp/skeptic_polar2.py` (price `p=γ_loc·e^u`, monotone ⟺ `γ_loc+γ_loc′>0`):
```
Construction B, zero skew:  kappa=0.5  min(g+g')=+1.74  MONOTONE
                            kappa=1.25 min(g+g')=+0.60  MONOTONE
                            kappa=2.0  min(g+g')=-0.53  NON-MONOTONE (ARBITRAGEABLE)
                            kappa=5.0  min(g+g')=-5.08  NON-MONOTONE (ARBITRAGEABLE)
                            kappa=12.5 min(g+g')=-16.45 NON-MONOTONE (ARBITRAGEABLE)
```
So the note's reassuring "κ alone never breaks monotonicity" and its headline "κ=12.5 deep peak" are
computed on two different objects; on the headline object, κ≥2 is arbitrageable. The note never runs
the monotonicity check on the construction that produces its headline. This is the *same* hole as
FLAG-WRONG #1 (the A/B swap), surfacing in the arb-sanity claim.

---

## FLAG-OVERSELL #1 — the L2-orthogonality is a parity tautology (manager's flag CONFIRMED)

`<even, odd> ≈ machine-zero` is true for **any** function decomposed into even+odd parts over a
symmetric interval, because even·odd is odd and integrates to zero by parity. `/tmp/skeptic_polar3.py`
gets `2.5e-15` for a *random garbage* `f = 0.31 tanh + (−1.7)sech² + 0.05·u·sech² + 0.9 sin·gaussian +
2.2`. It carries **zero** modeling content — it is not evidence that kurtosis and skew "decouple." The
real (modeling) content is the *assignment* "kurtosis ≔ even part, skew ≔ odd part," which is a
DEFINITIONAL CHOICE, not a discovery. The headline "(W) structurally CANNOT do this" does not follow
from orthogonality at all — it follows (when it follows) from (W)'s τ-Δw weld, a separate and genuine
fact. The note presents a definition dressed as a structural theorem. (Manager: your instinct #1 was
exactly right; I confirm and extend — the dressing matters because it lends false rigor to a headline
that is otherwise lock-violating.)

---

## FLAG-OVERSELL #2 — "polar family properly CONTAINS (W)" is true but near-vacuous

`/tmp/skeptic_polar3.py`: (W)'s `γ_loc = w/(1−w)` with the √-kernel weight IS a positive monotone
interpolation between two wing values (γ₋=1.50, γ₊=3.55 at the note's params) — so yes it is a member
of "the set of all monotone positive γ_loc shoulders." But that "family" is just *the set of all 1-D
value-curves*; it contains literally any monotone shoulder. "Containment" reduces to "the set of all
shoulders contains this particular shoulder." The meaningful question — does the superset buy a NEW
lock-respecting knob (W) lacks — is the kurtosis-at-zero-skew claim, which is FLAG-WRONG #1/#2. So the
extra the superset buys is precisely the part that violates the locks. Containment as stated is not
false, but it is sold as structural support for the headline and provides none.

---

## INVENTORY (§5.2 table) audit — 1 SOFTENING, otherwise present

I walked all 16 items. **No silent absence** — the note dispositions carry (#4), rebase (#5), ITM
smooth-paste (#7), funding (#9), dollar pipe (#11), warp-with-trades (#16), value-law (#6), and the
solvency/depth-floor (#13, §5.1). #8 strike-registration, #10 slippage basis, #12 the price/slope
gotcha, #14 Esscher, #15 file-safety are not separately listed but are N-A for a decision-support
density note (no engine edit, no mark/oracle rewire) — acceptable, this is theory not a build.

**The softening (carried pattern #8/#5 from my prior verdicts):** the §5.2 table marks #5 rebase and
#9 funding as "NO (re-derive)" — i.e. filed as ordinary research to-do. These are **LOCKED contracts**.
A locked contract that does not transfer to a candidate curve is operator-tier "**Changed**" (the
escalation tier I demanded in verdicts #5/#9/#10), not "OPEN/not-worked." The note correctly says they
are "OPEN here as for (W)" — true — but the framing "frame doesn't fix them, doesn't worsen them"
under-states that for a NEW first-principles object these are *unestablished*, not merely "same as (W)."
Manager: relay as "the same locked contracts that don't yet transfer for (W) are equally unestablished
here," not as a research backlog item.

**One genuinely sound inventory finding to preserve:** the §5.2 ITM row `S*=Kγ_loc/(γ_loc+1)` is
"YES (definitional)" ONLY while γ_loc>1 (FLAG-WRONG #1). If the kurtosis knob is pushed into the
lock-violating range, the ITM transfer claim falls with it. The "transfers clean" label is conditional
on the knob staying in the thin lock-respecting window — undisclosed in the table.

---

## SURVIVES ATTACK (sound — do not re-litigate)

- **(a) Well-posed object.** Primitive = γ_loc(u) on `u=ln tan θ`; curve via `ln F=∫γ_loc du`; ATM at
  45°. Sound and clean. The "θ bounded, u unbounded" observation (§1.1) is correct and well-made.
- **(c) Weight-free ONLY under B-anchoring; under A the reseat scalar reappears = the weight in
  disguise.** This is the note's strongest and most honest finding. I attacked it for a weight-free
  A-compatible map and **could not find one**: under path-A (trade-point anchoring, operator-chosen
  entry 33/38), the warp must be geared to the *trade point* (ray∩curve), which is NOT the reserve
  tilt u_R=ln(y/x) in general; the gearing scalar (the (W) `z=t·τ/√(1−t²)`, or a stored φ≠u_R) is
  forced by A's definition. The note's crux — weight-elimination ⟺ B-anchoring, contradicting the
  already-chosen A — is a **genuine hard tension, not a hard contradiction** (B IS available; the
  operator chose A in entry 38 with eyes open and asked for B only as a curiosity). So it is correctly
  an operator-tier fork, not a defect. CONFIRMED sound.
- **(d) Closed-form TRANSCENDENTAL (log-cosh + sech²), forfeits the √-kernel ALGEBRAIC tiebreak.**
  sympy results reproduced; the entry-41 algebraic-integrability tiebreak is genuinely lost off the
  √-kernel member. Sound and correctly framed as a cost.
- **(W) τ-Δw weld confirmed** (`w≡w_mid ∀τ at Δw=0`) — the contrast the headline rests on is real;
  (W) genuinely cannot do kurtosis-at-zero-skew. The defect is in the polar object's claim to CAN,
  not in the (W) CANNOT.

---

## ⚠ FRAMING MISMATCH the manager should surface (not a flag — a relay-fidelity note)

The operator's entry-53 ask (verbatim) was: *"a liquidity (relative radius) distribution ... which
has natural skew and kurtosis knobs --- and we just want a natural map from x and y to the skew knob
(maybe dont even need weights then idk,)"*. He asked for (1) a distribution with skew+kurtosis knobs,
and (2) a weight-free x,y→**skew** map. He did NOT ask for "kurtosis decoupled-at-zero-skew." The note
ELEVATES kurtosis-at-zero-skew to THE headline win ("the one thing (W) cannot do"). That is the
research-lead's framing, not the operator's prize. The operator's own entries 3/4 say "steepness and
kurtosis are interchangeable words" and the kurtosis knob is static curve geometry set for vol — a
*single* shape knob, not a demand that it be orthogonal to skew at zero skew gap. The genuinely
responsive findings are (a) well-posed, (c) weight-free-under-B, (d) the algebraic cost. The headline
the note leads with answers a question the operator didn't ask, and answers it with a lock-violating
construction. This is the team's documented convergence-on-an-elegant-theorem failure mode (pattern #1:
the confident headline is the broken claim).

---

## VERDICTS (appended unedited; manager relays)

1. **FLAG-WRONG** — Headline "kurtosis ⊥ skew, the one thing (W) cannot do" omits that the only
   construction delivering it (additive even bump, §2.1) drives the ATM value-law exponent below 1 and
   negative across the advertised κ range, violating the γ∈(1,4) lock (#6). Lock-respecting window is
   κ≲1.3 only, never bounded in the note. Evidence: `/tmp/skeptic_polar2.py`.
2. **FLAG-WRONG** — "Kurtosis κ alone never breaks monotonicity" (§3.3) is computed on the blend
   construction; on the headline construction, κ≥2 is non-monotone/arbitrageable. The note never runs
   arb-sanity on the construction that produces its headline. Evidence: `/tmp/skeptic_polar2.py`.
3. **FLAG-OVERSELL** — L2-orthogonality `<even,odd>≈machine-zero` is a parity tautology (holds for any
   f; `2.5e-15` for random garbage), not evidence of decoupling. The modeling content is the
   definitional ASSIGNMENT kurtosis≔even/skew≔odd. Evidence: `/tmp/skeptic_polar3.py`.
4. **FLAG-OVERSELL** — "Polar family properly CONTAINS (W)" is true but near-vacuous ("all shoulders
   contains this shoulder"); the extra the superset buys is exactly the lock-violating part.
5. **FLAG-OMISSION (soft)** — §5.2 files locked contracts #5 rebase and #9 funding as "re-derive"
   (research to-do) rather than operator-tier "locked contract unestablished on a new object." Carried
   pattern from verdicts #5/#9/#10. The ITM "transfers clean" label is conditional on γ_loc>1,
   undisclosed.

**Sound and not to be re-litigated:** (a) well-posedness, (c) weight-free-only-under-B crux (I
attacked for a weight-free A-map and could not find one), (d) transcendental-not-algebraic cost, and
the (W) τ-Δw weld. The note's structure (honest A-vs-B fork to the operator) is legitimate, not a dodge.

---

## RESPONSE-TYPE LENS (entry-44 gate) — how to present to the operator

Per my standing entry-44 policing post: the operator asked, in plain terms, "is this first-principles
polar idea worth it / does it give me natural skew + kurtosis knobs without weights?" The right reply
is **ONE plain-English feature-level answer + the one real fork**, not the note's six-section
structure. Suggested shape (manager's to write, not mine to dictate):

- **The honest yes:** the polar object is well-posed and the weight-free skew map works — *if* the
  venue accepts spot-anchored impact (fork B). Under the path-A warp you already chose, a hidden
  recenter scalar comes back that is the weight under another name.
- **The honest no:** the advertised "kurtosis independent of skew" only works by pushing the ATM
  pricing exponent below 1, which breaks the value-law lock (`value ∝ S^(−γ), γ>1`) and lets the curve
  be arbitraged. (W) can't do kurtosis-at-zero-skew either; *neither does, in a lock-respecting way,
  beyond a thin setting.* So this is not a free new knob — it costs either the γ>1 lock or the
  algebraic invariant.
- **The one operator call:** do you want B (weight-free, impact-by-size) or stick with A?

NO PR/version mechanics, no κ-table dumps, no md5. The lock-violation must reach him as ONE plain
sentence ("the new kurtosis knob, as advertised, breaks the rule that option value falls with price
beyond a small setting"), because it is a real feature-level correction he would act on.
