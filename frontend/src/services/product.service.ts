import api from "./api";

export interface Product {
  idProducto: string;
  idCategoria: string;
  categoria: string;
  nombre: string;
  precio: string;
  disponible: boolean;
}

export const getProducts = async (categoryId?: string | number): Promise<Product[]> => {
  const params = categoryId ? { categoryId } : undefined;
  const response = await api.get("/api/products", { params });
  return response.data.data;
};
