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

## Four-fix referee pass (entry 272 "sure ok to both", 2026-06-23) — American draft, text-only
Folded into `paper/temporal_paper_american_2026.tex` (engine/Lean UNTOUCHED; handed to manager for skeptic-gate):
- **FIX 1 (Merton convention, substantive).** The FORMULA `γ(γ+1)=2r/σ²` stays; only the wrong
  "classical/no-dividend Merton" LABEL was replaced. Now stated as the SYMMETRIC put/call-root
  pairing (put root −γ, call root γ+1, root-sum 1, zero net carry between legs) → Vieta product
  relation, encoded by Lean `merton_vieta_sum/prod` + seam gate; regime **r>σ²** (quadratic
  reading, NOT r>σ²/2). The no-dividend BSM slice noted as the LINEAR `γ=2r/σ²`, explicitly "not
  used here." Three sites: §sec:american prose (~604), §sec:formal Merton bullet (~767), Appendix-A
  symbol table r/σ rows (~1046). r,σ introduced in plain English at first use.
- **FIX 2 (reproducibility).** Added "Inspecting the artifacts" para in §sec:formal provenance:
  Lean statements+source in-repo at `formal/` (+ `formal/INDEX.md`, `aristotle_runs/`); Aristotle
  private/not reproducible; stays trusted-from-prover, NOT upgraded to "verified."
- **FIX 3 (surface conditional hedges).** New "Scope and standing assumptions" para in intro
  (right after the result-stated-first honest bounds): solvency CONDITIONAL on B1/B3/B4 = structure
  fields not discharged; geometry necessary-never-sufficient; "assumptions, not claims." Wording
  matches existing B1/B3/B4 naming.
- **FIX 4 (worked example).** New §"A worked example (illustrative numbers)" in §sec:american:
  γ=2, K=$100, m=1→S*=$66.67, value-frac 1/3; small table of OTM put marks at S=80/90/100/120 for
  m=1 (g_loc=2) and m=3 (g_loc=6), via S* formula + wing power-law value∝S^(−mγ). Labelled
  ILLUSTRATIVE/not-calibrated/no-validation-claim throughout. At-S* m=3 mark=1/(g_loc+1)=1/7 (self-
  consistent with lensed steepness).
- Structural checks: $ even (718), braces balanced (838/838), all envs OK (tabular now 3). No
  pdflatex in env. Only `paper/temporal_paper_american_2026.tex` changed (history/ file mod is
  pre-existing working-tree state, NOT mine).

## WINE2026 from-scratch storytelling rewrite (entry 277) — NEW file, claims unchanged
Wrote `paper/wine2026/temporal_wine2026_v2.tex` (LNCS `runningheads`, single self-contained file,
all figures TikZ/pgfplots — NO external images, compiles standalone). Storytelling-first per operator:
idea-flow → notation-with-narration → diagrams. Reference draft `temporal_wine2026_lncs.tex` NOT edited.
- **Reused ONLY verified content** from `temporal_wine2026_lncs.tex` (claims, contributions, provenance
  labels, bibliography 15 entries) + worked example / corrected Merton wording from
  `temporal_paper_american_2026.tex`. NO new claim introduced.
- **3 TikZ figures:** Fig1 curve warp + trade at arbitrary point on curve (§warp); Fig2 vol-knob
  steepness shape, mode-peak=1, steeper as m rises, mirrors engine chart-2 (§lens); Fig3 American
  smooth-paste seam continuation→intrinsic, S*=66.67 worked-example values (§american).
- **Structure (8 sections):** 1 idea-told-first (result+conditions one breath, contributions) · 2 curve
  and warp (Balancer plain-English, Fig1) · 3 continuum (mark, carry introduced plainly) · 4 vol knob
  (Fig2, ceiling=level+skew-not-smile) · 5 American (Fig3, worked table, Merton tie eq:merton) ·
  6 properties (collar iff w=½ conditional-skeleton, settlement, |Γ|≤1) · 7 honest frontier (tfp,
  conditional solvency B1/B3/B4 headline, single-object research direction) · 8 related/limits/conclusion.
  App A notation table (on-request), App B formal artifact list (tfp, on-request) — ~1pp total.
- **Honest invariants verified present:** Balancer+lens NOT GH (GH only as carried Merton layer);
  curve-family-not-contribution (Evans/AEC deflation); solvency CONDITIONAL B1/B3/B4 necessary-not-
  sufficient; American=deterministic + Snell named-not-formalised; |Γ|≤1 exact /|Γ|>1 labelled approx;
  all Lean tfp NEVER "verified" (only honesty-hedge uses of word); Merton γ(γ+1)=2r/σ² symmetric pairing
  regime r>σ², faith_merton gate, no-div slice=linear; single object=research direction; QuantAMM PRIOR,
  no TFMM.
- **Checks (no pdflatex in env):** $ even 456; braces 556/556; envs matched; 3 fig/axis/tikz matched;
  abstract math-free, ~211 words. **PAGE-FIT FLAG to manager:** est ~11–11.5pp incl refs (body ~9.5–10
  + refs ~1 + appendices ~1, on-request/trimmable) — under 12 but tight; operator must compile to confirm.
  Per-section budget handed to manager in return msg.
- Engine/Lean UNTOUCHED. Handed to manager for page-fit + skeptic gate. NOT git'd.

## WINE2026 v2 page-fit trim (entry ~277 follow-up, 2026-06-26) — remove/relocate only, no claim touched
Manager's pessimistic compile est. ~12–13pp > 12 HARD cap (mine was 11.5). Engineered MARGIN by
moving on-request material OUT of the submission per operator entry 277 (Lean/formal annexures
"on request only, won't be attaching"):
- **Appendix B (formal-artifact map) MOVED OUT** → `paper/wine2026/temporal_wine2026_v2_supplement.tex`
  (commented block, NOT compiled into submission). In-body pointer kept: §7.1 (sec:frontier) now reads
  "the full formal-artifact map and Lean statements are available on request (see `formal/INDEX.md`)"
  — replaced the old `Appendix~\ref{app:formal} maps each` cross-ref (which would dangle).
- **Appendix A (notation table) ALSO MOVED OUT** to the same supplement (budget call: relocating both
  buys ~1pp margin; body self-contained — every symbol glossed in-body at first use, operator wanted
  notation near symbols anyway). `\appendix` command removed; no dangling app:notation/app:formal refs.
- **§8 lightly compressed** (related/limits/concl): tightened "is exactly the"→"is the", "shows how to
  choose"→"chooses", "we treat it as prior art and use a neutral"→"we use the neutral", conclusion
  "Closing that port hypothesis---and wiring...---are"→"Closing...and wiring...are". NO cited work,
  hedge, claim, number, figure, or the Merton wording dropped. "Curve v2" specificity restored after
  an over-trim. QuantAMM PRIOR, LVR dual, all 15 bibitems intact.
- **Budget (SUBMITTED part only, title→references):** abstract ~0.35 · §1 idea ~1.0 · §2 warp+Fig1
  ~1.4 · §3 continuum ~0.85 · §4 lens+Fig2 ~1.4 · §5 American+Fig3+table ~1.7 · §6 properties ~1.1 ·
  §7 frontier ~1.05 · §8 related/limits/concl ~0.95 · refs (15) ~0.95. **TOTAL submitted ≈ 10.7pp**
  (pessimistic compile lands ~11–11.5, under 12). On-request supplement (2 tables) ~1pp, OUTSIDE count.
- **No-claim-change verified:** $ even (364), braces 492/492, 3 figs/axes/tikz matched, tabular(1)=
  worked-example table kept, worked-example numbers byte-intact, abstract/Merton/B1B3B4/tfp/|Γ| all
  untouched. No pdflatex in env. Handed to manager for skeptic gate. NOT git'd.

## Discipline
Every quantitative/formal claim traces to a verified artifact or a named assumption, or it doesn't
go in. New claims/positioning are strategic → flag to the **manager** (who escalates to the operator).
