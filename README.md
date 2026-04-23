# PaceForge

A browser-based AI-assisted running training plan editor that enables runners to create, manage, and personalize their training plans with intelligent AI recommendations, running entirely in the browser with no backend server.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone repository:

   ```bash
   git clone <repository-url>
   cd PaceForge
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate coverage report
- `npm run test:ui` - Run tests with UI

## 🔄 CI/CD

PaceForge uses GitHub Actions for continuous integration:

- **Automated Testing**: All tests run on pull requests and main branch pushes
- **Code Quality**: ESLint, Prettier, and TypeScript checks on every commit
- **Build Verification**: Ensures the application builds successfully
- **Security Scanning**: npm audit for dependency vulnerabilities

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## 📋 Planned Features

The following technologies are planned for future implementation:

- **UI Components**: shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **AI Integration**: AI SDK (@ai-sdk/google)

## 📁 Project Structure

```
PaceForge/
├── src/
│   ├── components/    # Reusable UI components
│   ├── lib/          # Utility functions
│   ├── features/     # Feature modules
│   └── App.tsx       # Root component
├── docs/             # Documentation
├── plans/            # Implementation plans
└── public/           # Static assets
```

## 🤝 Contributing

This project uses the following development tools:

- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **Code Quality**: ESLint + Prettier for consistent code style
- **Type Safety**: TypeScript with strict mode enabled

### Commit Convention

Follow conventional commits format: `type(scope): description`

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

Built with modern web technologies and following best practices for browser-based applications.
badly formatted
