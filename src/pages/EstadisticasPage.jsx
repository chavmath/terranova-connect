import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import "../styles/estadisticas.css";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const EstadisticasPage = () => {
  const [participaciones, setParticipaciones] = useState([]);
  const [, setUsuarios] = useState([]);
  const [misiones, setMisiones] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const token = Cookies.get("token");

  useEffect(() => {
    obtenerParticipaciones();
    obtenerUsuarios();
    obtenerMisiones();
    obtenerPublicaciones();
  }, []);

  // Obtener las participaciones del usuario
  const obtenerParticipaciones = async () => {
    try {
      const res = await fetch("http://localhost:3000/participaciones", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      setParticipaciones(data);
    } catch (error) {
      console.error("Error al obtener participaciones:", error);
    }
  };

  // Obtener los usuarios
  const obtenerUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3000/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  // Obtener las misiones
  const obtenerMisiones = async () => {
    try {
      const res = await fetch("http://localhost:3000/misiones", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      setMisiones(data.misiones);
    } catch (error) {
      console.error("Error al obtener misiones:", error);
    }
  };

  // Obtener las publicaciones
  const obtenerPublicaciones = async () => {
    try {
      const res = await fetch("http://localhost:3000/publicaciones", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      setPublicaciones(data);
    } catch (error) {
      console.error("Error al obtener publicaciones:", error);
    }
  };

  // Gráfico de barras - Ranking de actividades que más puntos otorgan
  const barData = {
    labels: misiones.map((mision) => mision.titulo),
    datasets: [
      {
        label: "Puntos por Misión",
        data: misiones.map((mision) => mision.puntos),
        backgroundColor: "#e67e22",
        borderColor: "#d35400",
        borderWidth: 1,
      },
    ],
  };

  // Gráfico circular - Publicación con más Likes
  const pieData = {
    labels: ["Publicación 1", "Publicación 2"],
    datasets: [
      {
        label: "Likes por Publicación",
        data: [12, 26],
        backgroundColor: ["#f39c12", "#27ae60"],
        hoverOffset: 4,
      },
    ],
  };

  // Gráfico de líneas - Participaciones por mes
  const lineData = {
    labels: participaciones.map((part) => part.mes),
    datasets: [
      {
        label: "Participaciones por Mes",
        data: participaciones.map((part) => part.cantidad),
        borderColor: "#031f7b",
        backgroundColor: "rgba(3, 31, 123, 0.2)",
        tension: 0.1,
      },
    ],
  };

  // Publicación con más comentarios (agregar verificación si la lista está vacía)
  const publicacionConMasComentarios = publicaciones.reduce(
    (prev, current) =>
      prev.comentarios > current.comentarios ? prev : current,
    { comentarios: 0 }
  );

  // Publicación con más likes (agregar verificación si la lista está vacía)
  const publicacionConMasLikes = publicaciones.reduce(
    (prev, current) => (prev.likes > current.likes ? prev : current),
    { likes: 0 }
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Estadísticas" />

      <div className="estadisticas-main">
        <div className="estadisticas-title-container">
          <h2 className="estadisticas-title">Estadísticas de Participación</h2>
          <p className="estadisticas-subtitle">
            Análisis de tus Interacciones con la Plataforma
          </p>
        </div>
        <div className="estadisticas-description">
          {/* Gráfico de barras - Participaciones por Actividad */}
          <div className="estadisticas-chart">
            <h3>Misiones Participadas (Puntos)</h3>
            <Bar data={barData} options={{ responsive: true }} />
          </div>

          {/* Gráfico circular - Publicación con más Likes */}
          <div className="estadisticas-chart">
            <h3>Publicación con Más Likes</h3>
            <Pie data={pieData} options={{ responsive: true }} />
          </div>

          {/* Gráfico de líneas - Participaciones por Mes */}
          <div className="estadisticas-chart">
            <h3>Participaciones por Mes</h3>
            <Line data={lineData} options={{ responsive: true }} />
          </div>

          {/* Publicación con más Comentarios */}
          <div className="estadisticas-card">
            <h3>Publicación con Más Comentarios</h3>
            <p>{publicacionConMasComentarios.descripcion}</p>
            <p>{`Comentarios: ${publicacionConMasComentarios.comentarios}`}</p>
          </div>

          {/* Publicación con más Likes */}
          <div className="estadisticas-card">
            <h3>Publicación con Más Likes</h3>
            <p>{publicacionConMasLikes.descripcion}</p>
            <p>{`Likes: ${publicacionConMasLikes.likes}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPage;
