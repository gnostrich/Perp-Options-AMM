# STOCK-TAKE & ROADMAP — warp fidelity (manager, 2026-06-11)

_Operator-ordered (entry 35): "take stock … get it vetted, get the fix done in v27, check the math
verification layer thats supposed to avoid things like this slipping, and keep the whole math unified …
after the skeptic filtered whats current." Built ON the skeptic foundation pass
`notes/skeptic/VERDICT_FOUNDATION_PASS_2026-06-11.md` (filter + VET PASS + gate-blind-spot diagnosis).
Read-only on the engine; HEAD v27 `1eebfcd6` untouched (operator live-playing)._

## 0. Current truth (skeptic-filtered baseline)
- **HEAD = v27 (W) kurtosis** (`HEAD_temporal_mvp_v27_wkurtosis.html`, `1eebfcd6`). Strong-form trade is
  faithful **as a transformation** (α/β conserved, φ-recenter unique, tangency, price==slope) — but
  **warps at SPOT** (`tradeUpdate(s,dy)` takes no strike arg; `executeLeg` anchors at live reserves) ⇒
  **strike-INDEPENDENT. This is the LIVE fidelity gap (#16-anchoring).**
- **Paper** warps each leg at its **ray∩curve trade point**, continuously ⇒ **strike-DEPENDENT**
  (`dφ/dy = (β/y²)/w′(u)`). Operator's intuition is paper-faithful (skeptic #16, manager-verified).
- **The fix is anchoring, not new math** — the engine's discrete `tradeUpdate` IS the continuous law's
  step, byte-for-byte; only the evaluation POINT (spot → trade point) changes.
- **(W) generalisation VET = PASS** (skeptic re-derived |diff| 1.24e-10; τ-gearing `dz/dw*=1/w′`;
  Balancer-limit; 4 contracts). warp-amm Aristotle cluster backs the continuous case, trade-point-anchored.

## 1. VET ✅ DONE (skeptic foundation pass, PASS)
The generalisation + trade-point fix spec are sound. The **one uncertified piece** = the
`(α,β)`-flow-confinement lemma (one global φ across the trade point AND the reserves point;
path-indep numeric 0.0, not Lean) → **[needs-Aristotle], a short obligation** (research-lead to phrase;
NOT yet submitted). The full continuous integral (paper L288 placeholder) is the larger separate piece.

## 2. FIX in v27 — trade-point anchoring  ⏳ HELD for operator authorization (operator-tier §7)
- **Scope (skeptic: NOT monumental):** anchor each leg's warp at its `arbitrageToOracle(s,K)` trade
  point instead of the live spot; `tradeUpdate` warps there. Contained change to the trade path
  (`executeLeg`/`legPrice`). Subtlety = the one-global-φ reconciliation (the §1 lemma).
- **Gates before promote:** file-safety; the NEW strike-dependence gate (g, §3) flips from "documenting"
  to a HARD assert and must go green; skeptic review; tester live (same cash leg → different warp per
  strike, on screen); manager re-derive.
- **Process:** build on a SIDE build, do NOT promote/overwrite HEAD while the operator plays; promote on
  operator go. **Awaiting operator: build-now-on-side vs hold at vetted+planned.**

## 3. HARDEN the verification layer ✅ DONE (this pass) + class noted
Root cause (skeptic C): every WARP gate + verdict #14 checked WHAT is conserved, never WHERE the swap is
anchored / strike-dependence. Executed in `engine/verify/wcurve_selfcheck.js` (gate only — HEAD html
untouched; now 22 PASS, run_all green):
- **(d) re-scoped** "φ moves [transformation only — NOT anchoring]" (was the #14 over-reach source).
- **(f) re-scoped** "LOCAL/spot path-independence [NOT global; (α,β)-flow lemma OPEN]".
- **(g) ADDED** — anchoring/strike-dependence, interim DOCUMENTING gate: prints `[KNOWN GAP #16] live
  warp anchors at SPOT ⇒ strike-INDEPENDENT` (non-silent), shows the (W) math carries strike-dep at the
  trade point (Δφ 3.3e-2), PASSES as known-gap; **flips to a HARD assert when the fix lands.**
- **Class rule (standing, for all future gates/verdicts):** *does the check feed in the strike/
  registration coordinate, or only local reserve state?* If only local, it cannot see an anchoring/
  registration fidelity gap — label it "transformation-only," never "faithful."

## 4. UNIFY the math  ◻ in progress (this pass) + tracked
Skeptic named 5; status:
1. **`docs/feature_inventory.md` #16** → amend with the #14 correction (v27 = transformation at SPOT;
   anchoring OPEN). ✅ this pass.
2. **`WARP_v24_vs_v27_compare` headline** already FLAG-WRONG-headed (#13). ✅ standing.
3. **warp-amm cluster → `formal/INDEX.md`** (predates index). ✅ this pass.
4. **research-lead MEMORY** possible dead `κ:=δ` claims → research-lead reconcile before it briefs again. ◻ tracked.
5. **`wcurve_selfcheck.js`** stale → = §3, done. ✅
- **One source of truth (the warp story):** paper premise (trade-point + continuous) → engine cheats at
  spot (#16 LIVE) → trade-point fix (spec'd, vetted) → (W) generalisation (`(β/y²)/w′(u)`) → warp-amm
  Aristotle backing → open lemmas. This stock-take + the foundation verdict are that single thread;
  the scattered per-step notes are the audit trail beneath it.

## Open lemmas (the honest floor)
`(α,β)`-flow-confinement [needs-Aristotle]; warp∘rebase-commute [needs-Aristotle]; φ-anchor/funding under
moved φ (operator-tier); full continuous integral (paper L288 placeholder). None block playing; (1)+(2)
gate calling the fix "certified."

## Sequence
VET ✅ → (operator authorizes) FIX on side build + (g)→HARD + skeptic + tester → promote on operator go →
the `(α,β)` + warp∘rebase lemmas to Aristotle. Verification-layer hardening (§3) and unify (§4) are done/
in-progress now and do not wait on the fix.
