import React, { useState, useEffect } from "react";
import type { Product } from "../services/product.service";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { getCandidateImageUrls, getDishEmoji } from "../utils/dishImages";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isStoreOpen } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Gestión inteligente de formatos de imagen (.webp -> .jpg -> .png -> .jpeg -> fallback emoji)
  const candidates = getCandidateImageUrls(product.nombre, product.imagen);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [allFormatsFailed, setAllFormatsFailed] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setImgLoaded(false);
    setAllFormatsFailed(false);
  }, [product.nombre, product.imagen]);

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setAllFormatsFailed(true);
    }
  };

  const handleImageLoad = () => {
    setImgLoaded(true);
  };

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

  const currentImgSrc = candidates[candidateIndex];

  return (
    <article className={`product-card ${isSoldOut ? "product-card-soldout" : ""} ${imgLoaded ? "has-photo" : ""}`}>
      <div className={`product-visual ${imgLoaded ? "visual-with-photo" : "visual-with-emoji"}`}>
        {!allFormatsFailed ? (
          <div className="product-photo-wrapper">
            <img
              src={currentImgSrc}
              alt={product.nombre}
              className={`product-photo-img ${imgLoaded ? "is-loaded" : "is-loading"}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            {!imgLoaded && (
              <div className="product-photo-skeleton">
                <span className="product-emoji placeholder">{emoji}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="product-emoji-wrapper">
            <span className="product-emoji">{emoji}</span>
          </div>
        )}

        <span className="product-badge-cat">{product.categoria}</span>
        {isSoldOut && (
          <span className="product-badge-soldout">🔴 AGOTADO HOY</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.nombre}</h3>
        <p className="product-desc">
          {product.descripcion || (isSoldOut
            ? "Este plato se quedó temporalmente sin insumos en cocina por hoy."
            : "Preparado al wok al momento con la receta tradicional china cantonesa.")}
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
