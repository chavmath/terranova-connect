import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/rewards.css";
import Cookies from "js-cookie";

const RewardsPage = () => {
  const [user, setUser] = useState({
    nombre: "",
    puntos: 0,
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });
  const [recompensas, setRecompensas] = useState([]);
  const [recompensaSeleccionada, setRecompensaSeleccionada] = useState(null);
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);

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

  const userId = getCurrentUserId();

  // Obtener recompensas y puntos acumulados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");

        // 1. Obtener recompensas
        const resRecompensas = await fetch(
          "http://localhost:3000/recompensas",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const dataRecompensas = await resRecompensas.json();
        if (Array.isArray(dataRecompensas.recompensas)) {
          setRecompensas(dataRecompensas.recompensas);
        }

        // 2. Obtener usuario y puntos
        const resUsuario = await fetch(
          `http://localhost:3000/usuario/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const dataUsuario = await resUsuario.json();
        const {
          nombre,
          apellido,
          foto_perfil,
          puntosAcumulados = 0,
        } = dataUsuario;

        setUser({
          nombre: `${nombre} ${apellido}`,
          puntos: puntosAcumulados,
          avatar: foto_perfil?.[0]?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleReclamar = async () => {
    if (!recompensaSeleccionada) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3000/cajerRecompensa", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_recompensa: recompensaSeleccionada.id_recompensa,
        }),
      });

      if (res.ok) {
        setUser((prev) => ({
          ...prev,
          puntos: prev.puntos - recompensaSeleccionada.puntos,
        }));
        setRecompensaSeleccionada(null);
        setMostrarAnimacion(true);
        setTimeout(() => setMostrarAnimacion(false), 2500);
      } else {
        const err = await res.json();
        alert(`Error al reclamar recompensa: ${err.message || "Error"}`);
      }
    } catch (err) {
      console.error("Error al reclamar:", err);
      alert("No se pudo reclamar la recompensa.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Recompensas" />
      <main className="rewards-main">
        <div className="rewards-title-container">
          <h2 className="rewards-title">🎁 Recompensas</h2>
          <p className="rewards-title-subtitle">
            Mira los puntos que has acumulado y canjéalos por recompensas
          </p>
        </div>

        <div className="rewards-content-container">
          <div className="rewards-header">
            <img
              src={user.avatar}
              alt="avatar"
              className="rewards-avatar"
            />
            <div>
              <h2 className="rewards-nombre">{user.nombre}</h2>
              <p className="rewards-puntos">
                Puntos acumulados: <strong>{user.puntos}</strong>
              </p>
            </div>
          </div>

          <h3 className="rewards-subtitle">Canjea tus puntos</h3>
          <div className="canje-grid">
            {recompensas.map((r) => {
              const puedeReclamar = user.puntos >= r.puntosRequeridos;
              return (
                <div
                  key={r.id_recompensa}
                  className={`canje-card ${
                    !puedeReclamar ? "canje-disabled" : ""
                  }`}
                >
                  <div className="canje-icon">{r.icono || "🎁"}</div>
                  <h4 className="canje-nombre">{r.nombre}</h4>
                  <p className="canje-puntos">{r.puntosRequeridos} puntos</p>
                  <button
                    className="canje-boton"
                    disabled={!puedeReclamar}
                    onClick={() =>
                      puedeReclamar && setRecompensaSeleccionada(r)
                    }
                  >
                    Reclamar
                  </button>
                </div>
              );
            })}
          </div>

          {recompensaSeleccionada && (
            <div
              className="modal-rewards-overlay"
              onClick={() => setRecompensaSeleccionada(null)}
            >
              <div
                className="modal-rewards-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-rewards-close"
                  onClick={() => setRecompensaSeleccionada(null)}
                >
                  ✖
                </button>
                <h3>¿Deseas reclamar esta recompensa?</h3>
                <p>
                  <strong>{recompensaSeleccionada.nombre}</strong>
                </p>
                <p>{recompensaSeleccionada.descripcion}</p>
                <p>
                  Esto costará{" "}
                  <strong>
                    {recompensaSeleccionada.puntosRequeridos} puntos
                  </strong>
                </p>
                <div className="modal-rewards-buttons">
                  <button className="confirmar-boton" onClick={handleReclamar}>
                    Sí, reclamar
                  </button>
                  <button
                    className="cancelar-boton"
                    onClick={() => setRecompensaSeleccionada(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {mostrarAnimacion && (
        <div className="recompensa-animacion">
          🎉 ¡Recompensa reclamada con éxito!
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
