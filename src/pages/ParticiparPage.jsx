import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/participar.css";
import { FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";

const ParticiparPage = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    archivo: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    setErrors({ ...errors, [name]: false });
    if (name === "archivo" && files?.[0]) {
      const file = files[0];
      setFormData({ ...formData, archivo: file });
      setErrors({ ...errors, archivo: false });

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(file.name);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      titulo: !formData.titulo,
      descripcion: !formData.descripcion,
      archivo: !formData.archivo,
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        titulo: "",
        descripcion: "",
        archivo: null,
      });
      setPreviewUrl(null);
    }, 2000);
  };

  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [actividades, setActividades] = useState([
    {
      id: 1,
      nombre: "Feria de Ciencias",
      descripcion: "Presenta tu proyecto científico innovador",
      puntos: 100,
      duracion: "1 día",
      modalidad: "Individual",
      tipo: "Actividad",
      estado: "Inscribirse",
    },
    {
      id: 2,
      nombre: "Limpieza del Parque",
      descripcion: "Ayuda a limpiar el parque local",
      puntos: 50,
      duracion: "3 horas",
      modalidad: "Grupal",
      tipo: "Misión",
      estado: "Inscribirse",
    },
    {
      id: 3,
      nombre: "Maratón de Lectura",
      descripcion: "Lee 5 libros en un mes",
      puntos: 75,
      duracion: "1 mes",
      modalidad: "Individual",
      tipo: "Misión",
      estado: "En progreso",
    },
    {
      id: 4,
      nombre: "Torneo de Ajedrez",
      descripcion: "Participa en el torneo escolar de ajedrez",
      puntos: 60,
      duracion: "1 semana",
      modalidad: "Individual",
      tipo: "Actividad",
      estado: "Inscribirse",
    },
    {
      id: 5,
      nombre: "Proyecto de Arte Comunitario",
      descripcion: "Crea un mural para la escuela",
      puntos: 120,
      duracion: "2 semanas",
      modalidad: "Grupal",
      tipo: "Misión",
      estado: "Inscribirse",
    },
    {
      id: 6,
      nombre: "Olimpiadas de Matemáticas",
      descripcion: "Compite en las olimpiadas escolares",
      puntos: 90,
      duracion: "1 día",
      modalidad: "Individual",
      tipo: "Actividad",
      estado: "Completada",
    },
  ]);

  const confirmarInscripcion = (id) => {
    const actualizadas = actividades.map((a) =>
      a.id === id ? { ...a, estado: "En progreso" } : a
    );
    setActividades(actualizadas);
    setActividadSeleccionada(null);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Participar en actividades" />

      <main className="participar-main">
        <div className="participar-header">
          <h2 className="participar-title">Participar en Actividades</h2>
          <p className="participar-subtitle">
            Sube tu participación y/o inscríbete en una actividad para ganar insignias y puntos por tu esfuerzo
          </p>
        </div>
        <div className="participar-content-container">
          <form className="participar-form" onSubmit={handleSubmit}>
            <label>
              Título de la Actividad:
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className={errors.titulo ? "input-error" : ""}
                placeholder="Ej: Proyecto Feria de Ciencias"
              />
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
                  {typeof previewUrl === "string" &&
                  previewUrl.startsWith("data:image") ? (
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
                    onClick={() =>
                      confirmarInscripcion(actividadSeleccionada.id)
                    }
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
        </div>
      </main>
    </div>
  );
};

export default ParticiparPage;
