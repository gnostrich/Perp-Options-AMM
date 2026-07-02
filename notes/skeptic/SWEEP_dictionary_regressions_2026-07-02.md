# SKEPTIC SWEEP — dictionary/doctrine regressions, WINE paper (2026-07-02)

Artifact: `paper/wine2026/temporal_wine2026_v2.tex` (md5 `6ca5755f7253f351c38881bdd1428b34`, 1020 lines).
Ground truth: `docs/STORY_TABLE.md` (ed. 13) > `docs/operator_mental_model.md` (entries 304/307/308/311/331) > `docs/COMPONENT_REGISTER.md`.
Mandate: operator entry 358 (verbatim: "not just for this particiular dictionary regression but in
general for other such things vs the story table etc conveersationwe had").
Scope: 10 doctrine rows; all three figure captions; worked-example table headers; full section sweep.
Prior fix this turn (line ~491 barrier "a mark"→"a value capped at 1") re-checked: correctly in place.

## FINDINGS

### FLAG-1 · REGRESSION · doctrine row 1 (mark semantics) · Figure 2 (fig:lens) axis label + caption
- **Line 364:** `ylabel={option-value mark (mode peak $=1$)}`
- **Line 382:** "The shape is normalized so the mode (at-the-money) peak is $1$"
- **The hole:** the figure labels the plotted quantity the **mark** and puts its at-the-money peak at
  **1**. Settled doctrine (entry 311/331; STORY_TABLE station 5): the mark is the smooth-pasted
  American value, =1 **only at full exercise**, and **at the money it is the continuation value**
  (0.148 at γ=2) — the paper's own §3.2 (lines 314–316) and the worked table (line 547, mark 0.148 at
  S=K) say exactly that. "Mark peaks at 1 at the mode" is the retired barrier-era read; it is also the
  retired chart-2 peak-at-1 tent (entries 298/301, "peak-at-1 tent RETIRED"), and the 2026-06-14
  caption ruling already held that "mark=1 is the full-exercise cap, not the mode." This is the -B289
  repeat-offender class: caption/axis teaching the retired thing while the body text is correct.
- **Steelman (why it survived):** the plotted object $(\mathrm{mode}/\theta)^{m\gamma}$ is a legitimate
  normalized steepness-SHAPE illustration, and the caption hedges ("the normalisation is schematic —
  the deployed interface plots the un-normalised option value itself"). The geometry is fine; the
  steelman fails only on the WORD: a reviewer reading axis labels learns "mark = 1 at the money,"
  directly contradicting §3.2 and Fig. 3. The hedge names the normalization, not the mislabel.
- **Minimal fix:** line 364 ylabel → `wing-steepness shape (normalized, mode $=1$)`; caption line 382:
  "The plotted quantity is the normalized steepness \emph{shape} — not the mark, whose at-the-money
  value is the continuation value (Section~5)"; keep the rest of the caption as is.

### NIT-1 · doctrine row 8 vocabulary · line 138
- **Line 138:** "a single static, \emph{volatility-calibrated} curvature knob $m$"
- "Curvature knob" collides with the paper's own ceiling paragraph (lines 435–447: the knob buys
  "level and skew, **not smile curvature**"), and settled vocabulary is steepness dial / constant
  slope multiplier (mental-model table; CLAUDE.md §0). Not wrong-frame — the sentence immediately
  says "sets the option-value steepness uniformly" — but the one word invites exactly the
  smile-curvature misreading the ceiling paragraph disclaims. Fix: "curvature knob" → "steepness knob".

## CHECKED AND CLEAN (attack attempted, doctrine row by row)
| Row | Verdict | Evidence |
|---|---|---|
| 1 mark | REGRESSION at Fig 2 only | §3.2 (309–322) correct: smooth-pasted, one ray/one curve, ATM=0.148, cap 1 at full exercise; §5 barrier passage (491–494) correctly "prior treatment… value capped at 1"; Fig 3 + worked table correct |
| 2 funding | CLEAN | 341–352: deviation vs w=½ **anchor curve at the position's own strike ray**; crowded pays contrarian; through-the-knob per entry-232; rate-law-vs-routing hedge matches FLAG-C. Only `45°` in paper (line 240) is ATM-strike identification, not funding |
| 3 rebase | CLEAN | 333–339: frame re-zoom on each oracle update, commute cited L2 — matches station 7 / entry 311 |
| 4 hierarchy | CLEAN | §2 leads with pool curve + rays; mark defined as ray read (317–319); value pictures presented as reads/illustrations, trades act only on w |
| 5 vol direction | CLEAN | 87–93, 424–426, 609–611 all "more volatile ⇒ LOWER γ/m, shallower, fatter wings"; no -B289 instance anywhere incl. captions |
| 6 trade-point | CLEAN | §2.3 + fig:warp caption + conclusion (869–871) all teach conservation at T; w′=11/21 vs 22/43 exhibit present (284–287); no passage teaches reserve-point |
| 7 American=consistency | CLEAN | abstract 53–55, 110–117, 571–573, L7 (919): deterministic-optimal genuine, Snell named-not-formalised, exercise = holder's choice |
| 8 knob m | CLEAN (NIT-1 aside) | zero hits for tau/elbow/√(τ²+u²)/kurtosis; g_loc=mγ constant every strike (411); static, vol-calibrated, never trader-moved (93–94, 424–425); frozen tx-map (418) |
| 9 execution dictionary | CLEAN | premium never enters pool (697–700, 849); club = own side (711–715); frozen K_tx (678–679, 705–707); ITM settles to cash, no pool swap (707–709, 833–834); nothing implies a ray flipping wings |
| 10 GH/carry leftovers | CLEAN | GH appears only as the carried Bessel-K distributional hypothesis (599, 827) — honest framing; carry P=Ny/Nx (§3.3) is NOT a GH leftover: COMPONENT_REGISTER C4 = VERIFIED current mechanics on v28 (tester live 2026-06-13); no ghMu |

Figure captions: fig:warp CLEAN, fig:lens = FLAG-1, fig:seam CLEAN (mark 1/3 at boundary, m=1 stated).
Worked-example table headers CLEAN.

Verdict for the artifact as a whole: **FLAG-WRONG-frame at one locus (Fig 2 label — REGRESSION,
halt-class for submission until relabeled); otherwise the sweep is clean.** No findings invented;
carry question was raised and dissolved against register row C4 rather than reported.

— skeptic, 2026-07-02
