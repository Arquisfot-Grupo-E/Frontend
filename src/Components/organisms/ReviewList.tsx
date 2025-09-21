// src/Components/organisms/ReviewList.tsx
import React from 'react';
import ReviewItem from '../molecules/ReviewItem';
import type { Review } from '../../types/Review';
import type { Book } from '../../types/Book';

type Props = {
  reviews: Review[];
  bookInfos: Record<string, Book>;
  loading: boolean;
  onUpdateReview: (reviewId: number, content: string) => void;
  onDeleteReview: (reviewId: number) => void;
  onVoteReview: (reviewId: number, vote: 1 | -1 | 0) => void;
  userVotes: Record<number, 1 | -1 | 0>;
};

const ReviewList: React.FC<Props> = ({ reviews, bookInfos, loading, onUpdateReview, onDeleteReview, onVoteReview, userVotes }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="w-8 h-8 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center p-8 bg-[var(--card-bg-color)] rounded-lg border border-[var(--card-border-color)]">
        <p className="text-[var(--text-color)] text-lg">No has hecho reseñas aún.</p>
        <p className="text-[var(--text-muted)] text-sm mt-2">¡Empieza escribiendo tu primera reseña!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          book={bookInfos[review.google_book_id]}
          onUpdateReview={onUpdateReview}
          onDeleteReview={onDeleteReview}
          onVoteReview={onVoteReview}
          userVote={userVotes?.[review.id] || 0}
        />
      ))}
    </div>
  );
};

export default ReviewList;