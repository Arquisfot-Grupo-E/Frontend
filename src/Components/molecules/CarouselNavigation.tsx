import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  showNavigation: boolean;
};

const CarouselNavigation: React.FC<Props> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  showNavigation,
}) => {
  if (!showNavigation) return null;

  return (
    <>
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="carousel-nav-button prev"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="carousel-nav-button next"
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>
    </>
  );
};

export default CarouselNavigation;