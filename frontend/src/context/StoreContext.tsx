import React, { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "../services/product.service";
import type { Category } from "../services/category.service";
import { getProducts } from "../services/product.service";
import { getCategories } from "../services/category.service";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "../services/mockData";

export interface DeliveryZone {
  id: string;
  nombre: string;
  tarifa: number;
  tiempoEstimado: string;
  pedidoMinimo: number;
  activa: boolean;
}

interface StoreContextType {
  // Estado general de la tienda
  isStoreOpen: boolean;
  toggleStoreOpen: (forceState?: boolean) => void;
  closedReason: string;
  setClosedReason: (reason: string) => void;
  estimatedDeliveryTime: string;
  setEstimatedDeliveryTime: (time: string) => void;

  // Catálogo y disponibilidad de platos
  products: Product[];
  categories: Category[];
  loading: boolean;
  isLiveApi: boolean;
  toggleProductAvailability: (idProducto: string) => void;
  resetAllProductsAvailability: () => void;
  updateProductPrice: (idProducto: string, newPrice: string) => void;
  refreshCatalog: () => Promise<void>;
  outOfStockCount: number;

  // Zonas de Cobertura y Tarifas de Delivery
  deliveryZones: DeliveryZone[];
  freeDeliveryThreshold: number;
  setFreeDeliveryThreshold: (amount: number) => void;
  updateZoneTarifa: (id: string, tarifa: number) => void;
  updateZoneDetails: (zone: DeliveryZone) => void;
  toggleZoneActive: (id: string) => void;
  addDeliveryZone: (newZone: Omit<DeliveryZone, "id">) => void;
  deleteDeliveryZone: (id: string) => void;
  resetDefaultZones: () => void;
}

const STORE_OPEN_KEY = "four_seas_store_open_status_v1";
const STORE_REASON_KEY = "four_seas_store_closed_reason_v1";
const STORE_PRODUCTS_KEY = "four_seas_products_stock_v1";
const STORE_ZONES_KEY = "four_seas_delivery_zones_v2";
const STORE_FREE_DELIVERY_KEY = "four_seas_free_delivery_v1";

const DEFAULT_ZONES: DeliveryZone[] = [
  { id: "1", nombre: "San Borja (Sede Principal)", tarifa: 4.0, tiempoEstimado: "25 - 35 min", pedidoMinimo: 20.0, activa: true },
  { id: "2", nombre: "Surquillo", tarifa: 5.0, tiempoEstimado: "25 - 35 min", pedidoMinimo: 25.0, activa: true },
  { id: "3", nombre: "San Isidro", tarifa: 5.5, tiempoEstimado: "30 - 40 min", pedidoMinimo: 25.0, activa: true },
  { id: "4", nombre: "Miraflores", tarifa: 5.5, tiempoEstimado: "30 - 45 min", pedidoMinimo: 30.0, activa: true },
  { id: "5", nombre: "Santiago de Surco", tarifa: 6.0, tiempoEstimado: "35 - 45 min", pedidoMinimo: 30.0, activa: true },
  { id: "6", nombre: "La Victoria", tarifa: 5.5, tiempoEstimado: "30 - 45 min", pedidoMinimo: 25.0, activa: true },
  { id: "7", nombre: "Lince", tarifa: 6.0, tiempoEstimado: "35 - 50 min", pedidoMinimo: 30.0, activa: true },
  { id: "8", nombre: "Jesús María", tarifa: 6.5, tiempoEstimado: "40 - 50 min", pedidoMinimo: 35.0, activa: true },
  { id: "9", nombre: "Magdalena del Mar", tarifa: 7.0, tiempoEstimado: "40 - 55 min", pedidoMinimo: 35.0, activa: true },
  { id: "10", nombre: "San Miguel", tarifa: 7.5, tiempoEstimado: "45 - 60 min", pedidoMinimo: 40.0, activa: true }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Estado de apertura del restaurante
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORE_OPEN_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [closedReason, setClosedReasonState] = useState<string>(() => {
    return (
      localStorage.getItem(STORE_REASON_KEY) ||
      "Cocina en pausa operativa por alta demanda de pedidos. Reanudamos la atención en breve."
    );
  });

  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>("35 - 50 min");

  // 2. Catálogo de productos y categorías
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // 3. Zonas de Cobertura y Delivery
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() => {
    const saved = localStorage.getItem(STORE_ZONES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback si JSON está corrupto
      }
    }
    return DEFAULT_ZONES;
  });

  const [freeDeliveryThreshold, setFreeDeliveryThresholdState] = useState<number>(() => {
    const saved = localStorage.getItem(STORE_FREE_DELIVERY_KEY);
    return saved !== null ? parseFloat(saved) : 80.0;
  });

  const setFreeDeliveryThreshold = (amount: number) => {
    setFreeDeliveryThresholdState(amount);
    localStorage.setItem(STORE_FREE_DELIVERY_KEY, amount.toString());
  };

  const saveZones = (zones: DeliveryZone[]) => {
    setDeliveryZones(zones);
    localStorage.setItem(STORE_ZONES_KEY, JSON.stringify(zones));
  };

  const updateZoneTarifa = (id: string, tarifa: number) => {
    const updated = deliveryZones.map((z) => (z.id === id ? { ...z, tarifa } : z));
    saveZones(updated);
  };

  const updateZoneDetails = (zone: DeliveryZone) => {
    const updated = deliveryZones.map((z) => (z.id === zone.id ? zone : z));
    saveZones(updated);
  };

  const toggleZoneActive = (id: string) => {
    const updated = deliveryZones.map((z) => (z.id === id ? { ...z, activa: !z.activa } : z));
    saveZones(updated);
  };

  const addDeliveryZone = (newZone: Omit<DeliveryZone, "id">) => {
    const id = Date.now().toString();
    const created: DeliveryZone = { ...newZone, id };
    saveZones([...deliveryZones, created]);
  };

  const deleteDeliveryZone = (id: string) => {
    const updated = deliveryZones.filter((z) => z.id !== id);
    saveZones(updated);
  };

  const resetDefaultZones = () => {
    saveZones(DEFAULT_ZONES);
  };

  const refreshCatalog = async () => {
    setLoading(true);
    try {
      const [catsData, prodsData] = await Promise.all([
        getCategories(),
        getProducts()
      ]);

      if (Array.isArray(catsData) && Array.isArray(prodsData) && prodsData.length > 0) {
        setCategories(catsData);
        const savedStock = localStorage.getItem(STORE_PRODUCTS_KEY);
        if (savedStock) {
          const stockMap: Record<string, boolean> = JSON.parse(savedStock);
          const merged = prodsData.map((p) => ({
            ...p,
            disponible: stockMap[p.idProducto] !== undefined ? stockMap[p.idProducto] : p.disponible
          }));
          setProducts(merged);
        } else {
          setProducts(prodsData);
        }
        setIsLiveApi(true);
      } else {
        throw new Error("Respuesta vacía");
      }
    } catch {
      setCategories(MOCK_CATEGORIES);
      const savedStock = localStorage.getItem(STORE_PRODUCTS_KEY);
      if (savedStock) {
        const stockMap: Record<string, boolean> = JSON.parse(savedStock);
        const merged = MOCK_PRODUCTS.map((p) => ({
          ...p,
          disponible: stockMap[p.idProducto] !== undefined ? stockMap[p.idProducto] : p.disponible
        }));
        setProducts(merged);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
      setIsLiveApi(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  const toggleStoreOpen = (forceState?: boolean) => {
    setIsStoreOpen((prev) => {
      const next = forceState !== undefined ? forceState : !prev;
      localStorage.setItem(STORE_OPEN_KEY, JSON.stringify(next));
      return next;
    });
  };

  const setClosedReason = (reason: string) => {
    setClosedReasonState(reason);
    localStorage.setItem(STORE_REASON_KEY, reason);
  };

  const saveStockMap = (updatedProducts: Product[]) => {
    const stockMap: Record<string, boolean> = {};
    updatedProducts.forEach((p) => {
      stockMap[p.idProducto] = p.disponible;
    });
    localStorage.setItem(STORE_PRODUCTS_KEY, JSON.stringify(stockMap));
  };

  const toggleProductAvailability = (idProducto: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.idProducto === idProducto ? { ...p, disponible: !p.disponible } : p
      );
      saveStockMap(updated);
      return updated;
    });
  };

  const resetAllProductsAvailability = () => {
    setProducts((prev) => {
      const updated = prev.map((p) => ({ ...p, disponible: true }));
      saveStockMap(updated);
      return updated;
    });
  };

  const updateProductPrice = (idProducto: string, newPrice: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.idProducto === idProducto ? { ...p, precio: newPrice } : p
      );
      return updated;
    });
  };

  const outOfStockCount = products.filter((p) => !p.disponible).length;

  return (
    <StoreContext.Provider
      value={{
        isStoreOpen,
        toggleStoreOpen,
        closedReason,
        setClosedReason,
        estimatedDeliveryTime,
        setEstimatedDeliveryTime,
        products,
        categories,
        loading,
        isLiveApi,
        toggleProductAvailability,
        resetAllProductsAvailability,
        updateProductPrice,
        refreshCatalog,
        outOfStockCount,
        deliveryZones,
        freeDeliveryThreshold,
        setFreeDeliveryThreshold,
        updateZoneTarifa,
        updateZoneDetails,
        toggleZoneActive,
        addDeliveryZone,
        deleteDeliveryZone,
        resetDefaultZones
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore debe usarse dentro de un StoreProvider");
  }
  return context;
};
