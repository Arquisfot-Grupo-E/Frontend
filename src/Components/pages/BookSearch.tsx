import React, { useState } from "react";
import SearchBar from "../molecules/SearchBar";
import SearchResults from "../organisms/SearchResults";
import type { Book } from "../../types/Book";

const BookSearch: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);

  const handleSearch = async (query: string) => {
    try {
      const res = await fetch(`http://localhost:8000/books/search?q=${query}`);
      if (!res.ok) throw new Error("Error en la búsqueda");
      const data: Book[] = await res.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books", error);
    }
  };

  return (
    <div className="space-y-8">
      <SearchBar onSearch={handleSearch} />
      <SearchResults books={books} />
    </div>
  );
};

export default BookSearch;
