import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerPWA } from './utils/pwaRegister'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: 'red', padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>
          <h1>CRITICAL RENDER ERROR</h1>
          <p>{this.state.error && this.state.error.toString()}</p>
          <p>{this.state.error && this.state.error.stack}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Register PWA Service Worker on app startup
registerPWA()
  .then((registration) => {
    if (registration) {
      console.log('🎉 PWA is ready for offline use!');
    }
  })
  .catch((error) => {
    console.error('Failed to register PWA:', error);
  });

// Listen for app installation
window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the browser from showing its default install prompt
  event.preventDefault();
  
  // Store the event for later use
  window.deferredPrompt = event;
  
  console.log('📱 App installation available');
});

// Listen for app installed
window.addEventListener('appinstalled', () => {
  console.log('✅ Aura app installed successfully!');
  // Clear the deferred prompt
  window.deferredPrompt = null;
});
