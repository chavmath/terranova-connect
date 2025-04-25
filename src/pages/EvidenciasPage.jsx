import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "../styles/evidencias.css";
import Cookies from "js-cookie";
import { FiEye, FiCheckCircle } from "react-icons/fi"; // Para el botón de ver y aprobar

const EvidenciasPage = () => {
  const [evidencias, setEvidencias] = useState([]);
  const [vistaPrevia, setVistaPrevia] = useState(null); // Para la vista previa de la evidencia
  const token = Cookies.get("token");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [loadingId, setLoadingId] = useState(null); // ID de evidencia que está en proceso

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "success" }),
      3000
    );
  };

  // Obtener las evidencias del backend
  useEffect(() => {
    obtenerEvidencias();
  }, []);

  const obtenerEvidencias = async () => {
    const res = await fetch("http://localhost:3000/evidencias", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      setEvidencias(data);
    } else {
      Swal.fire("Error", "No se pudieron cargar las evidencias", "error");
    }
  };

  const handleAprobarEvidencia = async (id) => {
    setLoadingId(id);

    const url = `http://localhost:3000/evidencia/${id}`;
    console.log("📡 Ruta de aprobación:", url);

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ revisado: true }),
      });

      if (res.ok) {
        showToast("Evidencia aprobada correctamente", "success");
        setEvidencias(evidencias.filter((e) => e.id_evidencia !== id));
      } else {
        showToast("Error al aprobar la evidencia", "error");
      }
    } catch (error) {
      console.error("Error al aprobar evidencia:", error);
      showToast("Error de conexión al aprobar", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleVerEvidencia = (evidencia) => {
    setVistaPrevia(evidencia);
  };

  const handleCerrarVistaPrevia = () => {
    setVistaPrevia(null);
  };

  const formatearFecha = (fechaIso) => {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString("es-EC", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleFullscreen = (tipo) => {
    const element = document.querySelector(
      tipo === "imagen" ? ".modal-imagen" : ".modal-video"
    );

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Evidencias" />

      <main className="evidencias-main">
        <div className="evidencias-title-container">
          <h2 className="evidencias-title">Evidencias Subidas</h2>
          <p className="evidencias-subtitle">
            Revisa y aprueba las evidencias subidas por los usuarios
          </p>
        </div>

        <div className="evidencias-description">
          <div className="evidencias-lista">
            {evidencias.length > 0 ? (
              <div className="evidencias-cards">
                {evidencias.map((evidencia) => (
                  <div key={evidencia.id_evidencia} className="evidencia-card">
                    <div className="evidencia-card-header">
                      <h3 className="evidencia-titulo">
                        {evidencia.descripcion}
                      </h3>
                      <button
                        className="evidencia-ver-floating"
                        onClick={() => handleVerEvidencia(evidencia)}
                        title="Ver evidencia"
                      >
                        <FiEye />
                      </button>
                    </div>

                    <div className="evidencia-card-media">
                      {evidencia.imagenes[0]?.tipo === "imagen" ? (
                        <img
                          src={evidencia.imagenes[0]?.url}
                          alt="Evidencia"
                          className="evidencia-imagen"
                        />
                      ) : (
                        <video
                          src={evidencia.imagenes[0]?.url}
                          controls
                          className="evidencia-video"
                        />
                      )}
                    </div>

                    <p className="evidencia-fecha">
                      Subida: {formatearFecha(evidencia.fechaSubida)}
                    </p>

                    <div className="evidencia-card-footer">
                      <button
                        className="evidencia-aprobar"
                        onClick={() =>
                          handleAprobarEvidencia(evidencia.id_evidencia)
                        }
                        disabled={loadingId === evidencia.id_evidencia}
                      >
                        {loadingId === evidencia.id_evidencia ? (
                          <span className="spinner"></span>
                        ) : (
                          <>
                            <FiCheckCircle /> Aprobar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay evidencias para mostrar.</p>
            )}
          </div>
        </div>

        {/* Modal para vista previa de la evidencia */}
        {vistaPrevia && (
          <div className="modal-overlay" onClick={handleCerrarVistaPrevia}>
            <div
              className="modal-evidencia"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={handleCerrarVistaPrevia}>
                ✕
              </button>

              <div className="modal-content-scrollable">
                <h3 className="modal-titulo">{vistaPrevia.descripcion}</h3>
                <p className="modal-fecha">
                  Subida: {formatearFecha(vistaPrevia.fechaSubida)}
                </p>
                <div className="modal-divider"></div>

                {vistaPrevia.imagenes[0]?.tipo === "imagen" ? (
                  <img
                    src={vistaPrevia.imagenes[0]?.url}
                    alt="Evidencia"
                    className="modal-imagen"
                  />
                ) : (
                  <video
                    src={vistaPrevia.imagenes[0]?.url}
                    controls
                    className="modal-video"
                  />
                )}

                <div className="modal-actions">
                  <button
                    className="modal-fullscreen"
                    onClick={() =>
                      handleFullscreen(vistaPrevia.imagenes[0]?.tipo)
                    }
                  >
                    Ver en pantalla completa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast.visible && (
          <div
            className={`toast ${toast.type === "error" ? "toast--error" : ""}`}
          >
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
};

export default EvidenciasPage;
