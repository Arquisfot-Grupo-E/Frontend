import React from "react";
import type { Book } from "../../types/Book";

type Props = {
  books: Book[];
};

const SearchResults: React.FC<Props> = ({ books }) => {
  if (!books || books.length === 0) {
    return (
      <p className="text-center text-[var(--text-color)]">No hay resultados</p>
    );
  }

  return (
    <ul className="space-y-4">
      {books.map((book, idx) => (
        <li
          key={idx}
          className="flex items-start gap-4 p-4
                     bg-[var(--card-bg-color)] text-[var(--text-color)]
                     rounded-xl shadow-md border border-[var(--primary-color)]
                     hover:shadow-xl hover:bg-[var(--background-color)]
                     transition-colors duration-200"
        >
          {/* 📚 Imagen del libro */}
          {book.thumbnail && (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-24 h-36 object-cover rounded-md flex-shrink-0"
            />
          )}

          {/* 📖 Info del libro */}
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-bold">{book.title}</h3>
              {book.authors?.length > 0 && (
                <p className="text-sm font-medium">{book.authors.join(", ")}</p>
              )}
              {book.publisher && (
                <p className="text-xs opacity-80">
                  📚 {book.publisher} – {book.published_date}
                </p>
              )}
              {book.description && (
                <p className="text-sm opacity-90 line-clamp-3">
                  {book.description}
                </p>
              )}
            </div>

            {/* 🔘 Botón Ver Reseñas */}
            <button
              onClick={() => alert(`Reseñas de: ${book.title}`)}
              className="inline-block mt-2 px-4 py-2 rounded-lg
                         bg-[var(--primary-color)] text-white font-semibold
                         shadow hover:bg-[var(--secondary-color)]
                         transition-colors duration-200"
            >
              Ver reseñas
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SearchResults;
