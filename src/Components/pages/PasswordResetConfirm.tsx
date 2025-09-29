import React, { useState, useEffect } from "react";
import { Lock, CheckCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import FormInput from "../atoms/FormInput";
import FormButton from "../atoms/FormButton";
import { useAuth } from "../../services/auth";
import { useToast } from "../../contexts/ToastContext";


interface PasswordResetConfirmData {
 password: string;
 confirmPassword: string;
}


const PasswordResetConfirm: React.FC = () => {
 const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
 const navigate = useNavigate();
  const [formData, setFormData] = useState<PasswordResetConfirmData>({
   password: "",
   confirmPassword: "",
 });
 const [errors, setErrors] = useState<Partial<PasswordResetConfirmData>>({});
 const [isLoading, setIsLoading] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);
  const { confirmPasswordReset } = useAuth();
 const { showSuccess, showError } = useToast();


 // Verificar que tenemos los parámetros necesarios
 useEffect(() => {
   if (!uidb64 || !token) {
     showError(
       "Enlace inválido",
       "El enlace de recuperación no es válido. Solicita uno nuevo."
     );
     navigate("/");
   }
 }, [uidb64, token, navigate, showError]);


 const validatePassword = (password: string): string[] => {
   const errors: string[] = [];
  
   if (password.length < 8) {
     errors.push("Debe tener al menos 8 caracteres");
   }
   if (!/(?=.*[a-z])/.test(password)) {
     errors.push("Debe contener al menos una letra minúscula");
   }
   if (!/(?=.*[A-Z])/.test(password)) {
     errors.push("Debe contener al menos una letra mayúscula");
   }
   if (!/(?=.*\d)/.test(password)) {
     errors.push("Debe contener al menos un número");
   }
  
   return errors;
 };


 const validateForm = (): boolean => {
   const newErrors: Partial<PasswordResetConfirmData> = {};


   if (!formData.password) {
     newErrors.password = "La contraseña es obligatoria";
   } else {
     const passwordErrors = validatePassword(formData.password);
     if (passwordErrors.length > 0) {
       newErrors.password = passwordErrors.join(", ");
     }
   }


   if (!formData.confirmPassword) {
     newErrors.confirmPassword = "Confirma tu nueva contraseña";
   } else if (formData.password !== formData.confirmPassword) {
     newErrors.confirmPassword = "Las contraseñas no coinciden";
   }


   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };


 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
  
   if (!validateForm() || !uidb64 || !token) return;


   setIsLoading(true);
   try {
     await confirmPasswordReset(uidb64, token, formData.password);
    
     setIsSuccess(true);
    
     // Mostrar toast de éxito
     showSuccess(
       "¡Contraseña restablecida!",
       "Tu contraseña ha sido cambiada exitosamente"
     );
    
     // Redirigir al login después de 3 segundos
     setTimeout(() => {
       navigate("/");
     }, 3000);
    
   } catch (error) {
     const message = error instanceof Error ? error.message : "Error al restablecer la contraseña";
    
     // Mostrar toast de error
     showError(
       "Error al restablecer contraseña",
       message
     );
    
     setErrors({ password: message });
   } finally {
     setIsLoading(false);
   }
 };


 const handleInputChange = (field: keyof PasswordResetConfirmData) => (
   e: React.ChangeEvent<HTMLInputElement>
 ) => {
   setFormData(prev => ({ ...prev, [field]: e.target.value }));
   // Limpiar error del campo cuando el usuario empiece a escribir
   if (errors[field]) {
     setErrors(prev => ({ ...prev, [field]: undefined }));
   }
 };


 if (isSuccess) {
   return (
     <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
       <div className="w-full max-w-md bg-[var(--card-bg-color)] rounded-xl shadow-2xl border border-[var(--card-border-color)] p-8">
         <div className="text-center">
           <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
             <CheckCircle className="w-8 h-8 text-green-600" />
           </div>
           <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">
             ¡Contraseña Restablecida!
           </h2>
           <p className="text-[var(--text-muted)] mb-4">
             Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión automáticamente.
           </p>
           <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
             <p className="text-sm text-blue-800">
               Redirigiendo en 3 segundos...
             </p>
           </div>
         </div>
       </div>
     </div>
   );
 }


 return (
   <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
     <div className="w-full max-w-md bg-[var(--card-bg-color)] rounded-xl shadow-2xl border border-[var(--card-border-color)] p-8">
       <div className="text-center mb-6">
         <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">
           Nueva Contraseña
         </h2>
         <p className="text-[var(--text-muted)]">
           Ingresa tu nueva contraseña para completar la recuperación
         </p>
       </div>


       <form onSubmit={handleSubmit} className="space-y-4">
         <FormInput
           type="password"
           label="Nueva Contraseña"
           placeholder="••••••••"
           value={formData.password}
           onChange={handleInputChange('password')}
           error={errors.password}
           icon={<Lock size={20} />}
           autoComplete="new-password"
         />


         <FormInput
           type="password"
           label="Confirmar Nueva Contraseña"
           placeholder="••••••••"
           value={formData.confirmPassword}
           onChange={handleInputChange('confirmPassword')}
           error={errors.confirmPassword}
           icon={<Lock size={20} />}
           autoComplete="new-password"
         />


         <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <p className="text-sm text-gray-700 mb-2 font-medium">
             Tu contraseña debe cumplir:
           </p>
           <ul className="text-xs text-gray-600 space-y-1">
             <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
               <div className={`w-1 h-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
               Al menos 8 caracteres
             </li>
             <li className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : ''}`}>
               <div className={`w-1 h-1 rounded-full ${/(?=.*[a-z])/.test(formData.password) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
               Una letra minúscula
             </li>
             <li className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}`}>
               <div className={`w-1 h-1 rounded-full ${/(?=.*[A-Z])/.test(formData.password) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
               Una letra mayúscula
             </li>
             <li className={`flex items-center gap-2 ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}`}>
               <div className={`w-1 h-1 rounded-full ${/(?=.*\d)/.test(formData.password) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
               Un número
             </li>
           </ul>
         </div>


         <FormButton
           type="submit"
           label="Restablecer Contraseña"
           variant="primary"
           fullWidth
           isLoading={isLoading}
           className="mt-6"
         />
       </form>
     </div>
   </div>
 );
};


export default PasswordResetConfirm;
