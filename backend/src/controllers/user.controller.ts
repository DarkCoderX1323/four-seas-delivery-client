
import { Request, Response } from "express";
import {
  getUsers,
  getUser,
  registerUser
} from "../services/user.service";

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();

    return res.status(200).json({
      status: "success",
      total: users.length,
      data: users
    });
  } catch (error) {
    console.error("Error listing users:", error);

    return res.status(500).json({
      status: "error",
      message: "No se pudieron consultar los usuarios"
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: "error",
        message: "El identificador no es válido"
      });
    }

    const user = await getUser(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      status: "success",
      data: user
    });
  } catch (error) {
    console.error("Error retrieving user:", error);

    return res.status(500).json({
      status: "error",
      message: "No se pudo consultar el usuario"
    });
  }
};

export const createUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const { nombreUsuario, nombreCompleto, rol, password } = req.body;

    if (
      typeof nombreUsuario !== "string" ||
      typeof nombreCompleto !== "string" ||
      typeof rol !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Los datos enviados no son válidos"
      });
    }

    const user = await registerUser({
      nombreUsuario,
      nombreCompleto,
      rol,
      password
    });

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      data: user
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "No se pudo registrar el usuario";

    if (
      message.includes("obligatorios") ||
      message.includes("no es válido") ||
      message.includes("8 caracteres")
    ) {
      return res.status(400).json({
        status: "error",
        message
      });
    }

    if (message.includes("ya está registrado")) {
      return res.status(409).json({
        status: "error",
        message
      });
    }

    console.error("Error creating user:", error);

    return res.status(500).json({
      status: "error",
      message: "No se pudo registrar el usuario"
    });
  }
};
