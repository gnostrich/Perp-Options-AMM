# MONOLITH INDEX — four-layer pointers per component (PART D population)

> **RE-BASED ON HEAD `de28c937` — 2026-06-13.** The index was originally written 16:08 on
> 2026-06-12, BEFORE the contwarp + at-strike promotions. HEAD pointer, build description, the
> trade-row code/object layers (C11/C16/A1), and the new A14/A15/A16 rows are now re-based on HEAD
> `de28c937` (at-strike A14). **Lean layer caveat (Job-1 diagnosis 2026-06-13):** the two overnight
> submissions LENSKERNEL `d7da8597` and WARPCALC `24e6497e` DID reach Aristotle and RETURNED
> COMPLETE — both audited and now **trusted-from-prover** (see fold below). The pipeline "stall"
> was a missing *download* step, not a network block; Aristotle is reachable from this environment.
> The v28-lens/at-strike-specific obligations that have NOT yet been submitted/returned
> (A14 at-strike no-arb-on-close, A15 slippage-haircut, A16-CONT no-jump-ATM continuity lemma) are
> labelled **pending-submit** — NOT trusted-from-prover. Implementation (code+gate) and object
> layers are filled from HEAD `de28c937` now.

_research-lead · 2026-06-12 overnight (operator entries 141/142/144/145/177), re-based 2026-06-13
(register `docs/COMPONENT_REGISTER.md` PART D). One row per component (C1–C16+A14–A16) and agreement
(A1–A12): **object/equation | code (HEAD function@line + gate) | Lean (theorem + provenance) |
paper section.** GAP = layer honestly missing. HEAD = `engine/builds/HEAD_temporal_mvp_v28_lens.html`
(md5 `de28c937…`, at-strike A14: at-strike swap dy=N·K open + OTM-close; ITM direct-formula payout
no-AMM; continuous warp animation); paper = `paper/temporal_paper_draft.md` (section names as in the
draft); Lean provenance vocabulary = `formal/INDEX.md` (GROUNDED / CARRIED[h] / trusted-from-prover /
retrieval-only). **The L3 honesty ceiling stands on every row: the HTML itself is oracle-bridged
(Node gates + the live-verifiability test, `specs/SPEC_L3_live_verifiability_oracle_bridge_2026-06-12.md`),
NEVER machine-Lean-proven.** "pending-submit (prover-blocked)" = obligation written but not yet sent /
not yet returned; rows update on fold._

## Layer legend
- **L0 object** — the pure-math object/equation.
- **L1/L2 Lean** — theorem name + archive + provenance label (L1 = spec object, L2 = engine-subset def).
- **CODE** — HEAD function @ line + the gate that exercises it (`engine/verify/lens_selfcheck.js` = "LS",
  now 34 PASS [HARD] on HEAD de28c937 incl. at-strike + a16 ATM gate).
- **PAPER** — section of `paper/temporal_paper_draft.md`, or GAP.

---

## PART A components

| ID | Object / equation | Code (HEAD @line · gate) | Lean (theorem · provenance) | Paper |
|----|---|---|---|---|
| C1 Balancer base | `x^w·y^(1−w)=k`; trade flows on the conservation hyperbola `(x−α)(y−β)=αβ`, α=xw, β=y(1−w) Casimirs | `tradeUpdate`@1679, `arbitrageToOracle`@1702, `rebase`@1691 · LS gate 6b pool-byte-identical (byte-identical at de28c937 — at-strike does NOT touch the pool fns) | `tradeUpdate_alpha/beta`, `tradeUpdate_hyperbola`, `tradeUpdate_reg`, `w/gamma/center/mpRaw_closed_form`, `gamma_linear_in_cash` (γ′=γ+dy/β) — **GROUNDED, trusted-from-prover** (LENSKERNEL d7da8597, returned COMPLETE + audited 2026-06-13: token-clean, axioms ⊆ {propext,Classical.choice,Quot.sound}, out-of-scope modules byte-identical, math re-derived; `LensKernel.lean`); backing: FW sweep `alpha_conserved`/`beta_conserved`/`round_trip`/`semigroup` (`fw_proj_warp_core` 56b4f0fa, token-clean, **unfolded — see SWEEP**); T2 `single_source` GROUNDED (motivation-layer) | §AMM Mechanics → Conservation Law, Trade Formula |
| C2 Curve warp (weight FIELD) — **NOT in HEAD** | `w(u)` field (demoted v27); scalar-Balancer trade-point warp = Model C: `w₁=x_s/(x_s+σ_B y_s)`, mode shift `ξ_m(w₁)−ξ_m(w₀)=ln(y_s/x_s)−ln(y_B/x_B)`, closed call form `(1/w₀)ln(y_s/y_B)` | GAP (component OPEN; HEAD warps via scalar w only) | `mode_shift`, `mode_shift_closed_call`, `warp_passes_anchor`, `warp_tangent_eq_σB` — **warp-amm cluster, UPGRADED tonight retrieval-only → trusted-from-prover** (audit below); FW germ/warp-core (sweep, unfolded) | §Trade Formula (Δw row); kurtosis-family conjecture L233 |
| C3 Kurtosis lens τ | `h_τ(u)=√(τ²+u²)−τ`, `Φ_τ=h′_τ`, `g_loc(K)=γ·Φ_τ(|u|)`, u=ln(θ_K/mode), mode=(1−w)/w | `hTau`@1630, `hpTau`@1631, `lensU`@1633, `gLoc`@1639 · LS PASS (centred/symmetric/frozen-wings/cap-free) | `Phi_zero/nonneg/le_one/lt_one/strictMonoOn`, `gLoc_nonneg/le_gamma/at_mode` — **GROUNDED, trusted-from-prover** (LENSKERNEL d7da8597, audited 2026-06-13; `LensKernel.lean`) | **GAP** (draft conjectures a κ-family at L233; the lens is NOT in the paper) |
| C4 Carry P=Ny/Nx, u=log price−log P | on v28 the moneyness origin = live mode in sNorm coord (ln-γ trap closed by \|u\|-symmetry) | `getSNorm`@1602 (mode read), MUST-APPLY-1 comment block @1620 · LS single-basis | GAP on v28 (GH-line pin: R3 `getMP_raw_over_slope` GROUNDED) | §Strike Normalisation, §The Origin Perp |
| C5 Rebase | x→rx, α→rα, β,y invariant ⇒ w,γ,mode invariant; lens-read commutes | `rebase`@1691 · needs-verify (register) | `rebase_w/gamma/center`, `gLoc_rebase_invariant` (v28 lens∘rebase commute) — **GROUNDED, trusted-from-prover** (LENSKERNEL d7da8597, audited 2026-06-13; `LensKernel.lean`); PH6 `R_form_rebase_invariant` GROUNDED (GH-line/PH frame) | **GAP** (no rebase section in draft) |
| C6 Pricing law value∝S^(−γ) | power-law wings, lensed local exponent → γ in wings | `markLensed`@1655, wings · LS frozen-wings (G4 heir) | R2 `crossover_sNorm_at_K` GROUNDED; frontier `slope_strictMono/frontier_antitone` GROUNDED+GHMaps-discharged | §Pricing, §Mapping Strikes to Ray Angles |
| C7 ITM American smooth-paste | `S* = K·g/(g+1)`, `sNorm* = θ·((g+1)/g)^g`, `c = 1/((g+1)sNorm*)`; value+slope C¹, incl. g<1 | `markLensed`@1655–1665 · LS settle==lensed; **at-strike ITM = direct-formula payout (no AMM), de28c937 (entry 198)** | R1 `valueMatch_A/slopeMatch_A` GROUNDED (γ form); T1a `Sstar_A_forced` GROUNDED (boundary FORCED); T1b optimality GROUNDED+CARRIED[Snell]; **g_loc port `sStarCall_pos/ge_theta`, `contCall/intrCall_at_sStar`, `valueMatch_g`, `slopeMatch_g` (∀g>0 incl. g<1, no `1<g` hyp) GROUNDED, trusted-from-prover** (LENSKERNEL d7da8597, audited 2026-06-13; `LensKernel.lean`) | **GAP** (settlement in draft = escrow frame; smooth-paste rule not drafted) |
| C8 Strike registration θ=sNorm(K) | uniform ray registration; OTM→ITM crossover at dollar K | `mark`@1608, `legPrice`@1722 · needs-verify | R2 `crossover_sNorm_at_K` GROUNDED | §Mapping Strikes to Ray Angles, §Anchor Curve as Strike Reference |
| C9 Funding = slope-deviation | `f ∝ ±g_loc(K)` vs w=½ anchor; →0 ATM, →γ wings | `fundingPerStrike`@2175 · LS funding; ⚠ ATM→0 re-confirm flagged in register | PH3 `gh_arbLeak_density_nonneg` GROUNDED (R⪰0, motivation-layer); FW sweep `leak_nonneg/leak_pos/leak_eq_bregman` (Bregman form, `fw_proj_gate_leak` 727fc83e — **unfolded + status caveat**, SWEEP) | §Funding |
| C10 Slippage basis mpGeom | N/A on v28 (price==slope on plain Balancer; e^(−ghMu) is GH-only) | N/A | R3, R5 GROUNDED (GH-line pins, retained) | **GAP** (not drafted) |
| C11 Dollar / settlement pipe | settle/record/value at lensed prices; raw_net=Y−X single-basis. **At-strike (de28c937): the AMM swap is notional×strike cash (dy=N·K), PREMIUM-FREE; option pricing sizes ONLY the buy leg (N_buy = sold-leg proceeds / unit premium). Open + OTM-close at-strike (reverse dy=−open dy ⇒ reserves restore); ITM-close = direct-formula payout, no AMM.** | `executeLeg`@1761 (at-strike swap), `closeBand`@1971 (OTM at-strike reverse / ITM direct payout), `raw_net`@2100, `pfComponents`@4248 · LS single-basis, round-trip-zero; **at-strike + reserve-guard gates (34/34)** | **GAP** (no Lean for the dollar pipe; nearest: B1 CARRIED[coverage] solvency conditional; the at-strike no-arb-on-close lemma is **pending-submit**, see A14) | §Settlement → The Escrow Frame, Closing a Band, Two Scalars |
| C12 Price-coord-vs-slope gotcha | N/A on v28 (single-basis) | N/A | R3 GROUNDED (the pin that caught it, GH-line) | GAP |
| C13 Solvency (B1 real floor) | funding port necessary-not-sufficient; coverage→solvency conditional; κ extrinsic | `markLensed`∈[0,1] · LS solvency ceiling ≤1 | B1 `solvent_of_port_covers` **CARRIED[coverage]** — real floor STILL-OPEN (operator ship-gate) | §Limitations (partial) |
| C14 Esscher tilt / rapidity group | GH trade = latent one-param group, Esscher tilt | N/A (motivation-layer) | GHJ `gh_slope_law/esscher_core` GROUNDED [motivation-layer] | **GAP** (candidate: §AMM Intuition) |
| C15 File-safety gate | process artifact, not a math object | `.claude/hooks/file_safety_gate.sh` · blob md5s | N/A | N/A |
| C16 Warp-with-trades (continuous) | continuous warp `ΔG(K)=∫_{γ₀}^{γ₁}Φ_τ(\|ln θγ\|)dγ` exact-differential, `0≤ΔG≤Δγ`, decomposition live=ΔG+recentering | **VERIFIED — BUILT + PROMOTED (entry 181) + tester-confirmed live; the continuous warp animation is LIVE in HEAD de28c937** (skeptic post-promote CLEAR `VERDICT_CONTWARP_POSTPROMOTE`) · `lens_selfcheck` incl. CF1–CF4 (telescoping 8.9e-16; engine byte-identical; money paths zero-delta) + tester `evidence/v28_contwarp/` | `warpDen_nonneg/lt_one`, `warpPot_hasDerivAt` (FTC-2), `warp_eq_pot_sub`, `warp_additive`, `warp_roundtrip_zero`, `warp_nonneg`, `warp_le_dgamma`, `warp_nonpos_sell`, `warp_pos`, `glAt_hasDerivAt`, `warp_decomposition` (kink-inside) — **GROUNDED, trusted-from-prover** (WARPCALC 24e6497e, returned COMPLETE + audited 2026-06-13: token-clean, axioms ⊆ {propext,Classical.choice,Quot.sound}, out-of-scope byte-identical, math re-derived; `WarpCalc.lean`); scalar backing = warp-amm Model C (trusted-from-prover); float64 note `notes/research/CONTINUOUS_trade_warp_lens_calculus_2026-06-12.md` | §Trade Formula (Δw); warp-view itself **GAP** |

## PART B agreements

| ID | Object / equation | Code · gate | Lean · provenance | Paper |
|----|---|---|---|---|
| A1 trades-warp-curve (w changes) | w=α/x moves on every trade; Δw=β·Δy/(y·y′). **At-strike de28c937: the SWAP itself is premium-free (dy=N·K); w still moves on the at-strike swap (faithful reserves), the warp is SEEN through the lens.** | `tradeUpdate`@1679 (w derived) · LS 6b (pool byte-identical at de28c937) | `gamma_linear_in_cash` (γ′=γ+dy/β) **GROUNDED, trusted-from-prover** (LENSKERNEL d7da8597, audited 2026-06-13); FW `hasDerivAt_wNew` w′=(1−w)/y (sweep, unfolded) | §Trade Formula (the Δw paragraph) |
| A2 kurtosis static, vol-set | τ a constant parameter of the read layer; no trade writes τ | `gLoc(state,θ,tau)`@1639 (τ passed, never assigned) · LS regression | structural in the defs (τ is a fixed parameter in `gLoc`/`warpInt`); no dynamics to prove — N/A | GAP (lens not drafted) |
| A3 HEAD = v28 lens | register/process row | HEAD md5 `de28c937…` (v28 lens + at-strike A14 + continuous warp) | N/A | N/A |
| A4 settle/record/value at lensed | one helper (`gLoc`/`markLensed`) at live mode, all 9 W-sites | W1–W7 sites (`legPrice`@1722, `closeBand`@1971, `markEff`@1915, `pfComponents`@4248) · LS settled==lensed, open==settle | **GAP** (same-fn equality is algebraic; no theorem-shaped content beyond C7's seam) | **GAP** |
| A5 asymptotes preserved | Φ_τ→1 ⇒ g_loc→γ in wings; no floor/saturation | LS frozen-wings | `Phi_le_one`/`Phi_lt_one` + `gLoc_le_gamma` (bound side) **GROUNDED, trusted-from-prover** (LENSKERNEL d7da8597, audited 2026-06-13); the wing LIMIT (Tendsto Φ→1) **GAP — not pinned (pending-submit)** | §Pricing (power-law wings) |
| A6 monotonicity / no-arb | butterfly/strike/spot monotone; reflection symmetry | LS monotone | frontier+GHMaps GROUNDED (GH-line); C3 `reflection_arrow` GROUNDED (arrow; residual spec↔engine premise); v28-lens-specific no-arb **GAP** | §Properties → No Internal Arbitrage |
| A7 weights complementary | w + (1−w) = 1 always | structural (w derived) | structural in defs (every Lean statement uses w and 1−w) — nothing further to prove | §Conservation Law |
| A8 banned term (style) | process row | N/A | N/A | N/A |
| A9 communication form | process row | N/A | N/A | N/A |
| A10 held-lens, amplify-not-neutralise | continuous warp = N→∞ of the held-then-update mechanic; lens amplifies skew | **superseded by the continuous mechanic, now LIVE in C16 (de28c937)** | WARPCALC **GROUNDED, trusted-from-prover** (24e6497e, audited 2026-06-13 — the N→∞ object: `warp_*` + `warp_decomposition`); modeling-statement label (entry 158 reading) stays on the note | GAP |
| A11 honest limit (skew grows across sequence) | call/put asym grows superlinearly in D (float64 §4(v)) | N/A | **GAP** (asymmetry-growth not pinned; candidate next-queue lemma, pending-submit) | GAP |
| A12 θ_K stays settlement strike | execution-relocation BLOCKED (basis-leak arb). **At-strike de28c937 keeps θ_K as the payoff/settlement strike (operator entry 197 ruling).** | `legPrice`/`closeBand` one-premium-per-leg · LS single-basis | **GAP** (no-go lemma candidate, pin only on operator call) | §Settlement |
| **A14 at-strike trade mechanic** | the AMM tx is the at-strike bookkeeping swap: sell leg = notional×strike cash (dy=N·K), NO premium in the swap; option pricing enters ONLY at the buy leg (N_buy = sold-leg proceeds / unit premium). Open + OTM-close at-strike (reverse dy=−open dy ⇒ reserves restore); ITM-close = direct-formula payout (no AMM). Trade at the LIVE curve; slippage paid continuously (operator entry 197) | **VERIFIED — BUILT + PROMOTED, HEAD de28c937; tester live 5/5 ×2 (warp rises OTM $8.8k/12k/16k/32k @1.1/1.5/2/4×; ITM direct payout; reserve-guard rejects w/ depth $; sweep+τ no regression)** · 34/34 gates incl. at-strike + reserve-guard; pool fns byte-identical; skeptic RECHECK CLEAR (`VERDICT_A14_atstrike_RECHECK`) | **pending-submit (prover-blocked)** — at-strike no-arb-on-close lemma (reverse-dy reserve restoration + ITM direct-payout no-leak) NOT yet written/submitted to Aristotle; the per-step/continuous warp algebra it rides on IS grounded (C16 WARPCALC). NO theorem returned for the at-strike close-semantics itself | §Trade Formula; §Settlement |
| **A15 slippage haircut on the bought option** | NOT proceeds-netting: size the bought leg AS IF at PRE-TRADE option prices, execute the AMM trade → realized total slippage, then apply that slippage as a HAIRCUT reducing the bought output (entry 205/206 sequence, no circularity) | **SPEC'd, QUEUED** (`specs/SPEC_A15_slippage_haircut_2026-06-12.md`) — NOT in HEAD; build target. Decision **Q10 pending** (operator) | **pending-submit (prover-blocked)** — no obligation submitted; slippage magnitude rides on the C16/WARPCALC continuous-integral (grounded), but the haircut-composition lemma is unwritten. **GAP** | §Trade Formula (slippage); §Settlement |
| **A16 no-jump ATM position value** | a held position's live VALUE is continuous (C0, no jump) as the underlying crosses ATM / OTM↔ITM — distinct from C7 settlement smooth-paste (that's the exercise value; this is the live portfolio mark). markEff→legValueUnified→pfComponents all via smooth-pasted markLensed | **IMPL CLOSED + LOCKED** — `a16_atm_gate.js` 5/5 (manager-verified; one-sided-limit discriminator confirms genuine continuity; negative-controlled: a +0.05 ATM jump FAILS it; routed HARD in run_all). No engine build needed (lens already fixed v24's ATM jump) | **pending-submit (prover-blocked)** — lemma **A16-CONT** (markLensed∘gLoc continuous at sNorm=θ, both one-sided limits = 1) is QUEUED to Aristotle, NOT yet submitted/returned (companion to LENSKERNEL `valueMatch_g`). **A16-CUSP** (continuous-but-non-C¹ peak at ATM: accept vs smooth) = morning decision **Q11** (operator) | **GAP** |

---

## SWEEP — Aristotle store, all past work (operator entry 142)

### Upgraded tonight: warp-amm cluster — retrieval-only → **trusted-from-prover**
Projects `d20dda3a` (warp-amm, Model A/pivot — superseded), `7f933065` + `4e92e3cb`
(warp-amm-handoff, Model C twins; statement-identical, proof-scripts differ; `7f933065` newest =
canonical). Audit (research-lead, 2026-06-12, archives extracted to throwaway `/tmp/sweep`):
- **Token scan: CLEAN** all three `Warp.lean` (no sorry/admit/axiom-decl/native_decide/opaque/unsafe;
  `Main.lean` = set_options only, none kernel-trust-affecting).
- **Axioms:** ARISTOTLE_SUMMARY asserts ⊆ {propext, Classical.choice, Quot.sound} (server compile;
  no local `#print axioms` possible — env honesty).
- **Statements re-derived by hand, all intended:** log-slope affine in rapidity; premia duality
  P_C·P_P=1; slope-product invariant; `2σ·sinhΔξ` / `2σ²(coshΔξ−1)` integral forms; reciprocal-strike
  symmetry; Model C `mode_shift` (via σ_B substitution) and `mode_shift_closed_call` (pre-curve
  constraint ⇒ `(1/w₀)ln(y_s/y_B)`); slippage `e^{Δξ_m}−1`.
- **FRAGILE TACTICS flag:** `grind` in `mode_shift_closed_call` (7f933065 L192), heavy `nlinarith`
  in `mode_shift` — no-math flags, recorded.
- **Caveats kept:** trade-POINT-anchored warp (Model C anchoring ≠ v28's live-mode lens; the §2
  frozen-w `mode_shift_closed_call` is the first-order approximation of the exact
  `Δln center = −ln((y₁−β)/(y₀−β))`, see the CONTINUOUS note); engine link NOT claimed.

### Found, proven, **UNFOLDED** (parallel-session submissions; flagged to manager — not mine to fold)
| Project | ID | Status | Audit tonight |
|---|---|---|---|
| `fw_proj_warp_core` (FW-1/2/3/13: w′=(1−w)/y flow, α/β conserved, transport-uniqueness, round-trip, semigroup) | 56b4f0fa | COMPLETE | token-clean; unchanged modules byte-identical to working tree; summary asserts standard axioms |
| `fw_proj_gate_leak` (FW-7/8: validity=convexity gate, leak≥0, leak=Bregman gap) | 727fc83e | **COMPLETE_WITH_ERRORS** | token-clean; unchanged modules byte-identical; summary asserts clean compile + standard axioms — **server status contradicts summary; owning session must reconcile before any fold** |
| `fw_proj_germ` (FW-5/6: joint warp+mode germ, ε′=−1/2, A=1/2, validity strip) | 6d6ba6e6 | COMPLETE | token-clean; byte-identical; summary asserts standard axioms |
| `offatm_submit` (off-ATM trade point: existence/uniqueness, w′∈(0,1), pole-does-not-bound) | 90056417 (+ twin f3776478) | COMPLETE | token-clean; summary asserts proof-bodies-only fill |

### Pre-repo cluster (4–7 weeks old; candidates, NOT audited tonight — honest GAP)
`# Aristotle Task — Two AMM…` (0fa8f37d), `SU(1,1)…` (dd55c690), `Invarian…` (b9104577),
`Closed-F…` (4895db4e, 277d41b1), `Minkowsk…` (3f7eb479), `Complex…` (c37db345, eda7d4b6),
geometric-foundations + endogenous-policy + Real-K set (7-week block). Predate the repo INDEX;
retrieval candidates only.

### Submitted 2026-06-12 overnight → RETURNED + AUDITED + FOLDED 2026-06-13
| Run | Project ID | Content | State |
|---|---|---|---|
| LENSKERNEL (L2 + lens basics + seam port + rebase) | d7da8597-f234-4b41-9976-eff587799a8b | prompt `formal/prompts/aristotle_prompt_lenskernel_L2.md` → `RequestProject/LensKernel.lean` | **RETURNED COMPLETE; audited 2026-06-13 → trusted-from-prover** (token-clean; axioms ⊆ {propext,Classical.choice,Quot.sound} on all named targets; out-of-scope modules byte-identical; toolchain v4.28.0; math re-derived). Folded `formal/aristotle_runs/LENSKERNEL/` |
| WARPCALC (L1 ΔG calculus: exactness/bound/decomposition/sign) | 24e6497e-3c60-4ec1-b626-0e0f2929a39d | prompt `formal/prompts/aristotle_prompt_warpcalc_L1.md` → `RequestProject/WarpCalc.lean` | **RETURNED COMPLETE; audited 2026-06-13 → trusted-from-prover** (same gate PASS; `import Mathlib`; FTC-2/bound/decomposition statements re-derived). Folded `formal/aristotle_runs/WARPCALC/` |

**Job-1 diagnosis (2026-06-13):** Aristotle IS reachable from this environment (aristotlelib CLI, no `403 host_not_allowed`; both project tasks show COMPLETE, started 11h 32m ago). The overnight stall was that the archives were never DOWNLOADED — not a network block. (`list` shows the projects as IDLE because the task finished and the project went idle; that is NOT "never ran".)

### Still pending-submit to Aristotle (v28/at-strike-specific, prover-blocked = unwritten/unsent, NOT trusted-from-prover)
| Obligation | For | Status |
|---|---|---|
| A16-CONT (markLensed∘gLoc C0 at sNorm=θ, both one-sided limits=1) | A16 no-jump ATM theory leg | queued, NOT submitted |
| A14 at-strike no-arb-on-close (reverse-dy reserve restoration + ITM direct-payout no-leak) | A14 close-semantics | NOT written |
| A15 slippage-haircut composition lemma | A15 | NOT written (decision Q10 pending) |
| A11 asymmetry-growth (call/put asym superlinear in D) | A11 | candidate, NOT pinned |
| A5 wing limit Tendsto Φ→1 | A5 | candidate, NOT pinned |

## Maintenance
research-lead updates rows on every run fold; manager confirms against its audit before commit;
skeptic audits provenance labels + the L3 honesty line every pass. No row may say "verified" —
that label is env-blocked until a local canonical-kernel Lean build exists (entry 146 enabler).
