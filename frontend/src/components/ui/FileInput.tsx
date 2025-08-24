import React from 'react';
import { FIELD_CLASS } from '../../utils/constants';

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onFileSelect?: (file: File | null) => void;
}

export default function FileInput({ 
  label, 
  error, 
  onFileSelect,
  className = FIELD_CLASS,
  onChange,
  ...props 
}: FileInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelect?.(file);
    onChange?.(e);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
      <input 
        type="file"
        className={`${className} ${error ? 'border-red-500' : ''}`}
        onChange={handleChange}
        {...props} 
      />
      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
    </div>
  );
}