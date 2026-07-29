import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../components/auth/AuthContext";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import LiveNetworkDashboard from "../components/dashboard/LiveNetworkDashboard";

import {
  ErrorState,
  LoadingSkeleton,
} from "../components/feedback/AsyncState";

import {
  dashboardService,
} from "../services/dashboardService";

import type {
  DashboardActivity,
  DashboardEdgeNode,
  DashboardMetric,
  DashboardSnapshot,
} from "../types/dashboard";


interface RecentSimulation {
  id: string;
  name: string;
  route: string;
  latency: string;
  cacheHit: string;
  status: "Completed";
  time: string;
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


function formatMetricValue(
  metric: DashboardMetric,
  snapshot: DashboardSnapshot,
) {
  switch (metric.key) {
    case "requests":
      return formatRequestRate(
        metric.value,
      );

    case "latency":
      return `${Math.round(
        metric.value,
      )} ms`;

    case "cache":
      return `${metric.value.toFixed(
        1,
      )}%`;

    case "nodes":
      return (
        `${snapshot.healthyNodes}` +
        ` / ${snapshot.totalNodes}`
      );

    default:
      return `${metric.value} ${metric.unit}`;
  }
}


function formatMetricChange(
  metric: DashboardMetric,
) {
  if (metric.changePercent === 0) {
    return "0.0%";
  }

  const prefix =
    metric.changePercent > 0
      ? "+"
      : "";

  return (
    `${prefix}` +
    `${metric.changePercent.toFixed(
      1,
    )}%`
  );
}


function formatRelativeTime(
  dateValue: string,
) {
  const timestamp =
    new Date(dateValue).getTime();

  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const seconds = Math.max(
    0,
    Math.round(
      (
        Date.now() -
        timestamp
      ) / 1000,
    ),
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  return `${days} day${
    days === 1 ? "" : "s"
  } ago`;
}


function createSimulationId(
  activity: DashboardActivity,
) {
  const numberValue = Number(
    activity.id.replace(
      "simulation-",
      "",
    ),
  );

  if (
    Number.isFinite(numberValue)
  ) {
    return `SIM-${String(
      numberValue,
    ).padStart(6, "0")}`;
  }

  return activity.id.toUpperCase();
}


function createRecentSimulations(
  snapshot: DashboardSnapshot,
): RecentSimulation[] {
  return snapshot.activity.map(
    (activity, index) => {
      const [
        nameValue,
        routeValue,
      ] = activity.detail.split(
        " · ",
      );

      return {
        id:
          createSimulationId(
            activity,
          ),
        name:
          nameValue ||
          "CDN simulation",
        route:
          routeValue ||
          snapshot.routeDecision
            .selectedRoute
            .join(" → "),
        latency:
          index === 0
            ? `${snapshot.globalLatencyMs} ms`
            : "—",
        cacheHit:
          index === 0
            ? `${snapshot.cacheHitRate.toFixed(
                1,
              )}%`
            : "—",
        status: "Completed",
        time:
          formatRelativeTime(
            activity.occurredAt,
          ),
      };
    },
  );
}


function findNode(
  nodes: DashboardEdgeNode[],
  code: string,
) {
  return nodes.find(
    (node) =>
      node.code === code,
  );
}


function nodeLatency(
  nodes: DashboardEdgeNode[],
  code: string,
) {
  const node = findNode(
    nodes,
    code,
  );

  return node
    ? `${node.latencyMs} ms`
    : "—";
}


export default function DashboardPage() {
  const {
    token,
    user,
  } = useAuth();

  const [
    snapshot,
    setSnapshot,
  ] = useState<
    DashboardSnapshot | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadDashboard =
    useCallback(async () => {
      if (!token) {
        setError(
          "Your authenticated session is unavailable.",
        );

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const nextSnapshot =
          await dashboardService
            .getSnapshot(token);

        setSnapshot(
          nextSnapshot,
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : (
                "Dashboard data could " +
                "not be loaded."
              ),
        );
      } finally {
        setIsLoading(false);
      }
    }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const recentSimulations =
    useMemo(
      () =>
        snapshot
          ? createRecentSimulations(
              snapshot,
            )
          : [],
      [snapshot],
    );

  if (isLoading) {
    return (
      <DashboardLayout>
        <section className="dashboard-overview">
          <header className="dashboard-overview-heading">
            <div>
              <span>
                NETWORK OVERVIEW
              </span>

              <h1>
                Loading your network.
              </h1>

              <p>
                Retrieving metrics, routes,
                and node health.
              </p>
            </div>
          </header>

          <LoadingSkeleton
            cards={4}
            rows={3}
          />
        </section>
      </DashboardLayout>
    );
  }

  if (!snapshot) {
    return (
      <DashboardLayout>
        <section className="dashboard-overview">
          <header className="dashboard-overview-heading">
            <div>
              <span>
                NETWORK OVERVIEW
              </span>

              <h1>
                Dashboard unavailable.
              </h1>

              <p>
                EdgeMind could not retrieve
                the latest network snapshot.
              </p>
            </div>
          </header>

          <ErrorState
            title="Dashboard data unavailable"
            message={
              error ||
              "The dashboard request could not be completed."
            }
            retryLabel="Retry dashboard"
            onRetry={() => {
              void loadDashboard();
            }}
          />
        </section>
      </DashboardLayout>
    );
  }

  const selectedRoute =
    snapshot.routeDecision
      .selectedRoute;

  const selectedCodes =
    new Set(selectedRoute);

  const healthScore =
    snapshot.totalNodes > 0
      ? Math.round(
          (
            snapshot.healthyNodes /
            snapshot.totalNodes
          ) * 100,
        )
      : 0;

  const edgeAvailability =
    snapshot.totalNodes > 0
      ? (
          (
            snapshot.healthyNodes /
            snapshot.totalNodes
          ) * 100
        ).toFixed(1)
      : "0.0";

  return (
    <DashboardLayout>
      <section className="dashboard-overview">
        <header className="dashboard-overview-heading">
          <div>
            <span>
              NETWORK OVERVIEW
            </span>

            <h1>
              Good to see you
              {user?.name
                ? `, ${user.name.split(
                    " ",
                  )[0]}`
                : ""}
              .
            </h1>

            <p>
              Your dashboard is connected
              to the EdgeMind API and
              SQLite database.
            </p>
          </div>

          <Link
            className="dashboard-primary-action"
            to="/simulator"
          >
            New simulation
            <span>↗</span>
          </Link>
        </header>

        <div className="dashboard-metric-grid">
          {snapshot.metrics.map(
            (metric) => (
              <article
                key={metric.key}
                className={[
                  "dashboard-metric-card",
                  `is-${metric.tone}`,
                ].join(" ")}
              >
                <div className="dashboard-metric-card-top">
                  <span>
                    {metric.label.toUpperCase()}
                  </span>

                  <i />
                </div>

                <div className="dashboard-metric-value">
                  <strong>
                    {formatMetricValue(
                      metric,
                      snapshot,
                    )}
                  </strong>

                  <span>
                    {formatMetricChange(
                      metric,
                    )}
                  </span>
                </div>

                <p>
                  {metric.detail}
                </p>

                <div
                  className="dashboard-metric-chart"
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            ),
          )}
        </div>

        <div className="dashboard-overview-grid">
          <section className="dashboard-network-card">
            <header>
              <div>
                <span>
                  LIVE NETWORK
                </span>

                <strong>
                  Global edge activity
                </strong>
              </div>

              <small>
                <i />
                DATABASE CONNECTED
              </small>
            </header>

            <div className="dashboard-network-map">
              <div className="dashboard-network-grid" />

              <svg
                viewBox="0 0 1000 420"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="dashboardRouteGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#16d98b"
                    />

                    <stop
                      offset="52%"
                      stopColor="#55ffb5"
                    />

                    <stop
                      offset="100%"
                      stopColor="#d5ffe9"
                    />
                  </linearGradient>
                </defs>

                <path
                  className="dashboard-route-shadow"
                  d="M90 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 700 113C765 79 824 205 890 248"
                />

                <path
                  className="dashboard-route-main"
                  d="M90 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 700 113C765 79 824 205 890 248"
                />
              </svg>

              <div
                className={[
                  "dashboard-map-node",
                  "node-waw",
                  selectedCodes.has("WAW")
                    ? "is-selected"
                    : "",
                ].join(" ")}
              >
                <span />
                <strong>WAW</strong>
                <small>
                  {nodeLatency(
                    snapshot.nodes,
                    "WAW",
                  )}
                </small>
              </div>

              <div
                className={[
                  "dashboard-map-node",
                  "node-fra",
                  selectedCodes.has("FRA")
                    ? "is-selected"
                    : "",
                ].join(" ")}
              >
                <span />
                <strong>FRA</strong>
                <small>
                  {nodeLatency(
                    snapshot.nodes,
                    "FRA",
                  )}
                </small>
              </div>

              <div
                className={[
                  "dashboard-map-node",
                  "node-lon",
                  selectedCodes.has("LON")
                    ? "is-selected"
                    : "",
                ].join(" ")}
              >
                <span />
                <strong>LON</strong>
                <small>
                  {nodeLatency(
                    snapshot.nodes,
                    "LON",
                  )}
                </small>
              </div>

              <div
                className={[
                  "dashboard-map-node",
                  "node-nyc",
                  selectedCodes.has("NYC")
                    ? "is-selected"
                    : "",
                ].join(" ")}
              >
                <span />
                <strong>NYC</strong>
                <small>
                  {nodeLatency(
                    snapshot.nodes,
                    "NYC",
                  )}
                </small>
              </div>

              <div
                className={[
                  "dashboard-map-node",
                  "node-sin",
                  selectedCodes.has("SIN")
                    ? "is-selected"
                    : "",
                ].join(" ")}
              >
                <span />
                <strong>SIN</strong>
                <small>
                  {nodeLatency(
                    snapshot.nodes,
                    "SIN",
                  )}
                </small>
              </div>

              <div className="dashboard-route-summary">
                <span>
                  OPTIMAL ROUTE
                </span>

                <strong>
                  {selectedRoute.length
                    ? selectedRoute.join(
                        " → ",
                      )
                    : "No route yet"}
                </strong>

                <small>
                  {
                    snapshot
                      .routeDecision
                      .confidence
                  }
                  % routing confidence
                </small>
              </div>
            </div>
          </section>

          <aside className="dashboard-health-card">
            <header>
              <span>
                SYSTEM HEALTH
              </span>

              <strong>
                {healthScore >= 90
                  ? "Operational"
                  : "Needs attention"}
              </strong>
            </header>

            <div className="dashboard-health-score">
              <div>
                <strong>
                  {healthScore}
                </strong>

                <span>
                  / 100
                </span>
              </div>

              <p>
                {healthScore >= 90
                  ? "Excellent network health"
                  : "Review node health"}
              </p>
            </div>

            <div className="dashboard-health-list">
              <article>
                <span>
                  Edge availability
                </span>

                <strong>
                  {edgeAvailability}%
                </strong>
              </article>

              <article>
                <span>
                  Origin health
                </span>

                <strong>
                  {
                    snapshot
                      .originHealthPercent
                  }
                  %
                </strong>
              </article>

              <article>
                <span>
                  Routing confidence
                </span>

                <strong>
                  {
                    snapshot
                      .routeDecision
                      .confidence
                  }
                  %
                </strong>
              </article>

              <article>
                <span>
                  Cache efficiency
                </span>

                <strong>
                  {
                    snapshot
                      .cacheHitRate
                      .toFixed(1)
                  }
                  %
                </strong>
              </article>
            </div>

            <Link
              to="/settings"
              className="dashboard-secondary-action"
            >
              View system settings
            </Link>
          </aside>
        </div>

        <section className="dashboard-recent-card">
          <header>
            <div>
              <span>
                RECENT SIMULATIONS
              </span>

              <strong>
                Latest network tests
              </strong>
            </div>

            <Link to="/simulations">
              View all
              <span>↗</span>
            </Link>
          </header>

          <div className="dashboard-simulation-table">
            <div className="dashboard-simulation-row is-heading">
              <span>SIMULATION</span>
              <span>ROUTE</span>
              <span>LATENCY</span>
              <span>CACHE HIT</span>
              <span>STATUS</span>
              <span>UPDATED</span>
            </div>

            {recentSimulations.length === 0 ? (
              <div className="dashboard-simulation-row">
                <span>
                  <strong>
                    No simulations yet
                  </strong>

                  <small>
                    Run your first test
                  </small>
                </span>

                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
              </div>
            ) : (
              recentSimulations.map(
                (simulation) => (
                  <div
                    key={simulation.id}
                    className="dashboard-simulation-row"
                  >
                    <span>
                      <strong>
                        {simulation.name}
                      </strong>

                      <small>
                        {simulation.id}
                      </small>
                    </span>

                    <span>
                      {simulation.route}
                    </span>

                    <span>
                      {simulation.latency}
                    </span>

                    <span>
                      {simulation.cacheHit}
                    </span>

                    <span>
                      <i className="is-completed" />
                      {simulation.status}
                    </span>

                    <span>
                      {simulation.time}
                    </span>
                  </div>
                ),
              )
            )}
          </div>
        </section>

        <section className="dashboard-live-network-section">
          <LiveNetworkDashboard snapshot={snapshot} />
        </section>
      </section>
    </DashboardLayout>
  );
}
