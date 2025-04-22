// src/components/RutaPublica.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const RutaPublica = ({ children }) => {
  if (isLoggedIn()) {
    // Si ya está logueado, no puede ver la página pública
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default RutaPublica;
