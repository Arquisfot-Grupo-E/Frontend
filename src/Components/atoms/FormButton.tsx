import React from "react";

type FormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

const FormButton: React.FC<FormButtonProps> = ({ 
  label, 
  variant = 'primary', 
  isLoading = false,
  icon,
  fullWidth = false,
  className = '', 
  disabled,
  ...props 
}) => {
  const getButtonClasses = () => {
    const baseClasses = `px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2`;
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-[var(--primary-color)] hover:bg-[var(--accent-color)] text-[var(--text-on-primary)] shadow-md hover:shadow-lg`;
      case 'secondary':
        return `${baseClasses} bg-[var(--card-bg-color)] hover:bg-[var(--card-border-color)] text-[var(--text-color)] border border-[var(--card-border-color)] hover:border-[var(--accent-color)]`;
      case 'outline':
        return `${baseClasses} bg-transparent hover:bg-[var(--accent-color)] hover:text-[var(--text-on-primary)] text-[var(--accent-color)] border border-[var(--accent-color)]`;
      default:
        return `${baseClasses} bg-[var(--primary-color)] hover:bg-[var(--accent-color)] text-[var(--text-on-primary)]`;
    }
  };

  return (
    <button
      className={`${getButtonClasses()} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {icon && icon}
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default FormButton;