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
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevaContrasenia, setNuevaContrasenia] = useState("");
  const [codigoRecuperacion, setCodigoRecuperacion] = useState("");
  /* const [nuevoCodigo] = useState(""); */
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState(false);
  const [loadingCambiarContrasenia, setLoadingCambiarContrasenia] =
    useState(false);

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
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

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
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/2fa",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ correo: correoTemporal, codigo }),
        }
      );

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
          if (rol === "administrador") {
            window.location.href = "/configuracion";
          } else if (rol === "representante") {
            window.location.href = "/dashboard";
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
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ codigo: adminCode }),
        }
      );

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        const token = data.usuario?.token;
        if (!token) throw new Error("Token no recibido");

        Cookies.set("token", token, {
          path: "/",
          sameSite: "Lax",
          secure: false,
          expires: 1,
        });

        window.location.href = "/configuracion";
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

  const handleRecuperarContrasenia = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Cargando...",
      text: "Enviando el código al correo",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/solicitar-cambio-contrasenia",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: nuevoCorreo }),
        }
      );

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Correo enviado",
          text:
            data.message || "Revisa tu correo para el código de recuperación.",
        }).then(() => {
          setMostrarModal(true);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo enviar el código.",
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

  const handleCambiarContrasenia = async (e) => {
    e.preventDefault();
    setLoadingCambiarContrasenia(true);

    /*if (nuevoCodigo !== codigoRecuperacion) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El código ingresado es incorrecto",
      });
      return;
    }*/

    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/cambiar-contrasenia",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: nuevoCorreo,
            codigo: codigoRecuperacion,
            contrasenia: nuevaContrasenia,
          }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Contraseña cambiada",
          text: "Tu contraseña ha sido actualizada exitosamente.",
        }).then(() => {
          window.location.href = "/";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo cambiar la contraseña.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "Hubo un error al cambiar la contraseña." + error,
      });
    } finally {
      setLoadingCambiarContrasenia(false);
    }
  };

  const handleRecuperarCodigoAdmin = () => {
    setMostrarModalAdmin(true);
  };

  const handleRecuperarCodigoAdminSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Cargando...",
      text: "Solicitando un nuevo código de administrador",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch(
        "https://kong-0c858408d8us2s9oc.kongcloud.dev/solicitar-nuevo-codigo-admin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: nuevoCorreo }),
        }
      );

      const data = await res.json();
      Swal.close();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Nuevo código enviado",
          text:
            data.message ||
            "Se ha enviado un nuevo código de administrador al correo.",
        });
        setMostrarModalAdmin(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo generar el nuevo código.",
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "Hubo un error al solicitar el código de administrador." + error,
      });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left" />
      <div className="login-right">
        <img src={logo} alt="logo" className="logo" />
        <h1>COLEGIO TERRANOVA</h1>

        {/* Login */}
        {!mostrarCodigo && !mostrarAdminForm && !mostrarRecuperacion && (
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

            <button
              className="register-button"
              onClick={() => (window.location.href = "/registro")}
            >
              ¿Nuevo Usuario? Crea una cuenta
            </button>

            <button
              className="admin-button"
              onClick={() => setMostrarAdminForm(true)}
            >
              ¿Administrador? Presione Aquí
            </button>

            <button
              className="recuperar-button"
              onClick={() => setMostrarRecuperacion(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}

        {/* Código 2FA */}
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
            <button
              className="back-button"
              onClick={() => setMostrarCodigo(false)}
            >
              Regresar
            </button>
          </form>
        )}

        {/* Recuperar Contraseña */}
        {mostrarRecuperacion && (
          <form onSubmit={handleRecuperarContrasenia}>
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={nuevoCorreo}
              onChange={(e) => setNuevoCorreo(e.target.value)}
              required
            />
            <button type="submit">Solicitar código de recuperación</button>
            <button
              className="back-button"
              onClick={() => setMostrarRecuperacion(false)}
            >
              Regresar
            </button>
          </form>
        )}

        {/* Admin Login */}
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

            <button
              className="recover-admin-button"
              onClick={handleRecuperarCodigoAdmin}
            >
              Recuperar código de administrador
            </button>

            <button
              className="back-button"
              onClick={() => setMostrarAdminForm(false)}
            >
              Regresar
            </button>
          </form>
        )}

        {/* Modal para cambiar contraseña */}
        {mostrarModal && (
          <div className="modal-login-overlay">
            <div className="modal-login">
              <h3>Cambiar Contraseña</h3>
              <form onSubmit={handleCambiarContrasenia}>
                <label htmlFor="codigoRecuperacion">
                  Código de recuperación
                </label>
                <input
                  type="text"
                  id="codigoRecuperacion"
                  value={codigoRecuperacion}
                  onChange={(e) => setCodigoRecuperacion(e.target.value)}
                  required
                />

                <label htmlFor="nuevaContrasenia">Nueva contraseña</label>
                <input
                  type="password"
                  id="nuevaContrasenia"
                  value={nuevaContrasenia}
                  onChange={(e) => setNuevaContrasenia(e.target.value)}
                  required
                />

                <button type="submit" disabled={loadingCambiarContrasenia}>
                  {loadingCambiarContrasenia ? (
                    <span className="loader-button"></span>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </button>

                <button type="button" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal para recuperar código de administrador */}
        {mostrarModalAdmin && (
          <div className="modal-login-overlay">
            <div className="modal-login">
              <h3>Recuperar código de administrador</h3>
              <form onSubmit={handleRecuperarCodigoAdminSubmit}>
                <label htmlFor="nuevoCorreoAdmin">
                  Correo del administrador
                </label>
                <input
                  type="email"
                  id="nuevoCorreoAdmin"
                  value={nuevoCorreo}
                  onChange={(e) => setNuevoCorreo(e.target.value)}
                  required
                />
                <button type="submit">Enviar código</button>
                <button
                  type="button"
                  onClick={() => setMostrarModalAdmin(false)}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
