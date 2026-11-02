import React, { useState } from "react";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";

export const StaffDashboardPage: React.FC = () => {
  const { orders, updateOrderStatus, assignMotorizado } = useOrders();
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthModalTab } = useAuth();

  // El administrador puede supervisar todas las áreas; los demás roles están estrictamente bloqueados a su área
  const [adminSupervisedArea, setAdminSupervisedArea] = useState<"RECEPCION" | "COCINA" | "MOTORIZADO" | "ADMINISTRADOR">("ADMINISTRADOR");

  const [selectedMotorizado, setSelectedMotorizado] = useState("Pedro Quispe (Moto 02)");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const MOTORIZADOS_FLOTA = [
    "Pedro Quispe (Moto 02)",
    "Juan Carlos Rojas (Moto 05)",
    "Luis Mendoza (Moto 07)"
  ];

  // 1. Verificación: Si no ha iniciado sesión, bloquear acceso
  if (!isAuthenticated || !user) {
    return (
      <div className="access-denied-card">
        <div className="denied-icon">🔒</div>
        <h2>Acceso Restringido al Personal</h2>
        <p>Debes iniciar sesión con una cuenta autorizada de Four Seas para ingresar a las operaciones del restaurante.</p>
        <button
          className="btn-action-primary"
          style={{ maxWidth: 260, margin: "1rem auto 0" }}
          onClick={() => {
            setAuthModalTab("login");
            setIsAuthModalOpen(true);
          }}
        >
          Iniciar Sesión como Personal
        </button>
      </div>
    );
  }

  // 2. Verificación: Si es CLIENTE, no tiene permiso para ver estaciones de trabajo internas
  if (user.rol === "CLIENTE") {
    return (
      <div className="access-denied-card">
        <div className="denied-icon">⛔</div>
        <h2>Área Exclusiva de Personal</h2>
        <p>
          Tu cuenta actual está registrada como <strong>CLIENTE</strong>. Esta sección es de uso interno para la cocina, recepción y motorizados.
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.88rem", color: "var(--gray-500)" }}>
          Para dar seguimiento a tus platos pedidos, ingresa a la pestaña <strong>"📦 Mis Pedidos"</strong>.
        </p>
      </div>
    );
  }

  // Área activa según el rol estricto del usuario
  const activeArea = user.rol === "ADMINISTRADOR" ? adminSupervisedArea : user.rol;

  // Cálculos estadísticos para el Administrador
  const totalVentas = orders.reduce((sum, o) => sum + (o.estado !== "CANCELADO" ? o.total : 0), 0);
  const pedidosActivos = orders.filter((o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO").length;
  const ticketPromedio = orders.length > 0 ? totalVentas / orders.length : 0;

  // Filtros por estación
  const pedidosRecepcion = orders.filter((o) => o.estado === "PENDIENTE" || o.estado === "LISTO_PARA_ENTREGA");
  const pedidosCocina = orders.filter((o) => o.estado === "EN_PREPARACION");
  const pedidosMotorizado = orders.filter((o) => o.estado === "LISTO_PARA_ENTREGA" || o.estado === "EN_CAMINO");

  return (
    <div className="staff-dashboard-page">
      {actionFeedback && (
        <div className="staff-feedback-banner">
          {actionFeedback}
        </div>
      )}

      <div className="staff-header">
        <div>
          <span className="station-role-badge role-{user.rol.toLowerCase()}">
            ESTACIÓN ASIGNADA: {user.rol}
          </span>
          <h2>Operador: {user.nombreCompleto}</h2>
          <p className="staff-subtitle">
            Panel operativo exclusivo para tu función en Four Seas International House S.A.C.
          </p>
        </div>

        {/* Únicamente el Administrador tiene permiso para supervisar otras estaciones */}
        {user.rol === "ADMINISTRADOR" && (
          <div className="staff-role-switcher">
            <span className="role-switch-title">Supervisar Estación:</span>
            <div className="role-pills">
              <button
                className={`role-pill ${adminSupervisedArea === "ADMINISTRADOR" ? "active" : ""}`}
                onClick={() => setAdminSupervisedArea("ADMINISTRADOR")}
              >
                👑 Resumen Ejecutivo
              </button>
              <button
                className={`role-pill ${adminSupervisedArea === "RECEPCION" ? "active" : ""}`}
                onClick={() => setAdminSupervisedArea("RECEPCION")}
              >
                🛎️ Recepción ({pedidosRecepcion.length})
              </button>
              <button
                className={`role-pill ${adminSupervisedArea === "COCINA" ? "active" : ""}`}
                onClick={() => setAdminSupervisedArea("COCINA")}
              >
                🍳 Cocina Wok ({pedidosCocina.length})
              </button>
              <button
                className={`role-pill ${adminSupervisedArea === "MOTORIZADO" ? "active" : ""}`}
                onClick={() => setAdminSupervisedArea("MOTORIZADO")}
              >
                🛵 Motorizado ({pedidosMotorizado.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ESTACIÓN: RECEPCIÓN (Visible únicamente para RECEPCIÓN y ADMIN)
          ========================================================================= */}
      {activeArea === "RECEPCION" && (
        <section className="staff-section">
          <div className="section-intro">
            <h3>🛎️ Estación de Recepción y Toma de Pedidos</h3>
            <p>
              Revisa los pedidos nuevos entrantes (PENDIENTE), comunícate si es necesario y pulsa <strong>"🔥 Confirmar y Enviar a Cocina"</strong> para que los cocineros inicien la preparación.
            </p>
          </div>

          <div className="staff-cards-grid">
            {pedidosRecepcion.length === 0 ? (
              <div className="staff-empty-state">
                <span className="state-icon">✅</span>
                <h4>No hay pedidos pendientes para Recepción</h4>
                <p>Todos los pedidos recibidos ya han sido enviados a cocina o despachados.</p>
              </div>
            ) : (
              pedidosRecepcion.map((order) => (
                <div key={order.idPedido} className="staff-order-card">
                  <div className="card-top-bar">
                    <span className="order-number">Pedido #{order.idPedido}</span>
                    <span className={`badge-state state-${order.estado.toLowerCase()}`}>
                      {order.estado}
                    </span>
                  </div>

                  <div className="card-customer-info">
                    <strong>{order.cliente.nombre} · 📞 {order.cliente.telefono}</strong>
                    <p>📍 {order.cliente.direccion} ({order.cliente.distrito})</p>
                    {order.cliente.referencia && <p className="text-muted">Ref: {order.cliente.referencia}</p>}
                    <span className="payment-tag">
                      Pago: {order.metodoPago} {order.montoEfectivo ? `(Paga con: ${order.montoEfectivo})` : ""} · Total: S/ {order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="card-items-list">
                    <strong>Platos pedidos:</strong>
                    <ul>
                      {order.items.map((it, idx) => (
                        <li key={idx}>
                          <span><strong>{it.cantidad}x</strong> {it.nombre}</span>
                          {it.observaciones && <span className="spec-note">⚠️ {it.observaciones}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.estado === "PENDIENTE" && (
                    <div className="card-actions-row">
                      <button
                        className="btn-action-primary"
                        onClick={() => {
                          const agentName = `${user.nombreCompleto} (Recepción)`;
                          updateOrderStatus(
                            order.idPedido,
                            "EN_PREPARACION",
                            agentName,
                            "Recepción confirmó el pedido y envió la comanda a la estación de wok"
                          );
                          triggerFeedback(`✓ Pedido #${order.idPedido} enviado a Cocina por ${agentName}`);
                        }}
                      >
                        🔥 Confirmar y Enviar a Cocina
                      </button>
                      <button
                        className="btn-action-danger"
                        onClick={() => {
                          const agentName = `${user.nombreCompleto} (Recepción)`;
                          updateOrderStatus(
                            order.idPedido,
                            "CANCELADO",
                            agentName,
                            "Pedido cancelado por recepción"
                          );
                          triggerFeedback(`✕ Pedido #${order.idPedido} cancelado`);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {order.estado === "LISTO_PARA_ENTREGA" && (
                    <div className="dispatch-action-box">
                      <label>🥡 ¡Cocina ya preparó este pedido! Asigna el motorizado para salida:</label>
                      <div className="assign-row">
                        <select
                          value={order.motorizadoAsignado || selectedMotorizado}
                          onChange={(e) => setSelectedMotorizado(e.target.value)}
                        >
                          {MOTORIZADOS_FLOTA.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <button
                          className="btn-action-primary"
                          onClick={() => {
                            const agentName = `${user.nombreCompleto} (Recepción)`;
                            assignMotorizado(order.idPedido, selectedMotorizado, agentName);
                            updateOrderStatus(
                              order.idPedido,
                              "EN_CAMINO",
                              agentName,
                              `Despachado manualmente con ${selectedMotorizado}`
                            );
                            triggerFeedback(`🛵 Pedido #${order.idPedido} despachado en ruta con ${selectedMotorizado}`);
                          }}
                        >
                          🛵 Despachar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          ESTACIÓN: COCINA WOK (KDS) (Visible únicamente para COCINA y ADMIN)
          ========================================================================= */}
      {activeArea === "COCINA" && (
        <section className="staff-section">
          <div className="section-intro">
            <h3>🍳 Pantalla de Cocina al Wok (KDS)</h3>
            <p>
              Comandas en los fogones. Prepara los platos con las especificaciones del cliente y al terminar pulsa <strong>"🥡 ¡Listo para Entrega!"</strong>.
            </p>
          </div>

          <div className="staff-cards-grid kds-grid">
            {pedidosCocina.length === 0 ? (
              <div className="staff-empty-state">
                <span className="state-icon">🍜</span>
                <h4>No hay comandas en los fogones</h4>
                <p>Esperando que Recepción confirme y envíe nuevos pedidos a cocina.</p>
              </div>
            ) : (
              pedidosCocina.map((order) => (
                <div key={order.idPedido} className="kds-order-card">
                  <div className="kds-card-header">
                    <div>
                      <span className="kds-order-id">ORDEN #{order.idPedido}</span>
                      <span className="kds-time">Ingresó: {order.fechaHora}</span>
                    </div>
                    <span className="kds-flame">🔥 EN EL WOK</span>
                  </div>

                  <div className="kds-dishes-list">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="kds-dish-row">
                        <span className="kds-dish-qty">{it.cantidad}x</span>
                        <div className="kds-dish-info">
                          <strong className="kds-dish-name">{it.nombre}</strong>
                          {it.observaciones && (
                            <span className="kds-dish-note">⚠️ Nota: {it.observaciones}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn-kds-finish"
                    onClick={() => {
                      const chefName = `${user.nombreCompleto} (Cocina)`;
                      updateOrderStatus(
                        order.idPedido,
                        "LISTO_PARA_ENTREGA",
                        chefName,
                        "Platos salteados al wok y empaquetados en estación de salida"
                      );
                      triggerFeedback(`🥡 Pedido #${order.idPedido} marcado como LISTO por ${chefName}`);
                    }}
                  >
                    🥡 ¡Terminado y Listo para Despacho!
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          ESTACIÓN: MOTORIZADO (Visible únicamente para MOTORIZADO y ADMIN)
          ========================================================================= */}
      {activeArea === "MOTORIZADO" && (
        <section className="staff-section">
          <div className="section-intro">
            <h3>🛵 Panel de Entregas y Reparto a Domicilio</h3>
            <p>
              Recoge el pedido en barra, pulsa <strong>"🚀 Iniciar Ruta"</strong> y al entregarlo en mano al cliente pulsa <strong>"✅ Confirmar Entrega Realizada"</strong>.
            </p>
          </div>

          <div className="staff-cards-grid">
            {pedidosMotorizado.length === 0 ? (
              <div className="staff-empty-state">
                <span className="state-icon">🛵</span>
                <h4>No tienes pedidos asignados en este momento</h4>
                <p>Todos los pedidos asignados a tu moto ya fueron entregados.</p>
              </div>
            ) : (
              pedidosMotorizado.map((order) => (
                <div key={order.idPedido} className="rider-card">
                  <div className="rider-card-top">
                    <span className="rider-order-id">Orden #{order.idPedido}</span>
                    <span className={`badge-state state-${order.estado.toLowerCase()}`}>
                      {order.estado === "LISTO_PARA_ENTREGA" ? "🥡 Listo en Local" : "🛵 En tu moto"}
                    </span>
                  </div>

                  <div className="rider-delivery-target">
                    <h4>📍 Dirección de Entrega:</h4>
                    <p className="target-address">{order.cliente.direccion}</p>
                    {order.cliente.referencia && (
                      <p className="target-ref">Ref: {order.cliente.referencia}</p>
                    )}
                    <span className="target-zone">{order.cliente.distrito}</span>
                  </div>

                  <div className="rider-contact-row">
                    <span>Cliente: <strong>{order.cliente.nombre}</strong></span>
                    <a
                      href={`tel:${order.cliente.telefono}`}
                      className="call-client-btn"
                    >
                      📞 Llamar ({order.cliente.telefono})
                    </a>
                  </div>

                  <div className="rider-payment-box">
                    <span>Monto a cobrar:</span>
                    <strong>S/ {order.total.toFixed(2)} ({order.metodoPago})</strong>
                  </div>

                  <div className="rider-actions">
                    {order.estado === "LISTO_PARA_ENTREGA" ? (
                      <button
                        className="btn-action-primary"
                        onClick={() => {
                          const riderName = `${user.nombreCompleto} (Motorizado)`;
                          updateOrderStatus(
                            order.idPedido,
                            "EN_CAMINO",
                            riderName,
                            "Motorizado recogió el pedido del restaurante y va en camino al domicilio"
                          );
                          triggerFeedback(`🚀 Pedido #${order.idPedido} puesto en ruta por ${riderName}`);
                        }}
                      >
                        🚀 Iniciar Ruta de Entrega
                      </button>
                    ) : (
                      <button
                        className="btn-action-success"
                        onClick={() => {
                          const riderName = `${user.nombreCompleto} (Motorizado)`;
                          updateOrderStatus(
                            order.idPedido,
                            "ENTREGADO",
                            riderName,
                            "Pedido entregado en mano al cliente y pago verificado"
                          );
                          triggerFeedback(`✅ Pedido #${order.idPedido} confirmado como ENTREGADO`);
                        }}
                      >
                        ✅ Confirmar Entrega Realizada
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          ESTACIÓN: ADMINISTRADOR (Visible únicamente para ADMINISTRADOR)
          ========================================================================= */}
      {activeArea === "ADMINISTRADOR" && (
        <section className="staff-section">
          <div className="section-intro">
            <h3>👑 Panel Ejecutivo de Administración y Auditoría</h3>
            <p>Métricas consolidadas, auditoría de estados de pedidos en tiempo real y supervisión operativa.</p>
          </div>

          {/* Tarjetas de métricas del restaurante */}
          <div className="metrics-dashboard-grid">
            <div className="metric-box">
              <span className="metric-icon">💰</span>
              <div className="metric-data">
                <span className="metric-label">Ventas Totales</span>
                <strong className="metric-val">S/ {totalVentas.toFixed(2)}</strong>
              </div>
            </div>

            <div className="metric-box">
              <span className="metric-icon">📦</span>
              <div className="metric-data">
                <span className="metric-label">Pedidos Registrados</span>
                <strong className="metric-val">{orders.length} pedidos</strong>
              </div>
            </div>

            <div className="metric-box">
              <span className="metric-icon">⏳</span>
              <div className="metric-data">
                <span className="metric-label">En Curso Ahora</span>
                <strong className="metric-val">{pedidosActivos} activos</strong>
              </div>
            </div>

            <div className="metric-box">
              <span className="metric-icon">📈</span>
              <div className="metric-data">
                <span className="metric-label">Ticket Promedio</span>
                <strong className="metric-val">S/ {ticketPromedio.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Tabla de auditoría de pedidos */}
          <div className="admin-orders-table-card">
            <h4>📋 Auditoría de Todos los Pedidos (PostgreSQL Schema)</h4>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Distrito</th>
                    <th>Platos</th>
                    <th>Pago</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Última Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const lastEvent = o.historialEstados[o.historialEstados.length - 1];
                    return (
                      <tr key={o.idPedido}>
                        <td><strong>#{o.idPedido}</strong></td>
                        <td>{o.fechaHora}</td>
                        <td>{o.cliente.nombre}</td>
                        <td>{o.cliente.distrito}</td>
                        <td>{o.items.map((it) => `${it.cantidad}x ${it.nombre}`).join(", ")}</td>
                        <td>{o.metodoPago}</td>
                        <td><strong>S/ {o.total.toFixed(2)}</strong></td>
                        <td>
                          <span className={`badge-state state-${o.estado.toLowerCase()}`}>
                            {o.estado}
                          </span>
                        </td>
                        <td className="last-action-col">
                          <small>{lastEvent?.usuario || "Sistema"}</small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
