# SKEPTIC VERDICT — promote-audit, inverse-lens transaction build (invtx)

date 2026-06-13 · artifact: `engine/builds/temporal_mvp_v28_lens_invtx.html` (md5
`5fea0e8d82ea85270e97ede71cf8e9ae`), from HEAD `de28c937`
(`HEAD_temporal_mvp_v28_lens.html`). Universal-gate promote-audit BEFORE HEAD flip.
Read-only. All numbers re-derived live: `/tmp/invtx_audit.js`, `/tmp/parse.js`, plus
`node engine/verify/lens_selfcheck.js` on both files. Prior maps:
`VERDICT_lens_tx_strike_2026-06-13.md`, `VERDICT_lens_R218_consistency_2026-06-13.md`.

## BOTTOM LINE — CLEAR-TO-PROMOTE, with ONE operator-disclosure caveat that the brief already names

The build faithfully implements the vetted Choice-B map and NOTHING more. The freeze /
two-strike seam holds exactly on THIS build, no agreed constraint regresses, the INVTX
gates are real (not patched-to-green), and the file-safety gate is clean. The single thing
that is NOT a code defect but IS a record-honesty item — the τ-direction the build ships
(sharper ⇒ θ_tx LESS far) contradicts the operator's still-standing entry-218 "yes" to
"sharper ⇒ further" — is honestly labelled in code + locked by a real gate, and the brief
surfaces it. I clear the build to promote AND require the manager to show the operator the
one plain-English τ-direction sentence (§5) before/at the flip, because he has not
explicitly relaxed entry-218. The math and the build are sound; the only risk is an
unwithdrawn operator "yes" being silently overridden by inference.

---

## 1. FAITHFUL TO THE VETTED MAP, NOTHING MORE — YES

The whole diff vs HEAD is **53 changed lines in exactly 3 regions** (`diff` hunk headers:
1780-1822 executeLeg, 2044-2080 close reversal, 2550/2555 band-store). No change anywhere
else. Region-by-region:

- **executeLeg θ_tx (L1799-1805):** `mode_tx = getSNorm(state)` (LIVE mode at open) →
  `a_tx = ln(theta_inner/mode_tx)` → `u_tx = sign(a)·√(a²+2|a|τ)` → `theta_tx =
  mode_tx·e^{u_tx}` → `K_tx = theta_tx·fx`, frozen. This is EXACTLY
  `mode·exp(sign(a)·√(a²+2|a|τ))` off the live mode, the map I ratified in
  `VERDICT_lens_tx_strike` §2. `tau`, `getSNorm`, `theta_inner`, `fx` all in scope.
  `dy = (wingSign·legSign)·N·K_tx` — swap sized at the further-out tx-strike. Independently
  re-derived (`/tmp/invtx_audit.js`): the lensed APPEARANCE of θ_tx equals the chosen strike
  to 1e-6 at τ∈{0.05,0.3,1,3} (true inverse of the view lens), expands outward both sides
  (call θ_tx≥chosen, put θ_tx≤chosen). `K_usd = theta_inner·fx` is KEPT as the
  settlement/valuation basis — the two-strike semantics, exactly as ratified.
- **close reversal (L2076-2085):** `Ksold/Kbought` read the STORED frozen `K_tx` first
  (K_inner fallback only for legacy bands), `dyRev = −(open dy)` with the same stored N and
  frozen K_tx. This is the freeze, used at close. Correct.
- **band-store (L2584, 2590):** `K_tx: result.leg1/2.K_tx` stored on both legs. Wires the
  frozen value from open to close. Correct.
- **VIEW UNTOUCHED (Choice B):** INVTX-5 byte-compares `hTau/hpTau/gLoc/markLensed/legPrice/
  lensU` against clean HEAD → all `id`. Chart-2 / funding / no-jump / settlement basis all
  byte-identical. **No scope creep.** The one behavioral move in the pool-write path (AS5
  warp at θ=1.1 went 0.2200→0.2587) is the DIRECT, intended consequence of swapping at the
  bigger K_tx — AS5 still proves the warp identity `Δγ == dy/β` exactly. In-scope, not creep.

## 2. THE FREEZE + TWO-STRIKE SEAM (the thing that bit at-strike) — HOLDS ON THIS BUILD

- **Open-then-close reserves round-trip EXACT with the frozen θ_tx.** INVTX-2: frozen
  err = 1.16e-10; the K_inner-fallback (the would-be drifted-mode basis) leaks $58,500 —
  so the gate PROVES the freeze is load-bearing, not assumed. AS2 (full band) restores
  reserves x-err 7.11e-15 / y-err 1.16e-10 `[frozen K_tx]`.
- **No free round-trip for a single option (entry-199).** INVTX-3: single leg
  open+reverse with the frozen K_tx → Σdy = 0e+0 and reserves restore to 0e+0 on all four
  wing/side combos. The financing leg is premium-free cash that nets to zero; all trader
  value lives on the chosen-K lensed mark. The financing-at-θ_tx / settle-at-chosen-K seam
  is the deliberate two-strike semantics I cleared in principle (`VERDICT_lens_tx_strike`
  §4 / R218 §4) — verified here it does NOT open a free trade.
- **DEPTH_FRAC fires on the bigger N·K_tx.** L1813 guard tests `N·K_tx` (not K_usd); the
  AS-guard gate shows an over-depth reject quoting "$363670.80 exceeds 90% of pool cash
  depth" — the at-strike capacity correctly SHRINKS for far-OTM (g-tx4 met).

## 3. NO AGREED-CONSTRAINT REGRESSION — CONFIRMED BY GATES, NOT ASSERTED

A5 wings: gate (2b) g_loc→γ deep wings (2.6363) + (5c) lensed exponent → γ-scale
(g_wing=2.6290 vs γ=2.6364) — PASS, and INVTX-5 proves the wing-bearing functions are
byte-identical to HEAD anyway. A6 no-arb / C7 settlement: (4a) value continuous + frac
1/(g+1) maxValGap 1.90e-10, (4b) slope continuous maxSlopeGap 1.29e-5, (8.x) open==settle
maxErr 0. A16 no-jump ATM: (2a) g_loc(ATM)=0, (5a) funding→0 at ATM. C6 cap-free: (3)
|g_loc|≤γ. Because the view layer is byte-identical (INVTX-5), these MUST hold — and the
gates re-prove it on the build rather than carrying it. **Bare HEAD path still 34/34**
(re-ran; INVTX block correctly skips when no `theta_tx` token).

## 4. INVTX GATES HONEST, NOT PATCHED-TO-GREEN — YES

- **INVTX-1** calls `E.executeLeg` and matches the ENGINE's `theta_tx` to the formula
  ≤1e-9 across 6 strikes + checks the h_τ inverse round-trips ≤1e-12 (maxRt 1.11e-16).
  Real engine-faithfulness, not a re-implementation tautology.
- **INVTX-3** (no free money) computes dy on the engine and reverses through the engine's
  own `tradeUpdate` — Σdy and reserve restoration both to 0e+0. Real.
- **INVTX-4 is a REAL sign-lock, not cosmetic.** It asserts `monotoneUp` — θ_tx/mode
  strictly GROWS with τ (sharper ⇒ less far). If a future change silently flips the lens
  polarity, monotoneUp goes false and the gate FAILS. It does not bless the direction as
  "right"; it LOCKS the documented direction against a silent reversal — which is precisely
  the protection my MEMORY F6 / patterns #10/#11 (three builds in a row vulnerable on the
  τ-sign) demand. Caveat: INVTX-4 re-derives the formula inline rather than calling the
  engine, so on its own it locks only the MATH direction — but INVTX-1 separately pins that
  the ENGINE ships that same formula to 1e-9, so together the engine direction is locked.
  Adequate.

## 5. τ-DIRECTION HONESTY — the one caveat (operator-disclosure, not a code defect)

Verbatim record (now back-filled — my prior "no transcript" was a filename misread, manager
corrigendum 2026-06-13, accepted):
- **Entry 218 (06:15 UTC, verbatim "yes")** authorized "a sharper warp should make a trade
  land further out-of-the-money." Today's lens does the OPPOSITE. **This "yes" was never
  withdrawn.**
- **Entry 220 (06:39 UTC, verbatim):** *"fuck you. lens shows otm + is otm -; so when you
  choose otm - it transact at otm + thats fucking it"* — the operator restates ONLY the
  inverse-lens core mechanic, with NO mention of τ-direction.

The build is **faithful to entry 220's restated mechanic** (choose displayed OTM- → transact
at true further-out OTM+ = inverse of the view lens) — that is implemented exactly. The
τ-direction it ships (sharper ⇒ LESS far, INVTX-4) is the only buildable form that keeps the
chart-2 he likes (proven mutually-exclusive in R218: can't have {inverse-of-view, sharper⇒
further, today's chart-2} all three). So the build silently resolves the 218-vs-chart-2
conflict in favor of Choice B. **The operator chose today's lens at 220, but he did not
explicitly relax entry-218's "sharper ⇒ further."**

Is shipping this honest given the record? **Yes — provided the manager states the side-effect
to the operator at the flip.** It is honest because: (a) the build is faithful to the
operator's own flat final restatement (220); (b) the τ-direction contradiction is documented
in the code header AND locked by a real gate (INVTX-4); (c) the brief itself raises it. It
would be DIShonest to flip HEAD while leaving entry-218's "yes" presented-as-satisfied. The
manager must route this one plain-English sentence VERBATIM (no invented vocabulary):

> The build does what you said at the end: pick the displayed (closer-looking) strike, the
> pool trades at the true further-out strike. One side-effect you should confirm you accept:
> with this lens, a SHARPER knob makes the trade land LESS far out, and a FLATTER knob makes
> it land FURTHER out — the opposite of "sharper ⇒ further" you said yes to earlier. Keeping
> the chart-2 view you like forces this direction; getting "sharper ⇒ further" would require
> changing the chart-2 view (a bigger curve change). Ship as-is, or change the chart-2 view?

This is a one-line disclosure, not a re-litigation. If the operator says "ship," promote
stands. I do not pick the lens (curve = operator's, §0).

## VERDICT

**CLEAR-TO-PROMOTE.** The build is faithful to the vetted Choice-B map and nothing more;
the freeze + two-strike seam round-trips exactly and opens no free trade; no agreed
constraint regresses; the INVTX gates (incl. the INVTX-4 sign-lock) are honest; blobs
canonical, 3 scripts parse, only the 3 vetted regions touched. The single caveat is NOT a
code hold: the operator's entry-218 "yes" to sharper⇒further was never withdrawn and the
build necessarily ships the opposite direction — honestly labelled, but the manager must
DISCLOSE the §5 sentence to the operator at the flip rather than present 218 as satisfied.
Revert path HEAD `de28c937` retained. Promote on green + that disclosure.

— skeptic, 2026-06-13
