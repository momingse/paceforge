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
