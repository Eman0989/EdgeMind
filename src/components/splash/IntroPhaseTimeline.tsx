import type { CSSProperties } from "react";

interface IntroPhaseTimelineProps {
  progress: number;
}

interface IntroPhase {
  number: string;
  label: string;
  detail: string;
  start: number;
  end: number;
}

const INTRO_PHASES: IntroPhase[] = [
  {
    number: "01",
    label: "CONNECT",
    detail: "Handshake",
    start: 0,
    end: 7,
  },
  {
    number: "02",
    label: "MAP",
    detail: "Topology",
    start: 7,
    end: 23,
  },
  {
    number: "03",
    label: "IDENTIFY",
    detail: "EdgeMind",
    start: 23,
    end: 34,
  },
  {
    number: "04",
    label: "DELIVER",
    detail: "Edge route",
    start: 34,
    end: 61,
  },
  {
    number: "05",
    label: "ANALYZE",
    detail: "ML summary",
    start: 61,
    end: 74,
  },
  {
    number: "06",
    label: "RETURN",
    detail: "Response",
    start: 74,
    end: 85,
  },
  {
    number: "07",
    label: "ARRIVE",
    detail: "Platform",
    start: 85,
    end: 100,
  },
];

function getPhaseProgress(
  progress: number,
  phase: IntroPhase,
) {
  if (progress <= phase.start) {
    return 0;
  }

  if (progress >= phase.end) {
    return 100;
  }

  return (
    ((progress - phase.start) /
      (phase.end - phase.start)) *
    100
  );
}

export default function IntroPhaseTimeline({
  progress,
}: IntroPhaseTimelineProps) {
  const activeIndex = Math.min(
    INTRO_PHASES.length - 1,
    Math.max(
      0,
      INTRO_PHASES.findIndex(
        (phase) => progress < phase.end,
      ),
    ),
  );

  const activePhase =
    INTRO_PHASES[activeIndex];

  return (
    <div className="intro-phase-timeline">
      <div className="intro-phase-meta">
        <span className="intro-phase-sequence">
          SIGNAL SEQUENCE
          <strong>
            {String(progress).padStart(3, "0")}%
          </strong>
        </span>

        <span className="intro-phase-current">
          <i aria-hidden="true" />

          <span>
            {activePhase.number}
            <strong>{activePhase.label}</strong>
          </span>

          <small>{activePhase.detail}</small>
        </span>
      </div>

      <ol
        className="intro-phase-list"
        aria-label="Introduction phases"
      >
        {INTRO_PHASES.map((phase, index) => {
          const phaseProgress =
            getPhaseProgress(progress, phase);

          const state =
            index < activeIndex
              ? "is-complete"
              : index === activeIndex
                ? "is-current"
                : "is-upcoming";

          return (
            <li
              key={phase.number}
              className={state}
              aria-current={
                index === activeIndex
                  ? "step"
                  : undefined
              }
              style={
                {
                  "--phase-progress":
                    `${phaseProgress}%`,
                } as CSSProperties
              }
            >
              <div className="intro-phase-rail">
                <span />
                <i aria-hidden="true" />
              </div>

              <div className="intro-phase-label">
                <span>{phase.number}</span>

                <div>
                  <strong>{phase.label}</strong>
                  <small>{phase.detail}</small>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}