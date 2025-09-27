import React from "react";
import SearchResults from "../organisms/SearchResults";
import type { Book } from "../../types/Book";

type Props = {
  books: Book[];
  hasSearched: boolean;
  isLoading: boolean;
};

const BookSearch: React.FC<Props> = ({ books, hasSearched, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-40">
        <div className="w-12 h-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[var(--text-color)] text-lg">Buscando libros...</p>
      </div>
    );
  }

  if (hasSearched && books.length === 0) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-md text-center p-8 bg-[var(--card-bg-color)] rounded-lg border border-[var(--card-border-color)]">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-[var(--text-color)] text-xl font-medium mb-2">No hay resultados</p>
          <p className="text-[var(--text-muted)] text-sm">Intenta con palabras clave diferentes</p>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-6">📚</div>
        <h2 className="text-2xl font-bold text-[var(--text-color)] mb-3">
          ¡Encuentra tu próximo libro favorito!
        </h2>
        <p className="text-[var(--text-color)] text-lg">
          Usa la barra de búsqueda para explorar miles de libros
        </p>
      </div>
    );
  }

  return (
    <div className="search-results-container space-y-8">
      <div className="text-center py-4">
        <h2 className="text-xl font-semibold text-[var(--text-color)] mb-2">
          Resultados de búsqueda ({books.length} libros)
        </h2>
      </div>
      <SearchResults books={books} />
    </div>
  );
};

export default BookSearch;
