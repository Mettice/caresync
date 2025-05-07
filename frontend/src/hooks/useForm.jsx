import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook to manage form state, validation, and submission
 * @param {Object} options - Form configuration options
 * @param {Object} options.initialValues - Initial form values
 * @param {Object} options.validationSchema - Validation rules for form fields
 * @param {Function} options.onSubmit - Function to call on form submission
 * @returns {Object} Form state and handlers
 */
export const useForm = ({
  initialValues = {},
  validationSchema = {},
  onSubmit
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Validate a single field
  const validateField = useCallback(
    (name, value) => {
      if (!validationSchema[name]) return '';

      const fieldSchema = validationSchema[name];
      const { required, min, max, minLength, maxLength, pattern, validate } = fieldSchema;
      
      // Check required
      if (required && (!value || (Array.isArray(value) && value.length === 0))) {
        return fieldSchema.errorMessages?.required || 'This field is required';
      }
      
      // Skip other validations if empty and not required
      if (!value && !required) return '';
      
      // Check min/max for numbers
      if (typeof value === 'number') {
        if (min !== undefined && value < min) {
          return fieldSchema.errorMessages?.min || `Value must be at least ${min}`;
        }
        if (max !== undefined && value > max) {
          return fieldSchema.errorMessages?.max || `Value must be at most ${max}`;
        }
      }
      
      // Check minLength/maxLength for strings
      if (typeof value === 'string') {
        if (minLength !== undefined && value.length < minLength) {
          return fieldSchema.errorMessages?.minLength || `Must be at least ${minLength} characters`;
        }
        if (maxLength !== undefined && value.length > maxLength) {
          return fieldSchema.errorMessages?.maxLength || `Must be at most ${maxLength} characters`;
        }
        if (pattern && !pattern.test(value)) {
          return fieldSchema.errorMessages?.pattern || 'Invalid format';
        }
      }
      
      // Custom validation function
      if (validate && typeof validate === 'function') {
        const customError = validate(value, values);
        if (customError) return customError;
      }
      
      return '';
    },
    [validationSchema, values]
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [validationSchema, validateField, values]);

  // Handle field change
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;
      
      setValues(prev => ({
        ...prev,
        [name]: fieldValue
      }));
      
      // Clear error when field changes
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    },
    [errors]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
      
      // Validate field on blur
      const error = validateField(name, values[name]);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    },
    [validateField, values]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      
      setSubmitCount(prev => prev + 1);
      
      // Validate all fields
      const isValid = validateForm();
      if (!isValid) {
        // Mark all fields as touched to show errors
        const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setTouched(allTouched);
        return;
      }
      
      // Submit form if valid
      if (onSubmit) {
        try {
          setIsSubmitting(true);
          await onSubmit(values, { resetForm });
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validateForm, validationSchema, onSubmit, values, resetForm]
  );

  // Set a specific field value programmatically
  const setFieldValue = useCallback(
    (name, value) => {
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
    },
    []
  );

  // Set a specific field error programmatically
  const setFieldError = useCallback(
    (name, error) => {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    },
    []
  );

  // Derived state
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [values, initialValues]
  );

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    submitCount,
    
    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateForm,
    validateField
  };
};