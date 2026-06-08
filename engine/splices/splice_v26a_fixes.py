#!/usr/bin/env python3
"""v26a fixes: Fix1 margPrice, Fix2 snapshot+curveTrace, Fix3 inline arb. Blobs disk->py->disk."""
from pathlib import Path
import hashlib
F = Path("/home/claude/work/temporal_mvp_v26a.html")
txt = F.read_text()
def lmd5(s,n): return hashlib.md5(s.splitlines(keepends=True)[n-1].encode()).hexdigest()
B74, B1060 = lmd5(txt,74), lmd5(txt,1060)
def rep(old,new,label,n=1):
    c=txt.count(old); assert c==n, f"[{label}] expected {n}, found {c}"
    return txt.replace(old,new,n)

# ---- Fix 1: slippage marginal price -> getMP_raw (code line only; comment block kept per 'nothing else changes') ----
txt = rep(
"    const margPrice = (s) => s.alpha * s.y * s.y / (s.beta * s.x * s.x);",
"    const margPrice = (s) => getMP_raw(s);   // GH curve marginal price (was the barrier reserve ratio)",
"Fix1 margPrice")

# ---- Fix 2a: snapshot spreads the pool so engine can be sampled on snap ----
txt = rep(
"    return { x: p.x, y: p.y, w, depth, sNorm, alpha: p.alpha, beta: p.beta };",
"    return { ...p, w, depth, sNorm };   // ...p carries the GH scalars (ghP, ghNx, ghNy, ghM, ghMu) so Engine.* can sample on snap",
"Fix2a snapshot spread")

# ---- Fix 2b: curveTrace -> sample GH curve via Engine.arbitrageToOracle ----
OLD_CT = """  function curveTrace(snap) {
    const modeSlope = snap.beta / snap.alpha;
    return curveTraceExplicit(snap.w, snap.depth, modeSlope);
  }"""
NEW_CT = """  // GH live curve: sample the engine's own on-curve points via arbitrageToOracle
  // (GH shape preserved), so the drawn curve matches GH pricing and the reserves
  // dot sits on it. Retires the weight-form / getDepth for the LIVE trace.
  // (curveTraceExplicit stays defined for the w=1/2 anchor reference — see drawCurve.)
  function curveTrace(snap) {
    const pts = [];
    const N = 400, mp0 = Engine.getMP_raw(snap);
    for (let i = 0; i <= N; i++) {
      const o  = mp0 * Math.exp(-6 + 12 * i / N);   // span the price range around current
      const st = Engine.arbitrageToOracle(snap, o); // on the SAME GH curve (shape preserved)
      if (st && st.x > 0 && st.y > 0) pts.push([st.x, st.y, Math.atan(o)]);
    }
    return pts;
  }"""
txt = rep(OLD_CT, NEW_CT, "Fix2b curveTrace GH")

# ---- Fix 3: inline arb marker -> engine equilibrium point ----
OLD_EQ = """    const xEq = alpha + Math.sqrt(alpha * beta / oracle);
    const yEq = beta  + Math.sqrt(alpha * beta * oracle);"""
NEW_EQ = """    const eq  = Engine.arbitrageToOracle(snap, oracle);   // GH equilibrium point (was barrier xEq/yEq)
    const xEq = eq ? eq.x : snap.x, yEq = eq ? eq.y : snap.y;"""
txt = rep(OLD_EQ, NEW_EQ, "Fix3 inline arb")

F.write_text(txt)
after=F.read_text()
assert lmd5(after,74)==B74, "BLOB 74 changed!"
longs=sorted(((len(l),i+1) for i,l in enumerate(after.splitlines())),reverse=True)[:3]
svg_ok=any(hashlib.md5(after.splitlines(keepends=True)[n-1].encode()).hexdigest()==B1060 for _,n in longs)
assert svg_ok, "SVG blob changed!"
print("v26a splice OK; lines:",len(after.splitlines()))
print("blob74 stable:",lmd5(after,74)==B74,"| svg present:",svg_ok)
print("top-3 longest (size,line):",longs)
