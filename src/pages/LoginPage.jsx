import React, { useState } from "react";
import "../styles/login.css";
import logo from "../assets/logo_azul.png";
import Swal from "sweetalert2";

const LoginPage = () => {
  const [form, setForm] = useState({ correo: "", contrasenia: "" });
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [correoTemporal, setCorreoTemporal] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Cargando...",
      text: "Verificando tus credenciales",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire({
          icon: "info",
          title: "Verificación requerida",
          text: data.message || "Te enviamos un código por correo",
        });

        setCorreoTemporal(form.correo);
        setMostrarCodigo(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Credenciales incorrectas",
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "Inténtalo más tarde",
      });
    }
  };

  const handleCodigoSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Cargando...",
      text: "Verificando el código",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("http://localhost:3000/api/2fa", {
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
          title: "¡Bienvenido!",
          text: "Acceso concedido",
        }).then(() => {
          window.location.href = "/dashboard";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Código inválido",
          text: data.message || "Verifica e intenta nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al confirmar 2FA:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo verificar el código",
      });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left" />
      <div className="login-right">
        <img src={logo} alt="logo" className="logo" />
        <h1>COLEGIO TERRANOVA</h1>

        {!mostrarCodigo ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="correo"
              placeholder="Correo Electrónico"
              value={form.correo}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="contrasenia"
              placeholder="************"
              value={form.contrasenia}
              onChange={handleChange}
              required
            />
            <button type="submit">Iniciar sesión</button>
          </form>
        ) : (
          <form onSubmit={handleCodigoSubmit}>
            <input
              type="text"
              name="codigo"
              placeholder="Ingresa el código 2FA"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <button type="submit">Confirmar código</button>
          </form>
        )}

        {/* <button className="microsoft-button">
          <img src="https://img.icons8.com/color/24/000000/microsoft.png" />
          Sign in with Microsoft
        </button> */}
        <a href="/registro">¿Nuevo Usuario? Crea una cuenta</a>
      </div>
    </div>
  );
};

export default LoginPage;
