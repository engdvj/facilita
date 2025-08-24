import React from 'react';
import { FIELD_CLASS } from '../../utils/constants';

interface SelectOption {
  value: string | number;
  label: string;
  style?: React.CSSProperties;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export default function Select({ 
  label, 
  error, 
  options, 
  placeholder,
  className = FIELD_CLASS, 
  ...props 
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
      <select 
        className={`${className} ${error ? 'border-red-500' : ''}`}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            style={option.style}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
    </div>
  );
}