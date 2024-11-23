import React from 'react';

function Button({ onClick, children, variant = 'primary', className = '', type = 'button' }) {
  const baseStyles = "px-4 py-2 rounded-md transition-colors";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "text-red-600 hover:text-red-800",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button; 