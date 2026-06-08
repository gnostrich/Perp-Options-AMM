# Tester brief — v26a-slipfix (browser run)

**File:** `temporal_mvp_v26a.html`  (md5 `89ae89e9`)
**Lineage:** v25_gh `9910c699` → v26a fixes `951d16eb` → slippage WIP `2c0337e8` → **slipfix `89ae89e9` (this)**
**What this run confirms:** the slippage panel now reads sane (the headline fix), and the v26a curve visuals didn't regress. Engine math and the diff are already manager-verified — your job is the **browser-only** confirmation I can't run here.

---

## Why you're running this
The slippage % was previously pinned ~97% regardless of trade size, because the code compared the realized fill against `getMP_raw` — which is the **price coordinate** (≈ oracle), not the geometric reserve slope. It's now referenced to the geometric marginal `getMP_raw·e^(−ghMu)`, so slippage should grow smoothly with trade size. You're checking that it actually *looks* right in the running UI.

---

## Setup
1. Open `temporal_mvp_v26a.html` in a normal browser (Chrome/Firefox). It's a single self-contained file — no server.
2. Open devtools **Console** before interacting. Keep it visible the whole run.
3. Confirm the page renders fully: **background image present, logo present**, controls interactive. (If either blob is missing or the page is blank → STOP, see below.)

## Check A — slippage grows sanely (the fix) ★ primary
Do a sequence of trades from **small to large** on the same pool and read the **Slippage %** field after each.

| trade size (price move) | Slippage % should be roughly | Slippage $ |
|---|---|---|
| tiny (~2% move) | ~1% (small, near zero) | small, finite |
| moderate (~20% move) | ~9% | larger, finite |
| ~2× price move | ~33% | larger still, finite |
| ~6× price move | ~71% | largest, finite |

**PASS:** % is **small for small trades and grows monotonically** with trade size; the ballparks above are in the right neighborhood; **$ is always finite and increases**. Exact numbers depend on pool params — the **shape** (monotonic, small→large) is the test, not the decimals.

**FAIL signals (→ STOP and report):**
- % is **pinned high / flat** (e.g. stuck near ~97%) regardless of trade size — that's the old bug.
- % or $ shows **NaN, ∞, or negative**.
- % **shrinks** as the trade gets bigger.

## Check B — tooltip wording
Hover the ⓘ next to **Slippage %**. It should describe the metric as realized average vs the **pre-trade geometric marginal**, and note the **$ is a pool-level price-impact cost in Layer-1 reserve USD, not a trader honest-dollar figure**. (Just confirm it's the new wording, not the old "Δy − p₀·Δx" text.)

## Check C — curve visuals didn't regress (v26a) 
On the curve plot, confirm:
- The **live curve** is a single smooth convex arc (the GH curve), colored call/put on either side of the mode — **not** a kinked/Balancer-looking shape.
- The **equilibrium marker sits ON the curve** (not floating off it).
- The faint **anchor curve (w=½)** reference is present.
- Run a couple of trades and confirm the curve + marker **track** without snapping to a wrong shape.

**Expected NEW behavior — not a regression:** the plot frame now **re-fits to the current equilibrium on every draw** (it used to be frozen on first draw, which clipped the GH bend as it climbed out of frame). So a **rebase will now visibly shift/rescale the frame** — previously it looked near-static. That motion is intended. The marker staying *on the curve* through it is the invariant; the frame moving is fine. Only flag if the curve gets **clipped at a frame edge** or the marker leaves the curve.

## Check D — health
- **No console errors** across the whole session (warnings about missing optional features are fine; red errors are not).
- A few trades **execute and settle** cleanly (no frozen UI, no thrown exceptions).

---

## Stop-and-report (do NOT patch toward green)
If any FAIL signal in A, a blank page / missing blob, red console errors, or a regressed curve/marker — **stop and report**, don't try to fix it. Include:
- which check failed and the exact on-screen numbers / text,
- a **screenshot** of the panel (and curve, if C),
- the **full console** output,
- the trade inputs you used.

A clean incomplete run reported honestly beats a "looks fine" that skipped a check.

## On PASS
Report: "slipfix browser run clean — A monotonic & sane, B/C/D confirmed," with one screenshot of the slippage panel at a large trade and one of the curve. That clears slipfix for the CTO propagation, and **v26b (ITM/American) builds on this base**.

---
*Context: `INTERN_SPLICE_NOTE.md` (in this zip) is the implementer's account of exactly what changed. The diff is 4 regions: the % path, the $ path, the `getMP_raw` comment, and this tooltip. Engine is byte-unchanged.*
