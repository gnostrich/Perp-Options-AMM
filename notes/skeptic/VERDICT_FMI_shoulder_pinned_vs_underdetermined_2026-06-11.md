# VERDICT — FMI shoulder: PINNED or UNDER-DETERMINED? (entry-41 vs entry-42 reconcile)

_skeptic, 2026-06-11. READ-ONLY. Re-derivation tool: sympy (closed-form), see end. Adjudicating
the tension between `notes/research/NATURALNESS_polar_kurtosis_map_2026-06-11.md` (entry-41, I
PASSED: shoulder UNDER-DETERMINED) and `notes/research/FMI_hyperbolic_alts_and_shoulder_localisation_2026-06-11.md`
(entry-42: shoulder "two-sided pinned → √-kernel unique"). Manager re-derivation supplied; I
verified it and it is correct, but it does not go far enough — entry-42 has a second, sharper
error than the one the manager flagged._

---

## VERDICT IN ONE BREATH

**Both notes are right about DIFFERENT questions, and entry-42 OVER-CLAIMS by conflating them.**
There are two distinct DOFs and you must name which one you mean:

- **The shoulder-SHAPE at fixed frozen wings** (the family `{√-kernel, tanh, erf, gd, …}`, all
  honest sigmoids with `s(±∞)=±1`): **UNDER-DETERMINED.** The wing+knob constraints do not pin
  it; √-kernel is singled out only as the integrable-to-an-*algebraic*-invariant + gentlest
  member. This is entry-41, and it stands.

- **The exponent `p` inside the one specific family `s_p = u/(τ²+u²)^p`:** `p=½` is **PINNED**,
  but the pin is **almost entirely the frozen-wings requirement re-expressed** — NOT a deep
  two-sided structural law. Entry-42 sells this pin as if it discovered structure; it mostly
  re-discovered its own constraint.

**So: the kurtosis shoulder is UNDER-DETERMINED.** It is a free shape choice; the √-kernel is the
integrable + gentlest pick, not a forced one. Entry-42's "two-sided pinned → unique" reads as a
naturalness/uniqueness over-claim and must be corrected before it reaches the operator.

---

## FLAG-OVERSELL (entry-42)

Entry-42's headline — that the shoulder DOF is "TWO-SIDED PINNED" so `p=½` is "the UNIQUE
member" — over-claims relative to its own evidence in **two** specific ways. I re-derived the
`s_p` family in closed form to check.

### (1) The soft-side blocker is MIS-STATED. It is NOT "costs the algebraic invariant."

Entry-42 line 162–164 claims going softer (`p<½`) "costs the **algebraic invariant**." This is
**wrong on the stated mechanism.** I integrated `∫ s_p du` symbolically for the whole family:

| p | `∫ s_p du` | elementary algebraic? |
|---|---|---|
| ¼ | `⅔(τ²+u²)^{¾}` | **YES, algebraic** |
| ½ (√-kernel) | `√(τ²+u²)` | YES, algebraic |
| ¾ | `2(τ²+u²)^{¼}` | **YES, algebraic** |
| 1 | `½·ln(τ²+u²)` | no (log) |
| 3/2 | `−1/√(τ²+u²)` | **YES, algebraic** |

The invariant is elementary-**algebraic for almost every p** (every `p≠1`), including the softer
`p=¼`. So "you lose the algebraic invariant by softening" is **false as written** — `p=¼` keeps
a perfectly algebraic invariant `(τ²+u²)^{¾}`. The √-kernel is NOT singled out by "only p with an
algebraic invariant"; that property is generic in the family.

**What is actually true** (the real soft-side blocker the manager intuited and I confirm): for
`p<½`, `s_p ~ u^{1−2p} → ∞`. It is **not a sigmoid at all** — `s(±∞)=±∞`, not `±1`. There is
**no frozen power-law wing**; the weight `w` runs away unbounded. So the soft side is blocked by
**loss of the frozen wing itself**, not by algebraicity. Entry-42 named the wrong cause.

(The truly special thing about `p=½` is narrower and is the entry-41 statement, not entry-42's:
it is the one p where `∫s_p = √(τ²+u²)` is exactly the hyperbolic radius `τ·cosh η`, so the polar
lens closes. That is integrability-to-the-*radius*, a tiebreak — not a uniqueness law.)

### (2) The pin is CIRCULAR — it is the frozen-wings requirement, not independent structure.

I confirm the manager's re-derivation exactly:

- `s_p → 1` (finite, frozen wing) **iff** `p=½`. For `p<½` it diverges (above); for `p>½` it
  **collapses to 0** (`s_p ~ u^{1−2p} → 0`), so `w→w_mid` with no skew split — the wing isn't
  frozen at a power-law, it's erased.
- The monotonicity blocker `p>½` is real but **secondary and redundant**: `s_p′ ∝ τ²+u²(1−2p)`,
  which is negative for large u once `p>½` (turnover at `u²=τ²/(2p−1)`). True — but the wing has
  *already* collapsed to `w_mid` at `p>½`, so monotonicity is a second symptom of the same
  disease, not an independent two-sided wall.

So within `s_p`, `p=½` is the **only value that has a frozen power-law wing at all.** You are
"varying a parameter that breaks frozen wings except at one value" and then announcing that one
value is pinned. That is the frozen-wings contract re-expressed — **circular**, exactly as the
manager said. It is not the genuine "shoulder shape at fixed frozen wings" question, which has a
whole honest family `{√-kernel, tanh, erf, gd}` and is **under-determined** (entry-41).

**The steelman for entry-42** (which I tried and it does not survive): one could argue the `s_p`
family is "the natural deformation" so its pinning IS meaningful. But the deformation axis `p`
is the *wrong* axis — it doesn't hold the wings fixed, so it cannot be the shoulder-shape DOF.
The DOF that holds wings fixed and varies the shoulder is the **sigmoid-class** choice (√ vs tanh
vs erf), and on THAT axis there is no pin. Entry-42 implicitly swaps the meaningful axis for the
circular one and reports a pin. That swap is the over-claim.

---

## THE ONE HONEST STATEMENT FOR THE OPERATOR

> **The kurtosis shoulder is UNDER-DETERMINED, not forced.** The frozen-wings + one-knob
> requirements do not pick a unique shoulder shape — `{√-kernel, tanh, erf, gudermannian}` all
> satisfy them. The √-kernel is the chosen pick because it is the **gentlest-divergence**
> crisp-wing shoulder AND its invariant `√(τ²+u²)` is the hyperbolic radius (the polar lens
> closes) — a well-motivated *tiebreak*, not a uniqueness law. The "two-sided pin" in entry-42
> is real only inside the narrow `s_p=u/(τ²+u²)^p` family, where it is essentially the
> frozen-wings requirement restated (every `p≠½` simply stops being a frozen-wing sigmoid), so it
> does not upgrade "under-determined + good tiebreak" to "uniquely forced."

Entry-41 PASS stands. Entry-42 carries a FLAG-OVERSELL on its "two-sided pinned → unique"
framing and a FLAG-WRONG on the soft-side mechanism ("costs the algebraic invariant" — it does
not; `p=¼` keeps an algebraic invariant, the real cost is the frozen wing). The corrected
content is fine and useful; only the *uniqueness/pinned* rhetoric must not reach the operator
intact. This is textbook elegance-masquerade: a tiebreak dressed as a law.

## MOTIVE-LINE CHECK (the five lines)
- Line 3 (kurtosis knob, role split convexity=`w_mid`/skew=`Δw`/kurtosis=`τ`): both notes keep
  τ as the static elbow-width knob; the `p` exponent entry-42 floats would be a *second* shape
  knob — correctly flagged by entry-42 itself as operator-tier and NOT recommended. No drop.
- Line 4 (everything else unchanged): frozen power-law wings + value∝S^{−γ} are the binding
  contract that the soft side (`p<½`) actually violates — so the under-determined verdict does
  NOT loosen any locked contract. Good.
- No inventory item silently dropped; this is a notes-only naturalness exploration, no build.

---

## Re-derivation (sympy)
- `∫ u/(τ²+u²)^p du` for p∈{¼,½,¾,1,3/2}: algebraic for all p≠1 (table above). Refutes the
  "softening costs the algebraic invariant" mechanism.
- `lim_{u→∞} u/(τ²+u²)^p`: ∞ (p<½), 1 (p=½), 0 (p>½). Confirms only p=½ is a frozen-wing sigmoid.
- `d/du [u/(τ²+u²)^p]` numerator `= τ²+u²(1−2p)`; turnover at `u²=τ²/(2p−1)`, real iff p>½.
  Confirms the (redundant, secondary) monotonicity blocker.
