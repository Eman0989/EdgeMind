import {
  useState,
} from "react";

import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  AuthSession,
} from "../../types/auth";

import {
  AuthProvider,
  useAuth,
} from "./AuthContext";

const authServiceMock =
  vi.hoisted(() => ({
    readSession: vi.fn(),
    restoreSession: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    clearSession: vi.fn(),
  }));

vi.mock(
  "../../services/authService",
  () => ({
    authService:
      authServiceMock,
  }),
);

const session: AuthSession = {
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

function AuthHarness() {
  const {
    user,
    isAuthenticated,
    login,
    updateProfile,
    logout,
  } = useAuth();

  const [
    message,
    setMessage,
  ] = useState("");

  return (
    <div>
      <span data-testid="auth-status">
        {isAuthenticated
          ? "authenticated"
          : "anonymous"}
      </span>

      <span data-testid="user-name">
        {user?.name ?? "none"}
      </span>

      <button
        type="button"
        onClick={async () => {
          const result =
            await login({
              email:
                " Eman@Example.COM ",
              password:
                "Password123!",
              rememberMe: false,
            });

          setMessage(
            result.message,
          );
        }}
      >
        Log in
      </button>

      <button
        type="button"
        onClick={async () => {
          const result =
            await updateProfile({
              name:
                "Eman Updated",
              email:
                " Updated@Example.COM ",
            });

          setMessage(
            result.message,
          );
        }}
      >
        Update profile
      </button>

      <button
        type="button"
        onClick={logout}
      >
        Log out
      </button>

      <span data-testid="auth-message">
        {message}
      </span>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthHarness />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    Object.values(
      authServiceMock,
    ).forEach((mock) => {
      mock.mockReset();
    });

    authServiceMock
      .readSession
      .mockReturnValue(null);
  });

  it("starts unauthenticated without a stored session", () => {
    renderAuthProvider();

    expect(
      screen.getByTestId(
        "auth-status",
      ),
    ).toHaveTextContent(
      "anonymous",
    );

    expect(
      screen.getByTestId(
        "user-name",
      ),
    ).toHaveTextContent(
      "none",
    );
  });

  it("normalizes email and authenticates after login", async () => {
    const user =
      userEvent.setup();

    authServiceMock
      .login
      .mockResolvedValue(
        session,
      );

    renderAuthProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Log in",
        },
      ),
    );

    expect(
      authServiceMock.login,
    ).toHaveBeenCalledWith(
      {
        email:
          "eman@example.com",
        password:
          "Password123!",
      },
      false,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "auth-status",
        ),
      ).toHaveTextContent(
        "authenticated",
      );
    });

    expect(
      screen.getByTestId(
        "user-name",
      ),
    ).toHaveTextContent(
      "Eman Javaid",
    );

    expect(
      screen.getByTestId(
        "auth-message",
      ),
    ).toHaveTextContent(
      "Authentication successful.",
    );
  });

  it("returns a login error without authenticating", async () => {
    const user =
      userEvent.setup();

    authServiceMock
      .login
      .mockRejectedValue(
        new Error(
          "Invalid credentials.",
        ),
      );

    renderAuthProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Log in",
        },
      ),
    );

    expect(
      await screen.findByTestId(
        "auth-message",
      ),
    ).toHaveTextContent(
      "Invalid credentials.",
    );

    expect(
      screen.getByTestId(
        "auth-status",
      ),
    ).toHaveTextContent(
      "anonymous",
    );
  });

  it("restores and refreshes a stored session", async () => {
    const storedSession = {
      ...session,
      user: {
        ...session.user,
        name:
          "Stored User",
      },
    };

    const restoredSession = {
      ...session,
      user: {
        ...session.user,
        name:
          "Restored User",
      },
    };

    authServiceMock
      .readSession
      .mockReturnValue(
        storedSession,
      );

    authServiceMock
      .restoreSession
      .mockResolvedValue(
        restoredSession,
      );

    renderAuthProvider();

    expect(
      screen.getByTestId(
        "auth-status",
      ),
    ).toHaveTextContent(
      "authenticated",
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "user-name",
        ),
      ).toHaveTextContent(
        "Restored User",
      );
    });

    expect(
      authServiceMock
        .restoreSession,
    ).toHaveBeenCalledWith(
      storedSession,
    );
  });

  it("updates the authenticated profile", async () => {
    const user =
      userEvent.setup();

    const updatedSession = {
      ...session,
      user: {
        ...session.user,
        name:
          "Eman Updated",
        email:
          "updated@example.com",
      },
    };

    authServiceMock
      .readSession
      .mockReturnValue(
        session,
      );

    authServiceMock
      .restoreSession
      .mockResolvedValue(
        session,
      );

    authServiceMock
      .updateProfile
      .mockResolvedValue(
        updatedSession,
      );

    renderAuthProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name:
            "Update profile",
        },
      ),
    );

    expect(
      authServiceMock
        .updateProfile,
    ).toHaveBeenCalledWith(
      session,
      {
        full_name:
          "Eman Updated",
        email:
          "updated@example.com",
      },
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "user-name",
        ),
      ).toHaveTextContent(
        "Eman Updated",
      );
    });

    expect(
      screen.getByTestId(
        "auth-message",
      ),
    ).toHaveTextContent(
      "Profile updated successfully.",
    );
  });

  it("clears authentication during logout", async () => {
    const user =
      userEvent.setup();

    authServiceMock
      .readSession
      .mockReturnValue(
        session,
      );

    authServiceMock
      .restoreSession
      .mockResolvedValue(
        session,
      );

    renderAuthProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Log out",
        },
      ),
    );

    expect(
      authServiceMock
        .clearSession,
    ).toHaveBeenCalledOnce();

    expect(
      screen.getByTestId(
        "auth-status",
      ),
    ).toHaveTextContent(
      "anonymous",
    );

    expect(
      screen.getByTestId(
        "user-name",
      ),
    ).toHaveTextContent(
      "none",
    );
  });
});
