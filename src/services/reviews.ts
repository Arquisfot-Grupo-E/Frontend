import type { Review } from '../types/Review';
import type { Book } from '../types/Book';

const API_BASE = 'http://localhost:8000';

// export const saveReview = async (googleBookId: string, content: string) => {
//   const response = await fetch(`${API_BASE}/reviews/`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       google_book_id: googleBookId,
//       content: content,
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
//     throw new Error(errorData.detail);
//   }

//   return response.json();
// };

// export const getMyReviews = async (): Promise<Review[]> => {
//   const response = await fetch(`${API_BASE}/reviews/my-reviews`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Error al obtener reseñas');
//   }

//   return response.json();
// };

// export const getBookById = async (id: string): Promise<Book> => {
//   const response = await fetch(`${API_BASE}/books/id/${id}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Error al obtener libro');
//   }

//   return response.json();
// };

// export const updateReview = async (reviewId: number, content: string) => {
//   const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       content: content,
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
//     throw new Error(errorData.detail);
//   }

//   return response.json();
// };

// export const deleteReview = async (reviewId: number) => {
//   const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
//     throw new Error(errorData.detail);
//   }

//   return response.ok;
// };
import { apolloClient } from '../lib/apolloClient';
import { GET_MY_REVIEWS, GET_REVIEWS_FOR_BOOK, SEARCH_BOOKS, GET_BOOK } from '../graphql/queries';
import { CREATE_REVIEW, UPDATE_REVIEW, DELETE_REVIEW } from '../graphql/mutations';

export const saveReview = async (googleBookId: string, content: string, rating: number) => {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_REVIEW,
    variables: {
      googleBookId,
      content,
      rating
    }
  });

  if (!data?.createReview) {
    throw new Error('Error al crear reseña');
  }

  return data.createReview;
};

export const getMyReviews = async (): Promise<Review[]> => {
  const { data } = await apolloClient.query({
    query: GET_MY_REVIEWS,
    fetchPolicy: 'network-only'
  });

  return data?.myReviews || [];
};

export const getBookById = async (id: string): Promise<Book> => {
  const { data } = await apolloClient.query({
    query: GET_BOOK,
    variables: { id },
    fetchPolicy: 'network-only'
  });

  if (!data?.book) {
    throw new Error('Libro no encontrado');
  }

  return data.book;
};

export const updateReview = async (reviewId: string, content: string, rating?: number) => {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_REVIEW,
    variables: {
      id: reviewId,
      content,
      rating
    }
  });

  return data?.updateReview;
};

export const deleteReview = async (reviewId: string) => {
  const { data } = await apolloClient.mutate({
    mutation: DELETE_REVIEW,
    variables: { id: reviewId }
  });

  return data?.deleteReview;
};

export const voteReview = async (reviewId: number, vote: 1 | -1 | 0) => {
  const response = await fetch(`${API_BASE}/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      value: vote,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(errorData.detail);
  }

  const result = await response.json();
  return result;
};