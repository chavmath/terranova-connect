import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import logo from "../assets/logo_azul.png";
import "../styles/dashboard.css";
import { FaTasks, FaMedal, FaBullhorn } from "react-icons/fa";
import { PacmanLoader } from "react-spinners";
import slider1 from "../assets/colegio.jpg";
import slider2 from "../assets/estudiantes.jpg";
import slider3 from "../assets/JuraBandera1.jpg";

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
  const [missions, setMissions] = useState(null);
  const [badges, setBadges] = useState(null);
  /* const [posts, setPosts] = useState([]); */
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = getCurrentUserId();
  const token = Cookies.get("token");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 3000); // cambia cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!token || !userId) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // 1) Datos del usuario
        const resUser = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        if (!resUser.ok) throw new Error("Error al cargar usuario");
        const userData = await resUser.json();
        setUser(userData);

        // 3) Estadísticas de misiones
        const resMissions = await fetch(
          "https://kong-0c858408d8us2s9oc.kongcloud.dev/misiones-estadisticas",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resMissions.ok) throw new Error("Error al cargar misiones");
        const missionsData = await resMissions.json();
        setMissions(missionsData);

        // 4) Estadísticas de insignias
        const resBadges = await fetch(
          "https://kong-0c858408d8us2s9oc.kongcloud.dev/insignias-reclamadas-estadisticas",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resBadges.ok) throw new Error("Error al cargar insignias");
        const badgesData = await resBadges.json();
        setBadges(badgesData);

        // 5) Publicaciones
       /*  const resPosts = await fetch(
          "https://kong-0c858408d8us2s9oc.kongcloud.dev/mis-publicaciones",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resPosts.ok) throw new Error("Error al cargar publicaciones");
        const postsData = await resPosts.json();
        setPosts(postsData); */

        const resActivities = await fetch(
          "https://kong-0c858408d8us2s9oc.kongcloud.dev/actividades",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resActivities.ok) throw new Error("Error al cargar actividades");
        const activitiesData = await resActivities.json();

        const now = new Date();
        const upcomingActivities = activitiesData.filter((activity) => {
          const activityStartDate = new Date(activity.fechaInicio);
          return activityStartDate > now;
        });

        setActivities(upcomingActivities);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, userId, navigate]);

  if (loading)
    return (
      <div className="loading-container">
        <PacmanLoader color="#e67e22" size={40} />
      </div>
    );

  if (!user) return <div>Error al cargar los datos del usuario.</div>;

  const { misionesCompletadas = 0, misionesPendientes = 0 } = missions || {};

  const { reclamadas = 0, insigniasTotales = 0 } = badges || {};

 /*  const publicacionesCompartidas = posts.length; */

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

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

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

        <div className="dashboard-body">
          {/* Columna izquierda */}
          <div className="dashboard-column-left">
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

            <div className="card-row-inline">
              <div className="dashboard-card">
                <FaTasks className="icon" />
                <h3>Misiones Inscritas</h3>
                <p>
                  {misionesCompletadas} completadas de{" "}
                  {misionesCompletadas + misionesPendientes}
                </p>
              </div>
              <div className="dashboard-card">
                <FaMedal className="icon" />
                <h3>Insignias</h3>
                <p>
                  {reclamadas} reclamadas de {insigniasTotales}
                </p>
              </div>
            </div>

            <div className="dashboard-section actividades-box">
              <h3 className="section-title">Actividades próximas</h3>
              <ul className="recent-list">
                {activities.length > 0 ? (
                  activities.map((activity, i) => (
                    <li key={i}>
                      <strong>{activity.titulo}</strong>: {activity.descripcion}{" "}
                      - {formatDate(activity.fechaInicio)}
                    </li>
                  ))
                ) : (
                  <li>No hay actividades próximas</li>
                )}
              </ul>
            </div>
          </div>

          {/* Columna derecha con el slider */}
          <div className="dashboard-column-right">
            <div className="carousel-container">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {[slider1, slider2, slider3].map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    className="carousel-image"
                    alt={`slide-${index}`}
                  />
                ))}
              </div>
              <div className="carousel-dots">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={`dot ${currentIndex === index ? "active" : ""}`}
                    onClick={() => setCurrentIndex(index)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
