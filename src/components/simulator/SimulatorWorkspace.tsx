import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import "./SimulatorWorkspace.css";

import type {
  AudienceRegion,
  CompletedSimulation,
  ContentType,
  OriginRegion,
  SimulationConfig,
  SimulationResult,
  TrafficProfile,
} from "../../types/simulation";
import {
  simulationService,
} from "../../services/simulationService";

interface Preset {
  id: string;
  label: string;
  description: string;
  config: Partial<SimulationConfig>;
}

const defaultConfig: SimulationConfig = {
  name: "European SaaS Traffic",
  origin: "warsaw",
  audience: "europe",
  contentType: "api",
  trafficProfile: "steady",
  optimizationGoal: "balanced",
  requestsPerSecond: 18000,
  payloadSizeKb: 180,
  cacheTtlSeconds: 3600,
  warmCache: true,
  failover: true,
  aiRouting: true,
};

const presets: Preset[] = [
  {
    id: "saas",
    label: "SaaS API",
    description:
      "Low-latency API traffic across Europe.",
    config: {
      name: "European SaaS Traffic",
      origin: "warsaw",
      audience: "europe",
      contentType: "api",
      trafficProfile: "steady",
      optimizationGoal: "latency",
      requestsPerSecond: 18000,
      payloadSizeKb: 180,
      cacheTtlSeconds: 900,
      warmCache: true,
      failover: true,
      aiRouting: true,
    },
  },
  {
    id: "commerce",
    label: "E-commerce peak",
    description:
      "Bursty global traffic during a sale.",
    config: {
      name: "Global Commerce Peak",
      origin: "frankfurt",
      audience: "global",
      contentType: "web",
      trafficProfile: "event",
      optimizationGoal: "resilience",
      requestsPerSecond: 36000,
      payloadSizeKb: 620,
      cacheTtlSeconds: 1800,
      warmCache: true,
      failover: true,
      aiRouting: true,
    },
  },
  {
    id: "video",
    label: "Video delivery",
    description:
      "Large media payloads in Asia Pacific.",
    config: {
      name: "Asia Video Delivery",
      origin: "singapore",
      audience: "asia-pacific",
      contentType: "video",
      trafficProfile: "growth",
      optimizationGoal: "cache",
      requestsPerSecond: 12000,
      payloadSizeKb: 4200,
      cacheTtlSeconds: 21600,
      warmCache: true,
      failover: true,
      aiRouting: true,
    },
  },
  {
    id: "downloads",
    label: "Software release",
    description:
      "High-volume download distribution.",
    config: {
      name: "Global Release Distribution",
      origin: "virginia",
      audience: "global",
      contentType: "downloads",
      trafficProfile: "bursty",
      optimizationGoal: "balanced",
      requestsPerSecond: 28000,
      payloadSizeKb: 5000,
      cacheTtlSeconds: 43200,
      warmCache: false,
      failover: true,
      aiRouting: true,
    },
  },
];

const originLabels: Record<
  OriginRegion,
  string
> = {
  warsaw: "Warsaw origin",
  frankfurt: "Frankfurt origin",
  virginia: "Virginia origin",
  singapore: "Singapore origin",
  sydney: "Sydney origin",
};

const audienceLabels: Record<
  AudienceRegion,
  string
> = {
  europe: "Europe",
  "north-america": "North America",
  "asia-pacific": "Asia Pacific",
  global: "Global",
};

const runMessages = [
  "Validating network configuration",
  "Provisioning simulated edge nodes",
  "Warming regional cache layers",
  "Scoring candidate delivery routes",
  "Applying congestion and failover model",
  "Calculating final delivery metrics",
];

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function formatInteger(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
  ).format(value);
}

export default function SimulatorWorkspace() {
  const navigate = useNavigate();

  const [config, setConfig] =
    useState<SimulationConfig>(
      defaultConfig,
    );

  const [activePreset, setActivePreset] =
    useState("saas");

  const [isRunning, setIsRunning] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [runLog, setRunLog] =
    useState<string[]>([]);

  const [result, setResult] =
    useState<SimulationResult | null>(
      null,
    );

  const runIntervalRef =
    useRef<number | null>(null);

  const estimates = useMemo(
    () =>
      simulationService.predict(
        config,
      ),
    [config],
  );

  useEffect(() => {
    return () => {
      if (
        runIntervalRef.current !== null
      ) {
        window.clearInterval(
          runIntervalRef.current,
        );
      }
    };
  }, []);

  const updateConfig = <
    Key extends keyof SimulationConfig,
  >(
    key: Key,
    value: SimulationConfig[Key],
  ) => {
    setConfig(
      (currentConfig) => ({
        ...currentConfig,
        [key]: value,
      }),
    );

    setResult(null);
  };

  const applyPreset = (
    preset: Preset,
  ) => {
    setActivePreset(preset.id);

    setConfig({
      ...defaultConfig,
      ...preset.config,
    });

    setProgress(0);
    setRunLog([]);
    setResult(null);
  };

  const resetWorkspace = () => {
    if (
      runIntervalRef.current !== null
    ) {
      window.clearInterval(
        runIntervalRef.current,
      );

      runIntervalRef.current = null;
    }

    setConfig(defaultConfig);
    setActivePreset("saas");
    setIsRunning(false);
    setProgress(0);
    setRunLog([]);
    setResult(null);
  };

  const runSimulation = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setResult(null);
    setRunLog([
      `${new Date().toLocaleTimeString(
        "en-GB",
      )} · Simulation queued`,
    ]);

    let nextProgress = 0;
    let messageIndex = 0;

    runIntervalRef.current =
      window.setInterval(() => {
        nextProgress = Math.min(
          100,
          nextProgress +
            Math.floor(
              8 + Math.random() * 13,
            ),
        );

        setProgress(nextProgress);

        const desiredMessageIndex =
          Math.min(
            runMessages.length - 1,
            Math.floor(
              (nextProgress / 100) *
                runMessages.length,
            ),
          );

        if (
          desiredMessageIndex >=
          messageIndex
        ) {
          const message =
            runMessages[
              desiredMessageIndex
            ];

          setRunLog(
            (currentLog) => [
              `${new Date().toLocaleTimeString(
                "en-GB",
              )} · ${message}`,
              ...currentLog,
            ].slice(0, 7),
          );

          messageIndex =
            desiredMessageIndex + 1;
        }

        if (nextProgress >= 100) {
          if (
            runIntervalRef.current !==
            null
          ) {
            window.clearInterval(
              runIntervalRef.current,
            );

            runIntervalRef.current =
              null;
          }

          void simulationService
            .run(config)
            .then(
              (
                completedSimulation:
                  CompletedSimulation,
              ) => {
                setResult(
                  completedSimulation
                    .result,
                );

                setIsRunning(false);

                setRunLog(
                  (currentLog) => [
                    `${new Date().toLocaleTimeString(
                      "en-GB",
                    )} · Simulation completed successfully`,
                    ...currentLog,
                  ].slice(0, 7),
                );

                window.setTimeout(() => {
                  navigate(
                    "/simulation-result",
                    {
                      state: {
                        simulation:
                          completedSimulation,
                      },
                    },
                  );
                }, 450);
              },
            )
            .catch(() => {
              setIsRunning(false);

              setRunLog(
                (currentLog) => [
                  `${new Date().toLocaleTimeString(
                    "en-GB",
                  )} · Simulation failed`,
                  ...currentLog,
                ].slice(0, 7),
              );
            });
        }
      }, 420);
  };

  return (
    <section className="simulator-workspace">
      <header className="simulator-heading">
        <div>
          <span>
            STEP 09 / CDN SIMULATOR
          </span>

          <h1>
            Configure the network
          </h1>

          <p>
            Define traffic, cache, routing,
            and resilience settings, then run
            an interactive CDN simulation.
          </p>
        </div>

        <div className="simulator-heading-actions">
          <button
            className="simulator-secondary-button"
            type="button"
            onClick={resetWorkspace}
            disabled={isRunning}
          >
            Reset workspace
          </button>

          <button
            className="simulator-primary-button"
            type="submit"
            form="cdn-simulation-form"
            disabled={isRunning}
          >
            {isRunning
              ? `Running ${progress}%`
              : "Run simulation"}

            <span>↗</span>
          </button>
        </div>
      </header>

      <div className="simulator-preset-grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={[
              "simulator-preset",
              activePreset === preset.id
                ? "is-active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              applyPreset(preset);
            }}
            disabled={isRunning}
          >
            <span>
              {preset.label}
            </span>

            <small>
              {preset.description}
            </small>

            <i />
          </button>
        ))}
      </div>

      <form
        id="cdn-simulation-form"
        className="simulator-layout"
        onSubmit={runSimulation}
      >
        <div className="simulator-form-column">
          <section className="simulator-card">
            <header>
              <div>
                <span>
                  01 / SCENARIO
                </span>

                <strong>
                  Simulation identity
                </strong>
              </div>

              <small>
                REQUIRED
              </small>
            </header>

            <div className="simulator-field-grid">
              <label className="simulator-field is-full">
                <span>
                  SIMULATION NAME
                </span>

                <input
                  type="text"
                  value={config.name}
                  maxLength={80}
                  required
                  onChange={(event) => {
                    updateConfig(
                      "name",
                      event.target.value,
                    );
                  }}
                />
              </label>

              <label className="simulator-field">
                <span>
                  ORIGIN REGION
                </span>

                <select
                  value={config.origin}
                  onChange={(event) => {
                    updateConfig(
                      "origin",
                      event.target
                        .value as OriginRegion,
                    );
                  }}
                >
                  <option value="warsaw">
                    Warsaw, Poland
                  </option>

                  <option value="frankfurt">
                    Frankfurt, Germany
                  </option>

                  <option value="virginia">
                    Virginia, USA
                  </option>

                  <option value="singapore">
                    Singapore
                  </option>

                  <option value="sydney">
                    Sydney, Australia
                  </option>
                </select>
              </label>

              <label className="simulator-field">
                <span>
                  PRIMARY AUDIENCE
                </span>

                <select
                  value={config.audience}
                  onChange={(event) => {
                    updateConfig(
                      "audience",
                      event.target
                        .value as AudienceRegion,
                    );
                  }}
                >
                  <option value="europe">
                    Europe
                  </option>

                  <option value="north-america">
                    North America
                  </option>

                  <option value="asia-pacific">
                    Asia Pacific
                  </option>

                  <option value="global">
                    Global
                  </option>
                </select>
              </label>
            </div>
          </section>

          <section className="simulator-card">
            <header>
              <div>
                <span>
                  02 / TRAFFIC
                </span>

                <strong>
                  Request characteristics
                </strong>
              </div>

              <small>
                LIVE ESTIMATE
              </small>
            </header>

            <div className="simulator-field-grid">
              <label className="simulator-field">
                <span>
                  CONTENT TYPE
                </span>

                <select
                  value={config.contentType}
                  onChange={(event) => {
                    updateConfig(
                      "contentType",
                      event.target
                        .value as ContentType,
                    );
                  }}
                >
                  <option value="web">
                    Web assets
                  </option>

                  <option value="api">
                    API responses
                  </option>

                  <option value="video">
                    Video media
                  </option>

                  <option value="downloads">
                    Large downloads
                  </option>
                </select>
              </label>

              <label className="simulator-field">
                <span>
                  TRAFFIC PROFILE
                </span>

                <select
                  value={
                    config.trafficProfile
                  }
                  onChange={(event) => {
                    updateConfig(
                      "trafficProfile",
                      event.target
                        .value as TrafficProfile,
                    );
                  }}
                >
                  <option value="steady">
                    Steady
                  </option>

                  <option value="bursty">
                    Bursty
                  </option>

                  <option value="event">
                    Major event
                  </option>

                  <option value="growth">
                    Gradual growth
                  </option>
                </select>
              </label>

              <label className="simulator-field is-full">
                <span>
                  REQUESTS PER SECOND

                  <strong>
                    {formatInteger(
                      config.requestsPerSecond,
                    )}
                  </strong>
                </span>

                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={
                    config.requestsPerSecond
                  }
                  onChange={(event) => {
                    updateConfig(
                      "requestsPerSecond",
                      Number(
                        event.target.value,
                      ),
                    );
                  }}
                />
              </label>

              <label className="simulator-field">
                <span>
                  PAYLOAD SIZE

                  <strong>
                    {formatInteger(
                      config.payloadSizeKb,
                    )}{" "}
                    KB
                  </strong>
                </span>

                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={
                    config.payloadSizeKb
                  }
                  onChange={(event) => {
                    updateConfig(
                      "payloadSizeKb",
                      clamp(
                        Number(
                          event.target.value,
                        ),
                        1,
                        10000,
                      ),
                    );
                  }}
                />
              </label>

              <label className="simulator-field">
                <span>
                  CACHE TTL

                  <strong>
                    {formatInteger(
                      config.cacheTtlSeconds,
                    )}{" "}
                    sec
                  </strong>
                </span>

                <input
                  type="number"
                  min="0"
                  max="86400"
                  value={
                    config.cacheTtlSeconds
                  }
                  onChange={(event) => {
                    updateConfig(
                      "cacheTtlSeconds",
                      clamp(
                        Number(
                          event.target.value,
                        ),
                        0,
                        86400,
                      ),
                    );
                  }}
                />
              </label>
            </div>
          </section>

          <section className="simulator-card">
            <header>
              <div>
                <span>
                  03 / ROUTING POLICY
                </span>

                <strong>
                  Optimization behaviour
                </strong>
              </div>

              <small>
                AI READY
              </small>
            </header>

            <div className="simulator-goal-grid">
              {(
                [
                  [
                    "balanced",
                    "Balanced",
                    "Latency, cache, and resilience",
                  ],
                  [
                    "latency",
                    "Lowest latency",
                    "Prioritize the fastest route",
                  ],
                  [
                    "cache",
                    "Cache efficiency",
                    "Maximize edge delivery",
                  ],
                  [
                    "resilience",
                    "High resilience",
                    "Prefer failover capacity",
                  ],
                ] as const
              ).map(
                ([
                  value,
                  label,
                  description,
                ]) => (
                  <label
                    key={value}
                    className={[
                      "simulator-goal",
                      config.optimizationGoal ===
                      value
                        ? "is-active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="radio"
                      name="optimization-goal"
                      value={value}
                      checked={
                        config.optimizationGoal ===
                        value
                      }
                      onChange={() => {
                        updateConfig(
                          "optimizationGoal",
                          value,
                        );
                      }}
                    />

                    <span>
                      <strong>
                        {label}
                      </strong>

                      <small>
                        {description}
                      </small>
                    </span>

                    <i />
                  </label>
                ),
              )}
            </div>

            <div className="simulator-switch-grid">
              <label className="simulator-switch">
                <input
                  type="checkbox"
                  checked={config.warmCache}
                  onChange={(event) => {
                    updateConfig(
                      "warmCache",
                      event.target.checked,
                    );
                  }}
                />

                <span>
                  <strong>
                    Warm cache
                  </strong>

                  <small>
                    Begin with populated edge
                    caches.
                  </small>
                </span>

                <i />
              </label>

              <label className="simulator-switch">
                <input
                  type="checkbox"
                  checked={config.failover}
                  onChange={(event) => {
                    updateConfig(
                      "failover",
                      event.target.checked,
                    );
                  }}
                />

                <span>
                  <strong>
                    Automatic failover
                  </strong>

                  <small>
                    Reroute unhealthy edge
                    traffic.
                  </small>
                </span>

                <i />
              </label>

              <label className="simulator-switch">
                <input
                  type="checkbox"
                  checked={config.aiRouting}
                  onChange={(event) => {
                    updateConfig(
                      "aiRouting",
                      event.target.checked,
                    );
                  }}
                />

                <span>
                  <strong>
                    AI route scoring
                  </strong>

                  <small>
                    Compare congestion and
                    route confidence.
                  </small>
                </span>

                <i />
              </label>
            </div>
          </section>
        </div>

        <aside className="simulator-preview-column">
          <section className="simulator-preview-card">
            <header>
              <div>
                <span>
                  NETWORK PREVIEW
                </span>

                <strong>
                  Proposed topology
                </strong>
              </div>

              <small>
                CONFIGURED
              </small>
            </header>

            <div className="simulator-topology">
              <div className="simulator-topology-grid" />

              <div className="topology-node is-origin">
                <i />

                <span>
                  ORIGIN
                </span>

                <strong>
                  {
                    originLabels[
                      config.origin
                    ]
                  }
                </strong>
              </div>

              <div className="topology-line line-one">
                <i />
              </div>

              <div className="topology-node is-edge">
                <i />

                <span>
                  EDGE LAYER
                </span>

                <strong>
                  33 active nodes
                </strong>
              </div>

              <div className="topology-line line-two">
                <i />
              </div>

              <div className="topology-node is-users">
                <i />

                <span>
                  AUDIENCE
                </span>

                <strong>
                  {
                    audienceLabels[
                      config.audience
                    ]
                  }
                </strong>
              </div>
            </div>

            <div className="simulator-route-preview">
              <span>
                PREDICTED ROUTE
              </span>

              <strong>
                {estimates.route}
              </strong>

              <small>
                Updated from the current
                workspace configuration.
              </small>
            </div>
          </section>

          <section className="simulator-estimate-card">
            <header>
              <span>
                PREDICTED OUTPUT
              </span>

              <strong>
                Before execution
              </strong>
            </header>

            <div className="simulator-estimate-grid">
              <article>
                <span>
                  LATENCY
                </span>

                <strong>
                  {estimates.latencyMs} ms
                </strong>
              </article>

              <article>
                <span>
                  CACHE HIT
                </span>

                <strong>
                  {estimates.cacheHitRate}%
                </strong>
              </article>

              <article>
                <span>
                  ORIGIN RPS
                </span>

                <strong>
                  {formatInteger(
                    estimates.originRequests,
                  )}
                </strong>
              </article>

              <article>
                <span>
                  CONFIDENCE
                </span>

                <strong>
                  {estimates.confidence}%
                </strong>
              </article>
            </div>

            <div className="simulator-confidence">
              <div>
                <span>
                  ROUTE CONFIDENCE
                </span>

                <strong>
                  {estimates.confidence}%
                </strong>
              </div>

              <div>
                <i
                  style={{
                    width: `${estimates.confidence}%`,
                  }}
                />
              </div>
            </div>
          </section>

          <section className="simulator-run-card">
            <header>
              <div>
                <span>
                  RUN STATUS
                </span>

                <strong>
                  {isRunning
                    ? "Simulation in progress"
                    : result
                      ? "Simulation complete"
                      : "Ready to simulate"}
                </strong>
              </div>

              <small
                className={
                  result
                    ? "is-complete"
                    : ""
                }
              >
                {isRunning
                  ? `${progress}%`
                  : result
                    ? result.id
                    : "IDLE"}
              </small>
            </header>

            <div className="simulator-progress">
              <i
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {result && (
              <div className="simulator-result-summary">
                <span>
                  SELECTED ROUTE
                </span>

                <strong>
                  {result.route}
                </strong>

                <div>
                  <span>
                    <small>
                      LATENCY
                    </small>

                    <strong>
                      {result.latencyMs} ms
                    </strong>
                  </span>

                  <span>
                    <small>
                      CACHE HIT
                    </small>

                    <strong>
                      {result.cacheHitRate}%
                    </strong>
                  </span>

                  <span>
                    <small>
                      SAVED / HR
                    </small>

                    <strong>
                      {
                        result.bandwidthSavedGb
                      }{" "}
                      GB
                    </strong>
                  </span>
                </div>
              </div>
            )}

            <div
              className="simulator-run-log"
              aria-live="polite"
            >
              {runLog.length === 0 ? (
                <p>
                  Run the simulation to see
                  execution events.
                </p>
              ) : (
                runLog.map(
                  (message, index) => (
                    <p key={`${message}-${index}`}>
                      <i />
                      {message}
                    </p>
                  ),
                )
              )}
            </div>

            <button
              className="simulator-primary-button is-full"
              type="submit"
              disabled={isRunning}
            >
              {isRunning
                ? `Running simulation · ${progress}%`
                : result
                  ? "Run again"
                  : "Run simulation"}

              <span>↗</span>
            </button>
          </section>
        </aside>
      </form>
    </section>
  );
}