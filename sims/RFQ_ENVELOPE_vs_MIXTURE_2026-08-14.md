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

## SKEPTIC PASS
_(appended unedited below by the manager, per CLAUDE.md §2.1 / the Universal Skeptic Gate.)_
