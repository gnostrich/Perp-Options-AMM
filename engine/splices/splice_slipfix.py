#!/usr/bin/env python3
"""Slippage units fix: %-path and $-path both reference the geometric marginal
mpGeom = getMP_raw * e^(-ghMu). Removes margPrice. Fixes the getMP_raw comment mislabel.
curveTrace angle left untouched (verified unused). Old strings sliced by line range for
exact Unicode match; each replacement asserted to fire once. Blobs never touched."""
from pathlib import Path
import hashlib
F = Path("/home/claude/work/temporal_mvp_v26a_slipfix.html")
txt = F.read_text()
lines = txt.splitlines(keepends=True)
def lmd5(s,n): return hashlib.md5(s.splitlines(keepends=True)[n-1].encode()).hexdigest()
B74,B1060 = lmd5(txt,74), lmd5(txt,1060)
assert B74=="ab663f5c26f2a461c5b0ef1421d0ad74" and B1060=="c505b08ad0e4c6b0fb9e64e9679fe291", "unexpected blobs"

# --- extract exact old strings by line range (1-indexed) ---
old_pct   = ''.join(lines[1841:1851])   # 1842-1851: %-comment + legSlipFrac (getMP_raw ref)
old_usd   = ''.join(lines[1855:1867])   # 1856-1867: $-comment + margPrice + legSlipUsd
assert "getMP_raw(pre) * dX" in old_pct and "legSlipFrac" in old_pct, "pct slice wrong"
assert "const margPrice = (s) => getMP_raw(s)" in old_usd and "legSlipUsd" in old_usd, "usd slice wrong"

def rep(old,new,label):
    c=txt.count(old); assert c==1, f"[{label}] expected 1, found {c}"
    return txt.replace(old,new,1)

# ---- %-path: add mpGeom, reference geometric marginal ----
new_pct = (
"    // Per-leg slippage (display-only). Realized-average execution price vs the\n"
"    // PRE-trade GEOMETRIC marginal mpGeom = getMP_raw * e^-ghMu. getMP_raw is the\n"
"    // e^mu PRICE COORDINATE (= oracle at equilibrium), NOT the reserve slope dy/dx;\n"
"    // comparing dY/dX against it directly pinned slippage ~97% flat. Per leg:\n"
"    // |dY/(mpGeom(pre)*dX) - 1|, composed; e^mu cancels -> pure geometric slippage.\n"
"    const mpGeom = (s) => getMP_raw(s) * Math.exp(-s.ghMu);   // geometric reserve marginal |dy/dx|\n"
"    const legSlipFrac = (pre, post) => {\n"
"      const dY = Math.abs(post.y - pre.y);\n"
"      const dX = Math.abs(post.x - pre.x);\n"
"      return dX > 1e-18 ? Math.abs(dY / (mpGeom(pre) * dX) - 1) : 0;   // realized avg vs pre-trade geometric marginal\n"
"    };\n")
txt = rep(old_pct, new_pct, "pct->mpGeom")

# ---- $-path: drop margPrice, reference geometric marginal (Layer-1 reserve-USD) ----
new_usd = (
"    // Dollar slippage COST (Layer-1 reserve-USD): price-drift loss per leg,\n"
"    // |dY - mpGeom(pre)*dX| -- cash received vs a flat-spot fill at the PRE-trade\n"
"    // GEOMETRIC marginal. Was getMP_raw(pre)*dX (the e^mu price coordinate), which\n"
"    // inflated the cost ~e^mu; corrected to mpGeom. Layer-2 honest-dollar is a\n"
"    // separate follow-up via the settlement chain. Summed over both legs.\n"
"    const legSlipUsd = (pre, post) => {\n"
"      const dY = Math.abs(post.y - pre.y);\n"
"      const dX = Math.abs(post.x - pre.x);\n"
"      return Math.abs(dY - mpGeom(pre) * dX);\n"
"    };\n")
txt = rep(old_usd, new_usd, "usd->mpGeom (margPrice removed)")

# ---- getMP_raw comment mislabel fix (root cause) ----
txt = rep(
"// |dy/dx| raw (Layer 1)",
"// carry price coordinate = e^mu * |dy/dx|; equals oracle at equilibrium (NOT the geometric slope)",
"getMP_raw comment")

# ---- Display label: tooltip clarifies $ is Layer-1 reserve-USD (and corrects the p0.dx wording) ----
old_line = lines[1175]   # line 1176, the Slippage % tooltip
assert 'title="Price drift across the trade' in old_line, "tooltip line wrong"
pre, rest = old_line.split('title="', 1)
_title, post = rest.split('">', 1)   # post keeps the info-icon glyph + closing spans + newline
new_title = ("Price drift across the trade: realized average execution price vs the pre-trade "
             "geometric marginal. This cost is already inside the trader's proceeds -- shown for "
             "transparency. The $ figure is a pool-level price-impact cost in Layer-1 reserve USD, "
             "not a trader honest-dollar figure.")
new_line = pre + 'title="' + new_title + '">' + post
txt = rep(old_line, new_line, "tooltip reserve-USD label")

F.write_text(txt)
after=F.read_text()
assert lmd5(after,74)==B74 and lmd5(after,1060)==B1060, "BLOB CHANGED!"
assert "margPrice" not in after, "margPrice not fully removed!"
print("slipfix splice OK; lines:",len(after.splitlines()))
print("blobs held:",lmd5(after,74)==B74, lmd5(after,1060)==B1060)
print("margPrice fully removed:", "margPrice" not in after)
print("mpGeom present:", after.count("const mpGeom = (s) => getMP_raw(s) * Math.exp(-s.ghMu)"))
longs=sorted(((len(l),i+1) for i,l in enumerate(after.splitlines())),reverse=True)[:3]
print("top-3 longest (size,line):",longs)
