# Round 7 — check against the operator's test kit (golden values + harness) — manager, 2026-07-10

Kit: `temporal_staging_test_kit.zip`. Builds md5-verified (HEAD=`5ce1a76c…`, v24=`6f606f52…`,
twocaseclose=`51342574…`). **Harness reproduces the golden in my env: `lens_selfcheck.js` 41 PASS / 0
FAIL, `a16_atm_gate.js` 5 PASS / 0 FAIL** — the reference build + golden constants are validated here.

## Per the memo's PORT items

### §1 Option-value constants ($66.67 / ⅓ / 0.148 ; m=3 → $85.71 / ⅐ / 0.057) — **BLOCKED**
No per-strike / curve endpoint on staging (`/api/amm/tree|curve|nodes` = 404; SSE streams oracle only).
The memo itself pre-authorizes this: "mark §1 BLOCKED — needs a per-strike/curve endpoint from the CTO."
Not eyeballed, not PASS/FAIL.

### §2 Trade warps the curve (w′=11/21) — **CORE MATH EXACT; H3 DISCRIMINATOR NOT EXERCISED**
I loaded the reference engine (`builds/HEAD_temporal_mvp_v28_lens.html`) and ran its own trade law on
staging's measured before-pool (`run6_api/warp_BEFORE.json`). Result:
- `tradeUpdate`(staging pool, dy=+1789.99) → x,y,α,β,w **match staging's observed after-state to |Δx|=1.8e-15,
  |Δα|=0** (machine-exact). So staging reproduces the reference Balancer pool-trade math exactly.
- **BUT** this trade is **ρ=1 (spot)-equivalent**, where the reference law CONSERVES global α,β — and at ρ=1
  the trade-point law `tradeUpdateAt` reduces EXACTLY to the plain `tradeUpdate` (harness CM8-v2.3). So a ρ=1
  trade is **identical across ALL build versions** and does NOT discriminate H3.
- The H3-distinguishing trade-point warp only appears at **ρ≠1**, where global α MOVES (5.0003 → 5.0020 at
  ρ=2, → 5.0031 at ρ=4). Staging kept α,β **constant** — the ρ=1 signature.

**CORRECTION of my earlier relay (owned):** I told the operator "α/β conserved = the H3 trade-point
mechanic, so staging = H3." That was **backwards**. α/β conservation is the version-agnostic SPOT law;
the H3 warp *moves* α/β. So the α/β-conservation observation is **NOT** evidence for H3. What's true:
staging reproduces the reference **spot** pool math exactly; the H3-specific trade-point warp is **not
confirmed** (my band's pool swap booked at ρ=1). Note: a band sold at strike θ=1.08 has trade point ρ≈1.08,
at which H3 would move α,β — staging didn't — but a band is a strike RANGE, not a single trade point, so its
net pool effect can legitimately be spot-equivalent; I can't conclude "not H3" from this, only "H3 warp not
demonstrated." To discriminate: need a trade with a known ρ≠1 pool swap, or the CTO to confirm how bands book.

### §3 Funding = ray deviation, 0 on balanced pool — **WEAK PASS**
On the balanced (w=0.5) pool, band `*_funding` fields and the perp `fundingRate` read 0. Consistent with the
memo's FS.2b killer ("0 at every strike on a symmetric pool"). Weak: fundingRate:0 on a fresh row may be an
init default, and I did NOT sweep a SKEWED pool (where `dev=|c·ln(θ/mode)|` should turn on) — that's the real
discriminator and it wasn't exercised. So: nothing contradicts §3, but it's not a strong confirmation.

### §4 Close = one sell-back path, continuous (no ½ jump) — **NOT TESTED**
Close returned the pool to balanced (directional only, shared pool). The "no ½ jump" continuity needs the
payout-vs-strike curve = same §1 BLOCKED data. Two-case build is bundled to compare once the curve is visible.

## Honest version verdict (REVISED — supersedes my earlier "staging = H3")
What I can defend: **staging's core Balancer pool engine is an exact port of the reference** (machine-eps on
a real trade). What I CANNOT defend: pinning staging to H3 specifically — every H3-vs-older discriminator is
either BLOCKED (§1, §4: no curve endpoint), version-agnostic as measured (§2: ρ=1 trade), or unexercised
(§3: no skewed-pool sweep). **Staging ≠ confirmed-H3 and ≠ confirmed-older; the distinguishing tests weren't
reachable.** Priority to close it: (a) CTO exposes a per-strike curve endpoint (unblocks §1 + §4); (b) a trade
with a known off-ATM ρ to test whether α,β move (§2 H3 warp); (c) a skewed-pool funding read (§3).
