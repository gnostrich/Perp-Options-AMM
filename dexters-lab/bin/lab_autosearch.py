#!/usr/bin/env python3
"""lab_autosearch.py: state-aware discovery planner for Dexter's Lab.

The literature lane (lab_lit.sh) scans a fixed queue. This tool closes a
different gap: it reads the lab's CURRENT state, derives what the lab SHOULD
be searching for, and proposes new work without inventing relevance numbers.

Three subcommands, all stdlib, all deterministic:

  read-state  Load the RQ registry (cfg registry_path) and pull every OPEN
              hypothesis (CANDIDATE / SCOPED / RUNNING / PARTIAL) with its
              title and claim. Optionally read a roadmap markdown (--roadmap
              or cfg autosearch.roadmap_path) for recent active-track lines.
              Emit a CurrentIntentions object:
                {open_questions: [...], active_tracks: [...], gaps: [...],
                 sources_read: [...], sources_missing: [...]}

  queries     Turn intentions into a deduped list of discovery queries: one
              per open question and one per active track. Each query carries
              its source rq_id (or "roadmap"/"gap" for non-registry sources)
              so a discovery can be traced back to the state that motivated
              it. Emit JSON: {generated, count, queries: [...]}.

  propose     Read a discoveries JSON produced by the grounded .sh step
                {query, source_rq_id, findings: [{title, url, why_relevant,
                 kind: paper|agent|tool|dataset}]}
              and append NEW rows. Literature findings (kind=paper|dataset)
              extend the lit queue (cfg lab_home/lit_queue.json) in the
              lit_queue format. Agent/tool/dataset/paper findings are logged
              to a discoveries log (cfg lab_home/discoveries.jsonl) with full
              provenance. Relevance is the model's prose `why_relevant`; we
              NEVER write a fabricated numeric score. Dedupe against what is
              already queued (by slug/topic) and logged (by url).

The no-fabricated-scores rule is load-bearing. A discovery's relevance is
recorded as prose only. Promotion to a scored entry is a separate, human or
evidence-backed step.

Registry and roadmap shapes:
- registry: the rq_registry.json written by bin/rq_compile.py (see
  templates/rq_registry.schema.json). Entries have rq_id, status, title,
  claim, track.
- roadmap: any markdown. We pull H2/H3 headings that signal an active build
  thread (a shipped / in-progress / next / agent / build marker).

Paths resolve through the shared lab config (lib/labconfig.py). --registry,
--roadmap, --out, and --discoveries override the config defaults.

Usage:
  lab_autosearch.py read-state  [--registry PATH] [--roadmap PATH] [--out PATH]
  lab_autosearch.py queries     [--registry PATH] [--roadmap PATH] [--out PATH]
  lab_autosearch.py propose --discoveries PATH [--queue PATH] [--log PATH]

Exit codes: 0 ok, 2 usage/bad input, 1 missing config/file.
"""
from __future__ import annotations

import argparse
import datetime
import json
import re
import sys
import pathlib
from pathlib import Path

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

# Registry statuses that mean "still open, still worth searching around".
OPEN_STATUSES = ("CANDIDATE", "SCOPED", "RUNNING", "PARTIAL")

# Finding kinds the grounded step may return.
VALID_KINDS = ("paper", "agent", "tool", "dataset")
# Which kinds extend the literature queue (deep-read lane material).
LIT_KINDS = ("paper", "dataset")


# ----------------------------------------------------------------- config

def _load_cfg():
    """Load the shared lab config; raise a clean error if none is found."""
    try:
        return labconfig.ensure_home()
    except FileNotFoundError as e:
        print(f"lab_autosearch: ERROR: {e}", file=sys.stderr)
        raise SystemExit(1)


def _registry_path(cfg, override):
    if override:
        return Path(override)
    return Path(cfg["registry_path"])


def _roadmap_path(cfg, override):
    if override:
        return Path(override)
    rp = (cfg.get("autosearch") or {}).get("roadmap_path")
    if rp:
        # roadmap_path may use ~ and {lab_home}; expand the same way labconfig does.
        rp = rp.replace("{lab_home}", str(cfg["lab_home"]))
        return Path(rp).expanduser()
    return None


def _queue_path(cfg, override):
    if override:
        return Path(override)
    return Path(cfg["lab_home"]) / "lit_queue.json"


def _log_path(cfg, override):
    if override:
        return Path(override)
    return Path(cfg["lab_home"]) / "discoveries.jsonl"


# ----------------------------------------------------------------- read-state

def _read_registry_open(registry_path):
    """Return (open_entries, gaps). open_entries are dicts with rq_id, status,
    title, claim, track. gaps are CANDIDATE entries with no plan_path yet:
    scoped-but-unstarted work the lab should be searching prior art for.

    A missing or unparseable registry degrades to empty lists; it never raises.
    """
    if not registry_path.exists():
        return [], []
    try:
        doc = json.loads(registry_path.read_text(encoding="utf-8"))
    except Exception:
        return [], []
    entries = doc.get("entries") if isinstance(doc, dict) else None
    if not isinstance(entries, list):
        return [], []
    open_entries = []
    gaps = []
    for e in entries:
        if not isinstance(e, dict):
            continue
        status = str(e.get("status") or "").upper()
        if status not in OPEN_STATUSES:
            continue
        row = {
            "rq_id": str(e.get("rq_id") or "").strip(),
            "status": status,
            "title": str(e.get("title") or "").strip(),
            "claim": str(e.get("claim") or "").strip(),
            "track": str(e.get("track") or "").strip(),
        }
        if not row["rq_id"]:
            continue
        open_entries.append(row)
        # A CANDIDATE with no plan is a gap: unscoped, no prior-art done.
        if status == "CANDIDATE" and not e.get("plan_path"):
            label = row["title"] or row["claim"][:80]
            if label:
                gaps.append(f"{row['rq_id']}: {label}")
    return open_entries, gaps


_HEADING = re.compile(r"^(#{2,3})\s+(.*?)\s*$")
_TRACK_KEEP = re.compile(
    r"(SHIPPED|shipped|in progress|IN PROGRESS|next|NEXT|roadmap|Roadmap|"
    r"agent|Agent|build|Build|upgrade|track|Track|phase|Phase)"
)


def _read_roadmap_tracks(roadmap_path, limit=12):
    """Pull H2/H3 headings that signal an active build thread. Heuristic, the
    same shape as the literature lane uses. A missing file degrades to []."""
    if roadmap_path is None or not roadmap_path.exists():
        return []
    tracks = []
    for line in roadmap_path.read_text(errors="ignore").splitlines():
        m = _HEADING.match(line.strip())
        if not m:
            continue
        title = m.group(2)
        # Strip leading non-word glyphs (emoji / status flags) and trailing parens.
        title = re.sub(r"\s*\([^)]*\)\s*$", "", title)
        title = re.sub(r"^[^A-Za-z0-9]+", "", title).strip()
        if not title or not _TRACK_KEEP.search(title):
            continue
        if title not in tracks:
            tracks.append(title)
        if len(tracks) >= limit:
            break
    return tracks


def read_state(registry_path, roadmap_path):
    """Return a CurrentIntentions-like dict from the registry + roadmap.

    open_questions : one row per OPEN registry hypothesis (rq_id/title/claim)
    active_tracks  : heading-derived build threads from the roadmap
    gaps           : unscoped CANDIDATE rows (no plan yet) needing prior art
    sources_read / sources_missing : provenance of which state was available
    """
    open_entries, gaps = _read_registry_open(registry_path)
    tracks = _read_roadmap_tracks(roadmap_path)

    sources_read = []
    sources_missing = []
    (sources_read if registry_path.exists() else sources_missing).append(
        str(registry_path))
    if roadmap_path is not None:
        (sources_read if roadmap_path.exists() else sources_missing).append(
            str(roadmap_path))

    return {
        "generated": datetime.date.today().isoformat(),
        "open_questions": open_entries,
        "active_tracks": tracks,
        "gaps": gaps,
        "sources_read": sources_read,
        "sources_missing": sources_missing,
    }


# ----------------------------------------------------------------- queries

def _norm_query_text(s):
    """Collapse whitespace for dedup comparison. Case-insensitive."""
    return re.sub(r"\s+", " ", str(s)).strip().lower()


def intentions_to_queries(state):
    """Turn a read-state dict into a deduped list of discovery queries.

    One query per open question (prior-art + methods angle, tagged with the
    rq_id) and one per active track (tagged "roadmap"). Gaps that did not
    already surface as an open question add a query tagged "gap". Dedup is on
    the normalized query text so two rows never search the same string.
    """
    queries = []
    seen = set()        # normalized query strings already emitted
    seen_labels = set()  # normalized open-question labels already covered

    def add(text, source_rq_id):
        text = re.sub(r"\s+", " ", str(text)).strip()
        if not text:
            return
        key = _norm_query_text(text)
        if key in seen:
            return
        seen.add(key)
        queries.append({"query": text, "source_rq_id": source_rq_id})

    for oq in state.get("open_questions") or []:
        label = (oq.get("title") or oq.get("claim") or "").strip()
        if not label:
            continue
        seen_labels.add(_norm_query_text(label))
        add(f"recent prior art and methods for: {label}", oq.get("rq_id") or "")

    for track in state.get("active_tracks") or []:
        add(f"recent papers, agents, and tools relevant to: {track}", "roadmap")

    for gap in state.get("gaps") or []:
        # gap is "RQID: label"; recover the rq_id when present.
        rq_id, _, label = str(gap).partition(":")
        label = (label or gap).strip()
        rq_id = rq_id.strip() if label != gap else "gap"
        # A gap whose label is already an open question is the same item from a
        # different angle; the open-question query covers it. Skip the redundant
        # gap query so one item never spawns two near-identical searches.
        if _norm_query_text(label) in seen_labels:
            continue
        add(f"prior art for unscoped question: {label}", rq_id or "gap")

    return queries


# ----------------------------------------------------------------- propose

def _slug(s):
    s = re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")
    return s[:64] or "discovery"


def _load_queue(queue_path):
    """Load the lit queue, tolerating absence (start a fresh queue shape)."""
    if not queue_path.exists():
        return {"version": 1, "targets": []}
    try:
        doc = json.loads(queue_path.read_text(encoding="utf-8"))
    except Exception:
        return {"version": 1, "targets": []}
    if not isinstance(doc, dict) or not isinstance(doc.get("targets"), list):
        return {"version": 1, "targets": []}
    return doc


def _save_queue(queue_path, data):
    queue_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = queue_path.with_suffix(queue_path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    tmp.replace(queue_path)


def _existing_logged_urls(log_path):
    urls = set()
    if not log_path.exists():
        return urls
    for line in log_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            r = json.loads(line)
        except Exception:
            continue
        u = str(r.get("url") or "").strip()
        if u:
            urls.add(u)
    return urls


def _validate_discoveries(doc):
    """Return (records, errors). A record is one (query, source_rq_id, finding)
    triple. errors is a list of human-readable shape problems (non-fatal: bad
    findings are skipped, not crashed on)."""
    records = []
    errors = []
    if isinstance(doc, dict) and isinstance(doc.get("discoveries"), list):
        blocks = doc["discoveries"]
    elif isinstance(doc, list):
        blocks = doc
    else:
        return [], ["discoveries JSON must be a list or {discoveries: [...]}"]
    for i, block in enumerate(blocks):
        if not isinstance(block, dict):
            errors.append(f"discoveries[{i}] is not an object")
            continue
        query = str(block.get("query") or "").strip()
        source_rq_id = str(block.get("source_rq_id") or "").strip()
        findings = block.get("findings")
        if not isinstance(findings, list):
            errors.append(f"discoveries[{i}].findings must be a list")
            continue
        for j, f in enumerate(findings):
            if not isinstance(f, dict):
                errors.append(f"discoveries[{i}].findings[{j}] is not an object")
                continue
            title = str(f.get("title") or "").strip()
            url = str(f.get("url") or "").strip()
            why = str(f.get("why_relevant") or "").strip()
            kind = str(f.get("kind") or "").strip().lower()
            if not title or not url:
                errors.append(
                    f"discoveries[{i}].findings[{j}] missing title or url")
                continue
            if kind not in VALID_KINDS:
                errors.append(
                    f"discoveries[{i}].findings[{j}].kind {kind!r} not in "
                    f"{VALID_KINDS}; defaulting to paper")
                kind = "paper"
            records.append({
                "query": query,
                "source_rq_id": source_rq_id,
                "title": title,
                "url": url,
                "why_relevant": why,
                "kind": kind,
            })
    return records, errors


def propose(discoveries_path, queue_path, log_path):
    """Append NEW lit-queue targets and discovery-log rows. Returns a summary
    dict. Writes a fabricated numeric score for NOTHING: relevance lives only
    in the prose why_relevant field."""
    doc = json.loads(Path(discoveries_path).read_text(encoding="utf-8"))
    records, errors = _validate_discoveries(doc)

    today = datetime.date.today().isoformat()

    # --- literature queue: extend with paper/dataset findings ---------------
    queue = _load_queue(queue_path)
    existing_slugs = {str(t.get("slug")) for t in queue["targets"]}
    existing_topics = {_norm_query_text(t.get("topic")) for t in queue["targets"]}
    existing_ids = {str(t.get("id")) for t in queue["targets"]}
    queued = 0
    for r in records:
        if r["kind"] not in LIT_KINDS:
            continue
        topic = r["title"]
        if _norm_query_text(topic) in existing_topics:
            continue
        slug = _slug(r["title"])
        base_slug = slug
        n = 2
        while slug in existing_slugs:
            slug = f"{base_slug}-{n}"
            n += 1
        tid = f"autosearch-{slug}"
        base_id = tid
        n = 2
        while tid in existing_ids:
            tid = f"{base_id}-{n}"
            n += 1
        feeds = r["source_rq_id"] or "autosearch"
        queue["targets"].append({
            "id": tid,
            "slug": slug,
            "topic": topic,
            "feeds": feeds,
            "status": "pending",
            "last_done": None,
            "runs": 0,
        })
        existing_slugs.add(slug)
        existing_ids.add(tid)
        existing_topics.add(_norm_query_text(topic))
        queued += 1
    if queued:
        _save_queue(queue_path, queue)

    # --- discoveries log: record every finding with provenance --------------
    logged_urls = _existing_logged_urls(log_path)
    logged = 0
    skipped_dupe = 0
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as fh:
        for r in records:
            if r["url"] in logged_urls:
                skipped_dupe += 1
                continue
            row = {
                "ts": today,
                "kind": r["kind"],
                "title": r["title"],
                "url": r["url"],
                # Provenance: which query and which open question motivated this.
                "source_rq_id": r["source_rq_id"],
                "query": r["query"],
                # Relevance is PROSE, never a fabricated number. No score key.
                "why_relevant": r["why_relevant"],
                "review_status": "candidate",
            }
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
            logged_urls.add(r["url"])
            logged += 1

    return {
        "findings_seen": len(records),
        "queued_to_lit": queued,
        "logged_discoveries": logged,
        "skipped_duplicate_urls": skipped_dupe,
        "shape_warnings": errors,
        "queue_path": str(queue_path),
        "log_path": str(log_path),
    }


# ----------------------------------------------------------------- CLI

def _emit(obj, out_path):
    text = json.dumps(obj, indent=2, ensure_ascii=False)
    if out_path:
        Path(out_path).parent.mkdir(parents=True, exist_ok=True)
        Path(out_path).write_text(text + "\n", encoding="utf-8")
        print(f"lab_autosearch: wrote {out_path}", file=sys.stderr)
    else:
        print(text)


def _cmd_read_state(args):
    cfg = _load_cfg()
    reg = _registry_path(cfg, args.registry)
    road = _roadmap_path(cfg, args.roadmap)
    state = read_state(reg, road)
    _emit(state, args.out)
    return 0


def _cmd_queries(args):
    cfg = _load_cfg()
    reg = _registry_path(cfg, args.registry)
    road = _roadmap_path(cfg, args.roadmap)
    state = read_state(reg, road)
    queries = intentions_to_queries(state)
    out = {
        "generated": datetime.date.today().isoformat(),
        "count": len(queries),
        "queries": queries,
    }
    _emit(out, args.out)
    return 0


def _cmd_propose(args):
    cfg = _load_cfg()
    disc = Path(args.discoveries)
    if not disc.is_file():
        print(f"lab_autosearch: discoveries file not found: {disc}",
              file=sys.stderr)
        return 1
    queue_path = _queue_path(cfg, args.queue)
    log_path = _log_path(cfg, args.log)
    summary = propose(disc, queue_path, log_path)
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    for w in summary["shape_warnings"]:
        print(f"lab_autosearch: WARNING: {w}", file=sys.stderr)
    return 0


def build_parser():
    p = argparse.ArgumentParser(
        description="State-aware discovery planner for Dexter's Lab.")
    sub = p.add_subparsers(dest="cmd", required=True)

    p_rs = sub.add_parser(
        "read-state", help="read registry + roadmap into CurrentIntentions JSON")
    p_rs.add_argument("--registry", default=None, help="rq_registry.json path")
    p_rs.add_argument("--roadmap", default=None, help="roadmap markdown path")
    p_rs.add_argument("--out", default=None, help="write JSON here instead of stdout")
    p_rs.set_defaults(func=_cmd_read_state)

    p_q = sub.add_parser(
        "queries", help="derive deduped discovery queries from state")
    p_q.add_argument("--registry", default=None, help="rq_registry.json path")
    p_q.add_argument("--roadmap", default=None, help="roadmap markdown path")
    p_q.add_argument("--out", default=None, help="write JSON here instead of stdout")
    p_q.set_defaults(func=_cmd_queries)

    p_p = sub.add_parser(
        "propose", help="append new lit targets + discovery-log rows from a "
                        "grounded discoveries JSON")
    p_p.add_argument("--discoveries", required=True,
                     help="discoveries JSON from the grounded step")
    p_p.add_argument("--queue", default=None, help="lit_queue.json path override")
    p_p.add_argument("--log", default=None, help="discoveries.jsonl path override")
    p_p.set_defaults(func=_cmd_propose)
    return p


def main(argv):
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
