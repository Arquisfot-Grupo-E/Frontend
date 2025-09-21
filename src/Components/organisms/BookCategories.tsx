import React, { useState, useMemo } from "react";
import type { Book } from "../../types/Book";
import CategoryCard from "../molecules/CategoryCard";
import ExpandedCategorySection from "./ExpandedCategorySection";

type Props = {
  onCategoryClick?: (category: string) => void;
  onBookSelect?: (book: Book) => void;
};

const BookCategories: React.FC<Props> = ({ onCategoryClick, onBookSelect }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedBooks, setExpandedBooks] = useState<Book[]>([]);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(false);

  // Categorías que queremos mostrar
  const categories = useMemo(() => [
    "Fiction", 
    "Science", 
    "History", 
    "Biography", 
    "Romance", 
    "Mystery"
  ], []);

  const handleCategoryClick = async (category: string) => {
    if (expandedCategory === category) {
      // Si ya está expandida, cerrarla
      setExpandedCategory(null);
      setExpandedBooks([]);
      return;
    }

    // Expandir nueva categoría
    setExpandedCategory(category);
    setIsLoadingExpanded(true);
    setExpandedBooks([]);

    try {
      const response = await fetch(
        `http://localhost:8000/books/search?q=subject:${category}&maxResults=20`
      );
      
      if (response.ok) {
        const books: Book[] = await response.json();
        setExpandedBooks(books);
      } else {
        setExpandedBooks([]);
      }
    } catch (error) {
      console.error("Error fetching category books:", error);
      setExpandedBooks([]);
    } finally {
      setIsLoadingExpanded(false);
    }

    // También llamar al callback original si existe
    onCategoryClick?.(category);
  };

  const handleCloseExpanded = () => {
    setExpandedCategory(null);
    setExpandedBooks([]);
  };

  return (
    <section className="py-16 px-6 bg-[var(--background-color)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">
            Explora por Categorías
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
            Haz clic en una categoría para descubrir libros de ese tema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, idx) => (
            <div
              key={category}
              style={{ animationDelay: `${idx * 0.1}s` }}
              className="animate-fadeInUp"
            >
              <CategoryCard
                categoryName={category}
                onCategoryClick={handleCategoryClick}
                isSelected={expandedCategory === category}
              />
            </div>
          ))}
        </div>

        {/* Sección expandida */}
        {expandedCategory && (
          <ExpandedCategorySection
            categoryName={expandedCategory}
            books={expandedBooks}
            onClose={handleCloseExpanded}
            onBookSelect={onBookSelect}
            isLoading={isLoadingExpanded}
          />
        )}
      </div>
    </section>
  );
};

export default BookCategories;