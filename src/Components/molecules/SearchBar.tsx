import React, { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
};

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl mx-auto mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca un libro..."
        className="flex-1 px-4 py-2 rounded-l-xl border border-[var(--primary-color)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]
                   bg-[var(--card-bg-color)] text-[var(--text-color)]"
      />
      <button
        type="submit"
        className="px-6 py-2 rounded-r-xl bg-[var(--primary-color)] text-white font-semibold
                   hover:bg-[var(--secondary-color)] transition-colors"
      >
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
