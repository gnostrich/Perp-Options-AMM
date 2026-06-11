# Global-skew goal-seek: is "local-slope goal-seek via one global skew σ" a weight-free third option?

_research-lead, 2026-06-11. Operator **entry 55/56** ("go"). **READ-ONLY (operator-pinned): NO engine
edit, NO git, NO build touch, NO Aristotle submission.** HEAD stays md5 `928cde1c`. Decision-support,
not a build. Direct follow-up to `POLAR_density_first_principles_2026-06-11.md` and its skeptic verdict
`notes/skeptic/VERDICT_POLAR_density_2026-06-11.md` (verdict #23). Tags: `[analytic]` derived, `[numeric]`
float64-checked. Script `/tmp/skew55.py` transcribed at the end._

> **Operator (entry 55, verbatim):** "1. what do you mean bounded or saturates , its going to be a map
> that preserves the asymptotes .... get that clear ... 2. you can still local-slope-goal-seek using
> global skew as a knob right... thats the point isnt it....3. agreed that monotone is important ..."

**Framing the operator pinned (point 1), honored throughout:** the object **PRESERVES THE ASYMPTOTES** —
no saturation, no premium floor. θ∈(0,π/2) is bounded but `u = ln tan θ` runs (−∞,+∞); the power-law
wings `value ∝ S^(−γ)` (γ₋, γ₊ both > 1) sit frozen AT the angle edges. Any construction that floors or
saturates the deep wings is disqualified, and is excluded here by construction.

---

## VERDICT IN ONE BREATH

**The operator's "one global skew σ" knob is NOT a third option. Made asymptote-preserving (his own
binding constraint), the only single global scalar that freezes both wings is a HORIZONTAL SHIFT of the
shoulder profile — which is *mathematically identical* to the (W) field-center φ (`/tmp/skew55.py`:
`gloc(u;σ) ≡ gloc(u−σ;0)`, residual 0.0).** So "global skew σ" and "local-φ recenter" are **one and the
same translation DOF.** Consequently:

- **Q1 strike-dependence: YES, but the wrong shape.** A global σ-shift reshapes the curve by a
  strike-dependent amount that **peaks at the elbow and decays to 0 in BOTH frozen wings** — "more warp
  at the elbow," NOT the path-A property "more warp further OTM at equal premium." The genuine path-A
  strike-dependence (more σ-move needed to hit an OTM slope target, scaling like the gearing 1/γ_loc′)
  *does* reappear — but it reappears **because σ = φ**, i.e. it is path-A, not a new mechanic.
- **Q2 weight-free through the trade: NO — impossible.** Hitting an *arbitrary* pre-trade local-slope
  target forces σ to be a **stored accumulator of cumulative reserve displacement** (`σ₁ = u_R1 − u_R0`,
  `/tmp/skew55.py` resid 0.0), which equals a memoryless reserve read `u_R1` **only when the pre-trade
  point sat at ATM** (`u_R0 = 0`). Away from ATM the two disagree by exactly `u_R0`. The goal-seek target
  is a function of the **pre-trade** state, so a memoryless σ = F(x,y) cannot encode it — **σ must carry
  history = an independent stored DOF = the weight back.** This is map-independent (also holds for a
  non-translation amplitude-skew).
- **Q3 monotonicity: PASS, not the binding gate.** For an up-skew field (γ₊>γ₋, both >1) a pure σ-shift
  only translates a monotone profile; `d ln p/du = 1 + γ_loc′/γ_loc ≥ 1 > 0` always (global min 1.0000
  over σ∈[−10,10]). The general guard `γ_loc + γ_loc′ > 0` bites only under a forced down-skew, which a
  translation cannot produce.
- **Q4 the divergence: SAME divergence, new clothes.** Because σ = φ, the gearing `1/γ_loc′ ~ u³ → ∞` in
  the frozen wing is **identical** to the local-φ recenter; the ~1.4× strike cap (entry-40,
  K_max ≈ 1.4·mp0 from |Δφ|≤τ) **returns unchanged.** Global-vs-local is cosmetic.
- **Q5 net: it collapses to A.** Weight-free AND strike-aware AND monotone is **not** achieved.
  It is **strike-aware + monotone but needs the stored scalar = path A** (the operator's already-chosen
  mechanic), re-derived. The single hardest obstruction is unchanged from the prior note and confirmed by
  the skeptic's failed search: **a memoryless reserve→σ map cannot restore a pre-trade slope target,
  because the target depends on pre-trade state that a memoryless read does not carry.**

---

## 1. THE OBJECT, MADE PRECISE — the asymptote-preserving global-skew family `[analytic]`

Carry-normalised log-price ray `u = ln(y/x) = ln tan θ` (θ=45° ⟺ ATM ⟺ u=0). Local value-law exponent
γ_loc(u); price `p(u) = γ_loc(u)·e^u` (the (W) `getMP_raw` form); value `∝ S^(−γ_loc)`. Frozen wings:
γ_loc → γ₋ (u→−∞), γ₊ (u→+∞), both > 1.

**The single global scalar σ ("global skew as a knob"), constrained to PRESERVE THE ASYMPTOTES:**

> **γ_loc(u; σ) = γ₋ + (γ₊−γ₋)·S( κ(u − σ) ),  S(z) = ½(1 + z/√(1+z²))** (√-kernel shoulder)

σ shifts the elbow center along u. For **any finite σ**, S→1/0 as u→±∞ ⇒ wings frozen at γ₊, γ₋
(`/tmp/skew55.py`: γ_loc(±40) = 3.1998…/1.8002… for σ ∈ {−2, 0, +2}). **This is the unique single global
scalar that is asymptote-preserving**: a level/amplitude knob would move the wing values; a pure shift
does not. So the operator's "global skew" object, taken literally and made asymptote-preserving, **is the
shift σ — and the shift of a fixed shoulder profile is exactly the (W) field-center φ.**

**The identity (load-bearing) `[numeric, resid 0.0]`:** `γ_loc(u; σ) ≡ γ_loc(u−σ; 0)` and likewise the
(W) field `w(u;φ) ≡ w(u−φ;0)` ⇒ **σ and φ are one translation DOF, expressed in γ_loc-space vs
weight-space.** The operator's proposal is **not a new mechanism**; it is path-A's φ under a new name.

---

## 2. Q1 — STRIKE-DEPENDENCE `[analytic + numeric]`

**Two distinct strike-dependences; only one is the operator's "more warp further OTM at equal premium."**

**(a) Reshape of a global σ-shift is elbow-peaked, NOT OTM-growing.** Shifting σ by a fixed amount (a
fixed reserve move, i.e. fixed premium) moves the curve by `Δln p(u_K)` that **peaks at the elbow and
→0 in both frozen wings** (`/tmp/skew55.py`, du=0.3):

```
u_K:    -2.0     -1.0     0.0      +1.0     +2.0     +3.0
Dln(p): -0.0085  -0.0303  -0.0839  -0.0317  -0.0073  -0.0024
```

This is "more warp at the elbow," the **opposite** of the operator's "more warp further OTM" — because a
global shift has *one* handle shared by all strikes and the frozen wings kill its leverage out there.

**(b) The path-A strike-dependence DOES reappear — because σ = φ.** If the goal-seek must restore the
**slope at the trade point** u_tp (path A), the required σ-move scales with the strike: in the symmetric
limit the reflect-branch gives σ₁ ≈ 2·u_tp (`/tmp/skew55.py`), i.e. **bigger further OTM** — the property
A wanted. **But this is identically the path-A trade-point warp** (it needs σ = φ to grow like the gearing
1/γ_loc′(u_tp); see Q4), and the reflect-branch is a gross global reshape (it flips the elbow to the far
side of u_tp), not a clean local OTM bend.

**Q1 answer: YES strike-dependent — but the *useful* (OTM-growing) strike-dependence is path-A's, not a
new property of a "global" framing.** A genuinely global single-shift, at equal premium, warps the elbow,
not the wings.

---

## 3. Q2 — WEIGHT-FREE THROUGH THE TRADE (the crux) `[analytic + numeric]`

**Setup (path-A goal-seek):** pre-trade field skew σ₀, reserve at u_R0, local slope there
`s* := d ln p/du |_{u_R0} = slope(u_R0; σ₀)`. A cash leg moves the reserve to u_R1. The "warp instead of
slide" goal-seek demands the **post-trade local slope at the (moved) point equal the pre-trade slope:**
`slope(u_R1; σ₁) = s*`.

**The slope is a fixed profile in the single variable (u − σ):** `slope(u;σ) = SLOPE_SHAPE(κ(u−σ))`, a
bump → 1 on both wings, peak ≈ 1.284 near center (`/tmp/skew55.py`). So the goal-seek
`SLOPE_SHAPE(κ(u_R1−σ₁)) = SLOPE_SHAPE(κ·u_R0)` has the offset-preserving solution

> **σ₁ = u_R1 − u_R0 = (the cumulative reserve displacement), resid 0.0** `[analytic, numeric]`

**σ₁ is the displacement, NOT the current reserve read u_R1.** A genuinely weight-free map needs
σ = F(x,y) (a function of CURRENT reserves alone, no history). The memoryless read is σ = u_R1. These
coincide iff `u_R1 − u_R0 = u_R1` ⟺ **u_R0 = 0 (pre-trade point at ATM).** Away from ATM they disagree by
exactly u_R0, and the memoryless read FAILS to restore the slope:

```
u_R0:  -1.5    -0.5    0.0     +0.5    +1.5     (du=0.3)
sigma_target  : +0.30  +0.30  +0.30  +0.30  +0.30   (= du, the displacement)
sigma_read u_R1: -1.20  -0.20  +0.30  +0.80  +1.80   (memoryless)
gap (=u_R0)    : -1.50  -0.50  +0.00  +0.50  +1.50
slope restore resid (memoryless): 0.218 0.051 0.000 0.102 0.241   (=0 only at ATM start)
```

**The impossibility argument (map-independent) `[analytic]`:** the goal-seek target s* is the **pre-trade**
slope. A memoryless σ = F(x,y) determines the post-trade slope at every u purely from current reserves; it
contains **no information about the pre-trade state.** The constraint couples post-state to pre-state, so σ
must carry the pre-trade slope value = **history = an independent stored DOF.** This holds for ANY
single-scalar skew, not just the shift: a non-translation amplitude-skew `s·tanh(κu)/cosh²(κu)` (odd,
asymptote-preserving) gives the same verdict — and is in fact *more* restricted (it often cannot reach the
target slope at all; brentq finds no root, `/tmp/skew55.py`).

**Q2 answer: NO weight-free A-compatible map exists.** The stored σ is the (W) field-center φ / the
weight in disguise. **This confirms the prior note's crux and the skeptic's failed search** (verdict #23:
"attacked for a weight-free A-compatible map and could not find one") — and now upgrades it from "could
not find" to **a structural impossibility**: the target lives in the pre-trade state, which a memoryless
reserve read does not carry.

---

## 4. Q3 — MONOTONICITY `[analytic + numeric]`

Price `p = γ_loc·e^u` strictly increasing ⟺ `d ln p/du = 1 + γ_loc′/γ_loc > 0`; the general guard is
**`γ_loc + γ_loc′ > 0` for all u.**

For an **up-skew** field (γ₊>γ₋, both > 1) the √-kernel blend is monotone increasing ⇒ γ_loc′ ≥ 0 ⇒
`1 + γ_loc′/γ_loc ≥ 1 > 0` always. A global σ-shift only **translates** this monotone profile, so it can
never break monotonicity: `min_{σ,u}(d ln p/du) = 1.0000` over σ∈[−10,10], u∈[−15,15] (`/tmp/skew55.py`).

**Where the guard bites:** only if the goal-seek forces a **down-skew** (γ_loc′ < −γ_loc somewhere) — i.e.
demands γ_loc decreasing steeply enough that price turns over. A pure shift of an up-skew field cannot do
this. So **Q3 PASS** — monotonicity is satisfied and is *not* the binding obstruction for the global-σ
mechanic (the binding one is Q2). The guard `γ_loc + γ_loc′ > 0` is the same arbitrage condition the prior
note flagged; it bites under aggressive down-tilt, not under the operator's asymptote-preserving shift.

---

## 5. Q4 — THE MAP-INDEPENDENT DIVERGENCE `[analytic + numeric]`

Established (entries 40–42, manager+skeptic): frozen wing ⟺ blend′→0 ⟺ gearing 1/(blend′)→∞ for **any**
map. Does a global-σ knob change the character vs a local-φ recenter? **No — because σ IS φ** (§1
identity). The gearing `G(u) = 1/γ_loc′(u)` (how hard a σ-move must push to move the local slope at strike
u) at OTM strikes (`/tmp/skew55.py`):

```
u_K:        0     1      2       3       4        5
gloc'(u):  0.70  0.247  0.0626  0.0221  0.00999  0.00528
1/gloc':   1.43  4.04   15.97   45.2    100.1    189.4
```

γ_loc′ ~ (γ₊−γ₋)·κ/2·(1+z²)^(−3/2) ~ **u⁻³** in the wing ⇒ gearing ~ **u³ → ∞**. **Identical power-law
blow-up to the local-φ recenter.** The ~1.4× strike cap (entry-40, K_max ≈ 1.4·mp0 from |Δφ|≤τ, with the
outer limit ≈ 1.7·mp0 at |Δφ|≤1) **returns unchanged.** Using a "global skew" framing instead of a "local
recenter" framing is **cosmetic — same divergence in new clothes, same cap.**

---

## 6. Q5 — NET VERDICT

The operator's mechanic is **not a genuine third option.** It **collapses to A**:

- It is **strike-aware** (the useful OTM-growing strike-dependence reappears) — but only *as path A*,
  because σ = φ.
- It is **monotone** (Q3 pass).
- It is **NOT weight-free**: restoring an arbitrary pre-trade local-slope target forces σ to be a stored
  accumulator of displacement = the (W) field-center φ = the weight in disguise (Q2, impossibility).

So of the three target properties {weight-free, strike-aware, monotone}, the global-σ knob delivers
**strike-aware + monotone (= path A), but forfeits weight-free** — exactly the A-vs-B tension the prior
note and the skeptic landed on. It does **not** collapse to B (B is weight-free + global + strike-blind +
bounded-at-the-elbow); the operator's object is the opposite face (strike-aware + stored-scalar).

**The single biggest open obstruction (unchanged, now upgraded to a structural impossibility):** a
memoryless reserve→σ map cannot restore a *pre-trade* local-slope target, because the target is a function
of the pre-trade state, which a current-reserve read does not carry. Weight-elimination therefore still
requires **B (spot/reserves-anchored, slope-target = u_R itself, no goal-seek-to-history)**; the
goal-seek-to-a-prior-slope mechanic the operator describes IS path A and necessarily carries the stored
scalar.

**This is an operator-tier call, flagged not decided:** does the venue want **A** (strike-aware
goal-seek warp, with the stored φ/σ scalar that the operator has already chosen in entry 38), or **B**
(weight-free, impact-by-size, strike-blind execution)? The "global skew σ" framing does not create a way
to have A's strike-awareness without A's stored scalar — those are the same object.

---

## 7. ANSWERS TO THE FIVE (crisp yes/no)

1. **Strike-dependent warp from goal-seeking one global σ to a local slope target?** **YES, but split:**
   a pure global σ-shift at fixed premium warps the **elbow** (decays in both wings — not OTM-growing);
   the OTM-growing strike-dependence the operator wants reappears only as **path A** (because σ = φ),
   geared by 1/γ_loc′(u_tp).
2. **Genuinely weight-free THROUGH the trade?** **NO — impossible.** σ₁ = (cumulative displacement) ≠
   memoryless reserve read except at ATM start; the goal-seek target lives in the pre-trade state, which
   a memoryless σ = F(x,y) cannot carry. The stored σ = φ = the weight in disguise. (Map-independent;
   confirms + upgrades the skeptic's failed search to a structural impossibility.)
3. **Monotone across the operating range?** **YES (PASS).** For up-skew (γ₊>γ₋>1) a σ-shift keeps
   `d ln p/du ≥ 1 > 0`; general guard `γ_loc + γ_loc′ > 0` bites only under a forced down-skew, which a
   translation cannot produce. Not the binding obstruction.
4. **Does global-σ change the character of the frozen-wing divergence?** **NO.** σ ≡ φ ⇒ gearing
   1/γ_loc′ ~ u³ → ∞ identically; the ~1.4× strike cap returns unchanged. Same divergence, new clothes.
5. **Genuine third option (weight-free AND strike-aware AND monotone)?** **NO.** It **collapses to A**
   (strike-aware + monotone, but needs the stored scalar). Not B. Hardest obstruction: the memoryless
   reserve→σ map cannot encode a pre-trade slope target.

---

## Honest carry

Theory/decision-support only — **NOT** a build authorization, **NOT** a curve-swap proposal. HEAD stays
md5 `928cde1c`. **Nothing submitted / built / edited / committed.** No clean Lean lemma crystallised that
is ready to submit (the σ≡φ translation identity and the `γ_loc+γ_loc′>0` monotonicity guard are candidate
obligations only *after* the operator picks the mechanic — and both are already covered by the open (W)
path-A obligations: the (α,β)-flow lemma `[needs-Aristotle]`/OPEN and warp∘rebase-commute/φ-funding OPEN;
premature to pin a new one). The A-vs-B / weight-elimination fork remains operator-tier — flagged, not
decided. Self-adversarial: I have NOT elevated an elegant theorem over the operator's mechanic question —
the answer to "can I local-slope-goal-seek using global skew" is addressed head-on (it equals path-A's φ;
it works as A; it is not weight-free). Manager re-derives + routes through the skeptic before relaying to
the operator. Expect a mandatory skeptic pass.

---

## Script (transcribed)

`/tmp/skew55.py` — asymptote-preserving global-skew family `γ_loc=γ₋+(γ₊−γ₋)S(κ(u−σ))`; wing-freezing for
any σ; Q1 strike-dependent elbow-peaked reshape + trade-point reflect-branch (2·u_tp); Q2 goal-seek
σ₁=u_R1−u_R0 (resid 0.0), memoryless-read failure away from ATM, impossibility argument, amplitude-skew
steelman; Q3 monotonicity scan (min 1.0000); Q4 gearing 1/γ_loc′ ~ u³ at OTM strikes; final σ≡φ
translation identity (resid 0.0, our field and the (W) field).
