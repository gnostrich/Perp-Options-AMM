# VERDICT — FMI entry-42 "two-sided pinned → √-kernel unique" vs entry-41 "under-determined"

_skeptic, 2026-06-11. Reconciliation requested by the manager before relay to operator (entry 42).
READ-ONLY; re-derivation only (`/tmp`, python float64). Both notes read in full; manager
re-derivation independently checked._

## Verdict in one line

**FLAG-OVERSELL on entry-42, but mild and fixable by wording.** The kurtosis shoulder is
**UNDER-DETERMINED as a shape choice** (entry-41 is the honest frame); entry-42's `s_p`-family
"two-sided pinned" is a TRUE statement about ONE parametric slice, but it is sold with a
**wrong reason on the soft side** and a **partly-circular reason overall**, which inflates it into
sounding like "the shoulder is forced." It is not forced. √-kernel is the *selected* member, not the
*compelled* one.

## What I verified (independent re-derivation)

1. **Wing asymptotic `s_p(x)=x/(1+x²)^p ~ x^{1−2p}`** — confirmed numerically (x up to 1e4, matches
   `x^{1−2p}` to 4 digits). Consequence:
   - `p<½`: `s_p → ∞` — wing **diverges**, weight unbounded, **not a sigmoid / not a frozen wing at all.**
   - `p=½`: `s_p → 1` — the **unique** finite nonzero wing limit ⇒ the only frozen-wing member.
   - `p>½`: `s_p → 0` — shoulder collapses back to `w_mid`, no wing offset.
2. **Monotonicity turnover** — `s_p′ ∝ 1+(1−2p)x²`, zero at `x=1/√(2p−1)`, real-positive **only for
   `p>½`** (turnover at 2.24 for p=0.6, 1.41 for p=0.75). Confirmed numerically (s′ goes negative past
   the turnover at p=0.75). So `p>½` is non-monotone — entry-42 correct on the SHARP side.
3. **THE KEY CORRECTION — antiderivative `∫ s_p dx = (1+x²)^{1−p}/(2(1−p))` is ELEMENTARY-ALGEBRAIC
   for EVERY rational `p≠1`** — verified F′==s_p to ~1e-10 at p=¼, ½, ¾. So entry-42's claim that the
   soft side (`p<½`) **"costs the algebraic invariant" is FALSE**: p=¼ gives `(1+x²)^{3/4}/1.5`, still
   perfectly algebraic. The soft-side blocker is **not** algebraicity — it is the **wing DIVERGING**
   (`x^{1−2p}→∞`), i.e. the **frozen-wings requirement itself.**
4. **What p=½ uniquely owns** — the antiderivative equals the **hyperbolic radius** `√(1+x²)=cosh(asinh x)`
   (checked, 1e-15). So p=½ is special for the **polar/cosh lens closing exactly**, NOT for mere
   algebraicity. The lens-closure is real and is p=½-only; entry-41 names this correctly, entry-42
   mis-attributes it to "algebraic invariant."

## Adjudication of the two specific questions

**Q1 — is the `s_p` pin genuine structure or circular?** Mostly **the frozen-wings requirement
re-expressed**, plus monotonicity as a second blocker on the sharp side only. You are sweeping a
parameter (`p`) that, by construction, **breaks frozen wings everywhere except `p=½`** — so finding
"only p=½ has frozen wings" is the frozen-wing contract being read back to you, not an independent
discovery. The genuine non-circular content in entry-42 is narrow but real: (a) monotonicity
*independently* rules out `p>½` (it's not just "no frozen wing" — the weight literally turns over,
an invalidity), and (b) the cosh/polar lens closes only at p=½. The "algebraic invariant cost on the
soft side" is **neither circular nor true — it is simply wrong** (point 3 above).

**Q2 — PINNED or UNDER-DETERMINED, and the honest statement?** Both, in different senses that must
NOT be collapsed:
- **Within the one-parameter `s_p=u/(τ²+u²)^p` slice: PINNED at p=½** — but pinned by the frozen-wing
  requirement (forces p=½ for a finite wing) + monotonicity (blocks p>½). This is a near-tautological
  pin: the slice was drawn through the √-kernel and the only point on it that is a valid frozen-wing
  sigmoid is the √-kernel.
- **Across the genuine "shoulder shape at FIXED frozen wings" family `{√-kernel, tanh, erf, gd, …}`
  (all → ±1, all valid frozen-wing 1-knob sigmoids): UNDER-DETERMINED** — the wing+knob constraints do
  not pick one; √-kernel wins only on the **tiebreaks** (algebraic invariant + gentlest/least-divergent
  + polar-lens closure), which are selection criteria, not laws. This is entry-41, and it is the honest
  frame.

The two notes are **reconcilable**: entry-42's pin is true but it is a pin *of the wrong family*. The
operator-relevant DOF is the shoulder SHAPE (entry-41's family), which is under-determined. Entry-42's
`s_p` slice is a single radial cut through that under-determined space, and a cut along which validity
collapses to one point — which says nothing about whether the *shape* is forced. It is not.

## Is entry-42 an over-claim? YES, in two places (FLAG-OVERSELL)

- **"costs the ALGEBRAIC INVARIANT" on the soft side (rows in §Q2(3), the p-sweep table "transcendental"
  entries for p<½, and the closing paragraph)** — FALSE. `∫s_p` is elementary-algebraic for all rational
  `p≠1`. The real soft-side blocker is the diverging wing (frozen-wing violation). The p-sweep table's
  "curve invariant: transcendental" column for p=0.25 is **wrong** and must be corrected before relay.
- **"two-sided pinned → √-kernel is the UNIQUE member" presented as if the shoulder is FORCED** —
  over-reads a tautological + monotonicity pin of a single parametric slice into a uniqueness law over
  the design space. Entry-41's "under-determined, integrability is a TIEBREAK not a law" is the correct
  standing frame and entry-42 does not overturn it. (Entry-42's own honest carry — "spent/pinned by the
  algebraic-invariant contract" — already concedes this is a chosen contract, not a forced one; the body
  language is stronger than the carry. The fix is to make the body match the carry.)

The over-claim is **mild**: entry-42 is not wrong that p=½ is the unique valid member of its slice, and
its monotonicity and polar-lens points are correct and genuinely sharpen entry-41. It does not survive
as "the shoulder is forced," and its algebraicity reason is broken.

## The one honest sentence for the operator

> The kurtosis shoulder shape is a **free choice, not forced**: the frozen-wings + one-knob requirements
> leave the shoulder under-determined, and the √-kernel is the member we *select* — it is the gentlest
> (least-divergent) shoulder that keeps crisp power-law wings, and the only one whose curve invariant is
> the clean algebraic radius `√(τ²+u²)` (the polar/cosh lens) — but those are tiebreaks, not laws; the
> only thing genuinely *pinned* is that within the narrow `u/(τ²+u²)^p` exponent-family, p=½ is the one
> valid frozen-wing setting (anything sharper turns the weight non-monotone, anything softer un-freezes
> the wing — NOT, as entry-42 states, because softer "costs the algebraic invariant," which is false: the
> invariant stays algebraic for softer p; it's the wing that breaks).

## Provenance / labels

- All four checks are `[skeptic-rederived, /tmp python float64]`, independent of the research-lead's
  `/tmp/fmi42.py` (I did not run theirs).
- entry-41 PASS (mine, 2026-06-11) **stands** — it is the correct frame and this reconciliation
  reinforces it.
- entry-42 carries the standing OPEN labels honestly (α,β-flow / warp∘rebase / φ-anchor all
  `[needs-Aristotle]`); no inventory item silently dropped (this is an FMI naturalness note, not a curve
  change — motive line 4 "everything else unchanged" not at risk). The over-claim is local to the
  shoulder-pinning argument, not a completeness gap.
