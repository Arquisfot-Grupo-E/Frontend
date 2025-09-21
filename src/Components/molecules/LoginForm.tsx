import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import FormInput from "../atoms/FormInput";
import FormButton from "../atoms/FormButton";
import { useAuth, type LoginCredentials } from "../../services/auth";
import { useToast } from "../../contexts/ToastContext";

type Props = {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
};

const LoginForm: React.FC<Props> = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

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

    setIsLoading(true);
    try {
      await login(formData);
      
      // Mostrar toast de éxito
      showSuccess(
        "¡Bienvenido de vuelta!", 
        "Has iniciado sesión correctamente"
      );
      
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión";
      
      // Mostrar toast de error
      showError(
        "Error al iniciar sesión",
        message
      );
      
      setErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
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

        <FormButton
          type="submit"
          label="Iniciar Sesión"
          variant="primary"
          fullWidth
          isLoading={isLoading}
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