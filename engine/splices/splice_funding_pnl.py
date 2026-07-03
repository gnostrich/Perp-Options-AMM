# Splice: entry-425 funding column -> line P/L (display/read layer ONLY).
# R6 scope-gate #2 conditions: no duplicate column (band cell already exists),
# sign pin = column displays -Sum(stored trader-pays) = signed P/L effect,
# line P/L = base P/L + that signed value ($-converted by the funding ledger's
# own oracle conversion), disclosure caption/tooltips.
from pathlib import Path
import hashlib

WORK = Path("/tmp/claude-0/-home-user-Perp-Options-AMM/fd6931bc-a813-533f-92eb-a3100ece1b68/scratchpad/work_funding.html")
txt = WORK.read_text()
lines = txt.splitlines(keepends=True)

def lmd5(s, n):
    return hashlib.md5(s.splitlines(keepends=True)[n-1].encode()).hexdigest()

B74, B1060 = lmd5(txt, 74), lmd5(txt, 1060)
assert B74 == "ab663f5c26f2a461c5b0ef1421d0ad74", B74
assert B1060 == "c505b08ad0e4c6b0fb9e64e9679fe291", B1060

def sl(a, b):  # 1-based inclusive line range -> exact string
    return ''.join(lines[a-1:b])

# ---- old anchors, sliced byte-exact from the original file ----
old_th    = sl(1523, 1523)          # <th>Funding</th>
old_note  = sl(1532, 1537)          # pf-units-note div
old_calc  = sl(4639, 4641)          # bandFunding + dollarFigure
old_band  = sl(4662, 4662)          # band-row funding cell
old_comp  = sl(4688, 4688)          # component-row funding cell
old_total = sl(4703, 4704)          # total-row funding cell + dollar cell

# sanity: the anchors are what we think they are
assert "<th>Funding</th>" in old_th
assert "pf-units-note" in old_note and "perp-mark-decided" in old_note
assert "const bandFunding" in old_calc and "const dollarFigure" in old_calc
assert "aggregate funding" in old_band
assert "per-component funding" in old_comp
assert "total funding" in old_total and "pf-dollar-cell" in old_total

new_th = (
    '              <th title="Funding P/L (signed: + = line received, '
    '− = line paid). Line P/L shown includes accrued funding; cash at '
    'close settles ex-funding until the transfer layer ships.">Funding P/L</th>\n'
)

new_note = (
    '        <div class="pf-units-note">\n'
    '          Every row above a TOTAL carries CARVED-PERP units (stage 2). The\n'
    '          single dollar figure is the TOTAL row\'s settlement cell — the one\n'
    '          stage-2 → stage-3 equity multiply. Effective strike = original\n'
    '          strike (OTM) or perp mark (ITM); regime is perp-mark-decided.\n'
    '          Funding column = signed P/L effect (+ received, − paid; the\n'
    '          ledger stores trader-pays, the display negates). Line P/L shown\n'
    '          INCLUDES accrued funding; cash at close settles EX-funding until\n'
    '          the funding transfer layer ships.\n'
    '        </div>\n'
)

new_calc = (
    '    // Funding P/L (operator entry 425). The stored ledger convention is\n'
    '    // TRADER-PAYS (fundingTick: trader_pays = side_sign·f; positive stored\n'
    '    // accrual = this line PAID the pool), so the DISPLAYED signed P/L\n'
    '    // effect is the NEGATED sum: + = line received funding, − = line\n'
    '    // paid. Display-layer convention only — the stored ledger and\n'
    '    // fundingTick are untouched.\n'
    '    const bandFundingStored = comps.reduce((a, c) => a + c.funding, 0);\n'
    '    const bandFundingPnl    = -bandFundingStored;\n'
    '    // Dollar leg of the funding P/L uses the funding ledger\'s own existing\n'
    '    // $ conversion (the fundingTick log line: inflow × oracle) — NOT the\n'
    '    // stage-2→3 equity multiply, because funding accrues on absolute N,\n'
    '    // not per unit of carved equity.\n'
    '    const fundingPnlUsd     = bandFundingPnl * oracleLive;\n'
    '    // The dollar figure: the one stage-2→3 equity multiply, PLUS the\n'
    '    // signed funding accrual (entry 425: funding adds to the line P/L).\n'
    '    // DISCLOSURE: displayed P/L is funding-INCLUSIVE; close-time cash\n'
    '    // settles EX-funding until the funding transfer layer (parked part-2)\n'
    '    // ships — closeBand carries no funding term.\n'
    '    const dollarFigure = b.entry.L0 * raw_net * equityAtClose + fundingPnlUsd;\n'
)

new_band = (
    '        <td title="funding P/L = −Σ leg accruals (signed, carved-perp '
    'units; + = line received, − = line paid; its $ value is included in this '
    'band\'s Total P/L)">${fmtNum(bandFundingPnl, 6)}</td>\n'
)

new_comp = (
    '          <td title="per-component funding P/L (signed, carved-perp units; '
    '+ = received, − = paid; ledger stores trader-pays, display negates)"'
    '>${fmtNum(-c.funding, 6)}</td>\n'
)

new_total = (
    '        <td title="total funding P/L (signed, carved-perp units); $ value = '
    '× live oracle, included in the P/L cell">${fmtNum(bandFundingPnl, 6)}</td>\n'
    '        <td class="pf-dollar-cell" title="band P&L (Δ vs entry, not '
    'walk-away cash) = L₀ · raw_net · carved equity at closure — the single '
    'stage-2→3 equity multiply — PLUS funding P/L × oracle. INCLUDES accrued '
    'funding; cash at close settles ex-funding until the funding transfer layer '
    'ships">${fmtUSD(dollarFigure, 2)}</td>\n'
)

for old, new in [(old_th, new_th), (old_note, new_note), (old_calc, new_calc),
                 (old_band, new_band), (old_comp, new_comp), (old_total, new_total)]:
    assert txt.count(old) == 1, "anchor not unique:\n" + old[:120]
    assert old.endswith('\n') and new.endswith('\n')
    txt = txt.replace(old, new, 1)

WORK.write_text(txt)
after = WORK.read_text()
assert lmd5(after, 74) == B74            # blob line 74 unmoved (edits are all below? no - 1523>74, above 1060 too)
# NOTE: line numbers of blobs: 74 stays 74 (all edits are at lines >=1523);
# line 1060 also unmoved (first edit at 1523). Assert both.
assert lmd5(after, 1060) == B1060
print("SPLICE OK: 6 regions replaced, blobs canonical at 74/1060")
