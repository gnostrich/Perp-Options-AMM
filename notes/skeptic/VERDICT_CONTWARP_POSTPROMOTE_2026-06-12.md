# VERDICT — contwarp HEAD promotion, POST-PROMOTE universal-gate audit (2026-06-12)

**Artifact:** HEAD = `engine/builds/HEAD_temporal_mvp_v28_lens.html`, md5 `4378bc1192878cfe437b8fa5551c5b88`
(byte-identical to `temporal_mvp_v28_lens_contwarp.html`, confirmed myself). Prior static HEAD retained
as `temporal_mvp_v28_lens_static_7e1ae39b.html` (md5 re-confirmed `7e1ae39b…`). Audit performed post-hoc
by operator direction (entry 181), not skipped.

## VERDICT: **CLEAR (post-promote).** No revert. Two non-blocking precision fixes named (§6).

Attack attempted and documented per item below — this is not a rubber stamp.

## 1. The promoted file IS the scoped build — CONFIRMED COLD
Diffed static-vs-promoted myself: **purely additive, 48 lines, ONE site (after old line 3496), entirely
inside the `ui` script block** (boundaries verified: engine 1584–2196, state 2200–2646, ui 2650–4452 —
engine and state blocks byte-untouched; blobs ~74/~1060 untouched; run_all md5 pin updated to 4378bc11).
The change: old `renderPricing` body renamed `renderPricingFrame`; a new rAF wrapper sweeps s:0→1 over
~0.8s, each frame drawn by the SAME live path on `framePool(pre, dyFull, s)`. I read `tradeUpdate`
(L1679): **pure** — returns a fresh `{x,y,alpha,beta}`, never mutates; α/β conserved ⇒ every frame lies
on the genuine trade hyperbola between pre and post (frames ARE the trade path, not an interpolation);
frames cannot execute money. `dyFull = previewPool.y − prePool.y` is exact because tradeUpdate sets
y_new = y + dy. Degrade paths sound (no rAF / cleared preview / same key ⇒ correct static draw). Banned
tokens: **zero** (my own grep: goalSeekW / wing exponent / wing steepness / target steepness / heldMode /
wField / override — 0 hits). **No second trace** anywhere in the diff — entry-173 proforma-only ruling
honored. This is exactly my entry-158 scope: renderer-side sampling of intermediate pools through the
existing live gLoc, no new engine math, no held center, no override.
Edge probes (mine, beyond the brief): animation key omits alpha/τ — worst case is a SKIPPED sweep with a
correct static final picture (cosmetic); mid-sweep state change worst case = stale frames <0.8s, draw
layer only. Neither rises to a flag.

## 2. C16 → VERIFIED — HONEST
Re-ran `lens_selfcheck.js` on the real promoted HEAD myself: **27 PASS / 0 FAIL** (CF2 telescoping
8.88e-16 — my own entry-158 state-function identity, now a gate). The prior HOLD's defect class
(#C16, pattern #12: held mode reaching the exponent; gate testing the algebra not the draw) is
**structurally absent**: there is no override anywhere — every frame is the live read at its own
45°-tangent point, which is the mechanic the operator ruled at 158. Critically, the gates now do what
my #C16 verdict demanded: **CF1 extracts the ACTUAL `framePool` from the UI source and machine-compares
the ACTUAL drawn-exponent expression (the gAt pool branch, regex-matched from source) against
`Engine.gLoc` per frame — and it fails CLOSED** (regex mismatch ⇒ drawnEq=false ⇒ red). CF3 bans
override tokens and any 4-arg gLoc. CF4 confines animation tokens to the draw layer and checks the
engine block byte-identical + money numerics zero-delta. Tester verified the PICTURE live ×2
byte-stable (final frame px-diff 0 vs static proforma; `evidence/v28_contwarp/` exists, screenshots +
run logs present). Formula AND picture both covered — VERIFIED is earned, not narrated.

## 3. Dip-caution relay — SUFFICIENT, one missing piece
The caution ("strikes near the sliding 45°-point flatten/dip while wings steepen — the mechanic,
nobody may fix it later") is locked in **CF3 with real teeth**: it asserts the swept 0.7× strike's
delta < −0.1 on `E.gLoc` directly AND documents the mechanic in the gate's own output text
("[dip = strike near new ATM — the skew moved; NOT a bug]"); a future "fix" flips CF3 red, and a
draw-path dodge flips CF1 red (fail-closed). DIFF_LEDGER records it as "skeptic-ruled do-not-fix".
Honest limit on the relay claim: manager replies are not transcribed (§2.2 by design), so "reached the
operator verbatim" is manager-asserted, not transcript-verifiable — but the operator AUTHORED the
causal mechanic himself (entry 158 verbatim: changing w "changes the 45 degree tangent slope point")
and watched chart-2 with comfort (entry 164), so sufficiency rests on the GATE, and the gate holds.
**Missing piece (non-blocking):** no PART-B A-row in `docs/COMPONENT_REGISTER.md` binds the dip
mechanic. Add one (e.g. A13: "swept-strike dip = the skew moving, do-not-fix — skeptic entry-158
ruling, CF3") so a future flatten is REGRESSED-class on the board, not merely a red gate.

## 4. Process — operator's prerogative, recorded honestly. NO FLAG.
Entry 181 verified verbatim in `history/operator/2026-06-10_kurtosis-curve-family-brief.md`
("but id like to see head now before i go to bed / all the other monolith stuff you can queue").
Operator outranks me (§2.1); the ordering overrule is his to make. The promote commit (26d1274) is
honest — "operator-directed entry 181", "skeptic post-promote audit owed", revert path named; the
register C16 row disclosed "skeptic post-promote audit IN FLIGHT". At promote time the build already
had 27/27 manager-verified gates + the tester's runs in evidence; the residual risk was bounded and
disclosed. Nothing here should have stopped the flip. One pattern note for FUTURE operator-directed
promotes: the same overrule carried the register flip to VERIFIED — had this audit found a defect,
VERIFIED would have been premature. Conservative pattern: flip to BUILT+PROMOTED at the overrule,
let VERIFIED wait on the audit. Note, not flag — this time the evidence base was already strong.

## 5. Carried-OPEN items — HONEST
(a) At-strike trade mechanic (entry 153 #4, foundational-unmet): carried OPEN in the register C16 gate
column as a separate build; FINDING-TRADE-AT-STRIKE carried in the ledger. Not claimed done anywhere
in the promote chain. (b) Post-execute single re-sweep: disclosed in the tester verdict and register
as HEAD-inherited semantics, UX call. (c) FINDING-WARP-DIR correctly marked superseded (held-lens
frame scrapped by entry 158 + my verdict), not silently dropped.

## 6. Non-blocking precision fixes (manager, next register pass)
1. **C16 row internal contradiction (stale text):** the row's history column still ends
   "**NOT yet promoted; HEAD unchanged 7e1ae39b. NEVER label as built until the picture is
   re-verified.**" — held-lens-era text now contradicting the same row's STATE cell. The picture HAS
   been re-verified (this audit + tester), so mark that block superseded/dated. Pattern #6
   (checklist staleness), not a state lie.
2. **Add the dip-mechanic A-row** (§3 above).
Also: C16's STATE cell is a paragraph, not the one-word STATE the register schema (my #45 design)
specifies — fold the narrative into SETTLED-BY/notes, keep STATE = VERIFIED.

## Inventory sweep
Renderer-only change: items #1–#15 unaffected (CF4 money-path zero-delta + engine byte-identity is
the evidence, re-run by me); #16 warp-with-trades is the item this build SERVES — visible continuous
warp per the operator's own entry-158 mechanic, with the at-strike economic leg honestly still OPEN.
No silent drops.

— skeptic, 2026-06-12 (post-promote universal-gate audit; operator entry 181 ordering recorded)
