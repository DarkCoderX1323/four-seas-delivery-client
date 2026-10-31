
import pool from "../config/database";

export interface User {
  idUsuario: string;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: string;
  activo: boolean;
}

export interface CreateUserData {
  nombreUsuario: string;
  nombreCompleto: string;
  rol: string;
  passwordHash: string;
}

export const findAllUsers = async (): Promise<User[]> => {
  const query = `
    SELECT
      id_usuario AS "idUsuario",
      nombre_usuario AS "nombreUsuario",
      nombre_completo AS "nombreCompleto",
      rol,
      activo
    FROM public.usuario
    ORDER BY id_usuario;
  `;

  const result = await pool.query<User>(query);
  return result.rows;
};

export const findUserById = async (
  id: number
): Promise<User | null> => {
  const query = `
    SELECT
      id_usuario AS "idUsuario",
      nombre_usuario AS "nombreUsuario",
      nombre_completo AS "nombreCompleto",
      rol,
      activo
    FROM public.usuario
    WHERE id_usuario = $1;
  `;

  const result = await pool.query<User>(query, [id]);
  return result.rows[0] ?? null;
};

export const findUserByUsername = async (username: string) => {
  const query = `
    SELECT
      id_usuario AS "idUsuario",
      nombre_usuario AS "nombreUsuario",
      nombre_completo AS "nombreCompleto",
      rol,
      password_hash AS "passwordHash",
      activo
    FROM public.usuario
    WHERE LOWER(nombre_usuario) = LOWER($1);
  `;

  const result = await pool.query(query, [username]);
  return result.rows[0] ?? null;
};

export const createUser = async (
  data: CreateUserData
): Promise<User> => {
  const query = `
    INSERT INTO public.usuario (
      nombre_usuario,
      nombre_completo,
      rol,
      password_hash
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id_usuario AS "idUsuario",
      nombre_usuario AS "nombreUsuario",
      nombre_completo AS "nombreCompleto",
      rol,
      activo;
  `;

  const result = await pool.query<User>(query, [
    data.nombreUsuario,
    data.nombreCompleto,
    data.rol,
    data.passwordHash
  ]);

  return result.rows[0];
};
