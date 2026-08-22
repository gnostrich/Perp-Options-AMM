# SPEC A16 — No-jump ATM position value (live portfolio mark continuity)

**Status:** READ-ONLY diagnosis + spec. No engine edit, no git, no agent-memory write. Skeptic audits after.
**Target build:** `engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `de28c937…`), the at-strike HEAD.
**Requirement source (R1):** operator transcript `history/operator/2026-06-10_kurtosis-curve-family-brief.md`
- **Entry 204** (2026-06-12 18:05): "…we have to close the actual slippage on options and **the no jump atm position value thing** too full loop closed".
- **Entry 207** (2026-06-12 18:15): "and no w atm thing needs a **clean theoretical and implementation close out**".

A16 = the LIVE PORTFOLIO MARK of a held leg must be continuous (no jump) as the underlying crosses
the at-the-money point / OTM↔ITM. **Distinct from C7** (R1/T1a): C7 is the SETTLE/exercise value+slope
continuity at the smooth-paste free boundary S\* (already proven, GROUNDED). A16 is the held-position
**mark** as the *live spot* sweeps through the strike — a different limit (see §4).

---

## 1. BOTTOM LINE (diagnosis first — the most important output)

**There is NO JUMP. A16 is ALREADY SATISFIED in value-continuity terms on the live engine.**
It needs **VERIFY + a locking gate + a continuity lemma to Aristotle** — **NOT a build, NOT an
operator decision.**

The held-position value path is `markLensed` (via `markEff`/`legValueUnified`/`pfComponents`), the
**smooth-pasted** continuation. As live spot (sNorm) crosses a strike θ, the mark is continuous to
machine precision on BOTH wings. There is a non-smooth **cusp** (a slope sign-flip, not a jump) at
the exact ATM point sNorm=θ where the lensed local exponent g_loc→0 — but **value is continuous
there** (max adjacent |Δ| → 0 with step size, no floor). The operator requirement is "no JUMP" /
"position value continuity" (entries 204/207) — that is met. The cusp is a smoothness (C¹) question,
flagged below as an OPEN sub-item for the operator, NOT a blocker for A16's stated close-out.

---

## 2. The live position-value path (traced)

Held-leg mark, single source, all read through ONE helper `markLensed` at the live reciprocal mode
`sNorm = getSNorm(state)` (entry 94/96 single-basis):

| layer | line | call | role |
|---|---|---|---|
| `markLensed(wing,θ,sNorm,g)` | ~1655 | — | the smooth-paste fraction: continuation `c·sNorm` for `sNorm ≤ sStar`, else intrinsic `1−(sNorm/θ)^∓1/g`. Value+slope continuous at sStar (C7). |
| `gLoc(state,θ,τ)` | ~1639 | — | live local exponent `g = γ·h′_τ(\|u\|)`, `γ=w/(1−w)` LIVE, `u=log(θ/sNorm)`. **g→0 as θ→sNorm (ATM).** |
| `markEff(state,wing,θ,τ)` | ~1943 | `markLensed(wing,θ,getSNorm,gLoc)` | per-barrier engine mark. **No hard ITM=1 branch** (comment L1941: "continuation runs PAST the strike… no hard ITM=1 saturation"). |
| `legValueUnified(state,wing,leg,τ)` | ~1951 | `N·(markEff(inner)−markEff(outer))` | engine per-leg value. |
| `pfComponents(...)` | ~4299 | `markLensed(wing,θ,sNormPool,gLoc(pool,θ,τ))` | **the live PORTFOLIO display mark.** `value = sign·N·m`. |

**Key structural finding (no branch-switch jump):** in `pfComponents` the `itm` flag (L4319) is
computed but only sets `effK` for **display** (L4324); the **value** (L4327 `part.sign·leg.N·m`) uses
`markLensed` **unconditionally**. There is NO `isOTM`/regime branch that swaps the value formula at the
crossing. The dollar mark = `(Σ sign·N·markLensed)·equity·L₀` is **linear in m**, so it inherits
`markLensed`'s continuity with no regime multiplier. (`isOTM`/`legIsITM`/`wingMember` gate EXECUTION
and DISPLAY-strike, never the mark value.) — verified `/tmp/a16_put_and_dollar.js`.

---

## 3. Numerics — IS THERE A JUMP? (re-derived on the live engine)

Scripts (live engine sandboxed via `vm.runInContext`, the lens_selfcheck pattern):
`/tmp/a16_diag.js`, `/tmp/a16_atm_zoom.js`, `/tmp/a16_leg_spread.js`, `/tmp/a16_put_and_dollar.js`.
Pool: x=10, y=80000, w=1/(1+sNorm) (so the live mode = swept sNorm; γ moves with w — faithful, spot
moves by trading which moves w), τ=0.3, strike ray θ=1.0.

**3a. Continuity across the crossing — no jump.** Refining the step across sNorm=θ:

| steps | dS | max adjacent \|Δ mark\| |
|---|---|---|
| 2,000 | 1.0e-5 | 3.87e-4 |
| 20,000 | 1.0e-6 | 4.64e-5 |
| 200,000 | 1.0e-7 | 5.40e-6 |
| 2,000,000 | 1.0e-8 | 6.17e-7 |

max |Δ| → 0 ∝ step. **A genuine jump would floor at a finite value; it does not. ⇒ CONTINUOUS.**
`legValueUnified` (call spread inner=1.0/outer=1.3) same result: max adjacent |Δ| = 2.2e-4 at dS=6e-6,
shrinking with step. Put wing identical (`/tmp/a16_put_and_dollar.js`: 2.27e-4 at dS=6e-6).

**3b. The ATM point (sNorm=θ=1.0): a continuous CUSP to 1.0.** g_loc→0 at ATM ⇒ markLensed→1 exactly:

| sNorm | g_loc | mark | note |
|---|---|---|---|
| 0.9999 | 3.33e-4 | 0.99690 | OTM side ↑ |
| 1.000000 | 0 | **1.00000000** | ATM peak |
| 1.0001 | 3.33e-4 | 0.99710 | ITM side ↓ |

Left dV/dsNorm ≈ **+46.4**, right ≈ **−44.4** → slope **sign-flip** (a cusp), value continuous.
Spike depth (1−mark just off ATM) shrinks with larger τ: 9.3e-2 @τ=0.05 → 3.3e-3 @τ=2.0.

**3c. ITM side keeps falling (smooth-paste, not the old flat saturation).** Lensed markEff on the
ITM side: 0.873 (sNorm 1.01) → 0.566 (1.1) → 0.497 (1.3), vs the OLD v24 hard mark = 1.0 flat. This is
the C7 continuation past the strike to S\* then intrinsic — the v24 ATM-jump gap is the one the lens
build already fixed (CLAUDE.md §8: "settle == lensed; the v24 ATM-jump gap fixed").

---

## 4. THEORY side — the continuity lemma (pinned, ready for Aristotle)

A16's NEW theory content is **NOT the S\* seam** (that is R1/T1a `valueMatch_A`/`slopeMatch_A`, GROUNDED;
ported to the lensed g as `valueMatch_g`/`slopeMatch_g`, SUBMITTED LENSKERNEL d7da8597, formal/INDEX.md
L106). A16's content is the **ATM limit where g_loc itself → 0**: continuity of the COMPOSITE
`M(sNorm) = markLensed(wing, θ, sNorm, gLoc(state(sNorm), θ, τ))` as `sNorm → θ`.

### Pinned predicates (all already defined in the engine subset / LENSKERNEL L2 defs)
- `mode := getSNorm(state) = (1−w)/w`, `w := α/x`, live; `γ := w/(1−w) > 1` (w>½).
- `u(θ) := log(θ / mode)`  (the single sNorm coordinate, MUST-APPLY-1, L1633).
- `h′_τ(z) := z / √(τ²+z²)`,  `g_loc := γ · h′_τ(|u|)` (L1639–1644). At u=0: g_loc=0.
- `markLensed`(call) `:= sStar=θ·((g+1)/g)^g; c=1/((g+1)·sStar); = c·sNorm if sNorm≤sStar else 1−(sNorm/θ)^(−1/g)`.
  (put mirror, L1655–1666). At g=0: `(g+1)/g→∞`, `((g+1)/g)^g→1` (pow handles it), so `sStar→θ`,
  `c→1/θ`, continuation `c·sNorm → sNorm/θ → 1` as sNorm→θ.

### Lemma A16-CONT (the statement to queue)
> **For each wing, the map `sNorm ↦ markLensed(wing, θ, sNorm, gLoc(state(sNorm), θ, τ))` is
> continuous at sNorm = θ, with both one-sided limits = 1, for every τ>0 and every live γ>1.**

Equivalent factored form (cleaner for Lean): define `G(s) := g_loc` as a function of `s=sNorm`
through `u=log(θ/s)`. Then (i) `G` is continuous with `G(θ)=0` and `G(s)→0` as `s→θ`; (ii) the
single-strike lensed mark `markLensed(wing,θ,s,G(s))` → 1 as `G→0⁺` AND `s→θ` jointly; (iii) hence
the composite is continuous at θ. (Mathlib: continuity of `√`, `log`, division away from 0, and the
removable behavior of `((g+1)/g)^g → 1` and `c·s → s/θ → 1` as g→0⁺.)

### Companion lemma (optional, the cusp's HONEST label) — A16-CUSP
> **The composite is continuous but NOT C¹ at sNorm=θ: the one-sided derivatives are equal in
> magnitude, opposite in sign (a cusp peaking at 1).** This is the formal statement of the §3b
> sign-flip. Queue ONLY if the operator wants the cusp on record; it is not required for "no-jump".

**Placement:** sits with the LENSKERNEL settlement port (`valueMatch_g`/`slopeMatch_g`, d7da8597) — same
`markLensed`, same lensed g — as the ATM-limit companion to the S\* seam lemmas. Forbidden-token scan +
standard-axiom check apply (research-lead's normal audit).

---

## 5. IMPL side — the locking GATE (the only build-side deliverable; no fix needed)

No fix: the value path is already the smooth-pasted `markLensed` with no jumping branch (§2). The
deliverable is a **HARD gate that LOCKS the continuity** so a future edit can't reintroduce a jump
(e.g. someone reinstating a hard `isOTM ? 1 : …` branch in the value path, the v24 regression).

**New gate `engine/verify/a16_atm_gate.js` (spec):**
1. **No-jump (HARD):** for wing∈{call,put}, γ∈{1.5,2,3,4} (w from γ), τ∈{0.1,0.3,1.0}: sweep sNorm
   across θ at dS and dS/10; assert `max adjacent |Δ markEff|` **scales with step** (ratio of the two
   maxima ∈ [~5,~50], i.e. NO fixed floor). Reject if max|Δ| fails to shrink (a jump).
2. **ATM peak (HARD):** `markLensed(wing,θ,θ,gLoc=0) === 1` exactly (both wings).
3. **Value-path-has-no-regime-branch (HARD, structural):** assert the engine value at an ITM point
   `markEff(state, 'call', θ, τ)` with sNorm>θ is `< 1` (smooth-paste), NOT the old flat `=1`
   (catches a reinstated hard-saturation branch).
4. **Cross-layer single-basis (HARD):** `pfComponents` mark == `markEff` per-leg mark at an unchanged
   state, to machine zero (the display companion equals the engine value — already a lens_selfcheck
   theme; assert it here keyed on the ATM-crossing strike).
5. SKIP-as-pass (exit 0) on a build without `markLensed`/`gLoc` (so non-lens builds stay green), the
   lens_selfcheck convention.

Auto-route in `engine/verify/run_all.sh` by the existing lens predicate
(`function markLensed` && !`function wField`), alongside `lens_selfcheck.js`.

Existing coverage to reuse, NOT duplicate: `lens_selfcheck.js` assert (4) already checks
`markLensed` value+slope continuity at **S\*** (the seam) — A16's gate adds the **ATM (g→0) crossing**
and the **no-regime-branch** lock, which (4) does not cover.

---

## 6. R1 citations
- **Entry 204** `history/operator/2026-06-10_kurtosis-curve-family-brief.md` L1587–1593 — "no jump atm position value thing … full loop closed".
- **Entry 207** ibid. L1613–1617 — "no w atm thing needs a clean theoretical and implementation close out".
- Settlement-at-lensed (the value path A16 rides): **Entry 96** ibid. — "settle at lensed prices … recording the lensed version to query".

---

## 7. BOTTOM LINE (8 lines)
1. **DIAGNOSIS: NO JUMP.** The live held-position value (markEff/legValueUnified/pfComponents → `markLensed`) is continuous across OTM↔ITM on both wings; max adjacent |Δ| → 0 ∝ step (2e-3→6e-7 over 2k→2M steps), no floor.
2. The value path has **no regime branch**: pfComponents' `itm` flag sets only the DISPLAY strike `effK`; the value uses `markLensed` unconditionally; the dollar mark is linear in it. No `isOTM` jump exists.
3. **One artifact, NOT a jump:** a continuous CUSP to mark=1.0 exactly at ATM (sNorm=θ), because the lens forces g_loc→0 there (left slope +46.4, right −44.4). Value is continuous; only C¹-smoothness breaks.
4. **A16 is therefore ALREADY SATISFIED** in the operator's stated terms (entries 204/207: "no jump"). It needs **VERIFY + GATE + PROOF**, **NOT a build and NOT an operator decision.**
5. **THEORY:** Lemma **A16-CONT** (pinned §4) — composite `markLensed(·,·,sNorm,gLoc(state(sNorm),·,τ))` continuous at sNorm=θ, both limits =1, ∀τ>0,γ>1. Sits with LENSKERNEL `valueMatch_g`/`slopeMatch_g` (d7da8597). Optional **A16-CUSP** records the non-C¹ cusp honestly.
6. **IMPL:** new HARD gate `a16_atm_gate.js` (§5) — no-jump (step-scaling), ATM-peak=1, no-regime-branch lock, cross-layer single-basis; auto-routed in run_all by the lens predicate. NO code fix to the engine.
7. **Distinct from C7/R1/T1a** (the S\* seam, GROUNDED): A16 is the ATM g→0 limit, a different point and a different limit; the lens build already fixed the old v24 flat-ITM ATM-jump (markEff falls past the strike, §3c).
8. **ESCALATION:** only the §4 **A16-CUSP** (the non-smooth peak at ATM) is an operator-tier judgment call — accept the cusp (current behavior, no-jump met) or request a smoothing of the g_loc→0 collapse (a curve-semantic change). FLAGGED, not guessed. Everything else is autonomous (gate + lemma).
