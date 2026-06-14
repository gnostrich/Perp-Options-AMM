# ORIENTATION.md — Temporal Exchange deep context

Read after `STATE.md`. This is the "why," the math, and the map of what was learned.
It distills a long research arc; the chat-era detail lives in `history/` and
`/mnt/transcripts/` (indexed by `history/transcript_journal.txt`).

---

## 1. The economic object

Temporal prices a continuum of perpetual options off **one** dynamic-weight CFMM. Key
structural claims, all examined at length:

- **Continuum of strikes.** A single weighted constant-product curve carries OTM→ITM
  option exposure across a continuum of strikes, rather than one pool per strike.
- **Funding orthogonal to intrinsic.** Funding is a function of the curve's slope
  deviation from the anchor at the strike ray — *not* of intrinsic value. The two are
  structurally separate. Anchor stays at w=½; the strike ray shifts with rebase (θ→θ/r).
- **Mark reads only ratios.** `mark(wing, θ, sNorm)` takes ratios (`sNorm = X/α`,
  `θ = K/oracle`), so it is **rebase-invariant by construction**, independent of curve
  shape. Rebase-invariance is therefore *orthogonal* to the curve — a recurring
  correction: the curve shape and rebase live on different axes.
- **Smooth-pasting (ITM/American direction).** Replacing a hard ITM cap at the strike
  with smooth-pasting (value-match + slope-match at a free boundary) uniquely fixes both
  the curve coefficient and the boundary, killing free parameters. Closed form from the
  GH setup: `sNorm* = θ·((γ+1)/γ)^γ`, `S* = K·γ/(γ+1)` — the handoff falls *below* the
  strike, where the curve tangentially meets the intrinsic payoff line. (This is the
  intended product direction per the broader notes; not all of it is in the Lean yet.)
- **GH over Balancer.** Balancer-style (weight-form) curves cannot reach γ>1 (they need
  an exponent outside (0,1)); the GH / power-sum family (q=(γ−1)/γ) can. The engine's
  active engineering thread is swapping the barrier/Balancer curve for GH.

## 2. The dynamical object (port-Hamiltonian / passivity)

The protocol was recast as an **open, passive** dynamical system — the framing the Lean
scaffold encodes:

- **Storage = pool equity** (reserves − obligations), a real tank. *Not* built from
  funding; funding is a flow, not the storage. (An earlier "integrability crisis" — the
  funding 1-form not being closed — dissolved once we saw funding isn't the gradient of
  storage, so its non-closure is fine.)
- **The trinity:** oracle = **drive** (its absolute level is gauge, drops out like
  rebase); funding = **conservative spring / sensor** on the dislocation (the well
  `S − ln S`, bounded below); arbitrage = the **dissipative damper** (the LVR leak —
  this, not funding, is the damper; an early error corrected).
- **No kinetic energy.** No inertia → no ringing/overshoot; latency is capacitive (RC),
  not inductive. The system is **open** → the right invariant is **passivity** (bounded
  storage, ports accounted, one-way dissipation), *not* conservation. Driven overdamped
  spring-damper → dissipation inequality `dH/dt ≤ supplied` → solvency.
- **Flow ≠ energy.** Arb *flow* ∝ ε (first order in mispricing, large with depth) but
  *dissipation* (LVR) ∝ ε² (bounded). Large flow, tiny net energy; the ledger is fine.
- **Universal short-gamma.** LP reserve value is concave in price for *any* valid convex
  curve. So convexity is always synthetic/funded — no invariant escapes it.

## 3. The interface stack (the heart of the formal work)

The scaffold's purpose, in the operator's words: **the math propagates consistently
across all interfaces — a change at any seam is forced consistent at every other.** The
stack, each layer reading **only** the contract of the layer below (never reaching past):

```
Curve            (AMMCurve: invariant)        → exposes a price + a trade-solve
  ↓
Pricing          (sNorm, mark)                → reads only the curve's price
  ↓
Value/settlement (intrinsic = poolValue − O)  → reads only the mark/value
  ↓
Storage + ports  (equity = intrinsic+support) → reads only the value/flows
  ↓
Guarantees       (passivity, solvency)        → reads only the storage interface
```

- Change the curve → a new price falls out → pricing re-derives (it only read "a price")
  → value re-derives → storage updates → guarantees hold (the passivity scaffold is
  blind to everything below). Propagation is automatic *and* type-forced.
- **The self-sandwich bug was exactly an interface violation:** settlement reached *past*
  its contract into the raw, self-displaced pool instead of consuming the clean price.
  The discipline (each layer reads only the interface below) is precisely what forbids
  that bug class. So the scaffold both propagates consistency and prevents the bug.

### What the types do and do NOT force
- **Do:** force you to *supply and prove* every obligation a contract names; Lean won't
  accept wrong calculus where it's an obligation; you can't skip what the contract demands.
- **Do not:** *perform* the calculus for you, and only force what's *encoded* — contract
  completeness is on us. Today the curve seam and the storage seam are typed; the
  internal price-derivative obligation enters only if a finer price→value contract is built.

## 4. Formal architecture (formal/, as built)

- **AMMCurve.lean** — the validity gate (a curve must prove monotone/convex/coercive or
  it cannot instantiate) + the universal short-gamma bridge (`poolValue` = lower envelope
  of affine lines = concave in price) + `hedge_gap_concaveOn` (reserves − convex
  obligation stays concave = can't be hedged) + instances + free-transfer examples.
- **Temporal.lean** — abstract `PassiveSystem` (storage/ports/dissipation) with proved
  passivity/solvent/closed-cycle, and `TemporalAMM` carrying the engine obligations
  B1/B3/B4 as hypotheses, reduced to a PassiveSystem.
- **Seam.lean** — wires `poolValue` up into `equity`: `intrinsic_concaveOn` propagates
  short-gamma into storage; `CurvePool.equity = intrinsic(price)+support` makes B1
  visibly "the port covers the curve's concave deficit"; the join re-exports the
  guarantees; `reserves_have_no_floor` proves the port is necessary (reserves alone can't
  floor a convex claim). See `formal/MANAGER_VERIFICATION.md` for the claim-by-claim map.

## 5. Engine findings (empirical, against the real HTML engine)

From a headless Node bug-hunt driving the real engine's open/close paths (all
reproducible; harnesses were in the chat-era scratch):
- **Path-dependence:** opening bands B-then-A vs A-then-B swings total trader payout
  ~14%; driver is L0 and carved-entry-equity stamped at OPEN against position-dependent
  club state.
- **Self-sandwich leak:** a single net-zero-value band, opened+closed instantly with no
  oracle move between, pays the trader for only the fee — the open's own price impact
  displaces the pool and the un-reconciled close refunds it. Confirmed by sign-flip:
  inserting an arb-reconcile before close flips the payout negative (trader correctly
  pays), the difference equal to the open slippage. Real fix = settle the close against
  the oracle/anchor-frame mark, not the live displaced pool (a localizable close-side
  change). PARKED; only atomically reachable under continuous arb (standard MEV class).
- **Tank-never-negative is still open/empirical** — not enough sims run to know if the
  equity tank ever goes negative in the wild.

## 6. Solvency stance (settled with operator)

Two ways the pool can fall short: **WAY-1** (pricing/internal — does funding correctly
price the convexity it can't hedge; the closed-book identity) and **WAY-2** (external
leak — fees vs LVR). Decision: **WAY-1 is what we prove; WAY-2 is an assumption** resting
on extrinsic factors (an external perp-dex hedge that tracks and pays, plus a fee policy
covering LVR, plus continuous arb pinning the pool). Accepted givens (document, don't
prove): low-vol/continuous-move (jumps scoped out + tail buffer); the hedge works; fees
cover LVR; continuous arb pins the pool. `reserves_have_no_floor` is the formal shadow of
this: it proves the hedge/port is *necessary*; its *sufficiency* is the WAY-2 assumption.

## 7. Key learnings (carry these)
- Smooth-pasting replaces the hard ITM cap and removes free parameters; the free boundary
  falls below the strike.
- GH calibration needs all three conditions; fixing Nx from X₀ and Ny from Y₀ leaves no
  freedom for the price condition — root cause of the earlier barrier-curve calibration
  failure.
- Carry P (= Ny/Nx) is orthogonal to intrinsic; funding is curve-slope deviation.
- `reserves_have_no_floor` ⇔ "convexity must be funded," now at the storage interface.
- Performance (engine): direct GH integration is UI-blocking (~40ms/call); a shape-keyed
  table cache cut `getMP_raw` to ~0.6µs with zero Bessel evals per trade; the pool carries
  only scalar `gh*` params and re-derives the table from a module-level cache.
- Catastrophic cancellation in GH: use direct upper-tail integrals, not `1 − F_β`.

## 8. Publication context
AFT 2026 submitted (notification ~July 15 2026). WINE 2026 and FMBC 2027 (the Lean
verification paper; OASIcs proceedings + JLAMP special-issue pipeline) targeted, plus
broader crypto-native / econ-CS / TradFi-quant tracks. **Singh et al.** (LVR as a
continuum of perpetual options) is the closest neighbor — the must-cite for any rebuttal
if AFT reviewers raise it.

## 9. Artifact/version map (read before touching the engine)
- `project/engine/temporal_mvp_LIVE.html` — the **May-28 mount snapshot** (the engine as
  it was when this package was cut). Per the broader notes the live working branch is
  `v25_gh` (GH curve swap), which may live in CTO staging or Google Drive, NOT here.
  **Confirm the actual current engine before editing** — version drift is real.
- `project/temporal_formal_spec.md`, `project/temporal_paper_draft.md`,
  `project/Temporal_Paper_AfT_2026_v6.docx` — spec + paper artifacts.
- `project/mvp_v5_brainstorm.md`, `project/rebasing_logic_note.md` — design notes.
- `project/recipe_html_blob_editing.md` — **the file-safety recipe; read before any
  engine edit** (blob anchors, script-parse checks).
- `history/` — archived session tree + transcript journal (chat-era; not canonical now).
