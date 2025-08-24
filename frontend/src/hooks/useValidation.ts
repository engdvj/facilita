import { useState, useCallback } from 'react';
import { ValidationResult, ValidationError } from '../utils/validation';

interface UseValidationReturn {
  errors: Record<string, string>;
  hasErrors: boolean;
  validateField: (field: string, value: any, validator: (value: any) => ValidationResult) => boolean;
  validateForm: (data: any, validator: (data: any) => ValidationResult) => boolean;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setError: (field: string, message: string) => void;
  getFieldError: (field: string) => string | undefined;
}

export default function useValidation(): UseValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasErrors = Object.keys(errors).length > 0;

  const setFieldErrors = useCallback((validationErrors: ValidationError[]) => {
    const errorMap: Record<string, string> = {};
    validationErrors.forEach(error => {
      errorMap[error.field] = error.message;
    });
    setErrors(prev => ({ ...prev, ...errorMap }));
  }, []);

  const clearFieldErrors = useCallback((fields: string[]) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      fields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  const validateField = useCallback((
    field: string, 
    value: any, 
    validator: (value: any) => ValidationResult
  ): boolean => {
    const result = validator(value);
    
    if (result.isValid) {
      clearFieldErrors([field]);
      return true;
    } else {
      setFieldErrors(result.errors);
      return false;
    }
  }, [setFieldErrors, clearFieldErrors]);

  const validateForm = useCallback((
    data: any, 
    validator: (data: any) => ValidationResult
  ): boolean => {
    const result = validator(data);
    
    if (result.isValid) {
      setErrors({});
      return true;
    } else {
      const errorMap: Record<string, string> = {};
      result.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return false;
    }
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors[field];
  }, [errors]);

  return {
    errors,
    hasErrors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    setError,
    getFieldError
  };
}