import {
  apiClient,
} from "./apiClient";

import type {
  AuthSession,
  AuthUser,
  BackendUser,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from "../types/auth";

const AUTH_SESSION_KEY =
  "edgemind_real_auth_session_v1";

function mapBackendUser(
  user: BackendUser,
): AuthUser {
  return {
    id: String(user.id),
    name: user.full_name,
    email: user.email,
    createdAt: user.created_at,
  };
}

function isAuthUser(
  value: unknown,
): value is AuthUser {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<AuthUser>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.createdAt ===
      "string"
  );
}

function isAuthSession(
  value: unknown,
): value is AuthSession {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<AuthSession>;

  return (
    typeof candidate.token ===
      "string" &&
    candidate.token.length > 0 &&
    isAuthUser(candidate.user)
  );
}

function parseStoredSession(
  rawValue: string | null,
) {
  if (!rawValue) {
    return null;
  }

  try {
    const value: unknown =
      JSON.parse(rawValue);

    return isAuthSession(value)
      ? value
      : null;
  } catch {
    return null;
  }
}

export function readAuthSession() {
  try {
    const persistentSession =
      parseStoredSession(
        window.localStorage.getItem(
          AUTH_SESSION_KEY,
        ),
      );

    if (persistentSession) {
      return persistentSession;
    }

    return parseStoredSession(
      window.sessionStorage.getItem(
        AUTH_SESSION_KEY,
      ),
    );
  } catch {
    return null;
  }
}

export function saveAuthSession(
  session: AuthSession,
  rememberMe: boolean,
) {
  window.localStorage.removeItem(
    AUTH_SESSION_KEY,
  );

  window.sessionStorage.removeItem(
    AUTH_SESSION_KEY,
  );

  const storage =
    rememberMe
      ? window.localStorage
      : window.sessionStorage;

  storage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify(session),
  );
}

export function clearAuthSession() {
  try {
    window.localStorage.removeItem(
      AUTH_SESSION_KEY,
    );

    window.sessionStorage.removeItem(
      AUTH_SESSION_KEY,
    );
  } catch {
    // React will still clear the
    // in-memory authenticated user.
  }
}

async function createSession(
  credentials: LoginRequest,
  rememberMe: boolean,
) {
  const tokenResponse =
    await apiClient.post<TokenResponse>(
      "/api/auth/login",
      credentials,
    );

  const backendUser =
    await apiClient.get<BackendUser>(
      "/api/auth/me",
      {
        token:
          tokenResponse.access_token,
      },
    );

  const session: AuthSession = {
    token:
      tokenResponse.access_token,
    user: mapBackendUser(
      backendUser,
    ),
  };

  saveAuthSession(
    session,
    rememberMe,
  );

  return session;
}

export const authService = {
  login(
    credentials: LoginRequest,
    rememberMe: boolean,
  ) {
    return createSession(
      credentials,
      rememberMe,
    );
  },

  async register(
    registration: RegisterRequest,
  ) {
    await apiClient.post<BackendUser>(
      "/api/auth/register",
      registration,
    );

    return createSession(
      {
        email: registration.email,
        password:
          registration.password,
      },
      true,
    );
  },

  async restoreSession(
    session: AuthSession,
  ) {
    const backendUser =
      await apiClient.get<BackendUser>(
        "/api/auth/me",
        {
          token: session.token,
        },
      );

    const restoredSession: AuthSession = {
      token: session.token,
      user: mapBackendUser(
        backendUser,
      ),
    };

    const persistent =
      window.localStorage.getItem(
        AUTH_SESSION_KEY,
      ) !== null;

    saveAuthSession(
      restoredSession,
      persistent,
    );

    return restoredSession;
  },

  readSession: readAuthSession,
  clearSession: clearAuthSession,
};
