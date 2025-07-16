import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "../styles/configuracion.css";
import Cookies from "js-cookie";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import Modal from "react-modal";

const ConfiguracionPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [misiones, setMisiones] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [fechaError, setFechaError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateRecompensaModal, setShowCreateRecompensaModal] =
    useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
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
    imagen: null,
  });
  const [nuevaCuentaAdmin, setNuevaCuentaAdmin] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    fecha_nacimiento: "",
  });
  const [nuevaInsignia, setNuevaInsignia] = useState({
    nombre: "",
    descripcion: "",
    puntosrequeridos: "",
    nuevaImagen: null,
  });

  const [showCreateMisionModal, setShowCreateMisionModal] = useState(false);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  const [mostrarActividades, setMostrarActividades] = useState(false);
  const [mostrarMisiones, setMostrarMisiones] = useState(false);
  const [mostrarRecompensas, setMostrarRecompensas] = useState(false);
  const [mostrarInsignias, setMostrarInsignias] = useState(false);
  const [searchUsuarios, setSearchUsuarios] = useState("");
  const [searchActividades, setSearchActividades] = useState("");
  const [searchMisiones, setSearchMisiones] = useState("");
  const [searchRecompensas, setSearchRecompensas] = useState("");
  const [modalTipo, setModalTipo] = useState(null);
  const [modalData, setModalData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
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
  const [insignias, setInsignias] = useState([]);
  const [filteredInsignias, setFilteredInsignias] = useState([]);
  const [searchInsignias, setSearchInsignias] = useState("");
  const [showCreateInsigniaModal, setShowCreateInsigniaModal] = useState(false);

  const [currentPageInsignia, setCurrentPageInsignia] = useState(1);
  const [totalItemsInsignia, setTotalItemsInsignia] = useState(0);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsuarios.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastItemActividad = currentPageActividad * itemsPerPage;
  const indexOfFirstItemActividad = indexOfLastItemActividad - itemsPerPage;
  const currentItemsActividad = filteredActividades.slice(
    indexOfFirstItemActividad,
    indexOfLastItemActividad
  );
  const paginateActividad = (pageNumber) => setCurrentPageActividad(pageNumber);

  const indexOfLastItemMision = currentPageMision * itemsPerPage;
  const indexOfFirstItemMision = indexOfLastItemMision - itemsPerPage;
  const currentItemsMision = filteredMisiones.slice(
    indexOfFirstItemMision,
    indexOfLastItemMision
  );
  const paginateMision = (pageNumber) => setCurrentPageMision(pageNumber);

  useEffect(() => {
    obtenerUsuarios();
    obtenerActividades();
    obtenerMisiones();
    obtenerRecompensas();
    obtenerInsignias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtered = usuarios.filter((usuario) =>
      usuario.nombre.toLowerCase().includes(searchUsuarios.toLowerCase())
    );
    setFilteredUsuarios(filtered);
    setTotalItems(filtered.length);
  }, [searchUsuarios, usuarios]);

  useEffect(() => {
    const filtered = actividades.filter((actividad) =>
      actividad.titulo.toLowerCase().includes(searchActividades.toLowerCase())
    );
    setFilteredActividades(filtered);
    setTotalItemsActividad(filtered.length);
  }, [searchActividades, actividades]);

  useEffect(() => {
    const filtered = misiones.filter((mision) =>
      mision.titulo.toLowerCase().includes(searchMisiones.toLowerCase())
    );
    setFilteredMisiones(filtered);
    setTotalItemsMision(filtered.length);
  }, [searchMisiones, misiones]);

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

  useEffect(() => {
    const filtered = insignias.filter((insignia) =>
      insignia.nombre.toLowerCase().includes(searchInsignias.toLowerCase())
    );
    setFilteredInsignias(filtered);
    setTotalItemsInsignia(filtered.length);
  }, [searchInsignias, insignias]);

  const indexOfLastItemInsignia = currentPageInsignia * itemsPerPage;
  const indexOfFirstItemInsignia = indexOfLastItemInsignia - itemsPerPage;
  const currentItemsInsignia = filteredInsignias.slice(
    indexOfFirstItemInsignia,
    indexOfLastItemInsignia
  );

  const paginateInsignias = (pageNumber) => setCurrentPageInsignia(pageNumber);

  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

  const validarFechas = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) {
      setFechaError("");
      return true;
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setFechaError(
        "La fecha de fin no puede ser anterior a la fecha de inicio."
      );
      return false;
    } else {
      setFechaError("");
      return true;
    }
  };

  // Puedes poner esto al inicio de tu componente:
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
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const validarCorreo = (correo) => {
    if (!correo) return "Debes ingresar un correo electrónico";
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) return "Formato de correo inválido";
    const dominio = correo.split("@")[1]?.toLowerCase();
    if (!dominio) return "Formato de correo inválido";

    const typoDetectado = dominiosComunes.find((dominioComun) => {
      return (
        distanciaLevenshtein(dominio, dominioComun) > 0 &&
        distanciaLevenshtein(dominio, dominioComun) <= 2
      );
    });

    if (typoDetectado) {
      return `¿Querías decir "${typoDetectado}"? Revisa el dominio del correo.`;
    }
    return null;
  };

  const token = Cookies.get("token");

  const obtenerUsuarios = async () => {
    const res = await fetch(
      "https://kong-0c858408d8us2s9oc.kongcloud.dev/usuarios",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await res.json();
    setUsuarios(data);
  };

  const obtenerActividades = async () => {
    const res = await fetch(
      "https://kong-0c858408d8us2s9oc.kongcloud.dev/actividades",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await res.json();
    setActividades(data);
  };

  const obtenerMisiones = async () => {
    const res = await fetch(
      "https://kong-0c858408d8us2s9oc.kongcloud.dev/misiones/admin",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await res.json();
    if (Array.isArray(data.misiones)) {
      setMisiones(data.misiones);
    } else {
      Swal.fire("Error", "La respuesta de las misiones no es válida", "error");
    }
  };

  const obtenerRecompensas = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/recompensas/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
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

  const obtenerInsignias = async () => {
    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/insignias",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setInsignias(data);
    } catch (err) {
      console.error("Error al obtener insignias:", err);
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

    Swal.fire({
      title: "Eliminando...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${id_usuario}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      Swal.close();

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
      Swal.close();
      Swal.fire("Error", "No se pudo eliminar el usuario", error);
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

    Swal.fire({
      title: "Eliminando...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/actividad/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      Swal.close();

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
      Swal.close();
      Swal.fire("Error", "No se pudo eliminar la actividad", error);
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

    Swal.fire({
      title: "Eliminando...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/mision/${id_mision}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      Swal.close();

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
      Swal.close();
      Swal.fire("Error", "No se pudo eliminar la misión", error);
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

    Swal.fire({
      title: "Eliminando...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/recompensa/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      Swal.close();
      if (res.ok) {
        Swal.fire("Eliminada", "Recompensa eliminada con éxito", "success");
        obtenerRecompensas();
      } else {
        const data = await res.json();
        Swal.fire("Error", data.message || "No se pudo eliminar", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Error del servidor", err);
    }
  };

  const handleEliminarInsignia = async (id_insignia) => {
    console.log("Eliminando insignia con id_insignia:", id_insignia);
    const confirmacion = await Swal.fire({
      title: "¿Eliminar insignia?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    Swal.fire({
      title: "Eliminando...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/insignia/${id_insignia}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      Swal.close();
      if (res.ok) {
        Swal.fire("Eliminada", "Insignia eliminada con éxito", "success");
        obtenerInsignias();
      } else {
        const data = await res.json();
        Swal.fire("Error", data.message || "No se pudo eliminar", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Error del servidor", err);
    }
  };

  const handleCrearUsuarioAdmin = async () => {
    const { nombre, apellido, correo, fecha_nacimiento } = nuevaCuentaAdmin;

    if (!nombre || !apellido || !correo || !fecha_nacimiento) {
      setShowCreateAdminModal(false);
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    if (!esMayorDe16(fecha_nacimiento)) {
      setShowCreateAdminModal(false);
      Swal.fire("Error", "El usuario debe ser mayor a 16 años", "error");
      return;
    }

    setShowCreateAdminModal(false);

    Swal.fire({
      title: "Creando usuario...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/crear-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nuevaCuentaAdmin),
          credentials: "include",
        }
      );
      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire("Éxito", "Usuario creado correctamente", "success");
        obtenerUsuarios();
        setNuevaCuentaAdmin({
          nombre: "",
          apellido: "",
          correo: "",
          fecha_nacimiento: "",
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo crear", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "No se pudo crear", err);
    }
  };

  const handleCrearActividad = async () => {
    const { titulo, descripcion, fechaInicio, fechaFin } = nuevaActividad;

    if (!titulo || !descripcion || !fechaInicio || !fechaFin) {
      setShowCreateModal(false);
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setShowCreateModal(false);
      Swal.fire(
        "Error",
        "La fecha de inicio no puede ser mayor a la de fin",
        "error"
      );
      return;
    }

    setShowCreateModal(false);

    Swal.fire({
      title: "Creando actividad...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/actividad",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nuevaActividad),
          credentials: "include",
        }
      );
      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire("Éxito", "Actividad creada correctamente", "success");
        obtenerActividades();
        setNuevaActividad({
          titulo: "",
          descripcion: "",
          fechaInicio: "",
          fechaFin: "",
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo crear", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "No se pudo crear", err);
    }
  };

  const handleCrearMision = async () => {
    const { titulo, descripcion, puntos, fechaInicio, fechaFin } = nuevaMision;

    if (!titulo || !descripcion || puntos === "" || !fechaInicio || !fechaFin) {
      setShowCreateMisionModal(false);
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setShowCreateMisionModal(false);
      Swal.fire(
        "Error",
        "La fecha de inicio no puede ser mayor a la de fin",
        "error"
      );
      return;
    }

    setShowCreateMisionModal(false);

    Swal.fire({
      title: "Creando misión...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/mision",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nuevaMision),
          credentials: "include",
        }
      );
      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire("Éxito", "Misión creada correctamente", "success");
        obtenerMisiones();
        setNuevaMision({
          titulo: "",
          descripcion: "",
          puntos: "",
          fechaInicio: "",
          fechaFin: "",
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo crear", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "No se pudo crear", err);
    }
  };

  const handleCrearRecompensa = async () => {
    const {
      nombre,
      descripcion,
      puntosRequeridos,
      cantidadDisponible,
      imagen,
    } = nuevaRecompensa;

    if (
      !nombre ||
      !descripcion ||
      puntosRequeridos === "" ||
      cantidadDisponible === ""
    ) {
      setShowCreateRecompensaModal(false);
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    setShowCreateRecompensaModal(false);

    Swal.fire({
      title: "Creando recompensa...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("puntosRequeridos", puntosRequeridos);
      formData.append("cantidadDisponible", cantidadDisponible);
      if (imagen) formData.append("imagen", imagen);

      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/recompensa",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          credentials: "include",
        }
      );
      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire(
          "Éxito",
          data.message || "Recompensa creada correctamente",
          "success"
        );
        obtenerRecompensas();
        setNuevaRecompensa({
          nombre: "",
          descripcion: "",
          puntosRequeridos: "",
          cantidadDisponible: "",
          imagen: null,
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo crear", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "No se pudo crear", err);
    }
  };

  const handleCrearInsignia = async () => {
    const { nombre, descripcion, puntosrequeridos, nuevaImagen } =
      nuevaInsignia;

    if (!nombre || !descripcion || puntosrequeridos === "") {
      setShowCreateInsigniaModal(false);
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    setShowCreateInsigniaModal(false);

    Swal.fire({
      title: "Creando insignia...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("puntosrequeridos", puntosrequeridos);
      if (nuevaImagen) formData.append("insignia", nuevaImagen);

      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/insignia",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          credentials: "include",
        }
      );
      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire(
          "Éxito",
          data.message || "Insignia creada correctamente",
          "success"
        );
        obtenerInsignias();
        setNuevaInsignia({
          nombre: "",
          descripcion: "",
          puntosrequeridos: "",
          nuevaImagen: null,
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo crear", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "No se pudo crear", err);
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
    const dia = String(date.getUTCDate()).padStart(2, "0");
    const mes = String(date.getUTCMonth() + 1).padStart(2, "0");
    const año = date.getUTCFullYear();
    return `${dia}/${mes}/${año}`;
  };

  function esMayorDe16(fecha_nacimiento) {
    const nacimiento = new Date(fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (
      edad > 16 ||
      (edad === 16 &&
        (mes > 0 || (mes === 0 && hoy.getDate() >= nacimiento.getDate())))
    ) {
      return true;
    }
    return false;
  }

  const abrirModalEdicion = (tipo, data) => {
    setModalTipo(tipo);
    setModalData(data);
  };

  const cerrarModal = () => {
    setModalTipo(null);
    setModalData(null);
  };

  const handleEditarUsuario = async () => {
    // eslint-disable-next-line no-unused-vars
    const { id_usuario, nuevaFoto, foto_perfil, sesionesIniciadas, ...datos } =
      modalData;

    if (!datos.nombre || !datos.apellido || !datos.correo || !datos.rol) {
      Swal.fire("Error", "Todos los campos deben estar completos", "error");
      return;
    }
    cerrarModal();

    Swal.fire({
      title: "Guardando cambios...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const form = new FormData();
      if (nuevaFoto) {
        form.append("foto_perfil", nuevaFoto);
      }
      Object.entries(datos).forEach(([key, value]) => {
        form.append(key, value);
      });

      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/usuario/${id_usuario}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
          credentials: "include",
        }
      );
      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire(
          "Actualizado",
          "Usuario actualizado correctamente",
          "success"
        );
        obtenerUsuarios();
      } else {
        Swal.fire("Error", data.message || "No se pudo actualizar", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", err.message, "error");
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
    cerrarModal();

    Swal.fire({
      title: "Guardando cambios...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/actividad/${id_actividad}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...datos, fechaInicio, fechaFin }),
          credentials: "include",
        }
      );
      Swal.close();

      if (res.ok) {
        Swal.fire(
          "Actualizada",
          "Actividad actualizada correctamente",
          "success"
        );
        obtenerActividades();
      } else {
        Swal.fire("Error", "No se pudo actualizar la actividad", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Error de red al actualizar la actividad", err);
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
    cerrarModal();

    Swal.fire({
      title: "Guardando cambios...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/mision/${id_mision}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...datos, fechaInicio, fechaFin }),
          credentials: "include",
        }
      );
      Swal.close();

      if (res.ok) {
        Swal.fire("Actualizada", "Misión actualizada correctamente", "success");
        obtenerMisiones();
      } else {
        Swal.fire("Error", "No se pudo actualizar la misión", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Error de red al actualizar la misión", err);
    }
  };

  const handleEditarRecompensa = async () => {
    const {
      id_recompensa,
      nombre,
      descripcion,
      puntosRequeridos,
      cantidadDisponible,
      nuevaImagen,
    } = modalData;

    if (!nombre || !descripcion || !puntosRequeridos) {
      Swal.fire(
        "Error",
        "Todos los campos requeridos deben estar completos.",
        "error"
      );
      return;
    }
    cerrarModal();

    Swal.fire({
      title: "Guardando cambios...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("puntosRequeridos", puntosRequeridos);
      formData.append("cantidadDisponible", cantidadDisponible || 0);
      formData.append("activa", true);

      if (nuevaImagen) {
        formData.append("imagen", nuevaImagen);
      }

      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/recompensa/${id_recompensa}`,
        {
          method: "PUT",
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
        Swal.fire("Éxito", data.message, "success");
        obtenerRecompensas();
      } else {
        Swal.fire(
          "Error",
          data.message || "No se pudo editar la recompensa",
          "error"
        );
      }
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "No se pudo editar la recompensa", error);
    }
  };

  const handleEditarInsignia = async () => {
    const { id_insignia, nombre, descripcion, puntosrequeridos, nuevaFoto } =
      modalData;

    if (!nombre || !descripcion || !puntosrequeridos) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }
    cerrarModal();

    Swal.fire({
      title: "Guardando cambios...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("puntosrequeridos", puntosrequeridos);

      if (nuevaFoto) {
        formData.append("insignia", nuevaFoto);
      }

      const res = await fetch(
        `https://kong-0c858408d8us2s9oc.kongcloud.dev/insignia/${id_insignia}`,
        {
          method: "PUT",
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
        Swal.fire("Éxito", data.message, "success");
        obtenerInsignias();
      } else {
        Swal.fire(
          "Error",
          data.message || "No se pudo actualizar la insignia",
          "error"
        );
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Hubo un error al editar la insignia", err);
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
                  <button
                    className="add-button"
                    onClick={() => setShowCreateAdminModal(true)}
                  >
                    Crear Usuario Administrador
                  </button>
                </div>
                <div className="table-responsive">
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
                          <td>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
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
                <div className="pagination">
                  <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>

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
                <div className="table-responsive">
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
                          <td>
                            {(currentPageActividad - 1) * itemsPerPage +
                              index +
                              1}
                          </td>
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
                <div className="table-responsive">
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
                          <td>
                            {(currentPageMision - 1) * itemsPerPage + index + 1}
                          </td>
                          <td>{mision.titulo}</td>
                          <td>{mision.descripcion}</td>
                          <td>{mision.puntos}</td>
                          <td>{formatFecha(mision.fechaInicio)}</td>
                          <td>{formatFecha(mision.fechaFin)}</td>
                          <td>
                            <button
                              className="action-button edit"
                              onClick={() =>
                                abrirModalEdicion("mision", mision)
                              }
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
          {/* Sección Recompensas */}
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
                <div className="table-responsive">
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
                          <td>
                            {(currentPageRecompensa - 1) * itemsPerPage +
                              index +
                              1}
                          </td>
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
                </div>
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
          {/* Sección Insignias */}
          <div className="config-section">
            <div
              className="config-toggle"
              onClick={() => setMostrarInsignias(!mostrarInsignias)}
            >
              <span>Insignias</span>
              {mostrarInsignias ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {mostrarInsignias && (
              <div>
                <div className="config-actions">
                  <input
                    type="text"
                    value={searchInsignias}
                    onChange={(e) => setSearchInsignias(e.target.value)}
                    placeholder="Buscar por nombre"
                    className="search-input"
                  />
                  <button
                    className="add-button"
                    onClick={() => setShowCreateInsigniaModal(true)}
                  >
                    Crear Insignia
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="config-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Puntos Requeridos</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItemsInsignia.map((insignia, index) => (
                        <tr key={insignia.id_insignia}>
                          <td>
                            {(currentPageInsignia - 1) * itemsPerPage +
                              index +
                              1}
                          </td>

                          <td>{insignia.nombre}</td>
                          <td>{insignia.descripcion}</td>
                          <td>{insignia.puntosrequeridos}</td>
                          <td>
                            <button
                              className="action-button edit"
                              onClick={() =>
                                abrirModalEdicion("insignia", insignia)
                              }
                            >
                              Editar
                            </button>
                            <button
                              className="action-button delete"
                              onClick={() =>
                                handleEliminarInsignia(insignia.id_insignia)
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
                <div className="pagination">
                  <button
                    onClick={() => paginateInsignias(currentPageInsignia - 1)}
                    disabled={currentPageInsignia === 1}
                  >
                    Anterior
                  </button>
                  {[...Array(Math.ceil(totalItemsInsignia / itemsPerPage))].map(
                    (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginateInsignias(index + 1)}
                        className={
                          currentPageInsignia === index + 1 ? "active" : ""
                        }
                      >
                        {index + 1}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => paginateInsignias(currentPageInsignia + 1)}
                    disabled={
                      currentPageInsignia ===
                      Math.ceil(totalItemsInsignia / itemsPerPage)
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

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                {modalTipo === "usuario" && (
                  <>
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

                    {/* {modalData.rol !== "administrador" && (
                      <>
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
                      </>
                    )} */}

                    <label>Nombre</label>
                    <input
                      type="text"
                      value={modalData.nombre}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(valor)) {
                          setModalData({ ...modalData, nombre: valor });
                        }
                      }}
                      placeholder="Nombre"
                    />
                    {modalData.nombre && !soloLetras.test(modalData.nombre) && (
                      <p style={{ color: "red" }}>Solo letras y espacios</p>
                    )}

                    <label>Apellido</label>
                    <input
                      type="text"
                      value={modalData.apellido}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(valor)) {
                          setModalData({ ...modalData, apellido: valor });
                        }
                      }}
                      placeholder="Apellido"
                    />
                    {modalData.apellido &&
                      !soloLetras.test(modalData.apellido) && (
                        <p style={{ color: "red" }}>Solo letras y espacios</p>
                      )}

                    <label>Correo</label>
                    <input
                      type="email"
                      value={modalData.correo}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setModalData({ ...modalData, correo: valor });

                        // Validación inmediata
                        const errorCorreo = validarCorreo(valor);
                        setEditErrors((prev) => ({
                          ...prev,
                          correo: errorCorreo,
                        }));
                      }}
                      placeholder="Correo electrónico"
                    />
                    {editErrors.correo && (
                      <p className="error-text">{editErrors.correo}</p>
                    )}

                    <label>Rol</label>
                    <select
                      value={modalData.rol}
                      onChange={(e) =>
                        setModalData({ ...modalData, rol: e.target.value })
                      }
                      className="modal-select"
                      disabled
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="profesor">Profesor</option>
                      <option value="estudiante">Estudiante</option>
                      <option value="representante">Representante</option>
                    </select>

                    <button
                      onClick={handleEditarUsuario}
                      disabled={
                        !!editErrors.correo || !modalData.correo || loading
                      }
                    >
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
                      onChange={(e) => {
                        const nuevaFechaInicio = e.target.value;
                        setModalData({
                          ...modalData,
                          fechaInicio: nuevaFechaInicio,
                        });
                        validarFechas(nuevaFechaInicio, modalData.fechaFin);
                      }}
                    />
                    <label>Fecha de Fin:</label>
                    <input
                      type="date"
                      value={modalData.fechaFin?.split("T")[0]}
                      onChange={(e) => {
                        const nuevaFechaFin = e.target.value;
                        setModalData({ ...modalData, fechaFin: nuevaFechaFin });
                        validarFechas(modalData.fechaInicio, nuevaFechaFin);
                      }}
                    />
                    {fechaError && (
                      <p
                        style={{
                          color: "red",
                          marginTop: "-0.9rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {fechaError}
                      </p>
                    )}

                    <button
                      onClick={handleEditarActividad}
                      disabled={loading || fechaError}
                    >
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
                      min={0}
                      step={1}
                      value={modalData.puntos}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setModalData({
                            ...modalData,
                            puntos: value === "" ? "" : Number(value),
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          ["e", "E", "+", "-", "."].includes(e.key) ||
                          (e.key.length === 1 && !/[0-9]/.test(e.key))
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Puntos"
                    />
                    <label>Fecha de Inicio:</label>
                    <input
                      type="date"
                      value={modalData.fechaInicio?.split("T")[0]}
                      onChange={(e) => {
                        const nuevaFechaInicio = e.target.value;
                        setModalData({
                          ...modalData,
                          fechaInicio: nuevaFechaInicio,
                        });
                        validarFechas(nuevaFechaInicio, modalData.fechaFin);
                      }}
                    />
                    <label>Fecha de Fin:</label>
                    <input
                      type="date"
                      value={modalData.fechaFin?.split("T")[0]}
                      onChange={(e) => {
                        const nuevaFechaFin = e.target.value;
                        setModalData({ ...modalData, fechaFin: nuevaFechaFin });
                        validarFechas(modalData.fechaInicio, nuevaFechaFin);
                      }}
                    />
                    {fechaError && (
                      <p
                        style={{
                          color: "red",
                          marginTop: "-0.9rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {fechaError}
                      </p>
                    )}
                    <button
                      onClick={handleEditarMision}
                      disabled={loading || fechaError}
                    >
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
                      min={0}
                      step={1}
                      value={modalData.puntosRequeridos}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setModalData({
                            ...modalData,
                            puntosRequeridos: value === "" ? "" : Number(value),
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          ["e", "E", "+", "-", "."].includes(e.key) ||
                          (e.key.length === 1 && !/[0-9]/.test(e.key))
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />

                    <label>Cantidad disponible</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={modalData.cantidadDisponible}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setModalData({
                            ...modalData,
                            cantidadDisponible:
                              value === "" ? "" : Number(value),
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          ["e", "E", "+", "-", "."].includes(e.key) ||
                          (e.key.length === 1 && !/[0-9]/.test(e.key))
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />

                    {modalData.imagenUrl && (
                      <div
                        style={{ textAlign: "center", marginBottom: "1rem" }}
                      >
                        <img
                          src={modalData.imagenUrl}
                          alt="Recompensa actual"
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            margin: "5px",
                          }}
                        />
                      </div>
                    )}

                    <label>Cambiar imagen</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setModalData({
                            ...modalData,
                            nuevaImagen: file,
                            nuevaImagenPreview: URL.createObjectURL(file),
                          });
                        }
                      }}
                      style={{ marginBottom: "1rem" }}
                    />

                    <button onClick={handleEditarRecompensa} disabled={loading}>
                      {loading ? "Guardando..." : "Guardar"}
                    </button>
                  </>
                )}

                {modalTipo === "insignia" && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Editar Insignia</h3>

                      {loading ? (
                        <div className="loading-container">
                          <div className="spinner"></div>
                        </div>
                      ) : (
                        <>
                          <label>Nombre</label>
                          <input
                            value={modalData.nombre}
                            onChange={(e) =>
                              setModalData({
                                ...modalData,
                                nombre: e.target.value,
                              })
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

                          <label>Puntos Requeridos</label>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={modalData.puntosrequeridos}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                setModalData({
                                  ...modalData,
                                  puntosrequeridos:
                                    value === "" ? "" : Number(value),
                                });
                              }
                            }}
                            onKeyDown={(e) => {
                              if (
                                ["e", "E", "+", "-", "."].includes(e.key) ||
                                (e.key.length === 1 && !/[0-9]/.test(e.key))
                              ) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="Puntos requeridos"
                          />

                          {modalData.imagenes &&
                            modalData.imagenes.length > 0 && (
                              <div
                                style={{
                                  textAlign: "center",
                                  marginBottom: "1rem",
                                }}
                              >
                                {modalData.imagenes.map((img, index) => (
                                  <img
                                    key={index}
                                    src={img.url}
                                    alt={`Insignia ${index}`}
                                    style={{
                                      width: "100px",
                                      height: "100px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                      margin: "5px",
                                    }}
                                  />
                                ))}
                              </div>
                            )}

                          <label>Cambiar Imágenes</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setModalData({
                                ...modalData,
                                nuevaImagen: e.target.files[0],
                              })
                            }
                            style={{ marginBottom: "1rem" }}
                          />

                          <button
                            onClick={handleEditarInsignia}
                            disabled={loading}
                          >
                            Guardar
                          </button>
                        </>
                      )}

                      <button onClick={cerrarModal}>Cancelar</button>
                    </div>
                  </div>
                )}

                <button onClick={cerrarModal}>Cancelar</button>
              </>
            )}
          </div>
        </div>
      )}
      {showCreateAdminModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Crear Usuario Administrador</h3>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <label>Nombre</label>
                <input
                  type="text"
                  value={nuevaCuentaAdmin.nombre}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(valor)) {
                      setNuevaCuentaAdmin({
                        ...nuevaCuentaAdmin,
                        nombre: valor,
                      });
                    }
                  }}
                  placeholder="Nombre"
                />
                {nuevaCuentaAdmin.nombre &&
                  !soloLetras.test(nuevaCuentaAdmin.nombre) && (
                    <p style={{ color: "red" }}>Solo letras y espacios</p>
                  )}

                <label>Apellido</label>
                <input
                  type="text"
                  value={nuevaCuentaAdmin.apellido}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(valor)) {
                      setNuevaCuentaAdmin({
                        ...nuevaCuentaAdmin,
                        apellido: valor,
                      });
                    }
                  }}
                  placeholder="Apellido"
                />
                {nuevaCuentaAdmin.apellido &&
                  !soloLetras.test(nuevaCuentaAdmin.apellido) && (
                    <p style={{ color: "red" }}>Solo letras y espacios</p>
                  )}

                <label>Correo</label>
                <input
                  type="email"
                  value={nuevaCuentaAdmin.correo}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setNuevaCuentaAdmin({ ...nuevaCuentaAdmin, correo: valor });

                    // Validación inmediata
                    const errorCorreo = validarCorreo(valor);
                    setErrors((prev) => ({ ...prev, correo: errorCorreo }));
                  }}
                  placeholder="Correo electrónico"
                />
                {errors.correo && <p className="error-text">{errors.correo}</p>}

                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={nuevaCuentaAdmin.fecha_nacimiento}
                  onChange={(e) =>
                    setNuevaCuentaAdmin({
                      ...nuevaCuentaAdmin,
                      fecha_nacimiento: e.target.value,
                    })
                  }
                />
                {nuevaCuentaAdmin.fecha_nacimiento &&
                  !esMayorDe16(nuevaCuentaAdmin.fecha_nacimiento) && (
                    <p style={{ color: "red" }}>Debe ser mayor a 16 años</p>
                  )}

                <button
                  onClick={handleCrearUsuarioAdmin}
                  disabled={
                    !!errors.correo || !nuevaCuentaAdmin.correo || loading
                  }
                >
                  {loading ? "Creando..." : "Crear Administrador"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateAdminModal(false);
                    setNuevaCuentaAdmin({
                      nombre: "",
                      apellido: "",
                      correo: "",
                      fecha_nacimiento: "",
                    });
                  }}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Crear Nueva Actividad</h3>

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
                  onChange={(e) => {
                    const nuevaFechaInicio = e.target.value;
                    setNuevaActividad({
                      ...nuevaActividad,
                      fechaInicio: nuevaFechaInicio,
                    });
                    validarFechas(nuevaFechaInicio, nuevaActividad.fechaFin);
                  }}
                />

                <label>Fecha de Fin</label>
                <input
                  type="date"
                  value={nuevaActividad.fechaFin}
                  onChange={(e) => {
                    const nuevaFechaFin = e.target.value;
                    setNuevaActividad({
                      ...nuevaActividad,
                      fechaFin: nuevaFechaFin,
                    });
                    validarFechas(nuevaActividad.fechaInicio, nuevaFechaFin);
                  }}
                />
                {fechaError && (
                  <p
                    style={{
                      color: "red",
                      marginTop: "-0.9rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {fechaError}
                  </p>
                )}

                <button
                  onClick={handleCrearActividad}
                  disabled={loading || fechaError}
                >
                  {loading ? "Creando..." : "Crear Actividad"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNuevaActividad({
                      titulo: "",
                      descripcion: "",
                      fechaInicio: "",
                      fechaFin: "",
                    });
                    setFechaError("");
                  }}
                >
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
                  min={0}
                  step={1}
                  value={nuevaMision.puntos}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setNuevaMision({
                        ...nuevaMision,
                        puntos: value === "" ? "" : Number(value),
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      ["e", "E", "+", "-", "."].includes(e.key) ||
                      (e.key.length === 1 && !/[0-9]/.test(e.key))
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Puntos"
                />

                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  value={nuevaMision.fechaInicio}
                  onChange={(e) => {
                    const nuevaFechaInicio = e.target.value;
                    setNuevaMision({
                      ...nuevaMision,
                      fechaInicio: nuevaFechaInicio,
                    });
                    validarFechas(nuevaFechaInicio, nuevaMision.fechaFin);
                  }}
                />

                <label>Fecha de Fin</label>
                <input
                  type="date"
                  value={nuevaMision.fechaFin}
                  onChange={(e) => {
                    const nuevaFechaFin = e.target.value;
                    setNuevaMision({
                      ...nuevaMision,
                      fechaFin: nuevaFechaFin,
                    });
                    validarFechas(nuevaMision.fechaInicio, nuevaFechaFin);
                  }}
                />
                {fechaError && (
                  <p
                    style={{
                      color: "red",
                      marginTop: "-0.9rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {fechaError}
                  </p>
                )}
                <button
                  onClick={handleCrearMision}
                  disabled={loading || fechaError}
                >
                  {loading ? "Creando..." : "Crear Misión"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateMisionModal(false);
                    setNuevaMision({
                      titulo: "",
                      descripcion: "",
                      puntos: "",
                      fechaInicio: "",
                      fechaFin: "",
                    });
                    setFechaError("");
                  }}
                >
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
                  min={0}
                  step={1}
                  value={nuevaRecompensa.puntosRequeridos}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setNuevaRecompensa({
                        ...nuevaRecompensa,
                        puntosRequeridos: value === "" ? "" : Number(value),
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      ["e", "E", "+", "-", "."].includes(e.key) ||
                      (e.key.length === 1 && !/[0-9]/.test(e.key))
                    ) {
                      e.preventDefault();
                    }
                  }}
                />

                <label>Cantidad disponible</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={nuevaRecompensa.cantidadDisponible}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setNuevaRecompensa({
                        ...nuevaRecompensa,
                        cantidadDisponible: value === "" ? "" : Number(value),
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      ["e", "E", "+", "-", "."].includes(e.key) ||
                      (e.key.length === 1 && !/[0-9]/.test(e.key))
                    ) {
                      e.preventDefault();
                    }
                  }}
                />

                <label>Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNuevaRecompensa({
                      ...nuevaRecompensa,
                      imagen: e.target.files[0],
                    })
                  }
                  style={{ marginBottom: "1rem" }}
                />

                <button onClick={handleCrearRecompensa} disabled={loading}>
                  {loading ? "Creando..." : "Crear Recompensa"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateRecompensaModal(false);
                    setNuevaRecompensa({
                      nombre: "",
                      descripcion: "",
                      puntosRequeridos: "",
                      cantidadDisponible: "",
                      imagen: null,
                    });
                  }}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showCreateInsigniaModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Crear Nueva Insignia</h3>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <label>Nombre</label>
                <input
                  value={nuevaInsignia.nombre}
                  onChange={(e) =>
                    setNuevaInsignia({
                      ...nuevaInsignia,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Nombre"
                />

                <label>Descripción</label>
                <textarea
                  value={nuevaInsignia.descripcion}
                  onChange={(e) =>
                    setNuevaInsignia({
                      ...nuevaInsignia,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Descripción"
                />

                <label>Puntos Requeridos</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={nuevaInsignia.puntosrequeridos}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setNuevaInsignia({
                        ...nuevaInsignia,
                        puntosrequeridos: value === "" ? "" : Number(value),
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      ["e", "E", "+", "-", "."].includes(e.key) ||
                      (e.key.length === 1 && !/[0-9]/.test(e.key))
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Puntos requeridos"
                />

                <label>Cambiar Imágenes</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNuevaInsignia({
                      ...nuevaInsignia,
                      nuevaImagen: e.target.files[0],
                    })
                  }
                  style={{ marginBottom: "1rem" }}
                />

                <button onClick={handleCrearInsignia} disabled={loading}>
                  {loading ? "Creando..." : "Crear Insignia"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateInsigniaModal(false);
                    setNuevaInsignia({
                      nombre: "",
                      descripcion: "",
                      puntosrequeridos: "",
                      nuevaImagen: null,
                    });
                  }}
                >
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
