import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, getUserRole } from "../utils/auth";

const RutaProtegida = ({ children }) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  const rol = getUserRole();

  if (rol === "administrador") {
    return <Navigate to="/configuracion" replace />;
  }
  if (rol === "representante") {
    if (
      location.pathname !== "/publicacionesp" &&
      location.pathname !== "/calendario" &&
      location.pathname !== "/dashboard"
    ) {
      return <Navigate to="/publicacionesp" replace />;
    }
  }
  if (rol === "profesor") {
    if (
      location.pathname !== "/publicaciones" &&
      location.pathname !== "/calendario" &&
      !location.pathname.startsWith("/perfil") &&
      location.pathname !== "/dashboard"
    ) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default RutaProtegida;
