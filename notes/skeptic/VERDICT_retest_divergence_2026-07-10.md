# SKEPTIC VERDICT — staging γ=2 option-wing divergence (retest 2026-07-10)

**Verdict: CLEAR — RELAY THE DIVERGENCE (with one justification correction).**
The manager's *conclusion* is a real, machine-provable staging divergence: at γ=2 staging's
option-mark wings are LINEAR (|exponent|=1) while the reference is a POWER-LAW (|exponent|=g=2).
The manager's stated *anchor* ("the γ=1 exact match proves the convention") is logically
insufficient — but the finding survives on the engine source + golden + CM11 instead, which I
re-derived independently below. Manager's own caveat #1 already flagged exactly this weakness, so
the finding is honestly scoped, not over-claimed. Ref build md5 = `5ce1a76c…` (verified).

## My independent re-derivations (reference engine 5ce1a76c, Node vm)

**Attack 1 — is staging linear and is the reference power? YES / YES, both to machine-eps.**
- staging **put_mark = (4/27)·θ** exactly: `MAX|put_mark − (4/27)θ| = 2.78e-17` over all 40
  strikes; linear fit intercept = −1.3e-15 (zero), slope = 0.1481481481 = 4/27 exactly, residual
  6.8e-16. Exponent **1**, machine-precision. (Manager reported 2.2e-10 — same result, looser.)
- staging **call_mark = (4/27)/θ** exactly: `MAX|call_mark − (4/27)/θ| = 5.55e-17`. Exponent **−1**.
- Reference **markLensed(put,θ,1,2) = (4/27)·θ²** exactly: `MAX|… − (4/27)θ²| = 5.55e-17`;
  ratio V(2θ)/V(θ) = 4.000 = 2². Exponent **g=2**, power-law confirmed.
- So the picture is precise: **staging used the γ=2 ATM amplitude (V_atm = 4/27 = 0.1481, golden ✓)
  but the γ=1 wing steepness (|exp|=1).** The g_loc=2 it reports is not driving the wing exponent.

**Attack 2 — is the γ=1 anchor sound? NO — it is a genuine degeneracy, exactly as the skeptic
brief suspected. But it does not rescue staging.**
- At g=1 the reference is itself linear: `markLensed(put,θ,1,1) = (1/4)·θ` exactly
  (`MAX dev = 5.55e-17`, ratio at 2× = 2.000 = 2¹). So markLensed at g=1 is **degenerate-linear**.
- Consequence: the γ=1 EXACT match (5.6e-17) is EQUALLY consistent with two hypotheses —
  (H_mgr) staging computes markLensed faithfully, and (H_alt) staging is ALWAYS linear. At g=1
  both are linear, so the match **cannot** distinguish them and **cannot** prove the convention
  generalizes to power-law wings. The manager's sentence "so that IS the correct shared convention"
  is an over-read of that one data point. **FLAG-JUSTIFICATION (minor)** — do not relay the γ=1
  match as the proof.
- HOWEVER the convention is fixed independently of the γ=1 match, and I checked each source:
  1. **Engine source:** `markLensed` (line 1690) uses `g` as the literal wing exponent —
     `Math.pow(sNorm/sStar, ±g)/(g+1)`; `gLoc` (1666) returns `m·γ`. θ^g wings are the definition,
     not an inference.
  2. **markLensed IS the pricing path, not display:** `valueAtStrike` (2052) returns
     `markLensed(wing,θ,sNorm,gLoc(...))`; band-detail mark (4538) and both chart reads (3846/3946)
     call the same helper. Settlement uses it too (smooth-paste S* = K·g/(g+1)).
  3. **Golden MEMO §1** pins ATM=0.148, seam value 1/3 at S*=0.667K, wing power-law — the reference
     genuinely intends power-law wings.
  The finding therefore stands on (1)+(2)+(3); the γ=1 match is corroborating, not load-bearing.

**Attack 3 — marks a coarse display grid vs real pricing? Moderately answered, one caveat stays open.**
- The marks are full-precision (17 sig figs) and *exactly* linear (2.8e-17) — a coarse downsample
  of a power-law would still read power-law-ish; a precisely-linear curve is a DIFFERENT curve, not
  a sampled one. And markLensed (=the marks' reference analogue) is the actual pricing/settlement
  read in the engine (Attack-2 pt 2), not a display-only function.
- What I **cannot** close from here: staging is the CTO's separate Go port; I can't see whether its
  band/settlement path shares the marks computation. So "marks linear ⇒ settlement linear" is
  strongly suggested but not proven. Manager's caveat #2 is legitimately OPEN — needs a
  band-detail `pt_asset` / settlement read from staging to confirm the linearity reaches settlement.

**Attack 4 — does golden CM11 run green on the reference? YES.**
- `node harness/lens_selfcheck.js builds/HEAD_temporal_mvp_v28_lens.html` → **41 PASS / 0 FAIL**,
  matching `golden/GOLDEN_harness_output.txt`. CM11 explicitly:
  `PASS (CM11) OTM wing exact power-law: put V(2ρ)/V(ρ)=2^(−g), call =2^(+g) … maxRelErr=0.00e+0`.
  The reference truly has θ^g wings; the "linear" shape is unique to staging.

**Attack 5 — is the finding correctly scoped? YES.**
- ATM correct (0.148 golden ✓), wings wrong, both caveats present and both legitimate. The finding
  neither over- nor under-states. The only defect is the *reasoning* in the headline anchor
  (Attack 2), not the conclusion or the scope. Given the manager's over-claim history this session,
  I specifically hunted for an over-statement and did not find one — the caveats are real and the
  numbers hold at tighter precision than the manager quoted.

## Bottom line for the operator→CTO relay
RELAY as a real staging divergence, worded as: *staging applies the γ=2 ATM value (0.148, correct)
but its option-mark wings carry |exponent|=1 (put ∝ θ, call ∝ 1/θ) where the reference carries the
power-law |exponent|=g=2 (put ∝ θ², i.e. the (K/S)^g wing). The reported g_loc=2 is not driving
wing steepness — the steepness knob does not shape the option-value wings on staging.* Reference:
CM11 green on 5ce1a76c; golden §1. **Do NOT relay the γ=1 exact match as the proof** — it is a
degeneracy (markLensed is linear at g=1); cite the engine source + golden + CM11 instead. **Keep
open:** confirm the linearity reaches band/settlement pricing, not just `/api/amm/marks`
(needs a staging settlement/band-detail read).

— skeptic, 2026-07-16
