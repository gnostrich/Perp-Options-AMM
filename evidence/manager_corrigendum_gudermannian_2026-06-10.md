# Manager verification record + CORRIGENDUM — Gudermannian note (answers skeptic FLAG-OVERSELL, VERDICT_GUDERMANNIAN §5)

_2026-06-10. The skeptic demanded (VERDICT_GUDERMANNIAN_2026-06-10.md §5): name the map behind
the commit-1de695c digits "skew moves 0.571→0.068 under the A-dial at fixed φ" and post the
script. Both below._

## CORRIGENDUM (commit 1de695c message)
The commit message called my check a **"pushforward check"**. That word was WRONG — the check
was computed on the **LATENT-v density** `f(v) ∝ exp(−α·√(δ²+v²)+β·v)` at `α=4, β=1`
(fixed φ = atanh(1/4)), grid `δ ∈ {0.5, 2, 8, 32}` → skew `0.5711, 0.2852, 0.1374, 0.0677`.
It is the SAME map as the skeptic's own latent-v row (its `0.9166 @ δ=0.08 → 0.0700 @ δ=30`
brackets my grid exactly; re-run with both endpoints below). So: digits genuine and reproducible,
space mislabeled. The substantive watch-flag condition was satisfied by the NOTE's own honest
"latent-coordinate only" label and exact moment-coupling law — not by my mislabeled check.
Commit messages are immutable; this file is the correction of record. Skeptic blind-spot
pattern #3 (latent/symmetric facts sold under a trader-space name) applied to ME — acknowledged.

## The script (exact, runnable)
```python
import math
def moments(alpha,beta,delta):
    N=400001; L=80.0/min(alpha-abs(beta),1.0); h=2*L/(N-1)
    xs=[-L+i*h for i in range(N)]
    w=[math.exp(-alpha*math.hypot(delta,x)+beta*x) for x in xs]
    def simp(g):
        s=g[0]+g[-1]+4*sum(g[1:-1:2])+2*sum(g[2:-2:2]); return s*h/3
    Z=simp(w); m1=simp([x*wi for x,wi in zip(xs,w)])/Z
    c=[x-m1 for x in xs]
    m2=simp([ci*ci*wi for ci,wi in zip(c,w)])/Z
    m3=simp([ci**3*wi for ci,wi in zip(c,w)])/Z
    return m3/m2**1.5
for d in [0.08,0.5,2,8,30,32]:
    print(d, round(moments(4.0,1.0,d),4))
```
Output: `0.08→0.9166 · 0.5→0.5711 · 2→0.2852 · 8→0.1374 · 30→0.0700 · 32→0.0677`.

## Rest of the 1de695c verification (unaffected, spaces correct as cited)
Large-A laws on the same latent density (the laws ARE latent-moment laws, correctly so):
exkurt·A → 4.330/4.342 vs 13/3 (γ=2, δ=5/20); 3.752/3.754 vs 3.75 (γ=3); skew·√A → 1.034/1.010
(γ=2), 0.772/0.756 (γ=3) vs 1.000/0.750. gd ATM gear 2.0 exact (independent code path).
