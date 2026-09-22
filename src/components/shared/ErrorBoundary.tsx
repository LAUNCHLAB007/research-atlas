"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Research Atlas UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-[var(--radius-card)] border border-error/30 bg-error/5 p-4 text-sm text-error">
            Something went wrong loading this section.{" "}
            <button className="underline" onClick={() => this.setState({ hasError: false })}>
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
