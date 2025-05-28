import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, getUserRole } from "../utils/auth";

const RutaPadre = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  const rol = getUserRole();
  if (rol !== "representante") {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RutaPadre;
