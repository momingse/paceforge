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
      useOnboardingStore.getState().updateLifestyleConstraints({ crossTraining: true });
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
