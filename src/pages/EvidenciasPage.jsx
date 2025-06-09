import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "../styles/evidencias.css";
import Cookies from "js-cookie";
import { FiEye, FiCheckCircle } from "react-icons/fi";
import { AiFillFilePdf } from "react-icons/ai";

const EvidenciasPage = () => {
  const [evidencias, setEvidencias] = useState([]);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [indiceMediaActual, setIndiceMediaActual] = useState(0);

  const token = Cookies.get("token");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [loadingId, setLoadingId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "success" }),
      3000
    );
  };

  useEffect(() => {
    obtenerEvidencias();
  }, []);

  const obtenerEvidencias = async () => {
    const res = await fetch(
      "https://kong-7df170cea7usbksss.kongcloud.dev/evidencias",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await res.json();
    if (res.ok) {
      setEvidencias(data);
    } else {
      Swal.fire("Error", "No se pudieron cargar las evidencias", "error");
    }
  };

  const handleAprobarEvidencia = async (id) => {
    setLoadingId(id);

    const url = `https://kong-7df170cea7usbksss.kongcloud.dev/evidencia/${id}`;
    console.log("📡 Ruta de aprobación:", url);

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          revisado: false,
          tipo: false,
        }),
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
    setIndiceMediaActual(0);
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
                      <p className="evidencia-usuario">
                        Enviado por: {evidencia.usuario?.nombre}{" "}
                        {evidencia.usuario?.apellido}
                      </p>
                      <button
                        className="evidencia-ver-floating"
                        onClick={() => handleVerEvidencia(evidencia)}
                        title="Ver evidencia"
                      >
                        <FiEye />
                      </button>
                    </div>

                    <div className="evidencia-card-media">
                      {(() => {
                        const archivo = evidencia.imagenes[0];
                        if (!archivo) return <p>Sin archivos</p>;

                        if (archivo.tipo === "imagen") {
                          return (
                            <img
                              src={archivo.url}
                              alt="Evidencia"
                              className="evidencia-imagen"
                            />
                          );
                        } else if (archivo.tipo === "video") {
                          return (
                            <video
                              src={archivo.url}
                              controls
                              className="evidencia-video"
                            />
                          );
                        } else if (archivo.tipo === "pdf") {
                          return (
                            <div className="pdf-icon-container">
                              <AiFillFilePdf className="pdf-icon" />
                              <p>Archivo PDF</p>
                            </div>
                          );
                        } else {
                          return <p>Archivo no soportado</p>;
                        }
                      })()}
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
                <p className="modal-usuario">
                  Enviado por: {vistaPrevia.usuario?.nombre}{" "}
                  {vistaPrevia.usuario?.apellido}
                </p>
                <p className="modal-fecha">
                  Subida: {formatearFecha(vistaPrevia.fechaSubida)}
                </p>
                <div className="modal-divider"></div>

                {vistaPrevia.imagenes.length > 0 && (
                  <div className="carrusel-evidencia">
                    {vistaPrevia.imagenes.length > 1 && (
                      <button
                        className="carrusel-btn"
                        onClick={() =>
                          setIndiceMediaActual(
                            (indiceMediaActual -
                              1 +
                              vistaPrevia.imagenes.length) %
                              vistaPrevia.imagenes.length
                          )
                        }
                      >
                        ◀
                      </button>
                    )}

                    <div className="carrusel-media">
                      {(() => {
                        const media = vistaPrevia.imagenes[indiceMediaActual];
                        if (media.tipo === "imagen") {
                          return (
                            <img
                              src={media.url}
                              alt="Evidencia"
                              className="modal-imagen"
                            />
                          );
                        } else if (media.tipo === "video") {
                          return (
                            <video
                              src={media.url}
                              controls
                              className="modal-video"
                            />
                          );
                        } else if (media.tipo === "pdf") {
                          const nombreArchivo = media.url
                            .split("/")
                            .pop()
                            .split("?")[0];
                          return (
                            <div className="pdf-preview">
                              <p className="pdf-nombre">
                                Archivo PDF: {nombreArchivo}
                              </p>
                              <a
                                href={media.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button className="btn-descargar">
                                  Abrir PDF
                                </button>
                              </a>
                            </div>
                          );
                        } else {
                          return <p>Tipo de archivo no soportado.</p>;
                        }
                      })()}
                    </div>

                    {vistaPrevia.imagenes.length > 1 && (
                      <button
                        className="carrusel-btn"
                        onClick={() =>
                          setIndiceMediaActual(
                            (indiceMediaActual + 1) %
                              vistaPrevia.imagenes.length
                          )
                        }
                      >
                        ▶
                      </button>
                    )}
                  </div>
                )}

                {vistaPrevia.imagenes[indiceMediaActual]?.tipo !== "pdf" && (
                  <div className="modal-actions">
                    <button
                      className="modal-fullscreen"
                      onClick={() =>
                        handleFullscreen(
                          vistaPrevia.imagenes[indiceMediaActual]?.tipo
                        )
                      }
                    >
                      Ver en pantalla completa
                    </button>
                  </div>
                )}
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
