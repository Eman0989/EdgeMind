import {
  useEffect,
  useRef,
  type CSSProperties,
} from "react";

interface CinematicDepthLayerProps {
  progress: number;
}

interface DepthParticle {
  left: number;
  top: number;
  size: number;
  opacity: number;
  delay: number;
  layer: "far" | "mid" | "near";
}

const particles: DepthParticle[] =
  Array.from({ length: 30 }, (_, index) => {
    const layer =
      index % 5 === 0
        ? "near"
        : index % 2 === 0
          ? "mid"
          : "far";

    return {
      left: 4 + ((index * 37) % 92),
      top: 7 + ((index * 53) % 84),
      size:
        layer === "near"
          ? 2.6
          : layer === "mid"
            ? 2
            : 1.4,
      opacity:
        layer === "near"
          ? 0.42
          : layer === "mid"
            ? 0.28
            : 0.17,
      delay: (index % 10) * 0.22,
      layer,
    };
  });

function getDepthPhase(progress: number) {
  if (progress < 7) {
    return "connect";
  }

  if (progress < 23) {
    return "map";
  }

  if (progress < 34) {
    return "identify";
  }

  if (progress < 61) {
    return "deliver";
  }

  if (progress < 74) {
    return "analyze";
  }

  if (progress < 80) {
    return "return";
  }

  return "arrive";
}

export default function CinematicDepthLayer({
  progress,
}: CinematicDepthLayerProps) {
  const layerRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layer = layerRef.current;

    if (!layer) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const finePointer =
      window.matchMedia(
        "(pointer: fine)",
      ).matches;

    if (reducedMotion || !finePointer) {
      layer.style.setProperty(
        "--pointer-x",
        "50%",
      );

      layer.style.setProperty(
        "--pointer-y",
        "48%",
      );

      return;
    }

    let frameId = 0;

    let targetX = 0.5;
    let targetY = 0.48;

    let currentX = targetX;
    let currentY = targetY;

    const updateTarget = (
      event: PointerEvent,
    ) => {
      targetX =
        event.clientX /
        Math.max(1, window.innerWidth);

      targetY =
        event.clientY /
        Math.max(1, window.innerHeight);
    };

    const resetTarget = () => {
      targetX = 0.5;
      targetY = 0.48;
    };

    const animate = () => {
      currentX +=
        (targetX - currentX) * 0.075;

      currentY +=
        (targetY - currentY) * 0.075;

      const horizontal =
        currentX - 0.5;

      const vertical =
        currentY - 0.5;

      layer.style.setProperty(
        "--pointer-x",
        `${currentX * 100}%`,
      );

      layer.style.setProperty(
        "--pointer-y",
        `${currentY * 100}%`,
      );

      layer.style.setProperty(
        "--depth-near-x",
        `${horizontal * -24}px`,
      );

      layer.style.setProperty(
        "--depth-near-y",
        `${vertical * -18}px`,
      );

      layer.style.setProperty(
        "--depth-mid-x",
        `${horizontal * -13}px`,
      );

      layer.style.setProperty(
        "--depth-mid-y",
        `${vertical * -10}px`,
      );

      layer.style.setProperty(
        "--depth-far-x",
        `${horizontal * -6}px`,
      );

      layer.style.setProperty(
        "--depth-far-y",
        `${vertical * -5}px`,
      );

      layer.style.setProperty(
        "--depth-tilt-x",
        `${vertical * -1.7}deg`,
      );

      layer.style.setProperty(
        "--depth-tilt-y",
        `${horizontal * 2.1}deg`,
      );

      frameId =
        window.requestAnimationFrame(
          animate,
        );
    };

    window.addEventListener(
      "pointermove",
      updateTarget,
      { passive: true },
    );

    document.documentElement.addEventListener(
      "mouseleave",
      resetTarget,
    );

    frameId =
      window.requestAnimationFrame(
        animate,
      );

    return () => {
      window.removeEventListener(
        "pointermove",
        updateTarget,
      );

      document.documentElement.removeEventListener(
        "mouseleave",
        resetTarget,
      );

      window.cancelAnimationFrame(
        frameId,
      );
    };
  }, []);

  const phase =
    getDepthPhase(progress);

  const groupedParticles = {
    far: particles.filter(
      (particle) =>
        particle.layer === "far",
    ),
    mid: particles.filter(
      (particle) =>
        particle.layer === "mid",
    ),
    near: particles.filter(
      (particle) =>
        particle.layer === "near",
    ),
  };

  return (
    <div
      ref={layerRef}
      className={[
        "cinematic-depth-layer",
        `is-${phase}`,
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="cinematic-depth-grid" />

      <div className="cinematic-depth-light cinematic-depth-light-primary" />

      <div className="cinematic-depth-light cinematic-depth-light-secondary" />

      <div className="cinematic-depth-horizon">
        <span />
        <i />
      </div>

      {(
        [
          "far",
          "mid",
          "near",
        ] as const
      ).map((group) => (
        <div
          key={group}
          className={[
            "cinematic-depth-particles",
            `is-${group}`,
          ].join(" ")}
        >
          {groupedParticles[
            group
          ].map(
            (
              particle,
              index,
            ) => (
              <i
                key={`${group}-${index}`}
                style={
                  {
                    "--depth-particle-left":
                      `${particle.left}%`,
                    "--depth-particle-top":
                      `${particle.top}%`,
                    "--depth-particle-size":
                      `${particle.size}px`,
                    "--depth-particle-opacity":
                      particle.opacity,
                    "--depth-particle-delay":
                      `${particle.delay}s`,
                  } as CSSProperties
                }
              />
            ),
          )}
        </div>
      ))}

      <div className="cinematic-focus-frame">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="cinematic-pointer-reticle">
        <span />
        <i />
      </div>
    </div>
  );
}