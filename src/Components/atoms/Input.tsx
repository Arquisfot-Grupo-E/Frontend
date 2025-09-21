// src/components/atoms/Input.tsx
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full p-3 border border-[var(--card-border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] bg-[var(--card-bg-color)] text-[var(--text-color)] placeholder-[var(--text-muted)] transition-all duration-200 ${className}`}
      {...props}
    />
  );
};

export default Input;
