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


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/participar" element={<ParticiparPage />} />
      <Route path="/perfil" element={<PerfilPage />} />
      <Route path="/perfil/:username" element={<PublicProfilePage />} />
      <Route path="/publicaciones" element={<FeedPage />} />
      <Route path="/recompensas" element={<RewardsPage />} />
      <Route path="/calendario" element={<CalendarPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      {/* <Route path="/configuracion" element={<div>Configuración</div>} />
      <Route path="/estadisticas" element={<div>Estadísticas</div>} /> */}
    </Routes>
  );
}

export default App;
