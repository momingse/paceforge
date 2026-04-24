# PaceForge Architecture

PaceForge is a browser-based AI-assisted running training plan editor that enables runners to create, manage, and personalize their training plans with intelligent AI recommendations, running entirely in the browser with no backend server.

## Core Principles

- **Client-First Architecture**: All computation and data persistence happens in the browser
- **Privacy-By-Design**: User data never leaves their device (except for AI API calls)
- **Progressive Enhancement**: Core functionality works offline, AI features require API key
- **Modular AI Layer**: Router pattern enables seamless LLM provider switching

## Tech Stack

**Frontend**: React + Vite + TypeScript + React Router v7
**UI**: shadcn/ui (Radix UI primitives) + Tailwind CSS + Lucide React
**State**: Zustand (app state) + React Query (caching) + IndexedDB/Dexie.js (persistence)
**Forms**: React Hook Form + Zod validation
**AI**: AI SDK (@ai-sdk/google) with Google Generative AI (Gemini 2.0 Flash)
**Utilities**: date-fns, Recharts, Framer Motion

## Core Features

- **Running Plan Editor**: Week view calendar, rich workout editor with intervals, quick actions
- **AI Chat Assistant**: SOFA-inspired agent, intent recognition, injury detection, natural language modifications
- **Training Feedback Loop**: RPE tracking, adaptive adjustments, pattern recognition
- **Event Integration**: Race management with taper calculations, periodization support

## Architecture

### Layout Structure
```
App
├── Layout
│   ├── Sidebar (Navigation)
│   ├── MainContent (Header + Content)
│   └── ChatPanel (AI Assistant)
└── Routes: /dashboard, /plan, /analytics, /settings
```

### Key Components
- **WeekCalendar**: Calendar view with day columns and drag-drop
- **WorkoutCard/WorkoutEditor**: Individual workout display and editing
- **ChatInterface**: AI conversation interface
- **AnalyticsDashboard**: Charts and training insights
- **SettingsPanel**: API key management

## Data Flow

**User Actions**: UI → Zustand action → State update → IndexedDB persistence → (optional AI layer)

**AI Requests**: Chat input → Agent observation (intent/emotion/injury) → Safety check → Action planning → Execution → Response generation

## Security & Privacy

- API keys stored in localStorage/sessionStorage with encryption, session-only option
- All user data stored locally, no account creation required
- Only AI API calls leave device, with export/import backup functionality

## Performance

- **State**: Zustand selectors minimize re-renders, React Query handles caching/deduplication, IndexedDB async operations prevent UI blocking
- **Bundle**: Tree-shaking, code splitting, selective component inclusion
- **AI**: Streaming responses, optimistic updates, skeleton loading states, model selection optimization
