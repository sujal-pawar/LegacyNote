import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  // Form initial values
  const initialValues = {
    email: '',
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const success = await forgotPassword(values.email);

      if (success) {
        setEmailSent(true);
        toast.success('Password reset instructions sent to your email.');
      }
    } catch (error) {
      toast.error('Failed to send password reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex py-16 items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800 mx-4">
        <div className="mb-6">
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500 flex items-center w-auto inline-flex"
          >
            <FaArrowLeft className="mr-2" /> Back to Login
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Forgot Password</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {emailSent ? (
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-md text-green-800 dark:bg-green-900/20 dark:text-green-400 mb-6">
              <p>Password reset instructions have been sent to your email.</p>
              <p>Please check your inbox and follow the instructions to reset your password.</p>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring focus:ring-indigo-300 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center mb-1">
                      <FaEnvelope className="w-4 h-4 mr-2" />
                      Email Address
                    </div>
                  </label>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage name="email" component="div" className="text-sm text-red-500 dark:text-red-400 mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring focus:ring-indigo disabled:opacity-[50%] transition duration-[300ms]"
                >
                  {isSubmitting ? 'Sending...' : 'Reset Password'}
                </button>

                <div className="mt-4 text-center">
                  <p>
                    <span className='text-white '>Remembered your password?{' '} <br /></span>
                    <Link
                      to="/login"
                      className="font-medium text-indigo-600 hover:text-indigo-dark hover:underline dark:text-indigo-light"
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
  );
};

export default ForgotPassword;
