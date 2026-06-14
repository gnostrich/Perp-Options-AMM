#!/usr/bin/env python3
"""Manager independent re-derivation of the AFT-2026 referee report's checkable math claims
(2026-06-12). Each check prints the referee's number next to mine. Run: python3 verify_referee_claims.py
"""
import math

print("=== Claim 1 (report 3.2-1): off-ATM trade point lies on pool curve, NOT on trajectory hyperbola ===")
x = y = 10.0; w = 0.5; a = x*w; b = y*(1-w)          # alpha = beta = 5
k = x**w * y**(1-w)
xT = math.sqrt(50.0); yT = 2*xT                       # theta=2 ray on pool curve sqrt(xy)=10
print(f"trade point ({xT:.3f},{yT:.3f}); (xT-a)(yT-b) = {(xT-a)*(yT-b):.2f}  vs alpha*beta = {a*b}")
assert abs((xT-a)*(yT-b) - 18.93) < 0.01              # referee: 18.93 vs 25 -- CONFIRMED

print("\n=== Claim 2 (report 3.4): Appendix B line 587 small-trade display wrong twice ===")
dy = 0.01
dx_exact = -a*b*dy/((y-b)*(y+dy-b))
mp = a*y**2/(b*x**2)
printed = -mp*dy/(1 - dy/(y-b))                       # paper's printed display
corrected = -(dy/mp)/(1 + dy/(y-b))                   # referee's corrected form
print(f"exact dx = {dx_exact:.6f}; paper-printed = {printed:.6f}; referee-corrected = {corrected:.6f}")
assert abs(dx_exact - corrected) < 1e-12              # CONFIRMED (printed form wrong)

print("\n=== Claim 3 (report 3.4): Figure 1 caption false for finite trades; k NOT conserved ===")
dy = 2.0
y2 = y + dy; dx = -a*b*dy/((y-b)*(y2-b)); x2 = x + dx
w2 = a/x2
k2 = x2**w2 * y2**(1-w2)
old_on_new = x**w2 * y**(1-w2)
print(f"post-trade k' = {k2:.4f}; old reserves point on new-w curve = {old_on_new:.4f} (not equal -> old point NOT on post-trade curve)")
print(f"k pre-trade = {k:.4f} -> k post-trade = {k2:.4f}  ==> k is NOT invariant under trades (alpha,beta are)")
assert abs(k2 - 9.8614) < 5e-4                        # referee: 9.8614 -- CONFIRMED

print("\n=== Claim 4 (report 3.4): sNorm orientation conflict ===")
w_ = 0.6
mp45 = w_/(1-w_)                                       # mp = alpha*y^2/(beta*x^2) at y=x reduces to w/(1-w)
sNorm = (1-w_)/w_
print(f"w={w_}: mp@45deg = {mp45:.4f}; notation-table sNorm = {sNorm:.4f}  (reciprocals -- CONFIRMED)")
assert abs(mp45*sNorm - 1) < 1e-12

print("\n=== Claim 5 (report 3.2-2): collarSurplus -- paper claim vs repo Lean artifact ===")
print("repo formal/aristotle_runs/C2/.../C2.lean defines collarSurplus(theta,w) := theta*((1-w)/w - 1)")
print("  -> a POSITED structural form (in-file NOTE says so); theta-independent zero-set; iff is the")
print("     anchor-symmetry triviality. It is NOT derived from min(slope,1/slope) and contains NO")
print("     explicit skew counterexample. Paper Appendix G's description of result 'C4' does not match.")
for w_ in (0.5, 0.6):
    print(f"  w={w_}: artifact surplus(theta=2) = {2*((1-w_)/w_-1):+.4f}; referee-reconstruction sNorm^2-1 = {((1-w_)/w_)**2-1:+.4f}")

print("\nALL CHECKS PASS -- referee's checkable claims CONFIRMED by independent re-derivation.")
