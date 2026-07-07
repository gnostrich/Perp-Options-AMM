# CTO CHANGELOG — from your build (md5 80f050e2, 2026-06-14) to current
_Feature-level, plain English. "Port" column = does your Go backend need a math/logic change,
or is it display-only. Written 2026-07-03. One pending cosmetic fix (last row) lands before
handover; the file you receive will carry its own md5._

## The two big math changes (port these first)

| # | What changed | Plain English | Port |
|---|---|---|---|
| 1 | **ITM option value rebuilt (PKG-ITM v2)** | Your build's in-the-money values were WRONG: the value curve dipped BELOW the exercised payoff from about S/K 0.80 downward, and the exercise boundary sat at 0.444K instead of the correct 0.667K (γ=2 put). Now: the waiting-value power curve is welded tangentially (same value, same slope) onto the LINEAR payoff line. Put boundary S* = K·g/(g+1), call S* = K·(g+1)/g, g = m·γ; value at the boundary = 1/(g+1); past the boundary the value IS the payoff line (1−S/K put, 1−K/S call). Guarantee (machine-checked in Lean + a hard gate): quoted value is NEVER below the exercised payoff. Worked anchors for your tests: γ=2, K=$100, m=1 → S*=$66.67, boundary value 1/3, ATM value 0.148 (=4/27); m=3 → S*=$85.71, boundary 1/7, ATM 0.057. | **YES — core pricing** (one function: the mark) |
| 2 | **Trades now conserve at the TRADE POINT** | Your build applied the conservation law at the reserve point — a repeated spec regression. Now a trade executes where the strike ray meets the curve: T=(x_T,y_T) with x_T=x·ρ^(w−1), y_T=y·ρ^w (ρ = tx-ray/mode); the local pair α_T=w·x_T, β_T=(1−w)·y_T is conserved; Δx = −α_T·β_T·Δy/((y_T−β_T)(y_T+Δy−β_T)); new weight w′=α_T/(x_T+Δx). Acceptance anchor: from (x,y,w)=(10,10,½), ray θ=4, Δy=1 → Δx=−5/22, x′=215/22, w′=11/21 exactly (NOT 22/43, NOT 6/11). Spot swaps (ρ=1) reduce EXACTLY to your existing formula — spot/arb/rebase code is byte-identical. Consequence: α and β genuinely move on off-ATM trades now (by design). Depth guard moved to the trade-point depth w·y_T·... (rejects earlier, honestly). | **YES — trade law** |

## Close/settlement — port with a caveat

| # | What changed | Plain English | Port |
|---|---|---|---|
| 3 | **Close = frozen-arc reversal (interim)** | Each leg stores its actual open flows {Δx, Δy, Δw, oracle-at-open}; close applies the inverse (oracle-scaled). Round trip restores the pool exactly, even with other trades/rebases in between. ITM legs still settle to cash (two-case), as in your build. **CAVEAT: this close protocol is RULED to be replaced** — the operator has ruled close should become a first-class trade on the live curve with a receipt-based charge-back (design complete, parked: `specs/FIX_close_b_receipt_charge_PARKED_2026-07-03.md`). Suggest you port the arc mechanism as-is but architect the close path swappable. | **YES, flagged interim** |

## Funding display (small logic + UI)

| # | What changed | Plain English | Port |
|---|---|---|---|
| 4 | **Funding P/L column per position line** | The portfolio's band lines show accrued funding as a SIGNED P/L number: negative = the line paid, positive = received (the internal ledger stores "trader pays" positive — the display negates it; getting this sign right matters). Line dollar P/L = base P/L + funding × oracle. Disclosure shipped in the UI: displayed P/L includes accrued funding, but cash at close still settles EX-funding (the club-to-club transfer layer is a future build). | **YES — sign convention + P/L composition** (the accrual law itself is unchanged from your build) |

## Display-only changes (no Go port; match if you mirror the UI)

| # | What changed | Plain English |
|---|---|---|
| 5 | Chart-2 rebuilt: TRUE value X-wings | Both wings drawn OTM→ITM crossing at ATM; pool-quoted continuation solid, escrow-parity tail dashed; %→$ toggle (fraction of escrow unit vs dollars); the old peak-at-1 tent is gone (it hid the m-knob). |
| 6 | Vol-direction caption fixed | The m-knob caption now reads the right way: MORE volatile asset ⇒ LOWER m (fatter wings). Your build said the opposite. |
| 7 | m input clamped to [1,6] | Typed out-of-range m silently drove the lens out of range in your build; now clamps live with write-back. |
| 8 | Captions truth-up | Invariant Watch now states the trade-point law (α/β move off-ATM BY DESIGN; machine-epsilon only on spot/arb/rebase paths); "% of escrow unit" → "fraction of escrow unit"; band preview animates the actual per-leg trade path (the drawn path IS the money path). |

## Verification you can lean on for the Go port
- Gates went 13 → 24 hard checks (`engine/verify/lens_selfcheck.js`) + 5 ATM-continuity checks; every new check is negative-controlled (a sabotaged engine fails exactly the intended check). The checks double as your Go acceptance tests — the numeric anchors above are all in them.
- Key results also proven in Lean (via Harmonic's Aristotle prover; artifacts on request): value ≥ payoff, the seam weld + uniqueness, trade/rebase commutation.

## Pending before your handover (will be in the file you get)
- Cosmetic: freshly opened bands rendered funding as "−0.000000" (negative zero); fix in flight.

## Ruled-but-NOT-in-this-handover (so nothing surprises you later)
- Close-as-first-class-trade + receipt/charge-back defense set (parked, design complete — see file above).
- Funding cash transfer between clubs (rate law exists; transfer layer future).
- Read-layer smoothing (EMA-banded γ) + skew rate-limit (calibration campaign, future).
