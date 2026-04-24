# Update GitHub Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use plan-execute to implement this plan task-by-step. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize GitHub Actions CI pipeline to run only when necessary by ignoring documentation-only changes and reducing Node.js version testing matrix to a single version.

**Architecture:** Update the existing GitHub Actions workflow configuration to add path-based filtering for push events and simplify the Node.js version matrix from two versions (18.x, 20.x) to a single version (20.x).

**Tech Stack:** GitHub Actions YAML configuration, Node.js 20.x, pnpm package manager

---

## File Structure

**Files to modify:**
- `.github/workflows/ci.yml` - Main CI/CD pipeline configuration

**Changes:**
1. Add `paths-ignore` to the `push` trigger to skip CI runs for documentation changes
2. Remove Node.js 18.x from the testing matrix, keeping only 20.x
3. Clean up redundant version-specific logic

---

## Task 1: Add Path Filtering to Push Trigger

**Files:**
- Modify: `.github/workflows/ci.yml:6-7`

- [ ] **Step 1: Update push trigger with path filtering**

Replace the push trigger section in `.github/workflows/ci.yml`:

```yaml
on:
  pull_request:
    branches: [master, main]
  push:
    branches: [master, main]
    paths-ignore:
      - '**.md'
      - '.gitignore'
```

- [ ] **Step 2: Commit changes**

```bash
git add .github/workflows/ci.yml
git commit -m "feat: add path filtering to CI pipeline for push events

Ignore markdown files and .gitignore changes to reduce unnecessary CI runs"
```

---

## Task 2: Simplify Node.js Version Matrix

**Files:**
- Modify: `.github/workflows/ci.yml:13-15`

- [ ] **Step 1: Update Node.js version matrix**

Replace the matrix strategy section in `.github/workflows/ci.yml`:

```yaml
    strategy:
      matrix:
        node-version: [20.x]
```

- [ ] **Step 2: Commit changes**

```bash
git add .github/workflows/ci.yml
git commit -m "refactor: simplify Node.js testing matrix to single version 20.x

Remove Node.js 18.x from testing matrix to reduce CI execution time and focus on current LTS version"
```

---

## Task 3: Remove Redundant Version-Specific Logic

**Files:**
- Modify: `.github/workflows/ci.yml:44-52`

- [ ] **Step 1: Remove version-specific condition from codecov step**

Update the codecov step in `.github/workflows/ci.yml` to remove the version-specific condition:

```yaml
      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false
```

- [ ] **Step 2: Commit changes**

```bash
git add .github/workflows/ci.yml
git commit -m "refactor: remove redundant Node.js version-specific logic

Since we now only test Node.js 20.x, remove conditional logic that was needed for multi-version testing"
```

---

## Task 4: Review and Finalize Changes

**Files:**
- Review: `.github/workflows/ci.yml`

- [ ] **Step 1: Review final workflow configuration**

```bash
cat .github/workflows/ci.yml
```

Verify the following changes are present:
- Push trigger includes `paths-ignore` with `'**.md'` and `'.gitignore'`
- Node.js matrix contains only `[20.x]`
- No `18.x` version present
- No `if: matrix.node-version == '20.x'` condition in codecov step

- [ ] **Step 2: Validate YAML syntax**

```bash
# Validate YAML syntax (if python3 is available)
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "✓ Valid YAML syntax"
```

---

## Manual Testing Instructions

After implementing all tasks, manually verify the pipeline works correctly:

1. **Test path filtering:**
   ```bash
   # Create a test markdown file
   echo "# Test" > TEST.md
   git add TEST.md
   git commit -m "test: add markdown file"
   git push origin feature/update-github-pipeline

   # Verify CI does NOT run (check GitHub Actions tab)
   ```

2. **Test code change triggers CI:**
   ```bash
   # Make a code change
   echo "// test" > test.js
   git add test.js
   git commit -m "test: add test file"
   git push origin feature/update-github-pipeline

   # Verify CI DOES run (check GitHub Actions tab)
   ```

3. **Verify Node.js version:**
   - Check GitHub Actions run logs
   - Confirm only Node.js 20.x jobs are executed
   - Verify no 18.x jobs appear

4. **Verify coverage upload:**
   - Check that coverage reports are uploaded
   - Confirm no conditional failures due to version checks

### Expected Results

- ✅ CI skips on markdown file changes
- ✅ CI runs on code changes
- ✅ Only Node.js 20.x jobs execute
- ✅ Coverage reports upload successfully
- ✅ All tests pass
- ✅ Build completes successfully
- ✅ Security scan runs
- ✅ Workflow YAML syntax is valid
- ✅ No version-specific conditionals remain

## Rollback Plan

If issues arise, revert to previous configuration:

```bash
git revert <commit-hash> --no-edit
git push origin feature/update-github-pipeline
```

Or restore the original file from git history:

```bash
git checkout HEAD~1 -- .github/workflows/ci.yml
git commit -m "revert: restore original CI configuration"
git push origin feature/update-github-pipeline
```
