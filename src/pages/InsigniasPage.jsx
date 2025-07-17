import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/insignias.css";
import Cookies from "js-cookie";
import confetti from "canvas-confetti";

const InsigniasPage = () => {
  const [user, setUser] = useState({
    nombre: "",
    puntos: 0,
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });
  const [insignias, setInsignias] = useState([]);
  const [insigniasReclamadas, setInsigniasReclamadas] = useState([]);
  const [insigniaSeleccionada, setInsigniaSeleccionada] = useState(null);
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);
  const [mostrarOverlayFelicidades, setMostrarOverlayFelicidades] =
    useState(false);
  const [insigniaReclamada, setInsigniaReclamada] = useState(null);
  const [isLoadingReclamo, setIsLoadingReclamo] = useState(false);

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

  const fetchData = async () => {
    try {
      const token = Cookies.get("token");

      const resInsignias = await fetch("https://kong-0c858408d8us2s9oc.kongcloud.dev/insignias", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const dataInsignias = await resInsignias.json();
      if (Array.isArray(dataInsignias)) {
        setInsignias(dataInsignias);
      }

      const resInsigniasReclamadas = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/reclamadas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const dataInsigniasReclamadas = await resInsigniasReclamadas.json();
      if (Array.isArray(dataInsigniasReclamadas)) {
        setInsigniasReclamadas(dataInsigniasReclamadas);
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
        historialPuntos = 0,
      } = dataUsuario;

      setUser({
        nombre: `${nombre} ${apellido}`,
        puntos: historialPuntos,
        avatar:
          foto_perfil?.[0]?.url ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      });
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  useEffect(() => {
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
    if (!insigniaSeleccionada) return;
    const token = Cookies.get("token");
    setIsLoadingReclamo(true);

    try {
      console.log("Insignia reclamada:", {
        id_insignia: insigniaSeleccionada.id_insignia,
      });
      const res = await fetch("https://kong-0c858408d8us2s9oc.kongcloud.dev/reclamar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_insignia: insigniaSeleccionada.id_insignia,
        }),
      });

      if (res.ok) {

        setInsigniaReclamada(insigniaSeleccionada);
        setMostrarOverlayFelicidades(true);
        lanzarConfeti();

        setInsigniaSeleccionada(null);
        setMostrarAnimacion(true);
        setTimeout(() => setMostrarAnimacion(false), 2500);

        fetchData();
      } else {
        const err = await res.json();
        alert(`Error al reclamar insignia: ${err.message || "Error"}`);
      }
    } catch (err) {
      console.error("Error al reclamar:", err);
      alert("No se pudo reclamar la insignia.");
    } finally {
      setIsLoadingReclamo(false);
    }
  };

  const insigniasDisponibles = insignias.filter(
    (insignia) =>
      !insigniasReclamadas.some(
        (reclamada) => reclamada.id_insignia === insignia.id_insignia
      )
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Insignias" />
      <main className="insignias-main">
        <div className="insignias-title-container">
          <h2 className="insignias-title">🏅Insignias</h2>
          <p className="insignias-title-subtitle">
            Mira el puntaje que has acumulado y canjea tus insignias.
          </p>
        </div>

        <div className="insignias-content-container">
          <div className="insignias-header">
            <img src={user.avatar} alt="avatar" className="insignias-avatar" />
            <div>
              <h2 className="insignias-nombre">{user.nombre}</h2>
              <p className="insignias-puntos">
                Puntos totales acumulados: <strong>{user.puntos}</strong>
              </p>
            </div>
          </div>

          <h3 className="insignias-subtitle">Canjea tus puntos</h3>
          <div className="canje-grid">
            {insigniasDisponibles.map((i) => {
              const puedeReclamar = user.puntos >= i.puntosrequeridos;
              return (
                <div
                  key={i.id_insignia}
                  className={`canje-card ${
                    !puedeReclamar ? "canje-disabled" : ""
                  }`}
                >
                  <div className="canje-icon">
                    <img
                      src={
                        i.imagenes?.[0]?.url ||
                        "https://via.placeholder.com/100"
                      }
                      alt={i.nombre}
                      style={{ width: "100px", height: "100px" }}
                    />
                  </div>
                  <h4 className="canje-nombre">{i.nombre}</h4>
                  <p className="canje-puntos">{i.puntosrequeridos} puntos</p>
                  <button
                    className="canje-boton"
                    disabled={!puedeReclamar}
                    onClick={() => puedeReclamar && setInsigniaSeleccionada(i)}
                  >
                    Reclamar
                  </button>
                </div>
              );
            })}
          </div>

          <h3 className="insignias-reclamadas-subtitle">
            Insignias Reclamadas
          </h3>
          <div className="canje-grid">
            {insigniasReclamadas.map((i) => {
              return (
                <div key={i.id_insignia} className="canje-card canje-disabled">
                  <div className="canje-icon">
                    <img
                      src={
                        i.imagenes?.[0]?.url ||
                        "https://via.placeholder.com/100"
                      }
                      alt={i.nombre}
                      style={{ width: "100px", height: "100px" }}
                    />
                  </div>
                  <h4 className="canje-nombre">{i.nombre}</h4>
                  <p className="canje-puntos">{i.puntosrequeridos} puntos</p>
                  <button className="canje-boton" disabled>
                    Ya reclamado
                  </button>
                </div>
              );
            })}
          </div>

          {insigniaSeleccionada && (
            <div
              className="modal-insignias-overlay"
              onClick={() => setInsigniaSeleccionada(null)}
            >
              <div
                className="modal-insignias-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-insignias-close"
                  onClick={() => setInsigniaSeleccionada(null)}
                >
                  ✖
                </button>
                <h3>¿Deseas reclamar esta insignia?</h3>
                <p>
                  <strong>{insigniaSeleccionada.nombre}</strong>
                </p>
                <p>{insigniaSeleccionada.descripcion}</p>
                <p>
                  Esto necesita{" "}
                  <strong>
                    {insigniaSeleccionada.puntosrequeridos} puntos
                  </strong>
                </p>
                <div className="modal-insignias-buttons">
                  <button
                    className="confirmar-boton"
                    onClick={handleReclamar}
                    disabled={isLoadingReclamo}
                  >
                    {isLoadingReclamo ? (
                      <span className="spinner-insignias-container">
                        <span className="spinner-insignias"></span>
                      </span>
                    ) : (
                      "Sí, reclamar"
                    )}
                  </button>

                  <button
                    className="cancelar-boton"
                    onClick={() => setInsigniaSeleccionada(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {mostrarAnimacion && !mostrarOverlayFelicidades && (
        <div className="insignia-animacion">
          🎉 ¡Insignia reclamada con éxito!
        </div>
      )}

      {mostrarOverlayFelicidades && insigniaReclamada && (
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
              Has canjeado <strong>{insigniaReclamada.nombre}</strong>{" "}
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

export default InsigniasPage;
