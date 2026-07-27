export type OriginRegion =
  | "warsaw"
  | "frankfurt"
  | "virginia"
  | "singapore"
  | "sydney";

export type AudienceRegion =
  | "europe"
  | "north-america"
  | "asia-pacific"
  | "global";

export type ContentType =
  | "web"
  | "api"
  | "video"
  | "downloads";

export type TrafficProfile =
  | "steady"
  | "bursty"
  | "event"
  | "growth";

export type OptimizationGoal =
  | "balanced"
  | "latency"
  | "cache"
  | "resilience";

export interface SimulationConfig {
  name: string;
  origin: OriginRegion;
  audience: AudienceRegion;
  contentType: ContentType;
  trafficProfile: TrafficProfile;
  optimizationGoal: OptimizationGoal;
  requestsPerSecond: number;
  payloadSizeKb: number;
  cacheTtlSeconds: number;
  warmCache: boolean;
  failover: boolean;
  aiRouting: boolean;
}

export interface SimulationPrediction {
  route: string;
  latencyMs: number;
  cacheHitRate: number;
  originRequests: number;
  bandwidthSavedGb: number;
  confidence: number;
}

export interface SimulationResult
  extends SimulationPrediction {
  id: string;
}

export interface CompletedSimulation {
  config: SimulationConfig;
  result: SimulationResult;
  completedAt: string;
}

export interface SavedSimulation
  extends CompletedSimulation {
  savedAt: string;
}

/**
 * POST /api/simulations
 *
 * The FastAPI backend will receive this
 * request body.
 */
export interface RunSimulationRequest {
  config: SimulationConfig;
}

/**
 * POST /api/simulations
 *
 * The FastAPI backend must return this
 * response body.
 */
export type RunSimulationResponse =
  CompletedSimulation;

/**
 * GET /api/simulations
 *
 * The backend should return the current
 * user's saved simulations.
 */
export interface SimulationListResponse {
  simulations: SavedSimulation[];
  total: number;
}