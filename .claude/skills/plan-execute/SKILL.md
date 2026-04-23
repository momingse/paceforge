---
name: plan-execute
description: Execute a validated plan with worktree isolation, TDD scaffolding, level-based parallel agents, quality gate with smoke test, PR creation and merge. Handles everything through to merged PR. Use when being asked to implement a plan
---

# Plan Execute — Execution to Merged PR

Execute the validated plan in an isolated worktree. Spawn per-task agents, verify quality, create and merge the PR. Handles everything through to cleanup.

Run `/clear` before this command.

---

## Prerequisite

A validated plan must exist at `plans/YYYY-MM-DD-<feature-name>.md`.

---

## Step 1: Worktree Setup

Create an isolated git worktree:

```bash
git worktree add .worktrees/{plan-name} -b feature/{plan-name}
```

Then commit the plan changes to the worktree (since `create-plan` may have created/modified the plan in master):

```bash
cd .worktrees/{plan-name}
git add plans/
git commit -m "plan: {plan-name}" || echo "No plan changes to commit"
cd -
```

All execution happens inside the worktree. Main branch remains clean throughout.

---

## Step 2: TDD Scaffolding

_Only for tasks marked as TDD in the plan._

For each TDD task, before any implementation:

1. Write the failing test(s) that define the acceptance criteria
2. Run tests to confirm they fail (red)
3. Commit the failing tests
4. Mark the test file in the task for the implementation agent to find

Do not write implementation code in this step.

---

## Step 3: Level-Based Parallel Execution

Parse the task list from the plan. Group tasks by layer (Layer 1 = foundation, Layer 2 = depends on Layer 1, etc.).

**For each layer:**

1. Identify all tasks in the layer
2. Spawn one agent per task in parallel (Task tool, run_in_background: true)
3. Each agent receives: its task description, files to modify, acceptance criteria, and relevant ADRs
4. Monitor all agents by reading `.claude/tasks/<id>/output.log` via `Read` (TaskOutput is deprecated since v2.1.83)
5. Each agent commits on task completion: `git commit -m "{commit-type}: {task-description}"`
6. Wait for all tasks in the layer to complete before starting the next layer

**Drift detection**: after each layer, diff the actual changes against the plan spec. If implementation deviates significantly from the plan (new files not in plan, plan files not touched), flag and ask how to proceed. Do not silently continue on drift.

**Agent instructions for each task:**

```
You are implementing one task from a validated plan.
Task: {description}
Files to modify: {file list}
Acceptance criteria: {criteria}
Relevant ADRs: {adr list}

First principles:
- Build state-of-the-art. No workarounds, no legacy patterns.
- Fix at the correct architectural level, never with component-level hacks.
- If you discover that the plan is wrong or missing context, stop and report — do not improvise architecture.

Commit your changes when complete with message: "{commit-type}: {task-description}"
```

---

## Step 4: Quality Gate

Run in parallel:

- Linter
- Type checker
- Full test suite

If all pass: proceed to smoke test.

---

## Step 5: Pre-Push Documentation

_In the worktree, before push:_

**Plan Archival**: move `plans/YYYY-MM-DD-<feature-name>.md` to `plans/completed/YYYY-MM-DD-<feature-name>.md`. Update `plans/general-plan.md`

Commit documentation updates: `docs: archive plan for {feature-name}`.

---

## Step 6: Worktree cleanup

Switch back to main branch and remove the worktree:

```bash
git worktree remove .worktrees/{plan-name}
```

---

## Output

```
Setting up worktree: .worktrees/user-authentication
Branch: feature/user-authentication

TDD scaffolding: 2 tasks marked TDD
  ✓ Written failing tests for: auth-token-validation
  ✓ Written failing tests for: refresh-token-rotation
  Committed: "test: failing tests for auth pipeline (TDD)"

Executing Layer 1 (3 tasks, parallel)...
  [agent-1] Implementing: JWT token generation service
  [agent-2] Implementing: User session model
  [agent-3] Implementing: Auth middleware
  ✓ Layer 1 complete. 3 commits.

Drift check: Layer 1... ✓ No drift detected.

Executing Layer 2 (2 tasks, parallel)...
  [agent-4] Implementing: Login endpoint
  [agent-5] Implementing: Refresh endpoint
  ✓ Layer 2 complete. 2 commits.

Quality gate...
  ✓ Lint passed
  ✓ Type check passed
  ✓ Tests: 47 passed, 0 failed

Smoke test...
  ✓ GraphQL introspection: OK
  ✓ POST /api/auth/login: 200
  ✓ POST /api/auth/refresh: 200

✅ Feature complete. Ready to push.
```
