import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaLock, FaCheck, FaMoon, FaSun } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [resetComplete, setResetComplete] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check system preference for dark mode on component mount
  useEffect(() => {
    // Check if dark mode is stored in localStorage
    const storedTheme = localStorage.getItem('color-theme');
    
    if (storedTheme === 'dark' || 
        (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
    }
  };

  // Validation schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Form initial values
  const initialValues = {
    password: '',
    confirmPassword: '',
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const success = await resetPassword(resetToken, values.password);
      
      if (success) {
        setResetComplete(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      showErrorToast('Failed to reset password. The reset token may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md transition-colors duration-200">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Reset Password</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create a new password for your account
            </p>
          </div>

          {resetComplete ? (
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md text-green-800 dark:text-green-200 mb-6">
                <p>Your password has been reset successfully!</p>
                <p>You'll be redirected to the login page in a few seconds.</p>
              </div>
              <Link 
                to="/login" 
                className="inline-block px-6 py-2.5 bg-indigo-600 dark:bg-indigo-700 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-4">
                    <label 
                      htmlFor="password" 
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                    >
                      <FaLock className="mr-2 text-indigo-600 dark:text-indigo-400" /> New Password
                    </label>
                    <Field
                      type="password"
                      name="password"
                      id="password"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Enter your new password"
                    />
                    <ErrorMessage 
                      name="password" 
                      component="div" 
                      className="mt-1 text-sm text-red-600 dark:text-red-400" 
                    />
                  </div>

                  <div className="mb-6">
                    <label 
                      htmlFor="confirmPassword" 
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                    >
                      <FaCheck className="mr-2 text-indigo-600 dark:text-indigo-400" /> Confirm Password
                    </label>
                    <Field
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Confirm your new password"
                    />
                    <ErrorMessage 
                      name="confirmPassword" 
                      component="div" 
                      className="mt-1 text-sm text-red-600 dark:text-red-400" 
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      Remembered your password?{' '}
                      <Link 
                        to="/login" 
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Login here
                      </Link>
                    </p>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
