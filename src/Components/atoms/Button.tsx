// src/components/atoms/Button.tsx
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
};

const Button: React.FC<ButtonProps> = ({ label, variant = 'primary', className = '', ...props }) => {
  const getButtonClasses = () => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-[var(--primary-color)] hover:bg-[var(--primary-light)] text-[var(--text-on-primary)] shadow-md hover:shadow-lg`;
      case 'secondary':
        return `${baseClasses} bg-[var(--card-bg-color)] hover:bg-[var(--card-border-color)] text-[var(--text-color)] border border-[var(--card-border-color)]`;
      case 'outline':
        return `${baseClasses} bg-transparent hover:bg-[var(--card-bg-color)] text-[var(--accent-color)] border border-[var(--accent-color)] hover:border-[var(--accent-hover)]`;
      default:
        return `${baseClasses} bg-[var(--primary-color)] hover:bg-[var(--primary-light)] text-[var(--text-on-primary)]`;
    }
  };

  return (
    <button
      className={`${getButtonClasses()} ${className}`}
      {...props}
    >
      {label}
    </button>
  );
};

export default Button;
