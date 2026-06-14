# VERDICT — constant-slope-multiplier build promotion gate-audit · 2026-06-13 (skeptic)

Artifact: `engine/builds/temporal_mvp_v28_lens_constmult.html` (md5 `8f897edc…`, confirmed)
from HEAD `5fea0e8d`. Universal-gate pre-promotion audit. Focus per brief: HONESTY of the
REWRITTEN gate `engine/verify/lens_selfcheck.js`. READ-ONLY; all re-derivations in /tmp + live
gate runs. Revert target HEAD `5fea0e8d` retained.

## VERDICT: CLEAR-TO-PROMOTE (two non-blocking stale-comment notes below)

I attacked the rewritten gate as a false-green vector and it held on every axis that matters for
THIS build. The one gap I found in lens_selfcheck-alone is backstopped by the A16 gate in the same
run_all chain, so the promotion is honestly gated. Details:

### 1. Gate honesty — is the rewrite a real assertion of the NEW design? YES.
I confirmed each CM check BITES by mutating the engine and re-running:
- **Broken trade map** (`u_tx = a_tx` instead of `tau·a_tx`): CM5 + CM7 go FAIL (caught).
- **Broken smooth-paste** (`c = 1.2/…` instead of `1/…`): CM2 + CM4 go FAIL (caught).
- CM1 verified `g_loc=m·γ` exact (maxAbsErr 0) across 10 strikes × 5 m; m=1⇒γ everywhere.
- CM6 round-trip restores reserves to 0/0 and single-leg reverse nets Σdy==0 (no free money).
- CM9 confirms the dead √-kernel (hpTau/hTau/`√(τ²+u²)`/u-factor) is GONE and markEff routes
  through gLoc — verified against the live source, not a comment.
The OLD asserts (g_loc(ATM)=0, wings→γ, |g|≤γ, funding→0-ATM) were correctly REMOVED, not hidden
— I diffed the gate intent against my entry-229 verdict's gate-problem list; every one is gone.

### 2. The one real gap (BACKSTOPPED, not blocking).
`lens_selfcheck.js`'s `isConstMult` detector keys off the literal `return m * gamma;`. I built a
tamper where gLoc is made u-DEPENDENT (the dead elbow design sneaking back): lens_selfcheck SKIPs
the whole CM block and exits 0 (GREEN). So **CM9 — the very check meant to forbid the dead design
— cannot fire on a build that fails to be constMult**, because it lives inside the isConstMult
guard. That is a logical soft-spot in lens_selfcheck ALONE.
HOWEVER: the same tamper is CAUGHT by `a16_atm_gate.js`, which routes a non-constMult build to its
legacy branch and FAILs the peak=1 assertion → exit 1. run_all.sh runs both under `set -e`, so the
combined chain aborts (verified: chain exit 1). For THIS build (isConstMult=true) all 13 CM + 5 A16
fire and pass. The SKIP-on-old-build is a legitimate router (it lets the demoted √-HEAD pass generic
pool/L4 checks while gating the new build fully), NOT a dodge — confirmed by running both builds.
Note for the record only: a future reviewer who relies on lens_selfcheck in ISOLATION (not via
run_all) would lose the dead-design lock. Not a halt; the promotion path is run_all.

### 3. Faithful to spec, no scope creep. CONFIRMED.
Engine diff vs HEAD = 12 hunks, all lens-scoped: comment rewrite, `hTau`/`hpTau` deleted, `gLoc`
body → `m*gamma` (u dropped), trade map `u_tx = tau·a_tx` ⇒ `theta_tx = mode·(chosen/mode)^m`,
knob relabel `state.tau`→`state.m`, export-list trim, funding inner-comment. **Pool fns
(tradeUpdate/arbitrageToOracle/rebase) byte-identical** (CM8 + my own diff). markLensed body, the
smooth-paste S* formulas, executeBand/closeBand logic — UNCHANGED. Settlement still at the chosen
strike, financing leg at θ_tx; funding still `±g_loc·…` with g now m·γ. No scope creep.

### 4. m=1 ⇒ plain v24 curve. CONFIRMED.
CM1 (g_loc=γ everywhere), CM5 (θ_tx=chosen), my /tmp re-derivation, and A16.2 all confirm the
neutral point is the trusted base. The knob's identity element is the gated v24 curve.

### 5. A16 cusp retirement — honest dual-branch, not a skip. CONFIRMED.
A16.2 has an explicit `isConstMult` branch: on the new build it asserts the HONEST new fact —
continuous through ATM (call arm == put arm, C⁰ to 1e-12), ATM value = 1/((g+1)·((g+1)/g)^g) < 1
(NOT peak=1, NOT a cusp), markEff agrees. On the legacy √-build it retains the old peak=1. It does
not skip; it asserts the new continuous behavior and PASSES on the constmult build (5/5).

### 6. No agreed-constraint regression beyond the authorized redefinition. CONFIRMED.
A5 = power-laws preserved at exponent m·γ (still exact power-laws, no floor — CM2). The
elbow-rounding/frozen-γ deletion IS the operator-authorized change (entry 229 "its literally just
a constant slope multiplier"; entry 231 "yes" to the redefinition confirm — verbatim transcript
intact, append-only, context notes neutral; channel HELD). CLAUDE.md §0 (line 15) and
`docs/feature_inventory.md` items 2/3/16 are updated to REDEFINED/SUPERSEDED. Nothing silently
dropped — this is the exact §0-staleness hole I flagged in the entry-229 verdict, now closed.

### tau/m naming (item 3) — RULED HONEST AND SAFE, not a landmine.
The threaded scalar parameter stays NAMED `tau` (carrying the value m) while UI/state/gLoc-3rd-arg
use `m`. This is the CORRECT choice: inside `fundingPerStrike` (engine L2273) and `legPrice`
(L1735) there is a value-local `const m = markLensed(...)` (a fraction). Naming the threaded knob
`m` would SHADOW those and risk a real bug. Every threading site carries an inline disclaimer
("tau param carries the knob value m"). Readability cost only; no correctness risk. Safe.

## Non-blocking notes (stale comments — fix when convenient, NOT a HOLD)
Two comments describe the DEAD design as live behavior. The CODE is correct (verified funding is
nonzero at ATM, moves with m); only the prose is stale — but stale-truth-in-a-comment is the
precise drift class I exist to catch (cf. the GH δ-direction precedent), so flagged for the record:
- **Engine L2265-2266** (`fundingPerStrike` header): "f → 0 at ATM (g_loc→0, flat top…) and →
  γ_live in the wings (g_loc→γ)" — FALSE under constant m (g never→0 or→γ; funding does not vanish
  at ATM). The inner g-comment (L2272) was updated; this header behaviour-comment was missed.
- **Chart-2 L3734**: "lensed ψ rises toward the flat top at the mode" — there is no flat top now.

## Re-derivations / live runs
`/tmp/sk_falsegreen.js` (u-independence, both-wing trade map, markEff/funding m-dependence);
`/tmp/tamper_udep.html` `/tmp/tamper_trademap.html` `/tmp/tamper_seam.html` (gate-bite tests);
live `lens_selfcheck.js` (13/13 constmult, 3/3-SKIP old HEAD), `a16_atm_gate.js` (5/5 constmult,
4/1-FAIL tamper), full `run_all.sh` (green, blobs canonical). Verbatim channel HELD (entries
229/230/231 read; "yes"@231 maps to the redefinition confirm via 229/230).
