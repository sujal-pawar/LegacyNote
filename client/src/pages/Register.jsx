import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaClock, FaShieldAlt, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .max(50, 'Name must be less than 50 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Form initial values
  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setShowError(false);
      const { confirmPassword, ...userData } = values;
      const success = await register(userData);
      if (success) {
        await refreshUser();
        navigate('/verify-email');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Registration failed. Please try again.');
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-gray-50 dark:bg-black transition-colors duration-200 overflow-hidden">
      {/* 50/50 split container - no rounded corners and full height */}
      <div className="flex flex-row w-full h-full">
        {/* Left Side - Why Use LegacyNote - exactly 50% */}
        <div className="w-1/2 max-md:hidden bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-500 text-white p-8 lg:p-12 overflow-y-auto">
          <div className="h-full flex flex-col justify-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">Join LegacyNote Today</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaClock className="w-8 h-8 text-indigo-200" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-semibold mb-3">Secure Time Capsules</h3>
                    <p className="text-indigo-100 text-lg">
                      Create and store your memories, thoughts, and important moments securely. Set specific dates for when they can be accessed.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaShieldAlt className="w-8 h-8 text-indigo-200" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-semibold mb-3">Privacy Focused</h3>
                    <p className="text-indigo-100 text-lg">
                      Your notes are encrypted and only accessible by you. We prioritize your privacy and data security at all times.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaGlobe className="w-8 h-8 text-indigo-200" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-semibold mb-3">Access Anywhere</h3>
                    <p className="text-indigo-100 text-lg">
                      Retrieve your notes from any device, anywhere in the world. Your digital legacy is always at your fingertips.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form - exactly 50% but on mobile takes full width */}
        <div className="w-1/2 max-md:w-full h-full p-8 bg-gradient-to-br from-gray-800 via-indigo-700 to-gray-900 lg:p-12 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md">            <div className="flex items-center mb-8">
              <Link 
                to="/" 
                className="p-2 mr-2 rounded-full text-white hover:bg-indigo-600 transition-colors duration-200"
                aria-label="Back to home"
              >
                <FaArrowLeft className="w-5 h-5" />
              </Link>
              <div className="text-center flex-grow">
                <h2 className="text-3xl font-bold text-white dark:text-gray-200">Create an Account</h2>
                <p className="mt-2 text-gray-200 dark:text-gray-400">Begin saving your memories for the future</p>
              </div>
            </div>

            {showError && (
              <div className="p-4 mb-8 text-sm bg-red-600 text-white rounded-lg">
                <p className="font-medium">{errorMessage}</p>
              </div>
            )}

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                      <div className="flex items-center mb-1">
                        <FaUser className="w-4 h-4 mr-2" />
                        Full Name
                      </div>
                    </label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg dark:border-gray-300 dark:bg-transparent dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="John Doe"
                    />
                    <ErrorMessage name="name" component="div" className="text-sm text-red-600 dark:text-red-300 mt-1" />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200">
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
                    <ErrorMessage name="email" component="div" className="text-sm text-red-600 dark:text-red-300 mt-1" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200">
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
                    <ErrorMessage name="password" component="div" className="text-sm text-red-600 dark:text-red-300 mt-1" />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                      <div className="flex items-center mb-1">
                        <FaCheck className="w-4 h-4 mr-2" />
                        Confirm Password
                      </div>
                    </label>
                    <Field
                      name="confirmPassword"
                      type="password"
                      className="w-full px-3 py-2 border rounded-lg dark:border-gray-300 dark:bg-transparent dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-600 dark:text-red-300 mt-1" />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border font-semibold border-gray-100/50 text-indigo-800 bg-indigo-200 rounded-lg hover:bg-indigo-300 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
                  </button>

                  <p className="text-sm text-center text-gray-200">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-white">
                      Sign in here
                    </Link>
                  </p>

                  <div className="text-xs text-center text-gray-300 mt-4">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className="text-indigo-300 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-indigo-300 hover:underline">Privacy Policy</Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
