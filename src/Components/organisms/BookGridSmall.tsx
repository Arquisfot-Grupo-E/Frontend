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
      <div className="text-center text-gray-500 mt-4">
        No hay libros para mostrar
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
      {books.slice(0, 20).map((book, idx) => (
        <BookCardSmall key={book.title + idx} {...book} onSelect={onSelectBook} />
      ))}
    </div>
  );
};

export default BookGridSmall;