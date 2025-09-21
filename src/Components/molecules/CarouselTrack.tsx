import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  currentIndex: number;
  itemWidth: number;
  gap: number;
};

const CarouselTrack: React.FC<Props> = ({
  children,
  currentIndex,
  itemWidth,
  gap,
}) => {
  const translateX = currentIndex * (itemWidth + gap);

  return (
    <div className="carousel-container">
      <div 
        className="carousel-track"
        style={{
          transform: `translateX(-${translateX}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default CarouselTrack;