import React, { useState } from "react";
import { Mail, Lock, User, FileText } from "lucide-react";
import FormInput from "../atoms/FormInput";
import FormButton from "../atoms/FormButton";
import { useAuth, type RegisterData } from "../../services/auth";
import { useNavigate } from 'react-router-dom';
import { useToast } from "../../contexts/ToastContext";

type Props = {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
};

const RegisterForm: React.FC<Props> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    description: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Partial<RegisterData & { confirmPassword: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData & { confirmPassword: string }> = {};

    if (!formData.email) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.first_name) {
      newErrors.first_name = "El nombre es obligatorio";
    }

    if (!formData.last_name) {
      newErrors.last_name = "El apellido es obligatorio";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(formData);
      
      // Mostrar toast de éxito
      showSuccess(
        "¡Cuenta creada exitosamente!",
        `Bienvenido ${formData.first_name}, tu cuenta ha sido registrada`
      );

      // Redirigir a preferencias y notificar al componente padre
      navigate('/preferences');
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al registrar usuario";
      
      // Mostrar toast de error
      showError(
        "Error en el registro",
        message
      );
      
      setErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">
          Crear Cuenta
        </h2>
        <p className="text-[var(--text-muted)]">
          Únete a nuestra comunidad de lectores
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            type="text"
            label="Nombre"
            placeholder="Juan"
            value={formData.first_name}
            onChange={handleInputChange('first_name')}
            error={errors.first_name}
            icon={<User size={20} />}
            autoComplete="given-name"
          />

          <FormInput
            type="text"
            label="Apellido"
            placeholder="Pérez"
            value={formData.last_name}
            onChange={handleInputChange('last_name')}
            error={errors.last_name}
            icon={<User size={20} />}
            autoComplete="family-name"
          />
        </div>

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
          autoComplete="new-password"
        />

        <FormInput
          type="password"
          label="Confirmar Contraseña"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={errors.confirmPassword}
          icon={<Lock size={20} />}
          autoComplete="new-password"
        />

        <FormInput
          type="text"
          label="Descripción (opcional)"
          placeholder="Cuéntanos un poco sobre ti..."
          value={formData.description || ""}
          onChange={handleInputChange('description')}
          error={errors.description}
          icon={<FileText size={20} />}
        />

        <FormButton
          type="submit"
          label="Crear Cuenta"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        />
      </form>

      <div className="mt-6 text-center">
        <p className="text-[var(--text-muted)] text-sm">
          ¿Ya tienes una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium transition-colors duration-200"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;