# splices/ — the file-safe editing recipe

The HTML embeds two base64 blobs and three `<script>` blocks. Edit it ONLY through on-disk
Python splices that follow this recipe. The scripts here are worked, working examples:
- `splice_v26a_fixes.py` — the three barrier-remnant fixes (v25_gh → 951d16eb).
- `splice_v26a_finish_historical.py` — Task A/B (historical; produced the now-superseded 2c0337e8).
- `splice_slipfix.py` — the slippage units fix (2c0337e8 → HEAD 89ae89e9). **Best template.**

## The recipe (non-negotiable)
1. **Work on a copy.** `cp builds/HEAD_… work.html`. Never edit a build in place.
2. **Baseline the blobs** by md5 of the exact blob lines, and assert they are the canonical set
   (`ab663f5c` / `c505b08a`) before and after.
3. **Match exact old strings.** Hand-typing multi-line strings with Unicode (Δ, −, ², ·, α, ⓘ, em-dash)
   is error-prone. Instead **slice the old string out of the file by line range**
   (`''.join(lines[a:b])`) so the match is byte-exact, then `str.replace(old, new, 1)`.
4. **Assert each anchor fires exactly once:** `assert txt.count(old) == 1`. If not, STOP — the file
   isn't what you think (line drift, prior edit, wrong base).
5. **Preserve line breaks.** If the old string you sliced ends in `\n`, the replacement must too —
   otherwise you merge the following statement onto one line (valid JS, but a real near-miss that
   produced `…};    const xMax_raw = …` once). Add the trailing `\n`.
6. **Never put a blob through the splice.** Blobs stay on disk; the splice touches only code/comment
   lines far from the blob lines.
7. **Write back, then re-verify** (next section). On ANY red: stop, report, do not list as a package.

## Post-edit file-safety checklist (all must pass)
- Blob md5s unchanged == `ab663f5c` / `c505b08a` (verify against the FILE, not the ledger).
- All 3 `<script>` blocks parse: `node --check` each, and/or `new Function(body)`.
- No line inside a script exceeds ~50000 chars (no blob-in-script).
- Engine IIFE intact: `const Engine = (function() {` … `})();`.
- No function signatures changed unless that is the explicit task (diff the engine block).
- The math gates still pass: `verify/run_all.sh` (or `verify/verify_v26a_mine.js`).
- **Surgical diff:** `diff builds/<base> work.html` shows ONLY the intended regions. (Shell is `sh`;
  use `diff a b`, not process substitution.)
- **No minifier / asset optimizer.** Ever.

## Skeleton (Python)
```python
from pathlib import Path; import hashlib
F = Path("work.html"); txt = F.read_text(); lines = txt.splitlines(keepends=True)
def lmd5(s,n): return hashlib.md5(s.splitlines(keepends=True)[n-1].encode()).hexdigest()
B74,B1060 = lmd5(txt,74), lmd5(txt,1060)
assert B74=="ab663f5c26f2a461c5b0ef1421d0ad74" and B1060=="c505b08ad0e4c6b0fb9e64e9679fe291"
old = ''.join(lines[A:B])            # slice exact old block by 0-based line range
assert txt.count(old)==1
txt = txt.replace(old, new_block, 1) # new_block ends in \n if old did
F.write_text(txt)
after=F.read_text()
assert lmd5(after,74)==B74 and lmd5(after,1060)==B1060   # blobs intact
```
Then run the post-edit checklist above.

## Why this much ceremony
Blob corruption and script-merge are silent — the gates can stay green while the rendered app is
broken or the blobs are the minified set. The asserts and the surgical diff are what make a
display/structure change provably surgical. A minifier run is what broke a prior cut; that's why
the optimizer is banned and the canonical blobs are pinned by md5.
