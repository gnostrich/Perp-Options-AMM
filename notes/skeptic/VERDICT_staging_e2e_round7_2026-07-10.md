# SKEPTIC VERDICT — staging E2E round 7 kit-golden check (correction relay)

Target: `evidence/staging_e2e_2026-07-10/REPORT_round7_kit_golden_check.md` — the manager
walking back an earlier "staging = H3" version-pin. Gate: is the correction RIGHT, and not
over- OR under-corrected? Skeptic re-ran everything below independently.

## 1. Harness reproduces golden (41 PASS + 5 PASS), builds md5-verified — **CLEAR**
Re-ran both harnesses myself from `/tmp/testkit/temporal_staging_test_kit/`:
- `node harness/lens_selfcheck.js` → **41 PASS, 0 FAIL** (last line printed verbatim).
- `node harness/a16_atm_gate.js` → **5 PASS, 0 FAIL**.
- Build md5s match MANIFEST + builds/MD5SUMS bit-for-bit: HEAD `5ce1a76c7b75ec3763fda6df9538a841`,
  v24 `6f606f52011362cc3e4dc9a88827eea8`, twocaseclose `513425747b23b74cb07c0fda4959825b`.
Report sentence "Harness reproduces the golden in my env: `lens_selfcheck.js` 41 PASS / 0 FAIL,
`a16_atm_gate.js` 5 PASS / 0 FAIL" and the three md5s are exactly what I observe. CLEAR.

## 2. Core correction (α/β conservation = SPOT law, not the H3 warp; H3 moves α/β at ρ≠1) — **CLEAR**
Directionally RIGHT, verified three independent ways:
- **Harness CM8-v2.3** PASSES: "ρ=1 reduction ≡ tradeUpdate on a w×dy grid, maxRel=2.27e-16" — i.e.
  `tradeUpdateAt(st,dy,1)` is machine-identical to plain `tradeUpdate`, so a ρ=1 trade is the
  spot law and is common to ALL versions (CM8-v2.1 confirms the spot trio is byte-identical to v24).
- **Toy exhibit (ρ=4)** via the manager's `probe_law.js`, re-run by me: `(10,10,w.5) dy+1 ρ4`
  → global α **5 → 5.1190476**, β **5 → 5.238** — H3 genuinely MOVES global α/β at ρ≠1.
- **On the staging pool itself** (`resid.js`, re-run): α stays 5.000315 at ρ=1, and moves to
  5.001988 / 5.002628 / 5.003109 at ρ=1.5 / 2 / 4.
The report's owned reversal — "α/β conservation is the version-agnostic SPOT law; the H3 warp
*moves* α/β. So the α/β-conservation observation is NOT evidence for H3" — is correct. The earlier
"α/β conserved = H3, so staging = H3" was indeed backwards. CLEAR.

## 3. "Staging update matches the reference law to |Δx|=1.8e-15 at ρ=1" — **CLEAR**
`resid.js` re-run: reference `tradeUpdate` on the staging before-pool with dy=+1789.99 →
`|Δx|=1.78e-15, |Δw|=3.50e-9, |Δα|=0.00e+0` vs staging's observed after-state. Report's "|Δx|=1.8e-15,
|Δα|=0" is supported. Scoping is honest: the very next sentences label it "the reference Balancer
pool-trade math exactly" and immediately add "BUT this trade is ρ=1 (spot)-equivalent … does NOT
discriminate H3." No H3 re-implication. CLEAR.

## 4. Is the manager now UNDER-claiming (hiding a real H3 signal, or overstating "exact port")? — **CLEAR**
- **Not hiding an H3 signal.** The exact-eps match is to `tradeUpdate`, which CM8-v2.1 shows is
  byte-identical to v24 — so it proves only that the SPOT trade is faithfully ported, a property
  every version shares. It does NOT prove H3. I confirmed the staging swap carries NO positive H3
  signal: `warp_BEFORE`→`warp_AFTER` has **Δα=0, Δβ=0 exactly** (w moved 0.5→0.50111618 with α,β
  bit-conserved — the textbook ρ=1 signature). There is no suppressed movement; the data genuinely
  conserves α,β. The manager correctly reads this as "H3 warp not demonstrated," NOT as proof of H3.
- **Not overstating the port.** The report does not claim H3 from the match. Its strongest phrasing,
  "staging's core Balancer pool engine is an exact port of the reference (machine-eps on a real
  trade)," is hedged to the one measured trade and to the SPOT math. One nit (not a FLAG): this is
  n=1 (a single near-balanced ρ=1 swap) and only `tradeUpdate` was exercised on staging — not
  `arbitrageToOracle`/`rebase` — so "core … engine is an exact port" is a mild generalization from
  one input. Defensible given Balancer's determinism, but it is one trade, not a suite.

## 5. Revised verdict fair? Any residual H3 pin? — **CLEAR** (one numeric nit)
"Staging ≠ confirmed-H3 and ≠ confirmed-older; the distinguishing tests weren't reachable" is fair
and symmetric. Section labels hold up: §1 BLOCKED (memo pre-authorizes — no per-strike endpoint),
§2 CORE MATH EXACT / H3 discriminator not exercised, §3 WEAK PASS (skewed-pool sweep not run — the
real discriminator, correctly flagged unexercised), §4 NOT TESTED. I scanned every residual sentence
for a sneaked H3 pin and found none — the report is careful in BOTH directions, explicitly declining
to conclude "not H3" from the conserved band ("a band is a strike RANGE, not a single trade point,
so its net pool effect can legitimately be spot-equivalent"). Good discipline.

**NIT (FLAG-MINOR, not blocking):** §2 writes global α "5.0003 → 5.0020 at ρ=2". My re-run of the
manager's own `resid.js` gives α=**5.002628** at ρ=2 (rounds to 5.0026, not 5.0020); the ρ=4 value
5.0031 is correct. A transcription slip, not load-bearing — the claim (α moves off 5.000315 iff
ρ≠1) stands either way. Worth fixing the digit if the report is reissued.

## VERDICT: CLEAR-TO-RELAY.
The correction is RIGHT and is neither over- nor under-corrected. It properly demotes the earlier
"staging = H3" overclaim to "spot math exactly ported; H3 discriminators unreachable," keeps the
symmetric "not confirmed-older either," and does not smuggle an H3 pin back in. Only fix needed is
the cosmetic ρ=2 digit (5.0020 → 5.0026). Standing gaps to actually pin the version are correctly
enumerated: (a) per-strike/curve endpoint for §1/§4, (b) a known ρ≠1 pool swap for §2, (c) a
skewed-pool funding read for §3.

— skeptic, 2026-07-13 (re-ran harnesses + probe_law.js + resid.js independently; md5s reverified)
