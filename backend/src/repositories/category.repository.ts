
import pool from "../config/database";

export interface Category {
  idCategoria: string;
  nombre: string;
}

export const findAllCategories = async (): Promise<Category[]> => {
  const query = `
    SELECT
      id_categoria AS "idCategoria",
      nombre
    FROM categoria
    ORDER BY nombre;
  `;

  const result = await pool.query<Category>(query);

  return result.rows;
};
