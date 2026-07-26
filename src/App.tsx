import {
  useCallback,
  useState,
} from "react";
import SplashScreen from "./components/splash/SplashScreen";
import LandingPage from "./pages/LandingPage";
import "./App.css";
import "./typography.css";

const INTRO_STORAGE_KEY =
  "edgemind-signal-played";

function shouldShowIntroOnLoad() {
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
  const [showSplash, setShowSplash] =
    useState(shouldShowIntroOnLoad);

  const [splashKey, setSplashKey] =
    useState(0);

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

    setSplashKey(
      (currentValue) =>
        currentValue + 1,
    );

    setShowSplash(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  if (showSplash) {
    return (
      <SplashScreen
        key={splashKey}
        onComplete={completeSplash}
      />
    );
  }

  return (
    <LandingPage
      onReplayIntro={replayIntro}
    />
  );
}