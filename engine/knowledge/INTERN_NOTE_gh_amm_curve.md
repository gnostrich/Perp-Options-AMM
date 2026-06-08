# Implementation note — swap the AMM invariant: barrier → GH (clean swap, one path)

**To:** HTML intern. **Base:** clean `temporal_mvp_v24_rebase_fixed_2.html` (pure barrier; no power-sum, no branches). **Status:** brainstorm/confirm first — no edits until "do a pass."
**One line:** swap the invariant once, respecting the geometry. One curve, one path. GH is the *only* curve — it replaces the barrier outright; there is no barrier limit to reduce to (see §0, §4).

---

## 0. Frame (what the formal lift licenses)

The lift (`temporal_manager_package`, audited: source + math independent, compile trusted-from-prover) proves the machine is **curve-agnostic by type**: a curve reaches the guarantees only if it passes a gate, and once it does, reserve value is concave (short-gamma) and that propagates into value and solvency **mechanically**. So we do not branch, keep an old path, or stage through the power-sum. We **swap the invariant** in the four functions that touch it; everything else inherits because the propagation is a theorem, not an inspection.

No "gentle case." GH *is* the only curve, valid on the convex range **γ > 1**; it replaces the barrier outright. There is **no barrier / δ-limit**: the Esscher partner density `f_{β+1}` it needs does not exist at the barrier's exponent ½ (`ψ′=√(αh²−(βh+1)²)` is imaginary once `γ ≤ 1`), and δ never moves the tail exponent (it is `αh−βh` at every δ). See §4.

---

## 1. The swap surface — the only four functions that change

| # | function | barrier (now) | GH (after swap) |
|---|---|---|---|
| 1 | `getMP_raw(s)` | `w·y/((1−w)x)` | `(Ny/Nx)·exp(Q_β(1 − X/Nx))`  *(= `P·e^u`; price↔coord is `mp = P·e^u ⇔ u = log mp − log P`, `P=Ny/Nx`)* |
| 2 | `tradeUpdate(s,dy)` (Y→X only) | `dx=−αβ·dy/((y−β)(y'−β))` | `u=Q_{β+1}(Y'/(Ny·M)); X'=Nx·(1−F_β(u))`, `Y'=Y+dy` |
| 3 | `arbitrageToOracle(s,o)` | `x_eq=α+√(αβ/o)` … | direct: `u*=log(o) − log P; X=Nx(1−F_β(u*)); Y=Ny·M·F_{β+1}(u*)` |
| 4 | `rebase(s,r)` | `x→rx, α→rα` | `x→rx, α→rα, Nx→r·Nx` (μ, Ny fixed); **recompute `P` (→ `P/r`)**; `getMP_raw→/r` falls out of the `Ny/Nx` prefactor |

(+ the inline arb duplicate in the UI draw code — keep it in lockstep with #3, including the `− log P`.)

`Q_β` is a 1-D monotone solve (or table lookup). Build **only Y→X** for `tradeUpdate` — the engine calls `tradeUpdate(s,dy)`; X→Y has no caller.

**Everything else inherits, untouched** — by the lift's propagation theorem, confirmed against the source-of-truth table: `getSNorm`, `mark`, `compositeRay`, `vsValue`, `bsValue`, `legPrice`, settlement, `poolMark`, `fundingPerStrike`. If you find yourself editing any of them, stop. `getDepth` stays the old weight form (display-only, stale at γ>1, tester's audit — leave it). **The anchor stays `w=½`** — it is the flat funding baseline, not decorative; do not touch it.

---

## 2. The GH curve (verified constants)

`X=x−α`, `Y=y−β`. Shape on state: `(αh, βh, δ, μ)`, coordinate `u = log(mp) − log P` (`P=Ny/Nx`; equivalently `mp = P·e^u`), `γ=αh−βh`, need `αh>βh+1>0`. `ψ=√(αh²−βh²)`, `ψ′=√(αh²−(βh+1)²)`.

```
f_β(u)     = Cnorm ·exp(−αh√(δ²+(u−μ)²) + βh(u−μ))      Cnorm = ψ /(2αh δ K1(δψ))
f_{β+1}(u) = Cnorm1·exp(−αh√(δ²+(u−μ)²) + (βh+1)(u−μ))  Cnorm1= ψ′/(2αh δ K1(δψ′))
F_β,F_{β+1} = CDFs;  Q_β = F_β⁻¹;  M = ψ·K1(δψ′)/(ψ′·K1(δψ))
INVARIANT:  F_{β+1}(Q_β(1 − X/Nx)) = Y/(Ny·M)
```
Cost: `ψ,ψ′,M,Cnorm,Cnorm1` are **pool constants** (one `K1` each, at calibration). Density is elementary. Per-trade = table interp on `F_β,F_{β+1},Q_β` (+ optional 1 Newton). **Zero Bessel per trade.** `K1`: A&S 9.8 rational/series is fine for a once-per-pool constant.

**Calibration** at open from `(X₀,Y₀,mp₀,γ)`: `βh=αh−γ`; defaults `αh=γ+1, δ=0.08`, and `μ=u₀−3`. Because `μ=u₀−3` pins `u₀−μ=3`, the two CDF terms are **shape-only constants** — `Φ_β=F_β(μ+3)`, `Φ_{β+1}=F_{β+1}(μ+3)` (centered density integrated to 3, no μ/u₀ dependence) — so the prefactor is computable **up front**: `P=Ny/Nx=Y₀(1−Φ_β)/(X₀·M·Φ_{β+1})`. Then everything is **closed-form, no solve**: `u₀=log mp₀ − log P`, `μ=u₀−3`, `Nx=X₀/(1−Φ_β)`, `Ny=Y₀/(M·Φ_{β+1})` (so `Ny/Nx=P` by construction); build tables. New state fields ride `s`: `αh,βh,δ,μ,Nx,Ny,P` + cached `ψ,ψ′,M,Cnorm,Cnorm1` + tables. No signature changes.

---

## 3. Phasing

1. **GH math block, standalone.** `K1,f_β,f_{β+1},F_β,F_{β+1},Q_β,M`. Wire nothing. Gate on the vectors below; stop and report on any miss — no tuning toward green.
2. **Swap the four functions** (§1). Touch nothing in the inherit list.
3. **Calibration + state fields.**

**Phase-1 reference vectors** (`αh=4,βh=1,δ=0.08,μ=0` ⇒ γ=3, `Nx=Ny=1`): `∫f_β=1.000000000000`; `ψ,ψ′=3.872983,3.464102`; `M=1.268303997652`; Esscher `e^u·f_β==M·f_{β+1}` ~2e-16; tail rates 3/5; @u=1.5 `X=7.552734e-3, Y=1.217507`; `F_{β+1}(Q_β(1−X/Nx))=0.9599490830` (round-trip Δ<1e-10); value `∝S^(−γ)` on [1,3] eff. exponent 2.997, err 0.40%.

---

## 4. Acceptance gates

**~~1. Reduces to barrier at γ=½~~ — DELETED.** GH is the only curve; there is nothing to reduce to (the Esscher partner density doesn't exist at exponent ½). Validate GH **directly on the convex range**: gates 2–7 below (round-trip at γ∈{2,3,4}, monotonicity, value `∝S^(−γ)`, arb round-trip, rebase, bounds) **plus the formal lift** (§0, §6). *Optional* near-floor sanity: instantiate the lowest γ you'll actually run (~1.05) and confirm it's well-behaved — do **not** expect it to resemble a barrier.
2. invariant round-trip `<1e-10` at γ∈{2,3,4}.
3. `mp(X)` strictly monotone decreasing.
4. value `∝S^(−γ)` on band `<1%`.
5. arb round-trip: push to oracle, `getMP_raw` back = oracle. *(Now passes via the `u*=log o − log P` fix; pre-fix this returned `(Ny/Nx)·o` and failed on any pool with `Ny/Nx≠1`.)*
6. rebase: after `x→rx,α→rα,Nx→r·Nx` (μ,Ny fixed), `poolMark` unchanged, `getMP_raw→/r`.
7. reserves stay in bounds (`X∈(0,Nx)`, `Y∈(0,Ny·M)`).

---

## 5. File-safety — NON-NEGOTIABLE
- Never dump base64 blobs. After every edit: Node-syntax-check all three `<script>` blocks; parse each via `new Function`; IIFE scope intact.
- **Read the two blob lengths in your file first and hold them fixed** (don't assume a lineage).
- No function-signature changes; new values ride `s`.

---

## 6. Out of scope / open items / stop
- **Funding-covers-γ is NOT this pass.** Funding inherits via the slope (`fundingPerStrike` reads `poolMark`); whether its magnitude covers the convexity is the ship-gate (B1 / the closed-book sweep), the one thing the lift leaves as an external hypothesis. Not the HTML intern's job.
- **Open Lean item (prover, not you):** the lift instantiates Balancer + exponential, **not GH**. The GH instance must discharge the four gate fields (`convex_dom, antitone_y, convex_y, coercive=BddBelow`) before the swap is end-to-end proven. `coercive` is the one to watch (GH has bounded reserves; plausibly fine, currently unchecked).
- **Hedge** stays — structural under-hedge is real, funded by the port, not this pass.
- **Stop on red:** harness goes red mid-pass → stop and report. An incomplete careful stop beats a rushed green run.
