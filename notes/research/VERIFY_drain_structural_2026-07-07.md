# VERIFY — update-1 close drain: STRUCTURAL-AS-SHIPPED but SPEC-FIXABLE (operator entry 453)
_research-lead 2026-07-07; real engine HEAD blocks `0e0a0062` (engine md5 1f0bccdd, byte-identical WT vs
pinned); vm-extract only; no web/git/engine/Aristotle. Manager persisted. Harnesses scratchpad/ (gitignored)._

## Honest numéraire (reframes everything)
Drain lives ENTIRELY in the pool-reserve/swap layer; option payout (raw_net×equity) decoupled & untouched.
Every round trip **Δy = 0 exact** (frozen-dollar reversal returns all cash) ⇒ honest pool value change =
**Vmkt = x·oClose + y ⇒ ΔVmkt = Δx·oClose**, and this = trader swap P&L to ~1e-10 (zero-sum, verified).
The pool's OWN basis Vpool = x·poolMark + y gives the OPPOSITE sign and is MISLEADING (round trip shifts w,
corrupts the internal marginal). **Vmkt honest; poolMark not.**

## Q1 — value LOSS or reshuffle? → real zero-sum VALUE TRANSFER pool↔trader.
k=1 (no oracle move): small one-signed −$208 (call θ=1.3) / −$135 (put θ=0.8) = 0.013% of V0=$1.6M. This is
the "harmless self-drain" the spec advertised — tiny ONLY here.

## Q2 — bounded? → UNBOUNDED (superlinear, never saturates).
| k (close oracle / open) | ΔVmkt |
|---|---|
| 2 | +$15,090 (0.94%) |
| 4 | +$93,466 (5.8%) |
| 16 | +$1.98M (124% — exceeds whole pool) |
| 1000 | +$41B |
∝dy² law holds ONLY at k=1; between ∝(k−1) and ∝(k−1)² beyond. Robust to arb-style or rebase-style move.

## Q3 — extractable? → YES, exactly. trader_pnl = −ΔVmkt (machine precision; Δy=0 ⇒ pure zero-sum).
Pool loses/trader gains as leg deepens OTM; reverses ITM — but trader controls wing, buy/sell, close timing
(free option on residual), N ⇒ favorable side farmable. Round trip leaves trader holding residual Δx at zero
net cash = free directional leverage bypassing premium/margin.

## Q4 — root cause → the LIVE rho, NOT the frozen-K sizing. SPEC-FIXABLE.
Isolation (frozen-K cash leg throughout; vary only the reverse-trade PLACEMENT):
- **Freeze rho** (reverse at open's stored rho_tx): drain collapses to −$8→−$17 across all k, ∝dy² — the
  advertised tiny self-drain.
- **liveK** (cash at live strike): WORSE → cash sizing is NOT the cause.
- **Old frozen-ARC revertArc + matching rebase:** Δx ≡ 0 EXACT at every k — current shipped HEAD is value-conserving.
- **liveRho (shipped update-1 spec):** the unbounded blow-up.
Cause = `rho_close = (K_tx/oNow)/getSNorm(s)` re-derived LIVE at close ⇒ reverse trade point at a price
divergent from open. Spec §6 named the mechanism but wrongly concluded small/one-signed/∝dy² (true only k=1).
Property update-1 gave up = ARC-INVERSION (retrace the open's own reserve arc); freezing rho / arc-replay
recovers it; no re-sizing of a live-rho trade does. Value-layer seam-kill (single-snapshot legPrice) orthogonal, preserved either way.

## VERDICT
**OBSCENE-STRUCTURAL as shipped** (live-rho reverse): leak exceeds whole pool on large moves, fully
extractable, sign trader-controllable; NOT a small pluggable arb leak once the oracle moves (the normal +
ITM case). Skeptic FLAG-OVERSELL correct; "harmless ∝dy²" valid only at zero oracle move.
**BUT root = live rho ⇒ SPEC-FIXABLE IN UPDATE-1** (freeze rho / replay arc), NOT the update-2 charge-back.
Changes the update-1/2 split: charge-back may be UNNECESSARY for this leak; kill it at source by not going
live on rho.

## Operator-tier flags
- **F-DECISION:** fix update-1 by freezing rho / arc-replay (kills unbounded leak, may retire update-2
  charge-back) vs ship live-rho + charge-back. Design call.
- **F-SEMANTICS:** frozen-rho places the ITM reverse on the OPEN's moneyness side; entry 447 wanted it "on
  the other side to respect skew direction." Placement semantics = operator's. Narrow numeric claim:
  live rho ⇒ unbounded extractable transfer; frozen rho / arc-replay ⇒ bounded/exact.
- **Context:** current shipped HEAD close (frozen-arc+rebase) is EXACTLY value-conserving; update-1 as
  specced REGRESSES it to an unbounded leak.
