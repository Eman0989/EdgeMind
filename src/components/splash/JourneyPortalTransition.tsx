import type { CSSProperties } from "react";

const PORTAL_RINGS = Array.from(
  { length: 7 },
  (_, index) => index,
);

const PORTAL_SPOKES = Array.from(
  { length: 18 },
  (_, index) => index,
);

const PORTAL_STREAKS = Array.from(
  { length: 14 },
  (_, index) => ({
    angle: index * (360 / 14),
    length: 90 + ((index * 31) % 160),
    delay: (index % 7) * 0.035,
  }),
);

export default function JourneyPortalTransition() {
  return (
    <section
      className="journey-portal-transition"
      aria-hidden="true"
    >
      <div className="journey-portal-vignette" />

      <div className="journey-portal-coordinate-grid">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="journey-portal-rings">
        {PORTAL_RINGS.map((ring) => (
          <i
            key={`portal-ring-${ring}`}
            className="journey-portal-ring"
            style={
              {
                "--portal-ring-index": ring,
                "--portal-ring-delay":
                  `${ring * 0.045}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="journey-portal-spokes">
        {PORTAL_SPOKES.map((spoke) => (
          <i
            key={`portal-spoke-${spoke}`}
            className="journey-portal-spoke"
            style={
              {
                "--portal-spoke-angle":
                  `${spoke * 20}deg`,
                "--portal-spoke-delay":
                  `${(spoke % 6) * 0.025}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="journey-portal-streaks">
        {PORTAL_STREAKS.map(
          (streak, index) => (
            <i
              key={`portal-streak-${index}`}
              className="journey-portal-streak"
              style={
                {
                  "--portal-streak-angle":
                    `${streak.angle}deg`,
                  "--portal-streak-length":
                    `${streak.length}px`,
                  "--portal-streak-delay":
                    `${streak.delay}s`,
                } as CSSProperties
              }
            />
          ),
        )}
      </div>

      <div className="journey-portal-core">
        <span />
        <i />
      </div>

      <div className="journey-portal-copy">
        <span>IDENTITY HANDOFF</span>

        <strong>
          Entering live request trace
        </strong>

        <small>
          Edge router ready · request channel open
        </small>
      </div>

      <div className="journey-portal-meta">
        <span>REQUEST ID</span>
        <strong>7F3A-EDGE</strong>
        <i />
        <span>ROUTE MODE</span>
        <strong>LIVE</strong>
      </div>

      <div className="journey-portal-scan" />
      <div className="journey-portal-flash" />
    </section>
  );
}