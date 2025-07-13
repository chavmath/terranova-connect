// src/pages/ModeracionPage.jsx
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "../styles/feed.css";
import { PacmanLoader } from "react-spinners";

const ModeracionPage = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cantidadMostrar, setCantidadMostrar] = useState(5);
  const [eliminandoId, setEliminandoId] = useState(null);

  const token = Cookies.get("token");

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const publicacionesRaw = await res.json();
      if (!res.ok) throw new Error();

      // Obtener datos del autor
      const autorCache = new Map();
      const publicacionesConAutor = await Promise.all(
        publicacionesRaw.map(async (pub) => {
          let autor = autorCache.get(pub.autorId);
          if (!autor) {
            try {
              const resAutor = await fetch(
                `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${pub.autorId}`,
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
    } catch (err) {
      console.error("Error al cargar publicaciones:", err);
      Swal.fire("Error", "No se pudieron cargar las publicaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const eliminarPublicacion = async (id_publicacion) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar publicación?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      setEliminandoId(id_publicacion);

      try {
        const res = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${id_publicacion}`,
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

        setPublicaciones((prev) =>
          prev.filter((pub) => pub.id_publicacion !== id_publicacion)
        );

        Swal.fire("Eliminada", "La publicación ha sido eliminada", "success");
      } catch (err) {
        console.error("Error al eliminar publicación:", err);
        Swal.fire("Error", "No se pudo eliminar la publicación", "error");
      } finally {
        setEliminandoId(null);
      }
    }
  };

  const mostrarMas = () => {
    setCantidadMostrar((prev) => prev + 5);
  };

  const avatarPorDefecto =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Moderación" />
      <main className="feed-main">
        <div className="feed-title-container">
          <h2 className="feed-title">Moderar Publicaciones</h2>
          <p className="feed-subtitle">
            Gestiona el contenido subido por los usuarios
          </p>
        </div>

        {loading ? (
          <div
            className="spinner-container"
            style={{ textAlign: "center", margin: "1rem" }}
          >
            <PacmanLoader size={30} color={"#e67e22"} loading={loading} />
          </div>
        ) : publicaciones.length === 0 ? (
          <p>No hay publicaciones</p>
        ) : (
          publicaciones.slice(0, cantidadMostrar).map((pub) => (
            <div className="feed-card" key={pub.id_publicacion}>
              <div className="feed-header">
                <img
                  src={pub.autor?.foto_perfil?.[0]?.url || avatarPorDefecto}
                  alt="avatar"
                  className="feed-avatar"
                />
                <div>
                  <p className="feed-author">
                    @{pub.autor?.nombre || "Usuario"}{" "}
                    {pub.autor?.apellido || ""}
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
                  alt="media"
                  className="feed-image"
                />
              )}

              <div className="feed-actions">
                <div className="feed-description">
                  <strong>
                    @{pub.autor?.nombre || "Usuario"}{" "}
                    {pub.autor?.apellido || ""}
                  </strong>{" "}
                  {pub.descripcion}
                </div>
              </div>

              <div className="eliminar-section">
                {eliminandoId === pub.id_publicacion ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <PacmanLoader size={14} color={"#e74c3c"} loading />
                  </div>
                ) : (
                  <button
                    onClick={() => eliminarPublicacion(pub.id_publicacion)}
                    style={{
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {!loading &&
          publicaciones.length > 0 &&
          cantidadMostrar < publicaciones.length && (
            <div style={{ textAlign: "center", margin: "1rem" }}>
              <button className="mostrar-mas-btn" onClick={mostrarMas}>
                Mostrar más
              </button>
            </div>
          )}

        {!loading &&
          publicaciones.length > 0 &&
          cantidadMostrar >= publicaciones.length && (
            <p style={{ textAlign: "center", margin: "1rem" }}>
              No hay más publicaciones
            </p>
          )}
      </main>
    </div>
  );
};

export default ModeracionPage;
