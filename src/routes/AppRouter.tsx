import {
  Route,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";
import DashboardPage from "../pages/DashboardPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";
import SettingsPage from "../pages/SettingsPage";
import SimulationResultPage from "../pages/SimulationResultPage";
import SimulationsPage from "../pages/SimulationsPage";
import SimulatorPage from "../pages/SimulatorPage";

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
            onReplayIntro={onReplayIntro}
          />
        }
      />

      <Route
        element={<PublicOnlyRoute />}
      >
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />
      </Route>

      <Route
        element={<ProtectedRoute />}
      >
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/simulator"
          element={<SimulatorPage />}
        />

        <Route
          path="/simulation-result"
          element={<SimulationResultPage />}
        />

        <Route
          path="/simulations"
          element={<SimulationsPage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}