/-
  CLOSEOUT item 2 — DISCHARGE the carried GH integrability / finite-MGF facts.

  The GH kernel in the natural coordinate v ∈ ℝ:
      ghKernel αh βh δ v = exp(−αh·√(δ²+v²) + βh·v),   with αh > |βh| (here αh = γ+1, βh = 1).
  RUN-4 already proved the exponent decay bound (reproduced as `ghKernel_exponent_le`):
      −αh·√(δ²+v²) + βh·v ≤ −(αh − |βh|)·|v|,   since √(δ²+v²) ≥ |v|.
  So ghKernel v ≤ exp(−c·|v|) with c = αh − |βh| > 0, an INTEGRABLE majorant.

  GOAL — turn the previously-CARRIED hypotheses into PROVED theorems (no `sorry`, no carried
  field for these), using only the decay bound + Mathlib's exp-decay integrability machinery
  (NOT the Bessel-K closed form):

  (T1) `ghKernel_le_exp_decay`  : ghKernel αh βh δ v ≤ exp(−c·|v|)   [direct from the exponent bound].
  (T2) `integrable_exp_neg_c_abs`: Integrable (fun v => exp(−c·|v|)) volume for c > 0
        (Mathlib has this — find the lemma, e.g. `integrable_exp_neg_mul_abs` / via
         `Real.integrable_exp_neg_mul` on each half-line; no `sorry`).
  (T3) `integrable_ghKernel`    : Integrable (ghKernel αh βh δ) volume  [Integrable.mono / mono'
        against the majorant in (T2); ghKernel ≥ 0 so |ghKernel| = ghKernel].
  (T4) `ghIntegral_pos`         : 0 < ∫ v, ghKernel αh βh δ v   [integrand strictly positive
        everywhere + integrable ⇒ positive integral; e.g. `integral_pos_iff_support_of_nonneg`
        or `setIntegral`/`integral_pos` machinery].
  (T5) `isProbabilityMeasure_ghProb` : with Z := ∫ ghKernel (> 0 by T4), the normalized measure
        ghProb := (volume.withDensity (fun v => ENNReal.ofReal (ghKernel αh βh δ v / Z))) is an
        `IsProbabilityMeasure` — i.e. its total mass is 1.  WITHOUT any Bessel-K value of Z.
  (T6) `integrable_ghKernel_tilt` : for any real tilt parameter t with αh > |βh + t| (the open
        strip), Integrable (fun v => exp(t·v) * ghKernel αh βh δ v) volume — the tilted kernel is
        STILL exp-decaying with rate αh − |βh + t| > 0, so the MGF ∫ exp(t·v) dghProb is FINITE on
        the strip.  Prove via the SAME exponent bound with βh ↦ βh + t.

  CONSTRAINTS:
  • Keep `ghKernel` and `ghKernel_exponent_le` EXACTLY as below (do not change the definition or the
    statement of the bound).  These are the RUN-4 objects.
  • NO `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`.  NO live `exact?`/`apply?`/`grind`/
    `grind +suggestions`/`aesop?`/`hint` in the RETURNED proofs (search tactics = fragile, not
    clean).  Plain `aesop`, `simp`, `nlinarith`, `positivity`, kernel `decide` are fine.
  • Do NOT introduce the Bessel-K closed form or assert any numeric value of Z.  The PROBABILITY-
    MEASURE and FINITE-MGF claims must follow from positivity + integrability ALONE.

  If any sub-goal genuinely cannot be closed without a Mathlib gap, leave THAT ONE as an explicitly
  named `sorry` and say which lemma is missing — do NOT fake the others.

  Toolchain: Lean 4.28.0 + Mathlib v4.28.0.
-/
import Mathlib

open Real MeasureTheory ProbabilityTheory
open scoped ENNReal

noncomputable section
namespace GHMeasure

/-- The GH kernel (unnormalized GH density in the natural coordinate). -/
def ghKernel (αh βh δ v : ℝ) : ℝ := Real.exp (-(αh) * Real.sqrt (δ ^ 2 + v ^ 2) + βh * v)

/-- GROUNDED (RUN-4): strictly positive everywhere. -/
theorem ghKernel_pos (αh βh δ v : ℝ) : 0 < ghKernel αh βh δ v := by
  unfold ghKernel; positivity

/-- GROUNDED (RUN-4): the exponent decay bound.  KEEP EXACTLY. -/
theorem ghKernel_exponent_le (αh βh δ v : ℝ) (hαβ : |βh| ≤ αh) :
    -(αh) * Real.sqrt (δ ^ 2 + v ^ 2) + βh * v ≤ -(αh - |βh|) * |v| := by
  cases abs_cases βh <;> cases abs_cases v <;>
    nlinarith [ show Real.sqrt ( δ ^ 2 + v ^ 2 ) ≥ |v| by
      exact Real.abs_le_sqrt ( by nlinarith ) ]

/-- T1 — pointwise: ghKernel ≤ exp(−c·|v|) with c = αh − |βh|. -/
theorem ghKernel_le_exp_decay (αh βh δ v : ℝ) (hαβ : |βh| ≤ αh) :
    ghKernel αh βh δ v ≤ Real.exp (-(αh - |βh|) * |v|) := by
  unfold ghKernel
  exact Real.exp_le_exp.mpr (ghKernel_exponent_le αh βh δ v hαβ)

/-
T2 — the majorant exp(−c·|v|) is integrable on ℝ for c > 0.
-/
theorem integrable_exp_neg_c_abs (c : ℝ) (hc : 0 < c) :
    Integrable (fun v : ℝ => Real.exp (-c * |v|)) volume := by
  -- Split the integral into two parts: one over $(-\infty, 0)$ and one over $(0, \infty)$.
  have h_split : MeasureTheory.IntegrableOn (fun v => Real.exp (-c * abs v)) (Set.Ioi 0) ∧ MeasureTheory.IntegrableOn (fun v => Real.exp (-c * abs v)) (Set.Iio 0) := by
    constructor;
    · have := exp_neg_integrableOn_Ioi 0 hc;
      exact this.congr_fun ( fun x hx => by rw [ abs_of_pos hx.out ] ) measurableSet_Ioi;
    · have h_integrable_neg : ∫ v in Set.Iio 0, Real.exp (-c * |v|) = ∫ v in Set.Ioi 0, Real.exp (-c * v) := by
        rw [ ← MeasureTheory.integral_Iic_eq_integral_Iio ] ; rw [ ← neg_zero, ← integral_comp_neg_Iic ] ; norm_num;
        exact MeasureTheory.setIntegral_congr_fun measurableSet_Iic fun x hx => by rw [ abs_of_nonpos hx.out ] ; ring;
      contrapose! h_integrable_neg;
      rw [ MeasureTheory.integral_undef h_integrable_neg ] ; exact ne_of_lt ( by exact ( by exact ( by exact ( by exact ( by exact ( by exact ( by exact ( by exact ( by exact ( by exact ( by exact ( by exact ( by exact by have := integral_exp_neg_mul_rpow zero_lt_one hc; norm_num [ Real.rpow_neg_one ] at *; exact this.symm ▸ by positivity ) ) ) ) ) ) ) ) ) ) ) ) ) ;
  convert MeasureTheory.IntegrableOn.integrable ( h_split.1.union h_split.2 ) using 1;
  norm_num [ Set.union_comm ]

/-
T3 — the GH kernel is integrable.
-/
theorem integrable_ghKernel (αh βh δ : ℝ) (hαβ : |βh| < αh) :
    Integrable (ghKernel αh βh δ) volume := by
  refine' MeasureTheory.Integrable.mono' _ _ _;
  refine' fun v => Real.exp ( - ( αh - |βh| ) * |v| );
  · convert integrable_exp_neg_c_abs ( αh - |βh| ) ( sub_pos.mpr hαβ ) using 1;
  · exact Continuous.aestronglyMeasurable ( by unfold ghKernel; continuity );
  · filter_upwards [ ] with v using by rw [ Real.norm_of_nonneg ( ghKernel_pos αh βh δ v |> le_of_lt ) ] ; exact ghKernel_le_exp_decay αh βh δ v hαβ.le;

/-
T4 — its integral is strictly positive.
-/
theorem ghIntegral_pos (αh βh δ : ℝ) (hαβ : |βh| < αh) :
    0 < ∫ v, ghKernel αh βh δ v := by
  rw [ MeasureTheory.integral_pos_iff_support_of_nonneg_ae ];
  · rw [ show Function.support ( ghKernel αh βh δ ) = Set.univ from Set.eq_univ_of_forall fun x => ne_of_gt <| ghKernel_pos αh βh δ x ] ; norm_num;
  · exact Filter.Eventually.of_forall fun x => le_of_lt ( ghKernel_pos αh βh δ x );
  · -- Apply the theorem that states the GH kernel is integrable under the given conditions.
    apply integrable_ghKernel; exact hαβ

/-- The normalized GH probability density. -/
def ghDensity (αh βh δ : ℝ) (v : ℝ) : ℝ :=
  ghKernel αh βh δ v / (∫ w, ghKernel αh βh δ w)

/-- The GH probability MEASURE (withDensity of the normalized kernel). -/
def ghProb (αh βh δ : ℝ) : Measure ℝ :=
  volume.withDensity (fun v => ENNReal.ofReal (ghDensity αh βh δ v))

/-
T5 — ghProb is a genuine probability measure (total mass 1), WITHOUT any Bessel-K value.
-/
theorem isProbabilityMeasure_ghProb (αh βh δ : ℝ) (hαβ : |βh| < αh) :
    IsProbabilityMeasure (ghProb αh βh δ) := by
  have h_genuine : ∫⁻ v, ENNReal.ofReal (ghKernel αh βh δ v / (∫ w, ghKernel αh βh δ w)) ∂MeasureTheory.volume = 1 := by
    convert congr_arg ENNReal.ofReal ( MeasureTheory.integral_div ( f := fun v => ghKernel αh βh δ v ) ( ∫ w, ghKernel αh βh δ w ) ) using 1;
    rw [ MeasureTheory.ofReal_integral_eq_lintegral_ofReal ];
    · exact MeasureTheory.Integrable.div_const ( integrable_ghKernel αh βh δ hαβ ) _;
    · exact Filter.Eventually.of_forall fun x => div_nonneg ( le_of_lt ( ghKernel_pos αh βh δ x ) ) ( MeasureTheory.integral_nonneg fun _ => le_of_lt ( ghKernel_pos αh βh δ _ ) );
    · rw [ div_self <| ne_of_gt <| ghIntegral_pos αh βh δ hαβ, ENNReal.ofReal_one ];
  constructor;
  unfold ghProb;
  unfold ghDensity; aesop;

/-
T6 — the tilted kernel exp(t·v)·ghKernel is integrable whenever the tilt stays in the strip
    αh > |βh + t|, i.e. the MGF is finite on the open strip.  Proof: exp(t·v)·ghKernel βh
    = ghKernel (βh+t), which is integrable by T3 with the shifted skew parameter.
-/
theorem integrable_ghKernel_tilt (αh βh δ t : ℝ) (hstrip : |βh + t| < αh) :
    Integrable (fun v => Real.exp (t * v) * ghKernel αh βh δ v) volume := by
  convert integrable_ghKernel αh ( βh + t ) δ hstrip using 2 ; ring_nf;
  unfold ghKernel; rw [ ← Real.exp_add ] ; ring_nf;

end GHMeasure

#print axioms GHMeasure.integrable_exp_neg_c_abs
#print axioms GHMeasure.integrable_ghKernel
#print axioms GHMeasure.ghIntegral_pos
#print axioms GHMeasure.isProbabilityMeasure_ghProb
#print axioms GHMeasure.integrable_ghKernel_tilt