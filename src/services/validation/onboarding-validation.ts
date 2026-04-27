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
