import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white font-sans flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-[#111113] border border-white/5 rounded-2xl p-10 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            <div className="flex flex-col items-center text-center gap-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center ring-1 ring-red-500/20">
                <AlertTriangle size={28} className="text-red-400" />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  Something went wrong
                </h1>
                <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                  An unexpected error occurred. Your data and settings are safe — reloading the page
                  should fix it.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <RotateCcw size={14} />
                  Try again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  <RefreshCw size={14} />
                  Reload page
                </button>
              </div>

              {/* Dev-only error details */}
              {import.meta.env.DEV && this.state.error && (
                <div className="w-full space-y-1.5 pt-2 border-t border-white/5">
                  <p className="text-[11px] font-mono text-white/20 text-left">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
