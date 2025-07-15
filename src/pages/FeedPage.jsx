import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/feed.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { PacmanLoader, ClipLoader } from "react-spinners";

const getCurrentUserId = () => {
  const token = Cookies.get("token");
  if (!token) {
    console.log("Token no encontrado");
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));
    const userId = decoded.id_usuario || decoded.id;
    return userId || null;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

const FeedPage = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [archivos, setArchivos] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [previewActivo, setPreviewActivo] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState({});
  const currentUserId = getCurrentUserId();
  const [loading, setLoading] = useState(false);
  const [cantidadMostrar, setCantidadMostrar] = useState(5);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cargandoComentariosId, setCargandoComentariosId] = useState(null);
  const [comentariosCargandoId, setComentariosCargandoId] = useState(null);
  const [comentarioEliminandoId, setComentarioEliminandoId] = useState(null);
  const [menuComentarioAbiertoId, setMenuComentarioAbiertoId] = useState(null);
  const [comentarioEditandoId, setComentarioEditandoId] = useState({});
  const [comentarioEditandoLoading, setComentarioEditandoLoading] =
    useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuComentarioAbiertoId(null);
      }
    }

    if (menuComentarioAbiertoId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuComentarioAbiertoId]);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      setLoading(true);
      const token = Cookies.get("token");

      try {
        const res = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Error al cargar publicaciones");

        const publicacionesRaw = await res.json();

        const autorCache = new Map();
        const publicacionesConAutor = await Promise.all(
          publicacionesRaw.map(async (pub) => {
            let autor = autorCache.get(pub.autorId);
            if (!autor) {
              try {
                const resAutor = await fetch(
                  `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${pub.autorId}`,
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
            return { ...pub, autor: autor || null };
          })
        );

        setPublicaciones(publicacionesConAutor);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        Swal.fire(
          "Error",
          "Hubo un problema al cargar las publicaciones",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("token");
      const userId = getCurrentUserId();

      if (!userId || !token) return;

      try {
        const res = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Error al obtener datos del usuario");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error al obtener datos del usuario:", err);
      }
    };

    fetchUserData();
  }, []);
  if (user) {
    // eslint-disable-next-line no-unused-vars
    const { nombre, apellido, correo, rol: userRol, foto_perfil } = user;
  }

  const mostrarMas = () => {
    setCantidadMostrar((prev) => prev + 5);
  };

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
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${id_publicacion}/like`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        try {
          const resAutor = await fetch(
            `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${data.autorId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          const autor = resAutor.ok ? await resAutor.json() : null;

          const nuevaPublicacion = {
            ...data,
            autor,
            cantidadLikes: 0,
            meGusta: false,
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
    setCargandoComentariosId(id_publicacion);

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${id_publicacion}/comentarios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

      const autorCache = new Map();

      const comentariosConAutor = await Promise.all(
        data.map(async (comentario) => {
          let autor = autorCache.get(comentario.autorId);

          if (!autor) {
            try {
              const resAutor = await fetch(
                `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${comentario.autorId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
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
    } finally {
      setCargandoComentariosId(null);
    }
  };

  const enviarComentario = async (e, id_publicacion) => {
    e.preventDefault();
    const texto = nuevoComentario[id_publicacion];
    if (!texto?.trim()) return;

    setComentariosCargandoId(id_publicacion);

    try {
      const token = Cookies.get("token");
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${id_publicacion}/comentarios`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ texto, publicacionId: id_publicacion }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        let autor = null;
        try {
          const resAutor = await fetch(
            `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${data.autorId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          if (resAutor.ok) autor = await resAutor.json();
        } catch (err) {
          console.warn("No se pudo cargar autor del nuevo comentario", err);
        }

        const comentarioConAutor = {
          ...data,
          autor: autor || null,
        };

        setNuevoComentario((prev) => ({ ...prev, [id_publicacion]: "" }));
        setComentarios((prev) => ({
          ...prev,
          [id_publicacion]: [
            comentarioConAutor,
            ...(prev[id_publicacion] || []),
          ],
        }));
      } else {
        Swal.fire(
          "Error",
          data.error || "No se pudo enviar el comentario",
          "error"
        );
      }
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      Swal.fire("Error", "Hubo un problema con el servidor", "error");
    } finally {
      setComentariosCargandoId(null);
    }
  };

  const eliminarComentario = async (id_publicacion, id_comentario) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar comentario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    const token = Cookies.get("token");
    setComentarioEliminandoId(id_comentario);

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/comentarios/${id_comentario}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error();

      setTimeout(() => {
        setComentarios((prev) => ({
          ...prev,
          [id_publicacion]: prev[id_publicacion].filter(
            (c) => c.id_comentario !== id_comentario
          ),
        }));
        setComentarioEliminandoId(null);
      }, 300);
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
      Swal.fire("Error", "No se pudo eliminar el comentario", "error");
      setComentarioEliminandoId(null);
    }
  };

  const editarComentario = async (
    id_publicacion,
    id_comentario,
    nuevoTexto
  ) => {
    setComentarioEditandoLoading(true);
    const token = Cookies.get("token");
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/comentarios/${id_comentario}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ texto: nuevoTexto }),
        }
      );
      if (!res.ok) throw new Error();
      setComentarios((prev) => ({
        ...prev,
        [id_publicacion]: prev[id_publicacion].map((c) =>
          c.id_comentario === id_comentario ? { ...c, texto: nuevoTexto } : c
        ),
      }));
      setComentarioEditandoId((prev) => ({
        ...prev,
        [id_publicacion]: null,
      }));
      setNuevoComentario((prev) => ({ ...prev, [id_publicacion]: "" }));
    } catch {
      Swal.fire("Error", "No se pudo editar el comentario", "error");
    } finally {
      setComentarioEditandoLoading(false);
    }
  };

  const eliminarPreview = (index) => {
    const nuevasPreviews = [...previews];
    nuevasPreviews.splice(index, 1);

    const nuevosArchivos = Array.from(archivos).filter((_, i) => i !== index);

    setPreviews(nuevasPreviews);
    setArchivos(nuevosArchivos);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Publicaciones" />

      <main className="feed-main">
        <div className="feed-title-container">
          <h2 className="feed-title">Publicaciones recientes</h2>
          <p className="feed-subtitle">
            Explora lo que comparten otros estudiantes y profesores
          </p>
        </div>

        {publicaciones.slice(0, cantidadMostrar).map((pub) => (
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
                onClick={() => {
                  if (comentarios[pub.id_publicacion]) {
                    setComentarios((prev) => {
                      const nuevo = { ...prev };
                      delete nuevo[pub.id_publicacion];
                      return nuevo;
                    });
                  } else {
                    cargarComentarios(pub.id_publicacion);
                  }
                }}
                disabled={cargandoComentariosId === pub.id_publicacion}
              >
                {cargandoComentariosId === pub.id_publicacion
                  ? "Cargando..."
                  : comentarios[pub.id_publicacion]
                  ? "Ocultar comentarios"
                  : "Ver los comentarios"}
              </button>

              {comentarios[pub.id_publicacion] &&
                (comentarios[pub.id_publicacion].length === 0 ? (
                  <div
                    style={{
                      color: "#999",
                      fontStyle: "italic",
                      fontSize: "13px",
                      margin: "6px 0",
                    }}
                  >
                    No hay comentarios todavía. ¡Sé el primero en comentar!
                  </div>
                ) : (
                  comentarios[pub.id_publicacion].map((c) => (
                    <div
                      key={c.id_comentario}
                      className={`feed-comentario ${
                        comentarioEliminandoId === c.id_comentario
                          ? "comentario-fade-out"
                          : ""
                      }`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        fontSize: "14px",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ wordBreak: "break-word" }}>
                        <strong style={{ marginRight: "4px" }}>
                          @{c.autor?.nombre || "usuario"}{" "}
                          {c.autor?.apellido || "usuario"}
                        </strong>
                        {c.texto}
                      </span>
                      {c.autorId === currentUserId && (
                        <div
                          className="comentario-menu-container"
                          style={{ marginLeft: "auto", position: "relative" }}
                        >
                          <button
                            onClick={() =>
                              setMenuComentarioAbiertoId((prev) =>
                                prev === c.id_comentario
                                  ? null
                                  : c.id_comentario
                              )
                            }
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "18px",
                              cursor: "pointer",
                              color: "#666",
                            }}
                            title="Opciones"
                          >
                            ⋮
                          </button>
                          {menuComentarioAbiertoId === c.id_comentario && (
                            <div className="comentario-menu" ref={menuRef}>
                              <button
                                onClick={() => {
                                  setComentarioEditandoId((prev) => ({
                                    ...prev,
                                    [pub.id_publicacion]: c.id_comentario,
                                  }));
                                  setNuevoComentario((prev) => ({
                                    ...prev,
                                    [pub.id_publicacion]: c.texto,
                                  }));
                                  setMenuComentarioAbiertoId(null);
                                }}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  eliminarComentario(
                                    pub.id_publicacion,
                                    c.id_comentario
                                  );
                                  setMenuComentarioAbiertoId(null);
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ))}

              <div className="feed-comentario-input-container">
                <form
                  className="ig-comment-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (comentarioEditandoId[pub.id_publicacion]) {
                      editarComentario(
                        pub.id_publicacion,
                        comentarioEditandoId[pub.id_publicacion],
                        nuevoComentario[pub.id_publicacion]
                      );
                    } else {
                      enviarComentario(e, pub.id_publicacion);
                    }
                  }}
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
                    disabled={comentarioEditandoLoading}
                  />
                  {comentarioEditandoId[pub.id_publicacion] && (
                    <button
                      type="button"
                      title="Cancelar edición"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        marginRight: "6px",
                        cursor: "pointer",
                        color: "#e74c3c",
                      }}
                      onClick={() => {
                        setComentarioEditandoId((prev) => ({
                          ...prev,
                          [pub.id_publicacion]: null,
                        }));
                        setNuevoComentario((prev) => ({
                          ...prev,
                          [pub.id_publicacion]: "",
                        }));
                      }}
                      disabled={comentarioEditandoLoading}
                    >
                      ❌
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={
                      comentarioEditandoLoading ||
                      !nuevoComentario[pub.id_publicacion]?.trim() ||
                      comentariosCargandoId === pub.id_publicacion
                    }
                  >
                    {comentarioEditandoId[pub.id_publicacion] ? (
                      comentarioEditandoLoading ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <ClipLoader size={12} color="#0095f6" /> Guardando...
                        </span>
                      ) : (
                        "Guardar"
                      )
                    ) : comentariosCargandoId === pub.id_publicacion ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <ClipLoader size={12} color="#0095f6" /> Publicando...
                      </span>
                    ) : (
                      "Publicar"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div
            className="spinner-container"
            style={{ textAlign: "center", margin: "1rem" }}
          >
            <PacmanLoader size={30} color={"#e67e22"} loading={loading} />
          </div>
        )}

        {cantidadMostrar < publicaciones.length && (
          <div style={{ textAlign: "center", margin: "1rem" }}>
            <button className="mostrar-mas-btn" onClick={mostrarMas}>
              Mostrar más
            </button>
          </div>
        )}

        {publicaciones.length > 0 &&
          cantidadMostrar >= publicaciones.length && (
            <p style={{ textAlign: "center", margin: "1rem" }}>
              No hay más publicaciones
            </p>
          )}

        <button className="feed-fab" onClick={() => setMostrarModal(true)}>
          ➕ <span className="texto-publicar">Publicar</span>
        </button>
      </main>

      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModalPublicacion}>
          <div className="modal-publicar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <img
                src={
                  user?.foto_perfil?.[0]?.url ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                className="modal-avatar"
              />
              <div className="modal-user-info">
                <p className="modal-user">
                  @{user?.nombre || "Usuario"} {user?.apellido || ""}
                </p>
                <p className="modal-rol">{user?.rol || ""}</p>
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
                  setArchivos(e.target.files);

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
