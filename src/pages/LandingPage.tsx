import {
  useEffect,
  useState,
} from "react";
import "./LandingPage.css";

interface LandingPageProps {
  onReplayIntro: () => void;
}

const metrics = [
  {
    label: "Optimized latency",
    value: "12 ms",
  },
  {
    label: "Global cache hit",
    value: "94.8%",
  },
  {
    label: "Active edge nodes",
    value: "33",
  },
];

const networkNodes = [
  {
    className: "node-warsaw",
    label: "WAW",
  },
  {
    className: "node-frankfurt",
    label: "FRA",
  },
  {
    className: "node-london",
    label: "LON",
  },
  {
    className: "node-new-york",
    label: "NYC",
  },
  {
    className: "node-singapore",
    label: "SIN",
  },
];

export default function LandingPage({
  onReplayIntro,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 860) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <main className="landing-page">
      <div
        className="landing-background"
        aria-hidden="true"
      >
        <div className="landing-grid" />
        <div className="landing-glow landing-glow-one" />
        <div className="landing-glow landing-glow-two" />
        <div className="landing-noise" />
      </div>

      <header className="landing-header">
        <a
          className="landing-brand"
          href="#top"
          aria-label="EdgeMind home"
          onClick={closeMobileMenu}
        >
          <span className="landing-brand-mark">
            <i />
            <i />
            <i />
          </span>

          <span>EdgeMind</span>
        </a>

        <nav
          className={[
            "landing-nav",
            mobileMenuOpen
              ? "is-open"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="Primary navigation"
        >
          <a
            href="#platform"
            onClick={closeMobileMenu}
          >
            Platform
          </a>

          <a
            href="#how-it-works"
            onClick={closeMobileMenu}
          >
            How it works
          </a>

          <a
            href="#network"
            onClick={closeMobileMenu}
          >
            Network
          </a>

          <a
            href="#technology"
            onClick={closeMobileMenu}
          >
            Technology
          </a>
        </nav>

        <div className="landing-header-actions">
          <button
            type="button"
            className="landing-sign-in"
          >
            Sign in
          </button>

          <a
            className="landing-launch"
            href="#simulator-preview"
          >
            Launch simulator
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <button
          type="button"
          className={[
            "landing-menu-button",
            mobileMenuOpen
              ? "is-open"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={
            mobileMenuOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() => {
            setMobileMenuOpen(
              (currentValue) =>
                !currentValue,
            );
          }}
        >
          <span />
          <span />
        </button>
      </header>

      <section
        id="top"
        className="landing-hero"
      >
        <div className="landing-hero-copy">
          <div className="landing-eyebrow">
            <span className="landing-eyebrow-light" />

            <span>
              INTELLIGENT CDN SIMULATION
            </span>

            <small>
              NETWORK ONLINE
            </small>
          </div>

          <h1>
            Route every request through a{" "}
            <span>smarter edge.</span>
          </h1>

          <p>
            Simulate global content delivery,
            compare edge locations, predict
            cache performance, and understand
            every routing decision in real
            time.
          </p>

          <div className="landing-hero-actions">
            <a
              className="landing-primary-cta"
              href="#simulator-preview"
            >
              Launch simulator
              <span aria-hidden="true">→</span>
            </a>

            <button
              type="button"
              className="landing-secondary-cta"
              onClick={onReplayIntro}
            >
              <span className="landing-replay-icon">
                ↻
              </span>
              Replay signal
            </button>
          </div>

          <div
            className="landing-metrics"
            aria-label="EdgeMind performance"
          >
            {metrics.map((metric) => (
              <article key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div
          id="simulator-preview"
          className="landing-visual"
        >
          <div className="landing-visual-halo" />

          <article className="network-preview-card">
            <header className="network-preview-header">
              <div>
                <span>LIVE ROUTE TRACE</span>
                <strong>
                  Global edge overview
                </strong>
              </div>

              <div className="network-preview-status">
                <i />
                LIVE
              </div>
            </header>

            <div className="network-preview-map">
              <div className="network-map-grid" />

              <span className="network-route route-a" />
              <span className="network-route route-b" />
              <span className="network-route route-c" />
              <span className="network-route route-d" />

              {networkNodes.map((node) => (
                <div
                  key={node.label}
                  className={[
                    "network-preview-node",
                    node.className,
                  ].join(" ")}
                >
                  <i />
                  <span>{node.label}</span>
                </div>
              ))}

              <span className="network-live-packet" />

              <div className="network-route-card">
                <span>OPTIMIZED PATH</span>

                <strong>
                  WAW → FRA → LON
                </strong>

                <div>
                  <small>12 ms latency</small>
                  <small>96% confidence</small>
                </div>
              </div>
            </div>

            <footer className="network-preview-footer">
              <div>
                <span>REQUESTS / SEC</span>
                <strong>18,421</strong>
              </div>

              <div>
                <span>CACHE HIT</span>
                <strong>94.8%</strong>
              </div>

              <div>
                <span>EDGE STATUS</span>
                <strong className="is-cyan">
                  HEALTHY
                </strong>
              </div>
            </footer>
          </article>

          <div className="landing-floating-card landing-floating-card-top">
            <span>MODEL DECISION</span>
            <strong>FRA-EDGE-07</strong>
            <small>
              Selected in 14 milliseconds
            </small>
          </div>

          <div className="landing-floating-card landing-floating-card-bottom">
            <div>
              <span>CACHE RESPONSE</span>
              <strong>200 OK</strong>
            </div>

            <i />
          </div>
        </div>
      </section>

      <section className="landing-trust-strip">
        <span>
          Designed for developers, platform
          teams, and infrastructure engineers
        </span>

        <div>
          <strong>ROUTING</strong>
          <strong>TELEMETRY</strong>
          <strong>CACHE AI</strong>
          <strong>EDGE SECURITY</strong>
        </div>
      </section>
    </main>
  );
}