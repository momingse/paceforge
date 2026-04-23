import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('PaceForge')).toBeInTheDocument();
  });

  it('displays application description', () => {
    render(<App />);
    expect(screen.getByText(/AI-Assisted Running Training Plan Editor/)).toBeInTheDocument();
  });

  it('displays getting started section', () => {
    render(<App />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('increments count when button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole('button');
    expect(screen.getByText(/Count is 0/)).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText(/Count is 1/)).toBeInTheDocument();
  });
});
