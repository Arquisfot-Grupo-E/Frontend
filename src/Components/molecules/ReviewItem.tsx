// src/Components/molecules/ReviewItem.tsx
import React from 'react';
import type { Review } from '../../types/Review';
import type { Book } from '../../types/Book';

type Props = {
  review: Review;
  book?: Book;
};

const ReviewItem: React.FC<Props> = ({ review, book }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-start gap-4">
        {book?.thumbnail && (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="w-16 h-20 object-cover rounded-md flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{book?.title || 'Título no disponible'}</h3>
              {book?.authors && book.authors.length > 0 && (
                <p className="text-sm text-gray-600">por {book.authors.join(', ')}</p>
              )}
              {book?.published_date && (
                <p className="text-sm text-gray-500">{book.published_date}</p>
              )}
              <p className="text-xs text-gray-600 mt-1">ID del libro: {review.google_book_id}</p>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
          <p className="text-gray-800 mb-2">{review.content}</p>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Karma: {review.karma_score}</p>
            <p className="text-xs text-gray-400">
              Actualizado: {new Date(review.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;