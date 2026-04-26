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
      expect(basicsSchema.safeParse({ ...validBasics, experienceLevel: level }).success).toBe(true);
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
    expect(basicsSchema.safeParse({ ...validBasics, height: 'prefer-not-to-say' }).success).toBe(
      true
    );
  });

  it('accepts numeric weight', () => {
    expect(basicsSchema.safeParse({ ...validBasics, weight: 70 }).success).toBe(true);
  });

  it('accepts prefer-not-to-say for weight', () => {
    expect(basicsSchema.safeParse({ ...validBasics, weight: 'prefer-not-to-say' }).success).toBe(
      true
    );
  });

  it('accepts numeric restingHR', () => {
    expect(basicsSchema.safeParse({ ...validBasics, restingHR: 60 }).success).toBe(true);
  });

  it('accepts prefer-not-to-say for restingHR', () => {
    expect(basicsSchema.safeParse({ ...validBasics, restingHR: 'prefer-not-to-say' }).success).toBe(
      true
    );
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
    expect(currentFitnessSchema.safeParse({ ...validFitness, longestRecentRun: -1 }).success).toBe(
      false
    );
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
    expect(personalBestSchema.safeParse({ distance: '5k', time: '1:30:00' }).success).toBe(true);
  });

  it('accepts HH:MM:SS time format', () => {
    expect(personalBestSchema.safeParse({ distance: '5k', time: '01:30:00' }).success).toBe(true);
  });

  it('accepts MM:SS time format', () => {
    expect(personalBestSchema.safeParse({ distance: '5k', time: '25:30' }).success).toBe(true);
  });

  it('rejects invalid time format', () => {
    expect(personalBestSchema.safeParse({ distance: '5k', time: 'invalid' }).success).toBe(false);
  });
});

describe('lifestyleConstraintsSchema', () => {
  it('accepts specific days mode', () => {
    expect(
      lifestyleConstraintsSchema.safeParse({
        daysAvailable: {
          type: 'specific',
          specificDays: ['Monday', 'Wednesday', 'Friday'],
        },
        crossTraining: true,
      }).success
    ).toBe(true);
  });

  it('accepts number days mode', () => {
    expect(
      lifestyleConstraintsSchema.safeParse({
        daysAvailable: { type: 'number', numberOfDays: 4 },
        crossTraining: false,
      }).success
    ).toBe(true);
  });

  it('rejects specific days with empty array', () => {
    expect(
      lifestyleConstraintsSchema.safeParse({
        daysAvailable: { type: 'specific', specificDays: [] },
        crossTraining: false,
      }).success
    ).toBe(false);
  });

  it('rejects numberOfDays below 3', () => {
    expect(
      lifestyleConstraintsSchema.safeParse({
        daysAvailable: { type: 'number', numberOfDays: 2 },
        crossTraining: false,
      }).success
    ).toBe(false);
  });

  it('rejects numberOfDays above 7', () => {
    expect(
      lifestyleConstraintsSchema.safeParse({
        daysAvailable: { type: 'number', numberOfDays: 8 },
        crossTraining: false,
      }).success
    ).toBe(false);
  });

  it('accepts optional preferredLongRunDay', () => {
    expect(
      lifestyleConstraintsSchema.safeParse({
        daysAvailable: { type: 'number', numberOfDays: 4 },
        preferredLongRunDay: 'Saturday',
        crossTraining: false,
      }).success
    ).toBe(true);
  });

  it('rejects missing crossTraining', () => {
    expect(
      lifestyleConstraintsSchema.safeParse({
        daysAvailable: { type: 'number', numberOfDays: 4 },
      }).success
    ).toBe(false);
  });
});
