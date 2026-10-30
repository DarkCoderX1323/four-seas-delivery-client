
import pool from "../config/database";

export interface ProductFilters {
  categoryId?: number;
}

export interface Product {
  idProducto: string;
  idCategoria: string;
  categoria: string;
  nombre: string;
  precio: string;
  disponible: boolean;
}

export const findAllProducts = async (
  filters: ProductFilters
): Promise<Product[]> => {
  const query = `
    SELECT
      p.id_producto AS "idProducto",
      p.id_categoria AS "idCategoria",
      c.nombre AS categoria,
      p.nombre,
      p.precio,
      p.disponible
    FROM producto p
    INNER JOIN categoria c
      ON c.id_categoria = p.id_categoria
    WHERE p.disponible = TRUE
      AND ($1::BIGINT IS NULL OR p.id_categoria = $1)
    ORDER BY c.nombre, p.nombre;
  `;

  const result = await pool.query<Product>(query, [
    filters.categoryId ?? null
  ]);

  return result.rows;
};
