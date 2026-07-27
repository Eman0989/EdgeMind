import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import "./LiveNetworkDashboard.css";

type Region =
  | "All"
  | "Europe"
  | "Americas"
  | "Asia Pacific";

type NodeState =
  | "healthy"
  | "watch"
  | "selected";

interface EdgeNode {
  code: string;
  city: string;
  region: Exclude<Region, "All">;
  latency: number;
  load: number;
  cacheHit: number;
  requests: string;
  state: NodeState;
  x: number;
  y: number;
}

interface ActivityItem {
  id: number;
  time: string;
  tone:
    | "route"
    | "cache"
    | "warning"
    | "health";
  title: string;
  detail: string;
}

const nodes: EdgeNode[] = [
  { code: "WAW", city: "Warsaw", region: "Europe", latency: 7, load: 51, cacheHit: 96.8, requests: "2.8K/s", state: "healthy", x: 50, y: 35 },
  { code: "FRA", city: "Frankfurt", region: "Europe", latency: 9, load: 68, cacheHit: 95.4, requests: "3.7K/s", state: "selected", x: 44, y: 41 },
  { code: "LON", city: "London", region: "Europe", latency: 12, load: 61, cacheHit: 94.9, requests: "3.1K/s", state: "selected", x: 38, y: 35 },
  { code: "NYC", city: "New York", region: "Americas", latency: 41, load: 73, cacheHit: 91.2, requests: "4.4K/s", state: "watch", x: 23, y: 44 },
  { code: "SFO", city: "San Francisco", region: "Americas", latency: 56, load: 47, cacheHit: 92.7, requests: "2.6K/s", state: "healthy", x: 11, y: 47 },
  { code: "GRU", city: "São Paulo", region: "Americas", latency: 72, load: 58, cacheHit: 89.8, requests: "1.9K/s", state: "healthy", x: 30, y: 75 },
  { code: "SIN", city: "Singapore", region: "Asia Pacific", latency: 86, load: 64, cacheHit: 93.6, requests: "2.4K/s", state: "healthy", x: 79, y: 67 },
  { code: "TYO", city: "Tokyo", region: "Asia Pacific", latency: 78, load: 69, cacheHit: 94.1, requests: "3.0K/s", state: "healthy", x: 90, y: 43 },
  { code: "SYD", city: "Sydney", region: "Asia Pacific", latency: 92, load: 39, cacheHit: 90.5, requests: "1.3K/s", state: "healthy", x: 91, y: 79 },
];

const regions: Region[] = [
  "All",
  "Europe",
  "Americas",
  "Asia Pacific",
];

const activityTemplates = [
  {
    tone: "route" as const,
    title: "Route automatically optimized",
    detail: "WAW → FRA → LON selected",
  },
  {
    tone: "cache" as const,
    title: "Cache hit returned",
    detail: "38 ms origin trip avoided",
  },
  {
    tone: "warning" as const,
    title: "New York load increased",
    detail: "Fallback capacity remains healthy",
  },
  {
    tone: "health" as const,
    title: "Node health check passed",
    detail: "33 of 33 nodes operational",
  },
];

function now() {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    },
  ).format(new Date());
}

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

export default function LiveNetworkDashboard() {
  const [region, setRegion] =
    useState<Region>("All");

  const [selectedCode, setSelectedCode] =
    useState("FRA");

  const [paused, setPaused] =
    useState(false);

  const [requests, setRequests] =
    useState(18.4);

  const [latency, setLatency] =
    useState(12);

  const [cacheHit, setCacheHit] =
    useState(94.8);

  const [activity, setActivity] =
    useState<ActivityItem[]>([
      {
        id: 1,
        time: now(),
        ...activityTemplates[0],
      },
      {
        id: 2,
        time: now(),
        ...activityTemplates[1],
      },
      {
        id: 3,
        time: now(),
        ...activityTemplates[3],
      },
    ]);

  const visibleNodes = useMemo(
    () =>
      region === "All"
        ? nodes
        : nodes.filter(
            (node) =>
              node.region === region,
          ),
    [region],
  );

  const selectedNode =
    nodes.find(
      (node) =>
        node.code === selectedCode,
    ) ?? nodes[1];

  useEffect(() => {
    if (paused) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        setRequests(
          (value) =>
            Number(
              clamp(
                value +
                  (Math.random() -
                    0.45) *
                    0.7,
                16.8,
                22.6,
              ).toFixed(1),
            ),
        );

        setLatency(
          (value) =>
            Math.round(
              clamp(
                value +
                  (Math.random() >
                  0.5
                    ? 1
                    : -1),
                9,
                19,
              ),
            ),
        );

        setCacheHit(
          (value) =>
            Number(
              clamp(
                value +
                  (Math.random() -
                    0.48) *
                    0.35,
                92.5,
                97.2,
              ).toFixed(1),
            ),
        );

        const item =
          activityTemplates[
            Math.floor(
              Math.random() *
                activityTemplates.length,
            )
          ];

        setActivity(
          (current) => [
            {
              id: Date.now(),
              time: now(),
              ...item,
            },
            ...current,
          ].slice(0, 5),
        );
      }, 2200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [paused]);

  return (
    <section className="live-network">
      <header className="live-network-heading">
        <div>
          <span>
            STEP 08 / LIVE NETWORK
          </span>

          <h1>
            Global edge activity
          </h1>

          <p>
            Monitor simulated traffic,
            latency, cache efficiency, node
            health, and routing decisions.
          </p>
        </div>

        <div className="live-network-actions">
          <button
            className="edge-outline-button"
            type="button"
            onClick={() => {
              setPaused(
                (value) => !value,
              );
            }}
          >
            <i
              className={
                paused
                  ? "is-paused"
                  : ""
              }
            />

            {paused
              ? "Resume live data"
              : "Pause live data"}
          </button>

          <Link
            className="edge-green-button"
            to="/simulator"
          >
            Run simulation
            <span>↗</span>
          </Link>
        </div>
      </header>

      <div className="live-metrics">
        <article>
          <span>REQUEST RATE</span>
          <strong>
            {requests.toFixed(1)}K
          </strong>
          <small>
            requests per second
          </small>
          <div className="metric-bars">
            {[42, 58, 47, 66, 61, 76, 69, 91].map(
              (height, index) => (
                <i
                  key={index}
                  style={{
                    height: `${height}%`,
                  }}
                />
              ),
            )}
          </div>
        </article>

        <article>
          <span>GLOBAL LATENCY</span>
          <strong>
            {latency} ms
          </strong>
          <small>
            optimized route average
          </small>
          <div className="metric-line" />
        </article>

        <article>
          <span>CACHE HIT RATE</span>
          <strong>
            {cacheHit.toFixed(1)}%
          </strong>
          <small>
            global cache efficiency
          </small>
          <div className="metric-progress">
            <i
              style={{
                width: `${cacheHit}%`,
              }}
            />
          </div>
        </article>

        <article>
          <span>HEALTHY NODES</span>
          <strong>33 / 33</strong>
          <small>
            all regions operational
          </small>
          <div className="metric-dots">
            {Array.from({
              length: 12,
            }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
        </article>
      </div>

      <div className="live-main-grid">
        <section className="live-map-card">
          <header>
            <div>
              <span>
                GLOBAL EDGE MAP
              </span>
              <strong>
                Active network routes
              </strong>
            </div>

            <small>
              <i />
              {paused
                ? "PAUSED"
                : "LIVE"}
            </small>
          </header>

          <div className="live-region-buttons">
            {regions.map(
              (item) => (
                <button
                  key={item}
                  className={
                    region === item
                      ? "is-active"
                      : ""
                  }
                  type="button"
                  onClick={() => {
                    setRegion(item);
                  }}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <div className="live-map">
            <div className="live-map-grid" />

            <div className="world-shapes">
              <i className="americas" />
              <i className="europe" />
              <i className="africa" />
              <i className="asia" />
              <i className="australia" />
            </div>

            <svg
              viewBox="0 0 1000 520"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="step8Route"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor="#78f3c1"
                  />
                  <stop
                    offset="52%"
                    stopColor="#2ee6d6"
                  />
                  <stop
                    offset="100%"
                    stopColor="#b8ffe4"
                  />
                </linearGradient>
              </defs>

              <path
                className="route-shadow"
                d="M100 240C175 186 275 162 370 180C430 192 455 212 500 208C575 201 650 142 720 166C796 192 826 239 904 226"
              />

              <path
                className="route-main"
                d="M100 240C175 186 275 162 370 180C430 192 455 212 500 208C575 201 650 142 720 166C796 192 826 239 904 226"
              />

              <path
                className="route-secondary"
                d="M220 220C270 260 284 335 340 385C470 480 650 362 790 350"
              />

              {!paused && (
                <circle
                  className="route-packet"
                  r="5"
                >
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M100 240C175 186 275 162 370 180C430 192 455 212 500 208C575 201 650 142 720 166C796 192 826 239 904 226"
                  />
                </circle>
              )}
            </svg>

            {visibleNodes.map(
              (node) => (
                <button
                  key={node.code}
                  type="button"
                  className={[
                    "edge-node",
                    `is-${node.state}`,
                    selectedCode ===
                    node.code
                      ? "is-focused"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                  }}
                  onClick={() => {
                    setSelectedCode(
                      node.code,
                    );
                  }}
                >
                  <i />
                  <strong>
                    {node.code}
                  </strong>
                  <small>
                    {node.latency} ms
                  </small>
                </button>
              ),
            )}

            <div className="node-detail">
              <header>
                <div>
                  <span>
                    SELECTED NODE
                  </span>
                  <strong>
                    {selectedNode.code} ·{" "}
                    {selectedNode.city}
                  </strong>
                </div>

                <i
                  className={`is-${selectedNode.state}`}
                />
              </header>

              <div>
                <span>
                  <small>LATENCY</small>
                  <strong>
                    {selectedNode.latency} ms
                  </strong>
                </span>
                <span>
                  <small>LOAD</small>
                  <strong>
                    {selectedNode.load}%
                  </strong>
                </span>
                <span>
                  <small>CACHE HIT</small>
                  <strong>
                    {selectedNode.cacheHit}%
                  </strong>
                </span>
                <span>
                  <small>REQUESTS</small>
                  <strong>
                    {selectedNode.requests}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <footer>
            <span>
              <i className="healthy" />
              Healthy
            </span>
            <span>
              <i className="selected" />
              Selected route
            </span>
            <span>
              <i className="watch" />
              Load watch
            </span>
          </footer>
        </section>

        <aside className="live-side-column">
          <section className="routing-card">
            <header>
              <span>
                ROUTING DECISION
              </span>
              <strong>
                Current best path
              </strong>
            </header>

            <div className="route-choice">
              <span>SELECTED</span>
              <strong>
                WAW → FRA → LON
              </strong>
              <small>
                Lowest predicted latency with
                healthy fallback capacity.
              </small>
            </div>

            <div className="confidence">
              <div>
                <span>
                  MODEL CONFIDENCE
                </span>
                <strong>96%</strong>
              </div>
              <div>
                <i />
              </div>
            </div>

            <div className="route-comparison">
              <article>
                <span>
                  SELECTED PATH
                </span>
                <strong>12 ms</strong>
                <small>
                  94.8% cache hit
                </small>
              </article>

              <article>
                <span>
                  ALTERNATIVE
                </span>
                <strong>19 ms</strong>
                <small>
                  92.1% cache hit
                </small>
              </article>
            </div>

            <Link
              className="edge-green-button is-full"
              to="/simulator"
            >
              Inspect decision
              <span>↗</span>
            </Link>
          </section>

          <section className="activity-card">
            <header>
              <div>
                <span>
                  ACTIVITY FEED
                </span>
                <strong>
                  Network events
                </strong>
              </div>
              <small>
                {paused
                  ? "PAUSED"
                  : "LIVE"}
              </small>
            </header>

            <div>
              {activity.map(
                (item) => (
                  <article key={item.id}>
                    <time>
                      {item.time}
                    </time>
                    <i
                      className={`is-${item.tone}`}
                    />
                    <div>
                      <strong>
                        {item.title}
                      </strong>
                      <small>
                        {item.detail}
                      </small>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>
        </aside>
      </div>

      <div className="live-bottom-grid">
        <article>
          <span>ORIGIN HEALTH</span>
          <strong>99.9%</strong>
          <small>
            All services responding
          </small>
        </article>
        <article>
          <span>BANDWIDTH SAVED</span>
          <strong>4.8 TB</strong>
          <small>
            Estimated through caching
          </small>
        </article>
        <article>
          <span>ERROR RATE</span>
          <strong>0.03%</strong>
          <small>
            Below operational threshold
          </small>
        </article>
        <article>
          <span>FAILOVER TIME</span>
          <strong>280 ms</strong>
          <small>
            Predicted recovery response
          </small>
        </article>
      </div>
    </section>
  );
}