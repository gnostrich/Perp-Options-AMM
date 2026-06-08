#!/usr/bin/env python3
"""v26a finishing pass: Task A (%-slippage -> realized-average) + Task B (re-fit frame).
Old strings are sliced from the file by line range so Unicode in comments matches exactly.
Each replacement asserted to fire exactly once. Blobs never touched."""
from pathlib import Path
import hashlib
F = Path("/home/claude/work/temporal_mvp_v26a_v2.html")
txt = F.read_text()
lines = txt.splitlines(keepends=True)
def lmd5(s,n): return hashlib.md5(s.splitlines(keepends=True)[n-1].encode()).hexdigest()
# ACTUAL blobs of this re-cut (original safe set) — hold these, NOT the brief's 8d2e1a84/1b320fc5
B74, B1060 = lmd5(txt,74), lmd5(txt,1060)
assert B74=="ab663f5c26f2a461c5b0ef1421d0ad74", f"unexpected blob74 {B74}"
assert B1060=="c505b08ad0e4c6b0fb9e64e9679fe291", f"unexpected blob1060 {B1060}"

# --- extract exact old strings by line range (1-indexed file lines) ---
old_commentA = ''.join(lines[1841:1846])   # lines 1842-1846 (the MARGINAL PRICE comment)
old_codeA    = ''.join(lines[1846:1849])   # lines 1847-1849 (s1/s2/s_band marginal ratio)
old_frameB   = ''.join(lines[3224:3228])   # lines 3225-3228 (frozen-once comment + if-block)

# sanity: confirm we grabbed the right blocks
assert "MARGINAL PRICE" in old_commentA and "weight-form" in old_commentA, "comment slice wrong"
assert "const s1 = Math.abs(getMP_raw(leg1.newState)" in old_codeA and "s_band" in old_codeA, "code slice wrong"
assert "frozen once" in old_frameB and "if (!window.__curveFrame)" in old_frameB, "frame slice wrong"

def rep(old,new,label):
    c=txt.count(old); assert c==1, f"[{label}] expected 1, found {c}"
    return txt.replace(old,new,1)

# ---- Task A: comment ----
new_commentA = (
"    // Per-leg slippage (display-only). Realized-average execution price vs the\n"
"    // PRE-trade marginal price, per leg: |dY / (getMP_raw(pre) * dX) - 1|,\n"
"    // composed across legs. Mirrors the $-path (same dX, dY and getMP_raw(pre)\n"
"    // reference) and stays bounded -- unlike the marginal-price ratio\n"
"    // |mp_post/mp_pre - 1|, which is price-impact and explodes at the GH tail.\n")
txt = rep(old_commentA, new_commentA, "TaskA comment")

# ---- Task A: code (realized-average, mirrors legSlipUsd; guard zero-dX leg) ----
new_codeA = (
"    const legSlipFrac = (pre, post) => {\n"
"      const dY = Math.abs(post.y - pre.y);\n"
"      const dX = Math.abs(post.x - pre.x);\n"
"      return dX > 1e-18 ? Math.abs(dY / (getMP_raw(pre) * dX) - 1) : 0;\n"
"    };\n"
"    const s1 = legSlipFrac(state, leg1.newState);\n"
"    const s2 = legSlipFrac(leg1.newState, leg2.newState);\n"
"    const s_band = (1 + s1) * (1 + s2) - 1;\n")
txt = rep(old_codeA, new_codeA, "TaskA code")

# ---- Task B: re-fit frame every draw (drop the freeze guard) ----
new_frameB = (
"    // Frame extents: re-fit each draw from the current equilibrium (was frozen\n"
"    // once on first draw, which clipped the GH bend as it climbed out of frame).\n"
"    window.__curveFrame = { xMax: xEq * 3.0, yMax: yEq * 3.0 };\n")
txt = rep(old_frameB, new_frameB, "TaskB frame")

F.write_text(txt)
after=F.read_text()
assert lmd5(after,74)==B74 and lmd5(after,1060)==B1060, "BLOB CHANGED!"
print("v26a-finish splice OK; lines:",len(after.splitlines()))
print("blobs held (actual safe set): 74 ab663f5c =",lmd5(after,74)==B74,"| 1060 c505b08a =",lmd5(after,1060)==B1060)
longs=sorted(((len(l),i+1) for i,l in enumerate(after.splitlines())),reverse=True)[:3]
print("top-3 longest (size,line):",longs)
