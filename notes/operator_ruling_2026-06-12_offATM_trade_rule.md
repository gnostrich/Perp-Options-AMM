# OPERATOR RULING — off-ATM trade semantics (2026-06-12)

**Source (verbatim):** `history/operator/2026-06-12_referee-report-review.md` entries 6 and 8.
Entry 8 (the confirmation):

> apply conservation at the trade's own point; pool reserves change by what actually flowed; w gets
> stored -- yes; and what actually flowed would also be as per that trade point if  that makes sense
> --- round trip stuff can be done later because same problem as dynamic function AMMs like Curve
> which are mainstream accepted

## The rule (manager formalization, operator-confirmed)
State = (x, y, w) — **w is genuine state** (stored, not derived from reserves off-ATM).
A trade at strike ray θ with cash leg Δy:
1. **Trade point:** T = (x_T, y_T) = intersection of the ray y = θ·x with the live pool curve
   x^w·y^(1−w) = k. (Single intersection.)
2. **Local conserved pair at T:** α_T = x_T·w, β_T = y_T·(1−w). The conservation law is the
   per-trade **transition generator applied at T** — NOT a global invariant across off-ATM trades.
3. **Flows computed at T** (and these ARE the actual reserve changes):
   Δx = −α_T·β_T·Δy / [(y_T−β_T)(y_T+Δy−β_T)],  Δw = β_T·Δy / [y_T·(y_T+Δy)].
4. **Next state:** (x+Δx, y+Δy, w+Δw).

**Spot special case:** at the reserves point the local pair equals the global pair, so spot trades
conserve global α, β — the paper's §5.1 wording is true exactly there.

## Verified this session (manager, numeric — `evidence/aft2026_review/` scripts + transcript notes)
- Well-defined: every (state, ray, Δy) in domain → unique next state; local α_T conserved to
  machine precision; spot case reduces to the global law.
- Off-ATM trades drift global α, β **by design** (5 → 5.097/5.137 in the worked instance) and make
  w non-recoverable from reserves (α₀/x′ = 0.523 vs w′ = 0.533) ⇒ the paper §5.1 sentence
  "pool state fully determined by (x,y) … no additional state storage" must be retracted/scoped.
- Same-ray same-frame open-and-reverse leaves a pool-favourable residual (Δx = +6.4e-2 instance) —
  **DEFERRED by the operator** (entry 8: same problem class as dynamic-function AMMs like Curve;
  that analogy is the operator's rationale, recorded not project-verified).

## Consequences / dispatches
- This **answers referee Q1** (consolidated AFT2026 report) and converts fatal #1 from
  "inconsistent or undefined" to "defined; spec + proofs to be printed."
- research-lead (dispatched 2026-06-12): precise transition-system spec, Lean obligations
  (well-definedness domain incl. the y=β_T pole, spot reduction, per-step conservation,
  w-storage), and a check whether v27's "unique conservation-consistent trade"
  (branch `claude/exciting-archimedes-txs2wx`, demoted-retained v27 build) is this same rule.
- paper: §5.1/App D/F rewrite under this ruling (App D's (α,β)-signature classification and the
  single-global-hyperbola reachability are spot-trade-scoped statements).
- **Relay note:** the live engine session's open question (its transcript entry 117, trade-point
  transact/goal-seek on v28-lens) is the build-side twin of this ruling — operator is the bridge
  between sessions; this file is the canonical statement.
