# SKEPTIC VERDICT — RE-POSED trade-point-anchoring spec (re-review)

_skeptic, 2026-06-11. Artifact: `notes/research/SPEC_tradepoint_anchoring_REPOSED_2026-06-11.md`
(research-lead's re-pose of the spec I FLAG-WRONG'd in verdict #18). Re-derived independently
against the LIVE engine (`engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html`, md5 1eebfcd6…,
confirmed), `<script id="engine">` sandboxed in Node `vm`. I built the re-posed
`reposed(s,dy,tp)` from the spec's own §1 code block (z=z0·G, G=w′(u_spot)/w′(u_tp)) and ran it
against the live `wField`/`getMP_raw`/`arbitrageToOracle`/`tradeUpdate`. I did NOT trust the
spec's `/tmp/repose3.js` or the manager's `/tmp/mgr_repose_verify.js`. Script:
`/tmp/verify_repose.js`. Operator chose path A (entry 38); operator live-playing HEAD; intern
does not build until this verdict._

---

## (1) TELEPORT — **FIXED. CONFIRMED faithful. The construction is now sound on the reserves channel.**

Independently reproduced the spec's §1.1 table **byte-for-byte** on the gate pool
`{x:10,y:12,τ:0.3,w∈[0.52,0.72],φ:0}`, mp0=2.4578117, same dy=0.1 at every strike:

| K/mp0 | x′ | y′ | φ′ |
|---|---|---|---|
| 1.00 | 9.959812 | 12.100000 | −0.001104 |
| 1.10 | 9.959812 | 12.100000 | −0.054467 |
| 1.60 | 9.959812 | 12.100000 | −0.684490 |
| 2.00 | 9.959812 | 12.100000 | −1.724384 |

`(x′,y′)` is **IDENTICAL across every strike** (9.959812 / 12.100000) and **identical to the
legacy `tradeUpdate(s,dy)`** (9.959812 / 12.100000, φ′=−0.001104). The reserves move from the
LIVE point on the pool's OWN hyperbola; the strike enters ONLY φ′ (the curve shape) via the
gearing G read at the trade point. This is exactly "trades skew the curve, not move the reserves
point along it" + the paper's bring-back-to-pre-trade-reserves (L39). **The teleport from the
prior spec (y′ ran 12.10/12.53/15.01/17.20 across strikes) is GONE.** The one structural error I
FLAG-WRONG'd in #18 is correctly fixed: strike-dependence moved out of WHERE-the-pool-sits and
into the warp AMOUNT, which is where it belongs.

**Spot-reduction: CONFIRMED EXACT (0.0).** When tp==spot, G=1 is an algebraic identity (not a
bisection round-trip), so `reposed(s,dy,tpSpot)` is byte-identical to legacy `tradeUpdate(s,dy)`:
|Δφ|=0.0, |Δx|=0.0 at dy=0.1/0.5/−0.3. Better than the prior 1.67e-16. The anchor-omitted /
executeBand internal-arbitrage path stays byte-identical to today. Reserves-channel guards
(wing-range on w*, α/β conservation) are now structurally identical to the legacy guard — no new
rejection surface from the warp channel. All re-derived, all hold.

## (2) THE FAR-STRIKE DIVERGENCE — verdict: **(a) GENUINE PATHOLOGY. divergence-BLOCKS-escalate-to-operator.**

This is real, intrinsic, and unbounded. It does NOT block on grounds of being a *bug* in the
construction — the construction faithfully implements trade-point anchoring; the divergence is the
faithful behavior of (trade-point anchoring + frozen wings). It blocks because **it is an
economic/curve-object decision the operator has not been given**, and shipping A as-is bakes in an
exploitable / unphysical regime silently.

**The mechanism, re-derived independently:** `G = w′(u_spot)/w′(u_tp)`, and
`w′(u)=dw2·τ²/(τ²+u²)^{3/2}`, so `G = ((τ²+u_tp²)/(τ²+u_spot²))^{3/2}` (I verified this closed
form against the engine: K=8 → G=202.49 matches to all digits; K=1000 → 7493.06). As the trade
point moves into the frozen wing, `w′(u_tp)→0` and `G→∞`. Since `u_tp ≈ ln K`, **G grows like
(ln K)³ — monotone and UNBOUNDED.** Measured |φ′| at fixed dy=0.1:

| K/mp0 | u_tp | w(u_tp) (→wPlus=0.72) | G | \|φ′\| | reserves in-band? |
|---|---|---|---|---|---|
| 1.6 | 0.50 | 0.7055 | 4.49 | 0.685 | YES (w*=0.67465) |
| 2.0 | 0.69 | 0.7117 | 9.80 | 1.724 | YES |
| 8.0 | 2.04 | 0.7189 | 202 | **39.4** | YES |
| 60 | 4.05 | 0.7197 | 1549 | **303** | YES |
| 1000 | 6.86 | 0.7199 | 7493 | **1467** | YES |

**Three facts make this a pathology, not a curiosity:**

1. **The reserves wing-cap does NOT bound it (verified).** At EVERY strike above, the live
   reserves move to the same in-band `w*=0.67465` (the cash leg is tiny, the reserves barely move);
   the trade point is what sits deep in the wing. So the existing wing-range guard — which reads
   the LIVE w* — never fires, and there is **no other guard** in the construction or the live
   `executeLeg` path that bounds how far OTM a strike can be registered. `arbitrageToOracle(s,K)`
   returns a valid in-band trade point for arbitrarily large K (w(u_tp) approaches wPlus but never
   reaches it — verified to K=1000·mp0, gap_to_wPlus=9.5e-5, still finite). **The spec's claimed
   "frozen-wing range cap" (lines 165/217-219) DOES NOT EXIST** — there is no K at which tp ceases
   to exist or the guard trips. The spec asserts a cap that the engine does not provide.

2. **A DUST trade deep-OTM reshapes the whole curve.** dy=0.001 at K=8·mp0 gives φ′=−36.76 (vs
   legacy spot φ′=−0.000007) — a ~5-million-fold amplification of a near-zero cash leg into a
   curve-destroying warp. This is the exploitable / unphysical signature: a trader can move the
   pool's entire pricing geometry with an arbitrarily small far-OTM leg.

3. **φ′=39 actually destroys the ATM geometry (verified).** At K=8·mp0 the warped φ′=−39.4 shoves
   the ATM weight from 0.62 to **0.7200 = wPlus saturated to machine precision** — the elbow is
   pushed clean out of the visible range and the curve degenerates to the flat far-wing power-law
   everywhere a trader can see. The kurtosis knob's whole purpose (a rounded ATM elbow) is erased
   by one small far-OTM leg.

**Does the paper's CONTINUOUS integral (L288 placeholder) bound it where the discrete form does
not? NO — re-derived.** I integrated the continuous warp rate
`dφ/dy = (1/w′(u_tp))·(β/y²)` along the cash leg and compared to the discrete `z0·G`:

| K/mp0 | continuous \|Δφ\| | discrete \|φ′\| |
|---|---|---|
| 1.6 | 0.059 | 0.684 |
| 8.0 | 2.64 | 39.4 |
| 1000 | 97.7 | 1467 |

The continuous form is ~15× SMALLER in constant — but it **still diverges** (0.017 → 97.7 across
K=1.1→1000), because the divergent kernel `1/w′(u_tp) ~ (ln K)³` appears in BOTH forms. The
continuous integral reduces the magnitude; it does not remove the strike-driven blow-up. So
"switch to the continuous integral and the divergence goes away" is FALSE — **the divergence is
intrinsic to (trade-point anchoring + frozen wings), independent of discrete-vs-continuous.** This
forecloses the easy escape and is precisely why it must go to the operator: the only ways to bound
it are (i) a cap on |φ′| / the registered strike range, or (ii) a different anchoring object — both
operator-tier curve/economic decisions, not implementation choices the manager or intern may make.

**The safe boundary (for the operator's framing), this pool / dy=0.1:** |φ′| stays within the
elbow scale (≈τ=0.3) only up to **K ≈ 1.35·mp0**, and within 1 nat up to **K ≈ 1.70·mp0**. Beyond
~1.7× moneyness the warp leaves the physically meaningful range; by ~8× moneyness it saturates the
wing. (The boundary tightens with larger dy and with smaller τ / narrower Δw — it is
calibration-dependent, which is itself why the operator must set the policy.)

**Reconcile with the entry-37 invariant verdict (§2 of the spec): I CONFIRM that verdict
("same notional ⇒ NOT same warp; warp = z0(dy)·G(K), strike channel dominant").** The divergence
in (2) IS the same `G = 1/w′(u_tp)` strike channel the spec's §2 characterizes — they are one
phenomenon. The spec is internally honest that the warp is strike-dominated; what it does NOT do is
escalate that the strike channel is *unbounded* and *uncapped* as a build-blocker. The honesty in
§2 ("same notional ⇒ same warp and trade-point anchoring are mutually exclusive — operator call")
is correct and is the SAME call I am escalating here, one layer down: trade-point anchoring on
frozen wings is not merely strike-dependent, it is strike-DIVERGENT, and the operator authorized
"path A" (entry 38) without (as far as the artifacts show) being shown the (ln K)³ blow-up or the
dust-trade amplification. **That specific consequence must reach the operator before the build.**

## (3) THE GATE (g.1) — sound for what it tests, but **MUST add a sanity bound on |φ′|.**

The robust (g.1) as the spec writes it is correct *for detecting strike-dependence* and I
reproduced it: φ_near=−0.054467, φ_far=−0.684490, |Δφ|=0.630023; φ_spotReduce=**0.0 exact** ⇒
`FLOOR=max(0,EPSILON)=2.22e-16` ⇒ ratio ∞, clears `1e6·FLOOR`; ordered `|φ_far|>|φ_near|` TRUE.
The `FLOOR=max(·,EPSILON)` div-by-zero guard is mandatory (φ_spotReduce is now exactly 0) and is
present — good. A strike-independent engine gives φ_near==φ_far ⇒ dphi=0 ⇒ FAILS; cannot
false-pass. **This part is finalized and correct.**

**But — given the divergence — the gate as written is dangerously incomplete: it has NO magnitude
assertion.** I verified that a |φ′|=39.4 warp at K=8·mp0 PASSES g.1 unchanged (g.1 only checks
near<far ordering and noise-floor margin — both hold while the curve is being destroyed). A gate
whose name implies "warp is well-behaved and strike-dependent" but whose body permits a
curve-erasing |φ′|=39 is exactly blind-spot pattern #4 (name claims faithfulness, body checks a
narrower property) — the same class I diagnosed in verdict #17 for WARP(d)/(f). **The gate MUST
assert a SANITY BOUND on |φ′| over the registered strike range** (e.g. `|φ′| < C` for a
to-be-set C, OR `|φ′|` stays within a small multiple of τ across the legal strike band) — and that
bound's value is the operator's policy from (2), not a number the gate author may invent. Until the
operator rules on the cap, the honest interim gate form is a NEGATIVE/recording assertion: "warp at
K=8·mp0 reaches |φ′|=39.4 — KNOWN UNBOUNDED, divergence escalated, no cap set" — so the divergence
is gated-visible, not silently green.

---

## VERDICT

1. **TELEPORT FIXED — CONFIRMED.** The re-posed construction is faithful: reserves move from the
   LIVE point (x′,y′ strike-invariant at fixed dy, identical to legacy), strike-dependence lives
   only in φ′ via G=w′(u_spot)/w′(u_tp), spot-reduction is byte-exact 0.0. The §18 FLAG-WRONG is
   resolved. No teleport.

2. **DIVERGENCE — divergence-BLOCKS-escalate-to-operator.** `G ~ (ln K)³ → ∞`: a dust trade
   (dy=0.001) at K=8·mp0 produces |φ′|=36.8, saturating the ATM weight to the wing edge and erasing
   the elbow. The reserves wing-cap does NOT bound it (reserves stay in-band; the trade point is in
   the wing). The spec's claimed "frozen-wing range cap" does not exist — `arbitrageToOracle`
   yields a valid in-band tp for arbitrarily large K. The paper's continuous integral does NOT cure
   it (same (ln K)³ kernel; ~15× smaller constant only). **Precise reason: trade-point anchoring on
   frozen wings is intrinsically strike-DIVERGENT, exploitable by dust far-OTM legs, and the only
   fixes (cap on |φ′| / strike-registration range, or a different anchoring object) are operator-
   tier curve/economic decisions.** Safe boundary (this pool, dy=0.1): |φ′|≤τ up to K≈1.35·mp0,
   |φ′|≤1 up to K≈1.70·mp0; wing-saturation by ~8×. Operator authorized "path A" (entry 38) —
   must be shown the (ln K)³ blow-up and dust amplification, and must choose a cap policy, BEFORE
   the intern builds.

3. **GATE.** (g.1) noise-floor-relative + ordered, pinned pool/dy, `FLOOR=max(φ_spotReduce,EPSILON)`
   — finalized and correct for strike-dependence; reproduced (|Δφ|=0.630023, ordered TRUE,
   spotReduce=0.0). (g.2) spot-reduction `<1e-12` (target 0.0) — correct. **REQUIRED ADDITION:**
   a (g.4) SANITY BOUND on |φ′| across the legal strike band — a |φ′|=39 warp currently passes
   g.1 unchanged. The bound's threshold is the operator's cap from (2); interim, the gate must
   RECORD the divergence (negative/known-gap assertion) so it is not silently green.

**MOST IMPORTANT LINE:** the teleport is genuinely fixed and the reserves channel is now faithful
— but a dust trade (dy=0.001) registered at a far-OTM strike (K=8·mp0) drives φ′ to −36.8,
saturating the ATM weight to the frozen wing and erasing the kurtosis elbow; this `G ~ (ln K)³`
divergence is intrinsic to trade-point anchoring on frozen wings (the continuous integral does not
cure it), is uncapped by any existing guard, and must be put to the operator with a cap decision
before path A is built.

## Honest scope / what I did NOT break
- §1.3/§1.4 φ-consistency (one-global-φ on the LIVE hyperbola) — re-derived sound, mounted on the
  correct reserves now (the #18 "wrong hyperbola" defect is gone). The (α,β)-flow-confinement
  certificate stays `[needs-Aristotle]`, OPEN — the spec labels it honestly (§1.4/§5.3 "do not
  report as proven"); no overclaim there.
- §2 entry-37 invariant verdict ("NO, warp=z0·G strike-dominant") — I CONFIRM it; it is the same
  phenomenon as the (2) divergence, honestly characterized. The spec's framing that "same notional
  = same warp" and "trade-point anchoring" are mutually exclusive is correct.
- I did not re-examine rebase/funding under a moved φ in depth (spec correctly does not touch
  `rebase`; warp∘rebase-commute + φ-anchor/funding stay OPEN [needs-Aristotle]) — but note the
  divergence in (2) compounds the funding concern: a far-OTM dust leg moving φ by tens of nats
  moves the w=½ funding anchor reference too, which is item #9 territory and another reason the cap
  is operator-tier.

_Verbatim channel: dispatched by the manager with the operator's path-A choice (entry 38) relayed
as context; I reviewed the SPEC artifact and the live engine directly, not a paraphrase. No
FLAG-PROCESS._
