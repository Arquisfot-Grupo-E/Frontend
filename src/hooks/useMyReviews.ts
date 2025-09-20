// src/hooks/useMyReviews.ts
import { useState, useEffect } from 'react';
import { getMyReviews, getBookById, saveReview } from '../services/reviews';
import type { Book } from '../types/Book';
import type { Review } from '../types/Review';

export const useMyReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [bookInfos, setBookInfos] = useState<Record<string, Book>>({});

  const loadMyReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getMyReviews();
      setReviews(data);

      // Cargar info de libros secuencialmente
      const uniqueIds = Array.from(new Set(data.map(review => review.google_book_id)));
      const newBookInfos: Record<string, Book> = {};
      for (const id of uniqueIds) {
        try {
          const book = await getBookById(id);
          newBookInfos[id] = book;
        } catch (error) {
          console.error(`Error loading book ${id}:`, error);
        }
      }
      setBookInfos(newBookInfos);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSaveReview = async (bookId: string, content: string) => {
    await saveReview(bookId, content);
    loadMyReviews(); // Recargar después de guardar
  };

  useEffect(() => {
    loadMyReviews();
  }, []);

  return {
    reviews,
    reviewsLoading,
    bookInfos,
    handleSaveReview,
    loadMyReviews,
  };
};