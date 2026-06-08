# subagent_briefs/BRIEF_TEMPLATE_prover.md  (Aristotle)

Fill brackets, dispatch, verify the return. The prover relays Lean proofs; you trust-from-prover only if your own environment can't compile, and you say which.

---
**Role:** formal prover (Aristotle). **Material:** `formal_lean/` (curve-agnostic machine proof + `MANAGER_VERIFICATION.md`) and `engine_knowledge/ARISTOTLE_hyperbolic_curve.md` (the GH math).
**Task (exact):** `[the obligation — e.g. instantiate GH against the machine's typed interface and discharge the 4 gate fields: convex_dom, antitone_y, convex_y, coercive=BddBelow]`.

**Discipline:**
- **Sorry-free, standard-axiom only:** the proof must close with axioms exactly `[propext, Classical.choice, Quot.sound]`. Any extra axiom, `sorry`, or `admit` → not done.
- Prove against the **typed interface**, so the result propagates (the machine is curve-agnostic by type — don't re-prove the machine, instantiate it).
- **Watch `coercive = BddBelow`:** GH has *bounded* reserves; this field is where an instantiation is most likely to fail. Treat it as the load-bearing one.
- Solvency stays **conditional on B1** (κ-extrinsic funding limit) — do not claim unconditional solvency; the port is necessary, not sufficient.

**Acceptance:** compiles clean; `#print axioms [theorem]` shows only the standard three; the gate fields are discharged for the GH instance, not assumed.

**Stopping condition:** if a field won't close, STOP and report the exact goal state and where it stuck — don't axiomatize around it.

**Deliverable:** the Lean files + `#print axioms` output + a short note on what discharged and what remains conditional. Back to the manager. The manager re-runs `formal_lean/audit.sh` independently if the environment allows.
