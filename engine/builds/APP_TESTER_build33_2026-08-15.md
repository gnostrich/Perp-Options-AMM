# TESTER PASS — `app/index.html` build 33 — 2026-08-15

**VERDICT: FLAG** (9 major, 11 minor). Nothing in the app *errors*; a lot of it *misreports*.
Operator-authorised (entry 595). Read-only on the source: `md5 1ea1fd93f1748e2696d608df116f77e8`
**unchanged pre/post** every run. Served bytes verified identical to the local file
(`curl … railway.app | md5sum` == `md5sum app/index.html` == `1ea1fd93…`), so the local file IS
what is deployed.

## Method (and why it is not the manager's harness)
- Live Chromium (`/opt/pw-browsers/chromium-1194`), Playwright at `/tmp/node_modules/playwright`,
  `file:///home/user/Perp-Options-AMM/app/index.html`, viewport 1900×1200.
- **id integrity re-measured in the REAL document** (`document.getElementById(id)===null`), not
  through a stub that returns an element for any id. 67 ids read by the script, **0 missing**.
- **Every numeric claim re-derived by me**, from the stated spec, in a separate node oracle
  (`evidence/app_build33/oracle_build33.cjs`) that reuses only the curve family (`mk`) and the
  state constants — aggregation, impact, fills, marks are written independently.
- Ran twice. `RESULT_runA.json` == `RESULT_runB.json` **byte-identical** (47,512 chars, modulo the
  run label) and `PIXELS_runA.json` == `PIXELS_runB.json`. 0 pageerrors, 0 dialogs both runs.
  The single console error is the Google-Fonts fetch (`ERR_CONNECTION_RESET`, no network in the
  sandbox) — not app code.

### Two of the manager's scripts measure the wrong thing (say so, per brief)
1. **`sims/scripts/selfmark_independence_check.js` measures nothing.** It sets `P.Sbar=Sb` and then
   calls `calc()`, and `calc()` line 354 *overwrites* `P.Sbar` from the oracle in ORACLE mode. All
   four sweep points are the same state; that is why it prints `$19,243` four times and
   "sensitivity 0.0%". The honest test is MANUAL mode — done here (P6e): the true sensitivity is
   **+0.078%**, not 0.
2. **`sims/scripts/sheet_exact_match_check.js` tests a degenerate configuration.** It forces all
   four makers onto one identical curve with zero spread, where the parallel-depth aggregation is
   trivially the single pool. It cannot see the heterogeneous case. Measured live (P6a): the
   aggregation is a *capacity-weighted harmonic* mean of ATM, so the code comment at line 406
   ("collapses exactly to one pool holding ΣNᵢ — verified identical to 1e-15") is true only for
   identical makers; in the live default configuration the gap is **−0.0079% relative**
   (economically nil, but the claim is overstated).
3. `app_id_integrity_check.js` is sound (regex over source vs markup) and agrees with the live-DOM
   audit: no dead ids remain.

---

## PHASE 1 — load, ids, nav  ·  PASS
| item | measured | verdict |
|---|---|---|
| pageerrors / dialogs | 0 / 0 (both runs) | PASS |
| ids read vs real DOM | 67 read, **0 missing**; declared-but-unread: `cta`, `live`, 4 grid ids | PASS |
| 4 views render | earn 4258 / transact 3365 / bands 3365 / portfolio 2364 chars innerText | PASS |
| exactly one grid visible per view | earn→`[gridEarn]`, transact→`[gridTransact]`, portfolio→`[gridPortfolio]`, bands→`[gridBands]` | PASS |
| canvases non-blank | `cv` 76,432 px · `cvT` 95,163 px · `cvB` 15,242 px | PASS |
| screenshots | `evidence/app_build33/shots_A/01_view_{earn,transact,portfolio}.png`, `01_view_bands_fixed.png`, `05_portfolio.png` | PASS |

**FLAG-20 (minor, navigation).** There is no `Trade Bands` link in the header nav (`data-nav` =
transact/earn/portfolio only). Bands is reachable only through the in-panel tab strip, and the
Portfolio view has no tab strip — from Portfolio, Bands is unreachable without visiting another
view first. While on Bands the header highlights **TRANSACT**.

> *Harness note against myself:* my first pass clicked `[data-t="bands"]` and Playwright resolved it
> to the **hidden** `#gridEarn` copy, so Bands never opened and I nearly reported its numbers from a
> stale hidden grid. Fixed with `:visible` locators; all Bands numbers below are from a genuinely
> displayed grid (`cvB` 15,242 non-blank px).

---

## PHASE 2 — the build-32 controls (ORACLE+BIAS / MANUAL, oracle vol, bias, S̄)
### 2.1 mode toggle — PASS
Default ORACLE (`#mdOrc` bg `rgb(10,186,181)`), `#orcbox` 845 chars of markup, S̄ hint renders
exactly `= solved from oracle`. MANUAL: `#orcbox` innerHTML length **0** (oracle sliders removed),
`#mdMan` bg `rgb(36,59,61)`, hint gone. Round-trips.

### 2.2 oracle-vol slider — moves the curve, but the readout is a render behind  ·  **FLAG-4**
| set iv | canvas moved | "solved S̄" shown | after ONE extra render (no state change) | S̄ slider then |
|---|---|---|---|---|
| 0.20 | yes | **0.6000** | 0.1684 | 0.17 |
| 0.60 | yes | **0.1684** | 0.6000 | 0.60 |
| 1.20 | yes | **0.6000** | 2.0248 | 1.00 |
| 2.00 | yes | **2.0248** | 60.0000 | 1.00 |

`render()` writes `#params` and `#orcbox` **before** calling `calc()`, and `calc()` is what solves
`P.Sbar` and sets `HEFF_BPS`. So the entire left card (S̄ field, *solved S̄*, *bias budget*) shows the
**previous** state while the right-hand cards (`q-fair`, `r-gt`, yield, capacity) show the current
one. Two different states on one screen, every interaction.

### 2.3 the natural map has **no solution** above ~185% oracle vol  ·  **FLAG-5 (major)**
`ATM(S̄)` is bounded: 0.5512 at S̄=60, **sup ≈ 0.5586** as S̄→∞. `premiumTarget(v)=0.178897·v/0.6`
demands 0.5665 at v=1.90 and 0.5963 at v=2.00 — unattainable. `calibSbar` bisects on `[0.02,60]`
and silently returns the **ceiling**:

| oracle vol | 1.80 | 1.84 | **1.85** | … | 2.00 |
|---|---|---|---|---|---|
| solved S̄ | 22.5696 | 46.4505 | **60.0000 (= the bisection bound)** | 60.0000 | 60.0000 |

Live screen at iv=2.00: `solved S̄  60.0000` while the S̄ slider is pinned at its max **1.00** —
a 60× disagreement between two on-screen renderings of the same quantity. The comment at line 273
("premium is strictly increasing in S̄, so the inverse is well-posed") is monotonically true but
**not well-posed over the slider's own range**: the top 7.6% of the oracle-vol control is broken.

### 2.4 bias slider — moves, but the budget is finer than one click  ·  **FLAG (minor)**
| bias | you quote vol | bias budget | you are |
|---|---|---|---|
| −0.30 | 42.0% | ±0.162% | ARBABLE — 185.4× your budget |
| −0.01 | 59.4% | ±0.172% | ARBABLE — 5.8× |
| **0** | 60.0% | ±0.163% | **inside your spread** |
| +0.01 | 60.6% | ±0.162% | ARBABLE — 6.2× |
| +0.30 | 78.0% | ±0.153% | ARBABLE — 195.8× |

The bias step is 1% vol; the budget is ~0.16% vol. **The only non-ARBABLE setting is exactly zero** —
one click off centre is already 6× over. The control works; the budget it is measured against is
unreachable at the control's own granularity.

### 2.5 the S̄ slider in ORACLE mode is a control that *echoes* but does nothing  ·  **FLAG-3 (major)**
Set the S̄ range input to 0.25 in ORACLE mode:
- slider reads **0.25**, number box reads **0.25**, "solved S̄" reads **0.2500** — the screen accepts it;
- **`cv` canvas hash UNCHANGED** — the curve did not move at all;
- one further render (a mouse move) and everything snaps back to 0.60 / 0.6000411255259848 / 0.6000.

The engine ignores the input (calc overwrites `P.Sbar`), but the display echoes it back as if it were
state, *including relabelling the "solved from oracle" readout with your number*. This is the
seven-build dead-control defect class in its most misleading form: not a control that does nothing,
but a control that does nothing **and tells you it worked**.

### 2.6 S̄ in MANUAL mode — PASS
| S̄ | 0.05 | 0.30 | 0.60 | 0.95 | 1.00 |
|---|---|---|---|---|---|
| sticks (no overwrite) | yes | yes | yes | yes | yes |
| Curvature G̃ | 2.91 | 1.54 | 0.91 | 0.61 | 0.58 |
| half-spread | 60 bps | 32 | 19 | 12 | 12 |
| Σ posted premium (BTC) | 0.4862 | 11.4995 | 29.9377 | 49.3576 | 51.8199 |

Canvas changes at every step; monotone and directionally right (higher level ⇒ flatter ⇒ tighter).

---

## PHASE 3 — TRANSACT
### PASSES
- BUY/SELL cloud tabs: `cvT` re-renders each way, returns byte-identical to the start.
- AGGREGATE / YOU: `cvT` changes, YOU view 98,281 non-blank px, returns byte-identical.
- Strike **box → slider** (−25 ⇒ slider −25, fill bar 29.2%) and **slider → box** (40 ⇒ box 40, fill
  83.3%). The `#tkf` fill bar tracks (build-13 C2 is fixed).
- Strike sweep −60…+60: best ask 0.61392 → 0.05280 monotone, `cvT` changes at every step.
- Divergence dial 0→1: readout and fill bar track; per-ArrowRight 0.16/0.17/0.18 each with a canvas
  delta.
- Side Buy/Sell buttons flip the quote card (`you pay $26,735` ⇄ `you receive $26,647`).

### **FLAG-2 (major) — two different "you pay" numbers on one screen**
The Order card quotes `size × top-of-book`; the Fill breakdown charges the impacted price.
| k | size | Order card "you pay" | Σ Fill-breakdown "you pay" | gap |
|---|---|---|---|---|
| +12% | 3 | $26,735 | $26,998 | +1.0% |
| +12% | 25 | $222,788 | $241,141 | +8.2% |
| +60% | 25 | $86,722 | $105,075 | **+21.2%** |
| +12% | 150 | $1,336,728 | $1,997,451 | **+49.4%** |

### **FLAG-7 (major) — "Improvement vs single maker" has no sign**
`|bestSingle/env − 1|`. Measured at k=+12%:
| size | best single maker's ask | envelope price | envelope cheaper? | displayed |
|---|---|---|---|---|
| 0.1 | 0.133266 | 0.135694 | **NO** | `178.88 bps` (green) |
| 3 | 0.133266 | 0.136990 | **NO** | `271.81 bps` (green) |
| 10 | 0.133266 | 0.140119 | **NO** | `489.05 bps` (green) |

The envelope is *worse* at every size, and the card prints the disadvantage as a positive
improvement under the caption "the envelope is tighter than the best individual maker". This is the
build-13 **C3** defect in a new form — line 694 claims C3 was fixed.

### **FLAG-12 — readouts that cannot report**
`B.who()` returns `set.find(m=>m.me)` unconditionally ⇒ **"filled by: YOU"** and **"you are matched
to: your own quote"** at all 7 strikes × 7 divergence values tested. `crossed:()=>false` is a
constant ⇒ **"makers leaning the other way: none"**, always. (The underlying no-cross property is
genuinely true — see P6b — but the widget is not measuring it.)

### **FLAG-13 — the divergence dial does not separate the sides**
Caption: *"Drag maker divergence to see the sides separate."* Measured across 201 strikes:
spread = **32.781 bps at D = 0, 0.05, 0.15, 0.5 and 1.0** (min = max). Only the level moves
(ask 0.13568 → 0.13538, −0.2%). After the entry-580 aggregate-then-spread rewrite the caption
describes the old model.

---

## PHASE 4 — EARN
### PASSES
All six curve params move both ends with a canvas + DOM delta and restore exactly
(`a`: G̃ 95.84 ⇄ 0.07, APR 431.3% ⇄ 0.3%; `γ`: 0.58 ⇄ 1.40; `κ`: ±0.9 both work; `cap` 5 ⇄ 150 changes
the cloud and the depth column). Margin 15→40 moves notional $9,854,325 → $26,278,200.
VOL-INDEXED toggle flips label/mode/verdict/margin-over-fair and re-draws. Market sliders: rv 0.1→1.4
(APR 0.1%→22.2%), turnover 0.05→3 (break-even 0.04×→2.40× /day), RFQ size 0.5→40 (label + ladder).
Hover across the curve: `C−P` vs `−k` identical to 5 dp at all 5 points, parity readout
**0.000000000000** everywhere.

### **FLAG-10 — the `fee` slider is inert in the view's default state**
vol-indexed **ON** (the default): fee 0.02 → 0 → 0.2 gives **`cv` unchanged, body text unchanged** —
zero observable effect. With vol-indexed OFF it works (half-spread → 250 bps), and it does drive
Trade Bands. Build-13 **C5** is unresolved.

### **FLAG-6 (major) — the Earn RFQ table and the Transact book use different fill models**
Earn's `calc()` still allocates cheapest-first; Transact allocates pro-rata by density.
In **9/9** states tested (rv 0.1/0.6/1.4, turnover 0.05/0.3/3, Q 0.5/5/40) the Earn RFQ table shows:
```
YOU               19 bps   depth 95.0   fills —      revenue —
rest of book (3)    —      depth 105.0  fills 5.00   revenue $76
```
You never fill anything (your `hEff = hFair×1.25` is never the cheapest), while the Yield card on the
same screen reports **Annualized Fees $4,019,577**. Meanwhile Transact gives YOU 47.5% of *every*
trade. Two contradictory answers to "who fills this trade" in one app.

### **FLAG-11 — slider and box disagree on a fresh load, and "Reset to defaults" does not restore**
| param | slider | number box | agree |
|---|---|---|---|
| S̄ | 0.60 | 0.60 | yes |
| **a** | **1.25** | **1.2705** | **no** |
| **γ** | **1.85** | **1.8413** | **no** |
| κ / cap / fee | 0 / 95 / 0.02 | 0 / 95 / 0.02 | yes |

Range inputs snap to the min-anchored step grid (`min=.2 step=.05` ⇒ 1.2705 → 1.25). Identical
before and after clicking **Reset to defaults**, so the reset visibly fails to restore the defaults
it just set.

### **FLAG (minor) — the `size` box beside the cloud does not size the cloud**
`#qsz` 5 → 25 changes only the hover-bar "capture on 25.0 $4,162"; `cv` hash **unchanged**. It sits
in the cloud panel header where it reads as the cloud's size control.

### **FLAG-12b — leverage readouts that cannot move**
`Pool Leverage` is the literal string `10.0×`; `LP Leverage` = 2·margin·10·S / (margin·S) = **20.00×**
identically (measured 20.00× at margin 15 and 40).

---

## PHASE 5 — TRADE BANDS (genuinely displayed) and PORTFOLIO
**Bands — PASS.** `bs` −50/10/50, `bb` −50/−10/50, `bsz` 0.1/5/120: every point moves `cvB` and the
readouts, and all three restore exactly.
e.g. `bs=−50` ⇒ sell leg 0.52263, proceeds 2.5499 BTC, units bought 18.5503, Δκ +0.12352, ATM
0.1789→0.1784; `bsz=120` ⇒ proceeds 10.3692 BTC, Δκ −0.31164, ATM 0.1789→0.1616.
*(minor: the chart legend labels only `before`/`after` while four curves are drawn — the two put
curves are unlabelled; the chart has no y-axis value labels.)*

**Portfolio — 0 controls.** There is no input or button on this view (`#gridPortfolio` contains
none); it responds only to shared params. Scope item 5's "every control, both directions" is
vacuous here, and I am not going to dress that up as a pass.

### **FLAG-14 — the short leg renders unsigned and its Δ comes from the call curve**
On screen: `BTC put | −10.0% | 2.00 | 0.1259 | 0.1232 | −$16,536 | 0.535` — size **2.00** with no
minus while the calls render `+3.00` / `+1.50`. Line 901 computes Δ from `bookMid(k±0.005, 1)` — the
**call** mid — for every row, and in **k**, not in spot. That Δ is summed into the Hedge readback
(`net option delta −0.1430 BTC`, `required perp hedge 0.1430 BTC`). Build-13 **C7** is unresolved.
`residual exposure 0.000000` is a literal string, not a computation.

---

## PHASE 6 — numeric truth, re-derived
### 6a impact vs the swap-pricer sheet  ·  **PASS**
My independent aggregation vs the DOM fill price, 14 (k,Q) points — agreement to 5 dp everywhere:
| k | Q | my best | DOM best ask | my landed | DOM fill px | landed−best (bps) | sheet `½λ(Q/N)/0.01·ATM/P` |
|---|---|---|---|---|---|---|---|
| −0.6 | 3 | 0.613925 | 0.61392 | 0.615266 | 0.61527 | 21.843 | 21.845 |
| 0.00 | 3 | 0.179105 | 0.17910 | 0.180446 | 0.18045 | 74.871 | 74.877 |
| +0.12 | 3 | 0.135649 | 0.13565 | 0.136990 | 0.13699 | 98.857 | 98.865 |
| +0.60 | 3 | 0.052802 | 0.05280 | 0.054143 | 0.05414 | 253.963 | 253.983 |
| +0.12 | 25 | 0.135649 | 0.13565 | 0.146824 | 0.14682 | 823.807 | 823.873 |
| +0.60 | 25 | 0.052802 | 0.05280 | 0.063977 | 0.06398 | 2116.361 | 2116.529 |

Fractional cost rises with strike exactly as the sheet says (0.63% at k=−30%, 3.57% at k=+50% on
5 BTC, independent oracle). Residual sheet-vs-app error **−0.0079%** = the harmonic-vs-arithmetic
ATM aggregation noted above.

### 6b the book never crosses  ·  **PASS**
201 strikes × D ∈ {0, 0.05, 0.15, 0.5, 1.0}: **0 crossed**, spread constant **32.781 bps**
(min = max at every D). Structural, as claimed. (Note the one hole: `hAgg = min hᵢ`, so a single
maker quoting h=0 collapses the spread to 0 — ask == bid — which no code path prevents.)

### 6c fills pro-rata by capital and summing to the order  ·  **PASS (with a display caveat)**
Shares 0.475 / 0.19 / 0.095 / 0.24 (= cap 95/38/19/48 of 200).
| order | expected YOU | DOM YOU | expected rest | DOM rest | DOM sum |
|---|---|---|---|---|---|
| 1 | 0.475 | 0.48 | 0.525 | 0.53 | 1.01 |
| 3 | 1.425 | 1.42 | 1.575 | 1.58 | 3.00 |
| 17.5 | 8.3125 | 8.31 | 9.1875 | 9.19 | 17.50 |
| 60 | 28.5 | 28.5 | 31.5 | 31.5 | 60.00 |
Underlying sums are exact (1e-10); the **displayed** column is 2-dp-rounded and therefore sums to
25.01 / 1.01 (**FLAG-16, minor**).

### 6d — **FLAG-1 (major): the SELL side has the impact sign backwards**
`landedFrom` always *adds* `½·slope·Q`, on both sides. On a sell, the taker's realised price is
therefore **above** the best bid and rises with size:
| k | size | best bid | app's landed | spec (`best − ½·slope·Q`) | error |
|---|---|---|---|---|---|
| −0.30 | 1 | 0.356418 | 0.356865 | 0.355876 | +25 bps |
| +0.12 | 10 | 0.135205 | 0.139675 | 0.130735 | +683 bps |
| +0.30 | 50 | 0.091355 | 0.113705 | 0.068978 | **+6480 bps** |
Confirmed three ways: the page's own `landedFrom`, my independent oracle, and **in pixels** — on the
SELL tab at 50 BTC the orange "your curve at 50 BTC" line is painted at 0.3874 / 0.1686 / 0.1156
against a best bid of 0.36404 / 0.14488 / 0.09325, i.e. *above* the bid at every strike
(`pix_A/book_bid.png`), while the caption on that same canvas reads
**"1,653 bps WORSE than top-of-book (you receive less)"**. The screen says worse; the geometry and
the number say better. Sell more, receive more.

### 6e portfolio marks vs your own S̄  ·  PASS-with-a-leak (and the manager's script cannot see it)
MANUAL mode, dragging your own S̄ across its full range:
| your S̄ | 0.05 | 0.30 | 0.60 | 0.95 | 1.00 |
|---|---|---|---|---|---|
| options value | $19,229 | $19,238 | $19,242 | $19,244 | $19,244 |
| mark → close gap | −$788 | −$939 | −$1,009 | −$1,042 | −$1,045 |
| marks (3 rows) | .1356/.1258/.0916 | … | .1357/.1258/.0917 | … | .1357/.1259/.0917 |

Mark sensitivity **+0.078%** across the whole range (my independent oracle: +0.0759%) — the residual
channel is your `G̃ → hFair → the other makers' half-spreads`, not your curve. Self-exclusion itself
is real and **binds** where it should: at S̄=0.05 your ask (0.00186) would otherwise be the book's
min-ask; at S̄=1.00 your bid (0.21325) would otherwise be the max-bid; at the default S̄=0.60 it
changes nothing. **But the mark→close *gap* moves 33% with your own S̄** (−$788 → −$1,045).

### 6f — **FLAG-8 (major): the mark→close gap is not the spread; it is a profit**
The brief's expectation ("close px is the self-excluded best bid/ask, and the mark→close gap is the
spread") is **false as built**:
| position | mid (mark) | close px | gap per unit | gap $ |
|---|---|---|---|---|
| long call k=+12%, 3 | 0.135686 | **0.138107** | −0.00242 | **−$477** |
| short put k=−10%, 2 | 0.125853 | 0.123188 | +0.00266 | −$350 |
| long call k=+30%, 1.5 | 0.091709 | **0.093554** | −0.00185 | −$182 |
| **total on screen** | | | | **−$1,009 (rendered green)** |

Cause: marks/closes are read off an **others-only envelope that is itself crossed**:
| k | min ask (others) | max bid (others) | crossed by |
|---|---|---|---|
| +12% | 0.133266 | **0.138107** | 363.2 bps |
| −10% | 0.223352 | 0.228301 | 221.6 bps |
| +30% | 0.089863 | 0.093554 | 410.7 bps |
So `mid = ½(min-ask + max-bid)` sits *below* the price you close a long at. Closing the whole book
immediately pays you $1,009 against your own mark, and the UI renders that in the positive colour.
Note this is a **third** book model in the app: aggregate-then-spread for trading (never crosses),
min/max envelope for marks (always crosses), cheapest-first for the Earn RFQ.

---

## PHASE 7 — information leak  ·  **PASS**
`MM-Kappa` / `MM-Delta` / `MM-Sigma` scanned over **11 view/state combinations** (earn ×4 incl. SELL
cloud and MANUAL, transact ×5 incl. YOU view, both cloud sides, sell side, bands, portfolio) across
all visible text nodes **and** all `title` attributes: **0 hits**. No `fillText` call in the source
takes a maker name. Aggregated rows read "rest of book (3)" / "other makers (3)".

---

## PHASE 8/9 — the recurring defect class: controls that render but do nothing
30 inputs exercised to the far end of their range and back, each asserted against canvas hashes +
full body text.
- **Only genuinely inert input: `fee` on Earn in the default state** (FLAG-10).
- Buttons **with no handler at all** (inert by construction): `Create Earn Position` (`#cta`),
  `Create Position` (Transact, no id), `Execute Band` (Bands, no id), `Docs`, `Connect Wallet`.
  **No order in this app ever executes** — every "fill" on screen is hypothetical.
- **FLAG-9 (major, live-browser-only): a real mouse drag on any curve-parameter slider moves one
  step and then freezes.** Pressing on the γ track at 40% and dragging to 95%:
  `1.85 → 1.95 → 1.95 → 1.95 → 1.95 → 1.95`. `render()` rebuilds `#params` innerHTML on the first
  `input` event, destroying the element the pointer is dragging. Every param, oracle and market
  slider is affected. **No harness that sets `.value` directly can see this** — which is every
  script in `sims/scripts/`.

---

## PHASE 10 — pixel geometry
- **Earn BUY cloud is on the correct side and correctly shaped**: at 6 strikes the painted band's
  **lower** edge coincides with the ask (bot 0.5661/0.3646/0.2320/0.1453/0.0918/0.0637 vs ask
  0.5684/0.3654/0.2315/0.1454/0.0936/0.0637) and fades **upward**. SELL cloud mirrors it (top edge on
  the bid, fading down). `pix_A/earn_cloud_{ask,bid}.png`.
- **FLAG-15 (minor): the cloud caption understates the drawn depth by ~2.1×.** Caption: *"λ sets the
  stretch (0.08 in value to exhaust)"*. Measured band width **0.168–0.171**; analytic exhaustion
  distance = `Qcap × slope` = **ATM = 0.1789**. The captioned `dFull` is `share × ATM` = 0.0850, i.e.
  the caption prints 0.475× the distance actually drawn.
- **FLAG-19 (minor): the SELL cloud is clipped by the axis floor** for k ≳ +9% (band 0.064 at k=+49%
  vs 0.179 on the buy side), so "how far it reaches IS your depth" is unreadable across most of the
  sell side.
- Orange "at your size" curve pixel-located on both sides (see FLAG-1).

---

## SUMMARY
| # | finding | severity | evidence |
|---|---|---|---|
| FLAG-1 | SELL-side impact sign inverted — receive **more** the more you sell (+6480 bps at 50 BTC); drawn line and its own caption contradict | **MAJOR** | P6d, PIXELS book_bid |
| FLAG-2 | Order card "you pay" ignores impact; fill table charges it — up to **+49%** apart | **MAJOR** | P6a |
| FLAG-3 | ORACLE-mode S̄ slider accepted + echoed on screen, curve unmoved, reverts next render | **MAJOR** | P2.5 |
| FLAG-4 | Left Earn card is one render stale (solved S̄, bias budget, S̄ field) | **MAJOR** | P2.2 |
| FLAG-5 | Natural map unsolvable above ~185% oracle vol; silently pinned at bisection bound 60 vs slider max 1.0 | **MAJOR** | P2.3 |
| FLAG-6 | Earn RFQ (cheapest-first, YOU never fill) contradicts Transact (pro-rata, YOU 47.5%) and the Yield card | **MAJOR** | P4 |
| FLAG-7 | "Improvement vs single maker" prints a disadvantage as an improvement (178–489 bps) | **MAJOR** | P6h |
| FLAG-8 | Mark→close gap is −$1,009 (a profit), not the spread; marks use a crossed others-only envelope | **MAJOR** | P6f, P6g |
| FLAG-9 | Real mouse drag on any slider moves one step then freezes (innerHTML rebuild) | **MAJOR** | P9 |
| FLAG-10 | `fee` slider inert on Earn in its default state (build-13 C5) | minor | P4/P8 |
| FLAG-11 | slider vs box disagree for `a`/`γ` on fresh load; Reset does not restore visually | minor | P4 |
| FLAG-12 | hard-coded readouts: "filled by YOU", "matched to your own quote", "leaning the other way: none", "residual exposure 0.000000", Pool Lev 10.0×, LP Lev 20× | minor | P3/P5 |
| FLAG-13 | divergence dial never separates the sides (spread 32.781 bps at D=0…1) vs its caption | minor | P3/P6b |
| FLAG-14 | short put renders unsigned "2.00"; Δ from the call curve in k; feeds the hedge readback (build-13 C7) | minor | P5 |
| FLAG-15 | cloud caption understates drawn depth 2.1× | minor | P10 |
| FLAG-16 | displayed fills round to 2 dp, sum to 25.01 / 1.01 | minor | P6c |
| FLAG-17 | S̄ box prints `0.6000411255259848` | minor | P2 |
| FLAG-18 | 5 buttons with no handler; no order ever executes | minor | P8 |
| FLAG-19 | SELL cloud clipped by the axis for k ≳ +9% | minor | P10 |
| FLAG-20 | no Trade Bands nav link; unreachable from Portfolio; header highlights TRANSACT | minor | P1 |
| PASS | ids (real DOM), 4 views, canvases, box↔slider sync, all Earn/Bands params both ways + restore, hover parity 1.1e-16, impact == sheet, no crossing, pro-rata fills, self-exclusion binds, **no maker-name leak**, 0 pageerrors, A==B byte-identical | — | all phases |

## Artifacts
- `evidence/app_build33/pw_app_build33.cjs` · `pw_pixels_build33.cjs` · `oracle_build33.cjs`
- `evidence/app_build33/RESULT_run{A,B}.json` (byte-identical) · `PIXELS_run{A,B}.json` (byte-identical) · `ORACLE.json`
- `evidence/app_build33/shots_{A,B}/` (10 PNGs each) · `pix_{A,B}/` (4 PNGs each)
