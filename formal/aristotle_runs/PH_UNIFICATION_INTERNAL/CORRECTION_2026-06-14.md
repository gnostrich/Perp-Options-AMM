# CORRECTION — PH_UNIFICATION_INTERNAL is NOT the composed internal-half claim

**2026-06-14, manager — supersedes the optimistic framing in commit 1b898cd's message and the
manager's morning relay.**

The skeptic universal-gate (run `aaeff0b7`, `notes/skeptic/VERDICT_PH_UNIFICATION_INTERNAL_2026-06-14.md`)
returned **FLAG-OVERSELL**. The individual theorems in `PHUnification.lean` are all true and
token-clean, BUT the **weld the conjecture promised did not land**:

- `internal_passivity` (L86) carries `hR` (port PSD) as a **FREE OPEN hypothesis** — abstract
  passivity for *any* nonneg port.
- `exchange_Rcurv_nonneg` (L103-106) proves the GH curvature is PSD — but is a **standalone lemma,
  composed NOWHERE downstream** (zero uses).
- There is **NO `exchange_internal_passivity`** joining them; `trade_no_spontaneous_storage`
  (the conjectured lossless-trade leg) is **ABSENT**; `trade_conserves` dangles unused.

So what is actually proved (trusted-from-prover): (i) abstract passivity with an OPEN PSD
hypothesis, and SEPARATELY (ii) the curvature is PSD. **NOT** "the Temporal exchange is passive
*because* its geometry is PSD." That specialization line — which the conjecture (note L165-167)
itself called "the new content" — was not written.

**Status of this archive:** the two pieces are `proved (trusted-from-prover)` individually; the
**composed internal half is OPEN.** Self-contained (re-declares minimal `TemporalAMM`) and NOT
wired into the canonical project build (MonolithConstM status). DO NOT fold to formal/INDEX as
"internal half geometry-witnessed."

**Resolution path (in flight):** re-submit to Aristotle for the composed
`exchange_internal_passivity` (discharge `hR` via `exchange_Rcurv_nonneg`, no open PSD hypothesis on
the concrete exchange) + the missing `trade_no_spontaneous_storage`. Re-gate on return.
