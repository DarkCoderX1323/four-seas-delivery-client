import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import type { DeliveryZone } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

interface DeliveryZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryZonesModal: React.FC<DeliveryZonesModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    deliveryZones,
    updateZoneTarifa,
    updateZoneDetails,
    toggleZoneActive,
    addDeliveryZone,
    deleteDeliveryZone,
    resetDefaultZones,
    freeDeliveryThreshold,
    setFreeDeliveryThreshold
  } = useStore();

  const { user } = useAuth();

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newTarifa, setNewTarifa] = useState("5.00");
  const [newTiempo, setNewTiempo] = useState("35 - 45 min");
  const [newPedidoMinimo, setNewPedidoMinimo] = useState("25.00");

  const [tempFreeThreshold, setTempFreeThreshold] = useState(
    freeDeliveryThreshold.toString()
  );

  if (!isOpen) return null;

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleTarifaChange = (id: string, nombre: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      updateZoneTarifa(id, num);
      triggerFeedback(`✓ Tarifa de ${nombre} actualizada a S/ ${num.toFixed(2)}`);
    }
  };

  const handleMinimoChange = (zone: DeliveryZone, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      updateZoneDetails({ ...zone, pedidoMinimo: num });
      triggerFeedback(`✓ Pedido mínimo para ${zone.nombre} fijado en S/ ${num.toFixed(2)}`);
    }
  };

  const handleTiempoChange = (zone: DeliveryZone, tiempo: string) => {
    updateZoneDetails({ ...zone, tiempoEstimado: tiempo });
    triggerFeedback(`✓ Tiempo para ${zone.nombre} ajustado a ${tiempo}`);
  };

  const handleToggleZone = (id: string, nombre: string, currentActive: boolean) => {
    toggleZoneActive(id);
    triggerFeedback(
      !currentActive
        ? `🟢 Cobertura en ${nombre} HABILITADA`
        : `🔴 Cobertura en ${nombre} DESACTIVADA temporalmente`
    );
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) {
      alert("Por favor ingresa el nombre del distrito o zona.");
      return;
    }

    addDeliveryZone({
      nombre: newNombre.trim(),
      tarifa: parseFloat(newTarifa) || 5.0,
      tiempoEstimado: newTiempo.trim() || "35 - 50 min",
      pedidoMinimo: parseFloat(newPedidoMinimo) || 20.0,
      activa: true
    });

    triggerFeedback(`✓ Nueva zona "${newNombre.trim()}" agregada con éxito.`);
    setNewNombre("");
    setNewTarifa("5.00");
    setNewTiempo("35 - 45 min");
    setNewPedidoMinimo("25.00");
    setIsAddingNew(false);
  };

  const handleSaveFreeDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempFreeThreshold) || 0;
    setFreeDeliveryThreshold(val);
    triggerFeedback(
      val > 0
        ? `✓ Envío gratis activado para compras mayores a S/ ${val.toFixed(2)}`
        : "✓ Promoción de envío gratis desactivada"
    );
  };

  const activeCount = deliveryZones.filter((z) => z.activa).length;
  const inactiveCount = deliveryZones.length - activeCount;

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div
        className="zones-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 920 }}
      >
        {/* Cabecera */}
        <div className="zones-modal-header">
          <div>
            <div className="zones-badge">LOGÍSTICA Y COBERTURA GEOGRÁFICA</div>
            <h2>📍 Zonas de Delivery, Tarifas y Tiempos de Entrega</h2>
            <p className="zones-subhead">
              Configura los distritos de reparto, el costo por flete, el pedido mínimo y los tiempos estimados de viaje.
            </p>
          </div>
          <button className="receipt-close-btn" onClick={onClose} title="Cerrar modal">
            ✕
          </button>
        </div>

        {/* Feedback visual */}
        {feedbackMsg && (
          <div className="stock-feedback-alert">
            {feedbackMsg}
          </div>
        )}

        {/* Sección de Envío Gratis Promocional */}
        <div className="free-shipping-bar">
          <div className="free-shipping-icon">🎉</div>
          <div className="free-shipping-info">
            <strong>Promoción de Envío Gratis para Clientes:</strong>
            <p>Define a partir de qué monto el cliente no paga flete de delivery (S/ 0.00).</p>
          </div>
          <form onSubmit={handleSaveFreeDelivery} className="free-shipping-form">
            <span>Envío Gratis desde S/</span>
            <input
              type="number"
              step="5"
              min="0"
              value={tempFreeThreshold}
              onChange={(e) => setTempFreeThreshold(e.target.value)}
              style={{ width: 85 }}
            />
            <button type="submit" className="btn-save-free-shipping">
              Aplicar
            </button>
          </form>
        </div>

        {/* Barra de herramientas */}
        <div className="zones-toolbar">
          <div className="zones-counters">
            <span className="counter-pill pill-avail">
              🟢 {activeCount} Distritos Habilitados
            </span>
            {inactiveCount > 0 && (
              <span className="counter-pill pill-soldout">
                🔴 {inactiveCount} Pausados
              </span>
            )}
          </div>

          <div className="zones-actions-right">
            <button
              className="btn-add-zone"
              onClick={() => setIsAddingNew(!isAddingNew)}
            >
              {isAddingNew ? "✕ Cancelar" : "➕ Agregar Distrito"}
            </button>
            <button
              className="btn-reset-stock"
              onClick={() => {
                if (window.confirm("¿Restablecer las tarifas de los distritos a los valores recomendados?")) {
                  resetDefaultZones();
                  triggerFeedback("✓ Tarifas restablecidas por defecto.");
                }
              }}
              title="Restablecer tarifas predeterminadas de Lima"
            >
              🔄 Tarifas Iniciales
            </button>
          </div>
        </div>

        {/* Formulario para agregar nuevo distrito */}
        {isAddingNew && (
          <form onSubmit={handleCreateZone} className="new-zone-form-box">
            <h4>➕ Registrar Nuevo Distrito o Zona de Cobertura</h4>
            <div className="form-fields-grid">
              <div className="form-field">
                <label>Nombre del Distrito / Zona:</label>
                <input
                  type="text"
                  placeholder="Ej. Cercado de Lima, Bellavista, etc."
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-field">
                <label>Tarifa de Delivery (S/):</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={newTarifa}
                  onChange={(e) => setNewTarifa(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Tiempo Estimado:</label>
                <input
                  type="text"
                  placeholder="Ej. 30 - 45 min"
                  value={newTiempo}
                  onChange={(e) => setNewTiempo(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Pedido Mínimo (S/):</label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={newPedidoMinimo}
                  onChange={(e) => setNewPedidoMinimo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions-row">
              <button type="submit" className="btn-confirm-new-zone">
                Guardar e Habilitar Zona
              </button>
              <button
                type="button"
                className="btn-cancel-new-zone"
                onClick={() => setIsAddingNew(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de Distritos / Zonas */}
        <div className="zones-table-wrapper">
          <table className="zones-table">
            <thead>
              <tr>
                <th>Distrito de Cobertura</th>
                <th style={{ width: 140 }}>Tarifa Delivery</th>
                <th style={{ width: 150 }}>Tiempo Estimado</th>
                <th style={{ width: 140 }}>Pedido Mínimo</th>
                <th style={{ width: 140, textAlign: "center" }}>Estado Cobertura</th>
                <th style={{ width: 60, textAlign: "center" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {deliveryZones.map((z) => (
                <tr key={z.id} className={!z.activa ? "row-inactive-zone" : ""}>
                  <td className="zone-name-cell">
                    <div className="zone-name-group">
                      <span className="zone-pin-icon">{z.activa ? "📍" : "⚪"}</span>
                      <div>
                        <strong>{z.nombre}</strong>
                        {!z.activa && (
                          <span className="inactive-tag">Sin cobertura hoy</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Tarifa editable */}
                  <td>
                    <div className="table-input-currency">
                      <span>S/</span>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        defaultValue={z.tarifa.toFixed(2)}
                        onBlur={(e) => handleTarifaChange(z.id, z.nombre, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                    </div>
                  </td>

                  {/* Tiempo estimado editable */}
                  <td>
                    <input
                      type="text"
                      className="table-time-input"
                      defaultValue={z.tiempoEstimado}
                      onBlur={(e) => handleTiempoChange(z, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </td>

                  {/* Pedido mínimo editable */}
                  <td>
                    <div className="table-input-currency">
                      <span>S/</span>
                      <input
                        type="number"
                        step="5"
                        min="0"
                        defaultValue={z.pedidoMinimo.toFixed(2)}
                        onBlur={(e) => handleMinimoChange(z, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                    </div>
                  </td>

                  {/* Switch Activo / Desactivado */}
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className={`btn-toggle-zone ${z.activa ? "zone-active" : "zone-inactive"}`}
                      onClick={() => handleToggleZone(z.id, z.nombre, z.activa)}
                      title={z.activa ? "Clic para pausar envíos a este distrito" : "Clic para habilitar envíos"}
                    >
                      {z.activa ? "🟢 Activo" : "🔴 Pausado"}
                    </button>
                  </td>

                  {/* Eliminar zona */}
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className="btn-delete-zone"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar la zona "${z.nombre}"?`)) {
                          deleteDeliveryZone(z.id);
                          triggerFeedback(`✓ Zona "${z.nombre}" eliminada.`);
                        }
                      }}
                      title="Eliminar distrito"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="zones-modal-footer">
          <span className="operator-sign">
            Configuración de despacho para <strong>Four Seas International House S.A.C.</strong> · Autorizado por: <strong>{user?.nombreCompleto || "Administrador"}</strong>
          </span>
          <button className="btn-close-modal" onClick={onClose}>
            Guardar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
