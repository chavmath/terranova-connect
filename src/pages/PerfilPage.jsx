import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/perfil.css";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { FiEdit } from "react-icons/fi";

const PerfilPage = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [user, setUser] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [seguidores, setSeguidores] = useState([]);
  const [seguidos, setSeguidos] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalData, setModalData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    nuevaFoto: null,
    nuevaFotoPreview: "",
  });
  const [loading, setLoading] = useState(false);

  // 📥 Cargar publicaciones + perfil
  // 1. Define la función FUERA del useEffect, pero DENTRO del componente
  const cargarDatos = async () => {
    try {
      const token = Cookies.get("token");
      const [pubsRes, userRes] = await Promise.all([
        fetch(
          "https://kong-7df170cea7usbksss.kongcloud.dev/mis-publicaciones",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        ),
        fetch("https://kong-7df170cea7usbksss.kongcloud.dev/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }),
      ]);

      const publicacionesData = await pubsRes.json();
      const userData = await userRes.json();

      if (pubsRes.ok && userRes.ok) {
        setPublicaciones(publicacionesData);
        setUser(userData);
        const seguimientoRes = await fetch(
          `https://kong-7df170cea7usbksss.kongcloud.dev/seguidores-contar`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (seguimientoRes.ok) {
          const { seguidoresCount, seguidosCount } =
            await seguimientoRes.json();
          setSeguidores(seguidoresCount);
          setSeguidos(seguidosCount);
        } else {
          console.warn(
            "No se pudieron obtener los conteos de seguidores/seguidos"
          );
        }
      } else {
        console.error("Error al cargar datos del perfil o publicaciones");
      }
    } catch (err) {
      console.error("Error de red:", err);
    }
  };
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (user) {
      setModalData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        correo: user.correo || "",
        nuevaFoto: null,
        nuevaFotoPreview: "",
      });
    }
  }, [user]);

  const getCurrentUserId = () => {
    const token = Cookies.get("token");
    if (!token) {
      console.log("Token no encontrado");
      return null;
    }

    try {
      const payload = token.split(".")[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      // Base64 decoding
      const decoded = JSON.parse(atob(base64));
      const userId = decoded.id_usuario || decoded.id;
      return userId || null;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };

  const handleEditarUsuario = async (e) => {
    e.preventDefault();
    const { nombre, apellido, correo, nuevaFoto } = modalData;
    if (!nombre || !apellido || !correo) {
      Swal.fire("Error", "Todos los campos deben estar completos", "error");
      return;
    }

    setLoading(true);
    const token = Cookies.get("token");
    const userId = getCurrentUserId();
    if (!userId) {
      Swal.fire("Error", "No se pudo identificar el usuario", "error");
      setLoading(false);
      return;
    }
    try {
      const form = new FormData();
      if (nuevaFoto) form.append("foto_perfil", nuevaFoto);
      form.append("nombre", nombre);
      form.append("apellido", apellido);
      form.append("correo", correo);

      const res = await fetch(
        `https://kong-7df170cea7usbksss.kongcloud.dev/usuario/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Actualizado",
          text: "Usuario actualizado correctamente",
          icon: "success",
          confirmButtonText: "Ok",
        }).then(() => {
          setShowEditModal(false);
          cargarDatos(); // <<--- Recarga los datos del perfil
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo actualizar", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const editInputStyle = {
    width: "100%",
    border: "1.2px solid #d1d6f4",
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 0,
    fontSize: 15,
    fontWeight: 500,
    outline: "none",
    background: "#f8f9fd",
  };

  useEffect(() => {
    const cargarComentarios = async () => {
      if (!selectedPost) return;
      const token = Cookies.get("token");

      try {
        const res = await fetch(
          `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}/comentarios`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("Error al obtener comentarios");
          setComentarios([]);
          return;
        }

        // Obtener autores (evita duplicar llamadas)
        const autorCache = new Map();

        const enriquecidos = await Promise.all(
          data.map(async (comentario) => {
            let autor = autorCache.get(comentario.autorId);

            if (!autor) {
              const resAutor = await fetch(
                `https://kong-7df170cea7usbksss.kongcloud.dev/usuario/${comentario.autorId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }
              );
              if (resAutor.ok) {
                autor = await resAutor.json();
                autorCache.set(comentario.autorId, autor);
              }
            }

            return {
              ...comentario,
              autor: autor || null,
            };
          })
        );

        setComentarios((prev) => ({
          ...prev,
          [selectedPost.id_publicacion]: enriquecidos,
        }));
      } catch (err) {
        console.error("Error de red al obtener comentarios:", err);
      }
    };

    cargarComentarios();
  }, [selectedPost]);

  const handleLike = () => {
    if (!selectedPost) return;

    const yaLeDiLike = selectedPost.meGusta;
    const nuevoEstado = {
      ...selectedPost,
      meGusta: !yaLeDiLike,
      cantidadLikes: selectedPost.cantidadLikes + (yaLeDiLike ? -1 : 1),
    };

    // Actualiza el modal
    setSelectedPost(nuevoEstado);

    // Actualiza la lista general
    const publicacionesActualizadas = publicaciones.map((pub) =>
      pub.id_publicacion === selectedPost.id_publicacion ? nuevoEstado : pub
    );
    setPublicaciones(publicacionesActualizadas);
    const token = Cookies.get("token");
    // Llamada al backend
    fetch(
      `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}/like`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
      }
    ).catch((err) => {
      console.error("Error al actualizar like:", err);
    });
  };

  const enviarComentario = async (e) => {
    e.preventDefault();
    const texto = nuevoComentario.trim();
    if (!texto || !selectedPost) return;
    const token = Cookies.get("token");
    try {
      const res = await fetch(
        `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}/comentarios`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            texto,
            publicacionId: selectedPost.id_publicacion,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setNuevoComentario("");

        // Vuelve a cargar todos los comentarios incluyendo autor
        const resComentarios = await fetch(
          `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}/comentarios`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const dataComentarios = await resComentarios.json();
        if (resComentarios.ok) {
          // Enriquecer con autor
          const autorCache = new Map();
          const enriquecidos = await Promise.all(
            dataComentarios.map(async (comentario) => {
              let autor = autorCache.get(comentario.autorId);

              if (!autor) {
                const resAutor = await fetch(
                  `https://kong-7df170cea7usbksss.kongcloud.dev/usuario/${comentario.autorId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                  }
                );
                if (resAutor.ok) {
                  autor = await resAutor.json();
                  autorCache.set(comentario.autorId, autor);
                }
              }

              return {
                ...comentario,
                autor: autor || null,
              };
            })
          );

          setComentarios((prev) => ({
            ...prev,
            [selectedPost.id_publicacion]: enriquecidos,
          }));
        }
      } else {
        console.error("Error al comentar:", data.error);
        Swal.fire(
          "Error",
          data.error || "No se pudo crear el comentario",
          "error"
        );
      }
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      Swal.fire("Error", "Hubo un problema al enviar el comentario", "error");
    }
  };

  const tiempoTranscurrido = (fecha) => {
    const ahora = new Date();
    const publicada = new Date(fecha);
    const diffMs = ahora - publicada;

    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return "Justo ahora";
    if (minutos < 60)
      return `Hace ${minutos} minuto${minutos !== 1 ? "s" : ""}`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? "s" : ""}`;

    const dias = Math.floor(horas / 24);
    if (dias < 7) return `Hace ${dias} día${dias !== 1 ? "s" : ""}`;

    const semanas = Math.floor(dias / 7);
    return `Hace ${semanas} semana${semanas !== 1 ? "s" : ""}`;
  };
  /* const avatarPorDefecto =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"; */

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Mi perfil" />

      <main className="perfil-main">
        {/* PERFIL */}
        <div className="perfil-ig-header">
          <img src={user?.foto_perfil} alt="" className="perfil-ig-avatar" />

          <div className="perfil-ig-info">
            <h2 className="perfil-ig-nombre">
              @{user?.nombre} {user?.apellido}
              <button
                className="perfil-edit-btn"
                onClick={() => setShowEditModal(true)}
                title="Editar perfil"
              >
                <FiEdit size={22} color="#031f7b" />
              </button>
            </h2>

            <div className="perfil-ig-contadores">
              <div>
                <strong>{publicaciones.length}</strong>
                <span> publicaciones</span>
              </div>
              <div>
                <strong>{seguidores}</strong>
                <span> seguidores</span>
              </div>
              <div>
                <strong>{seguidos}</strong>
                <span> seguidos</span>
              </div>
            </div>

            <p className="perfil-ig-rol">
              {user?.rol?.toUpperCase()} - {user?.correo}
            </p>
          </div>
        </div>

        {/* GALERÍA */}
        <div className="perfil-galeria">
          {publicaciones.length === 0 ? (
            <p className="perfil-no-publicaciones">
              Aún no tienes publicaciones, ¡comienza a crear contenido!
            </p>
          ) : (
            publicaciones.map((post) => (
              <div
                key={post.id_publicacion}
                className="perfil-post"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={
                    post.imagenes?.[0]?.url || "https://via.placeholder.com/600"
                  }
                  alt={`post-${post.id_publicacion}`}
                />
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-instagram" onClick={(e) => e.stopPropagation()}>
            <div className="modal-left">
              <img
                src={
                  selectedPost.imagenes?.[0]?.url ||
                  "https://via.placeholder.com/600"
                }
                alt="publicación"
              />
            </div>

            <div className="modal-right">
              {/* Header usuario */}
              <div className="ig-header">
                <img
                  src={user?.foto_perfil}
                  alt="avatar"
                  className="ig-avatar"
                />
                <span className="ig-username">
                  @{user?.nombre} {user?.apellido}
                </span>
                <button
                  className="ig-close-button"
                  onClick={() => {
                    setSelectedPost(null);
                    setNuevoComentario("");
                  }}
                >
                  ✖
                </button>
              </div>
              <hr />

              {/* Descripción */}
              <div className="ig-post-description">
                <img
                  src={user?.foto_perfil}
                  alt="avatar"
                  className="ig-avatar"
                />
                <div>
                  <p>
                    <strong>
                      @{user?.nombre} {user?.apellido}
                    </strong>{" "}
                    {selectedPost.descripcion}
                  </p>
                  <span className="ig-date">
                    Editado ·{" "}
                    {new Date(
                      selectedPost.fechaPublicacion
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Comentarios */}
              <div className="modal-comentarios">
                {comentarios[selectedPost.id_publicacion]?.length === 0 ? (
                  <p className="comentario-placeholder">
                    Sé el primero en comentar
                  </p>
                ) : (
                  comentarios[selectedPost.id_publicacion]?.map(
                    (comentario) => (
                      <div
                        className="comentario-item"
                        key={comentario.id_comentario}
                      >
                        <img
                          src={
                            comentario.autor?.foto_perfil?.[0]?.url ||
                            "https://via.placeholder.com/40"
                          }
                          alt="avatar"
                        />
                        <div className="comentario-info">
                          <strong>
                            @{comentario.autor?.nombre || "Usuario"}{" "}
                            {comentario.autor?.apellido || "Usuario"}{" "}
                            <span>{comentario.texto}</span>
                          </strong>
                          <span className="comentario-fecha">
                            {tiempoTranscurrido(comentario.fecha)}
                          </span>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>

              {/* Acciones */}
              <div className="ig-bottom-section">
                <div className="ig-actions">
                  <div>
                    <button
                      className={`ig-action-icon ${
                        selectedPost.meGusta ? "liked" : ""
                      }`}
                      onClick={handleLike}
                    >
                      {selectedPost.meGusta ? (
                        <span
                          role="img"
                          aria-label="liked"
                          className="heart-icon filled"
                        >
                          ❤️
                        </span>
                      ) : (
                        <span
                          role="img"
                          aria-label="unliked"
                          className="heart-icon"
                        >
                          🤍
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="ig-likes-info">
                  {selectedPost.cantidadLikes > 0 ? (
                    <span>
                      {selectedPost.cantidadLikes === 1
                        ? "Le gusta a"
                        : "Les gusta a"}{" "}
                      <strong>{selectedPost.cantidadLikes}</strong>{" "}
                      {selectedPost.cantidadLikes === 1
                        ? "persona"
                        : "personas"}
                    </span>
                  ) : (
                    <span>Sé el primero en dar like ❤️</span>
                  )}
                </div>

                <div className="ig-date-bottom">
                  {new Date(selectedPost.fechaPublicacion).toLocaleDateString(
                    "es-ES",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </div>

                <form className="ig-comment-form" onSubmit={enviarComentario}>
                  <button className="ig-action-icon">💬</button>
                  <input
                    type="text"
                    placeholder="Agrega un comentario..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                  />
                  <button type="submit" disabled={!nuevoComentario.trim()}>
                    Publicar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div
          className="perfil-modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="perfil-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <form className="perfil-edit-form" onSubmit={handleEditarUsuario}>
              <h3 className="perfil-edit-title">Editar perfil</h3>
              <div className="perfil-edit-foto-box">
                <img
                  src={
                    modalData.nuevaFotoPreview ||
                    user?.foto_perfil ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Foto de perfil"
                  className="perfil-edit-foto"
                />
                <label
                  htmlFor="input-foto-perfil"
                  className="perfil-edit-foto-btn"
                  title="Cambiar foto de perfil"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#213a91"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="13" r="3" />
                    <path d="M5.5 7h1.11a2 2 0 0 0 1.7-.9l.88-1.32a2 2 0 0 1 1.66-.78h2.1a2 2 0 0 1 1.66.78l.88 1.32a2 2 0 0 0 1.7.9H18.5A2.5 2.5 0 0 1 21 9.5v6A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5v-6A2.5 2.5 0 0 1 5.5 7z" />
                  </svg>
                  <input
                    type="file"
                    id="input-foto-perfil"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setModalData((modalData) => ({
                        ...modalData,
                        nuevaFoto: file,
                        nuevaFotoPreview: file ? URL.createObjectURL(file) : "",
                      }));
                    }}
                  />
                </label>
              </div>
              <input
                className="perfil-edit-input"
                value={modalData.nombre}
                onChange={(e) =>
                  setModalData({ ...modalData, nombre: e.target.value })
                }
                placeholder="Nombre"
                required
              />
              <input
                className="perfil-edit-input"
                value={modalData.apellido}
                onChange={(e) =>
                  setModalData({ ...modalData, apellido: e.target.value })
                }
                placeholder="Apellido"
                required
              />
              <input
                className="perfil-edit-input"
                value={modalData.correo}
                onChange={(e) =>
                  setModalData({ ...modalData, correo: e.target.value })
                }
                placeholder="Correo"
                required
                type="email"
                disabled
              />
              <button
                className="perfil-edit-btn-save"
                type="submit"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilPage;
