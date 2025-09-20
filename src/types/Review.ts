// src/types/Review.ts
export interface Review {
  id: number;
  user_id: string;
  google_book_id: string;
  content: string;
  karma_score: number;
  created_at: string;
  updated_at: string;
}