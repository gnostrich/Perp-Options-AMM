#!/usr/bin/env python3
"""
Operational-gate checks for the GH swap: calibration, arb round-trip, rebase.
These are where the Ny/Nx prefactor and the one-sided rebase convention can bite.
"""
import mpmath as mp
mp.mp.dps = 40

def make_curve(ah, bh, delta, mu):
    ah, bh, delta, mu = map(mp.mpf, (ah, bh, delta, mu))
    psi  = mp.sqrt(ah**2 - bh**2); psi1 = mp.sqrt(ah**2 - (bh+1)**2)
    K1 = lambda z: mp.besselk(1, z)
    Cn  = psi /(2*ah*delta*K1(delta*psi)); Cn1 = psi1/(2*ah*delta*K1(delta*psi1))
    M   = psi*K1(delta*psi1)/(psi1*K1(delta*psi))
    fb  = lambda u: Cn *mp.e**(-ah*mp.sqrt(delta**2+(mp.mpf(u)-mu)**2)+ bh   *(mp.mpf(u)-mu))
    fb1 = lambda u: Cn1*mp.e**(-ah*mp.sqrt(delta**2+(mp.mpf(u)-mu)**2)+(bh+1)*(mp.mpf(u)-mu))
    def Fb(u):  return mp.quad(fb,[-mp.inf,mu,u]) if u>mu else mp.quad(fb,[-mp.inf,u])
    def Fb1(u): return mp.quad(fb1,[-mp.inf,mu,u]) if u>mu else mp.quad(fb1,[-mp.inf,u])
    def Qb(p):
        p=mp.mpf(p); lo,hi=mu-80,mu+80
        for _ in range(220):
            m=(lo+hi)/2
            if Fb(m)<p: lo=m
            else: hi=m
        return (lo+hi)/2
    return dict(ah=ah,bh=bh,delta=delta,mu=mu,psi=psi,psi1=psi1,M=M,Cn=Cn,Cn1=Cn1,
                fb=fb,fb1=fb1,Fb=Fb,Fb1=Fb1,Qb=Qb,gamma=ah-bh)

def status(ok): return 'OK ' if ok else 'XX '

# ---------------------------------------------------------------------------
# Calibration exactly as briefed (sec 2):
#   given open (X0,Y0,mp0,gamma);  u0=log(mp0)
#   bh = ah-gamma;  defaults ah=gamma+1, delta=0.08, mu=u0-3
#   Nx = X0/(1-Fb(u0));  Ny = Y0/(M*Fb1(u0))
# getMP_raw(s) = (Ny/Nx)*exp(Qb(1 - X/Nx))   [the swapped slope]
# ---------------------------------------------------------------------------
print("="*78); print("GATE: CALIBRATION ROUND-TRIP (open state must be reproduced)"); print("="*78)
# pick a non-trivial open state so Nx != Ny (the prefactor actually does work)
gamma = mp.mpf(3)
X0, Y0, mp0 = mp.mpf('0.4'), mp.mpf('2.5'), mp.mpf('1.7')
u0 = mp.log(mp0)
ah = gamma+1; bh = ah-gamma; delta=mp.mpf('0.08'); mu=u0-3
C = make_curve(ah, bh, delta, mu)
Nx = X0/(1-C['Fb'](u0))
Ny = Y0/(C['M']*C['Fb1'](u0))
print(f"  open: X0={float(X0)}, Y0={float(Y0)}, mp0={float(mp0)}, gamma={float(gamma)}")
print(f"  calibrated: Nx={float(Nx):.6f}, Ny={float(Ny):.6f}, mu={float(mu):.6f}  (Nx/Ny={float(Nx/Ny):.4f})")

def getMP_raw(C, Nx, Ny, X):
    return (Ny/Nx)*mp.e**(C['Qb'](1 - X/Nx))
def X_of_u(C, Nx, u):  return Nx*(1 - C['Fb'](u))
def Y_of_u(C, Ny, u):  return Ny*C['M']*C['Fb1'](u)

# 1) reserves at u0 must give back X0, Y0
X_chk = X_of_u(C, Nx, u0); Y_chk = Y_of_u(C, Ny, u0)
ok1 = abs(float(X_chk-X0))<1e-12 and abs(float(Y_chk-Y0))<1e-12
print(f"  [{status(ok1)}] reserves(u0) == (X0,Y0):  X={float(X_chk):.10f} Y={float(Y_chk):.10f}")
# 2) getMP_raw at the open reserve X0 must give back mp0  -- THE prefactor test
mp_chk = getMP_raw(C, Nx, Ny, X0)
ok2 = abs(float(mp_chk-mp0))<1e-9
print(f"  [{status(ok2)}] getMP_raw(X0) == mp0:  got {float(mp_chk):.10f}  want {float(mp0):.10f}")
print(f"        (this is the test that the Ny/Nx prefactor is calibrated correctly)")

# ---------------------------------------------------------------------------
print("\n"+"="*78); print("GATE 5: ARB ROUND-TRIP  -- push to oracle, getMP_raw back == oracle?"); print("="*78)
# Brief's arb formula:  u* = log(o);  X = Nx(1-Fb(u*));  Y = Ny*M*Fb1(u*)
for o in [mp.mpf('1.7'), mp.mpf('1.2'), mp.mpf('3.0')]:
    # AS WRITTEN in the brief: u* = log(o)
    ustar = mp.log(o)
    Xa = X_of_u(C, Nx, ustar)
    mp_back = getMP_raw(C, Nx, Ny, Xa)
    # CORRECTED candidate: u* = log(o * Nx/Ny)  so that (Ny/Nx)e^{u*} = o
    ustar_c = mp.log(o*Nx/Ny)
    Xa_c = X_of_u(C, Nx, ustar_c)
    mp_back_c = getMP_raw(C, Nx, Ny, Xa_c)
    print(f"  o={float(o):.3f}:  as-written u*=log(o)        -> getMP_raw={float(mp_back):.6f}   "
          f"(ratio to o = {float(mp_back/o):.6f} == Ny/Nx? {float(Ny/Nx):.6f})")
    print(f"            corrected u*=log(o*Nx/Ny) -> getMP_raw={float(mp_back_c):.6f}   "
          f"(==o? {abs(float(mp_back_c-o))<1e-9})")

# ---------------------------------------------------------------------------
print("\n"+"="*78); print("GATE 6: REBASE INVARIANCE  x->rx, alpha->r*alpha, Nx->r*Nx (mu,Ny fixed)"); print("="*78)
# Claim: poolMark unchanged, getMP_raw -> /r.
# poolMark = getMP_raw * (o/oi). Live rebase also does o->? In the one-sided convention the
# strike ray theta->theta/r; poolMark as a $-quantity should be invariant. We test the raw claim:
#   after Nx->rNx with the SAME log-price coordinate u, getMP_raw scales by 1/r.
r = mp.mpf('1.3')
u_test = u0 + mp.mpf('0.2')
X_pre  = X_of_u(C, Nx, u_test)
mp_pre = getMP_raw(C, Nx, Ny, X_pre)
Nx_post = r*Nx
# the reserve x scales x->rx so X=x-alpha scales X->rX (alpha->r alpha); check X_post = r*X_pre
X_post = r*X_pre
# does X_post correspond to the SAME u under the rebased Nx?  X_post/Nx_post = rX_pre/(rNx)=X_pre/Nx -> same u
u_post = C['Qb'](1 - X_post/Nx_post)
mp_post = getMP_raw(C, Nx_post, Ny, X_post)
ok_u  = abs(float(u_post-u_test))<1e-9
ok_mp = abs(float(mp_post - mp_pre/r))<1e-9
print(f"  [{status(ok_u)}] X->rX with Nx->rNx preserves u: u_post={float(u_post):.10f} vs u={float(u_test):.10f}")
print(f"  [{status(ok_mp)}] getMP_raw -> getMP_raw/r:  pre={float(mp_pre):.6f}  post={float(mp_post):.6f}  "
      f"pre/r={float(mp_pre/r):.6f}")
print(f"        => poolMark = getMP_raw*(o/oi) tracks /r unless oracle frame absorbs it (one-sided conv.)")

# ---------------------------------------------------------------------------
print("\n"+"="*78); print("GATE 1 (exponent side): does gamma=1/2 reproduce the Balancer power law?"); print("="*78)
# Balancer w=1/2: value=sNorm ~ mp^(-1/2), i.e. exponent 1/2.  GH at gamma=1/2 => ah-bh=1/2.
# Need ah > bh+1 => ah-bh>1, but gamma=1/2 <1 violates ah>bh+1!  So f_{beta+1} is NOT a valid
# density at gamma<1.  This is a STRUCTURAL note about the gamma=1/2 acceptance gate.
print("  CONSTRAINT CHECK: brief requires ah > bh+1 > 0, i.e. gamma = ah-bh > 1.")
print(f"    => at gamma=1/2 the constraint ah>bh+1 is VIOLATED (1/2 < 1).")
print( "    => f_{beta+1} would need ah^2-(bh+1)^2 > 0 i.e. gamma>1; at gamma=1/2 psi' is imaginary.")
Cg = None
try:
    Cg = make_curve(1.5, 1.0, 0.08, 0)  # gamma=0.5
    print(f"    psi' at (ah=1.5,bh=1.0): {complex(Cg['psi1'])}")
except Exception as e:
    print(f"    make_curve(gamma=0.5) raised: {type(e).__name__}: {e}")
# Show the exponent the tail-integral gives for a VALID gamma>1 case near the barrier spirit:
for g in [mp.mpf('1.2'), mp.mpf('2'), mp.mpf('3')]:
    Cc = make_curve(g+1, 1, 0.08, 0)
    us=[mp.mpf(1)+ (mp.mpf(3)-1)*k/199 for k in range(200)]
    val=[mp.log(1-Cc['Fb'](uu)) for uu in us]
    n=mp.mpf(200); su=sum(us); sv=sum(val); suu=sum(u*u for u in us); suv=sum(us[i]*val[i] for i in range(200))
    slope=(n*suv-su*sv)/(n*suu-su*su)
    print(f"    gamma={float(g)}: tail-integral eff.exponent on u in[1,3] = {float(-slope):.4f}")
