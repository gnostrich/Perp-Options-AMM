# ⛔ HALTED BY SKEPTIC — DO NOT CITE §1–§5 AS SETTLED

**Status 2026-08-14: the skeptic returned HALT with 5 substantive FLAGs (verdict appended verbatim
at the bottom, unedited). The L1 state flip proposed below is NOT applied to
`sims/CLOSED_LOOP_MAP.md` and NOT applied to `docs/COMPONENT_REGISTER.md`. Two of the FLAGs are
FLAG-WRONG against the central argument, and I reproduced both on my own harness — see MANAGER
RESPONSE below. Read §1–§5 as a superseded draft; read the verdict and the response as the current
state.**

---

# L1 re-classified — an RFQ book is an ENVELOPE, not a MIXTURE

_Manager, 2026-08-14. Trigger: operator entry 554 — "since its an rfq and not an ob the makers can be
free to differ and arbitrage keeps them iine right". BRAINSTORM / non-core (`sims/`). Nothing in the
engine changes. Every number below is my own re-derivation in Node against `app/index.html`'s Burr-2
kernel; scripts committed at `sims/scripts/` (reproduction recipe at the bottom)._

## 1. What L1 said, and what it actually forbids

`sims/CLOSED_LOOP_MAP.md` records **L1** as a 🚩 *structural obstruction*:

> Heterogeneous LP steepness generates a SMILE, and the single-`m` lens structurally cannot represent
> it. "Each LP picks its own profile" and "the engine prices the book with one lens" are formally
> incompatible.

The proved statement behind it (`mixture_not_single_lens`, Aristotle conjecture (a)) is about a
**MIXTURE**: `Σ wᵢ · Cᵢ(k)` with `wᵢ > 0`, `Σwᵢ = 1`. A nontrivial mixture of *distinct* lenses is
strictly log-convex in log-strike, a single lens is log-affine, so no single `(c, g)` reproduces it.

**That hypothesis is a POOL's hypothesis.** A pool must publish ONE price per strike that is the
blended book, so the blend has to live in the pricing family. That is where the wall is.

## 2. An RFQ does not form the mixture

| structure | what the taker is quoted at strike `k` | must one curve represent it? |
|---|---|---|
| **pool / AMM** | `Σ wᵢ Cᵢ(k)` — the blend | **YES** — the pool has one curve |
| **orderbook** | best resting level on a shared book | yes, if you want a book-wide curve |
| **RFQ** | `ask(k) = min_i Cᵢ(k)(1+hᵢ/10⁴)`, `bid(k) = max_i Cᵢ(k)(1−hᵢ/10⁴)` | **NO** |

In an RFQ every maker quotes **its own** curve and the taker takes the best one. There is no blended
object anyone has to price, so **the mixture hypothesis is never instantiated** and
`mixture_not_single_lens` has nothing to bite. This is the operator's point in entry 554, stated
formally: *makers are free to differ because nothing forces their quotes into one curve.*

Core formulas (as implemented in `app/index.html`, `aggBook`):

```
ask(k) = min_i  Cᵢ(k)·(1 + hᵢ/1e4)
bid(k) = max_i  Cᵢ(k)·(1 − hᵢ/1e4)
arb    = bid(k) − ask(k)          > 0  ⇒  a real, takeable arbitrage
```

## 3. But the envelope is not free — it swaps one property for another

This is the part I will not soften. `BOOK_FORMAL.min_not_midconvex` already proves
**best-of-book leaves the family.** I re-derived it numerically, and it is not vacuous:

Two strike-specialised makers (A = cheap + fat tail `S̄=0.30, a=1.27, γ=1.05`; B = rich + thin tail
`S̄=0.85, a=1.27, γ=3.20`). A wins the ask for `k ≲ 0.46`, B wins beyond it — the winner **switches**:

| k | A | B | envelope | winner |
|---|---|---|---|---|
| 0.26 | 0.07412 | 0.08645 | 0.07412 | A |
| 0.42 | 0.05551 | 0.05768 | 0.05551 | A |
| **0.50** | 0.04912 | **0.04761** | 0.04761 | **B** |
| 0.66 | 0.03974 | 0.03314 | 0.03314 | B |

Worst butterfly (2nd difference in `k`, `dk=0.002`; `< 0` = butterfly-arbitrageable):

| object | worst butterfly |
|---|---|
| maker A alone | `0.000e+0` (convex) |
| maker B alone | `0.000e+0` (convex) |
| equal-weight **mixture** | `0.000e+0` (convex) |
| **RFQ envelope** | **`−4.929e-5` at k = 0.464** — exactly the crossing |

So: the envelope escapes the *representation* wall and lands on a *local butterfly* at the crossing.

**That is a different class of problem.** A representation obstruction is an impossibility — no
parameters exist. A butterfly at a crossing is an **arbitrage**: someone takes it, the loser re-quotes,
it closes. It is a market-discipline event, which is precisely the mechanism the operator named.

## 4. Measured in the app (build 12)

`app/index.html` now lets makers differ on level AND shape behind a `maker divergence` dial `D`
(`D=0` identical, `D=1` wide). At `k=0.05`, with the app's live vol-indexed half-spreads:

| D | best ask | best bid | book half-spread | state | arb |
|---|---|---|---|---|---|
| 0.00 | 0.15958 | 0.15905 | **+16.4 bps** | clean | — |
| 0.15 | 0.15693 | 0.16215 | −163.6 bps | ARB OPEN | **$343 / BTC** |
| 0.60 | 0.14887 | 0.17155 | −707.8 bps | ARB OPEN | **$1,490 / BTC** |
| 1.00 | 0.14158 | 0.17972 | −1187.2 bps | ARB OPEN | **$2,506 / BTC** |

The UI no longer calls this "CROSSED — arb" in red as if it were broken; it reads **ARB OPEN** in
amber with the dollar value, because in an RFQ that is an opportunity, not a corrupted book.

**My earlier fix was wrong.** I had forced all makers onto a common level to make the "crossed book"
go away. That imported an orderbook invariant (a shared resting book must never cross) into a venue
that has no shared resting book. Operator caught it; the common-level rule is removed.

## 5. What this does and does not change

**Re-classified (L1):** from 🚩 *proved structural obstruction* to **not-binding-under-RFQ**. Reason:
the mixture hypothesis is not instantiated by an RFQ envelope. This is a **scope** finding about which
theorem applies — the theorem itself is untouched and still binds any **pooled** design.

**Newly open (L1′), honestly logged:** the envelope can be locally butterfly-arbitrageable at maker
crossings (measured `−4.93e-5`). Unmodelled: who takes it, how fast, and whether an adversarial maker
can farm the crossing. That is the same **LP-game** gap already logged at entry 541 (latency,
correlated withdrawal, herding) — this adds a concrete instance to it, it does not close it.

**Unchanged / still open:**
- Burr-2 **MidConvex bridge** — still unproved; the book layer still wants it.
- **κ-dynamics** — still unformalised.
- **Nothing is wired into the engine.** HEAD is untouched; this is `sims/` + `app/` only.
- The apportionment result (`1/λ_agg = Σ1/λᵢ`, strike-invariant shares) is a **definition** plus its
  transported form, not a theorem about envelopes — unaffected either way.

**Not claimed:** that an RFQ is *better*, that the envelope is arbitrage-free, or that L1 was wrong.
L1 was right about pools. It was mis-scoped to a venue that is not a pool.

## 6. Reproduce

```sh
node sims/scripts/rfq_divergence_check.js          # divergence table (§4) — reads app/index.html directly
node sims/scripts/rfq_envelope_butterfly_check.js  # crossing + butterfly table (§3)
```
Both instantiate `<script>` from `app/index.html` in a `vm` context with a DOM stub, then call the
app's own `mk` / `makerCurves` / `aggBook` — no re-implementation of the kernel.



---

# MANAGER RESPONSE to the skeptic HALT (2026-08-14) — concessions first

I re-derived the two FLAG-WRONG claims independently (`/tmp/parity.js`, against `app/index.html`'s
own kernel, not the skeptic's scripts). **Both reproduce exactly. The skeptic is right.**

## Conceded — FLAG-WRONG (2): the mixture IS instantiated, in my own build

I had actually found this myself while the pass was running
(`sims/scripts/rfq_prorata_vs_envelope_check.js`) and had not yet folded it in; the skeptic found the
sharper version — it isn't hypothetical pro-rata, it is the **shipped ladder fill**, because each
maker is capped at `share·pool`. My re-run at `k=0.05`, pool 200:

| D | top maker cap | avg @38 BTC | avg @60 BTC | avg @150 BTC | impact @60 | weights @60 |
|---|---|---|---|---|---|---|
| 0.00 | 38.1 | 0.15958 | 0.15959 | 0.15960 | 0.7 bp | Kappa 63.5% / Sigma 36.5% |
| 0.15 | 38.1 | 0.15693 | 0.15791 | 0.15899 | **62.4 bp** | Kappa 63.5% / YOU 36.5% |
| 0.60 | 38.1 | 0.14887 | 0.15279 | 0.15714 | **263.4 bp** | Kappa 63.5% / YOU 36.5% |
| 1.00 | 38.1 | 0.14158 | 0.14816 | 0.15546 | **465.0 bp** | Kappa 63.5% / YOU 36.5% |

`0.635·C_Kappa + 0.365·C_YOU` is `Σwᵢ·Cᵢ(k)` with `wᵢ>0, Σwᵢ=1` — the hypothesis, verbatim. So §2's
"the mixture hypothesis is never instantiated" is **false above 38.1 BTC**. It is size-conditional and
I stated it unconditionally. That is my error, not a wording slip.

## Conceded — FLAG-OMISSION (3): book-level put–call parity breaks, and I never checked it

`C_ask(k) − P_bid(k)` vs the required `−k`, my own sweep, k ∈ [0.005, 0.60] step 0.005:

| D | worst residual | at k | $/BTC | share of strikes crossed |
|---|---|---|---|---|
| 0.00 | `0.000e+0` | — | $0 | **0.0%** |
| 0.15 | `−5.358e-3` | 0.005 | **−$352** | **100.0%** |
| 0.60 | `−2.346e-2` | 0.005 | −$1,541 | **100.0%** |
| 1.00 | `−3.950e-2` | 0.005 | −$2,595 | **100.0%** |

This is worse than the skeptic even framed it for my §4 story: the crossing is not a localized event
that arbitrageurs pick off — at **any** D>0 the book is inconsistent at **every strike tested**, and
the arbitrage is a **synthetic perp below the cleared perp**, i.e. against stage 0 of the closed loop,
not maker-vs-maker discipline. "Arbitrage keeps them in line" does not survive contact with a surface
that is arbitrageable everywhere at once.

## Conceded — FLAG-OVERSELL (5b): §3 and §4 are two different parameter worlds

The skeptic is right and I can confirm it from my own earlier run (`/tmp/who.js`): at the app's dial,
**MM-Kappa wins the ask at every strike** at D=0.15/0.6/1 — the winner never switches, so **build 12
exhibits no butterfly at all**. §3's crossing demo uses `S̄=0.30 vs 0.85`, far outside the dial's
`S̄ = 0.579–0.630`. I presented them as one story. They are not.

Also conceded: `0.000e+0` is my script's initialiser, not a measurement — the honest phrasing is
"no negative second difference found"; and the `−4.929e-5` butterfly is grid-dependent (the skeptic
measures `−8.9e-5` at a 40× finer grid), so it is a lower bound, not the value.

## Conceded — FLAG-WRONG (1): hypothesis ≠ conclusion

Correct title for the finding, adopted: **"L1's proof-hypothesis is not instantiated by the QUOTE
layer; L1's conclusion still holds — and the envelope is further from a single lens than the mixture,
and additionally arbitrage-bearing."** Not "not binding". §1–§5's framing is withdrawn.

## Conceded — FLAG-PROCESS (6a): my transcript context note

The entry-554 context note in `history/operator/` embedded my own contested conclusion next to the
operator's verbatim words. §2.2 allows a one-line **neutral pointer** only. Corrigendum filed in the
transcript; the original line is left in place per the no-edit rule.

## Where I do not simply fold — and it goes to the operator unreconciled

The skeptic's HALT item 2 frames the execution layer as a binary: winner-take-all (and map-2
apportionment dies) **or** split fills (and the mixture returns unprotected). I think that is the
right pair of options and I have no third. But **which one** is an operator-tier product call, not a
call I get to make, and it is now asked (skeptic HALT item 5, asked in the operator's own terms).

**Not done yet, tracked:** feature-inventory disposition block (HALT item 4), `bounded_disagreement`
§5 disposition (HALT item 3), tester pass on the app build (HALT item 6 — dispatched).

---

## SKEPTIC PASS
_(appended UNEDITED by the manager, per CLAUDE.md §2.1 / the Universal Skeptic Gate. HTML entities
from the relay decoded to their characters; no other change.)_

Attack run. All numbers below are my own re-derivation (Node, `vm` against `app/index.html` and against the closed-form engine lens), not the manager's.

---

## SKEPTIC PASS — `sims/RFQ_ENVELOPE_vs_MIXTURE_2026-08-14.md`
**skeptic, 2026-08-14 · VERDICT: HALT** (5 FLAGs). The L1 state flip may not be written into `CLOSED_LOOP_MAP.md` / `COMPONENT_REGISTER.md`, and build 12 may not be presented to the operator as a settled architecture, until the evidence at the bottom of this block is produced or the operator overrules me.

### CLEAR — what survived my attack (stated first, so the FLAGs aren't read as a blanket rejection)
Both scripts reproduce exactly on my machine (`−4.929e-5 at k=0.464`; the D-table to the last digit). The butterfly is **real, not a finite-difference artifact across a kink**: I swept `dk` from `1e-2` to `2e-4` and `worst/dk` is stable at `≈ −4.2e-2` (−1.161e-3/−5.879e-4/−2.297e-4/−1.078e-4/−6.150e-5), which is the linear-in-`dk` signature of a genuine slope jump of ~0.042, not noise. The manager cited `min_not_midconvex` *against his own position* and did not hide it; the self-correction ("my earlier common-level fix was wrong") is honest and the operator was right that an RFQ has no shared resting book. Credit given.

### FLAG-WRONG (1) — escaping the hypothesis is not escaping the conclusion
The note escapes `mixture_not_single_lens` by observing that `min` ≠ `Σwᵢ·Cᵢ`. True, and irrelevant. L1's *stated conclusion* — the one logged in `CLOSED_LOOP_MAP` — is "heterogeneous LP steepness generates a shape **the single-`m` lens structurally cannot represent**." I tested that conclusion on the theorem's own family (engine lenses `c(1+k)^(−g)`, level **and** shape differing, exactly what build 12's dial does: `c=0.16,g=3.0` vs `c=0.13,g=1.6`, crossing at k=0.1599):

| object | best single-lens fit, max rel. residual | log-log 2nd diff | butterfly (dk=2e-3) |
|---|---|---|---|
| mixture (50/50) | **5.30%** | +1.007e-4 … +1.960e-4 (the proved smile) | 0 (convex, **arb-free**) |
| **RFQ envelope** | **15.87%** | **−1.608e-2** at k=0.150 | **−2.297e-4** |

The envelope is **3× harder** for one lens to represent than the mixture, and its non-affineness is **two orders of magnitude larger**. The trade the note books as an escape is: *unrepresentable-but-arbitrage-free* → *unrepresentable-**and**-arbitrage-bearing*. That is strictly worse on both axes, not a lateral scope finding. "L1 → not-binding-under-RFQ" is false as written; the honest statement is "L1's proof doesn't apply; L1's conclusion holds a fortiori by an easier argument (min of two distinct log-affine functions is not log-affine)."

### FLAG-WRONG (2) — the mixture *is* instantiated, at the execution layer, in the manager's own build
This is the sharpest hole. §2's claim, in plain English: *"nobody ever has to average the makers, because the taker just takes the cheapest one."* False above 38.1 BTC, by the app's own code. `renderTransact` L472–475 and `calc` L318 fill an order **cheapest-first, each maker capped at `share·pool` with `share=(1/λᵢ)/Σ(1/λⱼ)`** — the apportionment result. At app defaults (pool 200, D=0.15) the cheapest maker MM-Kappa's cap is **38.1 BTC**, so:

| order size | executed avg ask @k=0.05 | vs top-of-book | weights |
|---|---|---|---|
| 38 BTC | 0.15693 | +0.0 bps | Kappa 100% |
| 60 BTC | 0.15791 | **+62.4 bps** | **Kappa 63.5% / YOU 36.5%** |
| 150 BTC | 0.15899 | +131.6 bps | Kappa 25.4% / YOU 63.5% / Sigma 11.1% |

`0.635·C_Kappa + 0.365·C_YOU` **is** `Σwᵢ·Cᵢ(k)` with `wᵢ>0, Σwᵢ=1` — the hypothesis, verbatim. So the note's central claim is *size-conditional* and is stated unconditionally. Worse: these weights are **size-dependent, and strike-dependent whenever the ask winner switches** — and `BOOK_FORMAL.agg`'s own docstring says exactly why that is not safe: *"a pointwise-varying weighting is not a convex combination in function space and can lose convexity."* The executed book therefore satisfies the hypotheses of **neither** protection theorem (not `agg_midconvex`, not single-lens). §5's dismissal — "the apportionment result … is a definition plus its transported form, unaffected either way" — answers a question nobody asked (is it a theorem?) instead of the one that matters (does the fill mechanic blend?). It does.

### FLAG-OMISSION (3) — book-level put–call parity `C−P=−k` breaks, and the note never mentions it
Parity is the loop's anchor to the cleared perp (`CLOSED_LOOP_MAP` stage 1, `BOOK_FORMAL`'s entire framing: "the anchor is public, the extension is private"; `agg_parity` proves parity survives **aggregation** exactly). There is no analogue for min/max, and it fails. Buying the book's best call ask and hitting the book's best put bid at the same strike, residual vs `−k`:

| D | worst parity residual | at k | $/BTC | fraction of strikes crossed, k∈[0.005,0.60] |
|---|---|---|---|---|
| 0.15 | −5.358e-3 | 0.005 | **−$352** | **100.0%** |
| 0.60 | −2.346e-2 | 0.005 | −$1,541 | 100.0% |
| 1.00 | −3.950e-2 | 0.005 | −$2,595 | 100.0% |

Two things the note hides. (i) The arb is **not maker-vs-maker discipline** — it is a synthetic perp available below the cleared perp price, i.e. an arb against **stage 0 of the closed loop**, the hedge venue the whole design hangs off. (ii) The note's §4 table reads as if crossing is a localized event; in fact at **every** D>0 the book is crossed at **100% of strikes tested**. "Arbitrage keeps them in line" is not a discipline story when the entire surface is arbitrageable at once; that is a book with no consistent price anywhere.

### FLAG-OMISSION (4) — the one theorem actually about "makers free to differ" is skipped, and the whole inventory is missing
`BOOK_FORMAL §5 bounded_disagreement` is the corpus's only formal statement permitting per-LP levels — and it permits them **only** under `|Pᵢ−Pⱼ| < hᵢ+hⱼ`. Build 12's dial deliberately violates that hypothesis; "ARB OPEN" *is* the violation. The note cites §4 against itself but never mentions §5, the one place the design could have been given a condition to satisfy. Steelman I owe the manager: *"§5 shows the formal work itself contemplates keeping per-LP levels, so per-maker curves are not forbidden."* Correct — and it is precisely §5 that build 12 breaks. Per-LP levels with **unbounded** disagreement is a third option no theorem in this repo protects.

Separately, the note carries **no `docs/feature_inventory.md` disposition block at all**, while performing a state flip on a registered obstruction about the pricing family. Silently absent and load-bearing: **#3 kurtosis knob m** (operator-ruled entries 229/231 as a *single scalar*; "makers free to differ on shape" makes it N knobs — nobody says so), **#1/#2/#16** (a dealer RFQ network has no curve-warp AMM in it; "nothing is wired into the engine" is true and is exactly the omission — it does not say what the engine's `m` is *for* once the book isn't priced by one lens), **#6/#8** (my fit gives the book an effective `g=2.96` that is no maker's exponent, at 15.87% residual), **#7** (each maker has its own `g` ⇒ its own smooth-paste seam `S*=Kg/(g+1)` ⇒ N seams, envelope kinks at seams as well as crossings), **#9/#4/#5**, **#13** (the crossed-book loss is a new negative P&L term for the losing maker — up to **$2,506/BTC at D=1** — absent from the v5 economics and from L4), and the entry-521 fairness gap ("pay is set by another LP's quote") which a min-ask envelope makes *strictly worse* by handing the most aggressive maker the **level** too, not just the spread. `CLOSED_LOOP_MAP` stage 2→3 ("N LP curves → ONE arb-free book → priced by engine v28") is dissolved by this note without a single word about what replaces it.

### FLAG-OVERSELL (5) — labels, and the demo that isn't the build
(a) **"Newly open (L1′) … Unmodelled … a market-discipline event."** It is not open — it is *proved*: `min_not_midconvex` + `nonconvex_level_arbable_at_zero_spread` (a non-convex level is a **strict** arbitrage at competitive spread). Re-logging a proved arbitrage as an open research item and softening it with an adjective the operator used about something else is an evidentiary downgrade in the wrong direction. The dynamic that is supposed to close it — "someone takes it, the loser re-quotes" — has **zero** evidence in the note and is unmodellable in build 12, where `D` is an exogenous dial with no re-quote dynamics: the arb can never close on screen.
(b) **§3's demo parameters are outside build 12's own range.** §3 uses `S̄=0.30` vs `0.85`; the app at maximum divergence `D=1` spans `S̄=0.579–0.630`, `γ=1.749–1.897` — 20–60× tighter. At the app's own dial the ask winner **never switches** (0 switches over k∈[0.005,0.60] at D=0.15/0.6/1; MM-Kappa wins throughout), so **build 12 exhibits no butterfly at all** (envelope butterfly = 0.000e+0 at D=0.6, my measurement). §3 and §4 are two different parameter worlds presented as one story; the reader concludes build 12 demonstrates L1′, and it does not.
(c) `"worst butterfly 0.000e+0 (convex)"` for A/B/mixture is the script's initialiser (`let wm=0`), not a measurement; the honest line is "no negative second difference found." And `−4.929e-5` is grid-dependent — the note's scan steps by `dk`; stepping finer gives **−8.449e-5** (`dk/4`) and **−8.905e-5** (`dk/40`) at the same `k`. Understated ~1.8× and presented without the grid caveat.
(d) `"$343 / BTC"` etc. are **top-of-book** figures presented per-BTC as if they scale; per FLAG-2 they decay above 38.1 BTC.

### FLAG-PROCESS (6) — a one-line remark converted into an architecture decision, and no tester anywhere
The operator's entry 554, in full, is: *"if you think about this calmly since its an rfq and not an ob the makers can be free to differ and arbitrage keeps them iine right"* — a question, about **crossing and discipline**. It says nothing about aggregation mechanics. Against it stand the operator's own words on the mechanism: entry **522**, never retracted — *"so LPs are free agents they specify their own curve parameters that **the pool aggregates** to for better or worse"* — and entry **555**, the operator's very next message (committed after the note, in the record now) — *"so the aggregate curve is nontrivial aggregation / more like density heatmap its basically from pov of someone whose making a trade **where it will land them**"*. The operator is asking for the blended, landed-at-size object one message after the note declares that no blended object exists. The note is not reconciled with either. This is the entry-476 pattern repeating: an operator adjective ("arbitrage keeps them in line") load-bearing a structural conclusion the operator never stated. Two further process defects: the manager's **context note at entry 554 in `history/operator/` embeds his own contested conclusion** ("derived the consequence: the proved smile obstruction … does NOT bind in an RFQ") inside the verbatim transcript — §2.2 requires one-line *neutral pointers*, not the manager's claim sitting next to the operator's words; and there is **no tester pass on any `app/` build 9–13**, though build 12 adds a knob the operator is explicitly told to turn (app L171: "Drag *maker divergence* to see it open and close") and flips a state label. The standing UI smoke-pass rule (skeptic-ruled 2026-06-11, CLAUDE.md §8) binds on *any operator hand-back*. Empirical proof it is binding here: the operator personally caught four UI defects in entries 550–553 — he is doing the tester's job.

### HALT — what would satisfy me
1. **Re-title the finding honestly.** L1 goes to *"proof-hypothesis not instantiated by the quote layer; conclusion still holds — the envelope is 3× further from a single lens than the mixture (15.87% vs 5.30%) and is additionally butterfly-arbitrageable."* Not "not binding."
2. **Disposition the execution layer.** Either (i) state as a product rule that **every fill is winner-take-all** and accept that map-2 apportionment (`1/λ_agg=Σ1/λᵢ`, depth aggregation, per-LP fill shares, the whole entry-520/521 fairness line) is **dead** — and say so out loud; or (ii) accept split fills and accept that the mixture is instantiated above the top maker's cap, with the weights strike- and size-varying, protected by no theorem.
3. **Book-level parity measured and logged**, with the residual stated as an arb **against the cleared perp**, plus a disposition of `bounded_disagreement` (§5) — the condition build 12 breaks by design.
4. **A `docs/feature_inventory.md` disposition block**, items 1–16, especially #3 (one `m` or N?), #7 (N seams), #13 (the loser's bleed in the LP economics), and what prices `CLOSED_LOOP_MAP` stage 3 now.
5. **The operator asked, in plain English, before any of this is written into shared truth:** *"Should each market maker be allowed to quote a completely different price for the same option, so that at times one maker's buy price is above another's sell price — meaning a trader can buy from one and instantly sell to the other for a risk-free profit, paid by the maker who is out of line? At the settings currently shipped that happens at every strike, and is worth up to $2,506 per BTC."* That is an operator-tier product call (it is the same class as "each LP picks its own curve"), and it has not been asked.
6. **A tester pass on the app build** before the next operator hand-back.

Numbers in this block are reproducible from `/home/user/Perp-Options-AMM/sims/scripts/*.js` (unmodified) plus my own harnesses in the session scratchpad: `skept.js` (log-log/fit/dk-scaling/parity sweep), `skept3.js` (engine-lens decisive test), `skept4.js`/`skept6.js` (execution-layer blend). Repo untouched apart from `.claude/agent-memory/skeptic/MEMORY.md`.
