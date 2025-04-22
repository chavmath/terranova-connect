import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/participar.css";
import Cookies from "js-cookie";
import { FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";

const ParticiparPage = () => {
  const [formData, setFormData] = useState({
    id_inscripcion: "",
    descripcion: "",
    archivo: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [misiones, setMisiones] = useState([]);
  const [inscritas, setInscritas] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = Cookies.get("token");

        const [misRes, activasRes] = await Promise.all([
          fetch("http://localhost:3000/misiones", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
          fetch("http://localhost:3000/activas", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
        ]);

        const misionesData = await misRes.json();
        const activasData = await activasRes.json();

        setInscritas(activasData); // Guardamos inscripciones para el select

        const misionesInscritas = new Set(activasData.map((a) => a.id_mision));

        const misionesFormateadas = misionesData.misiones.map((m) => ({
          id: m.id_mision,
          nombre: m.titulo,
          descripcion: m.descripcion,
          puntos: m.puntos,
          duracion: m.duracion ?? "No especificada",
          modalidad: m.modalidad ?? "Individual",
          tipo: "Misión",
          estado: misionesInscritas.has(m.id_mision)
            ? "En progreso"
            : "Inscribirse",
        }));

        setMisiones(misionesFormateadas); // Solo establecemos las misiones
      } catch (err) {
        console.error("Error al cargar misiones:", err);
      }
    };

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
    const token = Cookies.get("token");

    try {
      const body = { id_mision: mision.id };

      const res = await fetch("http://localhost:3000/subir", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("No se pudo inscribir");

      const actualizadas = misiones.map((m) =>
        m.id === mision.id ? { ...m, estado: "En progreso" } : m
      );
      setMisiones(actualizadas);
      setActividadSeleccionada(null);
      showToast("✅ Inscripción realizada con éxito");
    } catch (err) {
      showToast("❌ No se pudo inscribir. Intenta más tarde.", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });

    if (name === "archivo" && files?.[0]) {
      const file = files[0];
      setPreviewUrl(
        file.type.startsWith("image/") ? URL.createObjectURL(file) : file.name
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      id_inscripcion: !formData.id_inscripcion,
      descripcion: !formData.descripcion,
      archivo: !formData.archivo,
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setLoading(true);
      const token = Cookies.get("token");

      const form = new FormData();
      form.append("descripcion", formData.descripcion);
      form.append("evidencia", formData.archivo);

      const res = await fetch(
        `http://localhost:3000/evidencia/${formData.id_inscripcion}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: form,
        }
      );

      if (!res.ok) throw new Error("Error al subir evidencia");

      setFormData({ id_inscripcion: "", descripcion: "", archivo: null });
      setPreviewUrl(null);
      setSuccess(true);
      showToast("✅ Evidencia enviada con éxito");
    } catch (err) {
      showToast("❌ Error al enviar evidencia", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Participar en actividades" />

      <main className="participar-main">
        <div className="participar-header">
          <h2 className="participar-title">Participar en Misiones</h2>
          <p className="participar-subtitle">
            Sube tu participación y/o inscríbete en una misión para ganar
            insignias y puntos por tu esfuerzo.
          </p>
        </div>

        <div className="participar-content-container">
          <form className="participar-form" onSubmit={handleSubmit}>
            <label>
              Misión inscrita:
              <select
                name="id_inscripcion"
                value={formData.id_inscripcion}
                onChange={handleChange}
                className={errors.id_inscripcion ? "input-error" : ""}
              >
                <option value="">Selecciona una misión</option>
                {inscritas.map(
                  (i) =>
                    i.id_mision && (
                      <option key={i._id} value={i.id_mision}>
                        {i.titulo}
                      </option>
                    )
                )}
              </select>
            </label>

            <label>
              Descripción de la Participación:
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className={errors.descripcion ? "input-error" : ""}
                placeholder="Describe brevemente tu participación..."
                rows="4"
              />
            </label>

            <label>
              Evidencia (fotos o documentos):
              <input
                type="file"
                name="archivo"
                onChange={handleChange}
                className={errors.archivo ? "input-error" : ""}
              />
              {previewUrl && (
                <div className="file-preview">
                  {previewUrl.startsWith("data:image") ||
                  previewUrl.startsWith("blob:") ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="preview-image"
                    />
                  ) : (
                    <div className="preview-document">
                      {formData.archivo?.type === "application/pdf" ? (
                        <FaFilePdf className="preview-icon pdf" />
                      ) : formData.archivo?.type ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                        <FaFileWord className="preview-icon word" />
                      ) : (
                        <FaFileAlt className="preview-icon generic" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </label>

            <button
              type="submit"
              className="participar-button"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Evidencia"}
            </button>

            {success && (
              <div className="success-message">
                ✅ ¡Evidencia enviada con éxito!
              </div>
            )}
          </form>

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
                  className={`actividad-boton ${m.estado.toLowerCase()}`}
                  disabled={m.estado !== "Inscribirse"}
                  onClick={() =>
                    m.estado === "Inscribirse" && setActividadSeleccionada(m)
                  }
                >
                  {m.estado}
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
                  >
                    Sí, inscribirme
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

          {toast.visible && (
            <div className={`toast toast--${toast.type}`}>{toast.message}</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParticiparPage;
