import { Link } from "react-router-dom";
import AppPageShell from "../components/layout/AppPageShell";

export default function NotFoundPage() {
  return (
    <AppPageShell
      eyebrow="404 / ROUTE NOT FOUND"
      title="This edge route does not exist."
      description="The address may be incorrect, or the page may have moved."
      showAppNavigation={false}
    >
      <div className="app-page-shell-links">
        <Link to="/">
          Return home
        </Link>

        <Link to="/dashboard">
          Open dashboard
        </Link>
      </div>
    </AppPageShell>
  );
}
