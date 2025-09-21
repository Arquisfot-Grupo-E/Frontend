import React from "react";
import type { Book } from "../../types/Book";
import BookCard from "../atoms/BookCard";

type Props = {
  categoryName: string;
  books: Book[];
  onClose: () => void;
  onBookSelect?: (book: Book) => void;
  isLoading?: boolean;
};

const ExpandedCategorySection: React.FC<Props> = ({
  categoryName,
  books,
  onClose,
  onBookSelect,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-8 bg-gradient-to-br from-[var(--hero-bg-start)] to-[var(--hero-bg-end)] rounded-xl border border-[var(--accent-color)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[var(--text-color)]">
            Libros de {categoryName}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--accent-color)] font-medium"
          >
            ✕ Cerrar
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-48 bg-[var(--card-border-color)] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 p-8 bg-gradient-to-br from-[var(--hero-bg-start)] to-[var(--hero-bg-end)] rounded-xl border border-[var(--accent-color)] shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-[var(--text-color)]">
          Libros de {categoryName}
        </h3>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--accent-color)] font-medium transition-colors duration-200"
        >
          ✕ Cerrar
        </button>
      </div>
      
      {books.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-[var(--text-color)] text-lg font-medium mb-2">
            No se encontraron libros
          </p>
          <p className="text-[var(--text-muted)]">
            Intenta con otra categoría
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, idx) => (
              <div
                key={book.id || `${book.title}-${idx}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
                className="animate-fadeInUp cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => onBookSelect?.(book)}
              >
                <BookCard {...book} />
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-[var(--text-muted)]">
              Mostrando {books.length} libros de {categoryName}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpandedCategorySection;