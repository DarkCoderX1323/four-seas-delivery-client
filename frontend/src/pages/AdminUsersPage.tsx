import React, { useEffect, useState } from "react";
import { getUsers, registerUser } from "../services/user.service";
import type { User } from "../services/user.service";
import { MOCK_USERS } from "../services/mockData";

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [dbNotice, setDbNotice] = useState<string | null>(null);

  // Form states
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [rol, setRol] = useState("RECEPCION");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setDbNotice(null);
    try {
      const data = await getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
        setIsLiveApi(true);
      } else {
        throw new Error("Formato inválido");
      }
    } catch {
      // Si el backend no tiene conexión a PostgreSQL, usamos usuarios demo
      setUsers(MOCK_USERS);
      setIsLiveApi(false);
      setDbNotice(
        "El backend en Node.js está activo pero no puede comunicarse con PostgreSQL (revisa tu archivo backend/.env o el servicio de base de datos). Mostrando personal en modo demostración local."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (password.length < 8) {
      setFormError("La contraseña debe tener como mínimo 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLiveApi) {
        // Enviar al backend real
        await registerUser({
          nombreUsuario,
          nombreCompleto,
          rol,
          password
        });
        setFormSuccess(`Usuario "${nombreUsuario}" registrado en PostgreSQL con rol ${rol}.`);
        fetchUsers();
      } else {
        // Modo local simulado
        const newUser: User = {
          idUsuario: String(Date.now()).slice(-4),
          nombreUsuario,
          nombreCompleto,
          rol,
          activo: true
        };
        setUsers((prev) => [newUser, ...prev]);
        setFormSuccess(`[Modo Local] Usuario "${nombreUsuario}" agregado a la lista.`);
      }

      setNombreUsuario("");
      setNombreCompleto("");
      setPassword("");
      setRol("RECEPCION");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al crear usuario. Verifica los datos enviados.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMINISTRADOR":
        return "badge-admin";
      case "RECEPCION":
        return "badge-reception";
      case "COCINA":
        return "badge-kitchen";
      case "MOTORIZADO":
        return "badge-delivery";
      default:
        return "badge-default";
    }
  };

  return (
    <div className="admin-page">
      {/* Banner de estado */}
      <div className="api-status-banner">
        {isLiveApi ? (
          <span className="status-live">
            🟢 Conectado con PostgreSQL (API de usuarios en vivo)
          </span>
        ) : (
          <span className="status-mock">
            ℹ️ {dbNotice || "Modo demostración local"}
            <button className="retry-btn" onClick={fetchUsers}>
              🔄 Reintentar conexión con PostgreSQL
            </button>
          </span>
        )}
      </div>

      <div className="admin-header">
        <h2>👥 Gestión de Personal y Accesos</h2>
        <p className="admin-subtitle">
          Módulo integrado con el backend (Express & PostgreSQL) para la administración de roles:
          Administrador, Recepción, Cocina y Motorizado.
        </p>
      </div>

      <div className="admin-grid">
        {/* Formulario de Registro */}
        <section className="admin-card form-card">
          <h3>➕ Registrar Nuevo Usuario</h3>
          <p className="card-desc">Crea cuentas para el equipo operativo de Four Seas.</p>

          {formError && <div className="alert alert-error">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

          <form onSubmit={handleCreateUser} className="admin-form">
            <div className="input-group">
              <label htmlFor="usr_username">Nombre de usuario (Login) *</label>
              <input
                id="usr_username"
                type="text"
                required
                placeholder="ej. recepcion_turno1"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="usr_fullname">Nombre Completo *</label>
              <input
                id="usr_fullname"
                type="text"
                required
                placeholder="ej. Carlos Chang"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="usr_role">Rol Operativo *</label>
              <select
                id="usr_role"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <option value="ADMINISTRADOR">Administrador (Control total)</option>
                <option value="RECEPCION">Recepción (Tomar y verificar pedidos)</option>
                <option value="COCINA">Cocina (Preparación al wok)</option>
                <option value="MOTORIZADO">Motorizado (Entrega y despacho)</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="usr_pass">Contraseña (Mín. 8 caracteres) *</label>
              <input
                id="usr_pass"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-user-btn"
            >
              {isSubmitting ? "Guardando..." : "Guardar Usuario"}
            </button>
          </form>
        </section>

        {/* Listado de Usuarios */}
        <section className="admin-card list-card">
          <div className="list-card-header">
            <h3>📋 Personal Registrado ({users.length})</h3>
            <button className="refresh-btn" onClick={fetchUsers} title="Actualizar">
              🔄 Refrescar
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Consultando base de datos...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-users">
              <p>Aún no hay usuarios registrados.</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Nombre Completo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.idUsuario}>
                      <td>#{u.idUsuario}</td>
                      <td>
                        <strong>{u.nombreUsuario}</strong>
                      </td>
                      <td>{u.nombreCompleto}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(u.rol)}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td>
                        <span className={u.activo ? "status-dot-active" : "status-dot-inactive"}>
                          {u.activo ? "● Activo" : "○ Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
