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
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasSearched && books.length === 0) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <p className="text-center text-gray-500 text-lg mt-4">
            📭 No hay resultados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SearchResults books={books} />
    </div>
  );
};

export default BookSearch;
