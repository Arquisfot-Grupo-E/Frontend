import React, { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
};

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle size={24} />,
          bgColor: 'bg-green-500',
          textColor: 'text-green-50',
          borderColor: 'border-green-400',
        };
      case 'error':
        return {
          icon: <XCircle size={24} />,
          bgColor: 'bg-red-500',
          textColor: 'text-red-50',
          borderColor: 'border-red-400',
        };
      case 'info':
        return {
          icon: <Info size={24} />,
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-50',
          borderColor: 'border-blue-400',
        };
      default:
        return {
          icon: <Info size={24} />,
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-50',
          borderColor: 'border-gray-400',
        };
    }
  };

  const { icon, bgColor, textColor, borderColor } = getIconAndColors();

  return (
    <div className={`toast-notification ${bgColor} ${textColor} border ${borderColor} rounded-lg p-4 shadow-lg max-w-sm w-full`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          {message && (
            <p className="text-sm opacity-90 mt-1">{message}</p>
          )}
        </div>
        
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-200"
          aria-label="Cerrar notificación"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-3 w-full bg-black/20 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-white/50 toast-progress-bar"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};

export default Toast;