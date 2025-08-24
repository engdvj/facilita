import React from 'react';
import { FIELD_CLASS } from '../../utils/constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ 
  label, 
  error, 
  className = FIELD_CLASS, 
  ...props 
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
      <input 
        className={`${className} ${error ? 'border-red-500' : ''}`}
        {...props} 
      />
      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
    </div>
  );
}