# BUILD NOTE — generalize v24 → the τ-kurtosis curve (for the implementation session)

_2026-06-10, manager. The single actionable note. Consolidates two manager-verified derivation notes:
`TAU_TRADE_UPDATE_derivation_and_impl_note_2026-06-10.md` (the curve + trade-update + closed form) and
`SPREAD_SHORTCUT_tau_reconciliation_2026-06-10.md` (the composite-ray spread shortcut). All math here is
manager-re-derived + numerically verified (mpmath, 50–60 dps). **This is a readiness note + build plan;
the actual engine edit is a file-safety-gated pass not yet done. Curve/economic-object choice is
operator-owned (Gate-2).**_

---

## 1. READINESS — what's done, what remains (read this first)

**DONE + manager-verified (drop-in ready):**
- The τ-curve in **closed form** (no quadrature): `W(u)=w_mid·u+(Δw/2)(√(τ²+u²)−τ)`; `X(u)=X₀e^{W−u}`,
  `Y(u)=Y₀e^{W}`. Single implicit eq `X·Y=X₀Y₀·exp[(2w_mid−1)u]·exp[Δw(√(τ²+u²)−τ)]`.
- All four curve fns in τ-form (§3): `getMP_raw`, `tradeUpdate` (goal-seek), `arbitrageToOracle`,
  `rebase` (τ-invariant). `τ→∞` reproduces v24 **byte-exact** (`|Δx|err=0.0`).
- `getSNorm=(x−α)/α` and `getDepth`: **curve-independent, port verbatim** (verified).
- The **vertical-spread shortcut** (composite ray θ*=√(θ_i θ_o), `V=N·mark(θ*)·2sinh(δ)`, one tx):
  **curve-agnostic, ports verbatim**; effective notional `N·2sinh(δ)`; bundle-into-1-tx path-independent.
- Strike registration `θ=getSNorm(arbitrageToOracle(K))`: monotone, reduces to v24, crossover at K.

**REMAINING (genuine, honest):**
1. **Calibration map** — `(pool floors α,β; X₀,Y₀ anchor; wing exponents γ_±; τ)`. Not derived here;
   **template exists** = HEAD's `ghCalibrate(X0,Y0,mp0,γ)`. MEDIUM task.
2. **THE STRATEGIC FORK (operator/architecture — see §6):** τ is **inert unless the wings are finite
   and distinct** (`Δw≠0`). An *active* τ ⟹ a genuine GH curve ⟹ **this is essentially the HEAD v26c GH
   curve, which already exists and is proven** (δ=0.08). So the real choice is **port HEAD's GH curve
   fns into v24 and expose δ→τ** (reuse proven code) **vs. implement the weight-profile form fresh.**
   Both realize the identical curve. **Flag to operator — do not pick unilaterally.**
3. **Wing setting** `(w_−,w_+)` beyond the engine's `(γ,γ+1)` = the **settlement fork** (operator-owned).
4. Minor: funding's γ-choice when wings differ; `getDepth` has no single `k` under variable w (display).

> **Bottom line:** the *curve mechanics and the spread shortcut are complete and verified.* What's left is
> calibration + two operator-owned decisions (build-path reuse-vs-reimplement, and the wing/settlement
> setting). **An active τ means you are building the GH curve — which HEAD already has.**

---

## 2. The curve (single expression)

    u = log(marginal price) − log P            (P = carry; latent log-price)
    w(u) = w_mid + (Δw/2)·u/√(τ²+u²)           w_mid=(w_−+w_+)/2, Δw=w_+−w_−
    W(u) = w_mid·u + (Δw/2)·(√(τ²+u²) − τ)      (the integral CLOSES — no quadrature)
    X(u) = X₀·e^{W(u)−u},   Y(u) = Y₀·e^{W(u)}   (offsets; x=X+α, y=Y+β)

`γ_loc(u)=w(u)/(1−w(u))` is the local value-law exponent; wings → `γ_± = w_±/(1−w_±)` (τ-independent);
`τ` = ATM elbow sharpness (`w'(0)=Δw/(2τ)`). τ→∞ ⇒ Balancer (Gaussian); τ→0 ⇒ Laplace. `τ ≡ GH δ`.

---

## 3. The engine functions — verbatim vs τ-version

| fn | port verbatim? | τ-form |
|---|---|---|
| `getSNorm` | **YES** | `(x−α)/α` |
| `getDepth` | **YES** (display) | — |
| `rebase` | **YES** (τ-invariant) | `x→r·x, α→r·α`; marginal→/r, profile untouched |
| `getMP_raw` | τ-version | `(w(u)/(1−w(u)))·(Y(u)/X(u))` at spot `u` (invert `Y(u)=y−β`) |
| `tradeUpdate(s,dy)` | τ-version (goal-seek) | `y'=y+dy`; solve `u'` from `Y₀e^{W(u')}=y'−β` (1-D Newton, monotone); `x'=X₀e^{W(u')−u'}+α` |
| `arbitrageToOracle(s,o)` | τ-version | find `u*` with `getMP_raw=o` (monotone root); `x*=X(u*)+α, y*=Y(u*)+β` |

The two τ-fns need only a **1-D Newton solve** on a monotone closed-form function — same shape as v24
(which inverts a quadratic via `√`) and as HEAD's GH engine (same-table inversion, FP-exact round-trips).

---

## 4. The spread shortcut (ports verbatim — see companion note)

Vertical spread (2 strikes, same wing) → ONE effective tx, all in the **pricing layer (curve-agnostic)**:

    θ* = √(θ_lo·θ_hi),  δ = ½log(θ_hi/θ_lo)
    mark(wing,θ,sNorm) = min(sNorm/θ, θ/sNorm)          (ITM saturates at 1)
    V = N·mark(θ*)·2sinh(δ)     → one tradeUpdate(s, ±V·oracle)

- **Effective notional `N·2sinh(δ) = N·(θ_hi−θ_lo)/√(θ_lo θ_hi)`** (value-difference of the legs, not raw
  `N`): tight spread → ~0 (legs cancel); wide spread → can exceed N. (`sinh`=difference; `cosh`=sum.)
- Bundling 2 legs into 1 net-Δy push is **exact** on the τ-curve (1-D path-independence).
- `mark`, `compositeRay`, `vsValue`, `legPrice`, `executeLeg`, wing-membership, ITM-settle-to-cash:
  **all port verbatim.** Only the final `tradeUpdate` push carries the τ-warp.
- **Care-point:** strike registration must go through the **τ-arb** (`θ=getSNorm(arbitrageToOracle(K))`)
  so the crossover still lands at the dollar strike K. Test this hardest.

---

## 5. Migration safety net + test plan

- **`τ→∞` (or `Δw=0`) = v24, byte-for-byte.** Ship τ initialized large / wings at the v24 setting and the
  build IS v24. Then dial τ / free the wings only after the equivalence gate passes.
- **Gates to add (mirror HEAD's run_all.sh):** (G-v24) τ→∞ tradeUpdate/getMP/arb == v24 closed forms;
  (G-asym) `γ_loc(±100τ)` τ-independent (wings stay power-law); (G-rt) round-trip FP-exact; (G-seam) the
  smooth-pasting boundary `S*=Kγ/(γ+1)` τ-invariant (algebraic in γ only); (G-cross) OTM→ITM crossover
  at dollar strike K via the τ-arb registration; (G-spread) composite-ray identity + bundle==net.
- **`τ`-vs-`kappa` NAME WARNING:** v24's `state.kappa` is **funding elasticity** (L2083) — NOT kurtosis.
  Add a **separate** scalar `τ` (≡ GH δ). Do not reuse `kappa`.

---

## 6. Operator-owned decisions (FLAG — do not decide in the build)

1. **Build path (the strategic fork, §1.2):** an active τ = a genuine GH curve = **what HEAD v26c already
   is**. Decide: **(a) port HEAD's proven GH curve fns into v24's architecture + expose δ→τ** (reuse,
   lowest-risk, the curve is already gate-verified), or **(b) re-implement the weight-profile/closed-form
   integral in v24** (cleaner pedagogically, re-proves from scratch). Same curve either way.
2. **Whether to ship τ at all** — reopens the locked GH curve/economic-object.
3. **Wing setting `(w_−,w_+)`:** the engine's `(γ,γ+1)` (Esscher βh=1) is the current slice. Independent
   `w_−≠w_+` = **the two-root / βh=0 settlement fork** (settlement-semantics change). τ is orthogonal —
   safe to ship with skew held at the current setting; freeing skew is a separate, settlement-touching move.
4. **Exposed label/direction:** expose `1/τ` = tail-fatness (latent driver, object L: small τ = fat).
   Do NOT ship "τ up = fatter" (backwards).

## Confidence ledger
- **CONFIDENT (50–60 dps, manager-verified):** the closed-form curve + 4 curve fns + getSNorm verbatim +
  strike registration via τ-arb + the spread shortcut + effective notional + τ→∞=v24. All in the two
  companion derivation notes with the raw checks.
- **NOT done:** calibration map (template = HEAD ghCalibrate); the actual engine edit (file-safety-gated).
- **OPERATOR-OWNED:** build path (port HEAD GH vs reimplement); whether to ship; the wing/settlement fork;
  the exposed label. These are decisions, not derivations — flagged, not taken.
