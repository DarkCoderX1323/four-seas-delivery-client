import React from "react";
import type { Category } from "../services/category.service";

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  totalProductsCount: number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  totalProductsCount
}) => {
  return (
    <div className="category-tabs-container">
      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategoryId === null ? "active" : ""}`}
          onClick={() => onSelectCategory(null)}
        >
          <span className="category-emoji">🥢</span>
          <span>Todos ({totalProductsCount})</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.idCategoria}
            className={`category-tab ${selectedCategoryId === cat.idCategoria ? "active" : ""}`}
            onClick={() => onSelectCategory(cat.idCategoria)}
          >
            <span className="category-emoji">
              {cat.nombre.toLowerCase().includes("chaufa") ||
              cat.nombre.toLowerCase().includes("tallar")
                ? "🍚"
                : "🍲"}
            </span>
            <span>{cat.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
