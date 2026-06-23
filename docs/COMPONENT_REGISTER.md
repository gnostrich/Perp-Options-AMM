# COMPONENT REGISTER — the single place to take stock

_Created 2026-06-12 on operator grievance (entries 137/138) + **skeptic VERDICT #45**
(`notes/skeptic/VERDICT_PROCESS_COMPONENT_TRACKING_entry137_2026-06-12.md`). This file exists
because agreements were living only as prose in transcripts and memories — narration, not gated
state — so agreed things kept regressing while the operator went in circles. This is the binding
register. **One row per inventory component AND per operator-agreed constraint.**_

## How to read STATE (one word, no hedging)
- **AGREED** — the operator ruled it; it is binding. May or may not be built yet.
- **BUILT** — present in HEAD, manager-verified at the code/numeric level.
- **VERIFIED** — BUILT **and** independently confirmed (tester live and/or skeptic cold-derive and/or a HARD gate).
- **OPEN** — not settled / not built / under derivation.
- **REGRESSED** — was AGREED/BUILT/VERIFIED and a later change violated it. **This is a STOP-class state.**

## ⛔ THE REGRESSION GATE (the teeth — skeptic #45, binding same class as the file-safety gate)
**No merge, no HEAD promotion, no spec, and no operator-facing relay may flip an AGREED or VERIFIED
row toward REGRESSED without an explicit operator reopen entry.** A would-be regression is a
STOP-class halt: the manager halts and reports it as a finding (does NOT patch toward green), exactly
like a red file-safety gate. **The manager promotes every operator ruling from the transcript into
this register in the SAME turn it is acted on** — that pairing IS the gate. The skeptic audits this
register against the transcript and `docs/feature_inventory.md` every pass; a missing row, a stale
state, or an un-gated regression is a FLAG-PROCESS against the manager.

## Provenance honesty
`VERIFIED` requires a named confirmation (gate name / tester run / skeptic verdict #). Where the
manager has NOT personally re-confirmed HEAD state this session, the row says **needs-verify** in
LAST-VERIFIED rather than asserting green — manufacturing false-green here would defeat the register's
entire purpose. Those rows carry a queued tester/skeptic confirmation.

---

## PART A — Inventory components (1:1 with `docs/feature_inventory.md`)

HEAD = `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `dd6fb955…` = chart-2 Option-C 2026-06-22 of `9f1e625b` [chart-2 plots the normalized steepness SHAPE `(mode/θ)^(m·γ)`: mode peak=1 AND wings steepen with `m`; replaces broken peak-normalization that cancelled the knob; draw-layer only, math byte-unchanged, gates 13+5 green, tester PASS 6/6 byte-stable, m=1/3/6 chart PNGs distinct; resolves operator entries 226+266 together]; `9f1e625b…` = chart-caption depiction fix 2026-06-14 of `80f050e2` [legend/caption: mark=1 = full-exercise cap not mode, behaviorally identical]; `80f050e2` = comment-cleanup of `8f897edc` per operator entry 234, behaviorally identical [comments+gate-detector only, gates 13+5 green, blobs canonical]; **CONSTANT SLOPE-MULTIPLIER lens, promoted 2026-06-13, operator entries 229/231**): plain v24 pool (byte-identical) + a **single scalar knob `m`** — lensed option-value exponent `g_loc(K)=m·γ` **constant at every strike** (m=1 ⇒ plain v24; bigger m = steeper everywhere AND trade lands further out via frozen tx-map `θ_tx=mode·(chosen/mode)^m`); settle at the CHOSEN strike. REPLACES the position-dependent `√(τ²+u²)` elbow-rounding/inverse-lens family (root of the multi-day τ-direction conflict; a constant multiplier couples steepness + outward-push the SAME direction). Gates `lens_selfcheck` **13 PASS [HARD]** (CM1–CM9) + `a16_atm_gate` **5 PASS [HARD]**; manager 13+5, skeptic CLEAR-TO-PROMOTE, tester live 5/5 ×2. Inverse-lens `5fea0e8d` = `temporal_mvp_v28_lens_invtx.html` retained as revert; at-strike `de28c937` also retained.

| ID | Component | STATE | OWNER | SETTLED-BY | GATE | LAST-VERIFIED |
|----|-----------|-------|-------|-----------|------|---------------|
| C1 | Balancer base `x^w·y^(1−w)=k` | VERIFIED | manager | motive (locked base); curve reopened entry 28; **v28-lens HEAD promoted entries 84/94/96/106** | `lens_selfcheck` (6b) pool-byte-identical | **2026-06-12 manager-ran: gate 6b PASS (tradeUpdate/arbitrageToOracle/rebase byte-identical to v24)** |
| C2 | The curve warp (position-dependent **weight FIELD**) | OPEN — **NOT in HEAD** | research-lead | entry 28 demoted v27→ lens | — | the (W) field is DEMOTED (`v27_wkurtosis`); v28 warp is the lens (C3), not a w(u) field |
| C3 | Kurtosis/vol knob = **constant slope multiplier `m`** (g_loc=m·γ at every strike; m=1=plain v24; bigger m=steeper everywhere + trade further `θ_tx=mode·(chosen/mode)^m`) — REDEFINED entries 229/231, replacing the position-dependent √(τ²+u²) lens | VERIFIED | intern/tester | entries 229/231 (operator: "its literally just a constant slope multiplier"; "yes" to redefinition) | `lens_selfcheck` 13 PASS [HARD] (CM1 g_loc=m·γ constant; CM7 polarity-lock steeper⇒further) + `a16_atm_gate` 5 PASS | **2026-06-13 manager-ran on promoted HEAD: 13 PASS + 5 PASS / 0 FAIL; skeptic CLEAR-TO-PROMOTE; tester live 5/5 ×2 byte-stable** |
| C4 | Carry `P=Ny/Nx`, `u=log price − log P` | VERIFIED | research-lead/tester | locked arch | tester live `pw_v28_inherited_smoke.mjs` #1 | **2026-06-13 tester live on 8f897edc ×2 byte-stable: w=0.5, P=getMP_raw=$80,000=oracle, u=0 at equilibrium, finite (not NaN). FLAG-OMISSION #2 closed.** |
| C5 | Rebase (P→P/r, θ→θ/r, anchor w=½) | VERIFIED | research-lead/tester | locked arch | tester live #2 | **2026-06-13 tester live ×2: oracle 80k→100k (r=1.25): x×1.25, α×1.25, β/y/w invariant, mp_raw×0.8=1/r EXACT, θ→θ/r; 80k→64k symmetric.** ⚠ warp∘rebase-commute lemma trusted-from-prover in the constant-m monolith (`trade_rebase_commute`). |
| C6 | Pricing law value∝S^(−γ), γ∈(1,4) | VERIFIED | tester | locked (G4) | `lens_selfcheck` frozen-wings | 2026-06-12 (wings → γ exact) |
| C7 | ITM American smooth-pasting `S*=K·g/(g+1)` | VERIFIED | intern/tester | entry 85/93#6 | `lens_selfcheck` settle==lensed | 2026-06-12 |
| C8 | Uniform strike registration θ=sNorm(K) | VERIFIED | tester | v26c ruling | tester live #3 | **2026-06-13 tester live ×2 on 8f897edc: $120k→θ1.5 mk 0.1667; $80k→θ1.0 mk 0.25; $48k→θ0.6 mk 0.15; one sNorm coord across mark+ray.** |
| C9 | Funding = slope-deviation **through the lens** (±g_loc = ±m·γ; lens-aware mark) | **VERIFIED (design operator-ruled entry 232; live tester-confirmed)** | intern/tester | **entry 232 (2026-06-13): "funding slope deviation thing would be as seej thru the lens"** — funding is a through-the-lens READ quantity; it carries the kurtosis knob (±m·γ) BY DESIGN (= operator's option B). Supersedes the loose entry-93 acceptance. **Mechanism unchanged (slope-deviation vs w=½ anchor); EVALUATED through the lens, so m re-scales it — intended, not a regression.** Discharges the *design question* of skeptic FLAG-OMISSION #1; the live m-scaling smoke is still owed (skeptic Q2: don't read "AGREED" as "verified"). ⚠→✅ **ATM-zeroing confirmed NOT a requirement (operator entry 233):** "funding never had to be zero atm, its totally dependent on slope / corresponding ray divergence from anchor curve (as seen thru lens here)". Funding = slope/ray-divergence from the w=½ anchor, through the lens; it zeroes at the anchor (ray coincides, S→1), not at ATM. Current build is exactly this — aligned, no funding-shape change. | `lens_selfcheck` funding; HEAD L2272–2276 (g=gLoc=m·γ, markLensed) | **2026-06-13 tester live ×2 on 8f897edc (#5): call(θ1.5) +3.68e-4→+5.06e-4, put(θ0.7) −5.69e-4→−7.24e-4 as m=1→4 — scales with m (sub-linear ~1.27×: g enters both ±g prefactor AND markLensed, correct), sign-flips call(+)/put(−), finite. Operator ruled entry 232; manager code-confirmed L2272-2276.** |
| C10 | Slippage basis `mpGeom=getMP_raw·e^(−ghMu)` | N/A on v28 | manager | GH-line only | — | v28 plain Balancer: price==slope, the e^−ghMu gotcha is GH-only |
| C11 | Dollar / settlement pipe (settle-at-lensed) | VERIFIED | intern/tester | **entry 96** | `lens_selfcheck` single-basis; tester live #4 | **2026-06-13 tester live ×2 on 8f897edc: OTM-expiry both legs AMM-reverse, payout $0.072 finite; ITM-exercise settled_cash_leg='sold', payout $3.78 finite, round-trip restore EXACT (|dx|=|dy|=0). No NaN/absurd magnitude.** |
| C12 | THE gotcha (getMP_raw = price-coord not slope) | N/A on v28 | manager | GH-line only | — | GH-only; v28 single-basis |
| C13 | Solvency boundary (B1 real floor) | OPEN | research-lead | ship-gate | — | conditional-only (B1 CARRIED[coverage]); geometry does NOT close solvency |
| C14 | Esscher tilt / latent rapidity group | trusted-from-prover | research-lead | motivation-layer | Aristotle (audited) | RUN-2 (motivation-layer, not load-bearing for build) |
| C15 | File-safety gate (blobs, splices, scripts) | VERIFIED | manager | locked (§3) | `file_safety_gate.sh` PostToolUse hook | **2026-06-12 manager-ran: webp `ab663f5c…` + svg `c505b08a…` canonical; 3 scripts parse** |
| C16 | **Warp-with-trades (continuous)** | **VERIFIED — BUILT + PROMOTED (entry 181) + tester-confirmed live (4/4 PASS ×2 byte-stable: 10-frame sweep, final frame px-diff 0 vs proforma, center slides, dip mechanic confirmed, chart-1 inert, 0 errors); skeptic post-promote audit CLEAR (`VERDICT_CONTWARP_POSTPROMOTE`)** | research-lead/intern | entries 158 (continuous ruling), 173 (proforma-only), 181 (promote now) | `lens_selfcheck` 27/27 incl. CF1–CF4 (telescoping 8.9e-16; engine byte-identical; money paths zero-delta) + tester `evidence/v28_contwarp/`. Carried OPEN: at-strike trade mechanic (entry 153 #4, foundational-unmet, separate build); post-execute single re-sweep = HEAD-inherited semantics (UX call) | **RESOLVED 2026-06-12 via the continuous mechanic (entry 158) — superseded history (held-center HOLD, reading-B detour, scrapped goalSeekW build) in `notes/skeptic/` verdicts + git; picture re-verified live (tester 4/4×2) + skeptic post-promote CLEAR.** |

---

## PART B — Operator-agreed constraints (binding; a violation = REGRESSED = STOP)
_Completeness is a MAINTAINED property, not one-time: this is a curated subset of the binding
agreements across ~139 transcript entries; the same-turn promotion duty + the skeptic's per-pass
register-vs-transcript tail-audit keep it complete. A binding agreement found un-rowed = FLAG-PROCESS._

| ID | Agreed constraint | STATE | SETTLED-BY | Note / gate |
|----|-------------------|-------|-----------|-------------|
| A1 | **Trades warp the curve — it is `w` that changes; NOT a dot sliding** | AGREED | `brief#1` ("not a dot sliding") + `project-status-review#16` ("its w that the trade changes") | C16 realizes it; **signed gate** — a w′=w₀ reset that re-flattens VIOLATES this (skeptic #41) |
| A2 | Kurtosis is **static, vol-set, NOT changed by trades** | AGREED | entry 14#3 | the τ knob is the curve geometry, not a trader statistic |
| A3 | **HEAD = v28 lens** (curve reopened; Balancer + polar lens) | AGREED | entry 28 reopened the curve (→ v27 (W)); **v28 lens promoted entries 84/94/96/106** | C1/C3 |
| A4 | **Settle / record / value at lensed prices** | AGREED→BUILT | entry 96 | C11 |
| A5 | **Asymptotes preserved** — any floor/saturation in deep wings disqualified | AGREED | entries 55(1)/60 | lens wings frozen power-law γ |
| A6 | **Monotonicity / no-arbitrage** is binding | AGREED | entry 55(3) | `lens_selfcheck` monotone |
| A7 | Balancer weights **complementary, sum to 1**, always | AGREED | entry 73 | else "the thing is void" |
| A8 | **BANNED TERM: "spot swap slippage"** — a trade is a swap that WARPS; one thing | AGREED | entry 122 | speak in warp terms. **GATE:** manager pre-send self-check + skeptic transcript style-audit (FLAG-PROCESS, style-class) |
| A9 | **Communication form:** table + core formula(s) + the literal edit + plain English | AGREED | entries 44/71/81/99 | R7; pre-send self-check |
| A10 | Warp read through the **pre-step (held) lens**; lens **AMPLIFIES** skew (works WITH it, not neutralise); per-step sequence | AGREED | entries 129/131/132 | skeptic #43/#44; the "restore→flat" target is the rejected neutralise op |
| A11 | Honest limit: single-w warp = **vertical rescale in ONE step**; strike-differentiated **skew grows ACROSS the sequence** as the mode updates | AGREED | skeptic #44 + entry 132 | UI copy must NOT over-claim a per-strike in-step bend |
| A16 | **(LOOP-CLOSURE, entry 204) No-jump ATM position value:** a held position's VALUE must be continuous (no jump) as the underlying crosses the at-the-money point / OTM↔ITM — distinct from the C7 settlement smooth-paste (that's the settle/exercise value; this is the live portfolio mark). Part of "full loop closed." **CLEAN CLOSE ON BOTH SIDES (entry 207):** (THEORY) prove the position value is C0/continuous across ATM / OTM↔ITM on v28's lensed g_loc — a Lean lemma (continuity at the seam), folded into the monolith; (IMPL) demonstrate the live HTML position-value path (pfComponents/markEff/legValueUnified) has NO jump at ATM — gate + tester. Not closed until BOTH are green. **DIAGNOSED (spec `SPEC_A16_no_jump_atm`): NO JUMP — already SATISFIED.** Live value path (markEff→legValueUnified→pfComponents, all via smooth-pasted markLensed) continuous across OTM↔ITM, max|Δ|→0 ∝ step; no regime branch in the value (only display/exec gating). Lens build already fixed the old v24 ATM-jump. → NO engine build needed. IMPL: add HARD gate `a16_atm_gate.js` (queued to intern). THEORY: lemma A16-CONT (markLensed∘gLoc continuous at sNorm=θ, both limits=1) queued to Aristotle (companion to LENSKERNEL valueMatch_g). ⚠ ONE morning decision: A16-CUSP (continuous but non-C¹ peak=1 at ATM — accept, or smooth the g_loc→0 collapse = curve-semantic change). **IMPL no-jump CLOSED + LOCKED** (gate `a16_atm_gate.js` 5/5, manager-verified independently; one-sided-limit discriminator confirms genuine continuity not a no-op; intern negative-controlled — a +0.05 ATM jump FAILS it; routed HARD in run_all). THEORY: lemma A16-CONT queued to Aristotle (pending submit on next research-lead pass). CUSP=Q11 morning decision. Optional tester visual smoke (gate is headless) — low priority, no HEAD change. | IMPL gate-LOCKED; THEORY queued; CUSP=decision | entries 204, 207 | `a16_atm_gate.js` 5/5 + A16-CONT(Aristotle) |
| A15 | **(LOOP-CLOSURE; mechanic CORRECTED entry 205) Slippage on the bought option/spread:** NOT proceeds-netting. Size the bought leg AS IF at PRE-TRADE option prices, then apply the slippage CALCULATED IN THE AMM TRADE LAYER to REDUCE that bought-option output (you receive less than the pre-trade-price calc implied). SEQUENCE (entry 206, fully pinned, no circularity): (1) size buy quantity/notional at PRE-TRADE option prices; (2) execute AMM trade → realized TOTAL slippage; (3) apply slippage as haircut reducing the bought output. | QUEUED (loop-closure, spec-ready) | entries 195, 205, 206 | — |
| A14 | **⚠ UPDATE 2026-06-13 (entries 229/231 — CONSTANT SLOPE-MULTIPLIER promoted to HEAD `8f897edc`):** the τ-DIRECTION open (Q13 below) is now RESOLVED-by-redefinition — the trade map is `θ_tx=mode·(chosen/mode)^m`, frozen at entry, settle at chosen strike; bigger m ⇒ steeper chart-2 AND trade further out (same direction, polarity-locked by gate CM7). No lens inversion, no curve re-open, A5 wings preserved (power-law m·γ). Verified 13+5 gates / skeptic CLEAR / tester live 5/5. The inverse-lens history below is retained as the path that led here. — **Separate-layer trade rule (the at-strike mechanic, fully pinned):** the AMM tx is the at-strike bookkeeping swap (sell leg = notional×strike cash, NO premium in the swap); **option pricing enters ONLY at the buy leg** — sold-leg premium proceeds determine how much you can buy (N_buy = proceeds / unit premium). Foundational, NOT yet in HEAD (build's sell leg is premium-sized — the measured fork, entries 182–186) | AGREED — build target | entries 127, 153 #4, 184, 186 | dig: warp-vs-strike INVERTS between rules (4×: +0.018 premium-sized vs +1.50 at-strike). ⛔ **BUILD BLOCKED (STOP, entry 192 deadline): spec `SPEC_atstrike_swap_A14` finds the at-strike-write vs lensed-settle SEAM opens a trader-favourable round-trip (VERIFIED vs REAL engine, skeptic `VERDICT_A14_seam_realclose`: alarm REAL but spec figures were harness artifacts. TWO real leaks: premium-ledger +$67k/unit (bought leg self-marks UP on own bend); pool-NOT-restored −$254k (spec WRONGLY claimed pool restores — real closeBand reverses premium-scale not at-strike, so the open's strike-scale bend never unwinds). Mechanism: at-strike write = strike-scale warp, but valuation+reversal run premium-scale on the self-bent curve. **DECISION (operator-tier, settlement-semantics, touches entry-96): on close, value on the bent curve (free money) OR un-bend to entry first (clean). Least-invasive closure = close also at-strike (reverse dy=−open dy) + value at restored state — kills both. §1 sizing + §2.3 reserve guard buildable as-is.** **OPERATOR OVERRULE (entry 197): forget arb for now, transact at the live curve; slippage paid continuously via the continuous-integral formulas; option pricing = separate layer. → BUILD PROCEEDS at-strike. Pool integrity preserved by at-strike on BOTH open AND close (reverse dy=−open dy ⇒ reserves restore, kills the −254k structural leak). **⚠ FLAGGED (entry 214/215, operator gaslighting-substantiated): the at-strike swap sizes at the RAW strike (dy=N·K_raw) — the LENS DOES NOT AFFECT THE AMM TRADE, which VIOLATES the through-the-lens architecture (the lens is supposed to change the EFFECTIVE STRIKE; the continuous trade-warp-update-lens derivation's whole premise). Manager item-12 reply confirmed the raw-strike behavior as correct = gaslighting (owned). Skeptic VERDICT `VERDICT_HALT_lens_effective_strike_swap_entry215`: CONFIRM-MANAGER-WRONG (swap raw-strike/lens-free, confirmed at executeLeg L1780). HEAD verdict = **KEEP de28c937 with standing FLAG-WRONG, FIX-FORWARD not demote** (prior contwarp is wrong on the same axis + stale; demote = lateral thrash). FIX = size single-option swap at the LIVE-MODE lens-effective strike θ_eff=mode·exp(sign(u)·h_τ(|u|)), plain-v24 spot swap, no mode re-center (φ-wall does NOT bite this). ⛔ **BLOCKED on an operator DIRECTION ruling (§2):** the closed-form θ_eff COMPRESSES toward the mode (sharper lens → swap toward raw/BIGGER, softer → smaller) — OPPOSITE of entry-118 'sharper⇒OTM++'. Operator ruled entry-212 (sharper⇒OTM+ looks OTM-, pull IN). Skeptic RECONCILE `VERDICT_lens_effective_strike_direction_RECONCILE`: STILL CONFLICTS + deeper finding — (a) knob is τ DIRECT, NOT inverted (HEAD L1320/2387; label 'smaller τ⇒sharper'); manager's knob-inversion hypothesis WRONG. (b) **entry-212 (sharper pulls strike IN/toward money) directly CONTRADICTS operator's OWN entry-118 (sharper⇒OTM++, push OUT) — opposite ops, NO single monotone θ_eff map satisfies both.** Well-posed maps exist for EITHER direction (today's h_τ gives 212-at-the-SOFT-end; a τ-in-denominator map gives 212-at-the-sharp-end). Operator clarified (216): transact at the INVERSE-lens image (the point that LOOKS like your strike = further out). Skeptic `VERDICT_lens_tx_strike`: PARSE CONFIRMED (manager read right); map θ_tx=mode·e^{√(a²+2|a|τ)·sign a}, bounded/forward. **VERIFIED + PROMOTED (2026-06-13, HEAD 5fea0e8d): inverse-lens tx-strike — operator entry-220 mechanic (pick displayed OTM-, transact true OTM+). Manager 39/39 + skeptic CLEAR-TO-PROMOTE (`VERDICT_invtx_promote_audit`) + tester PASS live (reserves round-trip 0/0, settle at chosen strike, capacity shrinks w/ verbatim reject, no regression, 0 errors). View lens/chart-2/settlement byte-identical; frozen→no leak; no single-option free money.** ⚠ ONE OPEN (operator-tier, non-blocking): τ-DIRECTION — ships sharper⇒LESS-far (faithful to entry-220 on today's lens); operator entry-218 'yes' to sharper⇒FURTHER is UNSATISFIED — that needs the lens-shape change (skeptic Choice C: τ-in-denominator) which FLIPS chart-2 + breaks A5 wings = a curve re-open. Queued Q13. [superseded: STILL BLOCKED on 2 operator-tier holes: (1) τ-POLARITY: operator RULED YES (entry 218) — sharper⇒further out; authorizes the lens-shape change (τ-in-denominator). ⚠ CURVE CHANGE — BLAST RADIUS must be mapped before build (does it ripple into chart-2 steepness, settlement g_loc, funding, no-jump-ATM, A5 asymptotes-preserved, A6 monotonicity? if it breaks an AGREED constraint → flag to operator). skeptic deriving + blast-radius. (2) FREEZE-vs-LIVE: θ_tx must be FROZEN at entry (live-mode leaks $529/leg round-trip) + swap-basis(θ_tx)-vs-settle-basis(chosen K) gap needs sign-off.** One intern pass only after both ruled. FLAG-PROCESS vs manager (item-12) stands.** Prior tester live 5/5 (warp rises OTM on screen $8.8k/12k/16k/32k @1.1/1.5/2/4×; ITM direct payout works; reserve-guard rejects verbatim w/ depth $; sweep+τ no regression; 34/34 gates). Operator entry-127 at-strike mechanic = DELIVERED. (HEAD de28c937): at-strike open (warp rises OTM, gate-verified) + ITM direct-formula-payout (entry 198) + individual-option model (entry 199). Skeptic RECHECK `VERDICT_A14_atstrike_RECHECK` = CLEAR (no single-option free money: trader P&L from option VALUES only, at-strike dy is pure curve-warp never in P&L; prior HOLD dissolved — it stood on a spread+round-trip framing the operator removed). 34/34 gates, pool fns byte-identical. ⚠ UI-label residual (non-blocking, operator's call): preview 'Pool Δ cash-conserving ≈0' / 'net trader cash' now mislabels the warp (+161k on a band) — display only, no P&L. Superseded HOLD detail: skeptic `VERDICT_A14_atstrike_PROMOTE`: AS2 'pool restores' is TRUE only same-wing; on the CANONICAL cross-wing band (sell call/buy put = what the UI trades), a leg goes ITM at close → closeBand CASH-SETTLES it and does NOT AMM-reverse → its strike-scale open swap ($120k, 30% of pool depth) is never undone. Gate tested only the same-wing shapes that hide it (same blind-spot as C16). NOT PROMOTED, HEAD stays 4378bc11.** Tension flagged: making the close reverse-to-restore IS 'round-trip thinking' the operator said NOT to do (entry 197) AND still leaks on ITM. NEEDS operator close-semantics ruling: when a position closes (esp. ITM), does the warp PERSIST (trade's lasting effect, slippage was the cost) or reverse? I will not guess a 3rd time. |
| A13 | **The sweep-dip is the mechanic, not a bug:** strikes near the SLIDING 45°-tangent point flatten (dip toward zero) as it passes, while wings steepen — locked; any future "fix" that flattens this behavior = REGRESSED | AGREED | entry 158 + skeptic entry-158 verdict + tester confirm | GATE: `lens_selfcheck` CF3 (asserts the dip; goes red if "fixed") |
| A12 | **θ_K stays the payoff/settlement strike** — execution-relocation to a lens-shifted point (R1) is BLOCKED + an operator-tier settlement-semantics change | AGREED | research spec + #44 | moving it = undisclosed semantics change + basis-leak arb |

---



### Open follow-ups from the A14 live test (entry 208/tester, non-blocking):
- **A14-label (UX):** preview header "Pool Δ (cash-conserving ⇒ Δy_net ≈ 0)" / "net trader cash @ open" now MISLABELS the at-strike pool warp (showed $16,623 net Δ, not ≈0). Display relabel (intern); operator to pick wording.
- **A14-kurtosis-test:** the live test covered warp-magnitude vs OTM but NOT vs kurtosis (entry 203 half-answered). Honest nuance: under at-strike the SWAP is kurtosis-free (dy=N·K); kurtosis shapes the warp SEEN through the lens (manager dig entry 185). A targeted vs-τ warp test is owed.


### ⚠ MONOLITH RE-BASE REQUIRED (operator entry 209) — index NOT yet in line with HEAD:
`docs/MONOLITH_INDEX.md` was written 16:08, BEFORE the contwarp (4378bc11) + at-strike (de28c937)
promotions. STALE/ABSENT: HEAD pointer (7e1ae39b→de28c937), C16 state ("NOT promoted"→promoted),
the AT-STRIKE swap (dy=N·K — zero mentions; trade-formula/C11 still describe premium-sized), ITM
direct-payout settlement, and the A14/A15/A16 rows. HARD overnight deliverable: research-lead
re-bases the index on HEAD de28c937 across ALL components (after the structure-build + Aristotle fold,
to avoid clobbering + include their results), skeptic-audited, GAP-labelled where it can't be aligned.

### ⟳ FULL-LOOP CLOSURE (operator entry 204) — the two items to close the loop (part of the monolith):
1. **A15** — actual slippage on the bought option/spread: apply the AMM-trade-layer slippage to REDUCE the bought output below its pre-trade-option-price size (entry 205; NOT proceeds-netting).
2. **A16** — no-jump ATM position value: CLEAN CLOSE ON BOTH SIDES (entry 207) — theory (continuity lemma, Lean/monolith) AND implementation (live position-value path has no ATM jump, gate+tester).
Both QUEUED; both fold into the monolith's bidirectional theory↔impl loop (a closed loop = the build does it,
the math proves it, the paper states it, no GAP).

## PART C — Process rules in force (R1–R7, succession plan, universal skeptic gate)
R1 citation-or-no-build · R2 one-go-one-build · R3 control-inventory · R4 kill-means-silent ·
R5 verify-before-reassuring · R6 skeptic scope-gate on builds · R7 tables+simple-English.
Canonical: `.claude/agents/manager.md`, `notes/skeptic/VERDICT_MANAGER_TLDR_AND_SUCCESSION_2026-06-11.md`.
**Universal Skeptic Gate (operator entry 139): `notes/skeptic/POLICY_universal_skeptic_gate_2026-06-12.md`**
— no agent work goes to merge/promote/state-flip unchecked by the skeptic; no claim-bearing operator
reply ships unfiltered. Halt-class; manager cannot route around it.

**Dexter's Lab — Option-B Hybrid (operator entries 268/269/270; full record `docs/dexters_lab_handover_B.md`,
skeptic runs acd21e9c + a9ec00fe).** External research-automation package at `./dexters-lab/` ADOPTED as the
**research/paper/honesty-gate layer, on-demand, NO crons.** Engine/Lean/test/git agents UNCHANGED (the lab
structurally can't do that work). Skeptic owns its review/claim-lint/stopping gates (advisory; never the
executor). **AUTHORIZED now:** the pure-Python honesty gates (`claim_lint`, `paper_sync_check`,
`doc_truth_gate`, `rq_compile`, `stopping_gate`, `lab_budget`) run with explicit `DEXTERS_LAB_CONFIG`
(`dexters-lab/lab.config.json`, contained, not repo-root). **NOT authorized (halt-class pending operator
Q4):** the two `claude -p` lanes `lab_review.sh`/`lab_deep_research.sh` — they spawn a Bash+WebFetch child
inheriting live `GH_TOKEN` with no allowlist; cron lanes need explicit operator permission (entry 270,
default no). Lab has NO git authority; manager stays sole git actor.

## PART D — Theory↔implementation bidirectional consistency → integrated modular monolith (QUEUED — operator entries 141–145, NOT yet populated)
_**The shape (operator entry 145):** one object, four LAYERS per component, all cross-referenced, single
source of truth — an "integrated modular monolith." Each register row (per component/agreement) carries a
pointer into each layer; the paper is the top layer that literally references the sections below it, so paper
writing = choosing the plain-English+notation view over already-proven sections (minimal incremental work)._

| Layer | Artifact | Per-component pointer |
|---|---|---|
| **Object / notation** | the pure-math object (metriplectic / free-potential; the formulas) | the def / equation |
| **Code** | the engine subset (HEAD HTML functions) | function @ line + its gate |
| **Lean** | the proof (`formal/INDEX.md` row / `.lean` archive / Aristotle store) | the theorem + provenance |
| **Paper (English)** | plain-English + notation layer ON TOP, references the three below | the paper section |

Bidirectional check runs across object↔code (the Node oracle today, Lean L3 the target) and object↔Lean
(GROUNDED/CARRIED). The paper consumes only rows proven both ways. **Modular** = per component; **monolith** =
one object, one register spine, one source of truth.

### Bidirectional theory↔implementation consistency (operator entry 141 — mechanism)
_Operator (entry 141): the math/theory must be checked **bidirectionally** against the implementation
for theory↔impl consistency **tied to the single mathematical object** (metriplectic / port-Hamiltonian
free-potential — see `formal/INDEX.md`), which also de-risks the paper with minimal incremental work._
**Plan (honest status: DESIGNED, NOT DONE):** add a **THEORY-LINK** column to PARTS A/B — each component
and agreement carries its theoretical object/lemma (the `formal/INDEX.md` row / Aristotle result /
derivation note that grounds it) **and** the implementation gate that realizes it, with a **two-way
check**: (i) impl→theory (does the built behavior match the proven object?), (ii) theory→impl (is every
proven object actually instantiated, or honestly OPEN?). The skeptic audits BOTH directions each pass;
mismatch = FLAG. The **paper** draws claims directly from VERIFIED two-way rows (no separate paper ledger).
**THEORY-LINK sourcing (operator entry 142 — comprehensive, all three):**
(1) the notes (`notes/research/`, `formal/INDEX.md`, `formal/MANAGER_VERIFICATION.md`);
(2) the **actual stored Lean** archives (`formal/aristotle_runs/**/extracted/**/*.lean` — the returned proofs themselves, not just the index summary);
(3) a **search of Aristotle's full store of all past work** (research-lead via the aristotlelib interface) to surface results PROVEN but never folded — e.g. the `warp-amm`/`warp-amm-handoff` continuous-warp cluster (INDEX.md §⟢ EXTERNAL, retrieval-only/un-verified). Every such result gets a register row tied to its component, with honest provenance (GROUNDED / CARRIED / trusted-from-prover / retrieval-only).
**RIGOROUS END-STATE (operator entry 144 — supersedes the RAG idea, entry 143 DROPPED): formal Lean
verification of the CORE IMPLEMENTATION SUBSET against the spec AND the pure-math object.** Not a search
index — an actual proof chain. Honest scoping of what that means here (3 layers, the 3rd is the hard gap):
- **(L1) the math/spec object in Lean** — already substantially GROUNDED (`formal/INDEX.md`: settlement R1/T1a/T1b, value∝S^−γ, no-arb/frontier, metriplectic single-object T2, Merton tie). EXTEND to the lens/warp: `gLoc=γ·h′_τ(|u|)`, `goalSeekW=G/(1+G)` unique root, smooth-paste `S*=K·g/(g+1)`, pool=Balancer invariant, monotonicity.
- **(L2) the engine functions as precise definitions** — extract the core numerical kernel (gLoc/markLensed/tradeUpdate/goalSeekW/lens math) as Lean defs; prove they SATISFY the L1 spec properties.
- **(L3) THE HARD GAP — JS-computes-the-Lean-def (extraction faithfulness):** Lean does not ingest JS. Today this is bridged ONLY by the Node oracle gates (`lens_selfcheck` etc.) checking the JS against the same formulas — a TEST, not a proof. A true proof needs a verified extraction / transpilation or a hand-audited correspondence. **This gap must be stated honestly on every "formally verified" claim — never assert the HTML is Lean-verified when only L1+L2 are proven and L3 is oracle-bridged.**
**Owner:** research-lead drives L1→L2 (Aristotle), defines the engine-subset, states obligations; skeptic audits
provenance + the L3 honesty; manager re-derives + folds per-function rows into the register THEORY-LINK; paper
consumes GROUNDED rows. Queued behind the C16 promotion (entries 134/135/136/142/144).
**NEXT-SESSION ENABLER (operator entry 146):** install a LOCAL Lean toolchain + access so the team builds the
object in Lean DIRECTLY and runs verification-DEBATE in Lean, with **Aristotle as an EXTERNAL EXAMINER** (not the
sole prover/build). This removes the current env-block: results upgrade from **trusted-from-prover → actually
"verified"** (local canonical-kernel build, CLAUDE.md §5 / §8 "verified" label currently env-blocked), and makes
the L3 reference-impl-in-Lean + cross-check path tractable. This session must leave the program brief + register
spine ready so the Lean-equipped next session executes immediately.
**Until proven, do NOT claim theory↔impl consistency or "Lean-verified implementation" for any row.** Target, not state.

## Queued confirmation pass (to clear the `needs-verify` rows)
Tester + skeptic to confirm C4/C5/C8/C9/C11 live-state on HEAD v28 and stamp LAST-VERIFIED, so no
row sits on manager assertion alone. Owner: manager to dispatch after the integrity verdicts fold.

## Maintenance
Owner: **manager**, every turn an operator ruling lands or a build changes a row. Skeptic audits
against the transcript + `feature_inventory.md` every pass. `main` wins on disagreement.
