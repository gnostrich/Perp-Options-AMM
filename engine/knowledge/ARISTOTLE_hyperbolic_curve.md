# Aristotle brief — does a (generalized) hyperbolic AMM curve price the perpetual-American power option while keeping the reserve asymptote? If yes, derive it and show Balancer is a special case.

This is a **derivation + feasibility** task, not a Lean task (Lean formalization is optional, last). It is self-contained; you need nothing outside this note. Three parts, in order. **Do Part 1 first and stop if it's a dealbreaker.**

---

## 0. Setup (everything you need)

**The instrument.** A perpetual-American power option, priced across an OTM **strike continuum** (a finite carved band of strikes, not a single strike). For a single strike the holder's *continuation value* is `V(S) ∝ S^γ` on the continuation region up to an optimal-exercise boundary `S*`; beyond `S*` the holder has exercised, so the pure power-law tail of `S^γ` is **never realized**. `γ` is the convexity dial. `γ = ½` is the base case; the target is `γ ∈ (1, 4)`. The fit region for each strike is therefore **bounded** (the live band / continuation region), which is the crux of why an exponential-tailed density might suffice.

**The AMM.** A two-reserve curve `F(x, y) = const` with virtual offsets, working in shifted coordinates `X = x − α`, `Y = y − β`. Marginal price `mp = −dy/dx` along the curve. The protocol's value read is **reserve-linear** (value lives in the curve, reads stay linear in the reserve coordinate `sNorm = (x−α)/α`).

**Balancer base (convexity ½).** Constant-product / shifted hyperbola:
```
X·Y = αβ          ⇒   mp = αβ / X²  ∝ X^(−2),   value ∝ S^(−½).
```
Asymptotes at `x → α` (price → ∞) and `y → β` (price → 0): **price range is UNBOUNDED**. This is the property we want to preserve.

**Power-sum generalization (already built, exact but range-breaking).**
```
Y + D·X^q = C,        q = (γ−1)/γ
mp = D·q·X^(q−1) ∝ X^(−1/γ),     value ∝ S^(−γ)   (EXACT power-American)
calibration:  D = mp₀·X₀^(1−q)/q,   C = Y₀ + D·X₀^q
γ=½ ⇒ q=−1, D=−αβ, C=0  (recovers Balancer byte-identically; verified)
```
**Problem:** for `γ > 1`, `q ∈ (0,1)` and the reserve is **bounded**, `X_max = (C/D)^(1/q)`. The asymptote **breaks** — finite price range. This is the defect we are trying to escape.

**The conjecture to test.** An AMM whose **implied risk-neutral density** is **(generalized) hyperbolic** keeps the asymptote. In log-price `u = log(S/S₀)` the GH log-density is
```
log f(u) = −α_h·√(δ² + u²) + β·u  (+ const)        (symmetric case: β = 0)
```
The `√` is a hyperbola in `(u, log f)` space:
- **asymptotes** = straight lines of slope `∓α_h` = the **exponential tail-decay rates** → support unbounded → **price range stays unbounded** (asymptote preserved);
- **bend** near `u = 0` (set by `δ`) = the **kurtosis / convexity dial**;
- **tilt** (`β`) = the **skew**.
Numerically confirmed already: at fixed `α_h`, varying `δ` changes excess kurtosis (≈2.8 at δ=0.2 down to ≈0.2 at δ=15) while the tail slope stays `−α_h` to 4 digits. So a kurtosis knob at a fixed asymptote exists; the only question is whether it can carry the *American power* convexity.

Full generalized-hyperbolic adds a tail index `λ`: `λ = 1` is pure-exponential (hyperbolic) tails; `λ < 0` pushes toward power-law / Student-t (heavier, and asymptote-eroding). `λ` is the dial that interpolates between "asymptote kept" (exponential) and "power-law" (asymptote broken).

---

## Part 1 — DEALBREAKER CHECK (do this first; stop if it fails)

**Question.** Can a GH-implied AMM reproduce the perpetual-American power convexity `V ∝ S^γ` over the *bounded continuation region / live band*, while keeping the asymptote (exponential `λ ≈ 1` tail), for the target `γ ∈ (1, 4)`?

Because each strike exercises at a finite `S*`, you only need the fit to hold on the bounded region, not on the whole line. The asymptotic tail beyond the band is free to be exponential.

**What to determine, analytically where possible:**
1. For which `γ` does a **one-parameter** symmetric hyperbolic (δ only, `λ = 1`) reproduce `S^γ` on the band within acceptable error?
2. For higher `γ`, how heavy must the tail index `λ` become to fit? I.e. trace the **`γ ↔ λ` trade-off curve**. The key sub-question: does the target `γ` (up to 4) force `λ` back toward power-law (`λ < 0`, Student-t), which would **re-break** the asymptote — making the hyperbolic route no better than the power-sum?
3. Give the **γ ceiling**: the largest `γ` for which `λ` can stay ≥ some asymptote-preserving threshold (you choose/justify the threshold, e.g. `λ ≥ 0` or finite variance).

**Prior numerical hints — VERIFY independently, do not trust:**
- `γ = 2`: pure hyperbolic fit to ≈1.7% relative error on the band (suggests WORKS, asymptote kept).
- `γ = 3`: one-parameter hyperbolic failed at ≈138% (plain hyperbolic too flat — needs the `λ` knob, or fails).
- Full-GH-with-`λ` fit was numerically inconclusive (optimizer timeout). The honest expectation is a **smooth trade-off, not pass/fail**: moderate `γ` comfortably exponential (asymptote fine); high `γ` pushes `λ` toward power-law (asymptote erodes). Confirm or refute.

**Deliverable for Part 1.** A verdict: **WORKS** (for what `γ` range, with what `λ`, and the explicit `γ ↔ λ` relation) or **DEALBREAKER** (GH cannot carry the target convexity without re-breaking the asymptote). If it works only up to some `γ_max < 4`, say so precisely.

---

## Part 2 — DERIVE THE CURVE (only if Part 1 survives for the target γ)

Derive the **reserve-space AMM curve** whose implied density (equivalently, marginal-price law) is hyperbolic.

Produce, in order:
1. **The marginal-price law** `mp(X)` (or `mp(u)` in log-price) implied by the hyperbolic density. Closed form?
2. **The invariant** `F(x, y) = C` (the curve). This is the double-integral of the density via Breeden–Litzenberger (`f = V''(S)`, value `V` = curve structure). Is the integral elementary? If not, give the cleanest reduced form.
3. **The trade update** `x_new(y_new)` along the curve. **This is the operational gate.** The power-sum has a closed-form update (`x_new = α + ((C − Y_new)/D)^(1/q)`). Does the hyperbolic? If it needs a Newton/bisection inversion, state that explicitly and bound the cost — a single monotone 1-D solve is acceptable (no worse than other production AMMs); a nested integral per trade is not.
4. **Calibration**: given an open state `(X₀, Y₀, mp₀)` and target kurtosis/convexity, solve for `(α_h, δ, β)` (and `λ` if used). Mirror the power-sum's clean open-time calibration.
5. **Rebase rule.** Live convention is one-sided: `x → r·x`, `α → r·α`, `y, β` fixed. The power-sum rebases as `D → D/r^q`, `C → C` (price-invariant). Give the analogous price-invariant transform for the hyperbolic curve's parameters.

Flag on-curve vs off-curve wherever the price law differs off the manifold.

---

## Part 3 — GENERALIZE BALANCER

Show explicitly how this hyperbolic family **contains Balancer**:
1. Which limit of `(α_h, δ, β, λ)` recovers the shifted hyperbola `X·Y = αβ` (convexity ½, `mp ∝ X^(−2)`)?
2. Identify the extra knobs cleanly: `δ` = kurtosis/convexity, `β` = skew, and show how they collapse onto Balancer's single weight `w`. State the family as **"Balancer + kurtosis dial + skew dial, asymptote-preserving."**
3. **Contrast the two generalizations of Balancer** so the product fork is explicit:
   - *Power-sum*: adds a power exponent → **exact** power-law American, but **breaks** the asymptote (bounded range).
   - *Hyperbolic*: adds a bend → **exponential** (semi-heavy) tail, **keeps** the asymptote (unbounded range), at the cost of an approximate (not exact-power-law) convexity.
   State, given Part 1's verdict, which generalization dominates for the perpetual-American across the live band, and for what `γ` range each is the right choice.

---

## Output constraints
- Rigorous; state assumptions; distinguish on/off-curve; where closed-form fails, say so and give the numerical fallback + its cost.
- Numerical claims (the `γ ↔ λ` curve, the `γ` ceiling) must be reproducible — give the value `V`/density you fit and the band you fit on.
- Keep the one-sided rebase convention above.
- Lean formalization optional and last; the priority is the Part-1 verdict and, if it survives, the Part-2 curve with a usable trade update.
