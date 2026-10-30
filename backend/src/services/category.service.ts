
import { findAllCategories } from "../repositories/category.repository";

export const getCategories = async () => {
  return await findAllCategories();
};
