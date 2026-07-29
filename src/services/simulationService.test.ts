import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  CompletedSimulation,
  SimulationConfig,
} from "../types/simulation";

import {
  getLastSimulation,
  simulationService,
} from "./simulationService";

const apiClientMock =
  vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }));

vi.mock("./apiClient", () => ({
  apiClient: apiClientMock,
}));

const LAST_SIMULATION_KEY =
  "edgemind_last_simulation_v1";

const config: SimulationConfig = {
  name:
    "European web delivery",
  origin: "warsaw",
  audience: "europe",
  contentType: "web",
  trafficProfile: "steady",
  optimizationGoal:
    "balanced",
  requestsPerSecond: 1000,
  payloadSizeKb: 500,
  cacheTtlSeconds: 3600,
  warmCache: true,
  failover: true,
  aiRouting: true,
};

const completedSimulation:
  CompletedSimulation = {
    config,
    result: {
      id: "simulation/42",
      route:
        "WAW → FRA → LON",
      latencyMs: 12,
      cacheHitRate: 94.9,
      originRequests: 51,
      bandwidthSavedGb:
        1708.1,
      confidence: 94,
    },
    completedAt:
      "2026-07-29T15:00:00Z",
  };

describe("simulationService", () => {
  beforeEach(() => {
    Object.values(
      apiClientMock,
    ).forEach((mock) => {
      mock.mockReset();
    });

    window.sessionStorage.clear();
  });

  it("predicts simulation results from configuration", () => {
    const prediction =
      simulationService.predict(
        config,
      );

    expect(prediction).toEqual({
      route:
        "WAW → FRA → LON",
      latencyMs: 12,
      cacheHitRate: 94.9,
      originRequests: 51,
      bandwidthSavedGb:
        1708.1,
      confidence: 94,
    });
  });

  it("runs an authenticated simulation and stores the result", async () => {
    apiClientMock
      .post
      .mockResolvedValue(
        completedSimulation,
      );

    const result =
      await simulationService.run(
        config,
        "token-123",
      );

    expect(
      apiClientMock.post,
    ).toHaveBeenCalledWith(
      "/api/simulations",
      {
        config,
      },
      {
        token: "token-123",
      },
    );

    expect(result).toEqual(
      completedSimulation,
    );

    expect(
      JSON.parse(
        window.sessionStorage.getItem(
          LAST_SIMULATION_KEY,
        ) ?? "null",
      ),
    ).toEqual(
      completedSimulation,
    );
  });

  it("reads a valid last simulation from storage", () => {
    window.sessionStorage.setItem(
      LAST_SIMULATION_KEY,
      JSON.stringify(
        completedSimulation,
      ),
    );

    expect(
      getLastSimulation(),
    ).toEqual(
      completedSimulation,
    );
  });

  it("ignores invalid stored simulation data", () => {
    window.sessionStorage.setItem(
      LAST_SIMULATION_KEY,
      JSON.stringify({
        config: {
          name: "Incomplete",
        },
      }),
    );

    expect(
      getLastSimulation(),
    ).toBeNull();
  });

  it("requests a paginated simulation list", async () => {
    apiClientMock
      .get
      .mockResolvedValue({
        items: [],
        page: 2,
        pageSize: 25,
        total: 0,
        totalPages: 0,
      });

    await simulationService.list(
      "token-123",
      2,
      25,
    );

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      "/api/simulations?page=2&pageSize=25",
      {
        token: "token-123",
      },
    );
  });

  it("encodes simulation IDs when fetching and renaming", async () => {
    apiClientMock
      .get
      .mockResolvedValue(
        completedSimulation,
      );

    apiClientMock
      .patch
      .mockResolvedValue({
        id: "simulation/42",
        name: "Renamed test",
      });

    await simulationService.getById(
      "simulation/42",
      "token-123",
    );

    await simulationService.rename(
      "simulation/42",
      "Renamed test",
      "token-123",
    );

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      "/api/simulations/simulation%2F42",
      {
        token: "token-123",
      },
    );

    expect(
      apiClientMock.patch,
    ).toHaveBeenCalledWith(
      "/api/simulations/simulation%2F42",
      {
        name: "Renamed test",
      },
      {
        token: "token-123",
      },
    );
  });

  it("deletes an authenticated simulation", async () => {
    apiClientMock
      .delete
      .mockResolvedValue(
        undefined,
      );

    await simulationService.delete(
      "simulation/42",
      "token-123",
    );

    expect(
      apiClientMock.delete,
    ).toHaveBeenCalledWith(
      "/api/simulations/simulation%2F42",
      {
        token: "token-123",
      },
    );
  });
});
