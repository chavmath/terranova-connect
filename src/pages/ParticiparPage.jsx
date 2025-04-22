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
  const [actividades, setActividades] = useState([]);
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

        const [actRes, misRes, activasRes] = await Promise.all([
          fetch("http://localhost:3000/actividades", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
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

        const actividadesData = await actRes.json();
        const misionesData = await misRes.json();
        const activasData = await activasRes.json();

        setInscritas(activasData); // Guardamos inscripciones para el select

        const actividadesInscritas = new Set(
          activasData.map((a) => a.id_actividad)
        );
        const misionesInscritas = new Set(activasData.map((a) => a.id_mision));

        const actividadesFormateadas = actividadesData.map((a) => ({
          id: a.id_actividad,
          nombre: a.titulo,
          descripcion: a.descripcion,
          puntos: a.puntos ?? 0,
          duracion: a.duracion ?? "No especificada",
          modalidad: a.modalidad ?? "Individual",
          tipo: "Actividad",
          estado: actividadesInscritas.has(a.id_actividad)
            ? "En progreso"
            : "Inscribirse",
        }));

        const misionesFormateadas = misionesData.misiones.map((m) => ({
          id: m.id_mision,
          nombre: m.titulo,
          descripcion: m.descripcion,
          puntos: m.puntos ?? 0,
          duracion: m.duracion ?? "No especificada",
          modalidad: m.modalidad ?? "Individual",
          tipo: "Misión",
          estado: misionesInscritas.has(m.id_mision)
            ? "En progreso"
            : "Inscribirse",
        }));

        setActividades([...actividadesFormateadas, ...misionesFormateadas]);
      } catch (err) {
        console.error("Error al cargar datos:", err);
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

  const handleInscripcion = async (actividad) => {
    const token = Cookies.get("token");

    try {
      const body =
        actividad.tipo === "Actividad"
          ? { id_actividad: actividad.id }
          : { id_mision: actividad.id };

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

      const actualizadas = actividades.map((a) =>
        a.id === actividad.id ? { ...a, estado: "En progreso" } : a
      );
      setActividades(actualizadas);
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
          <h2 className="participar-title">Participar en Actividades</h2>
          <p className="participar-subtitle">
            Sube tu participación y/o inscríbete en una actividad para ganar
            insignias y puntos por tu esfuerzo
          </p>
        </div>

        <div className="participar-content-container">
          <form className="participar-form" onSubmit={handleSubmit}>
            <label>
              Actividad inscrita:
              <select
                name="id_inscripcion"
                value={formData.id_inscripcion}
                onChange={handleChange}
                className={errors.id_inscripcion ? "input-error" : ""}
              >
                <option value="">Selecciona una actividad o misión</option>
                {inscritas.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.titulo}
                  </option>
                ))}
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

          <h3 className="actividad-titulo-seccion">
            Actividades y Misiones Escolares
          </h3>
          <div className="actividad-grid">
            {actividades.map((a) => (
              <div key={a.id} className="actividad-card">
                <div className="actividad-header">
                  <h4 className="actividad-nombre">{a.nombre}</h4>
                  <span className={`actividad-tipo ${a.tipo.toLowerCase()}`}>
                    {a.tipo}
                  </span>
                </div>
                <p className="actividad-descripcion">{a.descripcion}</p>

                <div className="actividad-detalles">
                  <span>⭐ {a.puntos} puntos</span>
                  <span>⏱️ {a.duracion}</span>
                  <span>👥 {a.modalidad}</span>
                </div>

                <button
                  className={`actividad-boton ${a.estado.toLowerCase()}`}
                  disabled={a.estado !== "Inscribirse"}
                  onClick={() =>
                    a.estado === "Inscribirse" && setActividadSeleccionada(a)
                  }
                >
                  {a.estado}
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
                <h3>¿Deseas inscribirte en esta actividad?</h3>
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
