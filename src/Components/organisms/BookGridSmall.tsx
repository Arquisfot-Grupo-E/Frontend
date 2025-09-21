import React from "react";
import type { Book } from "../../types/Book";
import BookCardSmall from "../atoms/BookCardSmall";

type Props = {
  books: Book[];
  onSelectBook?: (book: Book) => void;
};

const BookGridSmall: React.FC<Props> = ({ books, onSelectBook }) => {
  if (!books || books.length === 0) {
    return (
      <div className="text-center text-[var(--text-muted)] mt-4 p-6">
        <p className="text-base">No hay libros para mostrar</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">Intenta con otra búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mt-4">
      {books.slice(0, 20).map((book, idx) => (
        <div 
          key={book.title + idx}
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <BookCardSmall {...book} onSelect={onSelectBook} />
        </div>
      ))}
    </div>
  );
};

export default BookGridSmall;