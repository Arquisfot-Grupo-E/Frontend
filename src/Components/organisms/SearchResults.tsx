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
            className="flex gap-4 items-start p-4 rounded-lg border shadow-md transition-all hover:shadow-xl hover:scale-[1.01] 
                       bg-gradient-to-r from-[#92d0ff] via-white to-[#92d0ff] text-[#123c54]"
          >
            {/* Imagen */}
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title ?? "Portada"}
                className="w-28 h-40 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-28 h-40 flex items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-700 shadow">
                Sin imagen
              </div>
            )}

            {/* Contenido */}
            <div className="flex flex-col flex-1 font-sans">
              <h3 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                {book.title ?? "Título desconocido"}
                {book.published_date && (
                  <span className="text-sm font-medium text-[#123c54]/70">
                    ({new Date(book.published_date).getFullYear()})
                  </span>
                )}
              </h3>

              <p className="text-base italic mt-1">{author}</p>

              {book.description && (
                <p className="text-sm mt-3 leading-relaxed text-[#123c54]/80 line-clamp-3">
                  {book.description}
                </p>
              )}

              {/* Botón Ver reseñas */}
              <div className="mt-4">
                <button
                  className="px-6 py-2 bg-gradient-to-r from-[#f7693e] to-[#d28b12] 
                             text-white text-sm font-semibold rounded-md shadow-lg 
                             hover:scale-105 hover:shadow-xl transition-transform duration-200"
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
