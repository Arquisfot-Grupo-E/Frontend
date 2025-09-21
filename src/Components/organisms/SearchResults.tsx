import React from "react";
import type { Book } from "../../types/Book";

type Props = {
  books: Book[];
};

const SearchResults: React.FC<Props> = ({ books }) => {
  if (!books || books.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {books.map((book, idx) => {
        const author =
          book.authors && book.authors.length > 0
            ? book.authors.join(", ")
            : "Desconocido";

        return (
          <div
            key={book.title + idx}
            className="search-result-item book-card-new flex gap-4 items-start p-6"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Imagen */}
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title ?? "Portada"}
                className="w-28 h-40 object-cover rounded-lg shadow-lg border border-[var(--card-border-color)]"
              />
            ) : (
              <div className="w-28 h-40 flex items-center justify-center rounded-lg bg-[var(--card-border-color)] text-sm text-[var(--text-muted)] shadow border border-[var(--card-border-color)]">
                Sin imagen
              </div>
            )}

            {/* Contenido */}
            <div className="flex flex-col flex-1 font-sans">
              <h3 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-[var(--text-color)]">
                {book.title ?? "Título desconocido"}
                {book.published_date && (
                  <span className="text-sm font-medium text-[var(--text-muted)]">
                    ({new Date(book.published_date).getFullYear()})
                  </span>
                )}
              </h3>

              <p className="text-base italic mt-1 text-[var(--text-color)]">{author}</p>

              {book.description && (
                <p className="text-sm mt-3 leading-relaxed text-[var(--text-muted)] line-clamp-3">
                  {book.description}
                </p>
              )}

              {/* Botón Ver reseñas */}
              <div className="mt-4">
                <button
                  className="px-6 py-3 bg-[var(--primary-color)] 
                             text-[var(--text-on-primary)] text-sm font-semibold rounded-lg shadow-lg 
                             hover:scale-105 hover:shadow-xl hover:bg-[var(--accent-color)] 
                             transition-all duration-200"
                >
                  Ver reseñas
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
