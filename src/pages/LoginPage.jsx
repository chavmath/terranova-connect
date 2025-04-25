import React, { useState } from "react";
import "../styles/login.css";
import logo from "../assets/logo_azul.png";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { getUserRole } from "../utils/auth";

const LoginPage = () => {
  const [form, setForm] = useState({ correo: "", contrasenia: "" });
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [mostrarAdminForm, setMostrarAdminForm] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [correoTemporal, setCorreoTemporal] = useState("");
  const [adminCode, setAdminCode] = useState("");

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
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: ("Inténtalo más tarde", error),
      });
    }
  };

  const handleCodigoSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Cargando...",
      text: "Verificando el código",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch("http://localhost:3000/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ correo: correoTemporal, codigo }),
      });

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Cookies.set("token", data.usuario.token);
        const rawToken = Cookies.get("token");
        console.log("Token guardado:", rawToken);
        if (rawToken) {
          const payload = JSON.parse(
            atob(rawToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
          );
          console.log("Payload del token:", payload);
        }
        Swal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          text: "Acceso concedido",
        }).then(() => {
          const rol = getUserRole();
          if (rol === "admin") {
            window.location.href = "/configuracion"; // o cualquier ruta admin principal
          } else {
            window.location.href = "/dashboard";
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Código inválido",
          text: data.message || "Verifica e intenta nuevamente",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: ("No se pudo verificar el código", error),
      });
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Cargando...",
      text: "Validando código de administrador...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch("http://localhost:3000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ codigo: adminCode }),
      });

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        const token = data.usuario?.token;
        if (!token) throw new Error("Token no recibido");

        // Guardar cookie legible desde JS
        Cookies.set("token", token, {
          path: "/",
          sameSite: "Lax",
          secure: false, // true en producción con HTTPS
          expires: 1, // 1 día
        });

        window.location.href = "/configuracion"; // redirigir admin
      } else {
        Swal.fire({
          icon: "error",
          title: "Código inválido",
          text: data.message || "Verifica e intenta nuevamente",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: ("No se pudo verificar el código", error),
      });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left" />
      <div className="login-right">
        <img src={logo} alt="logo" className="logo" />
        <h1>COLEGIO TERRANOVA</h1>

        {!mostrarCodigo && !mostrarAdminForm && (
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
        )}

        {mostrarCodigo && !mostrarAdminForm && (
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

        {mostrarAdminForm && (
          <form onSubmit={handleAdminLogin}>
            <input
              type="text"
              name="adminCode"
              placeholder="Código de administrador"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              required
            />
            <button type="submit">Acceder como admin</button>
          </form>
        )}

        <a href="/registro">¿Nuevo Usuario? Crea una cuenta</a>
        <button
          className="admin-button"
          onClick={() => setMostrarAdminForm(true)}
        >
          ¿Administrador? Presione Aquí
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
