import { useState } from "react";
import { X } from "lucide-react";
import SearchBar from "../molecules/SearchBar";
import BookGridSmall from "../organisms/BookGridSmall";
import ReviewForm from "../organisms/ReviewForm";
import { saveReview } from "../../services/reviews";
import type { Book } from "../../types/Book";

const MyReviews: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQueryBody, setSearchQueryBody] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Mis Reseñas</h1>

        <div className="mb-6 flex items-center gap-4">
          <SearchBar
            onSearch={handleSearch}
            value={searchQueryBody}
            setValue={setSearchQueryBody}
            placeholder="Buscar en Mis Reseñas..."
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
      </div>
    </div>
  );
};

export default MyReviews;