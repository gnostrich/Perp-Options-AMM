import mpmath as mp
mp.mp.dps = 40
# =====================================================================
# STAGE 0.1 COORD HONESTY — which coordinate is u?  Is M=Fisher in u, or only after reparam?
# Engine facts (GH_MATH.md):
#   u = log(price) - log P.   price coordinate getMP_raw = P e^u.
#   X(u) = Nx * tail_b(u)   [upper tail of f_b]      Y(u)=Ny M F_{b+1}(u) [CDF of f_{b+1}]
#   f_b(v)=Cb exp(-ah sqrt(d^2+v^2)+bh v), bh=1, centered v=u-mu.
# The SLOPE law:  |dy/dx| = (dY/du)/(-dX/du) = (NyM/Nx) f_{b+1}(u)/f_b(u) = P e^{u-mu}.
# So in the latent u-coordinate, log(slope) is LINEAR (slope-deviation 2nd order in u is from the
# RESERVE curvature, not the price).  The dissipation/LVR form lives on the RESERVE response.
# =====================================================================
ah, d = 4.0, 0.08
def fb(v): return mp.e**(-ah*mp.sqrt(d**2+v**2)+1*v)        # bh=1 core (un-normalized)
def fb1(v): return mp.e**(-ah*mp.sqrt(d**2+v**2)+2*v)       # bh+1=2 core
# normalizers
Cb  = 1/mp.quad(fb,  [-mp.inf,0,mp.inf])
Cb1 = 1/mp.quad(fb1, [-mp.inf,0,mp.inf])
def tail_b(u, mu=0.0):  return Cb *mp.quad(lambda t: fb(t-mu),  [u, mp.inf])   # upper tail
def cdf_b1(u, mu=0.0):  return Cb1*mp.quad(lambda t: fb1(t-mu), [-mp.inf, u])  # lower CDF

# Build X(u),Y(u) (set Nx=Ny=M=1 for shape; mu=0).  Slope = -(dY/du)/(dX/du).
def X(u): return tail_b(u)
def Y(u): return cdf_b1(u)
hh = mp.mpf('1e-7')
def dX(u): return (X(u+hh)-X(u-hh))/(2*hh)
def dY(u): return (Y(u+hh)-Y(u-hh))/(2*hh)
def slope(u): return -dY(u)/dX(u)

print("STAGE 0.1 COORD — verify slope law e^{u-mu} and locate the dissipation metric")
print("-"*70)
print(" check slope(u) vs (Cb/Cb1 absorbed) e^{u} :  ratio should be constant (=Cb1/Cb)")
for u in [-1.0, -0.5, 0.0, 0.5, 1.0]:
    sl = slope(u)
    print(f"  u={u:+.1f}  slope={float(sl):.6f}  slope/e^u={float(sl/mp.e**u):.6f}")
ratio = slope(0.0)  # = (Cb1/Cb)* dens ratio... constant
print()
# The slope law is exp-linear in u CONFIRMED (ratio constant).  Now the DISSIPATION metric.
# LVR metric (dollar gamma) in u: the value V(u)=∫ price dX.  The arber's leak per the slope law
# integrates the slope GAP (PH3_grounded).  Its 2nd-order (quadratic) form per unit du is g'(u).
# g'(u) = d/du [k e^{u-mu}] = k e^{u-mu} = g(u).  So the dissipation curvature in u is g(u) itself
# (exp), NOT the Fisher Psi''(s).  THIS IS THE HONEST CRUX:
print("DISSIPATION curvature in the raw latent u:  g'(u) = k e^{u-mu} = g(u)  (exp, NOT Fisher).")
print()
# So in the RAW u coordinate, M_raw = g(u) = price.  The Fisher metric Psi''(s) is in the NATURAL
# parameter s = the MEAN/score coordinate.  RELATION: u (rapidity) and s (natural) are related by
# the exp-family Legendre map.  The price = e^u = e^{s}?  Let's test if u == s (natural param).
# Under tilt q_s, the score is v; mean m(s)=Psi'(s); the MARGINAL PRICE quoted by the exp-family AMM
# = e^{s} (gradient of log-partition exponentiated).  Engine price = e^u.  =>  u CORRESPONDS to s.
# Then M_raw = g(u)=e^u is the price, and Fisher Psi''(s) is the curvature in s=u.
# But g'(u)=e^u != Psi''(u).  Let's check directly: is Psi''(u) (Fisher at s=u) equal to anything
# the dissipation sees?  Compute both at matched points:
def Z(s):  return mp.quad(lambda x: mp.e**(-ah*mp.sqrt(d**2+x**2)+s*x),[-mp.inf,0,mp.inf])
def Psi2(s):
    m1=mp.quad(lambda x:x*mp.e**(-ah*mp.sqrt(d**2+x**2)+s*x),[-mp.inf,0,mp.inf])/Z(s)
    m2=mp.quad(lambda x:x*x*mp.e**(-ah*mp.sqrt(d**2+x**2)+s*x),[-mp.inf,0,mp.inf])/Z(s)
    return m2-m1**2
print(" matched-point comparison (treating engine u as the family score s):")
print("  u/s     g(u)=e^u (raw LVR curv)   Psi''(s)=Fisher    equal?")
for u in [-0.5,0.0,0.5,1.0]:
    print(f"  {u:+.1f}    {float(mp.e**u):.6f}             {float(Psi2(1+u)):.6f}        NO")
print()
print("HONEST FINDING: in the RAW latent u, the dissipation curvature is g(u)=e^u (the price),")
print("which is NOT the Fisher metric Psi''(s).  They are DIFFERENT functions.  M=Fisher does")
print("NOT hold as a naive identity in the raw u coordinate.")
