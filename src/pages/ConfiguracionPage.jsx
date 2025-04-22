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
  const [recompensas, setRecompensas] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateRecompensaModal, setShowCreateRecompensaModal] =
    useState(false);
  const [nuevaActividad, setNuevaActividad] = useState({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [nuevaMision, setNuevaMision] = useState({
    titulo: "",
    descripcion: "",
    puntos: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [nuevaRecompensa, setNuevaRecompensa] = useState({
    nombre: "",
    descripcion: "",
    puntosRequeridos: "",
    cantidadDisponible: "",
  });

  const [showCreateMisionModal, setShowCreateMisionModal] = useState(false);
  // Para manejar la visibilidad de las secciones
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  const [mostrarActividades, setMostrarActividades] = useState(false);
  const [mostrarMisiones, setMostrarMisiones] = useState(false);
  const [mostrarRecompensas, setMostrarRecompensas] = useState(false);
  const [searchUsuarios, setSearchUsuarios] = useState("");
  const [searchActividades, setSearchActividades] = useState("");
  const [searchMisiones, setSearchMisiones] = useState("");
  const [searchRecompensas, setSearchRecompensas] = useState("");
  const [modalTipo, setModalTipo] = useState(null); // 'usuario' | 'actividad' | 'mision'
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(2); // Número de elementos por página
  const [totalItems, setTotalItems] = useState(0); // Total de elementos
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [filteredActividades, setFilteredActividades] = useState([]);
  const [filteredMisiones, setFilteredMisiones] = useState([]);
  const [filteredRecompensas, setFilteredRecompensas] = useState([]);
  const [currentPageActividad, setCurrentPageActividad] = useState(1);
  const [currentPageMision, setCurrentPageMision] = useState(1);
  const [currentPageRecompensa, setCurrentPageRecompensa] = useState(1);
  const [totalItemsActividad, setTotalItemsActividad] = useState(0);
  const [totalItemsMision, setTotalItemsMision] = useState(0);
  const [totalItemsRecompensa, setTotalItemsRecompensa] = useState(0);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsuarios.slice(
    indexOfFirstItem,
    indexOfLastItem
  ); // Paginamos sobre los usuarios filtrados

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastItemActividad = currentPageActividad * itemsPerPage;
  const indexOfFirstItemActividad = indexOfLastItemActividad - itemsPerPage;
  const currentItemsActividad = filteredActividades.slice(
    indexOfFirstItemActividad,
    indexOfLastItemActividad
  ); // Filtramos y paginamos las actividades
  const paginateActividad = (pageNumber) => setCurrentPageActividad(pageNumber);

  const indexOfLastItemMision = currentPageMision * itemsPerPage;
  const indexOfFirstItemMision = indexOfLastItemMision - itemsPerPage;
  const currentItemsMision = filteredMisiones.slice(
    indexOfFirstItemMision,
    indexOfLastItemMision
  ); // Filtramos y paginamos las misiones
  const paginateMision = (pageNumber) => setCurrentPageMision(pageNumber);

  useEffect(() => {
    obtenerUsuarios();
    obtenerActividades();
    obtenerMisiones();
    obtenerRecompensas();
  }, []);

  useEffect(() => {
    // Filtrar los usuarios por nombre
    const filtered = usuarios.filter((usuario) =>
      usuario.nombre.toLowerCase().includes(searchUsuarios.toLowerCase())
    );
    setFilteredUsuarios(filtered); // Establecemos los usuarios filtrados
    setTotalItems(filtered.length); // Actualizamos el total de elementos filtrados
  }, [searchUsuarios, usuarios]); // Re-filtrar cuando cambian los usuarios o el filtro

  useEffect(() => {
    const filtered = actividades.filter((actividad) =>
      actividad.titulo.toLowerCase().includes(searchActividades.toLowerCase())
    );
    setFilteredActividades(filtered); // Establecemos las actividades filtradas
    setTotalItemsActividad(filtered.length); // Total de actividades filtradas
  }, [searchActividades, actividades]); // Re-filtrar cuando cambian las actividades o el filtro

  useEffect(() => {
    const filtered = misiones.filter((mision) =>
      mision.titulo.toLowerCase().includes(searchMisiones.toLowerCase())
    );
    setFilteredMisiones(filtered); // Establecemos las misiones filtradas
    setTotalItemsMision(filtered.length); // Total de misiones filtradas
  }, [searchMisiones, misiones]); // Re-filtrar cuando cambian las misiones o el filtro

  useEffect(() => {
    const filtradas = recompensas.filter((r) =>
      r.nombre.toLowerCase().includes(searchRecompensas.toLowerCase())
    );
    setFilteredRecompensas(filtradas);
    setTotalItemsRecompensa(filtradas.length);
  }, [searchRecompensas, recompensas]);

  const indexOfLast = currentPageRecompensa * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRecompensas = filteredRecompensas.slice(
    indexOfFirst,
    indexOfLast
  );

  const paginateRecompensas = (pageNumber) =>
    setCurrentPageRecompensa(pageNumber);

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

  const obtenerRecompensas = async () => {
    try {
      const res = await fetch("http://localhost:3000/recompensas", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();

      if (Array.isArray(data.recompensas)) {
        setRecompensas(data.recompensas);
      } else {
        console.error("Respuesta inesperada del backend:", data);
        setRecompensas([]);
      }
    } catch (err) {
      console.error("Error al obtener recompensas:", err);
      setRecompensas([]);
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

  const handleEliminarRecompensa = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar recompensa?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/recompensa/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        Swal.fire("Eliminada", "Recompensa eliminada con éxito", "success");
        obtenerRecompensas();
      } else {
        const data = await res.json();
        Swal.fire("Error", data.message || "No se pudo eliminar", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error del servidor", err);
    }
  };

  const handleCrearActividad = async () => {
    const { titulo, descripcion, fechaInicio, fechaFin } = nuevaActividad;

    // Validación simple antes de enviar
    if (!titulo || !descripcion || !fechaInicio || !fechaFin) {
      Swal.fire("Error", "Todos los campos deben ser completos.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/actividad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, descripcion, fechaInicio, fechaFin }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Actividad creada", data.message, "success");
        setShowCreateModal(false); // Cerrar el modal
        setNuevaActividad({
          titulo: "",
          descripcion: "",
          fechaInicio: "",
          fechaFin: "",
        }); // Limpiar el formulario
        obtenerActividades(); // Actualizar la lista de actividades
      } else {
        Swal.fire(
          "Error",
          data.message || "No se pudo crear la actividad",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error al crear la actividad", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearMision = async () => {
    const { titulo, descripcion, puntos, fechaInicio, fechaFin } = nuevaMision;

    // Validación simple antes de enviar
    if (!titulo || !descripcion || !puntos || !fechaInicio || !fechaFin) {
      Swal.fire("Error", "Todos los campos deben ser completos.", "error");
      return;
    }

    setLoading(true); // Mostrar el spinner

    try {
      const res = await fetch("http://localhost:3000/mision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          puntos,
          fechaInicio,
          fechaFin,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Misión creada", data.message, "success");
        setShowCreateMisionModal(false); // Cerrar el modal
        setNuevaMision({
          titulo: "",
          descripcion: "",
          puntos: "",
          fechaInicio: "",
          fechaFin: "",
        }); // Limpiar el formulario
        obtenerMisiones(); // Actualizar la lista de misiones
      } else {
        Swal.fire(
          "Error",
          data.message || "No se pudo crear la misión",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error al crear la misión", "error");
    } finally {
      setLoading(false); // Desactivar el spinner
    }
  };

  const handleCrearRecompensa = async () => {
    const { nombre, descripcion, puntosRequeridos, cantidadDisponible } =
      nuevaRecompensa;

    if (!nombre || !descripcion || !puntosRequeridos) {
      Swal.fire(
        "Error",
        "Todos los campos requeridos deben estar completos.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/recompensa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          puntosRequeridos,
          cantidadDisponible,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", data.message, "success");
        setShowCreateRecompensaModal(false);
        setNuevaRecompensa({
          nombre: "",
          descripcion: "",
          puntosRequeridos: "",
          cantidadDisponible: "",
        });
        obtenerRecompensas();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo crear la recompensa", "error");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicionRecompensa = (recompensa) => {
    setModalTipo("recompensa");
    setModalData(recompensa);
  };
  /* 
  const handleSearchUsuarios = (e) => {
    setSearchUsuarios(e.target.value);
  }; */

  const handleSearchActividades = (e) => {
    setSearchActividades(e.target.value);
  };

  const handleSearchMisiones = (e) => {
    setSearchMisiones(e.target.value);
  };

  // Filtrar usuarios por nombre
  /* const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchUsuarios.toLowerCase())
  );
 */
  // Filtrar actividades por nombre
  /* const filteredActividades = actividades.filter((actividad) =>
    actividad.titulo.toLowerCase().includes(searchActividades.toLowerCase())
  );

  // Filtrar misiones por nombre
  const filteredMisiones = misiones.filter((mision) =>
    mision.titulo.toLowerCase().includes(searchMisiones.toLowerCase())
  ); */

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
    // Activar el estado de carga (spinner)
    setLoading(true);

    // Validación simple antes de enviar
    if (!datos.nombre || !datos.apellido || !datos.correo || !datos.rol) {
      Swal.fire("Error", "Todos los campos deben estar completos", "error");
      return;
    }

    const url = `http://localhost:3000/usuario/${id_usuario}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let options;

    // Creamos FormData solo si hay foto nueva
    const form = new FormData();

    // Si hay nueva foto
    if (nuevaFoto) {
      form.append("foto_perfil", nuevaFoto); // Añadir nueva foto
    }

    // Agregar el resto de los campos, pero no incluimos foto_perfil si no se edita
    Object.entries(datos).forEach(([key, value]) => {
      if (key !== "foto_perfil") {
        form.append(key, value); // Si no hay foto, no la agregamos al FormData
      }
    });

    options = {
      method: "PUT",
      headers, // form.getHeaders() se agrega implícitamente en el navegador
      body: form,
      credentials: "include",
    };

    const res = await fetch(url, options);
    const data = await res.json();

    if (res.ok) {
      Swal.fire("Actualizado", "Usuario actualizado correctamente", "success");
      cerrarModal();
      obtenerUsuarios();
    } else {
      Swal.fire("Error", data.message || "No se pudo actualizar", "error");
    }
    // Desactivar el estado de carga después de la respuesta
    setLoading(false);
  };

  const handleEditarActividad = async () => {
    const { id_actividad, fechaInicio, fechaFin, ...datos } = modalData;
    setLoading(true);

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
    setLoading(false);
  };

  const handleEditarMision = async () => {
    const { id_mision, fechaInicio, fechaFin, ...datos } = modalData;
    setLoading(true);

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
    setLoading(false);
  };

  const handleEditarRecompensa = async () => {
    const {
      id_recompensa,
      nombre,
      descripcion,
      puntosRequeridos,
      cantidadDisponible,
    } = modalData;

    if (!nombre || !descripcion || !puntosRequeridos) {
      Swal.fire(
        "Error",
        "Todos los campos requeridos deben estar completos.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/recompensa/${id_recompensa}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            descripcion,
            puntosRequeridos,
            cantidadDisponible,
            activa: true,
          }),
          credentials: "include",
        }
      );

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", data.message, "success");
        obtenerRecompensas();
        cerrarModal();
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo editar la recompensa", "error");
    } finally {
      setLoading(false);
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
                    onChange={(e) => setSearchUsuarios(e.target.value)}
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
                    {currentItems.map((usuario, index) => (
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
                <div className="pagination">
                  {/* Botón de "Anterior" */}
                  <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>

                  {/* Números de página */}
                  {[...Array(Math.ceil(totalItems / itemsPerPage))].map(
                    (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? "active" : ""}
                      >
                        {index + 1}
                      </button>
                    )
                  )}

                  {/* Botón de "Siguiente" */}
                  <button
                    onClick={() =>
                      currentPage < Math.ceil(totalItems / itemsPerPage) &&
                      paginate(currentPage + 1)
                    }
                    disabled={
                      currentPage === Math.ceil(totalItems / itemsPerPage)
                    }
                  >
                    Siguiente
                  </button>
                </div>
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
                  <button
                    className="add-button"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Crear Nueva Actividad
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
                    {currentItemsActividad.map((actividad, index) => (
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
                <div className="pagination">
                  <button
                    onClick={() =>
                      currentPageActividad > 1 &&
                      paginateActividad(currentPageActividad - 1)
                    }
                    disabled={currentPageActividad === 1}
                  >
                    Anterior
                  </button>

                  {[
                    ...Array(Math.ceil(totalItemsActividad / itemsPerPage)),
                  ].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginateActividad(index + 1)}
                      className={
                        currentPageActividad === index + 1 ? "active" : ""
                      }
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      currentPageActividad <
                        Math.ceil(totalItemsActividad / itemsPerPage) &&
                      paginateActividad(currentPageActividad + 1)
                    }
                    disabled={
                      currentPageActividad ===
                      Math.ceil(totalItemsActividad / itemsPerPage)
                    }
                  >
                    Siguiente
                  </button>
                </div>
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
                  <button
                    className="add-button"
                    onClick={() => setShowCreateMisionModal(true)}
                  >
                    Crear Nueva Misión
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
                    {currentItemsMision.map((mision, index) => (
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
                <div className="pagination">
                  <button
                    onClick={() =>
                      currentPageMision > 1 &&
                      paginateMision(currentPageMision - 1)
                    }
                    disabled={currentPageMision === 1}
                  >
                    Anterior
                  </button>

                  {[...Array(Math.ceil(totalItemsMision / itemsPerPage))].map(
                    (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginateMision(index + 1)}
                        className={
                          currentPageMision === index + 1 ? "active" : ""
                        }
                      >
                        {index + 1}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      currentPageMision <
                        Math.ceil(totalItemsMision / itemsPerPage) &&
                      paginateMision(currentPageMision + 1)
                    }
                    disabled={
                      currentPageMision ===
                      Math.ceil(totalItemsMision / itemsPerPage)
                    }
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="config-section">
            <div
              className="config-toggle"
              onClick={() => setMostrarRecompensas(!mostrarRecompensas)}
            >
              <span>Recompensas</span>
              {mostrarRecompensas ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {mostrarRecompensas && (
              <div>
                <div className="config-actions">
                  <input
                    type="text"
                    value={searchRecompensas}
                    onChange={(e) => setSearchRecompensas(e.target.value)}
                    placeholder="Buscar por nombre"
                    className="search-input"
                  />
                  <button
                    className="add-button"
                    onClick={() => setShowCreateRecompensaModal(true)}
                  >
                    Crear Recompensa
                  </button>
                </div>

                <table className="config-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Puntos</th>
                      <th>Disponible</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecompensas.map((r, index) => (
                      <tr key={r.id_recompensa}>
                        <td>{index + 1}</td>
                        <td>{r.nombre}</td>
                        <td>{r.descripcion}</td>
                        <td>{r.puntosRequeridos}</td>
                        <td>{r.cantidadDisponible}</td>
                        <td>
                          <button
                            className="action-button edit"
                            onClick={() => abrirModalEdicionRecompensa(r)}
                          >
                            Editar
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() =>
                              handleEliminarRecompensa(r.id_recompensa)
                            }
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination">
                  <button
                    onClick={() =>
                      currentPageRecompensa > 1 &&
                      paginateRecompensas(currentPageRecompensa - 1)
                    }
                    disabled={currentPageRecompensa === 1}
                  >
                    Anterior
                  </button>
                  {[
                    ...Array(Math.ceil(totalItemsRecompensa / itemsPerPage)),
                  ].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginateRecompensas(index + 1)}
                      className={
                        currentPageRecompensa === index + 1 ? "active" : ""
                      }
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      currentPageRecompensa <
                        Math.ceil(totalItemsRecompensa / itemsPerPage) &&
                      paginateRecompensas(currentPageRecompensa + 1)
                    }
                    disabled={
                      currentPageRecompensa ===
                      Math.ceil(totalItemsRecompensa / itemsPerPage)
                    }
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {modalTipo && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar {modalTipo}</h3>

            {/* Si está cargando, mostrar el spinner */}
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div> {/* Aquí está el spinner */}
              </div>
            ) : (
              <>
                {modalTipo === "usuario" && (
                  <>
                    {/* Vista previa de la foto actual */}
                    {modalData.foto_perfil?.[0]?.url && (
                      <div
                        style={{ textAlign: "center", marginBottom: "1rem" }}
                      >
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
                        setModalData({
                          ...modalData,
                          nuevaFoto: e.target.files[0],
                        })
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
                      <option value="profesor">Profesor</option>
                      <option value="estudiante">Estudiante</option>
                      <option value="representante">Representante</option>
                    </select>
                    <button onClick={handleEditarUsuario} disabled={loading}>
                      Guardar
                    </button>
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
                        setModalData({
                          ...modalData,
                          descripcion: e.target.value,
                        })
                      }
                      placeholder="Descripción"
                    />
                    <label>Fecha de Inicio:</label>
                    <input
                      type="date"
                      value={modalData.fechaInicio?.split("T")[0]}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          fechaInicio: e.target.value,
                        })
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
                    <button onClick={handleEditarActividad} disabled={loading}>
                      Guardar
                    </button>
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
                        setModalData({
                          ...modalData,
                          descripcion: e.target.value,
                        })
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
                        setModalData({
                          ...modalData,
                          fechaInicio: e.target.value,
                        })
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
                    <button onClick={handleEditarMision} disabled={loading}>
                      Guardar
                    </button>
                  </>
                )}
                {modalTipo === "recompensa" && (
                  <>
                    <label>Nombre</label>
                    <input
                      value={modalData.nombre}
                      onChange={(e) =>
                        setModalData({ ...modalData, nombre: e.target.value })
                      }
                      placeholder="Nombre"
                    />

                    <label>Descripción</label>
                    <textarea
                      value={modalData.descripcion}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          descripcion: e.target.value,
                        })
                      }
                      placeholder="Descripción"
                    />

                    <label>Puntos requeridos</label>
                    <input
                      type="number"
                      value={modalData.puntosRequeridos}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          puntosRequeridos: Number(e.target.value),
                        })
                      }
                    />

                    <label>Cantidad disponible</label>
                    <input
                      type="number"
                      value={modalData.cantidadDisponible}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          cantidadDisponible: Number(e.target.value),
                        })
                      }
                    />

                    <button onClick={handleEditarRecompensa} disabled={loading}>
                      Guardar
                    </button>
                  </>
                )}

                <button onClick={cerrarModal}>Cancelar</button>
              </>
            )}
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Crear Nueva Actividad</h3>

            {/* Si está cargando, mostrar el spinner */}
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <label>Título</label>
                <input
                  value={nuevaActividad.titulo}
                  onChange={(e) =>
                    setNuevaActividad({
                      ...nuevaActividad,
                      titulo: e.target.value,
                    })
                  }
                  placeholder="Título de la actividad"
                />

                <label>Descripción</label>
                <textarea
                  value={nuevaActividad.descripcion}
                  onChange={(e) =>
                    setNuevaActividad({
                      ...nuevaActividad,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Descripción de la actividad"
                />

                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  value={nuevaActividad.fechaInicio}
                  onChange={(e) =>
                    setNuevaActividad({
                      ...nuevaActividad,
                      fechaInicio: e.target.value,
                    })
                  }
                />

                <label>Fecha de Fin</label>
                <input
                  type="date"
                  value={nuevaActividad.fechaFin}
                  onChange={(e) =>
                    setNuevaActividad({
                      ...nuevaActividad,
                      fechaFin: e.target.value,
                    })
                  }
                />

                <button onClick={handleCrearActividad} disabled={loading}>
                  {loading ? "Creando..." : "Crear Actividad"}
                </button>
                <button onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showCreateMisionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Crear Nueva Misión</h3>

            {/* Si está cargando, mostrar el spinner */}
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <label>Título</label>
                <input
                  value={nuevaMision.titulo}
                  onChange={(e) =>
                    setNuevaMision({ ...nuevaMision, titulo: e.target.value })
                  }
                  placeholder="Título de la misión"
                />

                <label>Descripción</label>
                <textarea
                  value={nuevaMision.descripcion}
                  onChange={(e) =>
                    setNuevaMision({
                      ...nuevaMision,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Descripción de la misión"
                />

                <label>Puntos</label>
                <input
                  type="number"
                  value={nuevaMision.puntos}
                  onChange={(e) =>
                    setNuevaMision({
                      ...nuevaMision,
                      puntos: Number(e.target.value),
                    })
                  }
                  placeholder="Puntos"
                />

                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  value={nuevaMision.fechaInicio}
                  onChange={(e) =>
                    setNuevaMision({
                      ...nuevaMision,
                      fechaInicio: e.target.value,
                    })
                  }
                />

                <label>Fecha de Fin</label>
                <input
                  type="date"
                  value={nuevaMision.fechaFin}
                  onChange={(e) =>
                    setNuevaMision({
                      ...nuevaMision,
                      fechaFin: e.target.value,
                    })
                  }
                />

                <button onClick={handleCrearMision} disabled={loading}>
                  {loading ? "Creando..." : "Crear Misión"}
                </button>
                <button onClick={() => setShowCreateMisionModal(false)}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showCreateRecompensaModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Crear Nueva Recompensa</h3>
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <label>Nombre</label>
                <input
                  value={nuevaRecompensa.nombre}
                  onChange={(e) =>
                    setNuevaRecompensa({
                      ...nuevaRecompensa,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Nombre"
                />

                <label>Descripción</label>
                <textarea
                  value={nuevaRecompensa.descripcion}
                  onChange={(e) =>
                    setNuevaRecompensa({
                      ...nuevaRecompensa,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Descripción"
                />

                <label>Puntos requeridos</label>
                <input
                  type="number"
                  value={nuevaRecompensa.puntosRequeridos}
                  onChange={(e) =>
                    setNuevaRecompensa({
                      ...nuevaRecompensa,
                      puntosRequeridos: Number(e.target.value),
                    })
                  }
                />

                <label>Cantidad disponible</label>
                <input
                  type="number"
                  value={nuevaRecompensa.cantidadDisponible}
                  onChange={(e) =>
                    setNuevaRecompensa({
                      ...nuevaRecompensa,
                      cantidadDisponible: Number(e.target.value),
                    })
                  }
                />

                <button onClick={handleCrearRecompensa} disabled={loading}>
                  {loading ? "Creando..." : "Crear Recompensa"}
                </button>
                <button onClick={() => setShowCreateRecompensaModal(false)}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ConfiguracionPage;
