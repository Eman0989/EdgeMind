import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

import {
  apiClient,
} from "./apiClient";

import {
  authService,
  clearAuthSession,
  readAuthSession,
} from "./authService";

import type {
  BackendUser,
  TokenResponse,
} from "../types/auth";

vi.mock("./apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const SESSION_KEY =
  "edgemind_real_auth_session_v1";

const postMock =
  apiClient.post as unknown as Mock;

const getMock =
  apiClient.get as unknown as Mock;

const patchMock =
  apiClient.patch as unknown as Mock;

const backendUser: BackendUser = {
  id: 12,
  email: "eman@example.com",
  full_name: "Eman Javaid",
  is_active: true,
  created_at:
    "2026-07-29T12:00:00Z",
};

const tokenResponse: TokenResponse = {
  access_token: "token-123",
  token_type: "bearer",
  expires_in: 3600,
};

describe("authService", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();

    postMock.mockReset();
    getMock.mockReset();
    patchMock.mockReset();
  });

  it("logs in and stores a temporary session", async () => {
    postMock.mockResolvedValue(
      tokenResponse,
    );

    getMock.mockResolvedValue(
      backendUser,
    );

    const session =
      await authService.login(
        {
          email:
            "eman@example.com",
          password: "Password123!",
        },
        false,
      );

    expect(postMock).toHaveBeenCalledWith(
      "/api/auth/login",
      {
        email:
          "eman@example.com",
        password: "Password123!",
      },
    );

    expect(getMock).toHaveBeenCalledWith(
      "/api/auth/me",
      {
        token: "token-123",
      },
    );

    expect(session).toEqual({
      token: "token-123",
      user: {
        id: "12",
        name: "Eman Javaid",
        email:
          "eman@example.com",
        createdAt:
          "2026-07-29T12:00:00Z",
      },
    });

    expect(
      window.sessionStorage.getItem(
        SESSION_KEY,
      ),
    ).not.toBeNull();

    expect(
      window.localStorage.getItem(
        SESSION_KEY,
      ),
    ).toBeNull();
  });

  it("registers and stores a persistent session", async () => {
    postMock
      .mockResolvedValueOnce(
        backendUser,
      )
      .mockResolvedValueOnce(
        tokenResponse,
      );

    getMock.mockResolvedValue(
      backendUser,
    );

    const session =
      await authService.register({
        full_name: "Eman Javaid",
        email:
          "eman@example.com",
        password: "Password123!",
      });

    expect(postMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/register",
      {
        full_name: "Eman Javaid",
        email:
          "eman@example.com",
        password: "Password123!",
      },
    );

    expect(postMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/login",
      {
        email:
          "eman@example.com",
        password: "Password123!",
      },
    );

    expect(session.token).toBe(
      "token-123",
    );

    expect(
      window.localStorage.getItem(
        SESSION_KEY,
      ),
    ).not.toBeNull();

    expect(
      window.sessionStorage.getItem(
        SESSION_KEY,
      ),
    ).toBeNull();
  });

  it("updates the profile and preserves storage mode", async () => {
    const existingSession = {
      token: "token-123",
      user: {
        id: "12",
        name: "Eman Javaid",
        email:
          "eman@example.com",
        createdAt:
          "2026-07-29T12:00:00Z",
      },
    };

    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify(
        existingSession,
      ),
    );

    patchMock.mockResolvedValue({
      ...backendUser,
      full_name:
        "Eman Updated",
      email:
        "updated@example.com",
    });

    const updated =
      await authService.updateProfile(
        existingSession,
        {
          full_name:
            "Eman Updated",
          email:
            "updated@example.com",
        },
      );

    expect(patchMock).toHaveBeenCalledWith(
      "/api/auth/me",
      {
        full_name:
          "Eman Updated",
        email:
          "updated@example.com",
      },
      {
        token: "token-123",
      },
    );

    expect(updated.user).toMatchObject({
      name: "Eman Updated",
      email:
        "updated@example.com",
    });

    expect(
      window.sessionStorage.getItem(
        SESSION_KEY,
      ),
    ).not.toBeNull();

    expect(
      window.localStorage.getItem(
        SESSION_KEY,
      ),
    ).toBeNull();
  });

  it("ignores invalid stored sessions", () => {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        token: "",
        user: {},
      }),
    );

    expect(
      readAuthSession(),
    ).toBeNull();
  });

  it("clears persistent and temporary sessions", () => {
    window.localStorage.setItem(
      SESSION_KEY,
      "persistent",
    );

    window.sessionStorage.setItem(
      SESSION_KEY,
      "temporary",
    );

    clearAuthSession();

    expect(
      window.localStorage.getItem(
        SESSION_KEY,
      ),
    ).toBeNull();

    expect(
      window.sessionStorage.getItem(
        SESSION_KEY,
      ),
    ).toBeNull();
  });
});
