import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import logo from "../assets/logo_azul.png";
import "../styles/dashboard.css";
import { FaTasks, FaMedal, FaBullhorn } from "react-icons/fa";

// Decodifica el JWT y extrae el campo "id"
const getCurrentUserId = () => {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    const { id } = JSON.parse(decoded);
    return id;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = getCurrentUserId();
  const token = Cookies.get("token");

  useEffect(() => {
    // Si no hay token o no podemos extraer userId, volvemos al login
    if (!token || !userId) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // 1) Datos del usuario
        const resUser = await fetch(`http://localhost:3000/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!resUser.ok) throw new Error("Error al cargar usuario");
        const userData = await resUser.json();
        setUser(userData);

        // 2) Estadísticas
        const resStats = await fetch(
          `http://localhost:3000/usuario/${userId}/estadisticas`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        if (!resStats.ok) throw new Error("Error al cargar estadísticas");
        const statsData = await resStats.json();
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, userId, navigate]);

  if (loading) return;
  if (!user) return;

  // Desestructuramos las estadísticas (ajusta según tu API)
  const {
    actividadesCompletadas = 2,
    insigniasObtenidas = 3,
    publicacionesCompartidas = 1,
    actividadesRecientes = [
      "Participación en la feria de ciencias",
      "Taller de reciclaje",
      "Charla sobre cambio climático",
    ],
  } = stats || {};

  // Saludo y fecha
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const formattedDate = now.toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const avatarUrl = user.foto_perfil?.[0]?.url || "https://i.pravatar.cc/100";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Inicio" />

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <img src={logo} alt="Terranova Logo" className="dashboard-logo" />
          <h1 className="dashboard-title">Terranova Connect</h1>
          <p className="dashboard-subtitle">{formattedDate}</p>
        </div>

        {/* Bienvenida */}
        <div className="welcome-box">
          <img src={avatarUrl} alt="Avatar" className="welcome-avatar" />
          <div>
            <h2 className="welcome-text">
              {greeting},{" "}
              <strong>
                {user.nombre} {user.apellido}
              </strong>
            </h2>
            <p className="role-text">
              Rol asignado: <strong>{user.rol.toUpperCase()}</strong>
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="card-container">
          <div className="dashboard-card">
            <FaTasks className="icon" />
            <h3>Misiones</h3>
            <p>{actividadesCompletadas} completadas</p>
          </div>
          <div className="dashboard-card">
            <FaMedal className="icon" />
            <h3>Insignias</h3>
            <p>{insigniasObtenidas} obtenidas</p>
          </div>
          <div className="dashboard-card">
            <FaBullhorn className="icon" />
            <h3>Publicaciones</h3>
            <p>{publicacionesCompartidas} compartidas</p>
          </div>
        </div>

        {/* Actividades recientes */}
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h3 className="section-title">Actividades recientes</h3>
            <ul className="recent-list">
              {actividadesRecientes.length > 0 ? (
                actividadesRecientes.map((act, i) => <li key={i}>✔ {act}</li>)
              ) : (
                <li>No hay actividades recientes</li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
