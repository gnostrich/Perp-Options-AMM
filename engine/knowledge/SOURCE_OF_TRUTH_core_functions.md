> # ⚠ ERRATUM (added at respawn — read before the table below)
> This doc predates the slippage-units finding and labels `getMP_raw` as the
> "Layer-1 raw slope / curve slope". **That label is WRONG and caused a real bug.**
> `getMP_raw` is the carry **PRICE COORDINATE** (`P·e^u`, `P=Ny/Nx`); at equilibrium
> it **equals the oracle**. The geometric reserve slope is `getMP_raw · e^(−ghMu)`
> (they differ by `e^ghMu` ≈ 44.5 at γ=2). Anything needing a true Δy/Δx (slippage,
> tangent angle) must use `getMP_raw·e^(−ghMu)` (= `mpGeom`). Wherever the table
> below says `getMP_raw` is a "slope", read "price coordinate". See
> `00_ORCHESTRATOR_START_HERE.md` §4 and `build/INTEGRITY.md`.

# Source of Truth — Core Engine Functions

Tabulates every core function, its formula (read from `temporal_mvp_v24_rebase_fixed_2.html`), the juncture it acts at, whether it is **curve-dependent**, and its behavior under the curve swap (barrier → GH, a replacement — not a generalization). The curve-dependence column is the audit axis: only curve-dependent functions change when the curve is swapped; everything else inherits.

State is fully `{x, y, α, β}`; `w = α/x` is derived. Conserved per trade: `α = x·w`, `β = y·(1−w)`.

## Layering
- **Layer 1 — raw slope:** `getMP_raw` (curve slope, pool-internal units).
- **Layer 2 — honest $:** `poolMark = getMP_raw·(oracle/oracle_initial)`.
- **Layer 3 — perp mark:** `perpMark`, MVP-collapsed to oracle, **not consumed** by the protocol.

## Core function table

| Function | Formula (v24) | Juncture / role | Curve-dependent? | Under Balancer→GH swap |
|---|---|---|---|---|
| `getW(s)` | `α/x` | derived weight | No (reserve-only) | unchanged |
| `getSNorm(s)` | `(1−w)/w = (x−α)/α` | normalized marginal price = **reserve coordinate** | No (reserve-only) | formula unchanged; its *price-relationship* becomes γ-convex |
| `getDepth(s)` | `x^w · y^(1−w)` | depth label `k` (display) | weight-form (Balancer-specific) | **stale at γ>1**; display-only, leave (tester audit) |
| `getMP_raw(s)` | `w·y/((1−w)·x)` | **Layer-1 slope / marginal price** | **YES — the curve** | **SWAP** → `(Ny/Nx)·exp(Q_β(1−X/Nx))` (= `P·e^u`; price↔coord `mp=P·e^u ⇔ u=log mp − log P`, `P=Ny/Nx`) |
| `poolMark(s,o,oi)` | `getMP_raw(s)·(o/oi)` | Layer-2 honest $ mark | rides `getMP_raw` | inherits via `getMP_raw` (no own change) |
| `mark(wing,θ,sN)` | call: `sN<θ ? sN/θ : 1`; put: `sN>θ ? θ/sN : 1` | position value fraction (the mark), ∈(0,1], saturates to 1 ITM | No (reads sNorm) | formula unchanged; sNorm carries the convexity |
| `compositeRay(lo,hi)` | `{θ*=√(lo·hi), δ=½·ln(hi/lo)}` | spread → single composite-ray transaction (batched execution) | No (ray geometry) | unchanged |
| `vsValue(N,m,d)` | `N·m·2·sinh(\|d\|)` | spread value via composite-ray identity (= `N·(mark(lo)−mark(hi))`) | No (mark-based) | unchanged |
| `bsValue(N,m,d)` | `N·m·2·cosh(d)` | barrier swap value (Identity III) | No (mark-based) | unchanged |
| `legPrice(...)` | barrier: `N·mark(θ)`; spread: `vsValue(N, mark(θ*), δ)` | leg valuation dispatcher | No (mark-based) | unchanged |
| `tradeUpdate(s,dy)` | `y'=y+dy; dx=−αβ·dy/((y−β)(y'−β)); x'=x+dx` | move along curve — **the AMM tx** | **YES — the curve** | **SWAP** → GH quantile remap (`u=Q_{β+1}(Y'/(Ny·M)); X'=Nx(1−F_β(u))`) |
| `arbitrageToOracle(s,o)` | `x_eq=α+√(αβ/o); y_eq=β+√(αβ·o); tradeUpdate(s, y_eq−y)` | push pool price to oracle | **YES — the curve** | **SWAP** → GH direct: `u*=log(o) − log P; X=Nx(1−F_β(u*)); Y=Ny·M·F_{β+1}(u*)` |
| `rebase(s,r)` | `x→r·x, α→r·α; y,β fixed` | oracle-frame rescale | reserve-frame (curve params adjust) | `x→rx, α→rα, Nx→r·Nx` (μ,Ny fixed); **recompute `P` (→ `P/r`)**; GH analog of `k→r^w·k`. `getMP_raw→/r` falls out of the `Ny/Nx` prefactor |
| `fundingPerStrike(...)` | `κ·(±2)·N·m·(S−1)/S·dt`, `S=poolMark/o`, `m=mark(wing,θ,S)` | per-strike funding rate × mark | rides `poolMark` (slope) + `mark` | inherits via `S` (the swapped slope); no own change |
| settlement | `attributablePnL=carvedNotional·(perpMark−entryPerpMark)/entryPerpMark`; `carvedEquityAtClosure=carvedEntryEquity+attributablePnL`; `trader_payout=L₀·raw_net·carvedEquityAtClosure`; `club_delta=(L₀−1)·raw_net·carvedEquityAtClosure` | close / payout | No (raw_net is mark-based, carved units) | unchanged |

## Funding, from first principles (the type that matters)

Funding is a **rate**, not a difference. Geometrically: the strike's ray crosses the pool curve at one slope and the anchor curve (symmetric, sNorm≡1) at another; funding is driven by the **ratio** of those slopes — the pool's normalized price `S` against the anchor's `1`. So the rate is the fractional deviation `(S−1)/S`, applied per position through its own `mark` and signed by wing. Identical in form on both wings (`rate × mark`); the difference `pool_mark − anchor_mark` is a *different quantity* that coincides with `rate × mark` only on the call wing — do not use it as the funding object.

- Baseline: `S=1` (pool ATM = oracle) ⇒ funding 0 ⇒ the symmetric / zero-collar-surplus condition.
- Per-ray-ness: comes from the `mark` (and the ray, which moves under rebase θ→θ/r), not from a separately evaluated second curve. The drawn `w=½` anchor curve is the *picture* of the `S=1` baseline; it is not read in the funding path.
- Under GH: `S` rides the swapped slope, so funding inherits the curve. Whether funding's magnitude *covers* the γ-convexity over the oracle path is the standing ship-gate (closed-book sweep), not settled by this table.

## The swap surface (audit summary)

Exactly **four** functions are curve-dependent and change under the curve swap:
`getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase` (+ the inline arb duplicate in the UI draw code).

Everything else is either **reserve-coordinate** (`getSNorm`, `mark`, and all mark consumers: `vsValue`, `bsValue`, `legPrice`, settlement) or **rides the slope** (`poolMark`, `fundingPerStrike`). They inherit the swap with no edits. `getDepth` is the one display-only weight-form casualty (stale at γ>1, left for the tester).

---

## Reconciliation to the formal lift (`temporal_manager_package`)

The lift is the *why* behind this table. It proves (Lean, compile trusted-from-prover; source + math independently audited) that the machine is **curve-agnostic by type**, which is exactly what licenses "swap the invariant, everything else inherits."

- **The gate ⇒ the four curve-dependent rows.** A curve reaches any theorem only if it supplies `convex_dom`, `antitone_y`, `convex_y`, `coercive` (= `BddBelow`, the value problem is bounded below — *not* `y→∞`). Implementing those is exactly implementing the four curve-dependent functions (`getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`) for the new curve. Pass the gate ⇒ those four are well-posed.
- **The propagation theorem ⇒ the "inherits, no edits" column.** `poolValue` (reserve value = `inf_x{p·x+y(x)}`) is **concave for any valid curve** (short-gamma, universal), and that concavity propagates by types into stored value and the solvency guarantee. That is the formal content of every "No / unchanged" in the table: the sNorm-readers and slope-riders inherit because the propagation is mechanical, not because we inspected them.
- **Short-gamma is universal ⇒ GH does not escape the under-hedge.** The GH curve, once it passes the gate, has concave reserve value too. The convexity (the American payoff) is therefore **not** in the reserves; it is carried by the port (funding), which the lift isolates as hypothesis **B1**.
- **The funding limit is formal.** Solvency is proved *conditional on B1* (the port covers the concave deficit); B1 is an undischarged hypothesis. `reserves_have_no_floor` proves the port is **necessary, not sufficient**. This is the κ-is-extrinsic limit as a theorem: the loop closes mechanically up to B1, and B1 cannot be closed by the geometry.

**Open Lean item before the swap is end-to-end proven:** the lift instantiates `cpmm` (equal-weight Balancer) and `expPool` only — **GH/power-sum is not instantiated**. To make the swap fully verified, the prover must construct the GH instance and discharge the four gate fields. `coercive = BddBelow` is the one to watch, since GH has bounded reserves (`X∈(0,Nx)`, `Y∈(0,Ny·M)`); on a bounded domain `p·x+y(x)` is bounded below, so it plausibly holds, but it is currently **unchecked**. The other remaining body of work — engine formulas ⊢ B1/B3/B4 — is the funding/ledger instantiation, with B1 (port pays) staying external.
