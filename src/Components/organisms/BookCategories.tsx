import React, { useState, useMemo } from "react";
import type { Book } from "../../types/Book";
import CategoriesCarousel from "../molecules/CategoriesCarousel";
import ExpandedCategorySection from "./ExpandedCategorySection";

type Props = {
  onCategoryClick?: (category: string) => void;
  onBookSelect?: (book: Book) => void;
};

const BookCategories: React.FC<Props> = ({ onCategoryClick, onBookSelect }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedBooks, setExpandedBooks] = useState<Book[]>([]);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // Categorías principales que ofrece la API de Google Books, organizadas por temática
  const categories = useMemo(() => [
    // Ficción y Literatura
    "Fiction", 
    "Romance", 
    "Mystery",
    "Fantasy",
    "Horror",
    "Adventure",
    "Drama",
    "Comedy",
    "Poetry",
    "Young Adult Fiction",
    "Juvenile Fiction",
    "Comics & Graphic Novels",
    "True Crime",

    // Ciencias y Conocimiento
    "Science", 
    "Mathematics",
    "Medicine",
    "Technology",
    "Computers",
    "Nature",

    // Historia y Sociedad
    "History", 
    "Biography", 
    "Philosophy",
    "Religion",
    "Political Science",
    "Social Science",
    "Law",

    // Desarrollo Personal y Salud
    "Psychology",
    "Self Help",
    "Health & Fitness",
    "Family & Relationships",

    // Artes y Cultura
    "Art",
    "Music",
    "Photography",

    // Educación y Lenguaje
    "Education",
    "Language Arts",

    // Estilo de Vida
    "Cooking",
    "Travel",
    "Sports & Recreation",
    "Games & Activities",
    "Crafts & Hobbies",

    // Negocios y Economía
    "Business & Economics"
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
        {/* Sección principal con botón para mostrar categorías */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--text-color)] mb-4">
            Explora libros por categorías
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-3xl mx-auto mb-8">
            Descubre nuestra amplia biblioteca con más de 40 categorías diferentes. Navega por el carrusel para encontrar exactamente lo que buscas.
          </p>
          
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-medium)] text-white font-semibold py-4 px-10 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center gap-4 mx-auto text-lg"
          >
            <span className={`text-2xl transition-transform duration-500 ${showCategories ? 'rotate-180' : ''}`}>
              
            </span>
            <span>
              Categorías
            </span>
            <span className={`text-xl transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`}>
              {showCategories ? '▲' : '▼'}
            </span>
          </button>
        </div>

        {/* Carrusel de categorías */}
        {showCategories && (
          <div className="animate-fadeInUp">
            {/* Separador visual elegante */}
            <div className="flex items-center justify-center mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent flex-1 max-w-xs"></div>
              <div className="mx-4 text-[var(--primary-color)] text-2xl">✨</div>
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent flex-1 max-w-xs"></div>
            </div>
            
            <div className="mb-6">
              <p className="text-center text-[var(--text-muted)] mb-2 font-medium">
                Usa las flechas para navegar entre las categorías
              </p>
              <p className="text-center text-[var(--text-muted)] text-sm">
                Haz clic en cualquier categoría para explorar los libros disponibles
              </p>
            </div>
            
            <CategoriesCarousel
              categories={categories}
              onCategoryClick={handleCategoryClick}
              selectedCategory={expandedCategory}
            />
          </div>
        )}

        {/* Sección expandida de libros */}
        {expandedCategory && (
          <div className="mt-12">
            <ExpandedCategorySection
              categoryName={expandedCategory}
              books={expandedBooks}
              onClose={handleCloseExpanded}
              onBookSelect={onBookSelect}
              isLoading={isLoadingExpanded}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default BookCategories;