# AfT paper — Dexter's Lab referee pass + manager cross-check (2026-06-23)

**Subject:** `paper/temporal_paper_american_2026.tex` (the American-style generalization draft).
**Lane:** `lab_review.sh` (operator-authorized entry 271), OpenRouter panel SKIPPED (no key),
~$10.10 Claude session cost, exit 0. Raw artifacts (gitignored, ephemeral) were under
`dexters-lab/lab_home/reviews/review-aft-american-20260623/`. Distilled + cross-checked here so the
findings persist.

**Lab verdict:** weak reject, confidence 4/5. Novelty verdict POSITIVE (genuine contributions:
per-trade endogenous weight update as a state-transition system; single-pool full-OTM-continuum
pricing; American smooth-pasting boundary from AMM geometry with machine-checked C1 seam).

## Manager cross-check (each issue → real signal vs known-and-hedged vs verified-down)

| Lab issue | Manager assessment |
|---|---|
| **F1 — Merton tie `γ(γ+1)=2r/σ²` "fatal error"** | **DOWNGRADED to a prose convention gap** (research-lead adjudication, manager-verified independently). NOT fatal. See below. |
| **F2 — Aristotle not publicly reproducible** | REAL + already known. We label `\tfp` = trusted-from-prover, never "verified." Fix = publish/point to the `formal/` Lean source. |
| **M1 — American optimality is a Lean `True` placeholder; Snell not formalized** | REAL + already a known-OPEN item we hedge. Confirms the hedge is load-bearing. |
| **M2–M5 — funding constant / rebase governance / port-provider B1 / settlement-ledger B4 unspecified** | REAL gaps but ALREADY labeled conditional (solvency conditional on B1/B3/B4). Scope, not undisclosed defect — but hedges aren't prominent enough to stop a "major" tag. |
| **M6 — Merton domain mismatch (`r>σ²` vs `r>σ²/2`)** | Tied to F1. Under the paper's actual (quadratic, q=r) convention the bound is **r>σ²**; the lab's `r>σ²/2` corollary is the no-dividend (linear) reading. If the paper states an explicit r–σ bound it must read r>σ². |
| **M7 — zero empirical content (only 4-point seam check)** | REAL + addressable. One worked pricing example / calibration sketch answers it. |

Soundness table: 18/20 claims hold or hold-with-caveats; only C24 (Merton, now downgraded) = "error"
and C41 (settlement ledger, B4 open) = "cannot-evaluate."

## The Merton catch (F1/C24) — verified adjudication

Laplace exponent ψ(u)=½σ²u²+(r−q−½σ²)u, harmonic condition ψ(λ)=r. Roots' **product is always
−2r/σ²**; **sum = 1 + 2(q−r)/σ²**.
- **q=0 (no-dividend, classical Merton — what the lab tested):** roots {1, −2r/σ²}; decaying root ⟹
  **γ = 2r/σ² (LINEAR).** Lab is correct *for this slice*.
- **q=r (symmetric put/call-root pairing −γ and γ+1, root sum = 1):** product (−γ)(γ+1)=−2r/σ² ⟹
  **γ(γ+1)=2r/σ² (QUADRATIC).** This is the paper's form, and the *only* convention that yields it.

Manager independent check (node, ½σ²λ²+(r−q−½σ²)λ−r=0): q=r,σ=1,r=3 → roots {3,−2}, sum=1,
prod=−6=−2r/σ², γ=2, γ(γ+1)=6 ✓. q=0,σ=1,r=1 → roots {1,−2}, γ=2=2r/σ² (linear) ✓.

**Our own machinery uses the QUADRATIC, consistently:** `faith_merton.js:105` `rGauss=g*(g+1)*σ²/2`;
Lean `MertonTie.lean` `merton_vieta_prod` (quadratic) + `merton_vieta_sum` (sum=1 ⟺ r=q, the gating
convention). So engine + Lean are self-consistent on the quadratic; the defect is purely the paper's
**prose** calling it the "classical no-dividend Merton" slice.

**Fix (paper prose only; NO formula/gate/Lean change):** at lines 604–613 and 766–771, state the
symmetric-pairing/carry convention (q=r, root sum 1) under which γ(γ+1)=2r/σ² holds, and note the
no-dividend GBM slice gives γ=2r/σ². If any explicit r–σ domain bound appears, use r>σ².

## Actionable to-do (PENDING operator go — paper claims = §7 operator's call)
1. Merton convention caveat (the only substantive one).
2. Publish / point to `formal/` Lean source (answers F2 reproducibility).
3. Surface conditional-solvency hedges (B1/B3/B4) more prominently (answers M2–M5 framing).
4. Add one worked pricing example / calibration sketch (answers M7).

## Process note
The lane breached its OUTDIR sandbox once (wrote a fake operator transcript via inherited CLAUDE.md;
contained, see `README_breach_2026-06-23.md`). Open operator decision: isolate future lanes in a
worktree without `history/` (manager rec) vs run as-is + clean up.
