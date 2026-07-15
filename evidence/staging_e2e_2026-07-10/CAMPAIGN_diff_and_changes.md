# Staging vs latest reference (5ce1a76c / H3) — comprehensive alignment campaign + change summary
Manager, 2026-07-10. All staging numbers = live `staging-be.temporal.exchange` API; all "reference" =
the kit's md5-verified engine `builds/HEAD_temporal_mvp_v28_lens.html` (5ce1a76c), run in Node.
Evidence: `campaign/` (marks_40.json, battery.jsonl, trade_battery.log, phase1/2.js) + `run6_api/`.

## ✅ ALIGNED — verified to machine precision (no change needed)
| # | What | Method | Result |
|---|---|---|---|
| A1 | **Engine version** | `/api/amm/marks` fingerprint | `engine:"v28-lens"` — the lens line; the v24 build has zero `markLensed`, so it cannot emit this |
| A2 | **Option pricing (call+put, 40 strikes θ∈[0.5,1.5])** | staging marks vs reference `markLensed(wing,θ,s_norm,g)` | MAX |Δ| = **5.6e-17** (call 0), **0** value<intrinsic violations |
| A3 | **Trade → pool update (5 band types: long/short, near/far-OTM, barrier-only)** | staging Δpool vs reference `tradeUpdate` | each = reference **spot law** to ≤**1.8e-15**; α,β conserved |
| A4 | **Input validation** | staging vs reference OTM check | staging's reject string **byte-identical** to reference `executeBand` reason (`"…not OTM on <wing> wing…"`) |
| A5 | **Round-trip open→close** | pool before-open vs after-close | returns **exactly** (Δx=Δy=Δα=Δβ=Δw = 0.000e+0); clean reversal, no leak |

## ⚠ CANNOT VERIFY YET — blocked, mostly by the γ=1 config
| # | What | Why blocked |
|---|---|---|
| B1 | **Kurtosis / steepness (m, γ>1)** | staging runs **γ=1, m=1** (g_loc=1). The knob is inert here; the whole steepness behavior is untestable until γ>1 |
| B2 | **Funding = ray deviation** | at m=1: `c=(g_anchor−g)/(g_anchor+1)=(1−1)/2=0` → deviation is **identically 0** by construction; the formula can't be exercised at γ=1 |
| B3 | **ITM exercise seams / close-continuity ($66.67, no ½-jump)** | the golden seams are γ=2; at γ=1 the call seam sits at θ=2, **outside** the marks endpoint's ±50% window [0.5,1.5] |
| B4 | **Trade-point warp at ρ≠1 (the H2-vs-H3 discriminator)** | staging conserves global α,β on every band (the ρ=1 spot signature); I could not cleanly invoke the reference `executeBand` (barrier/orchestration arg-shape) to confirm whether the reference also conserves them for a band — **unresolved** |
| B5 | **Code-level check of staging** | staging is the CTO's Go backend — no source access; I diffed **outputs**, never code |
| B6 | **Deeper compositions** | covered many single-band types + round-trip; did NOT test multiple simultaneously-open bands, partial closes, or a trade composed with an oracle update (rebase) |

## 🔧 SUMMARY — what needs to change (for the CTO)
1. **[HIGH · one config value] Set staging γ = 2 (it's currently γ=1).** γ=1 is the degenerate boundary
   (spec requires γ∈(1,4)); at γ=1/m=1 the steepness knob does nothing and funding is identically zero.
   This single change unblocks B1/B2/B3 and makes staging show the actual product behavior + the golden
   numbers ($66.67 / 0.148 / seams).
2. **[MED · endpoint] Widen `/api/amm/marks` strike window beyond ±50%** (now θ∈[0.5,1.5]) so the ITM
   exercise seams and close-continuity are observable (the γ=2 put seam is θ=0.667, call θ=1.5-edge;
   deeper ITM needs a wider window).
3. **[MED · confirm behavior] Band pool-swap booking:** staging conserves global α,β on every band incl.
   off-ATM/barrier (spot-law signature). Confirm this is the intended reference behavior (spot-booked
   band vs trade-point warp) — I couldn't settle it against the reference band fn.
4. **[for full sign-off · code] Run the acceptance harness server-side.** Output-diffing can't cover the
   Go code paths; have the CTO run `lens_selfcheck.js`'s numeric checks (or the equivalents) against the
   Go engine, or share the source, to close B5.
5. **[after γ=2] Re-run the funding + ITM-seam + round-trip-charge-back checks** — all degenerate/moot at
   γ=1; only meaningful once γ>1.

## Net
Everything **reachable at γ=1 is exactly aligned** (engine, option pricing, spot-trade law, validation,
clean round-trip) — the port is faithful where measurable. The gaps are **not observed divergences**;
they're **untestable-at-γ=1**. The single highest-leverage change is **set γ=2**, then re-run the campaign.
