import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  dashboardService,
} from "./dashboardService";

const apiClientMock =
  vi.hoisted(() => ({
    get: vi.fn(),
  }));

vi.mock("./apiClient", () => ({
  apiClient: apiClientMock,
}));

describe("dashboardService", () => {
  beforeEach(() => {
    apiClientMock.get.mockReset();
  });

  it("requests the authenticated dashboard snapshot", async () => {
    const dashboardSnapshot = {
      total_simulations: 12,
      average_latency_ms: 28.5,
      average_cache_hit_rate: 91.4,
      bandwidth_saved_gb: 3200.8,
      recent_simulations: [],
    };

    apiClientMock
      .get
      .mockResolvedValue(
        dashboardSnapshot,
      );

    const result =
      await dashboardService.getSnapshot(
        "token-123",
      );

    expect(
      apiClientMock.get,
    ).toHaveBeenCalledWith(
      "/api/dashboard",
      {
        token: "token-123",
      },
    );

    expect(result).toEqual(
      dashboardSnapshot,
    );
  });

  it("passes API errors to the caller", async () => {
    const error = new Error(
      "Dashboard unavailable.",
    );

    apiClientMock
      .get
      .mockRejectedValue(
        error,
      );

    await expect(
      dashboardService.getSnapshot(
        "token-123",
      ),
    ).rejects.toBe(error);
  });
});
