import {
  useMemo,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./SimulationResultScreen.css";

import type {
  AudienceRegion,
  CompletedSimulation,
  ContentType,
  OptimizationGoal,
  OriginRegion,
  TrafficProfile,
} from "../../types/simulation";
import {
  simulationService,
} from "../../services/simulationService";

interface ResultLocationState {
  simulation?: CompletedSimulation;
}

const originLabels: Record<
  OriginRegion,
  string
> = {
  warsaw: "Warsaw, Poland",
  frankfurt: "Frankfurt, Germany",
  virginia: "Virginia, USA",
  singapore: "Singapore",
  sydney: "Sydney, Australia",
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

const contentLabels: Record<
  ContentType,
  string
> = {
  web: "Web assets",
  api: "API responses",
  video: "Video media",
  downloads: "Large downloads",
};

const trafficLabels: Record<
  TrafficProfile,
  string
> = {
  steady: "Steady",
  bursty: "Bursty",
  event: "Major event",
  growth: "Gradual growth",
};

const optimizationLabels: Record<
  OptimizationGoal,
  string
> = {
  balanced: "Balanced delivery",
  latency: "Lowest latency",
  cache: "Cache efficiency",
  resilience: "High resilience",
};

function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
  ).format(value);
}

function formatCompletedAt(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Just completed";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function createAlternativeRoute(
  selectedRoute: string,
) {
  const routeParts = selectedRoute
    .split("→")
    .map((part) => part.trim());

  if (routeParts.length < 3) {
    return "Origin → Regional edge";
  }

  const [
    first,
    ,
    last,
  ] = routeParts;

  const alternativeMiddle =
    last === "LON"
      ? "AMS"
      : last === "NYC"
        ? "IAD"
        : last === "TYO"
          ? "HKG"
          : last === "SIN"
            ? "DXB"
            : "AMS";

  return [
    first,
    alternativeMiddle,
    last,
  ].join(" → ");
}

export default function SimulationResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState =
    location.state as
      | ResultLocationState
      | null;

  const simulation =
    locationState?.simulation ??
    simulationService.getLast();

  const comparison = useMemo(() => {
    if (!simulation) {
      return null;
    }

    const {
      config,
      result,
    } = simulation;

    const alternativeLatency =
      result.latencyMs +
      (config.optimizationGoal ===
      "latency"
        ? 8
        : 6);

    const originLatency =
      result.latencyMs +
      Math.max(
        28,
        Math.round(
          result.latencyMs * 2.4,
        ),
      );

    const latencyImprovement =
      Math.round(
        ((originLatency -
          result.latencyMs) /
          originLatency) *
          100,
      );

    const cacheDecision =
      result.cacheHitRate >= 75
        ? "Serve from edge cache"
        : "Revalidate with origin";

    const originReduction =
      Math.round(
        (1 -
          result.originRequests /
            config.requestsPerSecond) *
          100,
      );

    return {
      alternativeRoute:
        createAlternativeRoute(
          result.route,
        ),
      alternativeLatency,
      originLatency,
      latencyImprovement,
      cacheDecision,
      originReduction,
    };
  }, [simulation]);

  if (
    !simulation ||
    !comparison
  ) {
    return (
      <section className="result-empty">
        <span>
          STEP 10 / SIMULATION RESULT
        </span>

        <h1>
          No completed simulation found.
        </h1>

        <p>
          Run a CDN simulation first. The
          completed route and performance
          analysis will appear here.
        </p>

        <Link
          className="result-green-button"
          to="/simulator"
        >
          Open simulator
          <span>↗</span>
        </Link>
      </section>
    );
  }

  const {
    config,
    result,
    completedAt,
  } = simulation;

  const cacheExplanation =
    result.cacheHitRate >= 90
      ? "The configured TTL and warm-cache policy keep most eligible responses at the edge, sharply reducing origin traffic."
      : result.cacheHitRate >= 70
        ? "The cache policy provides meaningful edge reuse while still sending a moderate share of requests to the origin."
        : "The current traffic and TTL settings limit edge reuse, so more requests must be revalidated with the origin.";

  const mlExplanation = [
    `The selected route ${result.route} produced the lowest predicted latency for ${audienceLabels[config.audience]}.`,
    config.aiRouting
      ? `AI route scoring compared latency, congestion, cache readiness, and fallback capacity with ${result.confidence}% confidence.`
      : "AI route scoring was disabled, so the route was chosen using the configured optimization rules.",
    config.failover
      ? "Automatic failover remained available, allowing traffic to move to a healthy alternative edge if the selected path degrades."
      : "Automatic failover was disabled, so this result prioritizes the chosen path without a managed fallback.",
    config.optimizationGoal ===
    "cache"
      ? "Cache efficiency was weighted most heavily during route selection."
      : config.optimizationGoal ===
          "latency"
        ? "Predicted response time was weighted most heavily during route selection."
        : config.optimizationGoal ===
            "resilience"
          ? "Fallback capacity and route stability were weighted most heavily."
          : "Latency, cache efficiency, and resilience were balanced during scoring.",
  ];

  return (
    <section className="simulation-result-screen">
      <header className="result-heading">
        <div>
          <span>
            STEP 10 / SIMULATION RESULT
          </span>

          <h1>
            Route selected.
          </h1>

          <p>
            Review the delivery path, latency
            comparison, cache decision, and
            model explanation for this run.
          </p>
        </div>

        <div className="result-heading-actions">
          <button
            className="result-outline-button"
            type="button"
            onClick={() => {
              navigate("/simulator");
            }}
          >
            Edit configuration
          </button>

          <button
            className="result-green-button"
            type="button"
            onClick={() => {
              navigate("/simulations");
            }}
          >
            View saved runs
            <span>↗</span>
          </button>
        </div>
      </header>

      <div className="result-summary-grid">
        <article>
          <span>
            SELECTED ROUTE
          </span>

          <strong>
            {result.route}
          </strong>

          <small>
            {result.confidence}% model
            confidence
          </small>
        </article>

        <article>
          <span>
            DELIVERY LATENCY
          </span>

          <strong>
            {result.latencyMs} ms
          </strong>

          <small>
            {
              comparison.latencyImprovement
            }
            % faster than origin
          </small>
        </article>

        <article>
          <span>
            CACHE HIT RATE
          </span>

          <strong>
            {result.cacheHitRate}%
          </strong>

          <small>
            {
              comparison.originReduction
            }
            % origin-load reduction
          </small>
        </article>

        <article>
          <span>
            BANDWIDTH SAVED
          </span>

          <strong>
            {result.bandwidthSavedGb} GB
          </strong>

          <small>
            estimated per hour
          </small>
        </article>
      </div>

      <div className="result-main-grid">
        <section className="result-route-card">
          <header>
            <div>
              <span>
                ROUTE ANALYSIS
              </span>

              <strong>
                Selected delivery path
              </strong>
            </div>

            <div className="result-simulation-id">
              <span>
                SIMULATION ID
              </span>

              <strong>
                {result.id}
              </strong>
            </div>
          </header>

          <div className="result-route-visual">
            <div
              className="result-route-grid"
              aria-hidden="true"
            />

            <svg
              viewBox="0 0 1000 360"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="resultRouteGradient"
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
                    offset="55%"
                    stopColor="#2ee6d6"
                  />
                  <stop
                    offset="100%"
                    stopColor="#b8ffe4"
                  />
                </linearGradient>
              </defs>

              <path
                className="result-route-shadow"
                d="M120 235C250 155 340 212 472 162C600 112 717 166 865 102"
              />

              <path
                className="result-route-line"
                d="M120 235C250 155 340 212 472 162C600 112 717 166 865 102"
              />

              <path
                className="result-alternative-line"
                d="M120 250C255 300 365 250 500 275C630 300 720 245 865 220"
              />

              <circle
                className="result-route-packet"
                r="5"
              >
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M120 235C250 155 340 212 472 162C600 112 717 166 865 102"
                />
              </circle>
            </svg>

            <div className="result-route-node is-origin">
              <i />
              <span>ORIGIN</span>
              <strong>
                {
                  originLabels[
                    config.origin
                  ]
                }
              </strong>
            </div>

            <div className="result-route-node is-edge-one">
              <i />
              <span>EDGE 01</span>
              <strong>
                {
                  result.route.split(
                    "→",
                  )[1]?.trim() ??
                  "Regional edge"
                }
              </strong>
            </div>

            <div className="result-route-node is-edge-two">
              <i />
              <span>EDGE 02</span>
              <strong>
                {
                  result.route.split(
                    "→",
                  )[2]?.trim() ??
                  "Audience edge"
                }
              </strong>
            </div>

            <div className="result-route-node is-users">
              <i />
              <span>AUDIENCE</span>
              <strong>
                {
                  audienceLabels[
                    config.audience
                  ]
                }
              </strong>
            </div>

            <div className="result-route-badge">
              <span>
                SELECTED
              </span>

              <strong>
                {result.route}
              </strong>

              <small>
                Lowest predicted delivery
                cost
              </small>
            </div>
          </div>

          <footer>
            <span>
              <i className="is-selected" />
              Selected route
            </span>

            <span>
              <i className="is-alternative" />
              Alternative route
            </span>
          </footer>
        </section>

        <aside className="result-side-column">
          <section className="result-decision-card">
            <header>
              <span>
                CACHE DECISION
              </span>

              <strong>
                {
                  comparison.cacheDecision
                }
              </strong>
            </header>

            <div className="result-cache-score">
              <div>
                <strong>
                  {result.cacheHitRate}%
                </strong>

                <span>
                  predicted hit rate
                </span>
              </div>

              <div>
                <i
                  style={{
                    width: `${result.cacheHitRate}%`,
                  }}
                />
              </div>
            </div>

            <p>
              {cacheExplanation}
            </p>

            <div className="result-cache-facts">
              <span>
                <small>
                  CACHE TTL
                </small>

                <strong>
                  {formatNumber(
                    config.cacheTtlSeconds,
                  )}{" "}
                  sec
                </strong>
              </span>

              <span>
                <small>
                  WARM CACHE
                </small>

                <strong>
                  {config.warmCache
                    ? "Enabled"
                    : "Disabled"}
                </strong>
              </span>

              <span>
                <small>
                  ORIGIN RPS
                </small>

                <strong>
                  {formatNumber(
                    result.originRequests,
                  )}
                </strong>
              </span>
            </div>
          </section>

          <section className="result-confidence-card">
            <header>
              <span>
                ML CONFIDENCE
              </span>

              <strong>
                {result.confidence}%
              </strong>
            </header>

            <div>
              <i
                style={{
                  width: `${result.confidence}%`,
                }}
              />
            </div>

            <p>
              The model found a stable
              advantage for the selected
              route under the configured
              traffic conditions.
            </p>
          </section>
        </aside>
      </div>

      <div className="result-analysis-grid">
        <section className="result-latency-card">
          <header>
            <span>
              LATENCY COMPARISON
            </span>

            <strong>
              Route performance
            </strong>
          </header>

          <div className="result-latency-list">
            <article className="is-selected">
              <div>
                <span>
                  SELECTED ROUTE
                </span>

                <strong>
                  {result.route}
                </strong>
              </div>

              <div>
                <strong>
                  {result.latencyMs} ms
                </strong>

                <i
                  style={{
                    width: "36%",
                  }}
                />
              </div>
            </article>

            <article>
              <div>
                <span>
                  ALTERNATIVE EDGE
                </span>

                <strong>
                  {
                    comparison.alternativeRoute
                  }
                </strong>
              </div>

              <div>
                <strong>
                  {
                    comparison.alternativeLatency
                  }{" "}
                  ms
                </strong>

                <i
                  style={{
                    width: "57%",
                  }}
                />
              </div>
            </article>

            <article>
              <div>
                <span>
                  DIRECT ORIGIN
                </span>

                <strong>
                  No edge acceleration
                </strong>
              </div>

              <div>
                <strong>
                  {
                    comparison.originLatency
                  }{" "}
                  ms
                </strong>

                <i
                  style={{
                    width: "92%",
                  }}
                />
              </div>
            </article>
          </div>
        </section>

        <section className="result-ml-card">
          <header>
            <span>
              ML EXPLANATION
            </span>

            <strong>
              Why this route won
            </strong>
          </header>

          <div className="result-explanation-list">
            {mlExplanation.map(
              (explanation, index) => (
                <article
                  key={explanation}
                >
                  <span>
                    {String(
                      index + 1,
                    ).padStart(2, "0")}
                  </span>

                  <p>
                    {explanation}
                  </p>
                </article>
              ),
            )}
          </div>
        </section>
      </div>

      <section className="result-config-card">
        <header>
          <div>
            <span>
              SIMULATION CONFIGURATION
            </span>

            <strong>
              {config.name}
            </strong>
          </div>

          <small>
            Completed{" "}
            {formatCompletedAt(
              completedAt,
            )}
          </small>
        </header>

        <div className="result-config-grid">
          <article>
            <span>ORIGIN</span>
            <strong>
              {
                originLabels[
                  config.origin
                ]
              }
            </strong>
          </article>

          <article>
            <span>AUDIENCE</span>
            <strong>
              {
                audienceLabels[
                  config.audience
                ]
              }
            </strong>
          </article>

          <article>
            <span>CONTENT</span>
            <strong>
              {
                contentLabels[
                  config.contentType
                ]
              }
            </strong>
          </article>

          <article>
            <span>TRAFFIC</span>
            <strong>
              {
                trafficLabels[
                  config.trafficProfile
                ]
              }
            </strong>
          </article>

          <article>
            <span>REQUEST RATE</span>
            <strong>
              {formatNumber(
                config.requestsPerSecond,
              )}{" "}
              RPS
            </strong>
          </article>

          <article>
            <span>PAYLOAD</span>
            <strong>
              {formatNumber(
                config.payloadSizeKb,
              )}{" "}
              KB
            </strong>
          </article>

          <article>
            <span>OPTIMIZATION</span>
            <strong>
              {
                optimizationLabels[
                  config.optimizationGoal
                ]
              }
            </strong>
          </article>

          <article>
            <span>FAILOVER</span>
            <strong>
              {config.failover
                ? "Enabled"
                : "Disabled"}
            </strong>
          </article>
        </div>
      </section>

      <footer className="result-footer-actions">
        <Link
          className="result-outline-button"
          to="/dashboard"
        >
          Return to dashboard
        </Link>

        <Link
          className="result-green-button"
          to="/simulator"
        >
          Run another simulation
          <span>↗</span>
        </Link>
      </footer>
    </section>
  );
}