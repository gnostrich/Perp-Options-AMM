# MONOLITH REVIEW PACKET — the singular object, for external adversarial review

_research-lead (theory owner), 2026-06-23. Self-contained: a reviewer with NO repo access can follow
this. Purpose: hand an external lab a precise, **non-overclaiming** description of our "monolith" so
they can attack it, and so we can offer to run whatever additional Lean it flags via Aristotle._

> **PROVENANCE DISCIPLINE (read first).** Nothing in this packet is labelled "verified." Our strongest
> label is **`trusted-from-prover`**: the external Lean 4 prover Aristotle compiled the file SERVER-SIDE
> (Lean 4.28.0 / Mathlib v4.28.0) AND it passed our zero-cost local audit (token scan, prover-reported
> `#print axioms` ⊆ {`propext`, `Classical.choice`, `Quot.sound`}, out-of-scope modules byte-identical,
> math re-derived by hand). We do **NOT** have a local canonical Lean kernel in this environment, so we
> have **not** independently re-run the kernel. "verified" is reserved for a canonical-kernel build we
> cannot currently perform. Treat `trusted-from-prover` as: *a competent external prover compiled it and
> we checked the statement is the intended one and the axiom set is clean* — not as machine-checked-here.

---

## 0. Orientation — what this object is FOR

**Temporal Exchange** is a DeFi options-AMM. The economic deliverable: an AMM that prices a continuum of
perpetual American-style option strikes whose value behaves as a power law `value ∝ S^(−γ)` (γ>1) in
spot `S`, on a plain Balancer constant-product reserve curve, with a single scalar **kurtosis/vol knob
`m`** that controls steepness. The pool curve itself is **plain Balancer, unchanged** (`m=1` reproduces
it exactly); `m` acts as a *read-and-write lens* on top, never as a deformation of the pool.

The "monolith" is the attempt to capture **the entire mechanism as ONE pure-mathematical Lean object**
— pool, trade, rebase, pricing, settlement, the lens, and a port-Hamiltonian (passivity) reading — so
that a change at any seam must type-check at every other seam. This packet describes that object as it
**currently** stands (constant-`m` lens, engine HEAD `dd6fb955`), corrects two now-stale internal index
documents, and states honestly what is proved, what is assumed, and what is open.

**Correction to internal indices (flagged for the reviewer's benefit):** `formal/MONOLITH_INDEX.md` and
`docs/MONOLITH_INDEX.md` were written against an OLDER engine HEAD (the polar-lens build `de28c937`,
`g_loc=γ·Φ_τ(|u|)`). That lens is **superseded**. The CURRENT object is the **constant-`m` lens**
(`g_loc=m·γ`), and the current engine HEAD is **`dd6fb955`** (a draw-layer chart fix over the constant-m
engine; the settlement/trade math is byte-identical to the constant-m source). This packet reflects the
current state; where the old indices disagree, this packet governs.

---

## 1. WHAT THE SINGLE STRUCTURE IS

### 1.1 Plain English

One Lean `structure TemporalAMM` carries just **four real numbers** plus positivity proofs:
`{α, β, y, m}` with `0<α`, `0<β`, `β<y`, `0<m`. **Everything else is derived from these four.**

- `α, β` are the two **conserved trade charges** (Casimirs): a trade never changes them.
- `y` is the single state coordinate (the cash reserve). The other reserve `x` is *derived*.
- `m` is the **kurtosis slope multiplier** (the vol knob). `m=1` = plain Balancer.

From `{α,β,y}` we read off the Balancer pool, the weight `w`, the convexity exponent `γ`, the price, and
the pool potential `μ`. From `m` we read off the lens exponent `g = m·γ`. The pieces:

| concept | definition (in the four carried numbers) |
|---|---|
| derived reserve `x` | `x = α·y/(y−β)` |
| Balancer weight `w` | `w = 1 − β/y` (so `w∈(0,1)`) |
| convexity exponent `γ` | `γ = (y−β)/β` (>0; engine instance gives γ>1) |
| mode / center | `center = β/(y−β) = 1/γ` |
| marginal price | `price = (y−β)²/(α·β)` |
| **pool potential** `μ(t)` | `μ(t) = (t−β)³ / (3αβ)` — convex on the operating domain `t≥β` |
| carry / log-coordinate | `carry = log(price)` |
| **lens exponent** `g(θ)` | `g(θ) = m·γ` — **constant at every strike θ** (no θ-dependence) |
| trade-strike map | `thetaTx(θ) = center·(θ/center)^m` (Real `rpow`; closed-form invertible) |

The **invariant** `(x−α)(y−β)=αβ` holds (the Balancer constant-product hyperbola in shifted coords).

### 1.2 The metriplectic / port-Hamiltonian spine

`μ(t)=(t−β)³/(3αβ)` is the object's **storage potential**. Two facts make it a port-Hamiltonian /
information-geometric *base*:

- **price = ∇μ** (`price_is_grad`): the marginal price IS the derivative of `μ` at the state `y`.
- **R ⪰ 0** (`R_psd`): the second derivative `μ″(t)=2(t−β)/(αβ) ≥ 0` for all `t≥β` — the resistive
  curvature is positive-semidefinite on the operating domain. This is the dissipation/passivity term.

The symplectic/"metriplectic" reading is **deliberately NOT overclaimed**: the base is 1-dimensional, so
the only skew 2-form on it is the trivial one (`ω≡0`). We therefore call the headline noun
**"information-geometric base + port-Hamiltonian lift,"** NOT "metriplectic." (The PH structure is the
forced cotangent lift of a Hessian base, not a second independent axiom.) ⚠ **Important honesty caveat
(see §3):** `μ` here is the *Balancer constant-product* potential. Earlier project framing called `μ` a
*generalized-hyperbolic CGF* (cumulant generating function); for the live Balancer curve that
measure-backed CGF / exponential-family reading is **DEAD** (μ is not globally convex — it is negative
for `t<β` — and a cubic cannot be a CGF by Marcinkiewicz's theorem). A *measure-free* Hessian /
dually-flat geometry survives (μ convex on `t≥β`, Legendre dual exists); the *measure-backed* one does not.

### 1.3 The constant-`m` lens

The vol knob is a single positive scalar `m`. The displayed local exponent of the option-value curve is
`g(θ) = m·γ`, **identical at every strike** (`g_const_in_strike`). `m=1` ⇒ `g=γ` = the plain pool curve;
`m>1` ⇒ steeper everywhere; the trade lands further out via the frozen map `thetaTx`. The lens is a
**forward read** only — it is never inverted to drive the pool; the pool stays plain Balancer.

(History note for the reviewer: a previous lens was position-dependent, `g_loc=γ·Φ_τ(|u|)` with a
`√(τ²+u²)` kernel that rounded the ATM elbow. The operator replaced it with the constant multiplier. The
old polar-lens Lean theorems are SUPERSEDED, not part of the current object.)

### 1.4 Smooth-paste settlement

ITM exercise uses American smooth-pasting at a free boundary, parameterized by any `g>0` (so it applies
at `g=m·γ`):

- free-boundary spot: `S* = K·g/(g+1)` (normalized `sStar(g,θ) = θ·((g+1)/g)^g`). `K` is the **dollar
  strike**; `θ = s_N(K) = K/oracle` is the **normalized strike** (carry coordinate). `S*` (price units)
  and `sStar` (normalized units) are the SAME free boundary in two coordinate frames — `K=θ` is NOT
  assumed (closes lab-review F1). The engine and Lean both implement the normalized `sStar` form.
- continuation arm: `markCont(g,θ,s) = pasteC(g,θ)·s` with `pasteC = 1/((g+1)·sStar)`
- intrinsic arm: `markInt(g,θ,s) = 1 − (s/θ)^(−1/g)`

The two arms meet **C¹** at `S*`: value match (`paste_value`) and slope match (`paste_slope`).

### 1.5 The PH-unification weld (whole exchange as one object)

A separate (self-contained) Lean file `PHUnification.lean` wraps the pool object in an `Exchange`
structure (pool + obligation/funding/floor/close ports) and proves the **internal half** of solvency:
the exchange is **passive** (sampled storage `Hs` never exceeds initial storage plus cumulative supplied
power) **because the geometry is PSD** — with **no open PSD hypothesis**. The headline theorem
`exchange_internal_passivity` fills the abstract passivity result's `hR` slot with the object's OWN
`R_psd`. This is "no internal free money": storage cannot be manufactured internally; the only way up is
the supplied port. The **external half** (solvency under an adversarial price path) does **NOT** close —
it localizes to a single named coverage hypothesis (B1/B3/B4), kept as a `→` premise, never discharged.

### 1.6 The lens as inverse-temperature (`LENS_THERMAL`, WING-scoped)

A separate self-contained file `LensThermal.lean` identifies the natural home of `m`: the option-value
**wing law** `value(S)=S^(−g)=e^(−(m·γ)·q)` (on `q=log S`) is a Gibbs/Boltzmann weight with
inverse-temperature `β_T = g = m·γ`; baseline `β_T,0=γ` at `m=1`; `value_m=(value_1)^m`. So `m` is a
**dilation** of the natural parameter (`γ↦m·γ`), a canonical thermal power, not an Esscher tilt. **Scope
caveat (binding):** this is the **wing / power-law tail** identity, NOT a claim about the engine's bounded
smooth-pasted mark near ATM (the measured mark vs `S^(−g)` ratio ranges ~0.001–9000 near ATM — the
power law is the asymptote, not the whole mark).

---

## 2. THE EXACT CLAIMS THE MONOLITH MAKES

1. **One structure encompasses the mechanism.** A single `TemporalAMM{α,β,y,m}` (4 reals + positivity)
   generates pool / trade / rebase / pricing / settlement / lens; fixing the four carried numbers fixes
   every derived reading (`single_object`). There is no second free-floating object.

2. **The pool is plain Balancer and a trade conserves the Casimirs.** `invariant` holds; `trade` moves
   only `y`; `trade_conserves` keeps `α,β`; trades form a one-parameter group (`trade_flow_group`); the
   convexity exponent is affine in cash (`gamma_affine`: `γ' = γ + D/β`).

3. **Rebase is a gauge symmetry.** Scaling `α↦rα` leaves `w, γ, center, m, g` invariant
   (`rebase_*_invariant`); trade and rebase commute (`trade_rebase_commute`).

4. **The lens is a constant slope multiplier.** `g(θ)=m·γ`, constant in strike; `g=γ ⇔ m=1`; `g≥γ` for
   `m≥1`; the trade-strike map is a closed-form invertible power (`thetaTx_roundtrip`, exponent `1/m`;
   `thetaTx_strictMono`). The warp per trade is **linear**: `warpInt(γ,γ') = m·(γ'−γ) = m·(D/β)`
   (`warp_linear`, `warp_eq_m_dgamma`) — no kernel, no kink, strike-independent.

5. **Settlement smooth-pastes C¹.** `paste_value` (arms equal at `S*`) and `paste_slope`
   (`markInt` has derivative `pasteC` at `S*`), for any `g>0`, hence at `g=m·γ`.

6. **The pool is a passive port-Hamiltonian object.** `price=∇μ` (`price_is_grad`) and `μ″≥0` on `t≥β`
   (`R_psd`). The whole exchange's internal passivity follows from this geometry with no extra PSD
   assumption (`exchange_internal_passivity`, `trade_no_spontaneous_storage`).

7. **Solvency splits.** Internal half (passivity) closes structurally; external half (solvency under
   adversarial inputs) is conditional on a single named coverage premise (`exchange_solvency_split`,
   `coverage_iff_solvency` shows that premise is exactly solvency — it cannot be weakened by geometry).

8. **The lens is the inverse-temperature of the value wing** (`value_is_gibbs`, `value_pow_m`,
   `invtemp_eq_m_gamma`, `m_one_recovers_base`, `invtemp_mono`) — WING-scoped.

9. **A numeric consistency layer cross-checks the engine against the Lean formulas.** The script
   `engine/verify/monolith_consistency.js` evaluates the live engine and compares to the Lean closed
   forms (price=(y−β)²/αβ; post-trade Casimir conservation + on-curve residual; `μ″=2(t−β)/αβ≥0`;
   `gLoc==m·γ` at every strike; `θ_tx==mode·(chosen/mode)^m`; smooth-paste seam + boundary fraction
   `1/(g+1)`; `warp=m·Δγ`; an `Hs`-telescoping passivity reproduction). **This is a REPORT-ONLY numeric
   bridge — it exits 0 always, is NOT a gate, and explicitly does NOT prove the engine IS the Lean object
   or make Lean "verified" — only that the numbers AGREE.** The HARD engine gates are
   `lens_selfcheck.js` (13) and `a16_atm_gate.js` (5).

---

## 3. PROVENANCE — BRUTALLY HONEST

### 3.1 `trusted-from-prover` (Aristotle-compiled + locally audited; NOT locally re-verified)

All in `formal/aristotle_runs/`. Toolchain Lean 4.28.0 / Mathlib v4.28.0. Each passed the zero-cost audit
(token scan clean: no `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`/`axiom`-decl; prover
`#print axioms` summary ⊆ {`propext`,`Classical.choice`,`Quot.sound`}; out-of-scope modules
byte-identical; math re-derived). **None is re-run in a local canonical kernel.**

**`MonolithConstM.lean`** (run `6016ec57`/task `3f85462d`) — the single object:
`invariant`, `w_consistency`, `gamma_eq`, `center_eq_inv_gamma`, `center_eq_sNorm`, `price_eq_slope`,
`price_is_grad`, `R_psd`, `trade_conserves`, `trade_flow_group`, `trade_dx`, `gamma_affine`,
`rebase_{x_scales,w/gamma/center/m/g_invariant}`, `trade_rebase_commute`, **`g_eq_m_gamma`**,
**`g_const_in_strike`**, `g_pos`, `g_eq_gamma_iff_m_one`, `g_ge_gamma_of_m_ge_one`,
**`thetaTx_roundtrip`**, `thetaTx_strictMono`, **`warp_linear`**, `warp_roundtrip_zero`,
`warp_nonneg_of_buy`, `warp_eq_m_dgamma`, **`paste_value`** / **`paste_slope`** (smooth-paste at g=m·γ),
`goalSeek_{root,ge_half,strictMono}`, **`engineInstance`** (m=1: x=1000, w=29/40, γ=29/11>1, g=γ) and
its corollaries, **`single_object`**.

**`PHUnification.lean`** (run `8ee75026`/task `5c2bccf2`; INTERNAL half only) —
`R_psd`, `trade_conserves`, `trade_poolPotential`, `sampled_dissip_nonneg`, `sampled_increment`,
`internal_passivity`, `no_internal_free_money`, `exchange_Rcurv_nonneg`,
**`exchange_internal_passivity`** (the weld: no open `hR`), **`trade_no_spontaneous_storage`**.

**`LensThermal.lean`** (run `ca042134`/task `50d34e3c`; WING-scoped) —
`gamma_pos`, `g_eq_m_gamma`, **`value_is_gibbs`**, **`value_pow_m`**, `invtemp_eq_m_gamma`,
`m_one_recovers_base`, `invtemp_mono`.

**Fragile-tactic flags (no-math; recorded for the auditor):** `grind` in `center_eq_sNorm`,
`price_eq_slope`, `goalSeek_root`; `aesop` in `trade_rebase_commute`; heavy `nlinarith` in
`w_consistency`, `gamma_eq`; `convert HasDerivAt …` in `price_is_grad`, `paste_slope`. These are proof
*style* concerns (brittleness under Mathlib drift), not soundness gaps.

### 3.2 OPEN / assumed / conditional / placeholder (NOT proved)

- **External solvency half.** `solvency_of_coverage` / `coverage_iff_solvency` / `exchange_solvency_split`
  carry the coverage premise `hcov` as a `→` hypothesis, NEVER discharged. Solvency is NOT closed — it is
  *localized* to the named B1/B3/B4 admissibility condition. PH-4b: the funding port is
  **necessary, never sufficient**; geometry supplies no reserve floor.
- **B1 / B3 / B4 (solvency hypotheses).** B1 (collateral/κ coverage), B3 (funding sign+magnitude), B4
  (adversarial price-path/oracle bound) are the irreducible inputs. Only the *conditional*
  `solvent_of_port_covers` is proved (CARRIED[coverage]). The **real solvency floor is STILL-OPEN** — an
  operator ship-gate, not discharged by any Lean here.
- **`warp∘rebase-commute` / φ-anchor lemmas — `[needs-Aristotle]`.** `trade_rebase_commute` IS proved in
  `MonolithConstM.lean`, but the broader warp∘rebase-commutation and the φ-anchor/funding lemmas that the
  engine changelog lists as open are **not yet written/submitted**.
- **Placeholder fields in `PHUnification.lean`.** The `Exchange` fields `obligation`, `funding`, `close`,
  `floor` are **abstract parameters** (`ℝ→ℝ`, `ℝ→ℝ→ℝ`, `ℝ`). `close` (the close-mechanic, Q14) is carried
  but used in NO internal-half theorem — it is a parametrized placeholder, not a modeled mechanic. The
  slippage dissipation functional and the dollar/USD co-energy pipe are **members, not Lean content**
  (unbuilt). No `True`-placeholder *theorem* exists, but these abstract ports are the honest "not yet
  modeled" surface.
- **Engine-instantiates-the-contracts GAP.** The Lean object is an L1 spec object. The running HTML engine
  is bridged to it ONLY by the report-only numeric harness `monolith_consistency.js` (numbers agree to
  ~1e-9..1e-15) and by the HARD self-check gates. **No theorem states "the engine IS this object."** The
  engine↔Lean identity is asserted by numeric agreement, not proved.
- **"verified" — env-blocked.** No local canonical Lean kernel is reachable in this environment. Every
  result above is `trusted-from-prover`, never "verified."
- **A14 / A15 / A16 / A11.** At-strike no-arb-on-close (A14), slippage-haircut composition (A15), a direct
  ATM no-jump theorem (A16 — currently true only by constant-exponent construction + gate, NOT a Lean
  result), and asymmetry-growth (A11) are **pending-submit**, not proved.
- **`m` is not derived from the potential.** `m` is a calibration scalar, not emergent from `μ`'s free
  energy. Making `m` intrinsic to the pool would require a curve reopen (operator-tier). HONEST GAP.

---

## 4. KEY LEAN THEOREM STATEMENTS (signatures, for a reviewer to judge prose-vs-formal)

Reproduced from the returned archives. `ℝ` is the Mathlib reals; `^` on reals is `Real.rpow`;
`HasDerivAt f v x` means `f` is differentiable at `x` with derivative `v`.

**The structure** (`MonolithConstM.lean`):
```lean
structure TemporalAMM where
  alpha : ℝ ; beta : ℝ ; y : ℝ ; m : ℝ
  halpha : 0 < alpha ; hbeta : 0 < beta ; hy : beta < y ; hm : 0 < m
```

**Pool / spine:**
```lean
theorem invariant   (P) : (P.x - P.alpha) * (P.y - P.beta) = P.alpha * P.beta
theorem price_is_grad (P) : HasDerivAt P.poolPotential P.price P.y
theorem R_psd       (P) : ∀ t, P.beta ≤ t → 0 ≤ deriv (deriv P.poolPotential) t
theorem trade_conserves (P) (D) (hD : P.beta < P.y + D) :
    (P.trade D hD).alpha = P.alpha ∧ (P.trade D hD).beta = P.beta
theorem gamma_affine (P) (D) (hD) : (P.trade D hD).gamma = P.gamma + D / P.beta
theorem trade_rebase_commute (P) (r) (hr : 0 < r) (D) (hD) :
    (P.rebase r hr).trade D hD = (P.trade D hD).rebase r hr
```

**Lens (constant-m):**
```lean
def g (P) (θ : ℝ) : ℝ := P.m * P.gamma          -- NO θ-dependence
theorem g_eq_m_gamma     (P) (θ) : P.g θ = P.m * P.gamma
theorem g_const_in_strike (P) (θ₁ θ₂) : P.g θ₁ = P.g θ₂
theorem g_eq_gamma_iff_m_one (P) (θ) : P.g θ = P.gamma ↔ P.m = 1
theorem thetaTx_roundtrip (P) (θ) (hθ : 0 < θ) (hm : 0 < P.m) :
    P.center * (P.thetaTx θ / P.center) ^ (1 / P.m) = θ
theorem warp_linear (P) (g0 g1) : P.warpInt g0 g1 = P.m * (g1 - g0)
```

**Smooth-paste (global, any g>0):**
```lean
theorem paste_value (g θ) (hg : 0 < g) (hθ : 0 < θ) :
    markCont g θ (sStar g θ) = markInt g θ (sStar g θ)
theorem paste_slope (g θ) (hg : 0 < g) (hθ : 0 < θ) :
    HasDerivAt (markInt g θ) (pasteC g θ) (sStar g θ)
```

**Single-object headline:**
```lean
theorem single_object (P Q : TemporalAMM)
    (ha : P.alpha = Q.alpha) (hb : P.beta = Q.beta) (hyy : P.y = Q.y) (hmm : P.m = Q.m) :
    P.x = Q.x ∧ P.w = Q.w ∧ P.gamma = Q.gamma ∧ P.center = Q.center ∧ P.price = Q.price
      ∧ ∀ θ, P.g θ = Q.g θ
```

**PH-unification weld** (`PHUnification.lean`):
```lean
theorem exchange_internal_passivity (E : Exchange) (H0 : ℝ) (sup eff st : ℕ → ℝ)
    (hst : ∀ k, E.amm.beta ≤ st k) (N : ℕ) :
    Hs H0 sup (fun k => deriv (deriv E.amm.poolPotential) (st k)) eff N
      ≤ H0 + (Finset.range N).sum (fun k => supplied sup k)
-- external half stays a premise:
theorem solvency_of_coverage (E : Exchange)
    (hcov : ∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s) :
    ∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s
```

**Lens-thermal** (`LensThermal.lean`):
```lean
theorem value_is_gibbs (P : LensAMM) (S) (hS : 0 < S) :
    P.valuePow S = gibbs P.g (Real.log S)        -- valuePow S = S^(−g); gibbs βT q = exp(−βT·q)
theorem value_pow_m (P) (S) (hS : 0 < S) :
    P.valuePow S = (P.valuePowBase S) ^ P.m      -- value_m = (value_1)^m
```

### 4.1 Statements weaker than their prose — flagged for the reviewer

These are the spots where an adversary should push; we state them ourselves:

1. **`single_object` is a determinism statement, not a uniqueness/canonicity statement.** It says equal
   carried data ⇒ equal derived readings (a function is well-defined). It does NOT prove the four-number
   parameterization is the *only* or *minimal* one, nor that the engine's state maps onto it. The prose
   "one object encompasses everything" rests on this plus the (un-proved) engine↔object identity.

2. **`exchange_internal_passivity` proves a SAMPLED (forward-Euler, discrete `Hs`) passivity, not a
   continuous-time / stochastic one.** The bound is a telescoping inequality on a discrete trajectory with
   externally supplied `sup`, `eff`, `st` sequences. It does not integrate an SDE. The "passivity" claim
   is the discrete-sampled one; the continuous-time PH dissipation lives in a separate (motivation-layer)
   result, not welded here.

3. **`paste_slope` / `paste_value` prove C¹ ONLY at the settlement free boundary `S*`** — a locus DISTINCT
   from the ATM/mode crossing. There is **NO** Lean theorem proving no-jump position value at ATM (A16);
   that is true by constant-exponent construction and is only **gate-verified** (`a16_atm_gate.js` 5/5),
   not proved. Do not read "smooth settlement" as "smooth at ATM."

4. **Settlement optimality is NOT the stochastic Snell envelope.** `S*=K·g/(g+1)` is the smooth-pasting
   free boundary; the smooth-paste C¹ conditions are proved. A separate (older, GH-line) result
   `opt_boundary_is_max_A` argues `S*` is the optimal exercise boundary **variationally** and is
   **CARRIED[Snell]** — i.e. conditional on a Snell-envelope premise that is NOT discharged. The
   *deterministic-boundary optimality* proved is weaker than a full stochastic optimal-stopping
   (Snell-envelope) statement. The constant-m monolith does not even re-prove the variational version.

5. **`LensThermal` is WING-scoped.** `value_is_gibbs` is about `S^(−g)`, the power-law tail, NOT the
   engine's bounded smooth-pasted option mark. "m is an inverse-temperature" is a statement about the
   asymptote, not the whole mark.

6. **`warp_linear` / `warpInt` is `∫ const`,** i.e. the warp content under constant-m is the trivial
   identity `∫_{g0}^{g1} m = m(g1−g0)`. This is correct and intended (the constant-m simplification), but
   a reviewer should note the *hard* warp calculus (the old polar `√`-kernel FTC-2 content) was
   SUPERSEDED, not carried — there is no nontrivial integral left to attack here, by design.

7. **`R_psd` is one-sided** (`∀ t, β ≤ t → …`). Passivity is claimed only on the operating domain `t≥β`;
   `μ″<0` for `t<β` (off-domain). This is why the measure-backed CGF reading fails (§1.2 / §3).

---

## 5. FORMAL-VERIFICATION MENU — Lean we COULD run via Aristotle to close/strengthen

Offered concretely so the review can flag which to prioritize. Each is a pinned-able obligation we can
phrase precisely and submit to Aristotle (Lean 4.28.0 / Mathlib v4.28.0), then audit and return.

**Close the open frontier:**
1. **A14 — at-strike no-arb-on-close.** Theorem: an open-then-OTM-close at the strike with reverse `dy`
   restores reserves exactly (round-trip on the pool), and the ITM direct-payout path leaks no value.
   Pins: reverse-`dy` reserve restoration on `trade`, and a no-leak inequality for the direct payout.
2. **A16 — direct ATM no-jump theorem.** Promote the gate fact to Lean: position value is C⁰ (and the
   call/put arms agree) at the mode crossing for `g=m·γ>0`, distinct from the `S*` seam. Closes the gap
   flagged in §4.1(3).
3. **A11 — asymmetry growth in `m`.** Theorem: call/put settlement asymmetry is monotone increasing in
   `m` (re-derive: under constant-m it grows with `m`, not D-superlinearly).
4. **A15 — slippage-haircut composition.** Theorem: the size-at-pre-trade-prices → realized-slippage →
   haircut sequence is well-defined and non-circular, with a sign/monotonicity property.

**Strengthen the spine / weld:**
5. **Continuous-time passivity weld.** Lift `exchange_internal_passivity` from sampled `Hs` to a
   continuous dissipation inequality `dH/dt ≤ supplied − R(eff)²` with `R=μ″≥0`, tying the discrete and
   continuous PH readings together (currently the continuous CTPH result is separate / motivation-layer).
6. **`warp∘rebase`-commute (full) + φ-anchor / funding lemmas** `[needs-Aristotle]` — the broader
   commutation and the funding-anchor lemmas the engine changelog lists as open.
7. **Minimality of the four-number parameterization.** A theorem that `{α,β,y,m}` is a minimal generating
   set for the derived readings (no smaller faithful parameterization), strengthening `single_object`
   from determinism toward canonicity.
8. **External-half partial discharge under explicit B3/B4 forms.** Instantiate `hcov` with a concrete
   funding rule (B3) and a concrete oracle/price-path bound (B4) and prove solvency on THAT admissible
   set — turning the conditional into a conditional-on-named-concrete-inputs result (still not
   unconditional; PH-4b respected).

**Connect Lean to the engine (the identity gap):**
9. **Engine-subset definitional bridge.** Formalize the engine's `tradeUpdate`/`markLensed`/`gLoc` as
   Lean defs over the same carried data and prove they EQUAL the monolith's `trade`/`markCont`/`g` — a
   Lean theorem (not just numeric agreement) that the engine functions ARE the object's functions. This
   is the strongest available answer to "does the engine instantiate the contracts?"
10. **Settlement optimality toward Snell.** Discharge (or honestly bound) the `[Snell]` premise of the
    variational optimality, moving deterministic-boundary optimality toward the stochastic optimal-stopping
    statement flagged in §4.1(4).

We can run **any** of these and return a full audit (token scan, axiom set, math re-derivation) per item.

---

## Appendix — file pointers (for a reviewer WITH repo access)

- Single object: `formal/aristotle_runs/MONOLITH_CONSTM/extracted/RequestProject/MonolithConstM.lean`
- PH-unification weld: `formal/aristotle_runs/PH_UNIFICATION_COMPOSED/extracted/RequestProject/PHUnification.lean`
- Lens-thermal: `formal/aristotle_runs/LENS_THERMAL/LensThermal.lean`
- Numeric consistency layer: `engine/verify/monolith_consistency.js` (REPORT-ONLY, exit 0 always)
- Provenance map: `formal/INDEX.md` ; component maps (partly STALE on the lens layer):
  `formal/MONOLITH_INDEX.md`, `docs/MONOLITH_INDEX.md`
- Constant-m object note: `notes/research/CONSTANT_M_lens_object_sync_2026-06-13.md`
- Lens natural-home / info-geometry correction: `notes/research/LENS_NATURAL_HOME_2026-06-14.md`
- GH-vs-Balancer μ correction: `notes/research/DETERMINATION_CORRECTION_GH_vs_Balancer_2026-06-14.md`
- Engine HEAD: `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `dd6fb955…`)
- Toolchain: Lean 4.28.0 / Mathlib v4.28.0 (`formal/temporal_lean_verified/lean-toolchain`)
