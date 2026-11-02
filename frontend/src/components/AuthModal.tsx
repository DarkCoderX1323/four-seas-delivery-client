import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    authModalReason,
    setAuthModalReason,
    login,
    register
  } = useAuth();

  // Login inputs
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register inputs
  const [regNombre, setRegNombre] = useState("");
  const [regUsuario, setRegUsuario] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regDireccion, setRegDireccion] = useState("");
  const [regDistrito, setRegDistrito] = useState("San Isidro");
  const [regPass, setRegPass] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(loginUser, loginPass);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || "Credenciales incorrectas.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await register({
      nombreCompleto: regNombre,
      nombreUsuario: regUsuario,
      telefono: regTelefono,
      direccion: regDireccion,
      distrito: regDistrito,
      password: regPass
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || "Error al registrar la cuenta.");
    }
  };

  const setQuickUser = (user: string) => {
    setLoginUser(user);
    setLoginPass("12345678");
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="auth-modal-header">
          <div className="auth-brand-logo">
            <span className="auth-logo-icon">🏮</span>
            <div>
              <h3>Four Seas Pedidos</h3>
              <span className="auth-brand-sub">四海酒家 · Acceso al Sistema</span>
            </div>
          </div>
          <button
            className="auth-close-btn"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {authModalReason && (
          <div className="auth-modal-notice">
            <span className="notice-icon">🔒</span>
            <p>{authModalReason}</p>
          </div>
        )}

        {/* Tabs estilo PedidosYa */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${authModalTab === "login" ? "active" : ""}`}
            onClick={() => {
              setAuthModalTab("login");
              setErrorMsg(null);
            }}
          >
            Iniciar sesión
          </button>
          <button
            className={`auth-tab-btn ${authModalTab === "register" ? "active" : ""}`}
            onClick={() => {
              setAuthModalTab("register");
              setErrorMsg(null);
            }}
          >
            Crear cuenta
          </button>
        </div>

        <div className="auth-modal-body">
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

          {authModalTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="login_user">Usuario o Correo *</label>
                <input
                  id="login_user"
                  type="text"
                  required
                  placeholder="ej. cliente_frecuente o recepcion"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label htmlFor="login_password">Contraseña *</label>
                <input
                  id="login_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-primary-btn"
              >
                {loading ? "Iniciando sesión..." : "Ingresar"}
              </button>

              {/* Accesos de prueba por roles para testear */}
              <div className="quick-access-box">
                <span className="quick-access-label">
                  ⚡ Ingreso rápido de prueba para evaluar cada rol:
                </span>
                <div className="quick-pills">
                  <button
                    type="button"
                    className="quick-pill"
                    onClick={() => setQuickUser("cliente_frecuente")}
                    title="Rol CLIENTE: Ver menú y mis pedidos"
                  >
                    👤 Cliente
                  </button>
                  <button
                    type="button"
                    className="quick-pill"
                    onClick={() => setQuickUser("recepcion")}
                    title="Rol RECEPCION: Tomar y confirmar pedidos"
                  >
                    🛎️ Recepción
                  </button>
                  <button
                    type="button"
                    className="quick-pill"
                    onClick={() => setQuickUser("cocina")}
                    title="Rol COCINA: Estación de wok KDS"
                  >
                    🍳 Cocina
                  </button>
                  <button
                    type="button"
                    className="quick-pill"
                    onClick={() => setQuickUser("motorizado")}
                    title="Rol MOTORIZADO: Despacho y entregas"
                  >
                    🛵 Motorizado
                  </button>
                  <button
                    type="button"
                    className="quick-pill"
                    onClick={() => setQuickUser("admin")}
                    title="Rol ADMINISTRADOR: Métricas y control total"
                  >
                    👑 Admin
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="reg_name">Nombre completo *</label>
                <input
                  id="reg_name"
                  type="text"
                  required
                  placeholder="Ej. Camila Navarro"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label htmlFor="reg_user">Nombre de usuario *</label>
                <input
                  id="reg_user"
                  type="text"
                  required
                  placeholder="Ej. camila_navarro"
                  value={regUsuario}
                  onChange={(e) => setRegUsuario(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="reg_phone">Celular para delivery *</label>
                <input
                  id="reg_phone"
                  type="tel"
                  required
                  placeholder="Ej. 987 654 321"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="reg_distrito">Distrito habitual *</label>
                <select
                  id="reg_distrito"
                  value={regDistrito}
                  onChange={(e) => setRegDistrito(e.target.value)}
                >
                  <option value="San Isidro">San Isidro</option>
                  <option value="Miraflores">Miraflores</option>
                  <option value="Lince">Lince</option>
                  <option value="Jesús María">Jesús María</option>
                  <option value="Magdalena del Mar">Magdalena del Mar</option>
                  <option value="Pueblo Libre">Pueblo Libre</option>
                  <option value="San Borja">San Borja</option>
                  <option value="Surquillo">Surquillo</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="reg_address">Dirección de entrega guardada</label>
                <input
                  id="reg_address"
                  type="text"
                  placeholder="Av. / Calle / N° / Dpto"
                  value={regDireccion}
                  onChange={(e) => setRegDireccion(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="reg_pass">Contraseña (mín. 6 caracteres) *</label>
                <input
                  id="reg_pass"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-primary-btn"
              >
                {loading ? "Creando cuenta..." : "Crear mi cuenta y continuar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
