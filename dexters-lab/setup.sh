#!/usr/bin/env bash
# setup.sh: dependency check + self-test for Dexter's Lab.
#
# Hard requirements (nonzero exit if missing or broken):
#   - python3 >= 3.9
#   - the test suite passing, when pytest is available
# Everything else is optional and only produces a warning.
#
# Usage: ./setup.sh

set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT" || exit 1

FAIL=0
HARD_FAILS=""

ok()   { printf 'OK    %s\n' "$*"; }
warn() { printf 'WARN  %s\n' "$*"; }
fail() { printf 'FAIL  %s\n' "$*"; FAIL=1; HARD_FAILS="${HARD_FAILS}  - $*\n"; }

echo "Dexter's Lab setup check"
echo "repo: $REPO_ROOT"
echo

# ---------------------------------------------------------------- python3
PYTHON="${PYTHON:-python3}"
HAVE_PYTHON=0
if command -v "$PYTHON" >/dev/null 2>&1; then
    if "$PYTHON" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 9) else 1)' 2>/dev/null; then
        ok "python3 $("$PYTHON" -c 'import platform; print(platform.python_version())')"
        HAVE_PYTHON=1
    else
        fail "python3 >= 3.9 required (found: $("$PYTHON" -V 2>&1))"
    fi
else
    fail "python3 not found on PATH (install Python 3.9 or newer)"
fi

# ---------------------------------------------------------------- pytest (optional, needed for self-test)
HAVE_PYTEST=0
if [ "$HAVE_PYTHON" -eq 1 ]; then
    if "$PYTHON" -c 'import pytest' >/dev/null 2>&1; then
        ok "pytest"
        HAVE_PYTEST=1
    else
        warn "pytest not installed; self-test will be skipped. Install: $PYTHON -m pip install pytest"
    fi
fi

# ---------------------------------------------------------------- jsonschema (optional)
if [ "$HAVE_PYTHON" -eq 1 ]; then
    if "$PYTHON" -c 'import jsonschema' >/dev/null 2>&1; then
        ok "jsonschema (strict schema validation enabled)"
    else
        warn "jsonschema not installed; tools will warn and skip schema validation. Install: $PYTHON -m pip install jsonschema"
    fi
fi

# ---------------------------------------------------------------- pdftotext (optional)
if command -v pdftotext >/dev/null 2>&1; then
    ok "pdftotext (PDF papers can be reviewed)"
else
    warn "pdftotext not found; lab_review accepts only .tex/.md input. Install poppler (brew install poppler / apt install poppler-utils)"
fi

# ---------------------------------------------------------------- claude CLI (optional)
if command -v claude >/dev/null 2>&1; then
    ok "claude CLI (autonomous lanes lab_executor / lab_lit available)"
else
    warn "claude CLI not found; lab_executor and lab_lit will not run. Everything else works. See https://docs.anthropic.com/en/docs/claude-code"
fi

# ---------------------------------------------------------------- node (optional)
if command -v node >/dev/null 2>&1; then
    ok "node $(node --version 2>/dev/null)"
else
    warn "node not found; only needed if your own verify commands use it"
fi

# ---------------------------------------------------------------- live config
if [ -f "$REPO_ROOT/lab.config.json" ]; then
    ok "lab.config.json present"
else
    warn "no lab.config.json yet; tools fall back to the shipped example (lab_home=~/dexters-lab-home). Run: cp lab.config.example.json lab.config.json"
fi

# ---------------------------------------------------------------- self-test
echo
if [ "$HAVE_PYTHON" -eq 1 ] && [ "$HAVE_PYTEST" -eq 1 ]; then
    echo "Running the test suite..."
    if "$PYTHON" -m pytest tests/ -q; then
        ok "self-test green"
    else
        fail "self-test failed (see pytest output above)"
    fi
else
    warn "self-test skipped (needs python3 + pytest)"
fi

# ---------------------------------------------------------------- summary
echo
if [ "$FAIL" -ne 0 ]; then
    echo "Setup found hard failures:"
    printf '%b' "$HARD_FAILS"
    echo "Fix these and run ./setup.sh again."
    exit 1
fi

cat <<'EOF'
Setup looks good. Next steps:

  1. cp lab.config.example.json lab.config.json   (if you have not yet)
  2. Edit lab.config.json: set lab_home to where the lab keeps its state.
  3. python3 bin/lab_init.py                      (creates the lab_home tree)
  4. Write your first RQ plan with a ```prereg fence, then compile it:
       python3 bin/rq_compile.py --help
  5. Score results against the stopping rules:
       python3 bin/stopping_gate.py --help

Doctrine: docs/GOVERNANCE.md   Design: docs/ARCHITECTURE.md   Keys: docs/CONFIG.md
EOF
exit 0
