import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import FormInput from "../atoms/FormInput";
import FormButton from "../atoms/FormButton";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate } from 'react-router-dom';

type Props = {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToPasswordRecovery?: () => void;
};

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC<Props> = ({ onSuccess, onSwitchToRegister, onSwitchToPasswordRecovery }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  
  const { login, loginLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // La función login ahora devuelve los datos del usuario
      const userData = await login(formData.email, formData.password);
      
      showSuccess(
        "¡Bienvenido de vuelta!",
        "Has iniciado sesión correctamente"
      );

      // Redirigir basado en si el usuario ha completado la selección de preferencias
      if (userData.has_selected_preferences) {
        navigate('/feed');
      } else {
        navigate('/preferences');
      }
      onSuccess?.();
    } catch (error: any) {
      const message = error.message || "Error al iniciar sesión";
      
      showError(
        "Error al iniciar sesión",
        message
      );
      
      setErrors({ email: message });
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">
          Iniciar Sesión
        </h2>
        <p className="text-[var(--text-muted)]">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          type="email"
          label="Email"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          icon={<Mail size={20} />}
          autoComplete="email"
        />

        <FormInput
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          icon={<Lock size={20} />}
          autoComplete="current-password"
        />

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToPasswordRecovery}
            className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium transition-colors duration-200 text-sm"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <FormButton
          type="submit"
          label="Iniciar Sesión"
          variant="primary"
          fullWidth
          isLoading={loginLoading}
          className="mt-6"
        />
      </form>

      <div className="mt-6 text-center">
        <p className="text-[var(--text-muted)] text-sm">
          ¿No tienes una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium transition-colors duration-200"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;