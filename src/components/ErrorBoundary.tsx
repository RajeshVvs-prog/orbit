import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
          <div className="glass p-12 rounded-[2.5rem] max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">System Anomaly Detected</h2>
            <p className="text-white/50 mb-8 leading-relaxed">
              Zenith encountered an unexpected error while synthesizing intelligence. 
              Our engineers have been notified.
            </p>
            <div className="bg-black/40 p-4 rounded-2xl mb-8 text-left overflow-auto max-h-32">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.message || "Unknown error"}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
            >
              <RefreshCcw className="w-5 h-5" /> Restart Intelligence Engine
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
