# SPEC — PKG-ITM v2, build (a): the LINEAR re-seam in ENGINE COORDINATES
**File:** `specs/SPEC_pkg_itm_v2_engine_coords_2026-07-02.md` · **Author:** research-lead, 2026-07-02
**Authority:** operator go entry 298 ("ok lets go!"), rigor mandate entry 299; binding target = entry 287
(corrigendum): dollar-frame put `Vp = if S ≤ S* then 1−S/K else (1/(g+1))·(S/S*)^(−g)`, `S* = K·g/(g+1)`,
call mirrored at `S*_c = K·(g+1)/g`, `V = max(bounded re-seamed mark, intrinsic)`, re-seam 0.444K→0.667K.
Skeptic gate: `notes/skeptic/VERDICT_R6_PKG_ITM_scope_gate_2026-07-02.md` — CLEAR-TO-DISPATCH conditional;
**FLAG-2 is discharged by §6 of this spec (verbatim acceptance pins)**. FLAG-1 (provenance attestation) and
FLAG-3 (build (b) control inventory) are the manager's, not covered here.
**Scope:** build (a) ONLY — the engine-coordinate fix of `markLensed`. The display slice (b) (%→$ toggle,
uncapped chart wings, chart-2 rewire) is EXCLUDED. Funding redesign EXCLUDED (entailed numeric shifts are
disclosed in §4.3). No Aristotle in this slice.
**Lean provenance of the target object:** `formal/aristotle_runs/O1_PASTE_LIN/extracted/RequestProject/PasteLin.lean`
(project `822f8d6a`, md5 `604c02fd`) — `paste_value_lin` / `paste_slope_lin` / `Vp_hasDerivAt_seam` /
`paste_unique` / `paste_value_lin_call` / `paste_slope_lin_call`, **trusted-from-prover + manager-audited**
(NOT "verified": no local canonical kernel). O2 `ValueGeIntrinsic.lean` (`value_ge_intrinsic`, put wing) same
status. The call-wing value≥intrinsic is numeric-gated only (open Lean obligation, §9).
**The intern builds ONLY from this spec.** Every formula below was executed in a Node sandbox against the
real HEAD engine before handover (§5; harness preserved in the session scratchpad, 21/21 PASS).

---

## §1 THE FRAME MAP (the load-bearing derivation — read before touching code)

### 1.1 The engine's coordinates (what `markLensed` actually consumes)
`markLensed(wing, theta, sNorm, g)` — HEAD `engine/builds/HEAD_temporal_mvp_v28_lens.html` L1665:
- `theta` = the strike RAY `θ = K / oracle` (rebuilt live from dollar K; see `pfComponents` L4371).
- `sNorm` = `getSNorm(state) = (1−w)/w` — the pool's RECIPROCAL mode (L1602). This is the live spot
  coordinate on the SAME ray family as θ (MUST-APPLY-1 / MUST-APPLY-A, L1971-1975).
- `g` = `gLoc(state, θ, m) = m·γ`, `γ = w/(1−w)` live (L1649).

Under an oracle move the engine REBASES (`rebase` scales x,α; w and sNorm invariant) and θ = K/oracle
moves; under a trade w moves and sNorm moves. So spot motion is carried by θ, pool skew by sNorm.

### 1.2 The pinned identification (what "S/K" is)
**Transport rule (PINNED): `S/K ↦ ρ := sNorm/θ` — the single moneyness ratio.** Equivalently the put reads
`θ/sNorm = K/S`. Justification, in order of bindingness:
1. **MUST-APPLY-1 (binding engine contract):** ONE sNorm coordinate in all three consuming layers
   (mark/funding/settlement). Every existing consumer already forms moneyness as the sNorm-vs-θ ratio
   (`mark` L1608, `legIsITM` L2005, the current `markLensed` arms, A16's mode-crossing).
2. **Empirical anchor (entry-286 sweep, `evidence/dexters_lab/oracle_sweep_2026-06-26/RESULT_runA.json`):**
   default pool post-arb (w=0.5 ⇒ sNorm=1, γ=1), m=2 ⇒ g=2, oracle swept, θ=K/S per row. There
   ρ = sNorm/θ = 1/θ = S/K **exactly**. Sandbox check 0: the engine's shipped
   `markLensed('put', θ, 1, 2)` reproduces all 25 DOM `markUI` readings to 4dp (maxErr 4.8e-5) — the
   frame map is grounded on the live output path, not on code reading.
3. **Scale invariance:** the new form below satisfies `V(θ, sNorm) = V(ρ)` exactly (sandbox check 9,
   maxΔ 1.1e-16) — the ray scale drops out, as it must for a rebase-gauge quantity.
4. **Settled == reversal parity:** `markEff` (settle, L1978) and `legPrice` (reversal quote, L1732) share
   the same (θ, sNorm) inputs; any transport that read moneyness differently in one of them would split
   the settle leg from the reversal quote at an unchanged state.

**At the anchor (entry-286 protocol state) ρ = S/K exactly; off-anchor (sNorm≠1) ρ is the pool-implied
moneyness** (the mode reads as the effective spot). That is the existing engine semantics, preserved —
not a new invention. If the operator ever wants the dollar seam pinned to RAW oracle dollars even on a
skewed pool (moneyness = 1/θ ignoring sNorm), that is a DIFFERENT transport and an operator call —
escalate, do not improvise (§9 risk 4).

### 1.3 The transported object (general-frame formulas)
Substituting S/K = ρ into the entry-287 target (O1 `Vp`, `sStarP = K·g/(g+1)`):

**PUT** — seam at `ρ* = g/(g+1)` i.e. seam RAY `sNorm* = θ·g/(g+1)`:
```
V_put(ρ, g) = 1 − ρ                                   if ρ ≤ g/(g+1)   (linear intrinsic (K−S)/K)
            = (g^g/(g+1)^(g+1)) · ρ^(−g)              if ρ > g/(g+1)   (continuation)
            = (1/(g+1)) · (sNorm/sNorm*)^(−g)         [engine form]
```
**CALL** — seam at `ρ*_c = (g+1)/g` i.e. seam RAY `sNorm*_c = θ·(g+1)/g`:
```
V_call(ρ, g) = (g^g/(g+1)^(g+1)) · ρ^(+g)             if ρ ≤ (g+1)/g   (continuation)
             = 1 − 1/ρ  = 1 − θ/sNorm                 if ρ > (g+1)/g   (linear intrinsic 1 − K/S)
```
Both wings: boundary value `1/(g+1)`; C¹ weld (put slope −1 in ρ ⇒ −1/K in dollars at the anchor; call
slope `g²/(g+1)²` in ρ ⇒ `g²/(K(g+1)²)` — exactly O1's `paste_slope_lin` / `paste_slope_lin_call`).
**YES — general (sNorm≠1) states use the ratio θ/sNorm on the put:** continuation
`= (g^g/(g+1)^(g+1))·(θ/sNorm)^g`. In the swept frame (sNorm=1) this is the `(K/S)^g` shape the target
demands, vs today's LINEAR `0.1481·(K/S)`.

### 1.4 THE TRAP SITE (~6×) — the four wrong transports, by name
1. **Keeping the power intrinsic** `1 − (sNorm/θ)^(1/g)` (today's ITM arm, L1674): a genuinely different
   function from `1 − S/K` (equal only at g=1) — the entry-285 #1 divergence (+0.229 at S=90, g=2).
2. **Keeping the old seam** `sNorm* = θ·(g/(g+1))^g` (L1672): power-g vs power-1. At g=2 that is 0.444θ
   vs the correct 0.667θ — the empirically observed 0.444K seam. The old code COMMENT already said
   "S*=K·g/(g+1)" while the code shipped the power form — comments lie; re-derive from geometry.
3. **Reading moneyness as 1/θ, ignoring sNorm:** freezes moneyness against pool state, breaks
   MUST-APPLY-1 and the settle==reversal parity of §1.2(4).
4. **Passing the price-coordinate spot instead of the reciprocal sNorm** (the MUST-APPLY-A "~6× ln γ
   basis leak", L1971-1975 and entry-285 finding): θ and the spot must BOTH be reciprocal-frame. The
   fix below changes NO caller, so no opportunity to re-open this — do not "helpfully" touch `markEff`.

---

## §2 EXACT REPLACEMENT CODE (the ONLY engine edit)

### 2.1 The old block (splice anchor)
Lines **1656–1676** of `engine/builds/HEAD_temporal_mvp_v28_lens.html` — the `markLensed` comment block +
function. Line-block md5 (`sed -n '1656,1676p' | md5sum`): **`3e4a3ab3d3beb63ba063320354f94f2d`**; the
block occurs **exactly once** (verified `txt.count(old)==1`). Per `engine/splices/SPLICE_METHOD.md`:
**slice the old string out of the file on disk by line range — do NOT hand-type it** (it contains `·`, `θ`,
`γ`, `−`, `∞` Unicode). Work on a copy; `assert txt.count(old) == 1`; preserve the trailing `\n`; blobs
never enter context.

For identification only, the old block is:
```js
  // Lensed mark — v26b Reading-A American smooth-paste with the strike-LOCAL
  // exponent g (constant per strike, lens static). Free boundary sNorm*, price
  // multiple S*=K·g/(g+1), c=1/((g+1)·sNorm*); continuation c·sNorm past the
  // strike then intrinsic. Value+slope continuous to machine zero at sNorm*,
  // incl. g<1. MUST-APPLY-2: NO γ_min floor — g=0 ⇒ S*=0 is finite (Math.pow
  // handles it); the boundary is INCLUSIVE (<= / >=) so the exact g=0,
  // sNorm===θ point returns the boundary value 1/(g+1) instead of pow(1,−∞)=NaN.
  // This is the lens twin of `mark` (which it does NOT replace — `mark` stays
  // the v24 kinked saturating fraction for the unchanged pool/exec/dollar pipe).
  function markLensed(wing, theta, sNorm, g) {
    if (wing === 'call') {                       // call arm = sNorm/θ side
      const sStar = theta * Math.pow((g + 1) / g, g);   // ≥ θ (g=0 ⇒ pow(∞,0)=1 ⇒ θ)
      const c = 1 / ((g + 1) * sStar);
      if (sNorm <= sStar) return c * sNorm;             // continuation (incl. boundary)
      return 1 - Math.pow(sNorm / theta, -1 / g);       // intrinsic 1 − S/K
    } else {                                      // put arm = θ/sNorm side
      const sStar = theta * Math.pow(g / (g + 1), g);   // ≤ θ
      if (sNorm >= sStar) return sStar / ((g + 1) * sNorm);  // continuation (incl. boundary)
      return 1 - Math.pow(sNorm / theta, 1 / g);        // intrinsic 1 − K/S
    }
  }
```

### 2.2 The new block (literal replacement, ready to splice)
```js
  // Lensed mark — PKG-ITM v2 (operator entries 286/287, go 298): American
  // perpetual value with the LINEAR intrinsic re-seam. Power continuation arm
  // (exponent ∓g in the moneyness ratio ρ = sNorm/θ) welded C¹ onto the LINEAR
  // parity line at the free boundary — put seam ρ* = g/(g+1) (dollar S* =
  // K·g/(g+1), the 0.667K seam at g=2), call seam ρ* = (g+1)/g (S* = K·(g+1)/g);
  // boundary fraction 1/(g+1) on both wings. Past the seam the arm IS intrinsic:
  // put 1 − sNorm/θ (= 1 − S/K), call 1 − θ/sNorm (= 1 − K/S) — escrow-unit
  // fractions in (0,1]. V = max(mark, intrinsic) holds IDENTICALLY (value ≥
  // intrinsic everywhere: O2 value_ge_intrinsic, trusted-from-prover; call wing
  // numeric-gated), so NO caller applies a max(). Lean model of this object:
  // O1 PasteLin.lean (Vp / sStarP / paste_unique), trusted-from-prover.
  // MUST-APPLY-2 (unchanged): NO γ_min floor; g=0 stays finite (all-continuation,
  // value → 1 = the g→0 wing law S^0); the boundary is INCLUSIVE on the
  // continuation side so the exact seam point returns 1/(g+1); NaN g or θ stays
  // NaN-loud (the branch falls through to the pow arm, which propagates NaN).
  // This is the lens twin of `mark` (which it does NOT replace — `mark` stays
  // the v24 kinked saturating fraction for the unchanged pool/exec/dollar pipe).
  function markLensed(wing, theta, sNorm, g) {
    if (wing === 'call') {                        // call arm = sNorm/θ side
      const sStar = theta * (g + 1) / g;          // seam ray (g=0 ⇒ ∞: all-continuation)
      if (sNorm > sStar) return 1 - theta / sNorm;         // linear intrinsic 1 − K/S
      return Math.pow(sNorm / sStar, g) / (g + 1);         // continuation (incl. boundary)
    } else {                                      // put arm = θ/sNorm side
      const sStar = theta * g / (g + 1);          // seam ray (g=0 ⇒ 0: all-continuation)
      if (sNorm < sStar) return 1 - sNorm / theta;         // linear intrinsic 1 − S/K
      return Math.pow(sNorm / sStar, -g) / (g + 1);        // continuation (incl. boundary)
    }
  }
```
Signature, argument order, and export (`markLensed` in the Engine return object, L2282) are UNCHANGED.

### 2.3 Guard behavior (verified, sandbox check 10 + INFO line)
- `g = NaN` → NaN, both wings (branch condition false ⇒ pow arm ⇒ NaN). **Branch order is load-bearing:**
  the intrinsic arm is the IF-body precisely so a NaN comparison falls to the NaN-propagating pow arm.
  Do not "simplify" to `if (cont-condition) … else intrinsic`.
- `θ = NaN` → NaN (same mechanism). `θ ≤ 0` → garbage-in-garbage-out, same class as the old code;
  callers guard (`markEff` L1979 returns 0 for absent/nonpositive θ).
- `g = 0` exactly → finite value 1 (all-continuation; `Math.pow(x, ±0) = 1`, `Math.pow(0,0) = 1`).
  NOTE an honest delta: the OLD code returned 0.7-type values at g=0 on the call (c·sNorm); the new
  returns 1 (the correct g→0 limit of the v2 object, continuous with g→0+). g=0 is unreachable through
  `gLoc` (NaN-loud for γ≤0 or m≤0), so no live path sees this; documented, not hidden.
- Exact seam point `sNorm === sStar` → returns `1/(g+1)` exactly (pow(1, ±g) = 1) — inclusive boundary
  preserved.

### 2.4 What does NOT change (byte-identical; the file-safety gate enforces the blobs)
- **Pool:** `tradeUpdate`, `arbitrageToOracle`, `rebase` (CM8/CM-P byte-identity to v24 must stay green).
- **Lens plumbing:** `gLoc`, `lensU`, the frozen tx-map `θ_tx = mode·(chosen/mode)^m` (CM5/CM6/CM7).
- **Callers (§4):** `markEff`, `legValueUnified`, `legPrice`, `fundingPerStrike`, `pfComponents`,
  `closeBand`, `executeLeg`/`executeBand`, `legIsITM`, `mark` (v24 kinked fraction), `poolMark`.
- **Both base64 blobs** (webp line-md5 `ab663f5c26f2a461c5b0ef1421d0ad74`, svg `c505b08ad0e4c6b0fb9e64e9679fe291`),
  all three `<script>` blocks parse, engine IIFE intact, no line >~50k, `engine/verify/run_all.sh` green.

---

## §3 WHERE max() LIVES: NOWHERE NEW — decision + proof obligation

The operator target is `V = max(bounded re-seamed mark, intrinsic)`. **Decision: the re-seamed
`markLensed` IS that max, identically, in escrow-unit fractions — no call-site change, no new intrinsic
module in build (a).** Why this is correct and minimal:
- In each wing's own escrow unit (put: fraction of the K-dollar cash escrow; call: fraction of the 1-perp
  escrow) the intrinsic is `(1−ρ)⁺` (put) / `(1−1/ρ)⁺` (call) — both ≤ 1. O2 `value_ge_intrinsic`
  (trusted-from-prover) proves `Vp ≥ max(1−S/K, 0)` for all S>0; hence
  `max(markLensed, intrinsic) ≡ markLensed` pointwise. The sandbox re-verified this on the exact
  entry-286 grid (check 4: min diff ≥ −1.1e-16 ≈ 0, zero negatives, both g) and on a wide call sweep
  (check 4b, numeric only — the call-side Lean twin is an open obligation, §9).
- CAUTION (study §0, pinned): `V=max` is curve ∪ tangent-ray (least majorant), **NOT**
  `max(linear-arm, extended-power-branch)` — the power extension lies ABOVE its tangent below S*, so
  coding a literal two-branch `Math.max` of globally-extended arms would return the WRONG (power) value
  in the intrinsic region. The piecewise weld of §2.2 is the correct object; do not "refactor" it into a
  `Math.max`.
- The ">1 uncapped intrinsic" in the operator's target lives in the **$ display view** of an uncapped
  wing (e.g. call payoff in K-units or dollars) — that is build (b) scope. Every build-(a) consumer is an
  escrow-unit fraction in (0,1], so the bounded mark alone carries V=max here.

---

## §4 CALLERS AUDIT (read, verified — no call-site edits)

### 4.1 Everything routes through the ONE helper (confirmed by source read, HEAD line numbers)
| caller | line | role | change needed |
|---|---|---|---|
| `legPrice` | L1735, L1743-44 | quote/V basis (barrier + leg-by-leg spread) | none |
| `markEff` | L1981 | settle fraction (`return markLensed(wing, theta, sNorm, gLoc(...))` unconditional) | none |
| `legValueUnified` | L1987-89 | `N·(mIn−mOut)` via markEff → closeBand settlement | none |
| `fundingPerStrike` | L2273 | consumed mark `m` | none (see 4.3 disclosure) |
| chart-2 `psiAt` | L3729 | draw layer (display clamp min(1,v)) | none |
| `pfComponents` | L4383 | UI per-leg fraction (W6, = markEff to machine zero) | none |
Chart-1 `legFraction`/`drawPayoff` uses the v24 `mark` (draw-only) — untouched. Chart-2's plotted
`psiShape` is the `(mode/θ)^g` proxy tent — untouched in (a) (its rewire is (b), FLAG-3 territory).
`closeBand`'s regime test `legIsITM` (strike crossing, display/exec routing) — untouched; the value path
has no regime branch (A16.3 structural lock keeps enforcing this).

### 4.2 Therefore: settlement, quoting, portfolio display, and funding all pick up the fix from the one
splice, and `V = max` needs NO extra call-site change (§3). This is the entry-297 item-4 entailment the
skeptic confirmed citation-backed.

### 4.3 Entailed numeric shifts (disclosures, not scope):
- **Quotes reshape everywhere except ATM** (the unique fixed point, `g^g/(g+1)^(g+1)`, sandbox check 5):
  OTM drops (g=2: 0.1235→0.1029 at S/K=1.2; 0.0988→0.0658 at 1.5), near-ITM continuation rises
  (0.1852→0.2315 at 0.8), ITM-past-seam = parity exactly. Say it the skeptic's way in operator reports:
  "the whole continuation reshapes; ATM alone is unchanged."
- **Funding magnitudes re-scale** wherever the consumed mark changed — formula untouched (κ·(±g)·N·m·(S−1)/S),
  mark input changed. This is the shared-helper entailment, same class as settlement; funding REDESIGN
  (study item 4) stays excluded and operator-gated.
- **Buy-leg sizing** `N_buy = V_sell/denom` shifts with V (the pool swap dy is sized by the frozen K_tx
  map, unchanged — CM6 still locks the round-trip).

---

## §5 NUMERICAL VERIFICATION (mandatory; executed 2026-07-02 against the real engine, 21/21 PASS)

Method: HEAD `<script id="engine">` in Node `vm.runInNewContext` (read-only); §2.2 function defined
verbatim; real `gLoc`/`getSNorm` on the entry-286 default pool (w=0.5 ⇒ γ=1, sNorm=1); θ = K/S; K=100.

**Paper worked-example table (`paper/wine2026/temporal_wine2026_v2.tex` §5.2 L546-558) — swept frame:**

| spot S | paper g=2 | **spec formula (γ=1, m=2)** | paper g=6 | **spec formula (γ=1, m=6)** |
|---|---|---|---|---|
| at S\* | 0.333 (@66.67) | **0.3333** | 0.143 (@85.71) | **0.1429** |
| $80 | 0.231 | **0.2315** | 0.200 (intrinsic) | **0.2000** |
| $90 | 0.183 | **0.1829** | 0.107 | **0.1066** |
| $100 = K | 0.148 | **0.1481** | 0.057 | **0.0567** |
| $120 | 0.103 | **0.1029** | 0.019 | **0.0190** |
| extra intrinsic-arm probes | 1−S/K | **0.4000 @60, 0.5000 @50** | 1−S/K | **0.3000 @70** |
| extra continuation probe | — | — | — | **0.0771 @95** |

Every cell to 3dp; ≥6 points per column incl. both arms + the seam. Also verified:
- **Frame grounding:** shipped engine `markLensed('put', θ, 1, 2)` == all 25 run-A DOM `markUI` (4dp).
- **Seam C¹ (put):** V(S\*) = 1/(g+1) exact; one-sided slopes L/R = −0.010000/−0.010000 (= −1/K), g=2 and g=6.
- **Call mirror:** V(S\*_c) = 1/(g+1) exact; slopes = g²/(K(g+1)²): 0.004444 (g=2), 0.007347 (g=6) both sides.
- **Sign table:** value − intrinsic ≥ 0 at all 25 entry-286 spots (g=2 and g=6; 0 negatives) + wide call sweep.
- **ATM invariance:** old == new == g^g/(g+1)^(g+1) at θ=sNorm for g∈{1,2,3,6}.
- **g=1 coincidence:** new ≡ old exactly (maxΔ 5.6e-17, both wings) — the entry-285 "equal only at g=1" fact.
- **Ray-scale invariance** (V depends only on ρ), **off-anchor seam** at sNorm\* = θ·g/(g+1) on a w=0.725,
  m=2 pool (g=5.27), **guards** per §2.3, **gate survival/breakage** per §7.

---

## §6 FLAG-2 DISCHARGE — ACCEPTANCE PROTOCOL (verbatim; binding on the tester pass)

> **Acceptance pins, per skeptic FLAG-2 (VERDICT_R6, 2026-07-02):**
> 1. The acceptance re-run uses the **entry-286 live oracle-sweep harness protocol**
>    (`engine/verify/pw_oracle_sweep_qc.mjs` lineage; default pool post-arb, w=0.5 ⇒ **γ=1**, sNorm=1,
>    K_PUT below oracle₀, oracle swept), with the knob pinned PER COLUMN:
>    **(γ=1, m=2) ⇒ g_loc=2 → the paper's g=2 column**, and **(γ=1, m=6) ⇒ g_loc=6 → the paper's g=6
>    column**. The paper's own columns were computed at (γ=2, m=1) and (γ=2, m=3); the equivalence is
>    **fixed-g equivalence — ASSERTED here, not assumed**: the v2 value object depends on (θ, sNorm, g)
>    only through (ρ, g) (§1.3, ray-scale invariance verified §5), so equal g_loc ⇒ equal column. If the
>    DOM disagrees with the paper column at equal g_loc, that is a FAIL of the build, never a license to
>    adapt the protocol mid-acceptance.
> 2. **Acceptance is DOM-READ output** — the displayed mark / settled value read as text the way the
>    entry-286 harness reads it — **NEVER the formula checking itself.** No gate that evaluates the new
>    JS expression against the same expression counts toward acceptance.
> 3. The **C¹/seam gate must numerically probe the OUTPUT at S\* = 0.667K (g=2)** [and 0.857K for the
>    g=6 column]: DOM value at S\* = **1/(g+1)** (0.3333 / 0.1429 to 4dp-read tolerance), and one-sided
>    finite-difference slopes of the DOM-read mark vs S/K straddling S\*: left (intrinsic) quotient
>    **−1.000 ± 0.03** (i.e. −1/K per dollar); right (continuation) quotient at step ε(S/K): expected
>    −0.957 (ε=0.02) / −0.989 (ε=0.005) for g=2; −0.923 (ε=0.02) / −0.980 (ε=0.005) for g=6; tolerance
>    ±0.03 and monotone → −1 as ε shrinks (convexity makes the right quotient shallower at finite ε;
>    DOM 4dp rounding bounds the noise).
> 4. The **sign-table gate must assert value ≥ intrinsic on OUTPUT at every swept spot** (all 25 S/K
>    rows, both columns): diff ≥ 0 everywhere, diff = 0 (to 4dp) at and below the seam, diff > 0
>    strictly above it. The `belowIntrinsic` array of the harness output must be **empty**.

Expected post-fix DOM columns (4dp; the tester compares against these, computed from §1.3 — the sandbox
values, not from the engine under test): g=2 marks at S/K = 1.5/1.2/1.0/0.95/0.9/0.8/0.7/0.6667/≤seam →
0.0658/0.1029/0.1481/0.1642/0.1829/0.2315/0.3023/0.3333/=intrinsic; g=6 at 1.2/1.0/0.95/0.9/0.8571/≤seam →
0.0190/0.0567/0.0771/0.1066/0.1429/=intrinsic. Harness `boundary_mark_1_over_gp1` field: 0.3333 (m=2) /
0.1429 (m=6). Empirical-seam detection must land at S/K ≈ 0.667 (m=2) / 0.857 (m=6) — not 0.444.

---

## §7 GATE SPEC (self-check layer; these are self-consistency, NOT the §6 acceptance)

### 7.1 `engine/verify/lens_selfcheck.js` (HARD, currently 13 PASS)
- **BREAKS (verified red on the new arm): CM4** — it hardcodes the OLD seams
  `sStarCall = θ·((g+1)/g)^g`, `sStarPut = θ·(g/(g+1))^g` (L204-205); on the new build the put value at
  the old seam is intrinsic 0.5556 ≠ 1/3 (gap 0.2222, sandbox check 8c). **REWRITE CM4 → CM4-v2**, same
  slice, same PASS-count discipline:
  - seams `sStarPut = θ·g/(g+1)`, `sStarCall = θ·(g+1)/g`;
  - C⁰ machine zero across each seam (±1e-10 relative straddle, tol 1e-9) + boundary fraction
    `1/(g+1)` exact at the seam point (verified green, check 8d) — keep CM4-nan as is;
  - **NEW C¹ probe:** one-sided difference quotients of markLensed in sNorm at the seam
    (ε = 1e-6·sStar): put both sides → `−1/θ` ; call both sides → `g²/((g+1)²·θ)`; relative tol 1e-4.
- **ADD CM10 (sign table / American faithfulness, the O2 witness):** for g ∈ {2, 6} × both wings ×
  the 25-point entry-286 S/K grid + a wide log-spaced sweep: `markLensed − intrinsic ≥ −1e-12`, with
  intrinsic recomputed IN THE GATE from ρ (put `max(0, 1−sNorm/θ)`, call `max(0, 1−θ/sNorm)`); require
  strict `> 0` at points strictly above the seam and `≤ 1e-12` at/below it. Tautology note (skeptic
  FLAG-2(ii)): this is NOT an rfl-tautology because no `max()` exists in the code (§3) and the gate
  recomputes intrinsic independently; on the intrinsic side it degenerates to arm-identity (fine — the
  content is the continuation side). The OUTPUT-path assertion remains §6's, on the DOM.
- **ADD CM11 (wing power-law m·γ OTM):** put continuation `V(2ρ)/V(ρ) == 2^(−g)` exactly (tol 1e-12)
  for g ∈ {2, 6} (call mirror with `2^(+g)`); locks the (K/S)^g shape the entry-286 finding showed missing.
- **UNCHANGED and expected green (verified 8a/8b):** CM1 (g_loc = m·γ constant; **m=1 plain-curve
  recovery** stays exactly here — m=1 ⇒ g_loc=γ), CM2 (monotone+bounded [0,1] — survives), CM3 (wing
  decay — survives), CM5/CM6/CM7 (tx-map, round-trip, polarity), CM8 (pool byte-identity), CM9 (markEff
  routing regex — markEff untouched). Optional CM12: at g=1 the shipped form equals the closed v26b
  expression (documents the g=1 coincidence); assert vs a closed form, never vs removed code.

### 7.2 `engine/verify/a16_atm_gate.js` (HARD, 5 PASS) — **NO change needed; run it, don't assume it.**
A16.2's hardcoded ATM value `1/((g+1)·((g+1)/g)^g)` is ALGEBRAICALLY IDENTICAL to the new ATM value
`g^g/(g+1)^(g+1)` (sandbox check 7, maxΔ 2.8e-17); arms still agree at the mode; A16.1 continuity, A16.3
structural no-regime-branch (markEff/pfComponents untouched), A16.3-numeric ITM<1 (deep ITM is now parity
<1), A16.4 single-basis all hold. Expected 5/5 green post-splice.

### 7.3 `engine/verify/monolith_consistency.js` (REPORT-ONLY) — line (6) goes red post-fix
It hardcodes the old seams (L175-176) and cites "LENSKERNEL valueMatch_g/slopeMatch_g". **Disposition
(same slice, report must not ship red-by-neglect):** repoint line (6) to the v2 seams
(θ·g/(g+1) / θ·(g+1)/g, fraction 1/(g+1)) and relabel the Lean provenance to
"O1 PasteLin `paste_value_lin`/`paste_slope_lin`/`paste_unique` (trusted-from-prover)"; keep its
⚑ALREADY-HARD rider now pointing at CM4-v2. It stays report-only (`|| true` in run_all.sh L45).

### 7.4 Out-of-scope harnesses: `seam_gate.js`/`wcurve_selfcheck.js` run only on GH/(W) builds (run_all
dispatch, L21/L55) — untouched. `run_all.sh` itself — untouched.

---

## §8 SPLICE / BUILD PROCEDURE (intern; file-safety gate binding)

1. **Revert twin FIRST (§6.2 / skeptic advisory):** byte-copy
   `engine/builds/HEAD_temporal_mvp_v28_lens.html` → **`engine/builds/temporal_mvp_v28_lens_powerarm.html`**
   (record md5 — must equal HEAD's current `dd6fb9557c251df222a4f918970576dd`). This is the retained
   pre-fix build; name it in `BUILD_LINEAGE.md`/`INTEGRITY.md` and the DIFF_LEDGER entry at promotion
   (manager/tester side).
2. On-disk Python splice per `engine/splices/SPLICE_METHOD.md` (`splice_slipfix.py` template): work on a
   copy; extract old block by line range 1656–1676 (verify block-md5 §2.1); `assert count==1`; replace
   with §2.2 verbatim; preserve trailing `\n`.
3. Re-check: 2 blob line-md5s unchanged, 3 `<script>` parse, IIFE intact, no signature changes.
4. Apply §7.1 rewrite to `lens_selfcheck.js` and §7.3 to `monolith_consistency.js` (plain file edits,
   not engine-HTML).
5. `sh engine/verify/run_all.sh <new build>` — lens_selfcheck (rewritten count) + a16 5/5 green; the
   whole-file md5 line in run_all.sh will report the new md5 (manager updates the canonical constant at
   promotion, per standing practice — NOT the intern silently).
6. Hand back to the manager for verification, then tester §6 acceptance (DOM) + standing UI smoke-pass.
   Promotion also trues up CLAUDE.md §4/§8 and DIFF_LEDGER rows (skeptic R6 advisory).

---

## §9 OPEN RISKS (honest register)

1. **Lean↔engine bridge drift (known, queued — research-lead's, not the intern's):** L7
   `EngineBridge.lean` transcribed the OLD `markLensed` verbatim; `MonolithConstM.lean` `paste_value`/
   `paste_slope` and archived LENSKERNEL prove the POWER-arm paste. Post-fix those describe the RETAINED
   `..._powerarm.html` build, not HEAD. `formal/INDEX.md` labels to be updated and a v2 bridge obligation
   (transcribe §2.2, prove = O1 `Vp`) queued to Aristotle in a later slice. O1/O2/O5 already model the
   v2 object.
2. **Call-wing value ≥ intrinsic is numeric-gated only** (O2 is put-wing; the call is the mirror and
   carries the C3 conditional-reflection caveat if ever cited as a symmetry consequence). CM10 + §6.4
   cover it operationally; Lean twin queued.
3. **g→0 exact-value change** (old 0.7-type vs new 1): unreachable via gLoc (NaN-loud); disclosed §2.3.
4. **Off-anchor dollar-seam semantics:** the seam is exact in the ray coordinate (sNorm\* = θ·g/(g+1));
   at the anchor that is exactly S\* = K·g/(g+1) in dollars. On a trade-skewed pool (sNorm≠1) the
   dollar crossing moves with the pool-implied moneyness — the pinned MUST-APPLY-1 semantics. If the
   operator wants raw-oracle-dollar seams on skewed pools, that is a transport change → operator
   escalation, not an intern decision.
5. **Funding magnitude shift** (§4.3) is an entailment, not a redesign — but it is user-visible;
   the skeptic-recommended FYI line ("continuation reshapes; ATM alone unchanged") belongs in the next
   operator report (manager).
6. **A16NoJump Lean model (L2)** stated `arms_agree_at_mode` over the OLD arm definitions; the FACT
   survives (arms still agree at the mode, same value), the FILE describes the old forms — same
   label-update class as risk 1.
