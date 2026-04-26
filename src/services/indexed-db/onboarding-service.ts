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
