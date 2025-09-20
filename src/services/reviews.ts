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