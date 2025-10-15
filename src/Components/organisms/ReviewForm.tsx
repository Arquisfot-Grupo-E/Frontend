// src/Components/organisms/ReviewForm.tsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import type { Book } from "../../types/Book";

type Props = {
  selectedBook: Book | null;
  onSaveReview: (review: string, rating: number) => void;
};

const ReviewForm: React.FC<Props> = ({ selectedBook, onSaveReview }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSave = () => {
    if (reviewText.trim() && rating > 0) {
      onSaveReview(reviewText, rating);
      setReviewText("");
      setRating(0);
    }
  };

  return (
    <div className="mt-8 p-6 bg-[var(--card-bg-color)] rounded-lg shadow-md border border-[var(--card-border-color)]">
      <h2 className="text-xl font-bold mb-4 text-[var(--text-color)]">Escribir Reseña</h2>
      {selectedBook ? (
        <div className="mb-4 p-4 bg-[var(--card-bg-color)] rounded-lg border border-[var(--card-border-color)]">
          <h3 className="font-semibold text-[var(--text-color)]">{selectedBook.title}</h3>
          <p className="text-sm text-[var(--text-color)]">
            Autor(es): {selectedBook.authors?.join(", ") || "Desconocido"}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Editorial: {selectedBook.publisher || "Desconocida"}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Año: {selectedBook.published_date || "Desconocido"}
          </p>
        </div>
      ) : (
        <p className="text-[var(--text-muted)] mb-4 p-4 bg-[var(--card-bg-color)] rounded-lg border border-[var(--card-border-color)]">
          Selecciona un libro para escribir una reseña.
        </p>
      )}

      {/* Rating con estrellas */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
          Calificación (obligatorio)
        </label>
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-[var(--text-muted)]">
            {rating > 0 ? `${rating} de 5 estrellas` : 'Selecciona tu calificación'}
          </span>
        </div>
      </div>

      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Escribe tu reseña aquí..."
        className="w-full p-4 border border-[var(--card-border-color)] rounded-lg resize-none bg-[var(--card-bg-color)] text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all duration-200"
        rows={6}
      />
      <button
        onClick={handleSave}
        className="mt-4 px-6 py-3 bg-[var(--primary-color)] text-[var(--text-on-primary)] rounded-lg hover:bg-[var(--accent-color)] disabled:bg-[var(--text-muted)] disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        disabled={!selectedBook || !reviewText.trim() || rating === 0}
      >
        Guardar Reseña
      </button>
    </div>
  );
};

export default ReviewForm;