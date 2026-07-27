export type DashboardMetricTone =
  | "green"
  | "cyan"
  | "violet"
  | "orange";

export interface DashboardMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  changePercent: number;
  detail: string;
  tone: DashboardMetricTone;
}

export type EdgeNodeStatus =
  | "healthy"
  | "watch"
  | "offline";

export interface DashboardEdgeNode {
  id: string;
  code: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  latencyMs: number;
  loadPercent: number;
  cacheHitRate: number;
  requestsPerSecond: number;
  status: EdgeNodeStatus;
}

export interface DashboardRouteDecision {
  selectedRoute: string[];
  alternativeRoute: string[];
  selectedLatencyMs: number;
  alternativeLatencyMs: number;
  confidence: number;
  reason: string;
}

export type ActivitySeverity =
  | "info"
  | "success"
  | "warning"
  | "error";

export interface DashboardActivity {
  id: string;
  occurredAt: string;
  title: string;
  detail: string;
  severity: ActivitySeverity;
}

export interface DashboardSnapshot {
  generatedAt: string;
  requestRatePerSecond: number;
  globalLatencyMs: number;
  cacheHitRate: number;
  healthyNodes: number;
  totalNodes: number;
  originHealthPercent: number;
  bandwidthSavedGb: number;
  errorRatePercent: number;
  failoverTimeMs: number;
  metrics: DashboardMetric[];
  nodes: DashboardEdgeNode[];
  routeDecision: DashboardRouteDecision;
  activity: DashboardActivity[];
}