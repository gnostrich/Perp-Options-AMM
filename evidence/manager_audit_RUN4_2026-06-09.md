# Manager audit — RUN-4 close-the-gaps (2026-06-09)

Independent manager audit of research-lead's RUN-4 (5 submits). I re-derived/read the proofs (not just
the report). **Verdict: genuine, substantial, HONESTLY-reported upgrade.** The RUN-3 tautologies are
replaced with real theorems over Mathlib's actual `cgf`/`mgf` + the real GH kernel; carried boundaries,
conjectural/speculative items, and one fragility hold are all labeled correctly by research-lead. This
audit supersedes the WIP-checkpoint standing of commit ac98480.

## Mechanical (all pass)
- Canonical `formal/temporal_lean_verified/` tree: zero modifications ✓.
- Correct `grep -rnE` token-scan on RETURNED solutions: NO sorry/admit/native_decide/sorryAx/opaque/
  unsafe/axiom in code. (Line-19 "sorry" in Unify2 is a comment.) Standalone projects (`import Mathlib`).
- `#print axioms` ⊆ {propext, Classical.choice, Quot.sound} (prover-reported). trusted-from-prover;
  NOT "verified" (local kernel still env-blocked — release.lean-lang.org 403).

## UNIFY2 (Tier 1, the prize) — GROUNDED (structure) + CARRIED (GH normalization). I read every theorem.
- `cgf_deriv_mean_and_variance` = the REAL A1: `HasDerivAt (cgf X μ) (μ[X·exp(tX)]/mgf) t` over Mathlib's
  integral-defined `cgf`, hypothesis `t ∈ interior(integrableExpSet)` (genuine domain cond, non-vacuous).
  NOT the RUN-3 tautology `deriv(deriv Ψ)=deriv(deriv Ψ)`. ✓
- `deg2_score_centered` = real mean-of-tilt `deriv(cgf)=μ[X·exp]/mgf` (NOT `R·0=0`). ✓
- `boost_is_hamiltonian` = real `HasDerivAt(½gs²)=g·s` (NOT `g·w=g·w`). ✓
- GH-kernel lemmas REAL: `ghKernel_pos` (positivity), `ghKernel_measurable`, `ghKernel_logderiv`
  (HasDerivAt of the exponent → `βh − αh·v/√(δ²+v²)`), `ghKernel_exponent_le` (integrability driver
  `−αh√(δ²+v²)+βh·v ≤ −(αh−|βh|)|v|`, real nlinarith). ✓
- `deg1_bregman_grad` real (`deriv = (s−s₀)·Λ''`), `mgf_pos` real. `sNorm`/`port` reuse RUN-3 reals.
- **CARRIED, honestly named (header lines 107-112):** GH finite-MGF / `∫=1` (Bessel-K normalizer).
  **Mathlib v4.28.0 has NO Bessel-K (Stage-0 probe confirmed: zero declarations)** — a formalization
  gap, not a math doubt. The integrability-DRIVER bound is proved; only the final `∫=1` is carried.
- **HOLD (harden, not an audit failure): `cgf_convexOn` carries a live `exact?` (line 93,
  integrableExpSet convexity) + `grind +suggestions` (line 99, cgf analyticity)** — search tactics,
  compiled server-side but FRAGILE (same class as the original CTPH `exact?` hold). The core
  `deriv²=∫(X−mean)²exp/mgf ≥ 0` is clean; the two helper steps are search-tactic. Not "clean" until
  the two are replaced with concrete lemmas. Contained: only `cgf_convexOn` depends on them.

## Tier 2 + C3 — accurately labeled (I checked statements + honesty headers)
- **C3 (#7): reflection AXIOM DISCHARGED.** `reflection_arrow` / `no_arb_is_reflection_symmetry` proved
  as real algebraic identities (`markPut θ s = markCall θ(θ²/s)`); no longer rests on an axiom. RESIDUAL:
  holds modulo "spec-mark = engine-barrier" link. Report as "arrow discharged," NOT "C3 fully closed."
- **Kähler (#4): algebraic triple GROUNDED, integrability CONJECTURAL.** `Jmat_sq` (J²=−I),
  `kahler_compatibility`, `omega_skew`, `omega_nondegenerate` (det=1), `Gmat_posdiag` — the pointwise
  Kähler triple. Nijenhuis-vanishing (integrability) honestly left conjectural. Finding: GH interior is
  1-real-dim, so the triple lives on the 2D phase space. Upgrades C1 from `g·w=g·w`.
- **Courant (#5): linear Dirac GROUNDED, all-four SPECULATIVE-NOT-ACHIEVED.** graph of ω maximal
  isotropic (`courantPairing_symm`, `graph_isotropic`, `graph_injective`). Folding R+ports into one
  bracket honestly reported as not constructed.

## Honest distance to 100% (no inflation)
Moved from "scaffold + sympy" to **theorem-grade for the exp-family/metriplectic structure, carried only
at the GH-measure boundary.** Remaining to 100%:
1. GH `∫=1` / Bessel-K normalization — needs Mathlib Bessel-K (formalization lift) or stays carried.
2. `cgf_convexOn` hardening — replace `exact?`/`grind` with concrete lemmas (mechanical).
3. Kähler integrability (Nijenhuis) — conjectural, frontier.
4. Courant all-four single bracket — speculative, unachieved.
5. C3 spec↔engine link — remaining premise.
6. "verified" vs trusted-from-prover — env-blocked (allowlist release.lean-lang.org + Mathlib cache).
EXCLUDED from 100% (by theorem): solvency intrinsic-ness (PH-4b; ports necessity-only; B1 extrinsic).

## Minor flags
- research-lead noted a RUNNING Aristotle project `c019735d` on the host NOT in its ledger (possible
  stray from an earlier dispatch / another session). Not in our repo; no repo-integrity impact. Noted only.
- No economic-object escalation surfaced (GHJ latent-group finding unchanged; no object changed for green).

## Net
RUN-4 is real and honestly reported. UNIFY is no longer a scaffold — its core is genuine Lean theorems
over real objects, carried only where Mathlib lacks Bessel-K. C3 axiom discharged (modulo a named link).
Kähler/Courant correctly bounded (algebraic grounded; integrability/all-four open). One fragility hold
(`cgf_convexOn`). Provenance trusted-from-prover. Paper line: "theorem-grade metriplectic structure,
carried at the GH-measure normalization," NOT "fully formally verified / 100%."
