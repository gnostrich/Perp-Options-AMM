# VERDICT — does entry-212 ("sharper warp makes OTM+ look OTM-") match the closed-form effective-strike map, once the knob↔τ wiring is correct?

_skeptic · 2026-06-13 · reconciliation of the §2 direction conflict against the live engine knob wiring · READ-ONLY._
_Build under review: `engine/builds/HEAD_temporal_mvp_v28_lens.html`. Engine wiring transcribed verbatim from lines cited below. Direction re-derived on a fresh node path (`/tmp/lens_dir.js`), against the exact engine `h_τ`._

---

## VERDICT (plain English, lead): **IT STILL CONFLICTS.** The knob↔τ inversion the brief hoped for does NOT exist in the engine — the number the operator types IS τ directly, and the engine's own on-screen label says "Smaller τ ⇒ sharper elbow," so **sharper warp = SMALLER τ**, exactly as my §2 used. Under the only closed-form effective-strike map the team has (`h_τ`), a SMALLER τ gives LESS compression toward the money, not more. So entry-212's "sharper ⇒ OTM+ looks MORE like OTM-" runs the OPPOSITE way to the closed form. The §2 conflict is NOT dissolved. **Worse: entry 212 also contradicts the operator's OWN earlier entry 118** ("sharper lens OTM++", push the effective strike FURTHER OUT) — the two operator rulings point opposite ways for the effective strike, so there is no single map that satisfies both. The build is **NOT well-defined** until the operator picks which of his two directions is the live one. I give the map that WOULD deliver entry-212 (§5) and confirm it is well-posed (forward, bounded, no φ).

---

## 1. What the engine's "kurtosis / warp" knob actually maps to — τ directly, NOT inverted

The brief's load-bearing hope was: *maybe the UI knob is inverted, so "sharper warp" = LARGER τ; then larger τ compresses more, and entry-212 matches.* I checked the wiring end to end. **There is no inversion.**

- **The input field IS τ.** HEAD L1320: `<input type="number" id="tau-input" min="0.05" max="3" step="0.05" value="0.3">`. The number the operator steps/types is the τ value, bounded [0.05, 3], default 0.3.
- **It is passed straight through.** L2778 (the change handler): `Store.setTau(v)` with `v = parseFloat(e.target.value)`. L2387: `function setTau(t) { if (t > 0 && isFinite(t)) state.tau = t; }` — **`state.tau = t`, byte-for-byte, no `1/t`, no transform.**
- **`state.tau` enters `h_τ` raw.** L1639–1644 `gLoc` calls `hpTau(Math.abs(u), tau)`; L1630 `hTau = (u,tau) => Math.sqrt(tau*tau+u*u) - tau`. The τ in `h_τ` IS the typed number.
- **The engine's own label states the polarity.** L1321: *"polar-lens kurtosis knob · STATIC … Smaller τ ⇒ sharper elbow."* So in the engine, **smaller knob number = sharper elbow = sharper warp.**
- I grepped the whole engine for any `1/tau`, inversion, or reciprocal on τ. The only "invert" hit (L2430) is the LP liquidity λ, unrelated. **There is no τ-inversion layer anywhere.**

**So the "inverted" the operator keeps saying is NOT a sign flip between his knob and the engine's `h_τ`.** It is the ordinary fact that kurtosis-the-STATISTIC runs opposite to sharpness: a SHARPER elbow = LOWER kurtosis number on the knob (his words, repeatedly): entry-Q (L841) "less kurtosis as per the inverse knob"; (L857) "lower kurtosis number since its inverted"; (L1434) "kurtosis steeper (less value in the html)"; (L1656) "sharper lens (less kurtosis as per UX)". In every one of these, **sharper = LOWER number = SMALLER τ.** The engine and the operator agree on that. The inversion the brief proposed (sharper = LARGER τ) is the opposite of what both the engine and the operator say.

## 2. Under the CORRECT mapping, "sharper warp" = SMALLER τ in `h_τ` — which is LESS compression

`h_τ(|u|) = √(τ² + u²) − τ`, with the two limits the brief itself names:
- **τ → 0 (sharpest):** `h_τ → |u|` ⇒ `u_eff → u` ⇒ `θ_eff → θ_raw`. **No compression — the effective strike stays at the raw strike.**
- **τ → ∞ (softest):** `h_τ → u²/2τ → 0` ⇒ `u_eff → 0` ⇒ `θ_eff → mode`. **Full compression — the effective strike collapses to the money.**

So **bigger τ compresses more; smaller τ compresses less.** Since sharper = smaller τ (§1), **sharper = LESS compression.** This is exactly the direction my prior §2 reported, and it is the OPPOSITE of the brief's "larger-τ-is-sharper" path. The brief's arithmetic about `h_τ` (larger τ compresses more) is correct; its premise (sharper = larger τ) is the part the engine refutes.

## 3. The numbers under the correct mapping (raw OTM+ strike = 2× mode, `/tmp/lens_dir.js`)

| τ (knob number) | sharpness | θ_eff (mode=1) | u_eff | reading of the OTM+ strike |
|---|---|---|---|---|
| 0.05 | **SHARPEST** | **1.9059** | 0.6449 | barely compressed — still looks strongly OTM+ |
| 0.10 | sharp | 1.8227 | 0.6003 | barely compressed |
| 0.30 (default) | mid | 1.5766 | 0.4553 | moderately compressed |
| 0.50 | soft | 1.4257 | 0.3547 | more compressed |
| 1.00 | softer | 1.2420 | 0.2167 | strongly compressed |
| 3.00 | **SOFTEST** | **1.0822** | 0.0790 | almost at the money — looks OTM- |

Read the two ends against entry 212:
- **Operator wants:** SHARPER ⇒ OTM+ looks MORE like OTM- ⇒ MORE compression ⇒ θ_eff → mode.
- **Engine gives:** SHARPER (τ=0.05) ⇒ θ_eff = 1.906 ≈ raw 2.0 ⇒ LEAST compression ⇒ still looks OTM+. SOFTEST (τ=3) ⇒ θ_eff = 1.08 ≈ mode ⇒ looks OTM-.

The engine delivers "looks OTM-" at the SOFT end, the operator asks for it at the SHARP end. **DIRECT CONTRADICTION on the τ-dependence.** The conflict from §2 stands, undissolved.

## 4. The deeper problem the brief did not flag — entry 212 ALSO contradicts the operator's own entry 118

I will not let this be papered over by picking one entry. The operator has ruled the effective-strike direction TWICE, opposite ways:

- **Entry 118 (2026-06-12, verbatim):** *"without lens i'd trade OTM, but through lens would trade OTM+, and sharper lens OTM++."* → the lens pushes the effective strike FURTHER FROM the mode; sharper pushes it further still. This is **anti-compression / expansion away from the money.**
- **Entry 212 (2026-06-13, verbatim):** *"sharper warp makes OTM + look OTM -."* → the lens pulls the effective strike TOWARD the money; this is **compression toward the money.**

These are opposite operations on the effective strike. `h_τ` (compress toward mode) matches the *direction* of entry 212 but with the wrong τ-slope (§3); and `h_τ` flatly contradicts entry 118 (which wants to push outward). **No single, monotone effective-strike map can satisfy both entry 118 and entry 212.** Picking either silently overrides the other — and inferring which the operator means is precisely the move my charter forbids and the project has burned regressions on. This must go back to the operator in one plain question (below), not be resolved by an agent.

## 5. The map that WOULD deliver entry 212, and whether it is well-posed

Entry 212 alone — "sharper warp makes OTM+ look OTM-", with sharper = smaller τ — needs: **smaller τ ⇒ MORE compression toward the mode.** The current `h_τ` does the reverse. A map that delivers it, while keeping the wings exact (the asymptote-respecting requirement) and zero effect at the mode, is to put τ in the DENOMINATOR of the warp strength. One clean candidate:

> **u_eff = sign(u) · |u| / (1 + |u|/τ)**   (a τ-scaled saturating compression: at the mode u=0 it is 0; for small |u| it ≈ u; for large |u| it saturates to τ — wings stay power-law-flavoured but bounded; **smaller τ ⇒ stronger compression**, the operator's direction.)

or, staying inside the existing `h_τ` family by inverting the knob feed only:

> feed `τ_engine = c/τ_knob` into the SAME `h_τ` (i.e. smaller knob number ⇒ larger `h_τ` τ ⇒ more compression). This is the literal "the knob is inverted" reading the brief proposed — it is buildable as a ONE-LINE knob remap, but note it **flips the engine's current on-screen label and the whole `h_τ` τ-semantics**, and it would make the SOFT visual elbow correspond to the SHARP knob number, which needs the operator to confirm he wants the displayed elbow shape decoupled from his "sharper" word.

**Well-posedness of either:** both are **forward** (θ_eff is an explicit function of θ_raw, mode, τ — no solve), **bounded** (u_eff is finite for all u; the first saturates to τ, the second inherits `h_τ`'s bound), and **φ-free** (the map reads off the LIVE mode each call exactly as `lensU` does at L1633–1637; no stored non-live mode, so the entry-117 weight-field/φ obstruction does NOT bite — this is the same §3 conclusion as my prior verdict, unchanged). So a map delivering entry-212's direction EXISTS and is well-posed. **But which map is right is undetermined until the operator resolves the 118-vs-212 contradiction (§4) AND confirms the τ-polarity he wants on the effective strike.** I am not authorised to pick.

## 6. On the build (the brief's item 4) — NOT yet well-defined; do not size dy

The brief's item 4 ("if it MATCHES, state the build is well-defined and size dy = N·θ_eff·oracle…") is **not reachable**, because it does NOT match (§3) and the operator's two rulings conflict (§4). The mechanical shell of the fix is sound — size the single-option swap `dy = N · θ_eff · oracle` with θ_eff read at the LIVE mode (entry 118's no-re-center honored at the `lensU` level), plain-v24 spot swap, individual options (entry 199), and the φ-wall does NOT bite (§5, carried from my prior §3) — **but the θ_eff FUNCTION inside it is exactly the thing in dispute.** Wiring `dy` to today's `h_τ` would ship the SOFT-is-OTM- direction, the opposite of entry-212's words: the next confidently-wrong build, in the other direction, which is the failure I exist to catch. **HOLD the build until §4 + §5 polarity is operator-ruled.**

---

## The one plain-English question for the operator (route verbatim)

> Your knob: a SMALLER number = a SHARPER warp (this is how the simulator is wired today). For a strike that is far out-of-the-money (OTM+), which way should the warp move where the trade actually happens?
> (A) SHARPER warp pushes the trade point FURTHER out (your entry 118: "sharper lens OTM++"), or
> (B) SHARPER warp pulls the trade point IN toward the money, so OTM+ reads as OTM- (your entry 212)?
> These two point opposite ways and the current math does neither cleanly — we need the one you mean before we can size the trade.

---

## Provenance / labels
- **VERIFIED (code, line-level, from HEAD):** the knob IS τ (L1320), passed raw via `setTau` `state.tau=t` (L2387, L2778), into `h_τ`/`gLoc` (L1630, L1639–1644); UI label "Smaller τ ⇒ sharper elbow" (L1321); no τ-inversion anywhere in the file (grep, the lone "invert" is LP λ at L2430).
- **VERIFIED (float64, fresh path `/tmp/lens_dir.js`):** §3 θ_eff table; sharper (small τ) = less compression toward raw; softest = compression to mode; the two `h_τ` limits.
- **GROUNDED in operator transcript (verbatim, `history/operator/2026-06-10_kurtosis-curve-family-brief.md`):** entry 212 (L1695); entry 118 (L889); the four "inverted / lower kurtosis number / less value" statements (L841, L857, L1434, L1656).
- **NOT claimed:** that either §5 map is THE right one — that, and the 118-vs-212 resolution, are the operator's call.
- **Carried unchanged from `VERDICT_HALT_lens_effective_strike_swap_entry215_2026-06-13.md`:** the φ-wall does not bite a live-mode forward θ_eff (§3 there, §5 here); the raw-K swap is still kurtosis-free and still FLAG-WRONG on the through-the-lens architecture (§1 there).
