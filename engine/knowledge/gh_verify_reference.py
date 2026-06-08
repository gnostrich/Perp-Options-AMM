#!/usr/bin/env python3
"""
INDEPENDENT re-derivation of the GH AMM curve claims in INTERN_NOTE_gh_amm_curve.md.
Nothing here trusts the brief's numbers; everything is recomputed from the density up.
High precision via mpmath so the 12-digit reference vectors can actually be checked.
"""
import mpmath as mp
mp.mp.dps = 40  # 40 significant digits

def make_curve(ah, bh, delta, mu):
    """Hyperbolic (GH, lambda=1) density family. Returns dict of callables/constants."""
    ah, bh, delta, mu = map(mp.mpf, (ah, bh, delta, mu))
    psi  = mp.sqrt(ah**2 - bh**2)        # tail geometry for f_beta
    psi1 = mp.sqrt(ah**2 - (bh+1)**2)    # tail geometry for f_{beta+1}
    K1   = lambda z: mp.besselk(1, z)
    Cn   = psi  / (2*ah*delta*K1(delta*psi))
    Cn1  = psi1 / (2*ah*delta*K1(delta*psi1))
    M    = psi*K1(delta*psi1) / (psi1*K1(delta*psi))
    def fb(u):
        u = mp.mpf(u)
        return Cn * mp.e**(-ah*mp.sqrt(delta**2 + (u-mu)**2) + bh*(u-mu))
    def fb1(u):
        u = mp.mpf(u)
        return Cn1* mp.e**(-ah*mp.sqrt(delta**2 + (u-mu)**2) + (bh+1)*(u-mu))
    # CDFs by integrating from -inf
    def Fb(u):
        return mp.quad(fb, [-mp.inf, mu, u]) if u > mu else mp.quad(fb, [-mp.inf, u])
    def Fb1(u):
        return mp.quad(fb1, [-mp.inf, mu, u]) if u > mu else mp.quad(fb1, [-mp.inf, u])
    # Q_beta = inverse CDF via bracketed bisection (monotone)
    def Qb(p):
        p = mp.mpf(p)
        lo, hi = mu - 60, mu + 60
        for _ in range(200):
            midv = (lo+hi)/2
            if Fb(midv) < p: lo = midv
            else: hi = midv
        return (lo+hi)/2
    return dict(ah=ah,bh=bh,delta=delta,mu=mu,psi=psi,psi1=psi1,Cn=Cn,Cn1=Cn1,M=M,
                fb=fb,fb1=fb1,Fb=Fb,Fb1=Fb1,Qb=Qb,gamma=ah-bh)

def chk(label, got, want, tol, fmt="{:.12f}"):
    got_f = float(got); want_f = float(want)
    err = abs(got_f-want_f)
    rel = err/abs(want_f) if want_f!=0 else err
    ok = err <= tol or rel <= tol
    print(f"  [{'OK ' if ok else 'XX '}] {label}: got {fmt.format(got_f)}  want {fmt.format(want_f)}  (abs {err:.2e})")
    return ok

print("="*78)
print("REFERENCE CASE  ah=4, bh=1, delta=0.08, mu=0  =>  gamma=3,  Nx=Ny=1")
print("="*78)
C = make_curve(4, 1, 0.08, 0)
Nx = Ny = mp.mpf(1)

print("\n-- pool constants --")
chk("psi  = sqrt(16-1)=sqrt15", C['psi'],  3.872983, 1e-6, "{:.6f}")
chk("psi' = sqrt(16-4)=sqrt12", C['psi1'], 3.464102, 1e-6, "{:.6f}")
chk("M = psi*K1(d psi')/(psi'*K1(d psi))", C['M'], "1.268303997652", 1e-11)

print("\n-- density normalizes --")
integral = mp.quad(C['fb'], [-mp.inf, 0, mp.inf])
chk("integral f_beta == 1", integral, 1, 1e-11)

print("\n-- Esscher transform  e^u f_beta(u) == M f_{beta+1}(u) --")
worst = 0
for u in [-2,-0.5,0,0.5,1,1.5,3]:
    lhs = mp.e**mp.mpf(u)*C['fb'](u)
    rhs = C['M']*C['fb1'](u)
    worst = max(worst, abs(float(lhs-rhs)))
print(f"  [{'OK ' if worst<1e-15 else 'XX '}] max |e^u f_b - M f_b1| over 7 pts = {worst:.2e}  (brief: ~2e-16)")

print("\n-- tail decay rates  -d/du log f_beta --")
def tailrate(u):
    h = mp.mpf('1e-15')
    return -(mp.log(C['fb'](u+h))-mp.log(C['fb'](u-h)))/(2*h)
chk("rate at u=+30 -> gamma = ah-bh = 3", tailrate(30), 3, 1e-6, "{:.6f}")
chk("rate at u=-30 -> ah+bh = 5",        tailrate(-30), -5, 1e-6, "{:.6f}")  # sign: -d log on -side

print("\n-- reference point @ u=1.5 --")
u = mp.mpf('1.5')
X = Nx*(1 - C['Fb'](u))
Y = Ny*C['M']*C['Fb1'](u)
chk("X = Nx(1 - F_beta(1.5))",   X, "7.552734e-3", 5e-6, "{:.6e}")
chk("Y = Ny*M*F_{beta+1}(1.5)",  Y, "1.217507",    5e-6, "{:.6f}")

print("\n-- invariant round-trip  F_{b+1}(Q_b(1 - X/Nx)) --")
rt = C['Fb1'](C['Qb'](1 - X/Nx))
chk("round-trip value",          rt, "0.9599490830", 1e-9)
chk("round-trip == Y/(Ny*M)",    rt, Y/(Ny*C['M']),  1e-9)
# the round-trip RECOVERS u: Q_b(1-X/Nx) should equal 1.5
chk("Q_b(1-X/Nx) recovers u=1.5", C['Qb'](1-X/Nx), u, 1e-9)

print("\n" + "="*78)
print("THE DECISIVE CHECK:  does value ~ S^(-gamma) on the band?")
print("Reconciling INTERN brief (err 0.40%) vs ARISTOTLE brief (gamma=3 'failed 138%')")
print("="*78)

def eff_exponent(curve, u_lo, u_hi, n=400):
    """value coordinate = sNorm ~ (1 - F_beta(u)); S = e^u.
       Fit log(value) = const - gamma_eff * log(S) = const - gamma_eff * u  by least squares.
       Also report max relative deviation of value from the best-fit power law."""
    us = [u_lo + (u_hi-u_lo)*k/(n-1) for k in range(n)]
    val = [mp.log(1 - curve['Fb'](mp.mpf(uu))) for uu in us]   # log value
    # least squares slope of val vs u
    n_ = mp.mpf(n)
    su = sum(mp.mpf(uu) for uu in us); sv = sum(val)
    suu= sum(mp.mpf(uu)**2 for uu in us); suv = sum(mp.mpf(uu)*val[i] for i,uu in enumerate(us))
    slope = (n_*suv - su*sv)/(n_*suu - su**2)
    intc  = (sv - slope*su)/n_
    gamma_eff = -slope
    # max relative error of value vs fitted power law
    maxrel = 0
    for i,uu in enumerate(us):
        fit = intc + slope*mp.mpf(uu)
        maxrel = max(maxrel, abs(float(mp.e**val[i] - mp.e**fit))/float(mp.e**val[i]))
    return float(gamma_eff), float(maxrel)

# (A) The intern brief's reference parametrization, on candidate bands
print("\n(A) SKEWED curve as briefed (ah=4,bh=1,delta=0.08): value=sNorm=1-F_beta(u)")
for lab, lo, hi in [("u in [1,3]   (S in [e, e^3])", 1, 3),
                    ("S in [1,3]   (u in [0, ln3])", 0, float(mp.log(3))),
                    ("u in [0,4]   (wide band)",      0, 4)]:
    ge, mr = eff_exponent(C, lo, hi)
    print(f"     {lab:32s} eff.exponent = {ge:.4f}   max rel err = {mr*100:.3f}%")

# (B) Reproduce the ARISTOTLE 'symmetric, delta-only, one-parameter' fit for gamma=3.
# Symmetric => bh=0, so tail rate = ah on BOTH sides. To even *aim* at exponent 3 you must
# set ah=3 (no skew). Then fit value=1-F_beta vs S and see the error on the band.
print("\n(B) SYMMETRIC one-parameter (bh=0, ah=3, vary delta) -- the Aristotle strawman")
for d in [0.08, 0.5, 2.0, 8.0]:
    Csym = make_curve(3, 0, d, 0)
    ge, mr = eff_exponent(Csym, 1, 3)
    print(f"     delta={d:5.2f}: eff.exponent on u in[1,3] = {ge:.4f}   max rel err = {mr*100:.2f}%")

print("\n(C) Interpretation:")
print("    The skew bh is what *sets* the OTM tail rate to gamma = ah - bh, EXACTLY,")
print("    by construction (geometry, not a fit). The symmetric one-param family cannot")
print("    independently place the exponent -- that is the 138% the Aristotle brief saw.")

print("\n" + "="*78)
print("MONOTONICITY:  mp(X) strictly decreasing  (mp = (Ny/Nx) e^u, X = Nx(1-F_beta(u)))")
print("="*78)
us = [mp.mpf(k)/10 for k in range(-30, 51, 2)]
Xs = [float(Nx*(1-C['Fb'](uu))) for uu in us]
mps= [float((Ny/Nx)*mp.e**uu) for uu in us]
# X decreasing in u, mp increasing in u => mp decreasing in X. Check pairwise.
mono = all(Xs[i] > Xs[i+1] for i in range(len(Xs)-1)) and all(mps[i] < mps[i+1] for i in range(len(mps)-1))
print(f"  [{'OK ' if mono else 'XX '}] X strictly decreasing in u AND mp strictly increasing in u "
      f"=> mp strictly decreasing in X: {mono}")
print(f"      X range over sample: ({min(Xs):.3e}, {max(Xs):.3f})  vs bound (0, Nx={float(Nx)})")
print(f"      Y bound: (0, Ny*M = {float(Ny*C['M']):.4f})")
