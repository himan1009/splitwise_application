import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-200">
          <div className="card max-w-md w-full text-center !p-8">
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted mb-6">
              The app hit an unexpected error. Please refresh or log in again.
            </p>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Go to login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
