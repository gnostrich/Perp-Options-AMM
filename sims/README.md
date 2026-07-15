# sims/ — simulation & economics sandbox (NON-CORE)

**Isolation contract:** everything under `sims/` is **brainstorm / exploratory**. It does NOT touch the
engine (`engine/`), the specs, the gates, or any shared-truth doc, and is NOT gated by `run_all.sh`.
Nothing here is a decision or a verified result until explicitly promoted out of `sims/` by the operator.
Notes here may read the engine **read-only** for numbers; they never modify it.

Contents:
- `BRAINSTORM_lp_economics_2026-07-08.md` — LP-yield-vs-(volume, volatility) simulation scoping +
  the HLP-margin additive layer. Source: operator + varun verma discussion (external), 2026-07-08.
