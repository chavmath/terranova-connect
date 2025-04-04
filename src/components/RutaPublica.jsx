import React from "react";
import { Navigate } from "react-router-dom";

const RutaPublica = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario && usuario.estado === "activo") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RutaPublica;
