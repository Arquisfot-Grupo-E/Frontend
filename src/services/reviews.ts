import type { Review } from '../types/Review';
import type { Book } from '../types/Book';

const API_BASE = 'http://localhost:8000';

export const saveReview = async (googleBookId: string, content: string) => {
  const response = await fetch(`${API_BASE}/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      google_book_id: googleBookId,
      content: content,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(errorData.detail);
  }

  return response.json();
};

export const getMyReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_BASE}/reviews/my-reviews`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener reseñas');
  }

  return response.json();
};

export const getBookById = async (id: string): Promise<Book> => {
  const response = await fetch(`${API_BASE}/books/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener libro');
  }

  return response.json();
};