import React, { useState, useEffect } from "react";
import SearchBar from "../molecules/SearchBar";
import { User, UserPlus, LogOut } from "lucide-react";
import AuthModal, { type AuthModalMode } from "./AuthModal";
import { useAuth, type User as UserType } from "../../services/auth";
import { useToast } from "../../contexts/ToastContext";

type Props = {
  onSearch: (q: string) => void;
  onClear: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  placeholder?: string;
};

const Navbar: React.FC<Props> = ({
  onSearch,
  onClear,
  searchQuery,
  setSearchQuery,
  placeholder,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [user, setUser] = useState<UserType | null>(null);
  
  const { isAuthenticated, logout, getCachedUser } = useAuth();
  const { showInfo } = useToast();

  // Cargar usuario al montar el componente
  useEffect(() => {
    if (isAuthenticated()) {
      const cachedUser = getCachedUser();
      setUser(cachedUser);
    }
  // Ejecutar solo al montar: `isAuthenticated` y `getCachedUser` vienen de `useAuth()`
  // y sus referencias no son estables entre renders, lo que provocaba un bucle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginClick = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    // Recargar usuario después de autenticación exitosa
    if (isAuthenticated()) {
      const cachedUser = getCachedUser();
      setUser(cachedUser);
    }
  };

  const handleLogout = () => {
    const userName = user ? `${user.first_name} ${user.last_name}` : 'Usuario';
    
    logout();
    setUser(null);
    
    // Mostrar toast de logout
    showInfo(
      "Sesión cerrada",
      `Hasta luego, ${userName}`
    );
    
    // Opcional: recargar la página o redirigir
    window.location.reload();
  };

  return (
    <>
      <nav className="bg-[var(--primary-color)] text-[var(--text-on-primary)] shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo / Home */}
          <button
            onClick={onClear}
            className="text-xl font-bold whitespace-nowrap hover:text-[var(--text-muted)] transition-colors duration-200"
          >
            📚 Bookworm
          </button>

          {/* Barra de búsqueda */}
          <div className="flex-1 flex justify-center">
            <SearchBar
              onSearch={onSearch}
              value={searchQuery}
              setValue={setSearchQuery}
              placeholder={placeholder}
            />
          </div>

          {/* Botones de usuario */}
          <div className="flex gap-3 items-center">
            {user ? (
              // Usuario autenticado
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10">
                  <User size={16} />
                  <span className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--error-color)] text-white font-medium hover:bg-[var(--error-hover)] transition-all duration-200 shadow-sm"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} /> 
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              // Usuario no autenticado
              <>
                <button 
                  onClick={handleLoginClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-bg-color)] text-[var(--accent-color)] font-medium hover:bg-[var(--card-border-color)] hover:text-[var(--primary-color)] transition-all duration-200 shadow-sm"
                >
                  <User size={18} /> Ingresar
                </button>
                <button 
                  onClick={handleRegisterClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-color)] text-[var(--text-on-primary)] font-medium hover:bg-[var(--primary-color)] transition-all duration-200 shadow-sm"
                >
                  <UserPlus size={18} /> Crear cuenta
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;
