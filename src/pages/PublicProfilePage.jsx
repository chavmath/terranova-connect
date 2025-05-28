import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Cookies from "js-cookie";
import "../styles/perfil.css";
import Swal from "sweetalert2";
import { PacmanLoader } from "react-spinners";

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
  const [seguidos, setSeguidos] = useState([]); // Nuevo estado para seguidos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    // 1) Carga datos del usuario
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `https://kong-7df170cea7usbksss.kongcloud.dev/usuario/${userId}`,
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

        // 2) Obtener seguidores y seguidos usando /seguimientos/:idPerfil
        const resSeguimiento = await fetch(
          `https://kong-7df170cea7usbksss.kongcloud.dev/seguimientos/${userId}`,
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

        // Obtener el ID del usuario autenticado desde el token
        const currentUserId = getUserIdFromToken();

        // Validar si el usuario autenticado sigue al perfil
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
        return tokenData.id || tokenData.id_usuario; // Asegúrate de cuál usas en tu payload
      } catch (err) {
        console.error("Error al decodificar token:", err);
        return null;
      }
    };

    const fetchPublicaciones = async () => {
      try {
        const res = await fetch(
          `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/usuario/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Agregar el token para el autor también
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

    fetchUser();
    fetchPublicaciones();
  }, [userId, token, navigate]);

  if (loading)
    return (
      <div className="loading-container">
        <PacmanLoader color="#e67e22" size={40} />
      </div>
    );

  // Abre el modal y carga comentarios
  const openPost = (post) => {
    setSelectedPost(post);
    fetchComentarios(post.id);
  };

  // Trae y enriquece los comentarios de una publicación
  const fetchComentarios = async (postId) => {
    try {
      const res = await fetch(
        `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/${postId}/comentarios`,
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
              `https://kong-7df170cea7usbksss.kongcloud.dev/usuario/${comentario.autorId}`,
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
        `https://kong-7df170cea7usbksss.kongcloud.dev/seguimiento`,
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

      // Solo actualiza seguidores del perfil público
      setIsFollowing((prev) => !prev);
      setFollowersCount((prev) => prev + (isFollowing ? -1 : 1));

      // NO modificar setSeguidos aquí, eso es del perfil visto, no del usuario logueado
    } catch (err) {
      console.warn(err);
    }
  };

  // Like
  const handleLike = async () => {
    if (!selectedPost || selectedPost.liked) return;
    try {
      const res = await fetch(
        `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/${selectedPost.id}/like`,
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

  // Enviar comentario y recargar lista
  const enviarComentario = async (e) => {
    e.preventDefault();
    const texto = nuevoComentario.trim();
    if (!texto || !selectedPost) return;

    const token = Cookies.get("token");
    const postId = selectedPost.id; // Asegúrate de que aquí coincida con tu mapping

    try {
      // 1) POST para crear comentario
      const res = await fetch(
        `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/${postId}/comentarios`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            texto,
            publicacionId: postId, // ← de nuevo en el body
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        // muestra el error que venga del servidor
        console.error("Error al crear comentario:", data);
        Swal.fire(
          "Error",
          data.error || "No se pudo crear el comentario",
          "error"
        );
        return;
      }

      // 2) si todo OK, limpio el input
      setNuevoComentario("");

      // 3) recargo los comentarios
      const resComentarios = await fetch(
        `https://kong-7df170cea7usbksss.kongcloud.dev/publicaciones/${postId}/comentarios`,
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

      // 4) enriquezco cada comentario con su autor
      const autorCache = new Map();
      const enriquecidos = await Promise.all(
        dataComentarios.map(async (comentario) => {
          let autor = autorCache.get(comentario.autorId);
          if (!autor) {
            const resAutor = await fetch(
              `https://kong-7df170cea7usbksss.kongcloud.dev/usuario/${comentario.autorId}`,
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

      // 5) actualizo el estado
      setComentarios((prev) => ({
        ...prev,
        [postId]: enriquecidos,
      }));
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      Swal.fire("Error", "Hubo un problema al enviar el comentario", "error");
    }
  };

  // Util para “hace X minutos/días…”
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

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active={null} />
      <main className="perfil-main">
        {/* Header */}
        <div className="perfil-ig-header">
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

        {/* Galería */}
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

        {/* Modal de publicación */}
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
                {/* Header del post */}
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

                {/* Descripción */}
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

                {/* Comentarios */}
                <div className="modal-comentarios">
                  {(comentarios[selectedPost.id] || []).length === 0 ? (
                    <p className="comentario-placeholder">
                      Sé el primero en comentar
                    </p>
                  ) : (
                    comentarios[selectedPost.id].map((c) => (
                      <div
                        className="comentario-item"
                        key={c.id_comentario || c.id}
                      >
                        <img
                          src={
                            c.autor?.foto_perfil?.[0]?.url ||
                            "https://via.placeholder.com/40"
                          }
                          alt="avatar"
                        />
                        <div className="comentario-info">
                          <strong>
                            @{c.autor?.nombre} {c.autor?.apellido}{" "}
                            <span>{c.texto}</span>
                          </strong>
                          <span className="comentario-fecha">
                            {tiempoTranscurrido(c.fecha)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Likes y formulario de comentario */}
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
                    <button type="submit" disabled={!nuevoComentario.trim()}>
                      Publicar
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
