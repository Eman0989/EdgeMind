import {
  Route,
  Routes,
} from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import SimulatorPage from "../pages/SimulatorPage";
import SimulationsPage from "../pages/SimulationsPage";
import SettingsPage from "../pages/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";

interface AppRouterProps {
  onReplayIntro: () => void;
}

export default function AppRouter({
  onReplayIntro,
}: AppRouterProps) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onReplayIntro={
              onReplayIntro
            }
          />
        }
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/dashboard"
        element={<DashboardPage />}
      />

      <Route
        path="/simulator"
        element={<SimulatorPage />}
      />

      <Route
        path="/simulations"
        element={<SimulationsPage />}
      />

      <Route
        path="/settings"
        element={<SettingsPage />}
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}
