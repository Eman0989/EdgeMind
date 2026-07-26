import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

interface EdgeNode {
  id: string;
  code: string;
  city: string;
  x: number;
  y: number;
  latency: number;
  confidence: number;
  cache: "HIT" | "MISS" | "WARM";
  status: "HEALTHY" | "WATCH";
  alternative: string;
  reason: string;
}

interface ActivityItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  tone: "success" | "info" | "warning";
}

const STREAKS = Array.from(
  { length: 22 },
  (_, index) => ({
    top: 5 + ((index * 17) % 88),
    left: 46 + ((index * 11) % 48),
    width: 90 + ((index * 29) % 180),
    delay: (index % 8) * 0.035,
  }),
);

const EDGE_NODES: EdgeNode[] = [
  {
    id: "waw",
    code: "WAW",
    city: "Warsaw",
    x: 105,
    y: 286,
    latency: 18,
    confidence: 91,
    cache: "WARM",
    status: "HEALTHY",
    alternative: "FRA-EDGE-07",
    reason:
      "Closest regional ingress with stable capacity.",
  },
  {
    id: "fra",
    code: "FRA",
    city: "Frankfurt",
    x: 320,
    y: 148,
    latency: 12,
    confidence: 96,
    cache: "HIT",
    status: "HEALTHY",
    alternative: "LON-EDGE-03",
    reason:
      "Lowest predicted latency and a verified cache hit.",
  },
  {
    id: "lon",
    code: "LON",
    city: "London",
    x: 522,
    y: 258,
    latency: 15,
    confidence: 93,
    cache: "HIT",
    status: "HEALTHY",
    alternative: "FRA-EDGE-07",
    reason:
      "High cache probability with balanced transatlantic load.",
  },
  {
    id: "nyc",
    code: "NYC",
    city: "New York",
    x: 724,
    y: 132,
    latency: 42,
    confidence: 84,
    cache: "WARM",
    status: "WATCH",
    alternative: "LON-EDGE-03",
    reason:
      "Selected only when North American demand is prioritized.",
  },
  {
    id: "sin",
    code: "SIN",
    city: "Singapore",
    x: 900,
    y: 278,
    latency: 87,
    confidence: 79,
    cache: "MISS",
    status: "HEALTHY",
    alternative: "FRA-EDGE-07",
    reason:
      "Long-haul fallback with sufficient available capacity.",
  },
];

const ACTIVITIES: ActivityItem[] = [
  {
    id: "a1",
    time: "20:14:39",
    title: "Route automatically optimized",
    detail:
      "Frankfurt selected over London by 3 ms.",
    tone: "success",
  },
  {
    id: "a2",
    time: "20:14:37",
    title: "Singapore latency increased",
    detail:
      "Node remains healthy; traffic rebalanced.",
    tone: "warning",
  },
  {
    id: "a3",
    time: "20:14:34",
    title: "Cache hit returned",
    detail:
      "Response completed in 12 milliseconds.",
    tone: "success",
  },
  {
    id: "a4",
    time: "20:14:32",
    title: "Request entered edge network",
    detail:
      "Origin accepted by the Warsaw router.",
    tone: "info",
  },
];

const REGION_DATA = {
  Global: {
    requests: "18.4K",
    requestChange: "+8.2%",
    cache: "94.8%",
    cacheChange: "+1.4%",
    latency: "12 ms",
    latencyChange: "-6 ms",
  },
  Europe: {
    requests: "11.8K",
    requestChange: "+6.7%",
    cache: "96.2%",
    cacheChange: "+2.1%",
    latency: "9 ms",
    latencyChange: "-4 ms",
  },
  "North America": {
    requests: "4.9K",
    requestChange: "+11.1%",
    cache: "92.6%",
    cacheChange: "+0.8%",
    latency: "26 ms",
    latencyChange: "-3 ms",
  },
  "Asia Pacific": {
    requests: "1.7K",
    requestChange: "+4.3%",
    cache: "88.4%",
    cacheChange: "+3.2%",
    latency: "54 ms",
    latencyChange: "-9 ms",
  },
} as const;

type RegionName = keyof typeof REGION_DATA;

function MetricSparkline({
  values,
}: {
  values: number[];
}) {
  const points = values
    .map((value, index) => {
      const x =
        (index / (values.length - 1)) *
        100;

      const y = 28 - value;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="dashboard-metric-sparkline"
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        vectorEffect="non-scaling-stroke"
      />

      <circle
        cx="100"
        cy={28 - values[values.length - 1]}
        r="1.7"
      />
    </svg>
  );
}

export default function HyperspeedTransition() {
  const [region, setRegion] =
    useState<RegionName>("Global");

  const [timeRange, setTimeRange] =
    useState("Last 15 min");

  const [trafficType, setTrafficType] =
    useState("All traffic");

  const [simulationMode, setSimulationMode] =
    useState("AI optimized");

  const [selectedNodeId, setSelectedNodeId] =
    useState("fra");

  const [activityPulse, setActivityPulse] =
    useState(0);

  useEffect(() => {
    const activityTimer =
      window.setInterval(() => {
        setActivityPulse(
          (currentValue) =>
            currentValue + 1,
        );
      }, 1600);

    return () => {
      window.clearInterval(
        activityTimer,
      );
    };
  }, []);

  const selectedNode = useMemo(
    () =>
      EDGE_NODES.find(
        (node) =>
          node.id === selectedNodeId,
      ) ?? EDGE_NODES[1],
    [selectedNodeId],
  );

  const metrics = REGION_DATA[region];

  const orderedActivities = useMemo(() => {
    const offset =
      activityPulse %
      ACTIVITIES.length;

    return [
      ...ACTIVITIES.slice(offset),
      ...ACTIVITIES.slice(0, offset),
    ];
  }, [activityPulse]);

  return (
    <section
      className="hyperspeed-scene"
      aria-label="EdgeMind live infrastructure preview"
    >
      <div
        className="hyperspeed-center-glow"
        aria-hidden="true"
      />

      <div
        className="hyperspeed-streaks"
        aria-hidden="true"
      >
        {STREAKS.map(
          (streak, index) => (
            <i
              key={`streak-${index}`}
              className="hyperspeed-streak"
              style={
                {
                  top: `${streak.top}%`,
                  left: `${streak.left}%`,
                  width: `${streak.width}px`,
                  animationDelay:
                    `${23.42 + streak.delay}s`,
                } as CSSProperties
              }
            />
          ),
        )}
      </div>

      <article className="dashboard-glimpse dashboard-glimpse-enhanced">
        <header className="dashboard-glimpse-header">
          <div className="dashboard-glimpse-brand">
            <span>EDGEMIND</span>
            <small>
              CONTROL PLANE / LIVE
            </small>
          </div>

          <div className="dashboard-header-health">
            <span className="dashboard-online">
              <i />
              NETWORK ONLINE
            </span>

            <span>
              33 EDGE NODES
            </span>
          </div>
        </header>

        <div className="dashboard-glimpse-layout">
          <aside
            className="dashboard-glimpse-sidebar"
            aria-label="Dashboard sections"
          >
            <button
              type="button"
              className="is-active"
              aria-label="Overview"
            >
              <i />
              <i />
            </button>

            <button
              type="button"
              aria-label="Routes"
            >
              <i />
              <i />
            </button>

            <button
              type="button"
              aria-label="Analytics"
            >
              <i />
              <i />
            </button>

            <button
              type="button"
              aria-label="Security"
            >
              <i />
              <i />
            </button>
          </aside>

          <div className="dashboard-glimpse-content dashboard-enhanced-content">
            <div className="dashboard-title-row">
              <div className="dashboard-preview-title">
                <small>
                  GLOBAL EDGE NETWORK
                </small>

                <strong>
                  Live infrastructure
                </strong>
              </div>

              <div className="dashboard-live-indicator">
                <i />
                LIVE TELEMETRY
              </div>
            </div>

            <div className="dashboard-control-row">
              <label>
                <span>REGION</span>

                <select
                  value={region}
                  onChange={(event) => {
                    setRegion(
                      event.target
                        .value as RegionName,
                    );
                  }}
                >
                  {Object.keys(
                    REGION_DATA,
                  ).map((regionName) => (
                    <option
                      key={regionName}
                      value={regionName}
                    >
                      {regionName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>TIME RANGE</span>

                <select
                  value={timeRange}
                  onChange={(event) => {
                    setTimeRange(
                      event.target.value,
                    );
                  }}
                >
                  <option>Last 15 min</option>
                  <option>Last hour</option>
                  <option>Last 24 hours</option>
                </select>
              </label>

              <label>
                <span>TRAFFIC</span>

                <select
                  value={trafficType}
                  onChange={(event) => {
                    setTrafficType(
                      event.target.value,
                    );
                  }}
                >
                  <option>All traffic</option>
                  <option>Video</option>
                  <option>API</option>
                  <option>Static assets</option>
                </select>
              </label>

              <label>
                <span>MODE</span>

                <select
                  value={simulationMode}
                  onChange={(event) => {
                    setSimulationMode(
                      event.target.value,
                    );
                  }}
                >
                  <option>AI optimized</option>
                  <option>Lowest latency</option>
                  <option>Highest cache hit</option>
                </select>
              </label>
            </div>

            <section className="dashboard-preview-metrics dashboard-metrics-enhanced">
              <article>
                <div className="dashboard-metric-heading">
                  <small>REQUESTS</small>
                  <span className="is-positive">
                    {metrics.requestChange}
                  </span>
                </div>

                <strong>
                  {metrics.requests}
                </strong>

                <span className="dashboard-metric-unit">
                  per second
                </span>

                <MetricSparkline
                  values={[
                    16,
                    18,
                    17,
                    21,
                    20,
                    23,
                    25,
                  ]}
                />
              </article>

              <article>
                <div className="dashboard-metric-heading">
                  <small>CACHE HIT</small>
                  <span className="is-positive">
                    {metrics.cacheChange}
                  </span>
                </div>

                <strong>
                  {metrics.cache}
                </strong>

                <span className="dashboard-metric-unit">
                  global average
                </span>

                <MetricSparkline
                  values={[
                    19,
                    20,
                    21,
                    21,
                    23,
                    24,
                    25,
                  ]}
                />
              </article>

              <article>
                <div className="dashboard-metric-heading">
                  <small>LATENCY</small>
                  <span className="is-positive">
                    {metrics.latencyChange}
                  </span>
                </div>

                <strong>
                  {metrics.latency}
                </strong>

                <span className="dashboard-metric-unit">
                  optimized path
                </span>

                <MetricSparkline
                  values={[
                    11,
                    14,
                    13,
                    17,
                    20,
                    22,
                    24,
                  ]}
                />
              </article>
            </section>

            <div className="dashboard-workspace-grid">
              <section className="dashboard-network-panel">
                <header>
                  <div>
                    <span>
                      LIVE REQUEST PATH
                    </span>

                    <strong>
                      WAW → FRA → LON → NYC → SIN
                    </strong>
                  </div>

                  <small>
                    Click a node to inspect
                  </small>
                </header>

                <div className="dashboard-preview-map dashboard-map-enhanced">
                  <div className="dashboard-map-grid" />

                  <svg
                    className="dashboard-route-svg"
                    viewBox="0 0 1000 420"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="enhancedRouteGradient"
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
                          offset="45%"
                          stopColor="#2ee6d6"
                        />

                        <stop
                          offset="100%"
                          stopColor="#9ffcf3"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      className="dashboard-route-shadow"
                      d="
                        M 105 286
                        C 170 248, 250 176, 320 148
                        C 390 124, 450 224, 522 258
                        C 596 292, 646 168, 724 132
                        C 796 100, 848 236, 900 278
                      "
                    />

                    <path
                      className="dashboard-route-main"
                      d="
                        M 105 286
                        C 170 248, 250 176, 320 148
                        C 390 124, 450 224, 522 258
                        C 596 292, 646 168, 724 132
                        C 796 100, 848 236, 900 278
                      "
                    />

                    <path
                      className="dashboard-route-highlight"
                      d="
                        M 105 286
                        C 170 248, 250 176, 320 148
                        C 390 124, 450 224, 522 258
                        C 596 292, 646 168, 724 132
                        C 796 100, 848 236, 900 278
                      "
                    />
                  </svg>

                  <span className="dashboard-route-packet" />

                  {EDGE_NODES.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      className={[
                        "dashboard-edge-node",
                        selectedNodeId ===
                        node.id
                          ? "is-selected"
                          : "",
                        node.status ===
                        "WATCH"
                          ? "is-watch"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={
                        {
                          "--node-x":
                            `${node.x / 10}%`,
                          "--node-y":
                            `${node.y / 4.2}%`,
                        } as CSSProperties
                      }
                      onClick={() => {
                        setSelectedNodeId(
                          node.id,
                        );
                      }}
                      aria-label={`${node.city}, ${node.latency} milliseconds`}
                    >
                      <span className="dashboard-node-ring" />
                      <i />
                      <strong>
                        {node.code}
                      </strong>
                      <small>
                        {node.latency} ms
                      </small>

                      <span className="dashboard-node-tooltip">
                        <b>{node.city}</b>
                        <em>
                          {node.status} ·{" "}
                          {node.cache}
                        </em>
                      </span>
                    </button>
                  ))}

                  <div className="dashboard-map-legend">
                    <span>
                      <i className="is-selected" />
                      Selected
                    </span>

                    <span>
                      <i />
                      Healthy
                    </span>

                    <span>
                      <i className="is-warning" />
                      Watch
                    </span>
                  </div>
                </div>
              </section>

              <aside className="dashboard-decision-panel">
                <header>
                  <span>
                    ROUTING DECISION
                  </span>

                  <i />
                </header>

                <div className="dashboard-selected-node">
                  <small>SELECTED NODE</small>

                  <strong>
                    {selectedNode.code}-EDGE-07
                  </strong>

                  <span>
                    {selectedNode.city}
                  </span>
                </div>

                <div className="dashboard-confidence">
                  <div>
                    <span>CONFIDENCE</span>
                    <strong>
                      {selectedNode.confidence}%
                    </strong>
                  </div>

                  <div>
                    <span
                      style={{
                        width:
                          `${selectedNode.confidence}%`,
                      }}
                    />
                  </div>
                </div>

                <dl>
                  <div>
                    <dt>Reason</dt>
                    <dd>
                      {selectedNode.reason}
                    </dd>
                  </div>

                  <div>
                    <dt>Cache</dt>
                    <dd
                      className={
                        selectedNode.cache ===
                        "HIT"
                          ? "is-good"
                          : ""
                      }
                    >
                      {selectedNode.cache}
                    </dd>
                  </div>

                  <div>
                    <dt>Latency</dt>
                    <dd>
                      {selectedNode.latency} ms
                    </dd>
                  </div>

                  <div>
                    <dt>Alternative</dt>
                    <dd>
                      {selectedNode.alternative}
                    </dd>
                  </div>
                </dl>

                <div className="dashboard-decision-footer">
                  <span>
                    MODEL
                  </span>

                  <strong>
                    EDGE-RANKER V2.4
                  </strong>
                </div>
              </aside>
            </div>

            <section className="dashboard-activity-panel">
              <header>
                <div>
                  <span>
                    REAL-TIME ACTIVITY
                  </span>

                  <small>
                    {region} · {timeRange} ·{" "}
                    {trafficType}
                  </small>
                </div>

                <strong>
                  <i />
                  LIVE
                </strong>
              </header>

              <div className="dashboard-activity-list">
                {orderedActivities.map(
                  (activity) => (
                    <article
                      key={activity.id}
                    >
                      <time>
                        {activity.time}
                      </time>

                      <i
                        className={`is-${activity.tone}`}
                      />

                      <div>
                        <strong>
                          {activity.title}
                        </strong>

                        <span>
                          {activity.detail}
                        </span>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </section>
          </div>
        </div>
      </article>

      <div
        className="arrival-wipe"
        aria-hidden="true"
      />
    </section>
  );
}