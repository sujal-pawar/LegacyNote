import { BrowserRouter as Router } from 'react-router-dom';
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

function App() {
  // Replace with your actual Google Client ID
  const GOOGLE_CLIENT_ID = "787325832354-unsvscijr5q46ll3omrbdd0gbcrvdnhi.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <AppRoutes />
              </main>
              <Footer />
              <ToastContainer position="top-right" autoClose={3000} />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
