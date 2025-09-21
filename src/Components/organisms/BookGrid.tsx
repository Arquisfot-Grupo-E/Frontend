import React from "react";
import type { Book } from "../../types/Book";
import BookCard from "../atoms/BookCard";

type Props = {
  books: Book[];
};

const BookGrid: React.FC<Props> = ({ books }) => {
  if (!books || books.length === 0) {
    return (
      <div className="text-center text-[var(--text-muted)] mt-8 p-8">
        <p className="text-lg">No hay libros para mostrar</p>
        <p className="text-sm text-[var(--text-muted)] mt-2">Prueba con una búsqueda diferente</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-8">
      {books.slice(0, 10).map((book, idx) => (
        <div 
          key={book.title + idx}
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <BookCard {...book} />
        </div>
      ))}
    </div>
  );
};

export default BookGrid;