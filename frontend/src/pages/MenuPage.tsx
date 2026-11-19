import React, { useState, useMemo } from "react";
import { CategoryTabs } from "../components/CategoryTabs";
import { ProductCard } from "../components/ProductCard";
import { useStore } from "../context/StoreContext";

interface MenuPageProps {
  searchTerm: string;
}

export const MenuPage: React.FC<MenuPageProps> = ({ searchTerm }) => {
  const {
    products,
    categories,
    loading,
    isLiveApi,
    refreshCatalog,
    isStoreOpen,
    closedReason,
    estimatedDeliveryTime,
    outOfStockCount,
    freeDeliveryThreshold
  } = useStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Filtrar productos por categoría y por término de búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Filtro de categoría
      const matchesCategory =
        selectedCategoryId === null ||
        prod.idCategoria === selectedCategoryId;

      // Filtro de búsqueda por texto
      const cleanSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !cleanSearch ||
        prod.nombre.toLowerCase().includes(cleanSearch) ||
        prod.categoria.toLowerCase().includes(cleanSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchTerm]);

  return (
    <main className="menu-page">
      {/* Banner de estado de conexión */}
      <div className="api-status-banner">
        {isLiveApi ? (
          <span className="status-live">
            🟢 Conectado con la API en vivo (Node.js & PostgreSQL)
          </span>
        ) : (
          <span className="status-mock">
            ℹ️ Catálogo activo en modo local / demo (Inicia el backend en puerto 3000 para sincronización en tiempo real)
            <button className="retry-btn" onClick={refreshCatalog}>
              🔄 Reintentar conexión
            </button>
          </span>
        )}
      </div>

      {/* Banner de Tienda Cerrada / Pausa Operativa */}
      {!isStoreOpen && (
        <div className="store-closed-client-banner">
          <div className="banner-icon-side">🏮</div>
          <div className="banner-text-side">
            <h4>Four Seas está temporalmente en Pausa Operativa</h4>
            <p>{closedReason}</p>
            <span className="banner-subtext">
              Puedes ver nuestra carta y explorar los platos. La toma de pedidos se reanudará en cuanto la cocina se libere.
            </span>
          </div>
        </div>
      )}

      {/* Alerta de platos agotados hoy si la tienda está abierta */}
      {isStoreOpen && outOfStockCount > 0 && (
        <div className="stock-notice-pill-bar">
          <span>⚠️ <strong>Aviso de cocina:</strong> Hay {outOfStockCount} plato(s) marcado(s) como agotado(s) por hoy debido a la alta demanda.</span>
        </div>
      )}

      {/* Hero promocional */}
      <section className="menu-hero">
        <div className="hero-content">
          <div className="hero-header-badges">
            <span className="hero-tag">🔥 Especialidad de la casa</span>
            <span className="hero-delivery-badge">⏱️ Entrega estimada: {estimatedDeliveryTime}</span>
            {freeDeliveryThreshold > 0 && (
              <span className="hero-free-delivery-badge">
                🛵 Envío GRATIS desde S/ {freeDeliveryThreshold.toFixed(2)}
              </span>
            )}
          </div>
          <h2 className="hero-title">Sabor Chifa Inconfundible</h2>
          <p className="hero-text">
            Chaufas dorados al wok con sillao cantones, tallarines taypa crocantes,
            pollo chijaukay y wanton frito. Haz tu pedido directo sin intermediarios.
          </p>
        </div>
      </section>

      {/* Selector de Categorías */}
      <CategoryTabs
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        totalProductsCount={products.length}
      />

      {/* Contenido / Listado */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando los platos de la carta Four Seas...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="no-results-state">
          <span className="no-results-icon">🍲</span>
          <h3>No encontramos platos que coincidan con "{searchTerm}"</h3>
          <p>Prueba con otra palabra o revisa nuestras categorías principales.</p>
        </div>
      ) : (
        <section className="products-grid-section">
          <div className="section-header-info">
            <h3>
              {selectedCategoryId
                ? categories.find((c) => c.idCategoria === selectedCategoryId)?.nombre
                : "Todos los Platos"}
            </h3>
            <span className="results-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? "plato disponible" : "platos disponibles"}
            </span>
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.idProducto} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
