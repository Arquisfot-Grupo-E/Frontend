import React from "react";

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xl';
      case 'lg':
        return 'text-4xl';
      default:
        return 'text-2xl';
    }
  };

  return (
    <div className={`font-bold text-[var(--text-color)] ${getSizeClasses()} ${className}`}>
      📚 BookReview
    </div>
  );
};

export default Logo;
