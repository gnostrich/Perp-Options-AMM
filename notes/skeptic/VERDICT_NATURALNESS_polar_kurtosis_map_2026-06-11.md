# VERDICT — NATURALNESS_polar_kurtosis_map_2026-06-11.md (skeptic, 2026-06-11)

Artifact: `notes/research/NATURALNESS_polar_kurtosis_map_2026-06-11.md` (research-lead, operator entry 41).
Audited against: the operator's standing TRIG FLAG ("trig must EARN its place, not be adopted because
elegant"), `docs/feature_inventory.md` #1–#16, and prior settled ground — verdict #3 (Gudermannian),
verdict #5 (CURVE_FAMILY §1, zero-new-DOF), verdict #19 (the (ln K)³ divergence). READ-ONLY; operator
live-playing HEAD 1eebfcd6; no build/git/Aristotle. Every load-bearing numeric independently
re-derived on a fresh path (`/tmp/sk_natural.py`, `/tmp/sk_natural2.py`, `/tmp/sk_natural3.py`).

---

## BOTTOM LINE

**The naturalness claim is HONESTLY SCOPED. PASS, attack attempted and failed.** The note does NOT
oversell: it explicitly states "canonical AS THE PRIMITIVE, one-of-a-family AS A SHOULDER SHAPE,
integrability is a TIEBREAK not a logical forcing" — which is exactly the narrowing I would have
demanded. The operator can be told: **"the √-kernel is the natural algebraic primitive (singled out
by integrability, not elegance), one-of-a-family as a shoulder shape, trig-flag-satisfied,
least-divergent among crisp-frozen-wing maps — divergence intrinsic"** is a fair characterization.
Two narrow, NON-blocking note-quality flags below; neither changes the verdict the operator receives.

---

## CLAIM-BY-CLAIM (attack documented)

### Claim 1 — √-kernel is the natural algebraic primitive (integrability-singled). VERIFIED.
Re-derived all three antiderivatives on a fresh Simpson path (`/tmp/sk_natural.py`):
- √-kernel: `∫ u/√(1+u²) du = √(1+u²)−1`, numeric vs closed form diff **3.4e-14** — ELEMENTARY ALGEBRAIC.
- tanh: `∫ tanh = ln cosh`, diff 2.8e-14 — elementary but TRANSCENDENTAL (carries a log-cosh).
- erf: `∫ erf = u·erf + gaussian`, diff 8.9e-16 — NON-ELEMENTARY as a curve (the level set carries erf).

The manager's `d/dx √(1+x²) = x/√` claim reproduces to 3e-11 (my central-diff h; the manager's 7e-10
is the same identity at its own step — confirmed, not in dispute). So the discriminating property is
real and mechanical: **among the §1 family, the √-kernel is the unique member whose curve invariant is
closed-form algebraic.** This matches my verdict-#5 settled fact (the explicit invariant
`x^{w_mid}y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x)))=k`, logF std ~3e-13).

**Is "integrability ⇒ natural primitive" a DECISIVE criterion or a convenient tiebreak?** It is a
TIEBREAK, and — crucially — **the note SAYS SO** (§2(b) "the load-bearing, non-aesthetic
discriminator"; §5(i) "with a concrete tiebreak (integrability) in its favour"; verdict-line
"canonical AS THE PRIMITIVE, one-of-a-family AS A SHOULDER SHAPE"). No economic or geometric
*necessity* forces an *algebraic* invariant — a transcendental level set (`τ·ln cosh`) is a perfectly
valid curve; the contracts (value∝S^{−γ}, price==slope, trade algebra) read off a tanh-shoulder curve
too, just with a transcendental invariant. So algebraicity is a CLEANNESS/computational convenience,
not a forcing. **The note does not claim otherwise** — it never says geometry *requires* algebraicity;
it says algebraicity is what *singles out* the √-kernel from an otherwise-degenerate family. That is
the honest framing. The note is RIGHT that the shoulder is under-determined (§2(c): wings fix
`s(±∞)=±1`, knob fixes `s′(0)`, "the shoulder is under-determined by those constraints alone") and is
RIGHT not to tell the operator "it's THE most natural" without the caveat — it leads with "natural
ALGEBRAIC PRIMITIVE" and footnotes "one-of-a-family shoulder."

### Claim 2 — honest hedge. The hedge is GENUINE, not cosmetic.
The note carries every narrowing I would have forced: (a) integrability is a tiebreak not a forcing;
(b) the polar lens is "a well-motivated modelling choice, not a logical necessity" and "does not
logically force the √-kernel over the whole family" (§2(a)); (c) max-entropy/info-geometry does NOT
rescue canonicity (§2(c) — and it correctly cites the dead Gudermannian d-law as the evidence that
the implied-density route gives "no clean single-knob kurtosis law"). This is the OPPOSITE of an
oversell. The §2(c) max-entropy dismissal is consistent with my verdict #3 (the d-law failed to earn
its place; d was the amplitude relabeled). **No FLAG-OVERSELL on canonicity** — the note pre-empts it.

### Claim 3 — divergence intrinsic + √-kernel least-divergent (among crisp-frozen maps). VERIFIED.
- **Intrinsicness `[analytic]` is correct and I confirm it:** frozen power-law wing ⟺ w→const ⟺
  w′→0 ⟺ gearing 1/w′→∞. Bounded gearing would require w′↛0, i.e. a wing that keeps bending — which
  breaks the γ_± exponents and the γ>1 lock (#6). So the cap is map-independent. This is the
  map-independent generalization of my verdict-#19 finding (the (ln K)³ blow-up): #19 showed the
  blow-up for the √-kernel specifically; this note correctly shows it is forced by *any* frozen-wing
  shoulder, not a √-kernel defect. **Consistent with my settled ground.**
- **Gearing ranking reproduced byte-level** (`/tmp/sk_natural2.py`, 1/s′(x) at x=u_tp/τ): √-kernel
  31.6/132.6/524/1746 at x=3/5/8/12 (note: 133/524/1746 at 5/8/12 — EXACT); algebraic 16/36/81/169
  (note exact); erf 1.17e3/3.4e8/6.8e21 and tanh 101/5.5e3/2.2e6 (note erf 3.4e8/6.8e21, tanh
  5.5e3/2.2e6 — exact). Softening factors √/alg = 1.98/3.68/6.47/10.33 (note ~2/3.7/6.5/10.3 — exact).
  Ranking erf > tanh > gd > √-kernel > algebraic is correct: the √-kernel is the least-divergent map
  with EXPONENTIAL-free (polynomial) gearing that still keeps a crisp frozen wing; only the algebraic
  shoulder is gentler, at the documented cost (§3.2).
- **Wing-decay exponents reproduced:** s′ log-log slope −3.000 (√-kernel) / −1.985 (algebraic) — the
  u⁻³ vs u⁻² claim is exact.
- **The "softening bought with less-crisp freezing" trade-off is real:** alg wing is ~60× less-frozen
  than √-kernel at the same far point (my `/tmp/sk_natural3.py`: 1−s(30) = 3.2e-2 alg vs 5.5e-4 √).
  Direction and ratio confirmed; this defeats the algebraic-shoulder "upgrade" exactly as the note
  argues (it erodes the value∝S^{−γ}/G4 wing-exactness AND loses the algebraic invariant).

### Trig-flag-satisfied judgment. CORRECT, and consistent with verdict #3/#5.
Re-derived the change-of-variable on 2e5 random (τ,u): `τ·cosh(asinh(u/τ)) = √(τ²+u²)` to 2.8e-14,
and `w_mid+(Δw/2)·tanh(asinh(u/τ)) = w_mid+(Δw/2)·u/√(τ²+u²)` to **1.1e-16**. So cosh/√ is a bijective
change of variable carrying **ZERO new DOF** — the trig is genuinely a lens, not a second object. This
is the identical fact I settled in verdict #5 (cosh/√ exact to 5e-14, zero new DOF, no Gudermannian d
smuggled). The note's §4 framing ("if the trig vanished the √-kernel invariant stands alone; the
rejected d-law was a *content-claiming* use of the angle, this lens-only use is the honest one") is
the correct distinction and is consistent with my Gudermannian verdict. **Trig flag SATISFIED — the
cosh adds no content and no second DOF.** No smuggling.

---

## FLAGS (both NON-blocking note-quality — do NOT change the operator-facing verdict)

**FLAG-OVERSELL (narrow, non-blocking) — the frozen-wing residual DIGITS are ~100× optimistic.**
The note (§3.2 caveat 2, scripts) cites the algebraic map's wing residual as `1e-3` at u=30τ vs the
√-kernel's `5e-6`. I reproduce **3.2e-2 (alg) and 5.5e-4 (√)** for `1−s(30)` — both two orders of
magnitude larger than stated. The note may measure at a different point or with a different residual
definition (it does not pin the convention). **This does NOT touch the argument:** the load-bearing
content is the *ratio* (alg ~58–60× less-crisply-frozen than √-kernel), which I confirm, and the
ratio is what powers "softening is bought with wing-exactness erosion." The absolute "5e-6" is not
cited anywhere the operator's decision rests on it. Flag it so the digit is not later promoted as a
precise frozen-wing bound.

**Note-quality (sub-flag, non-blocking) — the gd row uses an unstated gd normalization.** The §3.2
table's Gudermannian gearing (74 @5τ, 1.5e3 @8τ) reproduces ONLY under the standard `gd′=sech x`
(decay rate −1.0); my first attempt with `(2/π)atan(sinh(π/2·x))` gave 1288/143376. Both are "the
Gudermannian," differently normalized. The note's row is internally consistent with rate −1.0 (I
reproduced 74.2/1490 under sech) and gd is NOT the recommendation, so this is purely a
reproducibility footnote, not a content error.

---

## INVENTORY DISPOSITION CHECK

This is a naturalness/design-space exploration, not a full curve-swap note, but it touches load-bearing
items and dispositions them honestly: #1 Balancer base (τ→∞ limit, implicit via the frozen-wing
family), #2 the warp (the weight-field is the subject), #3 kurtosis knob τ (the static shoulder width
— honored as the operator's static-at-deploy reading, ruling 3), #6 value∝S^{−γ}/G4 (explicitly
invoked as the wing-exactness contract the algebraic shoulder would erode), #16 warp-with-trades (the
divergence section IS the #16 anchoring chain — `(α,β)`-flow lemma carried [needs-Aristotle], anchoring
operator-tier, nothing built). The "honest carry" §6 correctly states: not a build authorization, the
flow-confinement lemma OPEN, warp∘rebase + φ-anchor/funding OPEN, curve/shoulder choice operator-tier.
**No silent absence that would mislead the operator on this question.** I do NOT flag the absence of
#4/#5/#7/#8/#9/#10/#11/#13 line-items: this note's question (is the *shoulder* natural) does not
reopen carry/rebase/settlement/funding/dollar-pipe, and dragging in full 16-item dispositions would be
noise, not signal. The one item that COULD have been silently dropped — #16/divergence — is front and
center and consistent with my verdict #19.

## CONVERGENCE ALARM — LOW

The note lands AGAINST team momentum in the honest direction: it refuses to tell the operator "yes it's
THE most natural," explicitly hedges canonicity to a tiebreak, kills the max-entropy rescue with the
team's own dead d-law, and confirms the divergence is intrinsic (i.e. the (g.4) cap I flagged in #19 is
unavoidable, not fixable by a cleverer shoulder). A note that hands the operator "your map is good but
not uniquely forced, and the divergence you're worried about is a domain boundary no map escapes" is
self-limiting, not self-promoting. Every digit I could re-derive reproduced. This is the team's honest
register.

---

## MOST IMPORTANT LINE
**The naturalness claim is honestly scoped, not over-reaching: the note itself supplies the narrowing
("natural ALGEBRAIC PRIMITIVE, integrability is a TIEBREAK not a forcing, one-of-a-family as a shoulder,
trig is a lens-only"), and all of it survives independent re-derivation — integrability uniqueness
(√ algebraic / tanh transcendental / erf non-elementary, diffs ≤3e-14), zero-new-DOF cosh identity
(1.1e-16), the divergence ranking and intrinsicness (gearing 31.6/132.6/524/1746 √ vs erf 6.8e21,
softening 1.98×/3.7×/6.5×/10.3× exact, w′→0 forces the cap for ANY frozen wing). The operator can be
told the polar/√-kernel map is "the natural primitive (integrability-singled), one-of-a-family shoulder,
trig-flag-satisfied, least-divergent — divergence intrinsic" WITHOUT narrowing. The only correction
is a non-load-bearing digit: the frozen-wing residual is ~100× larger than the note's 5e-6/1e-3 (true
5.5e-4 √ / 3.2e-2 alg), but the ~60× ratio that the argument actually uses is correct.**
