import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
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
  const [, setUsuarios] = useState([]);
  const [, setMisiones] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [insigniasReclamadas, setInsigniasReclamadas] = useState(null);
  const [canjesEstadisticas, setCanjesEstadisticas] = useState(null);
  const [misionesEstadisticas, setMisionesEstadisticas] = useState(null);
  const [puntosAcumulados, setPuntosAcumulados] = useState(null);
  const [ranking, setRanking] = useState([]);
  const token = Cookies.get("token");

  useEffect(() => {
    obtenerEstadisticas();
    obtenerUsuarios();
    obtenerMisiones();
    obtenerPublicaciones();
  }, []);

  // Obtener las estadísticas
  const obtenerEstadisticas = async () => {
    try {
      const insigniasRes = await fetch(
        "https://kong-7df170cea7usbksss.kongcloud.dev/insignias-reclamadas-estadisticas",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const canjesRes = await fetch(
        "https://kong-7df170cea7usbksss.kongcloud.dev/canjes-estadisticas",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const misionesRes = await fetch(
        "https://kong-7df170cea7usbksss.kongcloud.dev/misiones-estadisticas",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const puntosRes = await fetch(
        "https://kong-7df170cea7usbksss.kongcloud.dev/puntos-acumulados-estadisticas",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rankingRes = await fetch("https://kong-7df170cea7usbksss.kongcloud.dev/ranking", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const insigniasData = await insigniasRes.json();
      const canjesData = await canjesRes.json();
      const misionesData = await misionesRes.json();
      const puntosData = await puntosRes.json();
      const rankingData = await rankingRes.json();

      setInsigniasReclamadas(insigniasData);
      setCanjesEstadisticas(canjesData);
      setMisionesEstadisticas(misionesData);
      setPuntosAcumulados(puntosData);
      setRanking(rankingData.ranking);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    }
  };

  // Obtener los usuarios
  const obtenerUsuarios = async () => {
    try {
      const res = await fetch("https://kong-7df170cea7usbksss.kongcloud.dev/usuarios", {
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
      const res = await fetch("https://kong-7df170cea7usbksss.kongcloud.dev/misiones", {
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
      const res = await fetch("https://kong-7df170cea7usbksss.kongcloud.dev/mis-publicaciones", {
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

  // Publicación con más likes
  const publicacionConMasLikes = publicaciones.reduce(
    (prev, current) => (prev.likes > current.likes ? prev : current),
    { likes: 0 }
  );

  // Gráfico de Dona - Porcentaje de Insignias Reclamadas
  const donutDataInsignias = {
    labels: ["Reclamadas", "No Reclamadas"],
    datasets: [
      {
        data: [
          insigniasReclamadas?.reclamadas || 0,
          insigniasReclamadas?.insigniasTotales -
            insigniasReclamadas?.reclamadas || 0,
        ],
        backgroundColor: ["#27ae60", "#e74c3c"],
        hoverOffset: 4,
      },
    ],
  };

  // Gráfico de Dona - Porcentaje de Canjes Realizados
  const donutDataCanjes = {
    labels: ["Realizados", "Disponibles"],
    datasets: [
      {
        data: [
          canjesEstadisticas?.canjesRealizados || 0,
          canjesEstadisticas?.recompensasDisponibles -
            canjesEstadisticas?.canjesRealizados || 0,
        ],
        backgroundColor: ["#031f7b", "#f39c12"],
        hoverOffset: 4,
      },
    ],
  };

  // Gráfico de barras apiladas - Misiones Completadas vs Pendientes
  const barDataMisiones = {
    labels: ["Misiones"],
    datasets: [
      {
        label: "Completadas",
        data: [misionesEstadisticas?.misionesCompletadas || 0],
        backgroundColor: "#27ae60",
      },
      {
        label: "Pendientes",
        data: [misionesEstadisticas?.misionesPendientes || 0],
        backgroundColor: "#e74c3c",
      },
    ],
  };

  // Gráfico de barras - Puntos Acumulados
  const barDataPuntos = {
    labels: ["Puntos Acumulados"],
    datasets: [
      {
        label: "Puntos",
        data: [puntosAcumulados?.puntosAcumulados || 0],
        backgroundColor: "#2980b9",
      },
    ],
  };

  // Gráfico de barras - Ranking de Usuarios
  const barDataRanking = {
    labels: ranking.map((user) => `${user.nombre} ${user.apellido}`),
    datasets: [
      {
        label: "Puntos Acumulados por Usuario",
        data: ranking.map((user) => user.puntosAcumulados),
        backgroundColor: "#3498db",
        borderColor: "#2980b9",
        borderWidth: 1,
      },
    ],
  };

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
          {/* Gráfico de Dona - Insignias Reclamadas */}
          <div className="estadisticas-chart">
            <h3>Porcentaje de Insignias Reclamadas</h3>
            <Doughnut
              data={donutDataInsignias}
              options={{ responsive: true }}
            />
          </div>

          {/* Gráfico de Dona - Canjes Realizados */}
          <div className="estadisticas-chart">
            <h3>Porcentaje de Canjes Realizados</h3>
            <Doughnut data={donutDataCanjes} options={{ responsive: true }} />
          </div>

          {/* Gráfico de barras apiladas - Misiones Completadas vs Pendientes */}
          <div className="estadisticas-chart">
            <h3>Misiones Completadas vs Pendientes</h3>
            <Bar data={barDataMisiones} options={{ responsive: true }} />
          </div>

          {/* Gráfico de barras - Puntos Acumulados */}
          <div className="estadisticas-chart">
            <h3>Puntos Acumulados</h3>
            <Bar data={barDataPuntos} options={{ responsive: true }} />
          </div>

          {/* Gráfico de barras - Ranking de Usuarios */}
          <div className="estadisticas-chart">
            <h3>Ranking de Usuarios</h3>
            <Bar data={barDataRanking} options={{ responsive: true }} />
          </div>

          {/* Publicación con Más Likes */}
          <div className="estadisticas-card">
            <h3>Publicación con Más Likes</h3>

            {/* Verificamos si la publicación tiene descripción y mostramos */}
            <p className="descripcion">
              {publicacionConMasLikes.descripcion ||
                "Descripción no disponible"}
            </p>

            {/* Si la publicación tiene imágenes, mostramos la primera imagen como previsualización */}
            {publicacionConMasLikes.imagenes &&
              publicacionConMasLikes.imagenes.length > 0 && (
                <div className="previsualizacion-imagen">
                  <img
                    src={publicacionConMasLikes.imagenes[0].url}
                    alt="Previsualización"
                    className="imagen-publicacion"
                  />
                </div>
              )}

            {/* Contador de Likes */}
            <p className="contador-likes">
              {`Likes: ${publicacionConMasLikes.likes.length}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPage;
