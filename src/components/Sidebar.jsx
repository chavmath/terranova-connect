import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
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

const Sidebar = ({ active }) => {
  const navigate = useNavigate();
  const userEmail = "Matheo Chavez";

  const items = [
    { label: "Inicio", path: "/dashboard", icon: <FaHome /> },
    {
      label: "Participar en actividades",
      path: "/participar",
      icon: <FaTasks />,
    },
    { label: "Mi perfil", path: "/perfil", icon: <FaUser /> },
    { label: "Publicaciones", path: "/publicaciones", icon: <FaBullhorn /> },
    { label: "Recompensas", path: "/recompensas", icon: <FaMedal /> },
    { label: "Configuración", path: "/configuracion", icon: <FaCog /> },
    {
      label: "Calendario de actividades",
      path: "/calendario",
      icon: <FaCalendarAlt />,
    },
    { label: "Estadísticas", path: "/estadisticas", icon: <FaChartBar /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <FaUserCircle className="sidebar__user-icon" />
        <span className="sidebar__email">{userEmail}</span>
      </div>

      <div className="sidebar__content">
        <ul className="sidebar__menu">
          {items.map(({ label, path, icon }) => (
            <li key={label}>
              <Link
                to={path}
                className={`sidebar__item ${label === active ? "active" : ""}`}
              >
                <span className="sidebar__icon">{icon}</span>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="sidebar__menu">
          <li key="logout">
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
