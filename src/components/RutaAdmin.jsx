import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, getUserRole } from "../utils/auth";

const RutaAdmin = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    const role = getUserRole();
    setAccessGranted(loggedIn && role === "administrador");
    setLoading(false);
  }, []);

  if (loading) return null; // o un loader si prefieres

  return accessGranted ? children : <Navigate to="/dashboard" replace />;
};

export default RutaAdmin;
