#!/usr/bin/env python3
"""paper_sync_check.py: detect drift between tex sources, PDF, published repo.

Compares three timestamps for a paper directory (required positional arg):
  1. newest mtime across main.tex + sections/*.tex
  2. main.pdf mtime
  3. HEAD commit date of the published repo checkout (--published PATH);
     skipped with a warning when not provided

RED (exit 1) when either:
  * tex is newer than the PDF by more than 1 day (stale compile), or
  * the PDF is newer than the published HEAD by more than 14 days
    (recompiled locally, never pushed)

A missing main.pdf is RED. A missing main.tex is a hard error (exit 2).
--report-only reports RED but exits 0; hard errors still exit 2.
Thresholds are tunable via --tex-pdf-days and --pdf-pub-days.

All inputs come from CLI args. The shared lab config (lib/labconfig.py)
is loaded to anchor the lab home; a missing config only triggers a warning.
"""

import argparse
import datetime
import subprocess
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

from pathlib import Path  # noqa: E402

DAY = 86400.0


def iso(ts):
    if ts is None:
        return "MISSING"
    return datetime.datetime.fromtimestamp(ts).astimezone().isoformat(timespec="seconds")


def newest_tex_mtime(paper_dir):
    """Newest mtime across main.tex + sections/*.tex, plus the file it came from."""
    main_tex = paper_dir / "main.tex"
    if not main_tex.is_file():
        return None, None
    candidates = [main_tex] + sorted((paper_dir / "sections").glob("*.tex"))
    newest = max(candidates, key=lambda p: p.stat().st_mtime)
    return newest.stat().st_mtime, newest


def published_head_date(published_path):
    """HEAD commit date (epoch seconds) of a git checkout, or None + warning."""
    try:
        out = subprocess.run(
            ["git", "-C", str(published_path), "log", "-1", "--format=%ct"],
            capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.TimeoutExpired) as e:
        print("WARNING: git failed for %s: %s" % (published_path, e),
              file=sys.stderr)
        return None
    if out.returncode != 0 or not out.stdout.strip():
        print("WARNING: %s is not a usable git checkout (%s); published "
              "check skipped" % (published_path, out.stderr.strip()[:120]),
              file=sys.stderr)
        return None
    return float(out.stdout.strip())


def evaluate(tex_mtime, pdf_mtime, published_ts,
             tex_pdf_days=1.0, pdf_pub_days=14.0):
    """Pure comparison logic. Returns (red, reasons)."""
    reasons = []
    if pdf_mtime is None:
        reasons.append("main.pdf is missing: nothing compiled")
    elif tex_mtime - pdf_mtime > tex_pdf_days * DAY:
        reasons.append("tex is newer than main.pdf by %.1f days (threshold %g)"
                       % ((tex_mtime - pdf_mtime) / DAY, tex_pdf_days))
    if published_ts is not None and pdf_mtime is not None:
        if pdf_mtime - published_ts > pdf_pub_days * DAY:
            reasons.append("main.pdf is newer than published HEAD by %.1f days"
                           " (threshold %g)"
                           % ((pdf_mtime - published_ts) / DAY, pdf_pub_days))
    return (len(reasons) > 0), reasons


def _load_lab_config():
    """Load the shared lab config; tolerate a missing config with a warning."""
    try:
        return labconfig.ensure_home()
    except FileNotFoundError as e:
        print("WARNING: %s; continuing with CLI args only" % e,
              file=sys.stderr)
        return {}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("paper_dir",
                    help="paper directory containing main.tex "
                         "(plus sections/ and main.pdf)")
    ap.add_argument("--published", default=None,
                    help="path to a git checkout of the published repo")
    ap.add_argument("--tex-pdf-days", type=float, default=1.0,
                    help="max days tex may lead the PDF (default 1)")
    ap.add_argument("--pdf-pub-days", type=float, default=14.0,
                    help="max days the PDF may lead published HEAD (default 14)")
    ap.add_argument("--report-only", action="store_true",
                    help="report RED but exit 0")
    args = ap.parse_args(argv)

    _load_lab_config()

    paper_dir = Path(args.paper_dir)
    if not paper_dir.is_dir():
        print("ERROR: paper dir not found: %s" % paper_dir, file=sys.stderr)
        return 2

    tex_mtime, tex_file = newest_tex_mtime(paper_dir)
    if tex_mtime is None:
        print("ERROR: %s/main.tex not found" % paper_dir, file=sys.stderr)
        return 2

    pdf_path = paper_dir / "main.pdf"
    pdf_mtime = pdf_path.stat().st_mtime if pdf_path.is_file() else None

    published_ts = None
    if args.published:
        published_ts = published_head_date(args.published)
    else:
        print("WARNING: no --published path given; published-repo check "
              "skipped", file=sys.stderr)

    print("tex newest:     %s  (%s)" % (iso(tex_mtime), tex_file.name))
    print("main.pdf:       %s" % iso(pdf_mtime))
    print("published HEAD: %s" % (iso(published_ts) if published_ts else "SKIPPED"))

    red, reasons = evaluate(tex_mtime, pdf_mtime, published_ts,
                            args.tex_pdf_days, args.pdf_pub_days)
    if red:
        print("VERDICT: RED")
        for r in reasons:
            print("  - " + r)
    else:
        print("VERDICT: GREEN")

    if args.report_only:
        return 0
    return 1 if red else 0


if __name__ == "__main__":
    sys.exit(main())
