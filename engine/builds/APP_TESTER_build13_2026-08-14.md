# TESTER PASS — `app/index.html` build 13 ("landing map") — 2026-08-14

**VERDICT: FLAG** (not green). Arithmetic is right everywhere I could check it; the **picture** the
landing map paints is misleading in two independent ways, and its primary interaction (trade size)
has no per-click visible delta. Four further control defects outside the map, one of them a
completely inert slider the user is invited to turn.

- Artifact under test: **build 13**, pinned copy `evidence/app_build13/index_build13_pinned.html`,
  md5 `55b6a35a6af40e3953d2eaea7b50b6bb` (= `git show e14287b:app/index.html`), md5 unchanged
  pre/post every run (READ-ONLY on the source).
- Harness `evidence/app_build13/pw_app_build13.mjs` (runs A|B|H) · Node oracle
  `evidence/app_build13/oracle.mjs` (+ `probe1/probe2/indep/hotcheck.mjs`) · crops
  `capcrop.mjs`, `dialshot.mjs`. Evidence + screenshots under `evidence/app_build13/`.
- **0 pageerrors, 0 dialogs** in every run. Console = 1 × `ERR_CONNECTION_RESET` (the Google font,
  expected/benign) + 3 × Canvas2D `willReadFrequently` perf warnings **caused by my own
  getImageData probes**, not by the page.
- **Byte-stability: PASS.** `RESULT_runA.json` == `RESULT_runB.json` byte-identical modulo the run
  label (43,947 b each); `P5_earn_band.png` / `P5_transact_band.png` md5-identical across runs.

---

## FLAG-PROCESS-1 — build 14 landed on the file *during* this pass

`44ccd53` ("app build 14: the current curve on the aggregate") and `a6676b5` ("/compare … deploy
build 14") rewrote `app/index.html` while my run pair was in flight. My first B run loaded a
**mid-write state**: body text +398 chars (the new footer) but `cvT` canvas hashes still identical
to build 13 (the `drawAgg` change had not been written yet). That pair is **discarded**. Both A and
B were re-run against the pinned build-13 copy above.

I then ran a third pass (**run H**) against HEAD build 14. **Every finding below reproduces on
build 14 unchanged** — the 13→14 diff is 28 lines (build label, a badge, a footer note, `ladderAt`
gains a `side` arg, `landedCurve` + an orange "your curve at your size" overlay on `cvT`).
`drawHeat` and the Earn call site are untouched.

Recommendation: apply the §6.2 single-writer rule to `app/` during a tester pass — this is the same
failure mode as two engine writers, inside one working tree.

---

## PHASE 1 — Nav / views  ·  PASS

Each of the four views renders, exactly one grid is `display:grid`, others `none`.

| view | VIEW | grids | body text | screenshot |
|---|---|---|---|---|
| earn | earn | gridEarn:grid, rest none | 2972 ch | `shots_A/P1_earn.png` |
| transact | transact | gridTransact:grid | 1758 ch | `shots_A/P1_transact.png` |
| bands | bands | gridBands:grid | 811 ch | `shots_A/P1_bands.png` |
| portfolio | portfolio | gridPortfolio:grid | 1254 ch | `shots_A/P1_portfolio.png` |

Trade Bands is reachable only from the left-panel tab (no header nav entry); with it active the
header highlights TRANSACT — by design (`v==='bands' && a.dataset.nav==='transact'`).

## PHASE 2 — Earn controls  ·  PASS with 3 FLAGS

7 curve params driven to both ends (number input + `input` event), then restored; `restored:true`
for all 7 (rail **and** canvas hash return to base).

| param | min→max | right rail moves | canvas moves |
|---|---|---|---|
| S̄ | 0.05→1.0 | YES (Σprem 0.5203→52.66 BTC, hs 60→12 bps) | YES |
| a | 0.2→3 | YES (hs 1,969→1 bps) | YES |
| γ | 0.3→4 | YES (hs 11→28 bps) | YES |
| κ | −0.9→0.9 | YES (Σprem 1.3305→8.9576) | YES |
| λ | 0.01→1.0 | YES (centre 30%→19%) | **NO** — FLAG-C6 |
| fee | 0→0.2 | **NO** (vol-indexed ON) | **NO** — FLAG-C5 |
| depth | 1→80 | **NO** | **NO** — **FLAG-C1** |

- **FLAG-C1 (major):** `depth (BTC per 1% strike)` is a first-class labelled slider whose value is
  **read by nothing**. `P.depth` has zero references in the whole file outside `DEF`/`SPEC` and the
  render of its own field. 1→80 produces a byte-identical right rail and a byte-identical canvas.
  This is exactly the operator-caught class: a knob the UI invites you to turn that does nothing.
- **FLAG-C5 (minor):** `fee` is inert in the **default** state because vol-indexed mode sets
  `hEff = hFair·1.25` and ignores it. With VOL-INDEXED **off** it does bite: fee 0.005→0.2 moves
  half-spread 25 → 1,000 bps. At fee = 0 (the slider's own minimum) + vol-indexed off,
  **break-even turnover renders `∞× /day`** — a non-finite readout reachable with two clicks.
- **FLAG-C6 (minor):** `λ` moves the rail but has **no drawn representation** any more — it fed the
  capacity-density bars that the landing map replaced. It no longer changes a single pixel.

Other Earn controls: **margin** 15→40→1 moves notional $9,854,325 → $26,278,200 → $656,955 (=
`margin·10·S`, exact) ✓; **reset link** restores `DEF` exactly ✓; **spread-view magnifier** ×1/×25/×60
→ 3 distinct canvas hashes and both labels (`magv`, inline `magc`) update ✓; **size box** changes the
canvas and the "capture on N" cell ✓; **VOL-INDEXED toggle** on→off→on: quote 19 → 100 → 19 bps,
label "vol-indexed"→"fixed spread", margin-over-fair "25%"→"—", verdict text swaps, round-trip exact ✓;
**realised vol / turnover / RFQ size** sliders all move the rail sensibly (below).
RFQ ladder table renders 4 makers cheapest-first, MM-Kappa 16 bps fills all 5.00 BTC of the RFQ
(its capacity is 38.1 BTC) ✓.

*Observation (not a control defect):* "LP Leverage" is structurally **20.00×** at every margin
(notionalUSD/equity = 10 × 2 identically).

## PHASE 3 — Pointer hover across the curve  ·  PASS

7 hover x-positions, 8%→95% of canvas width. HK strictly monotone increasing; all 6 hoverbar cells
update every sample (strike, call bid/ask, put bid/ask, half-spread, C−P vs −k, capture).

**Parity `C−P vs −k`: max |C(k) − P(k) + k| = 5.55e-17** over the 7 samples (spec: ≤ ~1e-10).
Right-rail "Parity check" reads `0.000000000000` in every state exercised in the whole pass.

## PHASE 4 — Transact  ·  PASS with 2 FLAGS

- **BUY/SELL** both directions: quote flips best-ask 0.13326 / "you pay $26,263" ↔ best-bid 0.13810 /
  "you receive $27,217"; fill breakdown re-sorts (MM-Kappa on the ask, MM-Delta on the bid) ✓.
- **Strike box ↔ slider sync:** box −25 → slider −25; slider 42 → box 42. Both directions ✓.
  Typing 200 (outside the ±60 slider range) leaves box 200 / slider 60 — desync, but only outside
  the control's stated range.
- **FLAG-C2 (moderate):** the teal **fill bar under the strike slider (`#tkf`) never moves.** At
  slider = −60, −30, 0, 30, 60, 12 it reports `width:60%` every time — it is the hard-coded value in
  the HTML and no code ever writes it. (The maker-divergence fill `#arbf` *is* updated, 0%→100%, so
  the two sliders behave inconsistently.)
- **Size** 3→45 BTC: fill breakdown correctly walks the book — MM-Kappa 38.10 @0.13326 then YOU 6.90
  @0.13570 = 45.00 ✓.
- **FLAG-C3 (moderate):** "Improvement vs single maker → **envelope vs best single = 0.00 bps**"
  in **all 9 states** tested (k = −40/0/+25 % × divergence 0 / 0.3 / 1.0), including states where the
  four maker quotes differ hugely (0.16035 / 0.17922 / 0.18268 / 0.20084 at k=0, D=1). It is
  identically zero **by construction**: `bestSingle` is defined as the minimum-ask row, which *is*
  the envelope ask. The card's own caption claims "the envelope is tighter than the best individual
  maker whenever makers differ" — the number under it can never say anything but 0.00.
- **FLAG-C4 (moderate, product-tier):** at the default divergence 0.15 the book is crossed at every
  strike I sampled, so **"book spread" renders −356.7 bps** and "book half-spread" −178.4 / −209.6 bps.
  Negative numbers presented as spreads. (Build 14 adds a footer acknowledging the crossing as an
  unresolved operator-tier question; the negative readout itself is unchanged.)

### maker divergence dial — PASS on all three criteria

| D | label | fill bar | book state | arb available | canvas |
|---|---|---|---|---|---|
| 0.00 | 0.00 | 0% | **clean** | — | 46f0c6e1 |
| 0.01 | 0.01 | 1% | **clean** | — | f4f12979 |
| 0.05 | 0.05 | 5% | ARB OPEN | $83 / BTC | d9787f98 |
| 0.15 | 0.15 | 15% | ARB OPEN | $318 / BTC | 920b755c |
| 0.30 | 0.30 | 30% | ARB OPEN | $670 / BTC | 886805c0 |
| 0.50 | 0.50 | 50% | ARB OPEN | $1,139 / BTC | 765301f1 |
| 0.75 | 0.75 | 75% | ARB OPEN | $1,724 / BTC | 737d2028 |
| 1.00 | 1.00 | 100% | ARB OPEN | $2,308 / BTC | e91a625 |

- clean → ARB OPEN flips between D=0.01 and D=0.05 and stays open; **arb $ is monotone increasing**
  in D over the whole crossed range. Node oracle reproduces every figure (83.427 / 317.966 / 669.827
  / 1138.800 / 2307.771).
- **Per-click (true keyboard ArrowRight, step 0.01):** 0.15→0.16→0.17; arb $318 → **$341** → **$365**;
  best ask 0.13326 → 0.13310 → 0.13293; canvas hash changes on every click. **Visible delta per
  click: YES.** At D=1 the individual maker curves visibly fan out from the envelope
  (`shots_A/DIAL_D1_curves.png`); at D=0 they coincide.

## PHASE 5 — THE LANDING MAP (main target)  ·  4 FLAGS + 5 PASSES

### PASSES (measured)

1. **Renders in both views, not blank, not clipped.** Field region fully painted:
   136,200 / 136,200 px, 1,158 distinct colours (Earn) / 4,926 (Transact). Canvas bottom 638.5 vs
   panel bottom 813.3 (Earn), 609.7 vs 707.3 (Transact) → **no clipping**. The moneyness x-axis at
   the canvas bottom is shared with the curve chart above and the scales match exactly
   (both k ∈ [−0.7, 0.7], same L=56 / R=16 margins).
2. **Legend max == hottest cell.** Legend swatches sampled at row `yT−9`: zero `rgb(11,30,33)`,
   mid `rgb(55,182,160)`, **max `rgb(255,103,103)`**, no-fit `rgb(74,18,24)`. The max swatch colour
   is present in the field and the pixels carrying it re-derive (independent Node `indepLanded`) to
   **206.9 / 208.9 / 210.8 bps** against a legend that reads **"210 bp"** (true field max 209.660).
   Earn legend reads "0.96 bp / 1.9 bp" against a true max of **1.917809 bps**. Crops:
   `shots_A/P5_transact_legend.png`, `shots_A/P5_earn_legend.png`.
3. **Marker tracks strike AND size.** Detected by locating the filled 3.4-r pure-white disc.
   Transact k = +12 / −40 / +40 % → disc x = 531 / 193 / 712 px → decoded k = 0.1187 / −0.4024 /
   0.3978 (≤1 px = 0.0015 in k). Size 3 / 60 / 150 / 210 BTC → disc y = 146 / 109 / 49 / 8 →
   decoded Q = 6.0 / 61.2 / 150.8 / 212.1 BTC. Same on Earn with the hover strike.
4. **Marker caption == independent Node re-derivation.** `indepLanded` was written from the stated
   spec (walk makers cheapest-first, VWAP), not copied from `ladderAt`/`landedFrom`; both agree to
   <1e-9 and both agree with the pixels on screen:

   | k | Q | independent Node | on-screen caption | crop |
   |---|---|---|---|---|
   | +40 % | 150 | 160.0377818 bps | "lands you **160.0** bps off best" | `CAP_k40_Q150.png` |
   | −40 % | 150 | 21.5503827 bps | "… **21.6** bps off best" | `CAP_km40_Q150.png` |
   | +12 % | 60 | 66.9809997 bps | "lands you **67.0** bps off best" | `CAP_k12_Q60.png` |
   | +12 % | 3 | 0.0000000 bps | "lands you 0.0 bps off best" | `P5_transact_band.png` |
   | +12 % | 201 | NO FIT (total cap 200.000000) | "this size does not fit the book" | `CAP_k12_Q201.png` |
   | +12 % | 240 | NO FIT | "this size does not fit the book" | `CAP_k12_Q240.png` |

5. **"No fit" band is exactly right.** Total book capacity = Σ share·pool = **200.000000 BTC**;
   the y-axis tops out at Qmax = 1.12·total = 224. Dark-red `rgb(74,18,24)` occupies field rows 1–16
   = Q ∈ [200.1, 224] — 9,502 px, 6.98 % of the field. The marker at Q = 201 lands on that boundary
   and reports "does not fit". **No false no-fit anywhere below 200 BTC.**
6. **Axis labels do not overlap.** y ticks `0.00 / 56 / 112 / 168 / 224` at x=22, rotated
   "trade size (BTC)" at x≈12, field starts at x=56 — three disjoint bands, visually confirmed
   (`shots_A/P5_earn_axis.png`). (Cosmetic: the bottom tick prints "0.00" while the rest are
   integers.)

### FLAG-LM1 (major, misleading) — the Earn landing map has **zero strike dependence**

`draw()` line 419 builds the maker set as `st.book.map(m => ({c: st.c, h: m.h, share: m.share}))` —
**every maker is handed YOUR curve.** Then `px_i(k) = C(k)·(1 + h_i/1e4)` and the ratio
`landed/best` cancels `C(k)` identically, so `impact(k,Q)` is constant in k.

Measured three ways:
- Node oracle, fixed Q, all 120 columns: min/max spread = **4.44e-12 bps** at Q = 28.0, 104.4 and 196.0.
- Independent re-derivation on the actual painted pixels, same row: k = −0.5458 → **1.911532 bps**,
  k = +0.0709 → **1.911532 bps**, k = +0.6877 → **1.911532 bps**.
- Pixels: sampling 4 rows across 868 columns yields 5 / 5 / 10 / 8 distinct colours, all within ±1
  RGB unit of each other (pure rasterisation dither of one colour).

It renders as **flat horizontal stripes** (`shots_A/P5_earn_band.png`), while the panel's own title
says "where a trade of that size **at that strike** lands vs the best quote" and the chart note says
"Colour = how far a trade of that size **at that strike** lands from the best quote". The x-axis of
the Earn map carries no information at all. Transact does **not** have this bug (real 2-D surface,
4,926 colours) because `renderTransact` passes `makerCurves()`, where each maker has its own curve.

### FLAG-LM2 (major, misleading) — self-normalising colour scale paints a ~0 field as a hot one

`drawHeat` normalises every cell to the field's own max (`sc = mx > 1e-9 ? mx : 1`), so the full
dark→teal→amber→deep-red ramp is painted **no matter how small the field is**.

Reachable in two slider drags the UI explicitly tells the user to make ("Drag realised vol"):
**realised vol 0.10 + turnover 3.00×/day** ⇒ true field max = **0.005336 bps** (five thousandths of
one basis point — economically nil).

| state | true field max | deep-red `rgb(255,103,103)` census | legend |
|---|---|---|---|
| default (rv 0.60, turn 0.30) | 1.917809 bps | n=2448, x 1–906, rows 18–20 | "0 / 0.96 bp / 1.9 bp / no fit" |
| stressed (rv 0.10, turn 3.0) | **0.005336 bps** | **n=2448, x 1–906, rows 18–20** | "0 / **0.00 bp** / **0.01 bp** / no fit" |

The two paints are **identical** (`shots_A/P5_earn_band.png` vs `shots_A/P6_nearzero_band.png` —
compare them; the only difference on screen is the 9 px legend text, and it reads "0.00 bp" for the
mid-tick). A user reading the panel sees a red danger zone above ~170 BTC in a book whose worst
possible impact is one two-hundredth of a basis point. **This is the specific failure the brief asked
me to rule out, and I cannot rule it out — it is present and reachable.**

### FLAG-LM3 (moderate) — the same normalisation crushes the informative region when the max is an edge outlier

On Transact the field max (209.66 bps) sits in the extreme call-wing corner (k ≈ 0.69, Q ≈ 196), so
everything economically central is compressed toward black. Concretely, **in one frame**: at
k = −40 %, Q = 150 BTC the cell under the marker is painted in the near-black "at best" band
(t = 21.55/209.66 = 0.103) while the marker's own caption on the same panel reads
"**21.6 bps off best**" (`CAP_km40_Q150.png`). Colour and caption disagree about the same point.

### FLAG-LM4 (moderate, usability) — no per-click delta on the size axis; marker pinned to the floor

The size axis spans 0–224 BTC (1.12 × total book capacity) while the shipped default trade sizes are
3 BTC (Transact) and 5 BTC (Earn) — the marker sits in the **bottom 2.2 %** of a 150 px band, and its
3.4 px disc is partially clipped by the field's bottom edge (detected disc centre 146 vs analytic
148.0). A true keyboard click on the size box steps **0.1 BTC** (the box has `min="0.1" step="0.5"`,
so the value grid is 0.1, 0.6, 1.1 … and 3 → 3.1, not 3.5) = **0.067 px**:

| box | clicks | value path | marker px moved |
|---|---|---|---|
| `#tsz` (Transact) | 2 × ArrowUp | 3 → 3.1 → 3.6 | **0 px, 0 px** |
| `#qsz` (Earn) | 2 × ArrowUp | 5 → 5.1 → 5.6 | 1 px, then 0 px |

The size dimension is the *entire reason* the panel exists ("what a taker actually pays depends on
SIZE too"), and it is the one input with no per-click visible response.

## PHASE 6 — Trade Bands  ·  PASS

All three controls both directions, canvas re-drawn each time, exact restore (`cvB` hash
`c5b25fba` before and after). Canvas non-blank 15,237 px / 1,834 distinct colours.
Sell-strike 2→55 %: sell leg 0.17084→0.05727, Δκ +0.01866→−0.06322. Buy-strike −55→−2 %: buy leg
0.01731→0.16721, units 10.8868→1.5738. Size 0.5→40: proceeds 0.0280→1.5439 BTC, Δκ
−0.00693→−0.57744. "S̄ · a · γ unchanged" holds in every state; only κ moves, as claimed.
Both strike markers sit on their own curves (teal on the call arm at the sell strike, red on the put
arm at the buy strike).

## PHASE 7 — Portfolio  ·  PASS (no own controls) + 1 minor FLAG

The view has no controls of its own — positions are hard-coded — so I drove it through the shared
curve params: γ 3.5 → 0.4 moves options value $8,307 → $52,320, account equity $1,408,307 →
$1,452,320, leverage 4.98× → 4.86×; restore exact. Hedge readback: net Δ −0.1421 BTC, required hedge
+0.1421 BTC, residual 0.000000 ✓. Liquidation: 4.95× / cap 50× / headroom 45.05× / SAFE ✓.

**FLAG-C7 (minor):** the "BTC put −10.0%" row is a **short** (side = −1, value **−$16,506**) but its
size renders unsigned as "2.00" while longs render "+3.00" — it reads as a long put. Its Δ (+0.536)
is also computed from the **call** leg (`(CALL(k+ε)−CALL(k−ε))/2ε · side`) and is a derivative with
respect to moneyness k, not spot.

## PHASE 8 — Right-rail spot checks  ·  PASS

| driver | Break-even half-spread | Break-even turnover | Parity check |
|---|---|---|---|
| realised vol 0.10 | 0 bps (hFair 0.41, rounds to 0) | 0.24× /day | 0.000000000000 |
| realised vol 1.40 | 81 bps | 0.24× /day | 0.000000000000 |
| turnover 0.05× | 89 bps | 0.04× /day | 0.000000000000 |
| turnover 3.00× | 1 bps | 2.40× /day | 0.000000000000 |

All finite and directionally correct: break-even half-spread rises with vol and falls with turnover;
break-even turnover is invariant to vol **in vol-indexed mode by construction** (bleed and hEff both
scale with rv²) and moves 0.04→2.40 with turnover. Parity is exactly zero throughout.
Caveat: `0 bps` at rv=0.10 is a rounding artifact of a 0.41 bps value, and the only non-finite
readout in the whole pass is the `∞× /day` under FLAG-C5.

---

## Summary table

| # | severity | finding | survives into build 14 |
|---|---|---|---|
| LM1 | **major** | Earn landing map has zero strike dependence (all makers get YOUR curve, line 419); caption claims otherwise | YES |
| LM2 | **major** | self-normalising colour: a 0.005 bps field paints identically to a 210 bps one | YES |
| LM3 | moderate | edge-outlier max crushes the central region; colour and caption disagree at k=−40 % | YES |
| LM4 | moderate | size axis 0–224 BTC vs 3–5 BTC defaults; per-click = 0.067 px = no visible delta | YES |
| C1 | **major** | `depth` slider is read by nothing | YES |
| C2 | moderate | strike-slider fill bar frozen at 60 % | YES |
| C3 | moderate | "envelope vs best single" identically 0.00 bps by construction | YES |
| C4 | moderate | negative "book spread" shown at the default divergence (crossed book) | YES (footnoted in 14) |
| C5 | minor | `fee` inert unless vol-indexed off; `∞× /day` at fee = 0 | YES |
| C6 | minor | `λ` no longer changes any pixel | YES |
| C7 | minor | portfolio short put rendered unsigned; Δ taken from the call leg, in k not S | YES |
| P1 | process | build 14 landed mid-pass; first A/B pair discarded | — |

**No pageerrors, no dialogs, byte-stable across two full passes. Verdict: FLAG.**
