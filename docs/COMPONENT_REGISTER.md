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

HEAD = `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `4378bc11…`, contwarp, promoted entry 181): plain v24 Balancer pool + static polar lens + continuous warp animation.

| ID | Component | STATE | OWNER | SETTLED-BY | GATE | LAST-VERIFIED |
|----|-----------|-------|-------|-----------|------|---------------|
| C1 | Balancer base `x^w·y^(1−w)=k` | VERIFIED | manager | motive (locked base); curve reopened entry 28; **v28-lens HEAD promoted entries 84/94/96/106** | `lens_selfcheck` (6b) pool-byte-identical | **2026-06-12 manager-ran: gate 6b PASS (tradeUpdate/arbitrageToOracle/rebase byte-identical to v24)** |
| C2 | The curve warp (position-dependent **weight FIELD**) | OPEN — **NOT in HEAD** | research-lead | entry 28 demoted v27→ lens | — | the (W) field is DEMOTED (`v27_wkurtosis`); v28 warp is the lens (C3), not a w(u) field |
| C3 | Kurtosis knob τ (the **lens**) | VERIFIED | intern/tester | entries 84/94 | `lens_selfcheck` 23 PASS [HARD] | **2026-06-12 manager-ran on HEAD: 23 PASS / 0 FAIL** |
| C4 | Carry `P=Ny/Nx`, `u=log price − log P` | BUILT (inherited) | research-lead | locked arch | — | needs-verify (inherited v24; lens moneyness-origin = live mode, spec'd) |
| C5 | Rebase (P→P/r, θ→θ/r, anchor w=½) | BUILT (inherited) | research-lead | locked arch | — | needs-verify; **warp∘rebase-commute lemma OPEN [needs-Aristotle]** |
| C6 | Pricing law value∝S^(−γ), γ∈(1,4) | VERIFIED | tester | locked (G4) | `lens_selfcheck` frozen-wings | 2026-06-12 (wings → γ exact) |
| C7 | ITM American smooth-pasting `S*=K·g/(g+1)` | VERIFIED | intern/tester | entry 85/93#6 | `lens_selfcheck` settle==lensed | 2026-06-12 |
| C8 | Uniform strike registration θ=sNorm(K) | BUILT (inherited) | tester | v26c ruling | — | needs-verify on v28 lens path |
| C9 | Funding = slope-deviation (±g_loc through lens) | BUILT | intern | entry 93 (loose) | `lens_selfcheck` funding | needs-verify live; ⚠ **LOCKED CONTRACT ALTERED**: ATM funding→0. ⚠ operator acceptance entry 93 was LOOSE ("idc, same geometric thing whatever it implies") — NOT a crisp ratification of the zero; **flagged for explicit re-confirm** |
| C10 | Slippage basis `mpGeom=getMP_raw·e^(−ghMu)` | N/A on v28 | manager | GH-line only | — | v28 plain Balancer: price==slope, the e^−ghMu gotcha is GH-only |
| C11 | Dollar / settlement pipe (settle-at-lensed) | BUILT | intern | **entry 96** | `lens_selfcheck` single-basis | needs-verify live |
| C12 | THE gotcha (getMP_raw = price-coord not slope) | N/A on v28 | manager | GH-line only | — | GH-only; v28 single-basis |
| C13 | Solvency boundary (B1 real floor) | OPEN | research-lead | ship-gate | — | conditional-only (B1 CARRIED[coverage]); geometry does NOT close solvency |
| C14 | Esscher tilt / latent rapidity group | trusted-from-prover | research-lead | motivation-layer | Aristotle (audited) | RUN-2 (motivation-layer, not load-bearing for build) |
| C15 | File-safety gate (blobs, splices, scripts) | VERIFIED | manager | locked (§3) | `file_safety_gate.sh` PostToolUse hook | **2026-06-12 manager-ran: webp `ab663f5c…` + svg `c505b08a…` canonical; 3 scripts parse** |
| C16 | **Warp-with-trades (continuous)** | **VERIFIED — BUILT + PROMOTED (entry 181) + tester-confirmed live (4/4 PASS ×2 byte-stable: 10-frame sweep, final frame px-diff 0 vs proforma, center slides, dip mechanic confirmed, chart-1 inert, 0 errors); skeptic post-promote audit IN FLIGHT** | research-lead/intern | entries 158 (continuous ruling), 173 (proforma-only), 181 (promote now) | `lens_selfcheck` 27/27 incl. CF1–CF4 (telescoping 8.9e-16; engine byte-identical; money paths zero-delta) + tester `evidence/v28_contwarp/`. Carried OPEN: at-strike trade mechanic (entry 153 #4, foundational-unmet, separate build); post-execute single re-sweep = HEAD-inherited semantics (UX call) | **RESOLVED 2026-06-12 via the continuous mechanic (entry 158) — superseded history (held-center HOLD, reading-B detour, scrapped goalSeekW build) in `notes/skeptic/` verdicts + git; picture re-verified live (tester 4/4×2) + skeptic post-promote CLEAR.** |

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
| A14 | **Separate-layer trade rule (the at-strike mechanic, fully pinned):** the AMM tx is the at-strike bookkeeping swap (sell leg = notional×strike cash, NO premium in the swap); **option pricing enters ONLY at the buy leg** — sold-leg premium proceeds determine how much you can buy (N_buy = proceeds / unit premium). Foundational, NOT yet in HEAD (build's sell leg is premium-sized — the measured fork, entries 182–186) | AGREED — build target | entries 127, 153 #4, 184, 186 | dig: warp-vs-strike INVERTS between rules (4×: +0.018 premium-sized vs +1.50 at-strike). ⛔ **BUILD BLOCKED (STOP, entry 192 deadline): spec `SPEC_atstrike_swap_A14` finds the at-strike-write vs lensed-settle SEAM opens a trader-favourable round-trip (harness +$6k–$125k/$80k notional; pool reserves restore exact, leak in premium ledger = feasibility-O5). Skeptic verifying vs REAL closeBand. Seam closure = operator-tier (settlement-semantics decision). NOT shippable tonight without that decision** |
| A13 | **The sweep-dip is the mechanic, not a bug:** strikes near the SLIDING 45°-tangent point flatten (dip toward zero) as it passes, while wings steepen — locked; any future "fix" that flattens this behavior = REGRESSED | AGREED | entry 158 + skeptic entry-158 verdict + tester confirm | GATE: `lens_selfcheck` CF3 (asserts the dip; goes red if "fixed") |
| A12 | **θ_K stays the payoff/settlement strike** — execution-relocation to a lens-shifted point (R1) is BLOCKED + an operator-tier settlement-semantics change | AGREED | research spec + #44 | moving it = undisclosed semantics change + basis-leak arb |

---

## PART C — Process rules in force (R1–R7, succession plan, universal skeptic gate)
R1 citation-or-no-build · R2 one-go-one-build · R3 control-inventory · R4 kill-means-silent ·
R5 verify-before-reassuring · R6 skeptic scope-gate on builds · R7 tables+simple-English.
Canonical: `.claude/agents/manager.md`, `notes/skeptic/VERDICT_MANAGER_TLDR_AND_SUCCESSION_2026-06-11.md`.
**Universal Skeptic Gate (operator entry 139): `notes/skeptic/POLICY_universal_skeptic_gate_2026-06-12.md`**
— no agent work goes to merge/promote/state-flip unchecked by the skeptic; no claim-bearing operator
reply ships unfiltered. Halt-class; manager cannot route around it.

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
