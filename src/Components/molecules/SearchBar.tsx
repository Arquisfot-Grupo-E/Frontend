import React from "react";
import { Search } from "lucide-react";

type Props = {
  onSearch: (query: string) => void;
  value: string;
  setValue: (query: string) => void;
  placeholder?: string;
};

const SearchBar: React.FC<Props> = ({ onSearch, value, setValue, placeholder = "Buscar..." }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-sm">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--card-border-color)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]
                   bg-[var(--card-bg-color)] text-[var(--text-color)] placeholder-[var(--text-muted)] text-sm transition-all duration-200"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-color)] hover:text-[var(--primary-color)] transition-colors duration-200"
      >
        <Search size={18} />
      </button>
    </form>
  );
};

export default SearchBar;
