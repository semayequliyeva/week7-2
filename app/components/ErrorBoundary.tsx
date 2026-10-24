
"use client";

import { Component, ErrorInfo, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  // Render xetasi bas verende ehtiyat ekranini gosteririk.
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  // Xeta haqqinda melumati konsola yaziriq.
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application render error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  // Istifadeci yeniden cehd edende esas komponenti qaytaririq.
  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="recovery-card" role="alert">
          <div className="recovery-icon" aria-hidden="true">
            ⚠
          </div>

          <h2>Something went wrong</h2>

          <p>
            An unexpected error occurred. You can try loading
            the form again.
          </p>

          <button
            type="button"
            className="submit-button"
            onClick={this.handleRetry}
          >
            Try again
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
