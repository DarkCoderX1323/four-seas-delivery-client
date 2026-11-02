import React, { useEffect, useState, useMemo } from "react";
import { getCategories } from "../services/category.service";
import type { Category } from "../services/category.service";
import { getProducts } from "../services/product.service";
import type { Product } from "../services/product.service";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "../services/mockData";
import { CategoryTabs } from "../components/CategoryTabs";
import { ProductCard } from "../components/ProductCard";

interface MenuPageProps {
  searchTerm: string;
}

export const MenuPage: React.FC<MenuPageProps> = ({ searchTerm }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Intentar cargar desde el backend real
      const [catsData, prodsData] = await Promise.all([
        getCategories(),
        getProducts()
      ]);

      if (Array.isArray(catsData) && Array.isArray(prodsData) && prodsData.length > 0) {
        setCategories(catsData);
        setProducts(prodsData);
        setIsLiveApi(true);
      } else {
        throw new Error("Respuesta de catálogo vacía");
      }
    } catch {
      // Si el backend no está activo o aún no tiene datos de PostgreSQL cargados,
      // usamos el catálogo oficial definido en seeds.sql como fallback para que la interfaz funcione al 100%
      setCategories(MOCK_CATEGORIES);
      setProducts(MOCK_PRODUCTS);
      setIsLiveApi(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
            <button className="retry-btn" onClick={loadData}>
              🔄 Reintentar conexión
            </button>
          </span>
        )}
      </div>

      {/* Hero promocional */}
      <section className="menu-hero">
        <div className="hero-content">
          <span className="hero-tag">🔥 Especialidad de la casa</span>
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
      ) : errorMessage ? (
        <div className="error-state">
          <p>{errorMessage}</p>
          <button onClick={loadData} className="retry-btn">
            Reintentar
          </button>
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
