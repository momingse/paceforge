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
