# 03 — Work queue (prioritized)

Each item: owner (subagent), acceptance criteria, and any gotcha. Verify every return per `00_ORCHESTRATOR_START_HERE.md` §3/§7.

## P0 — v26b: ITM / American exercise  → intern
**Spec:** `specs/SPEC_itm_exercise_smoothpaste.md` (build spec) + `specs/SPEC_itm_exercise_smooth_pasting.md` (derivation).
**Base:** `build/temporal_mvp_v26a.html` (slipfix, md5 89ae89e9).
**Change:**
1. Mark rule: replace `sN < θ ? sN/θ : 1` with the smooth-pasting rule — continuation `c·sNorm` (`c = 1/((γ+1)·sNorm*)`) up to `sNorm* = θ·((γ+1)/γ)^γ`, then intrinsic-from-strike for `sNorm ≥ sNorm*`.
2. Drop the redundant "Eff strike" column (under from-strike it always equals Orig strike; rename header "Orig strike" → "Strike").
3. Settlement: the exercise change is stage-2 / mark only. Stage-3 dollar conversion via `entryPerpMark` is unchanged and uniform — **no exercise-specific dollar path.** If the build seems to need one, STOP and report.
**Acceptance:** new seam gate passes (value-match ≤0.05%, slope-match ≤0.1% at `sNorm*`); 7 gates still pass; curve/calibration/funding **byte-unchanged**; diff is surgical (mark rule + column drop + seam gate only); file-safety clean.
**Gotcha:** insulated from the getMP_raw/slope trap — works in `sNorm`/`getSNorm`/θ. Don't let it touch the slope.
**Then:** tester browser run.

## P0 — CTO propagation of the slipfix → architect / CTO
Slipfix `89ae89e9` is fully cleared. It's corrective and independently propagatable to the Go staging backend (the CTO works from the HTML via Drive). v26a/slipfix can ship ahead of v26b.

## P1 — Lean: instantiate GH, discharge the 4 gate fields → prover (Aristotle)
**Material:** `formal_lean/` (curve-agnostic machine proof; `MANAGER_VERIFICATION.md` for the audited state) + `engine_knowledge/ARISTOTLE_hyperbolic_curve.md` (the GH math).
**Task:** instantiate the GH curve against the machine's typed interface and discharge the 4 gate fields: `convex_dom`, `antitone_y`, `convex_y`, `coercive = BddBelow`.
**Acceptance:** sorry-free, standard-axiom only (`[propext, Classical.choice, Quot.sound]`). **Watch `coercive = BddBelow`** — GH has *bounded* reserves, so this field needs care (it's where an instantiation is most likely to fail). If your environment compiles Lean, verify first-party; else trusted-from-prover, stated as such.
**Note:** solvency stays conditional on B1 (port-pays = the κ-extrinsic funding limit) until B1 is discharged against the real engine. The port is necessary, not sufficient.

## P1 — Ship-gate B1: funding-coverage sweep → manager/intern
The one thing geometry can't close: κ is extrinsic (a calibration choice, not a curve property). B1 ("port pays") is only closeable as **shape-match × κ-calibration** — sweep funding coverage across the strike continuum and confirm the port covers the convexity it funds. This is the headline solvency condition.

## P2 — Layer-2 honest-dollar slippage $ → manager/intern (non-blocking)
The UI's slippage `$` is currently Layer-1 reserve-USD (correctly labeled). A trader-faithful figure routes the reserve-USD through the **existing** carved-perp settlement chain (oracle/oi · L0.N) — reuse it, don't improvise. If not cleanly reachable at the slippage site, ship `%` alone and defer. Separate task.

## P2 — Re-PDF / stale-mark prior v26a evidence slippage line → tester (after v26b)
The prior v26a evidence PDF's Fix-3 slippage conclusion is stale (it ratified the e^μ-inflated formula). The rest of it stands. Supersede with a fresh PDF after v26b, or formally stale-mark the one line.

## Publication track (architect + paper subagent)
- **WINE 2026** — deadline **July 2, 2026** (confirmed).
- **AFT 2026** — notification **July 15, 2026** (already submitted; `publication/Temporal_Paper_AfT_2026_v6.docx`).
- **FMBC 2027** — targeted for the Lean verification paper (OASIcs proceedings + JLAMP special-issue pipeline).
- Must-cite for future versions / AFT rebuttal: **Singh et al.** (LVR as a continuum of perpetual options).
- Open theory question (genuinely outside the static span): whether finite-maturity options decompose over the perpetual strike continuum via a time-BL kernel Φ — the exponent bends to r(λ) ≠ Γ, so it's not free.

## Convention to ratify (cheap, do early) → architect
File-safety blob check: standardize on **one** measurement layer (recommend decoded-binary md5 `8d2e1a84/1b320fc5`). Closes the phantom blob-ledger thread for good. See `build/INTEGRITY.md`.
