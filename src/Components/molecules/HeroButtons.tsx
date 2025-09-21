import React from "react";

import Button from "../atoms/Button";

type HeroButtonsProps = {
  onSearchClick?: () => void;
  onExploreClick?: () => void;
};

const HeroButtons: React.FC<HeroButtonsProps> = ({ onSearchClick, onExploreClick }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      <Button
        label="Buscar Libros"
        variant="primary"
        className="min-w-[140px]"
        onClick={onSearchClick}
      />
      <Button
        label="Explorar Reseñas"
        variant="secondary"
        className="min-w-[140px]"
        onClick={onExploreClick}
      />
    </div>
  );
};

export default HeroButtons;