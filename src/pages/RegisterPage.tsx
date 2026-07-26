import { Link } from "react-router-dom";
import AppPageShell from "../components/layout/AppPageShell";

export default function RegisterPage() {
  return (
    <AppPageShell
      eyebrow="CREATE ACCOUNT"
      title="Start building smarter routes."
      description="The registration form and validation will be added during the authentication interface phase."
      showAppNavigation={false}
    >
      <div className="app-page-shell-card">
        <strong>
          Registration route is working
        </strong>

        <span>
          This placeholder keeps the application
          structure complete while we build each
          page in the correct order.
        </span>
      </div>

      <div className="app-page-shell-links">
        <Link to="/login">
          Log in
        </Link>

        <Link to="/">
          Return home
        </Link>
      </div>
    </AppPageShell>
  );
}
