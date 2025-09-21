import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-[var(--hero-bg-start)] to-[var(--hero-bg-end)] py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-color)] mb-6">
          Descubre tu próxima
          <span className="text-[var(--accent-color)] block">lectura favorita</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-color)] mb-8 max-w-2xl mx-auto">
          Encuentra libros increíbles, lee reseñas de otros lectores y comparte tus propias experiencias literarias
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
