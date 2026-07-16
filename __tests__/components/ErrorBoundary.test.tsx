/**
 * Tests for ErrorBoundary component
 */
import { render } from '@testing-library/react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Suppress React error boundary logs during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('ErrorBoundary')) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test Child</div>
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Test Child');
  });

  it('should catch errors in child components', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Something went wrong');
  });

  it('should render custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { container } = render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Custom Error UI');
  });

  it('should display error message', () => {
    const ThrowError = () => {
      throw new Error('Specific error message');
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('Specific error message');
  });

  it('should have a Try Again button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const resetButton = container.querySelector('button');
    expect(resetButton).toBeTruthy();
    expect(resetButton?.textContent).toContain('Try Again');
  });
});
