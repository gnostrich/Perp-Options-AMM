# Engine ITM arm ↔ paper reconciliation (QC-only, entry 285), 2026-06-26

QC-only, NO edits. research-lead re-derivation + manager verification.

## SOLID (verified code facts)
- **#3 Canonical mark = `markLensed`.** Every live pricing/settlement path routes through it
  (legPrice L1733/1735/1743-44, markEff/legValueUnified L1981/1987, fundingPerStrike, close path).
  v24 `mark` (L1608) appears live ONLY in the canvas payoff draw-layer (legFraction L4079) + label
  strings. Headline min(slope,1/slope) = schematic/legacy.
- **#4 ≤1 on every live path.** markLensed continuation ceiling = 1/(g+1); both intrinsic arms ∈(0,1);
  wide numeric sweep max = 1.0, zero exceedances. L1977 "ceiling stays ≤1 (solvency)" HOLDS. The L4076
  "runs past 1" comment is STALE (its `mark` self-caps at 1) — no live path returns >1.
- **#1 (function form) Engine ITM arm ≠ paper linear intrinsic.** markLensed past-boundary arm =
  `1−(sNorm/θ)^(1/g)` (a power/root of moneyness); paper Fig-3 arm = linear `1−S/K`. Equal ONLY at g=1.
  The correct EXERCISED intrinsic of a perpetual put is the linear `(K−S)/K`; the engine ships the
  smooth-paste power-law *value*, not that linear intrinsic. Genuinely different objects.

## #2 The sNorm↔S map (code)
`getW(s)=α/x`; `getSNorm(s)=(1−w)/w`; `getMP_raw(s)=w·y/((1−w)x)`; `arbitrageToOracle` re-pegs
`getMP_raw=oracle`. So the spot-coord `getSNorm=(y/x)/oracle` and the strike-coord `θ=K/oracle` differ
by the reserve ratio `y/x` (the "~6× basis leak" the L1975 comment warns of). **`getSNorm` is LIVE — it
moves with spot; it is NOT pinned.** And γ=w/(1−w) is LIVE, so g_loc=m·γ moves as spot moves (my live
trace: g_loc ran 0.71→1.22 across S=40k–120k; γ=1 at the balanced ATM point, NOT 2).

## FLAGGED — NOT cleanly resolved (per operator "flag, don't smooth")
- The exact **dollar divergence table** and the **boundary-in-dollars** (does the engine seam land at the
  paper's S*=Kg/(g+1)?) depend on how (θ, sNorm, γ) co-move as external spot moves. research-lead's
  static "γ=2 fixed, getSNorm pinned" frame is NOT faithful (γ is live); the manager's live-arbitrage
  trace caught its own scripting inconsistency and is not trusted. So the faithful mark-vs-dollar-spot
  curve is UNRESOLVED here — needs a clean live-position revaluation (best: tester in the live browser).
- Because γ is LIVE, the paper's Fig-3 static-γ worked example may not correspond to any single live-pool
  trajectory as spot moves — a reconciliation issue in its own right.

## Operator-tier flags (settlement semantics + paper)
1. Engine settles the smooth-paste power-law option VALUE, not the linear exercised intrinsic (K−S) the
   paper's Fig-3 describes. Which a perpetual-put settlement SHOULD pay is a product/semantics call.
2. γ is live (not the static value the worked example assumes) — the paper's fixed-γ illustration vs the
   live-γ engine is a reconciliation call.
