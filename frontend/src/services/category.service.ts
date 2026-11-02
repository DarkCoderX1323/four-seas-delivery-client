import api from "./api";

export interface Category {
  idCategoria: string;
  nombre: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/api/categories");
  return response.data.data;
};

