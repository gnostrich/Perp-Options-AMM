# Aristotle prompt — Deterministic continuous-time PH bridge (TIER 4, serves operator Q1)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
We want the paper to state the CANONICAL continuous-time port-Hamiltonian form AND have it proven, with
the oracle price `S` as an **EXOGENOUS deterministic input** — NO price SDE, NO Itô, NO volatility
model (the stochastic-LVR version is deliberately OUT of scope; it is an operator/paper call).

Canonical deterministic PH system (finite-dim, real):
```
ẋ = (J − R) ∇H(x) + G u ,    y = Gᵀ ∇H(x) ,    dH/dt = ∇H(x)·ẋ
```
with `J` skew-symmetric (`Jᵀ = −J`), `R` positive-semidefinite (`R ⪰ 0`). The **dissipation /
passivity inequality** is `dH/dt ≤ uᵀ y`. Derivation (re-derived, exact):
`dH/dt = zᵀJz − zᵀRz + (Gᵀz)ᵀu` with `z := ∇H`; `zᵀJz = 0` (J skew); `zᵀRz ≥ 0` (R PSD);
`y = Gᵀz` ⇒ `dH/dt = uᵀy − zᵀRz ≤ uᵀy`.

**Discrete is the exact sampled realization.** Our shipped discrete passivity
(`Temporal.PassiveSystem.passivity`) is the forward-Euler/sampled image: telescoping the per-tick
balance `H_{k+1} = H_k + supplied_k − dissipated_k` (`dissipated ≥ 0`) gives
`H_N ≤ H_0 + Σ supplied` — the discrete passivity, which is the sampled `dH/dt ≤ uᵀy` integrated over
`[0,T]`. We connect the two: a per-tick `supplied_k := uᵀy` and `dissipated_k := zᵀRz ≥ 0` instantiate
the abstract `PassiveSystem`, so the continuous inequality and the discrete passivity are the same
statement at two resolutions.

## Lean (project `RequestProject`, file `RequestProject/CTPH.lean`)
Imports `RequestProject.Temporal` (for `PassiveSystem` / `passivity`). Vectors are `Fin n → ℝ` (dot
product `∑ i, a i * b i`), matrices `Matrix (Fin n) (Fin n) ℝ` acting by `Matrix.mulVec`. Ships
statements + `sorry`. Replace each `sorry`; do not alter statements. DO NOT edit `Temporal.lean`.

## Proof targets
- `skew_quadForm_zero` : if `Jᵀ = −J` (`J.transpose = -J`) then for all `z : Fin n → ℝ`,
  `∑ i, z i * (J.mulVec z) i = 0` (skew form vanishes — the lossless-routing zero).
- `ct_dissipation_ineq` : with `Jᵀ=−J`, `R` PSD, `z u : Fin n → ℝ`, `G : Matrix (Fin n) (Fin n) ℝ`,
  define `xdot := (J - R).mulVec z + G.mulVec u`, `y := Gᵀ.mulVec z`, then
  `(∑ i, z i * xdot i) ≤ (∑ i, u i * y i)` — i.e. `dH/dt ≤ uᵀy`. (= `dH/dt = uᵀy − zᵀRz ≤ uᵀy`.)
- `discrete_is_sampled` : instantiate `Temporal.PassiveSystem` with a per-tick supply `s` and a
  nonnegative per-tick dissipation `d ≥ 0` (constants standing for `uᵀy` and `zᵀRz`), and show the
  discrete passivity `H (run s0 n) ≤ H s0 + cumSupplied s0 n` holds — i.e. the abstract passivity fires,
  witnessing that the discrete telescoping is the sampled continuous inequality. (A clean way: build a
  `PassiveSystem` whose `H` decreases by `(d - s)` each tick over `ℕ`-indexed state, and invoke the
  existing `passivity` theorem.)

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/CTPH.lean` changes; `Temporal.lean` byte-identical.
- NOTE: do NOT introduce any stochastic / SDE / Itô content — S is exogenous deterministic only.
