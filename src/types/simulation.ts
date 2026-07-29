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

export interface RunSimulationRequest {
  config: SimulationConfig;
}

export type RunSimulationResponse =
  CompletedSimulation;

export interface SimulationHistoryItem {
  id: string;
  name: string;
  status: string;
  route: string;
  latencyMs: number;
  cacheHitRate: number;
  confidence: number;
  createdAt: string;
  completedAt: string | null;
}

export interface SimulationListResponse {
  simulations: SimulationHistoryItem[];
  total: number;
}

export interface SimulationRenameRequest {
  name: string;
}

export interface SimulationRenameResponse {
  id: string;
  name: string;
  updatedAt: string;
}
