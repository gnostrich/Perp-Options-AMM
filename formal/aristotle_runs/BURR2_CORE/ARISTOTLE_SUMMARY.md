# Summary of changes for run 26958f2b-c7dc-4f1b-8240-64fdecb70ebf
All 42 `sorry`s in `BURR2_CORE.lean` are gone: every theorem in the file is now proved, the file builds cleanly, and no statement, hypothesis, `def` or `structure` body was touched.

CONSTRAINT COMPLIANCE
* I mechanically diffed every original declaration block (all `def`s, the `Params` and `TailRep` structures, the `pw` witness, and every theorem signature) against the original commit: all 0 differences — statements come back byte-identical, only the `by sorry` bodies were replaced.
* No `axiom`, `sorry`, `admit`, `native_decide`, `opaque`, `unsafe`, or `@[implemented_by]` anywhere (verified by search). Additions are limited to `private` helper lemmas; no new imports were needed.
* `uArg` was left in its junk-safe form; `uArg_eq_sheet` is proved as stated (for `s, m > 0`).

RESULT PER THEOREM — all PROVED, none FALSE, none OPEN:
§1 `sR_pos`, `sL_pos`, `uArg_eq_sheet`, `tail_zero`, `tail_zero_R`, `G1_pos`, `G1_lt_one`, `AR_zero`, `AL_zero`, `qR_add_qL`.
§2 `burr2_parity_of_ne`, `atm_wings_meet`, `burr2_parity`.
§3 `AL_glue`, `call_at_zero_strike`, `put_at_zero_strike`.
§4 `kern_pos`, `kern_le_one`, `kern_antitone`, `tail_antitone`, `WR_pos`, `WL_nonneg`, `qR_nonneg`, `qR_le_one`, `qL_nonneg`, `qL_le_one`, `AR_nonneg`, `AL_nonneg`, `CALL_nonneg`, `PUT_nonneg`, `ALm_lipschitz`, `ALm_antitone`, `CALL_antitone`, `CALL_lipschitz`, `PUT_monotone`.
§5 `tail_witness`, `tailRep_witness`.
§6 `harmonic_law`, `shares_sum_one`, `share_eq_agg_ratio`, `share_nonneg`, `apportionment_conserves`.

AXIOMS. `#print axioms` for each of the 42 theorems reports exactly `[propext, Classical.choice, Quot.sound]` — a subset of the allowed set. The full listing is saved in `AXIOMS.txt` at the project root.

NOTES ON THE PROOFS (routes taken)
* §1–§3 follow the suggested routes: `uArg _ _ 0 = 0` via `Real.zero_rpow` with `a ≠ 0`, then `ibeta_zero`; `G1 < 1` from base `> 1` and negative exponent; `AL_glue` is `I1 - I1 - 0`; `atm_wings_meet` is the peg algebra after `field_simp`.
* One point needed more than the sketch: `tail_antitone` is stated for an *arbitrary* wing scale `s`, including `s ≤ 0`, where `kern p s v` is an `rpow` of a possibly negative base and can in principle be negative — so `TailRep.lower` alone does not give antitonicity. I proved two private bridge lemmas from the sandwich itself: (i) `TailRep` forces `kern p s ·` to be antitone on `[0,∞)` (cancel `m' - m > 0` between `lower` and `upper`); (ii) hence `kern p s v ≥ 0` for `v ≥ 0`, because a negative value would force the base `1 + (v/s)^a < -1`, and rescaling `v` by `r = (1/(2|t|))^(1/a)` produces a point `w ∈ (0,v)` with kernel value `(1/2)^{-(γ+1)/a} > 1 = kern p s 0`, contradicting antitonicity. This makes `tail_antitone` true as stated, with no added hypothesis. A small auxiliary `rpow` fact (`(r·x)^z = r^z·x^z` for `r > 0` and `x < 0`, which `Real.mul_rpow` does not cover) is proved from `Real.rpow_def_of_neg`.
* Layer 2 follows your skeleton: bracket bounds from `TailRep.lower`/`upper` with `kern p (sL p) 1 = G1`, giving `ALm_antitone` and `ALm_lipschitz` (including across the `1 ≤ m` cutoff); `CALL` is normalised on each side (`CALL k = qR · tail sR k` for `k ≥ 0`, and `CALL k = -k + ALm (-k)` for `k ≤ 0`, the value at `k = 0` matching precisely by `atm_wings_meet`, whose hypothesis is discharged from `WR > 0`, `WL ≥ 0`); the three-case split then gives `CALL_antitone` and `CALL_lipschitz`, and `PUT_monotone` follows from the latter plus parity.
* §5 witness: `tail s m = s²/(s+m)`, `kern s v = s²/(s+v)²`, and each sandwich gap is the explicit non-negative fraction `s²(m'-m)²/((s+m)(s+m')²)` resp. `s²(m'-m)²/((s+m)²(s+m'))`.

The only remaining build output is Lean's unused-variable linter on three hypotheses that your statements carry but the proofs do not need (`hs` in `tail_zero`, `hR` in `CALL_nonneg`/`PUT_nonneg`, `h` in `harmonic_law`/`share_eq_agg_ratio`). I left those statements untouched as instructed rather than tidying the warnings away.
