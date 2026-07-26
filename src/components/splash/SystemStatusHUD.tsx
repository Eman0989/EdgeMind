interface SystemStatusHUDProps {
  progress: number;
  durationMs: number;
}

interface SceneStatus {
  number: string;
  phase: string;
  state: string;
  metricLabel: string;
  metricValue: string;
}

const sceneStatuses: Array<{
  start: number;
  end: number;
  status: SceneStatus;
}> = [
  {
    start: 0,
    end: 7,
    status: {
      number: "01",
      phase: "CONNECT",
      state: "Establishing handshake",
      metricLabel: "LINK",
      metricValue: "PENDING",
    },
  },
  {
    start: 7,
    end: 23,
    status: {
      number: "02",
      phase: "MAP",
      state: "Building global topology",
      metricLabel: "NODES",
      metricValue: "33 ONLINE",
    },
  },
  {
    start: 23,
    end: 34,
    status: {
      number: "03",
      phase: "IDENTIFY",
      state: "Resolving EdgeMind identity",
      metricLabel: "STATE",
      metricValue: "VERIFIED",
    },
  },
  {
    start: 34,
    end: 61,
    status: {
      number: "04",
      phase: "DELIVER",
      state: "Tracing optimized request",
      metricLabel: "LATENCY",
      metricValue: "12 MS",
    },
  },
  {
    start: 61,
    end: 74,
    status: {
      number: "05",
      phase: "ANALYZE",
      state: "Validating model decision",
      metricLabel: "CONFIDENCE",
      metricValue: "96%",
    },
  },
  {
    start: 74,
    end: 80,
    status: {
      number: "06",
      phase: "RETURN",
      state: "Returning cached response",
      metricLabel: "STATUS",
      metricValue: "200 OK",
    },
  },
  {
    start: 80,
    end: 101,
    status: {
      number: "07",
      phase: "ARRIVE",
      state: "Initializing live workspace",
      metricLabel: "MODULES",
      metricValue: "5 / 5",
    },
  },
];

function formatTime(milliseconds: number) {
  const totalSeconds = Math.max(
    0,
    milliseconds / 1000,
  );

  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds = Math.floor(
    totalSeconds % 60,
  );

  const centiseconds = Math.floor(
    (totalSeconds % 1) * 100,
  );

  return `${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(
    2,
    "0",
  )}:${String(centiseconds).padStart(
    2,
    "0",
  )}`;
}

export default function SystemStatusHUD({
  progress,
  durationMs,
}: SystemStatusHUDProps) {
  const currentScene =
    sceneStatuses.find(
      (scene) =>
        progress >= scene.start &&
        progress < scene.end,
    ) ?? sceneStatuses[sceneStatuses.length - 1];

  const elapsedMs =
    (Math.min(100, progress) / 100) *
    durationMs;

  return (
    <aside
      className="system-status-hud"
      aria-label="Current introduction status"
    >
      <div className="system-status-phase">
        <span>{currentScene.status.number}</span>

        <div>
          <strong>
            {currentScene.status.phase}
          </strong>

          <small>
            {currentScene.status.state}
          </small>
        </div>
      </div>

      <div className="system-status-divider" />

      <div className="system-status-metric">
        <span>
          {currentScene.status.metricLabel}
        </span>

        <strong>
          {currentScene.status.metricValue}
        </strong>
      </div>

      <div className="system-status-divider" />

      <div className="system-status-time">
        <span>ELAPSED</span>

        <strong>
          {formatTime(elapsedMs)}
        </strong>
      </div>

      <div
        className="system-status-progress"
        aria-hidden="true"
      >
        <span
          style={{
            width: `${Math.min(
              100,
              Math.max(0, progress),
            )}%`,
          }}
        />
      </div>
    </aside>
  );
}