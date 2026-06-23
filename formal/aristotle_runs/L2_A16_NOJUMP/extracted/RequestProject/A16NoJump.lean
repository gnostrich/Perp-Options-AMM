/-
  Aristotle obligation L2 — A16 ATM no-jump.

  Promotes the A16 ATM-no-jump fact (previously only gate-verified by
  `a16_atm_gate.js`) to a real Lean theorem: under the constant-m lens
  (`g = m·γ > 0`), the held-position value is continuous across the ATM
  (mode) crossing `sNorm = θ`, with NO jump and NO regime branch, and the
  call arm equals the put arm at the mode.

  This is DISTINCT from the smooth-paste seam at `S*`: A16 is continuity at
  the ATM crossing `sNorm = θ`, an ordinary point of a clean power law.

  Self-contained; does NOT import the canonical modules.
-/
import Mathlib

noncomputable section
open Real

/-- call-arm free boundary S* (normalized value frame). -/
def sStarCall (g θ : ℝ) : ℝ := θ * ((g + 1) / g) ^ g
/-- put-arm free boundary S* (normalized value frame). -/
def sStarPut  (g θ : ℝ) : ℝ := θ * (g / (g + 1)) ^ g
/-- continuation slope c (call arm). -/
def pasteC    (g θ : ℝ) : ℝ := 1 / ((g + 1) * sStarCall g θ)
/-- the held-position lensed mark, call arm = sNorm/θ side (engine `markLensed` call branch):
    continuation `c·s` for s ≤ S*_call, intrinsic `1 − (s/θ)^(−1/g)` past it. -/
def markCall (g θ s : ℝ) : ℝ :=
  if s ≤ sStarCall g θ then pasteC g θ * s else 1 - (s / θ) ^ (-(1:ℝ) / g)
/-- the held-position lensed mark, put arm = θ/sNorm side (engine `markLensed` put branch):
    continuation `S*_put / ((g+1)·s)` for s ≥ S*_put, intrinsic `1 − (s/θ)^(1/g)` below it. -/
def markPut (g θ s : ℝ) : ℝ :=
  if sStarPut g θ ≤ s then sStarPut g θ / ((g + 1) * s) else 1 - (s / θ) ^ ((1:ℝ) / g)

/-
at the mode `s = θ` the call arm is in the CONTINUATION region (`θ < S*_call`).
-/
theorem sStarCall_gt_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) : θ < sStarCall g θ := by
  exact lt_mul_of_one_lt_right hθ ( by { exact Real.one_lt_rpow ( by { rw [ lt_div_iff₀ ] <;> linarith } ) hg } )

/-
at the mode the put arm is in the continuation region (`S*_put < θ`).
-/
theorem sStarPut_lt_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) : sStarPut g θ < θ := by
  convert mul_lt_of_lt_one_right hθ _ using 1;
  exact Real.rpow_lt_one ( by positivity ) ( by rw [ div_lt_iff₀ ] <;> linarith ) ( by positivity )

/-
the call-arm value at the mode is the constant-g smooth-paste value.
-/
theorem markCall_at_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
    markCall g θ θ = 1 / ((g + 1) * ((g + 1) / g) ^ g) := by
  convert ( if_pos ?_ ) using 1;
  · unfold pasteC sStarCall; ring ;
    grind;
  · exact le_of_lt ( sStarCall_gt_mode g θ hg hθ )

/-
the put-arm value at the mode equals the SAME value.
-/
theorem markPut_at_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
    markPut g θ θ = 1 / ((g + 1) * ((g + 1) / g) ^ g) := by
  unfold markPut; simp +decide [ ne_of_gt, *, sStarPut ] ;
  rw [ if_pos ( Real.rpow_le_one ( by positivity ) ( by rw [ div_le_iff₀ ( by positivity ) ] ; linarith ) ( by positivity ) ), Real.div_rpow ] <;> try positivity;
  rw [ Real.div_rpow ( by positivity ) ( by positivity ) ] ; ring!;
  grind

/-
THE HEADLINE — call arm == put arm at the ATM crossing.
-/
theorem arms_agree_at_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
    markCall g θ θ = markPut g θ θ := by
  rw [ markCall_at_mode g θ hg hθ, markPut_at_mode g θ hg hθ ]

/-
the call-arm held-position value is continuous at the mode (no jump).
-/
theorem markCall_continuousAt_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
    ContinuousAt (markCall g θ) θ := by
  -- Since θ < sStarCall, there exists a neighborhood around θ where s < sStarCall. In this neighborhood, markCall g θ is equal to pasteC g θ * s.
  have h_neighborhood : ∀ᶠ s in nhds θ, s < sStarCall g θ := by
    exact Iio_mem_nhds ( sStarCall_gt_mode g θ hg hθ );
  refine' ContinuousAt.congr _ _;
  exacts [ fun s => pasteC g θ * s, Continuous.continuousAt ( by continuity ), h_neighborhood.mono fun s hs => by unfold markCall; rw [ if_pos hs.le ] ]

/-
the put-arm value is continuous at the mode.
-/
theorem markPut_continuousAt_mode (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
    ContinuousAt (markPut g θ) θ := by
  refine' ContinuousAt.congr _ _;
  exact fun s => sStarPut g θ / ( ( g + 1 ) * s );
  · exact ContinuousAt.div continuousAt_const ( ContinuousAt.mul continuousAt_const continuousAt_id ) ( by positivity );
  · filter_upwards [ lt_mem_nhds ( show θ > sStarPut g θ from sStarPut_lt_mode g θ hg hθ ) ] with s hs using by unfold markPut; split_ifs <;> linarith;
#print axioms arms_agree_at_mode
#print axioms markCall_continuousAt_mode
#print axioms markPut_continuousAt_mode
