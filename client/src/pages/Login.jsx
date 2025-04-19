import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaLock, FaEnvelope, FaClock, FaShieldAlt, FaGlobe, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const Login = () => {
  const { login, googleLogin, refreshUser, error: authError } = useAuth();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);

  // If there's an error from AuthContext, show it
  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
      setShowError(true);
    }
  }, [authError]);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  });

  const initialValues = { email: '', password: '' };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoginAttempted(true);
      const success = await login(values);
      if (success) {
        await refreshUser();
        navigate('/dashboard');
      } else {
        // Login failed but error is already shown by the toast in AuthContext
        setShowError(true);
        setErrorMessage('Invalid credentials. Please check your email and password.');
        
        // Force error to persist
        setTimeout(() => {
          // Re-show error if it was dismissed
          setShowError(true);
        }, 500);
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      setErrorMessage(message);
      setShowError(true);
      
      // Custom toast for longer display
      toast.error(message, {
        autoClose: 8000,
        hideProgressBar: false,
      });
      
      // Force error to persist
      setTimeout(() => {
        // Re-show error if it was dismissed
        setShowError(true);
      }, 500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoginAttempted(true);
      const decoded = jwtDecode(credentialResponse.credential);
      const success = await googleLogin({
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
      });
      if (success) {
        await refreshUser();
        navigate('/dashboard');
      } else {
        setErrorMessage('Google login failed. Please try signing in with email and password instead.');
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Google login failed. Please try again or use email and password.');
      setShowError(true);
      
      // Custom toast for longer display
      toast.error('Google login failed. Please try again or use email and password.', {
        autoClose: 8000,
        hideProgressBar: false,
      });
    }
  };

  return (
    <div className="min-h-screen py-8 max-sm:py-6 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          {/* Left Side - Why Use LegacyNote */}
          <div className="lg:w-5/12 max-sm:hidden bg-gradient-to-br from-indigo-900 to-indigo-700 to-indigo-500 text-white p-8 lg:p-12">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Use LegacyNote?</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaClock className="w-6 h-6 text-indigo-200" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">Secure Time Capsules</h3>
                      <p className="text-indigo-100">
                        Create and store your memories, thoughts, and important moments securely. Set specific dates for when they can be accessed.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaShieldAlt className="w-6 h-6 text-indigo-200" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">Privacy Focused</h3>
                      <p className="text-indigo-100">
                        Your notes are encrypted and only accessible by you. We prioritize your privacy and data security at all times.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaGlobe className="w-6 h-6 text-indigo-200" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">Access Anywhere</h3>
                      <p className="text-indigo-100">
                        Retrieve your notes from any device, anywhere in the world. Your digital legacy is always at your fingertips.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-7/12 p-8 bg-gradient-to-br from-gray-800 to-indigo-700 to-gray-900 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white dark:text-gray-200">Welcome Back</h2>
                <p className="mt-2 text-gray-200 dark:text-gray-400">Sign in to access your secure notes</p>
              </div>

              {showError && loginAttempted && (
                <div className="p-4 mb-8 text-sm font-medium bg-red-600 text-white rounded-lg shadow-lg border-l-4 border-white login-error-banner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="mr-2 text-white flex-shrink-0 text-lg" />
                      <span className="font-bold text-base">LOGIN FAILED</span>
                    </div>
                    <button 
                      onClick={() => setShowError(false)}
                      className="text-white hover:text-gray-200 focus:outline-none"
                      aria-label="Close error message"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <p className="mt-2 font-normal text-white/90">
                    {errorMessage} Please check your credentials and try again.
                  </p>
                </div>
              )}

              <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-200 dark:text-gray-300">
                        <div className="flex items-center mb-1">
                          <FaEnvelope className="w-4 h-4 mr-2" />
                          Email Address
                        </div>
                      </label>
                      <Field
                        name="email"
                        type="email"
                        className="w-full px-3 py-2 border rounded-lg dark:border-gray-300 dark:bg-transparent dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="your@email.com"
                      />
                      <ErrorMessage 
                        name="email" 
                        component="div" 
                        className="text-sm text-red-600 dark:text-red-300 mt-1 font-medium" 
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-200 dark:text-gray-300">
                        <div className="flex items-center mb-1">
                          <FaLock className="w-4 h-4 mr-2" />
                          Password
                        </div>
                      </label>
                      <Field
                        name="password"
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg dark:border-gray-300 dark:bg-transparent dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="••••••••"
                      />
                      <ErrorMessage 
                        name="password" 
                        component="div" 
                        className="text-sm text-red-600 dark:text-red-300 mt-1 font-medium" 
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-white focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-white">Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-sm text-indigo-200 hover:underline dark:text-indigo-200">
                        Forgot password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-100/50 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                    >
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-gray-100 z-100 bg-indigo-800 border-indigo-800 border-2 rounded-full dark:text-gray-400">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                          setErrorMessage('Google login failed. Please try again.');
                          setShowError(true);
                        }}
                        useOneTap
                        shape="circle"
                        text="signin_with"
                        theme="outline"
                      />
                    </div>

                    <p className="text-sm text-center text-gray-200 dark:text-gray-400">
                      Don't have an account?{' '}
                      <Link
                        to="/register"
                        className="font-medium text-indigo-500 hover:underline dark:text-indigo-200"
                      >
                        Sign up here
                      </Link>
                    </p>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
