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

## Discipline
Every quantitative/formal claim traces to a verified artifact or a named assumption, or it doesn't
go in. New claims/positioning are strategic → flag to the **manager** (who escalates to the operator).
