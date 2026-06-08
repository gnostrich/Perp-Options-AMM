# engine/GH_MATH.md — the GH curve, calibration, and numerics

Reference implementation: `gh_engine_reference.js` (standalone, verified; = the transplant
source for v25). High-precision cross-checks: `gh_verify_reference.py`, `gh_gates_reference.py`
(mpmath/scipy). The live engine is the `<script id="engine">` block in the HEAD build.

## What the curve is
The AMM holds reserves (x, y); write X = x − α, Y = y − β (offsets from the floors α, β). The GH
curve parametrizes (X, Y) by a latent `u` through generalized-hyperbolic CDFs so that pool
**value ∝ S^(−γ)** for γ>1 (a convex American-style leg) over an unbounded strike range:

    X(u) = Nx · tail_β(u)            (upper-tail of the GH density f_β; X decreases as price ↑)
    Y(u) = Ny · M · F_{β+1}(u)       (lower-CDF of f_{β+1}; Y increases as price ↑)

- Shapes: `αh = γ+1`, `βh = 1` (always), `δ = 0.08`. f_{β+1} is the Esscher (exponential) tilt of f_β.
- **Carry P = Ny/Nx.** Define `u = log(price) − log P`. The "price coordinate" is `getMP_raw = P·e^u`.
- `M = ψ·K1(δψ') / (ψ'·K1(δψ))`, **μ-independent** (= Cn/Cn1, the density prefactor ratio). K1 is the
  modified Bessel function; it enters ONLY the scalar M (computed via an A&S rational approximation,
  ~1e-9 floor — fine).

## Calibration (closed form) — `ghCalibrate(X0, Y0, mp0, γ)`
Three conditions, three unknowns (μ pins the offset; Nx, Ny set the scales):
- Pin the operating offset: `u0 − μ = 3` ⇒ the shape integrals Φ_β = F_β(u0), Φ_{β+1} = F_{β+1}(u0)
  are **shape-only constants** (μ-independent).
- `Nx = X0 / (1 − Φ_β)`  (so X(u0) = X0).
- `Ny = Y0 / (M · Φ_{β+1})`  (so Y(u0) = Y0).
- μ is then fixed by the price condition `mp0 = P·e^{u0} = (Ny/Nx)·e^{u0}`.

**Calibration trap (root cause of an early failure):** fixing Nx from X0 and Ny from Y0 leaves NO
degree of freedom to also enforce the price — you need all three conditions together (μ is the
third). Don't try to pin Nx, Ny independently and then "also" set the price.

## THE relationship you must respect: getMP_raw ≠ slope
The geometric reserve slope is
    |dy/dx| = (dY/du)/( −dX/du ) = (Ny·M/Nx) · f_{β+1}(u)/f_β(u) = P · e^{u−μ} = **getMP_raw · e^(−μ)**.
So `getMP_raw / |dy/dx| = e^μ = e^ghMu` exactly. `getMP_raw` matches the oracle (price coordinate);
the reserve curve's actual slope is `e^μ` smaller. **Slippage / tangents use `mpGeom = getMP_raw·e^(−ghMu)`.**
(See GOTCHAS.md §1 and verify/slope_test.js for the numeric proof across γ.)

## The four curve-dependent functions
- `getMP_raw(s) = ghP · exp(_invTail(s, (s.x−s.alpha)/s.ghNx))` — price coordinate at the state.
- `arbitrageToOracle(s, o)` — set u* = log(o) − log(ghP), return `{...s, x:Nx·tail(u*)+α, y:Ny·M·F_{β+1}(u*)+β}`.
- `tradeUpdate(s, dy)` — add dy to y, solve u from the Y side (`_invB1`), set x from that u. Returns `{...s,…}`.
- `rebase(s, r)` — x→r·x, α→r·α, Nx→r·Nx, P→P/r (Y side and μ unchanged). getMP_raw scales by 1/r.
All four return `{...s, …}` to preserve the scalar gh* params. `getSNorm=(x−α)/α` and `getDepth`
are NOT curve-dependent (`getSNorm` carries convexity via X; `getDepth` is display-only/stale).

## Numerics that MUST be preserved (see GOTCHAS §3–4)
1. **Direct upper-tail integrals**, not `1 − F` (catastrophic cancellation fails round-trip for γ≥2).
2. **Shape-keyed module CDF cache** built once at calibration in centered `v = u − μ` (μ-independent
   ⇒ rebase-stable). Lookups ~0.6µs; same-table inversion ⇒ FP-exact round-trips. Pool serializes
   only scalars; table re-derives on load.
3. Bessel K1 via A&S rational approx (only in M).

## Reference vectors (sanity, γ=3, μ=0)
`M = 1.268303997`, `ψ = 3.872983`, `ψ' = 3.464102`. Live calibration (X0=5, Y0=400000, mp0=80000):
open `getMP_raw = 80000`, `getSNorm = 1`; round-trip ~1e-15; value∝S^(−γ) ≤0.127% on [1,3]; rebase /r
~2e-16; bounds X∈(0,Nx), Y∈(0,Ny·M). γ-dependence of e^ghMu: 11.68 / 44.52 / 748.6 / 13779.9.

## The 7 gates (verify/verify_v26a_mine.js) + the accuracy gates
G1 open mp0 · G2/5 arb round-trip · G3 monotone · **G4 value∝S^(−γ) (the accuracy gate)** ·
G6 rebase /r · G7 bounds. For v26b add the **seam gate** (verify/seam_gate.js): value+slope match
≤0.15% at the smooth-pasting boundary sNorm* = θ·((γ+1)/γ)^γ.
