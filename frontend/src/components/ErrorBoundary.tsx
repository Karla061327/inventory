import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] crash:', error.message);
    console.error('[ErrorBoundary] stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-md border border-red-400 bg-red-50 p-6 text-red-800 space-y-2">
          <p className="font-semibold text-lg">Error al renderizar la página</p>
          <p className="text-sm font-mono bg-red-100 p-2 rounded">
            {this.state.error?.message ?? 'Error desconocido'}
          </p>
          <p className="text-xs text-red-600 font-mono whitespace-pre-wrap">
            {this.state.error?.stack?.split('\n').slice(0, 5).join('\n')}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
