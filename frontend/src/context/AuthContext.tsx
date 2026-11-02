import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "CLIENTE" | "ADMINISTRADOR" | "RECEPCION" | "COCINA" | "MOTORIZADO";

export interface AuthUser {
  id: string;
  nombreUsuario: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  distrito?: string;
  rol: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (usuario: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    nombreCompleto: string;
    nombreUsuario: string;
    password: string;
    telefono?: string;
    direccion?: string;
    distrito?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: "login" | "register";
  setAuthModalTab: (tab: "login" | "register") => void;
  authModalReason: string | null;
  setAuthModalReason: (reason: string | null) => void;
  requireAuth: (reason: string, onSuccess: () => void) => boolean;
  currentAddress: string;
  setCurrentAddress: (address: string) => void;
}

const AUTH_STORAGE_KEY = "four_seas_auth_user_v2";
const ADDRESS_STORAGE_KEY = "four_seas_address_v2";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentAddress, setCurrentAddress] = useState<string>(() => {
    try {
      return localStorage.getItem(ADDRESS_STORAGE_KEY) || "Av. Conquistadores 450, San Isidro";
    } catch {
      return "San Isidro, Lima";
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, currentAddress);
    } catch {
      // Ignore storage errors
    }
  }, [currentAddress]);

  const requireAuth = (reason: string, onSuccess: () => void): boolean => {
    if (user) {
      onSuccess();
      return true;
    }
    setAuthModalReason(reason);
    setPendingSuccessCallback(() => onSuccess);
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
    return false;
  };

  const login = async (usuario: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const cleanUser = usuario.trim().toLowerCase();

    if (!cleanUser || !pass) {
      return { success: false, message: "Por favor ingresa usuario y contraseña" };
    }

    let authenticatedUser: AuthUser;

    if (cleanUser.includes("admin")) {
      authenticatedUser = {
        id: "1",
        nombreUsuario: cleanUser,
        nombreCompleto: "Administrador General",
        rol: "ADMINISTRADOR",
        telefono: "987654321",
        direccion: "Local Principal Four Seas",
        distrito: "San Isidro"
      };
    } else if (cleanUser.includes("recepcion")) {
      authenticatedUser = {
        id: "2",
        nombreUsuario: cleanUser,
        nombreCompleto: "Mariana Wong",
        rol: "RECEPCION",
        telefono: "987111222",
        direccion: "Local Four Seas",
        distrito: "San Isidro"
      };
    } else if (cleanUser.includes("cocina")) {
      authenticatedUser = {
        id: "3",
        nombreUsuario: cleanUser,
        nombreCompleto: "Chef Kenji Lau",
        rol: "COCINA",
        telefono: "987333444",
        direccion: "Estación Central de Wok",
        distrito: "San Isidro"
      };
    } else if (cleanUser.includes("motorizado")) {
      authenticatedUser = {
        id: "4",
        nombreUsuario: cleanUser,
        nombreCompleto: "Pedro Quispe",
        rol: "MOTORIZADO",
        telefono: "987555666",
        direccion: "Flota de Reparto",
        distrito: "San Isidro"
      };
    } else {
      authenticatedUser = {
        id: String(Date.now()).slice(-5),
        nombreUsuario: cleanUser,
        nombreCompleto: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
        rol: "CLIENTE",
        telefono: "999888777",
        direccion: currentAddress,
        distrito: "San Isidro"
      };
    }

    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    setAuthModalReason(null);

    if (pendingSuccessCallback) {
      pendingSuccessCallback();
      setPendingSuccessCallback(null);
    }

    return { success: true };
  };

  const register = async (data: {
    nombreCompleto: string;
    nombreUsuario: string;
    password: string;
    telefono?: string;
    direccion?: string;
    distrito?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!data.nombreCompleto.trim() || !data.nombreUsuario.trim() || !data.password) {
      return { success: false, message: "Todos los campos obligatorios deben llenarse." };
    }

    if (data.password.length < 6) {
      return { success: false, message: "La contraseña debe tener al menos 6 caracteres." };
    }

    const newUser: AuthUser = {
      id: String(Date.now()).slice(-5),
      nombreUsuario: data.nombreUsuario.trim(),
      nombreCompleto: data.nombreCompleto.trim(),
      telefono: data.telefono?.trim() || "987654321",
      direccion: data.direccion?.trim() || currentAddress,
      distrito: data.distrito || "San Isidro",
      rol: "CLIENTE"
    };

    if (newUser.direccion) {
      setCurrentAddress(newUser.direccion);
    }

    setUser(newUser);
    setIsAuthModalOpen(false);
    setAuthModalReason(null);

    if (pendingSuccessCallback) {
      pendingSuccessCallback();
      setPendingSuccessCallback(null);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setPendingSuccessCallback(null);
    setAuthModalReason(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        authModalReason,
        setAuthModalReason,
        requireAuth,
        currentAddress,
        setCurrentAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
