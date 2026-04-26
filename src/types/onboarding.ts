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
