interface PlatformReadyOverlayProps {
  visible: boolean;
  progress: number;
}

const finalChecks = [
  "Routing engine synchronized",
  "Telemetry stream verified",
  "Cache intelligence loaded",
  "Security session approved",
];

export default function PlatformReadyOverlay({
  visible,
  progress,
}: PlatformReadyOverlayProps) {
  const complete = progress >= 96;

  const statusText =
    progress < 28
      ? "Locking platform state"
      : progress < 58
        ? "Verifying control plane"
        : progress < 84
          ? "Opening live workspace"
          : "Workspace ready";

  return (
    <section
      className={[
        "platform-ready-overlay",
        visible ? "is-visible" : "",
        complete ? "is-complete" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      <div
        className="platform-ready-backdrop-grid"
        aria-hidden="true"
      />

      <div
        className="platform-ready-orbit platform-ready-orbit-one"
        aria-hidden="true"
      />

      <div
        className="platform-ready-orbit platform-ready-orbit-two"
        aria-hidden="true"
      />

      <div className="platform-ready-card">
        <header className="platform-ready-card-header">
          <div>
            <span>FINAL HANDOFF</span>
            <strong>Control plane verified</strong>
            <small>
              EdgeMind is ready to enter the live workspace
            </small>
          </div>

          <div className="platform-ready-session">
            <span>SESSION</span>
            <strong>7F3A-EDGE</strong>
            <small>SECURE · VERIFIED</small>
          </div>
        </header>

        <div className="platform-ready-body">
          <div className="platform-ready-emblem">
            <span className="platform-ready-emblem-ring" />
            <span className="platform-ready-emblem-ring-inner" />

            <div className="platform-ready-emblem-core">
              <i>✓</i>
            </div>

            <small>
              {complete ? "READY" : "VERIFYING"}
            </small>
          </div>

          <div className="platform-ready-details">
            <div className="platform-ready-checks">
              {finalChecks.map((check, index) => {
                const threshold =
                  18 + index * 19;

                const checked =
                  progress >= threshold;

                return (
                  <div
                    key={check}
                    className={[
                      "platform-ready-check",
                      checked ? "is-checked" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>
                      {checked ? "✓" : ""}
                    </span>

                    <strong>{check}</strong>

                    <small>
                      {checked ? "PASS" : "WAIT"}
                    </small>
                  </div>
                );
              })}
            </div>

            <div className="platform-ready-stats">
              <article>
                <span>MODULES</span>
                <strong>5 / 5</strong>
                <small>online</small>
              </article>

              <article>
                <span>EDGE NODES</span>
                <strong>33</strong>
                <small>available</small>
              </article>

              <article>
                <span>LATENCY</span>
                <strong>12 ms</strong>
                <small>optimized</small>
              </article>

              <article>
                <span>CACHE HIT</span>
                <strong>94.8%</strong>
                <small>global</small>
              </article>
            </div>
          </div>
        </div>

        <footer className="platform-ready-card-footer">
          <div>
            <span>{statusText}</span>

            <strong>
              {String(
                Math.min(100, Math.round(progress)),
              ).padStart(3, "0")}
              %
            </strong>
          </div>

          <div className="platform-ready-progress-track">
            <span
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, progress),
                )}%`,
              }}
            />
          </div>

          <small>
            {complete
              ? "Entering EdgeMind platform"
              : "Please stand by"}
          </small>
        </footer>
      </div>

      <div
        className="platform-ready-launch-line"
        aria-hidden="true"
      />

      <div
        className="platform-ready-complete-flash"
        aria-hidden="true"
      />
    </section>
  );
}