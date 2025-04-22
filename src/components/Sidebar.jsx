import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import {
  FaHome,
  FaTasks,
  FaUser,
  FaBullhorn,
  FaMedal,
  FaCog,
  FaCalendarAlt,
  FaChartBar,
  FaUserCircle,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import "../styles/sidebar.css";

// Extrae el "id" del JWT
const getCurrentUserId = () => {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const { id } = JSON.parse(atob(base64));
    return id;
  } catch {
    return null;
  }
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const token = Cookies.get("token");
  const userId = getCurrentUserId();

  useEffect(() => {
    if ((!token || !userId) && location.pathname !== "/") {
      navigate("/");
      return;
    }
    if (user) return;
    if (token && userId) {
      (async () => {
        try {
          const res = await fetch(`http://localhost:3000/usuario/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (!res.ok) throw new Error();
          const data = await res.json();
          setUser(data);
        } catch {
          if (location.pathname !== "/") navigate("/");
        }
      })();
    }
  }, [token, userId, location.pathname, navigate, user]);

  if (!user) {
    return (
      <aside className="sidebar">
        <div className="sidebar__top">
          <FaUserCircle className="sidebar__user-icon" />
          <span className="sidebar__email">Cargando...</span>
        </div>
      </aside>
    );
  }

  const { nombre, apellido, email, rol, foto_perfil } = user;
  const avatarUrl = foto_perfil?.[0]?.url || null;

  const itemsPorRol = {
    estudiante: [
      { label: "Inicio", path: "/dashboard", icon: <FaHome /> },
      { label: "Participar", path: "/participar", icon: <FaTasks /> },
      { label: "Mi perfil", path: "/perfil", icon: <FaUser /> },
      { label: "Publicaciones", path: "/publicaciones", icon: <FaBullhorn /> },
      { label: "Recompensas", path: "/recompensas", icon: <FaMedal /> },
      { label: "Calendario", path: "/calendario", icon: <FaCalendarAlt /> },
      { label: "Estadísticas", path: "/estadisticas", icon: <FaChartBar /> },
      { label: "Configuración", path: "/configuracion", icon: <FaCog /> },
    ],
    profesor: [
      { label: "Inicio", path: "/dashboard", icon: <FaHome /> },
      { label: "Publicaciones", path: "/publicaciones", icon: <FaBullhorn /> },
      { label: "Calendario", path: "/calendario", icon: <FaCalendarAlt /> },
    ],
    representante: [
      { label: "Inicio", path: "/dashboard", icon: <FaHome /> },
      { label: "Mi representado", path: "/perfil", icon: <FaUser /> },
      { label: "Calendario", path: "/calendario", icon: <FaCalendarAlt /> },
    ],
    administrador: [
      { label: "Configuración", path: "/configuracion", icon: <FaCog /> },
    ],
  };
  const items = itemsPorRol[rol.toLowerCase()] || [];

  // isActive ahora no marca "/perfil" si la ruta es "/perfil/:userId"
  const isActive = (path) => {
    if (path === "/perfil") {
      return location.pathname === "/perfil";
    }
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    // Para el resto, marcamos activo si coincide o si estamos en un subpath
    return (
      location.pathname === path ||
      (location.pathname.startsWith(path) && path !== "/perfil")
    );
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setUser(null);
    if (location.pathname !== "/") navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="sidebar__avatar" />
        ) : (
          <FaUserCircle className="sidebar__user-icon" />
        )}
        <div className="sidebar__user-info">
          <span className="sidebar__name">
            {nombre} {apellido}
          </span>
          <span className="sidebar__email">{email}</span>
        </div>
      </div>

      <div className="sidebar__content">
        <ul className="sidebar__menu">
          {items.map(({ label, path, icon }) => (
            <li key={label}>
              <Link
                to={path}
                className={`sidebar__item ${isActive(path) ? "active" : ""}`}
              >
                <span className="sidebar__icon">{icon}</span>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="sidebar__menu">
          <li>
            <button
              onClick={handleLogout}
              className="sidebar__item logout-item"
            >
              <span className="sidebar__icon">
                <FiLogOut />
              </span>
              <span>Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
