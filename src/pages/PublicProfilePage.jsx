import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Cookies from "js-cookie";
import "../styles/perfil.css";
import Swal from "sweetalert2";
import { PacmanLoader, ClipLoader } from "react-spinners";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const [user, setUser] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [seguidos, setSeguidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insigniasDestacadas, setInsigniasDestacadas] = useState([]);
  const [insignias, setInsignias] = useState([]);
  const [menuComentarioAbiertoId, setMenuComentarioAbiertoId] = useState(null);
  const [comentarioEliminandoId, setComentarioEliminandoId] = useState(null);
  const [comentarioCargando, setComentarioCargando] = useState(false);
  const menuComentarioRef = useRef(null);

  useEffect(() => {
    if (menuComentarioAbiertoId === null) return;

    function handleClickOutside(event) {
      if (
        menuComentarioRef.current &&
        !menuComentarioRef.current.contains(event.target)
      ) {
        setMenuComentarioAbiertoId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuComentarioAbiertoId]);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Usuario no encontrado");
        const u = await res.json();
        setUser(u);

        const resSeguimiento = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/seguimientos/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!resSeguimiento.ok)
          throw new Error("Error al obtener seguidores y seguidos");

        const { seguidores, seguidos } = await resSeguimiento.json();
        setFollowersCount(seguidores.length);
        setSeguidos(seguidos);

        const currentUserId = getUserIdFromToken();

        const yaSigue = seguidores.some(
          (seg) => seg.id_usuario === currentUserId
        );
        setIsFollowing(yaSigue);
      } catch (err) {
        console.error(err);
        navigate("/not-found");
      } finally {
        setLoading(false);
      }
    };

    const getUserIdFromToken = () => {
      try {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        return tokenData.id || tokenData.id_usuario;
      } catch (err) {
        console.error("Error al decodificar token:", err);
        return null;
      }
    };

    const fetchPublicaciones = async () => {
      try {
        const res = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/usuario/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!res.ok) {
          if (res.status === 404) {
            setPublicaciones([]);
            return;
          }
          throw new Error("Error al cargar publicaciones");
        }
        const pubs = await res.json();
        setPublicaciones(
          pubs.map((p) => ({
            id: p.id_publicacion,
            descripcion: p.descripcion,
            fecha: p.fechaPublicacion,
            likes: p.cantidadLikes,
            liked: p.meGusta,
            imagenes: p.imagenes,
          }))
        );
      } catch (err) {
        console.warn(err);
        setPublicaciones([]);
      }
    };

    const fetchInsigniasReclamadas = async () => {
      try {
        const res = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/reclamadas/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("No se pudieron obtener las insignias");

        const data = await res.json();
        setInsignias(data);

        const idsDestacadas = data.slice(0, 3).map((ins) => ins._id);
        setInsigniasDestacadas(idsDestacadas);
      } catch (err) {
        console.warn("Error al obtener insignias:", err);
        setInsignias([]);
      }
    };

    fetchUser();
    fetchPublicaciones();
    fetchInsigniasReclamadas();
  }, [userId, token, navigate]);

  if (loading)
    return (
      <div className="loading-container">
        <PacmanLoader color="#e67e22" size={40} />
      </div>
    );

  const openPost = (post) => {
    setSelectedPost(post);
    fetchComentarios(post.id);
  };

  const fetchComentarios = async (postId) => {
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${postId}/comentarios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.warn("Error al cargar comentarios");
        setComentarios((prev) => ({ ...prev, [postId]: [] }));
        return;
      }
      const dataComentarios = await res.json();
      const autorCache = new Map();

      const enriched = await Promise.all(
        dataComentarios.map(async (comentario) => {
          let autor = autorCache.get(comentario.autorId);
          if (!autor) {
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
            if (resAutor.ok) autor = await resAutor.json();
            autorCache.set(comentario.autorId, autor);
          }
          return { ...comentario, autor };
        })
      );

      setComentarios((prev) => ({ ...prev, [postId]: enriched }));
    } catch (err) {
      console.error("Error en fetchComentarios:", err);
    }
  };

  const toggleFollow = async () => {
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/seguimiento`,
        {
          method: isFollowing ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ seguidoId: userId }),
        }
      );

      if (!res.ok)
        throw new Error(
          isFollowing ? "Error al dejar de seguir" : "Error al seguir"
        );

      setIsFollowing((prev) => !prev);
      setFollowersCount((prev) => prev + (isFollowing ? -1 : 1));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleLike = async () => {
    if (!selectedPost || selectedPost.liked) return;
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${selectedPost.id}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Error al dar like");

      setPublicaciones((ps) =>
        ps.map((p) =>
          p.id === selectedPost.id
            ? { ...p, likes: p.likes + 1, liked: true }
            : p
        )
      );
      setSelectedPost((p) => ({
        ...p,
        likes: p.likes + 1,
        liked: true,
      }));
    } catch (err) {
      console.warn(err);
    }
  };

  const enviarComentario = async (e) => {
    e.preventDefault();
    const texto = nuevoComentario.trim();
    if (!texto || !selectedPost) return;

    setComentarioCargando(true);
    const token = Cookies.get("token");
    const postId = selectedPost.id;

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${postId}/comentarios`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            texto,
            publicacionId: postId,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Error al crear comentario:", data);
        Swal.fire(
          "Error",
          data.error || "No se pudo crear el comentario",
          "error"
        );
        return;
      }

      setNuevoComentario("");

      const resComentarios = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${postId}/comentarios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!resComentarios.ok) {
        console.warn("No se pudieron recargar comentarios");
        return;
      }

      const dataComentarios = await resComentarios.json();

      const autorCache = new Map();
      const enriquecidos = await Promise.all(
        dataComentarios.map(async (comentario) => {
          let autor = autorCache.get(comentario.autorId);
          if (!autor) {
            const resAutor = await fetch(
              `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${comentario.autorId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
              }
            );
            if (resAutor.ok) {
              autor = await resAutor.json();
              autorCache.set(comentario.autorId, autor);
            }
          }
          return { ...comentario, autor: autor || null };
        })
      );

      setComentarios((prev) => ({
        ...prev,
        [postId]: enriquecidos,
      }));
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      Swal.fire("Error", "Hubo un problema al enviar el comentario", "error");
    } finally {
      setComentarioCargando(false);
    }
  };

  const tiempoTranscurrido = (fecha) => {
    const diffMs = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Justo ahora";
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs} h`;
    const dias = Math.floor(hrs / 24);
    return `Hace ${dias} día${dias !== 1 ? "s" : ""}`;
  };
  const avatarPorDefecto =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  if (!user) return;

  const getCurrentUserId = () => {
    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      return tokenData.id || tokenData.id_usuario;
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  const eliminarComentario = async (postId, comentarioId) => {
    setComentarioEliminandoId(comentarioId);
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/comentarios/${comentarioId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      if (res.ok) {
        setComentarios((prev) => ({
          ...prev,
          [postId]: prev[postId].filter(
            (c) => c.id_comentario !== comentarioId
          ),
        }));
      } else {
        Swal.fire("Error", "No se pudo eliminar el comentario", "error");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      Swal.fire("Error", "Error de red al eliminar comentario", "error");
    } finally {
      setComentarioEliminandoId(null);
      setMenuComentarioAbiertoId(null);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active={null} />
      <main className="perfil-main">
        <div className="perfil-ig-header">
          <div className="perfil-badges-section">
            <div className="perfil-badges-header">
              <span className="perfil-badges-title">Insignias Destacadas</span>
            </div>
            <div className="perfil-badges-aside">
              {insigniasDestacadas.length > 0 ? (
                insignias
                  .filter((ins) => insigniasDestacadas.includes(ins._id))
                  .map((insignia) => (
                    <div
                      className="perfil-badge"
                      key={insignia._id}
                      title={insignia.descripcion}
                    >
                      <img
                        src={insignia.imagenes?.[0]?.url}
                        alt={insignia.nombre}
                        className="perfil-badge-img"
                      />
                      <span className="perfil-badge-nombre">
                        {insignia.nombre}
                      </span>
                    </div>
                  ))
              ) : (
                <span className="perfil-badge-placeholder">
                  Sin insignias destacadas aún
                </span>
              )}
            </div>
          </div>
          <img
            src={
              user.foto_perfil?.[0]?.url
                ? user.foto_perfil[0].url
                : avatarPorDefecto
            }
            alt="Avatar"
            className="perfil-ig-avatar"
          />
          <div className="perfil-ig-info">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <h2 className="perfil-ig-nombre">
                @{user.nombre} {user.apellido}
              </h2>
              <button
                className={`follow-button ${isFollowing ? "following" : ""}`}
                onClick={toggleFollow}
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </button>
            </div>
            <div className="perfil-ig-contadores">
              <div>
                <strong>{publicaciones.length}</strong> publicaciones
              </div>
              <div>
                <strong>{followersCount}</strong> seguidores
              </div>
              <div>
                <strong>{seguidos.length}</strong> seguidos
              </div>
            </div>
            <p className="perfil-ig-rol">
              {user.rol} – {user.correo}
            </p>
          </div>
        </div>

        <div className="perfil-galeria">
          {publicaciones.length === 0 ? (
            <p className="perfil-no-publicaciones">
              Este usuario aún no tiene publicaciones.
            </p>
          ) : (
            publicaciones.map((post) => (
              <div
                key={post.id}
                className="perfil-post"
                onClick={() => openPost(post)}
              >
                <img src={post.imagenes[0]?.url} alt={post.descripcion} />
              </div>
            ))
          )}
        </div>

        {selectedPost && (
          <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
            <div
              className="modal-instagram"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-left">
                <img
                  src={
                    selectedPost.imagenes[0]?.url ||
                    "https://via.placeholder.com/600"
                  }
                  alt="publicación"
                />
              </div>
              <div className="modal-right">
                <div className="ig-header">
                  <img
                    src={
                      user.foto_perfil?.[0]?.url ||
                      "https://via.placeholder.com/40"
                    }
                    alt="avatar"
                    className="ig-avatar"
                  />
                  <span className="ig-username">
                    @{user.nombre} {user.apellido}
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

                <div className="ig-post-description">
                  <img
                    src={
                      user.foto_perfil?.[0]?.url ||
                      "https://via.placeholder.com/40"
                    }
                    alt="avatar"
                    className="ig-avatar"
                  />
                  <div>
                    <p>
                      <strong>
                        @{user.nombre} {user.apellido}
                      </strong>{" "}
                      {selectedPost.descripcion}
                    </p>
                    <span className="ig-date">
                      {new Date(selectedPost.fecha).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>

                <div className="modal-comentarios">
                  {(comentarios[selectedPost.id] || []).length === 0 ? (
                    <p className="comentario-placeholder">
                      Sé el primero en comentar
                    </p>
                  ) : (
                    comentarios[selectedPost.id].map((c) => (
                      <div
                        key={c.id_comentario || c.id}
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
                        {/* Avatar */}
                        <img
                          src={
                            c.autor?.foto_perfil?.[0]?.url ||
                            c.autor?.foto_perfil ||
                            "https://via.placeholder.com/40"
                          }
                          alt="avatar"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginRight: "8px",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <strong style={{ marginRight: "4px" }}>
                              @{c.autor?.nombre || "usuario"}{" "}
                              {c.autor?.apellido || "usuario"}
                            </strong>
                            <span
                              style={{
                                color: "#999",
                                fontSize: 12,
                                marginLeft: 5,
                              }}
                            >
                              {tiempoTranscurrido(c.fecha)}
                            </span>
                          </div>
                          <span style={{ wordBreak: "break-word" }}>
                            {c.texto}
                          </span>
                        </div>
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
                                marginLeft: 4,
                              }}
                              title="Opciones"
                            >
                              ⋮
                            </button>
                            {menuComentarioAbiertoId === c.id_comentario && (
                              <div
                                className="comentario-menu"
                                ref={menuComentarioRef}
                              >
                                <button
                                  onClick={() => {
                                    eliminarComentario(
                                      selectedPost.id,
                                      c.id_comentario
                                    );
                                  }}
                                  disabled={
                                    comentarioEliminandoId === c.id_comentario
                                  }
                                >
                                  {comentarioEliminandoId === c.id_comentario
                                    ? "Eliminando..."
                                    : "Eliminar"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="ig-bottom-section">
                  <div className="ig-actions">
                    <button
                      className={`ig-action-icon ${
                        selectedPost.liked ? "liked" : ""
                      }`}
                      onClick={handleLike}
                    >
                      {selectedPost.liked ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div className="ig-likes-info">
                    {selectedPost.likes > 0 ? (
                      <span>
                        {selectedPost.likes === 1
                          ? "Le gusta a"
                          : "Les gusta a"}{" "}
                        <strong>{selectedPost.likes}</strong>{" "}
                        {selectedPost.likes === 1 ? "persona" : "personas"}
                      </span>
                    ) : (
                      <span>Sé el primero en dar like ❤️</span>
                    )}
                  </div>
                  <div className="ig-date-bottom">
                    {new Date(selectedPost.fecha).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <form className="ig-comment-form" onSubmit={enviarComentario}>
                    <button type="button" className="ig-action-icon">
                      💬
                    </button>
                    <input
                      type="text"
                      placeholder="Agrega un comentario..."
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!nuevoComentario.trim() || comentarioCargando}
                    >
                      {comentarioCargando ? (
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
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicProfilePage;
