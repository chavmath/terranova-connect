import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/feed.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie"; // agrego esto matias
import { PacmanLoader } from "react-spinners";

const getCurrentUserId = () => {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    // JWT = header.payload.signature
    const payloadBase64 = token.split(".")[1];
    const jsonPayload = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    );
    const { id } = JSON.parse(jsonPayload);
    return id;
  } catch (err) {
    console.error("Error decodificando token:", err);
    return null;
  }
};

const FeedPage = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [archivos, setArchivos] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [previewActivo, setPreviewActivo] = useState(null); // { url, tipo }
  const [comentarios, setComentarios] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState({});
  const currentUserId = getCurrentUserId();
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [page, setPage] = useState(1); // Controlar la página actual
  const [hasMore, setHasMore] = useState(true); // Para verificar si hay más publicaciones
  const navigate = useNavigate();

  // 📥 Cargar publicaciones desde el backend
  const obtenerPublicaciones = async () => {
    if (loading || !hasMore) {
      console.log("Ya está cargando o no hay más publicaciones.");
      return; // No hacer nada si ya está cargando o no hay más publicaciones
    }

    console.log("Cargando publicaciones para la página:", page);
    setLoading(true); // Activar estado de carga

    const token = Cookies.get("token");

    try {
      const res = await fetch(
        `http://localhost:3000/publicaciones?page=${page}&size=10`, // Pasar page y size aquí
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      console.log("Respuesta de la API: ", res); // Verifica la respuesta

      if (!res.ok) {
        console.log("Error en la respuesta del servidor:", res);
        throw new Error("Error al cargar publicaciones");
      }

      const publicacionesRaw = await res.json();
      console.log("Publicaciones recibidas:", publicacionesRaw);

      if (publicacionesRaw.length === 0) {
        console.log("No hay más publicaciones para cargar.");
        setHasMore(false); // Ya no hay más publicaciones
      }

      const autorCache = new Map();
      const publicacionesConAutor = await Promise.all(
        publicacionesRaw.map(async (pub) => {
          let autor = autorCache.get(pub.autorId);

          if (!autor) {
            try {
              const resAutor = await fetch(
                `http://localhost:3000/usuario/${pub.autorId}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }
              );

              if (resAutor.ok) {
                autor = await resAutor.json();
                autorCache.set(pub.autorId, autor);
              }
            } catch (err) {
              console.warn("Error al obtener autor", pub.autorId, err);
            }
          }

          return {
            ...pub,
            autor: autor || null,
          };
        })
      );

      console.log("Publicaciones enriquecidas:", publicacionesConAutor);

      // Actualizar el estado de las publicaciones
      setPublicaciones((prev) => {
        // Filtrar las publicaciones que ya están en el estado
        const existingIds = new Set(prev.map((pub) => pub.id_publicacion));

        const nuevasPublicaciones = publicacionesConAutor.filter(
          (pub) => !existingIds.has(pub.id_publicacion)
        );

        console.log(
          "Publicaciones nuevas sin duplicados: ",
          nuevasPublicaciones
        ); // Verifica que las nuevas publicaciones estén siendo procesadas

        // Devolver las publicaciones combinadas
        return [...prev, ...nuevasPublicaciones];
      });
    } catch (error) {
      console.error("Error al obtener publicaciones:", error);
      Swal.fire(
        "Error",
        "Hubo un problema al cargar las publicaciones",
        "error"
      );
    } finally {
      console.log("Fin de la carga de publicaciones.");
      setLoading(false); // Desactivar el estado de carga
    }
  };

  useEffect(() => {
    console.log("Página actual:", page);
    obtenerPublicaciones();
  }, [page]); // Esto asegura que se llamará a obtenerPublicaciones cada vez que cambie la página

  // Detectar cuando se llega al final de la página
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;

    if (bottom && hasMore && !loading) {
      console.log("Llegamos al final del feed, cargando más publicaciones...");
      setLoading(true); // Activar estado de carga
      setPage((prev) => prev + 1); // Avanzar a la siguiente página
    }
  };

  useEffect(() => {
    // Añadir el evento de scroll
    const feedElement = document.querySelector(".feed-main");
    feedElement.addEventListener("scroll", handleScroll);

    return () => {
      // Limpiar el evento cuando el componente se desmonte
      feedElement.removeEventListener("scroll", handleScroll);
    };
  }, [loading, hasMore]); // Ejecutar cada vez que loading o hasMore cambien
  // Like a publicación
  const toggleLike = async (id_publicacion) => {
    const updated = publicaciones.map((pub) =>
      pub.id_publicacion === id_publicacion
        ? {
            ...pub,
            meGusta: !pub.meGusta,
            cantidadLikes: pub.meGusta
              ? pub.cantidadLikes - 1
              : pub.cantidadLikes + 1,
          }
        : pub
    );
    setPublicaciones(updated);

    const token = Cookies.get("token");

    try {
      await fetch(
        `http://localhost:3000/publicaciones/${id_publicacion}/like`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
            "Content-Type": "application/json",
          },
          method: "POST",
          credentials: "include",
        }
      );
    } catch (err) {
      console.error("Error al dar like:", err);
    }
  };
  const avatarPorDefecto =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleAuthorClick = (authorId) => {
    if (authorId && currentUserId && authorId === currentUserId) {
      navigate("/perfil");
    } else {
      navigate(`/perfil/${authorId}`);
    }
  };

  // ➕ Crear publicación
  const handlePublicar = async () => {
    if (!nuevaDescripcion || !archivos?.length) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    const formData = new FormData();
    formData.append("descripcion", nuevaDescripcion);
    for (let i = 0; i < archivos.length; i++) {
      formData.append("archivos", archivos[i]);
    }
    setMostrarModal(false);
    Swal.fire({
      title: "Publicando...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    const token = Cookies.get("token");

    try {
      const res = await fetch("http://localhost:3000/publicaciones", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // solo autorización
        },
        body: formData, // body = FormData
        credentials: "include",
      });

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire("¡Publicado!", "Tu publicación ha sido guardada", "success");
        try {
          const resAutor = await fetch(
            `http://localhost:3000/usuario/${data.autorId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          const autor = resAutor.ok ? await resAutor.json() : null;

          const nuevaPublicacion = {
            ...data,
            autor,
          };

          setPublicaciones([nuevaPublicacion, ...publicaciones]);
        } catch (err) {
          console.warn(
            "No se pudo cargar el autor de la nueva publicación",
            err
          );
          setPublicaciones([{ ...data, autor: null }, ...publicaciones]);
        }

        setNuevaDescripcion("");
        setArchivos(null);
        setPreviews([]);
        setPreviewActivo(null);
      } else {
        Swal.fire("Error", data.error || "No se pudo publicar", "error");

        setNuevaDescripcion("");
        setArchivos(null);
        setPreviews([]);
        setPreviewActivo(null);
      }
    } catch (error) {
      console.error(error);
      Swal.close();
      Swal.fire("Error", "Hubo un problema con el servidor", "error");
    }
  };

  const cerrarModalPublicacion = () => {
    setMostrarModal(false);
    setNuevaDescripcion("");
    setArchivos(null);
    setPreviews([]);
    setPreviewActivo(null);
  };

  const cargarComentarios = async (id_publicacion) => {
    const token = Cookies.get("token");
    try {
      const res = await fetch(
        `http://localhost:3000/publicaciones/${id_publicacion}/comentarios`,
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
        return;
      }

      // Enriquecer cada comentario con datos del autor (igual que publicaciones)
      const autorCache = new Map();

      const comentariosConAutor = await Promise.all(
        data.map(async (comentario) => {
          let autor = autorCache.get(comentario.autorId);

          if (!autor) {
            try {
              const resAutor = await fetch(
                `http://localhost:3000/usuario/${comentario.autorId}`,
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
            } catch (err) {
              console.warn("Error al obtener autor del comentario", err);
              Swal.fire(
                "Error",
                "No se pudo cargar el autor del comentario",
                "error"
              );
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
        [id_publicacion]: comentariosConAutor,
      }));
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
      Swal.fire("Error", "Fallo la conexión con el servidor", "error");
    }
  };

  const enviarComentario = async (e, id_publicacion) => {
    e.preventDefault();
    const texto = nuevoComentario[id_publicacion];
    if (!texto?.trim()) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(
        `http://localhost:3000/publicaciones/${id_publicacion}/comentarios`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Agregar el token a la cabecera
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ texto, publicacionId: id_publicacion }), // 👈 Incluido aquí
        }
      );

      const data = await res.json();
      if (res.ok) {
        setNuevoComentario((prev) => ({ ...prev, [id_publicacion]: "" }));
        setComentarios((prev) => ({
          ...prev,
          [id_publicacion]: [data, ...(prev[id_publicacion] || [])],
        }));
      } else {
        console.error("Error al comentar:", data.error);
        Swal.fire(
          "Error",
          data.error || "No se pudo enviar el comentario",
          "error"
        );
      }
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      Swal.fire("Error", "Hubo un problema con el servidor", "error");
    }
  };

  const eliminarPreview = (index) => {
    const nuevasPreviews = [...previews];
    nuevasPreviews.splice(index, 1);

    // Actualiza archivos también (porque se usan en el FormData)
    const nuevosArchivos = Array.from(archivos).filter((_, i) => i !== index);

    setPreviews(nuevasPreviews);
    setArchivos(nuevosArchivos);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }} onScroll={handleScroll}>
      <Sidebar active="Publicaciones" />

      <main className="feed-main">
        <div className="feed-title-container">
          <h2 className="feed-title">📰 Publicaciones recientes</h2>
          <p className="feed-subtitle">
            Explora lo que comparten otros estudiantes y profesores
          </p>
        </div>

        {publicaciones.map((pub) => (
          <div className="feed-card" key={pub.id_publicacion}>
            <div className="feed-header">
              <img
                src={
                  pub.autor?.foto_perfil?.[0]?.url
                    ? pub.autor.foto_perfil[0].url
                    : avatarPorDefecto
                }
                alt="avatar"
                className="feed-avatar"
              />

              <div>
                <p
                  className="feed-author clickable"
                  onClick={() => handleAuthorClick(pub.autor?.id_usuario)}
                >
                  @{pub.autor?.nombre || "Usuario"} {pub.autor?.apellido || ""}
                </p>
                <p className="feed-date">
                  📅{" "}
                  {new Date(pub.fechaPublicacion).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>

            {pub.imagenes?.length > 0 && (
              <img
                src={pub.imagenes[0].url}
                alt="publicación"
                className="feed-image"
              />
            )}

            <div className="feed-actions">
              <div className="feed-action-icons">
                <button
                  className={`feed-icon-button ${pub.meGusta ? "liked" : ""}`}
                  onClick={() => toggleLike(pub.id_publicacion)}
                >
                  {pub.meGusta ? "❤️" : "🤍"}
                </button>

                <span className="feed-likes-text">
                  {pub.cantidadLikes === 0
                    ? "Sé el primero en dar like"
                    : `${pub.cantidadLikes} Me gusta`}
                </span>

                <button
                  className="feed-icon-button"
                  onClick={() => cargarComentarios(pub.id_publicacion)}
                >
                  💬
                </button>

                <span className="feed-likes-text">
                  {comentarios[pub.id_publicacion]
                    ? `${comentarios[pub.id_publicacion].length} comentario${
                        comentarios[pub.id_publicacion].length === 1 ? "" : "s"
                      }`
                    : "0 comentarios"}
                </span>
              </div>

              <p className="feed-description">
                <strong>
                  @{pub.autor?.nombre || "usuario"}{" "}
                  {pub.autor?.apellido || "usuario"}
                </strong>{" "}
                {pub.descripcion}
              </p>

              <button
                className="feed-ver-comentarios"
                onClick={() => cargarComentarios(pub.id_publicacion)}
              >
                Ver los comentarios
              </button>

              {comentarios[pub.id_publicacion]?.map((c) => (
                <div key={c.id_comentario} className="feed-comentario">
                  <strong>
                    @{c.autor?.nombre || "usuario"}{" "}
                    {c.autor?.apellido || "usuario"}
                  </strong>{" "}
                  {c.texto}
                </div>
              ))}

              <div className="feed-comentario-input-container">
                <form
                  className="ig-comment-form"
                  onSubmit={(e) => enviarComentario(e, pub.id_publicacion)}
                >
                  <input
                    type="text"
                    placeholder="Agrega un comentario..."
                    value={nuevoComentario[pub.id_publicacion] || ""}
                    onChange={(e) =>
                      setNuevoComentario((prev) => ({
                        ...prev,
                        [pub.id_publicacion]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="submit"
                    disabled={!nuevoComentario[pub.id_publicacion]?.trim()}
                  >
                    Publicar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        <button className="feed-fab" onClick={() => setMostrarModal(true)}>
          ➕ Publicar
        </button>
        {loading && (
          <div className="spinner-container">
            <PacmanLoader size={30} color={"#e67e22"} loading={loading} />
          </div>
        )}

        {!hasMore && <p>No hay más publicaciones</p>}
      </main>

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModalPublicacion}>
          <div className="modal-publicar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <img
                src={
                  JSON.parse(localStorage.getItem("usuario"))?.foto_perfil?.[0]
                    ?.url || "https://via.placeholder.com/150"
                }
                alt="avatar"
                className="modal-avatar"
              />
              <div className="modal-user-info">
                <p className="modal-user">
                  @
                  {JSON.parse(localStorage.getItem("usuario"))?.nombre ||
                    "Usuario"}{" "}
                  {JSON.parse(localStorage.getItem("usuario"))?.apellido ||
                    "Usuario"}
                </p>
                <p className="modal-rol">
                  {JSON.parse(localStorage.getItem("usuario"))?.rol || ""}
                </p>
              </div>
            </div>

            <textarea
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              rows="3"
              placeholder="¿Qué estás pensando?"
              className="modal-textarea"
            />

            <label className="modal-file-label">
              📎 Agregar imagen o video
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setArchivos(e.target.files); // sigue siendo necesario para el FormData

                  const newPreviews = files.map((file) => ({
                    file,
                    url: URL.createObjectURL(file),
                  }));

                  setPreviews(newPreviews);
                }}
              />
            </label>
            {previews.length > 0 && (
              <div className="preview-container">
                {previews.map((item, idx) => (
                  <div key={idx} className="preview-item">
                    {item.file.type.startsWith("video") ? (
                      <video
                        src={item.url}
                        className="preview-media"
                        onClick={() =>
                          setPreviewActivo({ url: item.url, tipo: "video" })
                        }
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={`preview-${idx}`}
                        className="preview-media"
                        onClick={() =>
                          setPreviewActivo({ url: item.url, tipo: "imagen" })
                        }
                      />
                    )}
                    <button
                      className="preview-remove"
                      onClick={() => eliminarPreview(idx)}
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-buttons">
              <button className="publicar-btn" onClick={handlePublicar}>
                Publicar
              </button>
              <button className="cancelar" onClick={cerrarModalPublicacion}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {previewActivo && (
        <div
          className="preview-full-overlay"
          onClick={() => setPreviewActivo(null)}
        >
          <div
            className="preview-full-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="preview-full-close"
              onClick={() => setPreviewActivo(null)}
            >
              ✖
            </button>

            {previewActivo.tipo === "imagen" ? (
              <img
                src={previewActivo.url}
                alt="Preview grande"
                className="preview-full-media"
              />
            ) : (
              <video
                src={previewActivo.url}
                controls
                className="preview-full-media"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
