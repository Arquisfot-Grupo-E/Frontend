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
      className={`w-full p-3 rounded-md border transition-all duration-300 text-center group hover:shadow-md ${
        isSelected
          ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-md transform scale-105'
          : 'border-gray-300 bg-white hover:border-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white text-[var(--text-color)]'
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <div className={`text-sm transition-transform duration-200 ${
          isSelected ? 'scale-110' : 'group-hover:scale-110'
        }`}>
          📚
        </div>
        <h3 className={`text-xs font-medium transition-colors duration-200 leading-tight text-center ${
          isSelected ? 'text-white' : 'text-gray-700 group-hover:text-white'
        }`}>
          {categoryName}
        </h3>
      </div>
    </button>
  );
};

export default CategoryCard;