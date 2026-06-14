import Mathlib

noncomputable section
open Real

/-- THE single pure-math object (operator entry 179), with the constant-m lens (entry 229).
    Carried data: the two conserved trade charges `alpha, beta` (Casimirs of the trade flow),
    ONE state coordinate (the cash reserve `y`), and the kurtosis slope multiplier `m`.
    The lens is no longer a shape bundle — it is the single positive scalar `m`: the displayed
    local exponent is `m * gamma`, constant at every strike (`m = 1` = plain Balancer). -/
structure TemporalAMM where
  alpha : ℝ
  beta  : ℝ
  y     : ℝ
  m     : ℝ
  halpha : 0 < alpha
  hbeta  : 0 < beta
  hy     : beta < y
  hm     : 0 < m

namespace TemporalAMM

def x      (P : TemporalAMM) : ℝ := P.alpha * P.y / (P.y - P.beta)
def w      (P : TemporalAMM) : ℝ := 1 - P.beta / P.y
def gamma  (P : TemporalAMM) : ℝ := (P.y - P.beta) / P.beta
def center (P : TemporalAMM) : ℝ := P.beta / (P.y - P.beta)
def price  (P : TemporalAMM) : ℝ := (P.y - P.beta)^2 / (P.alpha * P.beta)
def carry  (P : TemporalAMM) : ℝ := Real.log P.price
def poolPotential (P : TemporalAMM) (t : ℝ) : ℝ := (t - P.beta)^3 / (3 * P.alpha * P.beta)
def trade  (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.m, P.halpha, P.hbeta, hD, P.hm⟩
def rebase (P : TemporalAMM) (r : ℝ) (hr : 0 < r) : TemporalAMM :=
  ⟨r * P.alpha, P.beta, P.y, P.m, mul_pos hr P.halpha, P.hbeta, P.hy, P.hm⟩
def lensU  (P : TemporalAMM) (θ : ℝ) : ℝ := Real.log (θ / P.center)
def g      (P : TemporalAMM) (θ : ℝ) : ℝ := P.m * P.gamma          -- constant-m: NO θ-dependence
def thetaTx (P : TemporalAMM) (θ : ℝ) : ℝ := P.center * (θ / P.center) ^ P.m  -- Real.rpow

def warpInt (P : TemporalAMM) (g0 g1 : ℝ) : ℝ := ∫ _t in g0..g1, P.m

end TemporalAMM

def gammaOfW (w : ℝ) : ℝ := w / (1 - w)
def goalSeekW (G : ℝ) : ℝ := G / (1 + G)
def sStar    (g θ : ℝ) : ℝ := θ * ((g + 1) / g) ^ g
def pasteC   (g θ : ℝ) : ℝ := 1 / ((g + 1) * sStar g θ)
def markCont (g θ s : ℝ) : ℝ := pasteC g θ * s
def markInt  (g θ s : ℝ) : ℝ := 1 - (s / θ) ^ (-(1:ℝ) / g)

namespace TemporalAMM

/-! ### Positivity plumbing -/

theorem y_pos (P : TemporalAMM) : 0 < P.y := by
  -- Since $P.y > P.beta$ and $P.beta > 0$, it follows that $P.y > 0$.
  apply lt_trans P.hbeta P.hy

theorem x_pos (P : TemporalAMM) : 0 < P.x := by
  exact div_pos ( mul_pos P.halpha P.y_pos ) ( sub_pos.mpr P.hy )

theorem w_pos (P : TemporalAMM) : 0 < P.w := by
  exact sub_pos_of_lt ( by rw [ div_lt_iff₀ ] <;> linarith [ P.hbeta, P.hy ] )

theorem w_lt_one (P : TemporalAMM) : P.w < 1 := by
  exact sub_lt_self _ ( div_pos P.hbeta ( y_pos P ) )

theorem gamma_pos (P : TemporalAMM) : 0 < P.gamma := by
  exact div_pos ( sub_pos.mpr P.hy ) P.hbeta

theorem center_pos (P : TemporalAMM) : 0 < P.center := by
  exact div_pos P.hbeta ( sub_pos.mpr P.hy )

theorem price_pos (P : TemporalAMM) : 0 < P.price := by
  exact div_pos ( sq_pos_of_pos ( sub_pos.mpr P.hy ) ) ( mul_pos P.halpha P.hbeta )

/-! ### Core algebraic identities -/

theorem invariant (P : TemporalAMM) : (P.x - P.alpha) * (P.y - P.beta) = P.alpha * P.beta := by
  unfold TemporalAMM.x;
  rw [ sub_mul, div_mul_cancel₀ ] <;> linarith [ P.hy ]

theorem w_consistency (P : TemporalAMM) : P.alpha / P.x = P.w := by
  rw [ div_eq_iff ] <;> norm_num [ TemporalAMM.x, TemporalAMM.w ];
  · rw [ one_sub_div, mul_div, mul_comm ];
    · rw [ eq_div_iff ] <;> nlinarith [ P.halpha, P.hbeta, P.hy, mul_div_cancel₀ ( P.y - P.beta ) ( ne_of_gt ( show 0 < P.y from P.y_pos ) ) ];
    · linarith [ P.y_pos ];
  · exact ⟨ ⟨ ne_of_gt P.halpha, ne_of_gt ( y_pos P ) ⟩, sub_ne_zero_of_ne ( ne_of_gt P.hy ) ⟩

theorem gamma_eq (P : TemporalAMM) : P.gamma = P.w / (1 - P.w) := by
  rw [ TemporalAMM.w, TemporalAMM.gamma ];
  -- Simplify the right-hand side of the equation.
  field_simp [P.hbeta.ne'];
  rw [ eq_div_iff ] <;> nlinarith [ P.hbeta, P.y_pos, mul_div_cancel₀ P.beta P.y_pos.ne' ]

theorem center_eq_inv_gamma (P : TemporalAMM) : P.center = 1 / P.gamma := by
  -- By definition of $P.center$ and $P.gamma$, we have $P.center = \frac{P.beta}{P.y - P.beta}$ and $P.gamma = \frac{P.y - P.beta}{P.beta}$.
  simp [TemporalAMM.center, TemporalAMM.gamma]

theorem center_eq_sNorm (P : TemporalAMM) : P.center = (1 - P.w) / P.w := by
  convert P.center_eq_inv_gamma using 1 ; rw [ P.gamma_eq ] ; ring;
  grind

theorem price_eq_slope (P : TemporalAMM) : P.price = (P.w * P.y) / ((1 - P.w) * P.x) := by
  unfold TemporalAMM.price TemporalAMM.w TemporalAMM.x;
  rw [ div_eq_div_iff ];
  · grind;
  · exact ne_of_gt ( mul_pos P.halpha P.hbeta );
  · exact mul_ne_zero ( by nlinarith [ P.hbeta, P.hy, div_mul_cancel₀ P.beta ( show P.y ≠ 0 by linarith [ P.hbeta, P.hy ] ) ] ) ( div_ne_zero ( mul_ne_zero P.halpha.ne' ( by linarith [ P.hbeta, P.hy ] ) ) ( sub_ne_zero_of_ne ( by linarith [ P.hbeta, P.hy ] ) ) )

/-! ### Metriplectic / dissipation -/

theorem price_is_grad (P : TemporalAMM) : HasDerivAt P.poolPotential P.price P.y := by
  unfold TemporalAMM.poolPotential; have := P.halpha; have := P.hbeta; have := P.hy; ( ( have := P.hbeta; ( ( unfold TemporalAMM.price; ( ( ( ( ring_nf at *; ) ) ) ) ) ) ) );
  convert HasDerivAt.add ( HasDerivAt.add ( HasDerivAt.sub ( HasDerivAt.mul ( HasDerivAt.mul ( hasDerivAt_mul_const _ ) ( hasDerivAt_const _ _ ) ) ( hasDerivAt_const _ _ ) ) ( HasDerivAt.mul ( HasDerivAt.mul ( HasDerivAt.mul ( hasDerivAt_pow 2 P.y ) ( hasDerivAt_const _ _ ) ) ( hasDerivAt_const _ _ ) ) ( hasDerivAt_const _ _ ) ) ) ( HasDerivAt.mul ( HasDerivAt.mul ( HasDerivAt.mul ( hasDerivAt_pow 3 P.y ) ( hasDerivAt_const _ _ ) ) ( hasDerivAt_const _ _ ) ) ( hasDerivAt_const _ _ ) ) ) ( hasDerivAt_const _ _ ) using 1 ; ring!

theorem R_psd (P : TemporalAMM) : ∀ t, P.beta ≤ t → 0 ≤ deriv (deriv P.poolPotential) t := by
  unfold TemporalAMM.poolPotential;
  norm_num [ div_eq_mul_inv ];
  exact fun t ht => mul_nonneg ( mul_nonneg zero_le_three ( mul_nonneg zero_le_two ( sub_nonneg.mpr ht ) ) ) ( mul_nonneg ( inv_nonneg.mpr ( le_of_lt P.hbeta ) ) ( mul_nonneg ( inv_nonneg.mpr ( le_of_lt P.halpha ) ) ( by norm_num ) ) )

/-! ### Trade flow -/

theorem trade_conserves (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    (P.trade D hD).alpha = P.alpha ∧ (P.trade D hD).beta = P.beta := by
      -- By definition of `trade`, we know that `alpha` and `beta` remain unchanged.
      simp [TemporalAMM.trade]

theorem trade_flow_group (P : TemporalAMM) (D₁ D₂ : ℝ) (h₁ : P.beta < P.y + D₁)
    (h₂ : P.beta < (P.trade D₁ h₁).y + D₂) (h₃ : P.beta < P.y + (D₁ + D₂)) :
    (P.trade D₁ h₁).trade D₂ h₂ = P.trade (D₁ + D₂) h₃ := by
      unfold TemporalAMM.trade; ring;

theorem trade_dx (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    (P.trade D hD).x - P.x =
      -(P.alpha * P.beta * D) / ((P.y - P.beta) * (P.y + D - P.beta)) := by
        unfold TemporalAMM.x TemporalAMM.trade;
        rw [ div_sub_div ] <;> ring <;> linarith [ P.hbeta, P.hy ]

theorem gamma_affine (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    (P.trade D hD).gamma = P.gamma + D / P.beta := by
      unfold TemporalAMM.gamma TemporalAMM.trade; ring;

/-! ### Rebase symmetry -/

theorem rebase_x_scales (P : TemporalAMM) (r : ℝ) (hr : 0 < r) :
    (P.rebase r hr).x = r * P.x := by
      unfold TemporalAMM.rebase TemporalAMM.x; ring;

theorem rebase_w_invariant (P : TemporalAMM) (r : ℝ) (hr : 0 < r) :
    (P.rebase r hr).w = P.w := by
      -- By definition of rebase, the new y-coordinate is P.y.
      simp [TemporalAMM.rebase, TemporalAMM.w]

theorem rebase_gamma_invariant (P : TemporalAMM) (r : ℝ) (hr : 0 < r) :
    (P.rebase r hr).gamma = P.gamma := by
      -- By definition of gamma, we know that gamma is (y - beta) / beta.
      simp [TemporalAMM.gamma, TemporalAMM.rebase]

theorem rebase_center_invariant (P : TemporalAMM) (r : ℝ) (hr : 0 < r) :
    (P.rebase r hr).center = P.center := by
      unfold TemporalAMM.center TemporalAMM.rebase; ring;

theorem rebase_m_invariant (P : TemporalAMM) (r : ℝ) (hr : 0 < r) :
    (P.rebase r hr).m = P.m := by
      -- By definition of `rebase`, the `m` value is not modified.
      simp [TemporalAMM.rebase]

theorem rebase_g_invariant (P : TemporalAMM) (r : ℝ) (hr : 0 < r) (θ : ℝ) :
    (P.rebase r hr).g θ = P.g θ := by
      -- Since rebase does not change m or gamma, the g function remains the same.
      simp [TemporalAMM.g, TemporalAMM.rebase];
      exact Or.inl rfl

theorem trade_rebase_commute (P : TemporalAMM) (r : ℝ) (hr : 0 < r) (D : ℝ)
    (hD : P.beta < P.y + D) :
    (P.rebase r hr).trade D hD = (P.trade D hD).rebase r hr := by
      unfold TemporalAMM.trade TemporalAMM.rebase; aesop;

/-! ### Constant-m lens -/

theorem g_eq_m_gamma (P : TemporalAMM) (θ : ℝ) : P.g θ = P.m * P.gamma := by
  -- By definition of $P.g$, we have $P.g θ = P.m * P.gamma$.
  simp [TemporalAMM.g]

theorem g_const_in_strike (P : TemporalAMM) (θ₁ θ₂ : ℝ) : P.g θ₁ = P.g θ₂ := by
  -- By definition of $g$, we know that $g(\theta) = m \cdot \gamma$ for any $\theta$.
  simp [TemporalAMM.g]

theorem g_pos (P : TemporalAMM) (θ : ℝ) : 0 < P.g θ := by
  exact mul_pos P.hm P.gamma_pos

theorem g_eq_gamma_iff_m_one (P : TemporalAMM) (θ : ℝ) : P.g θ = P.gamma ↔ P.m = 1 := by
  rw [ TemporalAMM.g_eq_m_gamma, mul_comm ];
  exact ⟨ fun h => mul_left_cancel₀ ( ne_of_gt ( TemporalAMM.gamma_pos P ) ) <| by linarith, fun h => by rw [ h, mul_one ] ⟩

theorem g_ge_gamma_of_m_ge_one (P : TemporalAMM) (θ : ℝ) : 1 ≤ P.m → P.gamma ≤ P.g θ := by
  exact fun h => le_mul_of_one_le_left ( TemporalAMM.gamma_pos P |> le_of_lt ) h

theorem thetaTx_roundtrip (P : TemporalAMM) (θ : ℝ) (hθ : 0 < θ) (hm : 0 < P.m) :
    P.center * (P.thetaTx θ / P.center) ^ (1 / P.m) = θ := by
      rw [ TemporalAMM.thetaTx, mul_div_cancel_left₀ ];
      · rw [ ← Real.rpow_mul ( div_nonneg hθ.le ( le_of_lt ( TemporalAMM.center_pos P ) ) ), mul_one_div_cancel hm.ne', Real.rpow_one, mul_div_cancel₀ _ ( ne_of_gt ( TemporalAMM.center_pos P ) ) ];
      · exact ne_of_gt ( TemporalAMM.center_pos P )

theorem thetaTx_strictMono (P : TemporalAMM) (hm : 0 < P.m) :
    StrictMonoOn (P.thetaTx) (Set.Ioi 0) := by
      intros a ha b hb hab; have h_center_pos : 0 < P.center := by
        exact P.center_pos;
      exact mul_lt_mul_of_pos_left ( Real.rpow_lt_rpow ( div_nonneg ha.out.le h_center_pos.le ) ( by rw [ div_lt_div_iff_of_pos_right h_center_pos ] ; exact hab ) hm ) h_center_pos

/-! ### Warp (linear) -/

theorem warp_linear (P : TemporalAMM) (g0 g1 : ℝ) : P.warpInt g0 g1 = P.m * (g1 - g0) := by
  convert intervalIntegral.integral_const P.m using 1 ; ring;
  norm_num [ mul_comm, mul_sub ]

theorem warp_roundtrip_zero (P : TemporalAMM) (g0 g1 : ℝ) :
    P.warpInt g0 g1 + P.warpInt g1 g0 = 0 := by
      rw [ TemporalAMM.warpInt, TemporalAMM.warpInt ] ; ring;
      norm_num [ intervalIntegral ]

theorem warp_nonneg_of_buy (P : TemporalAMM) (g0 g1 : ℝ) (h : g0 ≤ g1) :
    0 ≤ P.warpInt g0 g1 := by
      exact mul_nonneg P.hm.le ( sub_nonneg.mpr h ) |> fun h => by rw [ TemporalAMM.warp_linear ] ; exact h;

theorem warp_eq_m_dgamma (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    P.warpInt P.gamma ((P.trade D hD).gamma) = P.m * (D / P.beta) := by
      have := @gamma_affine P D hD;
      rw [ this, TemporalAMM.warp_linear ] ; ring

end TemporalAMM

/-! ### Smooth-paste (global) -/

theorem paste_value (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
    markCont g θ (sStar g θ) = markInt g θ (sStar g θ) := by
      unfold markCont markInt sStar pasteC;
      unfold sStar;
      field_simp;
      rw [ ← Real.rpow_mul ( by positivity ), mul_neg, mul_comm ] ; norm_num [ hg.ne' ];
      rw [ Real.rpow_neg_one, inv_div, sub_mul, div_mul_cancel₀ ] <;> linarith

theorem paste_slope (g θ : ℝ) (hg : 0 < g) (hθ : 0 < θ) :
    HasDerivAt (markInt g θ) (pasteC g θ) (sStar g θ) := by
      convert HasDerivAt.const_sub 1 ( HasDerivAt.rpow_const ( HasDerivAt.div_const ( hasDerivAt_id' _ ) _ ) _ ) using 1 <;> norm_num [ hg.ne', hθ.ne' ];
      · unfold pasteC sStar; ring;
        rw [ Real.rpow_sub ( by positivity ), Real.rpow_neg_one ] ; ring;
        field_simp;
        rw [ ← Real.rpow_mul ( by positivity ), mul_one_div_cancel ( by positivity ), Real.rpow_one, mul_div_cancel₀ _ ( by positivity ) ];
      · exact Or.inl <| ne_of_gt <| mul_pos hθ <| Real.rpow_pos_of_pos ( div_pos ( add_pos hg zero_lt_one ) hg ) _

/-! ### Goal-seek -/

theorem goalSeek_root : ∀ G, 0 < G → gammaOfW (goalSeekW G) = G := by
  grind +locals

theorem goalSeek_ge_half (G : ℝ) : 1 ≤ G → 1/2 ≤ goalSeekW G := by
  exact fun h => by rw [ goalSeekW ] ; rw [ le_div_iff₀ ] <;> linarith;

theorem goalSeek_strictMono : StrictMonoOn goalSeekW (Set.Ioi 0) := by
  intro a ha b hb hab; rw [ goalSeekW, goalSeekW ] ; rw [ div_lt_div_iff₀ ] <;> nlinarith [ ha.out, hb.out ] ;

/-! ### Engine instance -/

def engineInstance : TemporalAMM :=
  ⟨725, 275, 1000, 1, by norm_num, by norm_num, by norm_num, by norm_num⟩

theorem engineInstance_x : engineInstance.x = 1000 := by
  -- Calculate the value of `x` for the engine instance.
  norm_num [engineInstance, TemporalAMM.x]

theorem engineInstance_w : engineInstance.w = 29/40 := by
  -- Calculate the value of `w` for the engine instance.
  norm_num [engineInstance, TemporalAMM.w]

theorem engineInstance_gamma : engineInstance.gamma = 29/11 := by
  -- Calculate the value of `gamma` for the engine instance.
  norm_num [engineInstance, TemporalAMM.gamma]

theorem engineInstance_g_eq_gamma : ∀ θ, engineInstance.g θ = engineInstance.gamma := by
  -- Since engineInstance.m is 1, multiplying by 1 doesn't change the value. Therefore, engineInstance.g θ simplifies to engineInstance.gamma.
  simp [TemporalAMM.g, engineInstance]

theorem engineInstance_gamma_gt_one : 1 < engineInstance.gamma := by
  -- By definition of `engineInstance`, we know that `engineInstance.gamma = 29 / 11`.
  norm_num [engineInstance, TemporalAMM.gamma]

/-! ### Single object headline -/

theorem single_object (P Q : TemporalAMM) (ha : P.alpha = Q.alpha) (hb : P.beta = Q.beta)
    (hyy : P.y = Q.y) (hmm : P.m = Q.m) :
    P.x = Q.x ∧ P.w = Q.w ∧ P.gamma = Q.gamma ∧ P.center = Q.center ∧ P.price = Q.price ∧
      ∀ θ, P.g θ = Q.g θ := by
        -- Since P and Q have the same alpha, beta, y, and m, their x, w, gamma, center, price, and g are all equal.
        simp [ha, hb, hyy, hmm, TemporalAMM.x, TemporalAMM.w, TemporalAMM.gamma, TemporalAMM.center, TemporalAMM.price, TemporalAMM.g]

end