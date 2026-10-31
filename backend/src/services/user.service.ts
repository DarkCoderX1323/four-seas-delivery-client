
import bcrypt from "bcryptjs";

import {
  createUser,
  findAllUsers,
  findUserById,
  findUserByUsername
} from "../repositories/user.repository";

const VALID_ROLES = [
  "ADMINISTRADOR",
  "RECEPCION",
  "COCINA",
  "MOTORIZADO"
];

export interface RegisterUserData {
  nombreUsuario: string;
  nombreCompleto: string;
  rol: string;
  password: string;
}

// Obtener todos los usuarios
export const getUsers = async () => {
  return await findAllUsers();
};

// Obtener un usuario por su identificador
export const getUser = async (id: number) => {
  return await findUserById(id);
};

// Registrar un nuevo usuario
export const registerUser = async (data: RegisterUserData) => {
  const nombreUsuario = data.nombreUsuario.trim();
  const nombreCompleto = data.nombreCompleto.trim();
  const rol = data.rol.toUpperCase();

  // Validar campos obligatorios
  if (!nombreUsuario || !nombreCompleto || !data.password) {
    throw new Error("Todos los campos son obligatorios");
  }

  // Validar rol
  if (!VALID_ROLES.includes(rol)) {
    throw new Error("El rol especificado no es válido");
  }

  // Validar longitud de contraseña
  if (data.password.length < 8) {
    throw new Error(
      "La contraseña debe tener al menos 8 caracteres"
    );
  }

  // Comprobar si el nombre de usuario ya existe
  const existingUser = await findUserByUsername(nombreUsuario);

  if (existingUser) {
    throw new Error("El nombre de usuario ya está registrado");
  }

  // Generar hash de contraseña
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Guardar usuario en PostgreSQL
  const newUser = await createUser({
    nombreUsuario,
    nombreCompleto,
    rol,
    passwordHash
  });

  return newUser;
};
