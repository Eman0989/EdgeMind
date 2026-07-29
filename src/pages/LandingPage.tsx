import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

interface LandingPageProps {
  onReplayIntro: () => void;
}

interface Feature {
  number: string;
  title: string;
  description: string;
  detail: string;
  icon:
    | "route"
    | "cache"
    | "telemetry"
    | "explain";
}

interface ProcessStep {
  number: string;
  label: string;
  title: string;
  description: string;
}

interface EdgeNode {
  code: string;
  city: string;
  latency: string;
  x: number;
  y: number;
  state:
    | "healthy"
    | "selected"
    | "watch";
}

const features: Feature[] = [
  {
    number: "01",
    title: "Intelligent routing",
    description:
      "Compare edge locations using latency, capacity, geography, and predicted congestion.",
    detail:
      "Route scoring · fallback analysis",
    icon: "route",
  },
  {
    number: "02",
    title: "Cache intelligence",
    description:
      "Model cache hits, misses, warm responses, and origin fetches before production.",
    detail:
      "Hit prediction · TTL simulation",
    icon: "cache",
  },
  {
    number: "03",
    title: "Live telemetry",
    description:
      "Inspect request volume, node health, response timing, and route changes in one place.",
    detail:
      "Metrics · activity · health",
    icon: "telemetry",
  },
  {
    number: "04",
    title: "Explainable decisions",
    description:
      "Understand why an edge was selected and compare it with the strongest alternative.",
    detail:
      "Confidence · reasoning · alternatives",
    icon: "explain",
  },
];

const processSteps: ProcessStep[] = [
  {
    number: "01",
    label: "CONFIGURE",
    title: "Define the network",
    description:
      "Choose origins, edge regions, traffic volume, cache rules, and optimization priorities.",
  },
  {
    number: "02",
    label: "SIMULATE",
    title: "Run intelligent traffic",
    description:
      "EdgeMind evaluates routes, predicts latency, and models cache behaviour across the network.",
  },
  {
    number: "03",
    label: "UNDERSTAND",
    title: "Inspect every decision",
    description:
      "Compare the selected route with alternatives and see why the model made its choice.",
  },
];

const edgeNodes: EdgeNode[] = [
  {
    code: "WAW",
    city: "Warsaw",
    latency: "7 ms",
    x: 10,
    y: 68,
    state: "healthy",
  },
  {
    code: "FRA",
    city: "Frankfurt",
    latency: "9 ms",
    x: 31,
    y: 34,
    state: "selected",
  },
  {
    code: "LON",
    city: "London",
    latency: "12 ms",
    x: 50,
    y: 57,
    state: "selected",
  },
  {
    code: "NYC",
    city: "New York",
    latency: "41 ms",
    x: 69,
    y: 27,
    state: "watch",
  },
  {
    code: "SIN",
    city: "Singapore",
    latency: "86 ms",
    x: 88,
    y: 59,
    state: "healthy",
  },
];

function FeatureIcon({
  type,
}: {
  type: Feature["icon"];
}) {
  if (type === "route") {
    return (
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle cx="9" cy="34" r="3" />
        <circle cx="39" cy="13" r="3" />
        <path d="M12 33C19 31 19 19 27 18C32 17 33 14 36 14" />
      </svg>
    );
  }

  if (type === "cache") {
    return (
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <ellipse
          cx="24"
          cy="12"
          rx="14"
          ry="6"
        />
        <path d="M10 12V24C10 27.3 16.3 30 24 30C31.7 30 38 27.3 38 24V12" />
        <path d="M10 24V35C10 38.3 16.3 41 24 41C31.7 41 38 38.3 38 35V24" />
      </svg>
    );
  }

  if (type === "telemetry") {
    return (
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path d="M7 36H41" />
        <path d="M10 32L18 23L25 27L35 14L40 19" />
        <circle cx="18" cy="23" r="2" />
        <circle cx="35" cy="14" r="2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="15" />
      <path d="M18 24L22 28L31 18" />
      <path d="M15 38L12 42" />
      <path d="M33 38L36 42" />
    </svg>
  );
}

export default function LandingPage({
  onReplayIntro,
}: LandingPageProps) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 24,
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  useEffect(() => {
    const closeMenuOnResize = () => {
      if (window.innerWidth > 820) {
        setMenuOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      closeMenuOnResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        closeMenuOnResize,
      );
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <main className="landing-page">
      <div
        className="landing-noise"
        aria-hidden="true"
      />

      <header
        className={[
          "landing-nav",
          scrolled ? "is-scrolled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="landing-nav-inner">
          <Link
            className="landing-brand"
            to="/"
            onClick={closeMenu}
          >
            <span className="landing-brand-mark">
              <i />
              <i />
            </span>

            <span>
              EDGEMIND
            </span>
          </Link>

          <button
            type="button"
            className={[
              "landing-menu-button",
              menuOpen ? "is-open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={
              menuOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-navigation"
            onClick={() => {
              setMenuOpen(
                (currentValue) =>
                  !currentValue,
              );
            }}
          >
            <span />
            <span />
          </button>

          <nav
            id="landing-mobile-navigation"
            className={[
              "landing-nav-links",
              menuOpen ? "is-open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label="Main navigation"
          >
            <a
              href="#platform"
              onClick={closeMenu}
            >
              Platform
            </a>

            <a
              href="#workflow"
              onClick={closeMenu}
            >
              How it works
            </a>

            <a
              href="#preview"
              onClick={closeMenu}
            >
              Preview
            </a>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                onReplayIntro();
              }}
            >
              Replay signal
            </button>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login">
              Log in
            </Link>

            <Link
              className="is-primary"
              to="/register"
            >
              Start building
              <span>↗</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div
          className="landing-hero-grid"
          aria-hidden="true"
        />

        <div
          className="landing-hero-glow"
          aria-hidden="true"
        />

        <div className="landing-container landing-hero-layout">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">
              <span />

              INTELLIGENT EDGE DELIVERY
            </div>

            <h1>
              See how every request
              <em>
                should travel.
              </em>
            </h1>

            <p>
              EdgeMind is a visual CDN
              simulator for exploring routing,
              cache behaviour, latency, and
              edge-network decisions before
              deployment.
            </p>

            <div className="landing-hero-actions">
              <Link
                className="landing-button is-primary"
                to="/register"
              >
                Build your first simulation

                <span>↗</span>
              </Link>

              <a
                className="landing-button is-secondary"
                href="#preview"
              >
                Explore the platform

                <span>↓</span>
              </a>
            </div>

            <div className="landing-hero-proof">
              <div>
                <strong>33</strong>
                <span>
                  edge nodes modelled
                </span>
              </div>

              <div>
                <strong>12 ms</strong>
                <span>
                  optimized latency
                </span>
              </div>

              <div>
                <strong>94.8%</strong>
                <span>
                  cache efficiency
                </span>
              </div>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-orbit">
              <span className="landing-orbit-ring ring-one" />
              <span className="landing-orbit-ring ring-two" />

              <span className="landing-orbit-core">
                <i />
                EDGE
              </span>

              <span className="landing-orbit-node node-one">
                WAW
              </span>

              <span className="landing-orbit-node node-two">
                FRA
              </span>

              <span className="landing-orbit-node node-three">
                LON
              </span>

              <span className="landing-orbit-node node-four">
                NYC
              </span>

              <svg
                className="landing-orbit-route"
                viewBox="0 0 520 520"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="heroRouteGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#7c6fff"
                    />
                    <stop
                      offset="56%"
                      stopColor="#2ee6d6"
                    />
                    <stop
                      offset="100%"
                      stopColor="#9ffcf3"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M81 344C128 298 155 190 251 163C335 139 391 229 437 142"
                />

                <circle
                  r="5"
                  fill="#ecfdfb"
                >
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M81 344C128 298 155 190 251 163C335 139 391 229 437 142"
                  />
                </circle>
              </svg>
            </div>

            <div className="landing-hero-card card-route">
              <span>
                SELECTED ROUTE
              </span>

              <strong>
                WAW → FRA → LON
              </strong>

              <small>
                12 ms · 96% confidence
              </small>
            </div>

            <div className="landing-hero-card card-cache">
              <span>
                CACHE STATUS
              </span>

              <strong>
                HIT
              </strong>

              <small>
                38 ms saved
              </small>
            </div>
          </div>
        </div>

        <a
          className="landing-scroll-cue"
          href="#platform"
          aria-label="Scroll to platform features"
        >
          <span />
          SCROLL TO EXPLORE
        </a>
      </section>

      <section
        className="landing-section landing-features"
        id="platform"
      >
        <div className="landing-container">
          <header className="landing-section-heading">
            <div>
              <span>
                01 / PLATFORM
              </span>

              <h2>
                A control plane for
                <em>
                  understanding delivery.
                </em>
              </h2>
            </div>

            <p>
              Move beyond static architecture
              diagrams. EdgeMind turns CDN
              behaviour into an interactive,
              explainable system.
            </p>
          </header>

          <div className="landing-feature-grid">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="landing-feature-card"
              >
                <div className="landing-feature-top">
                  <span>
                    {feature.number}
                  </span>

                  <div className="landing-feature-icon">
                    <FeatureIcon
                      type={feature.icon}
                    />
                  </div>
                </div>

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

                <small>
                  {feature.detail}
                </small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="landing-section landing-workflow"
        id="workflow"
      >
        <div className="landing-container">
          <header className="landing-section-heading is-light">
            <div>
              <span>
                02 / WORKFLOW
              </span>

              <h2>
                From network idea to
                <em>
                  explainable result.
                </em>
              </h2>
            </div>

            <p>
              Build, test, and understand a
              CDN scenario without setting up
              production infrastructure.
            </p>
          </header>

          <div className="landing-process">
            {processSteps.map(
              (step, index) => (
                <article
                  key={step.number}
                  className="landing-process-step"
                >
                  <div className="landing-process-number">
                    {step.number}
                  </div>

                  <div className="landing-process-copy">
                    <span>
                      {step.label}
                    </span>

                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.description}
                    </p>
                  </div>

                  {index <
                    processSteps.length -
                      1 && (
                    <div
                      className="landing-process-line"
                      aria-hidden="true"
                    >
                      <i />
                    </div>
                  )}
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="landing-section landing-preview"
        id="preview"
      >
        <div className="landing-container">
          <header className="landing-section-heading">
            <div>
              <span>
                03 / LIVE PREVIEW
              </span>

              <h2>
                Watch the network
                <em>
                  make its decision.
                </em>
              </h2>
            </div>

            <p>
              Every simulation combines
              traffic, cache, node health, and
              routing confidence in one
              workspace.
            </p>
          </header>

          <div className="landing-dashboard">
            <header className="landing-dashboard-header">
              <div className="landing-dashboard-brand">
                <span />

                <div>
                  <strong>
                    EDGEMIND
                  </strong>

                  <small>
                    CONTROL PLANE / LIVE
                  </small>
                </div>
              </div>

              <div className="landing-dashboard-health">
                <span>
                  <i />
                  NETWORK ONLINE
                </span>

                <small>
                  33 EDGE NODES
                </small>
              </div>
            </header>

            <div className="landing-dashboard-body">
              <aside className="landing-dashboard-sidebar">
                <span className="is-active">
                  <i />
                  <i />
                </span>

                <span>
                  <i />
                  <i />
                </span>

                <span>
                  <i />
                  <i />
                </span>

                <span>
                  <i />
                  <i />
                </span>
              </aside>

              <div className="landing-dashboard-content">
                <div className="landing-dashboard-title">
                  <div>
                    <span>
                      GLOBAL EDGE NETWORK
                    </span>

                    <strong>
                      Live infrastructure
                    </strong>
                  </div>

                  <small>
                    <i />
                    LIVE TELEMETRY
                  </small>
                </div>

                <div className="landing-dashboard-metrics">
                  <article>
                    <span>
                      REQUESTS
                    </span>

                    <strong>
                      18.4K
                    </strong>

                    <small>
                      +8.2% per second
                    </small>
                  </article>

                  <article>
                    <span>
                      CACHE HIT
                    </span>

                    <strong>
                      94.8%
                    </strong>

                    <small>
                      +1.4% global average
                    </small>
                  </article>

                  <article>
                    <span>
                      LATENCY
                    </span>

                    <strong>
                      12 ms
                    </strong>

                    <small>
                      -6 ms optimized
                    </small>
                  </article>
                </div>

                <div className="landing-dashboard-workspace">
                  <div className="landing-dashboard-map">
                    <div className="landing-map-grid" />

                    <svg
                      className="landing-map-route"
                      viewBox="0 0 1000 420"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient
                          id="landingMapGradient"
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
                            offset="50%"
                            stopColor="#2ee6d6"
                          />

                          <stop
                            offset="100%"
                            stopColor="#9ffcf3"
                          />
                        </linearGradient>
                      </defs>

                      <path
                        className="route-shadow"
                        d="M100 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 690 113C765 79 824 205 880 248"
                      />

                      <path
                        className="route-main"
                        d="M100 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 690 113C765 79 824 205 880 248"
                      />
                    </svg>

                    {edgeNodes.map((node) => (
                      <div
                        key={node.code}
                        className={[
                          "landing-map-node",
                          `is-${node.state}`,
                        ].join(" ")}
                        style={{
                          left: `${node.x}%`,
                          top: `${node.y}%`,
                        }}
                      >
                        <span />
                        <i />

                        <strong>
                          {node.code}
                        </strong>

                        <small>
                          {node.latency}
                        </small>

                        <em>
                          {node.city}
                        </em>
                      </div>
                    ))}

                    <div className="landing-map-decision">
                      <span>
                        SELECTED NODE
                      </span>

                      <strong>
                        FRA-EDGE-07
                      </strong>

                      <small>
                        Lowest predicted latency
                      </small>

                      <div>
                        <span>
                          CONFIDENCE
                        </span>

                        <strong>
                          96%
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="landing-dashboard-feed">
                    <header>
                      <span>
                        REAL-TIME ACTIVITY
                      </span>

                      <small>
                        LIVE
                      </small>
                    </header>

                    <div>
                      <article>
                        <time>
                          20:14:39
                        </time>

                        <i />

                        <span>
                          Route automatically
                          optimized
                        </span>
                      </article>

                      <article>
                        <time>
                          20:14:37
                        </time>

                        <i className="is-warning" />

                        <span>
                          Singapore latency
                          increased
                        </span>
                      </article>

                      <article>
                        <time>
                          20:14:34
                        </time>

                        <i />

                        <span>
                          Cache hit returned in
                          12 ms
                        </span>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-preview-caption">
            <span>
              BUILT FOR LEARNING,
              PROTOTYPING, AND INTERVIEWS
            </span>

            <p>
              A portfolio-ready environment
              demonstrating frontend systems,
              network concepts, data
              visualisation, and AI-assisted
              decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div
          className="landing-cta-grid"
          aria-hidden="true"
        />

        <div className="landing-container landing-cta-inner">
          <div>
            <span>
              READY TO ROUTE?
            </span>

            <h2>
              Build the network.
              <em>
                Understand the decision.
              </em>
            </h2>
          </div>

          <div>
            <p>
              Start with a guided simulation
              and turn network assumptions
              into visible, explainable
              results.
            </p>

            <Link
              className="landing-button is-primary"
              to="/register"
            >
              Create your workspace

              <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-main">
          <div className="landing-footer-brand">
            <Link
              className="landing-brand"
              to="/"
            >
              <span className="landing-brand-mark">
                <i />
                <i />
              </span>

              <span>
                EDGEMIND
              </span>
            </Link>

            <p>
              Intelligent CDN simulation and
              explainable edge routing.
            </p>
          </div>

          <div className="landing-footer-links">
            <div>
              <span>
                PLATFORM
              </span>

              <a href="#platform">
                Features
              </a>

              <a href="#workflow">
                Workflow
              </a>

              <a href="#preview">
                Preview
              </a>
            </div>

            <div>
              <span>
                ACCOUNT
              </span>

              <Link to="/login">
                Log in
              </Link>

              <Link to="/register">
                Register
              </Link>

              <Link to="/dashboard">
                Dashboard
              </Link>
            </div>

            <div>
              <span>
                PRODUCT
              </span>

              <Link to="/simulator">
                Simulator
              </Link>

              <Link to="/simulations">
                Simulations
              </Link>

              <Link to="/settings">
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="landing-container landing-footer-bottom">
          <span>
            © 2026 EDGEMIND
          </span>

          <span>
            BUILT FOR THE EDGE
          </span>
        </div>
      </footer>
    </main>
  );
}