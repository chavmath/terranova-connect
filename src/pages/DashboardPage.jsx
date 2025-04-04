import React from "react";
import Sidebar from "../components/Sidebar";
import logo from "../assets/logo_azul.png";
import "../styles/dashboard.css";
import { FaTasks, FaMedal, FaBullhorn } from "react-icons/fa";

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    email: "Matheo Chavez",
    role: "ESTUDIANTE",
  };

  const avatar = "https://i.pravatar.cc/100";

  const date = new Date();
  const hour = date.getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const formattedDate = date.toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Inicio" />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <img src={logo} alt="Terranova Logo" className="dashboard-logo" />
          <h1 className="dashboard-title">Terranova Connect</h1>
          <p className="dashboard-subtitle">{formattedDate}</p>
        </div>

        <div className="welcome-box">
          <img src={avatar} alt="Avatar" className="welcome-avatar" />
          <div>
            <h2 className="welcome-text">
              {greeting}, <strong>{user.email}</strong>
            </h2>
            <p className="role-text">
              Rol asignado: <strong>{user.role}</strong>
            </p>
          </div>
        </div>

        <div className="card-container">
          <div className="dashboard-card">
            <FaTasks className="icon" />
            <h3>Actividades</h3>
            <p>5 completadas</p>
          </div>
          <div className="dashboard-card">
            <FaMedal className="icon" />
            <h3>Insignias</h3>
            <p>3 obtenidas</p>
          </div>
          <div className="dashboard-card">
            <FaBullhorn className="icon" />
            <h3>Publicaciones</h3>
            <p>2 compartidas</p>
          </div>
        </div>

        {/* GRID DE CONTENIDO ADICIONAL */}
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h3 className="section-title">Actividades recientes</h3>
            <ul className="recent-list">
              <li>✔ Participación en Feria de Ciencias</li>
              <li>✔ Subió evidencia de proyecto ambiental</li>
              <li>✔ Recibió insignia “Creatividad”</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
