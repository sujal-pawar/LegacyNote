import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Check if AbortController is available and polyfill if needed
if (typeof window !== 'undefined' && !window.AbortController) {
  console.warn('AbortController not available, using polyfill');
  // Simple polyfill to prevent errors
  class AbortSignal {
    get aborted() {
      return false;
    }
  }
  
  class AbortControllerPolyfill {
    constructor() {
      this.signal = new AbortSignal();
    }
    abort() {
      // No operation
    }
  }
  
  window.AbortController = AbortControllerPolyfill;
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Handle AbortError specifically
    if (event.reason && event.reason.name === 'AbortError') {
      console.warn('AbortError was caught globally:', event.reason);
      // Prevent the default handling (which might crash the app)
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
