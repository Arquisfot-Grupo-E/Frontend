import React, { forwardRef } from "react";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]
                       bg-[var(--card-bg-color)] text-[var(--text-color)] placeholder-[var(--text-muted)]
                       transition-all duration-200 ${error ? 'border-[var(--error-color)]' : 'border-[var(--card-border-color)]'} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-[var(--error-color)]">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;