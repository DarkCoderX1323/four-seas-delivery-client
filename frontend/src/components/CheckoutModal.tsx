import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (idPedido: number) => void;
}

interface DeliveryZone {
  id: string;
  nombre: string;
  tarifa: number;
}

const ZONAS_DISPONIBLES: DeliveryZone[] = [
  { id: "1", nombre: "San Isidro", tarifa: 5.0 },
  { id: "2", nombre: "Miraflores", tarifa: 6.0 },
  { id: "3", nombre: "Lince", tarifa: 4.5 },
  { id: "4", nombre: "Jesús María", tarifa: 5.0 },
  { id: "5", nombre: "Magdalena del Mar", tarifa: 5.5 },
  { id: "6", nombre: "Pueblo Libre", tarifa: 5.5 },
  { id: "7", nombre: "San Borja", tarifa: 6.5 },
  { id: "8", nombre: "Surquillo", tarifa: 6.0 }
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated
}) => {
  const { cart, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, setIsAuthModalOpen, currentAddress } = useAuth();
  const { createOrder } = useOrders();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [zonaId, setZonaId] = useState("1");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [metodoPago, setMetodoPago] = useState("YAPE");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<number | null>(null);

  // Auto-completar datos si el usuario ha iniciado sesión
  useEffect(() => {
    if (isAuthenticated && user) {
      setNombre(user.nombreCompleto);
      if (user.telefono) setTelefono(user.telefono);
      if (user.direccion) setDireccion(user.direccion);
      if (user.distrito) {
        const foundZone = ZONAS_DISPONIBLES.find(
          (z) => z.nombre.toLowerCase() === user.distrito?.toLowerCase()
        );
        if (foundZone) setZonaId(foundZone.id);
      }
    } else if (currentAddress) {
      setDireccion(currentAddress);
    }
  }, [isAuthenticated, user, currentAddress, isOpen]);

  if (!isOpen) return null;

  const currentZone =
    ZONAS_DISPONIBLES.find((z) => z.id === zonaId) || ZONAS_DISPONIBLES[0];
  const costoEnvio = currentZone.tarifa;
  const grandTotal = subtotal + costoEnvio;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      alert("Por favor completa los campos obligatorios: Nombre, Teléfono y Dirección.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Registrar el pedido en el OrderContext centralizado
      const created = createOrder({
        cliente: {
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          referencia: referencia.trim() || undefined,
          distrito: currentZone.nombre
        },
        items: cart.map((item) => ({
          idProducto: item.product.idProducto,
          nombre: item.product.nombre,
          precio: parseFloat(item.product.precio) || 0,
          cantidad: item.quantity,
          observaciones: item.notes
        })),
        subtotal,
        costoEnvio,
        total: grandTotal,
        metodoPago,
        montoEfectivo: metodoPago === "EFECTIVO" ? montoEfectivo : undefined,
        comentarios: comentarios.trim() || undefined
      });

      setConfirmedId(created.idPedido);
      clearCart();
      setIsSubmitting(false);

      if (onOrderCreated) {
        onOrderCreated(created.idPedido);
      }
    }, 600);
  };

  const handleGoToTracking = () => {
    const id = confirmedId;
    setConfirmedId(null);
    onClose();
    if (onOrderCreated && id) {
      onOrderCreated(id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{confirmedId ? "🎉 ¡Pedido Recibido con Éxito!" : "🛵 Confirmar Entrega Four Seas"}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {confirmedId ? (
          <div className="order-success-view">
            <div className="success-badge-icon">✅</div>
            <h3>¡Tu pedido #{confirmedId} ya está en marcha!</h3>
            <p className="success-tagline">
              El restaurante Four Seas International House ha recibido tu orden y ya está encendiendo los woks.
            </p>

            <div className="order-ticket">
              <div className="ticket-header">
                <strong>Pedido #{confirmedId}</strong>
                <span>Entrega en aprox. 35 - 45 min</span>
              </div>
              <div className="ticket-divider"></div>
              <div className="ticket-row">
                <span>Destino:</span>
                <span>{direccion} ({currentZone.nombre})</span>
              </div>
              <div className="ticket-row">
                <span>Método de pago:</span>
                <span>{metodoPago}</span>
              </div>
              <div className="ticket-row highlight">
                <span>Total a pagar:</span>
                <span>S/ {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="success-actions-row">
              <button className="track-order-btn" onClick={handleGoToTracking}>
                📦 Ver Historial y Seguimiento en Tiempo Real
              </button>
              <button
                className="success-done-btn"
                onClick={() => {
                  setConfirmedId(null);
                  onClose();
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form className="checkout-form" onSubmit={handleSubmit}>
            {!isAuthenticated && (
              <div className="checkout-auth-hint">
                <span>💡 ¿Tienes cuenta en Four Seas / PedidosYa?</span>
                <button
                  type="button"
                  className="hint-login-btn"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Iniciar sesión para autocompletar
                </button>
              </div>
            )}

            <div className="form-sections-grid">
              {/* Sección Datos Cliente */}
              <div className="form-section">
                <h4 className="section-title">1. Datos de Contacto</h4>
                <div className="input-group">
                  <label htmlFor="chk_nombre">Nombre completo *</label>
                  <input
                    id="chk_nombre"
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="chk_telefono">Teléfono celular para el repartidor *</label>
                  <input
                    id="chk_telefono"
                    type="tel"
                    required
                    placeholder="Ej. 987 654 321"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>

                <h4 className="section-title" style={{ marginTop: "1rem" }}>
                  2. Dirección de Entrega
                </h4>
                <div className="input-group">
                  <label htmlFor="chk_zona">Distrito / Zona de cobertura *</label>
                  <select
                    id="chk_zona"
                    value={zonaId}
                    onChange={(e) => setZonaId(e.target.value)}
                  >
                    {ZONAS_DISPONIBLES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nombre} (Delivery S/ {z.tarifa.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="chk_direccion">Dirección exacta *</label>
                  <input
                    id="chk_direccion"
                    type="text"
                    required
                    placeholder="Av. / Calle / Jr. y número"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="chk_referencia">Referencia / Dpto</label>
                  <input
                    id="chk_referencia"
                    type="text"
                    placeholder="Ej. Dpto 402, timbre blanco, frente al parque"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                  />
                </div>
              </div>

              {/* Sección Pago y Resumen */}
              <div className="form-section">
                <h4 className="section-title">3. Forma de Pago</h4>
                <div className="payment-options">
                  <label
                    className={`payment-card ${metodoPago === "YAPE" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pago"
                      value="YAPE"
                      checked={metodoPago === "YAPE"}
                      onChange={() => setMetodoPago("YAPE")}
                    />
                    <span className="pay-name">📱 Yape / Plin</span>
                  </label>

                  <label
                    className={`payment-card ${metodoPago === "EFECTIVO" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pago"
                      value="EFECTIVO"
                      checked={metodoPago === "EFECTIVO"}
                      onChange={() => setMetodoPago("EFECTIVO")}
                    />
                    <span className="pay-name">💵 Efectivo al entregar</span>
                  </label>

                  <label
                    className={`payment-card ${metodoPago === "TARJETA" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pago"
                      value="TARJETA"
                      checked={metodoPago === "TARJETA"}
                      onChange={() => setMetodoPago("TARJETA")}
                    />
                    <span className="pay-name">💳 Tarjeta (POS inalámbrico)</span>
                  </label>
                </div>

                {metodoPago === "EFECTIVO" && (
                  <div className="input-group" style={{ marginTop: "0.5rem" }}>
                    <label htmlFor="chk_monto">¿Con cuánto pagarás? (para llevarte vuelto)</label>
                    <input
                      id="chk_monto"
                      type="text"
                      placeholder="Ej. S/ 50.00"
                      value={montoEfectivo}
                      onChange={(e) => setMontoEfectivo(e.target.value)}
                    />
                  </div>
                )}

                <div className="input-group" style={{ marginTop: "0.8rem" }}>
                  <label htmlFor="chk_comentarios">Instrucciones de entrega</label>
                  <textarea
                    id="chk_comentarios"
                    rows={2}
                    placeholder="Sin cubiertos, salsa de tamarindo extra, dejar en recepción..."
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                  />
                </div>

                {/* Resumen del Pedido */}
                <div className="checkout-summary-box">
                  <div className="summary-title">Resumen del Pedido</div>
                  <div className="checkout-items-mini">
                    {cart.map((item) => (
                      <div key={item.product.idProducto} className="mini-item">
                        <span>{item.quantity}x {item.product.nombre}</span>
                        <span>
                          S/ {(parseFloat(item.product.precio) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="checkout-calc-row">
                    <span>Subtotal:</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="checkout-calc-row">
                    <span>Delivery ({currentZone.nombre}):</span>
                    <span>S/ {costoEnvio.toFixed(2)}</span>
                  </div>
                  <div className="checkout-calc-row grand-total">
                    <span>Total a pagar:</span>
                    <span>S/ {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="submit-order-btn"
                >
                  {isSubmitting
                    ? "Confirmando pedido..."
                    : `Hacer Pedido · S/ ${grandTotal.toFixed(2)}`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
