# Round 8 — /api/amm/marks endpoint: version fingerprint + option-pricing match (manager, 2026-07-10)

The updated SOP (operator entry 24) exposed `/api/amm/marks` — the per-strike lensed option marks, the
endpoint I'd flagged as the single blocker. It resolves the version question AND the option-value check.

## Direct results (evidence: `run6_api/marks_grid.json`, `marks_verify.js`)

**1. VERSION FINGERPRINT — staging IS the v28-lens engine.**
`/api/amm/marks` returns `"engine": "v28-lens"`, plus `gamma`, `m`, `kappa`, `g_loc`, and a per-strike
`{k_usd, theta, call_mark, put_mark}` grid. `engine=="v28-lens"` directly confirms staging runs the v28
LENS line — **not v24** (H1). (The reference builds `5ce1a76c` (H3) and `80f050e2` (H2) are both v28-lens;
v24 is not.)

**2. OPTION PRICING — staging matches the reference engine EXACTLY.**
I loaded the reference engine (`builds/HEAD_temporal_mvp_v28_lens.html`, md5 `5ce1a76c`) and computed
`markLensed(wing, theta, sNorm=1, g)` for staging's 8 strikes at staging's configured g:
**MAX |staging call/put mark − reference markLensed| over 8 strikes = 0.000e+0 (exact).**
So staging's option-value math is a faithful, exact implementation of the reference lens engine.

**3. CONFIG — staging runs γ=1, m=1 (g_loc=1); the golden is γ=2.**
Staging reports `gamma:1, m:1, kappa:0.02` → g_loc = m·γ = 1. The golden constants ($66.67 / value ⅓ /
ATM 0.148) are **γ=2** values. So staging can't show those numbers — not an engine defect, a **config
setting**. Cross-check both ways:
- Staging ATM value (g=1) = **0.25**; reference `markLensed(put,1,1,1)` = 0.25 ✓ (staging internally correct).
- Reference at g=2: `markLensed(put,1,1,2)` = **0.1481** = golden **0.148** ✓ (validates the golden + my usage).
So: staging = the same engine, just dialled to γ=1 instead of γ=2.

## §1 (option constants) — now RESOLVED at the engine level
- Staging option marks = reference engine, exactly (Δ=0). The engine reproduces the reference pricing.
- Staging is configured at γ=1, so its numbers are the γ=1 family (ATM 0.25), not the γ=2 golden. To
  compare against the golden $66.67/0.148 directly, staging must be set to γ=2 (the `?gamma=2` query is
  ignored — γ is a server config).

## OBSERVATION for the CTO (not a false-flag — a real config question)
Staging runs **γ=1**, which is the degenerate boundary. The reference/spec requires **γ>1** for the
pricing law `value ∝ S^(−γ)` and for the kurtosis/steepness knob to do anything (γ=1, m=1 = the plainest
possible curve, no steepening). Question for the CTO: is γ=1 the intended staging default, or should it
be γ=2 (the golden/handover config)? It's a one-value config change; the engine itself is correct.

## Net (supersedes round 7's "version unpinnable")
Round 7 said the version was unpinnable (no curve endpoint). This endpoint pins it: **staging is the
v28-lens engine and its option pricing matches the reference exactly (Δ=0)** — configured at γ=1. The
v28-lens fingerprint + exact markLensed match place staging firmly in the lens line (H2/H3), not v24.
Distinguishing H2 vs H3 specifically (linear-reseam ITM, trade-point warp) would need a γ>1 config +
an ITM-seam read and an off-ATM trade — but "correct v28-lens engine, exact pricing" is now established.
