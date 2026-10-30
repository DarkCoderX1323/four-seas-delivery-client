
import { Request, Response } from "express";
import { getProducts } from "../services/product.service";

export const listProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let categoryId: number | undefined;

    if (req.query.categoryId !== undefined) {
      const rawCategoryId = req.query.categoryId;

      if (
        typeof rawCategoryId !== "string" ||
        !/^[1-9]\d*$/.test(rawCategoryId) ||
        !Number.isSafeInteger(Number(rawCategoryId))
      ) {
        res.status(400).json({
          status: "error",
          message: "categoryId must be a positive integer"
        });
        return;
      }

      categoryId = Number(rawCategoryId);
    }

    const products = await getProducts({ categoryId });

    res.status(200).json({
      status: "success",
      total: products.length,
      data: products
    });
  } catch (error) {
    console.error("Error listing products:", error);

    res.status(500).json({
      status: "error",
      message: "Unable to retrieve products"
    });
  }
};
