# Manager audit — MertonSigmaGamma (σ↔γ map) + v26d vol-knob build · 2026-06-09

## A. MertonSigmaGamma Lean obligation — AUDIT PASS (trusted-from-prover)
Archive: `formal/aristotle_runs/MertonSigmaGamma/` (research-lead run, agent a71bc3e4).
- **Token scan (grep -rnE, NOT -D):** no `sorry`/`admit`/`native_decide`/`sorryAx`/`axiom`/`opaque`/
  `unsafe` in the .lean. (Only the prose ARISTOTLE_SUMMARY.md names those words.)
- **Standalone:** `import Mathlib` only — canonical `temporal_lean_verified` tree structurally untouched.
- **Statements read + math re-derived independently (manager):**
  - `char σ r q λ = ½σ²λ(λ−1)+(r−q)λ−r` — correct Cauchy–Euler characteristic quadratic.
  - `root_neg`: char σ q q (−γ)=0 under r=γ(γ+1)σ²/2. Re-derived: r−q=0 ⇒ char=½σ²γ(γ+1)−r =
    γ(γ+1)σ²/2 − γ(γ+1)σ²/2 = 0. ✓ (genuine `ring` proof — LOAD-BEARING.)
  - `root_pos`: char σ q q (γ+1)=0 same hyps. ½σ²(γ+1)γ − r = 0. ✓ (LOAD-BEARING.)
  - `sum_roots`: (−γ)+(γ+1)=1 (trivial). `sum_eq_one_iff_rq`: (1−2(r−q)/σ²)=1 ↔ r=q, σ≠0 (algebra,
    `grind +qlia`). `sigma_gamma_map`: from product (−γ)(γ+1)=−2r/σ² ⟹ γ(γ+1)=2r/σ² (`linear_combination`).
  - HONEST DEPTH: the substantive content is root_neg/root_pos (the two engine boundaries' exponents
    ARE the quadratic's roots on the r=q slice); sum/product theorems are light algebra. No weakening,
    no false/vacuous hypotheses, no over-claim. research-lead's "proved" is accurate.
- **Provenance:** archive has no `#print axioms`; axiom-cleanliness {propext,Classical.choice,Quot.sound}
  is per Aristotle SUMMARY only. Label = **trusted-from-prover** (NOT "verified" — env-blocked local build).
- **Mechanical emend noted:** `char` param `λ`→`«λ»` (Lean-4 keyword escape). Meaning/constants unchanged.
- **Connection:** R1 (proved-trusted) already gives the C¹ smooth-pasting at both boundaries
  (McKean/Merton free-boundary conditions). R1 + MertonSigmaGamma = full Merton identification
  (boundary geometry + characteristic exponent). VERDICT: FOLD.

## B. v26d vol-knob engine build — manager-VERIFIED at Node level
File: `engine/builds/temporal_mvp_v26d_volknob.html` md5 `16a872ba33e38843b803d79667b199f5`
(built from HEAD v26c `6cc73563`; HEAD untouched). Intern run agent a182335c.
- **Blobs (content-based, manager-run):** exactly 2 lines >2000 chars — line 74 webp `ab663f5c…`
  (unchanged), line 1113 svg `c505b08a…` (byte-identical; moved from 1060 because the `.vol-knob` CSS
  sits above it in <style>). md5 multiset == canonical. Longest non-blob line 553.
- **Gates:** `run_all.sh <v26d>` exit 0 — 7 GH gates + seam (both branches) + dir_gate PASS.
- **G4/Merton on v26d itself (manager-run /tmp/merton_v26d.cjs):** d log sNorm/d log S=−γ (≤1.9e-3),
  S*=Kγ/(γ+1) exact (≤7e-12), continuation==(1/(γ+1))(S/S*)^(−γ) (≤6.3e-4), γ∈{1.5,2,3,4}. Pricing
  law + Merton structure preserved.
- **Diff HEAD→v26d = 7 hunks, all expected:** CSS panel (607a), HTML panel (1387a), ghCalibrate
  δ-param (1623,1624c — signature `(…,gamma,delta)` + `if(!(delta>0))delta=0.08`, body byte-preserved),
  GH_GAMMA comment (2258a), `setShape` mutator (2378a — re-warp in place at current operating point,
  reassigns gh* scalars only, keeps x/y/α/β/oracle+bands, NaN-guards, γ>1/δ>0), Store export +setShape
  (2681c), UI wiring (2752a). **Locked surfaces byte-UNTOUCHED** (diff grep for getMP_raw/tradeUpdate/
  rebase/arbitrageToOracle/markFrac/funding/closeBand/drawStrikeMark/drawStrikeRay/min(1/carvedNotional/
  attributablePnL/trader_payout = empty). §6 dollar-path stop NOT triggered (re-warp needed no dollar change).
- **LINE-PIN NOTE for promotion:** svg moved 1060→1113 ⇒ on HEAD promotion update run_all.sh
  `sed -n '1060p'`→1113 + whole-file md5 want, and CLAUDE.md §3 "line 1060" reference. Hook is
  content-based (unaffected).
- **OWED before HEAD:** tester live UI pass (σ stepper re-warps curve; pro-forma dotted + stepper
  re-trace after a σ change; graphs redraw; lock/unlock toggle; γ>1 floor note; no console errors).
  VERDICT: candidate build sound at Node level; HOLD HEAD promotion for tester-confirmed.
