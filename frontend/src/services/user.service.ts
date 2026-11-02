import api from "./api";

export interface User {
  idUsuario: string;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: "ADMINISTRADOR" | "RECEPCION" | "COCINA" | "MOTORIZADO" | string;
  activo: boolean;
}

export interface CreateUserData {
  nombreUsuario: string;
  nombreCompleto: string;
  rol: string;
  password: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/api/users");
  return response.data.data;
};

export const getUserById = async (id: number | string): Promise<User> => {
  const response = await api.get(`/api/users/${id}`);
  return response.data.data;
};

export const registerUser = async (data: CreateUserData): Promise<User> => {
  const response = await api.post("/api/users", data);
  return response.data.data;
};

