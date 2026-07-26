import { Link } from "react-router-dom";
import AppPageShell from "../components/layout/AppPageShell";

export default function LoginPage() {
  return (
    <AppPageShell
      eyebrow="ACCOUNT ACCESS"
      title="Welcome back to EdgeMind."
      description="The complete login interface will be built in the next authentication phase."
      showAppNavigation={false}
    >
      <div className="app-page-shell-card">
        <strong>
          Login route is working
        </strong>

        <span>
          This page confirms that React Router
          is correctly loading /login without
          replaying the splash screen.
        </span>
      </div>

      <div className="app-page-shell-links">
        <Link to="/register">
          Create account
        </Link>

        <Link to="/">
          Return home
        </Link>
      </div>
    </AppPageShell>
  );
}
