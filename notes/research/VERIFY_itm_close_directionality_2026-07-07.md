# VERIFY — ITM close directionality (operator entry 433/434/435)
_research-lead run, 2026-07-07; measured vs the real engine (vm-extracted from HEAD HTML,
engine blocks identical to `0e0a0062`); no web; no git/engine/Aristotle. Manager persisted this
note (research-lead output-constraint); harnesses `scratchpad/closeb/{h_dir,h_residual2,h_clean,h_band}.js`._

## Frame (measured, not assumed)
Default pool `{x:10, y:800000, α:5, β:400000}`, w=0.5 ⇒ getSNorm mode=1, mp_raw=oracle_initial,
price-spot=1 at ATM. Strike ray θ=K/oracle. Trade-point moneyness `rho_tx=(θ/mode)^m` crosses 1
EXACTLY at ATM (spot=K). At deploy g=m·γ=2, put smooth-paste free boundary at ray θ*=(g+1)/g=1.5.

## PART 1 — quantity from the option-price ratio
- **OPEN verified exactly:** `executeBand` L1982 `N_buy = V_sell/denom`, denom = per-unit LENSED
  value (`markLensed`, the chart-2 extended OTM→ITM wings), V_sell = N_sell·(markLensed(inner)−
  markLensed(outer)). Option-value RATIO off the pricing layer, NOT pool proceeds (engine comment
  L1838-1840: the leg V sizes the buy-leg proceeds, "NO LONGER sizes the pool swap dy").
- **markLensed continuous ITM = parity exactly:** θ=1.5/1.7/2.0/2.5 → 0.3333/0.4118/0.5000/0.6000
  = put parity 1−S/K to 0.0000. Value well-defined ITM ⇒ sizing-from-value works.
- **Operator's close-from-value claim: coherent (b)-design, NOT current code** (today's closeBand
  reverses stored flows / cash-settles ITM). New settlement behavior → operator-tier.

## PART 2 — AMM swap + directionality
- **"Both legs same direction" is the engine's existing law:** dy=(wingSign)(legSign)·N·K_tx,
  wingSign call+1/put−1, legSign sell+1/buy−1 (L1878). Collar OPEN (sell-put+buy-call) both dy=−;
  CLOSE (buy-put+sell-call) both dy=+ (same dir, opposite to open). Symmetric open/close.
- **CORE INSIGHT CONFIRMED — the ρ>1 crossed-wing gap dissolves.** Put close swept θ 0.7→1.0→2.5:

  | quantity | below ρ=1 | at ρ=1 | above ρ=1 (ITM) |
  |---|---|---|---|
  | swap SKEW direction (dy,dx,dw) | +,−,+ | +,−,+ | +,−,+ — **NEVER FLIPS** |
  | WHICH WING (sign of a=ln θ/mode) | θ<mode | 0 | θ>mode — **FLIPS at ρ=1** |

  "Skew this way" is continuous/unambiguous through the crossing; "which wing" is the thing that
  flips. Defining the close by skew direction is well-posed. Slippage = standard curvature integral
  `|Δy|−p₀|Δx|` (L1998-2011), no moneyness branch, no ITM penalty — the only trader-facing cost.

## BOTTOM LINE
- **Directionally: YES — complete, well-posed, dissolves the crossed-wing problem.** SUPERSEDES the
  manager's earlier "open corner"/crossed-ray flag. Feeds the parked close-(b) spec as the ITM-close
  definition.
- **Leak-free: NO (orthogonal, already-known).** Faithful (b) round-trip (dy frozen=−open, dx live
  via tradeUpdateAt): Δy=0 exactly but Δx<0 — one-signed pool loss ∝dy², at EVERY moneyness (OTM=ITM,
  NOT a crossed-wing artifact); tiny per small trade (~0.0001% of parity at N=0.05) but compounds.
  Frozen-arc (a) close by contrast: Δval=0 exactly. Neutralizer = the pool-value FLOOR already pinned
  in close-(b). Directionality does NOT retire the floor.

## Escalations (operator-tier)
1. Close-quantity-from-value-ratio = new (b) settlement behavior vs today's flow-reversal — semantics choice.
2. x-drain/floor pairing unchanged; the close-(b) build still needs the floor.
