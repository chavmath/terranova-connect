import React, { useState } from "react";
import "../styles/register.css";
import yellowPanel from "../assets/YellowSidePanel.png";
import Swal from "sweetalert2";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    fechaNacimiento: "",
    rol: "",
    archivo: null,
  });

  const [errors, setErrors] = useState({});
  const [codigo, setCodigo] = useState("");
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [correoTemporal, setCorreoTemporal] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "archivo") {
      setFormData({ ...formData, archivo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validarFormulario = () => {
    const errores = {};
  
    if (formData.password.length < 8) {
      errores.password = "Debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(formData.password)) {
      errores.password = "Debe contener al menos una letra mayúscula";
    } else if (!/[a-z]/.test(formData.password)) {
      errores.password = "Debe contener al menos una letra minúscula";
    } else if (!/[0-9]/.test(formData.password)) {
      errores.password = "Debe contener al menos un número";
    } else if (!/[@_#?¿&=¡!,+$*-]/.test(formData.password)) {
      errores.password = "Debe contener un carácter especial permitido";
    }
  
    if (!formData.rol) {
      errores.rol = "Debes seleccionar un rol";
    }
  
    return errores;
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erroresDetectados = validarFormulario();
    setErrors(erroresDetectados);

    if (Object.keys(erroresDetectados).length > 0) {
      Swal.fire({
        icon: "error",
        title: "Formulario inválido",
        text: "Corrige los errores marcados",
      });
      return;
    }

    const formToSend = new FormData();
    formToSend.append("nombre", formData.nombre);
    formToSend.append("apellido", formData.apellido);
    formToSend.append("correo", formData.correo);
    formToSend.append("contrasenia", formData.password);
    formToSend.append("fecha_nacimiento", formData.fechaNacimiento);
    formToSend.append("rol", formData.rol);
    if (formData.archivo) {
      formToSend.append("files", formData.archivo);
    }
    Swal.fire({
      title: "Cargando...",
      text: "Por favor espera",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 100)); // <- ¡importante!

    try {
      const response = await fetch("http://localhost:3000/register-temp", {
        method: "POST",
        body: formToSend,
        credentials: "include",
      });

      const data = await response.json();
      Swal.close();

      if (response.ok) {
        Swal.fire({
          icon: "info",
          title: "Verificación requerida",
          text: "Te enviamos un código de verificación al correo.",
        });

        setMostrarCodigo(true);
        setCorreoTemporal(formData.correo);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo procesar el registro.",
        });
      }
    } catch (error) {
      console.error("Error en registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "Inténtalo más tarde.",
      });
    }
  };

  const handleCodigoSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Cargando...",
      text: "Por favor espera",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("http://localhost:3000/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ correo: correoTemporal, codigo }),
      });

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        Swal.fire({
          icon: "success",
          title: "Registro completo",
          text: "Tu cuenta fue activada exitosamente.",
        }).then(() => {
          window.location.href = "/";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Código incorrecto",
          text: data.message || "Verifica el código e intenta de nuevo.",
        });
      }
    } catch (error) {
      console.error("Error al verificar código:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo verificar el código.",
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Registro</h2>

        {!mostrarCodigo ? (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />

            <div className="form-row">
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && (
                  <p className="error-text">{errors.password}</p>
                )}
              </div>
              <div className="form-group">
                <label>Fecha de nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Rol</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un rol</option>
              <option value="estudiante">Estudiante</option>
              <option value="profesor">Profesor</option>
              <option value="representante">Representante</option>
            </select>
            {errors.rol && <p className="error-text">{errors.rol}</p>}

            <label>Foto de perfil</label>
            <input
              type="file"
              name="archivo"
              accept="image/*"
              onChange={handleChange}
            />

            <button type="submit">Registrarse</button>
          </form>
        ) : (
          <form onSubmit={handleCodigoSubmit}>
            <label>Ingresa el código de verificación</label>
            <input
              type="text"
              name="codigo"
              placeholder="Código recibido por correo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <button type="submit">Verificar código</button>
          </form>
        )}
      </div>

      <div className="register-side-panel">
        <img
          src={yellowPanel}
          alt="Panel decorativo"
          className="register-image"
        />
      </div>
    </div>
  );
};

export default RegisterPage;
