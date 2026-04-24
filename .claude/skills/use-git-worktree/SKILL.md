---
name: use-git-worktree
description: Use git worktree to create a new feature branch. Use when starting feature work that needs isolation from current workspace.
---

# Using Git Worktrees

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

Core principle: Systematic directory selection + safety verification = reliable isolation.

Announce at start: "I'm using the using-git-worktrees skill to set up an isolated workspace."

All worktrees should be created at `./worktrees/{feature-name}`

## Step 1: Check Existing Directories

```bash
ls -d .worktrees 2>/dev/null
```

## Step 2: Create New Directory (If Needed)

If we cannot find the worktree directory, create it:

```bash
git worktree add .worktrees/{feature-name} -b feature/{feature-name}
```
