# Manager verification — GH reparam reconcile pass (operator-supplied) · 2026-06-09

## Provenance (honest)
An operator-supplied doc ("Drop-in reparameterization: Balancer as the reachable GH base + a
kurtosis/skew knob, research-lead, RECONCILE PASS v2") was pasted in chat. It is **NOT in this repo**;
the `notes/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md` it references **does not exist** in the tree;
research-lead MEMORY has **no record** of this pass; its "MANAGER VERIFICATION" header matches **no
verification in our records**. Treated as a submission. I independently re-derived its load-bearing
numerics (pure-Python moment/frontier integration, `/tmp/verify_reconcile.py`). They HOLD.

## Independently CONFIRMED (manager, this session)
- **Cobb-Douglas / Balancer RESERVE CURVE = δ→∞ (large-δ, Gaussian) limit — NOT δ→0.** CV of
  `K=X^w·Y^(1−w)` along the βh=0 GH frontier (γ=3,w=0.75) falls monotonically with δ: δ=1→0.51,
  3→0.30, 10→0.10, 30→0.057 (matches doc's 0.55/0.32/0.11/0.057). Never reaches 0 (GH reserves
  bounded; CD unbounded) ⇒ exact CD is the asymptote.
- **Kurtosis direction:** δ↑ ⇒ excess kurtosis ↓ (→Gaussian 0); δ↓ ⇒ ↑ (→Laplace 3, saturating).
  My moment integrals match the doc to 3 digits (δ=0.08→2.65, 0.3→1.69, 1→0.70, 3→0.25, 10→0.075).
  The `3/(δ·αh)` formula is the large-δ asymptote only.
- **Engine is FAR from Gaussian:** at δ=0.08 excess kurtosis ≈ 2.65 (γ=3,βh=0) / 2.76 (γ=2,βh=0) /
  3.82 (γ=2,βh=1) — near Laplace. ⇒ the Gaussian/GBM `γ(γ+1)=2r/σ²` does NOT describe the live engine.
- (Trivial-algebra, confirmed by inspection:) αh=γ+1=1/(1−w) ⟺ w=γ/(γ+1); βh=0 ⇒ even kernel ⇒
  symmetric two-root; Esscher f_{β+1}/f_β=e^v is δ/βh-free ⇒ value∝S^(−γ) survives freeing δ,βh.

## CORRECTIONS I OWE (over-claims I made earlier this session)
1. **σ↔γ map `γ(γ+1)=2r/σ²` is the GAUSSIAN (δ→∞) slice ONLY.** The engine (δ=0.08, fat-tailed) does
   NOT obey it; the correct characteristic relation is the implicit GH Laplace-exponent root ψ(−γ)=r.
   The σ values I quoted (12.9%@γ=2 etc.) were a Gaussian-equivalent LENS, not the engine's true vol.
2. **STILL CORRECT** (δ-free, verified before + consistent now): `value∝S^(−γ)` and smooth-pasting
   `S*=Kγ/(γ+1)`. The perpetual-option STRUCTURE of the Merton tie holds; only the σ-mapping was wrong.
   (MertonSigmaGamma proved the Gaussian/Cauchy-Euler roots — true for GBM, but the engine isn't GBM.)
3. Earlier CES/power-mean answer to "which curve gives Balancer+kurtosis" is SUPERSEDED: you don't
   need to leave the GH family — free its frozen δ (kurtosis) and βh (skew); Balancer = (βh=0, δ→∞).

## PRODUCT CAVEAT (verified)
δ is an **ATM-elbow / return-kurtosis** knob, NOT a tradeable-wing-fattener: the wing pricing exponent
is γ and is δ-INVARIANT (value∝S^(−γ) δ-free). If "kurtosis knob" meant "fatter tradeable wings," δ
does not deliver it (γ does). δ tunes ATM slippage curvature + shifts reserve-depth placement
(counterintuitively: lower δ / fatter returns ⇒ thinner wing depth + sharper elbow).

## v26d IMPACT
The v26d vol knob computes γ from σ via the Gaussian inverse `γ=(−1+√(1+8r/σ²))/2`. Per correction 1,
that "σ" is a Gaussian-equivalent lens, not the engine's true vol. Before any HEAD promotion, the knob
labeling must be revisited (label as γ/steepness, or δ/kurtosis, or implicit ψ(−γ)=r — operator call).
Merge stays HELD.

## OPERATOR-OWNED DECISIONS (escalate, not decided)
- MINIMAL fork (free δ, keep βh=1): kurtosis/ATM-elbow knob on the put leg, ~zero settlement risk, NO
  symmetric Balancer.
- FULL fork (free δ + βh=0): symmetric Balancer base + both S^(±γ) eigenfunctions, but DROPS the proved
  put-only eigenfunction = settlement-semantics / economic-object change (reopens locked curve).
- Even MINIMAL unfreezes a pinned constant of the locked GH curve. + knob labeling (direction+semantics).
