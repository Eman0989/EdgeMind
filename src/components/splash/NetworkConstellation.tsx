import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";

interface NetworkCity {
  name: string;
  code: string;
  region: string;
  labelX: number;
  labelY: number;
  connectorX: number;
  connectorY: number;
}

interface NetworkPoint {
  id: string;
  x: number;
  y: number;
  important?: boolean;
  city?: NetworkCity;
}

interface NetworkEdge {
  from: string;
  to: string;
}

interface NetworkActivityPath {
  from: string;
  to: string;
  duration: number;
  delay: number;
}

const points: NetworkPoint[] = [
  { id: "p01", x: 82, y: 150 },
  { id: "p02", x: 142, y: 102 },
  { id: "p03", x: 208, y: 155 },
  { id: "p04", x: 274, y: 112 },
  { id: "p05", x: 338, y: 158 },
  { id: "p06", x: 407, y: 95 },
  { id: "p07", x: 474, y: 142 },
  { id: "p08", x: 545, y: 92 },
  { id: "p09", x: 614, y: 148 },
  { id: "p10", x: 682, y: 100 },
  { id: "p11", x: 752, y: 150 },
  { id: "p12", x: 822, y: 104 },
  { id: "p13", x: 900, y: 158 },

  { id: "p14", x: 105, y: 260 },
  {
    id: "p15",
    x: 185,
    y: 230,
    important: true,
    city: {
      name: "NEW YORK",
      code: "NYC-EDGE-04",
      region: "NORTH AMERICA",
      labelX: 58,
      labelY: 270,
      connectorX: 154,
      connectorY: 255,
    },
  },
  { id: "p16", x: 266, y: 278 },
  {
    id: "p17",
    x: 338,
    y: 218,
    important: true,
    city: {
      name: "LONDON",
      code: "LON-EDGE-03",
      region: "EUROPE WEST",
      labelX: 210,
      labelY: 148,
      connectorX: 318,
      connectorY: 201,
    },
  },
  {
    id: "p18",
    x: 418,
    y: 286,
    important: true,
    city: {
      name: "FRANKFURT",
      code: "FRA-EDGE-02",
      region: "EUROPE CENTRAL",
      labelX: 350,
      labelY: 320,
      connectorX: 406,
      connectorY: 307,
    },
  },
  {
    id: "p19",
    x: 510,
    y: 210,
    important: true,
    city: {
      name: "WARSAW",
      code: "WAW-EDGE-01",
      region: "EUROPE EAST",
      labelX: 482,
      labelY: 118,
      connectorX: 505,
      connectorY: 191,
    },
  },
  { id: "p20", x: 592, y: 280 },
  {
    id: "p21",
    x: 675,
    y: 220,
    important: true,
    city: {
      name: "ABU DHABI",
      code: "AUH-EDGE-06",
      region: "MIDDLE EAST",
      labelX: 640,
      labelY: 252,
      connectorX: 667,
      connectorY: 239,
    },
  },
  { id: "p22", x: 760, y: 286 },
  { id: "p23", x: 842, y: 222 },
  { id: "p24", x: 918, y: 275 },

  { id: "p25", x: 125, y: 390 },
  { id: "p26", x: 220, y: 350 },
  { id: "p27", x: 310, y: 414 },
  { id: "p28", x: 402, y: 366 },
  { id: "p29", x: 500, y: 426 },
  { id: "p30", x: 603, y: 368 },
  { id: "p31", x: 704, y: 424 },
  {
    id: "p32",
    x: 812,
    y: 356,
    important: true,
    city: {
      name: "JAKARTA",
      code: "JKT-EDGE-05",
      region: "SOUTHEAST ASIA",
      labelX: 824,
      labelY: 388,
      connectorX: 830,
      connectorY: 373,
    },
  },
  { id: "p33", x: 910, y: 416 },
];

const edges: NetworkEdge[] = [
  { from: "p01", to: "p02" },
  { from: "p02", to: "p03" },
  { from: "p03", to: "p04" },
  { from: "p04", to: "p05" },
  { from: "p05", to: "p06" },
  { from: "p06", to: "p07" },
  { from: "p07", to: "p08" },
  { from: "p08", to: "p09" },
  { from: "p09", to: "p10" },
  { from: "p10", to: "p11" },
  { from: "p11", to: "p12" },
  { from: "p12", to: "p13" },

  { from: "p01", to: "p14" },
  { from: "p02", to: "p15" },
  { from: "p03", to: "p15" },
  { from: "p03", to: "p16" },
  { from: "p04", to: "p17" },
  { from: "p05", to: "p17" },
  { from: "p05", to: "p18" },
  { from: "p06", to: "p18" },
  { from: "p07", to: "p19" },
  { from: "p08", to: "p19" },
  { from: "p08", to: "p20" },
  { from: "p09", to: "p20" },
  { from: "p09", to: "p21" },
  { from: "p10", to: "p21" },
  { from: "p10", to: "p22" },
  { from: "p11", to: "p22" },
  { from: "p11", to: "p23" },
  { from: "p12", to: "p23" },
  { from: "p12", to: "p24" },
  { from: "p13", to: "p24" },

  { from: "p14", to: "p15" },
  { from: "p15", to: "p16" },
  { from: "p16", to: "p17" },
  { from: "p17", to: "p18" },
  { from: "p18", to: "p19" },
  { from: "p19", to: "p20" },
  { from: "p20", to: "p21" },
  { from: "p21", to: "p22" },
  { from: "p22", to: "p23" },
  { from: "p23", to: "p24" },

  { from: "p14", to: "p25" },
  { from: "p15", to: "p25" },
  { from: "p15", to: "p26" },
  { from: "p16", to: "p26" },
  { from: "p16", to: "p27" },
  { from: "p17", to: "p27" },
  { from: "p17", to: "p28" },
  { from: "p18", to: "p28" },
  { from: "p18", to: "p29" },
  { from: "p19", to: "p29" },
  { from: "p19", to: "p30" },
  { from: "p20", to: "p30" },
  { from: "p20", to: "p31" },
  { from: "p21", to: "p31" },
  { from: "p21", to: "p32" },
  { from: "p22", to: "p32" },
  { from: "p22", to: "p33" },
  { from: "p23", to: "p33" },

  { from: "p25", to: "p26" },
  { from: "p26", to: "p27" },
  { from: "p27", to: "p28" },
  { from: "p28", to: "p29" },
  { from: "p29", to: "p30" },
  { from: "p30", to: "p31" },
  { from: "p31", to: "p32" },
  { from: "p32", to: "p33" },
];

const activeEdgeKeys = new Set<string>([
  "p02-p15",
  "p04-p17",
  "p06-p18",
  "p07-p19",
  "p09-p21",
  "p11-p23",
  "p15-p26",
  "p19-p30",
  "p21-p32",
  "p31-p32",
]);

const activityPaths: NetworkActivityPath[] = [
  { from: "p02", to: "p15", duration: 1.8, delay: 2.05 },
  { from: "p17", to: "p18", duration: 1.45, delay: 2.26 },
  { from: "p07", to: "p19", duration: 1.7, delay: 2.42 },
  { from: "p09", to: "p21", duration: 1.9, delay: 2.18 },
  { from: "p21", to: "p32", duration: 2.15, delay: 2.56 },
  { from: "p23", to: "p33", duration: 1.75, delay: 2.34 },
  { from: "p29", to: "p30", duration: 1.5, delay: 2.7 },
  { from: "p31", to: "p32", duration: 1.55, delay: 2.12 },
];

const pointMap = new Map<string, NetworkPoint>(
  points.map((point) => [point.id, point]),
);

const cityPoints = points.filter(
  (point): point is NetworkPoint & { city: NetworkCity } =>
    Boolean(point.city),
);

export default function NetworkConstellation() {
  const [activityTick, setActivityTick] =
    useState<number>(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActivityTick((currentValue) => currentValue + 1);
    }, 620);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const requestsPerSecond =
    18_100 + ((activityTick * 173) % 900);

  const activeRoutes =
    11 + (activityTick % 5);

  const cacheEvents =
    92 + ((activityTick * 3) % 7);

  const formattedRequests =
    `${(requestsPerSecond / 1000).toFixed(1)}K`;

  const formattedActivity =
    `${activeRoutes}`;

  const formattedCache =
    `ROUTES · ${cacheEvents}% CACHE`;

  return (
    <svg
      className="network-svg"
      viewBox="0 0 1000 520"
      preserveAspectRatio="xMidYMid meet"
      aria-label="EdgeMind global network topology"
    >
      <defs>
        <linearGradient
          id="lineGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor="#7c6fff"
            stopOpacity="0.38"
          />
          <stop
            offset="52%"
            stopColor="#2ee6d6"
            stopOpacity="0.72"
          />
          <stop
            offset="100%"
            stopColor="#2ee6d6"
            stopOpacity="0.26"
          />
        </linearGradient>

        <filter
          id="pointGlow"
          x="-250%"
          y="-250%"
          width="600%"
          height="600%"
        >
          <feGaussianBlur
            stdDeviation="4"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="network-lines">
        {edges.map((edge, index) => {
          const from = pointMap.get(edge.from);
          const to = pointMap.get(edge.to);

          if (!from || !to) {
            return null;
          }

          const edgeKey = `${edge.from}-${edge.to}`;
          const isActive = activeEdgeKeys.has(edgeKey);

          return (
            <line
              key={edgeKey}
              className={[
                "network-line",
                isActive ? "network-line-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              pathLength={1}
              style={
                {
                  animationDelay: `${1.32 + index * 0.018}s`,
                } as CSSProperties
              }
            />
          );
        })}
      </g>

      <g className="network-activity-lines">
        {edges.map((edge, index) => {
          const edgeKey = `${edge.from}-${edge.to}`;

          if (!activeEdgeKeys.has(edgeKey)) {
            return null;
          }

          const from = pointMap.get(edge.from);
          const to = pointMap.get(edge.to);

          if (!from || !to) {
            return null;
          }

          return (
            <line
              key={`activity-${edgeKey}`}
              className="network-activity-line"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              pathLength={1}
              style={
                {
                  "--flow-delay": `${2.08 + index * 0.045}s`,
                  "--flow-duration": `${1.7 + (index % 4) * 0.24}s`,
                } as CSSProperties
              }
            />
          );
        })}
      </g>

      <g className="network-live-packets">
        {activityPaths.map((activity, index) => {
          const from = pointMap.get(activity.from);
          const to = pointMap.get(activity.to);

          if (!from || !to) {
            return null;
          }

          const motionPath =
            `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

          return (
            <circle
              key={`${activity.from}-${activity.to}`}
              className={[
                "network-live-packet",
                index % 3 === 0 ? "is-violet" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              cx="0"
              cy="0"
              r={index % 3 === 0 ? 2.8 : 2.4}
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.15;0.78;1"
                begin={`${activity.delay}s`}
                dur={`${activity.duration}s`}
                repeatCount="indefinite"
              />

              <animateMotion
                path={motionPath}
                begin={`${activity.delay}s`}
                dur={`${activity.duration}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </circle>
          );
        })}
      </g>

      <g className="network-points">
        {points.map((point, index) => (
          <g
            key={point.id}
            className={[
              "network-node",
              point.important ? "important-node" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                animationDelay: `${1.48 + index * 0.032}s`,
              } as CSSProperties
            }
          >
            {point.important && (
              <circle
                className="network-node-ring"
                cx={point.x}
                cy={point.y}
                r="15"
              />
            )}

            <circle
              className="network-node-core"
              cx={point.x}
              cy={point.y}
              r={point.important ? 4.8 : 2.8}
            />
          </g>
        ))}
      </g>

      <g className="network-city-labels">
        {cityPoints.map((point, index) => {
          const city = point.city;

          return (
            <g
              key={city.code}
              className="network-city-label"
              style={
                {
                  "--city-delay": `${2.18 + index * 0.22}s`,
                } as CSSProperties
              }
            >
              <line
                className="network-city-connector"
                x1={point.x}
                y1={point.y}
                x2={city.connectorX}
                y2={city.connectorY}
              />

              <rect
                className="network-city-card"
                x={city.labelX}
                y={city.labelY}
                width="126"
                height="54"
                rx="7"
              />

              <circle
                className="network-city-status"
                cx={city.labelX + 13}
                cy={city.labelY + 14}
                r="3"
              />

              <text
                className="network-city-name"
                x={city.labelX + 23}
                y={city.labelY + 17}
              >
                {city.name}
              </text>

              <text
                className="network-city-code"
                x={city.labelX + 12}
                y={city.labelY + 33}
              >
                {city.code}
              </text>

              <text
                className="network-city-region"
                x={city.labelX + 12}
                y={city.labelY + 46}
              >
                {`${city.region} · ONLINE`}
              </text>
            </g>
          );
        })}
      </g>

      <g className="network-activity-readouts">
        <g className="network-activity-readout">
          <rect
            x="42"
            y="30"
            width="164"
            height="46"
            rx="7"
          />

          <circle
            cx="57"
            cy="44"
            r="3"
          />

          <text
            className="network-readout-label"
            x="69"
            y="47"
          >
            LIVE TRAFFIC
          </text>

          <text
            className="network-readout-value"
            x="56"
            y="65"
          >
            {formattedRequests}
          </text>

          <text
            className="network-readout-unit"
            x="111"
            y="65"
          >
            REQ/S
          </text>
        </g>

        <g className="network-activity-readout">
          <rect
            x="794"
            y="30"
            width="164"
            height="46"
            rx="7"
          />

          <circle
            cx="809"
            cy="44"
            r="3"
          />

          <text
            className="network-readout-label"
            x="821"
            y="47"
          >
            ROUTING ACTIVITY
          </text>

          <text
            className="network-readout-value"
            x="808"
            y="65"
          >
            {formattedActivity}
          </text>

          <text
            className="network-readout-unit"
            x="835"
            y="65"
          >
            {formattedCache}
          </text>
        </g>
      </g>
    </svg>
  );
}