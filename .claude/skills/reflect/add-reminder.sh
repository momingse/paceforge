#!/usr/bin/env bash
set -euo pipefail

LEARN_FILE=".claude/LEARN.md"

CATEGORY="${1:?Usage: add-reminder.sh <category> <rule> <mistake> <correction>}"
RULE="${2:?Missing rule}"
MISTAKE="${3:?Missing mistake}"
CORRECTION="${4:?Missing correction}"

mkdir -p "$(dirname "$LEARN_FILE")"

if [ ! -f "$LEARN_FILE" ]; then
  cat > "$LEARN_FILE" <<'HEADER'
# Lessons Learned

<!-- Rules persisted by learn-rule skill. Use add-reminder.sh to add entries. -->

HEADER
fi

if ! tail -1 "$LEARN_FILE" | grep -q '^$'; then
  echo "" >> "$LEARN_FILE"
fi

cat >> "$LEARN_FILE" <<EOF
## [LEARN] ${CATEGORY}: ${RULE}

- **Mistake:** ${MISTAKE}
- **Correction:** ${CORRECTION}

EOF

echo "[LEARN] ${CATEGORY}: ${RULE}"
