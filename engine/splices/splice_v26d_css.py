from pathlib import Path
import hashlib

F = Path("/tmp/v26d_work.html")
txt = F.read_text()
lines = txt.splitlines(keepends=True)

def lmd5(s, n):
    return hashlib.md5(s.splitlines(keepends=True)[n-1].encode()).hexdigest()

B74, B1060 = lmd5(txt, 74), lmd5(txt, 1060)
assert B74 == "ab663f5c26f2a461c5b0ef1421d0ad74"
assert B1060 == "c505b08ad0e4c6b0fb9e64e9679fe291"

old = (
"  .preview-w-readout .w-skew {\n"
"    color: var(--c-coffee, #C7B7A5);\n"
"  }\n"
"\n"
"  /* State-block (replaces curve canvas; pure data panel) */\n"
)
assert txt.count(old) == 1
css = (
"  .preview-w-readout .w-skew {\n"
"    color: var(--c-coffee, #C7B7A5);\n"
"  }\n"
"\n"
"  /* ── Volatility-knob control panel (σ-dial) ── */\n"
"  .vol-knob {\n"
"    margin-top: 10px; padding: 8px 10px;\n"
"    background: var(--c-card-inner);\n"
"    border: 1px solid var(--c-border-cell);\n"
"    border-radius: 2px;\n"
"    font-family: \"IBM Plex Mono\", monospace;\n"
"    font-size: 10px;\n"
"  }\n"
"  .vol-knob .vk-row {\n"
"    display: flex; align-items: center; gap: 12px;\n"
"    flex-wrap: wrap; margin-bottom: 6px;\n"
"  }\n"
"  .vol-knob .vk-row:last-child { margin-bottom: 0; }\n"
"  .vol-knob .vk-title {\n"
"    justify-content: space-between;\n"
"    border-bottom: 1px solid var(--c-border-cell);\n"
"    padding-bottom: 6px;\n"
"  }\n"
"  .vol-knob .vk-mode-label {\n"
"    font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase;\n"
"    color: var(--c-coffee, #C7B7A5);\n"
"  }\n"
"  .vol-knob .vk-lock {\n"
"    display: inline-flex; align-items: center; gap: 4px;\n"
"    font-size: 9.5px; color: var(--c-text-muted); cursor: pointer;\n"
"  }\n"
"  .vol-knob .vk-field {\n"
"    display: inline-flex; align-items: center; gap: 5px;\n"
"    color: var(--c-text-muted); letter-spacing: 0.3px;\n"
"  }\n"
"  .vol-knob .vk-field input[type=number] {\n"
"    width: 72px; padding: 2px 4px;\n"
"    font-family: \"IBM Plex Mono\", monospace; font-size: 10px;\n"
"    background: var(--c-card, #12100E); color: var(--c-text);\n"
"    border: 1px solid var(--c-border-cell); border-radius: 2px;\n"
"  }\n"
"  .vol-knob .vk-readout {\n"
"    color: var(--c-text-muted); letter-spacing: 0.3px;\n"
"  }\n"
"  .vol-knob .vk-readout b { color: var(--c-text); font-weight: 600; }\n"
"  .vol-knob .vk-readout small { color: var(--c-text-muted); opacity: 0.7; font-size: 8.5px; }\n"
"  .vol-knob .vk-derived {\n"
"    border-top: 1px dashed var(--c-border-cell); padding-top: 6px;\n"
"  }\n"
"  .vol-knob .vk-note {\n"
"    font-size: 8.5px; color: var(--c-text-muted); opacity: 0.8;\n"
"    line-height: 1.35; letter-spacing: 0.2px;\n"
"  }\n"
"  .vol-knob .vk-hidden { display: none; }\n"
"  .vol-knob .vk-readonly { opacity: 0.45; }\n"
"  .vol-knob .vk-readonly input { pointer-events: none; }\n"
"\n"
"  /* State-block (replaces curve canvas; pure data panel) */\n"
)
txt = txt.replace(old, css, 1)
F.write_text(txt)

after = F.read_text()
assert lmd5(after, 74) == B74 and lmd5(after, 1060) == B1060
print("css spliced, blobs intact")
