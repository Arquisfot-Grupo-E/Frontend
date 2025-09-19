import React from "react";
import SearchBar from "../molecules/SearchBar";
import { User, UserPlus } from "lucide-react";

type Props = {
  onSearch: (q: string) => void;
  onClear: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

const Navbar: React.FC<Props> = ({
  onSearch,
  onClear,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <nav className="bg-[var(--primary-color)] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {/* Logo / Home */}
        <button
          onClick={onClear}
          className="text-xl font-bold whitespace-nowrap hover:opacity-90 transition"
        >
          📚 Bookworm
        </button>

        {/* Barra de búsqueda */}
        <div className="flex-1 flex justify-center">
          <SearchBar
            onSearch={onSearch}
            value={searchQuery}
            setValue={setSearchQuery}
          />
        </div>

        {/* Botones de usuario */}
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-[var(--primary-color)] font-medium hover:bg-[var(--secondary-color)] hover:text-white transition">
            <User size={18} /> Ingresar
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-[var(--primary-color)] font-medium hover:bg-[var(--secondary-color)] hover:text-white transition">
            <UserPlus size={18} /> Crear cuenta
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
