import React, { useState } from "react";

type Props = {
  categories: string[];
  onCategoryClick: (category: string) => void;
  selectedCategory?: string | null;
};

const CategoriesCarousel: React.FC<Props> = ({
  categories,
  onCategoryClick,
  selectedCategory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3; // Número de categorías visibles a la vez (más grandes)
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= totalPages ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getCurrentCategories = () => {
    const start = currentIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return categories.slice(start, end);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Botón Anterior */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 bg-[var(--primary-color)] hover:bg-[var(--primary-medium)] text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Categorías anteriores"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Contenedor del carrusel */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {getCurrentCategories().map((category, idx) => (
              <button
                key={`${category}-${currentIndex}`}
                onClick={() => onCategoryClick(category)}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 text-center group hover:shadow-xl relative overflow-hidden ${
                  selectedCategory === category
                    ? 'border-[var(--primary-color)] bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] text-white shadow-xl transform scale-105'
                    : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-[var(--primary-color)] hover:from-[var(--primary-color)] hover:to-[var(--secondary-color)] hover:text-white text-[var(--text-color)]'
                }`}
                style={{ 
                  animationDelay: `${idx * 0.15}s`,
                  minHeight: '140px'
                }}
              >
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className={`text-4xl transition-all duration-300 ${
                    selectedCategory === category ? 'scale-125 rotate-12' : 'group-hover:scale-125 group-hover:rotate-12'
                  }`}>
                    📚
                  </div>
                  <h3 className={`text-base font-bold transition-colors duration-200 leading-tight ${
                    selectedCategory === category ? 'text-white' : 'text-gray-800 group-hover:text-white'
                  }`}>
                    {category}
                  </h3>
                  {selectedCategory === category && (
                    <div className="text-sm text-white/90 font-medium bg-white/20 px-3 py-1 rounded-full animate-pulse">
                      ✨ Activa
                    </div>
                  )}
                </div>

                {/* Decoración de esquinas */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-colors duration-300 ${
                  selectedCategory === category ? 'bg-white/30' : 'bg-[var(--primary-color)]/20 group-hover:bg-white/30'
                }`}></div>
                <div className={`absolute bottom-2 left-2 w-2 h-2 rounded-full transition-colors duration-300 ${
                  selectedCategory === category ? 'bg-white/20' : 'bg-[var(--primary-color)]/10 group-hover:bg-white/20'
                }`}></div>
              </button>
            ))}
          </div>
        </div>

        {/* Indicadores de página */}
        <div className="flex justify-center items-center gap-3 pb-6">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index
                  ? 'w-8 h-3 bg-[var(--primary-color)] scale-110'
                  : 'w-3 h-3 bg-gray-300 hover:bg-[var(--primary-color)] hover:scale-110'
              }`}
              aria-label={`Ir a página ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 bg-[var(--primary-color)] hover:bg-[var(--primary-medium)] text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Siguientes categorías"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Información del carrusel */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-[var(--text-color)]">
              Página {currentIndex + 1} de {totalPages}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <span className="text-sm text-[var(--text-muted)]">
              {categories.length} categorías disponibles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesCarousel;