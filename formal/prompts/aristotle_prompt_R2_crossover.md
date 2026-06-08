# Aristotle prompt — R2 / crossover-at-K coordinate invariance (TIER 2)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math
The OTM→ITM crossover happens at the spot `S` where the spot's carry-coordinate value equals the
registered-strike coordinate `θ`. The spot's coordinate is `c(S) = (o0/S)^γ` (the sNorm/carry
coordinate, ∝ S^(−γ)), where `o0 > 0` is the oracle anchor. The crossover solves `(o0/S)^γ = θ`.

Two registrations of the strike `K > 0`:
- **sNorm registration (SHIPPED v26c):** `θ_s = sNorm(K) = (o0/K)^γ`. Then the unique positive
  crossover spot is `S = K`, **for all γ > 0** — coordinate-consistent, no γ dependence.
- **price-ratio registration (stale `θ = K/oracle`):** `θ_r = K/o0`. Then the crossover spot is
  `S = o0^((γ+1)/γ) · K^(−1/γ)`, which equals `o0²/K` at γ=1 and **drifts** for γ ≠ 1 — a γ−1 gauge
  defect. It equals K only in the degenerate `o0 = K` case.

I re-derived both closed forms symbolically (sNorm ⇒ S=K ∀γ; ratio ⇒ S=o0^((γ+1)/γ)·K^(−1/γ), =o0²/K at γ=1).

## Lean (project `RequestProject`, file `RequestProject/R2.lean`)
All reals positive; powers via `Real.rpow`. The file ships statements + `sorry`. Replace each `sorry`;
do NOT alter any statement.

## Proof targets (`o0 > 0`, `K > 0`, `γ > 0` unless noted)
- `crossover_sNorm_at_K` : if `(o0/S)^γ = (o0/K)^γ` with `S > 0`, `γ > 0`, then `S = K`
  (sNorm registration ⇒ crossover at dollar K, all γ). [the positive-invariance theorem]
- `crossover_ratio_form` : the spot solving `(o0/S)^γ = K/o0` is `S = o0^((γ+1)/γ) · K^(−1/γ)`
  (closed form for the ratio registration).
- `crossover_ratio_at_gamma1` : at `γ = 1`, that crossover spot equals `o0^2 / K` (the named drift).
- `mixed_basis_control` (NEGATIVE CONTROL) : the ratio-registration crossover equals `K` **iff**
  `o0 = K` — i.e. for a generic oracle `o0 ≠ K` the ratio registration does NOT land at K (it lands
  at K only in the degenerate anchor). State as: at `γ = 1`, `o0^2/K = K ↔ o0 = K` (for `o0,K>0`).

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/R2.lean` changes.
