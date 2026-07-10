# Feature-level diff — staging (app-staging.temporal.exchange) vs the handed-to-CTO versions

**Status: FILLED from the 2026-07-10 tester run (`evidence/staging_e2e_2026-07-10/`), skeptic gate pending.** Reference column = derived from the repo
(`handover/CHANGELOG_for_CTO.html` @ `origin/claude/exciting-archimedes-txs2wx`, md5-confirmed engine
`5ce1a76c`; `docs/feature_inventory.md`; `docs/VOCABULARY.md`; `specs/UPDATE2_SPEC_consolidated_2026-07-07.md`).
STAGING column to be filled ONLY from the tester's live evidence (`evidence/staging_e2e_2026-07-10/`),
never from assumption. Skeptic gate required before this ships to the operator as a claim.
Operator ask: transcript entries 2 & 3, `history/operator/2026-07-10_staging-e2e-wallet-test.md`.

## 1. What was actually handed to the CTO (the comparison anchors)

Confirmed two ways — the operator's Drive screenshot (entry 3: folder "Temporal Upgrade: Closed Form",
shared with Ayush Shaw) and the repo's CTO changelog. They agree.

| Stage | Handed | Date | Engine content (repo record) |
|---|---|---|---|
| H1 | `temporal v24 cto handoff.zip` + `temporal mvp v24 rebase fixed 2.html` | May 29 | **v24 plain Balancer** — pre-lens: no steepness knob m, old ITM pricing, reserve-point trades, two-case close, pre-fix funding |
| H2 | `HEAD_temporal_mvp_v28_lens.html.txt` | Jun 15 | ≈ **`80f050e2`** (the changelog's "Your version: 80f050e2 (14 Jun)") — constant-m lens + m knob; but pre ITM-fix, pre trade-point, two-case close, funding wrong (nonzero on balanced pool) |
| H3 | `temporal_mvp_v28_lens_5ce1a76c.html` + `CHANGELOG_for_CTO (3).pdf` | Jul 8 | **`5ce1a76c` (current reference)** — ITM linear re-seam, trade-point conservation, clean sell-back close, ray-deviation funding input, 41-check acceptance |

Staging is the CTO's separate Go port; the diagnostic question is **which stage (H1/H2/H3) its math
matches**, feature by feature. Divergence from H3 = observation (may lag), not automatically a defect
(operator's DON'T-FALSE-FLAG rule).

## 2. Feature matrix (discriminators between the handed stages)

Numbers below are the changelog/reference-build values (put, strike $100, γ=2 unless stated).

| # | Feature | H1 (v24, May 29) | H2 (80f050e2, Jun 15) | H3 (5ce1a76c, Jul 8) = current reference | Discriminating observable on staging | STAGING |
|---|---|---|---|---|---|---|
| F1 | ITM option pricing + exercise line | old ITM pricing | power-arm: exercise line ≈ $44.4 (0.444·K), mark dips below intrinsic for S/K ≲ 0.80 | linear re-seam: exercise line **$66.67**, value **1/3**; ATM **0.148**; m=3 → **$85.71**, **1/7**, **0.057**; V ≥ intrinsic always | where the exercise line sits; ITM value vs intrinsic | **UNOBSERVED** — OPTIONS PRICING chart rendered BLANK; no option value ever displayed (FLAG-1/2 backend blackout) |
| F2 | Trade mechanics (curve bend at trade point) | reserve-point | reserve-point: exhibit gives **22/43** | trade-point: (10,10,w=½), ray 4, cash-in 1 → **w′ = 11/21** | the w′ exhibit, or any off-middle trade's resulting weight/price | **UNOBSERVED** — connect-only (unfunded), no trade executed; no AMM data loaded |
| F3 | Steepness knob m (constant slope multiplier) | **absent** | present (clamp 1–6 arrived just after, `9f1e625b`) | present, clamp 1–6, vol-set: MORE volatile ⇒ LOWER m | is there an m/steepness control at all; its range; vol caption direction | **No user-facing steepness/m control observed** in any tab (TRADE BANDS fields = quantity, price-range %, slippage, fees). Backend m: UNOBSERVED. Plausibly by design (vol-set at setup, not a trader control) — question for CTO, not a defect claim |
| F4 | Close a position | two-case | two-case close: ITM legs cashed separately; payout can jump ~half at the strike | one rule — every leg sells back at today's price; smooth across strike; payout = option value computed BEFORE the pool trade | close an ITM-adjacent position; look for payout discontinuity at strike | **UNOBSERVED** — no open positions (unfunded); CLOSE column exists in portfolio tables (surface present) |
| F5 | Funding | pre-fix | wrong: charges funding on a perfectly balanced pool | ships the **INPUT only**: ray deviation `dev = |c·ln(strike/mode)|`, c = (g_anchor−g)/(g_anchor+1); **zero on balanced pool, zero ATM, zero ITM**; label "Funding (ray dev; TBD)" | funding value on a balanced pool / ATM / ITM; the column label | **PARTIAL** — FUNDING column present in BOTH perps and bands tables (DOM-verified); numeric behavior + "(ray dev; TBD)" qualifier UNOBSERVED (no positions, no values rendered) |
| F6 | Funding RATE formula + cap + cash transfer | — | — | **deliberately TBD (update-2)** — deviation input only | if staging shows an actual funding rate/transfer it EXCEEDS the reference (report, don't flag as bug) | **UNOBSERVED** — no funding values rendered anywhere this run |
| F7 | Round-trip pool charge-back (close-time drift) | — | — | **deliberately TBD (update-2)**; known tiny ∝ size² pool drift, non-extractable; multi-party pool NOT to ship without update-2 | n/a to observe directly; note if staging is multi-party with shared pool (escalation-relevant) | **OBSERVATION (operator-tier):** EARN is a live LP-vault surface with shared POOL STATS (TVL $500 / ₿0.007961, Pool Leverage 5.0x) → staging EXPOSES a shared-pool surface; the changelog's "don't run the shared pool without update-2" warning applies the moment this goes multi-party |
| F8 | Vocabulary | — | "lean" wording era | "**ray deviation / curve skew**", never "lean" (vocab gate, operator entry 474) | UI strings in funding column / tooltips | **Consistent so far** — zero "lean" hits in all captured text/DOM; terms seen: FUNDING, INTRINSIC, EXTRINSIC, POSITION VALUE, INNER/OUTER BOUND (limited surface: values never rendered) |
| F9 | UI: chart-2 true-value wings, %/$ toggle; caption fixes; signed funding P/L column | absent | partial | present (UI-tagged = CTO may skip; divergence expected, low-signal) | cosmetic only | Staging has its own UI (not a mirror); funding column present in portfolio; charts = PERP MARK PRICING / OPTIONS PRICING tabs (latter blank this run) |
| F10 | Acceptance harness | — | 31-check era | `lens_selfcheck.js` **41 checks** = the port's acceptance test | not observable from UI; recommend to CTO regardless of findings | n/a (backend) |

## 3. Expected architecture deltas (NOT defects — staging ≠ simulator by design)

| Delta | Reference build | Staging |
|---|---|---|
| Runtime | single-file HTML simulator, single-user, in-memory pool | Next.js SPA + Go backend (`staging-be.temporal.exchange` ws) |
| Execution venue | none (simulated) | "Executed on Hyperliquid" — Hyperliquid **testnet** |
| Chain/wallet | none | Arbitrum Sepolia + EIP-1193 wallet (MetaMask SDK) |
| Surface naming | strike band trading in one page | tabs CREATE PERP / TRADE BANDS / EARN / Portfolio — the mapping of reference concepts onto these tabs is itself a finding to record |
| EARN (LP) tab | no LP/multi-wallet surface in reference; LP defenses are update-2 (PARKED) | if EARN exposes a shared multi-party pool, that intersects the F7 "don't run shared pool without update-2" warning → operator-tier observation |

## 4. Conclusion (filled 2026-07-10, manager synthesis over tester evidence)

**Which handed stage does staging's MATH match? UNDETERMINED from outside this run.** Every H1/H2/H3
numeric discriminator (F1 ITM line, F2 w′ exhibit, F4 close continuity, F5 funding values) was
unobservable because the two HIGH FLAGs blank out all AMM numbers (CSP-blocked RPC → AMM-tree timeout →
options/bands/LP values never render) and the wallet was unfunded (no positions to read).

**What IS determinable:** the SURFACE tracks the recent handover — FUNDING column in perps+bands,
INTRINSIC/EXTRINSIC/POSITION VALUE, INNER/OUTER BOUND, an OPTIONS PRICING chart tab, no "lean"
vocabulary anywhere. That is at least H2-era and vocabulary-consistent with H3; nothing observed
contradicts H3. **No math divergence claim is made in either direction.**

**Recommended path to a decidable feature diff (for the operator → CTO):**
1. Fix FLAG-1 (add the missing RPC host to CSP `connect-src`, or point the app at an allowlisted RPC)
   and FLAG-2 (staging-be ws subscription never fires) — then the OPTIONS PRICING chart + band values
   render and F1/F5 become readable without funds.
2. Fund the test wallet (or CTO seeds a test account) → F2/F4 become executable; rerun this harness
   (scripts committed, reproducible).
3. Independent of UI: CTO runs `engine/verify/lens_selfcheck.js` (41 checks) against the Go engine —
   that is the acceptance test for the H3 math and doesn't depend on the frontend at all.

## 5. Fill-in protocol
- Staging column: tester evidence only (screenshot/DOM/log citation per cell); cells the run can't
  reach (e.g. unfunded → no live trade) get **UNOBSERVED**, never a guess.
- Verdict vocabulary per cell: `MATCHES-H3` / `MATCHES-H2` / `MATCHES-H1` / `DIVERGES(detail)` /
  `UNOBSERVED` / `N-A`.
- Manager re-derives any numeric cross-check independently before relay (R5); skeptic gate before
  the operator sees conclusions.
