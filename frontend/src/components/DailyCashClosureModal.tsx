import React, { useState } from "react";
import type { Order } from "../context/OrderContext";

interface DailyCashClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  adminUser: {
    nombreCompleto: string;
    nombreUsuario: string;
  };
}

export interface CashClosureRecord {
  idCierre: string;
  fecha: string;
  hora: string;
  responsable: string;
  totalVentas: number;
  totalEfectivo: number;
  totalYapePlin: number;
  totalTarjeta: number;
  totalPedidos: number;
  efectivoContado: number;
  diferenciaCaja: number;
  notas: string;
}

export const DailyCashClosureModal: React.FC<DailyCashClosureModalProps> = ({
  isOpen,
  onClose,
  orders,
  adminUser
}) => {
  const [efectivoFisicoInput, setEfectivoFisicoInput] = useState<string>("");
  const [closureNotes, setClosureNotes] = useState<string>("");
  const [closureSaved, setClosureSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"resumen" | "motorizados" | "ticket">("resumen");

  if (!isOpen) return null;

  const now = new Date();
  const fechaHoy = now.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const horaCierre = now.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const serieCierre = `Z-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-01`;

  // Cálculos de liquidación
  const nonCanceledOrders = orders.filter((o) => o.estado !== "CANCELADO");
  const canceledOrders = orders.filter((o) => o.estado === "CANCELADO");
  const deliveredOrders = orders.filter((o) => o.estado === "ENTREGADO");

  const totalVentas = nonCanceledOrders.reduce((sum, o) => sum + o.total, 0);
  const subtotalNeto = nonCanceledOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalEnvios = nonCanceledOrders.reduce((sum, o) => sum + o.costoEnvio, 0);

  // Desglose fiscal SUNAT
  const baseGravada = subtotalNeto / 1.18;
  const igvTotal = subtotalNeto - baseGravada;

  // Desglose por método de pago
  const pedidosEfectivo = nonCanceledOrders.filter(
    (o) => o.metodoPago.toUpperCase().includes("EFECTIVO") || o.metodoPago.toUpperCase().includes("CONTRAENTREGA")
  );
  const pedidosYapePlin = nonCanceledOrders.filter(
    (o) =>
      o.metodoPago.toUpperCase().includes("YAPE") ||
      o.metodoPago.toUpperCase().includes("PLIN") ||
      o.metodoPago.toUpperCase().includes("BILLETERA")
  );
  const pedidosTarjeta = nonCanceledOrders.filter(
    (o) =>
      o.metodoPago.toUpperCase().includes("TARJETA") ||
      o.metodoPago.toUpperCase().includes("POS") ||
      o.metodoPago.toUpperCase().includes("VISA")
  );

  const totalEfectivo = pedidosEfectivo.reduce((sum, o) => sum + o.total, 0);
  const totalYapePlin = pedidosYapePlin.reduce((sum, o) => sum + o.total, 0);
  const totalTarjeta = pedidosTarjeta.reduce((sum, o) => sum + o.total, 0);

  // Desglose de efectivo por motorizado
  const efectivoPorMotorizado: { [key: string]: { total: number; pedidos: Order[] } } = {};
  pedidosEfectivo.forEach((o) => {
    const moto = o.motorizadoAsignado || "Sin asignar / Mostrador";
    if (!efectivoPorMotorizado[moto]) {
      efectivoPorMotorizado[moto] = { total: 0, pedidos: [] };
    }
    efectivoPorMotorizado[moto].total += o.total;
    efectivoPorMotorizado[moto].pedidos.push(o);
  });

  // Cálculo de diferencia de caja física
  const efectivoContadoNum = parseFloat(efectivoFisicoInput) || 0;
  const diferencia = efectivoContadoNum - totalEfectivo;

  // Exportar reporte a Excel/CSV con BOM UTF-8 y delimitador estándar
  const handleExportCSV = () => {
    let csv = "\uFEFF"; // UTF-8 BOM para soporte total con tildes y ñ en Excel
    csv += "FOUR SEAS INTERNATIONAL HOUSE S.A.C.;RUC: 20601234567\n";
    csv += "REPORTE Z DE CIERRE DE CAJA Y ARQUEO DIARIO\n";
    csv += `Serie de Cierre;${serieCierre}\n`;
    csv += `Fecha y Hora;${fechaHoy} ${horaCierre}\n`;
    csv += `Responsable Auditor;${adminUser.nombreCompleto} (${adminUser.nombreUsuario})\n`;
    csv += "\n";

    csv += "1. CONSOLIDADO FINANCIERO DEL DÍA\n";
    csv += "Concepto;Monto (S/);N° Transacciones\n";
    csv += `Ventas Brutas Totales;${totalVentas.toFixed(2)};${nonCanceledOrders.length}\n`;
    csv += `Base Imponible Op. Gravada (18%);${baseGravada.toFixed(2)};-\n`;
    csv += `I.G.V. Total (18%);${igvTotal.toFixed(2)};-\n`;
    csv += `Cargos por Servicio de Delivery;${totalEnvios.toFixed(2)};-\n`;
    csv += `Efectivo Físico a Rendir;${totalEfectivo.toFixed(2)};${pedidosEfectivo.length}\n`;
    csv += `Billeteras Digitales (Yape / Plin);${totalYapePlin.toFixed(2)};${pedidosYapePlin.length}\n`;
    csv += `Tarjetas POS / Crédito / Débito;${totalTarjeta.toFixed(2)};${pedidosTarjeta.length}\n`;
    csv += "\n";

    csv += "2. ARQUEO DE EFECTIVO POR REPARTIDOR DE DELIVERY\n";
    csv += "Motorizado;Monto a Entregar (S/);Cantidad de Pedidos\n";
    Object.entries(efectivoPorMotorizado).forEach(([moto, data]) => {
      csv += `"${moto}";${data.total.toFixed(2)};${data.pedidos.length}\n`;
    });
    csv += "\n";

    csv += "3. AUDITORÍA DETALLADA DE TODOS LOS PEDIDOS\n";
    csv += "ID Pedido;Hora;Cliente;Teléfono;Distrito;Dirección;Método Pago;Subtotal (S/);Envío (S/);Total (S/);Estado;Motorizado;Comprobante\n";
    orders.forEach((o) => {
      csv += `"${o.idPedido}";"${o.fechaHora}";"${o.cliente.nombre}";"${o.cliente.telefono}";"${o.cliente.distrito}";"${o.cliente.direccion}";"${o.metodoPago}";"${o.subtotal.toFixed(2)}";"${o.costoEnvio.toFixed(2)}";"${o.total.toFixed(2)}";"${o.estado}";"${o.motorizadoAsignado || "N/A"}";"${o.comprobante?.idComprobante || "N/A"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FourSeas_CierreCaja_${serieCierre}_${fechaHoy.replace(/\//g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleSaveClosure = () => {
    const record: CashClosureRecord = {
      idCierre: serieCierre,
      fecha: fechaHoy,
      hora: horaCierre,
      responsable: adminUser.nombreCompleto,
      totalVentas,
      totalEfectivo,
      totalYapePlin,
      totalTarjeta,
      totalPedidos: nonCanceledOrders.length,
      efectivoContado: efectivoContadoNum,
      diferenciaCaja: diferencia,
      notas: closureNotes
    };

    const saved = localStorage.getItem("four_seas_closures_history");
    const history: CashClosureRecord[] = saved ? JSON.parse(saved) : [];
    history.unshift(record);
    localStorage.setItem("four_seas_closures_history", JSON.stringify(history.slice(0, 30)));
    setClosureSaved(true);
    setTimeout(() => setClosureSaved(false), 4000);
  };

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div
        className="closure-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840 }}
      >
        {/* Cabecera del Modal */}
        <div className="closure-modal-header">
          <div>
            <div className="closure-badge">AUDITORÍA Y CONTROL FINANCIERO</div>
            <h2>💵 Cierre y Arqueo de Caja Diario (Reporte Z)</h2>
            <p className="closure-subhead">
              Serie: <strong>{serieCierre}</strong> · {fechaHoy} {horaCierre} · Auditor: <strong>{adminUser.nombreCompleto}</strong>
            </p>
          </div>
          <button className="receipt-close-btn" onClick={onClose} title="Cerrar modal">
            ✕
          </button>
        </div>

        {/* Notificación de guardado */}
        {closureSaved && (
          <div className="alert alert-success" style={{ margin: "1rem 1.5rem 0" }}>
            ✅ <strong>¡Cierre de Caja Registrado con Éxito!</strong> Se ha archivado la liquidación {serieCierre} en el historial de arqueos.
          </div>
        )}

        {/* Pestañas de navegación interna */}
        <div className="closure-tabs-bar">
          <button
            className={`closure-tab-btn ${activeTab === "resumen" ? "active" : ""}`}
            onClick={() => setActiveTab("resumen")}
          >
            📊 Resumen de Liquidación
          </button>
          <button
            className={`closure-tab-btn ${activeTab === "motorizados" ? "active" : ""}`}
            onClick={() => setActiveTab("motorizados")}
          >
            🛵 Rendición de Repartidores ({Object.keys(efectivoPorMotorizado).length})
          </button>
          <button
            className={`closure-tab-btn ${activeTab === "ticket" ? "active" : ""}`}
            onClick={() => setActiveTab("ticket")}
          >
            🖨️ Vista Ticket Térmico Z
          </button>
        </div>

        {/* =====================================================================
            TAB 1: RESUMEN DE LIQUIDACIÓN Y CONCILIACIÓN
            ===================================================================== */}
        {activeTab === "resumen" && (
          <div className="closure-tab-body">
            {/* Grid de Métricas Financieras */}
            <div className="closure-kpi-grid">
              <div className="closure-kpi-card highlight-main">
                <span className="kpi-icon">💰</span>
                <span className="kpi-title">Ventas Brutas del Turno</span>
                <strong className="kpi-amount">S/ {totalVentas.toFixed(2)}</strong>
                <span className="kpi-foot">{nonCanceledOrders.length} pedidos activos/entregados</span>
              </div>

              <div className="closure-kpi-card highlight-cash">
                <span className="kpi-icon">💵</span>
                <span className="kpi-title">Efectivo Físico en Caja</span>
                <strong className="kpi-amount">S/ {totalEfectivo.toFixed(2)}</strong>
                <span className="kpi-foot">{pedidosEfectivo.length} cobros en efectivo</span>
              </div>

              <div className="closure-kpi-card highlight-digital">
                <span className="kpi-icon">📱</span>
                <span className="kpi-title">Billeteras (Yape / Plin)</span>
                <strong className="kpi-amount">S/ {totalYapePlin.toFixed(2)}</strong>
                <span className="kpi-foot">{pedidosYapePlin.length} transferencias</span>
              </div>

              <div className="closure-kpi-card highlight-card">
                <span className="kpi-icon">💳</span>
                <span className="kpi-title">Tarjetas POS</span>
                <strong className="kpi-amount">S/ {totalTarjeta.toFixed(2)}</strong>
                <span className="kpi-foot">{pedidosTarjeta.length} transacciones POS</span>
              </div>
            </div>

            {/* Arqueo de Efectivo Físico y Calculadora de Diferencia */}
            <div className="cash-reconciliation-box">
              <div className="recon-header">
                <h4>⚖️ Arqueo y Cuadre de Caja Física</h4>
                <span className="recon-tip">Ingresa el dinero físico contado en gaveta para validar diferencias:</span>
              </div>

              <div className="recon-form-row">
                <div className="recon-input-group">
                  <label>Efectivo Físico Contado en Gaveta (S/):</label>
                  <div className="input-with-currency">
                    <span>S/</span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      placeholder="0.00"
                      value={efectivoFisicoInput}
                      onChange={(e) => setEfectivoFisicoInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="recon-result-group">
                  <span className="label-diff">Estado de Cuadre:</span>
                  {efectivoFisicoInput === "" ? (
                    <div className="diff-tag diff-pending">Esperando ingreso de conteo físico...</div>
                  ) : diferencia === 0 ? (
                    <div className="diff-tag diff-exact">
                      ✅ CAJA EXACTA (S/ 0.00) · Conforme sin faltantes
                    </div>
                  ) : diferencia > 0 ? (
                    <div className="diff-tag diff-surplus">
                      🟢 SOBRANTE EN CAJA: +S/ {diferencia.toFixed(2)}
                    </div>
                  ) : (
                    <div className="diff-tag diff-shortage">
                      🔴 FALTANTE EN CAJA: -S/ {Math.abs(diferencia).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desglose Tributario y de Operación */}
            <div className="tax-breakdown-row">
              <div className="breakdown-card">
                <h5>📋 Desglose Fiscal SUNAT</h5>
                <div className="breakdown-line">
                  <span>Operaciones Gravadas (Base 18%):</span>
                  <strong>S/ {baseGravada.toFixed(2)}</strong>
                </div>
                <div className="breakdown-line">
                  <span>I.G.V. Total (18%):</span>
                  <strong>S/ {igvTotal.toFixed(2)}</strong>
                </div>
                <div className="breakdown-line">
                  <span>Fletes / Delivery Cobrado:</span>
                  <strong>S/ {totalEnvios.toFixed(2)}</strong>
                </div>
                <div className="breakdown-line total-line">
                  <span>Total Ventas Declarables:</span>
                  <strong>S/ {totalVentas.toFixed(2)}</strong>
                </div>
              </div>

              <div className="breakdown-card">
                <h5>📦 Estado Operativo de Pedidos</h5>
                <div className="breakdown-line">
                  <span>✅ Entregados con éxito:</span>
                  <strong>{deliveredOrders.length}</strong>
                </div>
                <div className="breakdown-line">
                  <span>🛵 En curso / Despacho:</span>
                  <strong>{nonCanceledOrders.length - deliveredOrders.length}</strong>
                </div>
                <div className="breakdown-line">
                  <span>✕ Pedidos Cancelados:</span>
                  <strong style={{ color: "var(--danger)" }}>{canceledOrders.length}</strong>
                </div>
                <div className="breakdown-line total-line">
                  <span>Total Órdenes Registradas:</span>
                  <strong>{orders.length}</strong>
                </div>
              </div>
            </div>

            {/* Campo de observaciones para el libro de caja */}
            <div className="closure-notes-row">
              <label>📝 Observaciones de Liquidación / Incidencias de Turno:</label>
              <input
                type="text"
                placeholder="Ej. Cuadre verificado conforme por administración. Sin devoluciones de clientes."
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: RENDICIÓN DE EFECTIVO DE MOTORIZADOS
            ===================================================================== */}
        {activeTab === "motorizados" && (
          <div className="closure-tab-body">
            <div className="section-instruction">
              <p>
                A continuación se desglosa el dinero en efectivo que cada repartidor cobró directamente al cliente al entregar las órdenes en mano. Cada motorizado debe rendir y entregar este monto al administrador:
              </p>
            </div>

            {Object.keys(efectivoPorMotorizado).length === 0 ? (
              <div className="staff-empty-state">
                <span className="state-icon">🏍️</span>
                <h4>No hay cobros en efectivo registrados hoy</h4>
                <p>Todos los pedidos del turno fueron cancelados previamente vía Yape, Plin o Tarjeta POS.</p>
              </div>
            ) : (
              <div className="riders-cash-grid">
                {Object.entries(efectivoPorMotorizado).map(([moto, data]) => (
                  <div key={moto} className="rider-cash-card">
                    <div className="rider-cash-top">
                      <div>
                        <span className="moto-badge">REPARTIDOR</span>
                        <h4>🛵 {moto}</h4>
                      </div>
                      <div className="moto-total-box">
                        <span className="sub">Efectivo a Entregar:</span>
                        <strong className="amt">S/ {data.total.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="moto-orders-list">
                      <strong>Detalle de pedidos cobrados ({data.pedidos.length}):</strong>
                      <ul>
                        {data.pedidos.map((p) => (
                          <li key={p.idPedido}>
                            <span>
                              Orden <strong>#{p.idPedido}</strong> ({p.cliente.nombre})
                            </span>
                            <span className="order-amt">S/ {p.total.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rider-cash-footer">
                      <span className="conformity-check">
                        ✓ Conforme con el cuadre de ruta
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: VISTA TICKET TÉRMICO Z (IMPRIMIBLE)
            ===================================================================== */}
        {activeTab === "ticket" && (
          <div className="closure-tab-body" style={{ display: "flex", justifyContent: "center" }}>
            <div id="thermal-receipt-print-area" className="thermal-ticket-card">
              <div className="thermal-header">
                <div className="thermal-brand">FOUR SEAS INTERNATIONAL HOUSE S.A.C.</div>
                <div className="thermal-legal">RUC: 20601234567</div>
                <div className="thermal-address">Av. La Marina 2540, San Miguel - Lima</div>
                <div className="thermal-divider-double">================================</div>
                <div className="thermal-doc-title">REPORTE Z - CIERRE DE CAJA DIARIO</div>
                <div className="thermal-doc-number">{serieCierre}</div>
                <div className="thermal-divider-double">================================</div>
              </div>

              <div className="thermal-info-section">
                <div>FECHA: {fechaHoy}   HORA: {horaCierre}</div>
                <div>AUDITOR: {adminUser.nombreCompleto.toUpperCase()}</div>
                <div>SUCURSAL: 001 - PRINCIPAL</div>
                <div>ESTADO: TURNO CERRADO</div>
                <div className="thermal-divider-single">--------------------------------</div>
              </div>

              <div className="thermal-items-section">
                <div className="thermal-section-title">CONCILIACIÓN POR MÉTODO DE PAGO:</div>
                <div className="thermal-data-row">
                  <span>EFECTIVO (GAVETA):</span>
                  <strong>S/ {totalEfectivo.toFixed(2)}</strong>
                </div>
                <div className="thermal-data-row">
                  <span>YAPE / PLIN (DIGITAL):</span>
                  <strong>S/ {totalYapePlin.toFixed(2)}</strong>
                </div>
                <div className="thermal-data-row">
                  <span>TARJETAS (POS VISA/MC):</span>
                  <strong>S/ {totalTarjeta.toFixed(2)}</strong>
                </div>
                <div className="thermal-divider-single">--------------------------------</div>
                <div className="thermal-data-row thermal-total-row">
                  <span>VENTA BRUTA TOTAL:</span>
                  <strong>S/ {totalVentas.toFixed(2)}</strong>
                </div>
                <div className="thermal-divider-single">--------------------------------</div>
              </div>

              <div className="thermal-items-section">
                <div className="thermal-section-title">DESGLOSE FISCAL SUNAT:</div>
                <div className="thermal-data-row">
                  <span>OP. GRAVADA (BASE):</span>
                  <span>S/ {baseGravada.toFixed(2)}</span>
                </div>
                <div className="thermal-data-row">
                  <span>I.G.V. (18.00%):</span>
                  <span>S/ {igvTotal.toFixed(2)}</span>
                </div>
                <div className="thermal-data-row">
                  <span>FLETES DELIVERY:</span>
                  <span>S/ {totalEnvios.toFixed(2)}</span>
                </div>
                <div className="thermal-divider-single">--------------------------------</div>
              </div>

              <div className="thermal-items-section">
                <div className="thermal-section-title">EFECTIVO POR REPARTIDOR:</div>
                {Object.entries(efectivoPorMotorizado).map(([m, d]) => (
                  <div key={m} className="thermal-data-row">
                    <span>{m.slice(0, 18)}:</span>
                    <span>S/ {d.total.toFixed(2)}</span>
                  </div>
                ))}
                {efectivoContadoNum > 0 && (
                  <>
                    <div className="thermal-divider-single">--------------------------------</div>
                    <div className="thermal-data-row">
                      <span>EFECTIVO CONTADO:</span>
                      <span>S/ {efectivoContadoNum.toFixed(2)}</span>
                    </div>
                    <div className="thermal-data-row">
                      <span>DIFERENCIA:</span>
                      <span>S/ {diferencia.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="thermal-divider-double">================================</div>
              </div>

              <div className="thermal-signature-box">
                <div className="signature-space">
                  <div className="signature-line"></div>
                  <span>Firma Administrador / Cajero</span>
                  <small>{adminUser.nombreCompleto}</small>
                </div>
              </div>

              <div className="thermal-footer">
                <div>*** REPORTE Z DE CIERRE FISCAL ***</div>
                <div>FOUR SEAS INTERNATIONAL HOUSE S.A.C.</div>
                <div>四海酒家 · SISTEMA DE GESTIÓN DELIVERY</div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            BARRA DE ACCIONES PRINCIPALES
            ===================================================================== */}
        <div className="closure-modal-footer">
          <div className="left-actions">
            <button className="btn-export-csv" onClick={handleExportCSV} title="Descargar libro diario en formato CSV para Microsoft Excel">
              📥 Descargar Reporte (Excel / CSV)
            </button>
            <button className="btn-print-ticket" onClick={handlePrintReport} title="Imprimir Ticket Térmico Z de 78mm">
              🖨️ Imprimir Ticket Z de Cierre
            </button>
          </div>

          <div className="right-actions">
            <button className="btn-save-closure" onClick={handleSaveClosure}>
              💾 Registrar y Archivar Cierre
            </button>
            <button className="btn-close-modal" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
