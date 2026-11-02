import React, { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";

export type AppTab = "menu" | "my-orders" | "staff" | "admin-users";

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const {
    user,
    isAuthenticated,
    logout,
    setIsAuthModalOpen,
    setAuthModalTab,
    currentAddress,
    setCurrentAddress
  } = useAuth();

  const { orders } = useOrders();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState(currentAddress);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar menú desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOrdersCount = orders.filter(
    (o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO"
  ).length;

  const handleOpenLogin = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalTab("register");
    setIsAuthModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      setCurrentAddress(tempAddress.trim());
      setIsAddressModalOpen(false);
    }
  };

  // Obtener etiqueta legible del rol
  const getRoleTitle = (rol?: string) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return "Administrador General";
      case "RECEPCION":
        return "Recepción y Pedidos";
      case "COCINA":
        return "Chef de Wok / Cocina";
      case "MOTORIZADO":
        return "Repartidor Delivery";
      case "CLIENTE":
      default:
        return "Cliente Four Seas";
    }
  };

  // Obtener iniciales del usuario
  const getUserInitials = (name?: string) => {
    if (!name) return "FS";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="header">
        {/* Barra superior principal */}
        <div className="header-top">
          {/* Logo y marca */}
          <div className="header-brand" onClick={() => onTabChange("menu")}>
            <div className="brand-logo-icon">🏮</div>
            <div className="brand-titles">
              <h1 className="brand-name">FOUR SEAS</h1>
              <span className="brand-subtitle">International House · 四海酒家</span>
            </div>
          </div>

          {/* Selector de Dirección estilo PedidosYa */}
          <button
            className="address-selector-btn"
            onClick={() => {
              setTempAddress(currentAddress);
              setIsAddressModalOpen(true);
            }}
            title="Cambiar dirección de entrega"
          >
            <span className="address-icon">📍</span>
            <div className="address-text-group">
              <span className="address-prelabel">Entregar en</span>
              <span className="address-val">{currentAddress}</span>
            </div>
            <span className="address-arrow">▾</span>
          </button>

          {/* NAVEGACIÓN SEGMENTADA ESTRICTAMENTE POR ROL Y AUTENTICACIÓN */}
          <nav className="header-nav-main">
            {/* Si NO ha iniciado sesión: SOLO ve la carta */}
            {!isAuthenticated ? (
              <button
                className={`nav-tab-btn ${activeTab === "menu" ? "active" : ""}`}
                onClick={() => onTabChange("menu")}
              >
                🥢 Menú & Carta
              </button>
            ) : (
              /* Si ha iniciado sesión: Vistas estrictamente según su rol */
              <>
                {user?.rol === "CLIENTE" && (
                  <>
                    <button
                      className={`nav-tab-btn ${activeTab === "menu" ? "active" : ""}`}
                      onClick={() => onTabChange("menu")}
                    >
                      🥢 Menú & Carta
                    </button>
                    <button
                      className={`nav-tab-btn ${activeTab === "my-orders" ? "active" : ""}`}
                      onClick={() => onTabChange("my-orders")}
                    >
                      📦 Mis Pedidos
                      {activeOrdersCount > 0 && (
                        <span className="live-counter-pill">{activeOrdersCount} en curso</span>
                      )}
                    </button>
                  </>
                )}

                {user?.rol === "RECEPCION" && (
                  <>
                    <button
                      className={`nav-tab-btn ${activeTab === "staff" ? "active" : ""}`}
                      onClick={() => onTabChange("staff")}
                    >
                      🛎️ Estación Recepción
                    </button>
                    <button
                      className={`nav-tab-btn ${activeTab === "menu" ? "active" : ""}`}
                      onClick={() => onTabChange("menu")}
                    >
                      🥢 Ver Menú
                    </button>
                  </>
                )}

                {user?.rol === "COCINA" && (
                  <>
                    <button
                      className={`nav-tab-btn ${activeTab === "staff" ? "active" : ""}`}
                      onClick={() => onTabChange("staff")}
                    >
                      🍳 Cocina Wok (KDS)
                    </button>
                    <button
                      className={`nav-tab-btn ${activeTab === "menu" ? "active" : ""}`}
                      onClick={() => onTabChange("menu")}
                    >
                      🥢 Ver Menú
                    </button>
                  </>
                )}

                {user?.rol === "MOTORIZADO" && (
                  <>
                    <button
                      className={`nav-tab-btn ${activeTab === "staff" ? "active" : ""}`}
                      onClick={() => onTabChange("staff")}
                    >
                      🛵 Mis Entregas
                    </button>
                    <button
                      className={`nav-tab-btn ${activeTab === "menu" ? "active" : ""}`}
                      onClick={() => onTabChange("menu")}
                    >
                      🥢 Ver Menú
                    </button>
                  </>
                )}

                {user?.rol === "ADMINISTRADOR" && (
                  <>
                    <button
                      className={`nav-tab-btn ${activeTab === "staff" ? "active" : ""}`}
                      onClick={() => onTabChange("staff")}
                    >
                      👑 Panel Administrador
                    </button>
                    <button
                      className={`nav-tab-btn ${activeTab === "admin-users" ? "active" : ""}`}
                      onClick={() => onTabChange("admin-users")}
                    >
                      👥 Personal BD
                    </button>
                    <button
                      className={`nav-tab-btn ${activeTab === "my-orders" ? "active" : ""}`}
                      onClick={() => onTabChange("my-orders")}
                    >
                      📦 Auditoría Pedidos
                    </button>
                    <button
                      className={`nav-tab-btn ${activeTab === "menu" ? "active" : ""}`}
                      onClick={() => onTabChange("menu")}
                    >
                      🥢 Menú
                    </button>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Acciones de Usuario y Carrito */}
          <div className="header-actions">
            {!isAuthenticated ? (
              <div className="auth-buttons-group">
                <button
                  className="login-btn-outline"
                  onClick={handleOpenLogin}
                >
                  Iniciar sesión
                </button>
                <button
                  className="register-btn-solid"
                  onClick={handleOpenRegister}
                >
                  Registrarme
                </button>
              </div>
            ) : (
              /* PERFIL DE USUARIO DESPLEGABLE PROFESIONAL */
              <div className="user-profile-menu-container" ref={dropdownRef}>
                <button
                  className={`user-profile-btn ${isUserMenuOpen ? "active" : ""}`}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="user-avatar-badge">
                    <span className="user-initials">
                      {getUserInitials(user?.nombreCompleto)}
                    </span>
                    <span className="user-online-dot"></span>
                  </div>
                  <div className="user-profile-names">
                    <span className="user-greeting">
                      {user?.nombreCompleto.split(" ")[0]}
                    </span>
                    <span className={`user-role-chip role-${user?.rol.toLowerCase()}`}>
                      {user?.rol}
                    </span>
                  </div>
                  <span className={`user-chevron ${isUserMenuOpen ? "rotate" : ""}`}>▾</span>
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown-pro-menu">
                    {/* Header de la tarjeta del dropdown */}
                    <div className="pro-menu-user-header">
                      <div className="pro-user-avatar-lg">
                        {getUserInitials(user?.nombreCompleto)}
                      </div>
                      <div className="pro-user-details">
                        <strong className="pro-name">{user?.nombreCompleto}</strong>
                        <span className="pro-username">@{user?.nombreUsuario}</span>
                        <div className="pro-role-indicator">
                          <span className={`role-pill-sm role-${user?.rol.toLowerCase()}`}>
                            {getRoleTitle(user?.rol)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pro-menu-body">
                      {/* Opciones para Cliente */}
                      {user?.rol === "CLIENTE" && (
                        <>
                          <button
                            className="pro-dropdown-item"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onTabChange("my-orders");
                            }}
                          >
                            <span className="item-icon">📦</span>
                            <div className="item-text">
                              <strong>Mis Pedidos</strong>
                              <small>Historial y seguimiento en tiempo real</small>
                            </div>
                            {activeOrdersCount > 0 && (
                              <span className="pro-badge-count">{activeOrdersCount} activo</span>
                            )}
                          </button>

                          <button
                            className="pro-dropdown-item"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onTabChange("menu");
                            }}
                          >
                            <span className="item-icon">🥢</span>
                            <div className="item-text">
                              <strong>Explorar Carta</strong>
                              <small>Chaufas, combinados y platos al wok</small>
                            </div>
                          </button>
                        </>
                      )}

                      {/* Opciones para Personal Operativo */}
                      {user?.rol !== "CLIENTE" && (
                        <>
                          <button
                            className="pro-dropdown-item"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onTabChange("staff");
                            }}
                          >
                            <span className="item-icon">🏮</span>
                            <div className="item-text">
                              <strong>Mi Estación de Trabajo</strong>
                              <small>Operación asignada ({user?.rol})</small>
                            </div>
                          </button>

                          {user?.rol === "ADMINISTRADOR" && (
                            <button
                              className="pro-dropdown-item"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                onTabChange("admin-users");
                              }}
                            >
                              <span className="item-icon">👥</span>
                              <div className="item-text">
                                <strong>Gestión de Usuarios BD</strong>
                                <small>Crear y administrar accesos</small>
                              </div>
                            </button>
                          )}
                        </>
                      )}

                      <div className="pro-menu-divider"></div>

                      <button
                        className="pro-dropdown-item logout"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          onTabChange("menu");
                        }}
                      >
                        <span className="item-icon">🚪</span>
                        <div className="item-text">
                          <strong className="text-danger">Cerrar Sesión</strong>
                          <small>Finalizar turno o salir de tu cuenta</small>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón Carrito */}
            <button
              className="cart-toggle-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Ver carrito"
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-label">Pedido</span>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>

        {/* Barra secundaria: Búsqueda y Horario */}
        {activeTab === "menu" && (
          <div className="header-sub">
            <div className="restaurant-meta">
              <span className="badge-open">🟢 Abierto · Chifa Four Seas</span>
              <span className="meta-info">🛵 Entrega: 30-45 min</span>
              <span className="meta-info">⭐ 4.8 (500+ reseñas en Lima)</span>
            </div>

            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar chaufa, tallarín, chijaukay, wantán..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => onSearchChange("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal para cambiar dirección */}
      {isAddressModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div
            className="address-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>📍 ¿Dónde quieres recibir tu pedido?</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddressModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="address-form">
              <p className="address-form-desc">
                Ingresa tu dirección para mostrarte las tarifas exactas de delivery y tiempo de entrega.
              </p>
              <div className="input-group">
                <label htmlFor="addr_input">Dirección exacta</label>
                <input
                  id="addr_input"
                  type="text"
                  required
                  placeholder="Ej. Av. Javier Prado Este 2465, San Borja"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="address-quick-chips">
                <span className="chips-label">Distritos populares:</span>
                {[
                  "San Isidro, Lima",
                  "Miraflores, Lima",
                  "Lince, Lima",
                  "Jesús María, Lima",
                  "San Borja, Lima"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="address-chip"
                    onClick={() => setTempAddress(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <button type="submit" className="auth-primary-btn">
                Confirmar Ubicación
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
