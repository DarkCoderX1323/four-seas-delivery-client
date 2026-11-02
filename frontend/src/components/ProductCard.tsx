import React, { useState } from "react";
import type { Product } from "../services/product.service";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
}

// Mapa de emojis para enriquecer visualmente los platos de chifa
const getDishEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("chaufa")) return "🍚";
  if (lower.includes("tallarín") || lower.includes("tallarin") || lower.includes("fansi")) return "🍜";
  if (lower.includes("aeropuerto") || lower.includes("combinado")) return "🍱";
  if (lower.includes("wantán") || lower.includes("wantan")) return "🥟";
  if (lower.includes("langostino") || lower.includes("pescado")) return "🍤";
  if (lower.includes("chancho")) return "🥩";
  if (lower.includes("lomo")) return "🥘";
  if (lower.includes("tortilla")) return "🍳";
  return "🍗";
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const priceFormatted = Number(product.precio).toFixed(2);
  const emoji = getDishEmoji(product.nombre);

  const handleAdd = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    setQuantity(1);
  };

  return (
    <article className="product-card">
      <div className="product-visual">
        <div className="product-emoji-wrapper">
          <span className="product-emoji">{emoji}</span>
        </div>
        <span className="product-badge-cat">{product.categoria}</span>
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.nombre}</h3>
        <p className="product-desc">
          Preparado al wok al momento con la receta tradicional china cantonesa.
        </p>

        <div className="product-footer">
          <div className="product-price">
            <span className="currency">S/</span>
            <span className="amount">{priceFormatted}</span>
          </div>

          <div className="product-actions">
            <div className="qty-picker">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className={`add-btn ${justAdded ? "added" : ""}`}
              onClick={handleAdd}
              disabled={!product.disponible}
            >
              {justAdded ? "✓ Añadido" : "Pedir"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
