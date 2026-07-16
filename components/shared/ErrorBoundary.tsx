'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch React errors in the component tree
 * Provides a fallback UI and logs errors for debugging
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('[ErrorBoundary] Component error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (Sentry, etc.)
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground text-sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted/50 p-4 rounded-lg border border-border">
                <summary className="cursor-pointer text-xs font-mono text-muted-foreground mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs font-mono text-red-500 overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-brand-accent transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
