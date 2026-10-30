
import {
  findAllProducts,
  ProductFilters
} from "../repositories/product.repository";

export const getProducts = async (filters: ProductFilters) => {
  return await findAllProducts(filters);
};
