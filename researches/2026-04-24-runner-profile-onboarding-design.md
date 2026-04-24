# Runner Profile Onboarding Wizard Design

## Executive Summary

This design document outlines the implementation of a runner profile collection onboarding wizard for PaceForge. The wizard will collect essential user information through a progressive, multi-step form interface, persisting data in IndexedDB and marking onboarding as complete once finished. The wizard serves as the starting point for generating personalized AI-assisted running training plans.

## Scope

**In Scope:**
- Multi-step wizard with 4 progressive steps for data collection
- Summary page with edit capabilities before final submission
- Auto-save functionality using IndexedDB for data persistence
- Progress indicator showing user's position in the wizard
- Navigation controls (back/forward) between steps
- Form validation with inline feedback
- "Prefer not to say" options for optional fields
- Dummy "Thank You" page upon completion
- Prevention of wizard access after completion

**Out of Scope:**
- AI training plan generation (future feature)
- Profile modification after onboarding (future feature)
- Integration with external APIs beyond IndexedDB
- Advanced analytics or data visualization

## Architecture Overview

The onboarding wizard follows PaceForge's client-first architecture, using React for the UI layer, Zustand for state management, and IndexedDB for data persistence. The wizard operates as a standalone module within the broader PaceForge application but maintains integration with the overall app architecture.

### Component Architecture

```
OnboardingWizard (Main Container)
├── WizardHeader
│   ├── AppLogo
│   └── ProgressIndicator
│       ├── StepCircles (1-4)
│       └── ProgressLabel
├── WizardContent
│   ├── Step1Basics
│   │   ├── AgeInput
│   │   ├── SexSelector
│   │   ├── HeightWeightInputs
│   │   ├── RestingHRInput
│   │   └── ExperienceLevelDropdown
│   ├── Step2CurrentFitness
│   │   ├── WeeklyMileageInput
│   │   └── LongestRecentRunInput
│   ├── Step3PersonalBests
│   │   ├── PBForm (repeatable for each distance)
│   │   │   ├── DistanceSelector
│   │   │   ├── TimeInput
│   │   │   └── DateInput
│   │   └── AddPBButton
│   ├── Step4LifestyleConstraints
│   │   ├── DaysAvailableToggle
│   │   ├── SpecificDaysSelector
│   │   ├── NumberDaysInput
│   │   ├── PreferredLongRunDaySelector
│   │   └── CrossTrainingToggle
│   ├── SummaryPage
│   │   ├── ProfileSummary
│   │   │   ├── BasicsSummary
│   │   │   ├── FitnessSummary
│   │   │   ├── PBSummary
│   │   │   └── LifestyleSummary
│   │   └── EditButtons
│   └── ThankYouPage
│       ├── SuccessMessage
│       └── ContinueButton
└── WizardNavigation
    ├── BackButton
    ├── ContinueButton
    └── SubmitButton
```

### Technology Stack

- **React + TypeScript**: UI components with type safety
- **Zustand**: Lightweight state management for wizard state
- **Dexie.js**: IndexedDB wrapper for data persistence
- **React Router**: Page routing and navigation
- **Tailwind CSS**: Utility-first styling
- **Vitest + React Testing Library**: Component testing

## Data Models

### Runner Profile Interface

```typescript
interface RunnerProfile {
  id: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Step 1: Basics
  basics: {
    age: number;
    sex: 'male' | 'female' | 'prefer-not-to-say';
    height?: number | 'prefer-not-to-say';
    weight?: number | 'prefer-not-to-say';
    restingHR?: number | 'prefer-not-to-say';
    experienceLevel: 'new' | 'intermediate' | 'advanced';
  };

  // Step 2: Current Fitness
  currentFitness: {
    weeklyMileage: number;
    longestRecentRun: number; // in miles
  };

  // Step 3: Personal Bests
  personalBests: {
    distance: '5k' | '10k' | 'half-marathon' | 'marathon';
    time?: string; // format: "HH:MM:SS"
    date?: string; // ISO date string
  }[];

  // Step 4: Lifestyle Constraints
  lifestyleConstraints: {
    daysAvailable: {
      type: 'specific' | 'number';
      specificDays?: string[]; // ['Monday', 'Wednesday', 'Friday']
      numberOfDays?: number; // 3-7
    };
    preferredLongRunDay?: string; // 'Monday' | 'Tuesday' | ... | 'Sunday'
    crossTraining: boolean;
  };
}
```

### Zustand Store Interface

```typescript
interface WizardState {
  currentStep: number;
  isCompleted: boolean;
  profile: Partial<RunnerProfile>;

  // Actions
  setCurrentStep: (step: number) => void;
  updateBasics: (data: Partial<RunnerProfile['basics']>) => void;
  updateCurrentFitness: (data: Partial<RunnerProfile['currentFitness']>) => void;
  updatePersonalBests: (bests: RunnerProfile['personalBests']) => void;
  updateLifestyleConstraints: (data: Partial<RunnerProfile['lifestyleConstraints']>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}
```

## User Experience Flow

### Navigation Flow

1. **Initial Entry**: User accesses `/onboarding` route
2. **Progress Check**: System checks IndexedDB for existing profile
   - No data → Start at Step 1
   - Incomplete data → Restore to last step with saved data
   - Complete data → Redirect to main app (wizard inaccessible)
3. **Step Progression**: Users navigate through 4 steps
   - Can move back and forth freely
   - Auto-save triggers on each navigation
   - Validation occurs before allowing forward navigation
4. **Summary Review**: After Step 4, users see complete profile
   - Data organized by section
   - Each section has "Edit" button
   - "Continue" button moves to Thank You page
5. **Completion**: Thank You page marks onboarding complete
   - Saves completion status to IndexedDB
   - Prevents future access to wizard
   - Shows simple success message

### Form Interactions

- Real-time validation feedback with inline error messages
- "Prefer not to say" radio buttons for optional fields (height, weight, resting HR)
- Dynamic form fields for PB entries (add/remove functionality)
- Auto-save notification (small toast message)
- Keyboard navigation support for accessibility
- Mobile-responsive design for all screen sizes
- Animated transitions between steps for "cool" user experience

### Error Handling

- Form-level validation errors with clear, actionable feedback
- IndexedDB error recovery (fallback to session storage if needed)
- Network/timeout handling for persistence operations
- User-friendly error messages with suggested actions
- Prevent navigation if validation fails
- Handle browser quota exceeded for IndexedDB

## File Organization

```
src/
├── components/
│   └── onboarding/
│       ├── OnboardingWizard.tsx
│       ├── WizardHeader/
│       │   ├── index.tsx
│       │   └── ProgressIndicator.tsx
│       ├── steps/
│       │   ├── Step1Basics.tsx
│       │   ├── Step2CurrentFitness.tsx
│       │   ├── Step3PersonalBests.tsx
│       │   ├── Step4LifestyleConstraints.tsx
│       ├── pages/
│       │   ├── SummaryPage.tsx
│       │   └── ThankYouPage.tsx
│       └── navigation/
│           └── WizardNavigation.tsx
├── store/
│   ├── onboardingStore.ts
│   └── useOnboardingStore.ts
├── services/
│   ├── indexedDB/
│   │   ├── dexieClient.ts
│   │   └── onboardingService.ts
│   └── validation/
│       └── onboardingValidation.ts
├── types/
│   └── onboarding.ts
└── hooks/
    ├── useAutoSave.ts
    └── useOnboardingNavigation.ts
```

## Technical Implementation Details

### IndexedDB Integration

**Database Schema:**
```typescript
interface PaceForgeDB extends Dexie {
  runnerProfiles: Table<RunnerProfile, string>;
}
```

**Service Methods:**
- `createProfile()`: Create new profile with generated ID
- `getProfile(id: string)`: Retrieve profile by ID
- `updateProfile(id: string, data: Partial<RunnerProfile>)`: Update profile
- `getActiveProfile()`: Find incomplete profile for restoration
- `markComplete(id: string)`: Mark profile as completed
- `deleteProfile(id: string)`: Remove profile (for testing/cleanup)

**Auto-Save Implementation:**
- Debounce save operations with 500ms delay
- Show "Saving..." indicator during persistence
- Display "Saved" confirmation toast upon success
- Implement conflict resolution for concurrent saves
- Handle offline scenarios gracefully

### Validation Rules

```typescript
const validationRules = {
  age: { min: 0, max: 200, required: true },
  sex: { required: true, enum: ['male', 'female', 'prefer-not-to-say'] },
  weeklyMileage: { min: 0, max: 1000, required: true },
  longestRecentRun: { min: 0, max: 26.2, required: true },
  timeFormat: { pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/ },
  numberOfDays: { min: 3, max: 7, required: true }
};
```

**Experience Level Examples:**
- **New**: Less than 6 months of consistent running, typically <20 miles/week
- **Intermediate**: 6 months to 2 years of running, typically 20-40 miles/week
- **Advanced**: 2+ years of running, typically >40 miles/week with race experience

### State Management Patterns

**Zustand Store Structure:**
- State matches RunnerProfile interface for consistency
- Actions for each form section to enable granular updates
- Validation middleware before state updates to prevent invalid data
- Computed selectors for form validation status and completion eligibility
- Auto-save middleware that triggers persistence on state changes

**Performance Optimizations:**
- Debounce auto-save operations to prevent excessive IndexedDB writes
- Use React.memo for component optimization where appropriate
- Implement lazy loading for larger components
- Use CSS animations instead of JavaScript animations for performance

### Routing Integration

**Route Structure:**
- `/onboarding` - Main wizard route (publicly accessible initially)
- `/onboarding/summary` - Summary page review
- `/onboarding/complete` - Thank you page

**Route Guards:**
- Check IndexedDB for completed profile status
- Redirect to `/dashboard` if onboarding is complete
- Handle browser back/forward navigation properly
- Prevent direct access to intermediate steps (wizard must flow linearly)

## Testing Strategy

### Component Tests (Vitest + React Testing Library)

**Coverage Requirements:**
- Component tests: 80%+ coverage
- All user interactions tested
- Form validation thoroughly tested
- Auto-save functionality verified
- Navigation logic validated

**Test Scenarios:**
- Form input and validation for all step fields
- Step navigation logic (back/forward controls)
- Auto-save triggers and data persistence
- Summary page display and edit functionality
- Error handling and user feedback messages
- Accessibility compliance (WCAG AA)

### Integration Tests

**Test Coverage:**
- Complete wizard flow from start to finish
- IndexedDB persistence across sessions
- Browser refresh recovery scenarios
- Completion status enforcement
- Edge case handling (incomplete data, quota exceeded)

### E2E Tests

**Main User Flows:**
- New user completes full onboarding
- Returning user continues from saved progress
- User modifies data in summary page
- Error recovery scenarios

## Success Criteria

**Functional Requirements:**
- ✅ Multi-step wizard with 4 progressive data collection steps
- ✅ Users can navigate back and forth between steps
- ✅ Auto-save functionality using IndexedDB for data persistence
- ✅ Progress indicator showing user's position in the wizard
- ✅ Form validation with inline feedback
- ✅ Summary page with edit capabilities
- ✅ Dummy "Thank You" page upon completion
- ✅ Prevention of wizard access after completion

**Non-Functional Requirements:**
- ✅ Data persists across browser sessions
- ✅ Auto-save occurs seamlessly without user interruption
- ✅ Wizard is accessible and keyboard navigable
- ✅ Mobile-responsive design for all screen sizes
- ✅ "Cool" visual design with smooth animations
- ✅ Performance: <2s initial load, <500ms step transitions

## Implementation Phases

### Phase 1: Foundation (1-2 days)
- Set up file structure and TypeScript types
- Implement IndexedDB service layer with Dexie.js
- Create Zustand store with basic state management
- Set up routing structure

### Phase 2: Wizard Steps (2-3 days)
- Build Step1Basics component with all form fields
- Build Step2CurrentFitness component
- Build Step3PersonalBests component with dynamic PB entries
- Build Step4LifestyleConstraints component with dual input modes

### Phase 3: Navigation & Progress (1-2 days)
- Implement wizard navigation logic
- Build ProgressIndicator component
- Add validation and error handling
- Implement auto-save functionality

### Phase 4: Completion Flow (1 day)
- Build SummaryPage with edit capabilities
- Build ThankYouPage
- Implement completion status tracking
- Add route guards for completed profiles

### Phase 5: Polish & Testing (1-2 days)
- Implement "cool" design elements and animations
- Add toast notifications for auto-save
- Write comprehensive tests
- Accessibility audit and improvements
- Performance optimization

## Future Considerations

**Planned Enhancements:**
- AI training plan generation using collected profile data
- Profile modification interface in main app settings
- Data export/import functionality for backup
- Advanced analytics and insights based on profile data
- Integration with running apps/devices (Strava, Garmin, etc.)
- Social sharing and community features

**Technical Debt to Monitor:**
- Monitor IndexedDB performance with large datasets
- Consider implementing data compression if profiles grow complex
- Evaluate need for migration strategy as data structure evolves

---

**Document Version**: 1.0
**Last Updated**: 2026-04-24
**Status**: Ready for Implementation
