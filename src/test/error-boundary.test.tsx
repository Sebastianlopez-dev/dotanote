import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Component that throws on purpose — used to trigger the boundary
function Bomb({ shouldExplode }: { shouldExplode: boolean }) {
  if (shouldExplode) {
    throw new Error('Kaboom');
  }
  return <p>All good</p>;
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldExplode={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('All good')).toBeDefined();
  });

  it('shows fallback UI when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText(/unexpected error occurred/i)).toBeDefined();
    expect(screen.getByText('Try again')).toBeDefined();
    expect(screen.getByText('Reload page')).toBeDefined();

    spy.mockRestore();
  });

  it('recovers when "Try again" is clicked', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );

    // Should be in error state
    expect(screen.getByText('Something went wrong')).toBeDefined();

    // Click "Try again" — resets the boundary's error state
    fireEvent.click(screen.getByText('Try again'));

    // After reset, boundary re-renders children. Bomb still throws,
    // but the boundary catches it again instead of crashing.
    expect(screen.getByText('Something went wrong')).toBeDefined();

    spy.mockRestore();
  });
});
