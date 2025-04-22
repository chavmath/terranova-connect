import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "../styles/configuracion.css";
import Cookies from "js-cookie";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Iconos de flecha
import Modal from "react-modal";

const ConfiguracionPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [misiones, setMisiones] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    correo: "",
    rol: "",
  });
  const [nuevaActividad, setNuevaActividad] = useState({
    nombre: "",
    descripcion: "",
  });
  const [nuevaMision, setNuevaMision] = useState({
    nombre: "",
    descripcion: "",
  });

  // Para manejar la visibilidad de las secciones
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  const [mostrarActividades, setMostrarActividades] = useState(false);
  const [mostrarMisiones, setMostrarMisiones] = useState(false);
  const [searchUsuarios, setSearchUsuarios] = useState("");
  const [searchActividades, setSearchActividades] = useState("");
  const [searchMisiones, setSearchMisiones] = useState("");
  const [modalTipo, setModalTipo] = useState(null); // 'usuario' | 'actividad' | 'mision'
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    obtenerUsuarios();
    obtenerActividades();
    obtenerMisiones();
  }, []);

  const token = Cookies.get("token");

  const obtenerUsuarios = async () => {
    const res = await fetch("http://localhost:3000/usuarios", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    setUsuarios(data);
  };

  const obtenerActividades = async () => {
    const res = await fetch("http://localhost:3000/actividades", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    setActividades(data);
  };

  const obtenerMisiones = async () => {
    const res = await fetch("http://localhost:3000/misiones", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (Array.isArray(data.misiones)) {
      setMisiones(data.misiones);
    } else {
      Swal.fire("Error", "La respuesta de las misiones no es válida", "error");
    }
  };

  const handleEliminarUsuario = async (id_usuario) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al usuario permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/usuario/${id_usuario}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        Swal.fire("Eliminado", "Usuario eliminado con éxito", "success");
        setUsuarios(
          usuarios.filter((usuario) => usuario.id_usuario !== id_usuario)
        );
      } else {
        const error = await res.json();
        Swal.fire(
          "Error",
          error.message || "No se pudo eliminar el usuario",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
    }
  };

  const handleEliminarActividad = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la actividad permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/actividad/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        Swal.fire("Eliminada", "Actividad eliminada con éxito", "success");
        setActividades(
          actividades.filter((actividad) => actividad.id_actividad !== id)
        );
      } else {
        const error = await res.json();
        Swal.fire(
          "Error",
          error.message || "No se pudo eliminar la actividad",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar la actividad", "error");
    }
  };

  const handleEliminarMision = async (id_mision) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la misión permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/mision/${id_mision}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        Swal.fire("Eliminada", "Misión eliminada con éxito", "success");
        setMisiones(
          misiones.filter((mision) => mision.id_mision !== id_mision)
        );
      } else {
        const error = await res.json();
        Swal.fire(
          "Error",
          error.message || "No se pudo eliminar la misión",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar la misión", "error");
    }
  };

  const handleCrearActividad = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/actividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaActividad),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire(
          "Actividad creada",
          "La actividad fue creada con éxito",
          "success"
        );
        setActividades([...actividades, data]);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo crear la actividad", error);
    }
  };

  const handleCrearMision = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/misiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaMision),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Misión creada", "La misión fue creada con éxito", "success");
        setMisiones([...misiones, data]);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo crear la misión", error);
    }
  };

  const handleSearchUsuarios = (e) => {
    setSearchUsuarios(e.target.value);
  };

  const handleSearchActividades = (e) => {
    setSearchActividades(e.target.value);
  };

  const handleSearchMisiones = (e) => {
    setSearchMisiones(e.target.value);
  };

  // Filtrar usuarios por nombre
  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchUsuarios.toLowerCase())
  );

  // Filtrar actividades por nombre
  const filteredActividades = actividades.filter((actividad) =>
    actividad.titulo.toLowerCase().includes(searchActividades.toLowerCase())
  );

  // Filtrar misiones por nombre
  const filteredMisiones = misiones.filter((mision) =>
    mision.titulo.toLowerCase().includes(searchMisiones.toLowerCase())
  );

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const abrirModalEdicion = (tipo, data) => {
    setModalTipo(tipo);
    setModalData(data);
  };

  const cerrarModal = () => {
    setModalTipo(null);
    setModalData(null);
  };

  const handleEditarUsuario = async () => {
    const { id_usuario, nuevaFoto, ...datos } = modalData;

    const url = `http://localhost:3000/usuario/${id_usuario}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let options;

    if (nuevaFoto) {
      const form = new FormData();
      form.append("foto_perfil", nuevaFoto);

      // Agregamos los demás campos al FormData
      Object.entries(datos).forEach(([key, value]) => form.append(key, value));

      options = {
        method: "PUT",
        headers, // form.getHeaders() se agrega implícitamente en navegador
        body: form,
        credentials: "include",
      };
    } else {
      options = {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
        credentials: "include",
      };
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (res.ok) {
      Swal.fire("Actualizado", "Usuario actualizado correctamente", "success");
      cerrarModal();
      obtenerUsuarios();
    } else {
      Swal.fire("Error", data.message || "No se pudo actualizar", "error");
    }
  };

  const handleEditarActividad = async () => {
    const { id_actividad, fechaInicio, fechaFin, ...datos } = modalData;

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Swal.fire(
        "Error",
        "La fecha de inicio no puede ser posterior a la fecha de fin",
        "error"
      );
      return;
    }

    const res = await fetch(`http://localhost:3000/actividad/${id_actividad}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...datos, fechaInicio, fechaFin }),
      credentials: "include",
    });

    if (res.ok) {
      Swal.fire(
        "Actualizada",
        "Actividad actualizada correctamente",
        "success"
      );
      cerrarModal();
      obtenerActividades();
    }
  };

  const handleEditarMision = async () => {
    const { id_mision, fechaInicio, fechaFin, ...datos } = modalData;

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Swal.fire(
        "Error",
        "La fecha de inicio no puede ser posterior a la fecha de fin",
        "error"
      );
      return;
    }

    const res = await fetch(`http://localhost:3000/mision/${id_mision}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...datos, fechaInicio, fechaFin }),
      credentials: "include",
    });

    if (res.ok) {
      Swal.fire("Actualizada", "Misión actualizada correctamente", "success");
      cerrarModal();
      obtenerMisiones();
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Configuración" />

      <div className="config-main">
        <div className="config-title-container">
          <h2 className="config-title">Configuración</h2>
          <p className="config-title-subtitle">
            Administra usuarios, actividades y misiones
          </p>
        </div>
        <div className="config-description">
          {/* Sección Usuarios */}
          <div className="config-section">
            <div
              className="config-toggle"
              onClick={() => setMostrarUsuarios(!mostrarUsuarios)}
            >
              <span>Usuarios</span>
              {mostrarUsuarios ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {mostrarUsuarios && (
              <div>
                <div className="config-actions">
                  <input
                    type="text"
                    value={searchUsuarios}
                    onChange={handleSearchUsuarios}
                    placeholder="Buscar por nombre"
                    className="search-input"
                  />
                </div>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((usuario, index) => (
                      <tr key={usuario.id_usuario}>
                        <td>{index + 1}</td>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.apellido}</td>
                        <td>{usuario.correo}</td>
                        <td>{usuario.rol}</td>
                        <td>
                          <button
                            className="action-button edit"
                            onClick={() =>
                              abrirModalEdicion("usuario", usuario)
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() =>
                              handleEliminarUsuario(usuario.id_usuario)
                            }
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sección Actividades */}
          <div className="config-section">
            <div
              className="config-toggle"
              onClick={() => setMostrarActividades(!mostrarActividades)}
            >
              <span>Actividades</span>
              {mostrarActividades ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {mostrarActividades && (
              <div>
                <div className="config-actions">
                  <input
                    type="text"
                    value={searchActividades}
                    onChange={handleSearchActividades}
                    placeholder="Buscar por nombre"
                    className="search-input"
                  />
                  <button className="add-button" onClick={handleCrearActividad}>
                    Crear Actividad
                  </button>
                </div>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActividades.map((actividad, index) => (
                      <tr key={actividad.id_actividad}>
                        <td>{index + 1}</td>
                        <td>{actividad.titulo}</td>
                        <td>{actividad.descripcion}</td>
                        <td>{formatFecha(actividad.fechaInicio)}</td>
                        <td>{formatFecha(actividad.fechaFin)}</td>
                        <td>
                          <button
                            className="action-button edit"
                            onClick={() =>
                              abrirModalEdicion("actividad", actividad)
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() =>
                              handleEliminarActividad(actividad.id_actividad)
                            }
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sección Misiones */}
          <div className="config-section">
            <div
              className="config-toggle"
              onClick={() => setMostrarMisiones(!mostrarMisiones)}
            >
              <span>Misiones</span>
              {mostrarMisiones ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {mostrarMisiones && (
              <div>
                <div className="config-actions">
                  <input
                    type="text"
                    value={searchMisiones}
                    onChange={handleSearchMisiones}
                    placeholder="Buscar por nombre"
                    className="search-input"
                  />
                  <button className="add-button" onClick={handleCrearMision}>
                    Crear Misión
                  </button>
                </div>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Puntos</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMisiones.map((mision, index) => (
                      <tr key={mision.id_mision}>
                        <td>{index + 1}</td>
                        <td>{mision.titulo}</td>
                        <td>{mision.descripcion}</td>
                        <td>{mision.puntos}</td>
                        <td>{formatFecha(mision.fechaInicio)}</td>
                        <td>{formatFecha(mision.fechaFin)}</td>
                        <td>
                          <button
                            className="action-button edit"
                            onClick={() => abrirModalEdicion("mision", mision)}
                          >
                            Editar
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() =>
                              handleEliminarMision(mision.id_mision)
                            }
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {modalTipo && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar {modalTipo}</h3>
            {modalTipo === "usuario" && (
              <>
                {/* Vista previa de la foto actual */}
                {modalData.foto_perfil?.[0]?.url && (
                  <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    <img
                      src={modalData.foto_perfil[0].url}
                      alt="Foto de perfil"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #031f7b",
                      }}
                    />
                  </div>
                )}

                {/* Input para seleccionar nueva foto */}
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "6px",
                  }}
                >
                  Cambiar foto de perfil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setModalData({ ...modalData, nuevaFoto: e.target.files[0] })
                  }
                  style={{ marginBottom: "1rem" }}
                />
                <label>Nombre</label>
                <input
                  value={modalData.nombre}
                  onChange={(e) =>
                    setModalData({ ...modalData, nombre: e.target.value })
                  }
                  placeholder="Nombre"
                />

                <label>Apellido</label>
                <input
                  value={modalData.apellido}
                  onChange={(e) =>
                    setModalData({ ...modalData, apellido: e.target.value })
                  }
                  placeholder="Apellido"
                />
                <label>Correo</label>
                <input
                  value={modalData.correo}
                  onChange={(e) =>
                    setModalData({ ...modalData, correo: e.target.value })
                  }
                  placeholder="Correo"
                />
                <label>Rol</label>
                <select
                  value={modalData.rol}
                  onChange={(e) =>
                    setModalData({ ...modalData, rol: e.target.value })
                  }
                  className="modal-select"
                >
                  <option value="">Seleccionar rol</option>
                  <option value="admin">Administrador</option>
                  <option value="profesor">Profesor</option>
                  <option value="estudiante">Estudiante</option>
                </select>
                <button onClick={handleEditarUsuario}>Guardar</button>
              </>
            )}
            {modalTipo === "actividad" && (
              <>
                <label>Título</label>
                <input
                  value={modalData.titulo}
                  onChange={(e) =>
                    setModalData({ ...modalData, titulo: e.target.value })
                  }
                  placeholder="Título"
                />

                <label>Descripción</label>
                <textarea
                  value={modalData.descripcion}
                  onChange={(e) =>
                    setModalData({ ...modalData, descripcion: e.target.value })
                  }
                  placeholder="Descripción"
                />
                <label>Fecha de Inicio:</label>
                <input
                  type="date"
                  value={modalData.fechaInicio?.split("T")[0]}
                  onChange={(e) =>
                    setModalData({ ...modalData, fechaInicio: e.target.value })
                  }
                />
                <label>Fecha de Fin:</label>
                <input
                  type="date"
                  value={modalData.fechaFin?.split("T")[0]}
                  onChange={(e) =>
                    setModalData({ ...modalData, fechaFin: e.target.value })
                  }
                />
                <button onClick={handleEditarActividad}>Guardar</button>
              </>
            )}

            {modalTipo === "mision" && (
              <>
                <label>Título</label>
                <input
                  value={modalData.titulo}
                  onChange={(e) =>
                    setModalData({ ...modalData, titulo: e.target.value })
                  }
                  placeholder="Título"
                />

                <label>Descripción</label>
                <textarea
                  value={modalData.descripcion}
                  onChange={(e) =>
                    setModalData({ ...modalData, descripcion: e.target.value })
                  }
                  placeholder="Descripción"
                />

                <label>Puntos</label>
                <input
                  type="number"
                  value={modalData.puntos}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      puntos: Number(e.target.value),
                    })
                  }
                  placeholder="Puntos"
                />
                <label>Fecha de Inicio:</label>
                <input
                  type="date"
                  value={modalData.fechaInicio?.split("T")[0]}
                  onChange={(e) =>
                    setModalData({ ...modalData, fechaInicio: e.target.value })
                  }
                />
                <label>Fecha de Fin:</label>
                <input
                  type="date"
                  value={modalData.fechaFin?.split("T")[0]}
                  onChange={(e) =>
                    setModalData({ ...modalData, fechaFin: e.target.value })
                  }
                />
                <button onClick={handleEditarMision}>Guardar</button>
              </>
            )}

            <button onClick={cerrarModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ConfiguracionPage;
