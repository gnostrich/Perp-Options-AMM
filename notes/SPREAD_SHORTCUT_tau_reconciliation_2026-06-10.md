# v24 "shortcut AMM tx" (vertical spread → 1 effective tx) — reconciled with the τ-curve

_2026-06-10, manager. Companion to `TAU_TRADE_UPDATE_derivation_and_impl_note_2026-06-10.md` (the
τ-generalized trade-update + closed-form single expression). **Question (operator):** does v24's
composite-ray "shortcut AMM tx" — where a vertical spread (2 option legs) collapses into ONE effective
AMM state update — survive the τ-kurtosis swap, so we can surgically drop the τ-curve into v24 keeping
the shortcut intact? **Answer: YES, exactly. The shortcut is curve-agnostic.** All numerics mpmath,
50 dps, manager-derived + verified (no engine edits; this is a reconciliation/readiness note). Curve/
economic-object choice remains operator-owned._

---

## 0. What the v24 shortcut actually is (read from the build, lines 1600–1697)

A **vertical spread** = two strikes `(θ_inner, θ_outer)`, **same wing**, one leg. v24 does NOT push
the two strikes through the AMM as two swaps. It collapses them via the **composite-ray identity**:

    compositeRay(lo,hi):  θ* = √(θ_lo·θ_hi),   δ = ½·log(θ_hi/θ_lo)          (v24 L1607)
    mark(wing,θ,sNorm)  =  min(sNorm/θ, θ/sNorm) ∈ (0,1]   (ITM saturates at 1) (v24 L1601)
    vsValue(N,m,δ)      =  N · mark(θ*) · 2·sinh(|δ|)                          (v24 L1612, "Identity I/II")

Then the spread's premium `V = vsValue` becomes a single cash delta `dy = ±V·oracle` and is pushed with
**one** `tradeUpdate(s, dy)` (v24 L1617, "Identity IV"). So: **2 strikes → 1 mark eval at θ* → 1
tradeUpdate.** (Barrier analog for completeness: `bsValue = N·m·2cosh(δ)`, L1614.)

> The shortcut has **two separable pieces**: **(A) a PRICING identity** (the composite ray + mark, which
> turns the two-strike spread into one number `V`), and **(B) a STATE-UPDATE** (one `tradeUpdate` carries
> the net premium). The τ-swap touches the curve. So the reconciliation question is: does (A) depend on
> the curve, and does (B) stay a single bundled push when the curve warps? Answers: (A) no, (B) yes.

---

## 1. (A) The composite-ray PRICING identity is curve-agnostic (τ-free)

`vsValue` is just an algebraic re-expression of `barrier(θ_lo) − barrier(θ_hi)` for the linear-in-`1/θ`
mark. For an OTM call (`mark = sNorm/θ`):

    mark(θ_lo) − mark(θ_hi) = sNorm·(1/θ_lo − 1/θ_hi) = sNorm·(θ_hi−θ_lo)/(θ_lo θ_hi)
                            = [sNorm/√(θ_lo θ_hi)] · [(θ_hi−θ_lo)/√(θ_lo θ_hi)]
                            = mark(θ*) · 2·sinh(δ).     ∎  (put wing symmetric)

**This identity contains no reserve-curve object** — only the moneyness mark `sNorm/θ`. It holds for
**any value of `sNorm`**. The τ-knob changes the *reserve curve* (`X(u),Y(u)`), not the *option
moneyness* (`mark = min(sNorm/θ, θ/sNorm)` is the payoff definition). So the composite ray, `θ*`,
`2sinh(δ)`, and the mark **port verbatim** — `τ` cannot touch them.

> **NUMERIC (CHECK 1, 50 dps):** `|mark(lo)−mark(hi)| == mark(θ*)·2sinh(δ)` to **err ≤ 6.7e-52** across
> call/put wings and three strike pairs (e.g. call sNorm 0.6, strikes (0.8,1.2): both 0.25). Independent
> of the curve. ✓

**One care-point (the only τ-dependence in (A), and it's indirect):** the mark consumes `sNorm =
getSNorm(state)`. `getSNorm` **is** curve-dependent and is on the migration change-list — it must be
re-derived from the τ profile so that `sNorm` still *means the spot moneyness*. The identity is exact for
whatever number `getSNorm` returns; the requirement is only that the τ-`getSNorm` keeps `sNorm` = the
normalized spot (as v24's `(x−α)/α = (1−w)/w` does). Pin that and (A) is untouched.

---

## 2. (B) The bundled single state-update survives — path-independence on any 1-D curve

The spread is one `tradeUpdate(net dy)` by construction. The deeper property that makes "bundle into one
effective tx" *exact* is: **on a 1-D curve, the final state depends only on the net Δy.** The τ-curve is
1-D — `y` pins `u` (invert the monotone `Y(u)=y−β`), `u` pins `x = X(u)+α` — so `x` is a single-valued
function of `y`. Therefore any sequence of pushes summing to the same net Δy lands on the **identical**
state. v24 has this because its curve is `X·Y=αβ` (`x = α + αβ/(y−β)`); the τ-curve has it because it is
*also* a single 1-D path (just a transcendental one). **Bundling is curve-shape-agnostic.**

> **NUMERIC (CHECK 2, 50 dps):** on the τ-curve, `tradeUpdate(tradeUpdate(s, dy₁), dy₂)` ==
> `tradeUpdate(s, dy₁+dy₂)` to **err = 0.0** — for the warped profile `(w_mid=.7, Δw=.2, τ=.5)` AND the
> v24-equivalent `(½,0,τ)`. State update path-independent. ✓

---

## 3. Verdict — the shortcut swaps in cleanly. What changes, what doesn't.

**Surgical-swap readiness: GREEN.** To drop the τ-curve into v24 and keep the vertical-spread shortcut:

| component | v24 | under τ | changes? |
|---|---|---|---|
| `compositeRay(lo,hi)` → θ*, δ | √(θ_lo θ_hi), ½log(θ_hi/θ_lo) | identical | **NO** (port verbatim) |
| `mark(wing,θ,sNorm)` | min(sNorm/θ, θ/sNorm) | identical | **NO** (moneyness, not curve) |
| `vsValue = N·mark(θ*)·2sinh(δ)` | Identity I/II | identical | **NO** (port verbatim) |
| `getSNorm(state)` | (x−α)/α = (1−w)/w | re-derive from τ profile (keep = spot moneyness) | **YES** (curve fn, already listed) |
| `tradeUpdate(s, dy)` | `dx=−αβ·dy/[(y−β)(y'−β)]` | τ goal-seek: `y'=y+dy`; solve `u'` from `Y₀e^{W(u')}=y'−β`; `x'=X₀e^{W(u')−u'}+α` | **YES** (curve fn, already derived) |
| bundle 2 legs → 1 tx | one `tradeUpdate(net dy)` | one `tradeUpdate(net dy)` | **NO** (path-independent, §2) |

So the **entire spread shortcut rides on top of the curve contract** and needs **zero new logic** — only
the two curve-touching functions already on the τ change-list (`getSNorm`, `tradeUpdate`) get their
τ-versions, both already derived + manager-verified in the companion note (incl. the closed-form
`W(u)=w_mid·u+(Δw/2)(√(τ²+u²)−τ)` ⇒ no quadrature; only a 1-D Newton inversion, exactly as v24 inverts
its quadratic). The composite ray, mark, `2sinh(δ)`, and the bundling all transfer untouched.

---

## 4. Caveats / flags (honest scope)

1. **Vertical spread (the shortcut) ≠ collar/band.** The shortcut bundles a *same-wing two-strike spread*
   via the composite ray (both strikes marked at the SAME entry `sNorm`, one push). The "neither-ITM"
   band branch (v24 L1997–2010) is a *different* object — a sold leg + a bought leg on possibly different
   wings — and runs **two sequential** `tradeUpdate`s because the 2nd leg is priced at the *moved* state
   (L2005 prices at `s_after_X`). That sequencing is a PRICING path-dependence (re-mark at the moved
   spot), NOT a state-update one; it is intentional and also unaffected by τ (each push is still one
   1-D move). Do not "bundle" the collar by netting its premiums — that would change the marks. **The τ
   reconciliation here is for the vertical-spread composite-ray shortcut specifically.**
2. **ITM legs settle-to-cash, no AMM swap** (L1973–1996) — unchanged by τ (intrinsic value, curve-free).
   Only the OTM (live) leg hits the AMM, and that leg is the one whose `tradeUpdate` becomes the τ
   goal-seek.
3. **`getSNorm` re-derivation is the one real swap task in the pricing path** — get it right (sNorm must
   stay the spot moneyness) and the whole pricing layer (mark, composite ray, vsValue, leg dispatch,
   wing-membership) ports without edits. This is the single point to test hardest on the swap.
4. **This is a readiness note, not the swap.** Actually editing v24's `<script>` (the surgical swap) is a
   future engine pass behind the file-safety gate — not done here. Curve/economic-object choice
   (whether to ship the τ-curve at all) stays operator-owned (Gate-2).

## Confidence ledger
- **CONFIDENT (50 dps verified):** composite-ray identity is a pure mark identity, curve-/τ-free
  (CHECK 1); bundle-2-into-1 state update is exact on the τ-curve via 1-D path-independence (CHECK 2);
  the shortcut needs zero new logic — only `getSNorm`+`tradeUpdate` get τ-versions (already derived).
- **CARE-POINT (not a failure):** `getSNorm` must be re-derived so `sNorm` stays the spot moneyness;
  the mark identity is exact for any `sNorm` but the *meaning* of `sNorm` must be preserved.
- **NOT done / operator-owned:** the actual engine swap (file-safety-gated future pass); whether to ship
  the τ-curve; the skew `Δw≠0` settlement fork (companion note §7.4) — all unchanged here.
