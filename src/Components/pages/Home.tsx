import { useState, useCallback } from "react";
import Navbar from "../organisms/Navbar";
import BookSearch from "../organisms/BookSearch";
import HeroSection from "../organisms/HeroSection";
import BookCategories from "../organisms/BookCategories";
import RandomBooksCarousel from "../organisms/RandomBooksCarousel";
import type { Book } from "../../types/Book";
import { useLazyQuery } from '@apollo/client/react';
import { SEARCH_BOOKS } from '../../graphql/queries';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // controla el texto del input
  
  // GraphQL query para búsqueda de libros
  const [searchBooksQuery, { loading: isLoading }] = useLazyQuery(SEARCH_BOOKS);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setHasSearched(true);
      setError(null);
      
      console.log("🔍 Buscando libros con GraphQL:", query);
      
      const { data, error: gqlError } = await searchBooksQuery({
        variables: { query: query.trim() }
      });

      if (gqlError) {
        console.error('GraphQL Error:', gqlError);
        setError('Error al buscar libros. Por favor, intenta de nuevo.');
        setBooks([]);
        return;
      }

      const searchResults = (data as any)?.searchBooks || [];
      console.log("📚 Libros encontrados:", searchResults.length);
      setBooks(searchResults);

    } catch (err) {
      console.error('Search error:', err);
      setError('Error de conexión. Verifica tu conexión a internet.');
      setBooks([]);
    }
  }, [searchBooksQuery]);

  const handleClear = useCallback(() => {
    setBooks([]);
    setHasSearched(false);
    setError(null);
    setSearchQuery(""); // limpia el texto del buscador
  }, []);

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
