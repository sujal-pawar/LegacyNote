import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import context providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';

// Helper component to use hooks inside Router
function AppContent() {
  const location = useLocation();
  // Hide navbar and footer on login and register pages
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <div className="app-container w-full overflow-x-hidden">
      {!isAuthPage && <Navbar />}
      <main className={!isAuthPage ? "main-content pt-16" : "main-content"}>
        <AppRoutes />
      </main>
      {!isAuthPage && <Footer />}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        limit={3}
        toastClassName={(context) => {
          const { type = 'default' } = context || {};
          return `toast-custom-container ${
            type === 'success' ? 'success-toast' : 
            type === 'warning' ? 'warning-toast' : 
            type === 'info' ? 'info-toast' : 
            type === 'error' ? 'auth-error-toast' : ''
          }`;
        }}
        bodyClassName="toast-custom-body"
        style={{
          top: '20px',
          width: 'auto',
          maxWidth: '400px',
        }}
      />
    </div>
  );
}

function App() {
  // Use environment variable for Google Client ID
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "787325832354-unsvscijr5q46ll3omrbdd0gbcrvdnhi.apps.googleusercontent.com";

  // Handle Google OAuth script loading errors
  const handleGoogleScriptLoadError = () => {
    console.error("Google OAuth script failed to load");
    // You could also log this to an error monitoring service
  };

  return (
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={handleGoogleScriptLoadError}
      nonce="abcdefg123456" // Add a nonce for better security
      flow="implicit" // Explicit setting of the flow
    >
      <Router
        future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;