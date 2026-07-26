import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import SplashScreen from "./components/splash/SplashScreen";
import AppRouter from "./routes/AppRouter";
import "./App.css";
import "./typography.css";

const INTRO_STORAGE_KEY =
  "edgemind-signal-played";

function shouldShowIntroOnLoad(
  pathname: string,
) {
  if (pathname !== "/") {
    return false;
  }

  const query = new URLSearchParams(
    window.location.search,
  );

  const forcedByQuery =
    query.get("intro") === "1";

  if (
    import.meta.env.DEV ||
    forcedByQuery
  ) {
    return true;
  }

  return (
    sessionStorage.getItem(
      INTRO_STORAGE_KEY,
    ) !== "true"
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showSplash, setShowSplash] =
    useState(() =>
      shouldShowIntroOnLoad(
        window.location.pathname,
      ),
    );

  const [splashKey, setSplashKey] =
    useState(0);

  useEffect(() => {
    if (
      location.pathname !== "/" &&
      showSplash
    ) {
      setShowSplash(false);
    }
  }, [
    location.pathname,
    showSplash,
  ]);

  const completeSplash = useCallback(() => {
    sessionStorage.setItem(
      INTRO_STORAGE_KEY,
      "true",
    );

    setShowSplash(false);
  }, []);

  const replayIntro = useCallback(() => {
    sessionStorage.removeItem(
      INTRO_STORAGE_KEY,
    );

    navigate("/");

    setSplashKey(
      (currentValue) =>
        currentValue + 1,
    );

    setShowSplash(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [navigate]);

  if (
    location.pathname === "/" &&
    showSplash
  ) {
    return (
      <SplashScreen
        key={splashKey}
        onComplete={completeSplash}
      />
    );
  }

  return (
    <AppRouter
      onReplayIntro={replayIntro}
    />
  );
}
