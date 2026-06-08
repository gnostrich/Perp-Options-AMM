# MEMORY — manager (cross-role rollup = state of the whole project)
_Last updated: 2026-06-08, bootstrap. This is the project's state-of-the-whole; git history is the
mechanical audit trail. Rewrite the changed bits at the end of every task._

## HEAD / verification
- **HEAD = `engine/builds/HEAD_temporal_mvp_v26a.html`, md5 `89ae89e9df229186b134ca6638726d0c`.**
  GH curve swap (v25) + v26a barrier-remnant fixes + slippage units fix.
- **Manager-verified at the Node level (2026-06-08, re-run on resume):** ran `engine/verify/run_all.sh`
  myself — 7 GH gates PASS (γ∈{1.5,2,3,4}), curveTrace 401/401 on the GH curve (worst slope err
  5.16e-12), marker on-curve (getMP_raw(eq)=136000.00), slippage splice-level PASS (0.99%/$3.46 →
  71.45%/$6240.94), loud-NaN guard OK. **UI owed to tester** — live browser run DISPATCHED (bg,
  agent a0b7eb8b). Lean = trusted-from-prover.
- **Branch:** working on `claude/pensive-sagan-WhNLb`. peaceful-volta-82pJP already merged to main
  (PR #1, HEAD e7c8ce9) — bootstrap scaffolding is on main.
- Blobs intact: webp `ab663f5c…` (line 74), svg `c505b08a…` (line 1060). File-safety hook live.

## Build lineage (engine/builds/BUILD_LINEAGE.md)
| file | md5 | what |
|---|---|---|
| temporal_mvp_v24_rebase_fixed_2 | 6f606f52 | clean barrier base (pre-GH) |
| temporal_mvp_v25_gh | 9910c699 | barrier→GH swap; 4 curve fns + calibration; 7 gates |
| temporal_mvp_v26a_fixes | 951d16eb | 3 barrier remnants fixed |
| temporal_mvp_v26a_2c0337e8_slipWIP | 2c0337e8 | slippage WIP — **known-broken (~97% flat)**, lineage only |
| **HEAD_temporal_mvp_v26a** | **89ae89e9** | slippage units fix (both paths → mpGeom) — **work from this** |

## Open threads (what | owner | status)
1. **Tester browser re-run on HEAD** | tester | **OWED — this is the first resume action.** Confirm
   slippage display (% primary, $ reserve-USD label), v26a frame re-fit (dot ~fixed while axes
   rescale; one-line revert exists), GH-continuation curve. Needs Playwright network grant.
2. **Surface Finding-2** | tester→manager→operator | tester flags during the run; I escalate.
   American strike as a ratio peg floating off dollars (UX fix) vs dollar-anchored "$120k call"
   (real engine change). Operator decides.
3. **v26b — ITM/American build** | intern | CLEARED, NOT STARTED. Build on HEAD per
   `specs/SPEC_itm_exercise_smoothpaste_NEXT.md`; wire `verify/seam_gate.js` into run_all.
4. **Blob-ledger reconcile** | manager + operator | **VERIFIED, awaiting operator ratification.**
   Decoded HEAD blobs at all 3 layers myself (2026-06-08): line-md5 `ab663f5c`/`c505b08a` (canonical,
   what the hook+run_all check) → DECODED-binary `8d2e1a84`/`1b320fc5`, b64-payload `d3ff8fc8`/`b6f0d67b`.
   273864 b64 × ¾ = 205398 exact; 5168 × ¾ ≈ 3875. ⇒ `8d2e1a84`/`1b320fc5` is **NOT a second/minified
   "broken cut"** — it's the *decode of the same canonical blob*. INTEGRITY.md was right; the "minified
   broken cut, never restore" narrative in CLAUDE.md/GOTCHAS/BUILD_LINEAGE/hook-comments is the actual
   error. Hook/harness key off the correct line layer ⇒ nothing operationally at risk. Reconcile =
   correct the narrative + ratify which layer is canonical (recommend keeping line layer = status quo).
   Held doc edits pending operator (touches shared-truth CLAUDE.md). Surfaced to operator 2026-06-08.
5. **Layer-2 honest-dollar slippage $** | manager/intern | DEFERRED, non-blocking. Route reserve-USD
   through the existing carved-perp settlement chain; reuse, don't improvise.
6. **Lean GH gate-discharge** | research-lead→Aristotle | OPEN. Instantiate GH, discharge 4 gate
   fields; watch `coercive = BddBelow` (bounded reserves).
7. **Ship-gate B1 — funding-coverage sweep** | manager/intern | OPEN. The one thing geometry can't
   close (κ is extrinsic). Necessary, not sufficient (B1/B3/B4 hypotheses).
8. **Publication** | paper | background. AfT 2026 (notif ~Jul 15), WINE 2026 (~Jul 2), FMBC 2027.

## Locked decisions (don't reopen unless the operator does)
- Curve-baked **GH only, γ>1, no barrier** (barrier exponent is outside the GH family; δ won't
  recover it). Carry **P = Ny/Nx** load-bearing; rebase recomputes P→P/r; anchor w=½, strike ray
  θ→θ/r on rebase; convexity knob γ∈(1,4).
- **Slippage** references `mpGeom = getMP_raw·e^(−ghMu)`; **% is basis-independent**; **$ = Layer-1
  reserve-USD** for now.
- **ITM → American smooth-pasting:** free boundary `sNorm* = θ·((γ+1)/γ)^γ`, price `S* = K·γ/(γ+1)`,
  `c = 1/((γ+1)·sNorm*)`. Funding = slope-deviation ratio vs the w=½ anchor at the strike ray —
  orthogonal to intrinsic, untouched by the ITM change.

## THE gotcha
`getMP_raw` is a **price coordinate**, not the slope: `|dy/dx| = getMP_raw·e^(−ghMu)` (11.7/44.5/749/13780
at γ=1.5/2/3/4). Gates are mostly **self-consistency**; the one accuracy gate is G4 (value∝S^(−γ));
ITM adds a seam gate. A price/slope conflation passes every self-consistency gate. Re-derive against
geometry; comments lie.

## Escalation (Gate 2)
Autonomous = how-to-execute (dispatch spec'd work, harnesses, re-derive, audit proofs, git, blob-safe
passes behind the hook). Escalate to operator = what-we're-building (curve/invariant, settlement
semantics, reopen a locked decision/ship-gate, product calls Finding-2 / |Γ|>1 / Fork A-vs-B,
calibration tier, paper claims). Irreversible/high-blast-radius escalates regardless.

## Waiting on operator (bootstrap)
- `GH_TOKEN` (PAT, full repo control) + `gh` install → then I **merge the scaffolding branch to main**.
- Playwright network grant + browser install → tester's live v26a run.
- Operator reply **"go"** = checklist done.
