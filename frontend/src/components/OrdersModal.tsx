import React, { useState } from "react";
import { useOrders } from "../context/OrderContext";
import type { OrderStatus, Order } from "../context/OrderContext";

interface OrdersModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen = false, onClose }) => {
  const { orders } = useOrders();
  const [activeTabFilter, setActiveTabFilter] = useState<"todos" | "activos">("activos");

  if (!isOpen) return null;

  const STATUS_STEPS: Array<{ key: OrderStatus; label: string; icon: string }> = [
    { key: "PENDIENTE", label: "Recibido", icon: "📝" },
    { key: "EN_PREPARACION", label: "En Wok / Cocina", icon: "🍳" },
    { key: "LISTO_PARA_ENTREGA", label: "Listo para Salir", icon: "🥡" },
    { key: "EN_CAMINO", label: "Repartidor en camino", icon: "🛵" },
    { key: "ENTREGADO", label: "Entregado", icon: "✅" }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "PENDIENTE":
        return 0;
      case "EN_PREPARACION":
        return 1;
      case "LISTO_PARA_ENTREGA":
        return 2;
      case "EN_CAMINO":
        return 3;
      case "ENTREGADO":
        return 4;
      default:
        return 0;
    }
  };

  const filteredOrders = orders.filter((o: Order) => {
    if (activeTabFilter === "activos") {
      return o.estado !== "ENTREGADO" && o.estado !== "CANCELADO";
    }
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="orders-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div className="orders-title-group">
            <h2>📦 Mis Pedidos (PedidosYa Style)</h2>
            <span className="orders-count">{orders.length} pedidos</span>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="orders-filter-tabs">
          <button
            className={`orders-filter-btn ${activeTabFilter === "activos" ? "active" : ""}`}
            onClick={() => setActiveTabFilter("activos")}
          >
            En Curso ({orders.filter((o: Order) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO").length})
          </button>
          <button
            className={`orders-filter-btn ${activeTabFilter === "todos" ? "active" : ""}`}
            onClick={() => setActiveTabFilter("todos")}
          >
            Historial Completo ({orders.length})
          </button>
        </div>

        <div className="orders-modal-body">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders-view">
              <span className="empty-orders-icon">🛵</span>
              <h3>No tienes pedidos {activeTabFilter === "activos" ? "en curso" : "registrados"}</h3>
              <p>Elige tus platos favoritos de Four Seas y haz tu pedido con entrega rápida.</p>
              <button
                className="orders-cta-btn"
                onClick={onClose}
              >
                Ver Menú
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order: Order) => {
                const currentStepIdx = getStepIndex(order.estado);

                return (
                  <article key={order.idPedido} className="order-card-tracking">
                    <div className="order-card-top">
                      <div>
                        <span className="order-id">Pedido #{order.idPedido}</span>
                        <span className="order-time">· {order.fechaHora}</span>
                      </div>
                      <div className="order-amount">
                        S/ {order.total.toFixed(2)}
                      </div>
                    </div>

                    {/* Stepper de progreso estilo PedidosYa */}
                    <div className="stepper-progress-container">
                      <div className="stepper-track">
                        <div
                          className="stepper-fill"
                          style={{
                            width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`
                          }}
                        />
                      </div>

                      <div className="stepper-steps">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div
                              key={step.key}
                              className={`stepper-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                            >
                              <div className="step-circle">{step.icon}</div>
                              <span className="step-label">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="order-details-box">
                      <div className="order-info-row">
                        <span>📍 Entrega:</span>
                        <strong>{order.cliente.direccion} ({order.cliente.distrito})</strong>
                      </div>
                      <div className="order-info-row">
                        <span>💳 Pago:</span>
                        <strong>{order.metodoPago}</strong>
                      </div>

                      <div className="order-items-preview">
                        {order.items.map((item, i: number) => (
                          <span key={i} className="order-item-chip">
                            {item.cantidad}x {item.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
