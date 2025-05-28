import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2"; // 👈 importa SweetAlert2
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ParticiparPage from "./pages/ParticiparPage";
import PerfilPage from "./pages/PerfilPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import FeedPage from "./pages/FeedPage";
import RewardsPage from "./pages/RewardsPage";
import CalendarPage from "./pages/CalendarPage";
import RegisterPage from "./pages/RegisterPage";
import RutaProtegida from "./components/RutaProtegida";
import RutaPublica from "./components/RutaPublica";
import ConfiguracionPage from "./pages/ConfiguracionPage";
import EstadisticasPage from "./pages/EstadisticasPage";
import EvidenciasPage from "./pages/EvidenciasPage";
import RutaAdmin from "./components/RutaAdmin";
import EstadisticasAdminPage from "./pages/EstadisticasAdminPage";
import InsigniasPage from "./pages/InsigniasPage";
import FeedParents from "./pages/FeedParents";
import RutaPadre from "./components/RutaPadre";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      logout("Token inválido. Por favor, inicia sesión nuevamente.");
      return;
    }

    const expMs   = payload.exp * 1000;
    const nowMs   = Date.now();
    const timeout = expMs - nowMs;

    if (timeout <= 0) {
      logout("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      return;
    }

    const timer = setTimeout(() => {
      logout("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
    }, timeout);

    return () => clearTimeout(timer);
  }, []);

  const logout = (message) => {
    Cookies.remove("token", { path: "/" });
    Swal.fire({
      icon: "info",
      title: "Sesión expirada",
      text: message,
      confirmButtonText: "Iniciar sesión",
      allowOutsideClick: false,
    }).then(() => {
      navigate("/");
    });
  };

  return (
    <Routes>
      <Route path="/" element={<RutaPublica><LoginPage /></RutaPublica>} />
      <Route path="/dashboard" element={<RutaProtegida> <DashboardPage /></RutaProtegida>} />
      <Route path="/participar" element={<RutaProtegida> <ParticiparPage /></RutaProtegida>} />
      <Route path="/perfil" element={<RutaProtegida> <PerfilPage /></RutaProtegida>} />
      <Route path="/perfil/:userId" element={<RutaProtegida> <PublicProfilePage /></RutaProtegida>} />
      <Route path="/publicaciones" element={<RutaProtegida> <FeedPage /></RutaProtegida>} />
      <Route path="/recompensas" element={<RutaProtegida> <RewardsPage /></RutaProtegida>} />
      <Route path="/calendario" element={<RutaProtegida> <CalendarPage /></RutaProtegida>} />
      <Route path="/registro" element={<RutaPublica><RegisterPage /></RutaPublica>} />
      <Route path="/configuracion" element={<RutaAdmin> <ConfiguracionPage /></RutaAdmin>} />
      <Route path="/estadisticas" element={<RutaProtegida> <EstadisticasPage /></RutaProtegida>} />
      <Route path="/evidencias" element={<RutaAdmin> <EvidenciasPage /></RutaAdmin>} />
      <Route path="/estadisticas-admin" element={<RutaAdmin> <EstadisticasAdminPage /></RutaAdmin>} />
      <Route path="/insignias" element={<RutaProtegida> <InsigniasPage /></RutaProtegida>} />
      <Route path="/publicacionesp" element={<RutaPadre> <FeedParents /></RutaPadre>} />
    </Routes>
  );
}

export default App;
