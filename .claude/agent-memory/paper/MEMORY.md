# MEMORY — paper
_Last updated: 2026-06-08, bootstrap. Rewrite changed bits at task end._

## Pipeline / deadlines
- **AfT 2026** — notification ~Jul 15 2026 (draft: `paper/Temporal_Paper_AfT_2026_v6.docx`).
- **WINE 2026** — ~Jul 2 2026.
- **FMBC 2027** — the **Lean paper** (OASIcs + JLAMP). Headline = the typed interface stack:
  universal short-gamma curve propagating curve → storage, and `reserves_have_no_floor`
  ("convexity must be funded") as a theorem.

## Sources of truth
`paper/temporal_paper_draft.md`, `specs/temporal_formal_spec.md`, `paper/Temporal_Paper_AfT_2026_v6.docx`.
Cite formal results by their actual names/locations in `formal/MANAGER_VERIFICATION.md` —
never paraphrase a theorem into the prose. Use `python3` + python-docx for the `.docx`.

## No-overclaim list (state as scope, don't bury; don't let prose outrun proof)
- Solvency is **conditional**: B1/B3/B4 are hypotheses; WAY-2 assumed.
- The engine is **not yet shown** to instantiate the contracts; proven instances are **cpmm/expPool**.
- C3 (no-arb) is a **conditional skeleton** — the curve-symmetry → reflection arrow is an axiom.
- |Γ|>1: "true American" and "exact replication" are mutually exclusive per wing → present |Γ|≤1
  exact, |Γ|>1 as a labelled approximation. (Scope/claim calls route to the operator via manager.)

## Must-cite / positioning (UPDATED 2026-06-14, referee-fold entry 245)
- **Singh et al. DISPOSITION: REMOVED.** The "Singh et al." LVR-as-perpetual-options entry was an
  UNVERIFIED placeholder (fabricated-citation risk, the Q10 near-disqualifier). Replaced in the
  American draft by the REAL **Milionis–Moallemi–Roughgarden–Zhang LVR (arXiv:2208.06046)** —
  the verifiable LVR reference; the "continuum of perpetual options" reading is positioned as the
  dual of our sell-side construction, and reused for the round-trip residual. Do NOT reintroduce a
  "Singh et al." cite unless a real, verifiable source is found.
- **Prior art now IN the American draft** (all real arXiv IDs): Evans 2020 (2006.08806, the
  shifted-constant-product deflation); Angeris–Evans–Chitra 2021 (2103.14769) + RMM-01;
  InfinityPools; Pusceddu–Bartoletti FMBC 2024 (2402.06064, Lean-AMM lineage); LVR (2208.06046).
  QuantAMM positioned as PRIOR; Panoptic corrected to Lambert & Kristensen (2204.14232). NO "TFMM"
  coinage — use "Temporal Exchange" / "per-trade weight-dynamic AMM."

## Referee-fold state (American draft `paper/temporal_paper_american_2026.tex`, entry 245)
The AfT-2026 referee report on the OLD (barrier) paper was folded into the NEW (American) draft:
- **Novelty repositioned (Q9):** curve family DISOWNED as novel (translated CFMM / Evans). Claimed
  novelty = (i) per-trade endogenous weight update, (ii) semantic layer, (iii) American smooth-paste
  generalisation, (iv) the constant-m vol-calibrated lens. Header comment documents the full fold.
- **Finding 1:** AMM section rewritten as a STATE TRANSITION SYSTEM — conservation applied at the
  trade's own point; w is stored state (NOT α/x); k is a readout (NOT conserved); global α,β NOT
  conserved off-ATM (spot = special case); trajectory hyperbola scoped to the SPOT operator;
  q↦Δy stated (at-strike cash leg Δy=q·K(θ)). Retracted "governed by invariant / w derived / no
  state storage" framing explicitly withdrawn.
- **Q4:** constant-m lens framed as the delivered vol-calibration answer; funding given functional
  form (deviation-proportional, per-ray, w=½ anchor, through-the-lens ±mγ), vanishes at anchor
  noted; NO Monte-Carlo-neutralisation claim.
- **Findings 2/3:** collar at true strength (θ-independent surplus, symmetry not no-arb-over-
  compositions); swap-composition prose WITHDRAWN in intro/§noarb/conclusion. Lean = trusted-
  from-prover, anonymised-deposit posture kept.
- **Q11:** sNorm=(1−w)/w pinned in notation; pivot/tangency kept as infinitesimal; OTM branch uses
  "OTM side of s_N*" (no θ<sNorm error).
- **Limitations:** added settlement-ledger, momentum-band, settle-sandwich, round-trip residual,
  q↦Δy as honest open surfaces.
Structurally checked (envs/braces/math balanced); no pdflatex in env. Handed to manager for
claim-audit + skeptic honesty pass.

## Positioning pass (entry 246, 2026-06-14) — bound to skeptic pre-vet a6d4a609
Folded into `paper/temporal_paper_american_2026.tex` ONLY what cleared:
- **#1 Snell — NOT folded** (skeptic FLAG-OVERSELL). §5.3 "Why this is the American boundary" +
  T1b wording left byte-identical (deterministic-variational; Snell named-not-formalised, True
  placeholder). Verified untouched.
- **#3 scope-vs-conditional split — folded.** Limitations now two labelled subsections: **Scope**
  (|Γ|≤1 per-wing, single-pool-rigidity+pricing-ceiling, no-measure-geometry) + **Conditional/open**
  (solvency B1/B3/B4 HEADLINE, engine≠spec oracle bridge, GH/Bessel arbitrary-asset, provenance-tfp,
  unified-object, settlement-ledger, momentum-band, settle-sandwich, round-trip, citation-provenance,
  notional-cash-leg). 13 original items all survive + 1 new (GH/Bessel standalone) = 14. None deleted.
- **#4 lead-with-strength — folded.** New "result, stated first" para in intro (exact closed-form
  American across OTM continuum, opposite-wing band exact per-wing, Merton-anchored) THEN conditions.
  Both mandated qualifiers (any-asset⇒GH/Bessel; American⇒Snell named-not-formalised) now in BOTH
  abstract AND intro.
- **#2 |Γ| per-wing — folded w/ caveats.** §sec:gamma: |Γ|≤1 is PER-WING, band opposite-wing clause
  IS the guarantee, exact for shipped product; |Γ|>1 demoted to SCOPE (same-wing stacking/single-leg
  leverage) but kept DISCLOSED. NO sim numbers (no "1.55").
- **#5 2-knob/no-smile — folded w/ caveat.** §sec:lens new para: ~2 shape knobs (mγ tail + w skew),
  fits level+skew not smile curvature; SAME object as single-pool rigidity; framed tail-adequacy-only
  empirical backtest; does NOT discharge carried GH/Bessel/Merton hyps. OTM strikes level+skew-
  dominated → ceiling likely 2nd-order "empirical, not proven."
- **#6 solvency headline binary — folded.** Solvency is the headline item in Conditional bucket,
  distinct-in-kind from proof-status/bp-scale items.
- **Compile-fixes:** added `\usepackage{tabularx}` + `\usepackage[expansion=false]{microtype}`;
  App-B artifact-map table lll→`tabularx{\textwidth}{@{}l l X@{}}` (content identical, Archive col wraps).
- **HEDGE flagged to manager:** abstract grew ~206→~228 words (the 2 mandated qualifiers are the
  minimum content to land both). Could not hit ~195 without dropping a required qualifier — chose to
  keep all qualifiers + flag rather than cut. Structural checks pass (braces/envs/$ balanced);
  no pdflatex in env. Handed to manager for claim-audit + skeptic honesty re-audit of the diff.

## Symbol/term-introduction pass (entry 247, 2026-06-14) — presentation-only, claims unchanged
Operator entry 247: every symbol gets a nearby plain-English gloss at first use; every internal
term introduced plainly (flagship: "carry" — never previously introduced); abstract/intro strictest;
abstract symbol-light + shorter. Folded into `paper/temporal_paper_american_2026.tex`:
- **Abstract: symbol-light, 0 bare math, ~228→204 words.** All 8 mandated qualifiers verified present
  (Balancer-not-GH, American-lift-of-barrier, vol-calibrated knob, tfp-not-re-run, |Γ|≤1 per-wing
  approx, conditional-solvency/undischarged-port, any-asset-carried-hyps, American=deterministic +
  Snell named-not-formalised). **FLAG: could NOT reach 170–190 target** without dropping a mandated
  qualifier — the 8 qualifiers + headline are the floor. Chose keep-all-qualifiers + flag (same call
  the positioning pass made at 228). Manager to decide if 204 acceptable.
- **Intro "result stated first": all symbols glossed inline** — S*,K,γ,C¹/seam,Γ now plain-English
  adjacent; GH/Bessel spelled out as "a generalized hyperbolic / Bessel-K family." Claims byte-intact.
- **"carry" now introduced** (§3.5 retitled "The reference price (''carry'')…"): "an internal
  reference price, which we call the carry, P=N_y/N_x"; N_x,N_y,u,r glossed. First noun-use of "carry"
  is now its definition; all later uses follow it.
- **Terms introduced plainly at first use:** state-transition system, wing, trajectory hyperbola
  (already bolded+explained), lens ("read through it, as through a fixed optical element"),
  smooth-pasting, free boundary, normalised strike coordinate (s_N), at-strike, mark (already).
- **Body symbols glossed:** x,y,α,β,u,v,CFMM (deflation para); w,k (Balancer invariant);
  θ + mode/chosen/θ_tx; S (spot); c, s_N (continuation); β_th (Gibbs, renamed from β_T to avoid
  collision with offset β_T at trade point); $s$ in reflection arrow.
- **Appendix-A notation table expanded** to cover S, u/v, T/x_T…, Γ, θ_tx, Δx/Δy/Δw, c, σ, N_x/N_y,
  β_th, and a row disambiguating the two r's (rebase factor vs Merton interest rate).
- **§5.3 / T1b LEFT EXACTLY AS IS** (protected): verified Snell "named but not formalised", True
  placeholder, AmericanOptimalityPrinciple untouched. **FLAG: §5.3 contains bare σ (volatility) and a
  bare r that COLLIDES with the rebase-factor r (here = risk-free rate) + "Laplace exponent"/
  "characteristic root" terms.** Could not introduce them in-body without editing the protected
  section → documented both in Appendix-A table instead (the only safe lever). Manager: if operator
  wants these glossed in-body, §5.3 protection must be lifted.
- **Minor pre-existing collision flagged:** $u$ = x−α_T (deflation) vs $u$ = log-distance (carry);
  both locally defined, table notes it. $q$ = notional vs $q$=log S (Gibbs only); table notes it.
- Positioning folds (Scope/Conditional split, lead-with-strength, |Γ| per-wing, 2-knob, solvency
  headline) all intact — only glosses added, no claim touched. Structural checks: $ even, braces
  balanced, envs balanced. No pdflatex in env. Handed to manager for claim-audit + skeptic re-audit.

## Discipline
Every quantitative/formal claim traces to a verified artifact or a named assumption, or it doesn't
go in. New claims/positioning are strategic → flag to the **manager** (who escalates to the operator).
