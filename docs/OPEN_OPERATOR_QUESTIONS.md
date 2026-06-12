# OPEN OPERATOR QUESTIONS — canonical list (extracted at the 2026-06-11 manager wipe)

_One line per live question, fact-with-pointer only (skeptic succession plan, `notes/skeptic/VERDICT_MANAGER_TLDR_AND_SUCCESSION_2026-06-11.md`). Answers belong to the operator; nothing here is decided._

| # | Open question | Pointer |
|---|---|---|
| 1 | **γ>1 lock: relax or keep?** Under the standard perpetual-put model (q=0, r=5%: γ=2r/σ²), vol above ~32% prescribes γ<1 (curve flatter than 50/50), which v27's w>0.5 clamp forbids — crossover shifts with r/q, and the r,q↔our-carry mapping is UNDERIVED (premise unverified). THE live question (entry 77). | transcript entries 77–78 |
| 2 | **SUPERSEDED/DEAD** — this was a multi-knob list from the demoted curve line; VOID since entry 80 (operator: one flatness/steepness knob, native put/call asymmetry). The live architecture is {Balancer x, y, w} + {one lens intensity}; the old multi-knob list is dead. | transcript entry 80 |
| 3 | Path-A strike cap ≈1.4× spot: acceptable? (divergence is map-independent; cap is the only known fix) | entries 39–41; notes/skeptic/VERDICT_GLOBAL_SKEW (Q4) |
| 4 | A-vs-B weights fork: weight-free pricing exists only under B (spot-anchored, strike-blind); A (chosen) requires the stored scalar. | notes/research/GLOBAL_SKEW_goalseek + skeptic verdict #24 |
| 5 | y0 default: 303,448 (no-load-arb equilibrium) vs v24's 800,000 — **RESOLVED (entry 153 #5): make it editable, default free.** | BUILD_LINEAGE v27 row (entry 29) |
| 8 | **C16 warp — WHICH warp should the chart draw?** Two quantities point OPPOSITE ways (tester FINDING-WARP-DIR, both measured live): the **steepness/slope** warp GROWS further out-of-the-money [matches "warps more far OTM"]; the **drawn option-VALUE** gap SHRINKS far out because an option's value →0 in the wings [matches the dust-trade "small far-OTM warp"]. Neither is a bug. Draw value-warp / slope-warp / both-labelled? Decides what the (held-center-fixed) rebuild renders. | DIFF_LEDGER FINDING-WARP-DIR |
| 9 | **C16 scope — the at-strike trade mechanic (entry 127):** operator (entry 153 #4) ruled it **foundational / in-scope / currently UNMET** — the AMM transaction is virtual bookkeeping that skews the curve which prices the option on chart 2; today's build moves `w` from the band's net cash, NOT "buy call = buy asset for dollars AT STRIKE." | DIFF_LEDGER FINDING-TRADE-AT-STRIKE; entry 127 |

| 10 | **A15 slippage MEASURE — which one?** (morning decision; spec `SPEC_A15_slippage_haircut` HALTED here, not guessed.) The haircut form is multiplicative `N_buy·(1−s)`, sized at pre-trade prices — settled. But "the slippage as calculated in the AMM trade layer" has TWO defensible readings diverging ~3.6×: **(a)** the AMM layer's own displayed "Slippage %" (~29% @N=0.5; dominated by the SOLD-leg footprint) — fits "as calculated in the AMM layer"; **(b)** the bought-leg option-price drift pre→post (~7.76%) — fits "based on pre-trade option prices / the bought leg." Spec's labelled lean: (a) fits the wording's first half, (b) the second; NOT picked. | spec §step-2 FLAG; entries 205/206 |

| 11 | **A16-CUSP (small, aesthetic) — accept or smooth?** The no-jump-ATM requirement is MET (position value continuous across ATM). But at exactly ATM the lensed mark peaks at 1.0 with a slope sign-flip — a continuous **cusp** (C⁰ not C¹), because the centred lens forces the local exponent →0 there. Accept the cusp (current, no-jump satisfied) OR smooth it (a curve-semantic change to the g_loc→0 collapse). Non-blocking. | spec `SPEC_A16_no_jump_atm` §4 |

### PARKED — demoted (W)/Path-A curve line (NOT live; reopen only on operator say-so; skeptic note, entry 152 sequence)
| 3 | Path-A strike cap ≈1.4× spot — belongs to the demoted (W)/Path-A curve, not today's lens HEAD. | entries 39–41 |
| 4 | A-vs-B weights fork — belongs to the demoted (W)/Path-A curve, not today's lens HEAD. | skeptic verdict #24 |

_(Removed 2026-06-12 per skeptic entry-153 reply: old items 6 (τ "wing gap" framing — kurtosis visibility answered, entry 153 #6) and 7 ("wing exponents / hand-set boxes" — dead (W)-era language). The live architecture is exactly {Balancer x, y, w} + {one lens intensity}; no "wing" knob exists.)_
