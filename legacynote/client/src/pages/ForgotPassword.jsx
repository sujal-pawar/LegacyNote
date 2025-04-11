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
      }
    } catch (error) {
      toast.error('Failed to send password reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <Link to="/login" className="text-primary-color hover:underline flex items-center w-auto inline-flex">
            <FaArrowLeft className="mr-2" /> Back to Login
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Forgot Password</h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {emailSent ? (
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-md text-green-800 mb-6">
              <p>Password reset instructions have been sent to your email.</p>
              <p>Please check your inbox and follow the instructions to reset your password.</p>
            </div>
            <Link to="/login" className="btn btn-primary">
              Return to Login
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
                <div className="mb-6">
                  <label htmlFor="email" className="form-label flex items-center">
                    <FaEnvelope className="mr-2" /> Email Address
                  </label>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage name="email" component="div" className="form-error" />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Reset Password'}
                </button>

                <div className="mt-4 text-center">
                  <p>
                    Remembered your password?{' '}
                    <Link to="/login" className="text-primary-color hover:underline">
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