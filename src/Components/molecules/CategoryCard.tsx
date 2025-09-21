import React from "react";

type Props = {
  categoryName: string;
  onCategoryClick?: (category: string) => void;
  isSelected?: boolean;
};

const CategoryCard: React.FC<Props> = ({
  categoryName,
  onCategoryClick,
  isSelected = false,
}) => {
  const handleClick = () => {
    onCategoryClick?.(categoryName);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:shadow-xl ${
        isSelected
          ? 'border-[var(--accent-color)] bg-gradient-to-br from-[var(--accent-color)] to-[var(--primary-color)] text-white shadow-lg'
          : 'border-[var(--card-border-color)] bg-[var(--card-bg-color)] hover:border-[var(--accent-color)] text-[var(--text-color)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`text-2xl font-bold transition-colors duration-200 ${
          isSelected ? 'text-white' : 'text-[var(--text-color)] group-hover:text-[var(--accent-color)]'
        }`}>
          {categoryName}
        </h3>
        <div className={`text-2xl transition-transform duration-200 ${
          isSelected ? 'rotate-180' : 'group-hover:scale-110'
        }`}>
          {isSelected ? '▲' : '📚'}
        </div>
      </div>
      
      <p className={`mt-2 text-sm ${
        isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'
      }`}>
        {isSelected ? 'Haz clic para cerrar' : 'Haz clic para explorar libros'}
      </p>
    </button>
  );
};

export default CategoryCard;