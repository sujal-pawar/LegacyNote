import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/api';
import { showSuccessToast, showErrorToast, showAuthErrorToast } from '../utils/toast';

const VerifyEmail = () => {
  const { user, verifyEmail, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleResendVerification = async () => {
    if (!user || !user.email) {
      showErrorToast('User information not available. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.resendVerification(user.email);
      setResendSuccess(true);
      showSuccessToast('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      let errorMessage;
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || 'Failed to send verification email';
      } else if (error.request) {
        errorMessage = 'Server did not respond. Please try again later.';
      } else {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      showErrorToast('Please enter a valid 6-digit code');
      return;
    }

    if (!user?.email) {
      showErrorToast('User email not available. Please log in again.');
      return;
    }

    try {
      setVerifying(true);
      const success = await verifyEmail(user.email, otpCode);
      
      if (success) {
        await refreshUser();
        setVerificationSuccess(true);
        showSuccessToast('Email verification successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        showErrorToast('Verification failed. Please check the code and try again.');
      }
    } catch (error) {
      console.error('Error in verification process:', error);
      // No need to manually show errors here since the verifyEmail function in AuthContext now handles them
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handle paste event for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Only process if it seems to be an OTP
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp(newOtp);
      
      // Focus the last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  return (
    <div className="min-h-screen py-16 max-sm:py-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-black rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <FaEnvelope className="text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-center">
              {verificationSuccess ? 'Email Verified!' : 'Email Verification Required'}
            </h1>
          </div>

          <div className="p-6">
            {verificationSuccess ? (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0 text-xl" />
                <div>
                  <p className="font-medium text-lg">Account created successfully!</p>
                  <p>Your email has been verified and your account is now active. You will be redirected to the dashboard momentarily.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Your account setup is almost complete! Please verify your email address ({user?.email}) to activate your account and access all features.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We've sent a verification code to <span className="font-semibold">{user?.email}</span>. Please enter the 6-digit verification code below to complete your account creation:
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  If you didn't receive the code,please<span className='text-yellow-300'> check your  spam </span> or click on resend to request a new verification code.
                </p>
                
                <form onSubmit={handleVerifyOTP} className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="flex gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength="1"
                          className="w-12 h-12 text-center text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={verifying || otp.join('').length !== 6}
                    className="w-full mb-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {verifying ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Verifying...
                      </>
                    ) : (
                      'Verify Email & Complete Registration'
                    )}
                  </button>
                </form>              

                {resendSuccess ? (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Verification email sent!</p>
                      <p className="text-sm">We've sent a new verification code. Please check your inbox and enter the 6-digit code above.</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="w-full mb-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Sending...
                      </>
                    ) : (
                      'Resend Verification Code'
                    )}
                  </button>
                )}
              </>
            )}

            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between">
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500 flex items-center">
                  <FaArrowLeft className="mr-1" /> Back to Login
                </Link>
                <Link to="/" className="text-indigo-600 hover:text-indigo-500">
                  Go to Home Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 