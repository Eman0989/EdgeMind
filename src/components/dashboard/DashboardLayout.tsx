import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useAuth,
} from "../auth/AuthContext";

import {
  dashboardService,
} from "../../services/dashboardService";

import "./DashboardLayout.css";

type NavigationIcon =
  | "overview"
  | "simulator"
  | "history"
  | "settings";

interface NavigationItem {
  label: string;
  to: string;
  icon: NavigationIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: "overview",
  },
  {
    label: "Simulator",
    to: "/simulator",
    icon: "simulator",
  },
  {
    label: "Simulations",
    to: "/simulations",
    icon: "history",
  },
  {
    label: "Settings",
    to: "/settings",
    icon: "settings",
  },
];

function NavigationGlyph({
  type,
}: {
  type: NavigationIcon;
}) {
  if (type === "overview") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1.5"
        />
      </svg>
    );
  }

  if (type === "simulator") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="5"
          cy="16"
          r="2"
        />
        <circle
          cx="19"
          cy="7"
          r="2"
        />
        <path d="M7 15C10 14 10 9 14 8C15.5 7.5 16.5 7 17 7" />
      </svg>
    );
  }

  if (type === "history") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 12A8 8 0 1 0 6.4 6.3" />
        <path d="M4 4V9H9" />
        <path d="M12 8V12L15 14" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
      />
      <path d="M19.4 15A1.7 1.7 0 0 0 19.7 16.9L20 17.2L17.2 20L16.9 19.7A1.7 1.7 0 0 0 15 19.4L14.6 21H9.4L9 19.4A1.7 1.7 0 0 0 7.1 19.7L6.8 20L4 17.2L4.3 16.9A1.7 1.7 0 0 0 4.6 15L3 14.6V9.4L4.6 9A1.7 1.7 0 0 0 4.3 7.1L4 6.8L6.8 4L7.1 4.3A1.7 1.7 0 0 0 9 4.6L9.4 3H14.6L15 4.6A1.7 1.7 0 0 0 16.9 4.3L17.2 4L20 6.8L19.7 7.1A1.7 1.7 0 0 0 19.4 9L21 9.4V14.6L19.4 15Z" />
    </svg>
  );
}

function pageTitleForPath(
  pathname: string,
) {
  if (
    pathname.startsWith(
      "/simulation-result",
    )
  ) {
    return "Simulation Result";
  }

  if (pathname.startsWith("/simulator")) {
    return "Simulator";
  }

  if (pathname.startsWith("/simulations")) {
    return "Simulations";
  }

  if (pathname.startsWith("/settings")) {
    return "Settings";
  }

  return "Overview";
}

function getInitials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "EM";
  }

  return parts
    .map((part) =>
      part[0]?.toUpperCase(),
    )
    .join("");
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    token,
    logout,
  } = useAuth();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    systemSnapshot,
    setSystemSnapshot,
  ] = useState<{
    healthyNodes: number;
    totalNodes: number;
    originHealthPercent: number;
  } | null>(null);

  const profileMenuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const initials = useMemo(
    () =>
      getInitials(
        user?.name ??
          "EdgeMind Operator",
      ),
    [user?.name],
  );

  const pageTitle =
    pageTitleForPath(
      location.pathname,
    );

  useEffect(() => {
    if (!token) {
      setSystemSnapshot(null);
      return;
    }

    let cancelled = false;

    void dashboardService
      .getSnapshot(token)
      .then((snapshot) => {
        if (!cancelled) {
          setSystemSnapshot({
            healthyNodes:
              snapshot.healthyNodes,
            totalNodes:
              snapshot.totalNodes,
            originHealthPercent:
              snapshot.originHealthPercent,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSystemSnapshot(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    token,
    location.pathname,
  ]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (
      event: MouseEvent,
    ) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setSidebarOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  const handleLogout = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  };

  return (
    <div className="dashboard-layout">
      <div
        className={[
          "dashboard-sidebar-backdrop",
          sidebarOpen
            ? "is-visible"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          setSidebarOpen(false);
        }}
        aria-hidden="true"
      />

      <aside
        className={[
          "dashboard-sidebar",
          sidebarOpen
            ? "is-open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="dashboard-sidebar-header">
          <NavLink
            className="dashboard-brand"
            to="/dashboard"
          >
            <span className="dashboard-brand-mark">
              <i />
              <i />
            </span>

            <span>
              EDGEMIND
            </span>
          </NavLink>

          <button
            className="dashboard-sidebar-close"
            type="button"
            aria-label="Close navigation"
            onClick={() => {
              setSidebarOpen(false);
            }}
          >
            ×
          </button>
        </div>

        <div className="dashboard-sidebar-section">
          <span className="dashboard-sidebar-label">
            WORKSPACE
          </span>

          <nav
            className="dashboard-navigation"
            aria-label="Dashboard navigation"
          >
            {navigationItems.map(
              (item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={
                    item.to ===
                    "/dashboard"
                  }
                  className={({
                    isActive,
                  }) =>
                    [
                      "dashboard-navigation-link",
                      isActive
                        ? "is-active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <span className="dashboard-navigation-icon">
                    <NavigationGlyph
                      type={item.icon}
                    />
                  </span>

                  <span>
                    {item.label}
                  </span>

                  <i />
                </NavLink>
              ),
            )}
          </nav>
        </div>

        <div className="dashboard-sidebar-status">
          <div>
            <span>
              SYSTEM STATUS
            </span>

            <strong>
              <i />

              {systemSnapshot
                ? systemSnapshot
                    .healthyNodes ===
                  systemSnapshot
                    .totalNodes
                  ? "All systems operational"
                  : (
                      `${systemSnapshot.healthyNodes}` +
                      ` of ${systemSnapshot.totalNodes}` +
                      " nodes healthy"
                    )
                : "Checking system status"}
            </strong>
          </div>

          <div className="dashboard-sidebar-status-grid">
            <span>
              <small>
                EDGE NODES
              </small>

              <strong>
                {systemSnapshot
                  ? (
                      `${systemSnapshot.healthyNodes}` +
                      ` / ${systemSnapshot.totalNodes}`
                    )
                  : "— / —"}
              </strong>
            </span>

            <span>
              <small>
                ORIGIN HEALTH
              </small>

              <strong>
                {systemSnapshot
                  ? (
                      `${systemSnapshot.originHealthPercent.toFixed(
                        1,
                      )}%`
                    )
                  : "—"}
              </strong>
            </span>
          </div>
        </div>

        <div className="dashboard-sidebar-footer">
          <span>
            CONTROL PLANE
          </span>

          <strong>
            v0.7.0
          </strong>
        </div>
      </aside>

      <div className="dashboard-main-column">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button
              className="dashboard-menu-button"
              type="button"
              aria-label="Open navigation"
              onClick={() => {
                setSidebarOpen(true);
              }}
            >
              <span />
              <span />
            </button>

            <div>
              <span>
                CONTROL PLANE
              </span>

              <strong>
                {pageTitle}
              </strong>
            </div>
          </div>

          <div className="dashboard-header-actions">
            <button
              className="dashboard-status-button"
              type="button"
            >
              <i />

              LIVE NETWORK
            </button>

            <button
              className="dashboard-notification-button"
              type="button"
              aria-label="Notifications"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18 8A6 6 0 0 0 6 8C6 15 3 16 3 16H21C21 16 18 15 18 8Z" />
                <path d="M10 20H14" />
              </svg>

              <span />
            </button>

            <div
              className="dashboard-profile"
              ref={profileMenuRef}
            >
              <button
                className="dashboard-profile-button"
                type="button"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen(
                    (currentValue) =>
                      !currentValue,
                  );
                }}
              >
                <span>
                  {initials}
                </span>

                <div>
                  <strong>
                    {user?.name ??
                      "EdgeMind Operator"}
                  </strong>

                  <small>
                    {user?.email ??
                      "operator@edgemind.dev"}
                  </small>
                </div>

                <i />
              </button>

              {profileOpen && (
                <div className="dashboard-profile-menu">
                  <div className="dashboard-profile-menu-header">
                    <span>
                      SIGNED IN AS
                    </span>

                    <strong>
                      {user?.email ??
                        "operator@edgemind.dev"}
                    </strong>
                  </div>

                  <NavLink
                    to="/settings"
                    onClick={() => {
                      setProfileOpen(false);
                    }}
                  >
                    Account settings
                  </NavLink>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-page-content">
          {children}
        </div>
      </div>
    </div>
  );
}