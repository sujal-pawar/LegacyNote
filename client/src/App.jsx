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
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {!shouldHideNavbar && <Navbar />}
      <main className="main-content">
        <AppRoutes />
      </main>
      <Footer />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
        toastClassName="toast-custom-container"
        bodyClassName="toast-custom-body"
        style={{
          top: '20px',
          width: 'auto',
          maxWidth: '420px',
        }}
      />
    </div>
  );
}

function App() {
  // Replace with your actual Google Client ID
  const GOOGLE_CLIENT_ID = "787325832354-unsvscijr5q46ll3omrbdd0gbcrvdnhi.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
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