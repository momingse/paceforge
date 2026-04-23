# Project Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the PaceForge project with minimal dependencies, development tooling, git configuration, and pre-commit hooks with type checking for a browser-based AI-assisted running training plan editor.

**Architecture:** Modern React + Vite + TypeScript frontend with shadcn/ui components, Tailwind CSS styling, Zustand state management, and AI SDK integration. Development environment includes ESLint, Prettier, and Husky pre-commit hooks with type checking.

**Tech Stack:** React 18+, Vite 5+, TypeScript 5+, shadcn/ui, Tailwind CSS, ESLint, Prettier, Husky, lint-staged

---

## File Structure

This plan will create the following files with their responsibilities:

```
PaceForge/
├── .gitignore                    # Git ignore patterns for Node.js/TypeScript projects
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── tsconfig.node.json            # TypeScript config for Node.js tooling
├── vite.config.ts                # Vite build tool configuration
├── .eslintrc.cjs                 # ESLint linting rules
├── .eslintignore                 # ESLint ignore patterns
├── .prettierrc                   # Prettier formatting rules
├── .prettierignore               # Prettier ignore patterns
├── .husky/
│   └── pre-commit                # Git pre-commit hook
├── .lintstagedrc.json            # Lint-staged configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── src/
│   ├── main.tsx                  # Application entry point
│   ├── App.tsx                   # Root React component
│   └── index.css                 # Global styles with Tailwind directives
├── index.html                    # HTML entry point
├── vite-env.d.ts                 # Vite type definitions
├── components.json               # shadcn/ui component configuration
└── README.md                     # Project documentation
```

---

## Task 1: Create .gitignore

**Files:**

- Create: `.gitignore`

- [ ] **Step 1: Write .gitignore file**

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov

# Production
dist/
dist-ssr/
*.local

# Editor directories and files
.vscode/
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
.turbo/
.next/
out/
build/

# Misc
.cache/
.temp/
```

- [ ] **Step 2: Verify file creation**

Run: `ls -la .gitignore`
Expected: `.gitignore` file exists

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add gitignore for Node.js/TypeScript project"
```

---

## Task 2: Create package.json with minimal dependencies

**Files:**

- Create: `package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "paceforge",
  "version": "0.1.0",
  "description": "Browser-based AI-assisted running training plan editor",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.13.1",
    "@typescript-eslint/parser": "^7.13.1",
    "@vitejs/plugin-react": "^4.3.1",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.7",
    "prettier": "^3.3.2",
    "typescript": "^5.5.3",
    "vite": "^5.3.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

- [ ] **Step 2: Verify package.json format**

Run: `cat package.json | jq .`
Expected: Valid JSON output without errors

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add package.json with minimal dependencies"
```

---

## Task 3: Create TypeScript configuration files

**Files:**

- Create: `tsconfig.json`
- Create: `tsconfig.node.json`

- [ ] **Step 1: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Write tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Verify TypeScript config syntax**

Run: `tsc --showConfig`
Expected: Valid TypeScript configuration output

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json tsconfig.node.json
git commit -m "chore: add TypeScript configuration files"
```

---

## Task 4: Create Vite configuration

**Files:**

- Create: `vite.config.ts`

- [ ] **Step 1: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
      babel: {
        plugins: process.env.NODE_ENV === 'test' ? ['@babel/plugin-transform-runtime'] : [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
```

- [ ] **Step 2: Verify Vite config syntax**

Run: `npx vite --mode development --showConfig`
Expected: Valid Vite configuration output

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "chore: add Vite configuration"
```

---

## Task 5: Create ESLint configuration

**Files:**

- Create: `.eslintrc.cjs`
- Create: `.eslintignore`

- [ ] **Step 1: Write .eslintrc.cjs**

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
};
```

- [ ] **Step 2: Write .eslintignore**

```
dist
dist-ssr
*.local
node_modules
.vite
coverage
```

- [ ] **Step 3: Verify ESLint config syntax**

Run: `npx eslint --print-config .eslintrc.cjs`
Expected: Valid ESLint configuration output

- [ ] **Step 4: Commit**

```bash
git add .eslintrc.cjs .eslintignore
git commit -m "chore: add ESLint configuration"
```

---

## Task 6: Create Prettier configuration

**Files:**

- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: Write .prettierrc**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 2: Write .prettierignore**

```
dist
dist-ssr
*.local
node_modules
.vite
coverage
package-lock.json
pnpm-lock.yaml
yarn.lock
```

- [ ] **Step 3: Verify Prettier config syntax**

Run: `npx prettier --check .prettierrc`
Expected: Formatting check passes (or no output if file is valid)

- [ ] **Step 4: Commit**

```bash
git add .prettierrc .prettierignore
git commit -m "chore: add Prettier configuration"
```

---

## Task 7: Configure Husky pre-commit hooks

**Files:**

- Modify: `.husky/pre-commit`
- Create: `.lintstagedrc.json`

- [ ] **Step 1: Write .lintstagedrc.json**

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,scss}": ["prettier --write"],
  "*.{json,md}": ["prettier --write"],
  "*": ["npm run type-check"]
}
```

- [ ] **Step 2: Write .husky/pre-commit**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

# Run TypeScript type check
npm run type-check
```

- [ ] **Step 3: Make pre-commit executable**

Run: `chmod +x .husky/pre-commit`
Expected: No output (command succeeds)

- [ ] **Step 4: Verify lint-staged config syntax**

Run: `npx lint-staged --help`
Expected: lint-staged help output

- [ ] **Step 5: Commit**

```bash
git add .lintstagedrc.json .husky/pre-commit
git commit -m "chore: configure Husky pre-commit hooks with lint-staged"
```

---

## Task 8: Install dependencies and verify setup

**Files:**

- Modify: `package.json` (auto-generated lock files)

- [ ] **Step 1: Install dependencies**

Run: `npm install`
Expected: Dependencies installed successfully with package-lock.json created

- [ ] **Step 2: Verify installation**

Run: `npm list --depth=0`
Expected: List of installed packages matching package.json dependencies

- [ ] **Step 3: Initialize Husky**

Run: `npm run prepare`
Expected: Husky initialized successfully

- [ ] **Step 4: Commit**

```bash
git add package-lock.json
git commit -m "chore: install project dependencies"
```

---

## Task 9: Create Tailwind CSS configuration

**Files:**

- Create: `tailwind.config.js`
- Create: `postcss.config.js`

- [ ] **Step 1: Write tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Write postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Add Tailwind CSS dependencies**

Run: `npm install -D tailwindcss postcss autoprefixer`
Expected: Tailwind CSS packages installed successfully

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tailwind.config.js postcss.config.js
git commit -m "chore: add Tailwind CSS configuration"
```

---

## Task 10: Create basic project structure and files

**Files:**

- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `index.html`
- Create: `vite-env.d.ts`

- [ ] **Step 1: Write index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PaceForge - AI-Assisted Running Training Plan Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Write src/main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 3: Write src/App.tsx**

```typescript
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">PaceForge</h1>
        <p className="text-lg text-muted-foreground mb-8">
          AI-Assisted Running Training Plan Editor
        </p>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4">
            Welcome to PaceForge! Your browser-based AI-assisted running training plan editor.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Count is {count}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
```

- [ ] **Step 4: Write src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 5: Write vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 6: Create src directory**

Run: `mkdir -p src`
Expected: No output (directory created successfully)

- [ ] **Step 7: Verify file creation**

Run: `ls -la src/ index.html vite-env.d.ts`
Expected: All files exist in the correct locations

- [ ] **Step 8: Commit**

```bash
git add src/ index.html vite-env.d.ts
git commit -m "chore: create basic project structure and entry files"
```

---

## Task 11: Create shadcn/ui component configuration

**Files:**

- Create: `components.json`

- [ ] **Step 1: Write components.json**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 2: Verify components.json format**

Run: `cat components.json | jq .`
Expected: Valid JSON output without errors

- [ ] **Step 3: Commit**

```bash
git add components.json
git commit -m "chore: add shadcn/ui component configuration"
```

---

## Task 12: Create utility function for shadcn/ui

**Files:**

- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create lib directory**

Run: `mkdir -p src/lib`
Expected: No output (directory created successfully)

- [ ] **Step 2: Write src/lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Install required dependencies**

Run: `npm install clsx tailwind-merge`
Expected: Dependencies installed successfully

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run type-check`
Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/utils.ts
git commit -m "chore: add cn utility function for class merging"
```

---

## Task 13: Create README documentation

**Files:**

- Create: `README.md`

- [ ] **Step 1: Write README.md**

````markdown
# PaceForge

A browser-based AI-assisted running training plan editor that enables runners to create, manage, and personalize their training plans with intelligent AI recommendations, running entirely in the browser with no backend server.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PaceForge
   ```
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

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

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **AI Integration**: AI SDK (@ai-sdk/google)
- **Build Tool**: Vite

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

````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with getting started guide"
````

---

## Task 14: Test development setup

**Files:**

- Modify: `package.json` (verified via npm commands)

- [ ] **Step 1: Verify quality checks**

Run: `npm run validate`
Expected: No linting, formatting, or type-checking errors

- [ ] **Step 4: Start development server**

Run: `npm run dev`
Expected: Development server starts at http://localhost:3000

- [ ] **Step 5: Test pre-commit hooks**

Run: `git commit --allow-empty -m "test: verify pre-commit hooks"`
Expected: Pre-commit hooks run successfully (lint-staged executes)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: verify development setup and tooling"
```

---

## Task 15: Final verification and cleanup

**Files:**

- Modify: All project files (verification step)

- [ ] **Step 1: Run comprehensive build test**

Run: `npm run build`
Expected: Production build completes successfully in `dist/` directory

- [ ] **Step 2: Verify build output**

Run: `ls -la dist/`
Expected: Built assets present (index.html, assets directory)

- [ ] **Step 3: Test preview mode**

Run: `npm run preview`
Expected: Preview server starts successfully

- [ ] **Step 4: Verify all configuration files**

Run: `ls -la | grep -E '\.(json|js|ts|cjs|rc)$'`
Expected: All config files present (package.json, tsconfig.json, vite.config.ts, etc.)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: complete project initialization and final verification"
```

---

## Verification Checklist

After completing all tasks, verify the following:

- [ ] All configuration files are present and valid
- [ ] Development server starts successfully (`npm run dev`)
- [ ] All quality checks pass (`npm run validate`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Pre-commit hooks are functional
- [ ] Git ignore patterns are correct
- [ ] All dependencies are installed

## Next Steps

After completing this initialization plan, you can proceed with:

1. Adding shadcn/ui components using `npx shadcn-ui@latest add [component]`
2. Setting up state management (Zustand stores)
3. Implementing routing with React Router
4. Adding feature modules (Plan Editor, AI Chat, etc.)
5. Setting up testing framework

---

**Plan Created**: 2026-04-22
**Total Tasks**: 15
**Estimated Completion Time**: 2-3 hours
