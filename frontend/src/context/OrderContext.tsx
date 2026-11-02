import React, { createContext, useContext, useEffect, useState } from "react";

export type OrderStatus =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "LISTO_PARA_ENTREGA"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

export interface OrderTimelineEvent {
  estado: OrderStatus;
  fechaHora: string;
  usuario: string;
  nota?: string;
}

export interface OrderItem {
  idProducto: string;
  nombre: string;
  precio: number;
  cantidad: number;
  observaciones?: string;
}

export interface Order {
  idPedido: number;
  cliente: {
    nombre: string;
    telefono: string;
    direccion: string;
    referencia?: string;
    distrito: string;
  };
  items: OrderItem[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: string;
  montoEfectivo?: string;
  comentarios?: string;
  estado: OrderStatus;
  fechaHora: string;
  motorizadoAsignado?: string;
  historialEstados: OrderTimelineEvent[];
  comprobante?: {
    idComprobante: string;
    fecha: string;
    montoTotal: number;
  };
}

interface OrderContextType {
  orders: Order[];
  createOrder: (orderData: Omit<Order, "idPedido" | "fechaHora" | "estado" | "historialEstados" | "comprobante">) => Order;
  updateOrderStatus: (idPedido: number, nuevoEstado: OrderStatus, usuario: string, nota?: string) => void;
  assignMotorizado: (idPedido: number, motorizadoNombre: string, usuario: string) => void;
  getOrderById: (idPedido: number) => Order | undefined;
  activeOrderId: number | null;
  setActiveOrderId: (id: number | null) => void;
}

const ORDERS_KEY = "four_seas_complete_orders_v3";

const INITIAL_ORDERS: Order[] = [
  {
    idPedido: 502814,
    cliente: {
      nombre: "Carlos Chang",
      telefono: "987654321",
      direccion: "Av. Conquistadores 450",
      referencia: "Dpto 302, timbre blanco",
      distrito: "San Isidro"
    },
    items: [
      { idProducto: "1", nombre: "Chaufa de Pollo", precio: 15.0, cantidad: 2, observaciones: "Sin cebollita china" },
      { idProducto: "8", nombre: "Pollo Chijaukay", precio: 19.0, cantidad: 1, observaciones: "Salsa aparte" }
    ],
    subtotal: 49.0,
    costoEnvio: 5.0,
    total: 54.0,
    metodoPago: "YAPE",
    estado: "PENDIENTE",
    fechaHora: new Date(Date.now() - 5 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    motorizadoAsignado: "Pedro Quispe (Moto 02)",
    historialEstados: [
      {
        estado: "PENDIENTE",
        fechaHora: new Date(Date.now() - 5 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        usuario: "Cliente (Web)",
        nota: "Pedido recibido en Four Seas International House. En espera de confirmación por Recepción."
      }
    ],
    comprobante: {
      idComprobante: "B001-000491",
      fecha: new Date().toLocaleDateString(),
      montoTotal: 54.0
    }
  }
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage errors
    }
  }, [orders]);

  // PROCESO 100% MANUAL: Cada usuario (Cliente, Recepción, Cocina, Motorizado, Admin)
  // debe ejecutar su respectiva acción manualmente.

  const createOrder = (
    orderData: Omit<Order, "idPedido" | "fechaHora" | "estado" | "historialEstados" | "comprobante">
  ): Order => {
    const idPedido = Math.floor(100000 + Math.random() * 900000);
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newOrder: Order = {
      ...orderData,
      idPedido,
      fechaHora: nowStr,
      estado: "PENDIENTE",
      historialEstados: [
        {
          estado: "PENDIENTE",
          fechaHora: nowStr,
          usuario: `${orderData.cliente.nombre} (Cliente)`,
          nota: "Pedido ingresado manualmente por el cliente. En espera de aprobación por Recepción."
        }
      ],
      comprobante: {
        idComprobante: `B001-${String(Math.floor(1000 + Math.random() * 9000))}`,
        fecha: new Date().toLocaleDateString(),
        montoTotal: orderData.total
      }
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(idPedido);
    return newOrder;
  };

  const updateOrderStatus = (
    idPedido: number,
    nuevoEstado: OrderStatus,
    usuario: string,
    nota?: string
  ) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setOrders((prev) =>
      prev.map((order) => {
        if (order.idPedido !== idPedido) return order;

        return {
          ...order,
          estado: nuevoEstado,
          historialEstados: [
            ...order.historialEstados,
            {
              estado: nuevoEstado,
              fechaHora: nowStr,
              usuario,
              nota: nota || `Estado actualizado manualmente a ${nuevoEstado}`
            }
          ]
        };
      })
    );
  };

  const assignMotorizado = (idPedido: number, motorizadoNombre: string, usuario: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setOrders((prev) =>
      prev.map((order) => {
        if (order.idPedido !== idPedido) return order;

        return {
          ...order,
          motorizadoAsignado: motorizadoNombre,
          historialEstados: [
            ...order.historialEstados,
            {
              estado: order.estado,
              fechaHora: nowStr,
              usuario,
              nota: `Motorizado asignado manualmente: ${motorizadoNombre}`
            }
          ]
        };
      })
    );
  };

  const getOrderById = (idPedido: number): Order | undefined => {
    return orders.find((o) => o.idPedido === idPedido);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        assignMotorizado,
        getOrderById,
        activeOrderId,
        setActiveOrderId
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders debe ser usado dentro de un OrderProvider");
  }
  return context;
};
