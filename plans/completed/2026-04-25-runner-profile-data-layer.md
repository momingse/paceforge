# Runner Profile Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use plan-execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the data layer for the runner profile onboarding wizard — types, validation schemas, IndexedDB persistence, Zustand state management, and supporting hooks.

**Architecture:** TypeScript types define the data model. Zod schemas validate form data. Dexie.js wraps IndexedDB for persistence. Zustand manages wizard state in memory. Custom hooks provide auto-save and navigation logic. All units are independently testable with zero UI dependency.

**Tech Stack:** TypeScript, Zod, Dexie.js, Zustand, Vitest, fake-indexeddb

**Depends on:** Nothing (this is the foundation)
**Required by:** Plan 2 — Runner Profile Onboarding Wizard UI

---

## File Structure

**Files to create:**

| File | Responsibility |
|------|---------------|
| `src/types/onboarding.ts` | All TypeScript types/interfaces for runner profile data |
| `src/services/validation/onboarding-validation.ts` | Zod schemas for each wizard section |
| `src/services/indexed-db/dexie-client.ts` | Dexie database class and singleton `db` export |
| `src/services/indexed-db/onboarding-service.ts` | CRUD operations for runner profiles via Dexie |
| `src/store/use-onboarding-store.ts` | Zustand store for wizard state |
| `src/hooks/use-auto-save.ts` | Debounced auto-save hook (watches store → persists to IndexedDB) |
| `src/hooks/use-onboarding-navigation.ts` | Step navigation helpers derived from store state |

**Test files to create:**

| File | Tests |
|------|-------|
| `src/__tests__/services/validation/onboarding-validation.test.ts` | Zod schema validation |
| `src/__tests__/services/indexed-db/onboarding-service.test.ts` | CRUD + query operations |
| `src/__tests__/store/use-onboarding-store.test.ts` | Store actions and state transitions |
| `src/__tests__/hooks/use-auto-save.test.ts` | Debounce and save behavior |
| `src/__tests__/hooks/use-onboarding-navigation.test.ts` | Navigation guards and transitions |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install runtime dependencies**

```bash
pnpm add zustand dexie zod
```

- [ ] **Step 2: Install dev dependencies**

```bash
pnpm add -D fake-indexeddb
```

- [ ] **Step 3: Verify installation**

```bash
pnpm list zustand dexie zod fake-indexeddb
```

Expected: All four packages listed with version numbers.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add zustand, dexie, zod, fake-indexeddb dependencies"
```

---

## Task 2: Create TypeScript Types

**Files:**
- Create: `src/types/onboarding.ts`

- [ ] **Step 1: Create the types file**

```typescript
export type Sex = 'male' | 'female' | 'prefer-not-to-say';

export type ExperienceLevel = 'new' | 'intermediate' | 'advanced';

export type PBDistance = '5k' | '10k' | 'half-marathon' | 'marathon';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type DaysAvailableType = 'specific' | 'number';

export interface Basics {
  age: number;
  sex: Sex;
  height?: number | 'prefer-not-to-say';
  weight?: number | 'prefer-not-to-say';
  restingHR?: number | 'prefer-not-to-say';
  experienceLevel: ExperienceLevel;
}

export interface CurrentFitness {
  weeklyMileage: number;
  longestRecentRun: number;
}

export interface PersonalBest {
  distance: PBDistance;
  time?: string;
  date?: string;
}

export interface DaysAvailable {
  type: DaysAvailableType;
  specificDays?: DayOfWeek[];
  numberOfDays?: number;
}

export interface LifestyleConstraints {
  daysAvailable: DaysAvailable;
  preferredLongRunDay?: DayOfWeek;
  crossTraining: boolean;
}

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

- [ ] **Step 2: Run type-check to verify**

```bash
pnpm type-check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/onboarding.ts
git commit -m "feat: add runner profile type definitions"
```

---

## Task 3: Create Zod Validation Schemas

**Files:**
- Create: `src/services/validation/onboarding-validation.ts`
- Create: `src/__tests__/services/validation/onboarding-validation.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import {
  basicsSchema,
  currentFitnessSchema,
  personalBestSchema,
  lifestyleConstraintsSchema,
} from '@/services/validation/onboarding-validation';

describe('basicsSchema', () => {
  const validBasics = {
    age: 30,
    sex: 'male' as const,
    experienceLevel: 'intermediate' as const,
  };

  it('accepts valid complete data', () => {
    expect(basicsSchema.safeParse(validBasics).success).toBe(true);
  });

  it('accepts all sex values', () => {
    for (const sex of ['male', 'female', 'prefer-not-to-say'] as const) {
      expect(basicsSchema.safeParse({ ...validBasics, sex }).success).toBe(true);
    }
  });

  it('accepts all experience levels', () => {
    for (const level of ['new', 'intermediate', 'advanced'] as const) {
      expect(
        basicsSchema.safeParse({ ...validBasics, experienceLevel: level }).success
      ).toBe(true);
    }
  });

  it('rejects missing age', () => {
    const { age: _, ...noAge } = validBasics;
    expect(basicsSchema.safeParse(noAge).success).toBe(false);
  });

  it('rejects missing sex', () => {
    const { sex: _, ...noSex } = validBasics;
    expect(basicsSchema.safeParse(noSex).success).toBe(false);
  });

  it('rejects missing experienceLevel', () => {
    const { experienceLevel: _, ...noLevel } = validBasics;
    expect(basicsSchema.safeParse(noLevel).success).toBe(false);
  });

  it('rejects age below 1', () => {
    expect(basicsSchema.safeParse({ ...validBasics, age: 0 }).success).toBe(false);
  });

  it('rejects age above 200', () => {
    expect(basicsSchema.safeParse({ ...validBasics, age: 201 }).success).toBe(false);
  });

  it('accepts numeric height', () => {
    expect(basicsSchema.safeParse({ ...validBasics, height: 175 }).success).toBe(true);
  });

  it('accepts prefer-not-to-say for height', () => {
    expect(
      basicsSchema.safeParse({ ...validBasics, height: 'prefer-not-to-say' }).success
    ).toBe(true);
  });

  it('accepts numeric weight', () => {
    expect(basicsSchema.safeParse({ ...validBasics, weight: 70 }).success).toBe(true);
  });

  it('accepts prefer-not-to-say for weight', () => {
    expect(
      basicsSchema.safeParse({ ...validBasics, weight: 'prefer-not-to-say' }).success
    ).toBe(true);
  });

  it('accepts numeric restingHR', () => {
    expect(basicsSchema.safeParse({ ...validBasics, restingHR: 60 }).success).toBe(true);
  });

  it('accepts prefer-not-to-say for restingHR', () => {
    expect(
      basicsSchema.safeParse({ ...validBasics, restingHR: 'prefer-not-to-say' }).success
    ).toBe(true);
  });

  it('allows omitting optional fields', () => {
    expect(basicsSchema.safeParse(validBasics).success).toBe(true);
  });
});

describe('currentFitnessSchema', () => {
  const validFitness = {
    weeklyMileage: 25,
    longestRecentRun: 10,
  };

  it('accepts valid data', () => {
    expect(currentFitnessSchema.safeParse(validFitness).success).toBe(true);
  });

  it('rejects missing weeklyMileage', () => {
    const { weeklyMileage: _, ...no } = validFitness;
    expect(currentFitnessSchema.safeParse(no).success).toBe(false);
  });

  it('rejects missing longestRecentRun', () => {
    const { longestRecentRun: _, ...no } = validFitness;
    expect(currentFitnessSchema.safeParse(no).success).toBe(false);
  });

  it('rejects negative weeklyMileage', () => {
    expect(currentFitnessSchema.safeParse({ ...validFitness, weeklyMileage: -1 }).success).toBe(
      false
    );
  });

  it('rejects weeklyMileage above 1000', () => {
    expect(currentFitnessSchema.safeParse({ ...validFitness, weeklyMileage: 1001 }).success).toBe(
      false
    );
  });

  it('rejects negative longestRecentRun', () => {
    expect(
      currentFitnessSchema.safeParse({ ...validFitness, longestRecentRun: -1 }).success
    ).toBe(false);
  });

  it('rejects longestRecentRun above 26.2', () => {
    expect(
      currentFitnessSchema.safeParse({ ...validFitness, longestRecentRun: 26.3 }).success
    ).toBe(false);
  });

  it('accepts zero values', () => {
    expect(currentFitnessSchema.safeParse({ weeklyMileage: 0, longestRecentRun: 0 }).success).toBe(
      true
    );
  });
});

describe('personalBestSchema', () => {
  it('accepts valid entry with time and date', () => {
    expect(
      personalBestSchema.safeParse({
        distance: '5k',
        time: '25:30',
        date: '2024-01-15',
      }).success
    ).toBe(true);
  });

  it('accepts entry with only distance', () => {
    expect(personalBestSchema.safeParse({ distance: '10k' }).success).toBe(true);
  });

  it('accepts all distance values', () => {
    for (const d of ['5k', '10k', 'half-marathon', 'marathon'] as const) {
      expect(personalBestSchema.safeParse({ distance: d }).success).toBe(true);
    }
  });

  it('rejects missing distance', () => {
    expect(personalBestSchema.safeParse({ time: '25:30' }).success).toBe(false);
  });

  it('accepts H:MM:SS time format', () => {
    expect(
      personalBestSchema.safeParse({ distance: '5k', time: '1:30:00' }).success
    ).toBe(true);
  });

  it('accepts HH:MM:SS time format', () => {
    expect(
      personalBestSchema.safeParse({ distance: '5k', time: '01:30:00' }).success
    ).toBe(true);
  });

  it('accepts MM:SS time format', () => {
    expect(
      personalBestSchema.safeParse({ distance: '5k', time: '25:30' }).success
    ).toBe(true);
  });

  it('rejects invalid time format', () => {
    expect(
      personalBestSchema.safeParse({ distance: '5k', time: 'invalid' }).success
    ).toBe(false);
  });
});

describe('lifestyleConstraintsSchema', () => {
  it('accepts specific days mode', () => {
    expect(
      lifestyleConstraintsSchema
        .safeParse({
          daysAvailable: {
            type: 'specific',
            specificDays: ['Monday', 'Wednesday', 'Friday'],
          },
          crossTraining: true,
        })
        .success
    ).toBe(true);
  });

  it('accepts number days mode', () => {
    expect(
      lifestyleConstraintsSchema
        .safeParse({
          daysAvailable: { type: 'number', numberOfDays: 4 },
          crossTraining: false,
        })
        .success
    ).toBe(true);
  });

  it('rejects specific days with empty array', () => {
    expect(
      lifestyleConstraintsSchema
        .safeParse({
          daysAvailable: { type: 'specific', specificDays: [] },
          crossTraining: false,
        })
        .success
    ).toBe(false);
  });

  it('rejects numberOfDays below 3', () => {
    expect(
      lifestyleConstraintsSchema
        .safeParse({
          daysAvailable: { type: 'number', numberOfDays: 2 },
          crossTraining: false,
        })
        .success
    ).toBe(false);
  });

  it('rejects numberOfDays above 7', () => {
    expect(
      lifestyleConstraintsSchema
        .safeParse({
          daysAvailable: { type: 'number', numberOfDays: 8 },
          crossTraining: false,
        })
        .success
    ).toBe(false);
  });

  it('accepts optional preferredLongRunDay', () => {
    expect(
      lifestyleConstraintsSchema
        .safeParse({
          daysAvailable: { type: 'number', numberOfDays: 4 },
          preferredLongRunDay: 'Saturday',
          crossTraining: false,
        })
        .success
    ).toBe(true);
  });

  it('rejects missing crossTraining', () => {
    expect(
      lifestyleConstraintsSchema
        .safeParse({
          daysAvailable: { type: 'number', numberOfDays: 4 },
        })
        .success
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:run src/__tests__/services/validation/onboarding-validation.test.ts
```

Expected: FAIL — cannot resolve `@/services/validation/onboarding-validation`.

- [ ] **Step 3: Write the implementation**

```typescript
import { z } from 'zod';

const DAY_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const basicsSchema = z.object({
  age: z
    .number({
      required_error: 'Age is required',
      invalid_type_error: 'Age must be a number',
    })
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(200, 'Age must be 200 or less'),
  sex: z.enum(['male', 'female', 'prefer-not-to-say'], {
    required_error: 'Sex is required',
  }),
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
      z.number().int().min(20, 'Resting HR must be at least 20').max(250, 'Resting HR must be at most 250'),
      z.literal('prefer-not-to-say'),
    ])
    .optional(),
  experienceLevel: z.enum(['new', 'intermediate', 'advanced'], {
    required_error: 'Experience level is required',
  }),
});

export const currentFitnessSchema = z.object({
  weeklyMileage: z
    .number({
      required_error: 'Weekly mileage is required',
      invalid_type_error: 'Weekly mileage must be a number',
    })
    .min(0, 'Weekly mileage cannot be negative')
    .max(1000, 'Weekly mileage must be 1000 or less'),
  longestRecentRun: z
    .number({
      required_error: 'Longest recent run is required',
      invalid_type_error: 'Longest recent run must be a number',
    })
    .min(0, 'Longest recent run cannot be negative')
    .max(26.2, 'Longest recent run must be 26.2 miles or less'),
});

const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

export const personalBestSchema = z.object({
  distance: z.enum(['5k', '10k', 'half-marathon', 'marathon'], {
    required_error: 'Distance is required',
  }),
  time: z
    .string()
    .regex(timePattern, 'Time must be in HH:MM:SS or MM:SS format')
    .optional(),
  date: z.string().min(1, 'Date cannot be empty').optional(),
});

export const daysAvailableSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('specific'),
    specificDays: z
      .array(z.enum(DAY_OF_WEEK))
      .min(1, 'Select at least one day'),
  }),
  z.object({
    type: z.literal('number'),
    numberOfDays: z
      .number({
        required_error: 'Number of days is required',
        invalid_type_error: 'Number of days must be a number',
      })
      .int()
      .min(3, 'Must be at least 3 days')
      .max(7, 'Must be at most 7 days'),
  }),
]);

export const lifestyleConstraintsSchema = z.object({
  daysAvailable: daysAvailableSchema,
  preferredLongRunDay: z.enum(DAY_OF_WEEK).optional(),
  crossTraining: z.boolean(),
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:run src/__tests__/services/validation/onboarding-validation.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/validation/onboarding-validation.ts src/__tests__/services/validation/onboarding-validation.test.ts
git commit -m "feat: add Zod validation schemas for runner profile sections"
```

---

## Task 4: Create Dexie Client + Onboarding Service

**Files:**
- Create: `src/services/indexed-db/dexie-client.ts`
- Create: `src/services/indexed-db/onboarding-service.ts`
- Create: `src/__tests__/services/indexed-db/onboarding-service.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createProfile,
  getProfile,
  updateProfile,
  getActiveProfile,
  markComplete,
  deleteProfile,
} from '@/services/indexed-db/onboarding-service';
import { db } from '@/services/indexed-db/dexie-client';

describe('onboarding-service', () => {
  beforeEach(async () => {
    await db.runnerProfiles.clear();
  });

  describe('createProfile', () => {
    it('creates and returns a new profile with a generated id', async () => {
      const profile = await createProfile();

      expect(profile.id).toBeDefined();
      expect(typeof profile.id).toBe('string');
      expect(profile.isCompleted).toBe(false);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('persists the profile to IndexedDB', async () => {
      const profile = await createProfile();
      const stored = await getProfile(profile.id);

      expect(stored).toBeDefined();
      expect(stored!.id).toBe(profile.id);
    });
  });

  describe('getProfile', () => {
    it('returns undefined for non-existent id', async () => {
      const result = await getProfile('non-existent');
      expect(result).toBeUndefined();
    });

    it('returns the stored profile', async () => {
      const created = await createProfile();
      const result = await getProfile(created.id);
      expect(result!.id).toBe(created.id);
    });
  });

  describe('updateProfile', () => {
    it('updates specified fields', async () => {
      const created = await createProfile();
      await updateProfile(created.id, {
        basics: {
          age: 30,
          sex: 'male',
          experienceLevel: 'intermediate',
        },
      });

      const updated = await getProfile(created.id);
      expect(updated!.basics.age).toBe(30);
      expect(updated!.basics.sex).toBe('male');
    });

    it('updates the updatedAt timestamp', async () => {
      const created = await createProfile();
      const originalUpdatedAt = created.updatedAt;

      await new Promise((r) => setTimeout(r, 10));
      await updateProfile(created.id, { basics: { ...created.basics, age: 31 } });

      const updated = await getProfile(created.id);
      expect(updated!.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('getActiveProfile', () => {
    it('returns incomplete profile', async () => {
      const created = await createProfile();
      const active = await getActiveProfile();
      expect(active!.id).toBe(created.id);
    });

    it('returns undefined when all profiles are completed', async () => {
      const created = await createProfile();
      await markComplete(created.id);

      const active = await getActiveProfile();
      expect(active).toBeUndefined();
    });

    it('returns undefined when no profiles exist', async () => {
      const active = await getActiveProfile();
      expect(active).toBeUndefined();
    });
  });

  describe('markComplete', () => {
    it('sets isCompleted to true', async () => {
      const created = await createProfile();
      await markComplete(created.id);

      const profile = await getProfile(created.id);
      expect(profile!.isCompleted).toBe(true);
    });
  });

  describe('deleteProfile', () => {
    it('removes the profile', async () => {
      const created = await createProfile();
      await deleteProfile(created.id);

      const result = await getProfile(created.id);
      expect(result).toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:run src/__tests__/services/indexed-db/onboarding-service.test.ts
```

Expected: FAIL — cannot resolve `@/services/indexed-db/onboarding-service`.

- [ ] **Step 3: Create the Dexie client**

```typescript
import Dexie, { type Table } from 'dexie';
import type { RunnerProfile } from '@/types/onboarding';

export class PaceForgeDB extends Dexie {
  runnerProfiles!: Table<RunnerProfile, string>;

  constructor() {
    super('PaceForgeDB');
    this.version(1).stores({
      runnerProfiles: 'id, isCompleted',
    });
  }
}

export const db = new PaceForgeDB();
```

- [ ] **Step 4: Create the onboarding service**

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
      age: 0,
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

export async function updateProfile(
  id: string,
  data: Partial<RunnerProfile>
): Promise<void> {
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

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test:run src/__tests__/services/indexed-db/onboarding-service.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/services/indexed-db/dexie-client.ts src/services/indexed-db/onboarding-service.ts src/__tests__/services/indexed-db/onboarding-service.test.ts
git commit -m "feat: add Dexie client and onboarding CRUD service"
```

---

## Task 5: Create Zustand Store

**Files:**
- Create: `src/store/use-onboarding-store.ts`
- Create: `src/__tests__/store/use-onboarding-store.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingStore } from '@/store/use-onboarding-store';
import type { RunnerProfile } from '@/types/onboarding';

describe('useOnboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      currentStep: 1,
      isCompleted: false,
      profileId: null,
      profile: {},
    });
  });

  it('has correct initial state', () => {
    const state = useOnboardingStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.isCompleted).toBe(false);
    expect(state.profileId).toBeNull();
    expect(state.profile).toEqual({});
  });

  describe('setCurrentStep', () => {
    it('sets the current step', () => {
      useOnboardingStore.getState().setCurrentStep(3);
      expect(useOnboardingStore.getState().currentStep).toBe(3);
    });
  });

  describe('setProfileId', () => {
    it('sets the profile id', () => {
      useOnboardingStore.getState().setProfileId('abc-123');
      expect(useOnboardingStore.getState().profileId).toBe('abc-123');
    });
  });

  describe('updateBasics', () => {
    it('merges basics data into profile', () => {
      useOnboardingStore.getState().updateBasics({ age: 30, sex: 'male' });
      const { basics } = useOnboardingStore.getState().profile;
      expect(basics).toEqual({ age: 30, sex: 'male' });
    });

    it('preserves existing basics fields', () => {
      useOnboardingStore.getState().updateBasics({ age: 30 });
      useOnboardingStore.getState().updateBasics({ sex: 'female' });
      const { basics } = useOnboardingStore.getState().profile;
      expect(basics).toEqual({ age: 30, sex: 'female' });
    });
  });

  describe('updateCurrentFitness', () => {
    it('merges currentFitness data into profile', () => {
      useOnboardingStore.getState().updateCurrentFitness({ weeklyMileage: 25 });
      const { currentFitness } = useOnboardingStore.getState().profile;
      expect(currentFitness).toEqual({ weeklyMileage: 25 });
    });
  });

  describe('updatePersonalBests', () => {
    it('replaces personalBests array', () => {
      const bests = [{ distance: '5k' as const, time: '25:30' }];
      useOnboardingStore.getState().updatePersonalBests(bests);
      expect(useOnboardingStore.getState().profile.personalBests).toEqual(bests);
    });
  });

  describe('updateLifestyleConstraints', () => {
    it('merges lifestyleConstraints data into profile', () => {
      useOnboardingStore
        .getState()
        .updateLifestyleConstraints({ crossTraining: true });
      const { lifestyleConstraints } = useOnboardingStore.getState().profile;
      expect(lifestyleConstraints).toEqual({ crossTraining: true });
    });
  });

  describe('completeOnboarding', () => {
    it('sets isCompleted and step to 6', () => {
      useOnboardingStore.getState().completeOnboarding();
      const state = useOnboardingStore.getState();
      expect(state.isCompleted).toBe(true);
      expect(state.currentStep).toBe(6);
    });
  });

  describe('resetOnboarding', () => {
    it('resets to initial state', () => {
      useOnboardingStore.getState().setProfileId('abc');
      useOnboardingStore.getState().setCurrentStep(3);
      useOnboardingStore.getState().updateBasics({ age: 30 });
      useOnboardingStore.getState().resetOnboarding();

      const state = useOnboardingStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.isCompleted).toBe(false);
      expect(state.profileId).toBeNull();
      expect(state.profile).toEqual({});
    });
  });

  describe('loadProfile', () => {
    it('loads a full profile into state', () => {
      const profile: RunnerProfile = {
        id: 'test-id',
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        basics: {
          age: 30,
          sex: 'male',
          experienceLevel: 'intermediate',
        },
        currentFitness: { weeklyMileage: 25, longestRecentRun: 10 },
        personalBests: [],
        lifestyleConstraints: {
          daysAvailable: { type: 'number', numberOfDays: 4 },
          crossTraining: false,
        },
      };

      useOnboardingStore.getState().loadProfile(profile);

      const state = useOnboardingStore.getState();
      expect(state.profileId).toBe('test-id');
      expect(state.profile).toEqual(profile);
      expect(state.isCompleted).toBe(false);
      expect(state.currentStep).toBe(1);
    });

    it('sets step to 6 for completed profile', () => {
      const profile: RunnerProfile = {
        id: 'test-id',
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        basics: {
          age: 30,
          sex: 'male',
          experienceLevel: 'intermediate',
        },
        currentFitness: { weeklyMileage: 25, longestRecentRun: 10 },
        personalBests: [],
        lifestyleConstraints: {
          daysAvailable: { type: 'number', numberOfDays: 4 },
          crossTraining: false,
        },
      };

      useOnboardingStore.getState().loadProfile(profile);

      const state = useOnboardingStore.getState();
      expect(state.isCompleted).toBe(true);
      expect(state.currentStep).toBe(6);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:run src/__tests__/store/use-onboarding-store.test.ts
```

Expected: FAIL — cannot resolve `@/store/use-onboarding-store`.

- [ ] **Step 3: Write the implementation**

```typescript
import { create } from 'zustand';
import type {
  RunnerProfile,
  Basics,
  CurrentFitness,
  PersonalBest,
  LifestyleConstraints,
} from '@/types/onboarding';

interface WizardState {
  currentStep: number;
  isCompleted: boolean;
  profileId: string | null;
  profile: Partial<RunnerProfile>;

  setCurrentStep: (step: number) => void;
  setProfileId: (id: string) => void;
  updateBasics: (data: Partial<Basics>) => void;
  updateCurrentFitness: (data: Partial<CurrentFitness>) => void;
  updatePersonalBests: (bests: PersonalBest[]) => void;
  updateLifestyleConstraints: (data: Partial<LifestyleConstraints>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  loadProfile: (profile: RunnerProfile) => void;
}

export const useOnboardingStore = create<WizardState>()((set) => ({
  currentStep: 1,
  isCompleted: false,
  profileId: null,
  profile: {},

  setCurrentStep: (step) => set({ currentStep: step }),

  setProfileId: (id) => set({ profileId: id }),

  updateBasics: (data) =>
    set((state) => ({
      profile: {
        ...state.profile,
        basics: { ...state.profile.basics, ...data } as Basics,
      },
    })),

  updateCurrentFitness: (data) =>
    set((state) => ({
      profile: {
        ...state.profile,
        currentFitness: {
          ...state.profile.currentFitness,
          ...data,
        } as CurrentFitness,
      },
    })),

  updatePersonalBests: (bests) =>
    set((state) => ({
      profile: { ...state.profile, personalBests: bests },
    })),

  updateLifestyleConstraints: (data) =>
    set((state) => ({
      profile: {
        ...state.profile,
        lifestyleConstraints: {
          ...state.profile.lifestyleConstraints,
          ...data,
        } as LifestyleConstraints,
      },
    })),

  completeOnboarding: () => set({ isCompleted: true, currentStep: 6 }),

  resetOnboarding: () =>
    set({
      currentStep: 1,
      isCompleted: false,
      profileId: null,
      profile: {},
    }),

  loadProfile: (profile) =>
    set({
      profileId: profile.id,
      profile,
      isCompleted: profile.isCompleted,
      currentStep: profile.isCompleted ? 6 : 1,
    }),
}));
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:run src/__tests__/store/use-onboarding-store.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/use-onboarding-store.ts src/__tests__/store/use-onboarding-store.test.ts
git commit -m "feat: add Zustand store for onboarding wizard state"
```

---

## Task 6: Create useAutoSave Hook

**Files:**
- Create: `src/hooks/use-auto-save.ts`
- Create: `src/__tests__/hooks/use-auto-save.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useOnboardingStore } from '@/store/use-onboarding-store';
import * as service from '@/services/indexed-db/onboarding-service';

vi.mock('@/services/indexed-db/onboarding-service', () => ({
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useOnboardingStore.setState({
      currentStep: 1,
      isCompleted: false,
      profileId: null,
      profile: {},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('does not save when profileId is null', () => {
    renderHook(() => useAutoSave());
    vi.advanceTimersByTime(1000);
    expect(service.updateProfile).not.toHaveBeenCalled();
  });

  it('saves after debounce delay', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
    });

    renderHook(() => useAutoSave());
    expect(service.updateProfile).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(service.updateProfile).toHaveBeenCalledWith(
      'test-id',
      expect.objectContaining({
        basics: { age: 30, sex: 'male', experienceLevel: 'new' },
      })
    );
  });

  it('does not save before debounce completes', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
    });

    renderHook(() => useAutoSave());
    vi.advanceTimersByTime(300);
    expect(service.updateProfile).not.toHaveBeenCalled();
  });

  it('debounces rapid updates', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 25, sex: 'female', experienceLevel: 'new' } },
    });

    renderHook(() => useAutoSave());

    vi.advanceTimersByTime(300);
    useOnboardingStore.getState().updateBasics({ age: 26 });
    vi.advanceTimersByTime(300);
    useOnboardingStore.getState().updateBasics({ age: 27 });
    vi.advanceTimersByTime(500);

    expect(service.updateProfile).toHaveBeenCalledTimes(1);
  });

  it('uses custom delay when provided', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
    });

    renderHook(() => useAutoSave(1000));
    vi.advanceTimersByTime(500);
    expect(service.updateProfile).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(service.updateProfile).toHaveBeenCalledTimes(1);
  });

  it('returns isSaving state', () => {
    useOnboardingStore.setState({
      profileId: 'test-id',
      profile: { basics: { age: 30, sex: 'male', experienceLevel: 'new' } },
    });

    const { result } = renderHook(() => useAutoSave());
    expect(result.current.isSaving).toBe(false);

    vi.advanceTimersByTime(500);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:run src/__tests__/hooks/use-auto-save.test.ts
```

Expected: FAIL — cannot resolve `@/hooks/use-auto-save`.

- [ ] **Step 3: Write the implementation**

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { useOnboardingStore } from '@/store/use-onboarding-store';
import { updateProfile } from '@/services/indexed-db/onboarding-service';

export function useAutoSave(delay = 500) {
  const profileId = useOnboardingStore((state) => state.profileId);
  const profile = useOnboardingStore((state) => state.profile);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(async () => {
    if (!profileId) return;
    setIsSaving(true);
    try {
      await updateProfile(profileId, profile);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [profileId, profile]);

  useEffect(() => {
    if (!profileId) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(save, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [profileId, profile, delay, save]);

  return { isSaving };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:run src/__tests__/hooks/use-auto-save.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-auto-save.ts src/__tests__/hooks/use-auto-save.test.ts
git commit -m "feat: add useAutoSave hook with debounced IndexedDB persistence"
```

---

## Task 7: Create useOnboardingNavigation Hook

**Files:**
- Create: `src/hooks/use-onboarding-navigation.ts`
- Create: `src/__tests__/hooks/use-onboarding-navigation.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingNavigation } from '@/hooks/use-onboarding-navigation';
import { useOnboardingStore } from '@/store/use-onboarding-store';

describe('useOnboardingNavigation', () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      currentStep: 1,
      isCompleted: false,
      profileId: null,
      profile: {},
    });
  });

  it('starts at step 1 as first step', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastDataStep).toBe(false);
    expect(result.current.isSummary).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  it('navigates forward from step 1 to step 2', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goForward());
    expect(result.current.currentStep).toBe(2);
    expect(result.current.isFirstStep).toBe(false);
  });

  it('navigates forward through all data steps', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goForward());
    expect(result.current.currentStep).toBe(2);
    act(() => result.current.goForward());
    expect(result.current.currentStep).toBe(3);
    act(() => result.current.goForward());
    expect(result.current.currentStep).toBe(4);
    expect(result.current.isLastDataStep).toBe(true);
  });

  it('navigates from step 4 to summary', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goForward());
    act(() => result.current.goForward());
    act(() => result.current.goForward());
    act(() => result.current.goForward());
    expect(result.current.isSummary).toBe(true);
    expect(result.current.currentStep).toBe(5);
  });

  it('navigates from summary to complete', () => {
    useOnboardingStore.setState({ currentStep: 5 });
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goForward());
    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentStep).toBe(6);
  });

  it('does not go back from step 1', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe(1);
  });

  it('navigates back from step 2 to step 1', () => {
    useOnboardingStore.setState({ currentStep: 2 });
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe(1);
  });

  it('navigates back from summary to step 4', () => {
    useOnboardingStore.setState({ currentStep: 5 });
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe(4);
  });

  it('goToStep navigates to a specific data step', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goToStep(3));
    expect(result.current.currentStep).toBe(3);
  });

  it('goToStep ignores out of range steps', () => {
    const { result } = renderHook(() => useOnboardingNavigation());
    act(() => result.current.goToStep(10));
    expect(result.current.currentStep).toBe(1);
    act(() => result.current.goToStep(0));
    expect(result.current.currentStep).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:run src/__tests__/hooks/use-onboarding-navigation.test.ts
```

Expected: FAIL — cannot resolve `@/hooks/use-onboarding-navigation`.

- [ ] **Step 3: Write the implementation**

```typescript
import { useOnboardingStore } from '@/store/use-onboarding-store';

export function useOnboardingNavigation() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);

  const isFirstStep = currentStep === 1;
  const isLastDataStep = currentStep === 4;
  const isSummary = currentStep === 5;
  const isComplete = currentStep === 6;

  const goBack = () => {
    if (isSummary) {
      setCurrentStep(4);
    } else if (!isFirstStep && !isComplete) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goForward = () => {
    if (isLastDataStep) {
      setCurrentStep(5);
    } else if (isSummary) {
      setCurrentStep(6);
    } else if (!isSummary && !isComplete) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  return {
    currentStep,
    isFirstStep,
    isLastDataStep,
    isSummary,
    isComplete,
    goBack,
    goForward,
    goToStep,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test:run src/__tests__/hooks/use-onboarding-navigation.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-onboarding-navigation.ts src/__tests__/hooks/use-onboarding-navigation.test.ts
git commit -m "feat: add useOnboardingNavigation hook for wizard step management"
```

---

## Task 8: Final Validation

- [ ] **Step 1: Run all quality checks**

```bash
pnpm run validate
```

Expected: All checks pass — linting, formatting, type checking, and tests (including the pre-existing `App.test.tsx`).

If formatting issues are found, run `pnpm format` and commit the fix.

- [ ] **Step 2: Commit any formatting fixes (if needed)**

```bash
git add -A
git commit -m "style: fix formatting"
```
