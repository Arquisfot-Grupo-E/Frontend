import React from "react";
import type { Book } from "../../types/Book";

const BookCard: React.FC<Book> = ({
  title,
  authors,
  publisher,
  published_date,
  description,
  thumbnail,
}) => {
  return (
    <div className="flex gap-4 p-4">
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className="w-20 h-28 object-cover rounded-md"
        />
      )}
      <div className="flex flex-col">
        <h3 className="font-bold text-lg text-[var(--text-color)]">{title}</h3>
        {authors?.length > 0 && (
          <p className="text-sm text-[var(--text-muted)]">
            {authors.join(", ")}
          </p>
        )}
        {publisher && (
          <p className="text-sm text-[var(--text-muted)]">{publisher}</p>
        )}
        {published_date && (
          <p className="text-sm text-[var(--text-muted)]">{published_date}</p>
        )}
        {description && (
          <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookCard;
