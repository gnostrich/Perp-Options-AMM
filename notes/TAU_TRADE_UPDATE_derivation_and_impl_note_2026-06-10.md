# τ-generalized transaction state update — derivation + implementation note

_2026-06-10, research-lead. TWO-PHASE deliverable for the operator's other implementation session.
**Phase 1** derives the τ-generalized trade mechanics (the curve-warp-on-trade) starting from the v24
Balancer build; **Phase 2** is the migration/implementation note ("start from v24, keep everything,
add the single kurtosis knob τ"). All numerics: mpmath, 50–60 significant digits, by direct
construction — not formula-arguing. Confident vs conjectural marked inline. **No engine edits, no
Aristotle submits, no git** (the manager commits, re-derives, audits)._

Grounded in: `engine/builds/reference/temporal_mvp_v24_rebase_fixed.html` (v24 mechanics, read and
verified byte-accurate against the manager's extraction — lines 1593–1647), `paper/temporal_paper_draft.md`
(Conservation Law §73, Trade Formula §79, Strike Normalisation §101), `notes/KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md`
(the τ-knob, knob renamed κ→τ), `engine/knowledge/GH_MATH.md`. `τ ≡ GH kernel scale δ` exactly.

---

## 0. HEADLINE — the load-bearing structural finding (CONFIDENT, numerically pinned)

> **v24 is a SINGLE constant-product pool in offset coordinates, and its `w = α/x` is a
> PRICE-COORDINATE, not a variable-γ wing structure.** On the floors `(α,β)`, the v24 conservation
> law `(x−α)(y−β) = αβ` is **`X·Y = αβ`** with `X = x−α, Y = y−β` — a rectangular hyperbola, i.e. a
> 50/50 constant-product on the offsets (`γ_offset = 1`; asset leg `X ∝ S^(−1/2)`). The full-reserve
> "weight" `w = α/x` *does* vary with trades (0.5 → 0.529 on a +50k cash trade — verified), but that
> variation is the floor `(α,β)` shifting the origin, NOT a finite power-law wing family. v24's
> implied weight profile is exactly **`w_v24(u) = sigmoid(u/2)`** with wings `w_− = 0, w_+ = 1` (so
> `γ_loc = w/(1−w) → 0` and `→ ∞` — degenerate wings, the constant-product object). This is the same
> price-coordinate-vs-slope gotcha that GH_MATH.md §"getMP_raw ≠ slope" warns about, surfacing in v24.

**Consequence for the τ-generalization (the design pivot):** the τ-knob's variable-γ content lives in
**`Δw = w_+ − w_− ≠ 0`** (genuine, finite, asymmetric power-law wings — the GH curve). v24 is the
`Δw = 0`, `w_mid = 1/2` slice. So:
- The right place to put τ is on the **offset depletion slopes** (`X`,`Y` vs the latent `u`), where
  the v24 constant-product is the `w(u) ≡ 1/2` case. **Do NOT** try to perturb v24's full-reserve
  `w = α/x` directly — that is the price coordinate, and bending it is the slippage-bug shape.
- For the **v24 slice itself** (`w_− = w_+ = 1/2`), **τ does literally nothing** — `w(u) ≡ 1/2` for
  every τ (verified: `w(±5) = 0.5` at τ = 0.1 and τ = 1e6). So adding τ is **safe by construction on
  the current pool**: until you also free `Δw`, the curve is byte-identical to v24 at every τ.

> **FLAG (confident): no clean algebraic single-τ invariant `F(x,y;w,τ) = k` exists** that (i) reduces
> to v24's `(x−α)(y−β) = αβ` and (ii) rounds the elbow while keeping finite power-law wings. Verified:
> no fixed `X^a·Y^(1−a) = k` is conserved along a finite-τ curve (`a = 0.6/0.7/0.8` all drift across
> `u = −3,0,3`). The implementable form is **local-weight evaluation + numeric inversion** (exactly the
> GH engine's same-table-inversion construction — and it gives FP-exact round-trips, verified). This
> matches the prior kurtosis note's "form (b)" finding; I do **not** force a false closed form.

---

## PHASE 1 — the τ-generalized transaction state update

### 1. State (CONFIRMED — τ is a fixed protocol scalar)

> **τ is a FIXED protocol scalar, NOT moved by trades** — exactly like v24's funding elasticity
> (`state.kappa` in v24) and like `δ = 0.08` in the live GH engine. The dynamic state stays v24's
> **`{x, y, α, β}`** (floors `α,β` fixed). What augments the scalar `w` is the **weight PROFILE**
>
>     w(u) = w_mid + (Δw/2)·u/√(τ² + u²),   w_mid = (w_− + w_+)/2,  Δw = w_+ − w_−,
>
> a fixed function of the latent `u = log(marginal) − log P` (`P` the carry). The three profile
> scalars `(w_−, w_+, τ)` are protocol constants set at calibration. v24's single scalar `w` is
> replaced by "evaluate `w(u)` at the current position's `u`."

The serialized pool gains three scalars `(w_−, w_+, τ)` (or equivalently `(w_mid, Δw, τ)`). Everything
else in the state is v24's.

### 2. Conservation law (the τ-analog of `α = xw, β = y(1−w)`)

In v24, `(α, β)` are conserved per trade and confine states to `X·Y = αβ`. The τ-analog:

> **What is invariant under a trade:** the floors `(α, β)` AND the profile `(w_−, w_+, τ)`. Trades move
> `(x, y)` along the **single τ-deformed curve** `X(u), Y(u)` defined (constructively, engine-native) by
> the **offset depletion slopes**
>
>     d log X / du = −(1 − w(u)),   d log Y / du = +w(u)            (DEF)
>
> i.e. "at each latent `u`, take an infinitesimal Balancer step at the *local* weight `w(u)`."
> Integrating: `log X(u) = log X_ref − ∫ (1−w) du`, `log Y(u) = log Y_ref + ∫ w du`. The
> marginal (geometric slope) is `m(u) = −dY/dX = (w(u)/(1−w(u)))·(Y(u)/X(u))` — the **local** Balancer
> slope law. **The τ-deformed trajectory is this curve; the invariant replacing `X·Y = αβ` is the
> level set carrying `X(u), Y(u)`, which for finite τ has no closed algebraic form** (§0 flag) and is
> pinned numerically by `u`. At `Δw = 0, w_mid = 1/2` the integral gives `X·Y = const` — **exactly
> v24**.

### 3. Trade-update — THE curve-warp-on-trade (the crux)

Parametrise by the cash leg `Δy` (v24's convention). The τ-deformed `tradeUpdate(s, Δy)`:

    y' = y + Δy
    u' = solve_u( Y(u') = y' − β )        # invert the Y-side integral for the new latent u
    x' = X(u') + α                        # set x from the X-side integral at u'
    return {x', y', α, β}  (+ the fixed profile scalars)

This is identical in *shape* to v24's `tradeUpdate` ("add `Δy` to `y`, solve `u` from the Y side, set
`x` from that `u`" — GH_MATH.md's description of the GH `tradeUpdate`, and v24's own
`y' = y+Δy; dx = −αβ·Δy/[(y−β)(y'−β)]`). The difference is *where the elbow warps the joint*: the
`X(u)/Y(u)` integrals carry the local `w(u)`, so a trade through ATM redistributes reserves with the
rounded vertex instead of the bare constant-product corner.

**Reduction to v24 (`τ → ∞`):** `w(u) → w_mid` constant; for `w_mid = 1/2` the integrals give
`X(u) = X_ref·e^(−u/2)`, `Y(u) = Y_ref·e^(+u/2)`, so `X·Y = X_ref·Y_ref = αβ` and inverting the Y-side
for `u'` then setting `x' = X(u')+α` yields **exactly** `dx = −αβ·Δy/[(y−β)(y'−β)]`.

> **NUMERIC (CHECK 1, 60 dps) — τ→∞ == v24 tradeUpdate, byte-level.** Baseline `x=10, y=8e5, α=5,
> β=4e5`. For `Δy ∈ {+50000, −120000, +250000}` the τ-update (τ = 1e12) and the v24 closed form agree
> with **|Δx| error = 0.0** (`x' = 9.444…/12.142…/8.076…`); marginal at `u₀` = 80000.0 both ways.
> **Confident.**

### 4. Marginal price — `getMP_raw` with the local weight

    getMP_raw(state) = m(u_spot) = (w(u_spot)/(1−w(u_spot)))·(Y(u_spot)/X(u_spot)),   u_spot ↔ state.

`u_spot` is pinned by the reserves: invert the Y-side integral, `Y(u_spot) = y − β` (equivalently the
X-side). This is well-defined because `d log Y/du = w(u) > 0` ⇒ `Y(u)` is strictly monotone ⇒ the
inversion is unique. At `τ → ∞, w_mid = 1/2` this collapses to v24's `getMP_raw = α·y²/(β·x²)`
(= `(w/(1−w))(y/x)` with `w = α/x`) — verified 80000.0 at baseline.

### 5. arbitrageToOracle + rebase (τ-versions)

- **arbitrageToOracle(s, oracle):** find `u*` with `m(u*) = oracle` (the marginal is strictly
  monotone in `u` ⇒ unique root), then the state is `x* = X(u*)+α, y* = Y(u*)+β`. v24's closed form
  `x_eq = α + √(αβ/oracle), y_eq = β + √(αβ·oracle)` is the `τ→∞, w_mid=1/2` special case; finite τ
  replaces it with the monotone numeric root (one `findroot`, same cost class as the GH engine's arb).
- **rebase (τ-INVARIANT — CONFIRMED).** v24's rebase is `x→r·x, α→r·α, β,y,w invariant`. In offset
  terms `X→r·X`. Then `m = (w/(1−w))·Y/X → m/r` (marginal scales by exactly `1/r`), `u → u − log r`,
  and **the profile `(w_−, w_+, τ)` is untouched** — the elbow shape is identical. τ is kernel-
  orthogonal to rebase, exactly as the kurtosis note's PH-6/`sNorm_rebase_invariant` transfer asserts.

> **NUMERIC (CHECK 4).** `X→r·X` (r = 1.25) scales the marginal by exactly `1.25`; `τ, w_−, w_+`
> unchanged. **Confident.**

### 6. Numeric checks (mpmath, 50–60 dps; raw kept in my context)

- **C1 — τ→∞ == v24 EXACTLY** (tradeUpdate |Δx|err = 0.0 over three trades; marginal 80000.0;
  arb/rebase reduce to v24 closed forms). ✓ **Confident.**
- **C2 — finite-τ warps the ATM elbow, wings stay power-law (asymptote intact, τ-independent).** With
  genuine wings `w_− = 0.6, w_+ = 0.8` (`γ_− = 1.5, γ_+ = 4`): deep-wing `γ_loc(±100τ)` is
  **byte-identical** across `τ ∈ {0.1, 1, 30}` (3.9998750125 / 1.50003124805); the ATM sharpness
  `w'(0) = Δw/(2τ)` runs `1.0 / 0.1 / 0.00333`; wing depletion slopes → `−(1−w_±), +w_±` (e.g.
  `−0.39999, +0.79999` at `u = +40`). The vertex rounds; the wings don't move. ✓ **Confident.**
- **C3 — round-trip (trade then reverse) returns the state, no τ-induced leakage.** For `τ ∈ {0.3, 2}`,
  `+Δy` then `−Δy`: **x err = y err = u err = 0.0** (same-table inversion ⇒ FP-exact, mirroring the
  GH engine's round-trip property). ✓ **Confident.**
- **C4 — rebase τ-invariant** (§5). ✓ **Confident.**
- **C5 — no clean algebraic invariant for finite τ:** no fixed `X^a·Y^(1−a) = k` conserved
  (`a = 0.6/0.7/0.8` all drift across `u`). ✓ **Confident (structural).**

**No closed form was forced.** The honest implementable form is **local-weight integration + numeric
inversion** (the engine's same-table construction). It is FP-exact on round-trips and reduces to v24's
algebra at τ→∞.

---

## PHASE 2 — implementation note (for the other session)

**Thesis: start from v24 (Balancer, scalar `w`), keep EVERYTHING intact, add the single kurtosis knob
`τ`. The safety net is `τ → ∞ = v24`, byte-for-byte, on the current pool.**

> **⚠ READ THIS FIRST — what the migration actually is (avoid the scalar-swap mirage).** This is **NOT
> "vary the scalar `w`"** — you cannot get kurtosis by putting a different number into v24's `w = α/x`.
> v24's `w` is a **price coordinate** of a single constant-product pool (`X·Y = αβ`, §0); changing it
> just slides along the same constant-product curve (zero excess kurtosis, by construction). The
> migration is **generalize the CURVE from Balancer to GH by making the weight POSITION-DEPENDENT**:
> `scalar w` → `profile w(u)` on the offset depletion slopes (§2). That turns the constant-product
> corner into the GH rounded elbow — a genuinely different, non-monomial curve. The kurtosis lives in
> the *shape of the elbow* (`τ`) and the *wing asymmetry* (`Δw`), never in a scalar value of `w`.

### What stays IDENTICAL (migrate verbatim)
- **Settlement boundary** `S* = Kγ/(γ+1)` (smooth-pasting): algebraic in `γ` only, **τ-free**. The seam
  gate is τ-invariant.
- **`value ∝ S^(−γ)`** in each wing: preserved for all τ (the wings are exact constant-weight Balancer;
  the elbow only changes the vertex — C2).
- **No-arb-at-symmetry** (w = ½ anchor): unchanged. τ is orthogonal to the symmetry; the no-costless-
  collar argument operates on the symmetric anchor, which τ does not move.
- **Origin-perp / band / carved-slice settlement**, the two-scalar (closing-equity, L₀) machinery,
  premium-neutral band open, the effective-strike close: all **above** the curve contract — untouched.
- **rebase** (τ-invariant, §5) and **funding** (`fundingPerStrike` keys on the per-ray pool-vs-anchor
  deviation; τ does not enter it — and note v24's `state.kappa` is the FUNDING elasticity, see warning).

### What CHANGES
1. **The weight scalar → profile.** v24's `getW(s) = α/x` (a scalar) becomes "evaluate `w(u)` at the
   state's latent `u`," with `w(u) = w_mid + (Δw/2)·u/√(τ²+u²)`. Add `(w_−, w_+, τ)` to the serialized
   scalars.
2. **The τ-deformed conservation + trade-update (Phase 1 §2–3).** Replace v24's closed-form
   `dx = −αβ·Δy/[(y−β)(y'−β)]` with: `y' = y+Δy`; solve `u'` from the Y-side integral; `x' = X(u')+α`.
   Same *shape* as v24 (and as the GH engine's `tradeUpdate`), elbow in the integrals.
3. **The 4 curve fns** (`getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`): `getMP_raw` and
   `arb` become monotone numeric inversions/roots on `m(u)` (rebase stays structural, τ-invariant). Keep
   the GH engine's **direct upper-tail integrals** and **same-table inversion** (FP-exact round-trips);
   this *is* the existing GH machinery with the frozen `δ` un-frozen to `τ`.
4. **`getSNorm`, `getDepth`:** `getSNorm` carries convexity (curve-shape) — re-derive from the profile;
   `getDepth` is display-only/stale (note: under variable-w there is no single `k`, consistent with the
   paper's "`k` is not a depth measure on its own" §95–99).

### The `τ`-vs-`kappa` NAME WARNING (load-bearing)
> v24's `state.kappa` is the **FUNDING elasticity** (feeds `fundingPerStrike` — verified at v24 line
> 2083). It is **NOT** kurtosis. The kurtosis knob MUST be a **separate** scalar named `τ` (≡ GH `δ`).
> **Do not reuse `kappa`.** Two distinct fixed scalars coexist: funding-elasticity (`kappa`, existing)
> and kurtosis (`τ`, new).

### The migration safety net
> **`τ → ∞` = v24, byte-for-byte (C1).** Ship τ initialized large (or with `Δw = 0`) and the build is
> v24. Dial τ down to introduce the elbow only after the v24-equivalence gate passes at large τ. On the
> current `Δw = 0` pool, τ is inert at *every* value — adding the scalar cannot regress v24.

### Operator-owned calls (FLAG — derive + recommend, do not decide)
1. **Whether to ship the τ-knob at all** — reopens the locked GH curve/economic-object (Gate-2).
2. **Skew `Δw ≠ 0` is the SETTLEMENT FORK.** The clean single-τ knob holds `(w_−, w_+)` fixed and dials
   only τ. Freeing `Δw` (independent wing weights) makes both eigenfunctions `S^(±γ_±)` live = the
   two-root / `βh = 0` settlement-semantics change. The current single-γ put-only engine is the
   `w_− = w_+` slice. **τ is orthogonal to and does not touch this fork** — safe to ship τ with skew
   held at the current setting. Freeing skew is a separate, settlement-touching, operator-owned move.
3. **The exposed direction / label.** Expose `1/τ` as "tail-fatness" of the latent return driver
   (object L: small τ = leptokurtic/fat). **Do NOT ship "τ up = fatter" — it is backwards.** The
   pushforward-liquidity reading (object P) runs the opposite sign; the exposed label names an object
   and is the operator's call (per the kurtosis note §4/§7.3).

---

## Manager independent verification (2026-06-10)
Manager re-derived the load-bearing claims from scratch (mpmath, 60 dps, own integration of the
`X(u),Y(u)` offset-depletion slopes + own root-finding trade-update — not re-running research-lead's
script). **All reproduce:** (CHECK 0) v24 `X·Y=αβ=2e6` conserved byte-exact through a +50k trade while
`w=α/x` drifts 0.5→0.529 (confirms `w` = price coordinate, not conserved wing structure); (CHECK 1)
τ→∞ `tradeUpdate` matches v24 closed form `|Δx|err = 0.0` for Δy∈{+50k,−120k,+250k}, marginal 80000.0;
(CHECK 2) finite-τ `γ_loc(±100τ)` byte-identical 3.9998750125 / 1.50003124805 across τ∈{0.1,1,30} with
`w'(0)=Δw/(2τ)` = 1.0/0.1/0.0033 (genuine GH elbow: wings fixed, vertex warps); (CHECK 3) round-trip
x/y err = 0.0; (CHECK 4) rebase scales marginal by exactly 1/r=1.25, profile untouched; (CHECK 5) no
`X^aY^(1−a)=k` invariant (24–76% drift). The τ→∞=v24 reduction also re-derived analytically
(`w≡½ ⇒ X=X₀e^{−u/2}, Y=Y₀e^{u/2} ⇒ X·Y=αβ ⇒ dx=−αβΔy/[(y−β)(y'−β)]`). **trusted-from-derivation,
manager-confirmed.** Curve/economic-object choice remains operator-owned.

## Confidence ledger
- **CONFIDENT (numerically verified, 50–60 dps):** v24 = offset constant-product, `w = α/x` is the
  price coordinate (§0); τ is a fixed scalar, dynamic state stays `{x,y,α,β}` + profile (§1); the
  τ-deformed conservation/trade-update via local-weight integration + Y-side inversion (§2–3);
  `τ→∞ = v24` byte-level on tradeUpdate/marginal/arb/rebase (C1, C4); finite-τ elbow warp with
  τ-independent power-law wings (C2); FP-exact round-trip, no leakage (C3); no clean algebraic invariant
  (C5); rebase τ-invariant (§5).
- **NO clean closed form exists for finite τ** — implementable form is local-weight integration +
  numeric inversion (the GH engine's construction). Honest, not a shortfall.
- **CONJECTURAL / operator-owned:** whether to ship; the skew `Δw ≠ 0` settlement fork; the exposed
  knob label/direction; the paper's "log/exponential-curve invariant" = τ→0 Laplace identification
  (math confident, author-intent a wording call). No Lean re-instantiation attempted (derivation pass).
