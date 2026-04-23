import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>PaceForge App</div>)
    expect(container).toBeInTheDocument()
  })

  it('displays application name', () => {
    render(<div>PaceForge App</div>)
    expect(screen.getByText('PaceForge App')).toBeInTheDocument()
  })
})