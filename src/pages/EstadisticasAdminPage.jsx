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
import "../styles/estadisticasAdmin.css";
import ChartDataLabels from "chartjs-plugin-datalabels";
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
  LineElement,
  ChartDataLabels
);

const EstadisticasPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  /* const [misiones, setMisiones] = useState([]); */
  const [publicaciones, setPublicaciones] = useState([]);
  const token = Cookies.get("token");
  const [recompensas, setRecompensas] = useState([]);
  const [autorPublicacion, setAutorPublicacion] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [canjes, setCanjes] = useState([]);
  const [mostrarTodosUsuarios, setMostrarTodosUsuarios] = useState(false);
  const [mostrarTodosIngresos, setMostrarTodosIngresos] = useState(false);

  useEffect(() => {
    obtenerUsuarios();
    /* obtenerMisiones(); */
    obtenerPublicaciones();
    obtenerRecompensas();
    obtenerRanking();
    obtenerCanjes();
  }, []);

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

 /*  const obtenerMisiones = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/misiones/admin",
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
  }; */

  const obtenerPublicaciones = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones",
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

  const obtenerRecompensas = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/recompensas/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setRecompensas(data.recompensas || []);
    } catch (error) {
      console.error("Error al obtener recompensas:", error);
    }
  };
  const obtenerRanking = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/ranking",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setRanking(data.ranking);
    } catch (error) {
      console.error("Error al obtener ranking de usuarios:", error);
    }
  };
  const obtenerCanjes = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/canjes",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCanjes(data);
    } catch (error) {
      console.error("Error al obtener canjes:", error);
    }
  };

  const recompensasRanking = [...recompensas]
    .map((rec) => ({
      ...rec,
      totalReclamada:
        rec.historialReclamos?.reduce(
          (sum, reclamo) => sum + (reclamo.cantidadReclamada || 0),
          0
        ) || 0,
    }))
    .sort((a, b) => b.totalReclamada - a.totalReclamada);

  const barColors = getColorPalette(recompensasRanking.length);

  const recompensasBarData = {
    labels: recompensasRanking.map((r) => r.nombre),
    datasets: [
      {
        label: "Veces reclamada",
        data: recompensasRanking.map((r) => r.totalReclamada),
        backgroundColor: barColors,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const recompensasBarOptions = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "center",
        align: "right",
        color: "#2d3436",
        font: { weight: "bold" },
        formatter: (value) => `${value}`,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const r = recompensasRanking[context.dataIndex];
            return [
              `Cantidad reclamada: ${r.totalReclamada}`,
              `Descripción: ${r.descripcion}`,
              `Puntos requeridos: ${r.puntosRequeridos}`,
              `Disponible: ${r.cantidadDisponible}`,
            ];
          },
        },
      },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  const rankingBarColors = getColorPalette(ranking.length);

  const barDataRanking = {
    labels: ranking.map((user) => `${user.nombre} ${user.apellido}`),
    datasets: [
      {
        label: "Puntos Acumulados por Usuario",
        data: ranking.map((user) => user.puntosAcumulados),
        backgroundColor: rankingBarColors,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const barOptionsRanking = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "center",
        align: "right",
        color: "#222",
        font: { weight: "bold" },
        formatter: (value) => `${value}`,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const u = ranking[context.dataIndex];
            return [
              `Puntos: ${u.puntosAcumulados}`,
              `Usuario: ${u.nombre} ${u.apellido}`,
              `Rol: ${u.rol || "N/A"}`,
            ];
          },
        },
      },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  function getColorPalette(n) {
    const baseColors = [
      "#6c5ce7",
      "#00b894",
      "#fdcb6e",
      "#e17055",
      "#00cec9",
      "#fab1a0",
      "#0984e3",
      "#d35400",
      "#b2bec3",
      "#a29bfe",
      "#81ecec",
      "#ffeaa7",
      "#636e72",
      "#fd79a8",
      "#2d3436",
      "#fdcb6e",
      "#00b894",
    ];
    while (baseColors.length < n) {
      baseColors.push(...baseColors);
    }
    return baseColors.slice(0, n);
  }

  const publicacionConMasLikes = publicaciones.reduce(
    (prev, current) => (prev.likes > current.likes ? prev : current),
    { likes: 0 }
  );

  useEffect(() => {
    const getAutor = async () => {
      if (publicacionConMasLikes && publicacionConMasLikes.autorId) {
        try {
          const res = await fetch(
            `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${publicacionConMasLikes.autorId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          const data = await res.json();
          setAutorPublicacion(data);
        } catch (err) {
          console.error("Error al obtener el autor de la publicación:", err);
          setAutorPublicacion(null);
        }
      }
    };
    getAutor();
  }, [publicacionConMasLikes, token]);

  const conteoPorUsuario = canjes.reduce((acc, canje) => {
    const nombreCompleto = `${canje.nombre} ${canje.apellido}`;
    acc[nombreCompleto] = (acc[nombreCompleto] || 0) + 1;
    return acc;
  }, {});

  const usuariosOrdenados = Object.entries(conteoPorUsuario).sort(
    ([, a], [, b]) => b - a
  );

  const usuariosRankingLista = mostrarTodosUsuarios
    ? usuariosOrdenados
    : usuariosOrdenados.slice(0, 3);

  const usuariosConSesiones = usuarios.map((usuario) => {
    const totalSesiones = usuario.sesionesIniciadas?.reduce(
      (sum, sesion) => sum + (sesion.contador || 0),
      0
    );
    return { ...usuario, totalSesiones };
  });

  const rankingSesiones = usuariosConSesiones.sort(
    (a, b) => b.totalSesiones - a.totalSesiones
  );

  const top3Sesiones = rankingSesiones
    .filter((u) => u.totalSesiones > 0)
    .slice(0, 3);

  const listaRankingSesiones = mostrarTodosIngresos
    ? rankingSesiones
    : top3Sesiones;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Estadísticas" />

      <div className="estadisticas-admin-main">
        <div className="estadisticas-admin-title-container">
          <h2 className="estadisticas-admin-title">Estadísticas de Participación</h2>
          <p className="estadisticas-admin-subtitle">
            Análisis de las participaciones de los usuarios
          </p>
        </div>
        <div className="estadisticas-admin-description">
          {/* Gráfico de barras - Ranking de Usuarios por Puntos Acumulados */}
          <div className="estadisticas-admin-chart">
            <h3>Ranking de Usuarios por Puntos Acumulados</h3>
            <div className="chart-scrollable">
              <Bar
                data={barDataRanking}
                options={barOptionsRanking}
                height={null}
              />
            </div>
          </div>

          {/* Gráfico de barras - Ranking de Usuarios por Ingresos */}
          <div className="estadisticas-admin-card estadisticas-admin-card-ranking">
            <h3>Usuarios con Más Ingresos</h3>
            <button
              className="toggle-ranking-btn"
              onClick={() => setMostrarTodosIngresos((prev) => !prev)}
            >
              {mostrarTodosIngresos ? "Mostrar solo Top 3" : "Mostrar Todos"}
            </button>
            <ol
              className="ranking-usuarios-lista"
              key={mostrarTodosIngresos ? "full" : "top3"}
            >
              {listaRankingSesiones.map((usuario, idx) => (
                <li
                  key={usuario._id}
                  className={`ranking-usuario-item ${idx === 0 ? "top" : ""}`}
                >
                  {usuario.foto_perfil && usuario.foto_perfil.length > 0 && (
                    <img
                      src={usuario.foto_perfil[0].url}
                      alt={usuario.nombre}
                      className="publicacion-autor-img"
                      style={{ width: 32, height: 32, marginRight: 8 }}
                    />
                  )}
                  <span className="ranking-posicion">{idx + 1}</span>
                  <span className="ranking-nombre">
                    {usuario.nombre} {usuario.apellido}
                  </span>
                  <span className="ranking-cantidad">
                    {usuario.totalSesiones} ingresos
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Gráfico de barras - Ranking de Recompensas Más Reclamadas */}
          <div className="estadisticas-admin-chart">
            <h3>Ranking de Recompensas Más Reclamadas</h3>
            <div className="chart-scrollable">
              <Bar
                data={recompensasBarData}
                options={{
                  ...recompensasBarOptions,
                  maintainAspectRatio: false,
                }}
                height={null}
              />
            </div>
          </div>

          {/* Ranking de Usuarios con Más Canjeos */}
          <div className="estadisticas-admin-card estadisticas-admin-card-ranking">
            <h3>Ranking de Usuarios con Más Canjeos</h3>

            <button
              className="toggle-ranking-btn"
              onClick={() => setMostrarTodosUsuarios((prev) => !prev)}
            >
              {mostrarTodosUsuarios ? "Mostrar solo Top 3" : "Mostrar Todos"}
            </button>

            <ol
              className={`ranking-usuarios-lista${
                mostrarTodosUsuarios ? "" : ""
              }`}
              key={mostrarTodosUsuarios ? "full" : "top3"}
            >
              {usuariosRankingLista.map(([nombre, cantidad], idx) => (
                <li
                  key={nombre}
                  className={`ranking-usuario-item ${idx === 0 ? "top" : ""}`}
                >
                  <span className="ranking-posicion">{idx + 1}</span>
                  <span className="ranking-nombre">{nombre}</span>
                  <span className="ranking-cantidad">{cantidad} canjeos</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Publicación con Más Likes */}
          <div className="estadisticas-admin-card estadisticas-admin-card-publicacion">
            <h3>Publicación con Más Likes</h3>
            {publicacionConMasLikes && (
              <div className="publicacion-contenido">
                {publicacionConMasLikes.imagenes?.length > 0 && (
                  <img
                    src={publicacionConMasLikes.imagenes[0].url}
                    alt="Imagen de la publicación"
                    className="publicacion-img"
                  />
                )}
                <div className="publicacion-descripcion">
                  {publicacionConMasLikes.descripcion || "Sin descripción"}
                </div>
                <div className="publicacion-row">
                  {autorPublicacion ? (
                    <div className="publicacion-autor">
                      <img
                        src={autorPublicacion.foto_perfil?.[0]?.url}
                        alt="Foto de perfil"
                        className="publicacion-autor-img"
                      />
                      <span className="publicacion-autor-nombre">
                        {autorPublicacion.nombre} {autorPublicacion.apellido}
                      </span>
                    </div>
                  ) : (
                    <div className="publicacion-autor">
                      <span className="publicacion-autor-nombre">
                        Autor: Desconocido
                      </span>
                    </div>
                  )}
                  <div className="publicacion-likes">
                    <span role="img" aria-label="likes" className="like-emoji">
                      👍
                    </span>
                    <span className="publicacion-likes-cantidad">
                      {publicacionConMasLikes.cantidadLikes || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPage;
