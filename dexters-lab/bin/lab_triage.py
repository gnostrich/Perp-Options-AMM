#!/usr/bin/env python3
"""lab_triage.py: turn a nightly re-attack report into errata work items.

The post-publication monitor (bin/lab_monitor.sh) re-attacks your OWN
published claims every night and drafts an adversarial-attack report. This
tool parses that report, extracts findings, dedupes them against a state
file, and appends genuinely new weakened or refuted findings to the errata
queue. The queue only grows when the monitor finds something new. The same
finding re-found tomorrow night is suppressed.

Report schema (the normalized review schema this kit already uses):
  Sections look like '### N. [VERDICT] category'. Under each section, fields:
    - **Claim**:        the published claim being attacked
    - **Result**:       a line carrying confidence (0-1 or 0-100, e.g.
                        'confidence: 0.82' or 'confidence: 82%')
    - **claim_status**: upheld | weakened | refuted (an alternative to the
                        [VERDICT] in the heading; either may carry the verdict)
    - **Evidence**:     indented bullets
    - **Citations**:    indented bullets
  weakened and refuted are actionable; upheld is ignored.

Dedupe: every finding is keyed by a hash of its normalized claim text and
recorded in a state file (default cfg lab_home + '/monitor_state.json'). A
state entry can be pre-seeded as known and RESOLVED so a fixed issue is not
re-queued.

Errata entry schema (one fenced block per finding):
  {claim_id, attack, evidence, claim_status, resolution: '', status: OPEN}

Usage:
    lab_triage.py <report.md> [--queue path] [--state path]
                  [--floor 0.7] [--dry-run]

Idempotent: a second run on the same report adds nothing.
Stdlib only. Paths resolve via the shared lab config (lib/labconfig.py).
"""

import argparse
import hashlib
import json
import re
import sys
import textwrap
import pathlib
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

# Verdicts that represent an attack the published claim must answer.
ACTIONABLE_VERDICTS = {"REFUTED", "WEAKENED"}
DEFAULT_FLOOR = 0.7

# Normalized-claim prefix length used for hashing. Reports may truncate claim
# text; hashing a 160-char normalized prefix keeps the key stable across small
# tail differences so the same finding is not re-queued night after night.
HASH_PREFIX_CHARS = 160

SECTION_RE = re.compile(r"^#{2,4}\s+(\d+)\.\s*\[([^\]]*)\]\s*(\S.*?)\s*$")
FIELD_RE = re.compile(r"^\s*-\s+\*\*([A-Za-z _]+)\*\*:\s*(.*)$")
BULLET_RE = re.compile(r"^\s{2,}-\s+(.*)$")
CONF_PCT_RE = re.compile(r"confidence\D{0,4}([0-9]+(?:\.[0-9]+)?)\s*%", re.IGNORECASE)
CONF_FRAC_RE = re.compile(r"confidence\D{0,4}(0?\.[0-9]+|1\.0+|[01])\b", re.IGNORECASE)
# Bare numbers, used only when the field name already says it is a confidence.
BARE_PCT_RE = re.compile(r"([0-9]+(?:\.[0-9]+)?)\s*%")
BARE_NUM_RE = re.compile(r"(0?\.[0-9]+|1\.0+|[01]|[0-9]{1,3}(?:\.[0-9]+)?)")

VERDICT_WORDS = {"upheld", "weakened", "refuted"}


def normalize_claim(text):
    """Lowercase, collapse every non-alphanumeric run to one space, cut to prefix."""
    t = re.sub(r"[^a-z0-9]+", " ", text.lower())
    t = " ".join(t.split())
    return t[:HASH_PREFIX_CHARS]


def claim_hash(text):
    """16-hex-char stable key for a claim."""
    return hashlib.sha256(normalize_claim(text).encode("utf-8")).hexdigest()[:16]


def parse_confidence_value(text):
    """Read a 0..1 confidence out of free text. Percent wins over fraction."""
    m = CONF_PCT_RE.search(text)
    if m:
        return float(m.group(1)) / 100.0
    m = CONF_FRAC_RE.search(text)
    if m:
        return float(m.group(1))
    return None


def parse_confidence_field(value):
    """Read a confidence from a dedicated confidence field value.

    The field name already declares it is a confidence, so a bare number is
    accepted. A value > 1 is read as a 0-100 percentage, else as a fraction.
    """
    m = BARE_PCT_RE.search(value)
    if m:
        return float(m.group(1)) / 100.0
    m = BARE_NUM_RE.search(value)
    if m:
        num = float(m.group(1))
        return num / 100.0 if num > 1 else num
    return None


def parse_report(report_text):
    """Parse '### N. [VERDICT] category' sections into finding dicts."""
    findings = []
    current = None
    list_field = None
    for line in report_text.splitlines():
        sec = SECTION_RE.match(line)
        if sec:
            if current is not None:
                findings.append(current)
            current = {
                "number": int(sec.group(1)),
                "verdict": sec.group(2).strip(),
                "category": sec.group(3).strip(),
                "claim": "",
                "confidence": None,
                "evidence": [],
                "citations": [],
            }
            list_field = None
            continue
        if current is None:
            continue
        # A '## ' heading (not our numbered section form) ends the current block.
        if line.startswith("## ") and not SECTION_RE.match(line):
            findings.append(current)
            current = None
            list_field = None
            continue
        field = FIELD_RE.match(line)
        if field:
            name = field.group(1).strip().lower()
            value = field.group(2).strip()
            list_field = None
            if name == "claim":
                current["claim"] = value
            elif name == "result":
                conf = parse_confidence_value(value)
                if conf is not None:
                    current["confidence"] = conf
            elif name == "confidence":
                conf = parse_confidence_field(value)
                if conf is not None:
                    current["confidence"] = conf
            elif name == "claim_status":
                v = value.strip().lower()
                if v in VERDICT_WORDS:
                    current["verdict"] = v
            elif name == "evidence":
                list_field = "evidence"
                if value:
                    current["evidence"].append(value)
            elif name == "citations":
                list_field = "citations"
                if value:
                    current["citations"].append(value)
            continue
        if list_field:
            bullet = BULLET_RE.match(line)
            if bullet:
                current[list_field].append(bullet.group(1).strip())
    if current is not None:
        findings.append(current)
    return findings


def actionable(finding, floor):
    """True for weakened or refuted findings at or above the confidence floor."""
    verdict = finding["verdict"].upper()
    if verdict not in ACTIONABLE_VERDICTS:
        return False
    conf = finding["confidence"]
    if conf is None:
        return False
    return conf >= floor


def load_state(state_path):
    """Load state, creating it in memory if missing.

    State shape: {"version": 1, "known": {hash: {...}}}. A 'known' entry may be
    pre-seeded by hand (with status RESOLVED) so a fixed issue is suppressed.
    """
    state = {"version": 1, "known": {}}
    if state_path.exists():
        loaded = json.loads(state_path.read_text(encoding="utf-8"))
        if isinstance(loaded, dict):
            state["version"] = loaded.get("version", 1)
            state["known"] = loaded.get("known", {}) or {}
    return state


def save_state(state, state_path):
    state["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(
        json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )


def _field(key, value):
    """One aligned 'key:  value' field, wrapped to the queue's house style."""
    label = "{}:".format(key).ljust(15)
    if not value:
        return label.rstrip()
    wrapped = textwrap.wrap(
        value, width=96, initial_indent=label, subsequent_indent=" " * 15
    )
    return "\n".join(wrapped)


def format_queue_entry(claim_id, finding, report_name):
    """One errata entry, fenced-block schema matching the errata queue."""
    conf = finding["confidence"] or 0.0
    evidence_bits = [
        "monitor/{} item {} ({} {:.0f}%)".format(
            report_name,
            finding["number"],
            finding["verdict"].upper(),
            conf * 100,
        )
    ]
    evidence_bits.extend(finding["evidence"][:3])
    if finding["citations"]:
        evidence_bits.append("citations: " + "; ".join(finding["citations"][:4]))
    attack = "{}: {}".format(finding["category"], finding["claim"][:300]).strip(": ")
    lines = [
        "```",
        _field("claim_id", claim_id),
        _field("attack", attack),
        _field("evidence", "; ".join(evidence_bits)),
        _field("claim_status", finding["verdict"].lower()),
        _field("resolution", ""),
        _field("status", "OPEN"),
        "```",
        "",
    ]
    return "\n".join(lines)


QUEUE_HEADER = """# Errata Queue

Adversarial findings against your OWN published claims, surfaced by the
nightly post-publication monitor. New entries are appended by
bin/lab_triage.py and stay OPEN until a human fills resolution: and flips
status: to RESOLVED.
"""


def append_to_queue(entries, queue_path):
    queue_path.parent.mkdir(parents=True, exist_ok=True)
    if queue_path.exists():
        existing = queue_path.read_text(encoding="utf-8")
        if existing.endswith("\n\n"):
            sep = ""
        elif existing.endswith("\n"):
            sep = "\n"
        else:
            sep = "\n\n"
        queue_path.write_text(existing + sep + "\n".join(entries), encoding="utf-8")
    else:
        queue_path.write_text(QUEUE_HEADER + "\n" + "\n".join(entries), encoding="utf-8")


def triage(report_path, queue_path, state_path, floor=DEFAULT_FLOOR, dry_run=False):
    """Run one triage pass. Returns the list of newly queued claim_ids."""
    report_text = report_path.read_text(encoding="utf-8")
    findings = parse_report(report_text)
    state = load_state(state_path)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    report_name = report_path.name

    candidates = [f for f in findings if actionable(f, floor)]
    # Within-report dedupe: same claim attacked twice keeps the highest confidence.
    by_hash = {}
    for f in candidates:
        h = claim_hash(f["claim"])
        prev = by_hash.get(h)
        if prev is None or (f["confidence"] or 0) > (prev["confidence"] or 0):
            by_hash[h] = f

    new_entries = []
    queued_ids = []
    suppressed = 0
    for h, f in sorted(by_hash.items(), key=lambda kv: kv[1]["number"]):
        if h in state["known"]:
            suppressed += 1
            continue
        claim_id = "ERR-{}".format(h)
        new_entries.append(format_queue_entry(claim_id, f, report_name))
        queued_ids.append(claim_id)
        state["known"][h] = {
            "claim_id": claim_id,
            "claim_excerpt": f["claim"][:160],
            "verdict": f["verdict"].lower(),
            "confidence": f["confidence"],
            "first_seen_report": report_name,
            "first_seen": now,
            "queued": True,
            "status": "OPEN",
        }

    print(
        "lab_triage: report={} findings={} actionable={} unique={} "
        "suppressed_known={} new_queued={}{}".format(
            report_name,
            len(findings),
            len(candidates),
            len(by_hash),
            suppressed,
            len(queued_ids),
            " (dry-run, no writes)" if dry_run else "",
        )
    )
    for cid in queued_ids:
        print("  queued: {}".format(cid))

    if not dry_run:
        if new_entries:
            append_to_queue(new_entries, queue_path)
        save_state(state, state_path)
    return queued_ids


def _defaults():
    """Resolve default queue and state paths from the shared lab config."""
    try:
        cfg = labconfig.ensure_home()
    except FileNotFoundError as exc:
        print("lab_triage: WARNING: {}; pass --queue and --state".format(exc),
              file=sys.stderr)
        return None, None
    home = Path(cfg["lab_home"])
    return str(home / "ERRATA_QUEUE.md"), str(home / "monitor_state.json")


USAGE = """lab_triage.py: triage a post-publication re-attack report into the errata queue.

Usage:
  lab_triage.py <report.md> [--queue path] [--state path] [--floor 0.7] [--dry-run]

Parses a normalized adversarial-attack report (### N. [VERDICT] category
sections with Claim/Result/confidence/claim_status/Evidence/Citations),
extracts weakened and refuted findings at or above the confidence floor,
dedupes them against a state file, and appends genuinely new findings to the
errata queue (schema {claim_id, attack, evidence, claim_status, resolution,
status: OPEN}). Idempotent: a second run on the same report adds nothing.
Defaults: queue cfg lab_home/ERRATA_QUEUE.md, state cfg lab_home/monitor_state.json."""


def main(argv=None):
    if argv is None:
        argv = sys.argv[1:]
    if argv and argv[0] in ("-h", "--help"):
        print(USAGE)
        return 0

    def_queue, def_state = _defaults()
    parser = argparse.ArgumentParser(
        description="Triage a post-publication re-attack report into the errata queue.",
        add_help=False,
    )
    parser.add_argument("report", help="Path to an adversarial-attack report markdown file")
    parser.add_argument("--queue", default=def_queue, help="Errata queue md path")
    parser.add_argument("--state", default=def_state, help="Dedupe state json path")
    parser.add_argument("--floor", type=float, default=DEFAULT_FLOOR,
                        help="Confidence floor 0-1 (default 0.7)")
    parser.add_argument("--dry-run", action="store_true", help="Report, but write nothing")
    args = parser.parse_args(argv)

    if not args.queue or not args.state:
        print("lab_triage: ERROR: could not resolve queue/state defaults; "
              "pass --queue and --state explicitly", file=sys.stderr)
        return 2

    report_path = Path(args.report)
    if not report_path.exists():
        print("lab_triage: report not found: {}".format(report_path), file=sys.stderr)
        return 2
    try:
        triage(report_path, Path(args.queue), Path(args.state),
               floor=args.floor, dry_run=args.dry_run)
    except Exception as exc:  # fail loud, not silent
        print("lab_triage: ERROR: {}".format(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
