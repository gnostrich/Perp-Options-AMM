# build/INTEGRITY.md — lineage, md5s, blob-layer resolution

## File lineage
| build | md5 | what |
|---|---|---|
| `temporal_mvp_v24_rebase_fixed_2.html` | `6f606f52` | clean **barrier** base (pre-GH). Kept for diffing. |
| (v25_gh) | `9910c699` | GH curve swapped onto clean v24; blobs byte-identical to v24 |
| (v26a fixes) | `951d16eb` | v25_gh + the 3 barrier-remnant fixes (inline slippage, curve-draw, marker) |
| (slippage WIP head) | `2c0337e8` | v26a + slippage work-in-progress (the splice base) |
| `temporal_mvp_v26a.html` | `89ae89e9` | slipfix — the blob-layer reconcile below was verified on this build; **demoted, succeeded by v26b then v26c** |
| `temporal_mvp_v26c.html` | `6cc73563` | uniform strike registration θ=sNorm(K); GH-line endpoint — **demoted 2026-06-10 on v27 promotion (operator entry 28)** |
| `temporal_mvp_v27_wkurtosis.html` | `928cde1c` | (W) kurtosis curve off the v24 base — **DEMOTED 2026-06-12 on v28-lens promotion**; retained, `wcurve_selfcheck.js` 22 PASS via explicit path |
| **`HEAD_temporal_mvp_v28_lens.html`** | **`989752294`** | **current canonical HEAD** — v24 plain-Balancer pool (pool fns byte-identical to v24) + static polar lens in the query/write layer; one τ kurtosis knob; settle/read/write at lensed prices (entry 96); gate = `lens_selfcheck.js` **23 PASS**; **PROMOTED 2026-06-12 (operator entries 84/94/96/106)**; tester FINAL 27/27; see `BUILD_LINEAGE.md` + `CHANGELOG_v28_lens.md` |

The two blobs are unchanged across the entire lineage (v24 → v26c → v27). That is the file-safety invariant; it has held.

## The blob-layer resolution (a phantom thread, now CLOSED)
For weeks the "blob ledger" showed two apparently-conflicting blob md5 sets, framed as "minified broken cut" vs "canonical original." **They are the same blobs measured at different layers.** Verified on `89ae89e9`:

| layer | webp | svg |
|---|---|---|
| decoded binary | 205398 bytes, md5 `8d2e1a84` | 3875 bytes, md5 `1b320fc5` |
| base64 payload only | 273864 chars, md5 `d3ff8fc8` | 5168 chars, md5 `b6f0d67b` |
| whole HTML line (`data:` prefix + b64 + newline) | 273918 chars, md5 `ab663f5c` | 5241 chars, md5 `c505b08a` |

Arithmetic that proves it's one blob: `273864 base64 chars × ¾ = 205398 decoded bytes` (exact); `5168 × ¾ ≈ 3875`. The `8d2e1a84/1b320fc5` set is just the **decode** of the `ab663f5c/c505b08a` line. There was never a second file or a minified cut — earlier sessions compared a decode-layer hash against a line-layer hash and inferred two artifacts.

**RATIFIED 2026-06-08 (operator):** the file-safety blob check keys off the **line layer**
`ab663f5c/c505b08a` (`sed -n 'Np'|md5sum`) — status quo, already wired into the hook + `run_all.sh`.
The decoded-binary md5 `8d2e1a84/1b320fc5` is recorded in `BUILD_LINEAGE.md` as a *documented
secondary* (re-serialization-invariant; lets a future line-hash break be told apart from a real blob
change) but is **not** the check. The "minified vs canonical / broken cut" language is retired across
CLAUDE.md / GOTCHAS / BUILD_LINEAGE / the hook comments.

## How to check blobs (whatever layer you ratify)
```python
import re, base64, hashlib
src = open("temporal_mvp_v26a.html").read()
for kind, pat in [("webp", r'data:image/webp;base64,([A-Za-z0-9+/=]+)'),
                  ("svg",  r'data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)')]:
    b64 = re.search(pat, src).group(1)
    raw = base64.b64decode(b64)
    print(kind, "decoded", len(raw), hashlib.md5(raw).hexdigest()[:8])   # -> 8d2e1a84 / 1b320fc5
```

## A correction that matters more than the blobs
`engine_knowledge/SOURCE_OF_TRUTH_core_functions.md` (a prior-session doc) labels `getMP_raw` as the "Layer-1 raw slope." **That label is wrong and caused the slippage bug.** `getMP_raw` is the carry **price coordinate** (= oracle at equilibrium); the geometric slope is `getMP_raw·e^(−ghMu)`. The bundled copy carries an erratum banner. See `00_ORCHESTRATOR_START_HERE.md` §4.
