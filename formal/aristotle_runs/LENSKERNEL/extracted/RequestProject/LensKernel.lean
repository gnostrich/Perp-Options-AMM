import Mathlib

namespace LensKernel

/-- Pool state {x, y, alpha, beta}; w is derived. Mirrors the engine state object. -/
structure Pool where
  x : ℝ
  y : ℝ
  alpha : ℝ
  beta : ℝ

/-- Regular (live-domain) pool: positive reserves, 0<w<1, cash above beta, and the
hyperbola invariant. Mirrors the engine's implicit domain. -/
def Pool.Reg (s : Pool) : Prop :=
  0 < s.alpha ∧ s.alpha < s.x ∧ 0 < s.beta ∧ s.beta < s.y ∧
  (s.x - s.alpha) * (s.y - s.beta) = s.alpha * s.beta

noncomputable def Pool.w (s : Pool) : ℝ := s.alpha / s.x            -- getW, HEAD L1601
noncomputable def Pool.center (s : Pool) : ℝ := (1 - s.w) / s.w     -- getSNorm, HEAD L1602
noncomputable def Pool.gamma (s : Pool) : ℝ := s.w / (1 - s.w)      -- γ = w/(1−w), gLoc body HEAD L1641
noncomputable def Pool.mpRaw (s : Pool) : ℝ := s.w * s.y / ((1 - s.w) * s.x)  -- getMP_raw, HEAD L1604

/-- Identity-IV closed-form trade update. Mirrors tradeUpdate, HEAD L1679–1687:
dx = −αβ·dy/((y−β)(y+dy−β)); alpha, beta carried unchanged. -/
noncomputable def tradeUpdate (s : Pool) (dy : ℝ) : Pool :=
  { x := s.x - s.alpha * s.beta * dy / ((s.y - s.beta) * (s.y + dy - s.beta))
    y := s.y + dy
    alpha := s.alpha
    beta := s.beta }

/-- Rebase: x→rx, α→rα, y and β invariant. Mirrors rebase, HEAD L1691–1693. -/
def rebase (s : Pool) (r : ℝ) : Pool :=
  { x := r * s.x, y := s.y, alpha := r * s.alpha, beta := s.beta }

noncomputable def hT (tau u : ℝ) : ℝ := Real.sqrt (tau^2 + u^2) - tau   -- hTau, HEAD L1630
noncomputable def Phi (tau u : ℝ) : ℝ := u / Real.sqrt (tau^2 + u^2)    -- hpTau (h′_τ), HEAD L1631
noncomputable def lensU (s : Pool) (theta : ℝ) : ℝ := Real.log (theta / s.center)  -- lensU, HEAD L1633
noncomputable def gLoc (s : Pool) (theta tau : ℝ) : ℝ :=
  s.gamma * Phi tau |lensU s theta|                                      -- gLoc, HEAD L1639–1645

/-- Call-arm free boundary, continuation, intrinsic. Mirrors markLensed call arm,
HEAD L1655–1660. Real.rpow throughout. -/
noncomputable def sStarCall (theta g : ℝ) : ℝ := theta * ((g + 1) / g) ^ (g : ℝ)
noncomputable def contCall (theta g sN : ℝ) : ℝ := sN / ((g + 1) * sStarCall theta g)
noncomputable def intrCall (theta g sN : ℝ) : ℝ := 1 - (sN / theta) ^ (-(1 / g) : ℝ)

/-! ## Pool / flow -/

theorem tradeUpdate_alpha (s : Pool) (dy : ℝ) : (tradeUpdate s dy).alpha = s.alpha := by
  rfl

theorem tradeUpdate_beta (s : Pool) (dy : ℝ) : (tradeUpdate s dy).beta = s.beta := by
  rfl

theorem tradeUpdate_hyperbola (s : Pool) (dy : ℝ) (hs : s.Reg)
    (hdy : 0 < s.y + dy - s.beta) :
    ((tradeUpdate s dy).x - s.alpha) * ((tradeUpdate s dy).y - s.beta) = s.alpha * s.beta := by
  obtain ⟨ hx₁, hx₂, hy₁, hy₂, h ⟩ := hs;
  unfold tradeUpdate; nlinarith [ mul_div_cancel₀ ( s.alpha * s.beta * dy ) ( by nlinarith : ( s.y - s.beta ) * ( s.y + dy - s.beta ) ≠ 0 ) ] ;

theorem tradeUpdate_reg (s : Pool) (dy : ℝ) (hs : s.Reg) (hdy : 0 < s.y + dy - s.beta) :
    (tradeUpdate s dy).Reg := by
  refine ⟨hs.1, ?_, hs.2.2.1, ?_, ?_⟩
  · unfold tradeUpdate
    obtain ⟨_, _, _, _, h⟩ := hs
    rw [sub_div', lt_div_iff₀] <;> nlinarith [mul_pos ‹0 < s.alpha› ‹0 < s.beta›]
  · show s.beta < s.y + dy
    linarith
  · exact tradeUpdate_hyperbola s dy hs hdy

theorem w_closed_form (s : Pool) (hs : s.Reg) : s.w = 1 - s.beta / s.y := by
  obtain ⟨ha, hax, hb, hby, h⟩ := hs
  unfold Pool.w
  have hx : s.x ≠ 0 := by linarith
  have hy : s.y ≠ 0 := by linarith
  field_simp
  nlinarith [h]

theorem gamma_closed_form (s : Pool) (hs : s.Reg) : s.gamma = (s.y - s.beta) / s.beta := by
  obtain ⟨ha, hax, hb, hby, h⟩ := hs
  rw [show s.gamma = (s.alpha / s.x) / (1 - s.alpha / s.x) from rfl, div_div, mul_sub, mul_one,
    mul_div_cancel₀ _ (by linarith : s.x ≠ 0)]
  rw [div_eq_div_iff (by linarith) (by linarith)]
  nlinarith [h]

theorem center_closed_form (s : Pool) (hs : s.Reg) : s.center = s.beta / (s.y - s.beta) := by
  unfold Pool.center Pool.w;
  rw [ one_sub_div, div_div_eq_mul_div ];
  · rw [ div_mul_cancel₀, div_eq_div_iff ] <;> nlinarith [ hs.1, hs.2.1, hs.2.2.1, hs.2.2.2.1, hs.2.2.2.2 ];
  · linarith [ hs.1, hs.2.1 ]

/-- `center = 1/γ`. The hypothesis `hs : s.Reg` is requested by the spec but turns out to be
unnecessary (it is a purely algebraic identity between the two definitions). -/
theorem center_eq_inv_gamma (s : Pool) (hs : s.Reg) : s.center = 1 / s.gamma := by
  unfold Pool.center Pool.gamma
  rw [one_div_div]

theorem gamma_linear_in_cash (s : Pool) (dy : ℝ) (hs : s.Reg) (hdy : 0 < s.y + dy - s.beta) :
    (tradeUpdate s dy).gamma = s.gamma + dy / s.beta := by
  rw [gamma_closed_form _ (tradeUpdate_reg s dy hs hdy), gamma_closed_form s hs]
  obtain ⟨ha, hax, hb, hby, h⟩ := hs
  have hb' : s.beta ≠ 0 := by linarith
  show (s.y + dy - s.beta) / s.beta = (s.y - s.beta) / s.beta + dy / s.beta
  field_simp
  ring

theorem mpRaw_closed_form (s : Pool) (hs : s.Reg) : s.mpRaw = s.beta * s.gamma^2 / s.alpha := by
  rw [gamma_closed_form s hs]
  obtain ⟨ha, hax, hb, hby, h⟩ := hs
  have hx : s.x ≠ 0 := by linarith
  have hb' : s.beta ≠ 0 := by linarith
  have ha' : s.alpha ≠ 0 := by linarith
  have hxam : s.x - s.alpha ≠ 0 := by intro hc; nlinarith
  have key : s.alpha * s.y = s.x * (s.y - s.beta) := by linear_combination -h
  rw [show s.mpRaw = s.alpha / s.x * s.y / ((1 - s.alpha / s.x) * s.x) from rfl,
    show (1 - s.alpha / s.x) * s.x = s.x - s.alpha by field_simp]
  field_simp
  linear_combination (s.alpha * s.beta) * key - s.x * (s.y - s.beta) * h

/-! ## Rebase -/

theorem rebase_w (s : Pool) (r : ℝ) (hr : 0 < r) : (rebase s r).w = s.w := by
  unfold rebase Pool.w
  rw [mul_div_mul_left _ _ hr.ne']

theorem rebase_gamma (s : Pool) (r : ℝ) (hr : 0 < r) : (rebase s r).gamma = s.gamma := by
  convert congr_arg ( fun w => w / ( 1 - w ) ) ( rebase_w s r hr ) using 1

theorem rebase_center (s : Pool) (r : ℝ) (hr : 0 < r) : (rebase s r).center = s.center := by
  unfold Pool.center; simp +decide [ *, rebase_w ] ;

theorem gLoc_rebase_invariant (s : Pool) (r theta tau : ℝ) (hr : 0 < r) :
    gLoc (rebase s r) theta tau = gLoc s theta tau := by
  unfold gLoc lensU
  rw [rebase_gamma s r hr, rebase_center s r hr]

/-! ## Lens basics -/

theorem Phi_zero (tau : ℝ) : Phi tau 0 = 0 := by
  -- By definition of Phi, we have Phi tau 0 = 0 / sqrt(tau^2 + 0^2) = 0.
  simp [Phi]

theorem Phi_nonneg (tau u : ℝ) (hu : 0 ≤ u) : 0 ≤ Phi tau u := by
  exact div_nonneg hu ( Real.sqrt_nonneg _ )

/-- `Φ ≤ 1` on `u ≥ 0`. The hypothesis `hu : 0 ≤ u` is requested by the spec but turns out to be
unnecessary (`Φ < 1` already for negative `u`). -/
theorem Phi_le_one (tau u : ℝ) (hu : 0 ≤ u) : Phi tau u ≤ 1 := by
  exact div_le_one_of_le₀ ( Real.le_sqrt_of_sq_le ( by nlinarith ) ) ( Real.sqrt_nonneg _ )

theorem Phi_lt_one (tau u : ℝ) (htau : 0 < tau) : Phi tau u < 1 := by
  exact div_lt_one ( by positivity ) |>.2 ( by nlinarith [ Real.lt_sqrt_of_sq_lt ( by nlinarith : tau ^ 2 + u ^ 2 > u ^ 2 ) ] )

theorem Phi_strictMonoOn (tau : ℝ) (htau : 0 < tau) : StrictMonoOn (Phi tau) (Set.Ici 0) := by
  intro u hu v hv huv; simp_all +decide;
  rw [ Phi, Phi, div_lt_div_iff₀ ] <;> try positivity;
  -- Squaring both sides to remove the square roots.
  suffices h_sq : (u * Real.sqrt (tau ^ 2 + v ^ 2))^2 < (v * Real.sqrt (tau ^ 2 + u ^ 2))^2 by
    contrapose! h_sq; gcongr;
  rw [ mul_pow, mul_pow, Real.sq_sqrt <| by positivity, Real.sq_sqrt <| by positivity ] ; nlinarith [ mul_lt_mul_of_pos_left huv htau, mul_lt_mul_of_pos_left huv <| sq_pos_of_pos htau ] ;

/-- `gLoc ≥ 0`. The hypothesis `htau : 0 ≤ tau` is requested by the spec but turns out to be
unnecessary (the bound holds for every `tau`). -/
theorem gLoc_nonneg (s : Pool) (theta tau : ℝ) (hs : s.Reg) (htau : 0 ≤ tau) :
    0 ≤ gLoc s theta tau := by
  apply_rules [ mul_nonneg, Phi_nonneg ];
  · linarith [ hs.1 ];
  · exact inv_nonneg.2 ( by linarith [ hs.1, hs.2.1 ] );
  · exact inv_nonneg.2 ( sub_nonneg.2 <| by rw [ Pool.w ] ; rw [ div_le_iff₀ ] <;> linarith [ hs.1, hs.2.1 ] );
  · positivity;
  · positivity

theorem gLoc_le_gamma (s : Pool) (theta tau : ℝ) (hs : s.Reg) :
    gLoc s theta tau ≤ s.gamma := by
  refine mul_le_of_le_one_right ?_ ?_;
  · exact gamma_closed_form s hs ▸ div_nonneg ( sub_nonneg.2 hs.2.2.2.1.le ) hs.2.2.1.le;
  · exact Phi_le_one _ _ ( abs_nonneg _ )

/-- `gLoc` vanishes at the mode `s.center`. The hypothesis `hs : s.Reg` is requested by the spec
but turns out to be unnecessary (`lensU s s.center = log 1 = 0` regardless). -/
theorem gLoc_at_mode (s : Pool) (tau : ℝ) (hs : s.Reg) : gLoc s s.center tau = 0 := by
  unfold gLoc lensU;
  by_cases h : s.center = 0 <;> simp_all +decide; all_goals exact Or.inr ( Phi_zero _ )

/-! ## Smooth-paste port -/

theorem sStarCall_pos (theta g : ℝ) (hg : 0 < g) (hθ : 0 < theta) : 0 < sStarCall theta g := by
  exact mul_pos hθ ( Real.rpow_pos_of_pos ( by positivity ) _ )

theorem sStarCall_ge_theta (theta g : ℝ) (hg : 0 < g) (hθ : 0 < theta) :
    theta ≤ sStarCall theta g := by
  exact le_mul_of_one_le_right hθ.le ( Real.one_le_rpow ( by rw [ le_div_iff₀ hg ] ; linarith ) hg.le )

theorem contCall_at_sStar (theta g : ℝ) (hg : 0 < g) (hθ : 0 < theta) :
    contCall theta g (sStarCall theta g) = 1 / (g + 1) := by
  unfold contCall sStarCall;
  rw [ div_eq_div_iff ] <;> first | positivity | ring;

theorem intrCall_at_sStar (theta g : ℝ) (hg : 0 < g) (hθ : 0 < theta) :
    intrCall theta g (sStarCall theta g) = 1 / (g + 1) := by
  have hbase : (0:ℝ) < (g + 1) / g := by positivity
  unfold intrCall sStarCall
  rw [mul_div_cancel_left₀ _ hθ.ne', ← Real.rpow_mul hbase.le,
    show g * (-(1 / g)) = -1 by field_simp, Real.rpow_neg_one, inv_div,
    show (1:ℝ) - g / (g + 1) = 1 / (g + 1) by rw [eq_div_iff (by positivity), sub_mul,
      div_mul_cancel₀ _ (by positivity : (g:ℝ) + 1 ≠ 0)]; ring]

theorem valueMatch_g (theta g : ℝ) (hg : 0 < g) (hθ : 0 < theta) :
    contCall theta g (sStarCall theta g) = intrCall theta g (sStarCall theta g) := by
  rw [contCall_at_sStar theta g hg hθ, intrCall_at_sStar theta g hg hθ]

theorem contCall_hasDerivAt (theta g sN : ℝ) :
    HasDerivAt (fun sN => contCall theta g sN) (1 / ((g + 1) * sStarCall theta g)) sN := by
  convert HasDerivAt.div_const (hasDerivAt_id sN) ((g + 1) * sStarCall theta g) using 1

theorem slopeMatch_g (theta g : ℝ) (hg : 0 < g) (hθ : 0 < theta) :
    HasDerivAt (fun sN => intrCall theta g sN) (1 / ((g + 1) * sStarCall theta g))
      (sStarCall theta g) := by
  -- Let's simplify the expression for the derivative.
  have h_deriv_simplified : deriv (fun sN => 1 - (sN / theta) ^ (-1 / g : ℝ)) (sStarCall theta g) =
    (1 / (g * theta)) * ((sStarCall theta g) / theta) ^ (-1 / g - 1 : ℝ) := by
      convert HasDerivAt.deriv ( HasDerivAt.const_sub _ <| HasDerivAt.rpow_const ( HasDerivAt.div_const ( hasDerivAt_id' _ ) _ ) _ ) using 1 <;> norm_num <;> ring_nf ;
      exact Or.inl ⟨ ne_of_gt <| sStarCall_pos _ _ hg hθ, ne_of_gt hθ ⟩;
  convert h_deriv_simplified ▸ hasDerivAt_deriv_iff.mpr _ using 1;
  · exact funext fun x => by unfold intrCall; ring_nf;
  · unfold sStarCall; ring_nf; norm_num [ hg.ne', hθ.ne' ] ;
    rw [ Real.rpow_sub ( by positivity ), Real.rpow_neg_one ] ; ring_nf;
    field_simp;
    rw [ ← Real.rpow_mul ( by positivity ), mul_one_div_cancel hg.ne', Real.rpow_one, mul_div_cancel₀ _ hg.ne' ];
  · exact DifferentiableAt.sub ( differentiableAt_const _ ) ( DifferentiableAt.rpow ( differentiableAt_id.div_const _ ) ( by norm_num ) ( by exact ne_of_gt ( div_pos ( sStarCall_pos theta g hg hθ ) hθ ) ) )

end LensKernel