export type Book = {
  id?: string;  // optional
  title: string;
  authors: string[];
  publisher?: string;
  published_date?: string;
  description?: string;
  thumbnail?: string;
};
