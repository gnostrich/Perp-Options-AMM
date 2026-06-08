# Recipe: editing HTML files with embedded base64 blobs

For any Temporal simulator HTML (v10, v11, MVP composite-ray, etc) — these
files carry the bg image (~274 KB) and logo (~5 KB) as single base64 lines.
Touching them naively destroys a session.

## Failure pattern to avoid

Symptom: tool calls "stall", task "needs 50 retries", session goes nowhere.
Root cause: a single line of 100K+ chars (the base64 blob) gets dumped into
context by `view`, `grep "background"`, or unfiltered `cat`. Context fills,
no room left to do the work.

## The recipe (4 steps — blobs never enter chat)

### 1. Locate blobs by size, not content
```bash
awk '{print length($0), NR}' file.html | sort -nr | head -5
```
Output is `<size> <line>` pairs only. Anything >10KB is a blob.

### 2. Check byte-equality without dumping
```bash
sed -n '74p' v4.html  | md5sum
sed -n '63p' v11.html | md5sum
```
Matching md5 → blobs identical → skip extraction entirely.

### 3. View structure with blob lines elided
```bash
# show lines 60-80, replace line 74 with a placeholder
awk 'NR==74{print NR": [BLOB "length($0)"]"; next} \
     NR>=60 && NR<=80{print NR": "$0}' file.html
```

### 4. Splice via on-disk Python script
Write a script to `/home/claude/splice.py`. It reads source files from disk,
manipulates in Python memory, writes output to disk. Blobs flow
disk → Python → disk, never through chat.

Skeleton:
```python
from pathlib import Path
import re

src    = Path("/mnt/project/source.html").read_text()
target = Path("/mnt/user-data/uploads/target.html").read_text()

blob_line = src.splitlines(keepends=True)[LINE_NUM - 1]  # 1-idx → 0-idx
# ... re.subn or string ops to splice blob_line into target ...
Path("/mnt/user-data/outputs/target.html").write_text(modified)
```
Use `lambda m: replacement` in `re.subn` to avoid backref interpretation
of `\N` sequences inside the replacement string.

## Anti-patterns

| Don't | Why |
|---|---|
| `grep "background\|data:image" file.html` | returns full blob lines |
| `view` without `view_range` | may include blob |
| `cat file.html` | dumps everything |
| Asking Claude to "re-extract" the blob via in-chat ops | blob enters context |

## When in doubt

Treat any HTML >100 KB as blob-bearing. Run step 1 first, always.
Same recipe applies to embedded fonts, embedded SVG sprites, embedded PDFs —
anything inlined as base64.

## Reference case

v4 → spliced with v11 chrome, 2026-05-26:
- v4 bg blob was already present (md5 matched v11), needed no work
- Only the 5KB logo was genuinely missing
- Total edit: 2 CSS-rule lines + replace one `<div>` with one `<a><img></a>`
- Prior sessions failed ~50 times by re-investigating the bg blob unnecessarily
