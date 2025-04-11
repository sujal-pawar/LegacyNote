import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaLock, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [resetComplete, setResetComplete] = useState(false);

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
      toast.error('Failed to reset password. The reset token may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-600">
            Create a new password for your account
          </p>
        </div>

        {resetComplete ? (
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-md text-green-800 mb-6">
              <p>Your password has been reset successfully!</p>
              <p>You'll be redirected to the login page in a few seconds.</p>
            </div>
            <Link to="/login" className="btn btn-primary">
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
                  <label htmlFor="password" className="form-label flex items-center">
                    <FaLock className="mr-2" /> New Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className="form-control"
                    placeholder="Enter your new password"
                  />
                  <ErrorMessage name="password" component="div" className="form-error" />
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="form-label flex items-center">
                    <FaCheck className="mr-2" /> Confirm Password
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="form-control"
                    placeholder="Confirm your new password"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
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

export default ResetPassword; 