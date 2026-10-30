
import { Request, Response } from "express";
import { getCategories } from "../services/category.service";

export const listCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await getCategories();

    res.status(200).json({
      status: "success",
      total: categories.length,
      data: categories
    });
  } catch (error) {
    console.error("Error listing categories:", error);

    res.status(500).json({
      status: "error",
      message: "Unable to retrieve categories"
    });
  }
};
