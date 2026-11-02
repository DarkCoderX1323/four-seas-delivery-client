import React, { useState } from "react";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import type { OrderStatus } from "../context/OrderContext";

interface ClientOrdersPageProps {
  onBackToMenu: () => void;
  onGoToStaff?: () => void;
}

export const ClientOrdersPage: React.FC<ClientOrdersPageProps> = ({
  onBackToMenu,
  onGoToStaff
}) => {
  const { orders, activeOrderId, setActiveOrderId } = useOrders();
  const { isAuthenticated, setIsAuthModalOpen, setAuthModalTab } = useAuth();

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    activeOrderId || (orders.length > 0 ? orders[0].idPedido : null)
  );

  const selectedOrder = orders.find((o) => o.idPedido === selectedOrderId) || orders[0];

  const STATUS_STEPS: Array<{ key: OrderStatus; label: string; icon: string }> = [
    { key: "PENDIENTE", label: "1. Recibido", icon: "📝" },
    { key: "EN_PREPARACION", label: "2. En Cocina Wok", icon: "🍳" },
    { key: "LISTO_PARA_ENTREGA", label: "3. Listo para Salir", icon: "🥡" },
    { key: "EN_CAMINO", label: "4. En Camino", icon: "🛵" },
    { key: "ENTREGADO", label: "5. Entregado", icon: "✅" }
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

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDIENTE":
        return <span className="status-badge badge-pending">🟡 Esperando confirmación de Recepción</span>;
      case "EN_PREPARACION":
        return <span className="status-badge badge-kitchen">🔥 Al fuego en el Wok</span>;
      case "LISTO_PARA_ENTREGA":
        return <span className="status-badge badge-ready">🥡 Empaquetado para salida</span>;
      case "EN_CAMINO":
        return <span className="status-badge badge-route">🛵 Motorizado en camino</span>;
      case "ENTREGADO":
        return <span className="status-badge badge-delivered">✅ Entregado con éxito</span>;
      case "CANCELADO":
        return <span className="status-badge badge-cancelled">❌ Cancelado</span>;
      default:
        return <span>{status}</span>;
    }
  };

  // 1. Verificación: Si no ha iniciado sesión, invitar a iniciar sesión
  if (!isAuthenticated) {
    return (
      <div className="client-orders-empty">
        <div className="empty-icon">🔒</div>
        <h2>Inicia sesión para ver tus pedidos</h2>
        <p>Accede con tu cuenta de cliente para realizar el seguimiento en vivo de tus pedidos de chifa.</p>
        <button
          className="primary-btn"
          style={{ maxWidth: 220, margin: "1rem auto 0" }}
          onClick={() => {
            setAuthModalTab("login");
            setIsAuthModalOpen(true);
          }}
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // 2. Si no hay pedidos
  if (orders.length === 0) {
    return (
      <div className="client-orders-empty">
        <div className="empty-icon">🥢</div>
        <h2>Aún no has realizado pedidos</h2>
        <p>Explora la carta tradicional de Four Seas y haz tu primer pedido de chifa.</p>
        <button className="primary-btn" onClick={onBackToMenu}>
          Ir a la Carta
        </button>
      </div>
    );
  }

  const currentStep = selectedOrder ? getStepIndex(selectedOrder.estado) : 0;

  return (
    <div className="client-orders-page">
      {/* Banner de flujo manual en tiempo real */}
      <div className="live-simulation-bar">
        <div className="sim-info">
          <span className="live-pulse">🔴 EN VIVO</span>
          <span>
            <strong>Flujo Manual Operativo:</strong> Tu pedido se actualiza en tiempo real conforme cada miembro del equipo (Recepción, Cocina y Motorizado) procesa su etapa.
          </span>
        </div>
        {onGoToStaff && (
          <button className="goto-staff-quick-btn" onClick={onGoToStaff}>
            🏮 Panel Operativo (Staff) ➔
          </button>
        )}
      </div>

      <div className="orders-dashboard-layout">
        {/* Columna izquierda: Lista de pedidos */}
        <aside className="orders-sidebar">
          <div className="sidebar-header">
            <h3>📦 Mis Pedidos ({orders.length})</h3>
            <button className="back-link-btn" onClick={onBackToMenu}>
              + Nuevo Pedido
            </button>
          </div>

          <div className="orders-sidebar-list">
            {orders.map((order) => (
              <div
                key={order.idPedido}
                className={`order-sidebar-card ${order.idPedido === selectedOrder?.idPedido ? "selected" : ""}`}
                onClick={() => {
                  setSelectedOrderId(order.idPedido);
                  setActiveOrderId(order.idPedido);
                }}
              >
                <div className="sidebar-card-top">
                  <strong>Pedido #{order.idPedido}</strong>
                  <span className="sidebar-card-time">{order.fechaHora}</span>
                </div>
                <div className="sidebar-card-status">
                  {getStatusBadge(order.estado)}
                  <span className="sidebar-card-total">S/ {order.total.toFixed(2)}</span>
                </div>
                <div className="sidebar-card-items-snippet">
                  {order.items.map((it) => `${it.cantidad}x ${it.nombre}`).join(", ")}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Columna derecha: Detalle y Seguimiento en Tiempo Real del pedido seleccionado */}
        {selectedOrder && (
          <main className="order-live-detail-view">
            <div className="detail-hero-card">
              <div className="detail-hero-top">
                <div>
                  <span className="detail-label">SEGUIMIENTO DE PEDIDO EN TIEMPO REAL</span>
                  <h2>Pedido #{selectedOrder.idPedido}</h2>
                  <span className="detail-meta">
                    Registrado a las {selectedOrder.fechaHora} · {selectedOrder.cliente.distrito}
                  </span>
                </div>
                <div className="detail-status-pill">
                  {getStatusBadge(selectedOrder.estado)}
                </div>
              </div>

              {/* Stepper de progreso estilo PedidosYa */}
              <div className="stepper-section">
                <div className="stepper-progress-bar">
                  <div
                    className="stepper-progress-fill"
                    style={{
                      width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`
                    }}
                  />
                </div>

                <div className="stepper-nodes">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div
                        key={step.key}
                        className={`stepper-node ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                      >
                        <div className="node-icon-circle">{step.icon}</div>
                        <span className="node-text">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedOrder.motorizadoAsignado && (
                <div className="rider-banner">
                  <span className="rider-icon">🛵</span>
                  <div>
                    <strong>Repartidor Asignado: {selectedOrder.motorizadoAsignado}</strong>
                    <p>En ruta hacia {selectedOrder.cliente.direccion}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dos columnas de información: Historial en tiempo real y Datos del pedido */}
            <div className="detail-grid-two-col">
              {/* Historial en tiempo real de estados */}
              <div className="timeline-card">
                <h3>🕒 Historial de Estados en Tiempo Real (Auditoría)</h3>
                <p className="timeline-sub">
                  Registro exacto de qué usuario ejecutó manualmente cada acción en el sistema
                </p>

                <div className="timeline-flow">
                  {selectedOrder.historialEstados.map((h, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-bullet"></div>
                      <div className="timeline-content">
                        <div className="timeline-top">
                          <strong>{h.estado}</strong>
                          <span className="timeline-timestamp">{h.fechaHora}</span>
                        </div>
                        <span className="timeline-agent">👤 Registrado por: {h.usuario}</span>
                        {h.nota && <p className="timeline-note">"{h.nota}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desglose de platos y comprobante */}
              <div className="receipt-card">
                <div className="receipt-header">
                  <h3>🧾 Detalle y Comprobante</h3>
                  <span className="receipt-id">{selectedOrder.comprobante?.idComprobante}</span>
                </div>

                <div className="receipt-address-box">
                  <div className="r-row">
                    <span>Destinatario:</span>
                    <strong>{selectedOrder.cliente.nombre}</strong>
                  </div>
                  <div className="r-row">
                    <span>Teléfono:</span>
                    <strong>{selectedOrder.cliente.telefono}</strong>
                  </div>
                  <div className="r-row">
                    <span>Dirección:</span>
                    <strong>
                      {selectedOrder.cliente.direccion}
                      {selectedOrder.cliente.referencia ? ` (${selectedOrder.cliente.referencia})` : ""}
                    </strong>
                  </div>
                  <div className="r-row">
                    <span>Método de pago:</span>
                    <strong>{selectedOrder.metodoPago}</strong>
                  </div>
                </div>

                <div className="receipt-items-table">
                  <h4>Platos ordenados</h4>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="receipt-item-row">
                      <div className="item-name-col">
                        <span className="item-qty">{item.cantidad}x</span>
                        <span className="item-title">{item.nombre}</span>
                        {item.observaciones && (
                          <span className="item-note">Nota: {item.observaciones}</span>
                        )}
                      </div>
                      <div className="item-price-col">
                        S/ {(item.precio * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="receipt-totals-box">
                  <div className="r-calc-row">
                    <span>Subtotal platos:</span>
                    <span>S/ {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="r-calc-row">
                    <span>Delivery ({selectedOrder.cliente.distrito}):</span>
                    <span>S/ {selectedOrder.costoEnvio.toFixed(2)}</span>
                  </div>
                  <div className="r-calc-row r-total">
                    <span>Total:</span>
                    <span>S/ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="print-ticket-btn"
                  onClick={() => window.print()}
                >
                  🖨️ Imprimir Comprobante Four Seas
                </button>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
