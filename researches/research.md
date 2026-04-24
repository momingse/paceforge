# Research: Running Plan AI Web App

## 1. Executive Summary

This research document provides a comprehensive analysis of all possible solutions for building PaceForge, a browser-based AI-assisted running training plan editor. The application enables runners to create, manage, and personalize their training plans with intelligent AI recommendations, all running entirely in the browser with no backend server.

### Key Value Proposition
- **Personalized Coaching at Scale**: AI provides individualized training advice comparable to professional coaches
- **Instant Adaptation**: Plans adjust in real-time based on user feedback and lifestyle constraints
- **Evidence-Based Training**: Leverages proven training principles (progressive overload, periodization, recovery)
- **Zero-Friction Onboarding**: No account creation required, immediate value delivery

### Technical Philosophy
- **Client-First Architecture**: All computation and data persistence in the browser
- **Modular AI Layer**: Router pattern enables seamless LLM provider switching
- **Progressive Enhancement**: Core functionality works offline, AI features require API key
- **Privacy-By-Design**: User data never leaves their device (except for AI API calls)

---

## 2. Feature Breakdown & Implementation Options

### 2.1 Running Plan Editor

#### Current State of Running Plan Editors

**Runna** ([runna.com](https://runna.com))
- Strengths: Clean UI, structured workout templates, clear progression logic
- Pattern: Uses JSON-based workout schemas with type, duration, effort zones
- Gap: Limited customization, AI suggestions are surface-level

**TrainingPeaks** ([trainingpeaks.com](https://trainingpeaks.com))
- Strengths: Comprehensive performance metrics, TSS tracking, professional athlete tools
- Pattern: XML-based workout definitions, rich metadata for each session
- Gap: Overly complex for recreational runners, steep learning curve

**Nike Run Club** ([nike.com/nrc](https://nike.com/nrc))
- Strengths: Gamification, social features, intuitive workout cards
- Pattern: Card-based UI with swipe interactions, emoji-based effort indicators
- Gap: Limited plan editing capabilities, locked into Nike ecosystem

**Strava Training Plans** ([strava.com](https://strava.com))
- Strengths: Integration with real activity data, community sharing
- Pattern: Plan templates that sync with calendar views
- Gap: AI suggestions minimal, rigid plan structure

#### Recommended Implementation Approach

**Data Schema**
```typescript
interface Workout {
  id: string;
  date: Date;
  type: 'easy' | 'tempo' | 'intervals' | 'long' | 'recovery' | 'race' | 'cross_training';
  primaryMetric: 'distance' | 'time' | 'effort';
  targetValue: number; // in km, minutes, or RPE 1-10
  targetPace?: string; // e.g., "5:30/km"
  effortZone?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
  description: string;
  intervals?: IntervalSet[];
  completed: boolean;
  actualData?: {
    distance: number;
    time: number;
    pace: string;
  };
}

interface IntervalSet {
  id: string;
  repeatCount: number;
  work: { distance?: number; time?: number; pace: string; };
  recovery: { type: 'distance' | 'time'; value: number; };
}
```

**Editor UI Patterns**
- **Week View**: Drag-and-drop calendar with day-level summary cards
- **Detail View**: Rich workout editor with form inputs and real-time validation
- **Quick Actions**: "Duplicate Day", "Swap Rest Day", "Increase Intensity" buttons
- **Visual Feedback**: Color-coded effort zones, progress bars for weekly volume

**Advanced Features to Implement**
- **Template Library**: Pre-built plans for common goals (5K, 10K, marathon)
- **Plan Validation**: Warn about overtraining (e.g., "3 hard days in a row")
- **Smart Copy/Paste**: Preserve context when moving workouts (e.g., adjust dates)
- **Keyboard Shortcuts**: Power user features (Cmd+D duplicate, Cmd+Shift+R insert rest day)

---

### 2.2 AI Chat Assistant

#### Current AI Integration Patterns

**Hume AI** ([hume.ai](https://hume.ai)) - Not applicable to running, but pioneering emotional AI
**Insider AI** - Running-specific but limited to basic Q&A
**Most Running Apps**: Rule-based chatbots, no true LLM integration

#### Recommended Implementation: Agentic Chat System

**Architecture Pattern: SOFA-Inspired Agent**

```typescript
// SOFA = State, Observation, Function, Action
interface RunningCoachAgent {
  state: {
    userContext: UserContext;
    planContext: TrainingPlan;
    conversationHistory: Message[];
  };

  observation: {
    detectUserFatigue: (message: string) => boolean;
    detectInjurySignals: (message: string) => boolean;
    detectPerformanceGoals: (message: string) => Goal | null;
  };

  function: {
    adjustWorkout: (workoutId: string, modifications: Partial<Workout>) => void;
    shiftPlan: (days: number) => void;
    recommendAlternative: (workoutId: string) => Workout[];
    explainRationale: (modification: Modification) => string;
  };

  action: {
    executeModification: () => void;
    requestConfirmation: () => void;
    provideEducationalContent: () => void;
  };
}
```

**Chat Prompt Engineering Strategy**

```markdown
# System Prompt Structure

## Role Definition
You are an expert running coach with 15+ years of experience coaching athletes from beginners to elite marathoners. Your training philosophy is evidence-based, prioritizing consistency over intensity.

## Constraints
1. Never suggest running through injury signals
2. Always preserve progressive overload when adjusting plans
3. Provide reasoning for all modifications
4. If uncertain, ask clarifying questions before making changes

## Safety Guardrails
- Detect injury language: "pain", "hurt", "injury", "sore" (in concerning context)
- Detect burnout language: "exhausted", "overwhelmed", "can't do this"
- When detected, recommend rest and professional consultation

## Available Tools
- modifyWorkout(id, changes)
- insertRestDay(date)
- adjustWeeklyVolume(percentage)
- analyzePeriodizationGoals()

## Output Format
- Conversational first (empathy + explanation)
- JSON tool call when action needed
- Educational context after action
```

**Natural Language Capabilities**
- **Intent Recognition**: Classify user requests (modify, query, vent, celebrate)
- **Temporal Understanding**: "Next Tuesday's workout", "The week after my marathon"
- **Contextual References**: "That one I missed two weeks ago", "The tempo from last month"
- **Emotional Intelligence**: Recognize frustration, excitement, anxiety and respond appropriately

**Recommended Implementation Stack**
- **Provider**: Google Generative AI SDK (`@google/generative-ai`)
- **Router**: AI SDK Router (`@ai-sdk/google` + `@ai-sdk/openai`)
- **Streaming**: Server-Sent Events for real-time responses
- **Memory Management**: Windowed conversation history (last 10 messages + system prompt)

---

### 2.3 Period Goals System

#### Training Periodization Models

**Traditional Periodization** (Bompa & Haff)
- **Macrocycles**: Season-long (12-16 weeks)
- **Mesocycles**: Training phases (4-6 weeks each)
- **Microcycles**: Weekly blocks

**Modern Models**
- **Reverse Periodization**: Start with high intensity, increase volume
- **Polarized Training**: 80% easy, 20% hard (Seiler)
- **Undulating**: Daily/weekly variation in intensity

#### Implementation Strategy

```typescript
interface TrainingBlock {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal: TrainingGoal;
  focusAreas: string[];
  periodizationPattern: 'linear' | 'polarized' | 'undulating';
}

type TrainingGoal =
  | { type: 'base_build'; target: 'endurance' | 'strength' }
  | { type: 'race_prep'; event: Event }
  | { type: 'maintain'; fitnessLevel: 'recreational' | 'competitive' }
  | { type: 'recovery'; reason: string }
  | { type: 'peak_performance'; timeGoal: string };

interface AIGoalPrompt {
  block: TrainingBlock;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyVolume: number; // km/week
  availableDays: number; // per week
}
```

**Goal Templates for Users**
- "Build aerobic base for marathon in 12 weeks"
- "Maintain fitness during busy work month"
- "Peak for 5K on [date] with sub-20 goal"
- "Recover from injury with gradual return"
- "Train for first half-marathon"

**AI Goal Expansion**
- Convert vague goals to specific metrics
- Generate appropriate workout types based on goal
- Set progressive difficulty curves
- Calculate recovery periods

---

### 2.4 Event & Activity Integration

#### Event Management System

```typescript
interface Event {
  id: string;
  name: string;
  date: Date;
  distance: number; // km
  goalTime?: string; // e.g., "4:15:00"
  priority: 'A' | 'B' | 'C'; // A races get priority
  type: 'road' | 'trail' | 'track' | 'virtual';
  registered: boolean;
}

interface Activity {
  id: string;
  date: Date;
  type: 'run' | 'cycle' | 'swim' | 'strength' | 'other';
  duration: number; // minutes
  distance?: number; // km
  pace?: string;
  effort: number; // RPE 1-10
  heartRate?: number; // bpm
  route?: string; // map data
  notes?: string;
}
```

**Taper Calculation Logic**
```typescript
function calculateTaper(raceDate: Date, raceDistance: number): TaperPlan {
  const taperDays = {
    '5K': 7,
    '10K': 10,
    'half_marathon': 14,
    'marathon': 21
  }[raceDistance] || 14;

  const taperStart = new Date(raceDate);
  taperStart.setDate(taperStart.getDate() - taperDays);

  // Progressive volume reduction: 80%, 60%, 40% of peak
  return {
    startDate: taperStart,
    endDate: raceDate,
    volumeCurve: [0.8, 0.6, 0.4, 0.2],
    maintainIntensity: true,
    reduceDuration: true
  };
}
```

**Peak Week Identification**
- Find week with highest total volume before taper
- Preserve quality workouts in peak week
- Ensure adequate recovery before peak

**Post-Race Recovery Recommendations**
- Automatic rest days assignment
- Reverse taper for return to training
- Mental recovery activities suggested

---

### 2.5 Training Feedback Loop

#### Feedback Data Model

```typescript
interface WorkoutFeedback {
  workoutId: string;
  rpe: number; // 1-10 Rate of Perceived Exertion
  feeling: 'terrible' | 'bad' | 'ok' | 'good' | 'excellent';
  actualDistance?: number;
  actualTime?: number;
  actualPace?: string;
  notes?: string;
  factors: {
    sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
    stressLevel: 'high' | 'medium' | 'low';
    nutrition: 'poor' | 'fair' | 'good';
    weather?: string;
    injuryConcern?: boolean;
  };
  submittedAt: Date;
}
```

#### AI Feedback Analysis System

**Fatigue Detection Pattern**
```typescript
interface FatigueSignal {
  type: 'acute' | 'chronic' | 'systemic';
  severity: 'mild' | 'moderate' | 'severe';
  triggers: string[];
  recommendedAction: 'continue' | 'reduce' | 'rest' | 'seek_professional';
}

function analyzeFeedback(feedback: WorkoutFeedback[]): FatigueSignal | null {
  const recentFeedback = feedback.slice(-7);

  // Acute fatigue: 3+ consecutive poor sessions
  const consecutivePoor = countConsecutive(recentFeedback, f => f.rpe > 8);
  if (consecutivePoor >= 3) {
    return { type: 'acute', severity: 'moderate', triggers: ['recent sessions'], recommendedAction: 'reduce' };
  }

  // Chronic fatigue: Trend of declining performance
  const performanceTrend = calculateTrend(recentFeedback.map(f => f.rpe));
  if (performanceTrend > 0.3) {
    return { type: 'chronic', severity: 'mild', triggers: ['sustained effort'], recommendedAction: 'rest' };
  }

  return null;
}
```

**Adaptive Plan Adjustment Rules**
1. **Consistent Overachieving**: If RPE consistently below target, gradually increase intensity
2. **Consistent Underachieving**: Reduce volume or extend recovery
3. **Pattern Recognition**: Identify weekly patterns (e.g., always tired on Mondays)
4. **Stress Integration**: Adjust based on sleep quality and stress levels

**Feedback UI Design**
- **Quick Rating**: Emoji-based selector (😢 to 🤩)
- **Smart Defaults**: Pre-fill actual data from GPS (if available)
- **Context Prompts**: "How was your sleep last night?" automatically appears after evening workouts
- **Visual Trends**: Charts showing RPE vs. effort over time

---

## 3. Technical Architecture Options

### 3.1 Frontend Framework Comparison

#### Option 1: **React + Vite** ⭐ RECOMMENDED

**Pros:**
- Largest ecosystem and community support
- Excellent developer experience with fast HMR
- Rich component libraries (shadcn/ui, Radix UI, Mantine)
- Strong TypeScript support
- Vite provides instant build times and optimized production bundles
- Easy to find solutions to any problem

**Cons:**
- Bundle size can grow large if not careful
- Requires understanding of React's mental model (hooks, effects)
- Some boilerplate for state management

**Package Recommendations:**
- `react` + `react-dom` (Core)
- `@vitejs/plugin-react` (Build tool)
- `react-router-dom` (Routing)
- `zustand` or `jotai` (State management - lightweight)
- `react-query` (Server state, even if using local storage)
- `zod` (Schema validation)
- `date-fns` (Date manipulation)

**Why Vite over CRA:**
- 10-100x faster HMR
- Native ES modules, no bundling during dev
- Better TypeScript support
- Active development and modern tooling

#### Option 2: **Next.js** (App Router)

**Pros:**
- Built-in routing and layouts
- Server components reduce bundle size
- Strong SEO capabilities (if we add server later)
- Excellent image optimization
- API routes available when needed

**Cons:**
- Overkill for pure client-side app
- Server components complexity not needed for local-first app
- Requires understanding of rendering strategies
- Larger initial learning curve

**When to Choose:** If planning to add backend, authentication, or need SSR in future.

#### Option 3: **SvelteKit**

**Pros:**
- Smaller bundle sizes (no virtual DOM)
- Simpler mental model (no hooks)
- Excellent performance
- Built-in state management

**Cons:**
- Smaller ecosystem than React
- Fewer third-party components
- Less hiring pool for future expansion
- Package maturity varies

**When to Choose:** If bundle size is critical and team prefers Vue-like syntax.

#### Option 4: **Vue 3 + Vite**

**Pros:**
- Gentle learning curve
- Excellent TypeScript support
- Good performance
- Comprehensive documentation

**Cons:**
- Smaller ecosystem than React
- Fewer enterprise-ready component libraries
- Less popular in modern tech stacks

**When to Choose:** If team already experienced with Vue.

#### Option 5: **SolidStart**

**Pros:**
- Excellent performance (fine-grained reactivity)
- React-like syntax
- Small bundle sizes

**Cons:**
- Smallest ecosystem
- Fewer learning resources
- Limited component libraries

**When to Choose:** For performance-critical applications with experienced Solid developers.

---

### 3.2 State Management & Local Storage Strategy

#### Recommended Architecture: **IndexedDB + Zustand + React Query**

**Why This Stack:**
1. **IndexedDB**: Stores large datasets, works offline, async API
2. **Zustand**: Lightweight, simple API, no boilerplate
3. **React Query**: Caching, optimistic updates, devtools

#### Implementation Pattern

```typescript
// IndexedDB Setup (using Dexie.js)
import Dexie, { Table } from 'dexie';

class PaceForgeDB extends Dexie {
  workouts!: Table<Workout>;
  events!: Table<Event>;
  feedback!: Table<WorkoutFeedback>;
  settings!: Table<AppSettings>;

  constructor() {
    super('PaceForgeDB');
    this.version(1).stores({
      workouts: 'date, type, completed',
      events: 'date, priority',
      feedback: 'workoutId, submittedAt',
      settings: 'key'
    });
  }
}

export const db = new PaceForgeDB();

// Zustand Store
import { create } from 'zustand';

interface AppState {
  workouts: Workout[];
  currentPlan: TrainingPlan;
  isLoading: boolean;

  // Actions
  loadWorkouts: () => Promise<void>;
  addWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  workouts: [],
  currentPlan: null,
  isLoading: false,

  loadWorkouts: async () => {
    set({ isLoading: true });
    const workouts = await db.workouts.toArray();
    set({ workouts, isLoading: false });
  },

  addWorkout: async (workout) => {
    await db.workouts.add(workout);
    set({ workouts: [...get().workouts, workout] });
  },

  // ... other actions
}));

// React Query Wrapper for IndexedDB
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => db.workouts.toArray()
  });
}

export function useAddWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workout: Workout) => {
      await db.workouts.add(workout);
      return workout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  });
}
```

#### Alternative: **LocalStorage + Simple Store**

**Use Case:** For MVP, if IndexedDB feels like overkill

```typescript
// LocalStorage persistence
const saveToLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

// Zustand with persistence middleware
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      workouts: [],
      addWorkout: (workout) => set((state) => ({ workouts: [...state.workouts, workout] }))
    }),
    {
      name: 'paceforge-storage',
      partialize: (state) => ({ workouts: state.workouts })
    }
  )
);
```

#### Recommended Decision: **Start with LocalStorage, migrate to IndexedDB**

**Rationale:**
- MVP: LocalStorage is sufficient for demo (5MB limit)
- Scale: Migrate to IndexedDB when data grows or need advanced queries
- Abstraction: Build a storage adapter interface to make migration painless

```typescript
interface StorageAdapter {
  get<T>(key: string): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter { /* ... */ }
class IndexedDBAdapter implements StorageAdapter { /* ... */ }
```

---

### 3.3 AI Integration (Gemini + Router)

#### Architecture: **AI SDK Router Pattern**

```typescript
// Unified AI interface using AI SDK
import { generateText, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

// Configuration
const aiConfig = {
  provider: 'google', // 'google' | 'openai' | 'anthropic'
  model: 'gemini-2.0-flash-exp',
  apiKey: localStorage.getItem('ai_api_key')
};

// Provider selection
const getProvider = () => {
  switch (aiConfig.provider) {
    case 'google': return google(apiConfig.model, { apiKey: aiConfig.apiKey });
    case 'openai': return openai('gpt-4o', { apiKey: aiConfig.apiKey });
    default: throw new Error('Unknown provider');
  }
};

// Usage
async function generatePlanResponse(userMessage: string, context: ConversationContext) {
  const result = await generateText({
    model: getProvider(),
    system: getSystemPrompt(context),
    messages: [
      ...context.history,
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    maxTokens: 1000
  });

  return result.text;
}
```

#### Alternative: **LiteLLM (Unify API)**

```typescript
// LiteLLM provides unified interface for 100+ providers
import { ChatCompletion } from 'litellm';

const response = await ChatCompletion({
  model: 'gemini/gemini-pro', // or 'openai/gpt-4', 'anthropic/claude-3'
  messages: [...],
  api_key: userApiKey
});
```

**Pros:**
- True router: can automatically fallback between providers
- Unified pricing and monitoring
- 100+ LLM providers supported

**Cons:**
- Additional dependency
- May be overkill for simple provider switching
- Requires LiteLLM server or cloud account

#### Alternative: **Portkey**

```typescript
import Portkey from 'portkey-ai';

const portkey = new Portkey({
  apiKey: 'portkey_api_key',
  virtualKey: 'user_gemini_key' // User's actual key
});

const response = await portkey.chat.completions.create({
  model: 'gemini/gemini-pro',
  messages: [...]
});
```

**Pros:**
- Built-in observability and analytics
- Automatic A/B testing between models
- Guardrails and safety filters included
- Virtual keys for secure key management

**Cons:**
- Requires Portkey account
- Additional layer of abstraction
- May have latency overhead

#### Recommended: **Start with AI SDK Router, add Portkey later**

**Rationale:**
- AI SDK is lightweight, no server needed
- Easy to implement provider switching
- Portkey's advanced features become valuable at scale
- Can migrate without changing app logic

---

### 3.4 Agentic Patterns (SOFA-Inspired Techniques)

#### SOFA Pattern Implementation

**S - State: Agent's internal context and memory**

```typescript
interface AgentState {
  user: UserContext;
  plan: TrainingPlanContext;
  conversation: ConversationHistory;
  tools: AvailableTools;
  safety: SafetyContext;
}

class RunningCoachAgent {
  private state: AgentState;

  constructor(initialState: AgentState) {
    this.state = initialState;
  }

  updateState(updates: Partial<AgentState>) {
    this.state = { ...this.state, ...updates };
  }

  getState() {
    return { ...this.state };
  }
}
```

**O - Observation: Perception of user input and plan state**

```typescript
interface Observation {
  detectIntent: (message: string) => Intent;
  detectEmotion: (message: string) => Emotion;
  detectInjury: (message: string) => InjuryRisk;
  detectGoalChange: (message: string) => GoalChange | null;
  detectTrainingLoad: (feedback: WorkoutFeedback[]) => TrainingLoadStatus;
}

class ObservationModule {
  private injuryKeywords = ['pain', 'hurt', 'injury', 'sharp', 'ache', 'twinge'];
  private fatigueKeywords = ['exhausted', 'tired', 'burnout', 'overtrained'];

  detectInjury(message: string): InjuryRisk {
    const hasInjuryKeywords = this.injuryKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    if (hasInjuryKeywords) {
      return { risk: 'high', signals: this.injuryKeywords.filter(k => message.includes(k)) };
    }

    return { risk: 'low', signals: [] };
  }

  detectIntent(message: string): Intent {
    const patterns = {
      modify: /modify|change|adjust|update|edit/i,
      query: /what|how|why|explain|tell/i,
      vent: /tired|hard|struggling|can't/i,
      celebrate: /great|awesome|pr|finally/i
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return { type: intent, confidence: 0.8 };
      }
    }

    return { type: 'unknown', confidence: 0.3 };
  }
}
```

**F - Function: Available actions and capabilities**

```typescript
interface AgentFunction {
  modifyWorkout(workoutId: string, changes: Partial<Workout>): Promise<void>;
  insertRestDay(date: Date): Promise<void>;
  shiftPlan(days: number): Promise<void>;
  adjustWeeklyVolume(targetVolume: number): Promise<void>;
  analyzePerformance(history: WorkoutFeedback[]): PerformanceAnalysis;
  recommendAlternative(workoutId: string): Workout[];
  explainRationale(action: Action): string;
  requestConfirmation(action: Action): Promise<boolean>;
  provideEducationalContent(topic: string): string;
}

class FunctionModule {
  constructor(private state: AgentState) {}

  async modifyWorkout(workoutId: string, changes: Partial<Workout>) {
    // Validate changes
    const validation = this.validateModification(workoutId, changes);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Apply changes
    const workout = this.state.plan.workouts.find(w => w.id === workoutId);
    const updated = { ...workout, ...changes };

    // Check training load impact
    const loadImpact = this.calculateLoadImpact(workout, updated);

    return { updated, loadImpact };
  }

  private validateModification(workoutId: string, changes: Partial<Workout>) {
    // Safety checks: no running through injury signals
    // Progressive overload preservation
    // Periodization goals alignment
    return { valid: true };
  }

  private calculateLoadImpact(original: Workout, updated: Workout) {
    // Calculate change in weekly volume, intensity, recovery needs
    return { volumeChange: 0, intensityChange: 0 };
  }
}
```

**A - Action: Decision-making and execution**

```typescript
interface AgentAction {
  plan: (observation: ObservationResult) => ActionPlan;
  execute: (plan: ActionPlan) => Promise<ActionResult>;
  respond: (result: ActionResult) => AgentResponse;
}

class ActionModule {
  constructor(
    private state: AgentState,
    private functions: AgentFunction
  ) {}

  async process(userMessage: string): Promise<AgentResponse> {
    // Observe
    const observation = this.observe(userMessage);

    // Check safety
    if (observation.injuryRisk.risk === 'high') {
      return this.safetyResponse(observation);
    }

    // Plan action
    const actionPlan = this.plan(observation);

    // Confirm if needed
    if (actionPlan.requiresConfirmation) {
      const confirmed = await this.functions.requestConfirmation(actionPlan);
      if (!confirmed) {
        return this.cancelResponse();
      }
    }

    // Execute
    const result = await this.execute(actionPlan);

    // Respond
    return this.respond(result);
  }

  private safetyResponse(observation: ObservationResult): AgentResponse {
    return {
      message: this.generateSafetyMessage(observation),
      action: { type: 'recommend_rest', severity: 'high' },
      requiresHumanInput: true
    };
  }

  private generateSafetyMessage(observation: ObservationResult): string {
    const messages = [
      "I hear that you're experiencing some discomfort. Running through pain can lead to serious injuries. I recommend taking at least 2-3 rest days to recover. If the pain persists, please consult a medical professional. Would you like me to adjust your plan to include more recovery time?",
      "It sounds like something's not right. Your health and safety is the priority. Let's modify your plan to prioritize recovery, and we can reassess in a few days. Is there anything specific I should know about what you're feeling?"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
```

#### Safety Guardrails Implementation

```typescript
interface SafetyGuardrails {
  injuryPrevention: {
    detect: (message: string) => InjurySignal[];
    threshold: (signal: InjurySignal) => SafetyAction;
  };
  overtrainingPrevention: {
    calculateAcuteLoad: (recentWorkouts: Workout[]) => number;
    calculateChronicLoad: (recentWeeks: Workout[][]) => number;
    detectOvertraining: (acute: number, chronic: number) => boolean;
  };
  hallucinationPrevention: {
    verifyAdvice: (advice: string) => VerificationResult;
    requireEvidence: (claim: string) => EvidenceSource[];
  };
}

class SafetySystem {
  static checkBeforeAction(action: AgentAction, context: AgentState): SafetyCheckResult {
    const checks = [
      this.checkInjuryRisk(action, context),
      this.checkOvertrainingRisk(action, context),
      this.checkGoalAlignment(action, context),
      this.checkEvidenceBase(action)
    ];

    const failures = checks.filter(c => !c.passed);

    if (failures.length > 0) {
      return { passed: false, reasons: failures.map(f => f.reason) };
    }

    return { passed: true };
  }

  private static checkInjuryRisk(action: AgentAction, context: AgentState): SafetyCheck {
    if (action.type === 'increase_intensity' && context.user.recentPain) {
      return { passed: false, reason: 'User has reported recent pain' };
    }
    return { passed: true };
  }
}
```

---

### 3.5 Data Models & Schemas

#### Core Schema (Zod Validation)

```typescript
import { z } from 'zod';

// Workout Schema
const WorkoutSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  type: z.enum(['easy', 'tempo', 'intervals', 'long', 'recovery', 'race', 'cross_training']),
  primaryMetric: z.enum(['distance', 'time', 'effort']),
  targetValue: z.number().positive(),
  targetPace: z.string().regex(/^\d+:\d+$/).optional(),
  effortZone: z.enum(['Z1', 'Z2', 'Z3', 'Z4', 'Z5']).optional(),
  description: z.string().min(1).max(500),
  intervals: z.array(z.object({
    id: z.string().uuid(),
    repeatCount: z.number().int().positive(),
    work: z.object({
      distance: z.number().positive().optional(),
      time: z.number().positive().optional(),
      pace: z.string()
    }),
    recovery: z.object({
      type: z.enum(['distance', 'time']),
      value: z.number().positive()
    })
  })).optional(),
  completed: z.boolean().default(false),
  actualData: z.object({
    distance: z.number().positive(),
    time: z.number().positive(),
    pace: z.string()
  }).optional()
});

type Workout = z.infer<typeof WorkoutSchema>;

// Event Schema
const EventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
  distance: z.number().positive(),
  goalTime: z.string().regex(/^\d+:\d+:\d+$/).optional(),
  priority: z.enum(['A', 'B', 'C']),
  type: z.enum(['road', 'trail', 'track', 'virtual']),
  registered: z.boolean().default(false)
});

type Event = z.infer<typeof EventSchema>;

// Feedback Schema
const FeedbackSchema = z.object({
  workoutId: z.string().uuid(),
  rpe: z.number().int().min(1).max(10),
  feeling: z.enum(['terrible', 'bad', 'ok', 'good', 'excellent']),
  actualDistance: z.number().positive().optional(),
  actualTime: z.number().positive().optional(),
  actualPace: z.string().regex(/^\d+:\d+$/).optional(),
  notes: z.string().max(1000).optional(),
  factors: z.object({
    sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
    stressLevel: z.enum(['high', 'medium', 'low']),
    nutrition: z.enum(['poor', 'fair', 'good']),
    weather: z.string().max(100).optional(),
    injuryConcern: z.boolean().default(false)
  }),
  submittedAt: z.coerce.date()
});

type WorkoutFeedback = z.infer<typeof FeedbackSchema>;

// Training Plan Schema
const TrainingPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  goal: z.enum(['base_build', 'race_prep', 'maintain', 'recovery', 'peak_performance']),
  targetEvent: EventSchema.optional(),
  weeklyVolume: z.number().positive().optional(),
  workouts: z.array(WorkoutSchema),
  blocks: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    focus: z.string()
  }))
});

type TrainingPlan = z.infer<typeof TrainingPlanSchema>;
```

#### Storage Schema Design

```typescript
// IndexedDB Schema (Dexie.js)
import Dexie, { Table } from 'dexie';

class PaceForgeDB extends Dexie {
  workouts!: Table<Workout & { planId: string }>;
  events!: Table<Event & { planId: string }>;
  feedback!: Table<WorkoutFeedback>;
  plans!: Table<TrainingPlan>;
  settings!: Table<AppSettings>;

  constructor() {
    super('PaceForgeDB');
    this.version(1).stores({
      workouts: 'id, date, type, completed, planId',
      events: 'id, date, priority, planId',
      feedback: 'workoutId, submittedAt',
      plans: 'id, startDate, endDate',
      settings: 'key'
    });
  }
}
```

---

## 4. UI/UX & Design Recommendations

### 4.1 Modern UI Libraries and Best Practices

#### Recommended UI Framework: **shadcn/ui + Radix UI**

**Why shadcn/ui:**
- Copy-paste components, full control over styling
- Built on Radix UI primitives (accessible, unstyled)
- Tailwind CSS integration
- Dark mode built-in
- Excellent TypeScript support
- No runtime overhead

**Alternative Options:**

**Mantine** ([mantine.dev](https://mantine.dev))
- Pros: Component-rich, excellent documentation, hooks library
- Cons: Heavier bundle, more opinionated

**Chakra UI** ([chakra-ui.com](https://chakra-ui.com))
- Pros: Easy to use, great accessibility
- Cons: Less flexibility in styling

**Material UI** ([mui.com](https://mui.com))
- Pros: Comprehensive component set
- Cons: Heavier, more opinionated design system

#### Design System Recommendations

**Color Palette (Dark Mode First)**
```css
/* Primary: Running Energy */
--primary-50: #f0fdfa;
--primary-500: #14b8a6; /* Teal - energetic but calming */
--primary-600: #0d9488;
--primary-900: #134e4a;

/* Secondary: Recovery */
--secondary-500: #8b5cf6; /* Purple - rest and restoration */

/* Accent: Achievement */
--accent-500: #f59e0b; /* Amber - celebration */

/* Danger: Injury/Warning */
--danger-500: #ef4444;

/* Success: Completion */
--success-500: #10b981;

/* Neutral: Text and backgrounds */
--bg-primary: #09090b; /* Zinc 950 */
--bg-secondary: #18181b; /* Zinc 900 */
--bg-tertiary: #27272a; /* Zinc 800 */
--text-primary: #fafafa;
--text-secondary: #a1a1aa;
--text-muted: #71717a;
```

**Typography Scale**
```css
/* Using Inter or SF Pro */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;

--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */
```

**Spacing Scale (8px base)**
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

**Border Radius**
```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-full: 9999px;
```

#### Component Architecture

**Layout Components**
```typescript
// App Shell
<Layout>
  <Sidebar />
  <MainContent>
    <Header />
    <Content />
  </MainContent>
  <ChatPanel />
</Layout>

// Week View
<WeekCalendar>
  <WeekHeader />
  <DayColumn day="Mon">
    <WorkoutCard />
    <WorkoutCard />
  </DayColumn>
  <DayColumn day="Tue">
    <RestDayCard />
  </DayColumn>
  {/* ... */}
</WeekCalendar>

// Workout Detail
<WorkoutEditor>
  <WorkoutHeader />
  <WorkoutForm />
  <IntervalEditor />
  <ActionButtons />
</WorkoutEditor>
```

#### Animations and Transitions

**Library Recommendation: Framer Motion**

```typescript
import { motion, AnimatePresence } from 'framer-motion';

// Smooth page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>

// Workout card hover effect
<motion.div
  whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
  whileTap={{ scale: 0.98 }}
>

// Chat message animation
<AnimatePresence>
  {messages.map(msg => (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
      transition={{ duration: 0.2 }}
    >
    </motion.div>
  ))}
</AnimatePresence>

// Success celebration
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 0.5 }}
>
  <CelebrationIcon />
</motion.div>
```

**Micro-interactions**
- Button presses: Scale down slightly on click
- Form validation: Shake animation on error
- Loading: Skeleton screens or spinner with easing
- Success: Confetti or checkmark animation
- Chat: Typing indicator with bouncing dots

---

### 4.2 Retention-Focused Features

#### Gamification Elements

**1. Streak Counter**
- Daily login streak
- Workout completion streak
- Visual reward: Fire emoji 🔥 that grows with streak

**2. Achievement System**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

const achievements = [
  {
    id: 'first_5k',
    name: '5K Pioneer',
    description: 'Complete your first 5K',
    icon: '🏃',
    rarity: 'common'
  },
  {
    id: 'streak_30',
    name: 'Month Warrior',
    description: '30-day workout streak',
    icon: '⚔️',
    rarity: 'epic'
  },
  {
    id: 'marathon_goal',
    name: 'Marathon Master',
    description: 'Complete a marathon',
    icon: '🏅',
    rarity: 'legendary'
  }
];
```

**3. Progress Visualization**
- Circular progress rings for weekly goals
- Charts showing improvement over time
- Before/after comparisons

#### Personalization

**1. Onboarding Quiz**
- Running experience level
- Goals (fitness, racing, health)
- Available days per week
- Past injuries
- Preferred workout times

**2. Adaptive Difficulty**
- Automatically adjust based on feedback
- Learning user's preferences over time

#### Analytics Dashboard

**1. Key Metrics**
- Weekly volume (km)
- Average pace
- Intensity distribution (pie chart of effort zones)
- Rest day adherence

**2. Trends**
- 4-week moving averages
- Progress toward goals
- Load management (acute:chronic workload ratio)

**3. Insights**
- AI-generated: "Your best workouts are on Tuesdays, consider moving quality sessions there"
- Pattern recognition: "You tend to skip Friday workouts, should we adjust?"

---

### 4.3 Mobile-First Design

#### Responsive Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Laptop */
--breakpoint-xl: 1280px;  /* Desktop */
--breakpoint-2xl: 1536px; /* Large desktop */
```

#### Mobile-Specific Features

**1. Bottom Navigation**
```typescript
<MobileNav>
  <NavItem icon="calendar" label="Plan" />
  <NavItem icon="message" label="Chat" />
  <NavItem icon="trending-up" label="Stats" />
  <NavItem icon="user" label="Profile" />
</MobileNav>
```

**2. Swipe Actions**
- Swipe left to complete workout
- Swipe right to edit
- Long press for options

**3. Touch-Friendly Inputs**
- Large tap targets (min 44px)
- Stepper controls for values
- Gesture-based plan navigation

#### Progressive Enhancement

**Core Features (Works Offline)**
- View/edit training plan
- Add workouts
- Mark workouts complete
- Basic charts

**Enhanced Features (Requires API)**
- AI chat assistant
- Smart recommendations
- Advanced analytics

---

## 5. Potential Challenges & Mitigations

### 5.1 AI Hallucination and Safety

**Challenge:** AI might give incorrect training advice or ignore injury signals.

**Mitigations:**
1. **Structured System Prompts:** Emphasize evidence-based training
2. **Safety Guardrails:** Detect and block dangerous advice
3. **Disclaimer Prominently Displayed:** "This is AI advice, not a substitute for professional coaching"
4. **User Confirmation:** Require approval for plan modifications
5. **Evidence Citations:** Reference training principles when possible
6. **Fallback Rules:** Use hard-coded rules for safety-critical decisions

```typescript
// Safety Example
const safetyRules = [
  {
    condition: (context: AgentContext) => context.user.injuryRisk > 0.7,
    action: 'RECOMMEND_REST',
    message: 'Based on recent feedback, I recommend rest. Please consult a medical professional if pain persists.'
  },
  {
    condition: (context: AgentContext) => context.acuteLoad / context.chronicLoad > 1.5,
    action: 'REDUCE_VOLUME',
    message: 'Your training load has increased rapidly. Let\'s back off slightly to prevent injury.'
  }
];
```

### 5.2 API Key Security

**Challenge:** Users need to paste API key, must be stored securely.

**Mitigations:**
1. **LocalStorage with Encryption:** Encrypt the key before storing
2. **Clear Storage Option:** Easy way to remove key
3. **Session-Only Option:** Option to not persist key
4. **Key Validation:** Validate key format before accepting
5. **Usage Monitoring:** Show API usage to user

```typescript
// Key Management
class APIKeyManager {
  static saveKey(key: string, persist: boolean = true) {
    const encrypted = this.encrypt(key);
    if (persist) {
      localStorage.setItem('api_key', encrypted);
    }
    sessionStorage.setItem('api_key', encrypted);
  }

  static getKey(): string | null {
    const sessionKey = sessionStorage.getItem('api_key');
    if (sessionKey) return this.decrypt(sessionKey);

    const persistentKey = localStorage.getItem('api_key');
    if (persistentKey) return this.decrypt(persistentKey);

    return null;
  }

  static clearKey() {
    localStorage.removeItem('api_key');
    sessionStorage.removeItem('api_key');
  }

  private static encrypt(key: string): string {
    // Simple XOR encryption (replace with proper encryption)
    return btoa(key.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ i % 256)
    ).join(''));
  }

  private static decrypt(encrypted: string): string {
    return atob(encrypted).split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ i % 256)
    ).join('');
  }
}
```

### 5.3 Browser Storage Limits

**Challenge:** LocalStorage has 5MB limit, IndexedDB more complex.

**Mitigations:**
1. **Start with LocalStorage:** Sufficient for MVP
2. **Data Compression:** Compress conversation history
3. **Pagination:** Only load recent data
4. **Clear Old Data:** Auto-remove old conversations (> 6 months)
5. **Migration Path:** Easy upgrade to IndexedDB when needed

```typescript
// Data Management
class DataManager {
  static async saveWorkout(workout: Workout) {
    try {
      await localStorage.setItem(`workout_${workout.id}`, JSON.stringify(workout));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        await this.cleanupOldData();
        await this.saveWorkout(workout);
      }
    }
  }

  static async cleanupOldData() {
    const allKeys = Object.keys(localStorage);
    const workoutKeys = allKeys.filter(k => k.startsWith('workout_'));

    // Remove workouts older than 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (const key of workoutKeys) {
      const workout = JSON.parse(localStorage.getItem(key));
      if (new Date(workout.date) < sixMonthsAgo) {
        localStorage.removeItem(key);
      }
    }
  }
}
```

### 5.4 AI Latency and UX

**Challenge:** AI responses may be slow, poor user experience.

**Mitigations:**
1. **Streaming Responses:** Show text as it generates
2. **Loading States:** Skeleton screens, typing indicators
3. **Optimistic Updates:** Update UI immediately, confirm with AI
4. **Caching:** Cache common responses
5. **Model Selection:** Use faster model for simple queries

```typescript
// Streaming Implementation
async function streamResponse(userMessage: string) {
  const controller = new AbortController();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userMessage }),
      signal: controller.signal
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      // Append to UI
      appendMessage(chunk);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // User cancelled
    }
  }

  return () => controller.abort();
}
```

### 5.5 Data Loss Prevention

**Challenge:** User loses data if they clear browser cache.

**Mitigations:**
1. **Export/Import:** Allow users to backup plans
2. **Periodic Reminders:** Remind users to backup
3. **iCloud Sync:** Optional sync to cloud (future feature)
4. **Clear Warnings:** Warn before clearing data

```typescript
// Backup System
class BackupSystem {
  static exportData(): string {
    const data = {
      workouts: localStorage.getItem('workouts'),
      events: localStorage.getItem('events'),
      feedback: localStorage.getItem('feedback'),
      plans: localStorage.getItem('plans'),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(data);
  }

  static importData(json: string): boolean {
    try {
      const data = JSON.parse(json);
      localStorage.setItem('workouts', data.workouts);
      localStorage.setItem('events', data.events);
      localStorage.setItem('feedback', data.feedback);
      localStorage.setItem('plans', data.plans);
      return true;
    } catch (error) {
      return false;
    }
  }

  static downloadBackup() {
    const data = this.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `paceforge-backup-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
```

### 5.6 Cross-Browser Compatibility

**Challenge:** Feature support varies across browsers.

**Mitigations:**
1. **Progressive Enhancement:** Core features work everywhere
2. **Polyfills:** Add polyfills for older browsers
3. **Feature Detection:** Check for feature support before using
4. **Browser Testing:** Test on Chrome, Firefox, Safari, Edge

```typescript
// Feature Detection
const features = {
  localstorage: () => {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
  indexedDB: () => 'indexedDB' in window,
  webWorkers: () => 'Worker' in window,
  serviceWorker: () => 'serviceWorker' in navigator
};

// Usage
if (features.localstorage()) {
  // Use localStorage
} else {
  // Fallback to memory
}
```

---

## 6. Recommended Tech Stack

### Final Recommendation

#### Frontend Framework: **React + Vite**

**Rationale:**
- Largest ecosystem, excellent developer experience
- Fast HMR with Vite
- Strong TypeScript support
- Easy to find solutions to any problem
- Future-proof with active development

#### UI Components: **shadcn/ui + Radix UI + Tailwind CSS**

**Rationale:**
- Full control over styling
- Accessibility built-in via Radix primitives
- Dark mode support
- No runtime overhead
- Modern, professional look out of the box

#### State Management: **Zustand + React Query + IndexedDB (Dexie.js)**

**Rationale:**
- Zustand: Lightweight, simple API, minimal boilerplate
- React Query: Caching, optimistic updates, devtools
- IndexedDB: Large data storage, offline support
- Dexie.js: Pleasant API wrapper around IndexedDB

#### AI Integration: **AI SDK (@ai-sdk/google)**

**Rationale:**
- Unified interface for multiple providers
- Easy provider switching
- Streaming support
- No server required
- Well-maintained by Vercel

#### Routing: **React Router v7**

**Rationale:**
- Standard routing solution for React
- Supports data loading
- URL state management
- Excellent documentation

#### Forms: **React Hook Form + Zod**

**Rationale:**
- Minimal re-renders
- Built-in validation with Zod
- TypeScript inference
- Great performance

#### Charts: **Recharts**

**Rationale:**
- React-native
- Composable
- Good TypeScript support
- Sufficient for our needs

#### Date Handling: **date-fns**

**Rationale:**
- Modular (tree-shakeable)
- Immutable
- Good TypeScript support
- Lightweight

#### Icons: **Lucide React**

**Rationale:**
- Tree-shakeable
- Consistent style
- Large library
- Customizable

#### Animations: **Framer Motion**

**Rationale:**
- Declarative API
- Great performance
- Gesture support
- Widely used

### Pros and Cons Summary

| Aspect | Pros | Cons |
|--------|------|------|
| **React + Vite** | Fast dev, large ecosystem, TS support | Bundle size can grow |
| **shadcn/ui** | Full control, accessible, modern | Requires manual component setup |
| **Zustand** | Simple API, minimal boilerplate | Less feature-rich than Redux |
| **IndexedDB** | Large storage, offline support | More complex API than localStorage |
| **AI SDK** | Unified interface, streaming | Newer, less mature than alternatives |
| **React Router** | Standard, well-documented | Some learning curve |
| **React Hook Form** | Performant, great validation | Setup complexity |
| **Recharts** | React-native, composable | Limited customization |
| **Framer Motion** | Powerful, great UX | Larger bundle size |

---

### Development Workflow

**Recommended Commands:**
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

**Git Conventions:**
- Feature branches: `feature/feature-name`
- Bugfix branches: `bugfix/bug-description`
- Commit format: `type(scope): description`
  - `feat(plan): add interval workout editor`
  - `fix(ai): handle timeout errors`
  - `docs(readme): update installation instructions`

### Deployment

**Recommended Platform:**
- **Vercel**: Zero-config deployment, automatic previews
- **Netlify**: Great static site hosting
- **GitHub Pages**: Free hosting for static sites

**CI/CD:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run type-check
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

## Conclusion

This research document provides a comprehensive foundation for building PaceForge, a browser-based AI-assisted running training plan editor. The recommended tech stack balances:

- **Developer Experience**: React + Vite + TypeScript for productivity
- **Performance**: Zustand + IndexedDB for efficient state management
- **Flexibility**: AI SDK for easy LLM provider switching
- **Safety**: SOFA-inspired patterns for responsible AI
- **User Experience**: shadcn/ui + Framer Motion for engaging UI

The phased approach allows for iterative development, starting with a functional MVP and progressively adding sophisticated features. The architecture supports future scaling to backend infrastructure while maintaining the core client-first philosophy.
