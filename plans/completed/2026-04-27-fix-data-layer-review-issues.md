# Fix Data Layer Review Issues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use plan-execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 code review issues in the runner profile data layer: Dexie shallow-merge trap, invalid default profile, type-schema mismatch for DaysAvailable (derive types from Zod schemas), and missing auto-save error test coverage.

**Architecture:** Derive TypeScript types from Zod schemas using `z.infer` as the single source of truth. Document the shallow-merge behavior of `updateProfile`. Add a test for the auto-save error path. Change `createProfile` defaults to pass validation.

**Tech Stack:** TypeScript, Zod v4, Dexie.js, Zustand, Vitest, fake-indexeddb

**Depends on:** Completed runner-profile-data-layer plan
**Required by:** Runner Profile Onboarding Wizard UI

---

## File Structure

**Files to modify:**

| File | Change |
|------|--------|
| `src/services/validation/onboarding-validation.ts` | Extract shared enums to top level, export inferred types |
| `src/types/onboarding.ts` | Remove hand-written types, re-export from Zod schemas |
| `src/services/indexed-db/onboarding-service.ts` | Fix default `age`, document shallow-merge behavior |
| `src/__tests__/hooks/use-auto-save.test.ts` | Add error path test |

---

## Task 1: Derive TypeScript Types from Zod Schemas

**Files:**

- Modify: `src/services/validation/onboarding-validation.ts`
- Modify: `src/types/onboarding.ts`

The goal is to make Zod schemas the single source of truth. Export inferred types from the schemas and re-export them from `src/types/onboarding.ts` so that existing consumers don't need to change their imports.

Currently, enum literals (sex values, experience levels, day names, distances) are duplicated between `src/types/onboarding.ts` and `src/services/validation/onboarding-validation.ts`. After this task, the Zod schemas define them once and TypeScript types are derived via `z.infer`.

The `RunnerProfile` type includes `id`, `isCompleted`, `createdAt`, `updatedAt` which are not in any schema. These remain as hand-written interfaces in `src/types/onboarding.ts` but reference the Zod-derived types for their nested data.

- [ ] **Step 1: Update `src/services/validation/onboarding-validation.ts` to export inferred types**

Replace the entire file with:

```typescript
import { z } from 'zod';

export const DAY_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = (typeof DAY_OF_WEEK)[number];

export const basicsSchema = z.object({
  age: z
    .number()
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(200, 'Age must be 200 or less'),
  sex: z.enum(['male', 'female', 'prefer-not-to-say']),
  height: z
    .union([
      z.number().positive('Height must be a positive number'),
      z.literal('prefer-not-to-say'),
    ])
    .optional(),
  weight: z
    .union([
      z.number().positive('Weight must be a positive number'),
      z.literal('prefer-not-to-say'),
    ])
    .optional(),
  restingHR: z
    .union([
      z
        .number()
        .int()
        .min(20, 'Resting HR must be at least 20')
        .max(250, 'Resting HR must be at most 250'),
      z.literal('prefer-not-to-say'),
    ])
    .optional(),
  experienceLevel: z.enum(['new', 'intermediate', 'advanced']),
});

export type Basics = z.infer<typeof basicsSchema>;
export type Sex = Basics['sex'];
export type ExperienceLevel = Basics['experienceLevel'];

export const currentFitnessSchema = z.object({
  weeklyMileage: z
    .number()
    .min(0, 'Weekly mileage cannot be negative')
    .max(1000, 'Weekly mileage must be 1000 or less'),
  longestRecentRun: z
    .number()
    .min(0, 'Longest recent run cannot be negative')
    .max(26.2, 'Longest recent run must be 26.2 miles or less'),
});

export type CurrentFitness = z.infer<typeof currentFitnessSchema>;

const timePattern = /^(?:([0-1]?[0-9]|2[0-3]):)?([0-5]?[0-9]):([0-5][0-9])$/;

export const personalBestSchema = z.object({
  distance: z.enum(['5k', '10k', 'half-marathon', 'marathon']),
  time: z.string().regex(timePattern, 'Time must be in HH:MM:SS or MM:SS format').optional(),
  date: z.string().optional(),
});

export type PersonalBest = z.infer<typeof personalBestSchema>;
export type PBDistance = PersonalBest['distance'];

export const daysAvailableSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('specific'),
    specificDays: z.array(z.enum(DAY_OF_WEEK)).min(1, 'Select at least one day'),
  }),
  z.object({
    type: z.literal('number'),
    numberOfDays: z
      .number()
      .int()
      .min(3, 'Must be at least 3 days')
      .max(7, 'Must be at most 7 days'),
  }),
]);

export type DaysAvailable = z.infer<typeof daysAvailableSchema>;

export const lifestyleConstraintsSchema = z.object({
  daysAvailable: daysAvailableSchema,
  preferredLongRunDay: z.enum(DAY_OF_WEEK).optional(),
  crossTraining: z.boolean(),
});

export type LifestyleConstraints = z.infer<typeof lifestyleConstraintsSchema>;
```

Key changes:
- `DAY_OF_WEEK` is now exported and `DayOfWeek` type is derived from it
- Each schema now has a companion `export type X = z.infer<typeof XSchema>` right below it
- `Sex`, `ExperienceLevel`, `PBDistance` are extracted as aliases from their parent inferred types
- `DaysAvailable` is now a proper discriminated union (not an interface with optional fields)

- [ ] **Step 2: Update `src/types/onboarding.ts` to re-export from Zod schemas**

Replace the entire file with:

```typescript
export type {
  Sex,
  ExperienceLevel,
  Basics,
  CurrentFitness,
  PBDistance,
  PersonalBest,
  DayOfWeek,
  DaysAvailable,
  LifestyleConstraints,
} from '@/services/validation/onboarding-validation';

export interface RunnerProfile {
  id: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  basics: Basics;
  currentFitness: CurrentFitness;
  personalBests: PersonalBest[];
  lifestyleConstraints: LifestyleConstraints;
}
```

Note: The re-exported types at the top of the file bring `Basics`, `CurrentFitness`, etc. into scope, so `RunnerProfile` can reference them directly without inline `import()`. There is no circular import risk because the validation module doesn't import from the types module.

- [ ] **Step 3: Run type-check to verify no breakage**

Run: `pnpm type-check`
Expected: No errors. All existing consumers import `Basics`, `DaysAvailable`, etc. from `@/types/onboarding` which now re-exports them.

- [ ] **Step 4: Run tests to verify nothing broke**

Run: `pnpm test -- --run`
Expected: All 81 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/validation/onboarding-validation.ts src/types/onboarding.ts
git commit -m "refactor: derive TypeScript types from Zod schemas as single source of truth"
```

---

## Task 2: Fix `createProfile` Invalid Defaults and Document `updateProfile` Shallow Merge

**Files:**

- Modify: `src/services/indexed-db/onboarding-service.ts`
- Modify: `src/__tests__/services/indexed-db/onboarding-service.test.ts`

- [ ] **Step 1: Add failing test for `createProfile` producing valid defaults**

Add this test inside the `createProfile` describe block in `src/__tests__/services/indexed-db/onboarding-service.test.ts`, after the existing `'persists the profile to IndexedDB'` test:

```typescript
it('creates a profile with valid defaults that pass basics validation', async () => {
  const profile = await createProfile();
  const { basicsSchema } = await import(
    '@/services/validation/onboarding-validation'
  );
  expect(basicsSchema.safeParse(profile.basics).success).toBe(true);
});
```

Also add the import for `basicsSchema` at the top of the file (add to existing imports):

```typescript
import { basicsSchema } from '@/services/validation/onboarding-validation';
```

Then the test simplifies to:

```typescript
it('creates a profile with valid defaults that pass basics validation', async () => {
  const profile = await createProfile();
  expect(basicsSchema.safeParse(profile.basics).success).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- --run src/__tests__/services/indexed-db/onboarding-service.test.ts`
Expected: The new test FAILS because `age: 0` does not pass `basicsSchema` (`min(1)`).

- [ ] **Step 3: Fix `createProfile` defaults and document `updateProfile` behavior**

Replace `src/services/indexed-db/onboarding-service.ts` with:

```typescript
import { db } from './dexie-client';
import type { RunnerProfile } from '@/types/onboarding';

function generateId(): string {
  return crypto.randomUUID();
}

export async function createProfile(): Promise<RunnerProfile> {
  const now = new Date();
  const profile: RunnerProfile = {
    id: generateId(),
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
    basics: {
      age: 1,
      sex: 'prefer-not-to-say',
      experienceLevel: 'new',
    },
    currentFitness: {
      weeklyMileage: 0,
      longestRecentRun: 0,
    },
    personalBests: [],
    lifestyleConstraints: {
      daysAvailable: { type: 'number', numberOfDays: 4 },
      crossTraining: false,
    },
  };
  await db.runnerProfiles.add(profile);
  return profile;
}

export async function getProfile(id: string): Promise<RunnerProfile | undefined> {
  return db.runnerProfiles.get(id);
}

/**
 * Update top-level fields on a profile.
 *
 * NOTE: Dexie's `update()` performs a **shallow top-level merge**.
 * Nested objects (e.g. `basics`, `lifestyleConstraints`) are **replaced
 * wholesale**, not deep-merged. Callers must always pass the complete
 * nested object for any section they want to update.
 */
export async function updateProfile(id: string, data: Partial<RunnerProfile>): Promise<void> {
  await db.runnerProfiles.update(id, {
    ...data,
    updatedAt: new Date(),
  });
}

export async function getActiveProfile(): Promise<RunnerProfile | undefined> {
  return db.runnerProfiles.filter((p) => !p.isCompleted).first();
}

export async function markComplete(id: string): Promise<void> {
  await db.runnerProfiles.update(id, {
    isCompleted: true,
    updatedAt: new Date(),
  });
}

export async function deleteProfile(id: string): Promise<void> {
  await db.runnerProfiles.delete(id);
}
```

Changes:
- `age` default changed from `0` to `1` (passes `basicsSchema.min(1)`)
- Added JSDoc to `updateProfile` documenting the shallow-merge behavior

- [ ] **Step 4: Run tests to verify fix**

Run: `pnpm test -- --run src/__tests__/services/indexed-db/onboarding-service.test.ts`
Expected: All tests pass, including the new one.

- [ ] **Step 5: Commit**

```bash
git add src/services/indexed-db/onboarding-service.ts src/__tests__/services/indexed-db/onboarding-service.test.ts
git commit -m "fix: createProfile defaults to valid age, document updateProfile shallow merge"
```

---

## Task 3: Add Auto-Save Error Path Test

**Files:**

- Modify: `src/__tests__/hooks/use-auto-save.test.ts`

- [ ] **Step 1: Add test for error handling when `updateProfile` rejects**

Append a new test at the end of the `useAutoSave` describe block in `src/__tests__/hooks/use-auto-save.test.ts`:

```typescript
it('handles save errors gracefully without crashing', () => {
  vi.mocked(service.updateProfile).mockRejectedValueOnce(new Error('DB error'));

  useOnboardingStore.setState({
    profileId: 'test-id',
    profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
  });

  const { result } = renderHook(() => useAutoSave());
  vi.advanceTimersByTime(500);

  expect(service.updateProfile).toHaveBeenCalled();
  expect(result.current.isSaving).toBe(false);
});
```

This test verifies that when `updateProfile` throws:
- The hook doesn't crash
- `isSaving` resets to `false` in the `finally` block

- [ ] **Step 2: Run the test**

Run: `pnpm test -- --run src/__tests__/hooks/use-auto-save.test.ts`
Expected: All tests pass including the new one.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/hooks/use-auto-save.test.ts
git commit -m "test: add error path coverage for useAutoSave hook"
```

---

## Task 4: Verify Everything Together

- [ ] **Step 1: Run full validation suite**

Run: `pnpm run validate`
Expected: All checks pass (lint, format, type-check, tests).

- [ ] **Step 2: Commit any remaining formatting fixes if needed**

Only if `pnpm run validate` produced auto-fixable issues:

```bash
git add -A
git commit -m "style: fix formatting from validation"
```
