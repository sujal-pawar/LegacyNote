/**
 * Server Status Utility
 * 
 * Provides functions to check server availability and diagnose connection issues
 */

import axios from 'axios';
import { showInfoToast, showErrorToast } from './toast';

// Cache the status check to avoid multiple rapid checks
let lastCheck = null;
let lastCheckTime = 0;
const CACHE_TIME = 30000; // 30 seconds

/**
 * Check if the server is available by making a lightweight request
 * @param {string} serverUrl - The base URL of the server to check
 * @returns {Promise<boolean>} - True if server is responding, false otherwise
 */
export const checkServerAvailability = async (serverUrl) => {
  // Use cached result if available and recent
  const now = Date.now();
  if (lastCheck !== null && now - lastCheckTime < CACHE_TIME) {
    return lastCheck;
  }

  try {
    // Use a small timeout for the health check
    const response = await axios.get(`${serverUrl}/health`, { 
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });
    
    const isAvailable = response.status === 200;
    lastCheck = isAvailable;
    lastCheckTime = now;
    return isAvailable;
  } catch (error) {
    console.warn('Server health check failed:', error.message);
    lastCheck = false;
    lastCheckTime = now;
    return false;
  }
};

/**
 * Diagnose connection issues by checking multiple things
 * @param {string} serverUrl - The base URL of the server to check
 * @returns {Promise<Object>} - Diagnostic information
 */
export const diagnoseConnectionIssues = async (serverUrl) => {
  // Determine if the frontend and backend URLs match in environment
  const frontendOrigin = window.location.origin;
  const isLocalFrontend = frontendOrigin.includes('localhost') || frontendOrigin.includes('127.0.0.1');
  const isLocalBackend = serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1');
  
  // Check internet connectivity first
  const isOnline = navigator.onLine;
  
  // Only check server if we have internet
  let serverAvailable = false;
  if (isOnline) {
    serverAvailable = await checkServerAvailability(serverUrl);
  }
  
  // Create diagnostic results
  const diagnostics = {
    internetConnected: isOnline,
    serverResponding: serverAvailable,
    environmentMismatch: isLocalFrontend !== isLocalBackend,
    localFrontend: isLocalFrontend,
    localBackend: isLocalBackend,
    frontendUrl: frontendOrigin,
    backendUrl: serverUrl,
    timestamp: new Date().toISOString()
  };
  
  return diagnostics;
};

/**
 * Show appropriate messages to user based on connection diagnostics
 * @param {Object} diagnostics - Results from diagnoseConnectionIssues
 */
export const showConnectionDiagnostics = (diagnostics) => {
  if (!diagnostics.internetConnected) {
    showErrorToast('Your device is not connected to the internet. Please check your connection.');
    return;
  }
  
  if (!diagnostics.serverResponding) {
    if (diagnostics.environmentMismatch) {
      showErrorToast(
        'Connection error: The deployed frontend is trying to connect to a local server. ' +
        'Please contact support or use the correct URL.'
      );
    } else {
      showErrorToast(
        'Our server appears to be offline or unreachable. ' +
        'Please try again later or contact support if the issue persists.'
      );
    }
    return;
  }
  
  showInfoToast('Diagnostic check complete. Server is available.');
};

export default {
  checkServerAvailability,
  diagnoseConnectionIssues,
  showConnectionDiagnostics
}; 