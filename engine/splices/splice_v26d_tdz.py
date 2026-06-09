#!/usr/bin/env python3
# FINDING-V26D-1 fix: defer the vol-knob IIFE's first apply() to DOMContentLoaded
# so it runs AFTER `const Viz` (L3444, same script block) is initialised — avoids
# the TDZ "Cannot access 'Viz' before initialization" that aborted <script id="ui">.
# Edit IN PLACE per brief. Blobs (webp L74, svg L1113) never go through the splice.
from pathlib import Path
import hashlib

F = Path("/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v26d_volknob.html")
txt = F.read_text()
lines = txt.splitlines(keepends=True)

def lmd5(s, n):
    return hashlib.md5(s.splitlines(keepends=True)[n - 1].encode()).hexdigest()

WEBP, SVG = lmd5(txt, 74), lmd5(txt, 1113)
assert WEBP == "ab663f5c26f2a461c5b0ef1421d0ad74", WEBP
assert SVG == "c505b08ad0e4c6b0fb9e64e9679fe291", SVG

# slice the exact old line (1-based 2960 -> 0-based 2959)
old = lines[2959]
assert old == "  apply();   // initialise read-outs to the open default (γ=2)\n", repr(old)
assert txt.count(old) == 1

new = "  window.addEventListener('DOMContentLoaded', apply);   // init read-outs+draw AFTER Viz is initialised (avoid TDZ)\n"
assert old.endswith("\n") and new.endswith("\n")

txt = txt.replace(old, new, 1)
F.write_text(txt)

after = F.read_text()
assert lmd5(after, 74) == WEBP, "webp blob changed!"
assert lmd5(after, 1113) == SVG, "svg blob changed!"
print("OK: spliced; blobs intact")
print("new md5:", hashlib.md5(after.encode()).hexdigest())
