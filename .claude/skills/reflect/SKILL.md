---
name: reflect
description: Capture a correction or lesson as a persistent learning rule with category, mistake, and correction. Stores, categorises, and retrieves rules for future sessions. Use after mistakes or when the user says "remember this", "don't forget", "note this", or "learn from this".
---

# Learn Rule

Capture a lesson from the current session into permanent memory via `.claude/LEARN.md`.

## Trigger

Use when:

- The user says "remember this", "add to rules", "don't do that again", "note this", "learn from this"
- After a mistake is identified and corrected
- After code review catches issues
- When noticing a repeated past mistake

## Workflow

1. **Identify the lesson** — what mistake was made? What should happen instead?
2. **Format the rule** with category, mistake, and correction.
3. **Propose the addition** to the user and wait for approval.
4. **After approval**, persist using `add-reminder.sh`.

## Format

Each entry in `.claude/LEARN.md`:

```
## [LEARN] Category: One-line rule

- **Mistake:** What went wrong
- **Correction:** How it was fixed

```

## Categories

| Category | Examples |
|----------|---------|
| Navigation | File paths, finding code, wrong file edited |
| Editing | Code changes, patterns, wrong approach |
| Testing | Test approaches, coverage gaps, flaky tests |
| Git | Commits, branches, merge issues |
| Quality | Lint, types, style violations |
| Context | When to clarify, missing requirements |
| Architecture | Design decisions, wrong abstractions |
| Performance | Optimization, O(n^2) loops, memory |

## Persisting

After user approval, run:

```bash
bash .claude/skills/reflect/add-reminder.sh "Category" "One-line rule" "What went wrong" "How it was fixed"
```

**Example:**

```
Recent mistake: Edited wrong utils.ts file

[LEARN] Navigation: Confirm full path when multiple files share a name.

Mistake: Edited utils.ts in src/lib/ instead of src/utils/
Correction: Always confirm full file path with `glob` before editing when filename is ambiguous.

Persist this rule? (y/n)
```

## Guardrails

- **Always wait for user approval** before persisting.
- Keep rules to one line — specific and actionable.
- Bad: "Write good code". Good: "Always use snake_case for database columns".
- Include the mistake context so the rule makes sense later.
- Never write unstructured prose into LEARN.md — always use the script.
- Never skip user approval.
