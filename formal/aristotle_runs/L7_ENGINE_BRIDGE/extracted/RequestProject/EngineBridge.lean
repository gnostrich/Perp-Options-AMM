import Mathlib

noncomputable section
open Real

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
-- monolith derived readings (verbatim from MonolithConstM.lean):
def x      (P : TemporalAMM) : ℝ := P.alpha * P.y / (P.y - P.beta)
def w      (P : TemporalAMM) : ℝ := 1 - P.beta / P.y
def gamma  (P : TemporalAMM) : ℝ := (P.y - P.beta) / P.beta
def g      (P : TemporalAMM) (θ : ℝ) : ℝ := P.m * P.gamma
def trade  (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) : TemporalAMM :=
  ⟨P.alpha, P.beta, P.y + D, P.m, P.halpha, P.hbeta, hD, P.hm⟩
end TemporalAMM

-- monolith mark fns (verbatim from MonolithConstM.lean):
def sStar    (g θ : ℝ) : ℝ := θ * ((g + 1) / g) ^ g
def pasteC   (g θ : ℝ) : ℝ := 1 / ((g + 1) * sStar g θ)
def markCont (g θ s : ℝ) : ℝ := pasteC g θ * s
def markInt  (g θ s : ℝ) : ℝ := 1 - (s / θ) ^ (-(1:ℝ) / g)

-- ENGINE closed forms, transcribed from the JS (these are the NEW defs to bridge):
namespace Engine
/-- engine gLoc: w := 1 − β/y (= getW); γ := w/(1−w); return m·γ. Written as the JS computes it
    (from w, not from the monolith's γ def) so the bridge lemma is non-trivial. -/
def gLoc (P : TemporalAMM) (θ_K : ℝ) : ℝ :=
  let w := 1 - P.beta / P.y
  let γ := w / (1 - w)
  P.m * γ
/-- engine markLensed, call arm. -/
def markLensedCall (θ sNorm g : ℝ) : ℝ :=
  let sStarE := θ * ((g + 1) / g) ^ g
  let c := 1 / ((g + 1) * sStarE)
  if sNorm ≤ sStarE then c * sNorm else 1 - (sNorm / θ) ^ (-(1:ℝ) / g)
/-- engine tradeUpdate: the NEW x after a dy=D move (y → y+D), via dx = −αβD/((y−β)(y+D−β)). -/
def tradeUpdateX (P : TemporalAMM) (D : ℝ) : ℝ :=
  P.x + (-(P.alpha * P.beta * D) / ((P.y - P.beta) * (P.y + D - P.beta)))
/-- engine tradeUpdate: the NEW y (trivially y+D). -/
def tradeUpdateY (P : TemporalAMM) (D : ℝ) : ℝ := P.y + D
end Engine

theorem bridge_gLoc (P : TemporalAMM) (θ_K : ℝ) : Engine.gLoc P θ_K = P.g θ_K := by
  have hy0 : P.y ≠ 0 := by linarith [P.hy, P.hbeta]
  show P.m * ((1 - P.beta / P.y) / (1 - (1 - P.beta / P.y)))
      = P.m * ((P.y - P.beta) / P.beta)
  congr 1
  rw [show (1:ℝ) - (1 - P.beta / P.y) = P.beta / P.y by ring, div_div_eq_mul_div]
  congr 1
  field_simp

theorem bridge_markCont (θ sNorm g : ℝ) (hsStar : sNorm ≤ θ * ((g + 1) / g) ^ g) :
    Engine.markLensedCall θ sNorm g = markCont g θ sNorm := by
  unfold Engine.markLensedCall markCont pasteC sStar;
  grind +qlia

theorem bridge_markInt (θ sNorm g : ℝ) (hsStar : ¬ (sNorm ≤ θ * ((g + 1) / g) ^ g)) :
    Engine.markLensedCall θ sNorm g = markInt g θ sNorm := by
  unfold markInt; unfold Engine.markLensedCall; simp +decide [ hsStar ] ;

theorem bridge_tradeUpdate_y (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    Engine.tradeUpdateY P D = (P.trade D hD).y := by
  rfl

theorem bridge_tradeUpdate_x (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) :
    Engine.tradeUpdateX P D = (P.trade D hD).x := by
  unfold Engine.tradeUpdateX TemporalAMM.x TemporalAMM.trade;
  rw [ div_add_div, div_eq_div_iff ] <;> nlinarith [ P.hbeta, P.hy, mul_pos ( sub_pos_of_lt P.hbeta ) ( sub_pos_of_lt P.hy ), mul_pos ( sub_pos_of_lt hD ) ( sub_pos_of_lt P.hy ) ]

theorem bridge_single (P : TemporalAMM) (D : ℝ) (hD : P.beta < P.y + D) (θ_K : ℝ) :
    Engine.gLoc P θ_K = P.g θ_K
    ∧ Engine.tradeUpdateY P D = (P.trade D hD).y
    ∧ Engine.tradeUpdateX P D = (P.trade D hD).x :=
  ⟨bridge_gLoc P θ_K, bridge_tradeUpdate_y P D hD, bridge_tradeUpdate_x P D hD⟩

#print axioms bridge_tradeUpdate_x
#print axioms bridge_gLoc
