
import api from "./api";

export interface Product {
  idProducto: string;
  idCategoria: string;
  categoria: string;
  nombre: string;
  precio: string;
  disponible: boolean;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get("/api/products");
  return response.data.data;
};
