interface PlatformArrivalProps {
  progress: number;
}

interface BootModule {
  name: string;
  detail: string;
  threshold: number;
}

interface MapNode {
  code: string;
  city: string;
  latency: string;
  status: "healthy" | "selected" | "watch";
  x: number;
  y: number;
  detail: string;
}

const bootModules: BootModule[] = [
  {
    name: "ROUTING ENGINE",
    detail: "Global route state",
    threshold: 16,
  },
  {
    name: "TELEMETRY CORE",
    detail: "Live request stream",
    threshold: 34,
  },
  {
    name: "CACHE INTELLIGENCE",
    detail: "Edge cache model",
    threshold: 52,
  },
  {
    name: "EDGE MAP",
    detail: "Regional node graph",
    threshold: 70,
  },
  {
    name: "SECURITY GATE",
    detail: "Session verification",
    threshold: 88,
  },
];

const mapNodes: MapNode[] = [
  {
    code: "WAW",
    city: "Warsaw",
    latency: "7 ms",
    status: "healthy",
    x: 10,
    y: 68,
    detail: "Ingress · 4.1K req/s",
  },
  {
    code: "FRA",
    city: "Frankfurt",
    latency: "9 ms",
    status: "selected",
    x: 31,
    y: 34,
    detail: "Selected edge · Cache HIT",
  },
  {
    code: "LON",
    city: "London",
    latency: "12 ms",
    status: "selected",
    x: 50,
    y: 57,
    detail: "Active relay · 96% confidence",
  },
  {
    code: "NYC",
    city: "New York",
    latency: "41 ms",
    status: "watch",
    x: 69,
    y: 27,
    detail: "Elevated load · 72% capacity",
  },
  {
    code: "SIN",
    city: "Singapore",
    latency: "86 ms",
    status: "healthy",
    x: 88,
    y: 59,
    detail: "Long-haul fallback · Healthy",
  },
];

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

export default function PlatformArrival({
  progress,
}: PlatformArrivalProps) {
  const visible = progress >= 86;

  const bootProgress = Math.round(
    clamp(
      ((progress - 86) / 14) * 100,
      0,
      100,
    ),
  );

  const ready = bootProgress >= 96;

  const currentMessage =
    bootProgress < 18
      ? "Authenticating edge session"
      : bootProgress < 38
        ? "Hydrating live telemetry"
        : bootProgress < 58
          ? "Loading cache intelligence"
          : bootProgress < 78
            ? "Synchronizing edge map"
            : bootProgress < 96
              ? "Verifying platform state"
              : "Infrastructure ready";

  const onlineModuleCount =
    bootModules.filter(
      (module) =>
        bootProgress >= module.threshold,
    ).length;

  return (
    <section
      className={[
        "platform-arrival",
        "platform-arrival-upgraded",
        visible ? "is-visible" : "",
        ready ? "is-ready" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      <div
        className="platform-arrival-grid"
        aria-hidden="true"
      />

      <div
        className="platform-arrival-scan"
        aria-hidden="true"
      />

      <div
        className="platform-arrival-corners"
        aria-hidden="true"
      >
        <i />
        <i />
        <i />
        <i />
      </div>

      <header className="platform-arrival-header">
        <div className="platform-arrival-brand">
          <span className="platform-arrival-brand-dot" />

          <div>
            <span>EDGEMIND PLATFORM</span>

            <strong>
              Live infrastructure workspace
            </strong>
          </div>
        </div>

        <div className="platform-arrival-session">
          <span>SESSION</span>
          <strong>7F3A-EDGE</strong>
          <i />
          <span>STATUS</span>

          <strong>
            {ready ? "ONLINE" : "BOOTING"}
          </strong>
        </div>
      </header>

      <main className="platform-arrival-frame">
        <section className="platform-boot-panel">
          <div className="platform-boot-heading">
            <span>
              {ready
                ? "SYSTEM READY"
                : "PLATFORM INITIALIZATION"}
            </span>

            <strong>
              {ready
                ? "Control plane online"
                : currentMessage}
            </strong>

            <small>
              {ready
                ? "EdgeMind is ready to process live traffic"
                : "Preparing the live EdgeMind control plane"}
            </small>
          </div>

          <div className="platform-boot-progress">
            <div className="platform-boot-progress-copy">
              <span>
                {ready
                  ? "SYSTEM HEALTH"
                  : "BOOT SEQUENCE"}
              </span>

              <strong>
                {ready
                  ? "98%"
                  : `${String(
                      bootProgress,
                    ).padStart(3, "0")}%`}
              </strong>
            </div>

            <div className="platform-boot-progress-track">
              <span
                style={{
                  width: ready
                    ? "98%"
                    : `${bootProgress}%`,
                }}
              />
            </div>
          </div>

          <div
            className={[
              "platform-module-list",
              ready ? "is-complete" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {bootModules.map(
              (module, index) => {
                const online =
                  bootProgress >=
                  module.threshold;

                const syncing =
                  !online &&
                  bootProgress >=
                    module.threshold - 15;

                return (
                  <article
                    key={module.name}
                    className={[
                      "platform-module",
                      online
                        ? "is-online"
                        : "",
                      syncing
                        ? "is-syncing"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="platform-module-index">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <div className="platform-module-copy">
                      <strong>
                        {module.name}
                      </strong>

                      <small>
                        {module.detail}
                      </small>
                    </div>

                    <span className="platform-module-status">
                      <i />

                      {online
                        ? "ONLINE"
                        : syncing
                          ? "SYNCING"
                          : "PENDING"}
                    </span>
                  </article>
                );
              },
            )}
          </div>

          <section
            className={[
              "platform-ready-summary",
              ready ? "is-visible" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label="System ready summary"
          >
            <header>
              <span className="platform-ready-check">
                ✓
              </span>

              <div>
                <strong>
                  {onlineModuleCount}/5 modules online
                </strong>

                <small>
                  Live traffic processing enabled
                </small>
              </div>
            </header>

            <dl>
              <div>
                <dt>Network health</dt>
                <dd>98%</dd>
              </div>

              <div>
                <dt>Selected route</dt>
                <dd>WAW → FRA → LON</dd>
              </div>

              <div>
                <dt>Average latency</dt>
                <dd>12 ms</dd>
              </div>

              <div>
                <dt>Cache efficiency</dt>
                <dd>94.8%</dd>
              </div>
            </dl>

            <div className="platform-ready-action">
              <span>
                AI ROUTING ACTIVE
              </span>

              <i />
            </div>
          </section>
        </section>

        <section className="platform-live-preview">
          <div className="platform-preview-header">
            <div>
              <span>
                LIVE INFRASTRUCTURE
              </span>

              <strong>
                Global edge overview
              </strong>
            </div>

            <span className="platform-preview-online">
              <i />
              NETWORK ONLINE
            </span>
          </div>

          <div className="platform-preview-metrics">
            <article>
              <span>REQUESTS</span>
              <strong>18.4K</strong>
              <small>per second · +8.2%</small>
            </article>

            <article>
              <span>CACHE HIT</span>
              <strong>94.8%</strong>
              <small>global average · +1.4%</small>
            </article>

            <article>
              <span>LATENCY</span>
              <strong>12 ms</strong>
              <small>optimized route · -6 ms</small>
            </article>
          </div>

          <div className="platform-preview-map">
            <div className="platform-map-grid" />

            <svg
              className="platform-map-svg"
              viewBox="0 0 1000 420"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="platformActiveRoute"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor="#7c6fff"
                  />

                  <stop
                    offset="48%"
                    stopColor="#2ee6d6"
                  />

                  <stop
                    offset="100%"
                    stopColor="#9ffcf3"
                  />
                </linearGradient>

                <filter
                  id="platformRouteGlow"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feGaussianBlur
                    stdDeviation="5"
                    result="blur"
                  />

                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                className="platform-route-shadow"
                d="
                  M 100 286
                  C 165 252, 244 178, 310 143
                  C 380 115, 444 222, 500 239
                  C 566 258, 628 154, 690 113
                  C 765 79, 824 205, 880 248
                "
              />

              <path
                className="platform-route-glow"
                d="
                  M 100 286
                  C 165 252, 244 178, 310 143
                  C 380 115, 444 222, 500 239
                  C 566 258, 628 154, 690 113
                  C 765 79, 824 205, 880 248
                "
              />

              <path
                id="platformRoutePath"
                className="platform-route-main"
                d="
                  M 100 286
                  C 165 252, 244 178, 310 143
                  C 380 115, 444 222, 500 239
                  C 566 258, 628 154, 690 113
                  C 765 79, 824 205, 880 248
                "
              />

              <path
                className="platform-route-highlight"
                d="
                  M 100 286
                  C 165 252, 244 178, 310 143
                  C 380 115, 444 222, 500 239
                  C 566 258, 628 154, 690 113
                  C 765 79, 824 205, 880 248
                "
              />

              <circle
                className="platform-route-pulse pulse-one"
                r="5"
              >
                <animateMotion
                  dur="3.8s"
                  repeatCount="indefinite"
                  path="
                    M 100 286
                    C 165 252, 244 178, 310 143
                    C 380 115, 444 222, 500 239
                    C 566 258, 628 154, 690 113
                    C 765 79, 824 205, 880 248
                  "
                />
              </circle>

              <circle
                className="platform-route-pulse pulse-two"
                r="3.4"
              >
                <animateMotion
                  begin="1.45s"
                  dur="3.8s"
                  repeatCount="indefinite"
                  path="
                    M 100 286
                    C 165 252, 244 178, 310 143
                    C 380 115, 444 222, 500 239
                    C 566 258, 628 154, 690 113
                    C 765 79, 824 205, 880 248
                  "
                />
              </circle>
            </svg>

            {mapNodes.map((node) => (
              <button
                key={node.code}
                type="button"
                className={[
                  "platform-map-node-card",
                  `is-${node.status}`,
                ].join(" ")}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
                aria-label={`${node.city}, ${node.latency}, ${node.detail}`}
              >
                <span className="platform-node-ring" />
                <i />

                <strong>
                  {node.code}
                </strong>

                <small>
                  {node.latency}
                </small>

                <span className="platform-node-tooltip">
                  <b>{node.city}</b>
                  <em>{node.detail}</em>
                </span>
              </button>
            ))}

            <div className="platform-map-route-status">
              <span>
                ACTIVE ROUTE
              </span>

              <strong>
                WAW → FRA → LON
              </strong>

              <small>
                12 ms · cache optimized · 96% confidence
              </small>
            </div>

            <div className="platform-map-legend">
              <span>
                <i className="is-selected" />
                Selected
              </span>

              <span>
                <i />
                Healthy
              </span>

              <span>
                <i className="is-watch" />
                Watch
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="platform-arrival-footer">
        <span>
          {ready
            ? "ALL SYSTEMS OPERATIONAL"
            : "INITIALIZING CONTROL PLANE"}
        </span>

        <div>
          <i />

          <strong>
            {ready
              ? "LIVE WORKSPACE READY"
              : currentMessage.toUpperCase()}
          </strong>
        </div>
      </footer>

      <div
        className="platform-arrival-ready-flash"
        aria-hidden="true"
      />
    </section>
  );
}