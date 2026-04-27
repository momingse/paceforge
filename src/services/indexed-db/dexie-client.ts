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
