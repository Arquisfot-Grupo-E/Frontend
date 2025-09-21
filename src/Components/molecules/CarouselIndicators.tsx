import React from "react";

type Props = {
  totalPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  showIndicators: boolean;
};

const CarouselIndicators: React.FC<Props> = ({
  totalPages,
  currentPage,
  onPageSelect,
  showIndicators,
}) => {
  if (!showIndicators || totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 gap-2">
      {Array.from({ length: totalPages }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onPageSelect(idx)}
          className={`w-3 h-3 rounded-full transition-all duration-200 ${
            idx === currentPage
              ? 'bg-[var(--accent-color)] scale-125'
              : 'bg-[var(--card-border-color)] hover:bg-[var(--text-muted)]'
          }`}
          aria-label={`Ir a página ${idx + 1}`}
        />
      ))}
    </div>
  );
};

export default CarouselIndicators;