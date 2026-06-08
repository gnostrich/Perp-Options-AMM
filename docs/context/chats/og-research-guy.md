# Chat: "OG research guy"  (role: research-lead → Aristotle)  2026-06-06

Rohan = relay between Claude (research lead), a Manager (independent verifier), and
Aristotle (external Lean 4 prover; Claude can't run it directly — sandbox egress wall).

Advanced a formal-verification scaffold across three Aristotle runs into a complete
manager-facing package. Key framing (Rohan's, sharpened this session): the scaffold's
purpose is to force math to propagate consistently across ALL interfaces — a change at
any seam must be consistent at every other seam, enforced by the type-checker, not by
inspection. Reframed from "validate one curve" to a typed interface stack where each
layer reads only the contract of the layer below.

Three Lean modules: (1) AMMCurve.lean — curve validity gate + short-gamma bridge (run 2);
(2) Seam.lean — middle seams wiring pool value through the value layer into the
passivity scaffold's storage (run 3); (3) Temporal.lean — verified passivity core (run 1).
The "self-sandwich bug" was identified as exactly an interface violation (settlement
reaching past its contract into the raw displaced pool) — caught by type under the discipline.

|Γ|>1 scope decision surfaced: "true American" and "exact replication" are mutually
exclusive per wing → ship |Γ|≤1 exact or |Γ|>1 as a labelled approximation. Calibration
tier for Γ flagged (oracle tier needs adversarial review). Loop: any math change routes
back through Rohan to re-verify + update harness/brief before reaching the coding intern.

Tracked failure mode: Claude over-promotes results (e.g. "tripwire"); Rohan pushes back
concisely on overclaiming.
