import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import LoginForm from "../molecules/LoginForm";
import RegisterForm from "../molecules/RegisterForm";
import ResetPasswordForm from "../molecules/ResetPasswordForm";

export type AuthModalMode = 'login' | 'register' | 'password-recovery';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
  onAuthSuccess?: () => void;
};

const AuthModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onAuthSuccess 
}) => {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  // Resetear modo cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md mx-4 bg-[var(--card-bg-color)] rounded-xl shadow-2xl border border-[var(--card-border-color)] animate-fadeInScale">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--card-border-color)] rounded-full transition-all duration-200 z-10"
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        {/* Contenido del modal */}
       <div className="p-8 pt-12">
         {mode === 'login' ? (
           <LoginForm
             onSuccess={handleAuthSuccess}
             onSwitchToRegister={() => setMode('register')}
             onSwitchToPasswordRecovery={() => setMode('password-recovery')}
           />
         ) : mode === 'register' ? (
           <RegisterForm
             onSuccess={handleAuthSuccess}
             onSwitchToLogin={() => setMode('login')}
           />
         ) : (
           <ResetPasswordForm
             onBackToLogin={() => setMode('login')}
           />
         )}
       </div>

        {/* Indicador visual del modo */}
        <div className="flex border-t border-[var(--card-border-color)]">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
              mode === 'login'
                ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
              mode === 'register'
                ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;