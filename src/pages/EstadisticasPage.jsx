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
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ChartDataLabels
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
  const [notaEngagement, setNotaEngagement] = useState(null);
  const [recomendacionesEngagement, setRecomendacionesEngagement] = useState(
    []
  );
  const [notaAtencion, setNotaAtencion] = useState(null);
  const [recomendacionesAtencion, setRecomendacionesAtencion] = useState([]);

  const token = Cookies.get("token");

  useEffect(() => {
    obtenerEstadisticas();
    obtenerUsuarios();
    obtenerMisiones();
    obtenerPublicaciones();
    obtenerEstadisticasNotas();
    obtenerAtencionConcentracion();
  }, []);

  const obtenerEstadisticas = async () => {
    try {
      const insigniasRes = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/insignias-reclamadas-estadisticas",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const canjesRes = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/canjes-estadisticas",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const misionesRes = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/misiones-estadisticas",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const puntosRes = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/puntos-acumulados-estadisticas",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rankingRes = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/ranking",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/usuarios",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const obtenerMisiones = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/misiones",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setMisiones(data.misiones);
    } catch (error) {
      console.error("Error al obtener misiones:", error);
    }
  };

  const obtenerPublicaciones = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/mis-publicaciones",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setPublicaciones(data);
    } catch (error) {
      console.error("Error al obtener publicaciones:", error);
    }
  };
  const obtenerEstadisticasNotas = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/estadisticas-notas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setNotaEngagement(data.notaEngagement);
      setRecomendacionesEngagement(data.recomendaciones);
    } catch (error) {
      console.error("Error al obtener nota de engagement:", error);
    }
  };

  const obtenerAtencionConcentracion = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/atencion-concentracion",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setNotaAtencion(data.notaAtencionConcentracion);
      setRecomendacionesAtencion(data.recomendaciones);
    } catch (error) {
      console.error("Error al obtener atención y concentración:", error);
    }
  };

  const publicacionConMasLikes = publicaciones.reduce(
    (prev, current) => (prev.likes > current.likes ? prev : current),
    { likes: 0 }
  );

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

  const donutOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        color: "#ffffff",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (a, b) => a + b,
            0
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
      },
      legend: {
        position: "bottom",
        labels: {
          color: "#031f7b",
          font: { size: 14 },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        anchor: "center",
        align: "center",
        color: "#031f7b",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: Math.round,
      },
      legend: {
        labels: {
          color: "#031f7b",
          font: { size: 13 },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#444",
          font: { size: 12 },
        },
      },
      x: {
        ticks: {
          color: "#444",
          font: { size: 12 },
        },
      },
    },
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
          <div className="estadisticas-chart">
            <h3>Porcentaje de Insignias Reclamadas</h3>
            <Doughnut data={donutDataInsignias} options={donutOptions} />
          </div>

          <div className="estadisticas-chart">
            <h3>Porcentaje de Canjes Realizados</h3>
            <Doughnut data={donutDataCanjes} options={donutOptions} />
          </div>

          <div className="estadisticas-chart">
            <h3>Misiones Completadas vs Pendientes</h3>
            <Bar data={barDataMisiones} options={barOptions} />
          </div>

          <div className="estadisticas-chart">
            <h3>Puntos Acumulados</h3>
            <Bar data={barDataPuntos} options={barOptions} />
          </div>

          <div className="estadisticas-chart">
            <h3>Ranking de Usuarios</h3>
            <Bar data={barDataRanking} options={barOptions} />
          </div>

          <div className="estadisticas-card">
            <h3>Publicación con Más Likes</h3>

            <p className="descripcion">
              {publicacionConMasLikes.descripcion ||
                "Descripción no disponible"}
            </p>

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
            <p className="contador-likes">
              {`Likes: ${publicacionConMasLikes.likes.length}`}
            </p>
          </div>
          <div className="estadisticas-card">
            <h3>Nota General en la Plataforma</h3>
            <p
              style={{
                fontSize: "2.5rem",
                color: "#27ae60",
                fontWeight: "bold",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {notaEngagement ?? "Cargando..."}
            </p>
            <ul style={{ paddingLeft: "1rem", color: "#333" }}>
              {recomendacionesEngagement.map((rec, i) => (
                <li key={i} style={{ marginBottom: "0.5rem" }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="estadisticas-card">
            <h3>Atención y Concentración</h3>
            <p
              style={{
                fontSize: "2.5rem",
                color: "#f39c12",
                fontWeight: "bold",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {notaAtencion ?? "Cargando..."}
            </p>
            <ul style={{ paddingLeft: "1rem", color: "#333" }}>
              {recomendacionesAtencion.map((rec, i) => (
                <li key={i} style={{ marginBottom: "0.5rem" }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPage;
