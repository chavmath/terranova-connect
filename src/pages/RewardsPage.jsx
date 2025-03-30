import React from "react";
import Sidebar from "../components/Sidebar";
import "../styles/rewards.css";
import { useState } from "react";

const RewardsPage = () => {
  const [user, setUser] = useState({
    nombre: "Matheo Chavez",
    puntos: 120,
    avatar: "https://i.pravatar.cc/150?img=10",
  });

  const recompensasDisponibles = [
    {
      id: 101,
      nombre: "Día libre de tarea",
      puntos: 100,
      icono: "📒",
    },
    {
      id: 102,
      nombre: "Bono de 5 puntos en examen",
      puntos: 200,
      icono: "🏅",
    },
    {
      id: 103,
      nombre: "Almuerzo gratis en la cafetería",
      puntos: 150,
      icono: "🍔",
    },
    {
      id: 104,
      nombre: "Pase para llegar tarde",
      puntos: 50,
      icono: "⏰",
    },
  ];

  /* const [selectedReward, setSelectedReward] = useState(null); */
  const [recompensaSeleccionada, setRecompensaSeleccionada] = useState(null);
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);
  const handleReclamar = () => {
    if (!recompensaSeleccionada) return;

    // Descontar puntos
    const nuevosPuntos = user.puntos - recompensaSeleccionada.puntos;
    setUser({ ...user, puntos: nuevosPuntos });

    // Ocultar modal, mostrar animación
    setRecompensaSeleccionada(null);
    setMostrarAnimacion(true);

    // Ocultar animación después de 2.5s
    setTimeout(() => {
      setMostrarAnimacion(false);
    }, 2500);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Recompensas" />

      <main className="rewards-main">
        <div className="rewards-title-container">
          <h2 className="rewards-title">
            <span className="emoji"></span> Recompensas
          </h2>
          <p className="rewards-title-subtitle">
            Mira los puntos que has acumulado y canjealos por recompensas
          </p>
        </div>

        <div className="rewards-content-container">
          <div className="rewards-header">
            <img src={user.avatar} alt="avatar" className="rewards-avatar" />
            <div>
              <h2 className="rewards-nombre">{user.nombre}</h2>
              <p className="rewards-puntos">
                Puntos acumulados: <strong>{user.puntos}</strong>
              </p>
            </div>
          </div>

          <h3 className="rewards-subtitle">Canjea tus puntos</h3>
          <div className="canje-grid">
            {recompensasDisponibles.map((r) => {
              const puedeReclamar = user.puntos >= r.puntos;

              return (
                <div
                  key={r.id}
                  className={`canje-card ${
                    !puedeReclamar ? "canje-disabled" : ""
                  }`}
                >
                  <div className="canje-icon">{r.icono}</div>
                  <h4 className="canje-nombre">{r.nombre}</h4>
                  <p className="canje-puntos">{r.puntos} puntos</p>
                  <button
                    className="canje-boton"
                    disabled={!puedeReclamar}
                    onClick={() =>
                      puedeReclamar && setRecompensaSeleccionada(r)
                    }
                  >
                    Reclamar 🎁
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
                <p>
                  Esto costará{" "}
                  <strong>{recompensaSeleccionada.puntos} puntos</strong>
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
