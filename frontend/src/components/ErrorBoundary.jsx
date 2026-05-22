import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-200">
          <h3 className="text-lg font-semibold">Component failed to load</h3>
          <p className="text-sm mt-2">Sorry — something went wrong while loading this tool.</p>
          <pre className="mt-3 text-xs">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
