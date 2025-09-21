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
    <div className="bg-[var(--card-bg-color)] p-4 rounded-lg shadow-md border border-[var(--card-border-color)] hover:border-[var(--accent-color)] transition-all duration-200">
      <div className="flex items-start gap-4">
        {book?.thumbnail && (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="w-16 h-20 object-cover rounded-md flex-shrink-0 shadow-sm"
          />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg text-[var(--text-color)]">{book?.title || 'Título no disponible'}</h3>
              {book?.authors && book.authors.length > 0 && (
                <p className="text-sm text-[var(--text-color)]">por {book.authors.join(', ')}</p>
              )}
              {book?.published_date && (
                <p className="text-sm text-[var(--text-muted)]">{book.published_date}</p>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-1">ID del libro: {review.google_book_id}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm text-[var(--text-muted)]">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
              {!isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-[var(--accent-color)] hover:text-[var(--primary-color)] font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-sm text-[var(--error-color)] hover:text-[var(--error-hover)] font-medium"
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
                className="w-full p-3 border border-[var(--card-border-color)] rounded-md resize-none bg-[var(--card-bg-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-[var(--primary-color)] text-[var(--text-on-primary)] rounded-md hover:bg-[var(--accent-color)] transition-colors duration-200"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-[var(--card-border-color)] text-[var(--text-color)] rounded-md hover:bg-[var(--accent-color)] hover:text-[var(--text-on-primary)] transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[var(--text-color)] mb-2">{review.content}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <button
                  onClick={handleUpvote}
                  className={`text-lg transition-colors duration-200 ${userVote === 1 ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--accent-color)]'}`}
                  title="Upvote"
                >
                  ▲
                </button>
                <span className="text-sm font-semibold text-[var(--text-color)]">
                  {review.karma_score ?? 0}
                </span>
                <button
                  onClick={handleDownvote}
                  className={`text-lg transition-colors duration-200 ${userVote === -1 ? 'text-[var(--error-color)]' : 'text-[var(--text-muted)] hover:text-[var(--error-color)]'}`}
                  title="Downvote"
                >
                  ▼
                </button>
              </div>
              <span className="text-sm text-[var(--text-muted)]">Karma</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Actualizado: {new Date(review.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;