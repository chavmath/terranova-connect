import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/rewards.css";
import Cookies from "js-cookie";
import confetti from "canvas-confetti";

const RewardsPage = () => {
  const [user, setUser] = useState({
    nombre: "",
    puntos: 0,
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });
  const [recompensas, setRecompensas] = useState([]);
  const [recompensaSeleccionada, setRecompensaSeleccionada] = useState(null);
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);
  const [mostrarOverlayFelicidades, setMostrarOverlayFelicidades] =
    useState(false);
  const [recompensaReclamada, setRecompensaReclamada] = useState(null);
  const [loadingReclamar, setLoadingReclamar] = useState(false);
  const [recompensasReclamadas, setRecompensasReclamadas] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");

        const resRecompensas = await fetch(
          "https://kong-0c858408d8us2s9oc.kongcloud.dev/recompensas/usuario",
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

        const resUsuario = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${userId}`,
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
          avatar:
            foto_perfil?.[0]?.url ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });

        const resCanjes = await fetch("https://kong-0c858408d8us2s9oc.kongcloud.dev/canjes", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const dataCanjes = await resCanjes.json();

        const nombreCompleto =
          `${dataUsuario.nombre} ${dataUsuario.apellido}`.toLowerCase();
        const canjesDelUsuario = dataCanjes.filter(
          (c) =>
            `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim().toLowerCase() ===
            nombreCompleto
        );

        const recompensasFormateadas = canjesDelUsuario.map((c) => ({
          id: c.idCanje,
          nombre: c.recompensa,
          descripcion: c.descripcion,
        }));

        setRecompensasReclamadas(recompensasFormateadas);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const lanzarConfeti = () => {
    var end = Date.now() + 1 * 1000;
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleReclamar = async () => {
    if (!recompensaSeleccionada) return;
    const token = Cookies.get("token");
    setLoadingReclamar(true);

    try {
      console.log("Recompensa reclamada:", {
        id_recompensa: recompensaSeleccionada.id_recompensa,
      });
      const res = await fetch("https://kong-0c858408d8us2s9oc.kongcloud.dev/cajerRecompensa", {
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
          puntos: prev.puntos - recompensaSeleccionada.puntosRequeridos,
        }));

        setRecompensaReclamada(recompensaSeleccionada);
        setMostrarOverlayFelicidades(true);
        lanzarConfeti();

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
    } finally {
      setLoadingReclamar(false);
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
            {recompensas
              .filter((r) => {
                return !recompensasReclamadas.some(
                  (rr) => (rr.nombre ?? '').toLowerCase() === (r.nombre ?? '').toLowerCase()
                );
              })

              .map((r) => {
                const puedeReclamar = user.puntos >= r.puntosRequeridos;
                return (
                  <div
                    key={r.id_recompensa}
                    className={`canje-card ${!puedeReclamar ? "canje-disabled" : ""
                      }`}
                  >
                    <div className="canje-icon">
                      <img
                      src={
                        r.imagenUrl ||
                        "🎁"
                      }
                      alt="🎁"
                      style={{ width: "100px", height: "100px" }}
                    />

                    </div>
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
          {recompensasReclamadas.length > 0 && (
            <>
              <h3 className="insignias-reclamadas-subtitle">
                Recompensas Reclamadas
              </h3>
              <div className="canje-grid">
                {recompensasReclamadas.map((r) => (
                  <div key={r.id} className="canje-card canje-disabled">
                    <div className="canje-icon">🎉</div>
                    <h4 className="canje-nombre">{r.nombre}</h4>
                    <p className="canje-puntos">{r.descripcion}</p>
                    <button className="canje-boton" disabled>
                      Ya reclamado
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

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
                  <button
                    className="confirmar-boton"
                    onClick={handleReclamar}
                    disabled={loadingReclamar}
                  >
                    {loadingReclamar ? (
                      <span className="spinner-rewards"></span>
                    ) : (
                      "Sí, reclamar"
                    )}
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

      {mostrarOverlayFelicidades && recompensaReclamada && (
        <div
          className="overlay-felicidades"
          onClick={() => setMostrarOverlayFelicidades(false)}
        >
          <div
            className="felicidades-contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>🎉 ¡Felicidades! 🎉</h2>
            <p>
              Has canjeado <strong>{recompensaReclamada.nombre}</strong>{" "}
              exitosamente.
            </p>
            <button
              className="boton-cerrar"
              onClick={() => setMostrarOverlayFelicidades(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
