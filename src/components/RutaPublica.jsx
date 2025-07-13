import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const RutaPublica = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default RutaPublica;
