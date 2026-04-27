import type {
  Basics,
  CurrentFitness,
  PersonalBest,
  LifestyleConstraints,
} from '@/services/validation/onboarding-validation';

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
