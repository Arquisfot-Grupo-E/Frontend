// src/Components/molecules/ReviewItem.tsx
import React, { useState } from 'react';
import type { Review } from '../../types/Review';
import type { Book } from '../../types/Book';

type Props = {
  review: Review;
  book?: Book;
  onUpdateReview: (reviewId: number, content: string) => void;
  onDeleteReview: (reviewId: number) => void;
  onVoteReview: (reviewId: number, vote: 1 | -1 | 0) => void;
  userVote?: 1 | -1 | 0;
};

const ReviewItem: React.FC<Props> = ({ review, book, onUpdateReview, onDeleteReview, onVoteReview, userVote = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);

  const handleSaveEdit = () => {
    onUpdateReview(review.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(review.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      onDeleteReview(review.id);
    }
  };

  const handleUpvote = () => {
    const newVote = userVote === 1 ? 0 : 1; // Si ya votó up, quitar voto (0), sino votar up (1)
    onVoteReview(review.id, newVote);
  };

  const handleDownvote = () => {
    const newVote = userVote === -1 ? 0 : -1; // Si ya votó down, quitar voto (0), sino votar down (-1)
    onVoteReview(review.id, newVote);
  };

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
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
              {!isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-md resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 mb-2">{review.content}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <button
                  onClick={handleUpvote}
                  className={`text-lg ${userVote === 1 ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
                  title="Upvote"
                >
                  ▲
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  {review.karma_score ?? 0}
                </span>
                <button
                  onClick={handleDownvote}
                  className={`text-lg ${userVote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                  title="Downvote"
                >
                  ▼
                </button>
              </div>
              <span className="text-sm text-gray-600">Karma</span>
            </div>
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