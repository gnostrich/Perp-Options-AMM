# Staging → 8-Jul engine (`5ce1a76c`) — COMPLETE upgrade reference for the CTO

**This is the authoritative, complete version** — grounded in a real function-by-function diff of all three
`<script>` blocks (`temporal_mvp_v28_lens_constmult` = your 14-Jun `80f050e2` behaviour, vs the 8-Jul
`5ce1a76c`), not just the prose changelog. Every row's **i. code** column is a verified engine/state/UI
symbol. Read each factor as: **i. code · ii. plain English · iii. math · iv. example**, then a **current →
desired → staging-now** comparison.

**The whole delta, in one line:** engine block = 6 functions touched (4 changed + 2 added; 23 unchanged);
state block = 2 changes (m-clamp, frozen-arc); UI block = ~240 lines (display, mostly backend-skip).
Tags: **PORT** = backend must implement · **CONFIG** = a setting · **UI** = frontend-only · **KEEP** = must stay identical.

---

## Factor 0 — Steepness setting γ · **CONFIG** (from our live test, not a code delta)
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| server config `gamma`; gate `a16_atm_gate` | How steep the option curve is. γ=1 is the flat degenerate edge; the product needs γ>1 or the knob does nothing. | require **γ ∈ (1,4)**; lensed exponent `g = m·γ` | γ=2 → the golden numbers; γ=1 → none |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| γ | 2 (intended) | 2 (intended) | **1 ⚠ set to 2** (`?gamma=` ignored; server config) |

---

## Factor 1 — In-the-money option price + exercise line · engine `markLensed` (CHANGED) · checks `CM4-v2`,`CM10` · **PORT**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `markLensed(wing,θ,sNorm,g)` | Below the strike the old build priced options too cheap and put the "exercise now" line in the wrong place. Fixed. An option is **never** worth less than exercising it. | put seam `S*=K·g/(g+1)`; call seam `K·(g+1)/g`; seam value `1/(g+1)`; ATM value `1/((g+1)·((g+1)/g)^g)`; **hard rule** `mark ≥ max(0,intrinsic)` | put K=$100, γ=2: exercise **$66.67**, value **⅓**, ATM **0.148**; m=3: **$85.71 / ⅐ / 0.057** |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| ITM price | too low; exercise line ~0.444K; can dip **below** intrinsic | correct; exercise line **0.667K**; never below intrinsic | matches reference **exactly at γ=1** in θ∈[0.5,1.5] (Δ≤6e-17); seam region **UNVERIFIED** (γ=1 + outside ±50% window) |

---

## Factor 2 — Trade bends the curve at its own spot · engine `tradeUpdateAt` (ADDED) + `executeLeg`/`executeCompositeLeg` (CHANGED) · check `CM8-v2.2` · **PORT**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `tradeUpdateAt(state,dy,ρ)`; `executeLeg` routes the pool swap through it (`executeCompositeLeg` is an alias of `executeLeg`) | A trade away from the pool's middle bends the curve **at that spot**, not at the middle. Old build always bent at the middle. Plain spot trades unchanged. | conserve local pair at trade point T: `(x_T+Δx)·w′=α_T`, `(y_T+dy)·(1−w′)=β_T`, `x_T=x·ρ^(w−1)`, `y_T=y·ρ^w`. At ρ=1 → plain spot `tradeUpdate`. | pool (10,10,½), ray 4, cash-in 1 → **w′=11/21** (old = 22/43) |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| off-center trade | middle → **22/43**; global α,β conserved | trade point → **11/21**; global α,β **move** off-ATM | conserves α,β on every band = **spot (ρ=1) law**; off-spot warp **UNRESOLVED** — risk still middle-booked. **Verify:** a known ρ≠1 trade should move α,β |

---

## Factor 3 — One steepness knob `m` · engine `gLoc` (**UNCHANGED**) · **already present — no port**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `gLoc(state,θ,m)` | One number sets curve steepness: m=1 normal, bigger = steeper everywhere + trades land further out. Set once from vol. | `g_loc(K)=m·γ` (constant in K); trade map `θ_tx=mode·(chosen/mode)^m` | m=1→g=2 (ATM .148); m=3→g=6 (ATM .057) at γ=2 |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| `gLoc` | present | **byte-identical** (no change) | present; inert at γ=1 → verify steepening after γ=2 |

---

## Factor 3b — Steepness clamp m ∈ [1,6] · state `setM` (CHANGED) + UI input · **PORT** ← *(newly found in the code diff)*
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `setM(t) → state.m = Math.min(6, Math.max(1, t))` | m can only be 1–6. Old build accepted any positive m. Your backend must reject/clamp out-of-range m. | `m ← clamp(t, 1, 6)` | `setM(0.5)`→1; `setM(9)`→6; `setM(3)`→3 |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| m range | any `t>0` | **clamped [1,6]** | untested (m fixed at 1); enforce the clamp server-side |

---

## Factor 4 — Close a position (one rule) · engine `closeBand` (CHANGED) + `revertArc` (ADDED) + state frozen-arc `arc` (ADDED) · checks `CM6-v3`,`CM12` · **PORT**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `closeBand(...)` (both legs reverse live via `tradeUpdateAt`); `revertArc(s,arc,rr)` = frozen-arc reversal helper; each leg stores `arc:{dxA,dyA,dwA,oOpen}` on open | Old close had two cases (OTM legs traded back, ITM legs cashed separately) that didn't line up — payout could **jump ~½** at the strike. New: every leg sells back the same way; **smooth, no jump**. | trader is paid the **option value computed BEFORE the pool trade** (`legPrice(s0)`); pool swap is bookkeeping only — pays the trader nothing extra. `revertArc`: `x₂=x−dxA·r, w₂=w−dwA, α₂=x₂·w₂` | close an ITM-adjacent leg: payout continuous across the strike (no half jump) |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| close | two-case → **½ jump** | one rule → smooth; payout = pre-trade value | round-trip Δ=0 (display precision) — **inconclusive** at γ=1 on a shared pool. **Verify:** after γ=2, close ITM-adjacent, check no jump |

---

## Factor 5 — Funding = ray-deviation INPUT (not the rate yet) · engine `fundingPerStrike` (CHANGED) · checks `FS.2b`,`FE` · **PORT**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `fundingPerStrike(...)` | Old funding charged even on a perfectly balanced pool (bug). Fixed to the **curve skew**: slope of the live curve at the strike → where the balanced curve has that same slope → deviation of the two ray angles. Ships the **input only**, not the rate/cash. | `dev=|c·ln(K/mode)|`, `c=(g_anchor−g)/(g_anchor+1)`, `g=m·γ` (pool), `g_anchor=m` (balanced). **Zero** on balanced pool, ATM, ITM. Label **"Funding (ray dev; TBD)"** | balanced pool: 0 at every strike; skewed pool: small OTM lobe |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| funding | non-zero even on a **balanced** pool (bug) | ray-deviation; **0** on balanced/ATM/ITM | at m=1 `c=(1−1)/2=0` → identically 0 → balanced=0 trivially true → **UNVERIFIED**. **Verify:** after γ=2 **and** a skewed pool |

---

## Factor 6 — Plain spot trade (must stay UNCHANGED) · engine `tradeUpdate`,`arbitrageToOracle`,`rebase` (**UNCHANGED**) · check `CM8-v2.1` · **KEEP**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `tradeUpdate`, `arbitrageToOracle`, `rebase` — byte-identical to v24 | Ordinary at-the-money trades work exactly as before; only off-center/option behavior changed. | `tradeUpdate = tradeUpdateAt(·,dy,ρ=1)`; conserves global `α=x·w`, `β=y·(1−w)` | our 4 bands reproduced this to ≤1.8e-15 |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| spot law | v24 | v24 (unchanged) | **matches reference exactly** (≤1.8e-15) ✅ |

---

## Factor 7 — Display / UI · `ui` block ~240 lines (CHANGED) · **UI (frontend-only; skip for a backend port, listed for completeness)**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `ui` block: chart-2 render, `%/$` toggle, portfolio funding column, captions | Chart-2 now draws the true option-value wings crossing at ATM; a fraction/dollar toggle; a **signed** funding column (negative = the line paid); vol caption "MORE volatile ⇒ LOWER m". | display of `markLensed` values; funding column shows `fundingPerStrike` with sign = wing sign | portfolio funding cell shows a signed number; %/$ button flips units |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| UI | fewer wings, no %/$ toggle, thinner funding col | value-wings + %/$ toggle + signed funding column (17→42 refs) | staging has its OWN UI; funding column present, no "lean". **Backend note:** only the **funding sign convention** matters server-side |

---

## Factor 8 — Vocabulary · labels; gate `vocab_gate.sh` · **UI/labels**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| user-visible strings | Endorsed terms only; never "lean". | — | funding label **"Funding (ray dev; TBD)"**; skew = **"ray deviation / curve skew"** |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| terms | mixed | "ray deviation / curve skew" | no "lean" in API ✅ |

---

## Factor 9 — Acceptance harness (the real sign-off) · `lens_selfcheck.js` (41) + `a16_atm_gate.js` (5) · **PORT the checks**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `lens_selfcheck.js`, `a16_atm_gate.js` | Every number above is asserted here; each check fails loudly if wrong. Run against your **Go** engine — the only way to cover code paths (we can only see API outputs). | 41 + 5 checks | we reproduced **41/41 + 5/5** vs `5ce1a76c` = your pass bar |

---

## Factor 10 — ⚠ Safety: round-trip drift + update-2 · `closeBand` residual · check `CM6-v3` · **HOLD**
| i. Code | ii. Plain English | iii. Math | iv. Example |
|---|---|---|---|
| `closeBand` residual; spec `FIX_close_b_receipt_charge_PARKED` | New close leaves the pool a hair short after open→close. **Non-extractable** (trader only ever gets the option value, never the pool's reserves). LPs bear it in a shared pool. | shortfall `∝ trade-size²`; recovers like impermanent loss | a few $ on a normal trade |

| | Current (14-Jun) | Desired (8-Jul) | Staging now |
|---|---|---|---|
| shared pool | (two-case) | tiny drift — **hold multi-party pool until update-2** | untested at γ=2; single-user harmless |

---

## Complete-delta checklist (so you can trust nothing's missing)
Verified by function-body diff of all 3 script blocks, 80f050e2 → 5ce1a76c:
- **engine — CHANGED:** `markLensed`(F1), `executeLeg`(+alias `executeCompositeLeg`)(F2), `closeBand`(F4), `fundingPerStrike`(F5)
- **engine — ADDED:** `tradeUpdateAt`(F2), `revertArc`(F4)
- **engine — UNCHANGED (23):** incl. `gLoc`(F3), `tradeUpdate`/`arbitrageToOracle`/`rebase`(F6), `executeBand`, `legPrice`, `markEff`, `poolMark`…
- **state — CHANGED:** `setM` clamp [1,6] (F3b), frozen-arc `arc` storage (F4)
- **ui — CHANGED (~240 lines):** chart-2 wings, %/$ toggle, signed funding column, captions (F7)
- **Caveat:** "current" = the reference `80f050e2`, **not staging's actual Go source** (unreadable) — if staging forked from a different build the delta could be larger; ask the CTO which commit staging is built from.

## Do-this list (backend)
Set **γ=2** → implement **F1, F2, F4, F5** + the **F3b m-clamp [1,6]** → keep **F6 spot law identical** →
pass the **F9 41+5 harness** against your Go engine → widen the marks θ-window for verification → **hold the
shared pool until update-2 (F10)**. F3 (m-knob) and F7/F8 (UI/vocab) need no backend math change.
