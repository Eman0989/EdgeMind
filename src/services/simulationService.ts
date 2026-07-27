import {
  apiClient,
} from "./apiClient";
import type {
  AudienceRegion,
  CompletedSimulation,
  ContentType,
  OptimizationGoal,
  OriginRegion,
  RunSimulationRequest,
  RunSimulationResponse,
  SavedSimulation,
  SimulationConfig,
  SimulationPrediction,
  SimulationResult,
  TrafficProfile,
} from "../types/simulation";

const LAST_SIMULATION_KEY =
  "edgemind_last_simulation_v1";

const SAVED_SIMULATIONS_KEY =
  "edgemind_saved_simulations_v1";

const USE_REAL_API =
  import.meta.env
    .VITE_USE_REAL_API === "true";

const routes: Record<
  AudienceRegion,
  Record<OriginRegion, string>
> = {
  europe: {
    warsaw: "WAW → FRA → LON",
    frankfurt: "FRA → AMS → LON",
    virginia: "IAD → NYC → LON",
    singapore: "SIN → DXB → FRA",
    sydney: "SYD → SIN → FRA",
  },
  "north-america": {
    warsaw: "WAW → FRA → NYC",
    frankfurt: "FRA → LON → NYC",
    virginia: "IAD → NYC → SFO",
    singapore: "SIN → TYO → SFO",
    sydney: "SYD → HNL → SFO",
  },
  "asia-pacific": {
    warsaw: "WAW → FRA → SIN",
    frankfurt: "FRA → DXB → SIN",
    virginia: "IAD → SFO → TYO",
    singapore: "SIN → HKG → TYO",
    sydney: "SYD → SIN → TYO",
  },
  global: {
    warsaw:
      "WAW → FRA → GLOBAL",
    frankfurt:
      "FRA → AMS → GLOBAL",
    virginia:
      "IAD → NYC → GLOBAL",
    singapore:
      "SIN → HKG → GLOBAL",
    sydney:
      "SYD → SIN → GLOBAL",
  },
};

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function createSimulationId() {
  return `SIM-${Math.floor(
    100 + Math.random() * 900,
  )}`;
}

function isSimulationConfig(
  value: unknown,
): value is SimulationConfig {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const item =
    value as Partial<
      SimulationConfig
    >;

  return (
    typeof item.name ===
      "string" &&
    typeof item.origin ===
      "string" &&
    typeof item.audience ===
      "string" &&
    typeof item.contentType ===
      "string" &&
    typeof item.trafficProfile ===
      "string" &&
    typeof item.optimizationGoal ===
      "string" &&
    typeof item.requestsPerSecond ===
      "number" &&
    typeof item.payloadSizeKb ===
      "number" &&
    typeof item.cacheTtlSeconds ===
      "number" &&
    typeof item.warmCache ===
      "boolean" &&
    typeof item.failover ===
      "boolean" &&
    typeof item.aiRouting ===
      "boolean"
  );
}

function isSimulationResult(
  value: unknown,
): value is SimulationResult {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const item =
    value as Partial<
      SimulationResult
    >;

  return (
    typeof item.id ===
      "string" &&
    typeof item.route ===
      "string" &&
    typeof item.latencyMs ===
      "number" &&
    typeof item.cacheHitRate ===
      "number" &&
    typeof item.originRequests ===
      "number" &&
    typeof item.bandwidthSavedGb ===
      "number" &&
    typeof item.confidence ===
      "number"
  );
}

export function isCompletedSimulation(
  value: unknown,
): value is CompletedSimulation {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const item =
    value as Partial<
      CompletedSimulation
    >;

  return (
    isSimulationConfig(
      item.config,
    ) &&
    isSimulationResult(
      item.result,
    ) &&
    typeof item.completedAt ===
      "string"
  );
}

export function predictSimulation(
  config: SimulationConfig,
): SimulationPrediction {
  const audienceLatency: Record<
    AudienceRegion,
    number
  > = {
    europe: 21,
    "north-america": 38,
    "asia-pacific": 54,
    global: 46,
  };

  const contentCacheBonus: Record<
    ContentType,
    number
  > = {
    web: 7,
    api: -12,
    video: 14,
    downloads: 18,
  };

  const trafficPenalty: Record<
    TrafficProfile,
    number
  > = {
    steady: 0,
    bursty: 5,
    event: 9,
    growth: 3,
  };

  const optimizationLatencyBonus:
    Record<
      OptimizationGoal,
      number
    > = {
      balanced: 5,
      latency: 10,
      cache: 3,
      resilience: 2,
    };

  const ttlFactor =
    Math.log10(
      Math.max(
        config.cacheTtlSeconds,
        1,
      ),
    ) * 7;

  const cacheHitRate = clamp(
    54 +
      ttlFactor +
      contentCacheBonus[
        config.contentType
      ] +
      (config.warmCache ? 9 : 0) +
      (config.optimizationGoal ===
      "cache"
        ? 6
        : 0),
    18,
    98.7,
  );

  const latencyMs = Math.round(
    clamp(
      audienceLatency[
        config.audience
      ] +
        trafficPenalty[
          config.trafficProfile
        ] -
        optimizationLatencyBonus[
          config.optimizationGoal
        ] -
        (config.aiRouting ? 4 : 0),
      7,
      120,
    ),
  );

  const originRequests = Math.max(
    1,
    Math.round(
      config.requestsPerSecond *
        (1 - cacheHitRate / 100),
    ),
  );

  const bandwidthSavedGb =
    (config.requestsPerSecond *
      config.payloadSizeKb *
      (cacheHitRate / 100) *
      3600) /
    1_000_000;

  const confidence = Math.round(
    clamp(
      76 +
        (config.aiRouting ? 10 : 0) +
        (config.failover ? 5 : 0) +
        (config.warmCache ? 3 : 0),
      70,
      98,
    ),
  );

  return {
    route:
      routes[config.audience][
        config.origin
      ],
    latencyMs,
    cacheHitRate: Number(
      cacheHitRate.toFixed(1),
    ),
    originRequests,
    bandwidthSavedGb: Number(
      bandwidthSavedGb.toFixed(1),
    ),
    confidence,
  };
}

function storeLastSimulation(
  simulation: CompletedSimulation,
) {
  try {
    window.sessionStorage.setItem(
      LAST_SIMULATION_KEY,
      JSON.stringify(simulation),
    );
  } catch {
    // Router state still carries the result
    // when browser storage is blocked.
  }
}

export function getLastSimulation() {
  try {
    const rawValue =
      window.sessionStorage.getItem(
        LAST_SIMULATION_KEY,
      );

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown =
      JSON.parse(rawValue);

    return isCompletedSimulation(
      parsedValue,
    )
      ? parsedValue
      : null;
  } catch {
    return null;
  }
}

export async function runSimulation(
  config: SimulationConfig,
) {
  let completed:
    CompletedSimulation;

  if (USE_REAL_API) {
    const requestBody:
      RunSimulationRequest = {
        config,
      };

    completed =
      await apiClient.post<
        RunSimulationResponse
      >(
        "/api/simulations",
        requestBody,
      );
  } else {
    const prediction =
      predictSimulation(config);

    completed = {
      config,
      result: {
        id: createSimulationId(),
        ...prediction,
      },
      completedAt:
        new Date().toISOString(),
    };
  }

  storeLastSimulation(completed);

  return completed;
}

export function saveSimulation(
  simulation: CompletedSimulation,
) {
  const current =
    getSavedSimulations();

  const saved: SavedSimulation = {
    ...simulation,
    savedAt:
      new Date().toISOString(),
  };

  const next = [
    saved,
    ...current.filter(
      (item) =>
        item.result.id !==
        simulation.result.id,
    ),
  ];

  window.localStorage.setItem(
    SAVED_SIMULATIONS_KEY,
    JSON.stringify(next),
  );

  return saved;
}

export function getSavedSimulations():
  SavedSimulation[] {
  try {
    const rawValue =
      window.localStorage.getItem(
        SAVED_SIMULATIONS_KEY,
      );

    if (!rawValue) {
      return [];
    }

    const parsedValue: unknown =
      JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(
        isCompletedSimulation,
      )
      .map((item) => ({
        ...item,
        savedAt:
          typeof (
            item as Partial<
              SavedSimulation
            >
          ).savedAt === "string"
            ? (
                item as SavedSimulation
              ).savedAt
            : item.completedAt,
      }));
  } catch {
    return [];
  }
}

export const simulationService = {
  predict: predictSimulation,
  run: runSimulation,
  getLast: getLastSimulation,
  save: saveSimulation,
  getSaved: getSavedSimulations,
};