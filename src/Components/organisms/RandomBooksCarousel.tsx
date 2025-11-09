import React, { useState, useEffect, useMemo } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "../../lib/apolloClient";
import type { Book } from "../../types/Book";
import BookCard from "../atoms/BookCard";
import CarouselNavigation from "../molecules/CarouselNavigation";
import CarouselIndicators from "../molecules/CarouselIndicators";
import CarouselTrack from "../molecules/CarouselTrack";

const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    searchBooks(query: $query) {
      id
      title
      authors
      description
      thumbnail
      categories
      publisher
      published_date
    }
  }
`;

type Props = {
  onBookSelect?: (book: Book) => void;
};

const RandomBooksCarousel: React.FC<Props> = ({ onBookSelect }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Términos de búsqueda aleatorios para obtener variedad
  const randomSearchTerms = useMemo(() => [
    "bestseller", "award", "popular", "classic", "novel", 
    "adventure", "thriller", "fantasy", "science fiction", "philosophy"
  ], []);

  // Configuración del carrusel
  const itemsPerView = 3;
  const itemWidth = 280;
  const gap = 24;
  const maxIndex = Math.max(0, books.length - itemsPerView);

  useEffect(() => {
    const fetchRandomBooks = async () => {
      setIsLoading(true);
      try {
        const allBooks: Book[] = [];
        
        // Hacer varias búsquedas con términos aleatorios usando Apollo Client directamente
        for (let i = 0; i < 3; i++) {
          const randomTerm = randomSearchTerms[Math.floor(Math.random() * randomSearchTerms.length)];
          
          const { data } = await apolloClient.query({
            query: SEARCH_BOOKS,
            variables: { query: randomTerm }
          });
          
          if (data?.searchBooks) {
            allBooks.push(...data.searchBooks);
          }
          
          // Pausa entre peticiones
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Mezclar libros y tomar una selección aleatoria
        const shuffledBooks = allBooks
          .sort(() => Math.random() - 0.5)
          .filter((book, index, self) => 
            index === self.findIndex(b => b.title === book.title)
          ) // Eliminar duplicados
          .slice(0, 15); // Máximo 15 libros

        setBooks(shuffledBooks);
      } catch (error) {
        console.error("Error fetching random books:", error);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomBooks();
  }, [randomSearchTerms]);

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const goToPrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const goToPage = (page: number) => {
    setCurrentIndex(page);
  };

  const handleRefresh = async () => {
    setCurrentIndex(0);
    setIsLoading(true);
    try {
      const allBooks: Book[] = [];
      
      // Hacer varias búsquedas con términos aleatorios usando Apollo Client directamente
      for (let i = 0; i < 3; i++) {
        const randomTerm = randomSearchTerms[Math.floor(Math.random() * randomSearchTerms.length)];
        
        const { data } = await apolloClient.query({
          query: SEARCH_BOOKS,
          variables: { query: randomTerm }
        });
        
        if (data?.searchBooks) {
          allBooks.push(...data.searchBooks);
        }
        
        // Pausa entre peticiones
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Mezclar libros y tomar una selección aleatoria
      const shuffledBooks = allBooks
        .sort(() => Math.random() - 0.5)
        .filter((book, index, self) => 
          index === self.findIndex(b => b.title === book.title)
        ) // Eliminar duplicados
        .slice(0, 15); // Máximo 15 libros

      setBooks(shuffledBooks);
    } catch (error) {
      console.error("Error fetching random books:", error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[var(--text-color)] mb-12">
            Libros Aleatorios
          </h2>
          <div className="flex justify-center gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-80 h-48 bg-[var(--card-border-color)] rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">
            Libros Aleatorios
          </h2>
          <p className="text-[var(--text-muted)]">
            No se pudieron cargar libros aleatorios en este momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-[var(--hero-bg-start)] to-[var(--hero-bg-end)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">
            Descubre Algo Nuevo
          </h2>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto mb-6">
            Una selección aleatoria de libros interesantes para explorar
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-[var(--accent-color)] text-[var(--text-on-primary)] rounded-full hover:bg-[var(--primary-color)] transition-colors duration-200 font-medium"
          >
            🎲 Nuevos libros aleatorios
          </button>
        </div>

        <div className="relative">
          <CarouselTrack 
            currentIndex={currentIndex}
            itemWidth={itemWidth}
            gap={gap}
          >
            {books.map((book, idx) => (
              <div 
                key={`${book.title}-${idx}`}
                className="carousel-item cursor-pointer hover:scale-105 transition-transform duration-200"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => onBookSelect?.(book)}
              >
                <BookCard {...book} />
              </div>
            ))}
          </CarouselTrack>

          <CarouselNavigation
            onPrevious={goToPrev}
            onNext={goToNext}
            canGoPrevious={currentIndex > 0}
            canGoNext={currentIndex < maxIndex}
            showNavigation={books.length > itemsPerView}
          />
        </div>

        <CarouselIndicators
          totalPages={maxIndex + 1}
          currentPage={currentIndex}
          onPageSelect={goToPage}
          showIndicators={books.length > itemsPerView}
        />
      </div>
    </section>
  );
};

export default RandomBooksCarousel;