import { useState } from "react";
import Navbar from "../organisms/Navbar";
import BookSearch from "./BookSearch";
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

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <Navbar
        onSearch={handleSearch}
        onClear={handleClear}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Buscar libros..."
      />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <BookSearch
          books={books}
          hasSearched={hasSearched}
          isLoading={isLoading}
        />
      </main>

      <footer className="bg-[var(--secondary-color)] text-white text-center py-4 mt-10">
        <p>© 2025 BookFinder. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
