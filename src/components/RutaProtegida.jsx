import React from "react";
import { Navigate } from "react-router-dom";

const RutaProtegida = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || usuario.estado !== "activo") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaProtegida;
