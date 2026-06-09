# Aristotle obligation — T1b Optimality.lean HARDEN (remove fragile search tactics)

Toolchain: **Lean 4.28.0 + Mathlib v4.28.0** (matches `lean-toolchain`/`lakefile.toml` in the project).

## Task
The file `RequestProject/Optimality.lean` previously compiled CLEANLY but used two fragile
search tactics (`grind +qlia` and `grind`). I have replaced those two — and ONLY those two —
tactic invocations with `sorry`. There are EXACTLY TWO `sorry`s in the file, at line 92 and
line 145. Fill in BOTH `sorry`s with **concrete, explicit, deterministic** tactic proofs.

## HARD CONSTRAINTS (non-negotiable — a violation makes the result unusable to me)
1. **Do NOT use any search/automation tactic** anywhere in your changes:
   forbidden: `grind`, `grind +qlia`, `grind +suggestions`, `exact?`, `apply?`, `rw?`,
   `aesop`, `aesop?`, `omega` is OK only if needed for pure-integer goals (there are none here),
   `decide`/`native_decide` NOT needed and `native_decide` is FORBIDDEN, `simp?`.
   Use only concrete steps: `nlinarith`, `linarith`, `field_simp`, `ring`, `ring_nf`,
   `rw [...]`, `mul_comm`, `div_eq_iff`, named Mathlib lemmas with explicit arguments,
   `positivity`, `norm_num`, `Real.rpow_*` lemmas, etc.
2. **Change NOTHING else.** Do not alter any theorem/lemma/def statement, type, or hypothesis.
   Every signature line and every `def`/`structure` must stay CHARACTER-IDENTICAL.
   `structure AmericanOptimalityPrinciple ... : Prop` stays EXACTLY as carried — it is a carried
   hypothesis structure, NOT an axiom and NOT something to "prove away". Do not touch it.
3. **Do NOT introduce** any `axiom`, `sorry` (the final file must have ZERO `sorry`),
   `admit`, `opaque`, `unsafe`, `native_decide`, `sorryAx`.
4. Only touch the two `sorry` sites (line 92 and line 145). You MAY restructure the immediately
   surrounding tactic block of those two specific proofs (`opt_boundary_is_critical_A` and
   `opt_boundary_is_max_A`) if needed to discharge the goal with concrete tactics — but no other
   theorem may change, and the STATEMENTS of those two theorems must stay character-identical.

## The two goals (math)
- **Line 92** inside `theorem opt_boundary_is_critical_A`: after
  `convert (hasDerivAt_coeffOfBoundary_A ?_) using 1 <;> norm_num [Sstar_A]`, the remaining goal is
  the algebraic identity that the derivative value vanishes at `S*_A = Kγ/(γ+1)`:
  the factor `γ − (γ+1)·(Kγ/(γ+1))/K = γ − γ = 0`, so the whole derivative expression is `0`.
  This is field arithmetic given `K > 0`, `γ > 1` (so `γ+1 ≠ 0`, `K ≠ 0`). A concrete
  `field_simp` then `ring`, or an explicit `nlinarith`/`rw`-chain, should close it. Provide the
  positivity side-goal exactly as already present (`positivity`).
- **Line 145** inside `theorem opt_boundary_is_max_A`, first branch (`B ≤ Sstar_A K γ`), after
  `apply_rules [monotoneOn_coeffOfBoundary_A_left]`: the remaining goal is the membership
  `Sstar_A K γ ∈ Icc 0 (Sstar_A K γ)`, i.e. `0 ≤ Sstar_A K γ ∧ Sstar_A K γ ≤ Sstar_A K γ`.
  Prove it concretely: `0 ≤ S*_A` from `Sstar_A_pos hK (by linarith)` (note `hγ : γ > 1`), and
  the right bound is `le_rfl`. e.g. `exact ⟨(Sstar_A_pos hK (by linarith)).le, le_rfl⟩` or via
  `Set.mem_Icc.mpr`.

## Output spec
- Return the full project. The returned `RequestProject/Optimality.lean` must compile with ZERO
  `sorry`, ZERO `grind`/`exact?`/`apply?`/`aesop`/search tactics anywhere in the file.
- Keep the trailing `#print axioms` block (lines for all 6 named theorems) so axiom sets are reported.
- Each of the 6 named theorems' `#print axioms` must be ⊆ {propext, Classical.choice, Quot.sound}.
- Do NOT modify the sibling modules (`AMMCurve.lean`, `Audit.lean`, `Main.lean`, `Seam.lean`,
  `Temporal.lean`) — leave them byte-identical.
