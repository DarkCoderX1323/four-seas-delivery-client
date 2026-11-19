import React, { useState } from "react";
import type { Product } from "../services/product.service";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";

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
  const { isStoreOpen } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const priceFormatted = Number(product.precio).toFixed(2);
  const emoji = getDishEmoji(product.nombre);
  const isSoldOut = !product.disponible;
  const isOrderable = !isSoldOut && isStoreOpen;

  const handleAdd = () => {
    if (!isOrderable) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    setQuantity(1);
  };

  return (
    <article className={`product-card ${isSoldOut ? "product-card-soldout" : ""}`}>
      <div className="product-visual">
        <div className="product-emoji-wrapper">
          <span className="product-emoji">{emoji}</span>
        </div>
        <span className="product-badge-cat">{product.categoria}</span>
        {isSoldOut && (
          <span className="product-badge-soldout">🔴 AGOTADO HOY</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.nombre}</h3>
        <p className="product-desc">
          {isSoldOut
            ? "Este plato se quedó temporalmente sin insumos en cocina por hoy."
            : "Preparado al wok al momento con la receta tradicional china cantonesa."}
        </p>

        <div className="product-footer">
          <div className="product-price">
            <span className="currency">S/</span>
            <span className="amount">{priceFormatted}</span>
          </div>

          <div className="product-actions">
            {!isSoldOut && isStoreOpen && (
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
            )}

            <button
              type="button"
              className={`add-btn ${justAdded ? "added" : ""} ${isSoldOut ? "btn-soldout" : ""}`}
              onClick={handleAdd}
              disabled={!isOrderable}
              title={
                !isStoreOpen
                  ? "Four Seas está en pausa operativa"
                  : isSoldOut
                  ? "Plato agotado por hoy"
                  : "Agregar al pedido"
              }
            >
              {!isStoreOpen
                ? "Cerrado"
                : isSoldOut
                ? "Agotado"
                : justAdded
                ? "✓ Añadido"
                : "Pedir"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
