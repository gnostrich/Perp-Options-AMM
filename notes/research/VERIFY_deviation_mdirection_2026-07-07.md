# VERIFY — the m-direction of the TRUE same-slope deviation, SETTLED (operator entry 464)

_research-lead, 2026-07-08. Operator RULED entry 464 (verbatim `history/operator/2026-06-10_kurtosis-curve-family-brief.md`:
"it affects deviatin not the funding formula ... we're working uptil deviation right now"). The m-direction —
does steeper `m` give MORE or LESS divergence — is a property of the SHIPPED deviation `dev=|c·ln(θ/mode)|`
(HEAD `abd35f4b`, `fundingPerStrike` L2317–2328), NOT the deferred funding formula. It must be right NOW.
Both manager and operator have flip-flopped by intuition; this settles it with **derivation + measurement against
the real engine**. Real engine HEAD `abd35f4b` (`engine/builds/HEAD_temporal_mvp_v28_lens.html`, engine block
L1611–2340; vm-extract). No web / git / engine-edit / Aristotle. Harness: scratchpad `mdir.js` (gitignored)._

## VERDICT (up front)
**Steeper `m` ⇒ MORE divergence.** The shipped deviation's m-direction is **CORRECT — no fix.** The manager's
formula direction stands; the operator's "denser slope ⇒ less divergence" intuition names a **real** effect that
is **already inside the formula (the `(m+1)` denominator)** — it BOUNDS the growth (saturates it at `γ−1`) but
does **not reverse** it. The exponent-gap effect wins. Measured, monotone, universal in `γ>1`. Details below.

---

## 1. The FULL same-slope ray-angle deviation, derived from scratch — every term kept

**Which curve is funding-relevant, and why.** The pool RESERVE curve `x^w·y^(1−w)=k` has local power-law
exponent `w/(1−w)=γ` — **`m` never enters it**, so on the reserve curve the m-direction question is moot. Funding
is ruled to be read **THROUGH THE LENS** (CLAUDE.md §4 / entry 232): the steepness is the LENSED option-value
exponent `±g_loc=±m·γ`. So the funding-relevant curves are the **through-the-lens option-value curves**
`v(ρ) ∝ ρ^(−g)`, pool exponent `g=m·γ`, anchor (`w=½ ⇒ γ=1`) exponent `g_a=m`. `ρ=θ/mode` (moneyness), the one
sNorm ray coordinate. (This is exactly what `SPEC_funding_sameslope` §1 uses.)

**The operator's construction (entries 386/443/459), kept fully symbolic.** At pool ray `ρ` the pool slope
magnitude is `σ(ρ)=g·ρ^(−(g+1))`. Find the anchor ray `ρ_a` where the anchor attains that **same** slope:

  `g_a·ρ_a^(−(g_a+1)) = σ = g·ρ^(−(g+1))`
  ⇒ `ρ_a = (g_a/g)^{1/(g_a+1)}·ρ^{(g+1)/(g_a+1)}`.

The same-slope ray-angle ratio (pool ray ÷ anchor ray) is

  **D̃(ρ) = ρ/ρ_a = (g/g_a)^{1/(g_a+1)} · ρ^{c},  c = (g_a−g)/(g_a+1).**   ← **FULL closed form, no term dropped**

**The prefactor simplifies exactly:** `g/g_a = mγ/m = γ`, and `1/(g_a+1)=1/(m+1)`, so

  **PREFACTOR  P(m,γ) = γ^{1/(m+1)}.**   **EXPONENT  c = (g_a−g)/(g_a+1) = m(1−γ)/(m+1).**

So the complete same-slope ray-ratio is **D̃(ρ) = γ^{1/(m+1)}·ρ^{c}** and the full log-ray-gap is

  **|ln D̃| = | (1/(m+1))·ln γ  +  c·ln ρ |.**

**Numerically verified against a from-scratch solve** (bisection root-find of `g_a·ρ_a^{−(g_a+1)}=σ`, NO closed
form assumed) on the real engine, pool w=0.7 (γ=2.3333), m=2 — matches the closed form to 6 dp at every ρ:

| ρ | numeric `|ln D̃|` (bisection) | closed `|ln D̃|` | ρ_a | prefactor γ^{1/(m+1)} |
|---|---|---|---|---|
| 0.10 | 2.329175 | 2.329175 | 0.00974 | 1.32635 |
| 0.50 | 0.898563 | 0.898563 | 0.20358 | 1.32635 |
| 1.00 | 0.282433 | 0.282433 | 0.75395 | 1.32635 |
| 1.50 | 0.077981 | 0.077981 | 1.62165 | 1.32635 |

The full closed form is therefore **exact** and the manager was right that a prefactor `γ^{1/(m+1)}`
(=`(g/g_a)^{1/(g_a+1)}`) exists and is **dropped** by the shipped `|c·ln ρ|`.

---

## 2. The shipped `dev` is a SIMPLIFICATION (prefactor dropped) — and the drop is FORCED, not lazy

Shipped `dev = |c·ln(θ/mode)| = |c|·|ln ρ|` = the full `|ln D̃|` **with the prefactor divided out** ("anchored so
the ATM point is respected", entry 386 / spec §1). Testing whether the dropped prefactor `γ^{1/(m+1)}`:

**(a) changes the m-DIRECTION?** NO. The prefactor is **ρ-independent** — it is a pure ATM offset. The moneyness
(ρ-dependent) slope of the deviation is carried entirely by `c=m(1−γ)/(m+1)`, which the prefactor does not touch.
Restoring the prefactor cannot change how `dev` scales with moneyness or its direction in `m` at fixed ρ (§3).

**(b) breaks dev=0 at ATM?** YES — this is the reason it must be dropped. At ρ=1, `|ln ρ|=0`, so the full
deviation is the prefactor alone: **`|ln D̃|_{ATM} = ln γ/(m+1) > 0` for γ>1.** Measured (pool w=0.7):

| m | full dev @ATM = lnγ/(m+1) | shipped dev @ATM |
|---|---|---|
| 1 | 0.423649 | 0.000000 |
| 2 | 0.282433 | 0.000000 |
| 4 | 0.169460 | 0.000000 |
| 6 | 0.121043 | 0.000000 |

The **raw** same-slope ray-ratio is NOT 1 at the money (the two curves genuinely attain equal slope at different
rays even at ATM). The operator RULED (entries 386/443/458) the deviation must be **ZERO at ATM**. That ruling
**forces** the prefactor removal. Keeping it would VIOLATE the operator's own ATM-zero constraint. So the shipped
"simplification" is mandatory, not a shortcut.

**(c) breaks dev=0 on a symmetric w=½ pool?** NO. At `w=½ ⇒ γ=1`, both `prefactor = 1^{1/(m+1)} = 1` AND
`c = m(1−1)/(m+1) = 0`, so the full `|ln D̃| ≡ 0` at every strike. Measured to 8 dp (w=0.5): 0.00000000 at
ρ=0.3/0.5/1/2. The killer w=½ signature survives with OR without the prefactor.

**So:** the prefactor is real, its removal is required by ATM-zero, and its removal is irrelevant to the
m-direction. The three operator signatures of the shipped form (0@ATM, 0∀w=½, positive OTM lobe) are all intact.

---

## 3. The m-direction, SETTLED WITH NUMBERS

At a fixed OTM moneyness `ρ=0.5` (put), pool w=0.7 (γ=2.3333), sweep m — **both** the shipped (anchored) and the
full (raw, prefactor kept) deviation, measured on the real engine:

| m | `|c|=m(γ−1)/(m+1)` | SHIPPED dev(ρ=.5) | FULL raw dev(ρ=.5) | prefactor |
|---|---|---|---|---|
| 1 | 0.66667 | 0.462098 | 0.885747 | 1.52753 |
| 2 | 0.88889 | 0.616131 | 0.898563 | 1.32635 |
| 3 | 1.00000 | 0.693147 | 0.904972 | 1.23593 |
| 4 | 1.06667 | 0.739357 | 0.908817 | 1.18466 |
| 6 | 1.14286 | 0.792168 | 0.913211 | 1.12867 |
| 10 | 1.21212 | 0.840178 | 0.917205 | 1.08007 |
| 20 | 1.26984 | 0.880187 | 0.920534 | 1.04117 |
| 50 | 1.30719 | 0.906075 | 0.922688 | 1.01675 |

**Both columns increase monotonically with m.** Steeper ⇒ MORE divergence — for the shipped form AND the raw
full form. Holds at other OTM moneyness too (shipped): ρ=0.1 → 1.535/2.047/2.456/2.632/2.791 (m=1/2/4/6/10);
ρ=0.8 → 0.149/0.198/0.238/0.255/0.271. Monotone up everywhere OTM.

**Why it's universal.** `|c| = m(γ−1)/(m+1)`; `d/dm[m/(m+1)] = 1/(m+1)² > 0` for all m>0, any γ>1. `dev=|c|·|ln ρ|`
and any monotone alternative (`|D̃−1|=|ρ^c−1|`) are both increasing in `|c|` at fixed ρ. So **for every OTM
strike and every γ>1, steeper ⇒ strictly more divergence.** No exceptions.

### Reconciling the operator's "denser slope" argument — it is REAL, and it LOSES (it only bounds the growth)
`|c| = m(γ−1)/(m+1)` is literally **[exponent gap] ÷ [anchor slope-density]** — the two competing effects, in one
fraction:

| m | gap = g−g_a = m(γ−1) | density = g_a+1 = m+1 | `|c|` = gap/density | (ceiling γ−1) |
|---|---|---|---|---|
| 1 | 1.333 | 2 | 0.667 | 1.333 |
| 4 | 5.333 | 5 | 1.067 | 1.333 |
| 10 | 13.333 | 11 | 1.212 | 1.333 |
| 100 | 133.33 | 101 | 1.320 | 1.333 |

- **Effect 1 — exponent-gap (numerator).** `m` multiplies both exponents (`g=mγ`, `g_a=m`), so their gap
  `g−g_a=m(γ−1)` grows **linearly** with m. The two curves' slopes separate faster per unit moneyness ⇒ the
  anchor must travel further to match ⇒ MORE ray-gap. Pushes divergence UP.
- **Effect 2 — the operator's "denser slope" (denominator).** A steeper anchor has slope-sensitivity exponent
  `g_a+1=m+1`: it localizes any given slope to a narrower ray band, so the equal-slope anchor ray is found
  **nearer** ⇒ LESS ray-gap. This is exactly the `(m+1)` denominator. It is a genuine effect, correctly present.
- **Who wins:** numerator `∝ m`, denominator `∝ m+1`. The ratio `m/(m+1)` RISES to 1, so `|c| → (γ−1)` from
  below. The density effect **slows and caps** the growth (sublinear, ceiling `γ−1`) but **cannot reverse** it.
  The exponent-gap effect wins at every m.

**The one place the operator's intuition literally holds — and why it's disqualified.** In the RAW (un-anchored)
deviation the prefactor `γ^{1/(m+1)}` is the pure-ATM ray-gap, and it **DECREASES with m** (1.53→1.02 above): at
the money, a steeper pair does find the matching slope at nearer rays — the operator's picture, exactly. But that
ATM offset is precisely the term the operator's own ATM-zero ruling forces us to remove. Once removed, the
residual moneyness-driven divergence grows with m everywhere OTM. So the intuition is right about the ATM offset
we are required to throw away, and wrong about the deviation we actually keep.

---

## 4. VERDICT + ACTION
- **Shipped `dev=|c·ln(θ/mode)|`, c=(g_a−g)/(g_a+1)=m(1−γ)/(m+1) is CORRECT in m-direction: steeper ⇒ MORE
  divergence. NO FIX.** No splice. The direction manager/formula asserted stands; measured monotone-up in m at
  every OTM strike, universal in γ>1.
- **The dropped prefactor `γ^{1/(m+1)}` is real** (manager's suspicion confirmed) but its removal is **mandatory**
  (ATM-zero, entry 386/443/458), **does not change the m-direction** (ρ-independent offset), and **does not break
  the w=½ zero** (γ=1 kills it). Restoring it would break the operator's ATM-zero and is therefore rejected.
- **The operator's "denser slope ⇒ less divergence" is a real effect**, fully present as the `(m+1)` denominator;
  it **bounds** the growth (saturation at `γ−1`) but is **outweighed** by the linearly-growing exponent gap. Net:
  steeper ⇒ MORE, with diminishing returns. This is measured, not argued.
- **Scope honesty:** this is the DEVIATION's m-direction only (entry 464). The funding FORMULA (HL premium→rate,
  cap, the deviation used as the mark/oracle proxy) remains deferred to UPDATE-2 (entries 462/463) — untouched
  here. closeBand untouched. Nothing to build; the shipped deviation is confirmed right. **Label: derived +
  measured here (research-lead) against real engine HEAD `abd35f4b`; no engine edit, no gate change.**

_(If the operator, on seeing this, wants the growth-in-m capped harder or flattened, that is a separate product
call on top of the same-slope law — flag via manager, entry-232 says m re-scales the rate BY DESIGN, so a rising
dev(m) is the intended behavior, not a defect.)_
