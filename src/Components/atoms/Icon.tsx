import React from "react";

type IconProps = {
  name: 'search' | 'user' | 'book' | 'star' | 'heart' | 'menu' | 'close';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const Icon: React.FC<IconProps> = ({ name, size = 'md', className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getIcon = () => {
    switch (name) {
      case 'search':
        return '🔍';
      case 'user':
        return '👤';
      case 'book':
        return '📖';
      case 'star':
        return '⭐';
      case 'heart':
        return '❤️';
      case 'menu':
        return '☰';
      case 'close':
        return '✕';
      default:
        return '●';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center text-[var(--accent-color)] ${getSizeClasses()} ${className}`}>
      {getIcon()}
    </span>
  );
};

export default Icon;
