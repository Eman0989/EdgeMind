import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  render,
  screen,
} from "@testing-library/react";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import {
  useAuth,
} from "./AuthContext";

vi.mock("./AuthContext", () => ({
  useAuth: vi.fn(),
}));

const useAuthMock =
  vi.mocked(useAuth);

function mockAuthentication(
  isAuthenticated: boolean,
) {
  useAuthMock.mockReturnValue({
    user:
      isAuthenticated
        ? {
            id: "12",
            name: "Eman Javaid",
            email:
              "eman@example.com",
            createdAt:
              "2026-07-29T12:00:00Z",
          }
        : null,
    token:
      isAuthenticated
        ? "token-123"
        : null,
    isAuthenticated,
    login: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    logout: vi.fn(),
  });
}

function LoginProbe() {
  const location =
    useLocation();

  const state =
    location.state as
      | {
          from?: string;
        }
      | null;

  return (
    <div>
      Login page
      <span data-testid="redirect-from">
        {state?.from ?? "none"}
      </span>
    </div>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("redirects anonymous users to login", () => {
    mockAuthentication(false);

    render(
      <MemoryRouter
        initialEntries={[
          "/settings",
        ]}
      >
        <Routes>
          <Route
            element={
              <ProtectedRoute />
            }
          >
            <Route
              path="/settings"
              element={
                <div>
                  Settings page
                </div>
              }
            />
          </Route>

          <Route
            path="/login"
            element={
              <LoginProbe />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        "Login page",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "redirect-from",
      ),
    ).toHaveTextContent(
      "/settings",
    );

    expect(
      screen.queryByText(
        "Settings page",
      ),
    ).not.toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    mockAuthentication(true);

    render(
      <MemoryRouter
        initialEntries={[
          "/dashboard",
        ]}
      >
        <Routes>
          <Route
            element={
              <ProtectedRoute />
            }
          >
            <Route
              path="/dashboard"
              element={
                <div>
                  Dashboard page
                </div>
              }
            />
          </Route>

          <Route
            path="/login"
            element={
              <div>
                Login page
              </div>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        "Dashboard page",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Login page",
      ),
    ).not.toBeInTheDocument();
  });
});

describe("PublicOnlyRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("allows anonymous users to open login", () => {
    mockAuthentication(false);

    render(
      <MemoryRouter
        initialEntries={[
          "/login",
        ]}
      >
        <Routes>
          <Route
            element={
              <PublicOnlyRoute />
            }
          >
            <Route
              path="/login"
              element={
                <div>
                  Login form
                </div>
              }
            />
          </Route>

          <Route
            path="/dashboard"
            element={
              <div>
                Dashboard page
              </div>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        "Login form",
      ),
    ).toBeInTheDocument();
  });

  it("redirects authenticated users to dashboard", () => {
    mockAuthentication(true);

    render(
      <MemoryRouter
        initialEntries={[
          "/login",
        ]}
      >
        <Routes>
          <Route
            element={
              <PublicOnlyRoute />
            }
          >
            <Route
              path="/login"
              element={
                <div>
                  Login form
                </div>
              }
            />
          </Route>

          <Route
            path="/dashboard"
            element={
              <div>
                Dashboard page
              </div>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        "Dashboard page",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Login form",
      ),
    ).not.toBeInTheDocument();
  });
});
