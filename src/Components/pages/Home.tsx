import { useState } from "react";
import Navbar from "../organisms/Navbar";
import BookSearch from "../organisms/BookSearch";
import HeroSection from "../organisms/HeroSection";
import BookCategories from "../organisms/BookCategories";
import RandomBooksCarousel from "../organisms/RandomBooksCarousel";
import type { Book } from "../../types/Book";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // controla el texto del input

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
    setSearchQuery(""); // limpia el texto del buscador
  };

  const handleCategoryClick = (category: string) => {
    // Realizar búsqueda por categoría
    setSearchQuery(`subject:${category}`);
    handleSearch(`subject:${category}`);
  };

  const handleBookSelect = (book: Book) => {
    // Aquí podrías navegar a una página de detalles del libro
    console.log("Libro seleccionado:", book);
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <Navbar
        onSearch={handleSearch}
        onClear={handleClear}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Buscar libros..."
      />

      {!hasSearched && (
        <>
          <HeroSection />
          <RandomBooksCarousel onBookSelect={handleBookSelect} />
          <BookCategories 
            onCategoryClick={handleCategoryClick}
            onBookSelect={handleBookSelect}
          />
        </>
      )}

      <main id="search-section" className="max-w-5xl mx-auto px-6 py-8">
        <BookSearch
          books={books}
          hasSearched={hasSearched}
          isLoading={isLoading}
        />
      </main>

      <footer className="bg-[var(--primary-color)] text-[var(--text-on-primary)] text-center py-6 mt-16">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-lg font-medium">© 2025 BookReview</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Descubre, lee y comparte tus libros favoritos</p>
        </div>
      </footer>
    </div>
  );
}
