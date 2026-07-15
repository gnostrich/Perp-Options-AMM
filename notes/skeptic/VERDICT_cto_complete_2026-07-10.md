# SKEPTIC VERDICT — CTO_UPGRADE_COMPLETE.md final gate (operator→CTO relay)

**Artifact under review:** `evidence/staging_e2e_2026-07-10/CTO_UPGRADE_COMPLETE.md`
**Ground truth:** function-by-function diff of all 3 `<script>` blocks,
`temporal_mvp_v28_lens_constmult.html` (md5 `8f897edc`, = `80f050e2` behaviour) →
`HEAD_temporal_mvp_v28_lens.html` (md5 `5ce1a76c`), re-derived this session in `vm`.
**Scope:** completeness + accuracy of the NEW/changed content vs the prior already-gated docs.

---

## Item 1 — Completeness (every diff item mapped? nothing invented?) — **CLEAR**

Re-ran the engine-function diff in Node (`vm`, `<script id="engine">` → `Engine`):
- **ADDED (2):** `revertArc`, `tradeUpdateAt` — matches doc.
- **CHANGED (4 distinct):** `closeBand`, `fundingPerStrike`, `markLensed`,
  `executeLeg` (`executeCompositeLeg` reports as changed only because it **IS** `executeLeg` —
  `E.executeCompositeLeg === E.executeLeg` returns `true`, so it is not a separate behaviour).
- **UNCHANGED (23):** `arbitrageToOracle bsValue compositeRay executeBand executeFourStrikeSpread
  gLoc getDepth getMP_raw getSNorm getW isBarrier isOTM legIsITM legPrice legValueUnified lensU
  mark markEff poolMark rebase tradeUpdate vsValue wingMember` — includes gLoc, tradeUpdate,
  executeBand as the doc states.
- **state diff (verified line-level):** exactly `setM` clamp + `arc: result.leg{1,2}.arc` storage
  (2 legs) + one cosmetic vol-calibration comment. No hidden third change.
- **ui diff:** 90 removed / 230 added (≈ "~240 lines" is a fair characterization).

Mapping is total and non-inventive: markLensed→F1; tradeUpdateAt+executeLeg(+alias)→F2;
gLoc-unchanged→F3; setM-clamp→F3b; closeBand+revertArc+arc→F4; fundingPerStrike→F5;
tradeUpdate-unchanged→F6; ui→F7. **Nothing in the diff is left unmapped; every claimed delta is
real in the diff (nothing invented).**

## Item 2 — F3b m-clamp — **CLEAR**

State diff shows verbatim:
`OLD: function setM(t) { if (t > 0 && isFinite(t)) state.m = t; }`
`NEW: function setM(t) { if (isFinite(t)) state.m = Math.min(6, Math.max(1, t)); }`
Doc quote (`state.m = Math.min(6, Math.max(1, t))`, was `t>0`) is accurate. **PORT / backend must
enforce is the right call** — the clamp lives in the STATE/model layer (Store), not just the UI
input; and `m` sets the economic parameter `g_loc = m·γ`, so a backend accepting `m∉[1,6]` would
produce out-of-product curves. (There is ALSO a UI-input clamp at ui line ~2878, belt-and-suspenders;
that does not make it UI-only.)

## Item 3 — revertArc + frozen-arc `arc` genuinely ADDED — **CLEAR**

- `revertArc`: **0** occurrences in OLD; a real function + export in NEW. Genuinely ADDED.
- `arc` storage: absent in OLD state; NEW builds `arc:{ dxA:post.x−state.x, dyA:dy,
  dwA:(post.alpha/post.x)−(state.alpha/state.x), oOpen:fx }` and stores it on each leg on open.
- **Formula quote correct.** Actual body: `x2 = s.x − arc.dxA*r; w2 = w_live − arc.dwA;
  {..., alpha: x2*w2, ...}` — matches doc `x₂=x−dxA·r, w₂=w−dwA, α₂=x₂·w₂` (doc omits the
  `y₂=y−dyA` / β leg for brevity; the three quoted are exact). Note revertArc is presently
  **DORMANT** — the live close uses `tradeUpdateAt`; revertArc is retained for UPDATE-2 charge-back.
  Doc F4 labels it a "helper" and correctly attributes the live reversal to tradeUpdateAt, so no
  overclaim. (Advisory only: a CTO could defer porting revertArc itself until UPDATE-2 per F10 HOLD.)

## Item 4 — executeCompositeLeg = alias of executeLeg — **CLEAR**

`E.executeCompositeLeg === E.executeLeg` → **true** in NEW. The engine export block comments it as
an "alias for back-compat". Not a separate behaviour; doc's parenthetical is accurate.

## Item 5 — Prior-gated corrections preserved (no regression) — **CLEAR**

All six preserved in the reformat:
1. F1 seam UNVERIFIED-at-γ1 → F1 staging-now: "matches reference exactly at γ=1 … seam region
   **UNVERIFIED** (γ=1 + outside ±50% window)". ✓
2. F2 warp UNRESOLVED → F2 staging-now: "off-spot warp **UNRESOLVED** — risk still middle-booked". ✓
3. F4 round-trip inconclusive → F4 staging-now: "round-trip Δ=0 (display precision) —
   **inconclusive** at γ=1". ✓
4. F5 c=0 degeneracy → F5 staging-now: "at m=1 c=(1−1)/2=0 → identically 0 → balanced=0 trivially
   true → **UNVERIFIED**". ✓
5. "staging not confirmed H3" → carried in F2 staging-now ("risk still middle-booked"; the H3
   discriminator is exactly the ρ≠1 α,β-move). Consistent with REPORT_round7's owned correction
   (α/β conservation is the version-agnostic SPOT law, NOT H3 evidence). ✓
6. "80f050e2 not staging's actual source" → checklist Caveat: "'current' = the reference
   80f050e2, **not staging's actual Go source** (unreadable) … ask the CTO which commit". ✓
   (Using the `constmult` file, md5 `8f897edc`, as the `80f050e2` behavioural reference is legitimate —
   CLAUDE.md records `80f050e2` as a comment-only cleanup of `8f897edc`, behaviorally identical.)

## Item 6 — Formulas correct after reformat — **CLEAR** (re-derived numerically)

- **F1 markLensed** (engine-run, NEW): g=2 → ATM `1/((g+1)((g+1)/g)^g)=0.14815`, put seam
  `g/(g+1)=0.6667` (→$66.67), seam value `1/(g+1)=⅓`; g=6 → ATM `0.05665`, seam `0.8571`
  (→$85.71), value `⅐`. All match doc. `mark ≥ max(0,intrinsic)` enforced (a16 A16.3/CM10).
- **F2 tradeUpdateAt** (engine-run): `xT=x·ρ^(w−1)`, `yT=y·ρ^w`, local-pair conserved; pool
  (10,10,½), ρ=4, dy=+1 → **w′=11/21** (0.523810) exact; ρ=1 → byte-identical dx to `tradeUpdate`
  (spot). Doc's contrast "old=22/43" is carried verbatim from the prior gated docs
  (CTO_UPGRADE_INSTRUCTIONS, CTO_UPGRADE_TABLE_simple) — a preserved value, not a reformat change;
  labeled "(wrong)". (Not independently re-derived here — it depends on the OLD executeLeg dy-sizing;
  out of this gate's "confirm nothing changed" scope, and it did not change.)
- **F5 fundingPerStrike** (code-read): `g=gLoc=m·γ`, `gA=tau=m`, `c=(gA−g)/(gA+1)`,
  `dev=|c·ln(strike/mode)|`, OTM-gated (0 on ITM/ATM/balanced-pool since a w=½ pool has live γ=1 ⇒
  g=gA ⇒ c=0). Matches doc F5 exactly.
- **Gates re-run on NEW:** `lens_selfcheck.js` **41 PASS / 0 FAIL**, `a16_atm_gate.js` **5 PASS /
  0 FAIL** — confirms the doc's "41+5" sign-off bar. a16 A16.2 independently confirms the ATM-value
  formula.

---

## VERDICT: **CLEAR-TO-RELAY** (all 6 items CLEAR)

No FLAG. The consolidated table is complete against the code-level diff (every diff item mapped,
nothing invented), F3b/revertArc/arc/alias facts verified against both engines, all six prior-gated
caveats preserved, and every formula re-derives (F1/F2/F5 numerically, gates 41+5 green).

Advisory (non-blocking): (a) revertArc is DORMANT in the live close — a CTO may defer porting it to
UPDATE-2 per the F10 HOLD; doc already frames it as a helper, so no correction required. (b) "~240
lines" is a round figure (actual 90 removed / 230 added) — fine for a prose changelog.

— skeptic, 2026-07-10
