// src/components/RutaProtegida.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, getUserRole } from "../utils/auth";

const RutaProtegida = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  const rol = getUserRole();
  if (rol === "administrador") {
    // 🔒 Si es admin, redirige a su espacio
    return <Navigate to="/configuracion" replace />;
  }

  return children;
};

export default RutaProtegida;
