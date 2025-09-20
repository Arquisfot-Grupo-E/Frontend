// src/hooks/useMyReviews.ts
import { useState, useEffect } from 'react';
import { getMyReviews, getBookById, saveReview, updateReview, deleteReview, voteReview } from '../services/reviews';
import type { Book } from '../types/Book';
import type { Review } from '../types/Review';

const sortReviewsByKarma = (reviews: Review[]) => {
  return [...reviews].sort((a, b) => b.karma_score - a.karma_score);
};

export const useMyReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [bookInfos, setBookInfos] = useState<Record<string, Book>>({});
  const [userVotes, setUserVotes] = useState<Record<number, 1 | -1 | 0>>({});

  const loadMyReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getMyReviews();
      setReviews(sortReviewsByKarma(data));

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
    setReviews(prev => sortReviewsByKarma([newReview, ...prev]));
    
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
    setReviews(prev => sortReviewsByKarma(prev.map(review => 
      review.id === reviewId ? updatedReview : review
    )));
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      
      // Eliminar la reseña del estado local
      setReviews(prev => sortReviewsByKarma(prev.filter(review => review.id !== reviewId)));
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error; // Re-throw para que el componente pueda manejar el error
    }
  };

  const handleVoteReview = async (reviewId: number, vote: 1 | -1 | 0) => {
    try {
      const updatedReview = await voteReview(reviewId, vote);

      // Verificar que la respuesta sea válida
      if (!updatedReview || typeof updatedReview !== 'object') {
        throw new Error('Respuesta inválida del servidor');
      }

      // Manejar respuesta parcial del endpoint de votación
      let finalUpdatedReview = updatedReview;

      // Si la respuesta solo tiene karma_score (respuesta del endpoint de votación)
      if (typeof updatedReview.karma_score === 'number' &&
          (!updatedReview.id || !updatedReview.content)) {
        console.log('Respuesta parcial del servidor (solo karma), actualizando review existente');
        console.log('Karma recibido:', updatedReview.karma_score);
        // Buscar la review existente y actualizar solo el karma
        const existingReview = reviews.find(r => r.id === reviewId);
        if (existingReview) {
          finalUpdatedReview = {
            ...existingReview,
            karma_score: updatedReview.karma_score
          };
          console.log('Review actualizada:', finalUpdatedReview);
        } else {
          throw new Error('Review no encontrada para actualizar');
        }
      } else {
        // Verificar que tenga los campos requeridos para respuesta completa
        if (!updatedReview.id || !updatedReview.content || typeof updatedReview.karma_score !== 'number') {
          console.error('Respuesta del servidor incompleta:', updatedReview);
          throw new Error('Respuesta del servidor incompleta');
        }
      }

      // Actualizar la reseña en el estado local (actualización optimista)
      setReviews(prev => {
        const existingReview = prev.find(r => r.id === reviewId);
        // Solo actualizar si el karma realmente cambió
        if (existingReview && existingReview.karma_score === finalUpdatedReview.karma_score) {
          return prev; // No hay cambio, devolver el mismo array
        }
        return sortReviewsByKarma(prev.map(review =>
          review.id === reviewId ? finalUpdatedReview : review
        ));
      });

      // Actualizar el estado de votos del usuario
      setUserVotes(prev => {
        // Solo actualizar si el voto realmente cambió
        if (prev[reviewId] === vote) {
          return prev; // No hay cambio, devolver el mismo objeto
        }
        return { ...prev, [reviewId]: vote };
      });

    } catch (error) {
      console.error("Error voting on review:", error);
      // Revertir el cambio optimista en caso de error
      setUserVotes(prev => {
        const reverted = { ...prev };
        delete reverted[reviewId];
        return reverted;
      });
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
    userVotes,
    handleSaveReview,
    handleUpdateReview,
    handleDeleteReview,
    handleVoteReview,
    loadMyReviews,
  };
};