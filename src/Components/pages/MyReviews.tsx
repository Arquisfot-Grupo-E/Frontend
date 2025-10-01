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
        `http://localhost:8000/books/review/search?q=${encodeURIComponent(query)}`
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
        message = (error as { detail: string }).detail;
      }
      
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-[var(--card-bg-color)] rounded-lg p-6 mb-8 border border-[var(--card-border-color)]">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text-color)]">Mis Reseñas</h1>
          <p className="text-[var(--text-muted)]">Gestiona tus reseñas y descubre nuevos libros</p>
        </div>

        {/* Search Section */}
        <div className="bg-[var(--card-bg-color)] rounded-lg p-6 mb-6 shadow-md border border-[var(--card-border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-color)] mb-4">Buscar libros para reseñar</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                value={searchQueryBody}
                setValue={setSearchQueryBody}
                placeholder="Buscar libros..."
              />
            </div>
            <button
              onClick={handleClear}
              className="p-3 bg-[var(--card-border-color)] hover:bg-[var(--accent-color)] hover:text-[var(--text-on-primary)] rounded-full transition-colors duration-200 border border-[var(--card-border-color)]"
              title="Limpiar búsqueda"
            >
              <X size={20} className="text-[var(--text-color)]" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-40 bg-[var(--card-bg-color)] rounded-lg mb-6">
            <div className="w-10 h-10 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 text-[var(--text-color)]">Buscando libros...</p>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !isLoading && !selectedBook && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3">
              Resultados de búsqueda ({books.length} libros)
            </h3>
            <BookGridSmall books={books} onSelectBook={handleSelectBook} />
          </div>
        )}

        {/* Review Form */}
        <ReviewForm selectedBook={selectedBook} onSaveReview={handleSaveReview} />

        {/* My Reviews List */}
        <div className="mt-8">
          <div className="bg-[var(--card-bg-color)] rounded-lg p-4 mb-6 border border-[var(--card-border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-color)]">Mis Reseñas Publicadas</h2>
          </div>
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