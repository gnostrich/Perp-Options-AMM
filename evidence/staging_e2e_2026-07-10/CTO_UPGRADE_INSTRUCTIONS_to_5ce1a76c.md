# CTO instructions — upgrade staging to the July-8 engine (`5ce1a76c` / H3)

Prepared by the Temporal verification side, 2026-07-10. Two inputs are fused here:
- **Authoritative change list:** the handover changelog `CHANGELOG_for_CTO` (covers your `80f050e2` (14 Jun)
  → `5ce1a76c` (8 Jul)). Items tagged **PORT** below are quoted/condensed from it — they are the spec.
- **What our live staging test already found** (campaign `evidence/staging_e2e_2026-07-10/`): staging today
  reports `engine:"v28-lens"`, **configured at γ=1, m=1**, and its option pricing matches the reference
  engine **exactly** in the ±50% window. Because γ=1 is degenerate, most H2→H3 deltas could NOT be
  verified on staging yet — so each item below carries a **staging status** and a **verify-after-upgrade**.

Target engine file: `HEAD_temporal_mvp_v28_lens.html` md5 **`5ce1a76c7b75ec3763fda6df9538a841`**.
Acceptance test (run against your Go engine): `lens_selfcheck.js` (**41 checks**) + `a16_atm_gate.js` (**5**).

---

## STEP 0 — Config (do this first; it's the top blocker)
**Set γ = 2 (staging is currently γ = 1), and drive m from the asset vol (m=1 baseline).**
γ=1 is the degenerate boundary — the spec requires **γ ∈ (1,4)**. At γ=1/m=1 the steepness knob does
nothing, funding is identically zero, and the golden numbers ($66.67 / 0.148 / seams) can't appear. This
one value unblocks items 1/3/5 below and makes staging show real product behavior. *(Confirmed live: the
`?gamma=` query is ignored — γ is server config.)*

## STEP 1–5 — Engine deltas 80f050e2 → 5ce1a76c (all **PORT** = changes numbers, must implement)

| # | What to port (from the changelog) | Golden to reproduce | Staging status (our test) | Verify after upgrade |
|---|---|---|---|---|
| **1** | **ITM option prices + exercise line fixed.** Below the strike, prices were too low and the "exercise now" line was misplaced. | put K=$100, γ=2: exercise line **$66.67**, value **⅓**, ATM **0.148**; m=3: **$85.71**, **⅐**, **0.057**. **Hard rule: price never below intrinsic.** | Pricing matches reference **exactly at γ=1** in θ∈[0.5,1.5]; the ITM-seam region ($66.67 etc.) is **γ=2 + outside our window → UNVERIFIED**. | after γ=2, read `/api/amm/marks` across the seam; check the 3 numbers + value≥intrinsic |
| **2** | **Trade bends the curve at the trade's own spot, not the pool middle** (`tradeUpdateAt` at ray∩curve). | pool (10,10,w=½), ray 4, cash-in 1 → **w′ = 11/21** (old wrong = 22/43). Ordinary spot trades unchanged. | staging conserves α,β on every band = the **spot (ρ=1) law**; the off-spot warp (11/21) is **UNRESOLVED** — a real risk it's still spot-booked. | drive an off-ATM trade with known ρ; confirm global α,β **move** to the 11/21-law value, not stay put |
| **3** | **One steepness knob `m`** (m=1 normal, bigger = steeper everywhere, trades land further out; set once from vol). | m scales the option-value exponent g=m·γ at every strike. | present but **inert at m=1/γ=1 → UNVERIFIED** that it steepens. | after γ=2, sweep m∈{1,3}; confirm marks steepen and match golden (m=3 → 0.057 ATM) |
| **4** | **New close = ONE rule: every leg sells back to the pool at today's price** (no two-case; payout smooth across strike, no ½-jump). Trader is paid the option value computed **before** the pool trade. | payout continuous across the strike; the old `twocaseclose` build (bundled) is the WRONG behavior to diff against. | our round-trip returned **Δ=0 exactly** — but on a shared pool at γ=1, **inconclusive**: it does NOT distinguish the new clean close from the old exact-restore. | after γ=2, close an ITM-adjacent position; confirm **no payout jump** at the strike + payout = pre-trade option value |
| **5** | **Funding = the DEVIATION input only** (not the rate/transfer yet). Correct measure = ray deviation pool-curve vs balanced-anchor at same slope; **zero on balanced pool, zero ATM, zero ITM**. | `dev = |c·ln(K/mode)|`, `c=(g_anchor−g)/(g_anchor+1)`, g=m·γ, g_anchor=m; label **"Funding (ray dev; TBD)"**. | at m=1, `c=(1−1)/2 = 0` → deviation **identically 0**; balanced-pool-zero is trivially true → formula **UNVERIFIED**. | after γ=2 **and a skewed pool** (w≠½), confirm dev matches the formula + stays 0 on a balanced pool |

## STEP 6 — Acceptance (this is the real sign-off; closes the code-level gap we couldn't)
Run **`lens_selfcheck.js` (41)** + **`a16_atm_gate.js` (5)** against your Go engine (port the checks, or run
the numbers through it). Every golden above is asserted there and each check fails loudly if wrong. We
independently reproduced **41/41 + 5/5** against `5ce1a76c` — that's your pass bar. *(We could only diff
staging's API **outputs**, never your Go source; this harness is how you cover the code paths.)*

## STEP 7 — Endpoint (needed so the above is verifiable)
Widen `/api/amm/marks` strike window beyond the current **±50% (θ∈[0.5,1.5])** so the ITM exercise seams
(item 1) and the close-continuity (item 4) are observable. Right now the seam region is off-screen.

## ⚠ SAFETY — before any multi-party / shared pool
The new close (item 4) does **not** perfectly restore the pool: a tiny **~trade-size²** shortfall remains
(non-extractable — the trader is only ever paid the option value, never the pool's reserves; verified in
code). Harmless single-user; in a shared pool the LPs bear the drift. **Do NOT run the shared/multi-party
pool without update-2** (the charge-back that cancels it — designed in `FIX_close_b_receipt_charge_PARKED`,
not built into this version). Also not in this version: funding cash actually moving, and read-smoothing.

## One-line summary
**Set γ=2, port the 5 numbered engine deltas (ITM prices, trade-point warp, m-knob, clean one-rule close,
ray-deviation funding), pass the 41+5 harness against your Go engine, widen the marks window, and hold the
shared pool until update-2.** Staging is already the right engine (v28-lens) and prices correctly at γ=1;
items 1–5 are what separate the 8-Jul build from your 14-Jun one, and most are only verifiable once γ>1.
