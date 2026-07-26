import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MLDecisionPanel from "./MLDecisionPanel";
import ResponseReturn from "./ResponseReturn";

interface City {
  name: string;
  code: string;
  x: number;
  y: number;
  latency: number;
  score: number;
  route: string;
}

interface Stage {
  name: string;
  detail: string;
  x: number;
  y: number;
  cardX: number;
  cardY: number;
}

interface LatencyStage {
  value: number;
  label: string;
  delay: number;
}

/*
 * One route, used by both the visible line and the packet.
 * It passes through the centre of every circle.
 */
const FULL_ROUTE = `
  M 115 370
  C 155 360, 205 300, 245 250
  C 285 205, 330 180, 370 205
  C 410 235, 435 305, 470 310
  C 515 315, 535 220, 575 210
  C 625 205, 675 330, 720 350
  C 770 365, 815 245, 850 225
`;

const cities: City[] = [
  {
    name: "WARSAW",
    code: "WAW-EDGE-01",
    x: 370,
    y: 205,
    latency: 12,
    score: 0.96,
    route: "M 245 250 C 285 215, 325 205, 370 205",
  },
  {
    name: "FRANKFURT",
    code: "FRA-EDGE-02",
    x: 470,
    y: 310,
    latency: 18,
    score: 0.84,
    route: "M 245 250 C 330 265, 430 315, 470 310",
  },
  {
    name: "LONDON",
    code: "LON-EDGE-03",
    x: 575,
    y: 210,
    latency: 24,
    score: 0.73,
    route: "M 245 250 C 350 210, 470 200, 575 210",
  },
  {
    name: "NEW YORK",
    code: "NYC-EDGE-04",
    x: 720,
    y: 350,
    latency: 84,
    score: 0.42,
    route: "M 245 250 C 430 285, 590 330, 720 350",
  },
  {
    name: "SINGAPORE",
    code: "SIN-EDGE-05",
    x: 850,
    y: 225,
    latency: 146,
    score: 0.31,
    route: "M 245 250 C 470 245, 690 225, 850 225",
  },
];

/*
 * Every card is centred below its own circle.
 * This keeps the cards away from the heading, edge-selection
 * panel and latency panel at the top of the screen.
 */
const stages: Stage[] = [
  {
    name: "ORIGIN",
    detail: "Request created",
    x: 115,
    y: 370,
    cardX: 60,
    cardY: 408,
  },
  {
    name: "GLOBAL ROUTER",
    detail: "Route evaluation",
    x: 245,
    y: 250,
    cardX: 190,
    cardY: 288,
  },
  {
    name: "WARSAW",
    detail: "Edge selected",
    x: 370,
    y: 205,
    cardX: 315,
    cardY: 243,
  },
  {
    name: "FRANKFURT",
    detail: "Regional fallback",
    x: 470,
    y: 310,
    cardX: 415,
    cardY: 348,
  },
  {
    name: "LONDON",
    detail: "Transit checkpoint",
    x: 575,
    y: 210,
    cardX: 520,
    cardY: 248,
  },
  {
    name: "NEW YORK",
    detail: "Long-haul relay",
    x: 720,
    y: 350,
    cardX: 665,
    cardY: 388,
  },
  {
    name: "SINGAPORE",
    detail: "Final delivery",
    x: 850,
    y: 225,
    cardX: 795,
    cardY: 263,
  },
];

const latencyStages: LatencyStage[] = [
  { value: 248, label: "Origin request", delay: 0 },
  { value: 184, label: "Route discovered", delay: 550 },
  { value: 126, label: "Regional scan", delay: 1050 },
  { value: 84, label: "Candidate nodes", delay: 1500 },
  { value: 42, label: "Edge selected", delay: 1950 },
  { value: 18, label: "Cache verified", delay: 2350 },
  { value: 12, label: "Optimized", delay: 2700 },
];

const COUNTER_START_DELAY = 7800;
const EVALUATION_START_DELAY = 8200;
const DELIVERY_START_DELAY = 9200;
const DELIVERY_DRAW_DURATION = 3200;
const ANALYSIS_START_DELAY = 15700;
const RESPONSE_START_DELAY = 18400;
const HANDOFF_DELAY = 21000;

const VISIT_TIMES = [
  9200,
  9650,
  10100,
  10600,
  11200,
  11900,
  13000,
];

export default function SignalJourney() {
  const [latency, setLatency] = useState(248);
  const [latencyLabel, setLatencyLabel] =
    useState("Origin request");
  const [evaluationActive, setEvaluationActive] =
    useState(false);
  const [deliveryActive, setDeliveryActive] =
    useState(false);
  const [selectedCity, setSelectedCity] =
    useState<string | null>(null);
  const [visitedIndex, setVisitedIndex] =
    useState(-1);
  const [analysisActive, setAnalysisActive] =
    useState(false);
  const [responseActive, setResponseActive] =
    useState(false);
  const [handoffActive, setHandoffActive] =
    useState(false);

  const [routeComplete, setRouteComplete] =
    useState(false);

  const routeShadowRef =
    useRef<SVGPathElement | null>(null);

  const routeGlowRef =
    useRef<SVGPathElement | null>(null);

  const routeMainRef =
    useRef<SVGPathElement | null>(null);

  const routeHighlightRef =
    useRef<SVGPathElement | null>(null);

  const reduction = useMemo(() => {
    return Math.round(
      ((248 - latency) / 248) * 100,
    );
  }, [latency]);

  useEffect(() => {
    const timers: number[] = [];

    latencyStages.forEach((stage) => {
      timers.push(
        window.setTimeout(() => {
          setLatency(stage.value);
          setLatencyLabel(stage.label);
        }, COUNTER_START_DELAY + stage.delay),
      );
    });

    timers.push(
      window.setTimeout(() => {
        setEvaluationActive(true);
      }, EVALUATION_START_DELAY),
    );

    timers.push(
      window.setTimeout(() => {
        setSelectedCity("WARSAW");
        setEvaluationActive(false);
        setDeliveryActive(true);
      }, DELIVERY_START_DELAY),
    );

    VISIT_TIMES.forEach((time, index) => {
      timers.push(
        window.setTimeout(() => {
          setVisitedIndex(index);
        }, time),
      );
    });

    timers.push(
      window.setTimeout(() => {
        setAnalysisActive(true);
      }, ANALYSIS_START_DELAY),
    );

    timers.push(
      window.setTimeout(() => {
        setAnalysisActive(false);
        setResponseActive(true);
      }, RESPONSE_START_DELAY),
    );

    timers.push(
      window.setTimeout(() => {
        setResponseActive(false);
        setHandoffActive(true);
      }, HANDOFF_DELAY),
    );

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, []);

  useLayoutEffect(() => {
    if (!deliveryActive) {
      setRouteComplete(false);
      return;
    }

    setRouteComplete(false);

    const routeMain =
      routeMainRef.current;

    const routePaths = [
      routeShadowRef.current,
      routeGlowRef.current,
      routeMain,
      routeHighlightRef.current,
    ].filter(
      (
        path,
      ): path is SVGPathElement =>
        path !== null,
    );

    if (!routeMain || routePaths.length === 0) {
      return;
    }

    const routeLength =
      routeMain.getTotalLength();

    routePaths.forEach((path) => {
      path.style.strokeDasharray =
        `${routeLength}`;
      path.style.strokeDashoffset =
        `${routeLength}`;
      path.style.opacity = "1";
    });

    /*
     * Force Safari to commit the hidden starting position before
     * the first animation frame changes the dash offset.
     */
    routeMain.getBoundingClientRect();

    let animationFrame = 0;
    const startedAt = performance.now();

    const drawRoute = (now: number) => {
      const elapsed = now - startedAt;

      const progress = Math.min(
        1,
        elapsed / DELIVERY_DRAW_DURATION,
      );

      const dashOffset =
        routeLength * (1 - progress);

      routePaths.forEach((path) => {
        path.style.strokeDashoffset =
          `${dashOffset}`;
      });

      if (progress < 1) {
        animationFrame =
          window.requestAnimationFrame(
            drawRoute,
          );
      } else {
        routePaths.forEach((path) => {
          path.style.strokeDashoffset =
            "0";
        });

        /*
         * Replace the animated dashed paths with a normal,
         * undashed copy. This guarantees both exact endpoints.
         */
        setRouteComplete(true);
      }
    };

    animationFrame =
      window.requestAnimationFrame(
        drawRoute,
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [deliveryActive]);

  const stageClassName = (stageIndex: number) => {
    if (visitedIndex === stageIndex) {
      return "is-current-stage";
    }

    if (visitedIndex + 1 === stageIndex) {
      return "is-next-stage";
    }

    if (visitedIndex > stageIndex) {
      return "is-complete-stage";
    }

    return "";
  };

  return (
    <section
      className={[
        "journey-scene",
        analysisActive ? "is-analysis" : "",
        responseActive ? "is-response" : "",
        handoffActive ? "is-handoff" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        className={[
          "journey-map",
          handoffActive ? "is-handoff" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="journeyGlow"
            x="-200%"
            y="-200%"
            width="500%"
            height="500%"
          >
            <feGaussianBlur
              stdDeviation="5"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient
            id="journeyPathGradient"
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
              stopColor="#2ee6d6"
            />
          </linearGradient>

          <linearGradient
            id="journeyHighlightGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="#b7b0ff"
              stopOpacity="0.78"
            />

            <stop
              offset="46%"
              stopColor="#ecfdfb"
              stopOpacity="0.92"
            />

            <stop
              offset="100%"
              stopColor="#9ffcf3"
              stopOpacity="0.68"
            />
          </linearGradient>
        </defs>

        {/* Thin candidate paths exist only while evaluation is active. */}
        {cities.map((city) => (
          <path
            key={`${city.name}-candidate`}
            className={[
              "candidate-route",
              evaluationActive
                ? "is-evaluating"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            pathLength={1}
            d={city.route}
          />
        ))}

        {deliveryActive &&
          !routeComplete && (
            <g className="delivery-route-3d">
              <path
                ref={routeShadowRef}
                className="delivery-route-3d-shadow"
                d={FULL_ROUTE}
                fill="none"
              />

              <path
                ref={routeGlowRef}
                className="delivery-route-3d-glow"
                d={FULL_ROUTE}
                fill="none"
              />

              <path
                ref={routeMainRef}
                className="delivery-route-3d-main"
                d={FULL_ROUTE}
                fill="none"
              />

              <path
                ref={routeHighlightRef}
                className="delivery-route-3d-highlight"
                d={FULL_ROUTE}
                fill="none"
              />
            </g>
          )}

        {deliveryActive &&
          routeComplete && (
            <g className="delivery-route-3d is-static">
              <path
                className="delivery-route-3d-shadow"
                d={FULL_ROUTE}
                fill="none"
              />

              <path
                className="delivery-route-3d-glow"
                d={FULL_ROUTE}
                fill="none"
              />

              <path
                className="delivery-route-3d-main"
                d={FULL_ROUTE}
                fill="none"
              />

              <path
                className="delivery-route-3d-highlight"
                d={FULL_ROUTE}
                fill="none"
              />
            </g>
          )}

        <g
          className={[
            "origin-node",
            stageClassName(0),
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <circle
            className="journey-node-ring"
            cx="115"
            cy="370"
            r="18"
          />

          <circle
            className="journey-node-core"
            cx="115"
            cy="370"
            r="5"
          />
        </g>

        <g
          className={[
            "router-node",
            stageClassName(1),
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <circle
            className="journey-node-ring router-ring"
            cx="245"
            cy="250"
            r="20"
          />

          <circle
            className="journey-node-core router-core"
            cx="245"
            cy="250"
            r="6"
          />
        </g>

        {cities.map((city, index) => {
          const stageIndex = index + 2;

          return (
            <g
              key={city.name}
              className={[
                "city-node",
                selectedCity === city.name
                  ? "is-selected"
                  : "",
                stageClassName(stageIndex),
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <circle
                className="journey-node-ring"
                cx={city.x}
                cy={city.y}
                r="18"
              />

              <circle
                className="journey-node-core"
                cx={city.x}
                cy={city.y}
                r="5"
              />
            </g>
          );
        })}

        {/* Only CURRENT and NEXT cards are visible. */}
        {stages.map((stage, index) => {
          const isCurrent = visitedIndex === index;
          const isNext = visitedIndex + 1 === index;

          return (
            <g
              key={stage.name}
              className={[
                "route-stage-card",
                isCurrent ? "is-current" : "",
                isNext ? "is-next" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <line
                className="route-stage-card-connector"
                x1={stage.x}
                y1={stage.y + 18}
                x2={stage.x}
                y2={stage.cardY}
              />

              <rect
                className="route-stage-card-bg"
                x={stage.cardX}
                y={stage.cardY}
                width="110"
                height="48"
                rx="7"
              />

              <text
                className="route-stage-card-kicker"
                x={stage.cardX + 10}
                y={stage.cardY + 14}
              >
                {isCurrent ? "CURRENT" : "NEXT"}
              </text>

              <text
                className="route-stage-card-title"
                x={stage.cardX + 10}
                y={stage.cardY + 29}
              >
                {stage.name}
              </text>

              <text
                className="route-stage-card-detail"
                x={stage.cardX + 10}
                y={stage.cardY + 41}
              >
                {stage.detail}
              </text>
            </g>
          );
        })}

        {deliveryActive && (
          <circle
            className="selected-signal-packet"
            cx="0"
            cy="0"
            r="6"
            opacity="0"
            filter="url(#journeyGlow)"
          >
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.02;0.97;1"
              begin="0s"
              dur="3.2s"
              fill="freeze"
            />

            <animateMotion
              path={FULL_ROUTE}
              begin="0s"
              dur="3.2s"
              fill="freeze"
              calcMode="linear"
            />
          </circle>
        )}
      </svg>

      <div className="journey-heading">
        <span>LIVE REQUEST TRACE</span>

        <strong>
          Evaluating the best edge location
        </strong>
      </div>

      <div
        className={[
          "routing-decision",
          evaluationActive
            ? "is-visible"
            : "",
          selectedCity
            ? "has-selection is-visible"
            : "",
          handoffActive
            ? "is-handoff"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span>EDGE SELECTION</span>

        <strong>
          {selectedCity
            ? "Warsaw selected"
            : "Evaluating candidates"}
        </strong>

        <small>
          {selectedCity
            ? "Highest routing score · 0.96"
            : "Latency · proximity · cache probability"}
        </small>
      </div>

      <MLDecisionPanel
        visible={analysisActive}
        handoffActive={handoffActive}
      />

      <ResponseReturn
        visible={responseActive}
        handoffActive={handoffActive}
      />

      <div className="route-progress-panel">
        <span>ROUTE PROGRESS</span>

        <strong>
          {visitedIndex >= 0
            ? stages[
                Math.min(
                  visitedIndex,
                  stages.length - 1,
                )
              ].name
            : "Preparing route"}
        </strong>

        <small>
          {visitedIndex + 1 < stages.length
            ? `Next: ${
                stages[visitedIndex + 1].name
              }`
            : "Final delivery complete"}
        </small>
      </div>

      <div className="latency-panel">
        <div className="latency-panel-header">
          <span>ROUND TRIP LATENCY</span>

          <i
            className={
              latency <= 18
                ? "latency-health optimized"
                : latency <= 84
                  ? "latency-health improving"
                  : "latency-health routing"
            }
          />
        </div>

        <strong
          className="latency-value"
          aria-live="polite"
        >
          <span key={latency}>
            {latency}
          </span>

          <small>ms</small>
        </strong>

        <div className="latency-stage-row">
          <span>{latencyLabel}</span>
          <strong>{reduction}%</strong>
        </div>

        <div className="latency-reduction-track">
          <div
            className="latency-reduction-fill"
            style={{
              width: `${reduction}%`,
            }}
          />
        </div>

        <div className="latency-bars">
          {latencyStages.slice(0, 5).map(
            (stage) => (
              <i
                key={stage.value}
                className={
                  latency <= stage.value
                    ? "latency-bar active"
                    : "latency-bar"
                }
              />
            ),
          )}
        </div>
      </div>

      <div className="cache-result">
        <span className="cache-icon">
          ✓
        </span>

        <div>
          <strong>CACHE HIT</strong>
          <small>WARSAW EDGE NODE</small>
        </div>
      </div>

      <div className="optimization-result">
        <span>REQUEST OPTIMIZED</span>

        <strong>
          248 ms
          <i>→</i>
          12 ms
        </strong>

        <small>
          95.2% latency reduction
        </small>
      </div>
    </section>
  );
}