# Dexter's Lab review of the MONOLITH (singular object), 2026-06-23

Lane: `lab_review` via the LOCKED-ROOM runner (`run_lane_isolated.sh`) on
`notes/research/MONOLITH_REVIEW_PACKET_2026-06-23.md`. Isolated, supervised, panel SKIPPED
(no OPENROUTER_API_KEY). Cost $6.99, 11 turns. **Zero breach** — repo CLAUDE.md/history never
in the child's tree (the entry-272 locked room, validated in production). Raw outputs:
`dexters-lab/lab_home/reviews/review-monolith-20260623/` (gitignored runtime).

## Verdict
**weak reject, confidence 4.** Novelty rated POSITIVE: "first known Lean 4 port-Hamiltonian
passivity proof for a DeFi AMM (`exchange_internal_passivity`, no open hR slot)" + "smooth-paste
C1 formalization for perpetual American options at arbitrary g>0 in Lean 4" + single-structure design.

## Manager + research-lead cross-check (signal vs the lab re-reading our hedges)

### Genuinely new — VERIFIED, both downgraded
- **F1 (lab: fatal) → CLARITY GAP.** `S*=K·g/(g+1)` vs Lean `sStar=θ·((g+1)/g)^g` are the SAME free
  boundary in two coordinate frames (K = dollar strike; θ = K/oracle = normalized). Lab assumed K=θ
  (wrong). Engine+Lean implement the normalized form. Fix = define K in packet §1.4 (DONE this commit);
  the PAPER already defines K (symbol table). No math/Lean/engine change.
- **M10 (lab: passivity hst undischarged) → REAL but BENIGN.** `hst` is a necessary on-domain
  well-posedness precondition (R_psd is one-sided), NOT a smuggled assumption and NOT the closed
  PH_UNIFICATION_INTERNAL hR-soundness issue. The one genuinely-missing piece is a
  trajectory-stays-on-domain lemma = Lean menu item **L1**.

### Already disclosed in the packet (lab re-stating our own open items)
F2 solvency conditional (B1/B3/B4 carried, never discharged); M1 Aristotle not publicly reproducible
(trusted-from-prover, source in `formal/`); M2 A16 ATM-no-jump gate-only not a Lean theorem; M3 Snell
settlement-optimality undischarged; M4 engine↔Lean only a report-only numeric bridge; M9 discrete (not
continuous-time) passivity. These ARE the formal-verification menu below.

### Economic / implementation signals (CTO/product land, not formal-object defects)
M5 flat vol-smile from constant-g vs persistent market skew (Deribit); M6 γ-pump sandwich MEV on
`gamma_affine` (linear in D, publicly readable); M7 m-governance atomic global repricing front-run;
M8 LP payoff unmodeled / implicit short-perp liability (A14 pending). F3 no empirics / m unanchored
(m is a by-design vol-set knob, operator ruling, not data-derived).

## The "Lean we could run" menu (research-lead, prioritized)
- **L1 — discharge `hst` (trade trajectories stay on the R_psd domain).** BOUNDED, new. Run FIRST.
- **L3 — conditional-solvency lemma.** BOUNDED.
- **L2 — A16 ATM no-jump as a Lean theorem (not gate-only).** BOUNDED.
- **L7 — engine↔Lean definitional bridge theorem.** BIG (scope decision).
- **L9 — stochastic Snell-envelope settlement optimality.** BIG (scope decision).

---

## L-menu Aristotle run + audit (operator entry 276, folded 2026-06-23)
All 5 menu items COMPILED (Aristotle); manager-audited; skeptic-gated (run adeca113, CLEAR-TO-FOLD
with 2 oversell corrections). Full INDEX block: `formal/INDEX.md` L-MENU. Honest status:
- **trusted-from-prover** (NOT verified — env-blocked), and **all 5 are self-contained `import Mathlib`
  MODELS** (re-declared defs), not theorems in the canonical build.
- **L2** (A16 ATM-no-jump) and **L3** (conditional solvency, non-vacuity witnessed, stays conditional):
  genuine model lemmas — clean.
- **L1** (trajectory-stays-on-domain): faithful lemma on a structurally-identical re-declaration, but
  in isolation — **does NOT by itself close M10** on the canonical `exchange_internal_passivity` weld
  (`PHUnification.lean`); the import-and-compose step remains.
- **L7** (engine bridge): proves two HAND-TRANSCRIBED Lean copies agree; engine-JS faithfulness asserted
  in a comment, NEVER Lean-proved — **M4 (engine↔object) NOT closed.**
- **L9** (Snell): Stage-A abstract optimal-stopping skeleton proved; **stochastic Snell envelope OPEN**
  (no price process/measure in the object).
Net: real model-level progress (esp. L2/L3); M10/M4/Snell remain open on the canonical object.
