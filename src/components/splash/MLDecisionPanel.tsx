import type { CSSProperties } from "react";

interface MLDecisionPanelProps {
  visible: boolean;
  handoffActive: boolean;
}

const factors = [
  {
    label: "PROXIMITY",
    value: 94,
  },
  {
    label: "CACHE PROBABILITY",
    value: 97,
  },
  {
    label: "NODE HEALTH",
    value: 100,
  },
  {
    label: "DEMAND FORECAST",
    value: 91,
  },
];

const candidates = [
  {
    name: "WARSAW",
    score: 0.96,
    latency: 12,
    winner: true,
  },
  {
    name: "FRANKFURT",
    score: 0.84,
    latency: 18,
    winner: false,
  },
  {
    name: "LONDON",
    score: 0.73,
    latency: 24,
    winner: false,
  },
  {
    name: "NEW YORK",
    score: 0.42,
    latency: 84,
    winner: false,
  },
  {
    name: "SINGAPORE",
    score: 0.31,
    latency: 146,
    winner: false,
  },
];

export default function MLDecisionPanel({
  visible,
  handoffActive,
}: MLDecisionPanelProps) {
  return (
    <aside
      className={[
        "ml-post-route-panel",
        visible ? "is-visible" : "",
        handoffActive ? "is-handoff" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      <header className="ml-post-route-header">
        <div>
          <span>ML ROUTING ENGINE</span>

          <strong>
            Route intelligence summary
          </strong>

          <small>
            Analysis generated after final delivery
          </small>
        </div>

        <div className="ml-post-route-result">
          <span>DECISION VALIDATED</span>
          <strong>WARSAW</strong>
          <small>Confidence 96%</small>
        </div>
      </header>

      <div className="ml-post-route-body">
        <section className="ml-post-route-factors">
          <div className="ml-section-heading">
            <span>DECISION FACTORS</span>
            <small>LIVE MODEL WEIGHTS</small>
          </div>

          <div className="ml-factor-list">
            {factors.map((factor, index) => (
              <div
                key={factor.label}
                className="ml-factor-row"
                style={{
                  "--ml-delay": `${index * 100}ms`,
                } as CSSProperties}
              >
                <div className="ml-factor-row-copy">
                  <span>{factor.label}</span>
                  <strong>{factor.value}%</strong>
                </div>

                <div className="ml-factor-row-track">
                  <span
                    style={{
                      width: `${factor.value}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="ml-route-outcome">
            <span>OBSERVED OUTCOME</span>

            <div>
              <strong>248 ms</strong>
              <i>→</i>
              <strong>12 ms</strong>
            </div>

            <small>
              95.2% latency reduction · cache hit confirmed
            </small>
          </div>
        </section>

        <section className="ml-post-route-ranking">
          <div className="ml-section-heading">
            <span>EDGE RANKING</span>
            <small>SCORE / LATENCY</small>
          </div>

          <div className="ml-ranking-list">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.name}
                className={[
                  "ml-ranking-row",
                  candidate.winner
                    ? "is-winner"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  "--ml-delay": `${index * 90}ms`,
                } as CSSProperties}
              >
                <div className="ml-ranking-name">
                  <span>{candidate.name}</span>

                  {candidate.winner && (
                    <small>SELECTED</small>
                  )}
                </div>

                <div className="ml-ranking-meter">
                  <div>
                    <span
                      style={{
                        width: `${
                          candidate.score * 100
                        }%`,
                      }}
                    />
                  </div>

                  <strong>
                    {candidate.score.toFixed(2)}
                  </strong>
                </div>

                <span className="ml-ranking-latency">
                  {candidate.latency} ms
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="ml-post-route-footer">
        <span>
          MODEL: EDGEMIND ROUTER v1.0
        </span>

        <strong>
          DELIVERY COMPLETE · ANALYSIS LOCKED
        </strong>
      </footer>
    </aside>
  );
}