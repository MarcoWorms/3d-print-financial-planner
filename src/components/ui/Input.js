import React from 'react';

function Input({ 
  label,
  type = 'text',
  value,
  onChange,
  min,
  max,
  className = ''
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className={`mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
      />
    </div>
  );
}

export default Input; 