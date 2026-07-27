import {
  apiClient,
} from "./apiClient";
import type {
  DashboardSnapshot,
} from "../types/dashboard";

const USE_REAL_API =
  import.meta.env
    .VITE_USE_REAL_API === "true";

const mockSnapshot:
  DashboardSnapshot = {
    generatedAt:
      new Date().toISOString(),
    requestRatePerSecond: 18400,
    globalLatencyMs: 12,
    cacheHitRate: 94.8,
    healthyNodes: 33,
    totalNodes: 33,
    originHealthPercent: 99.9,
    bandwidthSavedGb: 4800,
    errorRatePercent: 0.03,
    failoverTimeMs: 280,
    metrics: [
      {
        key: "requests",
        label: "Request rate",
        value: 18400,
        unit: "requests/s",
        changePercent: 8.2,
        detail:
          "Across active simulations",
        tone: "green",
      },
      {
        key: "latency",
        label: "Global latency",
        value: 12,
        unit: "ms",
        changePercent: -6,
        detail:
          "Optimized route average",
        tone: "cyan",
      },
      {
        key: "cache",
        label: "Cache hit rate",
        value: 94.8,
        unit: "%",
        changePercent: 1.4,
        detail:
          "Global cache efficiency",
        tone: "violet",
      },
      {
        key: "nodes",
        label: "Healthy nodes",
        value: 33,
        unit: "nodes",
        changePercent: 0,
        detail:
          "All regions operational",
        tone: "orange",
      },
    ],
    nodes: [
      {
        id: "node-waw",
        code: "WAW",
        city: "Warsaw",
        region: "Europe",
        latitude: 52.2297,
        longitude: 21.0122,
        latencyMs: 7,
        loadPercent: 51,
        cacheHitRate: 96.8,
        requestsPerSecond: 2800,
        status: "healthy",
      },
      {
        id: "node-fra",
        code: "FRA",
        city: "Frankfurt",
        region: "Europe",
        latitude: 50.1109,
        longitude: 8.6821,
        latencyMs: 9,
        loadPercent: 68,
        cacheHitRate: 95.4,
        requestsPerSecond: 3700,
        status: "healthy",
      },
      {
        id: "node-nyc",
        code: "NYC",
        city: "New York",
        region: "Americas",
        latitude: 40.7128,
        longitude: -74.006,
        latencyMs: 41,
        loadPercent: 73,
        cacheHitRate: 91.2,
        requestsPerSecond: 4400,
        status: "watch",
      },
    ],
    routeDecision: {
      selectedRoute: [
        "WAW",
        "FRA",
        "LON",
      ],
      alternativeRoute: [
        "WAW",
        "AMS",
        "LON",
      ],
      selectedLatencyMs: 12,
      alternativeLatencyMs: 19,
      confidence: 96,
      reason:
        "Lowest predicted latency with healthy fallback capacity.",
    },
    activity: [
      {
        id: "activity-1",
        occurredAt:
          new Date().toISOString(),
        title:
          "Route automatically optimized",
        detail:
          "WAW → FRA → LON selected",
        severity: "success",
      },
    ],
  };

export async function getDashboardSnapshot() {
  if (USE_REAL_API) {
    return apiClient.get<
      DashboardSnapshot
    >("/api/dashboard");
  }

  return {
    ...mockSnapshot,
    generatedAt:
      new Date().toISOString(),
  };
}

export const dashboardService = {
  getSnapshot:
    getDashboardSnapshot,
};