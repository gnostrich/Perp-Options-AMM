# SKEPTIC VERDICT — staging e2e round 8, /api/amm/marks endpoint (2026-07-10)

Gate target: `evidence/staging_e2e_2026-07-10/REPORT_round8_marks_endpoint.md`
Evidence: `run6_api/marks_grid.json` (staging live response), `run6_api/marks_verify.js` (manager script).
Reference: `/tmp/testkit/temporal_staging_test_kit/builds/HEAD_temporal_mvp_v28_lens.html` md5 `5ce1a76c…` (confirmed via `md5sum` + MANIFEST).
Method: re-ran `marks_verify.js` verbatim AND an independent per-strike/multi-convention re-derivation of my own. Also directly probed the co-shipped v24 build in the kit.

## VERDICT: CLEAR-TO-RELAY — no FLAG. All five claims hold; the manager under-argued two points but did not overclaim.

---

### 1. "engine=='v28-lens' … not v24" — CLEAR
> "`engine==\"v28-lens\"` directly confirms staging runs the v28 LENS line — **not v24** (H1)."

- `marks_grid.json` literally opens `{"engine":"v28-lens","gamma":1,"kappa":0.02,"m":1,...}`. Confirmed.
- "not v24" is JUSTIFIED and in fact stronger than the report argued. The report leaned on the self-reported string. Independent checks: the string `"v28-lens"` appears in **neither** HTML build — it is a server-side (Go) identifier, not copied from source. More decisively, the kit's v24 build (`temporal_mvp_v24_rebase_fixed_2.html`) contains **zero** `markLensed` (v28-lens: 21); v24 has no `g_loc`/`m`/lens concept at all. The endpoint's very shape (per-strike `call_mark`/`put_mark` + `g_loc` + exact match to the lens-only `markLensed`) is a lens-line fingerprint independent of the string. v24 cannot emit this endpoint.
- Does NOT overclaim H2 vs H3: the report explicitly states both `5ce1a76c` (H3) and `80f050e2` (H2) are v28-lens and that H2/H3 are not distinguished. Correct.

### 2. LOAD-BEARING: per-strike marks match `markLensed(wing,theta,1,g)`, MAX Δ=0.000e+0 over 8 strikes — CLEAR
> "MAX |staging call/put mark − reference markLensed| over 8 strikes = 0.000e+0 (exact)."

- Re-ran `node marks_verify.js` from the kit: `MAX |staging - reference markLensed(g=1)| over 8 strikes = 0.000e+0`. Reproduced.
- Per-strike independent check: ALL 8 strikes match to `0.00e+0` on BOTH wings (call 0.5→0.1667, put 0.125→0.375 — non-trivial, strike-varying values `1/(4θ)` and `θ/4` at g=1). Not a single-point coincidence.
- **sNorm cherry-pick concern — REFUTED.** sNorm=1 fits all 8 to exactly 0. I re-tested the two alternatives the manager had tried: sNorm=1/θ → MAX Δ=**2.5e-1**; sNorm=θ → MAX Δ=**2.5e-1**. sNorm=1 is uniquely exact across all 8 — it is THE convention, not a strike-0-fitted pick. Corroborated independently: staging's own response declares `"s_norm":1`. This is the correct read; the manager's convention matches staging's declared normalization.

### 3. Config γ=1/m=1 and "reference g=2 → 0.148 golden" — CLEAR
> "Staging reports `gamma:1, m:1` … Reference at g=2: `markLensed(put,1,1,2)` = **0.1481** = golden **0.148** ✓"

- `marks_grid.json` shows `"gamma":1,"m":1` and `g_loc:1` per strike (m·γ=1). Confirmed.
- Reproduced `markLensed('put',1,1,2)=0.1481`. Matches golden 0.148.
- "config not defect" framing is SOUND: staging matches its own g=1 reference EXACTLY (ATM 0.25 = `markLensed(put,1,1,1)`), and the same engine at g=2 produces the golden. The golden gap is fully accounted for by the γ setting, not a math divergence. Not excusing a real defect.
- Minor rough-edge observation (NOT a report claim, no FLAG): the verify script's exploratory seam line prints `0.0659` while labeling it "(golden seam value 1/3=0.333)". That line is mis-parameterized (`markLensed('put',0.6667,1,2)` reads the continuation at sNorm=1, not the boundary; the seam value is `markLensed` at sNorm=sStar = `1/(g+1)=1/3`). The REPORT does not cite this line — it cites only the ATM 0.148, which is correct. Harmless to the report; flagged only as a sloppiness note in the script.

### 4. γ=1 observation to CTO — CLEAR, correctly scoped
- γ=1 is outside the spec range γ∈(1,4) / γ>1 (CLAUDE.md §4; value∝S^(−γ) + the kurtosis knob both need γ>1). Raising it as "is γ=1 intended or should staging be γ=2? one-value config change, engine is correct" is a legitimate config question, not a false engine flag. Fair.

### 5. Net claim "version pinned to v28-lens line; exact pricing; H2-vs-H3 not distinguished" — CLEAR
- Right amount of claim. Does not overclaim H3 (explicitly leaves H2/H3 open, correctly notes γ>1 + ITM-seam/off-ATM-trade reads would be needed). Does not underclaim the exact match (Δ=0 stated plainly). "Pinned to the LINE" (not a specific build) is exactly what the evidence supports.
- Mild UNDER-claim (in the manager's favor, no correction needed): the report did not cite (a) staging's own `s_norm:1` field, which independently validates the sNorm=1 convention, nor (b) that v24 has zero `markLensed` — both strengthen the v24 exclusion beyond the self-reported string. The report is if anything conservative here.

## Bottom line
Numbers all reproduce. The load-bearing Δ=0 is real and non-cherry-picked (uniquely-fitting convention, corroborated by staging's declared s_norm and by the exact per-strike match on both wings). The v24 exclusion is sound and actually understated. No overclaim in this report; the one blemish (a mislabeled seam line) lives in the throwaway part of the script, not in any report claim. CLEAR to relay to the operator.
