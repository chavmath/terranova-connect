// src/components/RutaProtegida.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const RutaProtegida = ({ children }) => {
  if (!isLoggedIn()) {
    // Si no está autenticado o el token expiró, va al login
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RutaProtegida;
