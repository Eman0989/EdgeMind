import {
  apiClient,
} from "./apiClient";

import type {
  DashboardSnapshot,
} from "../types/dashboard";

export function getDashboardSnapshot(
  token: string,
) {
  return apiClient.get<
    DashboardSnapshot
  >(
    "/api/dashboard",
    {
      token,
    },
  );
}

export const dashboardService = {
  getSnapshot:
    getDashboardSnapshot,
};
