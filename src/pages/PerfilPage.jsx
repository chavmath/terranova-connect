import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/perfil.css";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { FiEdit } from "react-icons/fi";
import { ClipLoader } from "react-spinners";

const getUserRole = () => {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.rol || null;
  } catch {
    return null;
  }
};

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
  const [insignias, setInsignias] = useState([]);
  const [insigniasDestacadas, setInsigniasDestacadas] = useState([]);
  const [showSelectInsignias, setShowSelectInsignias] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const userRole = getUserRole();
  // eslint-disable-next-line no-unused-vars
  const [comentarioCargando, setComentarioCargando] = useState(false);
  const [menuComentarioAbiertoId, setMenuComentarioAbiertoId] = useState(null);
  const [comentarioEliminandoId, setComentarioEliminandoId] = useState(null);
  const currentUserId = getCurrentUserId();
  const menuComentarioRef = useRef(null);
  const [comentarioEditandoId, setComentarioEditandoId] = useState(null);
  const [comentarioEditandoLoading, setComentarioEditandoLoading] =
    useState(false);
  const [errorCorreo, setErrorCorreo] = useState("");

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuComentarioAbiertoId]);

  const dominiosComunes = [
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "yahoo.com",
    "live.com",
    "icloud.com",
  ];

  function distanciaLevenshtein(a, b) {
    const matriz = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matriz[0][i] = i;
    for (let j = 0; j <= b.length; j++) matriz[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicador = a[i - 1] === b[j - 1] ? 0 : 1;
        matriz[j][i] = Math.min(
          matriz[j][i - 1] + 1,
          matriz[j - 1][i] + 1,
          matriz[j - 1][i - 1] + indicador
        );
      }
    }
    return matriz[b.length][a.length];
  }

  const validarCorreo = (correo) => {
    if (!correo) return "Debes ingresar un correo electrónico";
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) return "Formato de correo inválido";
    const dominio = correo.split("@")[1]?.toLowerCase() || "";
    const typoDetectado = dominiosComunes.find((dominioComun) => {
      return (
        distanciaLevenshtein(dominio, dominioComun) > 0 &&
        distanciaLevenshtein(dominio, dominioComun) <= 2
      );
    });
    if (typoDetectado) {
      return `¿Querías decir "${typoDetectado}"? Revisa el dominio del correo.`;
    }
    return "";
  };

  const cargarDatos = async () => {
    try {
      const token = Cookies.get("token");
      const [pubsRes, userRes] = await Promise.all([
        fetch(
          "https://kong-0c858408d8us2s9oc.kongcloud.dev/mis-publicaciones",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        ),
        fetch("https://kong-0c858408d8us2s9oc.kongcloud.dev/profile", {
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
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/seguidores-contar`,
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
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${userId}`,
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
          cargarDatos();
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

  useEffect(() => {
    const cargarComentarios = async () => {
      if (!selectedPost) return;
      const token = Cookies.get("token");

      try {
        const res = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}/comentarios`,
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
          setComentarios([]);
          return;
        }

        const autorCache = new Map();

        const enriquecidos = await Promise.all(
          data.map(async (comentario) => {
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
  const eliminarComentario = async (idPublicacion, idComentario) => {
    setComentarioEliminandoId(idComentario);
    const token = Cookies.get("token");
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/comentarios/${idComentario}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (res.ok) {
        setComentarios((prev) => ({
          ...prev,
          [idPublicacion]: prev[idPublicacion].filter(
            (c) => c.id_comentario !== idComentario
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
      setComentarioEditandoId(null);
      setNuevoComentario((prev) => ({ ...prev, [id_publicacion]: "" }));
    } catch {
      Swal.fire("Error", "No se pudo editar el comentario", "error");
    } finally {
      setComentarioEditandoLoading(false);
    }
  };

  const handleLike = () => {
    if (!selectedPost) return;

    const yaLeDiLike = selectedPost.meGusta;
    const nuevoEstado = {
      ...selectedPost,
      meGusta: !yaLeDiLike,
      cantidadLikes: selectedPost.cantidadLikes + (yaLeDiLike ? -1 : 1),
    };

    setSelectedPost(nuevoEstado);

    const publicacionesActualizadas = publicaciones.map((pub) =>
      pub.id_publicacion === selectedPost.id_publicacion ? nuevoEstado : pub
    );
    setPublicaciones(publicacionesActualizadas);
    const token = Cookies.get("token");
    fetch(
      `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}/like`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
    const texto = (nuevoComentario[selectedPost.id_publicacion] ?? "").trim();
    if (!texto || !selectedPost) return;
    const token = Cookies.get("token");
    setComentarioCargando(true);
    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}/comentarios`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
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

        const resComentarios = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}/comentarios`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const dataComentarios = await resComentarios.json();
        if (resComentarios.ok) {
          const autorCache = new Map();
          const enriquecidos = await Promise.all(
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
    } finally {
      setComentarioCargando(false);
    }
  };

  const handleEliminarPublicacion = async () => {
    Swal.fire({
      title: "¿Eliminar publicación?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      customClass: {
        popup: "swal-z-index-custom",
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const token = Cookies.get("token");
        const res = await fetch(
          `https://kong-0c858408d8us2s9oc.kongcloud.dev/publicaciones/${selectedPost.id_publicacion}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (res.ok) {
          Swal.fire({
            title: "Eliminado",
            text: "La publicación fue eliminada.",
            icon: "success",
            customClass: {
              popup: "swal-z-index-custom",
            },
          });
          setSelectedPost(null);
          setPublicaciones((prev) =>
            prev.filter((p) => p.id_publicacion !== selectedPost.id_publicacion)
          );
        } else {
          const data = await res.json();
          Swal.fire({
            title: "Error",
            text: data.message || "No se pudo eliminar.",
            icon: "error",
            customClass: {
              popup: "swal-z-index-custom",
            },
          });
        }
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Error de red al eliminar publicación",
          icon: "error",
          customClass: {
            popup: "swal-z-index-custom",
          },
        });
      }
    });

    setShowOptions(false);
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
  const cargarInsignias = async () => {
    try {
      const token = Cookies.get("token");
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/reclamadas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setInsignias(data);
      } else {
        setInsignias([]);
      }
    } catch (err) {
      console.error("Error al cargar insignias:", err);
      setInsignias([]);
    }
  };

  useEffect(() => {
    cargarInsignias();
  }, []);

  useEffect(() => {
    const guardadas = localStorage.getItem("insigniasDestacadas");
    if (guardadas) {
      try {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed) && parsed.length) {
          setInsigniasDestacadas(parsed);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        /* empty */
      }
    } else if (insignias.length) {
      setInsigniasDestacadas(insignias.slice(0, 3).map((i) => i._id));
    }
  }, [insignias]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Mi perfil" />

      <main className="perfil-main">
        <div className="perfil-ig-header">
          <div className="perfil-badges-section">
            {userRole !== "profesor" && (
              <div className="perfil-badges-header">
                <span className="perfil-badges-title">
                  Mis insignias destacadas
                </span>
                <button
                  className="perfil-badges-edit-btn perfil-badges-edit-icon"
                  onClick={() => setShowSelectInsignias(true)}
                  title="Editar insignias destacadas"
                >
                  <FiEdit size={20} color="#213a91" />
                </button>
              </div>
            )}
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

          <div className="perfil-ig-avatar-box">
            <img src={user?.foto_perfil} alt="" className="perfil-ig-avatar" />
          </div>

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
        {showSelectInsignias && (
          <div
            className="perfil-insignia-modal-overlay"
            onClick={() => setShowSelectInsignias(false)}
          >
            <div
              className="perfil-modal-card"
              style={{ maxWidth: 420 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="perfil-badges-modal-title">
                Elige tus 3 insignias favoritas
              </h3>
              <div className="perfil-badges-list">
                {insignias.map((ins) => {
                  const selected = insigniasDestacadas.includes(ins._id);
                  return (
                    <div
                      key={ins._id}
                      className={`perfil-badge-select ${
                        selected ? "selected" : ""
                      }`}
                      title={ins.descripcion}
                      onClick={() => {
                        if (selected) {
                          setInsigniasDestacadas(
                            insigniasDestacadas.filter((id) => id !== ins._id)
                          );
                        } else if (insigniasDestacadas.length < 3) {
                          setInsigniasDestacadas([
                            ...insigniasDestacadas,
                            ins._id,
                          ]);
                        }
                      }}
                    >
                      <img
                        src={ins.imagenes?.[0]?.url}
                        alt={ins.nombre}
                        className="perfil-badge-img"
                      />
                      <span className="perfil-badge-nombre">{ins.nombre}</span>
                      {selected && (
                        <span className="perfil-badge-check">✔</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                className="perfil-edit-btn-save"
                style={{ marginTop: 18 }}
                disabled={
                  insigniasDestacadas.length === 0 ||
                  insigniasDestacadas.length > 3
                }
                onClick={() => {
                  localStorage.setItem(
                    "insigniasDestacadas",
                    JSON.stringify(insigniasDestacadas)
                  );
                  setShowSelectInsignias(false);
                }}
              >
                Guardar selección
              </button>
              <div
                style={{
                  fontSize: 12,
                  color: "#e74c3c",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {insigniasDestacadas.length > 3 &&
                  "Solo puedes seleccionar hasta 3 insignias."}
              </div>
            </div>
          </div>
        )}

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

      {selectedPost && (
        <div
          className="modal-overlay-perfil"
          onClick={() => setSelectedPost(null)}
        >
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
              <div className="ig-header">
                <img
                  src={user?.foto_perfil}
                  alt="avatar"
                  className="ig-avatar"
                />
                <span className="ig-username">
                  @{user?.nombre} {user?.apellido}
                </span>

                <div className="ig-header-actions">
                  <button
                    className="ig-options-button"
                    onClick={() => setShowOptions((prev) => !prev)}
                    title="Opciones"
                  >
                    ⋯
                  </button>
                  {showOptions && (
                    <div className="ig-options-dropdown">
                      <button
                        className="ig-options-item"
                        onClick={handleEliminarPublicacion}
                      >
                        🗑 Eliminar publicación
                      </button>
                    </div>
                  )}

                  <button
                    className="ig-close-button"
                    onClick={() => {
                      setSelectedPost(null);
                      setNuevoComentario("");
                      setShowOptions(false);
                    }}
                  >
                    ✖
                  </button>
                </div>
              </div>

              <hr />

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
                    Publicado ·{" "}
                    {new Date(
                      selectedPost.fechaPublicacion
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="modal-comentarios">
                {comentarios[selectedPost.id_publicacion]?.length === 0 ? (
                  <p className="comentario-placeholder">
                    Sé el primero en comentar
                  </p>
                ) : (
                  comentarios[selectedPost.id_publicacion]?.map((c) => (
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
                        <div style={{ display: "flex", alignItems: "center" }}>
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
                          ref={menuComentarioRef}
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
                                  // Modo edición: lleva el texto al input principal
                                  setComentarioEditandoId(c.id_comentario);
                                  setNuevoComentario((prev) => ({
                                    ...prev,
                                    [selectedPost.id_publicacion]: c.texto,
                                  }));
                                  setMenuComentarioAbiertoId(null);
                                }}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  eliminarComentario(
                                    selectedPost.id_publicacion,
                                    c.id_comentario
                                  );
                                  setMenuComentarioAbiertoId(null);
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

                <form
                  className="ig-comment-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (comentarioEditandoId) {
                      editarComentario(
                        selectedPost.id_publicacion,
                        comentarioEditandoId,
                        nuevoComentario[selectedPost.id_publicacion]
                      );
                    } else {
                      enviarComentario(e, selectedPost.id_publicacion);
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder="Agrega un comentario..."
                    value={nuevoComentario[selectedPost.id_publicacion] || ""}
                    onChange={(e) =>
                      setNuevoComentario((prev) => ({
                        ...prev,
                        [selectedPost.id_publicacion]: e.target.value,
                      }))
                    }
                    disabled={comentarioEditandoLoading}
                  />
                  {comentarioEditandoId && (
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
                        setComentarioEditandoId(null);
                        setNuevoComentario((prev) => ({
                          ...prev,
                          [selectedPost.id_publicacion]: "",
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
                      comentarioCargando ||
                      !nuevoComentario[selectedPost.id_publicacion]?.trim()
                    }
                    style={{ minWidth: 90 }}
                  >
                    {comentarioEditandoId ? (
                      comentarioEditandoLoading ? (
                        <>
                          <ClipLoader size={12} color="#0095f6" />
                          <span style={{ marginLeft: 6 }}>Guardando...</span>
                        </>
                      ) : (
                        "Guardar"
                      )
                    ) : comentarioCargando ? ( // <--- Aquí el cambio
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <ClipLoader size={12} color="#0095f6" />
                        Publicando...
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
                onChange={(e) => {
                  setModalData({ ...modalData, correo: e.target.value });
                  setErrorCorreo(validarCorreo(e.target.value));
                }}
                placeholder="Correo"
                required
                type="email"
              />
              {errorCorreo && (
                <p
                  className="error-text"
                  style={{ color: "#e74c3c", margin: "3px 0" }}
                >
                  {errorCorreo}
                </p>
              )}

              <button
                className="perfil-edit-btn-save"
                type="submit"
                disabled={loading || !!errorCorreo || !modalData.correo}
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
