import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import FormInput from "../atoms/FormInput";
import FormButton from "../atoms/FormButton";
import { useAuth } from "../../services/auth";
import { useToast } from "../../contexts/ToastContext";


type Props = {
 onBackToLogin: () => void;
};


interface ResetPasswordData {
 email: string;
}


const ResetPasswordForm: React.FC<Props> = ({ onBackToLogin }) => {
 const [formData, setFormData] = useState<ResetPasswordData>({
   email: "",
 });
 const [errors, setErrors] = useState<Partial<ResetPasswordData>>({});
 const [isLoading, setIsLoading] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
 const { showSuccess, showError } = useToast();


 const validateForm = (): boolean => {
   const newErrors: Partial<ResetPasswordData> = {};


   if (!formData.email) {
     newErrors.email = "El email es obligatorio";
   } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
     newErrors.email = "El email no es válido";
   }


   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };


 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
  
   if (!validateForm()) return;


   setIsLoading(true);
   try {
     await resetPassword(formData.email);
    
     setIsSuccess(true);
    
     // Mostrar toast de éxito
     showSuccess(
       "¡Email enviado!",
       "Revisa tu bandeja de entrada para continuar con la recuperación"
     );
    
   } catch (error) {
     const message = error instanceof Error ? error.message : "Error al enviar el email";
    
     // Mostrar toast de error
     showError(
       "Error en la recuperación",
       message
     );
    
     setErrors({ email: message });
   } finally {
     setIsLoading(false);
   }
 };


 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { value } = e.target;
   setFormData(prev => ({ ...prev, email: value }));
   // Limpiar error del campo cuando el usuario empiece a escribir
   if (errors.email) {
     setErrors(prev => ({ ...prev, email: undefined }));
   }
 };


 if (isSuccess) {
   return (
     <div className="w-full max-w-md">
       <div className="text-center mb-6">
         <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
           <Mail className="w-8 h-8 text-green-600" />
         </div>
         <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">
           ¡Email Enviado!
         </h2>
         <p className="text-[var(--text-muted)]">
           Te hemos enviado un enlace de recuperación a <strong>{formData.email}</strong>. Haz clic en el enlace del email para restablecer tu contraseña.
         </p>
       </div>


       <div className="space-y-4">
         <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
           <p className="text-sm text-blue-800">
             Si no encuentras el email, revisa tu carpeta de spam o correo no deseado.
           </p>
         </div>


         <FormButton
           type="button"
           label="Volver al inicio de sesión"
           variant="secondary"
           fullWidth
           onClick={onBackToLogin}
           icon={<ArrowLeft size={20} />}
         />
       </div>
     </div>
   );
 }


 return (
   <div className="w-full max-w-md">
     <div className="text-center mb-6">
       <h2 className="text-2xl font-bold text-[var(--text-color)] mb-2">
         Recuperar Contraseña
       </h2>
       <p className="text-[var(--text-muted)]">
         Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
       </p>
     </div>


     <form onSubmit={handleSubmit} className="space-y-4">
       <FormInput
         type="email"
         label="Email"
         placeholder="tu@email.com"
         value={formData.email}
         onChange={handleInputChange}
         error={errors.email}
         icon={<Mail size={20} />}
         autoComplete="email"
       />


       <FormButton
         type="submit"
         label="Enviar Enlace de Recuperación"
         variant="primary"
         fullWidth
         isLoading={isLoading}
         className="mt-6"
       />
     </form>


     <div className="mt-6 text-center">
       <button
         type="button"
         onClick={onBackToLogin}
         className="text-[var(--text-muted)] hover:text-[var(--text-color)] font-medium transition-colors duration-200 inline-flex items-center gap-2"
       >
         <ArrowLeft size={16} />
         Volver al inicio de sesión
       </button>
     </div>
   </div>
 );
};




export default ResetPasswordForm;

