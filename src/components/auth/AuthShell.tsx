import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./AuthShell.css";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
  children: ReactNode;
}

const nodes = [
  { code: "WAW", x: 10, y: 69 },
  { code: "FRA", x: 31, y: 35, selected: true },
  { code: "LON", x: 51, y: 58, selected: true },
  { code: "NYC", x: 70, y: 28 },
  { code: "SIN", x: 89, y: 60 },
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-shell">
      <div className="auth-shell-grid" aria-hidden="true" />
      <div className="auth-shell-glow" aria-hidden="true" />

      <header className="auth-shell-header">
        <Link className="auth-shell-brand" to="/">
          <span className="auth-shell-brand-mark">
            <i />
            <i />
          </span>
          <span>EDGEMIND</span>
        </Link>

        <div className="auth-shell-header-actions">
          <span>CONTROL PLANE ACCESS</span>
          <Link to="/">Return home</Link>
        </div>
      </header>

      <div className="auth-shell-layout">
        <section className="auth-shell-visual">
          <div className="auth-shell-visual-copy">
            <span>INTELLIGENT EDGE DELIVERY</span>
            <h2>
              Enter the network.
              <em>Understand every route.</em>
            </h2>
            <p>
              Configure CDN scenarios, inspect routing decisions,
              and compare latency and cache behaviour in one visual
              workspace.
            </p>
          </div>

          <div className="auth-network-panel">
            <header>
              <div>
                <span>GLOBAL EDGE NETWORK</span>
                <strong>Live route preview</strong>
              </div>
              <small>
                <i /> NETWORK ONLINE
              </small>
            </header>

            <div className="auth-network-map">
              <div className="auth-network-map-grid" aria-hidden="true" />

              <svg
                viewBox="0 0 1000 420"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="authRouteGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#7c6fff" />
                    <stop offset="52%" stopColor="#2ee6d6" />
                    <stop offset="100%" stopColor="#9ffcf3" />
                  </linearGradient>
                </defs>

                <path
                  className="auth-route-shadow"
                  d="M90 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 700 113C765 79 824 205 890 248"
                />
                <path
                  className="auth-route-main"
                  d="M90 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 700 113C765 79 824 205 890 248"
                />
                <circle className="auth-route-packet" r="5">
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M90 286C165 252 244 178 310 143C380 115 444 222 500 239C566 258 628 154 700 113C765 79 824 205 890 248"
                  />
                </circle>
              </svg>

              {nodes.map((node) => (
                <div
                  key={node.code}
                  className={`auth-network-node${
                    node.selected ? " is-selected" : ""
                  }`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <span />
                  <i />
                  <strong>{node.code}</strong>
                </div>
              ))}

              <div className="auth-network-decision">
                <span>SELECTED ROUTE</span>
                <strong>WAW → FRA → LON</strong>
                <small>12 ms · 96% confidence</small>
              </div>
            </div>

            <div className="auth-network-metrics">
              <article>
                <span>REQUESTS</span>
                <strong>18.4K</strong>
                <small>per second</small>
              </article>
              <article>
                <span>CACHE HIT</span>
                <strong>94.8%</strong>
                <small>global average</small>
              </article>
              <article>
                <span>LATENCY</span>
                <strong>12 ms</strong>
                <small>optimized path</small>
              </article>
            </div>
          </div>

          <div className="auth-shell-visual-footer">
            <span>33 EDGE NODES</span>
            <span>AI ROUTING ACTIVE</span>
            <span>TELEMETRY LIVE</span>
          </div>
        </section>

        <section className="auth-shell-form-column">
          <div className="auth-shell-form-wrap">
            <div className="auth-shell-form-heading">
              <span>{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>

            {children}

            <p className="auth-shell-switch">
              {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
            </p>
          </div>
        </section>
      </div>

      <footer className="auth-shell-footer">
        <span>© 2026 EDGEMIND</span>
        <span>SECURE CONTROL PLANE</span>
      </footer>
    </main>
  );
}