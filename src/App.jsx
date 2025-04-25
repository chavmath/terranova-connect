import { Routes, Route } from "react-router-dom";
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

function App() {
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
    </Routes>
  );
}

export default App;
