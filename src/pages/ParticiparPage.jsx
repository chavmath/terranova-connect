import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/participar.css";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";

const ParticiparPage = () => {
  const [misiones, setMisiones] = useState([]);
  const [, setInscritas] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [modalEvidenciaVisible, setModalEvidenciaVisible] = useState(false);
  const [idInscripcionActual, setIdInscripcionActual] = useState("");
  const [misionesConEvidencia, setMisionesConEvidencia] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingInscripcion, setLoadingInscripcion] = useState(false);
  const [loadingProgreso, setLoadingProgreso] = useState(null);

  const [formData, setFormData] = useState({
    descripcion: "",
    archivos: [],
  });

  const [previewUrl, setPreviewUrl] = useState([]);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const fetchDatos = async () => {
    try {
      const token = Cookies.get("token");

      const [misRes, activasRes] = await Promise.all([
        fetch("https://kong-0c858408d8us2s9oc.kongcloud.dev/misiones", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }),
        fetch("https://kong-0c858408d8us2s9oc.kongcloud.dev/activas", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }),
      ]);

      const misionesData = await misRes.json();
      const activasData = await activasRes.json();

      console.log("Misiones:", misionesData);
      console.log("Activas:", activasData);

      setInscritas(activasData);

      const activas = Array.isArray(activasData)
        ? activasData
        : activasData.data || [];

      const misionesFormateadas = misionesData.map((m) => {
        const activa = activas.find((a) => a.id_mision === m.id_mision);

        let estado = "Inscribirse";
        if (activa) {
          if (activa.estado === true) {
            estado = "Puntos otorgados";
          } else {
            estado = activa.estadoEvidencia
              ? "Ver progreso"
              : "Subir evidencia";
          }
        }

        return {
          id: m.id_mision,
          nombre: m.titulo,
          descripcion: m.descripcion,
          puntos: m.puntos,
          duracion: m.duracion ?? "No especificada",
          modalidad: m.modalidad ?? "Individual",
          tipo: "Misión",
          estado,
          id_inscripcion: activa?.id_inscripcion ?? null,
        };
      });

      setMisiones(misionesFormateadas);
    } catch (err) {
      console.error("Error al cargar misiones:", err);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "success" }),
      3000
    );
  };

  const handleInscripcion = async (mision) => {
    setLoadingInscripcion(true);
    const token = Cookies.get("token");

    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/subir",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ id_mision: mision.id }),
        }
      );

      if (!res.ok) throw new Error("No se pudo inscribir");

      const result = await res.json();

      const actualizadas = misiones.map((m) =>
        m.id === mision.id
          ? {
              ...m,
              estado: "Subir evidencia",
              id_inscripcion: result.id_inscripcion,
            }
          : m
      );
      setMisiones(actualizadas);
      setActividadSeleccionada(null);
      showToast("✅ Inscripción realizada con éxito");
      await fetchDatos();
    } catch (err) {
      showToast("❌ No se pudo inscribir. Intenta más tarde.", err);
    }
    setLoadingInscripcion(false);
  };

  const abrirModalEvidencia = (id_inscripcion) => {
    if (!id_inscripcion) {
      console.error("No se pasó id_inscripcion al abrir el modal");
      return;
    }
    setIdInscripcionActual(id_inscripcion);
    setFormData({ descripcion: "", archivo: null });
    setPreviewUrl(null);
    setModalEvidenciaVisible(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const nuevosArchivos = Array.from(files);

      setFormData((prev) => ({
        ...prev,
        archivos: [...(prev.archivos || []), ...nuevosArchivos],
      }));

      setPreviewUrl((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        ...nuevosArchivos.map((file) =>
          file.type.startsWith("image/") ? URL.createObjectURL(file) : file.name
        ),
      ]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const token = Cookies.get("token");

    const form = new FormData();
    form.append("descripcion", formData.descripcion);
    formData.archivos.forEach((archivo) => {
      form.append("evidencia", archivo);
    });

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/evidencia/${idInscripcionActual}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          body: form,
        }
      );

      if (!res.ok) throw new Error("Error al subir evidencia");

      const nuevas = new Set(misionesConEvidencia);
      nuevas.add(idInscripcionActual);
      setMisionesConEvidencia(nuevas);
      setModalEvidenciaVisible(false);
      showToast("✅ Evidencia enviada con éxito");
      await fetchDatos();
    } catch (err) {
      showToast("❌ Error al subir evidencia", err);
    }
    setLoading(false);
  };

  const verProgreso = async (id_inscripcion) => {
    setLoadingProgreso(id_inscripcion);
    const token = Cookies.get("token");
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/ver-progreso/${id_inscripcion}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      const data = await res.json();
      Swal.fire({
        title:
          '<span style="font-size: 22px; font-weight: bold;">Estado de tu evidencia</span>',
        html: `
          <div style="font-size: 16px; text-align: left; color: #333;">
            <div style="margin-top: 10px;">
              <strong style="color: #031f7b;">Mensaje:</strong><br>
              <span style="display: inline-block; margin-top: 4px;">${data.message}</span>
            </div>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#031f7b",
        background: "#f8faff",
        customClass: {
          popup: "swal-progreso-popup",
          htmlContainer: "swal-progreso-html",
        },
      });
    } catch (err) {
      showToast("❌ No se pudo cargar el progreso", err);
    }
    setLoadingProgreso(null);
  };

  const handleRemoveArchivo = (index) => {
    const nuevosArchivos = [...formData.archivos];
    nuevosArchivos.splice(index, 1);

    const nuevasPreviews = [...previewUrl];
    nuevasPreviews.splice(index, 1);

    setFormData((prev) => ({ ...prev, archivos: nuevosArchivos }));
    setPreviewUrl(nuevasPreviews);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Participar en actividades" />
      <main className="participar-main">
        <div className="participar-header">
          <h2 className="participar-title">Participar en Misiones</h2>
          <p className="participar-subtitle">
            Inscríbete y sube tu evidencia para ganar puntos e insignias.
          </p>
        </div>

        <div className="participar-content-container">
          <h3 className="actividad-titulo-seccion">Misiones Escolares</h3>
          <div className="actividad-grid">
            {misiones.map((m) => (
              <div key={m.id} className="actividad-card">
                <div className="actividad-header">
                  <h4 className="actividad-nombre">{m.nombre}</h4>
                  <span className={`actividad-tipo ${m.tipo.toLowerCase()}`}>
                    {m.tipo}
                  </span>
                </div>
                <p className="actividad-descripcion">{m.descripcion}</p>
                <div className="actividad-detalles">
                  <span>⭐ {m.puntos} puntos</span>
                  <span>⏱️ {m.duracion}</span>
                  <span>👥 {m.modalidad}</span>
                </div>

                <button
                  className={`actividad-boton ${
                    m.estado === "Ver progreso"
                      ? "boton-ver-progreso"
                      : m.estado === "Subir evidencia"
                      ? "boton-subir-evidencia"
                      : m.estado === "Puntos otorgados"
                      ? "boton-puntos"
                      : "boton-inscribirse"
                  }`}
                  onClick={() => {
                    if (m.estado === "Ver progreso")
                      verProgreso(m.id_inscripcion);
                    else if (m.estado === "Subir evidencia")
                      abrirModalEvidencia(m.id_inscripcion);
                    else if (m.estado === "Inscribirse")
                      setActividadSeleccionada(m);
                  }}
                  disabled={
                    m.estado === "Puntos otorgados" ||
                    (m.estado === "Ver progreso" &&
                      loadingProgreso === m.id_inscripcion)
                  }
                >
                  {m.estado === "Ver progreso" &&
                  loadingProgreso === m.id_inscripcion ? (
                    <span className="loader-button"></span>
                  ) : (
                    m.estado
                  )}
                </button>
              </div>
            ))}
          </div>

          {actividadSeleccionada && (
            <div
              className="modal-participar-overlay"
              onClick={() => setActividadSeleccionada(null)}
            >
              <div
                className="modal-participar-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-participar-close"
                  onClick={() => setActividadSeleccionada(null)}
                >
                  ✖
                </button>
                <h3>¿Deseas inscribirte en esta misión?</h3>
                <p>
                  <strong>{actividadSeleccionada.nombre}</strong>
                </p>
                <p>{actividadSeleccionada.descripcion}</p>
                <div className="modal-participar-buttons">
                  <button
                    className="confirmar-boton"
                    onClick={() => handleInscripcion(actividadSeleccionada)}
                    disabled={loadingInscripcion}
                  >
                    {loadingInscripcion ? (
                      <span className="loader-button"></span>
                    ) : (
                      "Sí, inscribirme"
                    )}
                  </button>

                  <button
                    className="cancelar-boton"
                    onClick={() => setActividadSeleccionada(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalEvidenciaVisible && (
            <div
              className="modal-participar-overlay"
              onClick={() => setModalEvidenciaVisible(false)}
            >
              <div
                className="modal-evidencia"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-evidencia-close"
                  onClick={() => setModalEvidenciaVisible(false)}
                >
                  ✖
                </button>
                <h3>Subir Evidencia</h3>
                <p className="modal-evidencia-subtitle">
                  Adjunta tu evidencia para comprobar tu participación en esta
                  misión.
                </p>

                <form onSubmit={handleSubmit}>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción"
                    rows="4"
                    required
                  />
                  <input
                    type="file"
                    name="archivo"
                    onChange={handleChange}
                    multiple
                    required={
                      !formData.archivos || formData.archivos.length === 0
                    }
                  />
                  {Array.isArray(previewUrl) && previewUrl.length > 0 && (
                    <div className="slider-container">
                      {previewUrl.map((preview, i) => (
                        <div key={i} className="slider-item">
                          {preview.startsWith("blob:") ? (
                            <img src={preview} alt={`Archivo ${i}`} />
                          ) : (
                            <span>{preview}</span>
                          )}
                          <button
                            type="button"
                            className="eliminar-archivo-boton"
                            onClick={() => handleRemoveArchivo(i)}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="participar-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loader-button"></span>
                    ) : (
                      "Enviar Evidencia"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {toast.visible && (
            <div className={`toast toast--${toast.type}`}>{toast.message}</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParticiparPage;
