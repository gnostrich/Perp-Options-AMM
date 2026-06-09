# AIRTIGHT Task 2 — THE SINGLE-μ CORE ("singular, not federation", made formal)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Intent (the literal airtight-singular deliverable)
Assemble the already-proven metriplectic pieces into ONE generating structure: a SINGLE convex
potential `μ` (the GH cumulant generating function / log-MGF) as THE one field, with every
financial/structural primitive a `def` DERIVED off that same `μ` — NOT five independent theorems.
The point is that the TYPE-CHECKER enforces that all readings come off the SAME `μ` (one object):
each primitive is literally a function of the one `μ : ℝ → ℝ` carried in a single structure.

All readings live in the GAUGE coordinate `s = u − μ` (centered/natural coordinate). State this
coordinate explicitly; raw-`u` is NOT singular (the dissipation curvature is `e^u` in raw u, NOT
Fisher) — the gauge is forced. This is Scope Lock 1 from the prior runs; keep it.

### The five readings, all OFF the one μ (this is the unification content):
- **price = ∇μ** (gradient/Esscher): `price := deriv μ`.
- **dissipation R = ∇²μ = Fisher** (Hessian/variance): `Rdissip := deriv (deriv μ)` (= `deriv^[2] μ`).
- **value-metric = 1/μ″** (Legendre dual): `valueMetric := fun s => 1 / deriv (deriv μ) s`.
- **symplectic ω = skew part of Hess μ** (1-D: the canonical skew pairing scaled by the Hessian).
- **trade = parameter translation** (boost `s ↦ s + δ`, a one-parameter group): `trade δ s := s + δ`.
- **rebase = degree-0 gauge invariance** (`sNorm` invariant under `(x,α) ↦ (r·x, r·α)`).

## Lean (project `RequestProject`, file `RequestProject/SingleCore.lean`, standalone `import Mathlib`)

### 1. The single object
Define ONE structure that carries the single potential and asserts only its convexity (the metric
positivity), e.g.:
```
structure MetriplecticCore where
  μ : ℝ → ℝ                         -- THE one convex potential (the GH cgf)
  hμ : ContDiff ℝ 2 μ               -- C² so price/R/metric are well-defined
  hconvex : ∀ s, 0 ≤ deriv (deriv μ) s   -- μ″ ≥ 0 : the SINGLE source of metric-positivity
```
Then define EVERY primitive as a field/`def` reading off `c.μ` of a `c : MetriplecticCore`:
`price c := deriv c.μ`, `Rdissip c := deriv (deriv c.μ)`, `valueMetric c := fun s => 1/deriv (deriv c.μ) s`,
`omega c := fun (v w : ℝ) => deriv (deriv c.μ) ?  *  (v * 0 - 0 * w)`  (the canonical 1-D skew pairing;
adjust to a well-typed skew bilinear form whose skewness is `omega c v w = - omega c w v`),
`trade (δ s : ℝ) := s + δ`.

### 2. The theorems that make it ONE object (prove all; they must read the SAME c.μ)
- **`price_is_grad`**: `price c = deriv c.μ` (definitional — the price reading is ∇μ).
- **`R_is_hessian`**: `Rdissip c = deriv (deriv c.μ)` (R is the Hessian of the SAME μ).
- **`R_psd`**: `∀ s, 0 ≤ Rdissip c s` — dissipation is PSD, FROM `c.hconvex` (the single convexity
  source), NOT a separate assumption. This is the metric-positivity, generated off μ.
- **`valueMetric_is_legendre_dual`**: `∀ s, Rdissip c s ≠ 0 → valueMetric c s * Rdissip c s = 1`
  (the value metric is `1/μ″`, the Legendre dual of the dissipation Hessian — same μ).
- **`omega_skew`**: `∀ v w, omega c v w = - omega c w v` (the symplectic form is skew).
- **`trade_group`**: `trade δ₂ (trade δ₁ s) = trade (δ₁ + δ₂) s` AND `trade 0 s = s`
  (one-parameter group — the boost composes as parameter translation).
- **`rebase_gauge_invariant`**: with `sNorm x α := (x-α)/α`, `r ≠ 0 → α ≠ 0 →
  sNorm (r*x) (r*α) = sNorm x α` (degree-0 gauge invariance).
- **`single_source` (the headline)**: a theorem witnessing that price, R, and valueMetric are ALL
  determined by `c.μ` alone — e.g. for two cores with the same μ, all three readings agree:
  `∀ (c d : MetriplecticCore), c.μ = d.μ → price c = price d ∧ Rdissip c = Rdissip d ∧
   valueMetric c = valueMetric d`. (This is the type-level "federation collapses to one object":
  fix μ, and every reading is fixed.)

### 3. Reuse already-proven content (do not re-derive from scratch)
You have previously proven (UNIFY2): `mgf_pos`, `cgf_deriv_mean_and_variance` (cgf' = tilted mean =
price/∇μ), `cgf_convexOn` (cgf'' = variance = Fisher ≥ 0), `boost_is_hamiltonian`,
`sNorm_rebase_invariant`. You MAY include a section instantiating `MetriplecticCore.μ` with the
GH cgf and connecting `price`/`Rdissip` to `cgf`'s mean/variance via those lemmas — but the CORE
structure + the 8 theorems above must stand over a GENERIC convex C² `μ` (that genericity is what
makes "one object" the content, not a GH-specific coincidence). If the GH instantiation needs the
carried GH integrability/finite-MGF hypotheses, CARRY them as named hypotheses (do not fake).

## HARD CONSTRAINTS (violation = reject)
- Every primitive MUST be a `def` of `c.μ` (one field). Do NOT introduce a second independent
  potential, a second convexity assumption, or duplicate the metric source. The whole point is ONE μ.
- `R_psd` MUST derive from `c.hconvex` (the single source), not a fresh hypothesis.
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`, no new `axiom`.
- Prefer concrete proofs; FLAG any `grind`/`exact?`/search tactic in a FINAL body under "FRAGILE
  TACTICS" in ARISTOTLE_SUMMARY.md with the line + the concrete lemma that should replace it.
- If a theorem cannot close, leave ONE `sorry` and report it under "COULD NOT CLOSE" honestly.

## Output spec
- `RequestProject/SingleCore.lean` compiles server-side as ONE file; the structure type-checks and
  every reading is a function of the single `μ` field.
- `#print axioms` for each named theorem ⊆ {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: theorems proved; which are GROUNDED vs CARRIED[named hyps]; SIGNATURE
  ADJUSTMENTS; FRAGILE TACTICS; COULD NOT CLOSE.
- Only `RequestProject/SingleCore.lean` changes; do NOT touch `lakefile.toml`, `lean-toolchain`.
