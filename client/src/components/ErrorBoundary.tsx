import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional fallback UI. Receives the error so it can be displayed. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * ErrorBoundary catches unexpected runtime errors in any child component tree
 * and renders a graceful fallback instead of crashing the whole page.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeFeatureSection />
 *   </ErrorBoundary>
 *
 * With a custom fallback:
 *   <ErrorBoundary fallback={(err, reset) => <button onClick={reset}>Retry</button>}>
 *     <SomeFeatureSection />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback(error, this.reset);
      }
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="font-serif text-sm text-white/50 italic">
            Something went wrong in this section.
          </p>
          <button
            onClick={this.reset}
            className="rounded-full border border-white/15 px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-white/60 transition-colors hover:border-white/30 hover:text-white/80"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
