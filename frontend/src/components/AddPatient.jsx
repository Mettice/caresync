import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useForm } from '../hooks/useForm';
import { useApi } from '../hooks/useApi';
import { createMemoizedComponent } from '../hooks/useMemoization';
import { useGlobalState } from '../context/GlobalStateContext';
import apiService from '../lib/api-service';

// Define validation schema for the form
const validationSchema = {
  first_name: {
    required: true,
    minLength: 2,
    errorMessages: {
      required: 'First name is required',
      minLength: 'First name must be at least 2 characters'
    }
  },
  last_name: {
    required: true,
    minLength: 2,
    errorMessages: {
      required: 'Last name is required',
      minLength: 'Last name must be at least 2 characters'
    }
  },
  date_of_birth: {
    required: true,
    validate: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Invalid date format';
      if (date > new Date()) return 'Date of birth cannot be in the future';
      return '';
    },
    errorMessages: {
      required: 'Date of birth is required'
    }
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessages: {
      required: 'Email is required',
      pattern: 'Please enter a valid email address'
    }
  },
  phone: {
    required: true,
    pattern: /^\d{10}$/,
    errorMessages: {
      required: 'Phone number is required',
      pattern: 'Phone number must be 10 digits'
    }
  },
  gender: {
    required: true,
    errorMessages: {
      required: 'Gender is required'
    }
  },
  address: {
    required: true,
    minLength: 5,
    errorMessages: {
      required: 'Address is required',
      minLength: 'Address must be at least 5 characters'
    }
  }
};

const AddPatient = ({ branchId, onSuccess }) => {
  const navigate = useNavigate();
  const { actions } = useGlobalState();
  
  // API call handlers using custom hooks
  const createPatientApi = useApi({
    apiFunction: apiService.patients.createPatient,
    showToasts: true,
    toastMessages: {
      loading: 'Creating patient record...',
      success: 'Patient added successfully',
      error: 'Failed to add patient'
    }
  });
  
  // Form state management using custom hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    isValid
  } = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      email: '',
      phone: '',
      gender: '',
      address: '',
      medical_history: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (formData) => {
      try {
        actions.startApiCall();
        
        // Format date for API
        const formattedData = {
          ...formData,
          date_of_birth: format(new Date(formData.date_of_birth), 'yyyy-MM-dd'),
          branch_id: branchId
        };
        
        // Call the API
        const result = await createPatientApi.execute(formattedData);
        
        if (result.success) {
          // Reset form after successful submission
          resetForm();
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess(result.data);
          }
        }
      } catch (error) {
        console.error('Error creating patient:', error);
      } finally {
        actions.finishApiCall();
      }
    }
  });
  
  // Derived state
  const isLoading = isSubmitting || createPatientApi.loading;
  const hasError = createPatientApi.hasError;
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Patient</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={values.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                touched.first_name && errors.first_name ? 'border-red-500' : ''
              }`}
            />
            {touched.first_name && errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={values.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                touched.last_name && errors.last_name ? 'border-red-500' : ''
              }`}
            />
            {touched.last_name && errors.last_name && (
              <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                touched.email && errors.email ? 'border-red-500' : ''
              }`}
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                touched.phone && errors.phone ? 'border-red-500' : ''
              }`}
            />
            {touched.phone && errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
        
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={values.date_of_birth}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                touched.date_of_birth && errors.date_of_birth ? 'border-red-500' : ''
              }`}
            />
            {touched.date_of_birth && errors.date_of_birth && (
              <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={values.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                touched.gender && errors.gender ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {touched.gender && errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
        </div>
        
        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              touched.address && errors.address ? 'border-red-500' : ''
            }`}
          />
          {touched.address && errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        
        {/* Medical History */}
        <div>
          <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700">
            Medical History (Optional)
          </label>
          <textarea
            id="medical_history"
            name="medical_history"
            rows={3}
            value={values.medical_history}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        {/* Error message */}
        {hasError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {createPatientApi.error || 'Failed to create patient record. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading || !isValid
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Patient...
              </>
            ) : (
              'Add Patient'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Use memoization to optimize rendering
export default createMemoizedComponent(AddPatient, (prevProps, nextProps) => {
  return prevProps.branchId === nextProps.branchId;
});