import React, { useState, useMemo } from "react";
import { useOrders } from "../context/OrderContext";
import type { Order, OrderStatus } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { DailyCashClosureModal } from "../components/DailyCashClosureModal";
import { StockManagementModal } from "../components/StockManagementModal";
import { DeliveryZonesModal } from "../components/DeliveryZonesModal";
import { PaymentReceiptModal } from "../components/PaymentReceiptModal";
import { useStore } from "../context/StoreContext";

export const StaffDashboardPage: React.FC = () => {
  const { orders, updateOrderStatus, assignMotorizado } = useOrders();
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthModalTab } = useAuth();
  const { isStoreOpen, toggleStoreOpen, outOfStockCount, deliveryZones } = useStore();

  // Navegación de supervisión (El administrador supervisa todo; los demás roles están fijos a su estación)
  const [adminSupervisedArea, setAdminSupervisedArea] = useState<
    "ADMINISTRADOR" | "RECEPCION" | "COCINA" | "MOTORIZADO"
  >("ADMINISTRADOR");

  // Modales operativos
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isZonesModalOpen, setIsZonesModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Filtros de la tabla de auditoría para el Administrador
  const [auditSearch, setAuditSearch] = useState("");
  const [auditStatusFilter, setAuditStatusFilter] = useState<"TODOS" | OrderStatus>("TODOS");
  const [auditPaymentFilter, setAuditPaymentFilter] = useState<"TODOS" | "EFECTIVO" | "DIGITAL" | "TARJETA">("TODOS");

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

  // 2. Verificación: Si es CLIENTE, bloquear acceso operativo
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

  const activeArea = user.rol === "ADMINISTRADOR" ? adminSupervisedArea : user.rol;

  // Métricas financieras
  const nonCanceledOrders = orders.filter((o) => o.estado !== "CANCELADO");
  const deliveredOrders = orders.filter((o) => o.estado === "ENTREGADO");
  const canceledOrders = orders.filter((o) => o.estado === "CANCELADO");
  const pedidosActivos = orders.filter((o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO").length;

  const totalVentas = nonCanceledOrders.reduce((sum, o) => sum + o.total, 0);
  const ticketPromedio = orders.length > 0 ? totalVentas / (nonCanceledOrders.length || 1) : 0;

  const totalEfectivo = nonCanceledOrders
    .filter((o) => o.metodoPago.toUpperCase().includes("EFECTIVO") || o.metodoPago.toUpperCase().includes("CONTRAENTREGA"))
    .reduce((sum, o) => sum + o.total, 0);

  const totalYapePlin = nonCanceledOrders
    .filter((o) => o.metodoPago.toUpperCase().includes("YAPE") || o.metodoPago.toUpperCase().includes("PLIN") || o.metodoPago.toUpperCase().includes("BILLETERA"))
    .reduce((sum, o) => sum + o.total, 0);

  const totalTarjeta = nonCanceledOrders
    .filter((o) => o.metodoPago.toUpperCase().includes("TARJETA") || o.metodoPago.toUpperCase().includes("POS") || o.metodoPago.toUpperCase().includes("VISA"))
    .reduce((sum, o) => sum + o.total, 0);

  // Filtros por estación
  const pedidosRecepcion = orders.filter((o) => o.estado === "PENDIENTE" || o.estado === "LISTO_PARA_ENTREGA");
  const pedidosCocina = orders.filter((o) => o.estado === "EN_PREPARACION");
  const pedidosMotorizado = orders.filter((o) => o.estado === "LISTO_PARA_ENTREGA" || o.estado === "EN_CAMINO");

  // Conteo por etapas de la pipeline en tiempo real
  const countPendientes = orders.filter((o) => o.estado === "PENDIENTE").length;
  const countPreparacion = orders.filter((o) => o.estado === "EN_PREPARACION").length;
  const countListos = orders.filter((o) => o.estado === "LISTO_PARA_ENTREGA").length;
  const countCamino = orders.filter((o) => o.estado === "EN_CAMINO").length;
  const countEntregados = orders.filter((o) => o.estado === "ENTREGADO").length;

  // Filtrado reactivo de pedidos para la tabla de auditoría del Administrador
  const filteredAuditOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Filtro de estado
      if (auditStatusFilter !== "TODOS" && o.estado !== auditStatusFilter) {
        return false;
      }

      // 2. Filtro de método de pago
      if (auditPaymentFilter === "EFECTIVO" && !o.metodoPago.toUpperCase().includes("EFECTIVO")) return false;
      if (auditPaymentFilter === "DIGITAL" && (!o.metodoPago.toUpperCase().includes("YAPE") && !o.metodoPago.toUpperCase().includes("PLIN"))) return false;
      if (auditPaymentFilter === "TARJETA" && (!o.metodoPago.toUpperCase().includes("TARJETA") && !o.metodoPago.toUpperCase().includes("POS") && !o.metodoPago.toUpperCase().includes("VISA"))) return false;

      // 3. Búsqueda por texto (ID, Cliente, Teléfono, Distrito, Platos)
      if (auditSearch.trim()) {
        const query = auditSearch.trim().toLowerCase();
        const matchId = o.idPedido.toString().includes(query);
        const matchName = o.cliente.nombre.toLowerCase().includes(query);
        const matchPhone = o.cliente.telefono.includes(query);
        const matchDistrict = o.cliente.distrito.toLowerCase().includes(query);
        const matchDish = o.items.some((it) => it.nombre.toLowerCase().includes(query));
        return matchId || matchName || matchPhone || matchDistrict || matchDish;
      }

      return true;
    });
  }, [orders, auditStatusFilter, auditPaymentFilter, auditSearch]);

  // Descarga de Excel/CSV en 1 clic
  const handleQuickExportCSV = () => {
    let csv = "\uFEFF";
    csv += "FOUR SEAS INTERNATIONAL HOUSE S.A.C.;RUC: 20601234567\n";
    csv += `REPORTE CONSOLIDADO DE PEDIDOS;Emisión:;${new Date().toLocaleDateString("es-PE")} ${new Date().toLocaleTimeString("es-PE")}\n\n`;
    csv += "ID Pedido;Hora;Cliente;Teléfono;Distrito;Dirección;Método Pago;Subtotal (S/);Envío (S/);Total (S/);Estado;Motorizado;Comprobante\n";
    orders.forEach((o) => {
      csv += `"${o.idPedido}";"${o.fechaHora}";"${o.cliente.nombre}";"${o.cliente.telefono}";"${o.cliente.distrito}";"${o.cliente.direccion}";"${o.metodoPago}";"${o.subtotal.toFixed(2)}";"${o.costoEnvio.toFixed(2)}";"${o.total.toFixed(2)}";"${o.estado}";"${o.motorizadoAsignado || "N/A"}";"${o.comprobante?.idComprobante || "N/A"}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FourSeas_Pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerFeedback("📥 Reporte descargado en formato CSV para Microsoft Excel.");
  };

  return (
    <div className="staff-dashboard-page">
      {actionFeedback && (
        <div className="staff-feedback-banner">
          {actionFeedback}
        </div>
      )}

      {/* =========================================================================
          ENCABEZADO EMPRESARIAL / CENTRO DE MANDO (ESTILO UBER EATS / TOAST POS)
          ========================================================================= */}
      <header className="pro-command-header">
        <div className="command-brand-block">
          <div className="brand-crest">🏮</div>
          <div className="brand-details">
            <div className="brand-title-line">
              <h2>FOUR SEAS INTERNATIONAL HOUSE</h2>
              <span className="hq-tag">SEDE CENTRAL SAN MIGUEL</span>
            </div>
            <p className="command-meta">
              Panel Operativo Central · Operador: <strong>{user.nombreCompleto}</strong> (
              <span className={`role-text-badge role-${user.rol.toLowerCase()}`}>{user.rol}</span>)
            </p>
          </div>
        </div>

        {/* Acciones Rápidas del Restaurante */}
        <div className="command-quick-actions">
          {/* Switch de Tienda Abierta / Cerrada */}
          <div className="store-live-switch-card">
            <span className="switch-prelabel">ESTADO DE TIENDA:</span>
            <button
              type="button"
              className={`pro-store-toggle ${isStoreOpen ? "is-open" : "is-paused"}`}
              onClick={() => {
                if (user.rol === "ADMINISTRADOR") {
                  toggleStoreOpen();
                  triggerFeedback(isStoreOpen ? "🔴 Restaurante en PAUSA OPERATIVA" : "🟢 Restaurante ABIERTO");
                } else {
                  triggerFeedback("🔒 Solo el Administrador puede modificar la apertura del restaurante.");
                }
              }}
              title={user.rol === "ADMINISTRADOR" ? "Clic para cambiar estado" : "Estado del restaurante"}
            >
              <span className="pulse-dot"></span>
              <strong>{isStoreOpen ? "ABIERTO" : "EN PAUSA"}</strong>
            </button>
          </div>

          {/* Botones de Gestión */}
          <div className="command-buttons-cluster">
            <button
              type="button"
              className={`pro-cmd-btn btn-cmd-stock ${outOfStockCount > 0 ? "has-soldout" : ""}`}
              onClick={() => setIsStockModalOpen(true)}
              title="Agotar o habilitar platos en 1 clic"
            >
              <span>🥡 Stock & Carta</span>
              <span className="cmd-badge">
                {outOfStockCount > 0 ? `${outOfStockCount} agotados` : "100% OK"}
              </span>
            </button>

            {user.rol === "ADMINISTRADOR" && (
              <>
                <button
                  type="button"
                  className="pro-cmd-btn btn-cmd-zones"
                  onClick={() => setIsZonesModalOpen(true)}
                  title="Configurar tarifas por distrito y fletes"
                >
                  <span>📍 Zonas & Fletes</span>
                  <span className="cmd-badge">{deliveryZones.filter((z) => z.activa).length}</span>
                </button>

                <button
                  type="button"
                  className="pro-cmd-btn btn-cmd-cash"
                  onClick={() => setIsClosureModalOpen(true)}
                  title="Arqueo de caja y liquidación del día"
                >
                  <span>💵 Cierre de Caja</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          SELECTOR DE ESTACIÓN OPERATIVA (EXCLUSIVO ADMINISTRADOR)
          ========================================================================= */}
      {user.rol === "ADMINISTRADOR" && (
        <nav className="pro-station-nav-bar">
          <div className="station-nav-title">
            <span className="icon">🎛️</span>
            <strong>Supervisar Estación de Trabajo:</strong>
          </div>
          <div className="station-nav-pills">
            <button
              className={`station-pill ${adminSupervisedArea === "ADMINISTRADOR" ? "active" : ""}`}
              onClick={() => setAdminSupervisedArea("ADMINISTRADOR")}
            >
              👑 Panel Ejecutivo & Auditoría
            </button>
            <button
              className={`station-pill ${adminSupervisedArea === "RECEPCION" ? "active" : ""}`}
              onClick={() => setAdminSupervisedArea("RECEPCION")}
            >
              🛎️ Recepción
              {pedidosRecepcion.length > 0 && (
                <span className="pill-alert-count count-amber">{pedidosRecepcion.length}</span>
              )}
            </button>
            <button
              className={`station-pill ${adminSupervisedArea === "COCINA" ? "active" : ""}`}
              onClick={() => setAdminSupervisedArea("COCINA")}
            >
              🍳 Cocina Wok (KDS)
              {pedidosCocina.length > 0 && (
                <span className="pill-alert-count count-red">{pedidosCocina.length}</span>
              )}
            </button>
            <button
              className={`station-pill ${adminSupervisedArea === "MOTORIZADO" ? "active" : ""}`}
              onClick={() => setAdminSupervisedArea("MOTORIZADO")}
            >
              🛵 Flota Repartidores
              {pedidosMotorizado.length > 0 && (
                <span className="pill-alert-count count-blue">{pedidosMotorizado.length}</span>
              )}
            </button>
          </div>
        </nav>
      )}

      {/* =========================================================================
          ESTACIÓN: ADMINISTRADOR (VISIÓN EJECUTIVA COMPLETA)
          ========================================================================= */}
      {activeArea === "ADMINISTRADOR" && (
        <div className="pro-admin-workspace">
          {/* 1. Tarjetas de Métricas Principales */}
          <div className="kpi-executive-grid">
            <div className="kpi-exec-card card-revenue">
              <div className="kpi-top">
                <span className="kpi-label">Ventas Brutas del Turno</span>
                <span className="kpi-icon-bubble">💰</span>
              </div>
              <strong className="kpi-big-num">S/ {totalVentas.toFixed(2)}</strong>
              <div className="kpi-bottom-meta">
                <span>Ticket promedio: <strong>S/ {ticketPromedio.toFixed(2)}</strong></span>
              </div>
            </div>

            <div className="kpi-exec-card card-orders">
              <div className="kpi-top">
                <span className="kpi-label">Volumen de Pedidos</span>
                <span className="kpi-icon-bubble">📦</span>
              </div>
              <strong className="kpi-big-num">{orders.length} pedidos</strong>
              <div className="kpi-bottom-meta">
                <span className="text-success">✅ {deliveredOrders.length} entregados</span>
                {canceledOrders.length > 0 && (
                  <span className="text-danger"> · {canceledOrders.length} cancelados</span>
                )}
              </div>
            </div>

            <div className="kpi-exec-card card-active">
              <div className="kpi-top">
                <span className="kpi-label">Operación Activa Ahora</span>
                <span className="kpi-icon-bubble">⏳</span>
              </div>
              <strong className="kpi-big-num">{pedidosActivos} en curso</strong>
              <div className="kpi-bottom-meta">
                <span>{countPreparacion} en fogón · {countCamino} en ruta</span>
              </div>
            </div>

            <div className="kpi-exec-card card-cash">
              <div className="kpi-top">
                <span className="kpi-label">Recaudación por Canal</span>
                <span className="kpi-icon-bubble">💳</span>
              </div>
              <div className="kpi-channels-list">
                <div className="chan-row">
                  <span>💵 Gaveta:</span>
                  <strong>S/ {totalEfectivo.toFixed(2)}</strong>
                </div>
                <div className="chan-row">
                  <span>📱 Yape/Plin:</span>
                  <strong>S/ {totalYapePlin.toFixed(2)}</strong>
                </div>
                <div className="chan-row">
                  <span>💳 Tarjetas:</span>
                  <strong>S/ {totalTarjeta.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Embudo Operativo en Tiempo Real (Live Pipeline Bar) */}
          <div className="live-pipeline-card">
            <div className="pipeline-header">
              <div className="pipe-title">
                <span className="pipe-icon">⚡</span>
                <h4>Embudo de Producción y Delivery en Vivo</h4>
              </div>
              <span className="pipe-hint">Haz clic en cualquier fase para filtrar la tabla de auditoría:</span>
            </div>

            <div className="pipeline-steps-bar">
              <button
                type="button"
                className={`pipe-step ${auditStatusFilter === "PENDIENTE" ? "selected" : ""}`}
                onClick={() => setAuditStatusFilter(auditStatusFilter === "PENDIENTE" ? "TODOS" : "PENDIENTE")}
              >
                <div className="step-num-badge badge-amber">{countPendientes}</div>
                <div className="step-text">
                  <strong>1. Recepción</strong>
                  <small>Nuevos entrantes</small>
                </div>
              </button>

              <span className="pipe-arrow">➔</span>

              <button
                type="button"
                className={`pipe-step ${auditStatusFilter === "EN_PREPARACION" ? "selected" : ""}`}
                onClick={() => setAuditStatusFilter(auditStatusFilter === "EN_PREPARACION" ? "TODOS" : "EN_PREPARACION")}
              >
                <div className="step-num-badge badge-orange">{countPreparacion}</div>
                <div className="step-text">
                  <strong>2. En Cocina</strong>
                  <small>Wok y salteados</small>
                </div>
              </button>

              <span className="pipe-arrow">➔</span>

              <button
                type="button"
                className={`pipe-step ${auditStatusFilter === "LISTO_PARA_ENTREGA" ? "selected" : ""}`}
                onClick={() => setAuditStatusFilter(auditStatusFilter === "LISTO_PARA_ENTREGA" ? "TODOS" : "LISTO_PARA_ENTREGA")}
              >
                <div className="step-num-badge badge-purple">{countListos}</div>
                <div className="step-text">
                  <strong>3. Empaquetado</strong>
                  <small>Listo en mostrador</small>
                </div>
              </button>

              <span className="pipe-arrow">➔</span>

              <button
                type="button"
                className={`pipe-step ${auditStatusFilter === "EN_CAMINO" ? "selected" : ""}`}
                onClick={() => setAuditStatusFilter(auditStatusFilter === "EN_CAMINO" ? "TODOS" : "EN_CAMINO")}
              >
                <div className="step-num-badge badge-blue">{countCamino}</div>
                <div className="step-text">
                  <strong>4. En Ruta</strong>
                  <small>Con motorizado</small>
                </div>
              </button>

              <span className="pipe-arrow">➔</span>

              <button
                type="button"
                className={`pipe-step ${auditStatusFilter === "ENTREGADO" ? "selected" : ""}`}
                onClick={() => setAuditStatusFilter(auditStatusFilter === "ENTREGADO" ? "TODOS" : "ENTREGADO")}
              >
                <div className="step-num-badge badge-green">{countEntregados}</div>
                <div className="step-text">
                  <strong>5. Entregado</strong>
                  <small>Finalizado con éxito</small>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Tabla de Auditoría con Filtros Avanzados y Buscador */}
          <div className="audit-orders-section-card">
            <div className="audit-card-top">
              <div>
                <h4>📋 Auditoría de Pedidos (Esquema PostgreSQL)</h4>
                <p className="audit-desc">
                  Monitoreo de órdenes en tiempo real, trazabilidad de responsables y emisión de comprobantes de pago.
                </p>
              </div>

              <div className="audit-top-actions">
                <button
                  type="button"
                  className="btn-quick-export"
                  onClick={handleQuickExportCSV}
                  title="Descargar libro de pedidos completo en formato Excel CSV"
                >
                  📥 Exportar a Excel (CSV)
                </button>
                <button
                  type="button"
                  className="btn-quick-cash"
                  onClick={() => setIsClosureModalOpen(true)}
                  title="Abrir liquidación de caja"
                >
                  💵 Arqueo de Caja (Z)
                </button>
              </div>
            </div>

            {/* Barra de Filtros */}
            <div className="audit-filters-bar">
              {/* Buscador inteligente */}
              <div className="audit-search-input-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por N° pedido, cliente, teléfono, distrito o plato..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
                {auditSearch && (
                  <button className="clear-search-btn" onClick={() => setAuditSearch("")}>
                    ✕
                  </button>
                )}
              </div>

              {/* Filtro por estado */}
              <div className="audit-chips-filter">
                <span className="filter-label">Estado:</span>
                {(["TODOS", "PENDIENTE", "EN_PREPARACION", "LISTO_PARA_ENTREGA", "EN_CAMINO", "ENTREGADO", "CANCELADO"] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      className={`audit-chip-btn ${auditStatusFilter === st ? "active" : ""}`}
                      onClick={() => setAuditStatusFilter(st)}
                    >
                      {st === "TODOS" ? `Todos (${orders.length})` : st.replace(/_/g, " ")}
                    </button>
                  )
                )}
              </div>

              {/* Filtro por método de pago */}
              <div className="audit-payment-filter">
                <span className="filter-label">Pago:</span>
                <select
                  value={auditPaymentFilter}
                  onChange={(e) => setAuditPaymentFilter(e.target.value as any)}
                >
                  <option value="TODOS">Todos los Métodos</option>
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="DIGITAL">📱 Yape / Plin</option>
                  <option value="TARJETA">💳 Tarjeta POS</option>
                </select>
              </div>
            </div>

            {/* Tabla Responsive */}
            <div className="table-responsive">
              <table className="pro-audit-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Distrito / Destino</th>
                    <th>Detalle de Comanda</th>
                    <th>Método Pago</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Última Acción</th>
                    <th style={{ textAlign: "center" }}>Comprobante</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="table-empty-row">
                        <span className="empty-icon">🔎</span>
                        <p>No se encontraron pedidos con los filtros seleccionados.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditOrders.map((o) => {
                      const lastEvent = o.historialEstados[o.historialEstados.length - 1];
                      return (
                        <tr key={o.idPedido}>
                          {/* ID Pedido */}
                          <td>
                            <strong className="order-id-badge">#{o.idPedido}</strong>
                          </td>

                          {/* Hora */}
                          <td className="time-cell">{o.fechaHora}</td>

                          {/* Cliente */}
                          <td>
                            <div className="client-data-cell">
                              <strong className="client-name">{o.cliente.nombre}</strong>
                              <a href={`tel:${o.cliente.telefono}`} className="client-phone-link">
                                📞 {o.cliente.telefono}
                              </a>
                            </div>
                          </td>

                          {/* Distrito y Dirección */}
                          <td>
                            <div className="dest-data-cell">
                              <span className="district-pill">{o.cliente.distrito}</span>
                              <span className="address-trunc" title={o.cliente.direccion}>
                                {o.cliente.direccion}
                              </span>
                            </div>
                          </td>

                          {/* Platos */}
                          <td>
                            <div className="dishes-compact-cell">
                              {o.items.map((it, idx) => (
                                <span key={idx} className="dish-item-tag">
                                  <strong>{it.cantidad}x</strong> {it.nombre}
                                  {it.observaciones && <span className="spec-star" title={it.observaciones}> ⚠️</span>}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Pago */}
                          <td>
                            <span className="payment-type-pill">
                              {o.metodoPago}
                            </span>
                          </td>

                          {/* Total */}
                          <td>
                            <strong className="order-total-amount">
                              S/ {o.total.toFixed(2)}
                            </strong>
                          </td>

                          {/* Estado */}
                          <td>
                            <span className={`badge-state state-${o.estado.toLowerCase()}`}>
                              {o.estado.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Auditor / Acción */}
                          <td className="auditor-cell">
                            <small className="audit-user">{lastEvent?.usuario || "Sistema"}</small>
                            {lastEvent?.nota && (
                              <span className="audit-note" title={lastEvent.nota}>
                                {lastEvent.nota.slice(0, 32)}...
                              </span>
                            )}
                          </td>

                          {/* Comprobante */}
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="btn-audit-receipt"
                              onClick={() => setSelectedOrderForReceipt(o)}
                              title="Previsualizar e imprimir Boleta de Venta Electrónica oficial"
                            >
                              🧾 Boleta
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="audit-table-footer">
              <span>
                Mostrando <strong>{filteredAuditOrders.length}</strong> de <strong>{orders.length}</strong> pedidos registrados
              </span>
              <span className="sunat-legal-tag">
                ✓ Validado con RUC 20601234567 · SUNAT Facturación Electrónica
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ESTACIÓN: RECEPCIÓN (Visible para RECEPCIÓN y ADMIN en pestaña)
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
          ESTACIÓN: COCINA WOK (KDS) (Visible para COCINA y ADMIN en pestaña)
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
          ESTACIÓN: MOTORIZADO (Visible para MOTORIZADO y ADMIN en pestaña)
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
          MODALES DE ADMINISTRACIÓN Y REPORTES
          ========================================================================= */}

      {/* Modal de Arqueo y Cierre de Caja Diario (Reporte Z) */}
      {user && user.rol === "ADMINISTRADOR" && (
        <DailyCashClosureModal
          isOpen={isClosureModalOpen}
          onClose={() => setIsClosureModalOpen(false)}
          orders={orders}
          adminUser={{
            nombreCompleto: user.nombreCompleto,
            nombreUsuario: user.nombreUsuario
          }}
        />
      )}

      {/* Modal de Control de Stock y Estado del Restaurante */}
      <StockManagementModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
      />

      {/* Modal de Configuración de Zonas de Delivery y Tiempos */}
      <DeliveryZonesModal
        isOpen={isZonesModalOpen}
        onClose={() => setIsZonesModalOpen(false)}
      />

      {/* Modal de Comprobante / Boleta de Venta Electrónica */}
      {selectedOrderForReceipt && (
        <PaymentReceiptModal
          order={selectedOrderForReceipt}
          isOpen={!!selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
};
