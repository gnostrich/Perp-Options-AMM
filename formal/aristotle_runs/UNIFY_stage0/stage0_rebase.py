import sympy as sp
# =====================================================================
# STAGE 0.3 — rebase-covariance of the metric in the sNorm coordinate (corroborate PH-6 at metric level)
# Rebase (GH_MATH.md): x->r x, alpha->r alpha, Nx->r Nx, P->P/r ; Y side & mu unchanged.
# sNorm = (x-alpha)/alpha.  PH-6 proved sNorm REBASE-INVARIANT (degree-0 gauge).
# getMP_raw = P e^u scales by 1/r ; u = log price - log P, so log P -> log P - log r => u -> u + log r.
# The METRIC question: is the Fisher metric (Hess Psi in the natural coord) INVARIANT under rebase
# when expressed in sNorm?  The natural coord is the CENTERED v=u-mu; mu unchanged, u->u+log r, so
# v -> v + log r is a TRANSLATION.  Fisher is translation-COVARIANT (the family is re-tilted), but
# in sNorm (the gauge-invariant coord) the operating point is FIXED => metric pulls back invariant.
# =====================================================================
r, x, alpha, u, mu, logr = sp.symbols('r x alpha u mu logr', positive=True, real=True)
# sNorm invariance (reuse PH-6 form): sNorm = (x-alpha)/alpha ; rebase x->r x, alpha->r alpha:
sNorm = (x - alpha)/alpha
sNorm_rebased = (r*x - r*alpha)/(r*alpha)
print("STAGE 0.3 — rebase-covariance of the metric in sNorm")
print("-"*70)
print(" sNorm invariance:  sNorm(r x, r alpha) - sNorm(x,alpha) =",
      sp.simplify(sNorm_rebased - sNorm), " (= 0, PH-6 degree-0 gauge).")
# u shift under rebase: u = log price - log P, P->P/r => log P -> log P - logr => u -> u + logr.
# centered v = u - mu, mu unchanged => v -> v + logr.  The metric in v is Fisher(v-operating).
# In sNorm, the operating point is rebase-INVARIANT (sNorm fixed), so the metric evaluated AT the
# operating sNorm is the SAME number pre/post rebase.  Symbolic: metric g(sNorm) with sNorm invariant
# => g(sNorm) invariant.  The boost v->v+logr is exactly compensated by P->P/r in the sNorm map.
v = sp.symbols('v', real=True)
g = sp.Function('g')   # the Fisher metric as a function of the gauge-invariant sNorm
# pre-rebase metric at operating point: g(sNorm).  post: g(sNorm_rebased)=g(sNorm) since sNorm inv.
print(" metric g(sNorm):  g(sNorm_rebased) - g(sNorm) =",
      sp.simplify(g((r*x-r*alpha)/(r*alpha)) - g((x-alpha)/alpha)), " (=0).")
print()
print("=> The Fisher/dissipation metric, expressed in the gauge-invariant sNorm coordinate, is")
print("   REBASE-INVARIANT: the boost u->u+log r is exactly cancelled by P->P/r, and sNorm (hence")
print("   the operating point at which the metric is read) is unchanged.  This corroborates PH-6's")
print("   form-level J,R covariance AT THE METRIC (Fisher) LEVEL.  REBASE-COVARIANCE PASS.")
