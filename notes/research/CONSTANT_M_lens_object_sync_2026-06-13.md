# CONSTANT-m LENS — the simplified math object (monolith sync, operator entry 229/230)

_research-lead, 2026-06-13. Anchored on the skeptic's confirmed form
(`notes/skeptic/VERDICT_constant_slope_multiplier_entry229_2026-06-13.md`, run ac79cabc), NOT on
the manager's paraphrase. Operator entry 229 (verbatim, transcript L1839-1841): "its so
straightforward idk what to even say / fuck gang. its literally just a constant slope multiplier."
Entry 230: "monilith math etc sync up now." READ-ONLY on the engine; notes/specs/docs/formal only._

## 0. The confirmed form (skeptic-pinned — this is the anchor)
The lens is redefined from the position-dependent polar kernel `Φ_τ(u)=u/√(τ²+u²)` (elbow-rounding)
to a **CONSTANT slope multiplier `m`**:

- **Exponent form (state this to the intern):** `g_loc(K) = m·γ`, **constant at every strike**,
  no `u`-dependence.
- **Coordinate form (equivalent on this plain power-law base):** `u_true = m·u_displayed`.
- `m = 1` is **exactly plain v24** (steepness γ). `m > 1` ⇒ steeper everywhere ("more vol / sharper").
- The two forms are the SAME thing here (skeptic `/tmp/sk_equiv.js`): both give displayed exponent
  `m·γ` in the wings. They would differ only on a base with a flat top to squeeze; plain v24 has none.

**Direction (the three-way conflict dissolves, skeptic `/tmp/sk_threeway.js`):** bigger `m` ⇒
(a) steeper chart-2 = `m·γ`, (b) trade lands further out `mode·e^{m·u}`, (c) transact-at-what-it-looks-
like — all move the SAME way with `m`. The old `√(τ²+u²)` lens coupled steepness and outward-push
with OPPOSITE signs (the multi-day τ-direction flip-flop, skeptic patterns #20/#21/#23); the constant
multiplier has no such opposite coupling.

## 1. THE SIMPLIFIED MATH OBJECT

### 1.1 What it reduces to: an affine rescaling of the log-moneyness coordinate
The whole lens collapses to **one linear map on the log-moneyness coordinate `u = ln(θ/mode)`**:
```
u ↦ m·u            (the trade / "true" coordinate)
g_loc(K) = m·γ     (the displayed local exponent, strike-independent)
```
This is the cleanest possible object: a **constant scalar `m`** acting by multiplication on a
1-D coordinate. No kernel, no curvature, no position dependence. In the metriplectic / free-potential
framing the old lens was a calibration FIELD `Φ` carrying five axioms (Φ(0)=0, 0≤Φ≤1, monotone,
continuous) — an opaque shape we could not derive. Under constant-m **that field collapses to a
single positive scalar `m`**: `Φ ≡ m` (a constant function), and the five axioms become trivial /
mostly vacuous (Φ(0)=m≠0 in the exponent reading — see §1.4 on what the axioms become). The
"honest GAP" (lens shape not derived from free energy) **shrinks to one number**, not a function:
the only un-derived datum is the scalar `m`, calibrated to vol at setup.

### 1.2 Warp / trade in the m-frame — LINEAR, trivially invertible
Old (position-dependent) trade map: `u_tx = sign(a)·√(a²+2|a|τ)` (nonlinear, the √-kernel inverse).
**New (constant-m) trade map:**
```
θ_tx = mode·(θ_chosen/mode)^m       (= mode·e^{m·u}, linear in u)
```
- **Closed-form invertible:** `θ_chosen = mode·(θ_tx/mode)^(1/m)`. No bisection, no 1/h″ blow-up,
  no inverse-of-a-curved-lens. The L4 "never invert the lens to size a write" discipline is now
  trivially satisfiable because the inverse is an explicit power.
- **Monotone** in `θ_chosen` for `m > 0` (skeptic `/tmp/sk_thresh.js`).
- **Frozen-trivial under the continuous-warp framing:** the riding-lens warp integral
  `ΔG(K) = ∫_{γ₀}^{γ₁} Φ(...) dγ` collapses because `Φ ≡ m` is a constant:
  ```
  ΔG(K) = ∫_{γ₀}^{γ₁} m dγ = m·(γ₁ − γ₀) = m·Δγ      (strike-INDEPENDENT)
  ```
  The exact-differential / path-independence / round-trip-zero properties survive **trivially**
  (the integrand is constant, so its primitive is `m·g` and everything telescopes). There is NO
  non-elementary incomplete-Bessel class anymore, NO √-kernel quadrature, NO recentering-vs-warp
  decomposition needed: with `Φ ≡ m` the "recentering" kink term (the kink lived at `g = 1/θ`
  where `|ln(θg)|` changes sign — a property of `|·|` inside `√`) **disappears**, because the
  exponent `m·γ` has no `θ`-dependence and no kink. `liveDiff = m·Δγ` directly.

### 1.3 Kurtosis = the constant `m`
"Kurtosis" / the vol knob is now **literally the scalar `m`** (operator entry 229). Bigger `m` =
steeper curve everywhere = trader trades further out in one direction. Static under trading (the
operator's entry-3 ruling: the knob is the curve's geometry, vol-calibrated at setup, NOT a
trade-measured statistic). The UI knob `state.tau` is repurposed/renamed to `m` (meaning changes
from "elbow width" to "slope multiplier" — skeptic change-set).

### 1.4 What the LensShape axioms become (honest)
Under `Φ ≡ m` (constant), in the **coordinate reading** `u_true = m·u`:
- `Φ(0)=0` → for the COORDINATE map `u ↦ m·u`, value at 0 is 0 (preserved). For the EXPONENT
  reading `g_loc = m·γ`, the "Φ" that multiplies γ is the constant `m`, so `g_loc` at the mode is
  `m·γ ≠ 0` — **this is the deliberate behavioural change**: g_loc no longer vanishes at the mode.
- `0 ≤ Φ`, monotone, continuous → all trivial for a positive constant.
- `Φ ≤ 1` → REPLACED by `m > 0` (no upper cap; `m·γ > γ` for `m>1` is the point).
So the cleanest statement of the object is: **the lens is multiplication by a positive scalar `m`
on the log-moneyness coordinate**; the displayed exponent is `m·γ`. The five-axiom `LensShape`
bundle is no longer needed — it is replaced by `m : ℝ, 0 < m`.

## 2. BLAST RADIUS on the components (skeptic-confirmed, carried into MONOLITH_INDEX)
- **A5 frozen-γ wings:** wings become exponent `m·γ` — still an exact power law (finite, monotone,
  in [0,1]), but NOT the same exponent as γ. CLAUDE.md §0's "wings stay exact power-laws [at γ]" is
  TRUE in the weak sense (still power-laws) and FALSE in the strong sense (γ unchanged). **The
  frozen-γ-wing feature is DELETED.** No floor/saturation introduced.
- **A6 monotonicity / no-arb:** PRESERVED. The displayed curve is just plain v24's power law with
  exponent `m·γ`; same monotone, no-arb structure. No new arb surface.
- **A16 ATM cusp (Q11):** the cusp / flat-top VANISHES. It existed only because `g_loc → 0` at the
  mode (S*→0 degeneracy). Constant `g = m·γ > 0` has no special behaviour at the mode; call/put
  arms meet at the strike with the same exponent both sides. **ATM is clean/continuous** — Q11
  (accept-cusp-vs-smooth) is MOOT under constant-m.
- **Settlement smooth-paste (C7):** SURVIVES unchanged. `markLensed` is g-parametric; any constant
  `g = m·γ > 0` gives a valid finite `S* = K·g/(g+1)` with a C⁰ seam (skeptic seam jump ~1e-8,
  machine zero, for g=2/4/6). LENSKERNEL's `valueMatch_g`/`slopeMatch_g` (∀ g>0) already cover the
  constant-g case directly.
- **Funding (C9):** formula survives mechanically, but SHAPE changes: today funding → 0 at ATM
  because g_loc → 0; under constant-m `g_loc` never hits 0, so **funding does NOT vanish at the
  mode**. Behavioural change (current funding gate 5a forbids it).
- **Continuous-warp (C16) / trade map (A14/A1):** trade map becomes the LINEAR `θ_tx` above;
  frozen-at-open + reuse-at-close still gives an exact pool round-trip. The √-kernel and its
  τ-direction documentation block are GONE.

## 3. SUPERSEDED — old position-dependent-lens derivations (history kept, marked)
The following are SUPERSEDED by the constant-m object. **Not deleted — marked here with pointers.**
All were correct FOR the `√(τ²+u²)` polar lens; that lens is no longer the object (operator 229).

| Superseded artifact | What it derived (polar-lens) | Replaced by (constant-m) |
|---|---|---|
| `notes/research/CONTINUOUS_trade_warp_lens_calculus_2026-06-12.md` | the ∫Φ_τ(\|ln θγ\|)dγ warp, non-elementary incomplete-Bessel class, warp-vs-recentering decomposition | `ΔG = m·Δγ` strike-independent linear; NO integral, NO decomposition, NO kink term |
| the inverse-lens `θ_tx`/`u_tx = sign(a)·√(a²+2\|a\|τ)` (lens_tx / invtx work, MEMORY entries 215-224) | nonlinear effective-strike map + its inversion hazards | `θ_tx = mode·(θ/mode)^m`, explicit closed-form inverse `(θ_tx/mode)^(1/m)` |
| the √-kernel naturalness notes `NATURALNESS_polar_kurtosis_map_2026-06-11.md`, `POLAR_density_first_principles_2026-06-11.md` | first-principles justification of `h_τ=√(τ²+u²)−τ` as the kurtosis kernel | the kernel is removed; "kurtosis" is now the scalar `m`, no kernel to justify |
| WARPCALC Lean (`PhiA tau v = |v|/√(τ²+v²)` and all `warp*`/`recenterKer`/`warp_decomposition`) | the polar-lens warp calculus, FTC-2 exactness on `Φ_τ` | the constant-m warp (`warpInt = m·Δγ`) — a one-line linear lemma; see §4 |
| the `LensShape` 5-axiom bundle in `Monolith.lean`/`MonolithWarp.lean` (entry 179) | abstract lens-with-axioms + `polarLens τ` instance | a single field `m : ℝ, 0 < m`; axioms collapse (§1.4) |

LENSKERNEL's NON-lens results are NOT superseded — they are about the plain Balancer pool and the
g-parametric smooth-paste, which constant-m KEEPS: `tradeUpdate_*`, `gamma_linear_in_cash`
(γ′=γ+dy/β), `rebase_*`, `valueMatch_g`/`slopeMatch_g` (∀g>0) all stand. Only the polar-specific
`Phi_*`/`gLoc_*at_mode`/`gLoc_le_gamma` lens facts are replaced by the constant-m versions.

## 4. THE SIMPLIFIED SINGLE LEAN STRUCTURE (entry 179 one-object, now cleaner)
The constant-m object makes the single `TemporalAMM` structure STRICTLY cleaner — the lens field
drops from a 5-axiom `LensShape` bundle to a single positive scalar. See the companion prompt
`formal/prompts/aristotle_prompt_monolith_constm.md` (ready to fire). Headline simplifications:
- `lens : LensShape` (Φ + 5 axioms) → `m : ℝ` + `hm : 0 < m`.
- `g (P) (θ) := P.gamma * P.lens.Phi |P.lensU θ|` → **`g (P) (θ) := P.m * P.gamma`** (no θ, no Φ,
  no `lensU` inside g). The lens-exponent def loses its only nontrivial argument.
- `g_zero_at_center` (g=0 at mode) → **DELETED / negated**: `g_at_center : P.g θ = P.m * P.gamma`
  (constant, NOT zero). This is the behavioural redefinition, stated as a theorem.
- `g_le_gamma` (cap-free bound g≤γ) → **`g_eq_m_gamma`** and, for m≥1, `g_ge_gamma`. The "≤γ cap"
  is GONE by design.
- warp lemmas (`warp_eq_potential_diff`, `warp_roundtrip_zero`, `warp_le_dgamma`,
  `live_diff_decomposition`) → collapse to **`warp_linear : ΔG = m·Δγ`** plus trivial corollaries
  (round-trip zero is `m·(Δγ) + m·(−Δγ) = 0`; bound `0 ≤ ΔG` for buys is `0 ≤ m·Δγ`). The
  decomposition lemma is UNNEEDED (no recentering kink). The hardest Lean content of the old object
  (FTC-2 on the √-kernel, incomplete-Bessel-class integrand) **evaporates**.
- trade map `θ_tx`: `theta_tx (P) (θ) := P.center * (θ / P.center) ^ P.m` with
  `theta_tx_roundtrip` (compose with exponent `1/m` ⇒ identity) — a clean `rpow` lemma.
- Everything else KEEPS (invariant, w/γ/center/price, trade_conserves, gamma_affine,
  trade_rebase_commute, smooth-paste paste_value/paste_slope at g=m·γ, goalSeek, engineInstance).

## 5. Lean / Aristotle reachability (HONESTY)
**Aristotle IS REACHABLE this session** (2026-06-13): `uvx --from aristotlelib aristotle list`
returns 200 / exit 0, no `403 host_not_allowed`; projects listed. The earlier morning concern
(403) does NOT reproduce now. **However, the constant-m Lean lemmas have NOT been submitted yet** —
the prompt is written and queued (`aristotle_prompt_monolith_constm.md`), ready to fire. Per the
honesty rule, the constant-m Lean layer is **stated, pending-submit** until a candidate returns and
passes the full audit gate. The math/object/index sync (§§1-4) does NOT need the prover and is done
fully here. The LENSKERNEL/WARPCALC results that constant-m KEEPS (pool + g-parametric smooth-paste)
remain trusted-from-prover from their prior audits; the polar-specific warp results are now
SUPERSEDED (§3), not relied on.
