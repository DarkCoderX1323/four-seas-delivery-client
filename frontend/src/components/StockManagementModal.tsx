import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockManagementModal: React.FC<StockManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    isStoreOpen,
    toggleStoreOpen,
    closedReason,
    setClosedReason,
    estimatedDeliveryTime,
    setEstimatedDeliveryTime,
    products,
    categories,
    toggleProductAvailability,
    resetAllProductsAvailability,
    outOfStockCount
  } = useStore();

  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [editingReason, setEditingReason] = useState<boolean>(false);
  const [tempReason, setTempReason] = useState<string>(closedReason);

  if (!isOpen) return null;

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggle = (idProducto: string, nombre: string, currentlyAvailable: boolean) => {
    toggleProductAvailability(idProducto);
    const newState = !currentlyAvailable;
    triggerFeedback(
      newState
        ? `🟢 "${nombre}" ahora está DISPONIBLE para pedidos`
        : `🔴 "${nombre}" marcado como AGOTADO por hoy`
    );
  };

  const handleResetAll = () => {
    if (window.confirm("¿Deseas restablecer TODOS los platos del menú como DISPONIBLES?")) {
      resetAllProductsAvailability();
      triggerFeedback("✓ Todo el menú ha sido restablecido a DISPONIBLE.");
    }
  };

  const handleSaveReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempReason.trim()) {
      setClosedReason(tempReason.trim());
      setEditingReason(false);
      triggerFeedback("✓ Motivo de pausa operativa actualizado.");
    }
  };

  // Filtrado de platos
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "ALL" || p.idCategoria === selectedCategory;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      p.nombre.toLowerCase().includes(cleanSearch) ||
      p.categoria.toLowerCase().includes(cleanSearch);
    return matchesCategory && matchesSearch;
  });

  const availableCount = products.length - outOfStockCount;

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div
        className="stock-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 880 }}
      >
        {/* Cabecera del Modal */}
        <div className="stock-modal-header">
          <div>
            <div className="stock-badge">OPERACIONES DE RESTAURANTE & CARTA</div>
            <h2>🥡 Control de Stock y Estado de la Tienda</h2>
            <p className="stock-subhead">
              Pausa la toma de pedidos o agota platos en 1 clic cuando se terminen los insumos en cocina.
            </p>
          </div>
          <button className="receipt-close-btn" onClick={onClose} title="Cerrar ventana">
            ✕
          </button>
        </div>

        {/* Mensaje de retroalimentación en vivo */}
        {feedbackMsg && (
          <div className="stock-feedback-alert">
            {feedbackMsg}
          </div>
        )}

        {/* ===================================================================
            SECCIÓN 1: ESTADO DEL RESTAURANTE (ABIERTO / PAUSA)
            =================================================================== */}
        <div className="store-control-strip">
          <div className="store-state-left">
            <span className="strip-label">ESTADO DE OPERACIÓN ACTUAL:</span>
            <div className="store-status-toggle-group">
              <button
                type="button"
                className={`status-btn btn-open ${isStoreOpen ? "active" : ""}`}
                onClick={() => {
                  if (!isStoreOpen) {
                    toggleStoreOpen(true);
                    triggerFeedback("🟢 Restaurante ABIERTO: Clientes pueden realizar pedidos.");
                  }
                }}
              >
                🟢 Abierto al Público
              </button>
              <button
                type="button"
                className={`status-btn btn-closed ${!isStoreOpen ? "active" : ""}`}
                onClick={() => {
                  if (isStoreOpen) {
                    toggleStoreOpen(false);
                    triggerFeedback("🔴 Restaurante en PAUSA OPERATIVA: Pedidos bloqueados temporalmente.");
                  }
                }}
              >
                🔴 Pausa / Cerrado
              </button>
            </div>
          </div>

          <div className="store-time-config">
            <label>⏱️ Tiempo estimado entrega:</label>
            <select
              value={estimatedDeliveryTime}
              onChange={(e) => {
                setEstimatedDeliveryTime(e.target.value);
                triggerFeedback(`⏱️ Tiempo estimado ajustado a ${e.target.value}`);
              }}
            >
              <option value="25 - 40 min">25 - 40 min (Rápido)</option>
              <option value="35 - 50 min">35 - 50 min (Estándar)</option>
              <option value="50 - 70 min">50 - 70 min (Hora Punta)</option>
              <option value="60 - 90 min">60 - 90 min (Alta Demanda / Lluvia)</option>
            </select>
          </div>
        </div>

        {/* Aviso de motivo si la tienda está cerrada */}
        {!isStoreOpen && (
          <div className="store-closed-edit-box">
            <div className="closed-edit-top">
              <span>⚠️ <strong>La tienda está en pausa operativa.</strong> Los clientes ven este mensaje:</span>
              {!editingReason && (
                <button
                  className="btn-edit-reason"
                  onClick={() => {
                    setTempReason(closedReason);
                    setEditingReason(true);
                  }}
                >
                  ✏️ Cambiar motivo
                </button>
              )}
            </div>

            {editingReason ? (
              <form onSubmit={handleSaveReason} className="reason-edit-form">
                <input
                  type="text"
                  value={tempReason}
                  onChange={(e) => setTempReason(e.target.value)}
                  placeholder="Motivo mostrado a los clientes..."
                  autoFocus
                />
                <button type="submit" className="btn-save-reason">Guardar</button>
                <button
                  type="button"
                  className="btn-cancel-reason"
                  onClick={() => setEditingReason(false)}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <p className="current-reason-quote">"{closedReason}"</p>
            )}
          </div>
        )}

        {/* ===================================================================
            SECCIÓN 2: CONTROL DE STOCK DE PLATOS (EN 1 CLIC)
            =================================================================== */}
        <div className="stock-content-area">
          <div className="stock-toolbar">
            <div className="stock-counters">
              <span className="counter-pill pill-avail">
                🟢 {availableCount} Disponibles
              </span>
              <span className="counter-pill pill-soldout">
                🔴 {outOfStockCount} Agotados
              </span>
            </div>

            <div className="stock-toolbar-actions">
              {outOfStockCount > 0 && (
                <button
                  type="button"
                  className="btn-reset-stock"
                  onClick={handleResetAll}
                  title="Marcar todos los platos como disponibles"
                >
                  🔄 Restaurar Todo a Disponible
                </button>
              )}
            </div>
          </div>

          {/* Filtros de búsqueda y categorías */}
          <div className="stock-filters-row">
            <div className="stock-search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Buscar plato para agotar o habilitar (ej. Chaufa, Wantán, Pollo)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="stock-cat-pills">
              <button
                className={`stock-cat-pill ${selectedCategory === "ALL" ? "active" : ""}`}
                onClick={() => setSelectedCategory("ALL")}
              >
                Todas las Categorías ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.idCategoria}
                  className={`stock-cat-pill ${selectedCategory === cat.idCategoria ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.idCategoria)}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Platos */}
          <div className="dishes-stock-list">
            {filteredProducts.length === 0 ? (
              <div className="stock-empty-search">
                <span>🔎</span>
                <p>No se encontraron platos con el término "{searchTerm}"</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isAvail = p.disponible;
                return (
                  <div
                    key={p.idProducto}
                    className={`dish-stock-row ${!isAvail ? "row-soldout" : ""}`}
                  >
                    <div className="dish-main-info">
                      <span className="dish-indicator-dot">
                        {isAvail ? "🟢" : "🔴"}
                      </span>
                      <div className="dish-texts">
                        <strong className="dish-name">{p.nombre}</strong>
                        <span className="dish-cat-tag">{p.categoria}</span>
                      </div>
                    </div>

                    <div className="dish-price-col">
                      <span>S/ {Number(p.precio).toFixed(2)}</span>
                    </div>

                    <div className="dish-action-col">
                      <button
                        type="button"
                        className={`btn-stock-toggle ${isAvail ? "toggle-avail" : "toggle-soldout"}`}
                        onClick={() => handleToggle(p.idProducto, p.nombre, isAvail)}
                        title={isAvail ? "Clic para marcar como AGOTADO HOY" : "Clic para marcar como DISPONIBLE"}
                      >
                        {isAvail ? (
                          <>
                            <span className="toggle-label">Disponible</span>
                            <span className="toggle-hover-hint">↳ Agotar hoy</span>
                          </>
                        ) : (
                          <>
                            <span className="toggle-label">🔴 Agotado hoy</span>
                            <span className="toggle-hover-hint">↳ Habilitar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="stock-modal-footer">
          <span className="operator-sign">
            Operador: <strong>{user?.nombreCompleto || "Personal"}</strong> ({user?.rol || "STAFF"})
          </span>
          <button className="btn-close-modal" onClick={onClose}>
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
