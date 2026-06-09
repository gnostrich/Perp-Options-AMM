# Summary of changes for run 5c63b5ac-526d-4fa9-be5a-566c46b37c71
All 7 proof targets in `RequestProject/MertonTie.lean` have been proved — no `sorry`, `admit`, or non-standard axioms remain.

**Proved targets:**
- **G1** `gh_put_root_in_strip`: Put root θ=−γ keeps radicand α²−(β+θ)² = 4γ ≥ 0
- **G1'** `gh_call_root_out_of_strip`: Call root θ=γ+1 gives −(2γ+3) < 0 (outside GH strip)
- **G2** `merton_vieta_sum`: Vieta sum = 1 ⇔ r = q (zero net carry)
- **G2'** `merton_vieta_prod`: Vieta product ⇔ γ(γ+1) = 2r/σ²
- **G3** `sigmaEff2_closed_form`: ψ''(0) = δα²/(α²−β²)^(3/2) via `HasDerivAt` (genuine second derivative)
- **G3-limit** `gaussian_limit_quadratic`: `Filter.Tendsto` proof that psiJump(k, β, σ²k, θ) → σ²/2·((β+θ)²−β²) as k→∞
- **G4** `Sstar_is_merton_boundary`: Value-match + slope-match ⇒ S = Kγ/(γ+1) (Merton boundary)

**Axiom audit**: All 7 theorems depend only on `{propext, Classical.choice, Quot.sound}` — verified via `#print axioms` at the end of the file.

**Carried structures**: `GHIsLaplaceExponent` and `GaussianLimitOfGH` remain as `structure : Prop` with `True` fields (no axioms introduced).

**Signatures**: All 8 theorem signatures are exactly as provided — unchanged.

**Files modified**: Only `RequestProject/MertonTie.lean`. Summary written to `ARISTOTLE_SUMMARY.md` with fragile tactics flagged (3 uses of `grind`).

# ARISTOTLE_SUMMARY — Merton Tie

## PROVED TARGETS (all 7/7)

| Target | Status | Description |
|--------|--------|-------------|
| `gh_put_root_in_strip` | ✅ PROVED | G1: Put root θ=−γ keeps radicand = 4γ ≥ 0 |
| `gh_call_root_out_of_strip` | ✅ PROVED | G1': Call root θ=γ+1 gives radicand = −(2γ+3) < 0 |
| `merton_vieta_sum` | ✅ PROVED | G2: Vieta sum-of-roots = 1 ⇔ r = q |
| `merton_vieta_prod` | ✅ PROVED | G2': Vieta product ⇔ γ(γ+1) = 2r/σ² |
| `sigmaEff2_closed_form` | ✅ PROVED | G3: ψ''(0) = δα²/(α²−β²)^(3/2) via HasDerivAt |
| `gaussian_limit_quadratic` | ✅ PROVED | G3-limit: Tendsto psiJump(k,β,σ²k,θ) → σ²/2·((β+θ)²−β²) |
| `Sstar_is_merton_boundary` | ✅ PROVED | G4: Smooth-pasting ⇒ S = Kγ/(γ+1) |

## AXIOM AUDIT

All 7 targets depend only on `{propext, Classical.choice, Quot.sound}` — verified via `#print axioms`.

## CARRIED STRUCTURES (unchanged, as specified)

- `GHIsLaplaceExponent` — `True` field (Bessel-K normalizer identification; Mathlib gap)
- `GaussianLimitOfGH` — `True` field (full distributional GH→Normal limit; carried)

No `axiom` declarations; these are `structure : Prop`.

## SIGNATURE ADJUSTMENTS

None. All 8 theorem signatures are exactly as provided in the original file.

## FRAGILE TACTICS

| Line(s) | Tactic | Context | Suggested replacement |
|----------|--------|---------|-----------------------|
| ~72 | `grind` | `sigmaEff2_closed_form`, final rpow/sqrt algebraic identity | Could be replaced with targeted `rw`/`ring_nf` on the rpow↔sqrt^3 rewrite |
| ~99 | `grind` | `gaussian_limit_quadratic`, field_simp normalization step | Could be replaced with explicit `field_simp` + `ring` after careful sqrt/div manipulation |
| ~117 | `grind` | `Sstar_is_merton_boundary`, final linear solve for S | Could be replaced with `field_simp` + `linarith` with explicit rpow cancellation |

## COULD NOT CLOSE

None — all targets proved.

## UNUSED VARIABLES (linter warnings, signatures unchanged per spec)

- `hδ` in `sigmaEff2_closed_form` — the non-negativity of δ is not needed for the HasDerivAt proof (the derivative formula holds for all δ).
- `hγ` in `Sstar_is_merton_boundary` — the constraint 1 < γ is not needed; the algebraic derivation works for any γ where S>0 and the smooth-pasting system is consistent. These hypotheses are retained because the spec requires unchanged signatures.
