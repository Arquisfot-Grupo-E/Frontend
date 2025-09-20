// src/hooks/useMyReviews.ts
import { useState, useEffect } from 'react';
import { getMyReviews, getBookById, saveReview, updateReview, deleteReview } from '../services/reviews';
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
    const newReview = await saveReview(bookId, content);
    
    // Agregar la nueva reseña al estado local
    setReviews(prev => [newReview, ...prev]);
    
    // Cargar info del libro si no está ya cargada
    if (!bookInfos[newReview.google_book_id]) {
      try {
        const book = await getBookById(newReview.google_book_id);
        setBookInfos(prev => ({ ...prev, [newReview.google_book_id]: book }));
      } catch (error) {
        console.error(`Error loading book ${newReview.google_book_id}:`, error);
      }
    }
  };

  const handleUpdateReview = async (reviewId: number, content: string) => {
    const updatedReview = await updateReview(reviewId, content);
    
    // Actualizar la reseña en el estado local
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? updatedReview : review
    ));
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      
      // Eliminar la reseña del estado local
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error; // Re-throw para que el componente pueda manejar el error
    }
  };

  useEffect(() => {
    loadMyReviews();
  }, []);

  return {
    reviews,
    reviewsLoading,
    bookInfos,
    handleSaveReview,
    handleUpdateReview,
    handleDeleteReview,
    loadMyReviews,
  };
};