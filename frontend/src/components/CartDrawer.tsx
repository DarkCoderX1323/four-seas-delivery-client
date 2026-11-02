import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    updateNotes,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems
  } = useCart();

  const { requireAuth } = useAuth();

  if (!isCartOpen) return null;

  const deliveryCost = subtotal > 0 ? 5.0 : 0;
  const grandTotal = subtotal + deliveryCost;

  const handleProceed = () => {
    setIsCartOpen(false);
    requireAuth(
      "Para confirmar tu pedido de chifa y realizar el seguimiento en tiempo real, por favor inicia sesión o crea tu cuenta.",
      () => {
        onOpenCheckout();
      }
    );
  };

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Carrito de compras"
      >
        <div className="cart-header">
          <div className="cart-title-group">
            <h2>🛒 Tu Pedido</h2>
            <span className="cart-count">({totalItems} {totalItems === 1 ? "ítem" : "ítems"})</span>
          </div>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🥢</div>
            <p className="cart-empty-title">Tu pedido está vacío</p>
            <p className="cart-empty-desc">
              Agrega tus platos favoritos de Four Seas para comenzar.
            </p>
            <button
              className="cart-browse-btn"
              onClick={() => setIsCartOpen(false)}
            >
              Ver la carta
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map((item) => {
                const itemPrice = parseFloat(item.product.precio) || 0;
                const itemTotal = (itemPrice * item.quantity).toFixed(2);

                return (
                  <div key={item.product.idProducto} className="cart-item">
                    <div className="cart-item-header">
                      <div className="cart-item-info">
                        <h4 className="cart-item-title">{item.product.nombre}</h4>
                        <span className="cart-item-unit-price">
                          S/ {itemPrice.toFixed(2)} c/u
                        </span>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.product.idProducto)}
                        title="Eliminar plato"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="cart-item-footer">
                      <div className="cart-item-qty">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            updateQuantity(
                              item.product.idProducto,
                              item.quantity - 1
                            )
                          }
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() =>
                            updateQuantity(
                              item.product.idProducto,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        S/ {itemTotal}
                      </div>
                    </div>

                    <div className="cart-item-notes-container">
                      <input
                        type="text"
                        placeholder="Nota: ej. sin cebolla china, salsa extra..."
                        defaultValue={item.notes || ""}
                        onBlur={(e) => {
                          updateNotes(item.product.idProducto, e.target.value);
                        }}
                        className="cart-item-notes-input"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal platos:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Costo de delivery estimado:</span>
                <span>S/ {deliveryCost.toFixed(2)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total a pagar:</span>
                <span>S/ {grandTotal.toFixed(2)}</span>
              </div>

              <div className="cart-actions">
                <button
                  className="checkout-btn"
                  onClick={handleProceed}
                >
                  Continuar al Pedido · S/ {grandTotal.toFixed(2)}
                </button>
                <button className="cart-clear-btn" onClick={clearCart}>
                  Vaciar pedido
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
