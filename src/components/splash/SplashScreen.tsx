import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import NetworkConstellation from "./NetworkConstellation";
import SignalJourney from "./SignalJourney";
import HyperspeedTransition from "./HyperspeedTransition";
import IntroPhaseTimeline from "./IntroPhaseTimeline";
import WordmarkFormation from "./WordmarkFormation";
import JourneyPortalTransition from "./JourneyPortalTransition";
import PlatformArrival from "./PlatformArrival";
import SystemStatusHUD from "./SystemStatusHUD";
import useCinematicAudio from "./useCinematicAudio";
import CinematicDepthLayer from "./CinematicDepthLayer";

interface SplashScreenProps {
  onComplete: () => void;
}

const INTRO_DURATION_MS = 30800;

export default function SplashScreen({
  onComplete,
}: SplashScreenProps) {

  const [progress, setProgress] =
    useState(0);

  const [isExiting, setIsExiting] =
    useState(false);

  const completionLockedRef =
    useRef(false);

  const {
    soundEnabled,
    soundState,
    toggleSound,
    stopSound,
  } = useCinematicAudio(progress);

  const finishIntro = useCallback(() => {
    if (completionLockedRef.current) {
      return;
    }

    completionLockedRef.current = true;

    sessionStorage.setItem(
      "edgemind-signal-played",
      "true",
    );

    setProgress(100);
    setIsExiting(true);
    stopSound();

    window.setTimeout(() => {
      onComplete();
    }, 420);
  }, [
    onComplete,
    stopSound,
  ]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const reducedTimer = window.setTimeout(
        finishIntro,
        900,
      );

      return () => {
        window.clearTimeout(reducedTimer);
      };
    }

    const startedAt = performance.now();

    const progressTimer = window.setInterval(() => {
      const elapsed =
        performance.now() - startedAt;

      const nextProgress = Math.min(
        100,
        Math.round(
          (elapsed / INTRO_DURATION_MS) * 100,
        ),
      );

      setProgress(nextProgress);
    }, 80);

    const completionTimer = window.setTimeout(
      finishIntro,
      INTRO_DURATION_MS,
    );

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(completionTimer);
    };
  }, [finishIntro]);

  const handleSkip = () => {
    finishIntro();
  };

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        finishIntro();
        return;
      }

      if (
        event.key.toLowerCase() === "m" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        toggleSound();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
    };
  }, [
    finishIntro,
    toggleSound,
  ]);

  return (
    <div
      className={[
        "signal-splash",
        isExiting ? "is-exiting" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="EdgeMind cinematic introduction"
    >
      <div
        className="signal-noise"
        aria-hidden="true"
      />

      <div
        className="signal-vignette"
        aria-hidden="true"
      />

      <CinematicDepthLayer
        progress={progress}
      />

      <header className="signal-topbar">
        <div className="signal-brand-status">
          <span className="status-light" />
          <span>EDGEMIND NETWORK</span>
        </div>

        <div className="signal-buttons">
          <button
            type="button"
            className={[
              "signal-button",
              "signal-sound-button",
              soundEnabled
                ? "is-active"
                : "",
              soundState === "unavailable"
                ? "is-unavailable"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            disabled={
              soundState === "starting"
            }
          >
            <span
              className="signal-sound-meter"
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </span>

            <span>
              {soundState === "starting"
                ? "Starting"
                : soundState ===
                    "unavailable"
                  ? "Audio unavailable"
                  : soundEnabled
                    ? "Sound on"
                    : "Sound off"}
            </span>

            <kbd>M</kbd>
          </button>

          <button
            type="button"
            className="signal-button signal-skip"
            onClick={handleSkip}
          >
            <span>Skip intro</span>
            <kbd>Esc</kbd>
          </button>
        </div>
      </header>

      <SystemStatusHUD
        progress={progress}
        durationMs={INTRO_DURATION_MS}
      />

      <main className="signal-main">
        <section className="cold-open-scene">
          <div className="origin-pulse-wrap">
            <span className="origin-pulse-ring" />
            <span className="origin-pulse-core" />
          </div>

          <div className="connection-message">
            establishing connection
            <span className="connection-dots">
              ...
            </span>
          </div>
        </section>

        <section className="network-animation-scene">
          <NetworkConstellation />

          <div className="network-status-copy">
            <span>
              GLOBAL ROUTING FABRIC
            </span>

            <strong>
              Network topology established
            </strong>

            <small>
              33 nodes / deterministic network online
            </small>
          </div>
        </section>

        <WordmarkFormation />
        <JourneyPortalTransition />

        <SignalJourney />
        <HyperspeedTransition />

        <PlatformArrival
          progress={progress}
        />
      </main>

      <div
        className="splash-completion-status"
        aria-live="polite"
      >
        {isExiting
          ? "Entering EdgeMind platform"
          : ""}
      </div>

      <footer className="signal-bottom">
        <IntroPhaseTimeline
          progress={progress}
        />
      </footer>
    </div>
  );
}