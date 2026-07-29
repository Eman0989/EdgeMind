import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import type {
  ActivitySeverity,
  DashboardEdgeNode,
  DashboardSnapshot,
} from "../../types/dashboard";

import "./LiveNetworkDashboard.css";


interface LiveNetworkDashboardProps {
  snapshot: DashboardSnapshot;
}


type NodeState =
  | "healthy"
  | "watch"
  | "selected";


function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}


function formatRequestRate(
  value: number,
) {
  if (value >= 1000) {
    return `${(
      value / 1000
    ).toFixed(1)}K`;
  }

  return value.toLocaleString();
}


function formatNodeRequests(
  value: number,
) {
  if (value >= 1000) {
    return `${(
      value / 1000
    ).toFixed(1)}K/s`;
  }

  return `${value}/s`;
}


function formatBandwidth(
  gigabytes: number,
) {
  if (gigabytes >= 1000) {
    return `${(
      gigabytes / 1000
    ).toFixed(1)} TB`;
  }

  return `${gigabytes.toFixed(
    1,
  )} GB`;
}


function formatActivityTime(
  dateValue: string,
) {
  const date = new Date(
    dateValue,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "--:--:--";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    },
  ).format(date);
}


function getActivityTone(
  severity: ActivitySeverity,
) {
  switch (severity) {
    case "success":
      return "route";

    case "warning":
    case "error":
      return "warning";

    default:
      return "health";
  }
}


function getNodeState(
  node: DashboardEdgeNode,
  selectedCodes: Set<string>,
): NodeState {
  if (
    selectedCodes.has(
      node.code,
    )
  ) {
    return "selected";
  }

  if (
    node.status === "watch" ||
    node.status === "offline"
  ) {
    return "watch";
  }

  return "healthy";
}


const NODE_DISPLAY_OFFSETS: Record<
  string,
  {
    x: number;
    y: number;
  }
> = {
  LON: {
    x: -5,
    y: 2,
  },
  AMS: {
    x: -1,
    y: -6,
  },
  FRA: {
    x: 2,
    y: 6,
  },
  WAW: {
    x: 6,
    y: -1,
  },
  NYC: {
    x: 3,
    y: -4,
  },
  IAD: {
    x: -3,
    y: 4,
  },
};


function getNodePosition(
  node: DashboardEdgeNode,
) {
  const geographicX =
    (
      (
        node.longitude +
        180
      ) /
      360
    ) *
    100;

  const geographicY =
    (
      (
        90 -
        node.latitude
      ) /
      180
    ) *
    100;

  const offset =
    NODE_DISPLAY_OFFSETS[
      node.code
    ] ?? {
      x: 0,
      y: 0,
    };

  return {
    x: clamp(
      geographicX +
        offset.x,
      6,
      94,
    ),
    y: clamp(
      geographicY +
        offset.y,
      14,
      84,
    ),
  };
}


export default function LiveNetworkDashboard({
  snapshot,
}: LiveNetworkDashboardProps) {
  const [
    region,
    setRegion,
  ] = useState("All");

  const [
    selectedCode,
    setSelectedCode,
  ] = useState(
    snapshot.routeDecision
      .selectedRoute[0] ??
      snapshot.nodes[0]?.code ??
      "",
  );

  const [
    paused,
    setPaused,
  ] = useState(false);

  const selectedCodes =
    useMemo(
      () =>
        new Set(
          snapshot.routeDecision
            .selectedRoute,
        ),
      [
        snapshot
          .routeDecision
          .selectedRoute,
      ],
    );

  const regions =
    useMemo(
      () => [
        "All",
        ...Array.from(
          new Set(
            snapshot.nodes.map(
              (node) =>
                node.region,
            ),
          ),
        ),
      ],
      [snapshot.nodes],
    );

  const visibleNodes =
    useMemo(
      () =>
        region === "All"
          ? snapshot.nodes
          : snapshot.nodes.filter(
              (node) =>
                node.region === region,
            ),
      [
        region,
        snapshot.nodes,
      ],
    );

  const selectedNode =
    snapshot.nodes.find(
      (node) =>
        node.code ===
        selectedCode,
    ) ??
    snapshot.nodes[0] ??
    null;

  const selectedRoute =
    snapshot.routeDecision
      .selectedRoute.join(
        " → ",
      );

  const alternativeRoute =
    snapshot.routeDecision
      .alternativeRoute.join(
        " → ",
      );

  const alternativeCacheRate =
    Math.max(
      0,
      snapshot.cacheHitRate -
        3,
    );

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
            Monitor traffic, latency,
            cache efficiency, node health,
            and routing decisions from the
            EdgeMind API.
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
              ? "Resume animation"
              : "Pause animation"}
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
          <span>
            REQUEST RATE
          </span>

          <strong>
            {formatRequestRate(
              snapshot
                .requestRatePerSecond,
            )}
          </strong>

          <small>
            requests per second
          </small>

          <div className="metric-bars">
            {[
              42,
              58,
              47,
              66,
              61,
              76,
              69,
              91,
            ].map(
              (
                height,
                index,
              ) => (
                <i
                  key={index}
                  style={{
                    height:
                      `${height}%`,
                  }}
                />
              ),
            )}
          </div>
        </article>

        <article>
          <span>
            GLOBAL LATENCY
          </span>

          <strong>
            {
              snapshot
                .globalLatencyMs
            }{" "}
            ms
          </strong>

          <small>
            selected route latency
          </small>

          <div className="metric-line" />
        </article>

        <article>
          <span>
            CACHE HIT RATE
          </span>

          <strong>
            {
              snapshot
                .cacheHitRate
                .toFixed(1)
            }
            %
          </strong>

          <small>
            latest cache prediction
          </small>

          <div className="metric-progress">
            <i
              style={{
                width:
                  `${snapshot.cacheHitRate}%`,
              }}
            />
          </div>
        </article>

        <article>
          <span>
            HEALTHY NODES
          </span>

          <strong>
            {snapshot.healthyNodes}
            {" / "}
            {snapshot.totalNodes}
          </strong>

          <small>
            active database nodes
          </small>

          <div className="metric-dots">
            {Array.from({
              length: Math.min(
                snapshot.totalNodes,
                24,
              ),
            }).map(
              (_, index) => (
                <i
                  key={index}
                  className={
                    index >=
                    snapshot.healthyNodes
                      ? "is-watch"
                      : ""
                  }
                />
              ),
            )}
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
                : "API CONNECTED"}
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
              (node) => {
                const position =
                  getNodePosition(
                    node,
                  );

                const state =
                  getNodeState(
                    node,
                    selectedCodes,
                  );

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={[
                      "edge-node",
                      `is-${state}`,
                      selectedCode ===
                      node.code
                        ? "is-focused"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      left:
                        `${position.x}%`,
                      top:
                        `${position.y}%`,
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
                      {node.latencyMs} ms
                    </small>
                  </button>
                );
              },
            )}

            {selectedNode && (
              <div className="node-detail">
                <header>
                  <div>
                    <span>
                      SELECTED NODE
                    </span>

                    <strong>
                      {
                        selectedNode
                          .code
                      }
                      {" · "}
                      {
                        selectedNode
                          .city
                      }
                    </strong>
                  </div>

                  <i
                    className={
                      `is-${getNodeState(
                        selectedNode,
                        selectedCodes,
                      )}`
                    }
                  />
                </header>

                <div>
                  <span>
                    <small>
                      LATENCY
                    </small>

                    <strong>
                      {
                        selectedNode
                          .latencyMs
                      }{" "}
                      ms
                    </strong>
                  </span>

                  <span>
                    <small>
                      LOAD
                    </small>

                    <strong>
                      {
                        selectedNode
                          .loadPercent
                      }
                      %
                    </strong>
                  </span>

                  <span>
                    <small>
                      CACHE HIT
                    </small>

                    <strong>
                      {
                        selectedNode
                          .cacheHitRate
                      }
                      %
                    </strong>
                  </span>

                  <span>
                    <small>
                      REQUESTS
                    </small>

                    <strong>
                      {formatNodeRequests(
                        selectedNode
                          .requestsPerSecond,
                      )}
                    </strong>
                  </span>
                </div>
              </div>
            )}
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
              <span>
                SELECTED
              </span>

              <strong>
                {selectedRoute ||
                  "No route selected"}
              </strong>

              <small>
                {
                  snapshot
                    .routeDecision
                    .reason
                }
              </small>
            </div>

            <div className="confidence">
              <div>
                <span>
                  MODEL CONFIDENCE
                </span>

                <strong>
                  {
                    snapshot
                      .routeDecision
                      .confidence
                  }
                  %
                </strong>
              </div>

              <div>
                <i
                  style={{
                    width:
                      `${snapshot.routeDecision.confidence}%`,
                  }}
                />
              </div>
            </div>

            <div className="route-comparison">
              <article>
                <span>
                  SELECTED PATH
                </span>

                <strong>
                  {
                    snapshot
                      .routeDecision
                      .selectedLatencyMs
                  }{" "}
                  ms
                </strong>

                <small>
                  {
                    snapshot
                      .cacheHitRate
                      .toFixed(1)
                  }
                  % cache hit
                </small>
              </article>

              <article>
                <span>
                  ALTERNATIVE
                </span>

                <strong>
                  {
                    snapshot
                      .routeDecision
                      .alternativeLatencyMs
                  }{" "}
                  ms
                </strong>

                <small>
                  {
                    alternativeCacheRate
                      .toFixed(1)
                  }
                  % cache hit
                </small>
              </article>
            </div>

            {alternativeRoute && (
              <p>
                Alternative route:{" "}
                {alternativeRoute}
              </p>
            )}

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
                  : "DATABASE"}
              </small>
            </header>

            <div>
              {snapshot.activity.length ===
              0 ? (
                <article>
                  <time>
                    --:--:--
                  </time>

                  <i className="is-health" />

                  <div>
                    <strong>
                      No activity yet
                    </strong>

                    <small>
                      Run a simulation to
                      create an event.
                    </small>
                  </div>
                </article>
              ) : (
                snapshot.activity.map(
                  (item) => (
                    <article
                      key={item.id}
                    >
                      <time>
                        {formatActivityTime(
                          item.occurredAt,
                        )}
                      </time>

                      <i
                        className={
                          `is-${getActivityTone(
                            item.severity,
                          )}`
                        }
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
                )
              )}
            </div>
          </section>
        </aside>
      </div>

      <div className="live-bottom-grid">
        <article>
          <span>
            ORIGIN HEALTH
          </span>

          <strong>
            {
              snapshot
                .originHealthPercent
            }
            %
          </strong>

          <small>
            Origin service availability
          </small>
        </article>

        <article>
          <span>
            BANDWIDTH SAVED
          </span>

          <strong>
            {formatBandwidth(
              snapshot
                .bandwidthSavedGb,
            )}
          </strong>

          <small>
            Estimated through caching
          </small>
        </article>

        <article>
          <span>
            ERROR RATE
          </span>

          <strong>
            {
              snapshot
                .errorRatePercent
            }
            %
          </strong>

          <small>
            Current predicted error rate
          </small>
        </article>

        <article>
          <span>
            FAILOVER TIME
          </span>

          <strong>
            {
              snapshot
                .failoverTimeMs
            }{" "}
            ms
          </strong>

          <small>
            Predicted recovery response
          </small>
        </article>
      </div>
    </section>
  );
}
