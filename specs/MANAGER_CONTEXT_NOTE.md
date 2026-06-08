# specs/MANAGER_CONTEXT_NOTE.md
_The architect's ("OG") orientation note for a respawned manager, preserved verbatim. It is the
prose companion to CLAUDE.md / STATE.md; where they differ, STATE.md is the live truth._

---

# Manager context note — Temporal, GH branch (for a respawned manager)

You're picking up the **curve-baked GH** branch of Temporal. This is the orientation the splice zip doesn't give you. Read once; it'll save you re-deriving and re-litigating.

## Where things are (one screen)
- **Engine: done and trustworthy.** The AMM invariant was swapped from the Balancer barrier to a generalized-hyperbolic (GH) curve so the pool prices `value ∝ S^(−γ)` for γ>1. The 4 curve functions (`getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`) + calibration are verified to high precision; the 7 gates pass at γ∈{1.5,2,3,4}.
- **v26a fixes: done, verified.** Three barrier remnants the swap missed — an inline slippage price, the curve-draw layer, and the equilibrium marker — converted to use the engine. Curve untouched, gates still green.
- **Slippage units bug: found, fix written and validated, not yet spliced.** (See gotcha below — this is the one that bit us.) [RESPAWN NOTE: now SPLICED — HEAD 89ae89e9.]
- **ITM / American exercise: specced, not built.** Continuation `c·sNorm` runs past the strike to a smooth-pasting free boundary `sNorm* = θ·((γ+1)/γ)^γ` (price `S* = K·γ/(γ+1)`), then exercise pays intrinsic-from-strike. Closed form, no new params. Drops the now-redundant "Eff strike" column.

## THE gotcha (this caused the slippage bug — internalize it)
**`getMP_raw` is the carry PRICE COORDINATE, not the geometric reserve slope.** It equals the oracle at equilibrium (that's what the no-arb gate and `arbitrageToOracle` target). The actual reserve slope `|dy/dx|` is **`getMP_raw · e^(−ghMu)`** — they differ by `e^ghMu` exactly (44.52 at γ=2, larger at higher γ). The code comment calls it "`|dy/dx| raw (Layer 1)`" — that mislabel is wrong and is being fixed. **Never use `getMP_raw` as a slope.** Anything that compares a price against a geometric Δy/Δx (slippage, tangent angles) must use `getMP_raw·e^(−ghMu)`.

Why the gates didn't catch it: the gates test that `getMP_raw` *round-trips to the oracle* (price-space self-consistency), not that it equals dy/dx. So a price/slope conflation passes every gate. Gates here are mostly **self-consistency**; the one true accuracy gate is `value∝S^(−γ)` (G4) and the seam gate. Keep that distinction in mind.

## Locked decisions (don't reopen unless the architect does)
- Curve-baked GH is the live branch; **γ>1 only, no barrier** (barrier can't be recovered — its exponent is outside the GH family; δ doesn't move it).
- **Carry P = Ny/Nx** is real and load-bearing: `u = log(price) − log P` at calibration and arb; rebase recomputes `P→P/r`.
- Funding is the **slope-deviation ratio vs the w=½ anchor** at the strike ray — orthogonal to intrinsic, untouched by the ITM change.
- Slippage = referenced to the **geometric marginal** `getMP_raw·e^(−ghMu)`; **% is basis-independent** (e^μ cancels); **$ basis = Layer-1 reserve-USD** for now (L2 honest-dollar is a deferred follow-up via the existing settlement chain).
- ITM exercise boundary is the **smooth-pasting free boundary**, not the strike (exercising at the strike throws away time value and kinks).

## Constraints (the wall)
- **Can't compile Lean** (toolchain 403'd) and **can't run a browser** (no Playwright/Chromium). So Lean is "trusted-from-prover" and UI is "tester-confirmed" — say so, don't fake it. You *can* verify all math in Node/Python (vm-sandbox the engine block).
- Verify every deliverable independently; the cleaner/more confident a submission, the harder you check it. Own mistakes plainly. (I called a wrong slippage fix by trusting that mislabeled comment; the other manager session caught it by re-deriving. That's the bar.)

## File lineage / integrity
- `temporal_mvp_v25_gh.html` (9910c699) → `v26a` (951d16eb, fixes) → head `2c0337e8` (slippage WIP, not shippable). [RESPAWN NOTE: head is now `89ae89e9` after the slippage fix.]
- **Blob-ledger mismatch to reconcile:** the ledger lists ratified blobs `8d2e1a84/1b320fc5`, but the actual files carry `ab663f5c/c505b08a`. The files are self-consistent; the ledger isn't. Settle which is canonical before any "blobs verified."

## Open threads (and owner)
- Slippage splice → re-verify (diff + gates + sane growth) → tester | intern, then manager, then tester [RESPAWN NOTE: splice DONE + verified; manager verify + tester re-run still owed]
- ITM/American build (v26b) on the fixed base | intern, after the slippage fix
- Blob-ledger reconcile | manager + architect
- L2 honest-dollar slippage $ (follow-up) | manager/intern
- Lean GH gate-discharge — instantiate GH, discharge the 4 gate fields (watch `coercive = BddBelow`, GH has bounded reserves) | prover
- Ship-gate B1: funding-coverage sweep (the one thing geometry can't close — κ is extrinsic) | manager/intern

## How to read the engine fast
Sandbox the `<script id="engine">` block in Node; `Engine.ghCalibrate(X0,Y0,mp0,γ)` opens a pool, the rest follows. The state object carries scalar `gh*` params (`ghP, ghNx, ghNy, ghM, ghMu, ghAh, ghBh, ghDelta`); the CDF table lives in a module cache keyed by shape, re-derived on load (so the pool stays serialization-safe).
