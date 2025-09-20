import { useState } from "react";
import { X } from "lucide-react";
import SearchBar from "../molecules/SearchBar";
import BookGridSmall from "../organisms/BookGridSmall";
import ReviewForm from "../organisms/ReviewForm";
import ReviewList from "../organisms/ReviewList";
import { useMyReviews } from "../../hooks/useMyReviews";
import type { Book } from "../../types/Book";

const MyReviews: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQueryBody, setSearchQueryBody] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const { reviews, reviewsLoading, bookInfos, userVotes, handleSaveReview: saveReview, handleUpdateReview, handleDeleteReview, handleVoteReview } = useMyReviews();

  const handleSearch = async (query: string) => {
    try {
      setHasSearched(true);
      setIsLoading(true);

      const res = await fetch(
        `http://localhost:8000/books/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Error en la búsqueda");
      const data: Book[] = await res.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books", error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setBooks([]);
    setHasSearched(false);
    setIsLoading(false);
    setSearchQueryBody("");
    setSelectedBook(null);
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleSaveReview = async (review: string) => {
    if (!selectedBook) {
      alert("No se seleccionó un libro.");
      return;
    }
    if (!selectedBook.id) {
      alert("El libro no tiene un ID válido.");
      return;
    }

    try {
      await saveReview(selectedBook.id, review);
      alert("Reseña guardada exitosamente!");
      setSelectedBook(null);
    } catch (error) {
      console.error("Error saving review:", error);
      const message = error instanceof Error ? error.message : "Error al guardar la reseña.";
      alert(message);
    }
  };

  const handleDeleteReviewWithErrorHandling = async (reviewId: number) => {
    try {
      await handleDeleteReview(reviewId);
      alert("Reseña eliminada exitosamente!");
    } catch (error) {
      console.error("Error deleting review:", error);
      const message = error instanceof Error ? error.message : "Error al eliminar la reseña.";
      alert(message);
    }
  };

  const handleVoteReviewWithErrorHandling = async (reviewId: number, vote: 1 | -1 | 0) => {
    try {
      await handleVoteReview(reviewId, vote);
    } catch (error) {
      console.error("Error voting on review:", error);
      let message = "Error al votar en la reseña.";
      
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object' && 'detail' in error) {
        message = (error as any).detail;
      }
      
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Mis Reseñas</h1>

        <div className="mb-6 flex items-center gap-4">
          <SearchBar
            onSearch={handleSearch}
            value={searchQueryBody}
            setValue={setSearchQueryBody}
            placeholder="Buscar libros..."
          />
          <button
            onClick={handleClear}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition"
            title="Limpiar búsqueda"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {hasSearched && !isLoading && !selectedBook && (
          <BookGridSmall books={books} onSelectBook={handleSelectBook} />
        )}

        <ReviewForm selectedBook={selectedBook} onSaveReview={handleSaveReview} />

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Mis Reseñas</h2>
          <ReviewList 
            reviews={reviews} 
            bookInfos={bookInfos} 
            loading={reviewsLoading} 
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReviewWithErrorHandling}
            onVoteReview={handleVoteReviewWithErrorHandling}
            userVotes={userVotes}
          />
        </div>
      </div>
    </div>
  );
};

export default MyReviews;