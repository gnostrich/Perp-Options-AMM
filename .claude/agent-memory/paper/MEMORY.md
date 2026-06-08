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

## Must-cite
**Singh et al.** — LVR as a continuum of perpetual options. The nearest neighbour; keep ready for
positioning/rebuttal.

## Discipline
Every quantitative/formal claim traces to a verified artifact or a named assumption, or it doesn't
go in. New claims/positioning are strategic → flag to the **manager** (who escalates to the operator).
