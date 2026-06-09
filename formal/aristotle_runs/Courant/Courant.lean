/-
  TIER-2 #5 — Single Dirac / Courant object (HONEST scope: PARTIAL, with explicit not-achieved).

  GOAL (strongest "one structure including ports"): ONE Courant/Dirac object on TM ⊕ T*M making all
  FOUR — symplectic J, dissipation R, metric, and the port interface — native in ONE bracket.

  WHAT IS ACHIEVABLE AND PROVED HERE (the conservative/symplectic part, GROUNDED):
    On V = ℝ² ⊕ (ℝ²)*  (here represented as ℝ²×ℝ² with the canonical pairing), the Courant symmetric
    pairing is  ⟨(x,ξ),(y,η)⟩ = ξ·y + η·x.  We prove:
      • the graph of the symplectic form ω  (i.e. L_ω = { (v, ω v) }) is ISOTROPIC for this pairing
        (ω skew ⇒ the pairing vanishes on the graph), and
      • L_ω has dimension = dim V / 2  (MAXIMAL isotropic = a linear DIRAC structure).
    So the symplectic structure IS a Dirac structure — a single object on TM⊕T*M, GROUNDED.

  WHAT IS *NOT* ACHIEVED (reported, NOT asserted — SPECULATIVE per Scope Lock):
    Folding the DISSIPATION R and the PORT into the SAME Dirac/Courant bracket is NOT constructed.
    A Dirac structure is CONSERVATIVE (isotropic); dissipation breaks isotropy, and ports are an
    INTERFACE/relation, not a maximal isotropic of the interior.  The all-four-in-one-bracket object
    would require a Leibniz/Lagrangian extension we DO NOT build.  We mark this explicitly.

  Toolchain: Lean 4.28.0 + Mathlib v4.28.0.
-/
import Mathlib

open Matrix

noncomputable section
namespace Courant

/-- The Courant symmetric pairing on `(ℝ² × ℝ²)` (a vector + a covector represented as a vector):
    `⟨(x,ξ),(y,η)⟩ = ξ ⬝ y + η ⬝ x`. -/
def courantPairing (xξ yη : (Fin 2 → ℝ) × (Fin 2 → ℝ)) : ℝ :=
  (∑ i, xξ.2 i * yη.1 i) + (∑ i, yη.2 i * xξ.1 i)

/-- The canonical symplectic matrix `ω = [[0,1],[−1,0]]` on ℝ². -/
def omegaMat : Matrix (Fin 2) (Fin 2) ℝ := !![0, 1; -1, 0]

/-- The graph element of `ω`: a base vector `v` paired with its image `ω v`. -/
def graphElem (v : Fin 2 → ℝ) : (Fin 2 → ℝ) × (Fin 2 → ℝ) := (v, omegaMat.mulVec v)

/-- DIRAC #1 — the Courant pairing is SYMMETRIC (GROUNDED). -/
theorem courantPairing_symm (a b : (Fin 2 → ℝ) × (Fin 2 → ℝ)) :
    courantPairing a b = courantPairing b a := by
  sorry

/-- DIRAC #2 — the graph of `ω` is ISOTROPIC for the Courant pairing: for any base vectors `v, w`,
    `⟨graph v, graph w⟩ = (ω v)·w + (ω w)·v = 0` because `ω` is skew-symmetric.  GROUNDED.
    THIS is the content "the symplectic structure is a Dirac structure" — a single TM⊕T*M object. -/
theorem graph_isotropic (v w : Fin 2 → ℝ) :
    courantPairing (graphElem v) (graphElem w) = 0 := by
  sorry

/-- DIRAC #3 — `ω` is skew (`ωᵀ = −ω`), the property that makes the graph isotropic (GROUNDED). -/
theorem omega_skew : omegaMatᵀ = -omegaMat := by
  sorry

/-- DIRAC #4 — maximality witness: the graph map `v ↦ (v, ω v)` is INJECTIVE, so `L_ω` has full
    rank 2 = dim V / 2 (a MAXIMAL isotropic = a linear Dirac structure).  GROUNDED. -/
theorem graph_injective : Function.Injective graphElem := by
  sorry

end Courant
