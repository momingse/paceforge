# PaceForge Architecture

## Overview

PaceForge is a browser-based AI-assisted running training plan editor that enables runners to create, manage, and personalize their training plans with intelligent AI recommendations, running entirely in the browser with no backend server.

## Core Principles

- **Client-First Architecture**: All computation and data persistence happens in the browser
- **Privacy-By-Design**: User data never leaves their device (except for AI API calls)
- **Progressive Enhancement**: Core functionality works offline, AI features require API key
- **Modular AI Layer**: Router pattern enables seamless LLM provider switching

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Layer                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (shadcn/ui + Tailwind CSS)        │   │
│  │  • Plan Editor  • Chat Interface  • Analytics       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   State Management                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Zustand (App State) + React Query (Server State)    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Persistence                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  IndexedDB (Dexie.js) → LocalStorage (MVP)           │   │
│  │  Workouts, Events, Feedback, Plans                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     AI Layer                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AI SDK Router (@ai-sdk/google)                      │   │
│  │  SOFA-inspired Agent (State, Observation, Function)  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend Framework
- **React + Vite**: Modern React with fast hot module replacement
- **TypeScript**: Type safety across the application
- **React Router v7**: Client-side routing

### UI Components
- **shadcn/ui**: Copy-paste components built on Radix UI
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### State Management
- **Zustand**: Lightweight state management for app state
- **React Query**: Caching, optimistic updates, devtools
- **IndexedDB (Dexie.js)**: Large-scale data storage with offline support

### Forms & Validation
- **React Hook Form**: Performant form handling
- **Zod**: Schema validation

### AI Integration
- **AI SDK (@ai-sdk/google)**: Unified interface for LLM providers
- **Google Generative AI**: Default AI provider (Gemini 2.0 Flash)

### Additional Libraries
- **date-fns**: Date manipulation
- **Recharts**: Data visualization
- **Framer Motion**: Animations and transitions

## Core Features

### 1. Running Plan Editor
- Week view calendar with drag-and-drop functionality
- Rich workout editor with interval support
- Quick actions for plan modification
- Visual feedback with color-coded effort zones

### 2. AI Chat Assistant
- SOFA-inspired agent architecture
- Intent recognition and injury detection
- Safety guardrails for training advice
- Natural language plan modifications

### 3. Training Feedback Loop
- RPE (Rate of Perceived Exertion) tracking
- Adaptive plan adjustments based on feedback
- Pattern recognition for weekly trends
- Stress and sleep quality integration

### 4. Event & Activity Integration
- Race event management with taper calculations
- Training periodization support
- Activity logging and completion tracking

## Component Architecture

### Layout Structure
```
App
├── Layout
│   ├── Sidebar (Navigation)
│   ├── MainContent
│   │   ├── Header
│   │   └── Content
│   └── ChatPanel (AI Assistant)
└── Routes
    ├── / (Dashboard)
    ├── /plan (Plan Editor)
    ├── /analytics (Stats & Charts)
    └── /settings (Configuration)
```

### Key Components
- **WeekCalendar**: Calendar view with day columns
- **WorkoutCard**: Individual workout display
- **WorkoutEditor**: Workout creation/editing
- **ChatInterface**: AI conversation interface
- **AnalyticsDashboard**: Charts and insights
- **SettingsPanel**: API key management

## Data Flow

### User Action Flow
1. User interacts with UI component
2. Component triggers Zustand action
3. Action updates state
4. State change triggers persistence to IndexedDB
5. If AI needed, action calls AI layer
6. AI response updates state

### AI Request Flow
1. User sends message to chat
2. Agent observes input (intent, emotion, injury risk)
3. Safety check performed
4. Agent plans action using available functions
5. Action executed (with user confirmation if needed)
6. Response generated and displayed

## Security Considerations

### API Key Management
- Stored in localStorage/sessionStorage with encryption
- Option for session-only storage
- Clear storage option available
- Key validation before accepting

### Data Privacy
- All data stored locally
- No account creation required
- Only AI API calls leave device
- Export/Import functionality for backup

## Performance Optimization

### State Management
- Zustand: Minimal re-renders with selectors
- React Query: Automatic caching and deduplication
- IndexedDB: Async operations to prevent UI blocking

### Bundle Size
- Tree-shaking: Only import used components
- Code splitting: Lazy load routes
- Component-based: shadcn/ui allows selective inclusion

### AI Latency
- Streaming responses: Show text as it generates
- Optimistic updates: Update UI immediately
- Loading states: Skeleton screens and indicators
- Model selection: Faster models for simple queries

## Development Workflow

### Recommended Commands
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Run tests
pnpm test

# Build for production
pnpm run build

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

### Git Conventions
- Feature branches: `feature/feature-name`
- Bugfix branches: `bugfix/bug-description`
- Commit format: `type(scope): description`
  - `feat: add interval workout editor`
  - `fix: handle timeout errors`
  - `docs: update installation instructions`

---

**Last Updated**: 2026-04-15

**Version**: 1.0.0
