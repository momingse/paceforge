# Testing Guide for PaceForge

## Overview

PaceForge uses Vitest as the testing framework with React Testing Library for component testing.

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── __tests__/
│   ├── components/        # Component tests
│   ├── hooks/           # Custom hook tests
│   └── utils/           # Utility function tests
```

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react'

it('loads data asynchronously', async () => {
  render(<AsyncComponent />)
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event'

it('handles button click', async () => {
  const user = userEvent.setup()
  render(<Button onClick={mockFn} />)

  await user.click(screen.getByRole('button'))
  expect(mockFn).toHaveBeenCalled()
})
```

## Coverage

Run `npm run test:coverage` to generate a coverage report in the `coverage/` directory.

## CI Integration

All tests run automatically on pull requests and pushes to master/main branches. The CI workflow includes:
- TypeScript type checking
- ESLint linting
- Prettier formatting checks
- Unit tests
- Build verification
- Security scanning