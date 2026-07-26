import {
  Link,
  NavLink,
} from "react-router-dom";
import type {
  ReactNode,
} from "react";
import "./AppPageShell.css";

interface AppPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  showAppNavigation?: boolean;
}

const appLinks = [
  {
    label: "Dashboard",
    to: "/dashboard",
  },
  {
    label: "Simulator",
    to: "/simulator",
  },
  {
    label: "Simulations",
    to: "/simulations",
  },
  {
    label: "Settings",
    to: "/settings",
  },
];

export default function AppPageShell({
  eyebrow,
  title,
  description,
  children,
  showAppNavigation = true,
}: AppPageShellProps) {
  return (
    <main className="app-page-shell">
      <div
        className="app-page-shell-grid"
        aria-hidden="true"
      />

      <header className="app-page-shell-header">
        <Link
          className="app-page-shell-brand"
          to="/"
        >
          <span />
          EDGEMIND
        </Link>

        {showAppNavigation && (
          <nav
            className="app-page-shell-nav"
            aria-label="Application navigation"
          >
            {appLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({
                  isActive,
                }) =>
                  isActive
                    ? "is-active"
                    : undefined
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="app-page-shell-actions">
          <Link to="/login">
            Log in
          </Link>

          <Link
            className="is-primary"
            to="/register"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="app-page-shell-content">
        <span className="app-page-shell-eyebrow">
          {eyebrow}
        </span>

        <h1>{title}</h1>

        <p>{description}</p>

        {children}
      </section>
    </main>
  );
}
