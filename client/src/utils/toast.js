import { toast } from 'react-toastify';

/**
 * Professional toast notification utilities
 * 
 * These functions provide standardized toast notifications with appropriate
 * styling and timing for different types of messages.
 */

// Default toast configuration
const defaultConfig = {
  position: "top-center",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  className: "toast-anim-enter"
};

/**
 * Display a success notification
 * Use for: Successful operations, confirmations, completed actions
 */
export const showSuccessToast = (message) => {
  toast.success(message, {
    ...defaultConfig,
    autoClose: 4000, // 4 seconds - success messages can be brief
  });
};

/**
 * Display an error notification
 * Use for: Operation failures, validation errors, system errors
 */
export const showErrorToast = (message) => {
  toast.error(message, {
    ...defaultConfig,
    autoClose: 6000, // 6 seconds - users need more time to read errors
    closeOnClick: false, // Don't dismiss on click for errors
  });
};

/**
 * Display a warning notification
 * Use for: Alerts about potential issues, confirmations for risky actions
 */
export const showWarningToast = (message) => {
  toast.warning(message, {
    ...defaultConfig,
    autoClose: 5000, // 5 seconds - warning deserves attention
  });
};

/**
 * Display an informational notification
 * Use for: Neutral information, status updates, non-critical notices
 */
export const showInfoToast = (message) => {
  toast.info(message, {
    ...defaultConfig,
    autoClose: 4000, // 4 seconds - informational can be brief
  });
};

/**
 * Display an authentication-related error notification
 * Use for: Login failures, unauthorized actions, authentication issues
 */
export const showAuthErrorToast = (message) => {
  toast.error(message, {
    ...defaultConfig,
    autoClose: 8000, // 8 seconds - give extra time for auth issues
    closeOnClick: false, // Don't dismiss on click
    className: "auth-error-toast toast-anim-enter",
  });
};

/**
 * Display a critical alert that requires explicit dismissal
 * Use for: Security warnings, connection issues, data loss warnings
 */
export const showCriticalToast = (message, type = 'error') => {
  const toastConfig = {
    ...defaultConfig,
    autoClose: false, // Doesn't auto-close
    closeOnClick: false, // Must use dismiss button
    className: "critical-alert toast-anim-enter",
  };

  switch (type) {
    case 'success':
      toast.success(message, toastConfig);
      break;
    case 'warning':
      toast.warning(message, toastConfig);
      break;
    case 'info':
      toast.info(message, toastConfig);
      break;
    default:
      toast.error(message, toastConfig);
  }
};

export default {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showAuthErrorToast,
  showCriticalToast
}; 