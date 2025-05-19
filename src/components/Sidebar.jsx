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
  FaFolder,
  FaJediOrder,
  FaEmpire,
  FaRebel,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import "../styles/sidebar.css";
import { getUserRole, getToken } from "../utils/auth";

const getCurrentUserId = () => {
  const token = Cookies.get("token");
  if (!token) {
    console.log("Token no encontrado");
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decoded = JSON.parse(atob(base64));
    const userId = decoded.id_usuario || decoded.id;
    return userId || null;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const token = getToken();
  const userId = getCurrentUserId();
  const rol = getUserRole();

  useEffect(() => {
    // Asegurarse de que el token y userId estén disponibles
    if (!token || !userId) {
      // Si no estamos en la ruta raíz, redirigir solo si el usuario no está autenticado
      if (location.pathname !== "/") {
        navigate("/");
      }
      return;
    }
  
    // Si el user no está seteado, hacemos la petición
    if (!user) {
      // Si es administrador, obtener los datos a través del endpoint /usuario
      if (rol === "administrador") {
        (async () => {
          try {
            const res = await fetch(`https://kong-7df170cea7usbksss.kongcloud.dev/usuario/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setUser(data); // Establecer los datos del administrador
          } catch (error) {
            console.error("Error al obtener los datos del administrador:", error);
            // Si hay error en la consulta, redirigir a "/"
            if (location.pathname !== "/") {
              navigate("/");
            }
          }
        })();
      } else {
        // Si no es administrador, obtener los datos del usuario normal
        (async () => {
          try {
            const res = await fetch(`https://kong-7df170cea7usbksss.kongcloud.dev/usuario/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setUser(data);
          } catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
            // Si hay error en la consulta, redirigir a "/"
            if (location.pathname !== "/") {
              navigate("/");
            }
          }
        })();
      }
    }
  }, [token, userId, rol, user, location.pathname, navigate]);
  
  

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

  const { nombre, apellido, correo, rol: userRol, foto_perfil } = user;
  const avatarUrl = foto_perfil?.[0]?.url || null;

  const itemsPorRol = {
    estudiante: [
      { label: "Inicio", path: "/dashboard", icon: <FaHome /> },
      { label: "Participar", path: "/participar", icon: <FaTasks /> },
      { label: "Mi perfil", path: "/perfil", icon: <FaUser /> },
      { label: "Publicaciones", path: "/publicaciones", icon: <FaBullhorn /> },
      { label: "Recompensas", path: "/recompensas", icon: <FaMedal /> },
      { label: "Insignias", path: "/insignias", icon: <FaJediOrder /> },
      { label: "Calendario", path: "/calendario", icon: <FaCalendarAlt /> },
      { label: "Estadísticas", path: "/estadisticas", icon: <FaChartBar /> },
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
      {
        label: "Estadísticas",
        path: "/estadisticas-admin",
        icon: <FaChartBar />,
      },
      { label: "Evidencias", path: "/evidencias", icon: <FaFolder /> },
      { label: "Configuración", path: "/configuracion", icon: <FaCog /> },
    ],
  };

  const items = itemsPorRol[userRol?.toLowerCase?.()] || [];

  const isActive = (path) => {
    if (path === "/perfil") {
      return location.pathname === "/perfil";
    }
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
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
          <span className="sidebar__email">{correo}</span>
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
