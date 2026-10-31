
import { Router } from "express";
import {
  listUsers,
  getUserById,
  createUserController
} from "../controllers/user.controller";

const router = Router();

router.get("/", listUsers);
router.get("/:id", getUserById);
router.post("/", createUserController);

export default router;
