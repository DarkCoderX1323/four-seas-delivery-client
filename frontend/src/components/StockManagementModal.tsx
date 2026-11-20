import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Subcomponente: Editor Inline de Precio ───────────────────────────────────
interface InlinePriceEditorProps {
  idProducto: string;
  currentPrice: string;
  onSave: (id: string, newPrice: string) => void;
  onFeedback: (msg: string) => void;
}

const InlinePriceEditor: React.FC<InlinePriceEditorProps> = ({
  idProducto,
  currentPrice,
  onSave,
  onFeedback
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(Number(currentPrice).toFixed(2));
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.select();
    }
  }, [editing]);

  const handleConfirm = () => {
    const val = parseFloat(draft.replace(",", "."));
    if (isNaN(val) || val <= 0) {
      onFeedback("⚠️ Precio inválido. Ingresa un monto mayor a S/ 0.00");
      return;
    }
    if (val === Number(currentPrice)) {
      setEditing(false);
      return;
    }
    const formatted = val.toFixed(2);
    onSave(idProducto, formatted);
    onFeedback(`✅ Precio actualizado a S/ ${formatted}`);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") setEditing(false);
  };

  if (editing) {
    return (
      <div className="price-edit-inline">
        <span className="price-edit-currency">S/</span>
        <input
          ref={inputRef}
          type="number"
          min="0.50"
          step="0.50"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="price-edit-input"
          aria-label="Nuevo precio"
        />
        <button
          type="button"
          className="price-edit-btn confirm"
          onClick={handleConfirm}
          title="Confirmar precio (Enter)"
        >
          ✓
        </button>
        <button
          type="button"
          className="price-edit-btn cancel"
          onClick={() => setEditing(false)}
          title="Cancelar (Escape)"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="price-display-btn"
      onClick={startEdit}
      title="Clic para editar el precio de este plato"
    >
      <span className="price-display-value">S/ {Number(currentPrice).toFixed(2)}</span>
      <span className="price-edit-hint">✏️</span>
    </button>
  );
};

// ─── Modal Principal ──────────────────────────────────────────────────────────
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
    updateProductPrice,
    outOfStockCount
  } = useStore();

  const { user } = useAuth();
  const isAdmin = user?.rol === "ADMINISTRADOR";

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [editingReason, setEditingReason] = useState<boolean>(false);
  const [tempReason, setTempReason] = useState<string>(closedReason);

  if (!isOpen) return null;

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
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
        style={{ maxWidth: 920 }}
      >
        {/* Cabecera del Modal */}
        <div className="stock-modal-header">
          <div>
            <div className="stock-badge">OPERACIONES DE RESTAURANTE &amp; CARTA</div>
            <h2>🥡 Control de Stock, Precios y Estado del Restaurante</h2>
            <p className="stock-subhead">
              Gestiona stock, pausa pedidos y{" "}
              {isAdmin ? (
                <strong>edita precios de platos en tiempo real</strong>
              ) : (
                "consulta precios actuales"
              )}{" "}
              desde este panel.
            </p>
          </div>
          <button className="receipt-close-btn" onClick={onClose} title="Cerrar ventana">
            ✕
          </button>
        </div>

        {/* Aviso de edición de precios (solo ADMIN) */}
        {isAdmin && (
          <div className="price-edit-admin-notice">
            <span className="notice-icon">💲</span>
            <div>
              <strong>Modo Administrador:</strong> Haz clic en cualquier precio{" "}
              <span style={{ color: "#b91c1c" }}>S/ ——</span> de la lista para editarlo
              al instante. Confirma con <kbd>Enter</kbd> o el botón <kbd>✓</kbd>.
            </div>
          </div>
        )}

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
            SECCIÓN 2: CONTROL DE STOCK Y PRECIOS DE PLATOS
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
              {isAdmin && (
                <span className="counter-pill pill-admin">
                  💲 Admin: Precios editables
                </span>
              )}
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
                placeholder="Buscar plato (ej. Chaufa, Wantán, Pollo)..."
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

          {/* Encabezado de columnas */}
          <div className="dishes-stock-list-header">
            <span style={{ flex: 1 }}>Plato</span>
            <span style={{ width: 160, textAlign: "center" }}>
              Precio{isAdmin ? " (editable)" : ""}
            </span>
            <span style={{ width: 140, textAlign: "center" }}>Stock</span>
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
                      {isAdmin ? (
                        <InlinePriceEditor
                          idProducto={p.idProducto}
                          currentPrice={p.precio}
                          onSave={updateProductPrice}
                          onFeedback={triggerFeedback}
                        />
                      ) : (
                        <span className="price-readonly">S/ {Number(p.precio).toFixed(2)}</span>
                      )}
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
            {isAdmin && (
              <span className="admin-crown" title="Acceso completo de Administrador"> 👑</span>
            )}
          </span>
          <button className="btn-close-modal" onClick={onClose}>
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
