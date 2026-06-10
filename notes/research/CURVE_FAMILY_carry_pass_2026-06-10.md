# Curve-family carry pass (#4) — carry on the (W) warp curve

_research-lead, 2026-06-10. Notes-only theory pass; **NO engine edit, NO submit, NO git**. Authorized
by skeptic ruling `notes/skeptic/VERDICT_DELEGATED_DECISIONS_2026-06-10.md` item C: dependency order
**#4 carry FIRST** → then {#5 rebase, #9 funding, #11 dollar pipe} in parallel → #16 last. This pass =
**#4 carry ONLY**. Target spec `specs/SPEC_kurtosis_curve_family_TARGET.md` (settlement = LOCKED
Reading A). Curve = the √-kernel invariant of `notes/research/CURVE_FAMILY_derivation_2026-06-10.md`
(+ its CORRECTION HEADER). Numerics: python3 + numpy/scipy float64; scripts `/tmp/carry_W.py`,
`/tmp/carry_W2.py` transcribed inline so the manager re-derives. Every claim tagged
**[analytic]** / **[numeric]** / **[needs-Aristotle]**. Skeptic gets this verbatim before any merge._

---

## 0. The locked contract being tested, and the standing trap
**Locked contract (CLAUDE.md §4, feature_inventory #4):** carry `P = Ny/Nx`; pricing coordinate
`u = log(price) − log P`; on plain Balancer `u` is a clean affine log-price coordinate (`dq/du = 1`,
the gauge coord `s = u − μ` is forced).

**The skeptic's standing trap** (`VERDICT_KURTOSIS_KNOB_2026-06-10` §4 line 92;
`VERDICT_CURVE_FAMILY`): on (W) the note's `u` is `ln(y/x)` **recentered**, and the
heterogeneous-weight slope law gives **`dq/du = 1 + w′/(w(1−w)) ≠ 1`**. So `u` **cannot** be the clean
`log price − log carry` it is on Balancer. This pass tests the contract against that trap and does
**not** assume it transfers.

**β=1, not β=0:** all engine-pin checks below are computed at the engine pin **β=1** (GH installs the
kernel in the latent score), never the symmetric β=0 slice (skeptic standing instruction).

---

## 1. What carry and the carry-relative coordinate ARE on (W)

### 1.1 The two distinct objects `u` and `q` (this is the whole story)
On a Balancer-type curve with a **position-dependent weight** `w(u)`, the marginal price is, by
definition (HETEROGENEOUS_WEIGHT note eq ★),

> `p(u) = (w(u)/(1−w(u))) · (y/x)`,  with `u := ln(y/x)` the **reserve-ratio** log-coordinate.

Taking logs and using the depletion ODE `d ln X/du = −(1−w)`, `d ln Y/du = +w`:

> **`q(u) := ln p(u) = u + ln( w(u)/(1−w(u)) ) + C = u + ln γ_loc(u) + C`**  (★)

where `γ_loc(u) = w(u)/(1−w(u))` is the curve's local pricing exponent. **[analytic]** — this is the
exact first-integral identity, no quadrature (the warp note's ★/★★, re-derived here).

There are therefore **two different log-coordinates** on (W):
- **`u = ln(y/x)`** — the *reserve-ratio* leg. This is what the (W) derivation note calls `u`.
- **`q = ln p`** — the *pricing/log-price* leg. The locked contract's `u = log price − log P` is a
  statement about **`q`**, not about the reserve ratio.

On **plain Balancer** `w` is constant ⇒ `ln γ_loc` is constant ⇒ `q = u + const` ⇒ the two legs
coincide up to a shift, and "`u = log price − log carry`" is exactly true. **On (W) the warp term
`ln γ_loc(u)` is u-dependent**, so the two legs *split*.

### 1.2 `dq/du ≠ 1` — the trap, confirmed [numeric]
Differentiating (★):

> **`dq/du = 1 + w′(u)/(w(1−w))`,  `w′(u) = (Δw/2)·τ²/(τ²+u²)^{3/2}`**  (★★) **[analytic]**

This is `> 1` everywhere `w′ ≠ 0`, peaks at the elbow center, and `→ 1` only in the frozen wings.
Measured (`/tmp/carry_W.py`, `w_mid=0.7, Δw=0.2`):

| τ | `dq/du` at u=0 (elbow) | peak `dq/du` (grid) | `dq/du` at \|u\|=3 (wing) |
|---|---|---|---|
| 0.05 | 10.52 | 10.52 @ u≈0 | 1.0001 |
| 0.08 | — | 6.99 @ u≈0 | — |
| 0.30 | 2.59 | 2.60 @ u≈0 | 1.0020 |
| 1.00 | 1.48 | 1.48 @ u≈0 | 1.019 |

So on (W) **the clean Balancer carry identity `dq/du ≡ 1` is FALSE in the ATM elbow** — by a factor of
2 to 11 at the center for realistic τ — and recovers only deep in the wings. **[numeric]**

### 1.3 The TRUE carry coordinate on (W)
Decompose (★): `q(u) = u + ln γ_loc(u) + C`. The warp correction `ln γ_loc(u)` is a **bounded
sigmoidal step** from `ln γ₋` (put wing) to `ln γ₊` (call wing) — NOT a constant. **[numeric]**
(`/tmp/carry_W2.py`, params `w_mid=0.7, Δw=0.2, τ=0.3`): `ln γ_loc` runs `0.405 → 0.847 → 1.386` over
`u: −∞ → 0 → +∞`, asymptotes matching the analytic wing limits `ln γ₋ = ln 1.5 = 0.4055`,
`ln γ₊ = ln 4 = 1.3863` to 1e-4; the total warp step is `ln(γ₊/γ₋) = 0.9808`.

**The clean carry coordinate is the pricing leg `q = ln p` itself**, recentered at the carry anchor
`q* = ln P`. The reserve-ratio `u` is **not** that coordinate — it differs from it by the
u-dependent warp step `ln γ_loc(u)`. Equivalently:

> **True carry coordinate** `= q − q* = (u − u*) + [ ln γ_loc(u) − ln γ_loc(u*) ]`.

The bracket is the (W)-specific correction; it vanishes identically only on the wings or for constant
`w`. So "carry-relative log-price" remains well-defined (it is `ln p − ln P`), but it is **no longer
equal to the reserve-ratio coordinate `u`** the way the locked contract reads on Balancer.

### 1.4 The carry anchor `P = Ny/Nx` — is it still the mode/anchor?
`p = P` requires `(w/(1−w))·(y/x) = Ny/Nx`. At anchor reserves (`y/x = P`) this holds **iff
`w/(1−w) = 1`, i.e. `w = ½`**. **[analytic]**, confirmed **[numeric]** (Test 2): `w_mid=0.5` ⇒
`p/(y/x) = 1.000` at the kernel center; `w_mid=0.7` ⇒ `2.333 ≠ 1`. Consequences:
- `P = Ny/Nx` is still a well-defined **reserve-ratio anchor** (it labels a reserve state).
- But on (W) the weight is a **field**, so the **reserve anchor (`y/x = P`)** and the **price anchor
  (`p = P`)** generically **DECOUPLE** unless `w(u_P) = ½`. They coincide only at the symmetric setting
  `w_mid = ½` AND with the elbow centered at the anchor (the skew-center, set by trading — #16).
- "Anchor `w = ½`" — the funding/rebase reference — is therefore **ambiguous as stated** for a warp
  family: it is a *single point* `u_½` where `w(u_½) = ½`, not a global property of the curve.

---

## 2. VERDICT: does the locked carry contract transfer?

**THE LOCKED CARRY CONTRACT DOES NOT TRANSFER CLEANLY TO (W). — operator decision.**

- **Carry constant `P = Ny/Nx`: TRANSFERS** as a reserve-ratio anchor (well-defined). **[analytic]**
- **`u = log price − log P` with `dq/du = 1`: DOES NOT TRANSFER.** On (W), `dq/du = 1 + w′/(w(1−w))`,
  which is 2–11× at the elbow for realistic τ and `→1` only in the wings (§1.2). The reserve-ratio
  `u = ln(y/x)` and the log-price `q = ln p` are **different coordinates** on (W); the clean Balancer
  identity `q = u + const` breaks by the bounded sigmoidal warp step `ln γ_loc(u)` (§1.3). **[analytic +
  numeric]**
- **The true carry coordinate** is the **log-price leg `q − ln P = ln(p/P)`** (NOT `ln(y/x)`); it is
  `(u − u*)` plus the u-dependent warp correction `[ln γ_loc(u) − ln γ_loc(u*)]`. **[analytic]**

This is exactly the skeptic's #4 slip, now derived and quantified rather than asserted.

### 2.1 β=1 engine honor — why this is a (W)-curve fact, not an engine regression
On the **live engine (GH, β=1)** the carry contract is *clean*: GH's Esscher slope law gives
`ln|dy/dx| = u + ln(Ny·M/Nx)`, whose warp correction `ln(Ny·M/Nx)` is **u-INDEPENDENT** ⇒
`d ln(slope)/du = 1` **exactly** ⇒ `u = log price − log carry` holds (Test 4: `max|dq/du − 1| = 0`).
**[numeric, β=1]**. The non-transfer is a property of the **(W) weight curve specifically** — GH puts
the kernel in the latent score (constant warp correction), (W) puts it in the weight (u-dependent warp
correction). This is the same kernel-in-SCORE vs kernel-in-WEIGHT distinction the skeptic established;
it is **not** a regression of the shipped engine.

---

## 3. Consequence for the dependents (#5 rebase, #9 funding) — NOTED, NOT worked

This pass does not work #5/#9. What carry pins for them:

- **#9 Funding (slope-deviation vs the `w=½` anchor).** The "`w=½` anchor" is now a **single point
  `u_½`** (where `w(u_½)=½`), not a global slice — and on a skewed (`w_mid≠½`) curve `w=½` may not even
  be in range. Funding must be re-defined as slope-deviation **in the true carry coordinate `q=ln p`**,
  against an explicitly chosen anchor (reserve-anchor `p=P` vs weight-anchor `w=½` are now different
  points). The `dq/du≠1` Jacobian enters any slope-deviation measured in `u` vs in `q`. **Flag for the
  #9 pass: pin which anchor funding references before re-deriving.**

- **#5 Rebase (`P→P/r`, `θ→θ/r`, anchor `w=½`).** Rebase is a multiplicative shift of carry
  `P→P/r`, i.e. `ln P → ln P − ln r`. In the **true carry coordinate `q − ln P`** this is the clean
  boost `q − ln P → q − ln P + ln r` (covariant), because `q` is the genuine log-price. **But** if
  rebase is implemented as a shift in the **reserve-ratio `u`** (as on Balancer, where `u=q−const`),
  the u-dependent warp step `ln γ_loc(u)` means the shift does **not** commute with the warp — the
  elbow does not rebase rigidly. **Flag for the #5 pass: rebase must act on the price leg `q`, and the
  strike-ray/anchor relocation through the warp must be re-checked (the skew-center `φ` from #16
  interacts here).**

Both dependents inherit one structural fact from this pass: **work in `q = ln p`, not in `u =
ln(y/x)`**, and pin the anchor (reserve `p=P` vs weight `w=½`) explicitly — they no longer coincide.

---

## 4. Analytic / numeric / needs-Aristotle ledger
- **[analytic]** the ★ identity `q = u + ln γ_loc + C`; ★★ `dq/du = 1 + w′/(w(1−w))`; wing limits of
  `ln γ_loc`; `p=P ⇔ w=½` at anchor reserves; GH β=1 warp-correction is u-independent.
- **[numeric]** `dq/du` table (Test 1/5: 10.52/6.99/2.60/1.48 peaks); warp step `ln(γ₊/γ₋)=0.981`;
  wing-limit match to 1e-4; GH β=1 `max|dq/du−1|=0` (Test 4); anchor decoupling `2.333≠1` (Test 2).
- **[needs-Aristotle]** NONE this pass — no obligation is ready (the contract change is operator-tier,
  not a Lean obligation yet). A future obligation would be a **carry-covariance lemma in the `q`
  coordinate** (rebase boost cancels in `q − ln P`), but only after the operator rules on the
  coordinate/anchor; statement PROPOSED, not assumed. No submit this pass.
- Nothing here is **trusted-from-prover** or **verified**.

---

## 5. Inventory disposition (`docs/feature_inventory.md` #1–#16)
| # | Feature | Disposition |
|---|---------|-------------|
| 1 | Balancer base | **Considered** — `dq/du≡1` is exactly the constant-w base; (W) reduces to it for `w′=0` / on the wings (§1.1). |
| 2 | Curve warp (position-dependent weight) | **Considered** — the carry coordinate is derived ON this warp (the √-kernel invariant); no overturned claim re-asserted. |
| 3 | Kurtosis knob τ | **Considered (incidental)** — τ sets the elbow width and hence how far from carry the `dq/du≈1` recovery sits (Test 5: peak `dq/du` grows as τ↓). Not the subject; not re-derived. |
| 4 | **Carry `P=Ny/Nx`, `u=log price−log P`** | **Considered — VERDICT: DOES NOT TRANSFER (operator-tier).** `P` transfers as reserve anchor; `dq/du≠1` so reserve-ratio `u≠` log-price `q`; true carry coord is `ln(p/P)` = `u`-leg + warp step `ln γ_loc(u)` (§1–§2). β=1 engine honored (clean on GH, breaks on (W)). |
| 5 | Rebase (`P→P/r`, `θ→θ/r`, anchor `w=½`) | **Noted, NOT worked** — must act on the price leg `q`; rigid-rebase fails on `u` because the warp doesn't commute with the shift; anchor `w=½` is now a point. Flag (§3). Sequenced next-parallel. |
| 6 | Pricing law value∝S^(−γ) | **N-A this pass** — settlement is LOCKED Reading A (spec); not re-opened here. |
| 7 | American smooth-pasting (the GATE) | **N-A this pass** — RESOLVED by Reading A (spec); carry pass does not touch it. |
| 8 | Uniform strike registration θ=sNorm(K) | **Noted (downstream)** — registration must use the true carry coord `q`; `dq/du≠1` means a strike's `u`-position and `q`-position differ. Flag carried; not worked. |
| 9 | Funding = slope-deviation vs w=½ anchor | **Noted, NOT worked** — anchor `w=½` is a single point not a slice; funding must be defined in `q`; `dq/du` Jacobian enters. Flag (§3). Sequenced next-parallel. |
| 10 | Slippage basis mpGeom=getMP_raw·e^(−ghMu) | **N-A this pass** — engine-coordinate; no engine math touched. |
| 11 | Dollar/settlement pipe | **N-A this pass** — no dollar path proposed (§6 HARD-STOP respected). Sequenced next-parallel; carry pins that the dollar leg references `q=ln p`, not `u`. Flag carried. |
| 12 | THE gotcha (getMP_raw is price, not slope) | **N-A this pass** — engine-coordinate; flag carried for any build. |
| 13 | Solvency boundary (B1) | **Excluded(why)** — extrinsic floor, operator ship-gate; carry coordinate does not close it. |
| 14 | Esscher tilt / latent rapidity group | **Considered (negative, consistent)** — the Esscher slope-law `d log slope/du=1` holds on GH (β=1, §2.1) but FAILS on (W) (`dq/du≠1`) — this IS the non-transfer mechanism (skeptic-consistent). |
| 15 | File-safety gate | **N-A this pass** — no HTML/blob edit; theory note only. |
| 16 | Warp-with-trades (skew-from-trading) | **Noted (interaction)** — the skew-center `φ` (trade-induced angle shift) relocates the elbow, hence relocates where `dq/du≈1` and where the price/reserve anchors decouple; rebase/funding anchors interact with it. OPEN/UNIMPLEMENTED, operator-tier; not worked. |

No silent absences.

---

## 6. Flags for the operator (via the manager)
1. **LOCKED CONTRACT DOES NOT TRANSFER — operator decision.** Feature #4's `u = log price − log P`
   with `dq/du = 1` is a Balancer identity that **breaks on the (W) warp curve**: `dq/du = 1 +
   w′/(w(1−w))` (2–11× at the elbow). The carry *constant* `P=Ny/Nx` survives; the clean *coordinate
   identity* does not. The fix (use the price leg `q=ln p` as the carry coordinate) is a coordinate
   redefinition the operator must ratify before #5/#9/#11 build on it. **Not papered over.**
2. **Reserve anchor vs price anchor DECOUPLE on (W)** unless `w=½` at the anchor. "Anchor `w=½`" is now
   a single point, not a curve property — funding/rebase must pin which anchor they reference.
3. **β=1 honored:** the non-transfer is a property of the (W) **weight** curve; the shipped **GH
   engine (β=1)** still has clean carry (`max|dq/du−1|=0`). No engine regression is claimed.
4. **Downstream pin:** #5 rebase, #9 funding, #11 dollar pipe (the next-parallel batch) and #8 strike
   registration must all work in the **price coordinate `q = ln p`**, not the reserve-ratio `u`. This
   is what carry pins for them; they are NOT worked this pass.
5. Curve/invariant choice and the coordinate ratification are **operator-tier**; this note
   characterizes carry, it does not pick the curve. No engine/git/submit this pass; nothing
   trusted-from-prover or verified.
