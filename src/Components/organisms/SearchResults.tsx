import React from "react";
import type { Book } from "../../types/Book";

type Props = {
  books: Book[];
};

const SearchResults: React.FC<Props> = ({ books }) => {
  if (!books || books.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      {books.map((book, idx) => {
        const author =
          book.authors && book.authors.length > 0
            ? book.authors.join(", ")
            : "Desconocido";

        return (
          <div
            key={book.title + idx}
            className="flex gap-4 items-center p-4 rounded-lg bg-[var(--card-bg-color)] border"
          >
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title ?? "Portada"}
                className="w-16 h-20 object-cover rounded-md"
              />
            ) : (
              <div className="w-16 h-20 flex items-center justify-center rounded-md bg-gray-100 text-sm text-gray-500">
                Sin imagen
              </div>
            )}

            <div>
              <h3 className="font-semibold">
                {book.title ?? "Título desconocido"}
              </h3>
              <p className="text-sm text-gray-500">{author}</p>
              {book.description && (
                <p className="text-sm mt-1 line-clamp-2 text-gray-600">
                  {book.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
