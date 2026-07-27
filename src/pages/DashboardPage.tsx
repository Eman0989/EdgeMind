import {
  Link,
} from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import LiveNetworkDashboard from "../components/dashboard/LiveNetworkDashboard";

interface OverviewMetric {
  label: string;
  value: string;
  change: string;
  detail: string;
  tone:
    | "cyan"
    | "violet"
    | "green"
    | "orange";
}

interface RecentSimulation {
  id: string;
  name: string;
  route: string;
  latency: string;
  cacheHit: string;
  status:
    | "Completed"
    | "Draft";
  time: string;
}

const overviewMetrics: OverviewMetric[] = [
  {
    label: "TOTAL REQUESTS",
    value: "18.4K",
    change: "+8.2%",
    detail: "Across active simulations",
    tone: "cyan",
  },
  {
    label: "AVERAGE LATENCY",
    value: "12 ms",
    change: "-6 ms",
    detail: "Against origin delivery",
    tone: "violet",
  },
  {
    label: "CACHE HIT RATE",
    value: "94.8%",
    change: "+1.4%",
    detail: "Global network average",
    tone: "green",
  },
  {
    label: "ACTIVE EDGE NODES",
    value: "33",
    change: "100%",
    detail: "All nodes operational",
    tone: "orange",
  },
];

const recentSimulations:
  RecentSimulation[] = [
    {
      id: "SIM-042",
      name: "European SaaS Traffic",
      route: "WAW → FRA → LON",
      latency: "12 ms",
      cacheHit: "96.1%",
      status: "Completed",
      time: "12 minutes ago",
    },
    {
      id: "SIM-041",
      name: "Global Media Delivery",
      route: "SIN → HKG → SFO",
      latency: "31 ms",
      cacheHit: "91.4%",
      status: "Completed",
      time: "1 hour ago",
    },
    {
      id: "SIM-040",
      name: "Black Friday Load Test",
      route: "NYC → IAD → DFW",
      latency: "18 ms",
      cacheHit: "89.7%",
      status: "Draft",
      time: "Yesterday",
    },
  ];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <section className="dashboard-overview">
        <header className="dashboard-overview-heading">
          <div>
            <span>
              NETWORK OVERVIEW
            </span>

            <h1>
              Good to see you.
            </h1>

            <p>
              Your edge network is healthy.
              Review performance or begin a
              new CDN simulation.
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
          {overviewMetrics.map(
            (metric) => (
              <article
                key={metric.label}
                className={[
                  "dashboard-metric-card",
                  `is-${metric.tone}`,
                ].join(" ")}
              >
                <div className="dashboard-metric-card-top">
                  <span>
                    {metric.label}
                  </span>

                  <i />
                </div>

                <div className="dashboard-metric-value">
                  <strong>
                    {metric.value}
                  </strong>

                  <span>
                    {metric.change}
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
                REAL-TIME
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
                      stopColor="#7c6fff"
                    />
                    <stop
                      offset="52%"
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
                  d="M90 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 700 113C765 79 824 205 890 248"
                />

                <path
                  className="dashboard-route-main"
                  d="M90 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 700 113C765 79 824 205 890 248"
                />
              </svg>

              <div className="dashboard-map-node node-waw">
                <span />
                <strong>
                  WAW
                </strong>
                <small>
                  7 ms
                </small>
              </div>

              <div className="dashboard-map-node node-fra is-selected">
                <span />
                <strong>
                  FRA
                </strong>
                <small>
                  9 ms
                </small>
              </div>

              <div className="dashboard-map-node node-lon is-selected">
                <span />
                <strong>
                  LON
                </strong>
                <small>
                  12 ms
                </small>
              </div>

              <div className="dashboard-map-node node-nyc">
                <span />
                <strong>
                  NYC
                </strong>
                <small>
                  41 ms
                </small>
              </div>

              <div className="dashboard-map-node node-sin">
                <span />
                <strong>
                  SIN
                </strong>
                <small>
                  86 ms
                </small>
              </div>

              <div className="dashboard-route-summary">
                <span>
                  OPTIMAL ROUTE
                </span>

                <strong>
                  WAW → FRA → LON
                </strong>

                <small>
                  96% routing confidence
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
                Operational
              </strong>
            </header>

            <div className="dashboard-health-score">
              <div>
                <strong>
                  98
                </strong>

                <span>
                  / 100
                </span>
              </div>

              <p>
                Excellent network health
              </p>
            </div>

            <div className="dashboard-health-list">
              <article>
                <span>
                  Edge availability
                </span>

                <strong>
                  100%
                </strong>
              </article>

              <article>
                <span>
                  Origin health
                </span>

                <strong>
                  99.9%
                </strong>
              </article>

              <article>
                <span>
                  Routing confidence
                </span>

                <strong>
                  96%
                </strong>
              </article>

              <article>
                <span>
                  Cache efficiency
                </span>

                <strong>
                  94.8%
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
              <span>
                SIMULATION
              </span>

              <span>
                ROUTE
              </span>

              <span>
                LATENCY
              </span>

              <span>
                CACHE HIT
              </span>

              <span>
                STATUS
              </span>

              <span>
                UPDATED
              </span>
            </div>

            {recentSimulations.map(
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
                    <i
                      className={
                        simulation.status ===
                        "Completed"
                          ? "is-completed"
                          : "is-draft"
                      }
                    />

                    {simulation.status}
                  </span>

                  <span>
                    {simulation.time}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="dashboard-live-network-section">
          <LiveNetworkDashboard />
        </section>
      </section>
    </DashboardLayout>
  );
}