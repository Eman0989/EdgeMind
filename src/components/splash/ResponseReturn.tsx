import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface ResponseReturnProps {
  visible: boolean;
  handoffActive: boolean;
}

const RETURN_DRAW_DURATION = 1200;

const REVERSE_ROUTE = `
  M 850 225
  C 815 245, 770 365, 720 350
  C 675 330, 625 205, 575 210
  C 535 220, 515 315, 470 310
  C 435 305, 410 235, 370 205
  C 330 180, 285 205, 245 250
  C 205 300, 155 360, 115 370
`;

const responseNodes = [
  { name: "SINGAPORE", x: 850, y: 225 },
  { name: "NEW YORK", x: 720, y: 350 },
  { name: "LONDON", x: 575, y: 210 },
  { name: "FRANKFURT", x: 470, y: 310 },
  { name: "WARSAW", x: 370, y: 205 },
  { name: "ROUTER", x: 245, y: 250 },
  { name: "ORIGIN", x: 115, y: 370 },
];

export default function ResponseReturn({
  visible,
  handoffActive,
}: ResponseReturnProps) {
  const returnShadowRef =
    useRef<SVGPathElement | null>(null);

  const returnGlowRef =
    useRef<SVGPathElement | null>(null);

  const returnMainRef =
    useRef<SVGPathElement | null>(null);

  const returnHighlightRef =
    useRef<SVGPathElement | null>(null);

  const [returnComplete, setReturnComplete] =
    useState(false);

  useLayoutEffect(() => {
    if (!visible) {
      setReturnComplete(false);
      return;
    }

    setReturnComplete(false);

    const returnMain =
      returnMainRef.current;

    const returnPaths = [
      returnShadowRef.current,
      returnGlowRef.current,
      returnMain,
      returnHighlightRef.current,
    ].filter(
      (
        path,
      ): path is SVGPathElement =>
        path !== null,
    );

    if (!returnMain || returnPaths.length === 0) {
      return;
    }

    const routeLength =
      returnMain.getTotalLength();

    returnPaths.forEach((path) => {
      path.style.strokeDasharray =
        `${routeLength}`;
      path.style.strokeDashoffset =
        `${routeLength}`;
      path.style.opacity = "1";
    });

    returnMain.getBoundingClientRect();

    let animationFrame = 0;
    const startedAt = performance.now();

    const drawReturnRoute = (
      now: number,
    ) => {
      const elapsed = now - startedAt;

      const progress = Math.min(
        1,
        elapsed / RETURN_DRAW_DURATION,
      );

      const dashOffset =
        routeLength * (1 - progress);

      returnPaths.forEach((path) => {
        path.style.strokeDashoffset =
          `${dashOffset}`;
      });

      if (progress < 1) {
        animationFrame =
          window.requestAnimationFrame(
            drawReturnRoute,
          );
      } else {
        returnPaths.forEach((path) => {
          path.style.strokeDashoffset =
            "0";
        });

        setReturnComplete(true);
      }
    };

    animationFrame =
      window.requestAnimationFrame(
        drawReturnRoute,
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [visible]);

  return (
    <section
      className={[
        "response-return-scene",
        visible ? "is-visible" : "",
        handoffActive ? "is-handoff" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      <div className="response-return-copy">
        <span>OPTIMIZED RESPONSE</span>

        <strong>
          Returning data to the client
        </strong>

        <small>
          Cache hit confirmed · accelerated return path
        </small>
      </div>

      <div className="response-return-metrics">
        <article>
          <span>RETURN LATENCY</span>
          <strong>
            12 <small>ms</small>
          </strong>
        </article>

        <article>
          <span>PAYLOAD</span>
          <strong>
            1.8 <small>MB</small>
          </strong>
        </article>

        <article>
          <span>STATUS</span>
          <strong className="response-status">
            200
          </strong>
        </article>
      </div>

      <svg
        className="response-return-map"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="responseGlow"
            x="-220%"
            y="-220%"
            width="540%"
            height="540%"
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
            id="responseReturnGradient"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="#2ee6d6"
            />

            <stop
              offset="55%"
              stopColor="#ecfdfb"
            />

            <stop
              offset="100%"
              stopColor="#7c6fff"
            />
          </linearGradient>

          <linearGradient
            id="responseHighlightGradient"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="#9ffcf3"
              stopOpacity="0.7"
            />

            <stop
              offset="52%"
              stopColor="#ecfdfb"
              stopOpacity="0.94"
            />

            <stop
              offset="100%"
              stopColor="#b7b0ff"
              stopOpacity="0.78"
            />
          </linearGradient>
        </defs>

        <path
          className="response-return-track"
          d={REVERSE_ROUTE}
        />

        {visible &&
          !returnComplete && (
            <g className="response-route-3d">
              <path
                ref={returnShadowRef}
                className="response-route-3d-shadow"
                d={REVERSE_ROUTE}
                fill="none"
              />

              <path
                ref={returnGlowRef}
                className="response-route-3d-glow"
                d={REVERSE_ROUTE}
                fill="none"
              />

              <path
                ref={returnMainRef}
                className="response-route-3d-main"
                d={REVERSE_ROUTE}
                fill="none"
              />

              <path
                ref={returnHighlightRef}
                className="response-route-3d-highlight"
                d={REVERSE_ROUTE}
                fill="none"
              />
            </g>
          )}

        {visible &&
          returnComplete && (
            <g className="response-route-3d is-static">
              <path
                className="response-route-3d-shadow"
                d={REVERSE_ROUTE}
                fill="none"
              />

              <path
                className="response-route-3d-glow"
                d={REVERSE_ROUTE}
                fill="none"
              />

              <path
                className="response-route-3d-main"
                d={REVERSE_ROUTE}
                fill="none"
              />

              <path
                className="response-route-3d-highlight"
                d={REVERSE_ROUTE}
                fill="none"
              />
            </g>
          )}

        {responseNodes.map((node, index) => (
          <g
            key={node.name}
            className={[
              "response-return-node",
              index === 0 ? "is-source" : "",
              index === responseNodes.length - 1
                ? "is-destination"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <circle
              className="response-return-ring"
              cx={node.x}
              cy={node.y}
              r="16"
            />

            <circle
              className="response-return-core"
              cx={node.x}
              cy={node.y}
              r="4.5"
            />

            {(index === 0 ||
              index === responseNodes.length - 1) && (
              <text
                className="response-return-label"
                x={node.x}
                y={node.y + 36}
                textAnchor="middle"
              >
                {node.name}
              </text>
            )}
          </g>
        ))}

        {visible && (
          <circle
            className="response-return-packet"
            cx="0"
            cy="0"
            r="6"
            opacity="0"
            filter="url(#responseGlow)"
          >
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.03;0.96;1"
              begin="0s"
              dur="1.2s"
              fill="freeze"
            />

            <animateMotion
              path={REVERSE_ROUTE}
              begin="0s"
              dur="1.2s"
              fill="freeze"
              calcMode="linear"
            />
          </circle>
        )}
      </svg>

      <div className="response-arrival-card">
        <span className="response-arrival-icon">
          ✓
        </span>

        <div>
          <span>RESPONSE RECEIVED</span>
          <strong>Client delivery complete</strong>
          <small>12 ms total return time</small>
        </div>
      </div>

      <div className="response-return-footer">
        <span>
          SINGAPORE EDGE
        </span>

        <i />

        <strong>
          ORIGIN CLIENT
        </strong>
      </div>
    </section>
  );
}