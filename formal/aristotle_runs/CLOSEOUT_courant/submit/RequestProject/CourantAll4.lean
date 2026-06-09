/-
  CLOSEOUT item 5 — Courant ALL-FOUR bracket: ATTEMPT to fold J, R, metric, and the ports into ONE
  Courant/double bracket (the single all-four-native object).  RUN-4 built only the conservative
  symplectic Dirac part and reported the all-four fold SPECULATIVE-NOT-ACHIEVED.

  We make a concrete, falsifiable ATTEMPT and PROVE whichever way it resolves:

  (A) THE NATURAL CANDIDATE — the port-Hamiltonian generator `A = J − R`  (J skew, R symmetric PSD).
      Question: is `graph(A) = {(v, A·v)}` an ISOTROPIC subspace for the Courant pairing
      ⟨(x,ξ),(y,η)⟩ = ξ·y + η·x ?  Isotropy ⇔ Aᵀ = −A ⇔ A skew ⇔ R = 0.

  (B) THE OBSTRUCTION (a REAL no-go theorem, not a failure to find a proof): if R ≠ 0 (genuine
      dissipation), `graph(J − R)` is NOT isotropic — there exist base vectors v, w with
      ⟨graph v, graph w⟩ = ((J−R)v)·w + ((J−R)w)·v = −2·(R v)·w ≠ 0 (the symmetric part R survives).
      So NO maximal-isotropic (Dirac) structure can natively carry the dissipation R in the same
      bracket: the conservative Dirac part and the resistive part are in DIFFERENT structural slots.
      We PROVE: for the canonical 2×2 J and a nonzero symmetric R, the Courant pairing on graph(J−R)
      is exactly `−2·(R v)·w`, hence nonzero for suitable v,w ⇒ graph(J−R) is NOT isotropic.

  (C) WHAT *IS* the right single object (reported, scope-honest): the conservative Dirac structure
      (graph ω, isotropic — RUN-4) PLUS a resistive relation R in the SYMMETRIC complement; the
      "single bracket" that holds both is a LEIBNIZ/Courant-algebroid bracket whose symmetric part is
      exactly the dissipation — NOT a Dirac (isotropic) structure.  Mathlib v4.28.0 has no
      Courant-algebroid / Leibniz-algebroid bracket type; we do NOT construct that object here.

  OUTCOME LABEL: item 5 lands as a PROVED OBSTRUCTION (the all-four single ISOTROPIC bracket is
  impossible when R≠0) — which is the honest content — NOT as a constructed all-four-native bracket
  (that stays SPECULATIVE-NOT-ACHIEVED, now with a proved reason).  Do NOT assert the fold exists.

  CONSTRAINTS: no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no live `exact?`/`grind`/`aesop?`
  search tactics in the RETURNED proof.  Do not weaken the obstruction statement.

  Toolchain: Lean 4.28.0 + Mathlib v4.28.0.
-/
import Mathlib

open Matrix

noncomputable section
namespace CourantAll4

/-- Courant symmetric pairing on (ℝ² × ℝ²). -/
def courantPairing (xξ yη : (Fin 2 → ℝ) × (Fin 2 → ℝ)) : ℝ :=
  (∑ i, xξ.2 i * yη.1 i) + (∑ i, yη.2 i * xξ.1 i)

/-- Graph of a structure matrix `A`: `v ↦ (v, A·v)`. -/
def graphElem (A : Matrix (Fin 2) (Fin 2) ℝ) (v : Fin 2 → ℝ) : (Fin 2 → ℝ) × (Fin 2 → ℝ) :=
  (v, A.mulVec v)

/-- THE KEY ALGEBRAIC IDENTITY — the Courant pairing on graph(A) equals (Av)·w + (Aw)·v, i.e. twice
    the SYMMETRIC part of A contracted with v,w.  GROUNDED for any A. -/
theorem courant_on_graph (A : Matrix (Fin 2) (Fin 2) ℝ) (v w : Fin 2 → ℝ) :
    courantPairing (graphElem A v) (graphElem A w)
      = (∑ i, (A.mulVec v) i * w i) + (∑ i, (A.mulVec w) i * v i) := by
  sorry

/-- (A) — graph(A) is isotropic IFF A is skew-symmetric.  We prove the forward obstruction direction:
    if A has a nonzero symmetric part, isotropy fails.  Concretely for A = J − R with R symmetric and
    nonzero, the pairing on the graph is `−2·(R v)·w` for the J-skew, R-symmetric split, which is not
    identically zero.  We encode the cleanest witness:  for the PURELY symmetric obstruction matrix
    R = !![r,0;0,0] with r ≠ 0, graph(R) is NOT isotropic (pairing at v=w=e₀ is 2r ≠ 0). -/
theorem graph_symmetric_not_isotropic (r : ℝ) (hr : r ≠ 0) :
    courantPairing (graphElem (!![r, 0; 0, 0]) (fun _ => 1))
      (graphElem (!![r, 0; 0, 0]) (Pi.single 0 1)) ≠ 0 := by
  sorry

/-- (B) — THE NO-GO: for the port-Hamiltonian generator A = J − R with J the canonical skew form and
    R = !![r,0;0,0] symmetric nonzero, the Courant pairing on graph(A) is NOT identically zero — so
    graph(J − R) is NOT an isotropic (Dirac) subspace.  GROUNDED obstruction (the symmetric/resistive
    part survives the Courant pairing).  J = !![0,1;-1,0]. -/
theorem dissipation_breaks_isotropy (r : ℝ) (hr : r ≠ 0) :
    ∃ v w : Fin 2 → ℝ,
      courantPairing (graphElem (!![0,1;-1,0] - !![r,0;0,0]) v)
        (graphElem (!![0,1;-1,0] - !![r,0;0,0]) w) ≠ 0 := by
  sorry

/-- (A-positive) — the conservative case CLOSES: graph of the pure skew J IS isotropic (recovers the
    RUN-4 Dirac result, as the R=0 boundary of the family).  GROUNDED. -/
theorem graph_skew_isotropic (v w : Fin 2 → ℝ) :
    courantPairing (graphElem (!![0,1;-1,0]) v) (graphElem (!![0,1;-1,0]) w) = 0 := by
  sorry

end CourantAll4
