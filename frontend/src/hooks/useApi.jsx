import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for handling API calls with automatic loading and error states
 * @param {Object} options - Configuration options
 * @param {Function} options.apiFunction - The API function to call
 * @param {boolean} options.showToasts - Whether to show success/error toasts
 * @param {Object} options.toastMessages - Custom toast messages
 * @returns {Object} API call state and handler function
 */
export const useApi = ({
  apiFunction,
  showToasts = true,
  toastMessages = {
    loading: null,
    success: 'Operation successful',
    error: 'An error occurred'
  }
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute the API call
   * @param {Array} args - Arguments to pass to the API function
   * @returns {Promise<Object>} Result of the API call
   */
  const execute = useCallback(async (...args) => {
    try {
      // Show loading toast if specified
      let loadingToastId;
      if (showToasts && toastMessages.loading) {
        loadingToastId = toast.loading(toastMessages.loading);
      }
      
      // Set loading state
      setLoading(true);
      setError(null);
      
      // Call the API function
      const result = await apiFunction(...args);
      
      // Handle result
      if (result && result.success === false) {
        // API call succeeded but returned an error
        throw new Error(result.error || 'Operation failed');
      }
      
      // Update data state
      setData(result.data || result);
      
      // Show success toast if specified
      if (showToasts) {
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }
        if (toastMessages.success) {
          toast.success(toastMessages.success);
        }
      }
      
      return result;
    } catch (err) {
      // Set error state
      const errorMessage = err.message || toastMessages.error;
      setError(errorMessage);
      
      // Show error toast if specified
      if (showToasts) {
        if (toastMessages.error) {
          toast.error(errorMessage);
        }
      }
      
      // Return error result
      return { success: false, error: errorMessage };
    } finally {
      // Reset loading state
      setLoading(false);
    }
  }, [apiFunction, showToasts, toastMessages]);

  return {
    execute,
    data,
    loading,
    error,
    hasError: !!error,
    isSuccess: !!data && !error
  };
};

/**
 * Factory function to create pre-configured API hooks
 * @param {Object} apiService - API service object containing multiple API functions
 * @returns {Object} Object containing pre-configured API hooks
 */
export const createApiHooks = (apiService) => {
  const hooks = {};
  
  // Create a hook for each API function
  Object.entries(apiService).forEach(([serviceName, serviceFunctions]) => {
    hooks[serviceName] = {};
    
    Object.entries(serviceFunctions).forEach(([functionName, apiFunction]) => {
      // Create a custom hook for this API function
      hooks[serviceName][functionName] = (options = {}) => {
        return useApi({
          apiFunction,
          ...options
        });
      };
    });
  });
  
  return hooks;
};

export default useApi; 