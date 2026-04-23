---
name: code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch code-reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history. This keeps the reviewer focused on the work product, not your thought process, and preserves your own context for continued work.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**

- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**

- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**

```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code-reviewer subagent:**

Use Task tool with code-reviewer type, fill template at `code-reviewer.md`

**Placeholders:**

- `{WHAT_WAS_IMPLEMENTED}` - What you just built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit
- `{DESCRIPTION}` - Brief summary

**3. Act on feedback:**

- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Integration with Workflows

**Subagent-Driven Development:**

- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**

- Review after each batch (3 tasks)
- Get feedback, apply, continue

**Ad-Hoc Development:**

- Review before merge
- Review when stuck

## Red Flags

**Never:**

- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**

- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

## Skill Implementation

When this skill is invoked, you should:

1. **Determine the review scope:**
   - Get BASE_SHA (previous commit or origin/main)
   - Get HEAD_SHA (current commit)
   - Identify what was implemented
   - Reference relevant requirements/plan documents

2. **Gather context:**
   - Run `git diff --stat BASE_SHA..HEAD_SHA` to see changed files
   - Run `git diff BASE_SHA..HEAD_SHA` to see actual changes
   - Read relevant plan documents if available

3. **Dispatch code-reviewer subagent:**
   - Use the Agent tool with appropriate parameters
   - Provide the template context with real values
   - Focus on the work product, not your thought process

4. **Process the review results:**
   - Address Critical issues immediately
   - Fix Important issues before proceeding
   - Note Minor issues for later
   - Challenge feedback if technically incorrect

5. **Continue work or iterate:**
   - If ready to proceed, continue with next task
   - If fixes needed, implement them and potentially request another review
   - If major issues found, reconsider approach

The skill ensures code quality through systematic review while maintaining development velocity.
