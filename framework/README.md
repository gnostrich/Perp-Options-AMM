# framework/ — the curve-AGNOSTIC framework (first-class citizen)

_Created 2026-06-11 (restructure slice 1). Operator directive (verbatim, transcript
`history/operator/2026-06-11_curve-agnostic-framework-brainstorm.md` entry 8): "I also separately
want the project ruthlessly restructured so curve specific work lands in a separate folder, and
curve agnostic framework remains a first class citizen in its own folder."_

**Scope rule:** this folder holds ONLY material that makes sense for ANY admissible curve — the
warp principle, the admission contracts, the information-geometry / port-Hamiltonian scaffold,
and cross-curve checks. Curve-SPECIFIC work lives in `curves/gh/` (the live engine's family,
with the pivot decision map) and `curves/balancer_w/` (the (W)/weight-profile family).
Cross-links to curve-specific files are allowed here; curve-specific *content* is not.

---

## 1. The warp principle (the geometric core — gates all further work)

Operator, 2026-06-11, entry 7, **verbatim**:

> skeptic. understand the geometric principle for curve warp before anybody does anything.
> "assuming pool reserves sat at the trade point (intersection of strike ray with curve) a given
> trade would move the point along the curve; now instead of doing this, you warp the curve
> (however is geometrically most natural), so that the slope the point was going to land on,
> moves to the trade point itself --- now think of this process as a sort of integral / updating
> infinitesimally" -- i've re-explained this nearly 5-6 times already so I hope this registers.
> now revert again in equally simple english with what remains open after this answer

Companion rulings (2026-06-10 transcript `history/operator/2026-06-10_project-status-review.md`):
entry 14 ruling 2 (verbatim "2. yes" — trades bend the curve) and entry 16 verbatim ("yes its w that the trade
changes (while x and y also change to be faithful to actual reserves, refer the paper) and that
warps it") — reference spec = the paper's Trade Formula (α=x·w, β=y·(1−w) individually conserved,
w=α/x derived). Standing UNIMPLEMENTED build target = `docs/feature_inventory.md` item 16,
sequenced AFTER the engine-faithfulness pivot.

## 2. Admission contracts pinned so far (operator rulings, with sources)

Every candidate curve/family must satisfy these; they are tests, not descriptions. Sources:
2026-06-11 transcript entries as numbered; formalizations as pointed.

1. **Four-number budget** (entry 5, verbatim): "idk cant answer, but no separate knob for wing
   sttpness etc. its x y w determing skew, and single kurtosis / steepness knob thats it" —
   live state (x, y, w) drives skew; ONE static kurtosis/steepness knob; no separate
   wing-steepness dial (the wing exponent must be DERIVED, never set). The knob is vol-calibrated
   at setup and is NOT changed by trades (2026-06-10 entry 14 ruling 3).
2. **LDF = closest-axis thickness** (entry 4 item 1, verbatim): "you can think of LDF as the
   thickness of the curve measured perpendicular from the closest axis (or in 180 degree case,
   just height)" — height, not density; formalized as H1 = min(x,y) / H2 = 2xy/√(x²+y²) / H3
   condition-generator in `framework/LDF_DEFINITION_CHECK_2026-06-11.md` §1.
3. **Mode = unit-tangent-slope point = pool mark** (entry 4 item 3, verbatim): "at every skew
   'spot' / 'pool mark' (latter term more accurate, former is a conversational approximation)
   corresponds to mode, which i think is always the point on curve in 90 degree context with unit
   tangent slope;" — checked in `framework/LDF_DEFINITION_CHECK_2026-06-11.md`: it functions as
   an ADMISSION TEST (true exactly for the anchored warp family inside the AMM-validity gate;
   false for constant-weight skew; per-curve outcomes live with the curves). Its pool-mark leg is
   the acceptance test for the warp-with-trades build (inventory item 16).
4. **Funding = geometric comparison vs the unskewed anchor at the SAME kurtosis** (entry 3,
   verbatim, item 2): "funding is a geometric comparison across curves, anchor curve is unskewed
   pool curve can be skewed, both to have same kurtosis" — the anchor is a CURVE (the unskewed
   member sharing the pool's kurtosis knob), so funding prices skew only, never the knob. WHICH
   geometric functional is OPEN (candidates in `framework/LDF_DEFINITION_CHECK_2026-06-11.md` §4);
   generalizes the locked engine rule (funding = slope-deviation vs the w=½ anchor).
5. **Exercise on the live (warped) curve** (entry 3, item 1: "1 yes" — answering whether exercise
   settles on the live warped curve).
6. **Re-pricing semantics** (entry 2, verbatim): "open options positions' extrinsic values change
   because the 'secondary market' has repriced. does this make sense?" — a trade-warp re-prices
   open positions' extrinsic value; terms are not preserved. Companion (entry 3 item 3): whether
   pool depth is impacted is a design choice, "as of now not is easier" — flagged as needing a
   solvency (B1-exposure) line item, `framework/LDF_DEFINITION_CHECK_2026-06-11.md` §4.

## 3. Contents (curve-agnostic material)

- `port_hamiltonian_consistency.md` — the PH obligation queue PH-1…PH-7 (moved from `specs/`):
  the consistency contract between the PH structure and the Lean scaffold; carries the 2026-06-09
  manager addendum (info-geometric base + canonical PH lift = one generator μ).
- `PH_RECAP_2026-06-08.md` — PH formulation recap + consistency audit with honest provenance
  labels (the abstract PassiveSystem core is curve-agnostic; instance gaps are marked).
- `LDF_DEFINITION_CHECK_2026-06-11.md` — formalization of contracts 2–3 above and the cross-curve
  admission check (research-lead, operator-invited brainstorm check).

## 4. Pointers (where the rest lives — pointers, not content)

- **Curve-specific, GH (live engine family):** `curves/gh/` — start at `curves/gh/PIVOT_MAP.md`
  (the decision map: barrier→GH swap → v26a slippage → v26b ITM/American → v26c strike
  registration → engine-faithfulness gates → queued w-warp build). GH math source of truth stays
  in `engine/knowledge/` (engine tree untouched by the restructure).
- **Curve-specific, (W)/weight family:** `curves/balancer_w/` (weight-profile kurtosis knob τ,
  heterogeneous-weight implied density; see its README for the GH cross-links).
- **Cross-link (mixed note, GH-dominant):** `curves/gh/GUDERMANNIAN_BRIDGE_2026-06-10.md` — its
  legs 1–2 (the 90°→180° fan opening σ=2χ and the Gudermannian map ũ=gd⁻¹(σ)) are exact,
  curve-INDEPENDENT geometry used by the LDF formalization here; the note lives with GH because
  its kernel-collapse/d↔kurtosis content is GH-pinned.
- **Formal results:** `formal/INDEX.md` — canonical provenance map over all Aristotle results.
  The curve-agnostic transfer accounting (which rows hold for ANY valid AMMCurve vs which are
  GH-kernel-specific) is analyzed in `curves/gh/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md` §3.
- **Left in `notes/` (mixed or out-of-scope this slice):**
  `notes/perpetual_option_reconciliation_2026-06-09.md` (perpetual-option ⟺ info-geometry
  reconciliation — agnostic Merton structure reconciled against a specific engine; flagged
  AMBIGUOUS in slice 1), `notes/rebasing_logic_note.md`, `notes/mvp_v5_brainstorm.md`
  (historical), and `notes/skeptic/` (the skeptic's channel — never moved by others).
- **The checklist every design note must disposition:** `docs/feature_inventory.md`.
