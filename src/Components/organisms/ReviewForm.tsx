import React, { useState } from "react";
import type { Book } from "../../types/Book";

type Props = {
  selectedBook: Book | null;
  onSaveReview: (review: string) => void;
};

const ReviewForm: React.FC<Props> = ({ selectedBook, onSaveReview }) => {
  const [reviewText, setReviewText] = useState("");

  const handleSave = () => {
    if (reviewText.trim()) {
      onSaveReview(reviewText);
      setReviewText("");
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Escribir Reseña</h2>
      {selectedBook ? (
        <div className="mb-4">
          <h3 className="font-semibold">{selectedBook.title}</h3>
          <p className="text-sm text-gray-600">
            Autor(es): {selectedBook.authors?.join(", ") || "Desconocido"}
          </p>
          <p className="text-sm text-gray-500">
            Editorial: {selectedBook.publisher || "Desconocida"}
          </p>
          <p className="text-sm text-gray-500">
            Año: {selectedBook.published_date || "Desconocido"}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">Selecciona un libro para escribir una reseña.</p>
      )}
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Escribe tu reseña aquí..."
        className="w-full p-3 border rounded-lg resize-none"
        rows={6}
      />
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--secondary-color)]"
        disabled={!selectedBook || !reviewText.trim()}
      >
        Guardar Reseña
      </button>
    </div>
  );
};

export default ReviewForm;