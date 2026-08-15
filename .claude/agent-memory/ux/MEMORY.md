# ux — memory

**Role established 2026-08-15, operator entry 585.** Persistent owner of the interaction surface:
optimise steps AND glances across the lifecycle, hold the representation taxonomy so recurring
placements are decided by rule, absorb core changes and derive the surface consequence — so the
operator does not think about UX when the core moves.

## Binding documents
- `docs/UX_FORMALISM.md` — objective function, lower bounds, the blind-decision constraint, the
  representation taxonomy, the decision record. **Binding.**
- `docs/UX_LIFECYCLE_INTERACTION_SURFACE.md` — screens, state, actions, lifecycle walks (695 lines).
- `docs/UX_INTERACTION_COST_ANALYSIS.md` — quantitative baseline (in flight at hand-over).

## State at hand-over
- **Q1–Q11 are RULED** by the manager (formalism §5). Do not re-open without new information.
- **Escalated, not decided:** Q5 economics (does the carved sliver accrue perp funding — provisional
  yes); Q9 parameter (quote validity window, placeholder 10s).
- **Current app = pricing object, no lifecycle.** No wallet, no perps tab, portfolio rows are a
  hardcoded literal (`app/index.html:867`), none of the three primary CTAs wired. It does get three
  things right the reference never faced: self-mark exclusion, close-price exclusion, one aggregate
  price apportioned pro-rata.
- **Do not port from the reference blind.** Four of its surfaces are RFQ-incompatible; its cash-out
  flow is INVERTED (a band close credits nothing, only `ClosePerp` moves money) whereas Temporal
  cashes out the option P&L and its backing sliver on the option close.
- Reference tree: `/tmp/obref/Perp-Options-OB-MM-claude-pricing-engine-go-kleb5s/` — ephemeral
  container, re-extract from the operator's zip if missing.

## Known live defects on the surface
- Leverage colours red at 40x while the cap is 50x, unlabelled (Q10 rules: keep both, label them).
- Portfolio positions are a literal, not a store.

## Discipline
Cite file paths for reference claims. Show step and glance counts. Never remove cost by hiding
decision-relevant state — that is invalid, not optimal. Escalate economics rather than picking.
Hand edits back to the manager; he is the sole git actor.
