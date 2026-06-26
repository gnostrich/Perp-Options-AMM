# Dexter's Lab review of WINE v2 (QC-only, operator entry 281), 2026-06-26

lab_review via the locked room on `paper/wine2026/temporal_wine2026_v2.tex`. Isolated, zero breach,
panel skipped (no OPENROUTER_API_KEY). $10.85, 19 turns. Verdict: **reject, conf 4** (harsher than the
AfT weak-reject; theme = WINE venue fit). Raw: `dexters-lab/lab_home/reviews/review-wine-v2-20260626/`.
QC-ONLY — NO paper edits made (operator entry 281).

## Manager cross-check (verified vs overstated vs already-hedged)

### Headline: VENUE FIT (the dominant, real theme — F3/F4/F5/M4/M7)
WINE (Web & Internet Economics) expects mechanism-design rigor: incentive compatibility / IR, equilibrium
of trader strategies, welfare or approximation-ratio analysis, simulation. The paper is a construction +
pricing paper with NONE of these (funding equilibrium deferred; no LP fee/rationality; no welfare/sim;
one illustrative example). This is the biggest strategic QC pointer: either WINE is a venue-fit risk, or
the paper needs a substantial incentive/equilibrium/welfare section. OPERATOR CALL.

### Submission BLOCKER — double-blind (F1) — VERIFIED (lab partly overstated)
- `TemporalAMM` (Lean structure/protocol name, ×3) — self-identifying. REAL; genericize.
- `Aristotle` (prover named, ×2) — borderline de-anonymizing; safer to say "an external Lean prover."
- Lab claim "companion [temporal-barrier] has a self-identifying title" — **WRONG**: the bibitem already
  reads "Author(s) omitted for double-blind review." Not a breach.

### Real content QC pointers (verified or clearly valid)
- **M2** — the CENTRAL weight-update map is given as a conservation rule (α=xw, β=y(1−w) conserved at the
  trade point) + a worked example (w'=11/21), but NOT displayed as an explicit `w'=f(x',y',θ,w)` equation.
  Reproducibility pointer: display the map explicitly.
- **M4** — global-w: a trade at one strike reprices the whole surface; no manipulation bound/mitigation.
- **M6** — mark=fair-value is asserted; continuation form `c·S^{-g}` adopted from the Merton framework,
  not derived from the Balancer curve geometry. (Echoes the M4/L7 engine↔object gap.)
- **M9** — no proof w stays in (0,1) over arbitrary trade sequences (we have a model-level Lean lemma,
  L1 trade_seq_on_domain, NOT cited in the paper).
- **M3** — Merton-tie regime r>σ² is practically unreachable for crypto (σ~80% ⇒ r>64%). NUANCE: γ is a
  DESIGN knob (not forced by r/σ), so "γ<1 for DeFi" conflates design-γ with Merton-implied-γ; but the
  tie's exact slice is genuinely unrealistic — worth a sharper caveat.
- **M1** — be explicit about WHICH ODE yields the quadratic γ(γ+1)=2r/σ² (the zero-carry/symmetric-pairing
  ODE) vs the standard no-dividend Merton ODE; we corrected the convention but don't name the ODE.
- **M11** — QuantAMM-as-prior (per-trade vs per-block) needs a proper citation, not asserted.
- **F4/M7** — LP economics (fees, participation rationality) and LVR round-trip residual unanalyzed.

### Already disclosed / hedged (lab re-stating our own limits)
F2 (American = deterministic-only, Snell named-not-formalised); M5 (conditional solvency B1/B3/B4);
M8 (Aristotle not public — trusted-from-prover); M10 (static-m is the operator's design choice).
