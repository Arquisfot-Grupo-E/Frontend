import React from "react";
import type { Book } from "../../types/Book";
import BookCard from "../atoms/BookCard";

type Props = {
  books: Book[];
};

const BookGrid: React.FC<Props> = ({ books }) => {
  if (!books || books.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No hay libros para mostrar
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-4 mt-8">
      {books.slice(0, 10).map((book, idx) => (
        <BookCard key={book.title + idx} {...book} />
      ))}
    </div>
  );
};

export default BookGrid;