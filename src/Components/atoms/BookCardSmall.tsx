import React from "react";
import type { Book } from "../../types/Book";

type Props = Book & {
  onSelect?: (book: Book) => void;
};

const BookCardSmall: React.FC<Props> = ({
  id,
  title,
  authors,
  publisher,
  published_date,
  thumbnail,
  onSelect,
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect({ id, title, authors, publisher, published_date, thumbnail });
    }
  };

  return (
    <div
      className="book-card-small flex gap-2 p-2 max-w-xs cursor-pointer"
      onClick={handleClick}
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className="w-12 h-16 object-cover rounded-md flex-shrink-0 shadow-sm"
        />
      )}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <h3 className="font-bold text-sm truncate text-[var(--text-color)]">{title}</h3>
        {authors?.length > 0 && (
          <p className="text-xs text-[var(--text-muted)] truncate">{authors.join(", ")}</p>
        )}
        {publisher && (
          <p className="text-xs text-[var(--text-muted)] truncate">{publisher}</p>
        )}
        {published_date && (
          <p className="text-xs text-[var(--text-muted)] truncate">{published_date}</p>
        )}
      </div>
    </div>
  );
};

export default BookCardSmall;