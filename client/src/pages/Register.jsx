import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaClock, FaShieldAlt, FaGlobe } from 'react-icons/fa';
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
    <div className="min-h-screen py-8 max-sm:py-6 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          
          {/* Left Side - Why Create an Account */}
          <div className="lg:w-5/12 max-sm:hidden bg-gradient-to-br from-indigo-900 to-indigo-700 to-indigo-500 text-white p-8 lg:p-12">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Join LegacyNote?</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaClock className="w-6 h-6 text-indigo-200" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">Create Time Capsules</h3>
                      <p className="text-indigo-100">
                        Preserve your memories, thoughts, and important moments for future access. 
                        Set specific dates for when they can be opened.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaShieldAlt className="w-6 h-6 text-indigo-200" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                      <p className="text-indigo-100">
                        Your notes are encrypted and only accessible by you. We prioritize your 
                        privacy and data security at all times.
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
                        Access your notes from any device, anywhere in the world. 
                        Your digital legacy is always at your fingertips.
                      </p>
                    </div>
                  </div>
                </div>
              </div>              
            </div>
          </div>
          
          {/* Right Side - Registration Form */}
          <div className="lg:w-7/12 p-8 bg-gradient-to-br from-gray-800 to-indigo-700 to-gray-900 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white dark:text-gray-200">
                  Create an Account
                </h2>
                <p className="mt-2 text-gray-200 dark:text-gray-400">
                  Join LegacyNote to start creating your time capsules
                </p>
              </div>

              {showError && (
                <div className="p-4 mb-6 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
                  {errorMessage}
                </div>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-200 dark:text-gray-300">
                        <div className="flex items-center mb-1">
                          <FaUser className="w-4 h-4 mr-2" />
                          Full Name
                        </div>
                      </label>
                      <Field
                        name="name"
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg dark:border-gray-300 dark:bg-transparent dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your name"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-sm text-red-600 dark:text-red-300 mt-1 font-medium"
                      />
                    </div>

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

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 dark:text-gray-300">
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
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-sm text-red-600 dark:text-red-300 mt-1 font-medium"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 border border-white text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                      >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-100 dark:text-gray-100">
                        Already have an account?{' '}
                        <Link
                          to="/login"
                          className="font-medium pl-2 text-indigo-600 hover:underline dark:text-white "
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
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

export default Register;
