import React from "react";
import { Search } from "lucide-react";

type Props = {
  onSearch: (query: string) => void;
  value: string;
  setValue: (query: string) => void;
};

const SearchBar: React.FC<Props> = ({ onSearch, value, setValue }) => {
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
        placeholder="Buscar..."
        className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-[var(--primary-color)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]
                   bg-[var(--card-bg-color)] text-[var(--text-color)] text-sm"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:text-[var(--secondary-color)]"
      >
        <Search size={18} />
      </button>
    </form>
  );
};

export default SearchBar;
