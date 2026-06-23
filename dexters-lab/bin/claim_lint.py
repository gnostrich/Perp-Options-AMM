#!/usr/bin/env python3
r"""claim_lint.py: flag quantitative sentences that lack an evidence pointer.

Scans .tex and .md files. Two finding types:

  evidence      a sentence contains a number-bearing quantitative claim and
                its paragraph (blank-line block) has no evidence pointer
  writing_rule  (.md files only) em dash U+2014, en dash U+2013 outside tex
                math spans, or a banned word. Defaults: delve, leverage,
                robust, seamless, cutting-edge, including inflections.

Writing rules are configurable through the lab config (lab.config.json,
resolved by lib/labconfig.py). Optional block, defaults shown:

  "writing_rules": {
    "banned_words": ["delve", "leverage", "robust", "seamless",
                     "cutting-edge"],
    "ban_em_dash": true,
    "ban_en_dash": true
  }

If the jsonschema package is importable the block is validated against a
small schema; otherwise validation is skipped with a warning.

Evidence pointers, searched in the SAME paragraph as the claim:
  \cite / \citep / \citet, \footnote / \footnotemark, a markdown footnote
  marker [^name], a file path containing "results/" or "fit_", or an
  inline (source: ...) tag.

Quantitative claim detectors:
  * percentages: 53.3%, 94.68\%, "20 percent"
  * R-squared: R^2 / R2 / R-squared with a number within 12 characters
  * confidence intervals: "confidence interval" plus a digit, "CI" plus a
    nearby digit, numeric [a, b] intervals with a decimal, "a +/- b"
  * counts: integers with 3 or more digits, with or without thousands
    separators; the tex form 1{,}580 is normalized first
  * ratios: 38x, 6.5x, 38 followed by \times or the U+00D7 sign

Precision-over-recall exclusions (documented heuristics):
  * years: any standalone 4-digit integer in 1900-2099, ISO dates
    YYYY-MM-DD, and year ranges
  * section-style numbers: digits directly after Section/Sec/Table/Tab/
    Figure/Fig/Equation/Eq/Chapter/Appendix/Phase/Step/Tier/Item/Footnote/
    Line/Page/Paragraph, and after the pilcrow or section sign
  * version numbers: v2.4, V1, "version 2", and semver x.y.z
  * tex labels and machinery: arguments of \ref/\eqref/\cref/\autoref/
    \pageref/\label/\cite are deleted before claim detection; \url/\href/
    \texttt/\path/\verb bodies are deleted (paths and identifiers are not
    claims); tex comments are stripped
  * tex tabular/array bodies and display-math blocks (equation, align,
    gather, \[...\]) are not sentences and are skipped for claim detection;
    inline $...$ math is kept so claims like $R^2 = 0.62$ still register
  * markdown: fenced code blocks are skipped entirely; inline code and link
    targets are deleted before claim and writing-rule detection
  * decimals are not counts: 99.66 and 0.617 do not trigger the count rule

Output: a JSON report on stdout with one row per finding
  {file, line, sentence, missing, detail}
plus a human summary on stderr.

Exit codes: 1 if any finding, 0 if clean, 2 on bad config.
--report-only always exits 0 unless the config is bad.
"""

import argparse
import json
import re
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

from pathlib import Path  # noqa: E402

# ---------------------------------------------------------------- evidence

EVIDENCE_PATTERNS = [
    re.compile(r"\\cite[pt]?\*?\s*(?:\[[^\]]*\]\s*)?\{"),
    re.compile(r"\\footnote\b|\\footnotemark\b|\\footnotetext\b"),
    re.compile(r"\[\^[^\]]+\]"),                 # markdown footnote marker
    re.compile(r"results/"),                      # path containing results/
    re.compile(r"\bfit_[\w.\-]*"),               # path containing fit_
    re.compile(r"\(\s*source\s*:[^)]*\)", re.I),  # inline (source: ...) tag
]


def paragraph_has_evidence(raw_text):
    return any(p.search(raw_text) for p in EVIDENCE_PATTERNS)


# ---------------------------------------------------------------- claims

ISO_DATE = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")
SEMVER = re.compile(r"\b\d+\.\d+\.\d+\b")
VERSION = re.compile(r"\b[vV](?:ersion)?\s*\.?\s*\d+(?:\.\d+)*\b")
SECTION_NUM = re.compile(
    r"\b(Sections?|Sec|Tables?|Tab|Figures?|Figs?|Equations?|Eqs?|Chapters?|"
    r"Appendix|Appendices|Phases?|Steps?|Tiers?|Items?|Footnotes?|Lines?|"
    r"Pages?|Paragraphs?)\.?[~\s]*\d+(?:\.\d+)*",
    re.I,
)
MARK_NUM = re.compile(r"[¶§]\s*[\d.]+")  # pilcrow / section sign

CLAIM_PATTERNS = [
    ("percentage", re.compile(r"\d+(?:\.\d+)?\s*(?:\\%|%|percent\b)")),
    ("r_squared", re.compile(r"(?:\bR\^\{?2\}?|R²|\bR2\b|\bR-?squared\b)\D{0,12}?\d")),
    ("confidence_interval", re.compile(
        r"\bCI\b\D{0,12}\d"
        r"|\[\s*-?\d+\.\d+\s*,\s*-?\d+(?:\.\d+)?\s*\]"
        r"|\[\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+\.\d+\s*\]"
        r"|\d\s*(?:±|\\pm)\s*\d")),
    ("count", re.compile(r"(?<![\w.])(?:\d{1,3}(?:,\d{3})+|\d{3,})(?!\.?\d)(?!\w)")),
    ("ratio", re.compile(r"\b\d+(?:\.\d+)?\s*(?:x\b|×|\\times\b)")),
]


def find_claims(sentence):
    """Return [(kind, snippet)] for quantitative claims after exclusions."""
    s = sentence.replace("{,}", ",")
    s = ISO_DATE.sub(" ", s)
    s = SEMVER.sub(" ", s)
    s = VERSION.sub(" ", s)
    s = SECTION_NUM.sub(lambda m: m.group(1), s)
    s = MARK_NUM.sub(" ", s)
    claims = []
    for kind, pat in CLAIM_PATTERNS:
        for m in pat.finditer(s):
            text = m.group(0).strip()
            if kind == "count":
                bare = text.replace(",", "")
                if bare.isdigit() and 1900 <= int(bare) <= 2099:
                    continue  # treat as a year
            claims.append((kind, text))
    if "confidence interval" in s.lower() and re.search(r"\d", s):
        claims.append(("confidence_interval", "confidence interval"))
    return claims


# ---------------------------------------------------------------- cleaning

TEX_DROP_CMDS = re.compile(
    r"\\(?:cite[pt]?\*?|ref|eqref|cref|Cref|autoref|pageref|label|url|"
    r"texttt|path|nameref)\s*(?:\[[^\]]*\]\s*)?\{[^{}]*\}"
)
TEX_HREF = re.compile(r"\\href\{[^{}]*\}")
TEX_VERB = re.compile(r"\\verb(.)(.*?)\1")
TEX_COMMENT = re.compile(r"(?<!\\)%.*$")

TEX_SKIP_BEGIN = re.compile(
    r"\\begin\{(tabular\*?|array|longtable|matrix|pmatrix|bmatrix|"
    r"equation\*?|align\*?|eqnarray\*?|displaymath|gather\*?|multline\*?)\}")
TEX_SKIP_END = re.compile(
    r"\\end\{(tabular\*?|array|longtable|matrix|pmatrix|bmatrix|"
    r"equation\*?|align\*?|eqnarray\*?|displaymath|gather\*?|multline\*?)\}")

MD_INLINE_CODE = re.compile(r"`[^`]*`")
MD_LINK_TARGET = re.compile(r"\]\([^)]*\)")
MD_BARE_URL = re.compile(r"https?://\S+")
MD_FENCE = re.compile(r"^\s*(```|~~~)")
MATH_SPAN = re.compile(r"\$\$.*?\$\$|\$[^$]*\$")


def load_lines(path, kind):
    """Return [(lineno, raw, claim_text)] with structural exclusions applied.

    raw keeps evidence pointers intact; claim_text is the version used for
    claim detection (labels, code, paths, table and display-math bodies
    removed).
    """
    out = []
    skip_depth = 0
    in_fence = False
    in_display = False
    for i, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        raw = line
        claim = line
        if kind == "tex":
            raw = TEX_COMMENT.sub("", raw)
            claim = raw
            if TEX_SKIP_BEGIN.search(claim):
                skip_depth += 1
            if r"\[" in claim and not in_display:
                in_display = True
            blocked = skip_depth > 0 or in_display
            if TEX_SKIP_END.search(claim) and skip_depth > 0:
                skip_depth -= 1
            if r"\]" in claim and in_display:
                in_display = False
            if blocked:
                claim = ""
            else:
                claim = TEX_DROP_CMDS.sub(" ", claim)
                claim = TEX_HREF.sub(" ", claim)
                claim = TEX_VERB.sub(" ", claim)
        else:  # md
            if MD_FENCE.match(line):
                in_fence = not in_fence
                claim = ""
            elif in_fence:
                claim = ""
            else:
                claim = MD_INLINE_CODE.sub(" ", claim)
                claim = MD_LINK_TARGET.sub("]", claim)
                claim = MD_BARE_URL.sub(" ", claim)
        out.append((i, raw, claim))
    return out


# ---------------------------------------------------------------- sentences

ABBREVS = ["e.g.", "i.e.", "et al.", "vs.", "cf.", "Fig.", "Figs.", "Eq.",
           "Eqs.", "Sec.", "Tab.", "No.", "approx.", "Dr.", "Mr.", "Ms.",
           "U.S.", "a.m.", "p.m.", "resp."]
SENT_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\\(\"'$`])")


def split_sentences(parts):
    """parts: [(lineno, text)]. Return [(lineno, sentence)]."""
    joined = ""
    offsets = []  # (start_offset, lineno)
    for lineno, text in parts:
        if joined:
            joined += " "
        offsets.append((len(joined), lineno))
        joined += text
    protected = joined
    for a in ABBREVS:
        protected = protected.replace(a, a.replace(".", "\x00"))
    bounds = [0]
    for m in SENT_SPLIT.finditer(protected):
        bounds.append(m.end())
    bounds.append(len(protected))
    sentences = []
    for start, end in zip(bounds, bounds[1:]):
        text = protected[start:end].replace("\x00", ".").strip()
        if not text:
            continue
        lineno = offsets[0][1]
        for off, ln in offsets:
            if off <= start:
                lineno = ln
            else:
                break
        sentences.append((lineno, text))
    return sentences


# ---------------------------------------------------------------- writing rules

DEFAULT_BANNED_WORDS = ["delve", "leverage", "robust", "seamless",
                        "cutting-edge"]
EM_DASH = "—"
EN_DASH = "–"

WRITING_RULES_SCHEMA = {
    "type": "object",
    "properties": {
        "banned_words": {"type": "array", "items": {"type": "string"}},
        "ban_em_dash": {"type": "boolean"},
        "ban_en_dash": {"type": "boolean"},
    },
}


def _banned_word_pattern(word):
    """One regex alternative for a banned word, with common inflections.

    Hyphens also match a space (cutting-edge covers "cutting edge").
    Words ending in e drop the e before verbal suffixes (delve -> delving).
    """
    word = str(word).strip().lower()
    if not word:
        return None
    esc = "[-\\s]".join(re.escape(p) for p in word.split("-"))
    if word.endswith("e"):
        return esc[:-1] + "(?:e|es|ed|ing)"
    return esc + "(?:s|es|ed|ing|ly|ness)?"


def compile_banned_words(words):
    parts = [p for p in (_banned_word_pattern(w) for w in words) if p]
    if not parts:
        return None
    return re.compile(r"\b(?:" + "|".join(parts) + r")\b", re.I)


def build_writing_rules(cfg=None):
    """Resolve the writing_rules config block. Defaults keep the classic
    behavior: ban em dash, ban en dash outside math, ban the default words."""
    block = (cfg or {}).get("writing_rules") or {}
    words = block.get("banned_words", DEFAULT_BANNED_WORDS)
    return {
        "ban_em_dash": bool(block.get("ban_em_dash", True)),
        "ban_en_dash": bool(block.get("ban_en_dash", True)),
        "banned_re": compile_banned_words(words),
    }


def validate_writing_rules(block):
    """Return an error string for a bad writing_rules block, else None.

    Uses jsonschema when importable; otherwise warns, then falls back to
    minimal stdlib type checks.
    """
    try:
        import jsonschema
    except ImportError:
        print("WARNING: jsonschema not installed; schema validation of "
              "writing_rules skipped", file=sys.stderr)
        jsonschema = None
    if jsonschema is not None:
        try:
            jsonschema.validate(block, WRITING_RULES_SCHEMA)
        except jsonschema.ValidationError as e:
            return e.message
        return None
    # stdlib fallback: shape checks only
    if not isinstance(block, dict):
        return "writing_rules must be an object"
    if "banned_words" in block and not isinstance(block["banned_words"], list):
        return "writing_rules.banned_words must be a list of strings"
    for key in ("ban_em_dash", "ban_en_dash"):
        if key in block and not isinstance(block[key], bool):
            return "writing_rules.%s must be a boolean" % key
    return None


def writing_rule_findings(path, lines, rules=None):
    rules = rules or build_writing_rules()
    findings = []
    for lineno, _raw, claim in lines:
        if not claim:
            continue  # fenced code already excluded
        if rules["ban_em_dash"] and EM_DASH in claim:
            findings.append(_finding(path, lineno, claim, "writing_rule",
                                     "em dash U+2014"))
        no_math = MATH_SPAN.sub(" ", claim)
        if rules["ban_en_dash"] and EN_DASH in no_math:
            findings.append(_finding(path, lineno, claim, "writing_rule",
                                     "en dash U+2013 outside tex math"))
        if rules["banned_re"]:
            for m in rules["banned_re"].finditer(no_math):
                findings.append(_finding(path, lineno, claim, "writing_rule",
                                         "banned word: " + m.group(0).lower()))
    return findings


def _finding(path, lineno, sentence, missing, detail):
    return {"file": str(path), "line": lineno,
            "sentence": sentence.strip()[:300], "missing": missing,
            "detail": detail}


# ---------------------------------------------------------------- driver

def lint_file(path, rules=None):
    suffix = path.suffix.lower()
    if suffix == ".tex":
        kind = "tex"
    elif suffix in (".md", ".markdown"):
        kind = "md"
    else:
        print("WARNING: skipping %s (only .tex and .md are supported)" % path,
              file=sys.stderr)
        return []
    lines = load_lines(path, kind)
    findings = []

    # paragraphs = blank-line blocks
    para = []
    paragraphs = []
    for lineno, raw, claim in lines:
        if raw.strip() == "":
            if para:
                paragraphs.append(para)
            para = []
        else:
            para.append((lineno, raw, claim))
    if para:
        paragraphs.append(para)

    for para in paragraphs:
        raw_text = " ".join(raw for _ln, raw, _c in para)
        has_evidence = paragraph_has_evidence(raw_text)
        if has_evidence:
            continue
        sentences = split_sentences([(ln, c) for ln, _raw, c in para if c.strip()])
        for lineno, sentence in sentences:
            claims = find_claims(sentence)
            if claims:
                detail = "; ".join("%s: %s" % (k, t) for k, t in claims[:4])
                findings.append(_finding(path, lineno, sentence, "evidence",
                                         detail))

    if kind == "md":
        findings.extend(writing_rule_findings(path, lines, rules))
    findings.sort(key=lambda f: f["line"])
    return findings


def _load_lab_config():
    """Load the shared lab config; tolerate a missing config with a warning."""
    try:
        return labconfig.ensure_home()
    except FileNotFoundError as e:
        print("WARNING: %s; using default writing rules" % e, file=sys.stderr)
        return {}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("files", nargs="+",
                    help=".tex or .md files, or directories to recurse")
    ap.add_argument("--report-only", action="store_true",
                    help="always exit 0, report findings only")
    args = ap.parse_args(argv)

    cfg = _load_lab_config()
    block = cfg.get("writing_rules")
    if block is not None:
        err = validate_writing_rules(block)
        if err:
            print("ERROR: invalid writing_rules config: %s" % err,
                  file=sys.stderr)
            return 2
    rules = build_writing_rules(cfg)

    # Expand arguments: a file is linted directly; a directory recurses into
    # every .tex/.md under it (sorted, for stable output).
    targets = []
    bad_args = []
    for f in args.files:
        path = Path(f)
        if path.is_file():
            targets.append(path)
        elif path.is_dir():
            found = sorted(p for ext in ("*.tex", "*.md")
                           for p in path.rglob(ext) if p.is_file())
            if not found:
                print("WARNING: no .tex or .md under directory: %s" % path,
                      file=sys.stderr)
            targets.extend(found)
        else:
            bad_args.append(str(path))
            print("ERROR: not a file or directory: %s" % path, file=sys.stderr)

    # Fail loudly: a path that matches nothing is an error, not a silent skip
    # (a mistyped path that exits 0 is the trap we are closing).
    if bad_args:
        return 2

    all_findings = []
    n_scanned = 0
    for path in targets:
        n_scanned += 1
        all_findings.extend(lint_file(path, rules))

    counts = {"evidence": 0, "writing_rule": 0}
    for f in all_findings:
        counts[f["missing"]] += 1
    report = {"files_scanned": n_scanned, "counts": counts,
              "findings": all_findings}
    print(json.dumps(report, indent=2))

    print("claim_lint: %d file(s), %d finding(s) "
          "(%d missing evidence, %d writing rule)" %
          (n_scanned, len(all_findings), counts["evidence"],
           counts["writing_rule"]), file=sys.stderr)
    per_file = {}
    for f in all_findings:
        per_file[f["file"]] = per_file.get(f["file"], 0) + 1
    for name, n in sorted(per_file.items()):
        print("  %s: %d" % (name, n), file=sys.stderr)

    if args.report_only:
        return 0
    return 1 if all_findings else 0


if __name__ == "__main__":
    sys.exit(main())
